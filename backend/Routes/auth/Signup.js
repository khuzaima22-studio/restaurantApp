import bcrypt from 'bcryptjs'
import express from "express"
import User from "../../Models/User.js"
import Worker from "../../Models/Workers.js"
import Branch from '../../Models/Branch.js'
// import db from "../database.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const pass = req.body.password?.trim();
    const role = req.body.role?.trim();

    if (!name || !email || !pass || !role) {
      return res.status(400).json({ error: "All fields are required and cannot be blank." });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    if (role === "worker") {
      // Fetch all branches
      const branches = await Branch.find();
      if (branches.length === 0) {
        return res.status(400).json({ error: "No branches available to assign." });
      }

      // Select a random branch
      const randomBranch = branches[Math.floor(Math.random() * branches.length)];

      // Create and save worker
      const newWorker = new Worker({
        user: newUser._id,
        branch: randomBranch._id,
      });
      await newWorker.save();
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: err.message });
  }
});


export default router;


