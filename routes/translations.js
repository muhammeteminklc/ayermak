const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const translationsPath = path.join(__dirname, '../data/translations.json');

// Helper functions
const getTranslations = () => {
    const data = fs.readFileSync(translationsPath, 'utf8');
    return JSON.parse(data);
};

const saveTranslations = (data) => {
    fs.writeFileSync(translationsPath, JSON.stringify(data, null, 2), 'utf8');
};

// Get all translations (public)
router.get('/', (req, res) => {
    try {
        const data = getTranslations();
        res.json(data);
    } catch (error) {
        console.error('Get translations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get translations for specific language (public)
router.get('/:lang', (req, res) => {
    try {
        const data = getTranslations();
        const lang = req.params.lang.toLowerCase();

        if (!data[lang]) {
            return res.status(404).json({ error: 'Language not found' });
        }

        res.json(data[lang]);
    } catch (error) {
        console.error('Get language translations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update all translations (authenticated)
router.put('/', authenticateToken, (req, res) => {
    try {
        const newTranslations = req.body;

        // Validate structure
        if (!newTranslations.tr || !newTranslations.en || !newTranslations.ru) {
            return res.status(400).json({ error: 'All languages (tr, en, ru) are required' });
        }

        saveTranslations(newTranslations);
        res.json({ message: 'Translations updated successfully' });
    } catch (error) {
        console.error('Update translations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update specific language translations (authenticated)
router.put('/:lang', authenticateToken, (req, res) => {
    try {
        const data = getTranslations();
        const lang = req.params.lang.toLowerCase();

        if (!['tr', 'en', 'ru'].includes(lang)) {
            return res.status(400).json({ error: 'Invalid language. Supported: tr, en, ru' });
        }

        data[lang] = {
            ...data[lang],
            ...req.body
        };

        saveTranslations(data);
        res.json({ message: `${lang.toUpperCase()} translations updated successfully` });
    } catch (error) {
        console.error('Update language translations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new translation key (authenticated)
router.post('/key', authenticateToken, (req, res) => {
    try {
        const { category, key, translations } = req.body;

        if (!category || !key || !translations) {
            return res.status(400).json({ error: 'Category, key, and translations are required' });
        }

        const data = getTranslations();

        // Add to all languages
        ['tr', 'en', 'ru'].forEach(lang => {
            if (!data[lang][category]) {
                data[lang][category] = {};
            }
            data[lang][category][key] = translations[lang] || '';
        });

        saveTranslations(data);
        res.json({ message: 'Translation key added successfully' });
    } catch (error) {
        console.error('Add translation key error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
