const User = require('../models/User');
const DonationRequest = require('../models/DonationRequest');
const { COOLDOWN_DAYS } = require('../config/constants');
const { BLOOD_GROUPS, GENDERS } = require('../config/constants');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getCooldownInfo(cooldownUntil) {
  if (!cooldownUntil) return { inCooldown: false, remainingDays: 0 };
  const now = Date.now();
  const diff = cooldownUntil.getTime() - now;
  if (diff <= 0) return { inCooldown: false, remainingDays: 0 };
  return {
    inCooldown: true,
    remainingDays: Math.ceil(diff / DAY_IN_MS),
  };
}

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('+phone');
    if (!user || user.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }
    const { inCooldown, remainingDays } = getCooldownInfo(user.cooldownUntil);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      bloodGroup: user.bloodGroup,
      age: user.age,
      gender: user.gender,
      medicalStatus: user.medicalStatus,
      isProfileEnabled: user.isProfileEnabled,
      cooldownUntil: user.cooldownUntil,
      inCooldown,
      remainingDays,
      averageRating: user.averageRating,
      ratingCount: user.ratingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load donor profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }
    const allowed = [
      'name',
      'phone',
      'address',
      'city',
      'bloodGroup',
      'age',
      'gender',
      'medicalStatus',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) donor[key] = req.body[key];
    });
    if (donor.age != null && (donor.age < 18 || donor.age > 65)) {
      return res.status(400).json({ message: 'Age must be between 18 and 65' });
    }
    if (donor.bloodGroup && !BLOOD_GROUPS.includes(donor.bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }
    if (donor.gender && !GENDERS.includes(donor.gender)) {
      return res.status(400).json({ message: 'Invalid gender' });
    }
    await donor.save();
    const { inCooldown, remainingDays } = getCooldownInfo(donor.cooldownUntil);
    res.json({
      id: donor.id,
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      address: donor.address,
      city: donor.city,
      bloodGroup: donor.bloodGroup,
      age: donor.age,
      gender: donor.gender,
      medicalStatus: donor.medicalStatus,
      isProfileEnabled: donor.isProfileEnabled,
      cooldownUntil: donor.cooldownUntil,
      inCooldown,
      remainingDays,
      averageRating: donor.averageRating,
      ratingCount: donor.ratingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }
    await DonationRequest.updateMany(
      { donor: donor._id, status: { $in: ['pending', 'accepted'] } },
      { status: 'cancelled' }
    );
    await User.findByIdAndDelete(donor._id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete profile' });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isProfileEnabled } = req.body;

    if (typeof isProfileEnabled !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'isProfileEnabled must be boolean' });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const { inCooldown, remainingDays } = getCooldownInfo(user.cooldownUntil);

    if (isProfileEnabled && inCooldown) {
      return res.status(400).json({
        message:
          'You are in a 90-day cooldown period after your last donation.',
        cooldownUntil: user.cooldownUntil,
        remainingDays,
      });
    }

    user.isProfileEnabled = isProfileEnabled;
    await user.save();

    const updatedCooldown = getCooldownInfo(user.cooldownUntil);

    res.json({
      id: user.id,
      isProfileEnabled: user.isProfileEnabled,
      cooldownUntil: user.cooldownUntil,
      inCooldown: updatedCooldown.inCooldown,
      remainingDays: updatedCooldown.remainingDays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update availability' });
  }
};

exports.getDonationHistory = async (req, res) => {
  try {
    const requests = await DonationRequest.find({
      donor: req.user.id,
      status: 'completed',
    })
      .populate('receiver', 'name bloodGroup city')
      .sort({ updatedAt: -1 })
      .lean();

    res.json(
      requests.map((r) => ({
        id: r._id,
        receiverName: r.receiver?.name,
        bloodGroup: r.bloodGroup,
        city: r.city,
        isEmergency: r.isEmergency,
        completedAt: r.updatedAt,
        ratingGiven: r.ratingGiven,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load donation history' });
  }
};

exports.applyDonationCooldown = async (donorId) => {
  if (!donorId) return null;

  const cooldownUntil = new Date(
    Date.now() + COOLDOWN_DAYS * DAY_IN_MS
  );

  const donor = await User.findById(donorId);
  if (!donor || donor.role !== 'donor') return null;

  donor.isProfileEnabled = false;
  donor.cooldownUntil = cooldownUntil;
  await donor.save();

  return donor;
};
