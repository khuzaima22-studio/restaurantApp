import express from 'express';
import Booking from '../../Models/Booking.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const bookings = await Booking.find({ user: userId });
        
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;