/**
 * i18n Router Middleware
 * Handles internationalized URL routing and redirects
 */

const path = require('path');
const fs = require('fs');
const urlHelper = require('../utils/urlHelper');

// Cache for HTML files
const htmlCache = {};

/**
 * Read HTML file with caching (disabled in development)
 */
function readHtmlFile(filePath) {
    // Disable cache in development
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
        return fs.readFileSync(filePath, 'utf8');
    }
    if (!htmlCache[filePath]) {
        htmlCache[filePath] = fs.readFileSync(filePath, 'utf8');
    }
    return htmlCache[filePath];
}

/**
 * Clear HTML cache (useful for development)
 */
function clearCache() {
    Object.keys(htmlCache).forEach(key => delete htmlCache[key]);
}

/**
 * Inject SEO meta tags into HTML
 */
function injectSeoTags(html, pageData) {
    const { lang, pageId, productId, newsSlug, allUrls } = pageData;

    // Build hreflang tags
    let hreflangTags = '';
    for (const [hrefLang, url] of Object.entries(allUrls)) {
        hreflangTags += `    <link rel="alternate" hreflang="${hrefLang}" href="${url}" />\n`;
    }

    // Build canonical tag
    const canonicalUrl = allUrls[lang];
    const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}" />`;

    // Combine SEO tags
    const seoTags = `${hreflangTags}${canonicalTag}`;

    // Inject before </head>
    html = html.replace('</head>', `${seoTags}\n</head>`);

    // Update html lang attribute
    html = html.replace(/<html[^>]*lang="[^"]*"/, `<html lang="${lang}"`);
    html = html.replace(/<html(?![^>]*lang)/, `<html lang="${lang}"`);

    // Inject page data as JavaScript variable for frontend
    const pageDataScript = `
    <script>
        window.__PAGE_DATA__ = ${JSON.stringify({
            lang,
            pageId,
            productId: productId || null,
            newsSlug: newsSlug || null
        })};
    </script>`;

    html = html.replace('</head>', `${pageDataScript}\n</head>`);

    return html;
}

/**
 * Map page ID to HTML file
 */
function getHtmlFile(pageId) {
    const fileMap = {
        'home': 'index.html',
        'products': 'products.html',
        'product-detail': 'product-detail.html',
        'news': 'news.html',
        'news-detail': 'news-detail.html',
        'about': 'about.html',
        'dealers': 'dealers.html',
        'dealers-domestic': 'dealers-domestic.html',
        'dealers-international': 'dealers-international.html',
        'contact': 'iletisim.html'
    };
    return fileMap[pageId] || 'index.html';
}

/**
 * Main i18n router middleware
 */
function i18nRouter(publicPath) {
    return (req, res, next) => {
        const urlPath = req.path;

        // Skip API routes
        if (urlPath.startsWith('/api/')) {
            return next();
        }

        // Skip admin routes
        if (urlPath.startsWith('/admin/')) {
            return next();
        }

        // Skip static files (with extensions)
        if (path.extname(urlPath) && !urlPath.endsWith('.html')) {
            return next();
        }

        // Skip data, images, css, js folders
        if (urlPath.startsWith('/data/') ||
            urlPath.startsWith('/images/') ||
            urlPath.startsWith('/css/') ||
            urlPath.startsWith('/js/') ||
            urlPath.startsWith('/components/')) {
            return next();
        }

        // Handle old URL redirects (301)
        const oldUrlRedirect = handleOldUrlRedirect(req, res);
        if (oldUrlRedirect) {
            return;
        }

        // Handle root URL - redirect to detected language
        if (urlPath === '/' || urlPath === '') {
            const detectedLang = urlHelper.detectLanguageFromHeader(req.headers['accept-language']);
            return res.redirect(302, `/${detectedLang}/`);
        }

        // Parse localized URL
        const parsed = urlHelper.parseLocalizedUrl(urlPath);

        if (!parsed) {
            // Invalid URL - redirect to home with detected language
            const detectedLang = urlHelper.detectLanguageFromHeader(req.headers['accept-language']);
            return res.redirect(302, `/${detectedLang}/`);
        }

        // Determine which HTML file to serve
        let pageId = parsed.pageId;
        let htmlFile = getHtmlFile(pageId);

        // Handle detail pages
        if (parsed.slug && pageId === 'products') {
            if (parsed.productId) {
                htmlFile = 'product-detail.html';
                pageId = 'product-detail';
            } else {
                // Invalid product slug
                return res.redirect(302, urlHelper.getLocalizedUrl('products', parsed.lang));
            }
        } else if (parsed.slug && pageId === 'news') {
            htmlFile = 'news-detail.html';
            pageId = 'news-detail';
        }

        // Build page data for SEO
        const params = {};
        if (parsed.productId) {
            params.productId = parsed.productId;
        } else if (parsed.slug && pageId === 'news-detail') {
            params.newsSlug = parsed.slug;
        }

        const allUrls = urlHelper.getAllLanguageUrls(
            pageId === 'product-detail' ? 'products' : (pageId === 'news-detail' ? 'news' : pageId),
            params
        );

        const pageData = {
            lang: parsed.lang,
            pageId: pageId,
            productId: parsed.productId,
            newsSlug: parsed.slug,
            allUrls: allUrls
        };

        // Read and inject SEO tags
        try {
            const filePath = path.join(publicPath, htmlFile);
            let html = readHtmlFile(filePath);
            html = injectSeoTags(html, pageData);
            res.send(html);
        } catch (error) {
            console.error('Error serving page:', error);
            next(error);
        }
    };
}

/**
 * Handle redirects from old URL format to new i18n URLs
 */
function handleOldUrlRedirect(req, res) {
    const urlPath = req.path;
    const detectedLang = urlHelper.detectLanguageFromHeader(req.headers['accept-language']);

    // Old URL mappings
    const oldUrls = {
        '/index.html': () => `/${detectedLang}/`,
        '/products.html': () => urlHelper.getLocalizedUrl('products', detectedLang),
        '/product-detail.html': () => {
            const productId = req.query.id;
            if (productId) {
                return urlHelper.getLocalizedUrl('products', detectedLang, { productId });
            }
            return urlHelper.getLocalizedUrl('products', detectedLang);
        },
        '/news.html': () => urlHelper.getLocalizedUrl('news', detectedLang),
        '/news-detail.html': () => {
            const newsId = req.query.id;
            // For news detail, we need to look up the slug from the news data
            // For now, redirect to news list - proper slug handling needed
            return urlHelper.getLocalizedUrl('news', detectedLang);
        },
        '/about.html': () => urlHelper.getLocalizedUrl('about', detectedLang),
        '/dealers.html': () => urlHelper.getLocalizedUrl('dealers', detectedLang)
    };

    if (oldUrls[urlPath]) {
        const newUrl = oldUrls[urlPath]();
        res.redirect(301, newUrl);
        return true;
    }

    return false;
}

module.exports = {
    i18nRouter,
    clearCache
};
