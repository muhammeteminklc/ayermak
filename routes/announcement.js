const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const announcementPath = path.join(__dirname, '../data/announcement.json');
const uploadDir = path.join(__dirname, '../public/images/announcement');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'announcement-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
    }
});

// Helper: Get default announcement data
function getDefaultAnnouncementData() {
    return {
        id: 'announcement-' + Date.now(),
        enabled: false,
        image: '',
        title: { tr: '', en: '', ru: '' },
        description: { tr: '', en: '', ru: '' },
        button: {
            text: { tr: 'Detaylar', en: 'Details', ru: 'Подробности' },
            link: '',
            links: { tr: '', en: '', ru: '' }
        },
        displaySettings: {
            maxViewsPerUser: 3,
            resetIntervalMinutes: 180
        },
        updatedAt: new Date().toISOString()
    };
}

// Helper: Read announcement data
function getAnnouncementData() {
    if (!fs.existsSync(announcementPath)) {
        const defaultData = getDefaultAnnouncementData();
        fs.writeFileSync(announcementPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    const data = fs.readFileSync(announcementPath, 'utf8');
    return JSON.parse(data);
}

// Helper: Save announcement data
function saveAnnouncementData(data) {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(announcementPath, JSON.stringify(data, null, 2));
    return data;
}

// PUBLIC: Get active announcement (for frontend)
router.get('/', (req, res) => {
    try {
        const data = getAnnouncementData();

        // If not enabled, return null
        if (!data.enabled) {
            return res.json(null);
        }

        // Return public-facing data
        res.json({
            id: data.id,
            image: data.image,
            title: data.title,
            description: data.description,
            button: {
                text: data.button?.text || {},
                link: data.button?.link || '',
                links: data.button?.links || {}
            },
            displaySettings: data.displaySettings,
            updatedAt: data.updatedAt
        });
    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PROTECTED: Get full announcement settings (admin)
router.get('/admin', authenticateToken, (req, res) => {
    try {
        const data = getAnnouncementData();
        res.json(data);
    } catch (error) {
        console.error('Get admin announcement error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PROTECTED: Update announcement settings
router.put('/', authenticateToken, (req, res) => {
    try {
        const currentData = getAnnouncementData();

        // Check if content changed significantly - generate new ID for "new" detection
        const contentChanged =
            JSON.stringify(currentData.title) !== JSON.stringify(req.body.title) ||
            JSON.stringify(currentData.description) !== JSON.stringify(req.body.description) ||
            currentData.image !== req.body.image;

        const updatedData = {
            ...currentData,
            ...req.body
        };

        // If content changed and regenerateId flag is set, generate new ID
        if (contentChanged && req.body.regenerateId) {
            updatedData.id = 'announcement-' + Date.now();
        }

        const savedData = saveAnnouncementData(updatedData);
        res.json(savedData);
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// PROTECTED: Upload announcement image
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
            path: '/images/announcement/' + req.file.filename
        });
    });
});

// PROTECTED: Delete announcement image
router.delete('/image', authenticateToken, (req, res) => {
    try {
        const data = getAnnouncementData();

        if (data.image) {
            const imagePath = path.join(uploadDir, data.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            data.image = '';
            saveAnnouncementData(data);
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
