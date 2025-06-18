import express from 'express';
import Purchase from '../../Models/Purchase.js';

const router = express.Router();



router.put("/", async (req, res) => {
    const { id, status } = req.body;

    // console.log('Received booking request data:', { reserveDetails, userId, branchId });

    try {
        if (!id || !status) {
            return res.status(400).json({ error: "All fields are required." });
        }
        const updated = await Purchase.findByIdAndUpdate(id, { status }, { new: true });

        if (!updated) {
            return res.status(404).json({ error: "Order not found." });
        }


        res.status(200).json({ message: "Order Updated Successfully" });
    } catch (err) {
        console.error('Error saving Order to DB:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

export default router;