/**
 * URL Helper Module for internationalized URLs
 * Provides utilities for generating and parsing localized URLs
 */

const fs = require('fs');
const path = require('path');

// Load URL slugs
let urlSlugs = null;
let productsData = null;
let newsData = null;

function loadSlugs() {
    if (!urlSlugs) {
        const slugsPath = path.join(__dirname, '..', 'data', 'url-slugs.json');
        urlSlugs = JSON.parse(fs.readFileSync(slugsPath, 'utf8'));
    }
    return urlSlugs;
}

function loadProducts() {
    // Always reload to get fresh data (products can be updated via admin)
    const productsPath = path.join(__dirname, '..', 'data', 'products.json');
    productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    return productsData;
}

function loadNews() {
    // Always reload to get fresh data (news can be updated via admin)
    const newsPath = path.join(__dirname, '..', 'data', 'news.json');
    try {
        newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
    } catch (e) {
        newsData = [];
    }
    return newsData;
}

// Supported languages
const SUPPORTED_LANGS = ['tr', 'en', 'ru'];
const DEFAULT_LANG = 'tr';
const DOMAIN = 'https://www.ayermak.com';

/**
 * Get page slug for a specific language
 * @param {string} pageId - Internal page identifier (e.g., 'products', 'about')
 * @param {string} lang - Language code
 * @returns {string} Localized slug
 */
function getPageSlug(pageId, lang) {
    const slugs = loadSlugs();
    if (slugs.pages[pageId] && slugs.pages[pageId][lang] !== undefined) {
        return slugs.pages[pageId][lang];
    }
    return pageId;
}

/**
 * Get product slug for a specific language
 * @param {string} productId - Internal product identifier
 * @param {string} lang - Language code
 * @returns {string} Localized product slug
 */
function getProductSlug(productId, lang) {
    const { products } = loadProducts();
    const product = products.find(p => p.id === productId);
    if (product && product.slug && product.slug[lang]) {
        return product.slug[lang];
    }
    return productId;
}

/**
 * Get news slug for a specific language
 * @param {string} newsId - Internal news identifier
 * @param {string} lang - Language code
 * @returns {string|null} Localized news slug or null if not found
 */
function getNewsSlug(newsId, lang) {
    const news = loadNews();
    const newsItem = news.find(n => n.id === newsId);
    if (newsItem && newsItem.slug && newsItem.slug[lang]) {
        return newsItem.slug[lang];
    }
    return null;
}

/**
 * Find news ID from slug in any language
 * @param {string} slug - News slug
 * @returns {string|null} News ID or null if not found
 */
function findNewsIdBySlug(slug) {
    const news = loadNews();
    for (const newsItem of news) {
        if (newsItem.slug && typeof newsItem.slug === 'object') {
            for (const [lang, newsSlug] of Object.entries(newsItem.slug)) {
                if (newsSlug === slug) {
                    return newsItem.id;
                }
            }
        }
    }
    return null;
}

/**
 * Generate localized URL for a page
 * @param {string} pageId - Internal page identifier
 * @param {string} lang - Language code
 * @param {Object} params - Optional parameters (e.g., {slug: 'product-slug'} for detail pages)
 * @returns {string} Localized URL path
 */
function getLocalizedUrl(pageId, lang, params = {}) {
    const pageSlug = getPageSlug(pageId, lang);

    if (pageId === 'home') {
        return `/${lang}/`;
    }

    let url = `/${lang}/${pageSlug}`;

    // Handle detail pages
    if (params.productId) {
        const productSlug = getProductSlug(params.productId, lang);
        url += `/${productSlug}`;
    } else if (params.newsId) {
        // Use newsId to get translated slug
        const newsSlug = getNewsSlug(params.newsId, lang);
        if (newsSlug) {
            url += `/${newsSlug}`;
        } else if (params.newsSlug) {
            // Fallback to provided slug if translation not found
            url += `/${params.newsSlug}`;
        }
    } else if (params.newsSlug) {
        // Try to find newsId from slug and get translated version
        const newsId = findNewsIdBySlug(params.newsSlug);
        if (newsId) {
            const translatedSlug = getNewsSlug(newsId, lang);
            if (translatedSlug) {
                url += `/${translatedSlug}`;
            } else {
                url += `/${params.newsSlug}`;
            }
        } else {
            url += `/${params.newsSlug}`;
        }
    }

    return url;
}

/**
 * Generate full URL with domain
 * @param {string} pageId - Internal page identifier
 * @param {string} lang - Language code
 * @param {Object} params - Optional parameters
 * @returns {string} Full URL with domain
 */
function getFullUrl(pageId, lang, params = {}) {
    return DOMAIN + getLocalizedUrl(pageId, lang, params);
}

/**
 * Reverse lookup: find page ID from slug
 * @param {string} slug - URL slug (can be nested like 'bayiler/yurt-ici')
 * @param {string} lang - Language code
 * @returns {string|null} Page ID or null if not found
 */
function getPageIdFromSlug(slug, lang) {
    const slugs = loadSlugs();

    for (const [pageId, langSlugs] of Object.entries(slugs.pages)) {
        if (langSlugs[lang] === slug) {
            return pageId;
        }
    }

    return null;
}

/**
 * Try to find page ID from nested slug (e.g., 'bayiler/yurt-ici')
 * @param {string} part1 - First part of slug (e.g., 'bayiler')
 * @param {string} part2 - Second part of slug (e.g., 'yurt-ici')
 * @param {string} lang - Language code
 * @returns {string|null} Page ID or null if not found
 */
function getPageIdFromNestedSlug(part1, part2, lang) {
    const nestedSlug = `${part1}/${part2}`;
    return getPageIdFromSlug(nestedSlug, lang);
}

/**
 * Reverse lookup: find product ID from slug
 * @param {string} slug - Product slug
 * @param {string} lang - Language code
 * @returns {string|null} Product ID or null if not found
 */
function getProductIdFromSlug(slug, lang) {
    const { products } = loadProducts();

    for (const product of products) {
        // Check if slug matches for the given language
        if (product.slug && product.slug[lang] === slug) {
            return product.id;
        }
        // Also check if slug matches the product id (fallback)
        if (product.id === slug) {
            return product.id;
        }
    }

    return null;
}

/**
 * Get all language URLs for a page (for hreflang tags)
 * @param {string} pageId - Internal page identifier
 * @param {Object} params - Optional parameters
 * @returns {Object} Object with lang codes as keys and full URLs as values
 */
function getAllLanguageUrls(pageId, params = {}) {
    const urls = {};

    for (const lang of SUPPORTED_LANGS) {
        urls[lang] = getFullUrl(pageId, lang, params);
    }

    // x-default points to default language
    urls['x-default'] = urls[DEFAULT_LANG];

    return urls;
}

/**
 * Detect language from Accept-Language header
 * @param {string} acceptLanguage - Accept-Language header value
 * @returns {string} Detected language code
 */
function detectLanguageFromHeader(acceptLanguage) {
    if (!acceptLanguage) {
        return DEFAULT_LANG;
    }

    // Parse Accept-Language header
    const languages = acceptLanguage.split(',').map(lang => {
        const parts = lang.trim().split(';');
        const code = parts[0].split('-')[0].toLowerCase();
        const q = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1;
        return { code, q };
    }).sort((a, b) => b.q - a.q);

    // Find first supported language
    for (const { code } of languages) {
        if (SUPPORTED_LANGS.includes(code)) {
            return code;
        }
    }

    return DEFAULT_LANG;
}

/**
 * Check if language is supported
 * @param {string} lang - Language code
 * @returns {boolean}
 */
function isValidLanguage(lang) {
    return SUPPORTED_LANGS.includes(lang);
}

/**
 * Parse URL to extract language and page info
 * @param {string} urlPath - URL path (e.g., '/en/products/disc-cultivator')
 * @returns {Object|null} Parsed info or null
 */
function parseLocalizedUrl(urlPath) {
    const parts = urlPath.split('/').filter(Boolean);

    if (parts.length === 0) {
        return null;
    }

    const lang = parts[0];

    if (!isValidLanguage(lang)) {
        return null;
    }

    // Home page
    if (parts.length === 1) {
        return { lang, pageId: 'home', slug: null };
    }

    const pageSlug = parts[1];

    // First, check for nested slugs (e.g., bayiler/yurt-ici)
    if (parts.length >= 3) {
        const nestedPageId = getPageIdFromNestedSlug(parts[1], parts[2], lang);
        if (nestedPageId) {
            // This is a nested page like dealers-domestic or dealers-international
            return { lang, pageId: nestedPageId, slug: null };
        }
    }

    const pageId = getPageIdFromSlug(pageSlug, lang);

    if (!pageId) {
        return null;
    }

    // List page
    if (parts.length === 2) {
        return { lang, pageId, slug: null };
    }

    // Detail page
    const detailSlug = parts[2];

    if (pageId === 'products') {
        const productId = getProductIdFromSlug(detailSlug, lang);
        return { lang, pageId, slug: detailSlug, productId };
    }

    // News or other detail pages
    return { lang, pageId, slug: detailSlug };
}

/**
 * Get URL for switching language on current page
 * @param {string} currentUrl - Current URL path
 * @param {string} newLang - Target language
 * @returns {string} New URL in target language
 */
function getSwitchLanguageUrl(currentUrl, newLang) {
    const parsed = parseLocalizedUrl(currentUrl);

    if (!parsed) {
        return `/${newLang}/`;
    }

    const params = {};

    if (parsed.productId) {
        params.productId = parsed.productId;
    } else if (parsed.slug && parsed.pageId === 'news') {
        // For news, we need to keep the same slug structure
        // This requires news to have slugs in all languages
        params.newsSlug = parsed.slug; // TODO: Map news slug to new language
    }

    return getLocalizedUrl(parsed.pageId, newLang, params);
}

/**
 * Reload slugs from file (useful for admin updates)
 */
function reloadSlugs() {
    urlSlugs = null;
    loadSlugs();
}

module.exports = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    DOMAIN,
    getPageSlug,
    getProductSlug,
    getNewsSlug,
    findNewsIdBySlug,
    getLocalizedUrl,
    getFullUrl,
    getPageIdFromSlug,
    getPageIdFromNestedSlug,
    getProductIdFromSlug,
    getAllLanguageUrls,
    detectLanguageFromHeader,
    isValidLanguage,
    parseLocalizedUrl,
    getSwitchLanguageUrl,
    reloadSlugs
};
