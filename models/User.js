// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  provider: { type: String, required: true }, // 'local', 'google', 'facebook', 'discord'
  providerId: { type: String }, // ID from OAuth provider (null for local)
  username: { type: String, unique: true, sparse: true }, // only for local
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // hashed, only for local
  displayName: { type: String },
  photo: { type: String },
}, { timestamps: true });

// Hash password before saving (only for local users)
userSchema.pre('save', async function(next) {
  if (this.provider === 'local' && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);