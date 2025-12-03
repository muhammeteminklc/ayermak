const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const authMiddleware = authenticateToken;

const dealersPath = path.join(__dirname, '../data/dealers.json');
const uploadDir = path.join(__dirname, '../public/images/dealers');
const certificatesDir = path.join(__dirname, '../public/images/certificates');

// Create directories if they don't exist
const ensureDirectories = async () => {
    try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.mkdir(certificatesDir, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
    }
};
ensureDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = req.path.includes('certificate') ? certificatesDir : uploadDir;
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and PDF files are allowed!'));
        }
    }
});

// Multer error handler
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Max 10MB allowed.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// Helper function to read dealers data
const readDealers = async () => {
    try {
        const data = await fs.readFile(dealersPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading dealers:', err);
        return { domestic: [], international: [], certificates: [] };
    }
};

// Helper function to write dealers data
const writeDealers = async (data) => {
    try {
        await fs.writeFile(dealersPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing dealers:', err);
        return false;
    }
};

// GET all dealers
router.get('/', async (req, res) => {
    try {
        const dealers = await readDealers();
        res.json(dealers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dealers' });
    }
});

// ===== CERTIFICATES ROUTES (MUST BE BEFORE /:type ROUTES) =====

// POST new certificate
router.post('/certificates/add', authMiddleware, upload.single('image'), handleMulterError, async (req, res) => {
    try {
        console.log('Certificate POST - Body:', req.body);
        console.log('Certificate POST - File:', req.file);
        
        if (!req.body.title || req.body.title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        const dealers = await readDealers();
        const newCertificate = {
            id: Date.now().toString(),
            title: req.body.title,
            description: req.body.description || '',
            image: req.file ? `/images/certificates/${req.file.filename}` : '',
            date: req.body.date || new Date().toISOString().split('T')[0]
        };

        if (!dealers.certificates) {
            dealers.certificates = [];
        }

        dealers.certificates.push(newCertificate);
        
        const success = await writeDealers(dealers);
        if (success) {
            res.json(newCertificate);
        } else {
            res.status(500).json({ error: 'Failed to save certificate' });
        }
    } catch (err) {
        console.error('Error adding certificate:', err);
        res.status(500).json({ error: err.message || 'Failed to add certificate' });
    }
});

// PUT update certificate
router.put('/certificates/:id', authMiddleware, upload.single('image'), handleMulterError, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Certificate PUT - ID:', id);
        console.log('Certificate PUT - Body:', req.body);
        console.log('Certificate PUT - File:', req.file);
        
        const dealers = await readDealers();
        
        if (!dealers.certificates) {
            dealers.certificates = [];
        }

        const certIndex = dealers.certificates.findIndex(c => c.id === id);
        
        if (certIndex === -1) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        // Validate title
        const newTitle = req.body.title || dealers.certificates[certIndex].title;
        if (!newTitle || newTitle.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        const updatedCertificate = {
            ...dealers.certificates[certIndex],
            title: newTitle,
            description: req.body.description !== undefined ? req.body.description : dealers.certificates[certIndex].description,
            date: req.body.date || dealers.certificates[certIndex].date,
            id
        };

        if (req.file) {
            updatedCertificate.image = `/images/certificates/${req.file.filename}`;
        }

        dealers.certificates[certIndex] = updatedCertificate;
        
        const success = await writeDealers(dealers);
        if (success) {
            res.json(updatedCertificate);
        } else {
            res.status(500).json({ error: 'Failed to update certificate' });
        }
    } catch (err) {
        console.error('Error updating certificate:', err);
        res.status(500).json({ error: err.message || 'Failed to update certificate' });
    }
});

// DELETE certificate
router.delete('/certificates/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const dealers = await readDealers();
        
        if (!dealers.certificates) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const certIndex = dealers.certificates.findIndex(c => c.id === id);
        
        if (certIndex === -1) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        dealers.certificates.splice(certIndex, 1);
        
        const success = await writeDealers(dealers);
        if (success) {
            res.json({ message: 'Certificate deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete certificate' });
        }
    } catch (err) {
        console.error('Error deleting certificate:', err);
        res.status(500).json({ error: 'Failed to delete certificate' });
    }
});

// ===== DEALER ROUTES =====

// GET dealers by type (domestic/international)
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        if (!['domestic', 'international', 'certificates'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type' });
        }
        
        const dealers = await readDealers();
        res.json(dealers[type] || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dealers' });
    }
});

// POST new dealer (domestic or international)
router.post('/:type', authMiddleware, upload.single('image'), handleMulterError, async (req, res) => {
    try {
        const { type } = req.params;
        if (!['domestic', 'international'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type' });
        }

        const dealers = await readDealers();
        const newDealer = {
            id: Date.now().toString(),
            ...req.body,
            image: req.file ? `/images/dealers/${req.file.filename}` : ''
        };

        dealers[type].push(newDealer);
        
        const success = await writeDealers(dealers);
        if (success) {
            res.json(newDealer);
        } else {
            res.status(500).json({ error: 'Failed to save dealer' });
        }
    } catch (err) {
        console.error('Error adding dealer:', err);
        res.status(500).json({ error: 'Failed to add dealer' });
    }
});

// PUT update dealer
router.put('/:type/:id', authMiddleware, upload.single('image'), handleMulterError, async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!['domestic', 'international'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type' });
        }

        const dealers = await readDealers();
        const dealerIndex = dealers[type].findIndex(d => d.id === id);
        
        if (dealerIndex === -1) {
            return res.status(404).json({ error: 'Dealer not found' });
        }

        const updatedDealer = {
            ...dealers[type][dealerIndex],
            ...req.body,
            id
        };

        if (req.file) {
            updatedDealer.image = `/images/dealers/${req.file.filename}`;
        }

        dealers[type][dealerIndex] = updatedDealer;
        
        const success = await writeDealers(dealers);
        if (success) {
            res.json(updatedDealer);
        } else {
            res.status(500).json({ error: 'Failed to update dealer' });
        }
    } catch (err) {
        console.error('Error updating dealer:', err);
        res.status(500).json({ error: 'Failed to update dealer' });
    }
});

// DELETE dealer
router.delete('/:type/:id', authMiddleware, async (req, res) => {
    try {
        const { type, id } = req.params;
        if (!['domestic', 'international'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type' });
        }

        const dealers = await readDealers();
        const dealerIndex = dealers[type].findIndex(d => d.id === id);
        
        if (dealerIndex === -1) {
            return res.status(404).json({ error: 'Dealer not found' });
        }

        dealers[type].splice(dealerIndex, 1);
        
        const success = await writeDealers(dealers);
        if (success) {
            res.json({ message: 'Dealer deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete dealer' });
        }
    } catch (err) {
        console.error('Error deleting dealer:', err);
        res.status(500).json({ error: 'Failed to delete dealer' });
    }
});

module.exports = router;

