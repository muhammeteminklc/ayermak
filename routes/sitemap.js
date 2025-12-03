/**
 * Sitemap Route - Generates XML sitemaps for SEO
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const urlHelper = require('../utils/urlHelper');

// Load data files
function loadProducts() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'products.json'), 'utf8');
        return JSON.parse(data).products || [];
    } catch (error) {
        console.error('Error loading products for sitemap:', error);
        return [];
    }
}

function loadNews() {
    try {
        const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'news.json'), 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        console.error('Error loading news for sitemap:', error);
        return [];
    }
}

// Generate sitemap XML
function generateSitemapXml(urls) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    urls.forEach(url => {
        xml += '  <url>\n';
        xml += `    <loc>${url.loc}</loc>\n`;

        if (url.lastmod) {
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
        }

        if (url.changefreq) {
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        }

        if (url.priority) {
            xml += `    <priority>${url.priority}</priority>\n`;
        }

        // Add hreflang links
        if (url.alternates) {
            for (const [lang, href] of Object.entries(url.alternates)) {
                if (lang !== 'x-default') {
                    xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}" />\n`;
                }
            }
            // x-default
            if (url.alternates['x-default']) {
                xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${url.alternates['x-default']}" />\n`;
            }
        }

        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
}

// Main sitemap route
router.get('/sitemap.xml', (req, res) => {
    const products = loadProducts();
    const news = loadNews();
    const urls = [];
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = ['home', 'products', 'news', 'about', 'dealers'];

    staticPages.forEach(pageId => {
        const alternates = urlHelper.getAllLanguageUrls(pageId);

        urlHelper.SUPPORTED_LANGS.forEach(lang => {
            urls.push({
                loc: urlHelper.getFullUrl(pageId, lang),
                lastmod: today,
                changefreq: pageId === 'home' ? 'daily' : 'weekly',
                priority: pageId === 'home' ? '1.0' : '0.8',
                alternates
            });
        });
    });

    // Product pages
    products.forEach(product => {
        const alternates = urlHelper.getAllLanguageUrls('products', { productId: product.id });

        urlHelper.SUPPORTED_LANGS.forEach(lang => {
            urls.push({
                loc: urlHelper.getFullUrl('products', lang, { productId: product.id }),
                lastmod: today,
                changefreq: 'weekly',
                priority: '0.9',
                alternates
            });
        });
    });

    // News pages (if they have slugs)
    news.forEach(item => {
        if (item.slug) {
            urlHelper.SUPPORTED_LANGS.forEach(lang => {
                const slug = item.slug[lang] || item.slug.tr || item.id;
                const alternates = {};

                urlHelper.SUPPORTED_LANGS.forEach(altLang => {
                    const altSlug = item.slug[altLang] || item.slug.tr || item.id;
                    alternates[altLang] = `${urlHelper.DOMAIN}/${altLang}/${urlHelper.getPageSlug('news', altLang)}/${altSlug}`;
                });
                alternates['x-default'] = alternates[urlHelper.DEFAULT_LANG];

                urls.push({
                    loc: `${urlHelper.DOMAIN}/${lang}/${urlHelper.getPageSlug('news', lang)}/${slug}`,
                    lastmod: item.date ? item.date.split('T')[0] : today,
                    changefreq: 'monthly',
                    priority: '0.7',
                    alternates
                });
            });
        }
    });

    res.header('Content-Type', 'application/xml');
    res.send(generateSitemapXml(urls));
});

module.exports = router;
