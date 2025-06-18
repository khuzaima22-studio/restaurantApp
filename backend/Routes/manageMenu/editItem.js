import express from 'express';
import multer from 'multer';
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
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const Menuid = req.params.id;
        const ItemID = req.body.itemId;
        const name = req.body.name?.trim();
        const category = req.body.category?.trim();
        const price = req.body.price;

        // Fetch existing branch to preserve image if not updated
        const existingMenu = await Menu.findById(Menuid);
        if (!existingMenu) {
            return res.status(404).json({ error: "Menu not found" });
        }

        const image = req.file ? req.file.filename : existingMenu.image;

        if (!name || !category || !price) {
            return res.status(400).json({ error: "All fields are required." });
        }

        await Menu.findOneAndUpdate(
            {
                _id: Menuid,
                'items._id': ItemID
            },
            {
                $set: {
                    'items.$.name': name,
                    'items.$.price': price,
                    'items.$.category': category,
                    'items.$.image': image
                }
            },
            { new: true }
        );


        res.status(200).json({ message: 'Branch edited successfully' });
    } catch (err) {
        console.error('Error updating branch:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});




export default router;


