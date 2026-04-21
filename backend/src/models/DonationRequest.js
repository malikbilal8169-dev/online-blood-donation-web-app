const mongoose = require('mongoose');
const { BLOOD_GROUPS, REQUEST_STATUS } = require('../config/constants');

const donationRequestSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUS,
      default: 'pending',
      index: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    // Receiver rating for this donation
    ratingGiven: {
      type: Number,
      min: 1,
      max: 5,
    },
    // URL or data URL of uploaded medical proof (mainly for emergencies / verified requests)
    documentUrl: {
      type: String,
    },
    // Admin medical verification state
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    // Date used for frequency checks (defaults to createdAt but explicit for clarity)
    requestDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // When true, donors are not notified until admin approves
    needsAdminApproval: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

donationRequestSchema.statics.hasActiveRequest = function hasActiveRequest(
  receiverId
) {
  return this.exists({
    receiver: receiverId,
    status: { $in: ['pending', 'accepted'] },
  });
};

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
