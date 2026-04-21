const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { BLOOD_GROUPS, GENDERS } = require('../config/constants');

exports.registerDonor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      bloodGroup,
      age,
      gender,
      medicalStatus,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !city ||
      !bloodGroup ||
      age == null ||
      !gender
    ) {
      return res.status(400).json({
        message:
          'Missing required fields: name, email, password, phone, address, city, bloodGroup, age, gender',
      });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }
    if (!GENDERS.includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender' });
    }
    if (age < 18 || age > 65) {
      return res.status(400).json({ message: 'Age must be between 18 and 65' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const ipAddress =
      (req.headers['x-forwarded-for'] &&
        String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
      req.socket?.remoteAddress ||
      req.ip;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      city,
      bloodGroup,
      age,
      gender,
      medicalStatus: medicalStatus || '',
      role: 'donor',
      ipAddress,
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        bloodGroup: user.bloodGroup,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.registerReceiver = async (req, res) => {
  try {
    const { name, email, password, phone, bloodGroup, address } = req.body;

    if (!name || !email || !password || !phone || !bloodGroup || !address) {
      return res.status(400).json({
        message:
          'Missing required fields: name, email, password, phone, bloodGroup, address',
      });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const ipAddress =
      (req.headers['x-forwarded-for'] &&
        String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
      req.socket?.remoteAddress ||
      req.ip;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      bloodGroup,
      role: 'receiver',
      ipAddress,
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        bloodGroup: user.bloodGroup,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('+phone')
      .select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      bloodGroup: user.bloodGroup,
      role: user.role,
    };
    if (user.role === 'donor') {
      payload.age = user.age;
      payload.gender = user.gender;
      payload.medicalStatus = user.medicalStatus;
      payload.isProfileEnabled = user.isProfileEnabled;
      payload.cooldownUntil = user.cooldownUntil;
      payload.averageRating = user.averageRating;
      payload.ratingCount = user.ratingCount;
    }
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};
