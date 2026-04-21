const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');
const { applyDonationCooldown } = require('./donorController');

exports.listIncomingForDonor = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    if (!donor || donor.role !== 'donor') {
      return res.status(403).json({ message: 'Not a donor' });
    }

    const requests = await DonationRequest.find({
      status: 'pending',
      city: new RegExp(donor.city || '', 'i'),
      bloodGroup: donor.bloodGroup,
    })
      .populate('receiver', 'name bloodGroup city')
      .sort({ isEmergency: -1, createdAt: -1 })
      .lean();

    res.json(
      requests.map((r) => ({
        id: r._id,
        bloodGroup: r.bloodGroup,
        city: r.city,
        isEmergency: r.isEmergency,
        message: r.message,
        createdAt: r.createdAt,
        receiver: r.receiver
          ? {
              id: r.receiver._id,
              name: r.receiver.name,
              bloodGroup: r.receiver.bloodGroup,
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

exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const donorId = req.user.id;

    const donor = await User.findById(donorId);
    if (!donor || donor.role !== 'donor') {
      return res.status(403).json({ message: 'Not a donor' });
    }

    if (!donor.isProfileEnabled) {
      return res.status(400).json({
        message: 'Enable your profile before accepting requests.',
      });
    }

    const now = new Date();
    if (donor.cooldownUntil && donor.cooldownUntil > now) {
      return res.status(400).json({
        message: 'You are in cooldown period. Cannot accept until next donation date.',
      });
    }

    const request = await DonationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }
    if (request.bloodGroup !== donor.bloodGroup) {
      return res.status(400).json({ message: 'Blood group mismatch' });
    }

    request.donor = donorId;
    request.status = 'accepted';
    await request.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${request.receiver}`).emit('request-accepted', {
        id: request._id,
        donorName: donor.name,
        donorCity: donor.city,
      });
    }

    res.json({
      id: request._id,
      status: request.status,
      message: 'Request accepted. Receiver can now see your contact.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to accept request' });
  }
};

exports.completeDonation = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await DonationRequest.findById(requestId).populate(
      'donor',
      'id'
    );
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'accepted') {
      return res
        .status(400)
        .json({ message: 'Only accepted requests can be completed' });
    }

    const isReceiver = req.user.role === 'receiver' && String(request.receiver) === String(req.user.id);
    const isDonor = req.user.role === 'donor' && request.donor && String(request.donor._id) === String(req.user.id);
    if (!isReceiver && !isDonor) {
      return res.status(403).json({ message: 'Not authorized to complete this request' });
    }

    request.status = 'completed';
    await request.save();

    const donor = await applyDonationCooldown(request.donor?._id || request.donor);

    res.json({
      message: 'Donation marked as completed. Donor is now in 90-day cooldown.',
      donorId: donor ? donor.id : null,
      cooldownUntil: donor ? donor.cooldownUntil : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to complete donation' });
  }
};

exports.rateDonor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rating } = req.body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be 1-5' });
    }

    const request = await DonationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (String(request.receiver) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not your request' });
    }
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed donations' });
    }
    if (request.ratingGiven != null) {
      return res.status(400).json({ message: 'Already rated' });
    }

    request.ratingGiven = rating;
    await request.save();

    const donor = await User.findById(request.donor);
    if (donor) {
      const total = (donor.averageRating || 0) * (donor.ratingCount || 0) + rating;
      donor.ratingCount = (donor.ratingCount || 0) + 1;
      donor.averageRating = Math.round((total / donor.ratingCount) * 10) / 10;
      await donor.save();
    }

    res.json({
      message: 'Thank you for your rating',
      rating,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await DonationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (String(request.receiver) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not your request' });
    }
    if (request.status !== 'pending' && request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request cannot be cancelled' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel request' });
  }
};
