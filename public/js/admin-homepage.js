// Admin Homepage Management - Wrapped in IIFE to avoid conflicts
(function() {
    'use strict';

    let homepageData = null;
    let allProducts = [];
    let allNews = [];
    let editingSlideId = null;
    let currentSlideImage = null;
    let currentProductSlideImage = null;
    let currentNewsSlideImage = null;
    let draggedItem = null;

    // Featured products limit
    const MAX_FEATURED_PRODUCTS = 3;

    // Initialize
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('Admin Homepage initializing...');

        try {
            renderAdminSidebar(document.getElementById('adminSidebar'));

            // Load all data first
            await loadHomepageData();
            await loadProducts();
            await loadNews();

            // Then populate form and render everything
            populateForm();

            lucide.createIcons();
            setupEventListeners();

            console.log('Admin Homepage initialized successfully');
        } catch (error) {
            console.error('Error initializing admin homepage:', error);
        }
    });

    // Setup event listeners
    function setupEventListeners() {
        // Hero image upload
        const heroUpload = document.getElementById('heroImageUpload');
        const heroInput = document.getElementById('heroImageInput');
        if (heroUpload && heroInput) {
            heroUpload.addEventListener('click', () => heroInput.click());
            heroInput.addEventListener('change', handleHeroImageUpload);
        }

        const slideUpload = document.getElementById('slideImageUpload');
        const slideInput = document.getElementById('slideImageInput');
        if (slideUpload && slideInput) {
            slideUpload.addEventListener('click', () => slideInput.click());
            slideInput.addEventListener('change', handleSlideImageUpload);
        }

        // Product slide image upload
        const productSlideUpload = document.getElementById('productSlideImageUpload');
        const productSlideInput = document.getElementById('productSlideImageInput');
        if (productSlideUpload && productSlideInput) {
            productSlideUpload.addEventListener('click', () => productSlideInput.click());
            productSlideInput.addEventListener('change', handleProductSlideImageUpload);
        }

        // News slide image upload
        const newsSlideUpload = document.getElementById('newsSlideImageUpload');
        const newsSlideInput = document.getElementById('newsSlideImageInput');
        if (newsSlideUpload && newsSlideInput) {
            newsSlideUpload.addEventListener('click', () => newsSlideInput.click());
            newsSlideInput.addEventListener('change', handleNewsSlideImageUpload);
        }
    }

    // Load homepage data
    async function loadHomepageData() {
        try {
            const response = await fetch('/api/homepage');
            homepageData = await response.json();
            console.log('Homepage data loaded:', homepageData ? 'success' : 'empty');
        } catch (error) {
            console.error('Error loading homepage data:', error);
            showToast('Veri yuklenirken hata olustu', 'error');
        }
    }

    // Load products for selector
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            allProducts = Array.isArray(data) ? data : (data.products || []);
            console.log('Products loaded:', allProducts.length);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Load news for selector
    async function loadNews() {
        try {
            const response = await fetch('/api/news');
            allNews = await response.json();
            console.log('News loaded:', allNews.length);
        } catch (error) {
            console.error('Error loading news:', error);
        }
    }

    // Populate form with data
    function populateForm() {
        if (!homepageData) return;

        // Hero settings (new agriplot style)
        document.getElementById('heroBadgeTr').value = homepageData.hero?.badge?.tr || '';
        document.getElementById('heroBadgeEn').value = homepageData.hero?.badge?.en || '';
        document.getElementById('heroBadgeRu').value = homepageData.hero?.badge?.ru || '';
        document.getElementById('heroTitleTr').value = homepageData.hero?.title?.tr || '';
        document.getElementById('heroTitleEn').value = homepageData.hero?.title?.en || '';
        document.getElementById('heroTitleRu').value = homepageData.hero?.title?.ru || '';
        document.getElementById('heroDescTr').value = homepageData.hero?.description?.tr || '';
        document.getElementById('heroDescEn').value = homepageData.hero?.description?.en || '';
        document.getElementById('heroDescRu').value = homepageData.hero?.description?.ru || '';
        document.getElementById('heroPrimaryBtnTr').value = homepageData.hero?.primaryButton?.text?.tr || '';
        document.getElementById('heroPrimaryBtnEn').value = homepageData.hero?.primaryButton?.text?.en || '';
        document.getElementById('heroPrimaryBtnRu').value = homepageData.hero?.primaryButton?.text?.ru || '';
        document.getElementById('heroPrimaryBtnLinkTr').value = homepageData.hero?.primaryButton?.link?.tr || '/urunler';
        document.getElementById('heroPrimaryBtnLinkEn').value = homepageData.hero?.primaryButton?.link?.en || '/en/products';
        document.getElementById('heroPrimaryBtnLinkRu').value = homepageData.hero?.primaryButton?.link?.ru || '/ru/products';
        document.getElementById('heroSecondaryBtnTr').value = homepageData.hero?.secondaryButton?.text?.tr || '';
        document.getElementById('heroSecondaryBtnEn').value = homepageData.hero?.secondaryButton?.text?.en || '';
        document.getElementById('heroSecondaryBtnRu').value = homepageData.hero?.secondaryButton?.text?.ru || '';
        document.getElementById('heroSecondaryBtnLinkTr').value = homepageData.hero?.secondaryButton?.link?.tr || '/iletisim';
        document.getElementById('heroSecondaryBtnLinkEn').value = homepageData.hero?.secondaryButton?.link?.en || '/en/contact';
        document.getElementById('heroSecondaryBtnLinkRu').value = homepageData.hero?.secondaryButton?.link?.ru || '/ru/contact';
        renderHeroImage();

        // Featured Products
        document.getElementById('featuredProductsEnabled').checked = homepageData.featuredProducts?.enabled !== false;
        document.getElementById('featuredBadgeTr').value = homepageData.featuredProducts?.badge?.tr || '';
        document.getElementById('featuredBadgeEn').value = homepageData.featuredProducts?.badge?.en || '';
        document.getElementById('featuredBadgeRu').value = homepageData.featuredProducts?.badge?.ru || '';
        document.getElementById('featuredTitleTr').value = homepageData.featuredProducts?.title?.tr || '';
        document.getElementById('featuredTitleEn').value = homepageData.featuredProducts?.title?.en || '';
        document.getElementById('featuredTitleRu').value = homepageData.featuredProducts?.title?.ru || '';
        document.getElementById('featuredSubtitleTr').value = homepageData.featuredProducts?.subtitle?.tr || '';
        document.getElementById('featuredSubtitleEn').value = homepageData.featuredProducts?.subtitle?.en || '';
        document.getElementById('featuredSubtitleRu').value = homepageData.featuredProducts?.subtitle?.ru || '';

        // Company Stats
        renderCompanyStats();

        // News Section
        document.getElementById('newsSectionEnabled').checked = homepageData.newsSection?.enabled !== false;
        document.getElementById('newsBadgeTr').value = homepageData.newsSection?.badge?.tr || '';
        document.getElementById('newsBadgeEn').value = homepageData.newsSection?.badge?.en || '';
        document.getElementById('newsBadgeRu').value = homepageData.newsSection?.badge?.ru || '';
        document.getElementById('newsTitleTr').value = homepageData.newsSection?.title?.tr || '';
        document.getElementById('newsTitleEn').value = homepageData.newsSection?.title?.en || '';
        document.getElementById('newsTitleRu').value = homepageData.newsSection?.title?.ru || '';

        // Blog Settings
        const blogMode = homepageData.blog?.displayMode || 'latest';
        document.getElementById('blogDisplayMode').value = blogMode;
        toggleBlogSelectionMode();

        // Load selected news if custom mode
        if (blogMode === 'custom' && homepageData.blog?.selectedNews) {
            loadBlogNewsList(homepageData.blog.selectedNews);
        } else {
            loadBlogNewsList([]);
        }

        // Render products and news selectors
        renderProductsSelector();
        populateProductSelect();
        populateNewsSelect();

        console.log('Form populated successfully');
    }

    // Render slides
    function renderSlides() {
        const container = document.getElementById('slidesContainer');
        if (!container || !homepageData?.hero?.slides) return;

        const slides = homepageData.hero.slides.sort((a, b) => a.order - b.order);

        container.innerHTML = slides.map(slide => {
            let title = '';
            let subtitle = '';
            let previewImage = '';
            let typeBadge = '';

            if (slide.type === 'custom') {
                title = slide.title?.tr || 'Ozel Icerik';
                subtitle = slide.subtitle?.tr || '';
                previewImage = slide.image ? `/images/homepage/${slide.image}` : '';
                typeBadge = '<span class="slide-type-badge custom">Ozel</span>';
            } else if (slide.type === 'product') {
                const product = allProducts.find(p => p.id === slide.productId);
                title = product ? (product.slug?.tr || slide.productId) : slide.productId;
                subtitle = 'Urun tanitimi';
                previewImage = product?.defaultImage ? `/images/products/${product.defaultImage}` : '';
                typeBadge = '<span class="slide-type-badge product">Urun</span>';
            } else if (slide.type === 'news') {
                if (slide.newsId === 'auto-latest') {
                    title = 'Son Haber (Otomatik)';
                    subtitle = 'Her zaman en guncel haber gosterilir';
                } else {
                    const news = allNews.find(n => n.id === slide.newsId);
                    title = news?.title?.tr || slide.newsId;
                    subtitle = 'Haber tanitimi';
                    previewImage = news?.image ? `/images/news/${news.image}` : '';
                }
                typeBadge = '<span class="slide-type-badge news">Haber</span>';
            }

            return `
                <div class="slide-item" data-slide-id="${slide.id}" draggable="true">
                    <div class="slide-drag-handle">
                        <i data-lucide="grip-vertical"></i>
                    </div>
                    <div class="slide-preview">
                        ${previewImage ? `<img src="${previewImage}" alt="">` : '<div class="slide-preview-placeholder"><i data-lucide="image"></i></div>'}
                    </div>
                    <div class="slide-info">
                        ${typeBadge}
                        <div class="slide-title">${title}</div>
                        <div class="slide-subtitle">${subtitle}</div>
                    </div>
                    <div class="slide-actions">
                        <button onclick="editSlide('${slide.id}')" title="Duzenle">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="delete" onclick="deleteSlide('${slide.id}')" title="Sil">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
        setupDragAndDrop();
    }

    // Setup drag and drop for slides
    function setupDragAndDrop() {
        const container = document.getElementById('slidesContainer');
        if (!container) return;
        const items = container.querySelectorAll('.slide-item');

        items.forEach(item => {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragend', handleDragEnd);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
        });
    }

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        if (draggedItem && draggedItem !== this) {
            const container = document.getElementById('slidesContainer');
            const items = [...container.querySelectorAll('.slide-item')];
            const draggedIndex = items.indexOf(draggedItem);
            const targetIndex = items.indexOf(this);

            if (draggedIndex < targetIndex) {
                this.parentNode.insertBefore(draggedItem, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedItem, this);
            }

            const newOrder = [...container.querySelectorAll('.slide-item')].map((item, index) => ({
                id: item.dataset.slideId,
                order: index + 1
            }));

            newOrder.forEach(({ id, order }) => {
                const slide = homepageData.hero.slides.find(s => s.id === id);
                if (slide) slide.order = order;
            });
        }
    }

    // Render Products Selector
    function renderProductsSelector() {
        const container = document.getElementById('productsSelector');
        if (!container) return;

        const selectedIds = homepageData?.featuredProducts?.productIds || [];

        container.innerHTML = allProducts.map(product => {
            const isSelected = selectedIds.includes(product.id);
            const name = product.slug?.tr || product.id;
            const image = product.defaultImage ? `/images/products/${product.defaultImage}` : '';

            return `
                <label class="product-checkbox-item ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleFeaturedProduct('${product.id}', this.checked)">
                    ${image ? `<img src="${image}" alt="${name}">` : '<div style="width:48px;height:48px;background:#f0f0f0;border-radius:8px;"></div>'}
                    <span>${name}</span>
                </label>
            `;
        }).join('');

        // Update selection counter
        updateProductSelectionCounter();
    }

    function toggleFeaturedProduct(productId, checked) {
        if (!homepageData.featuredProducts.productIds) {
            homepageData.featuredProducts.productIds = [];
        }

        const currentCount = homepageData.featuredProducts.productIds.length;

        if (checked) {
            // Check max limit
            if (currentCount >= MAX_FEATURED_PRODUCTS) {
                showToast(`Maksimum ${MAX_FEATURED_PRODUCTS} ürün seçilebilir`, 'warning');
                const checkbox = document.querySelector(`[data-product-id="${productId}"] input`);
                if (checkbox) checkbox.checked = false;
                return;
            }
            if (!homepageData.featuredProducts.productIds.includes(productId)) {
                homepageData.featuredProducts.productIds.push(productId);
            }
        } else {
            homepageData.featuredProducts.productIds = homepageData.featuredProducts.productIds.filter(id => id !== productId);
        }

        const item = document.querySelector(`[data-product-id="${productId}"]`);
        if (item) {
            item.classList.toggle('selected', checked);
        }

        updateProductSelectionCounter();
    }

    function updateProductSelectionCounter() {
        const counter = document.getElementById('productSelectionCounter');
        if (counter) {
            const count = homepageData.featuredProducts?.productIds?.length || 0;
            counter.textContent = `${count}/${MAX_FEATURED_PRODUCTS} seçili`;
            counter.classList.toggle('at-limit', count >= MAX_FEATURED_PRODUCTS);
        }
    }

    // Render Hero Image
    function renderHeroImage() {
        const container = document.getElementById('heroImagePreview');
        if (!container) return;

        const image = homepageData?.hero?.backgroundImage;
        if (image) {
            container.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="/images/homepage/${image}" alt="" style="max-width: 300px; border-radius: 8px;">
                    <button onclick="removeHeroImage()" style="position: absolute; top: 4px; right: 4px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">
                        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            `;
            lucide.createIcons();
        } else {
            container.innerHTML = '';
        }
    }

    async function handleHeroImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/homepage/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                homepageData.hero.backgroundImage = result.filename;
                renderHeroImage();
                showToast('Gorsel yuklendi', 'success');
            } else {
                showToast(result.error || 'Yukleme hatasi', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Yukleme hatasi', 'error');
        }
    }

    function removeHeroImage() {
        homepageData.hero.backgroundImage = '';
        renderHeroImage();
    }

    // Render Company Stats
    function renderCompanyStats() {
        const container = document.getElementById('companyStatsList');
        if (!container) return;

        const stats = homepageData?.companyBanner?.stats || [];

        container.innerHTML = stats.map((stat, index) => `
            <div class="stat-item">
                <input type="text" value="${stat.value || ''}" placeholder="35+" onchange="updateCompanyStat(${index}, 'value', this.value)">
                <input type="text" value="${stat.label?.tr || ''}" placeholder="Yil Tecrube" onchange="updateCompanyStatLang(${index}, 'tr', this.value)">
                <input type="text" value="${stat.label?.en || ''}" placeholder="Years" onchange="updateCompanyStatLang(${index}, 'en', this.value)">
                <input type="text" value="${stat.label?.ru || ''}" placeholder="Let" onchange="updateCompanyStatLang(${index}, 'ru', this.value)">
                <button onclick="removeCompanyStat(${index})" style="padding: 8px; background: #dc3545; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');

        lucide.createIcons();
    }

    function addCompanyStat() {
        if (!homepageData.companyBanner.stats) {
            homepageData.companyBanner.stats = [];
        }
        // Maximum 3 stats allowed
        if (homepageData.companyBanner.stats.length >= 3) {
            if (window.toast) {
                window.toast.error('Maksimum 3 istatistik eklenebilir');
            } else {
                alert('Maksimum 3 istatistik eklenebilir');
            }
            return;
        }
        homepageData.companyBanner.stats.push({
            value: '',
            label: { tr: '', en: '', ru: '' }
        });
        renderCompanyStats();
    }

    function updateCompanyStat(index, field, value) {
        if (homepageData?.companyBanner?.stats?.[index]) {
            homepageData.companyBanner.stats[index][field] = value;
        }
    }

    function updateCompanyStatLang(index, lang, value) {
        if (homepageData?.companyBanner?.stats?.[index]) {
            if (!homepageData.companyBanner.stats[index].label) {
                homepageData.companyBanner.stats[index].label = { tr: '', en: '', ru: '' };
            }
            homepageData.companyBanner.stats[index].label[lang] = value;
        }
    }

    function removeCompanyStat(index) {
        if (homepageData?.companyBanner?.stats) {
            homepageData.companyBanner.stats.splice(index, 1);
            renderCompanyStats();
        }
    }

    // Populate Product Select in Modal
    function populateProductSelect() {
        const select = document.getElementById('slideProductSelect');
        if (!select) return;

        select.innerHTML = allProducts.map(product => {
            const name = product.slug?.tr || product.id;
            return `<option value="${product.id}">${name}</option>`;
        }).join('');
    }

    // Populate News Select in Modal
    function populateNewsSelect() {
        const select = document.getElementById('slideNewsSelect');
        if (!select) return;

        let options = '<option value="auto-latest">Son Haber (Otomatik)</option>';
        options += allNews.map(news => {
            const title = news.title?.tr || news.id;
            return `<option value="${news.id}">${title}</option>`;
        }).join('');

        select.innerHTML = options;
    }

    // Slide Modal Functions
    function openSlideModal(slideId = null) {
        editingSlideId = slideId;
        currentSlideImage = null;

        const modal = document.getElementById('slideModal');
        const title = document.getElementById('slideModalTitle');

        if (slideId) {
            title.textContent = 'Slide Duzenle';
            const slide = homepageData.hero.slides.find(s => s.id === slideId);
            if (slide) {
                selectSlideType(slide.type);

                if (slide.type === 'custom') {
                    document.getElementById('slideTitleTr').value = slide.title?.tr || '';
                    document.getElementById('slideTitleEn').value = slide.title?.en || '';
                    document.getElementById('slideTitleRu').value = slide.title?.ru || '';
                    document.getElementById('slideSubtitleTr').value = slide.subtitle?.tr || '';
                    document.getElementById('slideSubtitleEn').value = slide.subtitle?.en || '';
                    document.getElementById('slideSubtitleRu').value = slide.subtitle?.ru || '';
                    document.getElementById('slideButtonTr').value = slide.buttonText?.tr || '';
                    document.getElementById('slideButtonEn').value = slide.buttonText?.en || '';
                    document.getElementById('slideButtonRu').value = slide.buttonText?.ru || '';
                    document.getElementById('slideButtonLink').value = slide.buttonLink || '';
                    currentSlideImage = slide.image || null;
                    renderSlideImagePreview();
                } else if (slide.type === 'product') {
                    document.getElementById('slideProductSelect').value = slide.productId || '';

                    // Load override data if exists
                    if (slide.override) {
                        document.getElementById('productOverrideEnabled').checked = true;
                        document.getElementById('productOverrideFields').style.display = 'block';

                        currentProductSlideImage = slide.customImage || null;
                        renderProductSlideImagePreview();

                        document.getElementById('productSlideTitleTr').value = slide.title?.tr || '';
                        document.getElementById('productSlideTitleEn').value = slide.title?.en || '';
                        document.getElementById('productSlideTitleRu').value = slide.title?.ru || '';
                        document.getElementById('productSlideSubtitleTr').value = slide.subtitle?.tr || '';
                        document.getElementById('productSlideSubtitleEn').value = slide.subtitle?.en || '';
                        document.getElementById('productSlideSubtitleRu').value = slide.subtitle?.ru || '';
                        document.getElementById('productSlideButtonTr').value = slide.buttonText?.tr || '';
                        document.getElementById('productSlideButtonEn').value = slide.buttonText?.en || '';
                        document.getElementById('productSlideButtonRu').value = slide.buttonText?.ru || '';
                    }
                } else if (slide.type === 'news') {
                    document.getElementById('slideNewsSelect').value = slide.newsId || 'auto-latest';

                    // Load override data if exists
                    if (slide.override) {
                        document.getElementById('newsOverrideEnabled').checked = true;
                        document.getElementById('newsOverrideFields').style.display = 'block';

                        currentNewsSlideImage = slide.customImage || null;
                        renderNewsSlideImagePreview();

                        document.getElementById('newsSlideTitleTr').value = slide.title?.tr || '';
                        document.getElementById('newsSlideTitleEn').value = slide.title?.en || '';
                        document.getElementById('newsSlideTitleRu').value = slide.title?.ru || '';
                        document.getElementById('newsSlideSubtitleTr').value = slide.subtitle?.tr || '';
                        document.getElementById('newsSlideSubtitleEn').value = slide.subtitle?.en || '';
                        document.getElementById('newsSlideSubtitleRu').value = slide.subtitle?.ru || '';
                        document.getElementById('newsSlideButtonTr').value = slide.buttonText?.tr || '';
                        document.getElementById('newsSlideButtonEn').value = slide.buttonText?.en || '';
                        document.getElementById('newsSlideButtonRu').value = slide.buttonText?.ru || '';
                    }
                }
            }
        } else {
            title.textContent = 'Yeni Slide Ekle';
            resetSlideModal();
        }

        modal.classList.add('active');
        lucide.createIcons();
    }

    function closeSlideModal() {
        document.getElementById('slideModal').classList.remove('active');
        resetSlideModal();
    }

    function resetSlideModal() {
        editingSlideId = null;
        currentSlideImage = null;
        currentProductSlideImage = null;
        currentNewsSlideImage = null;
        selectSlideType('custom');

        // Reset custom slide fields
        document.getElementById('slideTitleTr').value = '';
        document.getElementById('slideTitleEn').value = '';
        document.getElementById('slideTitleRu').value = '';
        document.getElementById('slideSubtitleTr').value = '';
        document.getElementById('slideSubtitleEn').value = '';
        document.getElementById('slideSubtitleRu').value = '';
        document.getElementById('slideButtonTr').value = '';
        document.getElementById('slideButtonEn').value = '';
        document.getElementById('slideButtonRu').value = '';
        document.getElementById('slideButtonLink').value = '';
        document.getElementById('slideImagePreview').innerHTML = '';

        // Reset product override fields
        document.getElementById('productOverrideEnabled').checked = false;
        document.getElementById('productOverrideFields').style.display = 'none';
        document.getElementById('productSlideTitleTr').value = '';
        document.getElementById('productSlideTitleEn').value = '';
        document.getElementById('productSlideTitleRu').value = '';
        document.getElementById('productSlideSubtitleTr').value = '';
        document.getElementById('productSlideSubtitleEn').value = '';
        document.getElementById('productSlideSubtitleRu').value = '';
        document.getElementById('productSlideButtonTr').value = '';
        document.getElementById('productSlideButtonEn').value = '';
        document.getElementById('productSlideButtonRu').value = '';
        document.getElementById('productSlideImagePreview').innerHTML = '';

        // Reset news override fields
        document.getElementById('newsOverrideEnabled').checked = false;
        document.getElementById('newsOverrideFields').style.display = 'none';
        document.getElementById('newsSlideTitleTr').value = '';
        document.getElementById('newsSlideTitleEn').value = '';
        document.getElementById('newsSlideTitleRu').value = '';
        document.getElementById('newsSlideSubtitleTr').value = '';
        document.getElementById('newsSlideSubtitleEn').value = '';
        document.getElementById('newsSlideSubtitleRu').value = '';
        document.getElementById('newsSlideButtonTr').value = '';
        document.getElementById('newsSlideButtonEn').value = '';
        document.getElementById('newsSlideButtonRu').value = '';
        document.getElementById('newsSlideImagePreview').innerHTML = '';
    }

    function selectSlideType(type) {
        document.querySelectorAll('.slide-type-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.type === type);
        });

        document.getElementById('slideFields-custom').style.display = type === 'custom' ? 'block' : 'none';
        document.getElementById('slideFields-product').style.display = type === 'product' ? 'block' : 'none';
        document.getElementById('slideFields-news').style.display = type === 'news' ? 'block' : 'none';
    }

    function getSelectedSlideType() {
        const selected = document.querySelector('.slide-type-option.selected');
        return selected ? selected.dataset.type : 'custom';
    }

    async function handleSlideImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/homepage/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                currentSlideImage = result.filename;
                renderSlideImagePreview();
                showToast('Gorsel yuklendi', 'success');
            } else {
                showToast(result.error || 'Yukleme hatasi', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Yukleme hatasi', 'error');
        }
    }

    function renderSlideImagePreview() {
        const container = document.getElementById('slideImagePreview');
        if (!container) return;

        if (currentSlideImage) {
            container.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="/images/homepage/${currentSlideImage}" alt="" style="max-width: 200px; border-radius: 8px;">
                    <button onclick="removeSlideImage()" style="position: absolute; top: 4px; right: 4px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">
                        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            `;
            lucide.createIcons();
        } else {
            container.innerHTML = '';
        }
    }

    function removeSlideImage() {
        currentSlideImage = null;
        renderSlideImagePreview();
    }

    function saveSlide() {
        const type = getSelectedSlideType();
        let slideData = { type, active: true };

        if (type === 'custom') {
            slideData.image = currentSlideImage || '';
            slideData.title = {
                tr: document.getElementById('slideTitleTr').value,
                en: document.getElementById('slideTitleEn').value,
                ru: document.getElementById('slideTitleRu').value
            };
            slideData.subtitle = {
                tr: document.getElementById('slideSubtitleTr').value,
                en: document.getElementById('slideSubtitleEn').value,
                ru: document.getElementById('slideSubtitleRu').value
            };
            slideData.buttonText = {
                tr: document.getElementById('slideButtonTr').value,
                en: document.getElementById('slideButtonEn').value,
                ru: document.getElementById('slideButtonRu').value
            };
            slideData.buttonLink = document.getElementById('slideButtonLink').value;
        } else if (type === 'product') {
            slideData.productId = document.getElementById('slideProductSelect').value;

            // Check if override is enabled
            const overrideEnabled = document.getElementById('productOverrideEnabled').checked;
            slideData.override = overrideEnabled;

            if (overrideEnabled) {
                slideData.customImage = currentProductSlideImage || '';
                slideData.title = {
                    tr: document.getElementById('productSlideTitleTr').value,
                    en: document.getElementById('productSlideTitleEn').value,
                    ru: document.getElementById('productSlideTitleRu').value
                };
                slideData.subtitle = {
                    tr: document.getElementById('productSlideSubtitleTr').value,
                    en: document.getElementById('productSlideSubtitleEn').value,
                    ru: document.getElementById('productSlideSubtitleRu').value
                };
                slideData.buttonText = {
                    tr: document.getElementById('productSlideButtonTr').value,
                    en: document.getElementById('productSlideButtonEn').value,
                    ru: document.getElementById('productSlideButtonRu').value
                };
            }
        } else if (type === 'news') {
            slideData.newsId = document.getElementById('slideNewsSelect').value;

            // Check if override is enabled
            const overrideEnabled = document.getElementById('newsOverrideEnabled').checked;
            slideData.override = overrideEnabled;

            if (overrideEnabled) {
                slideData.customImage = currentNewsSlideImage || '';
                slideData.title = {
                    tr: document.getElementById('newsSlideTitleTr').value,
                    en: document.getElementById('newsSlideTitleEn').value,
                    ru: document.getElementById('newsSlideTitleRu').value
                };
                slideData.subtitle = {
                    tr: document.getElementById('newsSlideSubtitleTr').value,
                    en: document.getElementById('newsSlideSubtitleEn').value,
                    ru: document.getElementById('newsSlideSubtitleRu').value
                };
                slideData.buttonText = {
                    tr: document.getElementById('newsSlideButtonTr').value,
                    en: document.getElementById('newsSlideButtonEn').value,
                    ru: document.getElementById('newsSlideButtonRu').value
                };
            }
        }

        if (editingSlideId) {
            const index = homepageData.hero.slides.findIndex(s => s.id === editingSlideId);
            if (index !== -1) {
                homepageData.hero.slides[index] = {
                    ...homepageData.hero.slides[index],
                    ...slideData
                };
            }
        } else {
            slideData.id = 'slide-' + Date.now();
            slideData.order = homepageData.hero.slides.length + 1;
            homepageData.hero.slides.push(slideData);
        }

        renderSlides();
        closeSlideModal();
        showToast('Slide kaydedildi', 'success');
    }

    function editSlide(slideId) {
        openSlideModal(slideId);
    }

    function deleteSlide(slideId) {
        if (!confirm('Bu slide\'i silmek istediginize emin misiniz?')) return;

        homepageData.hero.slides = homepageData.hero.slides.filter(s => s.id !== slideId);

        homepageData.hero.slides.forEach((slide, index) => {
            slide.order = index + 1;
        });

        renderSlides();
        showToast('Slide silindi', 'success');
    }

    // Tab switching
    function switchTab(tabName) {
        console.log('switchTab called with:', tabName);

        document.querySelectorAll('.about-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        const panels = document.querySelectorAll('.tab-panel');
        console.log('Found tab panels:', panels.length);

        panels.forEach(panel => {
            const shouldBeActive = panel.id === `tab-${tabName}`;
            panel.classList.toggle('active', shouldBeActive);
        });

        lucide.createIcons();
    }

    // Language switching
    function switchLang(lang, section) {
        let tabId = 'tab-' + section;
        if (section === 'featured') tabId = 'tab-featuredProducts';
        else if (section === 'company') tabId = 'tab-companyBanner';
        else if (section === 'news') tabId = 'tab-newsSection';
        else if (section === 'hero') tabId = 'tab-hero';
        else if (section === 'cta') tabId = 'tab-cta';

        const container = document.getElementById(tabId);
        if (!container) return;

        container.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });

        container.querySelectorAll('.lang-content').forEach(content => {
            content.classList.toggle('active', content.id.endsWith(`-${lang}`));
        });
    }

    function switchSlideLang(lang) {
        document.querySelectorAll('#slideFields-custom .lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });

        document.querySelectorAll('#slideFields-custom .lang-content').forEach(content => {
            content.classList.toggle('active', content.id === `slide-lang-${lang}`);
        });
    }

    // Save homepage data
    async function saveHomepage() {
        // Hero (new agriplot style)
        homepageData.hero.badge = {
            tr: document.getElementById('heroBadgeTr').value,
            en: document.getElementById('heroBadgeEn').value,
            ru: document.getElementById('heroBadgeRu').value
        };
        homepageData.hero.title = {
            tr: document.getElementById('heroTitleTr').value,
            en: document.getElementById('heroTitleEn').value,
            ru: document.getElementById('heroTitleRu').value
        };
        homepageData.hero.description = {
            tr: document.getElementById('heroDescTr').value,
            en: document.getElementById('heroDescEn').value,
            ru: document.getElementById('heroDescRu').value
        };
        homepageData.hero.primaryButton = {
            text: {
                tr: document.getElementById('heroPrimaryBtnTr').value,
                en: document.getElementById('heroPrimaryBtnEn').value,
                ru: document.getElementById('heroPrimaryBtnRu').value
            },
            link: {
                tr: document.getElementById('heroPrimaryBtnLinkTr').value,
                en: document.getElementById('heroPrimaryBtnLinkEn').value,
                ru: document.getElementById('heroPrimaryBtnLinkRu').value
            }
        };
        homepageData.hero.secondaryButton = {
            text: {
                tr: document.getElementById('heroSecondaryBtnTr').value,
                en: document.getElementById('heroSecondaryBtnEn').value,
                ru: document.getElementById('heroSecondaryBtnRu').value
            },
            link: {
                tr: document.getElementById('heroSecondaryBtnLinkTr').value,
                en: document.getElementById('heroSecondaryBtnLinkEn').value,
                ru: document.getElementById('heroSecondaryBtnLinkRu').value
            }
        };

        homepageData.featuredProducts.enabled = document.getElementById('featuredProductsEnabled').checked;
        homepageData.featuredProducts.badge = {
            tr: document.getElementById('featuredBadgeTr').value,
            en: document.getElementById('featuredBadgeEn').value,
            ru: document.getElementById('featuredBadgeRu').value
        };
        homepageData.featuredProducts.title = {
            tr: document.getElementById('featuredTitleTr').value,
            en: document.getElementById('featuredTitleEn').value,
            ru: document.getElementById('featuredTitleRu').value
        };
        homepageData.featuredProducts.subtitle = {
            tr: document.getElementById('featuredSubtitleTr').value,
            en: document.getElementById('featuredSubtitleEn').value,
            ru: document.getElementById('featuredSubtitleRu').value
        };
        homepageData.featuredProducts.showMax = 3; // Fixed at 3 products

        // Company Stats are saved via renderCompanyStats

        homepageData.newsSection.enabled = document.getElementById('newsSectionEnabled').checked;
        homepageData.newsSection.badge = {
            tr: document.getElementById('newsBadgeTr').value,
            en: document.getElementById('newsBadgeEn').value,
            ru: document.getElementById('newsBadgeRu').value
        };
        homepageData.newsSection.title = {
            tr: document.getElementById('newsTitleTr').value,
            en: document.getElementById('newsTitleEn').value,
            ru: document.getElementById('newsTitleRu').value
        };

        // Blog Settings
        if (!homepageData.blog) homepageData.blog = {};
        homepageData.blog.displayMode = document.getElementById('blogDisplayMode').value;
        if (homepageData.blog.displayMode === 'custom') {
            const selectedNews = Array.from(document.querySelectorAll('#blogNewsList input[type="checkbox"]:checked'))
                .map(cb => cb.value);
            homepageData.blog.selectedNews = selectedNews.slice(0, 3); // Max 3
        } else {
            homepageData.blog.selectedNews = [];
        }

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/homepage', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(homepageData)
            });

            if (response.ok) {
                showToast('Anasayfa kaydedildi', 'success');
            } else {
                const error = await response.json();
                showToast(error.error || 'Kaydetme hatasi', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            showToast('Kaydetme hatasi', 'error');
        }
    }

    // Toast helper
    function showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            alert(message);
        }
    }

    // ==================== PRODUCT SLIDE OVERRIDE FUNCTIONS ====================

    function onProductSelect() {
        const productId = document.getElementById('slideProductSelect').value;
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        // Auto-fill the override fields with product data
        document.getElementById('productSlideTitleTr').value = product.slug?.tr || product.id || '';
        document.getElementById('productSlideTitleEn').value = product.slug?.en || product.id || '';
        document.getElementById('productSlideTitleRu').value = product.slug?.ru || product.id || '';

        // Clear subtitles - user can add custom ones
        document.getElementById('productSlideSubtitleTr').value = '';
        document.getElementById('productSlideSubtitleEn').value = '';
        document.getElementById('productSlideSubtitleRu').value = '';

        // Default button texts
        document.getElementById('productSlideButtonTr').value = 'Incele';
        document.getElementById('productSlideButtonEn').value = 'View';
        document.getElementById('productSlideButtonRu').value = 'Просмотр';

        // Clear custom image
        currentProductSlideImage = null;
        renderProductSlideImagePreview();
    }

    function toggleProductOverride() {
        const enabled = document.getElementById('productOverrideEnabled').checked;
        document.getElementById('productOverrideFields').style.display = enabled ? 'block' : 'none';

        if (enabled) {
            // Auto-fill when first enabled
            onProductSelect();
            lucide.createIcons();
        }
    }

    function switchProductSlideLang(lang) {
        document.querySelectorAll('#productOverrideFields .lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });
        document.querySelectorAll('#productOverrideFields .lang-content').forEach(content => {
            content.classList.toggle('active', content.id === `product-slide-lang-${lang}`);
        });
    }

    async function handleProductSlideImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/homepage/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                currentProductSlideImage = result.filename;
                renderProductSlideImagePreview();
                showToast('Gorsel yuklendi', 'success');
            } else {
                showToast(result.error || 'Yukleme hatasi', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Yukleme hatasi', 'error');
        }
    }

    function renderProductSlideImagePreview() {
        const container = document.getElementById('productSlideImagePreview');
        if (!container) return;

        if (currentProductSlideImage) {
            container.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="/images/homepage/${currentProductSlideImage}" alt="" style="max-width: 200px; border-radius: 8px;">
                    <button onclick="removeProductSlideImage()" style="position: absolute; top: 4px; right: 4px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">
                        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            `;
            lucide.createIcons();
        } else {
            container.innerHTML = '';
        }
    }

    function removeProductSlideImage() {
        currentProductSlideImage = null;
        renderProductSlideImagePreview();
    }

    // ==================== NEWS SLIDE OVERRIDE FUNCTIONS ====================

    function onNewsSelect() {
        const newsId = document.getElementById('slideNewsSelect').value;

        if (newsId === 'auto-latest') {
            // Get the latest news
            const latestNews = allNews.length > 0 ? allNews[0] : null;
            if (latestNews) {
                fillNewsSlideFields(latestNews);
            }
        } else {
            const news = allNews.find(n => n.id === newsId);
            if (news) {
                fillNewsSlideFields(news);
            }
        }
    }

    function fillNewsSlideFields(news) {
        document.getElementById('newsSlideTitleTr').value = news.title?.tr || '';
        document.getElementById('newsSlideTitleEn').value = news.title?.en || '';
        document.getElementById('newsSlideTitleRu').value = news.title?.ru || '';

        document.getElementById('newsSlideSubtitleTr').value = news.summary?.tr || '';
        document.getElementById('newsSlideSubtitleEn').value = news.summary?.en || '';
        document.getElementById('newsSlideSubtitleRu').value = news.summary?.ru || '';

        document.getElementById('newsSlideButtonTr').value = 'Devamini Oku';
        document.getElementById('newsSlideButtonEn').value = 'Read More';
        document.getElementById('newsSlideButtonRu').value = 'Читать далее';

        currentNewsSlideImage = null;
        renderNewsSlideImagePreview();
    }

    function toggleNewsOverride() {
        const enabled = document.getElementById('newsOverrideEnabled').checked;
        document.getElementById('newsOverrideFields').style.display = enabled ? 'block' : 'none';

        if (enabled) {
            onNewsSelect();
            lucide.createIcons();
        }
    }

    function switchNewsSlideLang(lang) {
        document.querySelectorAll('#newsOverrideFields .lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });
        document.querySelectorAll('#newsOverrideFields .lang-content').forEach(content => {
            content.classList.toggle('active', content.id === `news-slide-lang-${lang}`);
        });
    }

    async function handleNewsSlideImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/homepage/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                currentNewsSlideImage = result.filename;
                renderNewsSlideImagePreview();
                showToast('Gorsel yuklendi', 'success');
            } else {
                showToast(result.error || 'Yukleme hatasi', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Yukleme hatasi', 'error');
        }
    }

    function renderNewsSlideImagePreview() {
        const container = document.getElementById('newsSlideImagePreview');
        if (!container) return;

        if (currentNewsSlideImage) {
            container.innerHTML = `
                <div style="position: relative; display: inline-block;">
                    <img src="/images/homepage/${currentNewsSlideImage}" alt="" style="max-width: 200px; border-radius: 8px;">
                    <button onclick="removeNewsSlideImage()" style="position: absolute; top: 4px; right: 4px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">
                        <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            `;
            lucide.createIcons();
        } else {
            container.innerHTML = '';
        }
    }

    function removeNewsSlideImage() {
        currentNewsSlideImage = null;
        renderNewsSlideImagePreview();
    }

    // Make functions globally available for onclick handlers
    window.switchTab = switchTab;
    window.switchLang = switchLang;
    window.switchSlideLang = switchSlideLang;
    window.openSlideModal = openSlideModal;
    window.closeSlideModal = closeSlideModal;
    window.selectSlideType = selectSlideType;
    window.saveSlide = saveSlide;
    window.editSlide = editSlide;
    window.deleteSlide = deleteSlide;
    window.saveHomepage = saveHomepage;
    window.addCompanyStat = addCompanyStat;
    window.updateCompanyStat = updateCompanyStat;
    window.updateCompanyStatLang = updateCompanyStatLang;
    window.removeCompanyStat = removeCompanyStat;
    window.toggleFeaturedProduct = toggleFeaturedProduct;
    window.updateQuickAction = updateQuickAction;
    window.updateQuickActionLang = updateQuickActionLang;
    window.showQuickActionLang = showQuickActionLang;
    window.removeSlideImage = removeSlideImage;
    window.removeCompanyImage = removeCompanyImage;
    window.removeHeroImage = removeHeroImage;

    // Product/News override functions
    window.onProductSelect = onProductSelect;
    window.toggleProductOverride = toggleProductOverride;
    window.switchProductSlideLang = switchProductSlideLang;
    window.removeProductSlideImage = removeProductSlideImage;
    window.onNewsSelect = onNewsSelect;
    window.toggleNewsOverride = toggleNewsOverride;
    window.switchNewsSlideLang = switchNewsSlideLang;
    window.removeNewsSlideImage = removeNewsSlideImage;

    // Blog selection functions
    window.toggleBlogSelectionMode = function() {
        const mode = document.getElementById('blogDisplayMode').value;
        const customSelection = document.getElementById('customBlogSelection');
        if (mode === 'custom') {
            customSelection.style.display = 'block';
            if (document.getElementById('blogNewsList').children.length === 0) {
                loadBlogNewsList(homepageData?.blog?.selectedNews || []);
            }
        } else {
            customSelection.style.display = 'none';
        }
    };

    async function loadBlogNewsList(selectedIds = []) {
        const blogNewsList = document.getElementById('blogNewsList');
        if (!blogNewsList) return;

        try {
            const response = await fetch('/api/news');
            const allNews = await response.json();
            
            if (!Array.isArray(allNews) || allNews.length === 0) {
                blogNewsList.innerHTML = '<p style="color: var(--admin-text-muted);">Henüz haber bulunmuyor.</p>';
                return;
            }

            // Sort by date (newest first)
            const sortedNews = allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

            blogNewsList.innerHTML = sortedNews.map(news => {
                const isSelected = selectedIds.includes(news.id);
                const title = news.title?.tr || news.title?.en || 'Başlıksız';
                const date = news.date ? new Date(news.date).toLocaleDateString('tr-TR') : '';
                const image = news.image ? `/images/news/${news.image}` : '/images/ayermak.png';

                return `
                    <div class="slide-item" style="margin-bottom: 12px;">
                        <div class="slide-preview">
                            <img src="${image}" alt="${title}" onerror="this.src='/images/ayermak.png'">
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                <input type="checkbox" value="${news.id}" ${isSelected ? 'checked' : ''} 
                                       onchange="updateBlogSelection()" 
                                       style="width: 18px; height: 18px; cursor: pointer;">
                                <strong style="flex: 1;">${title}</strong>
                                ${date ? `<span style="color: var(--admin-text-muted); font-size: 13px;">${date}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            updateBlogSelection();
        } catch (error) {
            console.error('Error loading news:', error);
            blogNewsList.innerHTML = '<p style="color: var(--admin-error);">Haberler yüklenirken hata oluştu.</p>';
        }
    }

    window.updateBlogSelection = function() {
        const checked = document.querySelectorAll('#blogNewsList input[type="checkbox"]:checked');
        const maxSelected = 3;
        
        if (checked.length > maxSelected) {
            // Uncheck the last one
            checked[checked.length - 1].checked = false;
            showNotification('En fazla 3 haber seçebilirsiniz', 'warning');
        }
    };

})();
