(function () {
    const API_BASE = '/api';
    let aboutData = null;
    let homepageData = null;
    let currentLang = 'tr';
    let currentSlideIndex = 0;
    let slideInterval = null;
    const SLIDE_DURATION = 5000; // 5 seconds

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        // Get current language from i18n module
        currentLang = window.i18n?.currentLang || localStorage.getItem('lang') || 'tr';

        // Listen for language changes
        window.addEventListener('languageChanged', (e) => {
            currentLang = e.detail.lang;
            renderPage();
        });

        await Promise.all([loadAboutData(), loadHomepageData()]);
        renderPage();
        initSlider();
        lucide.createIcons();
    }

    async function loadAboutData() {
        try {
            const response = await fetch(`${API_BASE}/about`);
            aboutData = await response.json();
        } catch (error) {
            console.error('Hakkimizda verisi yuklenemedi:', error);
            aboutData = null;
        }
    }

    async function loadHomepageData() {
        try {
            const response = await fetch(`${API_BASE}/homepage`);
            homepageData = await response.json();
        } catch (error) {
            console.error('Homepage verisi yuklenemedi:', error);
            homepageData = null;
        }
    }

    let sliderInitialized = false;
    let firstRender = true;

    function renderPage() {
        if (!aboutData) return;

        renderHero();
        renderStory();
        renderFeaturesHeader();
        renderFeatures();
        renderStats();
        renderCTA();
        lucide.createIcons();

        // Show hidden content after rendering
        document.querySelectorAll('.about-content-hidden').forEach(el => {
            el.classList.add('visible');
        });

        // Only init animations on first render
        if (firstRender) {
            initAnimations();
            firstRender = false;
        }
    }

    function renderHero() {
        const badge = document.getElementById('heroBadge');
        const title = document.getElementById('heroTitle');
        const subtitle = document.getElementById('heroSubtitle');

        if (badge) badge.textContent = aboutData.hero?.badge?.[currentLang] || aboutData.hero?.badge?.tr || 'HAKKIMIZDA';
        if (title) title.textContent = aboutData.hero?.title?.[currentLang] || aboutData.hero?.title?.tr || 'AyErmak Tarim Urunleri';
        if (subtitle) subtitle.textContent = aboutData.hero?.subtitle?.[currentLang] || aboutData.hero?.subtitle?.tr || '';
    }

    function renderStory() {
        // Story Header (badge & title)
        const storyBadge = document.getElementById('storyBadge');
        const storyTitle = document.getElementById('storyTitle');

        if (storyBadge) storyBadge.textContent = aboutData.story?.badge?.[currentLang] || aboutData.story?.badge?.tr || 'HİKAYEMİZ';
        if (storyTitle) storyTitle.textContent = aboutData.story?.title?.[currentLang] || aboutData.story?.title?.tr || 'Dünyanın Her Yerindeyiz';

        // Gallery Slider - Only render once (images don't need translation)
        if (!sliderInitialized) {
            const gallery = aboutData.story?.gallery || [];
            const sliderContainer = document.getElementById('gallerySlider');
            const indicatorsContainer = document.getElementById('galleryIndicators');

            if (sliderContainer && gallery.length > 0) {
                // Create slides
                sliderContainer.innerHTML = gallery.map((img, index) => `
                    <div class="gallery-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                        <img src="/images/about/${img}" alt="AyErmak ${index + 1}">
                    </div>
                `).join('');

                // Create indicators
                if (indicatorsContainer && gallery.length > 1) {
                    indicatorsContainer.innerHTML = gallery.map((_, index) => `
                        <div class="gallery-indicator ${index === 0 ? 'active' : ''}"
                             data-index="${index}"
                             onclick="window.goToSlide(${index})"></div>
                    `).join('');
                }

                sliderInitialized = true;
            }
        }

        // Paragraphs
        const paragraphsContainer = document.getElementById('storyParagraphs');
        const paragraphs = aboutData.story?.paragraphs || [];

        if (paragraphsContainer) {
            paragraphsContainer.innerHTML = paragraphs.map(p => `
                <p class="fade-in-up visible">${p[currentLang] || p.tr || ''}</p>
            `).join('');
        }
    }

    function renderFeatures() {
        const container = document.getElementById('featuresGrid');
        const features = aboutData.features || [];

        if (!container) return;

        container.innerHTML = features.map((feature, index) => `
            <div class="about-feature-card fade-in-up visible" style="transition-delay: ${index * 0.1}s">
                <div class="about-feature-icon">
                    <i data-lucide="${feature.icon || 'star'}"></i>
                </div>
                <h3>${feature.title?.[currentLang] || feature.title?.tr || ''}</h3>
                <p>${feature.description?.[currentLang] || feature.description?.tr || ''}</p>
            </div>
        `).join('');

        lucide.createIcons();
    }

    function renderStats() {
        const container = document.getElementById('statsGrid');
        if (!container) return;

        // Use homepage stats data (same as homepage)
        const stats = homepageData?.companyBanner?.stats || [
            { value: '35+', label: { tr: 'Yıl Tecrübe', en: 'Years Experience', ru: 'Лет опыта' } },
            { value: '5000+', label: { tr: 'Üretilen Makine', en: 'Machines Produced', ru: 'Произведено машин' } },
            { value: '25+', label: { tr: 'İhracat Ülkesi', en: 'Export Countries', ru: 'Стран экспорта' } }
        ];

        container.innerHTML = stats.map((stat, index) => `
            <div class="homepage-stat-card">
                <div class="homepage-stat-value" data-target="${stat.value}">0</div>
                <div class="homepage-stat-label">${stat.label?.[currentLang] || stat.label?.tr || ''}</div>
            </div>
        `).join('');

        // Start counting animation when stats are visible
        animateStats();
    }

    function animateStats() {
        const statValues = document.querySelectorAll('.homepage-stat-value');
        if (!statValues.length) return;

        const statsSection = document.querySelector('.homepage-stats');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statValues.forEach((el, index) => {
                        const targetValue = el.dataset.target;
                        if (targetValue && !el.dataset.animated) {
                            el.dataset.animated = 'true';
                            animateValue(el, targetValue, index * 200);
                        }
                    });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    function animateValue(element, targetValue, delay = 0) {
        setTimeout(() => {
            const match = targetValue.match(/(\d+)(.*)/);
            if (!match) {
                element.textContent = targetValue;
                return;
            }

            const targetNumber = parseInt(match[1]);
            const suffix = match[2] || '';
            const duration = 2000;
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

    function renderFeaturesHeader() {
        const badge = document.getElementById('featuresBadge');
        const title = document.getElementById('featuresTitle');

        const badgeText = aboutData.featuresHeader?.badge?.[currentLang] || aboutData.featuresHeader?.badge?.tr || 'POLİTİKAMIZ';
        const titleText = aboutData.featuresHeader?.title?.[currentLang] || aboutData.featuresHeader?.title?.tr || 'Neden';
        const highlightText = aboutData.featuresHeader?.titleHighlight?.[currentLang] || aboutData.featuresHeader?.titleHighlight?.tr || 'AyErmak?';

        if (badge) badge.textContent = badgeText;
        if (title) title.innerHTML = `${titleText} <span>${highlightText}</span>`;
    }

    function renderCTA() {
        const title = document.getElementById('ctaTitle');
        const text = document.getElementById('ctaText');
        const buttonText = document.getElementById('ctaButtonText');

        if (title) title.textContent = aboutData.cta?.title?.[currentLang] || aboutData.cta?.title?.tr || 'Ürünlerimizi Keşfedin';
        if (text) text.textContent = aboutData.cta?.text?.[currentLang] || aboutData.cta?.text?.tr || 'Tarım makineleri ihtiyaçlarınız için doğru çözümü bulun.';
        if (buttonText) buttonText.textContent = aboutData.cta?.button?.[currentLang] || aboutData.cta?.button?.tr || 'Tüm Ürünler';
    }

    function initSlider() {
        const gallery = aboutData?.story?.gallery || [];
        if (gallery.length <= 1) return;

        // Start auto slide
        startAutoSlide();

        // Pause on hover
        const sliderContainer = document.getElementById('gallerySlider');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', stopAutoSlide);
            sliderContainer.addEventListener('mouseleave', startAutoSlide);
        }

        // Global function to go to specific slide
        window.goToSlide = function (index) {
            goToSlide(index);
            // Restart auto slide timer
            stopAutoSlide();
            startAutoSlide();
        };
    }

    function startAutoSlide() {
        const gallery = aboutData?.story?.gallery || [];
        if (gallery.length <= 1) return;

        slideInterval = setInterval(() => {
            const nextIndex = (currentSlideIndex + 1) % gallery.length;
            goToSlide(nextIndex);
        }, SLIDE_DURATION);
    }

    function stopAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    function goToSlide(index) {
        const slides = document.querySelectorAll('.gallery-slide');
        const indicators = document.querySelectorAll('.gallery-indicator');

        if (slides.length === 0) return;

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        currentSlideIndex = index;
    }

    function initAnimations() {
        // Scroll-triggered fade-in animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        setTimeout(() => {
            document.querySelectorAll('.fade-in-up').forEach(el => {
                observer.observe(el);
            });
        }, 100);
    }

})();
