// Admin Panel JavaScript

if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = '/api';
}

const ADMIN_API_BASE = window.API_BASE;

// Auth Helper
const Auth = {
    getToken() {
        return localStorage.getItem('adminToken');
    },
    setToken(token) {
        localStorage.setItem('adminToken', token);
    },
    removeToken() {
        localStorage.removeItem('adminToken');
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    async verify() {
        if (!this.isLoggedIn()) return false;
        try {
            const response = await fetch(`${ADMIN_API_BASE}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${this.getToken()}` }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
};

// API Helper with Auth
async function apiRequest(endpoint, options = {}) {
    const token = Auth.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${ADMIN_API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        Auth.removeToken();
        window.location.href = '/admin/index.html';
        throw new Error('Unauthorized');
    }

    return response;
}

// Sidebar Loader
function initSidebar() {
    const container = document.getElementById('adminSidebar');
    if (!container || typeof window.renderAdminSidebar !== 'function') return;
    window.renderAdminSidebar(container);
}

// Login Page
async function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Check if already logged in
    if (await Auth.verify()) {
        window.location.href = '/admin/homepage.html';
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.querySelector('.error-message');

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${ADMIN_API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            Auth.setToken(data.token);
            window.location.href = '/admin/homepage.html';

        } catch (error) {
            errorEl.textContent = error.message;
            errorEl.classList.add('show');
        }
    });
}

// Check Auth on Protected Pages
async function checkAuth() {
    if (!(await Auth.verify())) {
        window.location.href = '/admin/index.html';
        return false;
    }
    return true;
}

// Logout
function logout() {
    Auth.removeToken();
    window.location.href = '/admin/index.html';
}

// Dashboard Page
async function initDashboard() {
    if (!(await checkAuth())) return;

    try {
        const products = await (await apiRequest('/products')).json();
        const translations = await (await apiRequest('/translations')).json();

        document.getElementById('productCount').textContent = products.length;
        document.getElementById('languageCount').textContent = Object.keys(translations).length;

    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// Products Page
let allProducts = [];
let productSearch = '';

async function initProductsPage() {
    if (!(await checkAuth())) return;

    document.getElementById('productSearchInput')?.addEventListener('input', (e) => {
        productSearch = e.target.value.toLowerCase();
        renderProductsTable();
    });

    await loadProducts();
}

async function loadProducts() {
    try {
        const response = await apiRequest('/products');
        allProducts = await response.json();

        // Update stats
        const countEl = document.getElementById('totalProductsCount');
        if (countEl) countEl.textContent = allProducts.length;

        renderProductsTable();
    } catch (error) {
        console.error('Load products error:', error);
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const filtered = allProducts.filter(p =>
        (p.id || '').toLowerCase().includes(productSearch) ||
        (p.category || '').toLowerCase().includes(productSearch)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #6c757d;">
                    Sonuç bulunamadı.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(product => `
        <tr>
            <td>
                <div class="product-img-wrapper">
                    <img src="/images/products/${product.defaultImage || product.image}" class="product-thumb" alt="${product.id}">
                </div>
            </td>
            <td>
                <div class="product-info">
                    <span class="product-model">${product.id}</span>
                </div>
            </td>
            <td>
                <span class="product-category-badge">${product.category}</span>
            </td>
            <td><span class="product-order">${product.order}</span></td>
            <td>
                <div class="table-actions">
                    <a href="/admin/urun-duzenle.html?id=${product.id}" class="action-btn edit" title="Düzenle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                        Düzenle
                    </a>
                    <button onclick="deleteProduct('${product.id}')" class="action-btn delete" title="Sil">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Sil
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
        await apiRequest(`/products/${id}`, { method: 'DELETE' });
        await loadProducts();
    } catch (error) {
        alert('Silme hatası: ' + error.message);
    }
}

// News Page
let newsItems = [];
let newsFilters = { search: '', year: 'all' };

function getValidDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function initNewsPage() {
    if (!(await checkAuth())) return;

    document.getElementById('refreshNewsBtn')?.addEventListener('click', () => loadNewsItems(true));
    document.getElementById('newsSearchInput')?.addEventListener('input', (event) => {
        newsFilters.search = event.target.value.toLowerCase();
        renderNewsList();
    });
    document.getElementById('newsYearFilter')?.addEventListener('change', (event) => {
        newsFilters.year = event.target.value;
        renderNewsList();
    });

    await loadNewsItems();
}

async function loadNewsItems(showLoader = false) {
    const grid = document.getElementById('newsGrid');
    if (showLoader && grid) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3>Yükleniyor...</h3>
                <p>Haber listesi güncelleniyor...</p>
            </div>
        `;
    }

    try {
        const response = await apiRequest('/news');
        newsItems = await response.json();
        renderNewsFilters();
        renderNewsOverview();
        renderNewsList();
    } catch (error) {
        console.error('Haberler yüklenirken hata oluştu:', error);
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Hata</h3>
                    <p>Haberler yüklenirken bir hata oluştu.</p>
                </div>
            `;
        }
    }
}

function renderNewsFilters() {
    const select = document.getElementById('newsYearFilter');
    if (!select) return;

    const years = Array.from(new Set(newsItems
        .map(item => {
            const date = getValidDate(item?.date);
            return date ? date.getFullYear() : null;
        })
        .filter(Boolean))).sort((a, b) => b - a);

    const currentValue = newsFilters.year;
    select.innerHTML = ['<option value="all">Tüm yıllar</option>', ...years.map(year => `<option value="${year}">${year}</option>`)].join('');
    if (years.includes(Number(currentValue))) {
        select.value = currentValue;
    } else {
        newsFilters.year = 'all';
    }
}

function renderNewsOverview() {
    const totalEl = document.getElementById('newsTotalCount');
    const monthlyEl = document.getElementById('newsMonthlyCount');
    const translationEl = document.getElementById('newsTranslationRate');

    const total = newsItems.length;
    const now = new Date();
    const monthCount = newsItems.filter(item => {
        const date = getValidDate(item?.date);
        if (!date) return false;
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= 30 && diffDays >= 0;
    }).length;

    const translationReady = newsItems.filter(item => {
        const langs = ['tr', 'en', 'ru'];
        return langs.every(lang => item?.title?.[lang]);
    }).length;
    const translationRate = total ? Math.round((translationReady / total) * 100) : 0;

    if (totalEl) totalEl.textContent = total;
    if (monthlyEl) monthlyEl.textContent = monthCount;
    if (translationEl) translationEl.textContent = `${translationRate}%`;
}

function getFilteredNews() {
    let filtered = [...newsItems];

    if (newsFilters.search) {
        filtered = filtered.filter(item => {
            const searchTarget = [
                item?.title?.tr,
                item?.title?.en,
                item?.title?.ru,
                item?.summary
            ].filter(Boolean).join(' ').toLowerCase();
            return searchTarget.includes(newsFilters.search);
        });
    }

    if (newsFilters.year !== 'all') {
        filtered = filtered.filter(item => {
            const date = getValidDate(item?.date);
            return date && date.getFullYear().toString() === newsFilters.year;
        });
    }

    return filtered;
}

function renderNewsList() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    const data = getFilteredNews();
    const countLabel = document.getElementById('newsTableCount'); // Might need to update this ID in HTML if I removed it, checking HTML... I removed it.
    // Actually I removed the table card so newsTableCount is gone.
    // I should update the stats counters instead if needed, but they are already updated in renderNewsOverview.

    if (!data.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3>Sonuç Bulunamadı</h3>
                <p>Arama kriterlerinize uygun haber yok.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = data.map(item => `
        <article class="news-card">
            <div class="news-card-image">
                ${item.image
            ? `<img src="/images/news/${item.image}" alt="${item.title?.tr || 'Haber görseli'}" loading="lazy">`
            : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#adb5bd;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="m21 15-4-4-3 3-4-4-3 3-4-4"></path>
                        </svg>
                       </div>`
        }
                <div class="news-date-badge">
                    ${item.date ? new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </div>
            </div>
            <div class="news-card-content">
                <div class="news-card-meta">
                    ${['tr', 'en', 'ru'].map(lang => `
                        <span class="lang-badge ${item?.title?.[lang] ? 'active' : ''}">${lang}</span>
                    `).join('')}
                </div>
                <h3 class="news-card-title" title="${item.title?.tr || ''}">${item.title?.tr || '(Başlık yok)'}</h3>
                
                <div class="news-card-actions">
                    <a href="/admin/news-edit.html?id=${item.id}" class="action-btn edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                        </svg>
                        Düzenle
                    </a>
                    <button onclick="deleteNews('${item.id}')" class="action-btn delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Sil
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

async function deleteNews(id) {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) return;

    try {
        await apiRequest(`/news/${id}`, { method: 'DELETE' });
        await loadNewsItems();
    } catch (error) {
        alert('Haber silinirken bir hata oluştu: ' + error.message);
    }
}

// Translations Page
let allTranslations = {};

async function initTranslationsPage() {
    if (!(await checkAuth())) return;

    await loadTranslations();

    // Save button
    document.getElementById('saveTranslationsBtn')?.addEventListener('click', saveTranslations);

    // Category tabs
    document.querySelectorAll('.translation-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.translation-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTranslationSection(tab.dataset.category);
        });
    });
}

async function loadTranslations() {
    try {
        const response = await apiRequest('/translations');
        allTranslations = await response.json();
        renderTranslationSection('nav');
    } catch (error) {
        console.error('Load translations error:', error);
    }
}

function renderTranslationSection(category) {
    const container = document.getElementById('translationsContainer');
    if (!container || !allTranslations.tr) return;

    const keys = Object.keys(allTranslations.tr[category] || {});

    container.innerHTML = `
        <div class="translation-row" style="font-weight: bold; margin-bottom: 20px;">
            <div>Anahtar</div>
            <div>Türkçe</div>
            <div>English</div>
            <div>Русский</div>
        </div>
        ${keys.map(key => `
            <div class="translation-row">
                <div class="translation-key">${key}</div>
                <input type="text" class="translation-input"
                    data-lang="tr" data-category="${category}" data-key="${key}"
                    value="${allTranslations.tr[category]?.[key] || ''}">
                <input type="text" class="translation-input"
                    data-lang="en" data-category="${category}" data-key="${key}"
                    value="${allTranslations.en[category]?.[key] || ''}">
                <input type="text" class="translation-input"
                    data-lang="ru" data-category="${category}" data-key="${key}"
                    value="${allTranslations.ru[category]?.[key] || ''}">
            </div>
        `).join('')}
    `;
}

async function saveTranslations() {
    // Collect all inputs
    document.querySelectorAll('.translation-input').forEach(input => {
        const { lang, category, key } = input.dataset;
        if (!allTranslations[lang]) allTranslations[lang] = {};
        if (!allTranslations[lang][category]) allTranslations[lang][category] = {};
        allTranslations[lang][category][key] = input.value;
    });

    try {
        await apiRequest('/translations', {
            method: 'PUT',
            body: JSON.stringify(allTranslations)
        });

        const msg = document.querySelector('.success-message');
        if (msg) {
            msg.textContent = 'Çeviriler başarıyla kaydedildi!';
            msg.classList.add('show');
            setTimeout(() => msg.classList.remove('show'), 3000);
        }
    } catch (error) {
        alert('Kaydetme hatası: ' + error.message);
    }
}

// Initialize based on page
initSidebar();

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('index.html') || path.endsWith('/admin/')) {
        initLoginPage();
    } else if (path.includes('products.html')) {
        initProductsPage();
    } else if (path.includes('news.html')) {
        initNewsPage();
    } else if (path.includes('translations.html')) {
        initTranslationsPage();
    }
});

// Make functions globally available
window.deleteProduct = deleteProduct;
window.deleteNews = deleteNews;
window.logout = logout;
