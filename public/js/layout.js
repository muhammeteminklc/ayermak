const COMPONENT_FALLBACKS = {
    header: `
<header class="header header-premium">
    <div class="header-container">
        <a href="/" class="logo" data-nav-page="home">
            <img src="/images/ayermak.png" alt="AYERMAK Logo" width="1100" height="310" loading="eager" decoding="async">
        </a>
        <nav class="nav-menu nav-menu-center">
            <div class="nav-links">
                <a href="/" class="nav-link" data-nav-page="home" data-i18n="nav.home">Anasayfa</a>
                <div class="nav-dropdown">
                    <a href="/tr/urunler" class="nav-link has-dropdown" data-nav-page="products" data-i18n="nav.products">
                        Ürünler
                        <svg class="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <div class="mega-dropdown">
                        <div class="mega-categories">
                            <a href="/tr/urunler/patlatma" class="mega-category active" data-category="patlatma">
                                <span data-i18n="categories.patlatma">Patlatma</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                            <a href="/tr/urunler/kultivator" class="mega-category" data-category="kultivator">
                                <span data-i18n="categories.kultivator">Kültüvatör</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                            <a href="/tr/urunler/romork" class="mega-category" data-category="romork">
                                <span data-i18n="categories.romork">Römork</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                            <a href="/tr/urunler/tiller" class="mega-category" data-category="tiller">
                                <span data-i18n="categories.tiller">Tiller</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                            <a href="/tr/urunler/lazer-tesfiye" class="mega-category" data-category="lazer-tesfiye">
                                <span data-i18n="categories.lazer-tesfiye">Lazer Tesfiye</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                            <a href="/tr/urunler/goble-diskaro" class="mega-category" data-category="goble-diskaro">
                                <span data-i18n="categories.goble-diskaro">Goble Diskaro</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </a>
                            <a href="/tr/urunler" class="mega-view-all">
                                <span data-i18n="nav.allProducts">Tüm Ürünler</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </a>
                        </div>
                        <div class="mega-products">
                            <div class="mega-product-list active" data-products="patlatma">
                                <a href="/tr/urunler/patlatma" class="mega-product-item">
                                    <img src="/images/products/ürün1.png" alt="Patlatma">
                                    <span data-i18n="productNames.patlatma">Patlatma</span>
                                </a>
                            </div>
                            <div class="mega-product-list" data-products="kultivator">
                                <a href="/tr/urunler/diskli-kultivator" class="mega-product-item">
                                    <img src="/images/products/ürün2.png" alt="Diskli Kültüvatör">
                                    <span data-i18n="productNames.diskli-kultivator">Diskli Kültüvatör</span>
                                </a>
                            </div>
                            <div class="mega-product-list" data-products="romork">
                                <a href="/tr/urunler/tandem-romork" class="mega-product-item">
                                    <img src="/images/products/ürün3.png" alt="Tandem Römork">
                                    <span data-i18n="productShortNames.tandem-romork">Tandem Römork</span>
                                </a>
                                <a href="/tr/urunler/dingilli-romork" class="mega-product-item">
                                    <img src="/images/products/ürün4.png" alt="Dingilli Römork">
                                    <span data-i18n="productShortNames.dingilli-romork">Dingilli Römork</span>
                                </a>
                            </div>
                            <div class="mega-product-list" data-products="tiller">
                                <a href="/tr/urunler/tiller" class="mega-product-item">
                                    <img src="/images/products/tiller.png" alt="Tiller">
                                    <span data-i18n="productNames.tiller">Tiller</span>
                                </a>
                            </div>
                            <div class="mega-product-list" data-products="lazer-tesfiye">
                                <a href="/tr/urunler/lazer-tesfiye" class="mega-product-item">
                                    <img src="/images/products/lazer-tesfiye.png" alt="Lazer Tesfiye">
                                    <span data-i18n="productNames.lazer-tesfiye">Lazer Tesfiye</span>
                                </a>
                            </div>
                            <div class="mega-product-list" data-products="goble-diskaro">
                                <a href="/tr/urunler/goble-diskaro" class="mega-product-item">
                                    <img src="/images/products/goble-diskaro.png" alt="Goble Diskaro">
                                    <span data-i18n="productNames.goble-diskaro">Goble Diskaro</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-dropdown dealers-nav-dropdown">
                    <a href="/tr/bayiler/yurt-ici" class="nav-link has-dropdown" data-nav-page="dealers-domestic" data-i18n="nav.dealers">
                        Bayilerimiz
                        <svg class="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <div class="dealers-dropdown">
                        <a href="/tr/bayiler/yurt-ici" class="dealers-dropdown-item" data-nav-page="dealers-domestic">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span data-i18n="nav.dealersDomestic">Yurt İçi Bayiler</span>
                        </a>
                        <a href="/tr/bayiler/yurt-disi" class="dealers-dropdown-item" data-nav-page="dealers-international">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            <span data-i18n="nav.dealersInternational">Yurt Dışı Bayiler</span>
                        </a>
                    </div>
                </div>
                <a href="/tr/hakkimizda" class="nav-link" data-nav-page="about" data-i18n="nav.about">Hakkımızda</a>
                <a href="/tr/haberler" class="nav-link" data-nav-page="news" data-i18n="nav.news">Haberler</a>
                <a href="/tr/iletisim" class="nav-link" data-nav-page="contact" data-i18n="nav.contact">İletişim</a>
            </div>
            <div class="mobile-lang-selector">
                <div class="mobile-lang-buttons">
                    <a href="/tr/" class="mobile-lang-btn" data-lang="tr" title="Türkçe">🇹🇷</a>
                    <a href="/en/" class="mobile-lang-btn" data-lang="en" title="English">🇬🇧</a>
                    <a href="/ru/" class="mobile-lang-btn" data-lang="ru" title="Русский">🇷🇺</a>
                </div>
            </div>
        </nav>
        <div class="header-right">
            <div class="language-selector">
                <a href="/tr/" class="lang-btn" data-lang="tr" title="Türkçe">🇹🇷</a>
                <a href="/en/" class="lang-btn" data-lang="en" title="English">🇬🇧</a>
                <a href="/ru/" class="lang-btn" data-lang="ru" title="Русский">🇷🇺</a>
            </div>
        </div>
        <button class="mobile-menu-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>
<div class="mobile-overlay"></div>`.trim()
};

bootstrapComponent('header-placeholder', 'header');
bootstrapComponent('footer-placeholder', 'footer');

document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header-placeholder', '/components/header.html', 'header');
    await loadComponent('footer-placeholder', '/components/footer.html', 'footer');

    // Initialize functionality after loading
    initNavigation();
    initMobileMenu();
    initMobilePanelMenu();
    initLanguageSelector();
    initHeaderScroll();
    initMegaMenu();

    // Load footer content from API
    await loadFooterContent();

    // Trigger Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

async function loadComponent(placeholderId, url, cacheKey) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    const storageKey = cacheKey ? `component:${cacheKey}` : null;

    const applyHtml = (html) => {
        if (!html) return;
        const signature = createMarkupSignature(html);
        const previousSignature = placeholder.dataset.templateSignature;
        const domChanged = signature !== previousSignature;

        if (domChanged) {
            placeholder.innerHTML = html;
            placeholder.dataset.templateSignature = signature;
        }

        if (window.i18n) {
            window.i18n.updatePageLanguage(placeholder);
            window.i18n.updateLanguageButtons(placeholder);
        }

        if (cacheKey) {
            rehydrateComponent(cacheKey, placeholder, domChanged);
        }
    };

    if (storageKey) {
        const cachedHtml = sessionStorage.getItem(storageKey);
        if (cachedHtml) {
            applyHtml(cachedHtml);
        } else if (COMPONENT_FALLBACKS[cacheKey]) {
            applyHtml(COMPONENT_FALLBACKS[cacheKey]);
        }
    }

    try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        const html = await response.text();

        applyHtml(html);

        if (storageKey) {
            sessionStorage.setItem(storageKey, html);
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

function bootstrapComponent(placeholderId, cacheKey) {
    if (!cacheKey) return;

    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    const storageKey = `component:${cacheKey}`;
    let html = null;

    try {
        html = sessionStorage.getItem(storageKey);
    } catch (error) {
        console.warn(`Component cache unavailable for ${cacheKey}:`, error);
    }

    if (!html && COMPONENT_FALLBACKS[cacheKey]) {
        html = COMPONENT_FALLBACKS[cacheKey];
    }

    if (!html) return;

    const signature = createMarkupSignature(html);
    if (placeholder.dataset.templateSignature === signature) {
        return;
    }

    placeholder.innerHTML = html;
    placeholder.dataset.templateSignature = signature;

    if (window.i18n) {
        window.i18n.updatePageLanguage(placeholder);
        window.i18n.updateLanguageButtons(placeholder);
    }
}

function createMarkupSignature(html) {
    return html ? html.replace(/\s+/g, ' ').trim() : '';
}

function rehydrateComponent(key, scope, domChanged) {
    if (key !== 'header') return;

    initNavigation();

    if (domChanged) {
        initMobileMenu();
        initMobilePanelMenu();
        initHeaderScroll();
        initMegaMenu();
        window.__langSelectorBound = false;
    }

    if (window.i18n) {
        if (!window.__langSelectorBound) {
            initLanguageSelector();
            window.__langSelectorBound = true;
        } else {
            window.i18n.updateLanguageButtons(scope);
        }
    }
}

function initNavigation() {
    // Update navigation links with localized URLs
    if (window.i18n) {
        window.i18n.updateNavigationLinks();
    }

    // Get current page info
    const pageInfo = window.i18n?.getCurrentPageInfo() || { pageId: 'home' };
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const navPage = link.getAttribute('data-nav-page');
        link.classList.remove('active');

        // Check if this nav link matches current page
        if (navPage === pageInfo.pageId) {
            link.classList.add('active');
        }
        // Products detail page should highlight products nav
        else if ((pageInfo.pageId === 'products' || pageInfo.pageId === 'product-detail') && navPage === 'products') {
            link.classList.add('active');
        }
        // News detail page should highlight news nav
        else if ((pageInfo.pageId === 'news' || pageInfo.pageId === 'news-detail') && navPage === 'news') {
            link.classList.add('active');
        }
    });
}

function normalizePath(path) {
    if (!path || path === '') return '/';
    // Handle i18n URLs
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return '/';
    // Return the page part without language prefix
    if (['tr', 'en', 'ru'].includes(parts[0])) {
        return parts.length > 1 ? `/${parts.slice(1).join('/')}` : '/';
    }
    return path;
}

function initMobileMenu() {
    // Yeni panel menü sistemi varsa bu fonksiyon çalışmasın
    const panelMenu = document.querySelector('.mobile-menu-container');
    if (panelMenu) return;

    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu-center') || document.querySelector('.nav-menu');
    const overlay = document.querySelector('.mobile-overlay');

    if (!menuBtn || !navMenu) return;

    // Toggle menu function
    const toggleMenu = (open) => {
        const isOpen = open !== undefined ? open : !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isOpen);
        menuBtn.classList.toggle('active', isOpen);
        if (overlay) overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    // Hamburger button click
    menuBtn.addEventListener('click', () => toggleMenu());

    // Overlay click - close menu
    if (overlay) {
        overlay.addEventListener('click', () => toggleMenu(false));
    }

    // Close menu when clicking nav links (except dropdown trigger)
    const navLinks = navMenu.querySelectorAll('.nav-link:not(.has-dropdown)');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                toggleMenu(false);
            }
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu(false);
        }
    });
}

function initLanguageSelector() {
    if (window.i18n) {
        window.i18n.setupLanguageSelector();
    }
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    if (window.__headerScrollHandler) {
        window.removeEventListener('scroll', window.__headerScrollHandler);
    }

    const handler = () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            header.classList.add('scrolled');
            document.body.classList.add('header-scrolled');
        } else {
            header.classList.remove('scrolled');
            document.body.classList.remove('header-scrolled');
        }
    };

    window.__headerScrollHandler = handler;
    window.addEventListener('scroll', handler);
    handler();
}

// Mega Dropdown Menu Initialization
function initMegaMenu() {
    const navDropdown = document.querySelector('.nav-dropdown');

    // Products Mega Dropdown
    if (navDropdown) {
        const categories = navDropdown.querySelectorAll('.mega-category');
        const productLists = navDropdown.querySelectorAll('.mega-product-list');
        const dropdownLink = navDropdown.querySelector('.has-dropdown');

        // Update mega menu images from products.json
        updateMegaMenuImages();

        // Category hover - show related products
        categories.forEach(category => {
            category.addEventListener('mouseenter', () => {
                const targetCategory = category.dataset.category;

                // Update active category
                categories.forEach(c => c.classList.remove('active'));
                category.classList.add('active');

                // Show related products
                productLists.forEach(list => {
                    list.classList.remove('active');
                    if (list.dataset.products === targetCategory) {
                        list.classList.add('active');
                    }
                });
            });
        });

        // Mobile: Toggle dropdown on click
        if (dropdownLink) {
            dropdownLink.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    navDropdown.classList.toggle('open');
                }
            });
        }

        // Close dropdown when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && navDropdown) {
                if (!navDropdown.contains(e.target)) {
                    navDropdown.classList.remove('open');
                }
            }
        });
    }

}

// Build mega menu dynamically from products API
async function updateMegaMenuImages() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) return;

        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);

        // Sort products by order
        products.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Group products by category
        const categories = {};
        const categoryOrder = [];

        products.forEach(product => {
            const cat = product.category || 'other';
            if (!categories[cat]) {
                categories[cat] = [];
                categoryOrder.push(cat);
            }
            categories[cat].push(product);
        });

        // Build desktop mega menu
        buildDesktopMegaMenu(categories, categoryOrder, products);

        // Build mobile menu panels
        buildMobilePanelMenu(categories, categoryOrder, products);

        // Update navigation links and apply translations
        if (window.i18n) {
            window.i18n.updateNavigationLinks();
            window.i18n.updatePageLanguage();
        }

    } catch (error) {
        console.warn('Could not build dynamic menu:', error);
    }
}

// Build desktop mega dropdown menu
function buildDesktopMegaMenu(categories, categoryOrder, products) {
    const megaCategories = document.querySelector('.mega-categories');
    const megaProducts = document.querySelector('.mega-products');

    if (!megaCategories || !megaProducts) return;

    const lang = window.i18n?.currentLang || 'tr';
    const productsSlug = window.i18n?.getPageSlug('products', lang) || 'urunler';

    // Build categories list
    let categoriesHtml = '';
    categoryOrder.forEach((cat, index) => {
        const isActive = index === 0 ? ' active' : '';
        const categoryName = window.i18n?.t(`categories.${cat}`) || cat;
        const productSlug = window.i18n?.getProductSlug(cat, lang) || cat;

        categoriesHtml += `
            <a href="/${lang}/${productsSlug}/${productSlug}" class="mega-category${isActive}" data-category="${cat}">
                <span data-i18n="categories.${cat}">${categoryName}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </a>
        `;
    });

    // Add "All Products" link
    const allProductsText = window.i18n?.t('nav.allProducts') || 'Tüm Ürünler';
    categoriesHtml += `
        <a href="/${lang}/${productsSlug}" class="mega-view-all">
            <span data-i18n="nav.allProducts">${allProductsText}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        </a>
    `;

    megaCategories.innerHTML = categoriesHtml;

    // Build products lists for each category
    let productsHtml = '';
    categoryOrder.forEach((cat, index) => {
        const isActive = index === 0 ? ' active' : '';
        const categoryProducts = categories[cat];

        let productItems = '';
        categoryProducts.forEach(product => {
            const productName = window.i18n?.t(`productNames.${product.id}`) ||
                               window.i18n?.t(`productShortNames.${product.id}`) ||
                               product.id;
            const productSlug = window.i18n?.getProductSlug(product.id, lang) || product.id;
            const imgPath = product.defaultImage ? `/images/products/${product.defaultImage}` : '/images/products/placeholder.png';

            productItems += `
                <a href="/${lang}/${productsSlug}/${productSlug}" class="mega-product-item" data-product-id="${product.id}">
                    <img src="${imgPath}" alt="${productName}" loading="lazy">
                    <span data-i18n="productNames.${product.id}">${productName}</span>
                </a>
            `;
        });

        productsHtml += `
            <div class="mega-product-list${isActive}" data-products="${cat}">
                ${productItems}
            </div>
        `;
    });

    megaProducts.innerHTML = productsHtml;

    // Re-initialize category hover behavior
    initMegaCategoryHover();
}

// Initialize mega menu category hover behavior
function initMegaCategoryHover() {
    const navDropdown = document.querySelector('.nav-dropdown');
    if (!navDropdown) return;

    const categories = navDropdown.querySelectorAll('.mega-category');
    const productLists = navDropdown.querySelectorAll('.mega-product-list');

    categories.forEach(category => {
        category.addEventListener('mouseenter', () => {
            const targetCategory = category.dataset.category;

            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');

            productLists.forEach(list => {
                list.classList.remove('active');
                if (list.dataset.products === targetCategory) {
                    list.classList.add('active');
                }
            });
        });
    });
}

// Build mobile panel menu dynamically
function buildMobilePanelMenu(categories, categoryOrder, products) {
    const container = document.querySelector('.mobile-menu-container');
    if (!container) return;

    const lang = window.i18n?.currentLang || 'tr';
    const productsSlug = window.i18n?.getPageSlug('products', lang) || 'urunler';

    // Find or create the products panel
    let productsPanel = container.querySelector('[data-panel="products"]');
    if (!productsPanel) return;

    const panelContent = productsPanel.querySelector('.mobile-panel-content');
    if (!panelContent) return;

    // Build category buttons
    let buttonsHtml = '';
    categoryOrder.forEach(cat => {
        const categoryName = window.i18n?.t(`categories.${cat}`) || cat;
        buttonsHtml += `
            <button class="mobile-menu-item has-submenu" data-target="cat-${cat}">
                <span data-i18n="categories.${cat}">${categoryName}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        `;
    });

    // Add "View All Products" link
    buttonsHtml += `
        <a href="/${lang}/${productsSlug}" class="mobile-menu-item mobile-view-all">
            <span data-i18n="homepage.viewAllProducts">Tüm Ürünleri Gör</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        </a>
    `;

    panelContent.innerHTML = buttonsHtml;

    // Build/update category panels
    categoryOrder.forEach(cat => {
        const categoryProducts = categories[cat];
        const categoryName = window.i18n?.t(`categories.${cat}`) || cat;
        const categorySlug = window.i18n?.getProductSlug(cat, lang) || cat;

        let panelEl = container.querySelector(`[data-panel="cat-${cat}"]`);

        // Build product links for this category
        let productLinks = '';
        categoryProducts.forEach(product => {
            const productName = window.i18n?.t(`productNames.${product.id}`) ||
                               window.i18n?.t(`productShortNames.${product.id}`) ||
                               product.id;
            const productSlug = window.i18n?.getProductSlug(product.id, lang) || product.id;

            productLinks += `
                <a href="/${lang}/${productsSlug}/${productSlug}" class="mobile-menu-item" data-product-id="${product.id}">
                    <span data-i18n="productNames.${product.id}">${productName}</span>
                </a>
            `;
        });

        // Add "View All" link for this category
        productLinks += `
            <a href="/${lang}/${productsSlug}/${categorySlug}" class="mobile-menu-item mobile-view-all">
                <span data-i18n="homepage.viewAll">Tümünü Gör</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </a>
        `;

        if (panelEl) {
            // Update existing panel
            const content = panelEl.querySelector('.mobile-panel-content');
            if (content) content.innerHTML = productLinks;

            // Update title
            const title = panelEl.querySelector('.mobile-panel-title');
            if (title) {
                title.textContent = categoryName;
                title.setAttribute('data-i18n', `categories.${cat}`);
            }
        } else {
            // Create new panel
            const panelHtml = `
                <div class="mobile-panel" data-panel="cat-${cat}">
                    <div class="mobile-panel-header">
                        <button class="mobile-back-btn" data-target="products">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            <span>Geri</span>
                        </button>
                        <span class="mobile-panel-title" data-i18n="categories.${cat}">${categoryName}</span>
                    </div>
                    <div class="mobile-panel-content">
                        ${productLinks}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', panelHtml);
        }
    });

    // Remove old category panels that no longer exist
    const existingPanels = container.querySelectorAll('[data-panel^="cat-"]');
    existingPanels.forEach(panel => {
        const panelCat = panel.dataset.panel.replace('cat-', '');
        if (!categoryOrder.includes(panelCat)) {
            panel.remove();
        }
    });

    // Re-initialize mobile panel event handlers
    reinitMobilePanelHandlers();
}

// Re-initialize mobile panel event handlers after dynamic update
function reinitMobilePanelHandlers() {
    const container = document.querySelector('.mobile-menu-container');
    if (!container) return;

    const panels = container.querySelectorAll('.mobile-panel');
    const submenuBtns = container.querySelectorAll('.has-submenu');
    const backBtns = container.querySelectorAll('.mobile-back-btn');

    const showPanel = (panelName) => {
        panels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.dataset.panel === panelName) {
                panel.classList.add('active');
            }
        });
    };

    // Submenu buttons
    submenuBtns.forEach(btn => {
        // Remove existing listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = newBtn.dataset.target;
            if (target) showPanel(target);
        });
    });

    // Back buttons
    backBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = newBtn.dataset.target;
            if (target) showPanel(target);
        });
    });

    // Link clicks close menu
    container.querySelectorAll('a.mobile-menu-item').forEach(link => {
        link.addEventListener('click', () => {
            container.classList.remove('active');
            document.body.style.overflow = '';
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (menuBtn) menuBtn.classList.remove('active');
        });
    });
}

// Yeni Drill-Down Mobil Menü Sistemi
function initMobilePanelMenu() {
    const container = document.querySelector('.mobile-menu-container');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    if (!container || !menuBtn) return;

    // Zaten init edilmişse event listener ekleme
    if (menuBtn.dataset.panelInit === 'true') return;
    menuBtn.dataset.panelInit = 'true';

    const overlay = container.querySelector('.mobile-overlay');
    const panels = container.querySelectorAll('.mobile-panel');
    const closeBtn = container.querySelector('.mobile-close-btn');
    const backBtns = container.querySelectorAll('.mobile-back-btn');
    const submenuBtns = container.querySelectorAll('.has-submenu');

    // Menüyü aç/kapat
    const toggleMenu = (open) => {
        const currentBtn = document.querySelector('.mobile-menu-btn');
        const isOpen = open !== undefined ? open : !container.classList.contains('active');

        container.classList.toggle('active', isOpen);
        if (currentBtn) currentBtn.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';

        if (isOpen) {
            showPanel('main');
        } else {
            // Menü kapandığında tüm panelleri kapat
            panels.forEach(panel => panel.classList.remove('active'));
        }
    };

    // Panel göster
    const showPanel = (panelName) => {
        panels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.dataset.panel === panelName) {
                panel.classList.add('active');
            }
        });
    };

    // Hamburger tıklama
    menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Kapat butonu
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu(false);
        });
    }

    // Overlay tıklama - menüyü kapat
    if (overlay) {
        overlay.addEventListener('click', () => toggleMenu(false));
    }

    // Alt menü butonları
    submenuBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.dataset.target;
            if (target) showPanel(target);
        });
    });

    // Geri butonları
    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.dataset.target;
            if (target) showPanel(target);
        });
    });

    // Link tıklamalarında menüyü kapat
    container.querySelectorAll('a.mobile-menu-item').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // Dil butonları
    container.querySelectorAll('.mobile-lang-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleMenu(false));
    });

    // Escape tuşu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && container.classList.contains('active')) {
            toggleMenu(false);
        }
    });
}

// Load footer content from API
async function loadFooterContent() {
    try {
        const response = await fetch('/api/footer');
        if (!response.ok) return;
        const data = await response.json();
        renderFooterContent(data);
    } catch (error) {
        console.error('Error loading footer content:', error);
    }
}

function renderFooterContent(data) {
    const lang = window.i18n?.currentLang || 'tr';
    const year = new Date().getFullYear();

    // Social icons SVG
    const socialIcons = {
        facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
    };

    // Company description
    const descEl = document.getElementById('footerDescription');
    if (descEl && data.companyInfo?.description) {
        descEl.textContent = data.companyInfo.description[lang] || data.companyInfo.description.tr || '';
    }

    // Social links
    const socialEl = document.getElementById('footerSocial');
    if (socialEl && data.socialLinks?.enabled !== false && data.socialLinks?.items?.length) {
        socialEl.innerHTML = data.socialLinks.items
            .filter(item => item.enabled !== false && item.url)
            .map(item => `
                <a href="${item.url}" class="footer-social-link" target="_blank" rel="noopener noreferrer" aria-label="${item.name}">
                    ${socialIcons[item.icon] || socialIcons.facebook}
                </a>
            `).join('');
    }

    // Menu sections
    const menusEl = document.getElementById('footerMenus');
    if (menusEl && data.menuSections?.length) {
        menusEl.innerHTML = data.menuSections.map(section => `
            <div class="footer-menu">
                <h4 class="footer-menu-title">${section.title?.[lang] || section.title?.tr || ''}</h4>
                <ul class="footer-menu-list">
                    ${(section.links || []).map(link => {
                        const url = link.navPage && window.i18n 
                            ? window.i18n.getLocalizedUrl(link.navPage, lang)
                            : '/' + lang + link.url;
                        return '<li><a href="' + url + '" class="footer-menu-link">' + (link.text?.[lang] || link.text?.tr || '') + '</a></li>';
                    }).join('')}
                </ul>
            </div>
        `).join('');
    }

    // Contact info
    const contactEl = document.getElementById('footerContact');
    if (contactEl && data.contactInfo?.enabled !== false) {
        const contactLabels = {
            tr: 'İletişim',
            en: 'Contact',
            ru: 'Контакты'
        };

        let contactHtml = '<h4 class="footer-menu-title">' + contactLabels[lang] + '</h4>';
        contactHtml += '<ul class="footer-contact-list">';

        if (data.contactInfo.address?.[lang]) {
            contactHtml += `
                <li class="footer-contact-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${data.contactInfo.address[lang]}</span>
                </li>
            `;
        }

        // Support multiple phones
        if (data.contactInfo.phones && data.contactInfo.phones.length > 0) {
            data.contactInfo.phones.forEach(phone => {
                const label = phone.label?.[lang] || phone.label?.tr || '';
                contactHtml += `
                    <li class="footer-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <div style="display:flex;flex-direction:column;">
                            ${label ? `<small style="font-size:11px;color:#999;margin-bottom:2px;">${label}</small>` : ''}
                            <a href="tel:${phone.number.replace(/\s/g, '')}">${phone.number}</a>
                        </div>
                    </li>
                `;
            });
        } else if (data.contactInfo.phone) {
            // Backward compatibility with old phone string format
            contactHtml += `
                <li class="footer-contact-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <a href="tel:${data.contactInfo.phone.replace(/\s/g, '')}">${data.contactInfo.phone}</a>
                </li>
            `;
        }

        if (data.contactInfo.email) {
            contactHtml += `
                <li class="footer-contact-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <a href="mailto:${data.contactInfo.email}">${data.contactInfo.email}</a>
                </li>
            `;
        }

        contactHtml += '</ul>';
        contactEl.innerHTML = contactHtml;
    }

    // Copyright
    const copyrightEl = document.getElementById('footerCopyright');
    if (copyrightEl && data.copyright?.text) {
        const text = (data.copyright.text[lang] || data.copyright.text.tr || '')
            .replace('{year}', year);
        copyrightEl.textContent = text;
    }

    // Legal links
    const legalEl = document.getElementById('footerLegal');
    if (legalEl && data.legalLinks?.enabled !== false && data.legalLinks?.items?.length) {
        legalEl.innerHTML = data.legalLinks.items.map(item => 
            '<a href="/' + lang + item.url + '" class="footer-legal-link">' + (item.text?.[lang] || item.text?.tr || '') + '</a>'
        ).join('');
    }
}

// Re-render footer when language changes
window.addEventListener('languageChanged', () => {
    loadFooterContent();
});
