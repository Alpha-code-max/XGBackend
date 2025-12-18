// config/database.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    // In 2025 (Mongoose 6+), no options are needed for the connection
    await mongoose.connect(MONGODB_URI); 
    
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
