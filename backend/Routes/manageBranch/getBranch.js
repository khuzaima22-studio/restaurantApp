// routes/branchRoutes.js
import express from 'express';
import Branch from '../../Models/Branch.js';
import User from "../../Models/User.js"

const router = express.Router();

// GET all branches
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find().populate('manager'); 
        // console.log(branches);
        res.status(200).json(branches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching branches', error });
    }
});


export default router;
