const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { BLOOD_GROUPS, GENDERS, ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      select: false,
    },
    address: { type: String, required: true },
    city: { type: String, default: null, index: true },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      index: true,
    },
    age: { type: Number, min: 18, max: 65 },
    gender: { type: String, enum: GENDERS },
    medicalStatus: { type: String },
    role: {
      type: String,
      enum: ROLES,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    // Admin controls
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    isProfileEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    cooldownUntil: {
      type: Date,
      default: null,
      index: true,
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.virtual('inCooldown').get(function inCooldown() {
  return !!(this.cooldownUntil && this.cooldownUntil > new Date());
});

userSchema.methods.canDonate = function canDonate() {
  return this.role === 'donor' && this.isProfileEnabled && !this.inCooldown;
};

module.exports = mongoose.model('User', userSchema);
