const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const aboutPath = path.join(__dirname, '../data/about.json');
const uploadDir = path.join(__dirname, '../public/images/about');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'about-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

// Helper functions
function getAboutData() {
    if (!fs.existsSync(aboutPath)) {
        const defaultData = {
            hero: {
                badge: { tr: "HAKKIMIZDA", en: "ABOUT US", ru: "О НАС" },
                title: { tr: "", en: "", ru: "" },
                subtitle: { tr: "", en: "", ru: "" }
            },
            story: {
                gallery: [],
                paragraphs: []
            },
            features: [],
            stats: [],
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(aboutPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    const data = fs.readFileSync(aboutPath, 'utf8');
    return JSON.parse(data);
}

function saveAboutData(data) {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(aboutPath, JSON.stringify(data, null, 2));
}

// Routes

// Get about data (public)
router.get('/', (req, res) => {
    try {
        const data = getAboutData();
        res.json(data);
    } catch (error) {
        console.error('Get about data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update about data (protected)
router.put('/', authenticateToken, (req, res) => {
    try {
        const currentData = getAboutData();
        const updatedData = {
            ...currentData,
            ...req.body
        };
        saveAboutData(updatedData);
        res.json(updatedData);
    } catch (error) {
        console.error('Update about data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload image (protected)
router.post('/upload', authenticateToken, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({
            filename: req.file.filename,
            path: '/images/about/' + req.file.filename
        });
    });
});

// Delete image (protected)
router.delete('/image/:filename', authenticateToken, (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(uploadDir, filename);

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);

            // Also remove from gallery if exists
            const data = getAboutData();
            if (data.story && data.story.gallery) {
                data.story.gallery = data.story.gallery.filter(img => img !== filename);
                saveAboutData(data);
            }

            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
