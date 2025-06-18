// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'worker', 'branch manager', 'head branch manager'], 
    default: 'customer',
    lowercase: true
  }
}, {
  timestamps: true
});

const user = mongoose.model('User', userSchema);

export default user;
