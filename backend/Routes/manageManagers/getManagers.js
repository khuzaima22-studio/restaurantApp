// routes/branchRoutes.js
import express from 'express';
import User from '../../Models/User.js';
import Branch from '../../Models/Branch.js'

const router = express.Router();

// GET all managers and workers
router.get('/', async (req, res) => {
    try {
        const assignedManagerIds = await Branch.find().distinct('manager');
        
        const unassignedManagers = await User.find({
            role: { $in: ['Manager', 'head branch manager'] }, // Fetch all relevant roles
            _id: { $nin: assignedManagerIds }
        });
        
        console.log('Fetched unassigned managers/users:', unassignedManagers);
        res.status(200).json(unassignedManagers);
    } catch (error) {
        console.error('Error fetching unassigned managers/users:', error); // Detailed error log
        res.status(500).json({ message: 'Error fetching unassigned managers/users', error: error.message }); // Send error message to frontend
    }
});

router.get('/ma', async (req, res) => {
    try {
        const assignedManagerIds = await Branch.find().distinct('manager');
        
        const unassignedManagers = await User.find({
            role: { $in: ['Manager', 'worker', 'head branch manager'] }, // Fetch all relevant roles
            // _id: { $nin: assignedManagerIds }
        });
        
        console.log('Fetched unassigned managers/users:', unassignedManagers);
        res.status(200).json(unassignedManagers);
    } catch (error) {
        console.error('Error fetching unassigned managers/users:', error); // Detailed error log
        res.status(500).json({ message: 'Error fetching unassigned managers/users', error: error.message }); // Send error message to frontend
    }
});

// PUT update user details and role
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, role } = req.body;

        // Validate role against allowed values (if role is part of User schema enum)
        const allowedRoles = ['customer', 'admin', 'worker', 'branch manager', 'head branch manager'];
        if (role && !allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role provided.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, role },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log('Updated user:', updatedUser);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error); // Detailed error log
        // Handle Mongoose validation or cast errors specifically
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        } else if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Error updating user', error: error.message }); // Send error message to frontend
    }
});

export default router;