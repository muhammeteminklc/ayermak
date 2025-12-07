const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const translationsRoutes = require('./routes/translations');
const dealersRoutes = require('./routes/dealers');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const homepageRoutes = require('./routes/homepage');
const footerRoutes = require('./routes/footer');
const announcementRoutes = require('./routes/announcement');
const messagesRoutes = require('./routes/messages');
const { i18nRouter } = require('./middleware/i18nRouter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.)
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/components', express.static(path.join(__dirname, 'public', 'components')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Serve favicon
app.get('/favicon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.png'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Serve data files (for defaultSpecs.json etc.)
app.use('/data', express.static(path.join(__dirname, 'data')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/translations', translationsRoutes);
app.use('/api/news', require('./routes/news'));
app.use('/api/dealers', dealersRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/messages', messagesRoutes);

// Sitemap route
app.use('/', require('./routes/sitemap'));

// i18n Router - handles all internationalized page routes
app.use(i18nRouter(path.join(__dirname, 'public')));

// Global error handler - ensures all errors return JSON
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    // Always return JSON for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(err.status || 500).json({
            error: err.message || 'Server error',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // For non-API routes, send generic error
    res.status(500).send('Server error');
});

app.listen(PORT, () => {
    console.log(`AYERMAK server running at http://localhost:${PORT}`);
});
