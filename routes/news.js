const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const newsPath = path.join(__dirname, '../data/news.json');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/images/news');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
function getNews() {
    if (!fs.existsSync(newsPath)) {
        fs.writeFileSync(newsPath, '[]');
        return [];
    }
    const data = fs.readFileSync(newsPath, 'utf8');
    return JSON.parse(data || '[]');
}

function saveNews(news) {
    fs.writeFileSync(newsPath, JSON.stringify(news, null, 2));
}

// Routes

// Get all news
router.get('/', (req, res) => {
    try {
        const news = getNews();
        // Sort by date descending
        news.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(news);
    } catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single news
router.get('/:id', (req, res) => {
    try {
        const news = getNews();
        const item = news.find(n => n.id === req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'News not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Get news item error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload image
router.post('/upload', authenticateToken, (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ filename: req.file.filename });
    });
});

// Create news
router.post('/', authenticateToken, (req, res) => {
    try {
        const newsList = getNews();
        const newNews = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...req.body
        };

        newsList.push(newNews);
        saveNews(newsList);

        res.status(201).json(newNews);
    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update news
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const newsList = getNews();
        const index = newsList.findIndex(n => n.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'News not found' });
        }

        newsList[index] = {
            ...newsList[index],
            ...req.body,
            id: req.params.id // Prevent ID change
        };

        saveNews(newsList);
        res.json(newsList[index]);
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete news
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        let newsList = getNews();
        const index = newsList.findIndex(n => n.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'News not found' });
        }

        const deletedNews = newsList[index];

        // Delete image if exists
        if (deletedNews.image) {
            const imagePath = path.join(__dirname, '../public/images/news', deletedNews.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        newsList = newsList.filter(n => n.id !== req.params.id);
        saveNews(newsList);

        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
