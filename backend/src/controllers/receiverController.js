const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const { BLOOD_GROUPS } = require('../config/constants');

exports.searchDonors = async (req, res) => {
  try {
    const { city, bloodGroup } = req.query;
    if (!city || !bloodGroup) {
      return res
        .status(400)
        .json({ message: 'city and bloodGroup are required' });
    }
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    const now = new Date();
    const donors = await User.find({
      role: 'donor',
      city: new RegExp(city.trim(), 'i'),
      bloodGroup,
      isProfileEnabled: true,
      $or: [
        { cooldownUntil: null },
        { cooldownUntil: { $lte: now } },
      ],
    })
      .select('name city bloodGroup averageRating ratingCount')
      .lean();

    res.json(
      donors.map((d) => ({
        id: d._id,
        name: d.name,
        city: d.city,
        bloodGroup: d.bloodGroup,
        averageRating: d.averageRating,
        ratingCount: d.ratingCount,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const {
      bloodGroup,
      city,
      message,
      isEmergency,
      latitude,
      longitude,
      documentUrl,
    } = req.body;

    if (!bloodGroup || !city) {
      return res
        .status(400)
        .json({ message: 'bloodGroup and city are required' });
    }
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }
    // Require medical proof only for Emergency SOS
    if (isEmergency && !documentUrl) {
      return res
        .status(400)
        .json({ message: 'Medical document (image or PDF) is required for emergency SOS' });
    }

    const hasActive = await DonationRequest.hasActiveRequest(receiverId);
    if (hasActive) {
      return res.status(400).json({
        message:
          'You already have an active request. Complete or cancel it first.',
      });
    }

    // Frequency limit: within last 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const since = new Date(Date.now() - THIRTY_DAYS_MS);

    let needsAdminApproval = false;
    let frequencyWarning = null;

    if (!isEmergency) {
      const recentCount = await DonationRequest.countDocuments({
        receiver: receiverId,
        requestDate: { $gte: since },
      });

      if (recentCount >= 1) {
        needsAdminApproval = true;
        frequencyWarning =
          'You have already requested blood recently. For multiple requests, Admin approval is required.';
      }
    }

    // All emergency SOS requests require admin approval before donors are notified
    if (isEmergency) {
      needsAdminApproval = true;
    }

    const request = await DonationRequest.create({
      receiver: receiverId,
      bloodGroup,
      city: city.trim(),
      message: message || '',
      isEmergency: !!isEmergency,
      documentUrl: documentUrl || undefined,
      requestDate: new Date(),
      needsAdminApproval,
      location:
        latitude != null && longitude != null
          ? { latitude, longitude }
          : undefined,
    });

    const io = req.app.get('io');
    if (io) {
      const cityRoom = `city:${city.trim().toLowerCase()}`;

      if (request.isEmergency) {
        // For emergency SOS, notify only admins first; donors will be notified after admin verification
        io.to('admins').emit('emergency-created', {
          id: request._id,
          receiverId,
          bloodGroup: request.bloodGroup,
          city: request.city,
          createdAt: request.createdAt,
        });
      } else if (!needsAdminApproval) {
        // Normal request that does not require admin approval can go directly to donors
        io.to(cityRoom).emit('new-request', {
          id: request._id,
          bloodGroup: request.bloodGroup,
          city: request.city,
          isEmergency: request.isEmergency,
          message: request.message,
          createdAt: request.createdAt,
        });
      } else {
        // Needs admin approval (non-emergency): only notify admins
        io.to('admins').emit('request-awaiting-approval', {
          id: request._id,
          receiverId,
          bloodGroup: request.bloodGroup,
          city: request.city,
          createdAt: request.createdAt,
        });
      }
    }

    res.status(201).json({
      id: request._id,
      bloodGroup: request.bloodGroup,
      city: request.city,
      status: request.status,
      isEmergency: request.isEmergency,
      message: request.message,
      createdAt: request.createdAt,
      verificationStatus: request.verificationStatus,
      needsAdminApproval: request.needsAdminApproval,
      frequencyWarning,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create request' });
  }
};

exports.getMyRequest = async (req, res) => {
  try {
    const requests = await DonationRequest.find({
      receiver: req.user.id,
    })
      .populate('donor', 'name city bloodGroup averageRating ratingCount')
      .sort({ createdAt: -1 })
      .lean();

    const list = [];
    for (const r of requests) {
      let donorPhone = null;
      if (
        (r.status === 'accepted' || r.status === 'completed') &&
        r.donor
      ) {
        const donorUser = await User.findById(r.donor._id)
          .select('phone')
          .lean();
        if (donorUser) donorPhone = donorUser.phone;
      }
      list.push({
        id: r._id,
        bloodGroup: r.bloodGroup,
        city: r.city,
        status: r.status,
        isEmergency: r.isEmergency,
        message: r.message,
        createdAt: r.createdAt,
        donor: r.donor
          ? {
              id: r.donor._id,
              name: r.donor.name,
              city: r.donor.city,
              bloodGroup: r.donor.bloodGroup,
              averageRating: r.donor.averageRating,
              ratingCount: r.donor.ratingCount,
              phone: donorPhone,
            }
          : null,
        ratingGiven: r.ratingGiven,
        completedAt: r.status === 'completed' ? r.updatedAt : null,
      });
    }

    res.json({
      active:
        list.find(
          (r) => r.status === 'pending' || r.status === 'accepted'
        ) || null,
      history: list,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load requests' });
  }
};
