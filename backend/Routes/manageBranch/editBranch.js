import express from 'express';
import multer from 'multer';
import Branch from '../../Models/Branch.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();


// Create uploads directory if it doesn't exist
const uploadDir = path.join('uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// POST route
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const name = req.body.name?.trim();
        const address = req.body.address?.trim();
        const manager = req.body.manager;

        let cuisines = req.body['cuisines'];
        if (!Array.isArray(cuisines)) {
            cuisines = cuisines ? [cuisines] : [];
        }
        cuisines = cuisines.map(c => c.trim().toLowerCase());

        // Fetch existing branch to preserve image if not updated
        const existingBranch = await Branch.findById(id);
        if (!existingBranch) {
            return res.status(404).json({ error: "Branch not found" });
        }

        const image = req.file ? req.file.filename : existingBranch.image;

        if (!name || !address || cuisines.length === 0 || !manager) {
            return res.status(400).json({ error: "All fields are required." });
        }

        await Branch.findByIdAndUpdate(id, {
            name,
            address,
            manager,
            cuisines,
            image
        });

        res.status(200).json({ message: 'Branch edited successfully' });
    } catch (err) {
        console.error('Error updating branch:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




export default router;


