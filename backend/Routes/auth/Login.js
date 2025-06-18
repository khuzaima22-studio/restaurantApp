import bcrypt from 'bcryptjs'
import express from "express"
import User from "../../Models/User.js"
import jwt from 'jsonwebtoken'
import Branch from "../../Models/Branch.js"
// import db from "../database.js";
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET;
router.post("/", async (req, res) => {
    try {
        // Destructure and trim values
        const email = req.body.email?.trim();
        const pass = req.body.password?.trim();
        const role = req.body.role?.trim();

        // Check for missing or empty fields
        if (!email || !pass || !role) {
            return res.status(400).json({ error: "All fields are required and cannot be blank." });
        }

        const existingUser = await User.findOne({ email,role });
        if (!existingUser) {
            return res.status(409).json({ error: 'User not found or invalid role' });
        }

        const passwordMatch = await bcrypt.compare(pass, existingUser.password)
        if (!passwordMatch) {
            return res.status(409).json({ error: 'Email and Password do not Match' });
        }

        let branchId = null;
        let idField = {};
        if (existingUser.role === 'manager' || existingUser.role === 'branch manager') {
            const branch = await Branch.findOne({ manager: existingUser._id });
            if (branch) branchId = branch._id;
            idField = { managerId: existingUser._id };
        } else if (existingUser.role === 'customer') {
            idField = { customerId: existingUser._id };
        } else if (existingUser.role === 'admin') {
            idField = { adminId: existingUser._id };
        }
        const token = jwt.sign(
            {
                email: existingUser.email,
                id: existingUser._id,
                role: existingUser.role
            },
            SECRET_KEY,
            { expiresIn: '24h' },
        )
        res.status(201).json({ message: "Login successful", token, branchId, ...idField });
    } catch (err) {
        // Handle duplicate email
        if (err.code === 11000) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // Handle other errors
        res.status(500).json({ error: err.message });
    }
});

export default router;


