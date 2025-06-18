import express from 'express';
import Booking from '../../Models/Booking.js';
import agenda from '../../agendaJobs/agendaInstance.js';

const router = express.Router();

router.post("/", async (req, res) => {
    const { reserveDetails, userId, branchId } = req.body;
    const { name, phone, seats, date, time } = reserveDetails;

    console.log('Received booking request data:', { reserveDetails, userId, branchId });

    try {
        if (!name || !phone || !seats || !date || !time || !userId || !branchId) {
            console.log('Missing fields:', { name, phone, seats, date, time, userId, branchId });
            return res.status(400).json({ error: "All fields are required." });
        }

        const parsedPhone = Number(phone);
        if (isNaN(parsedPhone)) {
            console.log('Invalid phone number format:', phone);
            return res.status(400).json({ error: "Phone number must be a valid number." });
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            console.log('Invalid date format:', date);
            return res.status(400).json({ error: "Invalid date format." });
        }

        const newBooking = new Booking({ name, phone: parsedPhone, seats, user: userId, branch: branchId, date: parsedDate, time });
        await newBooking.save();

        const combinedDateTime = new Date(`${date}T${time}:00`);

        await agenda.schedule(combinedDateTime, 'expire booking', {
            bookingId: newBooking._id
        });

        res.status(200).json({ message: "Booking Added Successfully" });
    } catch (err) {
        console.error('Error saving booking to DB:', err);

        if (err.name === 'ValidationError') {
            const errors = Object.keys(err.errors).map(key => err.errors[key].message);
            return res.status(400).json({ error: errors.join(', ') });
        } else if (err.name === 'CastError' && err.path === 'user') {
            return res.status(400).json({ error: 'Invalid user ID format.' });
        }
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

export default router;