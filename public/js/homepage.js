// Homepage JavaScript - Focofirm Style
let homepageData = null;
let allProducts = [];
let allNews = [];
let currentLang = 'tr';

// Initialize homepage
document.addEventListener('DOMContentLoaded', async () => {
    currentLang = window.i18n?.currentLang || 'tr';
    await loadHomepageData();
    await loadProducts();
    await loadNews();
    renderHomepage();
    setupEventListeners();
});

// Listen for language changes
window.addEventListener('languageChanged', (e) => {
    currentLang = e.detail.lang;
    renderHomepage();
});

// Load homepage data from API
async function loadHomepageData() {
    try {
        const response = await fetch('/api/homepage');
        homepageData = await response.json();
    } catch (error) {
        console.error('Error loading homepage data:', error);
    }
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        allProducts = Array.isArray(data) ? data : (data.products || []);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load news from API
async function loadNews() {
    try {
        const response = await fetch('/api/news');
        allNews = await response.json();
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Render all homepage sections
function renderHomepage() {
    if (!homepageData) return;

    renderHero();
    renderFeaturedProducts();
    renderBlog();
    renderStats();
    renderCTA();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Blog navigation removed - always shows 3 items
}

// Get localized link
function getLocalizedLink(link) {
    if (!link) return '#';
    const lang = currentLang;

    const pathMap = {
        '/urunler': { tr: '/tr/urunler', en: '/en/products', ru: '/ru/produkty' },
        '/hakkimizda': { tr: '/tr/hakkimizda', en: '/en/about', ru: '/ru/o-nas' },
        '/bayiler': { tr: '/tr/bayiler', en: '/en/dealers', ru: '/ru/dilery' },
        '/haberler': { tr: '/tr/haberler', en: '/en/news', ru: '/ru/novosti' },
        '/iletisim': { tr: '/tr/iletisim', en: '/en/contact', ru: '/ru/kontakt' }
    };

    for (const [path, localizedPaths] of Object.entries(pathMap)) {
        if (link.startsWith(path)) {
            return link.replace(path, localizedPaths[lang] || localizedPaths.tr);
        }
    }

    return link;
}

// Render Hero Section (Agriplot Style)
function renderHero() {
    const heroSection = document.getElementById('heroSection');
    if (!heroSection || !homepageData?.hero) return;

    // Set background image if available (only if different to prevent flicker)
    const heroBgImage = document.getElementById('heroBgImage');
    if (heroBgImage && homepageData.hero.backgroundImage) {
        const newSrc = `/images/homepage/${homepageData.hero.backgroundImage}`;
        if (!heroBgImage.src.endsWith(newSrc)) {
            heroBgImage.src = newSrc;
        }
    }

    // Set badge text
    const heroBadgeText = document.getElementById('heroBadgeText');
    if (heroBadgeText) {
        heroBadgeText.textContent = homepageData.hero.badge?.[currentLang] || homepageData.hero.badge?.tr || '';
    }

    // Set title
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) {
        heroTitle.textContent = homepageData.hero.title?.[currentLang] || homepageData.hero.title?.tr || '';
    }

    // Set description
    const heroDesc = document.getElementById('heroDesc');
    if (heroDesc) {
        heroDesc.textContent = homepageData.hero.description?.[currentLang] || homepageData.hero.description?.tr || '';
    }

    // Set primary button
    const heroPrimaryBtn = document.getElementById('heroPrimaryBtn');
    if (heroPrimaryBtn) {
        heroPrimaryBtn.textContent = homepageData.hero.primaryButton?.text?.[currentLang] || homepageData.hero.primaryButton?.text?.tr || '';
        // Support both old format (single link) and new format (language-specific links)
        const primaryLink = homepageData.hero.primaryButton?.link;
        if (typeof primaryLink === 'object') {
            heroPrimaryBtn.href = primaryLink[currentLang] || primaryLink.tr || '/urunler';
        } else {
            heroPrimaryBtn.href = getLocalizedLink(primaryLink || '/urunler');
        }
    }

    // Set secondary button
    const heroSecondaryBtn = document.getElementById('heroSecondaryBtn');
    if (heroSecondaryBtn) {
        heroSecondaryBtn.textContent = homepageData.hero.secondaryButton?.text?.[currentLang] || homepageData.hero.secondaryButton?.text?.tr || '';
        // Support both old format (single link) and new format (language-specific links)
        const secondaryLink = homepageData.hero.secondaryButton?.link;
        if (typeof secondaryLink === 'object') {
            heroSecondaryBtn.href = secondaryLink[currentLang] || secondaryLink.tr || '/iletisim';
        } else {
            heroSecondaryBtn.href = getLocalizedLink(secondaryLink || '/iletisim');
        }
    }
}

// Render Partners Section
function renderPartners() {
    const partnersSlider = document.getElementById('partnersSlider');
    if (!partnersSlider) return;

    // Get partners from data or use placeholders
    const partners = homepageData?.partners || [
        { name: 'Partner 1', logo: 'partner1.png' },
        { name: 'Partner 2', logo: 'partner2.png' },
        { name: 'Partner 3', logo: 'partner3.png' },
        { name: 'Partner 4', logo: 'partner4.png' },
        { name: 'Partner 5', logo: 'partner5.png' }
    ];

    partnersSlider.innerHTML = partners.map(partner => `
        <img src="/images/partners/${partner.logo}" alt="${partner.name}" class="focofirm-partner-logo" onerror="this.style.display='none'">
    `).join('');
}

// Render Video Section
function renderVideo() {
    const videoPlayer = document.getElementById('videoPlayer');
    if (!videoPlayer) return;

    const videoUrl = homepageData?.video?.url || homepageData?.newsSection?.videoUrl;

    if (videoUrl) {
        const videoId = getYouTubeVideoId(videoUrl);
        if (videoId) {
            videoPlayer.innerHTML = `
                <div class="video-thumbnail" id="videoThumbnail">
                    <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Video" onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'">
                    <div class="focofirm-video-play-btn" onclick="playVideo('${videoId}')">
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                </div>
            `;
        } else {
            // Direct video URL
            videoPlayer.innerHTML = `
                <video controls poster="/images/homepage/video-poster.jpg">
                    <source src="${videoUrl}" type="video/mp4">
                </video>
            `;
        }
    } else {
        // Placeholder
        videoPlayer.innerHTML = `
            <div class="video-placeholder" style="background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="/images/homepage/video-placeholder.jpg" alt="Video" style="max-width: 100%; max-height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML='<p style=color:#999>Video yakında eklenecek</p>'">
            </div>
        `;
    }
}

// Play YouTube video
window.playVideo = function(videoId) {
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
        videoPlayer.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style="width: 100%; height: 100%; min-height: 400px;">
            </iframe>
        `;
    }
};

// Get YouTube video ID from URL
function getYouTubeVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

// Render Blog/News Section - Always shows 3 news items
function renderBlog() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    let newsToShow = [];

    // Check if homepage has custom selected news
    if (homepageData?.blog?.selectedNews && Array.isArray(homepageData.blog.selectedNews) && homepageData.blog.selectedNews.length > 0) {
        // Use custom selected news from admin panel
        const selectedIds = homepageData.blog.selectedNews;
        newsToShow = allNews.filter(news => selectedIds.includes(news.id)).slice(0, 3);
        
        // If not enough selected news, fill with latest news
        if (newsToShow.length < 3) {
            const sortedNews = allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
            const missing = 3 - newsToShow.length;
            const alreadyShownIds = newsToShow.map(n => n.id);
            const additionalNews = sortedNews.filter(news => !alreadyShownIds.includes(news.id)).slice(0, missing);
            newsToShow = [...newsToShow, ...additionalNews];
        }
    } else {
        // Use latest 3 news
        const sortedNews = allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
        newsToShow = sortedNews.slice(0, 3);
    }

    if (newsToShow.length === 0) {
        blogGrid.innerHTML = '<p class="no-news">Henüz haber bulunmuyor.</p>';
        return;
    }

    const moreText = currentLang === 'tr' ? 'DAHA FAZLA' : currentLang === 'ru' ? 'ПОДРОБНЕЕ' : 'LEARN MORE';

    blogGrid.innerHTML = newsToShow.map(news => {
        const title = news.title?.[currentLang] || news.title?.tr || '';
        const summary = news.summary?.[currentLang] || news.summary?.tr || '';
        const newsUrl = window.i18n?.getNewsDetailUrl(news.slug?.[currentLang] || news.id, currentLang) || `/haberler/${news.slug?.[currentLang] || news.id}`;
        const image = news.image ? `/images/news/${news.image}` : '/images/ayermak.png';

        return `
            <a href="${newsUrl}" class="focofirm-blog-card">
                <div class="focofirm-blog-card-image">
                    <img src="${image}" alt="${title}" loading="lazy">
                </div>
                <div class="focofirm-blog-card-content">
                    <h3 class="focofirm-blog-card-title">${title}</h3>
                    <p class="focofirm-blog-card-desc">${summary}</p>
                    <span class="focofirm-blog-card-link">${moreText} <span>↗</span></span>
                </div>
            </a>
        `;
    }).join('');
}

// Render Featured Products - New Holland Style
function renderFeaturedProducts() {
    const grid = document.getElementById('featuredProductsGrid');
    const section = document.getElementById('featuredProductsSection');
    if (!grid || !section) return;

    if (!homepageData?.featuredProducts?.enabled) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // Set header texts
    const title = document.getElementById('featuredTitle');
    const subtitle = document.getElementById('featuredSubtitle');

    if (title) title.textContent = homepageData.featuredProducts.title?.[currentLang] || homepageData.featuredProducts.title?.tr || '';
    if (subtitle) subtitle.textContent = homepageData.featuredProducts.subtitle?.[currentLang] || homepageData.featuredProducts.subtitle?.tr || '';

    // Update view all button link
    const viewAllBtn = document.getElementById('viewAllProductsBtn');
    if (viewAllBtn) {
        viewAllBtn.href = getLocalizedLink('/urunler');
        // Update button text
        const btnText = viewAllBtn.querySelector('span');
        if (btnText) {
            btnText.textContent = currentLang === 'tr' ? 'Tümü' : currentLang === 'ru' ? 'Все' : 'All';
        }
    }

    // Get featured products - Fixed at 3 products
    const productIds = homepageData.featuredProducts.productIds || [];
    const showMax = 3; // Fixed at 3 products

    const featuredProducts = productIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, showMax);

    const viewText = currentLang === 'tr' ? 'Detaylı İncele' : currentLang === 'ru' ? 'Подробнее' : 'View Details';

    grid.innerHTML = featuredProducts.map(product => {
        const productName = window.i18n?.getProductName(product.id) || product.slug?.[currentLang] || product.id;
        const productDesc = window.i18n?.t(`productDescriptions.${product.id}`) || '';
        const productUrl = window.i18n?.getProductUrl(product.id, currentLang) || `/urunler/${product.slug?.[currentLang] || product.id}`;
        const image = product.defaultImage ? `/images/products/${product.defaultImage}` : '/images/ayermak.png';

        return `
            <a href="${productUrl}" class="focofirm-product-card">
                <div class="focofirm-product-image">
                    <img src="${image}" alt="${productName}" loading="lazy">
                </div>
                <div class="focofirm-product-content">
                    <h3 class="focofirm-product-name">${productName}</h3>
                    <p class="focofirm-product-desc">${productDesc}</p>
                    <span class="focofirm-product-link">
                        <span class="link-text">${viewText}</span>
                        <span class="link-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </span>
                    </span>
                </div>
            </a>
        `;
    }).join('');
}

// Render Stats Section
function renderStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    const stats = homepageData?.companyBanner?.stats || [
        { value: '35+', label: { tr: 'Yıl Tecrübe', en: 'Years Experience', ru: 'Лет опыта' } },
        { value: '5000+', label: { tr: 'Üretilen Makine', en: 'Machines Produced', ru: 'Произведено машин' } },
        { value: '25+', label: { tr: 'İhracat Ülkesi', en: 'Export Countries', ru: 'Стран экспорта' } }
    ];

    statsGrid.innerHTML = stats.map((stat, index) => `
        <div class="homepage-stat-card">
            <div class="homepage-stat-value" data-target="${stat.value}">0</div>
            <div class="homepage-stat-label">${stat.label?.[currentLang] || stat.label?.tr || ''}</div>
        </div>
    `).join('');

    // Start counting animation when stats are visible
    animateStats();
}

// Animate stats counting
function animateStats() {
    const statValues = document.querySelectorAll('.homepage-stat-value');
    if (!statValues.length) return;

    // Check if stats section is in viewport
    const statsSection = document.getElementById('statsSection');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statValues.forEach((el, index) => {
                    const targetValue = el.dataset.target;
                    if (targetValue && !el.dataset.animated) {
                        el.dataset.animated = 'true';
                        animateValue(el, targetValue, index * 200); // Stagger animation
                    }
                });
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
}

// Animate a single stat value
function animateValue(element, targetValue, delay = 0) {
    setTimeout(() => {
        // Extract number and suffix (e.g., "35+" -> 35 and "+")
        const match = targetValue.match(/(\d+)(.*)/);
        if (!match) {
            element.textContent = targetValue;
            return;
        }

        const targetNumber = parseInt(match[1]);
        const suffix = match[2] || '';
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = targetNumber / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.floor(increment * step), targetNumber);
            element.textContent = current + suffix;

            if (step >= steps) {
                clearInterval(timer);
                element.textContent = targetNumber + suffix;
            }
        }, duration / steps);
    }, delay);
}

// Render CTA Section
function renderCTA() {
    const ctaSection = document.getElementById('contactCtaSection');
    if (!ctaSection || !homepageData?.cta) return;

    // Hide section if disabled
    if (!homepageData.cta.enabled) {
        ctaSection.style.display = 'none';
        return;
    }
    ctaSection.style.display = 'block';

    // Set title
    const ctaTitle = document.getElementById('ctaTitle');
    if (ctaTitle) {
        ctaTitle.textContent = homepageData.cta.title?.[currentLang] || homepageData.cta.title?.tr || '';
    }

    // Set text
    const ctaText = document.getElementById('ctaText');
    if (ctaText) {
        ctaText.textContent = homepageData.cta.text?.[currentLang] || homepageData.cta.text?.tr || '';
    }

    // Set button
    const ctaBtn = document.getElementById('ctaBtn');
    if (ctaBtn) {
        ctaBtn.textContent = homepageData.cta.buttonText?.[currentLang] || homepageData.cta.buttonText?.tr || '';
        // Support both old format (single link) and new format (language-specific links)
        const ctaLink = homepageData.cta.buttonLink;
        if (typeof ctaLink === 'object') {
            ctaBtn.href = ctaLink[currentLang] || ctaLink.tr || '/iletisim';
        } else {
            ctaBtn.href = getLocalizedLink(ctaLink || '/iletisim');
        }
    }
}
