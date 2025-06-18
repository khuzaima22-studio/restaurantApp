import bcrypt from 'bcryptjs'
import express from "express"
import User from "../../Models/User.js"
import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;

// import db from "../database.js";
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
    try {
        // Destructure and trim values
        const { token } = await req.body;
        
        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }

        const decoded = jwt.verify(token, SECRET_KEY)
        const userId = decoded.id

        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(409).json({ message: 'User not found or invalid role' });
        }

      
        const values =
        {
            email: existingUser.email,
            id: existingUser._id,
            role: existingUser.role
        }


        res.status(201).json({ message: "Login successful", values });
    } catch (error) {
       console.error('Token verification error:', error)

        if (error instanceof TokenExpiredError) {
            console.error('Token expired at:', error.expiredAt)
            return res.status(409).json({ error: "Token expired. Please log in again." });
        }

        if (error instanceof JsonWebTokenError) {
           return res.status(409).json({ error: "Invalid token" });
        }

        // Handle other errors
        res.status(500).json({ error: error.message });
    }
});

export default router;


