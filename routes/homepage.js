const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const homepagePath = path.join(__dirname, '../data/homepage.json');
const uploadDir = path.join(__dirname, '../public/images/homepage');

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
        cb(null, 'homepage-' + uniqueSuffix + path.extname(file.originalname));
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

// Helper functions
function getHomepageData() {
    if (!fs.existsSync(homepagePath)) {
        const defaultData = {
            hero: {
                autoSlideInterval: 5000,
                slides: []
            },
            quickActions: {
                enabled: true,
                items: []
            },
            featuredProducts: {
                enabled: true,
                badge: { tr: "ÖNE ÇIKANLAR", en: "FEATURED", ru: "ИЗБРАННОЕ" },
                title: { tr: "", en: "", ru: "" },
                subtitle: { tr: "", en: "", ru: "" },
                productIds: [],
                showMax: 4
            },
            companyBanner: {
                enabled: true,
                badge: { tr: "HAKKIMIZDA", en: "ABOUT US", ru: "О НАС" },
                title: { tr: "", en: "", ru: "" },
                description: { tr: "", en: "", ru: "" },
                image: "",
                buttonText: { tr: "", en: "", ru: "" },
                buttonLink: "",
                stats: []
            },
            newsSection: {
                enabled: true,
                badge: { tr: "HABERLER", en: "NEWS", ru: "НОВОСТИ" },
                title: { tr: "", en: "", ru: "" },
                showMax: 3,
                videoUrl: "",
                videoTitle: { tr: "", en: "", ru: "" }
            },
            cta: {
                enabled: true,
                title: { tr: "", en: "", ru: "" },
                text: { tr: "", en: "", ru: "" },
                buttonText: { tr: "", en: "", ru: "" },
                buttonLink: "",
                backgroundImage: ""
            },
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(homepagePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    const data = fs.readFileSync(homepagePath, 'utf8');
    return JSON.parse(data);
}

function saveHomepageData(data) {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(homepagePath, JSON.stringify(data, null, 2));
}

// Routes

// Get homepage data (public)
router.get('/', (req, res) => {
    try {
        const data = getHomepageData();
        res.json(data);
    } catch (error) {
        console.error('Get homepage data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update homepage data (protected)
router.put('/', authenticateToken, (req, res) => {
    try {
        const currentData = getHomepageData();
        const updatedData = {
            ...currentData,
            ...req.body
        };
        saveHomepageData(updatedData);
        res.json(updatedData);
    } catch (error) {
        console.error('Update homepage data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update specific section (protected)
router.put('/section/:sectionName', authenticateToken, (req, res) => {
    try {
        const { sectionName } = req.params;
        const validSections = ['hero', 'quickActions', 'featuredProducts', 'companyBanner', 'newsSection', 'cta'];

        if (!validSections.includes(sectionName)) {
            return res.status(400).json({ error: 'Invalid section name' });
        }

        const currentData = getHomepageData();
        currentData[sectionName] = req.body;
        saveHomepageData(currentData);
        res.json(currentData);
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add hero slide (protected)
router.post('/hero/slides', authenticateToken, (req, res) => {
    try {
        const data = getHomepageData();
        const newSlide = {
            id: 'slide-' + Date.now(),
            order: data.hero.slides.length + 1,
            active: true,
            ...req.body
        };
        data.hero.slides.push(newSlide);
        saveHomepageData(data);
        res.json(newSlide);
    } catch (error) {
        console.error('Add slide error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update hero slide (protected)
router.put('/hero/slides/:slideId', authenticateToken, (req, res) => {
    try {
        const { slideId } = req.params;
        const data = getHomepageData();
        const slideIndex = data.hero.slides.findIndex(s => s.id === slideId);

        if (slideIndex === -1) {
            return res.status(404).json({ error: 'Slide not found' });
        }

        data.hero.slides[slideIndex] = {
            ...data.hero.slides[slideIndex],
            ...req.body
        };
        saveHomepageData(data);
        res.json(data.hero.slides[slideIndex]);
    } catch (error) {
        console.error('Update slide error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete hero slide (protected)
router.delete('/hero/slides/:slideId', authenticateToken, (req, res) => {
    try {
        const { slideId } = req.params;
        const data = getHomepageData();
        const slideIndex = data.hero.slides.findIndex(s => s.id === slideId);

        if (slideIndex === -1) {
            return res.status(404).json({ error: 'Slide not found' });
        }

        // Remove slide image if exists
        const slide = data.hero.slides[slideIndex];
        if (slide.image) {
            const imagePath = path.join(uploadDir, slide.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        data.hero.slides.splice(slideIndex, 1);

        // Reorder remaining slides
        data.hero.slides.forEach((s, i) => {
            s.order = i + 1;
        });

        saveHomepageData(data);
        res.json({ message: 'Slide deleted successfully' });
    } catch (error) {
        console.error('Delete slide error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reorder hero slides (protected)
router.put('/hero/slides/reorder', authenticateToken, (req, res) => {
    try {
        const { slideIds } = req.body;
        const data = getHomepageData();

        const reorderedSlides = slideIds.map((id, index) => {
            const slide = data.hero.slides.find(s => s.id === id);
            if (slide) {
                slide.order = index + 1;
            }
            return slide;
        }).filter(Boolean);

        data.hero.slides = reorderedSlides;
        saveHomepageData(data);
        res.json(data.hero.slides);
    } catch (error) {
        console.error('Reorder slides error:', error);
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
            path: '/images/homepage/' + req.file.filename
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
