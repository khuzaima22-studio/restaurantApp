// db.js
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const uri=process.env.MONGO_URI;

const db = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default db;
