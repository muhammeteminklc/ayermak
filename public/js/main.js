// Main JavaScript Module
// Note: Mobile menu is handled by layout.js

// Header Scroll Effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Products API Helper
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Get single product
async function fetchProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Spec Icons - Her özellik için estetik ikonlar
const specIcons = {
    workingWidth: `<svg viewBox="0 0 24 24"><path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3"/></svg>`,
    workingDepth: `<svg viewBox="0 0 24 24"><path d="M12 4v16M12 20l-3-3M12 20l3-3M8 8h8"/></svg>`,
    legCount: `<svg viewBox="0 0 24 24"><path d="M6 4v16M12 4v16M18 4v16M4 8h16"/></svg>`,
    weight: `<svg viewBox="0 0 24 24"><path d="M12 3v2M6 9h12l-1 10H7L6 9zM9 9V6a3 3 0 016 0v3"/></svg>`,
    discCount: `<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/></svg>`,
    discDiameter: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg>`,
    capacity: `<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM8 6V4h8v2M4 10h16"/></svg>`,
    volume: `<svg viewBox="0 0 24 24"><path d="M4 8l4-4h8l4 4v12H4V8zM4 8h16"/></svg>`,
    axleCount: `<svg viewBox="0 0 24 24"><circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16h12M12 8v8"/></svg>`,
    tireSize: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></svg>`,
    tipping: `<svg viewBox="0 0 24 24"><path d="M4 16h12l4-8H8L4 16zM6 16l-2 4M16 16l2 4"/></svg>`,
    tineCount: `<svg viewBox="0 0 24 24"><path d="M4 20v-8M8 20v-12M12 20v-10M16 20v-12M20 20v-8M2 8h20"/></svg>`
};

// Generate specs HTML - supports both old and new multi-language structure
function generateSpecsHTML(specs) {
    if (!specs || Object.keys(specs).length === 0) return '';

    const currentLang = window.i18n?.currentLang || 'tr';

    const html = Object.entries(specs).map(([key, spec]) => {
        // Handle new multi-language structure
        let value = '';
        let unit = '';
        let iconHtml = '';

        if (spec.values && spec.values[currentLang]) {
            // New structure: { icon, values: { tr: { value, unit }, en: {...}, ru: {...} } }
            value = spec.values[currentLang].value || '';
            unit = spec.values[currentLang].unit || '';
        } else {
            // Old structure: { value, unit }
            value = spec.value || '';
            unit = spec.unit || '';
        }

        // Determine icon - prefer Lucide icon from spec.icon, fallback to SVG
        if (spec.icon) {
            // New Lucide icon
            iconHtml = `<i data-lucide="${spec.icon}"></i>`;
        } else if (specIcons[key]) {
            // Old SVG icon
            iconHtml = specIcons[key];
        } else {
            // Default SVG icon
            iconHtml = specIcons.weight;
        }

        return `
        <div class="spec-item">
            <div class="spec-icon">
                ${iconHtml}
            </div>
            <div class="spec-content">
                <div class="spec-label" data-spec-key="${key}">${window.i18n?.getSpecLabel(key) || key}</div>
                <div class="spec-value">
                    ${value}
                    ${unit ? `<span class="unit">${unit}</span>` : ''}
                </div>
            </div>
        </div>
    `}).join('');

    return html;
}

// Helper to initialize Lucide icons after specs are rendered
function initSpecIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Category Icons SVG - Belirgin ve temsili ikonlar
const categoryIcons = {
    patlatma: `<svg viewBox="0 0 24 24">
        <path d="M12 2v20"/>
        <path d="M12 6l-3-3M12 6l3-3"/>
        <path d="M5 12h14"/>
        <path d="M8 8v8M16 8v8"/>
    </svg>`,
    kultivator: `<svg viewBox="0 0 24 24">
        <circle cx="7" cy="14" r="4"/>
        <circle cx="17" cy="14" r="4"/>
        <path d="M11 14h2"/>
        <path d="M7 6v4M17 6v4M12 4v6"/>
    </svg>`,
    romork: `<svg viewBox="0 0 24 24">
        <path d="M2 10h16v6H2z"/>
        <circle cx="6" cy="16" r="2.5"/>
        <circle cx="14" cy="16" r="2.5"/>
        <path d="M18 10l4-2v5h-4"/>
        <path d="M2 10l2-3h12l2 3"/>
    </svg>`,
    tiller: `<svg viewBox="0 0 24 24">
        <path d="M4 20h16"/>
        <path d="M6 20v-8"/>
        <path d="M10 20v-10"/>
        <path d="M14 20v-8"/>
        <path d="M18 20v-10"/>
        <path d="M8 8a4 4 0 018 0"/>
    </svg>`
};

// Generate category bar HTML - Tüm ürünleri göster (kısa isimlerle)
function generateCategoryBar(products, currentProductId) {
    // Ürünleri sıralı göster
    const sortedProducts = [...products].sort((a, b) => a.order - b.order);

    return sortedProducts.map(product => {
        const isActive = product.id === currentProductId;
        const shortName = window.i18n?.getProductShortName(product.id) || product.id;
        const productLink = window.i18n?.getProductUrl(product.id) || `/tr/urunler/${product.id}`;
        return `
            <a href="${productLink}" class="category-item ${isActive ? 'active' : ''}" data-product="${product.id}" data-category="${product.category}">
                <div class="category-icon">
                    ${categoryIcons[product.category] || categoryIcons.patlatma}
                </div>
                <span class="category-name" data-i18n="productShortNames.${product.id}">${shortName}</span>
            </a>
        `;
    }).join('');
}

// URL Parameter Helper
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Update spec labels on language change
function updateSpecLabels() {
    document.querySelectorAll('[data-spec-key]').forEach(el => {
        const key = el.getAttribute('data-spec-key');
        el.textContent = window.i18n?.getSpecLabel(key) || key;
    });
}

// Listen for language changes
window.addEventListener('languageChanged', () => {
    updateSpecLabels();
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

// Export for use in other modules
window.AppHelpers = {
    fetchProducts,
    fetchProduct,
    generateSpecsHTML,
    generateCategoryBar,
    getUrlParam,
    categoryIcons,
    initSpecIcons
};
