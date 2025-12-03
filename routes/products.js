const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const productsPath = path.join(__dirname, '../data/products.json');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/images/products'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        // Check file extension
        const allowedExtensions = /\.(jpeg|jpg|png|webp|pdf|doc|docx)$/i;
        const extValid = allowedExtensions.test(file.originalname);

        // Check MIME type
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const mimeValid = allowedMimeTypes.includes(file.mimetype);

        if (extValid && mimeValid) {
            return cb(null, true);
        }

        // Log for debugging
        console.log('File rejected:', file.originalname, 'ext:', extValid, 'mime:', file.mimetype, mimeValid);
        cb(new Error('Only image and document files are allowed (jpg, png, webp, pdf, doc, docx)'));
    }
});

// Helper functions
const getProducts = () => {
    const data = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(data);
};

const saveProducts = (data) => {
    fs.writeFileSync(productsPath, JSON.stringify(data, null, 2), 'utf8');
};

// Get all products (public)
router.get('/', (req, res) => {
    try {
        const data = getProducts();
        res.json(data.products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get existing PDF files (authenticated) - MUST be before /:id route
router.get('/files/pdfs', authenticateToken, (req, res) => {
    try {
        const productsDir = path.join(__dirname, '../public/images/products');
        const files = fs.readdirSync(productsDir);

        // Filter PDF files
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

        // Return file info
        const pdfInfo = pdfFiles.map(file => {
            const filePath = path.join(productsDir, file);
            const stats = fs.statSync(filePath);
            return {
                filename: file,
                path: `/images/products/${file}`,
                size: stats.size,
                modified: stats.mtime
            };
        });

        // Sort by modification date (newest first)
        pdfInfo.sort((a, b) => new Date(b.modified) - new Date(a.modified));

        res.json(pdfInfo);
    } catch (error) {
        console.error('Get PDFs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product (public)
router.get('/:id', (req, res) => {
    try {
        const data = getProducts();
        const product = data.products.find(p => p.id === req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product (authenticated)
router.post('/', authenticateToken, (req, res) => {
    try {
        const data = getProducts();
        const newProduct = {
            id: req.body.id || `product-${Date.now()}`,
            defaultImage: req.body.defaultImage || req.body.image || '',
            category: req.body.category || '',
            order: req.body.order || data.products.length + 1,
            specs: req.body.specs || {},
            details: req.body.details || {
                models: [],
                technical: {},
                rollers: [],
                videoUrl: null,
                gallery: [],
                documents: []
            }
        };

        // Check for duplicate ID
        if (data.products.some(p => p.id === newProduct.id)) {
            return res.status(400).json({ error: 'Product ID already exists' });
        }

        data.products.push(newProduct);
        saveProducts(data);

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product (authenticated)
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const data = getProducts();
        const index = data.products.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        data.products[index] = {
            ...data.products[index],
            ...req.body,
            id: req.params.id // Prevent ID change
        };

        saveProducts(data);
        res.json(data.products[index]);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product (authenticated)
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const data = getProducts();
        const index = data.products.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const deleted = data.products.splice(index, 1)[0];
        saveProducts(data);

        res.json({ message: 'Product deleted', product: deleted });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload file (authenticated) - supports images and documents
router.post('/upload', authenticateToken, (req, res) => {
    try {
        upload.single('image')(req, res, (err) => {
            try {
                if (err instanceof multer.MulterError) {
                    // Multer-specific errors
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(400).json({ error: 'Dosya boyutu çok büyük (max 100MB)' });
                    }
                    return res.status(400).json({ error: 'Yükleme hatası: ' + err.message });
                } else if (err) {
                    // Other errors (like file type rejection)
                    console.error('Upload error:', err);
                    return res.status(400).json({ error: err.message });
                }

                if (!req.file) {
                    return res.status(400).json({ error: 'Dosya seçilmedi' });
                }

                res.json({
                    filename: req.file.filename,
                    path: `/images/products/${req.file.filename}`
                });
            } catch (innerError) {
                console.error('Upload inner error:', innerError);
                res.status(500).json({ error: 'Dosya yükleme hatası: ' + innerError.message });
            }
        });
    } catch (outerError) {
        console.error('Upload outer error:', outerError);
        res.status(500).json({ error: 'Sunucu hatası: ' + outerError.message });
    }
});

module.exports = router;
