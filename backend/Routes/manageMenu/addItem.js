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
router.post('/:id', upload.single('image'), async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const price = req.body.price;
        const category = req.body.category?.trim();
        const id = req.params.id


        const image = req.file ? req.file.filename : null;

        // console.log({ name, price, manager, cuisines, image });

        if (!name || !price || !category) {
            return res.status(400).json({ error: "All fields are required." });
        }

        await Menu.findByIdAndUpdate(
            id,
            {
                $push: {
                    items: {
                        name,
                        price,
                        category,
                        image
                    }
                }
            },
            { new: true }
        );

        await Branch.findOneAndUpdate()

        res.status(201).json({ message: 'Menu created successfully' });
    } catch (err) {
        console.error('Error saving menu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



export default router;


