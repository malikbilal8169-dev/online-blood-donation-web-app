const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');

exports.getStats = async (req, res) => {
  try {
    const [donors, receivers, pendingRequests, successfulDonations, pendingSosAlerts] =
      await Promise.all([
        User.countDocuments({ role: 'donor' }),
        User.countDocuments({ role: 'receiver' }),
        DonationRequest.countDocuments({ status: 'pending' }),
        DonationRequest.countDocuments({ status: 'completed' }),
        DonationRequest.countDocuments({ status: 'pending', isEmergency: true }),
      ]);

    res.json({
      donors,
      receivers,
      pendingRequests,
      successfulDonations,
      totalLivesSaved: successfulDonations,
      pendingSosAlerts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('name email role city isBlocked isVerified isFlagged createdAt ipAddress')
      .sort({ createdAt: -1 })
      .lean();

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userIds = users.map((u) => u._id);

    const counts = await DonationRequest.aggregate([
      {
        $match: {
          receiver: { $in: userIds },
          requestDate: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$receiver',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    res.json(
      users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        city: u.city,
        isBlocked: u.isBlocked,
        isVerified: u.isVerified,
        isFlagged: u.isFlagged,
        createdAt: u.createdAt,
        ipAddress: u.ipAddress || null,
        requestsLast30Days: countMap.get(String(u._id)) || 0,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load users' });
  }
};

exports.updateUserFlags = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked, isVerified, isFlagged } = req.body || {};

    const update = {};
    if (typeof isBlocked === 'boolean') update.isBlocked = isBlocked;
    if (typeof isVerified === 'boolean') update.isVerified = isVerified;
    if (typeof isFlagged === 'boolean') update.isFlagged = isFlagged;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true }
    ).select('name email role city isBlocked isVerified isFlagged ipAddress createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      isFlagged: user.isFlagged,
      ipAddress: user.ipAddress || null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

exports.listActiveRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find({
      status: 'pending',
    })
      .populate('receiver', 'name email city')
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      requests.map((r) => ({
        id: r._id,
        bloodGroup: r.bloodGroup,
        city: r.city,
        status: r.status,
        verificationStatus: r.verificationStatus,
        isEmergency: r.isEmergency,
        needsAdminApproval: r.needsAdminApproval,
        requestDate: r.requestDate || r.createdAt,
        documentUrl: r.documentUrl,
        receiver: r.receiver
          ? {
              id: r.receiver._id,
              name: r.receiver.name,
              email: r.receiver.email,
              city: r.receiver.city,
            }
          : null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load requests' });
  }
};

exports.reviewRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body || {};

    const request = await DonationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'verify') {
      request.verificationStatus = 'verified';
      request.needsAdminApproval = false;
      await request.save();

      // After admin verification, notify donors in the corresponding city room
      const io = req.app.get('io');
      if (io && request.status === 'pending' && request.city) {
        const cityRoom = `city:${request.city.trim().toLowerCase()}`;
        io.to(cityRoom).emit('new-request', {
          id: request._id,
          bloodGroup: request.bloodGroup,
          city: request.city,
          isEmergency: request.isEmergency,
          message: request.message,
          createdAt: request.createdAt,
        });
      }

      return res.json({
        message: 'Request verified',
        verificationStatus: request.verificationStatus,
      });
    }

    if (action === 'reject') {
      request.verificationStatus = 'rejected';
      request.status = 'cancelled';
      await request.save();
      return res.json({
        message: 'Request rejected',
        verificationStatus: request.verificationStatus,
        status: request.status,
      });
    }

    if (action === 'flag') {
      const receiver = await User.findById(request.receiver);
      if (receiver) {
        receiver.isFlagged = true;
        await receiver.save();
      }
      return res.json({ message: 'Receiver flagged' });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to review request' });
  }
};

