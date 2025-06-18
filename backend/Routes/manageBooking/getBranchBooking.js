import express from 'express';
import Booking from '../../Models/Booking.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const branchId = req.params.id;

        // Get the current date without time (start of today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookings = await Booking.find({
            branch: branchId,
            date: { $gte: today }  
        }).sort({ date: -1 });

        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
