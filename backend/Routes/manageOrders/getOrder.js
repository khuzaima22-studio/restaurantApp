import express from 'express';
import Purchase from '../../Models/Purchase.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const branchId = req.params.id;
        console.log(`Backend: Fetching orders for branchId: ${branchId}`);

        // Ensure the field name matches your Purchase model schema (e.g., 'branchId' not 'branch')
        const profit = await Purchase.find({ branch: branchId }).populate('user', 'name');

        console.log('Backend: Fetched orders (profit):', profit);
        res.status(200).json(profit);
    } catch (err) {
        console.error('Backend: Error fetching orders:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;