import express from 'express';
import Branch from '../../Models/Branch.js';

const router = express.Router();

router.get('/:branchId', async (req, res) => {
    try {
        const branchId = req.params.branchId;
        // console.log(branchId)

        const branch = await Branch.findById(branchId).select('menu').populate('menu');

        if (!branch || !branch.menu) {
            return res.status(404).json({ error: 'Menu not found.' });
        }
        // console.log("branch.menu",branch.menu)

        res.json(branch.menu); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;