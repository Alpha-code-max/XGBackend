const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  provider: { type: String, required: true }, 
  providerId: { type: String }, 
  username: { type: String, unique: true, sparse: true }, 
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, 
  displayName: { type: String },
  photo: { type: String },
}, { timestamps: true });

// Corrected: Removed 'next' as it is an async function
userSchema.pre('save', async function() {
  if (this.provider === 'local' && this.isModified('password')) {
    // Await the hash and assign it to the password field
    this.password = await bcrypt.hash(this.password, 12);
  }
  // No next() call needed here for async hooks
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if password exists (OAuth users might not have one)
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
