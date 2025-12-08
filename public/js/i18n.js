// i18n - Internationalization Module with URL-based routing
class I18n {
    constructor() {
        this.translations = {};
        this.supportedLangs = ['tr', 'en', 'ru'];
        this.defaultLang = 'tr';

        // URL slug mappings (mirrored from server)
        this.pageSlugs = {
            home: { tr: '', en: '', ru: '' },
            products: { tr: 'urunler', en: 'products', ru: 'produkty' },
            news: { tr: 'haberler', en: 'news', ru: 'novosti' },
            about: { tr: 'hakkimizda', en: 'about', ru: 'o-nas' },
            dealers: { tr: 'bayiler', en: 'dealers', ru: 'dilery' },
            'dealers-domestic': { tr: 'bayiler/yurt-ici', en: 'dealers/domestic', ru: 'dilery/vnutrennie' },
            'dealers-international': { tr: 'bayiler/yurt-disi', en: 'dealers/international', ru: 'dilery/mezhdunarodnye' },
            contact: { tr: 'iletisim', en: 'contact', ru: 'kontakt' }
        };

        // Product slugs - loaded from API, with fallback values
        this.productSlugs = this.loadCachedProductSlugs() || {
            patlatma: { tr: 'patlatma', en: 'subsoiler', ru: 'glubokorykhlitel' },
            'diskli-kultivator': { tr: 'diskli-kultivator', en: 'disc-cultivator', ru: 'diskovyy-kultivator' },
            'tandem-romork': { tr: 'tandem-romork', en: 'tandem-trailer', ru: 'tandemnyy-pritsep' },
            'dingilli-romork': { tr: 'dingilli-romork', en: 'single-axle-trailer', ru: 'odnoosnyy-pritsep' },
            tiller: { tr: 'tirmik', en: 'tiller', ru: 'pochvoobrabatyvayushchaya-borona' }
        };

        // News slugs - loaded from API
        this.newsSlugs = this.loadCachedNewsSlugs() || {};

        // Get language from URL or page data or localStorage
        this.currentLang = this.detectLanguage();

        // Store in localStorage for consistency
        localStorage.setItem('lang', this.currentLang);

        // Load cached translations immediately (synchronous)
        this.loadCachedTranslations();

        // Fallback: if i18n-ready is not added within 150ms, force show content
        setTimeout(() => {
            if (!document.documentElement.classList.contains('i18n-ready')) {
                document.documentElement.classList.add('i18n-ready');
            }
        }, 150);
    }

    // Load cached product slugs from localStorage
    loadCachedProductSlugs() {
        try {
            const cached = localStorage.getItem('productSlugs_cache');
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            console.warn('Could not load cached product slugs:', e);
        }
        return null;
    }

    // Load cached news slugs from localStorage
    loadCachedNewsSlugs() {
        try {
            const cached = localStorage.getItem('newsSlugs_cache');
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            console.warn('Could not load cached news slugs:', e);
        }
        return null;
    }

    // Fetch and update product slugs from API
    async loadProductSlugs() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();

            // Build slugs object from products
            const slugs = {};
            products.forEach(product => {
                if (product.slug) {
                    slugs[product.id] = product.slug;
                } else {
                    // Fallback to product ID for all languages
                    slugs[product.id] = {
                        tr: product.id,
                        en: product.id,
                        ru: product.id
                    };
                }
            });

            this.productSlugs = slugs;

            // Cache for next page load
            try {
                localStorage.setItem('productSlugs_cache', JSON.stringify(slugs));
            } catch (e) {
                console.warn('Could not cache product slugs:', e);
            }
        } catch (error) {
            console.error('Failed to load product slugs:', error);
        }
    }

    // Fetch and update news slugs from API
    async loadNewsSlugs() {
        try {
            const response = await fetch('/api/news');
            const newsItems = await response.json();

            // Build slugs object from news items
            const slugs = {};
            newsItems.forEach(news => {
                if (news.slug && typeof news.slug === 'object') {
                    slugs[news.id] = news.slug;
                } else if (news.slug) {
                    // If slug is a string (old format), use for all languages
                    slugs[news.id] = {
                        tr: news.slug,
                        en: news.slug,
                        ru: news.slug
                    };
                }
            });

            this.newsSlugs = slugs;

            // Cache for next page load
            try {
                localStorage.setItem('newsSlugs_cache', JSON.stringify(slugs));
            } catch (e) {
                console.warn('Could not cache news slugs:', e);
            }
        } catch (error) {
            console.error('Failed to load news slugs:', error);
        }
    }

    // Detect language from URL or page data
    detectLanguage() {
        // First check if server injected page data
        if (window.__PAGE_DATA__ && window.__PAGE_DATA__.lang) {
            return window.__PAGE_DATA__.lang;
        }

        // Then try to parse from URL
        const langFromUrl = this.getLangFromUrl();
        if (langFromUrl) {
            return langFromUrl;
        }

        // Fall back to localStorage
        return localStorage.getItem('lang') || this.defaultLang;
    }

    // Get language from current URL
    getLangFromUrl() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length > 0 && this.supportedLangs.includes(parts[0])) {
            return parts[0];
        }

        return null;
    }

    // Get current page info from URL
    getCurrentPageInfo() {
        // Use server-injected data if available
        if (window.__PAGE_DATA__) {
            return window.__PAGE_DATA__;
        }

        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length === 0) {
            return { lang: this.defaultLang, pageId: 'home' };
        }

        const lang = this.supportedLangs.includes(parts[0]) ? parts[0] : this.defaultLang;

        if (parts.length === 1) {
            return { lang, pageId: 'home' };
        }

        const pageSlug = parts[1];

        // First, check for nested slugs (e.g., bayiler/yurt-ici)
        if (parts.length >= 3) {
            const nestedPageId = this.getPageIdFromNestedSlug(parts[1], parts[2], lang);
            if (nestedPageId) {
                return { lang, pageId: nestedPageId };
            }
        }

        const pageId = this.getPageIdFromSlug(pageSlug, lang);

        if (parts.length === 2) {
            return { lang, pageId };
        }

        // Detail page
        const detailSlug = parts[2];
        if (pageId === 'products') {
            const productId = this.getProductIdFromSlug(detailSlug, lang);
            return { lang, pageId: 'products', productId, slug: detailSlug };
        }

        return { lang, pageId, slug: detailSlug };
    }

    // Get page ID from slug (supports nested slugs like 'bayiler/yurt-ici')
    getPageIdFromSlug(slug, lang) {
        for (const [pageId, langSlugs] of Object.entries(this.pageSlugs)) {
            if (langSlugs[lang] === slug) {
                return pageId;
            }
        }
        return null;
    }

    // Get page ID from nested slug parts
    getPageIdFromNestedSlug(part1, part2, lang) {
        const nestedSlug = `${part1}/${part2}`;
        return this.getPageIdFromSlug(nestedSlug, lang);
    }

    // Get product ID from slug
    getProductIdFromSlug(slug, lang) {
        for (const [productId, langSlugs] of Object.entries(this.productSlugs)) {
            if (langSlugs[lang] === slug) {
                return productId;
            }
        }
        return null;
    }

    // Get page slug for language
    getPageSlug(pageId, lang) {
        if (this.pageSlugs[pageId] && this.pageSlugs[pageId][lang] !== undefined) {
            return this.pageSlugs[pageId][lang];
        }
        return pageId;
    }

    // Get product slug for language
    getProductSlug(productId, lang) {
        if (this.productSlugs[productId] && this.productSlugs[productId][lang]) {
            return this.productSlugs[productId][lang];
        }
        return productId;
    }

    // Generate localized URL for a page
    getLocalizedUrl(pageId, lang = this.currentLang, params = {}) {
        const pageSlug = this.getPageSlug(pageId, lang);

        if (pageId === 'home') {
            return `/${lang}/`;
        }

        let url = `/${lang}/${pageSlug}`;

        // Handle detail pages
        if (params.productId) {
            const productSlug = this.getProductSlug(params.productId, lang);
            url += `/${productSlug}`;
        } else if (params.productSlug) {
            // Fallback: use provided slug directly
            url += `/${params.productSlug}`;
        } else if (params.newsSlug) {
            url += `/${params.newsSlug}`;
        }

        return url;
    }

    // Get URL for products list
    getProductsUrl(lang = this.currentLang) {
        return this.getLocalizedUrl('products', lang);
    }

    // Get URL for a specific product
    getProductUrl(productId, lang = this.currentLang) {
        return this.getLocalizedUrl('products', lang, { productId });
    }

    // Get URL for news list
    getNewsUrl(lang = this.currentLang) {
        return this.getLocalizedUrl('news', lang);
    }

    // Get URL for a specific news article
    getNewsDetailUrl(newsSlug, lang = this.currentLang) {
        return this.getLocalizedUrl('news', lang, { newsSlug });
    }

    // Get URL for about page
    getAboutUrl(lang = this.currentLang) {
        return this.getLocalizedUrl('about', lang);
    }

    // Get URL for dealers page
    getDealersUrl(lang = this.currentLang) {
        return this.getLocalizedUrl('dealers', lang);
    }

    // Get home URL
    getHomeUrl(lang = this.currentLang) {
        return this.getLocalizedUrl('home', lang);
    }

    // Get URL for switching language on current page
    getSwitchLanguageUrl(newLang) {
        const pageInfo = this.getCurrentPageInfo();

        const params = {};

        // Handle product detail pages
        if (pageInfo.productId) {
            params.productId = pageInfo.productId;
        } else if (pageInfo.slug && pageInfo.pageId === 'products') {
            // Try to find productId from slug in any language
            const foundProductId = this.findProductIdBySlug(pageInfo.slug);
            if (foundProductId) {
                params.productId = foundProductId;
            } else {
                // Keep the same slug if product not found in slugs map
                params.productSlug = pageInfo.slug;
            }
        } else if ((pageInfo.slug || pageInfo.newsSlug) && (pageInfo.pageId === 'news' || pageInfo.pageId === 'news-detail')) {
            // For news, find the news ID from slug and get the translated slug
            const currentNewsSlug = pageInfo.slug || pageInfo.newsSlug;
            const foundNewsId = this.findNewsIdBySlug(currentNewsSlug);
            if (foundNewsId) {
                // Get the slug for the new language
                const translatedSlug = this.getNewsSlug(foundNewsId, newLang);
                if (translatedSlug) {
                    params.newsSlug = translatedSlug;
                } else {
                    // Fallback to current slug if translation not found
                    params.newsSlug = currentNewsSlug;
                }
            } else {
                // Fallback to current slug if news not found
                params.newsSlug = currentNewsSlug;
            }
        }

        // Convert detail page IDs to their parent page IDs for URL generation
        let targetPageId = pageInfo.pageId;
        if (targetPageId === 'product-detail') {
            targetPageId = 'products';
        } else if (targetPageId === 'news-detail') {
            targetPageId = 'news';
        }

        return this.getLocalizedUrl(targetPageId, newLang, params);
    }

    // Find product ID by searching slug in all languages
    findProductIdBySlug(slug) {
        for (const [productId, langSlugs] of Object.entries(this.productSlugs)) {
            for (const [lang, productSlug] of Object.entries(langSlugs)) {
                if (productSlug === slug) {
                    return productId;
                }
            }
        }
        return null;
    }

    // Find news ID by searching slug in all languages
    findNewsIdBySlug(slug) {
        for (const [newsId, langSlugs] of Object.entries(this.newsSlugs)) {
            for (const [lang, newsSlug] of Object.entries(langSlugs)) {
                if (newsSlug === slug) {
                    return newsId;
                }
            }
        }
        return null;
    }

    // Get news slug for a specific language
    getNewsSlug(newsId, lang) {
        if (this.newsSlugs[newsId] && this.newsSlugs[newsId][lang]) {
            return this.newsSlugs[newsId][lang];
        }
        return null;
    }

    // Load translations from localStorage cache immediately
    loadCachedTranslations() {
        try {
            const cached = localStorage.getItem('translations_cache');
            if (cached) {
                this.translations = JSON.parse(cached);
                // Apply immediately if DOM is ready, otherwise wait
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.updatePageLanguage();
                        this.updateLanguageButtons();
                        // Mark as ready - content can be shown
                        document.documentElement.classList.add('i18n-ready');
                    }, { once: true });
                } else {
                    this.updatePageLanguage();
                    this.updateLanguageButtons();
                    // Mark as ready - content can be shown
                    document.documentElement.classList.add('i18n-ready');
                }
            }
        } catch (e) {
            console.warn('Could not load cached translations:', e);
        }
    }

    async init() {
        try {
            // Load translations, product slugs, and news slugs in parallel
            const [translationsResponse] = await Promise.all([
                fetch('/api/translations'),
                this.loadProductSlugs(),
                this.loadNewsSlugs()
            ]);

            this.translations = await translationsResponse.json();

            // Cache translations for next page load
            try {
                localStorage.setItem('translations_cache', JSON.stringify(this.translations));
            } catch (e) {
                console.warn('Could not cache translations:', e);
            }

            this.updatePageLanguage();
            this.setupLanguageSelector();
            this.updateNavigationLinks();

            // Mark as ready - content can be shown
            document.documentElement.classList.add('i18n-ready');
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Even on error, show content (with default language)
            document.documentElement.classList.add('i18n-ready');
        }
    }

    // Change language - navigates to new URL
    setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) return;

        // Navigate to the same page in new language
        const newUrl = this.getSwitchLanguageUrl(lang);
        window.location.href = newUrl;
    }

    t(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Key not found - return defaultValue (even if null) or key as fallback
                if (defaultValue === null) return null;
                return defaultValue || key;
            }
        }

        // Key found - return the value (even if empty string)
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
        // Value is empty/null - use defaultValue or key
        if (defaultValue === null) return null;
        return defaultValue || key;
    }

    updatePageLanguage(scope = document) {
        const root = scope && typeof scope.querySelectorAll === 'function' ? scope : document;
        // Update all elements with data-i18n attribute
        root.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Update all elements with data-i18n-html attribute (for HTML content)
        root.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });

        if (root === document) {
            document.documentElement.lang = this.currentLang;
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
        }
    }

    // Update navigation links to use localized URLs
    updateNavigationLinks() {
        // Update main navigation links
        document.querySelectorAll('[data-nav-page]').forEach(el => {
            const pageId = el.getAttribute('data-nav-page');
            el.href = this.getLocalizedUrl(pageId, this.currentLang);
        });

        // Update product links
        document.querySelectorAll('[data-product-link]').forEach(el => {
            const productId = el.getAttribute('data-product-link');
            el.href = this.getProductUrl(productId);
        });
    }

    setupLanguageSelector() {
        // Handle both desktop (.lang-btn) and mobile (.mobile-lang-btn) language buttons
        const buttons = Array.from(document.querySelectorAll('.lang-btn, .mobile-lang-btn'));
        if (!buttons.length) return;

        const clones = buttons.map(btn => {
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
            return clone;
        });

        this.updateLanguageButtons();

        clones.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    }

    updateLanguageButtons(scope = document) {
        const root = scope && typeof scope.querySelectorAll === 'function' ? scope : document;
        // Handle both desktop (.lang-btn) and mobile (.mobile-lang-btn) language buttons
        root.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            btn.classList.toggle('active', lang === this.currentLang);

            // Update href for SEO-friendly language switching
            btn.href = this.getSwitchLanguageUrl(lang);
        });
    }

    // Get translation for specs
    getSpecLabel(specKey) {
        return this.t(`specs.${specKey}`, specKey);
    }

    // Get category name
    getCategory(categoryKey) {
        return this.t(`categories.${categoryKey}`, categoryKey);
    }

    // Get product name
    getProductName(productId) {
        return this.t(`productNames.${productId}`, productId);
    }

    // Get product short name (for category bar)
    getProductShortName(productId) {
        return this.t(`productShortNames.${productId}`, productId);
    }

    // Get product description
    getProductDescription(productId) {
        return this.t(`productDescriptions.${productId}`, '');
    }

    // Get product features array
    getProductFeatures(productId) {
        const products = this.translations[this.currentLang]?.products;
        if (products && products[productId] && products[productId].features) {
            return products[productId].features;
        }
        return [];
    }

    // Get product technical info object
    getProductTechnical(productId) {
        const products = this.translations[this.currentLang]?.products;
        if (products && products[productId] && products[productId].technical) {
            return products[productId].technical;
        }
        return {};
    }

    // Get product rollers object
    getProductRollers(productId) {
        const products = this.translations[this.currentLang]?.products;
        if (products && products[productId] && products[productId].rollers) {
            return products[productId].rollers;
        }
        return {};
    }

    // Get technical label
    getTechnicalLabel(key) {
        return this.t(`technicalLabels.${key}`, key);
    }

    // Get model spec label
    getModelSpecLabel(key) {
        return this.t(`modelSpecs.${key}`, key);
    }

    // Get spec label (for product specs) - checks specLabels, specs, and modelSpecs
    getSpecLabel(key) {
        // First try specLabels (for admin-added specs)
        const specLabelAdmin = this.t(`specLabels.${key}`, null);
        if (specLabelAdmin) return specLabelAdmin;

        // Then try specs translations (for product-level specs like workingWidth, discCount)
        const specLabel = this.t(`specs.${key}`, null);
        if (specLabel) return specLabel;

        // Then try modelSpecs translations (for model-level specs like width, power)
        const modelSpecLabel = this.t(`modelSpecs.${key}`, null);
        if (modelSpecLabel) return modelSpecLabel;

        // Fallback to key itself
        return key;
    }
}

// Create global instance
window.i18n = new I18n();

// Apply saved language to buttons immediately (for first visit with no cache)
(function () {
    const currentLang = window.i18n.currentLang;
    // Update buttons immediately (both desktop and mobile)
    document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        if (lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Also run on DOMContentLoaded for buttons not yet in DOM
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            btn.classList.toggle('active', lang === currentLang);
        });
    }, { once: true });
})();

// Initialize on DOM ready - fetch fresh translations
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
});
