const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'other'];
// Added admin as a third role
const ROLES = ['donor', 'receiver', 'admin'];
const COOLDOWN_DAYS = 90;
// Request lifecycle status (admin verification uses a separate field)
const REQUEST_STATUS = ['pending', 'accepted', 'completed', 'cancelled', 'expired'];

module.exports = {
  BLOOD_GROUPS,
  GENDERS,
  ROLES,
  COOLDOWN_DAYS,
  REQUEST_STATUS,
};
