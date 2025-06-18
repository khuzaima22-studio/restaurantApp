// routes/branchRoutes.js
import express from 'express';
import Menu from '../../Models/Menu.js';
import Branch from '../../Models/Branch.js';

const router = express.Router();

// GET all branches
router.delete('/', async (req, res) => {
    const { id } = req.body;

    try {
        const branch = await Branch.findById(id);
        if (!branch) {
            return res.status(404).json({ error: "Branch not found" });
        }

        await Menu.findByIdAndDelete(branch.menu);

        // Delete the branch
        await Branch.findByIdAndDelete(id);

        res.status(200).json({ message: "Branch and its menu deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting branch or menu', error });
    }
});

export default router;
