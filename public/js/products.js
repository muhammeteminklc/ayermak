// Products Page JavaScript

// YouTube URL'den video ID'sini çıkar
function extractYouTubeId(url) {
    if (!url) return null;
    // youtube.com/watch?v=ID veya youtu.be/ID formatlarını destekle
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Detail section icons - Daha belirgin ve alakalı
const detailIcons = {
    // Yeni detaylı teknik özellikler için
    rulmanSistemi: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="17" r="1.5"/><circle cx="7" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/></svg>`,
    diskBaglantisi: `<svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14V8"/><path d="M18 14V8"/><path d="M6 8c0-3 6-3 6-3s6 0 6 3"/></svg>`,
    diskAcilari: `<svg viewBox="0 0 24 24"><path d="M4 20L12 4l8 16"/><path d="M8 14h8"/><circle cx="12" cy="10" r="1"/></svg>`,
    diskYapisi: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>`,
    merdaneSistemi: `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="8" ry="4"/><path d="M4 8v8c0 2.2 3.6 4 8 4s8-1.8 8-4V8"/><path d="M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4"/></svg>`,
    calismaHizi: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M12 4v1M12 19v1M4 12h1M19 12h1"/></svg>`,
    // Eski teknik özellikler (geriye uyumluluk)
    kesmeAcilari: `<svg viewBox="0 0 24 24"><path d="M4 20L12 4l8 16"/><path d="M8 14h8"/><circle cx="12" cy="10" r="1"/></svg>`,
    islemeDerinligi: `<svg viewBox="0 0 24 24"><path d="M4 4h16"/><path d="M4 4v16"/><path d="M8 4v8"/><path d="M12 4v12"/><path d="M16 4v6"/><path d="M4 20h16"/></svg>`,
    suspansiyon: `<svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 14V8"/><path d="M18 14V8"/><path d="M6 8c0-3 6-3 6-3s6 0 6 3"/></svg>`,
    rulman: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="17" r="1.5"/><circle cx="7" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/></svg>`,
    yaglama: `<svg viewBox="0 0 24 24"><path d="M12 3c0 0-6 6-6 10a6 6 0 0012 0c0-4-6-10-6-10z"/><path d="M12 17v-4"/><circle cx="12" cy="15" r="1"/></svg>`,
    // Özellikler için
    feature1: `<svg viewBox="0 0 24 24"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/><path d="M12 12l8-5"/><path d="M12 12v10"/><path d="M12 12L4 7"/></svg>`,
    feature2: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>`,
    feature3: `<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    feature4: `<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    feature5: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    feature6: `<svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    feature7: `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    // Merdane için
    roller1: `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="5"/><path d="M3 12v0a9 5 0 0018 0"/><path d="M12 7v10"/></svg>`,
    roller2: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M6 12h12M12 6v12M8 8l8 8M16 8l-8 8"/></svg>`,
    roller3: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v2M12 16v2M6 12h2M16 12h2M8 8l1.5 1.5M14.5 14.5L16 16M8 16l1.5-1.5M14.5 9.5L16 8"/></svg>`
};

// Feature icons array
const featureIconsList = [
    `<svg viewBox="0 0 24 24"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/><path d="M12 12l8-5M12 12v10M12 12L4 7"/></svg>`,
    `<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>`,
    `<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
    `<svg viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`
];

// Roller icons
const rollerIconsList = [
    `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="8" ry="4"/><path d="M4 8v8c0 2.2 3.6 4 8 4s8-1.8 8-4V8"/><path d="M4 12c0 2.2 3.6 4 8 4s8-1.8 8-4"/></svg>`,
    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>`,
    `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8M12 5v14M5 12h14"/></svg>`
];

// Generate extended details HTML for product page
function generateDetailsHTML(details, category, productId) {
    const categoryName = window.i18n?.getCategory(category) || category || '';

    // Get features and technical from translations
    const features = window.i18n?.getProductFeatures(productId) || details.features || [];
    const technicalTranslations = window.i18n?.getProductTechnical(productId) || {};
    const rollerTranslations = window.i18n?.getProductRollers(productId) || {};

    let html = '<div class="details-container">';

    // Documents Banner - Yellow horizontal premium design (FIRST - above everything)
    if (details.documents && details.documents.length > 0) {
        const currentLang = window.i18n?.currentLang || 'tr';
        const downloadText = {
            tr: 'Kataloğu İndir',
            en: 'Download Catalog',
            ru: 'Скачать каталог'
        };
        const catalogBadge = {
            tr: 'KATALOG',
            en: 'CATALOG',
            ru: 'КАТАЛОГ'
        };

        // Get first PDF document
        const pdfDoc = details.documents.find(doc => {
            const fileName = doc.file || doc;
            return fileName.toLowerCase().endsWith('.pdf');
        });

        if (pdfDoc) {
            const fileName = pdfDoc.file || pdfDoc;
            // Support multi-language document names
            let docName;
            if (pdfDoc.name && typeof pdfDoc.name === 'object') {
                docName = pdfDoc.name[currentLang] || pdfDoc.name.tr;
            } else if (pdfDoc.name) {
                docName = pdfDoc.name;
            } else {
                docName = downloadText[currentLang];
            }

            html += `
                <div class="catalog-download-banner">
                    <div class="catalog-banner-content">
                        <div class="catalog-banner-left">
                            <div class="catalog-badge">${catalogBadge[currentLang]}</div>
                            <div class="catalog-info">
                                <h3 class="catalog-title">${docName}</h3>
                                <p class="catalog-subtitle">${window.i18n?.t('details.catalogDescription') || 'Detaylı teknik bilgiler ve özellikler için kataloğumuzu indirin'}</p>
                            </div>
                        </div>
                        <a href="/images/products/${fileName}" class="catalog-download-btn" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            <span>PDF</span>
                        </a>
                    </div>
                </div>
            `;
        }
    }

    // Models Table - (right below catalog banner)
    if (details.models && details.models.length > 0) {
        const tableColumns = details.tableColumns || [];
        const modelsTitle = window.i18n?.t('details.models') || 'Modeller ve Teknik Ozellikler';
        const modelLabel = window.i18n?.t('details.model') || 'Model';

        // Generate table headers dynamically (without units)
        let tableHeaders = `<th>${modelLabel}</th>`;
        const columnLabels = [modelLabel]; // Store labels for mobile data-label
        tableColumns.forEach(col => {
            const label = window.i18n?.getModelSpecLabel(col.key) || col.key;
            columnLabels.push(label);
            tableHeaders += `<th>${label}</th>`;
        });

        // Generate table rows dynamically with units in cell values
        const currentLang = window.i18n?.currentLang || 'tr';
        const tableRows = details.models.map((m, i) => {
            let cells = `<td data-label="${modelLabel}"><strong>${m.name}</strong></td>`;
            tableColumns.forEach((col, idx) => {
                const rawValue = m.specs?.[col.key] || '-';
                // Support both object {tr: "m", en: "m"} and string "m" formats
                const unit = typeof col.unit === 'object'
                    ? (col.unit[currentLang] || col.unit.tr || '')
                    : (col.unit || '');
                const valueWithUnit = rawValue !== '-' && unit ? `${rawValue} ${unit}` : rawValue;
                const dataLabel = columnLabels[idx + 1];
                // Special styling for highlighted columns
                if (col.highlighted) {
                    cells += `<td data-label="${dataLabel}"><span class="power-badge">${valueWithUnit}</span></td>`;
                } else {
                    cells += `<td data-label="${dataLabel}">${valueWithUnit}</td>`;
                }
            });
            return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${cells}</tr>`;
        }).join('');

        html += `
            <div class="details-section models-section">
                <div class="section-header">
                    <h2 class="section-title" data-i18n="details.models">${modelsTitle}</h2>
                </div>
                <div class="table-wrapper">
                    <table class="models-table">
                        <thead>
                            <tr>${tableHeaders}</tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // Video Section - YouTube Embed (Compact Side-by-Side Design)
    if (details.videoUrl) {
        // YouTube URL'den video ID'sini çıkar
        const videoId = extractYouTubeId(details.videoUrl);
        if (videoId) {
            const currentLang = window.i18n?.currentLang || 'tr';
            const videoBadge = window.i18n?.t('video.badge') || 'VİDEO';
            // Use product-specific video title/subtitle if available
            const videoTitle = details.videoTitle?.[currentLang] || window.i18n?.t('video.title') || 'Ürün Tanıtımı';
            const videoSubtitle = details.videoSubtitle?.[currentLang] || window.i18n?.t('video.subtitle') || 'Ürünümüzü çalışırken izleyin';

            html += `
                <div class="details-section video-section">
                    <div class="video-container">
                        <div class="video-info-panel">
                            <div class="video-badge">
                                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>${videoBadge}</span>
                            </div>
                            <h2 class="video-title">${videoTitle}</h2>
                            <p class="video-subtitle">${videoSubtitle}</p>
                            <div class="video-play-hint">
                                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><polygon points="10 8 16 12 10 16" fill="currentColor"/></svg>
                                <span>YouTube</span>
                            </div>
                        </div>
                        <div class="video-player">
                            <div class="video-frame-container">
                                <iframe
                                    src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
                                    title="${videoTitle}"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen>
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Technical Section with Icons - use translations
    if (details.technical && Object.keys(details.technical).length > 0) {
        const technicalTitle = window.i18n?.t('details.technical') || 'Teknik Yapı ve Donanım';
        html += `
            <div class="details-section technical-section">
                <div class="section-header">
                    <h2 class="section-title" data-i18n="details.technical">${technicalTitle}</h2>
                </div>
                <div class="technical-grid">
                    ${Object.keys(details.technical).map(key => {
            const techData = details.technical[key];
            const techDesc = technicalTranslations[key] || '';
            const techLabel = window.i18n?.getTechnicalLabel(key) || formatTechLabel(key);
            if (!techDesc) return '';

            // Check if there's a custom Lucide icon, otherwise use fallback SVG
            const customIcon = (typeof techData === 'object' && techData.icon) ? techData.icon : null;
            const iconHtml = customIcon
                ? `<i data-lucide="${customIcon}"></i>`
                : (detailIcons[key] || detailIcons.diskYapisi);

            return `
                            <div class="tech-card">
                                <div class="tech-icon">
                                    ${iconHtml}
                                </div>
                                <div class="tech-content">
                                    <div class="tech-label">${techLabel}</div>
                                    <div class="tech-value">${techDesc}</div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }

    // Gallery Section - POSITIONED RIGHT ABOVE "Neden Bu Ürün?"
    if (details.gallery && details.gallery.length > 0) {
        const galleryTitle = window.i18n?.t('details.gallery') || 'Galeri';
        html += `
            <div class="details-section gallery-section gallery-above-features">
                <div class="section-header">
                    <h2 class="section-title" data-i18n="details.gallery">${galleryTitle}</h2>
                </div>
                <div class="gallery-grid">
                    ${details.gallery.map((img, index) => `
                        <div class="gallery-item" data-index="${index}">
                            <img src="/images/products/${img}" alt="Gallery ${index + 1}" loading="lazy">
                            <div class="gallery-overlay">
                                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Features Section - Premium Bento Grid Tasarım (use translated features)
    if (features && features.length > 0) {
        const heroFeature = features[0];
        const gridFeatures = features.slice(1);
        const featuresTitle = window.i18n?.t('details.features') || 'Özellikler';
        const featureIcons = details.featureIcons || [];

        // Helper function to get icon HTML
        const getFeatureIconHtml = (index) => {
            const customIcon = featureIcons[index];
            if (customIcon) {
                return `<i data-lucide="${customIcon}"></i>`;
            }
            return featureIconsList[index % featureIconsList.length];
        };

        html += `
            <div class="details-section features-section">
                <div class="features-bg-text">${categoryName.toUpperCase()}</div>

                <div class="features-header-bar">
                    <div class="features-badge">
                        <svg viewBox="0 0 24 24"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/><path d="M12 12l8-5M12 12v10M12 12L4 7"/></svg>
                        <span data-i18n="details.featuresBadge">${window.i18n?.t('details.featuresBadge') || 'ÖZELLİKLER'}</span>
                    </div>
                    <h2 class="features-main-title" data-i18n="details.featuresTitle">${window.i18n?.t('details.featuresTitle') || 'Neden Bu Ürün?'}</h2>
                    <div class="features-subtitle" data-i18n="details.featuresSubtitle">${window.i18n?.t('details.featuresSubtitle') || 'Üstün kalite ve performansın buluştuğu nokta'}</div>
                </div>

                <div class="features-bento-grid">
                    <div class="feature-hero-card">
                        <div class="feature-hero-glow"></div>
                        <div class="feature-hero-icon">
                            ${getFeatureIconHtml(0)}
                        </div>
                        <div class="feature-hero-number">01</div>
                        <div class="feature-hero-content">
                            <h3>${heroFeature}</h3>
                        </div>
                        <div class="feature-hero-accent"></div>
                    </div>

                    <div class="features-grid-right">
                        ${gridFeatures.map((f, i) => `
                            <div class="feature-grid-card" style="--delay: ${i * 0.1}s">
                                <div class="feature-card-number">${String(i + 2).padStart(2, '0')}</div>
                                <div class="feature-card-icon">
                                    ${getFeatureIconHtml(i + 1)}
                                </div>
                                <p class="feature-card-text">${f}</p>
                                <div class="feature-card-line"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Rollers Section - use translations
    if (details.rollers && details.rollers.length > 0) {
        const rollersTitle = window.i18n?.t('details.rollers') || 'Merdane Seçenekleri';
        html += `
            <div class="details-section rollers-section">
                <div class="rollers-container">
                    <div class="rollers-header">
                        <span class="rollers-label">MERDANE</span>
                        <h2 class="rollers-title" data-i18n="details.rollers">${rollersTitle}</h2>
                        <p class="rollers-subtitle">İhtiyacınıza uygun merdane tipini seçin</p>
                    </div>
                    <div class="rollers-showcase">
                        ${details.rollers.map((r, i) => {
            const rollerData = rollerTranslations[r.id] || {};
            const rollerType = rollerData.type || r.type || r.id;
            const rollerDesc = rollerData.desc || r.desc || '';

            // Check if there's a custom Lucide icon, otherwise use fallback SVG
            const customIcon = r.icon;
            const iconHtml = customIcon
                ? `<i data-lucide="${customIcon}"></i>`
                : rollerIconsList[i % rollerIconsList.length];

            return `
                                <div class="roller-item" data-index="${i + 1}">
                                    <div class="roller-visual">
                                        <div class="roller-icon-wrapper">
                                            ${iconHtml}
                                        </div>
                                        <div class="roller-number">${String(i + 1).padStart(2, '0')}</div>
                                    </div>
                                    <div class="roller-info">
                                        <h3 class="roller-name">${rollerType}</h3>
                                        <p class="roller-description">${rollerDesc}</p>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// Format technical labels
function formatTechLabel(key) {
    const labels = {
        // Yeni detaylı etiketler
        rulmanSistemi: 'Rulman ve Yataklama Sistemi',
        diskBaglantisi: 'Disk Bağlantısı ve Süspansiyon',
        diskAcilari: 'Disk Açıları ve Yapısı',
        diskYapisi: 'Disk Yapısı',
        merdaneSistemi: 'Merdane Sistemi',
        calismaHizi: 'Çalışma Hızı',
        // Eski etiketler (geriye uyumluluk)
        kesmeAcilari: 'Kesme Açıları',
        islemeDerinligi: 'İşleme Derinliği',
        suspansiyon: 'Süspansiyon Sistemi',
        rulman: 'Rulman ve Yataklama',
        yaglama: 'Yağlama'
    };
    return labels[key] || key;
}

async function initProductsPage() {
    const productsGrid = document.querySelector('.products-grid');
    const categoryFiltersContainer = document.getElementById('categoryFilters');
    if (!productsGrid) return;

    // Show loading
    productsGrid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const products = await window.AppHelpers.fetchProducts();

        if (products.length === 0) {
            productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found</p>';
            return;
        }

        // Sort by order
        products.sort((a, b) => a.order - b.order);

        // Extract unique categories from products
        const categories = [...new Set(products.map(p => p.category))];

        // Generate dynamic category filters
        if (categoryFiltersContainer) {
            generateCategoryFilters(categoryFiltersContainer, categories, products);
        }

        // Get view details text based on language
        const viewDetailsText = window.i18n?.t('productsPage.viewDetails') || 'Detayları Gör';

        productsGrid.innerHTML = products.map((product, index) => `
            <a href="${window.i18n?.getProductUrl(product.id) || '/tr/urunler/' + product.id}" class="product-card" data-product-id="${product.id}" data-category="${product.category}">
                <div class="product-card-image" data-category="${window.i18n?.getCategory(product.category) || product.category}">
                    <img src="/images/products/${product.defaultImage || product.image}" alt="${product.id}" loading="lazy">
                </div>
                <div class="product-card-info">
                    <div class="product-card-category" data-i18n="categories.${product.category}">
                        ${window.i18n?.getCategory(product.category) || product.category}
                    </div>
                    <h3 class="product-card-title" data-i18n="productNames.${product.id}">
                        ${window.i18n?.getProductName(product.id) || product.id}
                    </h3>
                    <div class="product-card-action" data-i18n="productsPage.viewDetails">
                        ${viewDetailsText}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </a>
        `).join('');

        // Initialize category filtering
        initCategoryFilters();

        // Initialize Lucide icons for category filters
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Error loading products</p>';
    }
}

// Generate dynamic category filter buttons
function generateCategoryFilters(container, categories, products) {
    const allText = window.i18n?.t('productsPage.allProducts') || 'Tümü';

    // "All" button
    let html = `
        <button class="category-filter-btn active" data-category="all">
            <i data-lucide="layout-grid"></i>
            <span data-text="${allText}">${allText}</span>
        </button>
    `;

    // Category buttons - get icon from first product of each category or use default
    categories.forEach(category => {
        const categoryName = window.i18n?.getCategory(category) || category;
        // Find first product in this category to get its categoryIcon if exists
        const firstProduct = products.find(p => p.category === category);
        const categoryIcon = firstProduct?.categoryIcon || getCategoryDefaultIcon(category);

        html += `
            <button class="category-filter-btn" data-category="${category}">
                <i data-lucide="${categoryIcon}"></i>
                <span data-text="${categoryName}" data-i18n="categories.${category}">${categoryName}</span>
            </button>
        `;
    });

    container.innerHTML = html;
}

// Get default icon for category based on name
function getCategoryDefaultIcon(category) {
    const defaultIcons = {
        'patlatma': 'arrow-down-to-line',
        'kultivator': 'disc-3',
        'romork': 'truck',
        'tiller': 'grip',
        'default': 'package'
    };
    return defaultIcons[category.toLowerCase()] || defaultIcons.default;
}

// Category filter functionality
function initCategoryFilters() {
    const filterBtns = document.querySelectorAll('.category-filter-btn');
    const productCards = document.querySelectorAll('.product-card[data-category]');

    if (!filterBtns.length || !productCards.length) return;

    // Filter function to apply category filter
    const applyFilter = (category) => {
        // Update active button state
        filterBtns.forEach(b => b.classList.remove('active'));
        const targetBtn = document.querySelector(`.category-filter-btn[data-category="${category}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        // Filter products - simple show/hide without animation
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'none';
            } else {
                card.style.display = 'none';
            }
        });
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            applyFilter(category);
        });
    });

    // Check URL for category query parameter (from mega menu)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
        // Small delay to ensure DOM is ready
        setTimeout(() => applyFilter(categoryFromUrl), 100);
    }

    // Initialize category filter navigation arrows
    initCategoryFilterNav();
}

// Category filter navigation arrows
function initCategoryFilterNav() {
    const categoryFilters = document.getElementById('categoryFilters');
    const prevBtn = document.getElementById('categoryNavPrev');
    const nextBtn = document.getElementById('categoryNavNext');

    if (!categoryFilters || !prevBtn || !nextBtn) return;

    const scrollAmount = 200;

    prevBtn.addEventListener('click', () => {
        categoryFilters.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        categoryFilters.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Initialize product search
    initProductSearch();
}

// Product search functionality
function initProductSearch() {
    const searchInput = document.getElementById('productSearch');
    const productCards = document.querySelectorAll('.product-card[data-category]');

    if (!searchInput || !productCards.length) return;

    // Türkçe karakter normalizasyonu
    function normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/İ/g, 'i')
            .replace(/Ğ/g, 'g')
            .replace(/Ü/g, 'u')
            .replace(/Ş/g, 's')
            .replace(/Ö/g, 'o')
            .replace(/Ç/g, 'c')
            .trim();
    }

    // Kelime bazlı eşleşme kontrolü
    function matchesSearch(text, query) {
        const normalizedText = normalizeText(text);
        const normalizedQuery = normalizeText(query);

        // Boş sorgu - hepsini göster
        if (!normalizedQuery) return true;

        // Direkt içerme kontrolü
        if (normalizedText.includes(normalizedQuery)) return true;

        // Kelime bazlı arama (her kelime için kontrol)
        const queryWords = normalizedQuery.split(/\s+/);
        return queryWords.every(word => normalizedText.includes(word));
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;

        // Filter products
        productCards.forEach(card => {
            // Ürün başlığı
            const title = card.querySelector('.product-card-title')?.textContent || '';
            // Kategori adı
            const categoryText = card.querySelector('.product-card-category')?.textContent || '';
            // Kategori data attribute
            const categoryData = card.dataset.category || '';
            // Ürün ID
            const productId = card.dataset.productId || '';

            // Tüm aranabilir metinleri birleştir
            const searchableText = `${title} ${categoryText} ${categoryData} ${productId}`;

            const matches = matchesSearch(searchableText, query);

            if (matches) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'none';
            } else {
                card.style.display = 'none';
            }
        });

        // Reset category filter to "All" when searching
        if (query.trim()) {
            const filterBtns = document.querySelectorAll('.category-filter-btn');
            filterBtns.forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.category-filter-btn[data-category="all"]');
            if (allBtn) allBtn.classList.add('active');
        }
    });
}

// Model Slider State
let modelSliderState = {
    currentIndex: 0,
    models: [],
    autoSlideTimeout: null,
    isPaused: false
};

// Generate Model Slider HTML
function generateModelSliderHTML(models, currentIndex = 0) {
    return `
        <div class="model-slider-container">
            <button class="model-slider-nav prev" aria-label="Previous model">
                <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"></polyline></svg>
            </button>
            <div class="model-slider-wrapper">
                <div class="model-slider-track">
                    ${models.map((model, index) => `
                        <div class="model-item ${index === currentIndex ? 'active' : ''}" data-index="${index}">
                            <span class="model-name">${model.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="model-slider-nav next" aria-label="Next model">
                <svg viewBox="0 0 24 24"><polyline points="9,6 15,12 9,18"></polyline></svg>
            </button>
        </div>
    `;
}

// Update product display for selected model
function updateProductForModel(model, productImage, baseImage, tableColumns, productSpecs) {
    // Update title to show model name
    const productModel = document.querySelector('.product-model');
    if (productModel) {
        productModel.textContent = model.name;
    }

    // Update product image if model has its own image
    if (productImage) {
        if (model.image) {
            productImage.src = `/images/products/${model.image}`;
        } else {
            productImage.src = `/images/products/${baseImage}`;
        }
    }

    // Combine product specs (from admin panel) with model specs (from table)
    const specsContainer = document.querySelector('.product-specs');
    if (specsContainer) {
        // Start with product specs (admin panel - Teknik Özellikler)
        const combinedSpecs = { ...(productSpecs || {}) };

        // Add model specs from table columns (if model has specs)
        if (model.specs && tableColumns) {
            tableColumns.forEach(col => {
                const value = model.specs[col.key];
                if (value !== undefined && value !== null && value !== '') {
                    // Handle both object {tr, en, ru} and string unit formats
                    const getUnit = (lang) => {
                        if (typeof col.unit === 'object') {
                            return col.unit[lang] || col.unit.tr || '';
                        }
                        return col.unit || '';
                    };
                    // Create multi-language format for generateSpecsHTML compatibility
                    combinedSpecs[col.key] = {
                        icon: col.icon || 'tag',
                        values: {
                            tr: { value: String(value), unit: getUnit('tr') },
                            en: { value: String(value), unit: getUnit('en') },
                            ru: { value: String(value), unit: getUnit('ru') }
                        }
                    };
                }
            });
        }

        specsContainer.innerHTML = window.AppHelpers.generateSpecsHTML(combinedSpecs);
        // Initialize Lucide icons immediately after rendering
        window.AppHelpers.initSpecIcons?.();
    }
}

// Initialize Model Slider
function initModelSlider(models, categoryBar, productImage, baseImage, tableColumns, productSpecs) {
    if (!models || models.length === 0) return;

    modelSliderState.models = models;
    modelSliderState.currentIndex = 0;
    modelSliderState.isPaused = false;

    // Clear any existing timeout
    if (modelSliderState.autoSlideTimeout) {
        clearTimeout(modelSliderState.autoSlideTimeout);
        modelSliderState.autoSlideTimeout = null;
    }

    // Add model-slider-bar class
    const categoryBarParent = categoryBar.closest('.category-bar');
    if (categoryBarParent) {
        categoryBarParent.classList.add('model-slider-bar');
    }

    // Render slider
    categoryBar.innerHTML = generateModelSliderHTML(models, 0);

    // Get elements
    const wrapper = categoryBar.querySelector('.model-slider-wrapper');
    const modelItems = categoryBar.querySelectorAll('.model-item');
    const prevBtn = categoryBar.querySelector('.model-slider-nav.prev');
    const nextBtn = categoryBar.querySelector('.model-slider-nav.next');

    // Go to specific model
    function goToModel(index) {
        const newIndex = (index + models.length) % models.length;
        modelSliderState.currentIndex = newIndex;

        // Update active state
        modelItems.forEach((item, i) => {
            item.classList.toggle('active', i === newIndex);
        });

        // Scroll to active item
        const activeItem = modelItems[newIndex];
        if (activeItem && wrapper) {
            const itemLeft = activeItem.offsetLeft;
            const itemWidth = activeItem.offsetWidth;
            const wrapperWidth = wrapper.offsetWidth;
            const scrollLeft = itemLeft - (wrapperWidth / 2) + (itemWidth / 2);
            wrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }

        // Update product display (with product specs from admin panel)
        updateProductForModel(models[newIndex], productImage, baseImage, tableColumns, productSpecs);
    }

    // Schedule next auto-slide
    function scheduleNextSlide() {
        // Clear any existing timeout
        if (modelSliderState.autoSlideTimeout) {
            clearTimeout(modelSliderState.autoSlideTimeout);
        }

        modelSliderState.autoSlideTimeout = setTimeout(() => {
            if (!modelSliderState.isPaused) {
                goToModel(modelSliderState.currentIndex + 1);
            }
            // Schedule next slide regardless of pause state
            scheduleNextSlide();
        }, 7000);
    }

    // Click handlers for model items
    modelItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            goToModel(index);
            scheduleNextSlide(); // Reset timer on manual interaction
        });
    });

    // Navigation arrows
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToModel(modelSliderState.currentIndex - 1);
            scheduleNextSlide();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToModel(modelSliderState.currentIndex + 1);
            scheduleNextSlide();
        });
    }

    // Pause on hover
    const container = categoryBar.querySelector('.model-slider-container');
    if (container) {
        container.addEventListener('mouseenter', () => {
            modelSliderState.isPaused = true;
        });
        container.addEventListener('mouseleave', () => {
            modelSliderState.isPaused = false;
        });
    }

    // Touch/Swipe support for mobile
    if (wrapper) {
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;
        let startScrollLeft = 0;

        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            startScrollLeft = wrapper.scrollLeft;
            isDragging = true;
            modelSliderState.isPaused = true;
            wrapper.style.scrollBehavior = 'auto';
        }, { passive: true });

        wrapper.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touchX = e.touches[0].clientX;
            const diff = touchStartX - touchX;
            wrapper.scrollLeft = startScrollLeft + diff;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            touchEndX = e.changedTouches[0].clientX;
            wrapper.style.scrollBehavior = 'smooth';

            const swipeDistance = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(swipeDistance) > threshold) {
                if (swipeDistance > 0) {
                    // Swipe left - next model
                    goToModel(modelSliderState.currentIndex + 1);
                } else {
                    // Swipe right - previous model
                    goToModel(modelSliderState.currentIndex - 1);
                }
            }

            modelSliderState.isPaused = false;
            scheduleNextSlide();
        }, { passive: true });

        // Mouse drag support for desktop
        let mouseStartX = 0;
        let mouseDown = false;

        wrapper.addEventListener('mousedown', (e) => {
            mouseDown = true;
            mouseStartX = e.clientX;
            startScrollLeft = wrapper.scrollLeft;
            wrapper.style.scrollBehavior = 'auto';
            wrapper.style.cursor = 'grabbing';
        });

        wrapper.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            e.preventDefault();
            const diff = mouseStartX - e.clientX;
            wrapper.scrollLeft = startScrollLeft + diff;
        });

        wrapper.addEventListener('mouseup', (e) => {
            if (!mouseDown) return;
            mouseDown = false;
            wrapper.style.scrollBehavior = 'smooth';
            wrapper.style.cursor = 'grab';

            const swipeDistance = mouseStartX - e.clientX;
            const threshold = 50;

            if (Math.abs(swipeDistance) > threshold) {
                if (swipeDistance > 0) {
                    goToModel(modelSliderState.currentIndex + 1);
                } else {
                    goToModel(modelSliderState.currentIndex - 1);
                }
            }
        });

        wrapper.addEventListener('mouseleave', () => {
            if (mouseDown) {
                mouseDown = false;
                wrapper.style.scrollBehavior = 'smooth';
                wrapper.style.cursor = 'grab';
            }
        });
    }

    // Start auto-slide
    scheduleNextSlide();

    // Update first model display (with product specs from admin panel)
    updateProductForModel(models[0], productImage, baseImage, tableColumns, productSpecs);
}

// Product Detail Page JavaScript
async function initProductDetailPage() {
    const productSection = document.querySelector('.product-detail-section');
    if (!productSection) return;

    // Get product ID from page data (injected by server) or URL
    let productId = window.__PAGE_DATA__?.productId;

    // Fallback: try to get from URL query param (for backwards compatibility)
    if (!productId) {
        productId = window.AppHelpers.getUrlParam('id');
    }

    if (!productId) {
        window.location.href = window.i18n?.getProductsUrl() || '/tr/urunler';
        return;
    }

    try {
        const products = await window.AppHelpers.fetchProducts();
        const currentProduct = products.find(p => p.id === productId);

        if (!currentProduct) {
            window.location.href = window.i18n?.getProductsUrl() || '/tr/urunler';
            return;
        }

        // Sort products by order
        products.sort((a, b) => a.order - b.order);
        const currentIndex = products.findIndex(p => p.id === productId);

        // Get prev/next products
        const prevProduct = products[currentIndex - 1] || products[products.length - 1];
        const nextProduct = products[currentIndex + 1] || products[0];

        // Update background text
        const bgText = document.querySelector('.bg-category-text');
        if (bgText) {
            bgText.textContent = window.i18n?.getCategory(currentProduct.category) || currentProduct.category;
            bgText.setAttribute('data-i18n', `categories.${currentProduct.category}`);
        }

        // Update product image
        const productImage = document.querySelector('.product-image');
        if (productImage) {
            productImage.src = `/images/products/${currentProduct.defaultImage || currentProduct.image}`;
            productImage.alt = currentProduct.id;
        }

        // Update product title (use product name instead of model)
        const productModel = document.querySelector('.product-model');
        if (productModel) {
            productModel.textContent = window.i18n?.getProductName(currentProduct.id) || currentProduct.id;
        }

        // Update product description
        const productDescription = document.querySelector('.product-description');
        if (productDescription) {
            const description = window.i18n?.getProductDescription(currentProduct.id) || '';
            productDescription.textContent = description;
            productDescription.setAttribute('data-i18n', `productDescriptions.${currentProduct.id}`);
        }

        // Update specs
        const specsContainer = document.querySelector('.product-specs');
        if (specsContainer) {
            specsContainer.innerHTML = window.AppHelpers.generateSpecsHTML(currentProduct.specs);
            window.AppHelpers.initSpecIcons?.();
        }

        // Update navigation arrows
        const prevArrow = document.querySelector('.nav-arrow.prev');
        const nextArrow = document.querySelector('.nav-arrow.next');

        if (prevArrow) {
            prevArrow.href = window.i18n?.getProductUrl(prevProduct.id) || `/tr/urunler/${prevProduct.id}`;
        }
        if (nextArrow) {
            nextArrow.href = window.i18n?.getProductUrl(nextProduct.id) || `/tr/urunler/${nextProduct.id}`;
        }

        // Update category bar - Check if product has models
        const categoryBar = document.querySelector('.category-icons');
        if (categoryBar) {
            if (currentProduct.details?.models && currentProduct.details.models.length > 0) {
                // Use model slider for products with multiple models
                initModelSlider(
                    currentProduct.details.models,
                    categoryBar,
                    productImage,
                    currentProduct.defaultImage || currentProduct.image,
                    currentProduct.details.tableColumns || [],
                    currentProduct.specs || {}
                );
            } else {
                // Use standard category bar for products without models
                categoryBar.innerHTML = window.AppHelpers.generateCategoryBar(products, currentProduct.id);
            }
        }

        // Update extended details section
        const detailsSection = document.querySelector('.product-details-extended');
        if (detailsSection && currentProduct.details) {
            detailsSection.innerHTML = generateDetailsHTML(currentProduct.details, currentProduct.category, currentProduct.id);
            // Initialize Lucide icons in details section
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else if (detailsSection) {
            detailsSection.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading product detail:', error);
    }
}

// Home Page Slider
async function initHomeSlider() {
    const heroSlider = document.querySelector('.hero-slider');
    if (!heroSlider) return;

    try {
        const products = await window.AppHelpers.fetchProducts();
        if (products.length === 0) return;

        // Sort products by order
        products.sort((a, b) => a.order - b.order);

        // Generate slides
        heroSlider.innerHTML = `
            ${products.map((product, index) => `
                <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <div class="bg-category-text" data-i18n="categories.${product.category}">
                        ${window.i18n?.getCategory(product.category) || product.category}
                    </div>
                    <div class="hero-content">
                        <div class="hero-image-container">
                            <img src="/images/products/${product.defaultImage || product.image}" alt="${product.id}" class="hero-image">
                        </div>
                        <div class="hero-info">
                            <h2 class="hero-model">${window.i18n?.getProductName(product.id) || product.id}</h2>
                            <div class="hero-specs">
                                ${window.AppHelpers.generateSpecsHTML(product.specs)}
                            </div>
                            <a href="${window.i18n?.getProductUrl(product.id) || '/tr/urunler/' + product.id}" class="hero-cta" data-i18n="general.viewDetails">
                                ${window.i18n?.t('general.viewDetails') || 'View Details'}
                            </a>
                        </div>
                    </div>
                </div>
            `).join('')}

            <button class="nav-arrow prev" aria-label="Previous">
                <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"></polyline></svg>
            </button>
            <button class="nav-arrow next" aria-label="Next">
                <svg viewBox="0 0 24 24"><polyline points="9,6 15,12 9,18"></polyline></svg>
            </button>

            <div class="slider-dots">
                ${products.map((_, index) => `
                    <div class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
                `).join('')}
            </div>
        `;

        // Initialize Lucide icons for specs
        window.AppHelpers.initSpecIcons?.();

        // Slider functionality
        let currentSlide = 0;
        const slides = heroSlider.querySelectorAll('.hero-slide');
        const dots = heroSlider.querySelectorAll('.slider-dot');
        const totalSlides = slides.length;

        function goToSlide(index) {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));

            currentSlide = (index + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        // Arrow navigation
        heroSlider.querySelector('.nav-arrow.prev').addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });

        heroSlider.querySelector('.nav-arrow.next').addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });

        // Dot navigation
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.index));
            });
        });

        // Auto-advance slider
        let autoSlideInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);

        // Pause on hover
        heroSlider.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });

        heroSlider.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5000);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
            }
        });

        // Update category bar
        const categoryBar = document.querySelector('.category-icons');
        if (categoryBar) {
            categoryBar.innerHTML = window.AppHelpers.generateCategoryBar(products, products[0].id);
        }

    } catch (error) {
        console.error('Error loading home slider:', error);
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    // Wait for i18n to load
    setTimeout(() => {
        if (document.querySelector('.products-grid')) {
            initProductsPage();
        }
        if (document.querySelector('.product-detail-section')) {
            initProductDetailPage();
        }
        if (document.querySelector('.hero-slider')) {
            initHomeSlider();
        }
    }, 100);
});

// Re-initialize on language change
window.addEventListener('languageChanged', () => {
    if (document.querySelector('.products-grid')) {
        initProductsPage();
    }
    if (document.querySelector('.product-detail-section')) {
        initProductDetailPage();
    }
    if (document.querySelector('.hero-slider')) {
        initHomeSlider();
    }
});

// ===== GALLERY LIGHTBOX =====
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    // Create lightbox element if it doesn't exist
    let lightbox = document.querySelector('.gallery-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = `
            <button class="gallery-lightbox-close">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <img src="" alt="Gallery Image">
            <button class="gallery-lightbox-prev">
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="gallery-lightbox-next">
                <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.gallery-lightbox-close');
    const prevBtn = lightbox.querySelector('.gallery-lightbox-prev');
    const nextBtn = lightbox.querySelector('.gallery-lightbox-next');

    let currentIndex = 0;
    const images = Array.from(galleryItems).map(item => item.querySelector('img').src);

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;
        lightboxImg.src = images[currentIndex];
    }

    function openLightbox(index) {
        showImage(index);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Click handlers
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
    nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
}

// Initialize lightbox after page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initGalleryLightbox();
    }, 500);
});

// Re-init lightbox on language change
window.addEventListener('languageChanged', () => {
    setTimeout(() => {
        initGalleryLightbox();
    }, 500);
});
