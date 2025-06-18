import express from 'express';
import Booking from '../../Models/Booking.js';
import agenda from '../../agendaJobs/agendaInstance.js';

const router = express.Router();



router.put("/", async (req, res) => {
    const { id, status } = req.body;

    // console.log('Received booking request data:', { reserveDetails, userId, branchId });

    try {
        if (!id || !status) {
            return res.status(400).json({ error: "All fields are required." });
        }
        const updated = await Booking.findByIdAndUpdate(id, { status }, { new: true });

        if (!updated) {
            return res.status(404).json({ error: "Booking not found." });
        }


        res.status(200).json({ message: "Booking Updated Successfully" });
    } catch (err) {
        console.error('Error saving booking to DB:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

export default router;