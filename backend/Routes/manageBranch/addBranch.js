import express from 'express';
import multer from 'multer';
import Branch from '../../Models/Branch.js';
import Menu from '../../Models/Menu.js';
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
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const address = req.body.address?.trim();
        const manager = req.body.manager?.trim();

        // cuisines[] might be sent as string or array
        let cuisines = req.body['cuisines'];
        if (!Array.isArray(cuisines)) {
            cuisines = cuisines ? [cuisines] : [];
        }
        cuisines = cuisines.map(c => c.trim().toLowerCase());

        const image = req.file ? req.file.filename : null;

        // console.log({ name, address, manager, cuisines, image });

        if (!name || !address || cuisines.length === 0 || !manager) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newMenu = new Menu({
            items: []
        });

        const savedMenu = await newMenu.save();

        const newBranch = new Branch({
            name,
            address,
            manager,
            menu:savedMenu._id,
            cuisines,
            image
        });

        await newBranch.save();

        res.status(201).json({ message: 'Branch created successfully' });
    } catch (err) {
        console.error('Error saving branch:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



export default router;


