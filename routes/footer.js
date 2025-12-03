const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const FOOTER_FILE = path.join(__dirname, '..', 'data', 'footer.json');

// Helper: Read footer data
async function readFooterData() {
    try {
        const data = await fs.readFile(FOOTER_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading footer data:', error);
        return getDefaultFooterData();
    }
}

// Helper: Write footer data
async function writeFooterData(data) {
    data.updatedAt = new Date().toISOString();
    await fs.writeFile(FOOTER_FILE, JSON.stringify(data, null, 2), 'utf8');
    return data;
}

// Default footer data
function getDefaultFooterData() {
    return {
        companyInfo: {
            logo: '/images/ayermak.png',
            description: {
                tr: 'AYERMAK tarım makineleri',
                en: 'AYERMAK agricultural machinery',
                ru: 'AYERMAK сельскохозяйственная техника'
            }
        },
        socialLinks: { enabled: false, items: [] },
        contactInfo: { enabled: false },
        menuSections: [],
        legalLinks: { enabled: false, items: [] },
        copyright: {
            text: {
                tr: '© {year} AYERMAK. Tüm hakları saklıdır.',
                en: '© {year} AYERMAK. All rights reserved.',
                ru: '© {year} AYERMAK. Все права защищены.'
            }
        },
        newsletter: { enabled: false },
        updatedAt: new Date().toISOString()
    };
}

// GET /api/footer - Get footer data
router.get('/', async (req, res) => {
    try {
        const data = await readFooterData();
        res.json(data);
    } catch (error) {
        console.error('Error getting footer data:', error);
        res.status(500).json({ error: 'Failed to get footer data' });
    }
});

// PUT /api/footer - Update all footer data
router.put('/', async (req, res) => {
    try {
        const newData = req.body;
        const savedData = await writeFooterData(newData);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating footer data:', error);
        res.status(500).json({ error: 'Failed to update footer data' });
    }
});

// PUT /api/footer/company-info - Update company info
router.put('/company-info', async (req, res) => {
    try {
        const data = await readFooterData();
        data.companyInfo = { ...data.companyInfo, ...req.body };
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating company info:', error);
        res.status(500).json({ error: 'Failed to update company info' });
    }
});

// PUT /api/footer/social-links - Update social links
router.put('/social-links', async (req, res) => {
    try {
        const data = await readFooterData();
        data.socialLinks = { ...data.socialLinks, ...req.body };
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating social links:', error);
        res.status(500).json({ error: 'Failed to update social links' });
    }
});

// PUT /api/footer/contact-info - Update contact info
router.put('/contact-info', async (req, res) => {
    try {
        const data = await readFooterData();
        data.contactInfo = { ...data.contactInfo, ...req.body };
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating contact info:', error);
        res.status(500).json({ error: 'Failed to update contact info' });
    }
});

// PUT /api/footer/menu-sections - Update menu sections
router.put('/menu-sections', async (req, res) => {
    try {
        const data = await readFooterData();
        data.menuSections = req.body.sections || req.body;
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating menu sections:', error);
        res.status(500).json({ error: 'Failed to update menu sections' });
    }
});

// PUT /api/footer/legal-links - Update legal links
router.put('/legal-links', async (req, res) => {
    try {
        const data = await readFooterData();
        data.legalLinks = { ...data.legalLinks, ...req.body };
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating legal links:', error);
        res.status(500).json({ error: 'Failed to update legal links' });
    }
});

// PUT /api/footer/copyright - Update copyright
router.put('/copyright', async (req, res) => {
    try {
        const data = await readFooterData();
        data.copyright = { ...data.copyright, ...req.body };
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating copyright:', error);
        res.status(500).json({ error: 'Failed to update copyright' });
    }
});

// PUT /api/footer/newsletter - Update newsletter settings
router.put('/newsletter', async (req, res) => {
    try {
        const data = await readFooterData();
        data.newsletter = { ...data.newsletter, ...req.body };
        const savedData = await writeFooterData(data);
        res.json(savedData);
    } catch (error) {
        console.error('Error updating newsletter:', error);
        res.status(500).json({ error: 'Failed to update newsletter' });
    }
});

module.exports = router;

