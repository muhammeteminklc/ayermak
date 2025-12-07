// Urun Duzenleyici - Admin Panel JavaScript
// Modern ve calisir versiyon

(function () {
const API_BASE = window.API_BASE || '/api';

// Global State
let productData = null;
let translationsData = { tr: {}, en: {}, ru: {} };
let allProducts = [];
let currentProductId = null;
let isNewProduct = false;
let editingModelIndex = null;
let editingTechnicalKey = null;
let editingRollerId = null;
let selectedTechnicalIcon = 'settings';
let selectedRollerIcon = 'circle';
let editingColumnIndex = null;
let editingSpecKey = null;
let currentFeaturesLang = 'tr';

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Urun Editor initializing...');

    // Check if we're on the right page
    if (!window.location.pathname.includes('urun-duzenle')) return;

    // Check auth
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/index.html';
        return;
    }

    try {
        const authResponse = await fetch(`${API_BASE}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!authResponse.ok) {
            window.location.href = '/admin/index.html';
            return;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/index.html';
        return;
    }

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentProductId = urlParams.get('id');
    isNewProduct = !currentProductId || urlParams.get('new') === 'true';

    // Update page title and badge
    const pageTitle = document.getElementById('pageTitle');
    const productIdBadge = document.getElementById('productIdBadge');
    if (pageTitle) {
        pageTitle.textContent = isNewProduct ? 'Yeni Urun Olustur' : 'Urun Duzenle';
    }
    if (productIdBadge) {
        productIdBadge.textContent = isNewProduct ? 'YENİ' : currentProductId;
        productIdBadge.style.background = isNewProduct ? '#22c55e' : '';
    }

    // Load all data
    await Promise.all([
        loadTranslations(),
        loadAllProducts()
    ]);

    if (!isNewProduct) {
        await loadProduct();
    } else {
        initNewProduct();
    }

    // Setup all event handlers
    setupNavigation();
    setupEventListeners();
    setupFileUploads();

    // Initial render
    renderAll();

    console.log('Admin Urun Editor ready!');
});

// ==================== DATA LOADING ====================

async function loadTranslations() {
    try {
        const response = await fetch(`${API_BASE}/translations`);
        if (response.ok) {
            translationsData = await response.json();
        }
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            const data = await response.json();
            // API returns array directly, not { products: [...] }
            allProducts = Array.isArray(data) ? data : (data.products || []);
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

async function loadProduct() {
    try {
        const response = await fetch(`${API_BASE}/products/${currentProductId}`);
        if (!response.ok) throw new Error('Product not found');
        productData = await response.json();

        // Show product ID badge
        const badge = document.getElementById('productIdBadge');
        if (badge) badge.textContent = productData.id;

        populateForm();
    } catch (error) {
        console.error('Failed to load product:', error);
        showToast('Urun yuklenemedi', 'error');
    }
}

function initNewProduct() {
    productData = {
        id: '',
        category: '',
        categoryIcon: 'package',
        order: allProducts.length + 1,
        defaultImage: '',
        specs: {},
        details: {
            tableColumns: [],
            models: [],
            technical: {},
            rollers: [],
            videoUrl: null,
            gallery: [],
            documents: []
        }
    };
}

// ==================== FORM POPULATION ====================

function populateForm() {
    if (!productData) return;

    // Basic fields
    setValue('productId', productData.id);
    setValue('productCategory', productData.category);
    setValue('productOrder', productData.order);
    setValue('defaultImage', productData.defaultImage || '');
    setValue('videoUrl', productData.details?.videoUrl || '');

    // Category icon
    const categoryIcon = productData.categoryIcon || 'package';
    setValue('categoryIcon', categoryIcon);
    updateCategoryIconPreview(categoryIcon);

    // Show image preview
    if (productData.defaultImage) {
        const preview = document.getElementById('defaultImagePreview');
        if (preview) {
            preview.innerHTML = `<img src="/images/products/${productData.defaultImage}" alt="Product">`;
        }
    }

    // Product names from translations
    const pid = productData.id;
    setValue('nameTr', translationsData.tr?.productNames?.[pid] || '');
    setValue('nameEn', translationsData.en?.productNames?.[pid] || '');
    setValue('nameRu', translationsData.ru?.productNames?.[pid] || '');

    // Short names
    setValue('shortNameTr', translationsData.tr?.productShortNames?.[pid] || '');
    setValue('shortNameEn', translationsData.en?.productShortNames?.[pid] || '');
    setValue('shortNameRu', translationsData.ru?.productShortNames?.[pid] || '');

    // Product descriptions
    setValue('descriptionTr', translationsData.tr?.productDescriptions?.[pid] || '');
    setValue('descriptionEn', translationsData.en?.productDescriptions?.[pid] || '');
    setValue('descriptionRu', translationsData.ru?.productDescriptions?.[pid] || '');

    // URL Slugs
    setValue('slugTr', productData.slug?.tr || pid);
    setValue('slugEn', productData.slug?.en || pid);
    setValue('slugRu', productData.slug?.ru || pid);
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    // Section navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (!section) return;

            // Update nav items
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update sections
            document.querySelectorAll('.editor-section').forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`section-${section}`);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // Language tabs for features
    document.querySelectorAll('.lang-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentFeaturesLang = tab.dataset.lang;
            document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFeatures();
        });
    });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveProduct);

    // Add spec
    const addSpecBtn = document.getElementById('addSpecBtn');
    if (addSpecBtn) {
        addSpecBtn.addEventListener('click', () => {
            editingSpecKey = null;
            openSpecModal();
        });
    }

    // Save spec
    const saveSpecBtn = document.getElementById('saveSpecBtn');
    if (saveSpecBtn) {
        saveSpecBtn.addEventListener('click', saveSpec);
    }

    // Add column
    const addColumnBtn = document.getElementById('addColumnBtn');
    if (addColumnBtn) {
        addColumnBtn.addEventListener('click', () => {
            editingColumnIndex = null;
            openColumnModal();
        });
    }

    // Save column
    const saveColumnBtn = document.getElementById('saveColumnBtn');
    if (saveColumnBtn) {
        saveColumnBtn.addEventListener('click', saveColumn);
    }

    // Add model
    const addModelBtn = document.getElementById('addModelBtn');
    if (addModelBtn) {
        addModelBtn.addEventListener('click', () => {
            editingModelIndex = null;
            openModelModal();
        });
    }

    // Add feature
    const addFeatureBtn = document.getElementById('addFeatureBtn');
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', addFeature);
    }

    // Add technical
    const addTechnicalBtn = document.getElementById('addTechnicalBtn');
    if (addTechnicalBtn) {
        addTechnicalBtn.addEventListener('click', () => {
            editingTechnicalKey = null;
            openTechnicalModal();
        });
    }

    // Add roller
    const addRollerBtn = document.getElementById('addRollerBtn');
    if (addRollerBtn) {
        addRollerBtn.addEventListener('click', () => {
            editingRollerId = null;
            openRollerModal();
        });
    }

    // Add gallery
    const addGalleryBtn = document.getElementById('addGalleryBtn');
    if (addGalleryBtn) {
        addGalleryBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const filename = await uploadFile(file);
                    if (filename) {
                        if (!productData.details.gallery) productData.details.gallery = [];
                        productData.details.gallery.push(filename);
                        renderGallery();
                    }
                }
            };
            input.click();
        });
    }

    // Add document - open modal
    const addDocumentBtn = document.getElementById('addDocumentBtn');
    if (addDocumentBtn) {
        addDocumentBtn.addEventListener('click', openDocumentModal);
    }

    // Document modal file input
    const documentUploadZone = document.getElementById('documentUploadZone');
    const documentFileInput = document.getElementById('documentFile');
    if (documentUploadZone && documentFileInput) {
        documentUploadZone.addEventListener('click', () => documentFileInput.click());
        documentUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            documentUploadZone.classList.add('dragover');
        });
        documentUploadZone.addEventListener('dragleave', () => {
            documentUploadZone.classList.remove('dragover');
        });
        documentUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            documentUploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) handleDocumentFileSelect(file);
        });
        documentFileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) handleDocumentFileSelect(e.target.files[0]);
        });
    }

    // Save document button
    const saveDocumentBtn = document.getElementById('saveDocumentBtn');
    if (saveDocumentBtn) {
        saveDocumentBtn.addEventListener('click', saveDocument);
    }

    // Modal saves
    const saveModelBtn = document.getElementById('saveModelBtn');
    if (saveModelBtn) saveModelBtn.addEventListener('click', saveModel);

    const saveTechnicalBtn = document.getElementById('saveTechnicalBtn');
    if (saveTechnicalBtn) saveTechnicalBtn.addEventListener('click', saveTechnical);

    const saveRollerBtn = document.getElementById('saveRollerBtn');
    if (saveRollerBtn) saveRollerBtn.addEventListener('click', saveRoller);

}

// ==================== FILE UPLOADS ====================

function setupFileUploads() {
    setupUploadZone('defaultImageUpload', 'defaultImageInput', 'defaultImagePreview', 'defaultImage');
    setupUploadZone('modelImageUpload', 'modelImageInput', 'modelImagePreview', 'modelImage');

    // Reset model image button handler
    const resetBtn = document.getElementById('resetModelImageBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Clear model image
            setValue('modelImage', '');
            const preview = document.getElementById('modelImagePreview');
            if (preview) preview.innerHTML = '';
            // Hide reset button
            resetBtn.style.display = 'none';
        });
    }
}

function setupUploadZone(zoneId, inputId, previewId, hiddenId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            await handleFileUpload(file, previewId, hiddenId);
        }
    });

    input.addEventListener('change', async () => {
        if (input.files.length) {
            await handleFileUpload(input.files[0], previewId, hiddenId);
        }
    });
}

async function handleFileUpload(file, previewId, hiddenId) {
    const filename = await uploadFile(file);
    if (filename) {
        const hidden = document.getElementById(hiddenId);
        if (hidden) hidden.value = filename;

        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = `<img src="/images/products/${filename}" alt="Preview">`;
        }

        // Show reset button when model image is uploaded
        if (hiddenId === 'modelImage') {
            const resetBtn = document.getElementById('resetModelImageBtn');
            if (resetBtn) resetBtn.style.display = 'flex';
        }
    }
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/products/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        showToast('Dosya yuklendi', 'success');
        return data.filename;
    } catch (error) {
        showToast('Yukleme hatasi: ' + error.message, 'error');
        return null;
    }
}

// ==================== RENDER FUNCTIONS ====================

function renderAll() {
    populateCategories();
    renderSpecs();
    renderColumns();
    renderModelsTable();
    renderFeatures();
    renderTechnical();
    renderRollers();
    renderGallery();
    renderDocuments();
}

function populateCategories() {
    const datalist = document.getElementById('categoryList');
    if (!datalist) return;

    // Get unique categories from all products
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    datalist.innerHTML = categories.map(c => `<option value="${c}">`).join('');
}

function renderSpecs() {
    const container = document.getElementById('specsEditor');
    if (!container || !productData) return;

    const specs = productData.specs || {};
    const keys = Object.keys(specs);

    if (keys.length === 0) {
        container.innerHTML = '<div class="empty-placeholder"><span>Henuz teknik ozellik eklenmemis</span></div>';
        return;
    }

    container.innerHTML = keys.map(key => {
        const label = translationsData.tr?.specLabels?.[key] || key;
        const spec = specs[key];
        const unitText = spec.unit ? `(${spec.unit})` : '';
        const valueText = spec.value || '-';

        return `
            <div class="column-item" data-key="${key}">
                <div class="column-info">
                    <div class="column-key">${label} ${unitText}</div>
                    <div class="spec-value-display">${valueText}</div>
                </div>
                <div class="column-actions">
                    <button class="btn-edit" onclick="editSpec('${key}')">Duzenle</button>
                    <button class="btn-delete" onclick="deleteSpec('${key}')">Sil</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderColumns() {
    const container = document.getElementById('columnsEditor');
    if (!container || !productData) return;

    // Ensure tableColumns exists
    if (!productData.details) productData.details = {};
    if (!productData.details.tableColumns) productData.details.tableColumns = [];

    const columns = productData.details.tableColumns;

    if (columns.length === 0) {
        container.innerHTML = '<div class="empty-placeholder"><span>Henuz sutun eklenmemis</span></div>';
        return;
    }

    container.innerHTML = columns.map((col, index) => {
        const label = translationsData.tr?.modelSpecs?.[col.key] || col.key;
        const unitDisplay = typeof col.unit === 'object' ? (col.unit.tr || '') : (col.unit || '');
        const unitText = unitDisplay ? `(${unitDisplay})` : '';
        const highlightBadge = col.highlighted ? '<span class="highlight-badge">VURGULU</span>' : '';
        return `
            <div class="column-item" data-index="${index}">
                <span class="column-order">${index + 1}</span>
                <div class="column-info">
                    <div class="column-key">${label} ${unitText} ${highlightBadge}</div>
                </div>
                <div class="column-actions">
                    <button class="btn-edit" onclick="editColumn(${index})">Duzenle</button>
                    <button class="btn-delete" onclick="deleteColumn(${index})">Sil</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderModelsTable() {
    const container = document.getElementById('modelsTableWrapper');
    if (!container || !productData) return;

    const models = productData.details?.models || [];
    const columns = productData.details?.tableColumns || [];

    // Update count badge
    const countBadge = document.getElementById('modelCount');
    if (countBadge) countBadge.textContent = models.length;

    if (models.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                <h3>Henuz model eklenmemis</h3>
                <p>Urun modellerini ekleyerek farkli varyantlari tanimlayin</p>
            </div>
        `;
        return;
    }

    // Build table
    let html = '<table class="models-table"><thead><tr>';
    html += '<th class="model-image-cell"></th>';
    html += '<th>Model</th>';

    columns.forEach(col => {
        const label = translationsData.tr?.modelSpecs?.[col.key] || col.key;
        const unitDisplay = typeof col.unit === 'object' ? (col.unit.tr || '') : (col.unit || '');
        html += `<th>${label}${unitDisplay ? `<small>(${unitDisplay})</small>` : ''}</th>`;
    });

    html += '<th class="actions-cell">Islemler</th>';
    html += '</tr></thead><tbody>';

    models.forEach((model, index) => {
        html += '<tr>';
        html += `<td class="model-image-cell">`;
        const displayImage = model.image || productData.defaultImage;
        if (displayImage) {
            html += `<img src="/images/products/${displayImage}" alt="${model.name}">`;
        } else {
            html += `<div class="model-image-placeholder"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>`;
        }
        html += '</td>';
        html += `<td class="model-name-cell">${model.name || model.id}</td>`;

        columns.forEach(col => {
            const value = model.specs?.[col.key] || '-';
            html += `<td>${value}</td>`;
        });

        html += `<td class="actions-cell">
            <button class="btn-edit" onclick="editModel(${index})">Duzenle</button>
            <button class="btn-delete" onclick="deleteModel(${index})">Sil</button>
        </td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderFeatures() {
    const container = document.getElementById('featuresEditor');
    if (!container) return;

    const features = getProductFeatures(currentFeaturesLang);
    const featureIcons = productData?.details?.featureIcons || [];

    if (features.length === 0) {
        container.innerHTML = '<div class="empty-placeholder"><span>Henuz ozellik eklenmemis</span></div>';
        return;
    }

    container.innerHTML = features.map((feature, index) => {
        const icon = featureIcons[index] || 'star';
        return `
        <div class="feature-item">
            <div class="drag-handle">
                <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="12" x2="16" y2="12"></line><line x1="8" y1="18" x2="16" y2="18"></line></svg>
            </div>
            <button type="button" class="feature-icon-btn" onclick="openFeatureIconPicker(${index})" title="Ikon sec">
                <i data-lucide="${icon}"></i>
            </button>
            <input type="text" value="${feature}"
                   onchange="updateFeature(${index}, this.value)"
                   placeholder="Ozellik metni...">
            <button type="button" class="btn-delete" onclick="deleteFeature(${index})">X</button>
        </div>
    `}).join('');

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderTechnical() {
    const container = document.getElementById('technicalEditor');
    if (!container || !productData) return;

    const technical = productData.details?.technical || {};
    const keys = Object.keys(technical);
    const pid = productData.id || currentProductId;

    if (keys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <h3>Henuz teknik bilgi eklenmemis</h3>
                <p>Rulman sistemi, disk yapisi gibi detayli bilgiler ekleyin</p>
            </div>
        `;
        return;
    }

    container.innerHTML = keys.map(key => {
        const techData = technical[key];
        const icon = (typeof techData === 'object' && techData.icon) ? techData.icon : 'settings';
        const labelTr = translationsData.tr?.technicalLabels?.[key] || key;
        const descTr = translationsData.tr?.products?.[pid]?.technical?.[key] || '';
        const descEn = translationsData.en?.products?.[pid]?.technical?.[key] || '';
        const descRu = translationsData.ru?.products?.[pid]?.technical?.[key] || '';

        return `
            <div class="technical-card">
                <div class="technical-header">
                    <div class="technical-icon">
                        <i data-lucide="${icon}"></i>
                    </div>
                    <span class="technical-key">${key}</span>
                    <div class="model-actions">
                        <button class="btn-edit" onclick="editTechnical('${key}')">Duzenle</button>
                        <button class="btn-delete" onclick="deleteTechnical('${key}')">Sil</button>
                    </div>
                </div>
                <div class="technical-title">${labelTr}</div>
                <div class="technical-desc">${descTr || '<em>Aciklama eklenmemis</em>'}</div>
                <div class="technical-langs">
                    <span class="lang-badge ${descTr ? '' : 'missing'}">TR</span>
                    <span class="lang-badge ${descEn ? '' : 'missing'}">EN</span>
                    <span class="lang-badge ${descRu ? '' : 'missing'}">RU</span>
                </div>
            </div>
        `;
    }).join('');

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderRollers() {
    const container = document.getElementById('rollersEditor');
    if (!container || !productData) return;

    const rollers = productData.details?.rollers || [];
    const pid = productData.id || currentProductId;

    if (rollers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
                <h3>Henuz merdane eklenmemis</h3>
                <p>Bu bolum istege baglidir</p>
            </div>
        `;
        return;
    }

    container.innerHTML = rollers.map(roller => {
        const icon = roller.icon || 'circle';
        const typeTr = translationsData.tr?.products?.[pid]?.rollers?.[roller.id]?.type || roller.id;
        const descTr = translationsData.tr?.products?.[pid]?.rollers?.[roller.id]?.desc || '';

        return `
            <div class="roller-card">
                <div class="roller-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="roller-info">
                    <div class="roller-type">${typeTr}</div>
                    <div class="roller-desc">${descTr}</div>
                </div>
                <div class="model-actions">
                    <button class="btn-edit" onclick="editRoller('${roller.id}')">Duzenle</button>
                    <button class="btn-delete" onclick="deleteRoller('${roller.id}')">Sil</button>
                </div>
            </div>
        `;
    }).join('');

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderGallery() {
    const container = document.getElementById('galleryEditor');
    if (!container || !productData) return;

    const gallery = productData.details?.gallery || [];

    if (gallery.length === 0) {
        container.innerHTML = '<div class="empty-placeholder"><span>Henuz galeri fotografl eklenmemis</span></div>';
        return;
    }

    container.innerHTML = gallery.map((img, index) => `
        <div class="gallery-item">
            <img src="/images/products/${img}" alt="Gallery ${index + 1}">
            <button class="gallery-delete" onclick="deleteGalleryItem(${index})">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `).join('');
}

function renderDocuments() {
    const container = document.getElementById('documentsEditor');
    if (!container || !productData) return;

    const documents = productData.details?.documents || [];

    if (documents.length === 0) {
        container.innerHTML = '<div class="empty-placeholder"><span>Henuz dokuman eklenmemis</span></div>';
        return;
    }

    container.innerHTML = documents.map((doc, index) => {
        const name = typeof doc.name === 'object' ? doc.name.tr : doc.name;
        return `
        <div class="document-item">
            <div class="document-icon">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <div class="document-info">
                <div class="document-name">${name}</div>
                <div class="document-file">${doc.file}</div>
            </div>
            <button class="btn-delete" onclick="deleteDocument(${index})">Sil</button>
        </div>
    `}).join('');
}

// ==================== FEATURES HELPERS ====================

function getProductId() {
    // Try to get product ID from input field first (for new products)
    const inputId = document.getElementById('productId')?.value?.trim();
    if (inputId) return inputId;
    // Fall back to productData or URL param
    return productData?.id || currentProductId || '';
}

function ensureProductPath(lang, pid) {
    if (!translationsData[lang]) translationsData[lang] = {};
    if (!translationsData[lang].products) translationsData[lang].products = {};
    if (!translationsData[lang].products[pid]) translationsData[lang].products[pid] = {};
    if (!translationsData[lang].products[pid].features) translationsData[lang].products[pid].features = [];
}

function getProductFeatures(lang) {
    const pid = getProductId();
    if (!pid) return [];
    ensureProductPath(lang, pid);
    return translationsData[lang].products[pid].features;
}

function addFeature() {
    const pid = getProductId();
    if (!pid) {
        showToast('Once urun ID girin', 'error');
        return;
    }

    ensureProductPath(currentFeaturesLang, pid);
    translationsData[currentFeaturesLang].products[pid].features.push('');

    // Add default icon to featureIcons array
    if (!productData.details) productData.details = {};
    if (!productData.details.featureIcons) productData.details.featureIcons = [];
    productData.details.featureIcons.push('star');

    renderFeatures();
}

// ==================== DELETE FUNCTIONS ====================

window.deleteSpec = function (key) {
    if (!confirm('Bu ozelligi silmek istediginize emin misiniz?')) return;
    if (!productData.specs) return;

    // Delete spec data
    delete productData.specs[key];

    // Delete translations
    ['tr', 'en', 'ru'].forEach(lang => {
        if (translationsData[lang]?.specLabels) {
            delete translationsData[lang].specLabels[key];
        }
    });

    renderSpecs();
};

window.deleteModel = function (index) {
    if (!confirm('Bu modeli silmek istediginize emin misiniz?')) return;
    if (!productData.details.models) return;
    productData.details.models.splice(index, 1);
    renderModelsTable();
};

// ==================== SPEC FUNCTIONS ====================

function openSpecModal() {
    setValue('specKey', '');
    setValue('specLabelTr', '');
    setValue('specLabelEn', '');
    setValue('specLabelRu', '');
    setValue('specValue', '');
    setValue('specUnit', '');

    const title = document.getElementById('specModalTitle');
    if (title) title.textContent = 'Teknik Ozellik Ekle';

    document.getElementById('specModal')?.classList.add('active');
}

window.editSpec = function (key) {
    editingSpecKey = key;
    const spec = productData.specs?.[key] || {};

    setValue('specKey', key);
    setValue('specLabelTr', translationsData.tr?.specLabels?.[key] || '');
    setValue('specLabelEn', translationsData.en?.specLabels?.[key] || '');
    setValue('specLabelRu', translationsData.ru?.specLabels?.[key] || '');
    setValue('specValue', spec.value || '');
    setValue('specUnit', spec.unit || '');

    const title = document.getElementById('specModalTitle');
    if (title) title.textContent = 'Teknik Ozellik Duzenle';

    document.getElementById('specModal')?.classList.add('active');
};

function saveSpec() {
    const labelTr = document.getElementById('specLabelTr')?.value?.trim();
    if (!labelTr) {
        showToast('Turkce ozellik adi gerekli', 'error');
        return;
    }

    const labelEn = document.getElementById('specLabelEn')?.value?.trim() || labelTr;
    const labelRu = document.getElementById('specLabelRu')?.value?.trim() || labelTr;
    const value = document.getElementById('specValue')?.value?.trim() || '';
    const unit = document.getElementById('specUnit')?.value?.trim() || '';

    // Get or generate key
    let key = document.getElementById('specKey')?.value?.trim();
    const isEditing = editingSpecKey !== null;

    if (!key || !isEditing) {
        key = slugify(labelTr);
        // Make sure key is unique
        let baseKey = key;
        let counter = 1;
        const existingKeys = Object.keys(productData.specs || {});
        while (existingKeys.includes(key) && key !== editingSpecKey) {
            key = `${baseKey}_${counter}`;
            counter++;
        }
    }

    // Handle key change when editing
    if (isEditing && editingSpecKey !== key) {
        // Remove old key
        if (productData.specs) {
            delete productData.specs[editingSpecKey];
        }
        ['tr', 'en', 'ru'].forEach(lang => {
            if (translationsData[lang]?.specLabels) {
                delete translationsData[lang].specLabels[editingSpecKey];
            }
        });
    }

    // Save to product data
    if (!productData.specs) productData.specs = {};
    productData.specs[key] = { value, unit };

    // Initialize translation structures
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].specLabels) translationsData[lang].specLabels = {};
    });

    // Save labels
    translationsData.tr.specLabels[key] = labelTr;
    translationsData.en.specLabels[key] = labelEn;
    translationsData.ru.specLabels[key] = labelRu;

    closeModal('specModal');
    editingSpecKey = null;
    renderSpecs();
}

// ==================== COLUMN FUNCTIONS ====================

// Turkce metinden slug olustur
function slugify(text) {
    const turkishMap = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };
    return text
        .split('')
        .map(char => turkishMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

// Column icon state
let selectedColumnIcon = 'tag';

function openColumnModal() {
    setValue('columnKey', '');
    setValue('columnUnit', '');
    setValue('columnLabelTr', '');
    setValue('columnLabelEn', '');
    setValue('columnLabelRu', '');

    // Reset icon
    selectedColumnIcon = 'tag';
    setValue('columnIcon', 'tag');
    updateColumnIconPreview();

    // Reset highlight checkbox
    const highlightCheckbox = document.getElementById('columnHighlight');
    if (highlightCheckbox) highlightCheckbox.checked = false;

    const title = document.getElementById('columnModalTitle');
    if (title) title.textContent = 'Sutun Ekle';

    document.getElementById('columnModal')?.classList.add('active');
}

function updateColumnIconPreview() {
    const preview = document.getElementById('columnIconPreview');
    if (preview && selectedColumnIcon) {
        preview.setAttribute('data-lucide', selectedColumnIcon);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

window.editColumn = function (index) {
    editingColumnIndex = index;
    const columns = productData.details?.tableColumns || [];
    const col = columns[index];
    if (!col) return;

    setValue('columnKey', col.key || '');

    // Handle both old (string) and new (object) unit format
    if (typeof col.unit === 'object') {
        setValue('columnUnitTr', col.unit.tr || '');
        setValue('columnUnitEn', col.unit.en || '');
        setValue('columnUnitRu', col.unit.ru || '');
    } else {
        // Legacy: single string unit - put in all fields
        setValue('columnUnitTr', col.unit || '');
        setValue('columnUnitEn', col.unit || '');
        setValue('columnUnitRu', col.unit || '');
    }

    setValue('columnLabelTr', translationsData.tr?.modelSpecs?.[col.key] || '');
    setValue('columnLabelEn', translationsData.en?.modelSpecs?.[col.key] || '');
    setValue('columnLabelRu', translationsData.ru?.modelSpecs?.[col.key] || '');

    // Set icon
    selectedColumnIcon = col.icon || 'tag';
    setValue('columnIcon', selectedColumnIcon);
    updateColumnIconPreview();

    // Set highlight checkbox
    const highlightCheckbox = document.getElementById('columnHighlight');
    if (highlightCheckbox) highlightCheckbox.checked = col.highlighted === true;

    const title = document.getElementById('columnModalTitle');
    if (title) title.textContent = 'Sutun Duzenle';

    document.getElementById('columnModal')?.classList.add('active');
};

function saveColumn() {
    const labelTr = document.getElementById('columnLabelTr')?.value?.trim();
    const unitTr = document.getElementById('columnUnitTr')?.value?.trim() || '';
    const unitEn = document.getElementById('columnUnitEn')?.value?.trim() || unitTr;
    const unitRu = document.getElementById('columnUnitRu')?.value?.trim() || unitTr;
    const labelEn = document.getElementById('columnLabelEn')?.value?.trim() || labelTr;
    const labelRu = document.getElementById('columnLabelRu')?.value?.trim() || labelTr;
    const highlighted = document.getElementById('columnHighlight')?.checked === true;
    const icon = document.getElementById('columnIcon')?.value || selectedColumnIcon || 'tag';

    if (!labelTr) {
        showToast('Sutun adi gerekli', 'error');
        return;
    }

    // Ensure tableColumns array exists
    if (!productData.details) productData.details = {};
    if (!productData.details.tableColumns) productData.details.tableColumns = [];

    // Get or generate key
    let key = document.getElementById('columnKey')?.value?.trim();
    const isEditing = editingColumnIndex !== null;

    if (!key || !isEditing) {
        // Generate key from Turkish label
        key = slugify(labelTr);
        // Make sure key is unique
        let baseKey = key;
        let counter = 1;
        while (productData.details.tableColumns.some((col, idx) => col.key === key && idx !== editingColumnIndex)) {
            key = `${baseKey}_${counter}`;
            counter++;
        }
    }

    // Build unit object (multilingual)
    const unit = { tr: unitTr, en: unitEn, ru: unitRu };

    const column = { key, unit, icon, highlighted };

    if (isEditing) {
        // Get old key to update model specs
        const oldKey = productData.details.tableColumns[editingColumnIndex]?.key;
        productData.details.tableColumns[editingColumnIndex] = column;

        // If key changed, update model specs
        if (oldKey && oldKey !== key) {
            (productData.details.models || []).forEach(model => {
                if (model.specs && model.specs[oldKey] !== undefined) {
                    model.specs[key] = model.specs[oldKey];
                    delete model.specs[oldKey];
                }
            });
        }
    } else {
        productData.details.tableColumns.push(column);
    }

    // Save translations for the column label
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].modelSpecs) translationsData[lang].modelSpecs = {};
    });

    translationsData.tr.modelSpecs[key] = labelTr;
    translationsData.en.modelSpecs[key] = labelEn;
    translationsData.ru.modelSpecs[key] = labelRu;

    closeModal('columnModal');
    editingColumnIndex = null;
    renderColumns();
    renderModelsTable();
}

window.deleteColumn = function (index) {
    if (!confirm('Bu sutunu silmek istediginize emin misiniz? Modellerdeki bu alan verileri de silinecek.')) return;

    const columns = productData.details?.tableColumns || [];
    const col = columns[index];
    if (!col) return;

    // Remove column
    productData.details.tableColumns.splice(index, 1);

    // Remove this key from all model specs
    (productData.details.models || []).forEach(model => {
        if (model.specs) {
            delete model.specs[col.key];
        }
    });

    renderColumns();
    renderModelsTable();
};

window.updateFeature = function (index, value) {
    const features = getProductFeatures(currentFeaturesLang);
    features[index] = value;
    setProductFeatures(currentFeaturesLang, features);
};

window.deleteFeature = function (index) {
    const features = getProductFeatures(currentFeaturesLang);
    features.splice(index, 1);
    setProductFeatures(currentFeaturesLang, features);

    // Also remove the icon at the same index
    if (productData?.details?.featureIcons) {
        productData.details.featureIcons.splice(index, 1);
    }

    renderFeatures();
};

window.openFeatureIconPicker = function (index) {
    openIconPicker((icon) => {
        if (!productData.details) productData.details = {};
        if (!productData.details.featureIcons) productData.details.featureIcons = [];

        // Ensure array is long enough
        while (productData.details.featureIcons.length <= index) {
            productData.details.featureIcons.push('star');
        }

        productData.details.featureIcons[index] = icon;
        renderFeatures();
    });
};

window.deleteTechnical = function (key) {
    if (!confirm('Bu teknik bilgiyi silmek istediginize emin misiniz?')) return;

    if (productData.details.technical) {
        delete productData.details.technical[key];
    }

    const pid = productData.id || currentProductId;
    ['tr', 'en', 'ru'].forEach(lang => {
        if (translationsData[lang]?.products?.[pid]?.technical) {
            delete translationsData[lang].products[pid].technical[key];
        }
        if (translationsData[lang]?.technicalLabels) {
            delete translationsData[lang].technicalLabels[key];
        }
    });

    renderTechnical();
};

window.deleteRoller = function (id) {
    if (!confirm('Bu merdaneyi silmek istediginize emin misiniz?')) return;

    const index = productData.details.rollers?.findIndex(r => r.id === id);
    if (index > -1) {
        productData.details.rollers.splice(index, 1);
    }

    const pid = productData.id || currentProductId;
    ['tr', 'en', 'ru'].forEach(lang => {
        if (translationsData[lang]?.products?.[pid]?.rollers) {
            delete translationsData[lang].products[pid].rollers[id];
        }
    });

    renderRollers();
};

window.deleteGalleryItem = function (index) {
    if (!productData.details.gallery) return;
    productData.details.gallery.splice(index, 1);
    renderGallery();
};

window.deleteDocument = function (index) {
    if (!productData.details.documents) return;
    productData.details.documents.splice(index, 1);
    renderDocuments();
};

// ==================== DOCUMENT MODAL ====================

let selectedDocumentFile = null;
let selectedExistingPdf = null;

async function openDocumentModal() {
    // Reset form
    setValue('documentNameTr', '');
    setValue('documentNameEn', '');
    setValue('documentNameRu', '');
    selectedDocumentFile = null;
    selectedExistingPdf = null;

    // Reset file preview
    const placeholder = document.getElementById('documentPlaceholder');
    const preview = document.getElementById('documentPreview');
    const fileInput = document.getElementById('documentFile');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';

    // Load and render existing PDFs
    await loadExistingPdfs();

    // Show modal (using active class pattern)
    const modal = document.getElementById('documentModal');
    if (modal) modal.classList.add('active');
}

// Load existing PDFs from server
async function loadExistingPdfs() {
    const container = document.getElementById('existingPdfsList');
    if (!container) return;

    container.innerHTML = '<div class="empty-placeholder"><span>Yukleniyor...</span></div>';

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/products/files/pdfs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch PDFs');

        const pdfs = await response.json();

        if (pdfs.length === 0) {
            container.innerHTML = '<div class="empty-placeholder"><span>Yuklu PDF bulunamadi</span></div>';
            return;
        }

        container.innerHTML = pdfs.map(pdf => `
            <div class="existing-pdf-item" data-filename="${pdf.filename}" onclick="selectExistingPdf('${pdf.filename}')">
                <div class="existing-pdf-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="existing-pdf-info">
                    <span class="pdf-name">${pdf.filename}</span>
                    <span class="pdf-size">${formatFileSize(pdf.size)}</span>
                </div>
                <div class="existing-pdf-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading PDFs:', error);
        container.innerHTML = '<div class="empty-placeholder"><span>PDF yuklenemedi</span></div>';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Select existing PDF
window.selectExistingPdf = function (filename) {
    // Clear new file selection
    selectedDocumentFile = null;
    const placeholder = document.getElementById('documentPlaceholder');
    const preview = document.getElementById('documentPreview');
    const fileInput = document.getElementById('documentFile');
    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';

    // Toggle selection
    if (selectedExistingPdf === filename) {
        selectedExistingPdf = null;
    } else {
        selectedExistingPdf = filename;
        // Auto-fill name if empty
        // Auto-fill name if empty
        const nameInputTr = document.getElementById('documentNameTr');
        if (nameInputTr && !nameInputTr.value) {
            const cleanName = filename.replace(/\.(pdf|doc|docx)$/i, '');
            nameInputTr.value = cleanName;
            document.getElementById('documentNameEn').value = cleanName;
            document.getElementById('documentNameRu').value = cleanName;
        }
    }

    // Update UI
    document.querySelectorAll('.existing-pdf-item').forEach(item => {
        if (item.dataset.filename === selectedExistingPdf) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function handleDocumentFileSelect(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = /\.(pdf|doc|docx)$/i;

    if (!allowedExtensions.test(file.name) && !allowedTypes.includes(file.type)) {
        showToast('Sadece PDF, DOC veya DOCX dosyalari yuklenebilir', 'error');
        return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
        showToast('Dosya boyutu 100MB\'dan buyuk olamaz', 'error');
        return;
    }

    // Clear existing PDF selection when new file is selected
    selectedExistingPdf = null;
    document.querySelectorAll('.existing-pdf-item').forEach(item => {
        item.classList.remove('selected');
    });

    selectedDocumentFile = file;

    // Update UI
    const placeholder = document.getElementById('documentPlaceholder');
    const preview = document.getElementById('documentPreview');
    const fileName = document.getElementById('documentFileName');
    const fileIcon = preview?.querySelector('.file-icon');

    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'flex';
    if (fileName) fileName.textContent = file.name;

    // Update icon based on file type
    if (fileIcon) {
        fileIcon.className = 'file-icon ' + (file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'doc');
    }

    // Auto-fill document name if empty
    const nameInputTr = document.getElementById('documentNameTr');
    if (nameInputTr && !nameInputTr.value) {
        // Remove extension from filename for suggested name
        const suggestedName = file.name.replace(/\.(pdf|doc|docx)$/i, '');
        nameInputTr.value = suggestedName;
        document.getElementById('documentNameEn').value = suggestedName;
        document.getElementById('documentNameRu').value = suggestedName;
    }
}

window.clearDocumentFile = function () {
    selectedDocumentFile = null;

    const placeholder = document.getElementById('documentPlaceholder');
    const preview = document.getElementById('documentPreview');
    const fileInput = document.getElementById('documentFile');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
};

async function saveDocument() {
    const nameTr = document.getElementById('documentNameTr')?.value?.trim();
    const nameEn = document.getElementById('documentNameEn')?.value?.trim();
    const nameRu = document.getElementById('documentNameRu')?.value?.trim();

    if (!nameTr) {
        showToast('Dokuman adi (Turkce) gerekli', 'error');
        return;
    }

    const name = {
        tr: nameTr,
        en: nameEn || nameTr,
        ru: nameRu || nameTr
    };

    // Check if either existing PDF or new file is selected
    if (!selectedDocumentFile && !selectedExistingPdf) {
        showToast('Lutfen bir dosya secin veya mevcut PDF secin', 'error');
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveDocumentBtn');
    const originalText = saveBtn?.textContent;
    if (saveBtn) {
        saveBtn.textContent = 'Kaydediliyor...';
        saveBtn.disabled = true;
    }

    try {
        let filename;

        if (selectedExistingPdf) {
            // Use existing PDF (no upload needed)
            filename = selectedExistingPdf;
        } else {
            // Upload new file
            filename = await uploadFile(selectedDocumentFile);
        }

        if (filename) {
            if (!productData.details.documents) productData.details.documents = [];
            productData.details.documents.push({ name, file: filename });
            renderDocuments();
            closeModal('documentModal');
            showToast('Dokuman basariyla eklendi', 'success');
        }
    } catch (error) {
        showToast('Hata: ' + error.message, 'error');
    } finally {
        // Restore button
        if (saveBtn) {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }
}

// ==================== MODAL FUNCTIONS ====================

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
};

function openModelModal() {
    // Clear form
    setValue('modelId', '');
    setValue('modelName', '');
    setValue('modelImage', '');

    const preview = document.getElementById('modelImagePreview');
    if (preview) preview.innerHTML = '';

    // Hide reset button for new models
    const resetBtn = document.getElementById('resetModelImageBtn');
    if (resetBtn) resetBtn.style.display = 'none';

    // Render dynamic spec inputs based on tableColumns
    renderModelSpecInputs({});

    const title = document.getElementById('modelModalTitle');
    if (title) title.textContent = 'Yeni Model';

    document.getElementById('modelModal')?.classList.add('active');
}

window.editModel = function (index) {
    editingModelIndex = index;
    const model = productData.details.models[index];

    setValue('modelId', model.id || '');
    setValue('modelName', model.name || '');
    setValue('modelImage', model.image || '');

    const preview = document.getElementById('modelImagePreview');
    if (preview) {
        preview.innerHTML = model.image
            ? `<img src="/images/products/${model.image}" alt="${model.name}">`
            : '';
    }

    // Show/hide reset button based on whether model has custom image
    const resetBtn = document.getElementById('resetModelImageBtn');
    if (resetBtn) {
        resetBtn.style.display = model.image ? 'flex' : 'none';
    }

    // Render dynamic spec inputs with existing values
    renderModelSpecInputs(model.specs || {});

    const title = document.getElementById('modelModalTitle');
    if (title) title.textContent = 'Model Duzenle';

    document.getElementById('modelModal')?.classList.add('active');
};

function renderModelSpecInputs(specs) {
    const container = document.getElementById('modelSpecsEditor');
    if (!container) return;

    const columns = productData.details?.tableColumns || [];

    if (columns.length === 0) {
        container.innerHTML = '<p class="empty-hint">Once tablo sutunlarini tanimlayin</p>';
        return;
    }

    container.innerHTML = columns.map(col => {
        const label = translationsData.tr?.modelSpecs?.[col.key] || col.key;
        const value = specs[col.key] || '';
        return `
            <div class="spec-field">
                <label>${label} ${col.unit ? `<small>(${col.unit})</small>` : ''}</label>
                <input type="text" data-spec-key="${col.key}" value="${value}" placeholder="${label}">
            </div>
        `;
    }).join('');
}

function saveModel() {
    const model = {
        id: document.getElementById('modelId')?.value || '',
        name: document.getElementById('modelName')?.value || '',
        image: document.getElementById('modelImage')?.value || null,
        specs: {}
    };

    // Collect specs from dynamic inputs
    document.querySelectorAll('#modelSpecsEditor input[data-spec-key]').forEach(input => {
        const key = input.dataset.specKey;
        const value = input.value?.trim();
        if (key && value) {
            model.specs[key] = value;
        }
    });

    if (!productData.details.models) productData.details.models = [];

    if (editingModelIndex !== null) {
        productData.details.models[editingModelIndex] = model;
    } else {
        productData.details.models.push(model);
    }

    closeModal('modelModal');
    editingModelIndex = null;
    renderModelsTable();
}

function openTechnicalModal() {
    setValue('technicalKey', '');
    setValue('technicalLabelTr', '');
    setValue('technicalLabelEn', '');
    setValue('technicalLabelRu', '');
    setValue('technicalDescTr', '');
    setValue('technicalDescEn', '');
    setValue('technicalDescRu', '');

    // Reset icon
    selectedTechnicalIcon = 'settings';
    setValue('technicalIcon', 'settings');
    updateTechnicalIconPreview();

    const title = document.getElementById('technicalModalTitle');
    if (title) title.textContent = 'Teknik Bilgi Ekle';

    document.getElementById('technicalModal')?.classList.add('active');
}

window.editTechnical = function (key) {
    editingTechnicalKey = key;
    const pid = productData.id || currentProductId;

    setValue('technicalKey', key);
    setValue('technicalLabelTr', translationsData.tr?.technicalLabels?.[key] || '');
    setValue('technicalLabelEn', translationsData.en?.technicalLabels?.[key] || '');
    setValue('technicalLabelRu', translationsData.ru?.technicalLabels?.[key] || '');
    setValue('technicalDescTr', translationsData.tr?.products?.[pid]?.technical?.[key] || '');
    setValue('technicalDescEn', translationsData.en?.products?.[pid]?.technical?.[key] || '');
    setValue('technicalDescRu', translationsData.ru?.products?.[pid]?.technical?.[key] || '');

    // Load icon from productData.details.technical[key] which stores {icon: '...'}
    const techData = productData.details?.technical?.[key];
    const icon = (typeof techData === 'object' && techData.icon) ? techData.icon : 'settings';
    selectedTechnicalIcon = icon;
    setValue('technicalIcon', icon);
    updateTechnicalIconPreview();

    const title = document.getElementById('technicalModalTitle');
    if (title) title.textContent = 'Teknik Bilgi Duzenle';

    document.getElementById('technicalModal')?.classList.add('active');
};

function saveTechnical() {
    const labelTr = document.getElementById('technicalLabelTr')?.value?.trim();
    if (!labelTr) {
        showToast('Turkce baslik gerekli', 'error');
        return;
    }

    const labelEn = document.getElementById('technicalLabelEn')?.value?.trim() || labelTr;
    const labelRu = document.getElementById('technicalLabelRu')?.value?.trim() || labelTr;
    const pid = productData.id || currentProductId;

    // Get or generate key
    let key = document.getElementById('technicalKey')?.value?.trim();
    const isEditing = editingTechnicalKey !== null;

    if (!key || !isEditing) {
        key = slugify(labelTr);
        // Make sure key is unique
        let baseKey = key;
        let counter = 1;
        const existingKeys = Object.keys(productData.details?.technical || {});
        while (existingKeys.includes(key) && key !== editingTechnicalKey) {
            key = `${baseKey}_${counter}`;
            counter++;
        }
    }

    // Handle key change when editing
    if (isEditing && editingTechnicalKey !== key) {
        // Remove old key
        if (productData.details.technical) {
            delete productData.details.technical[editingTechnicalKey];
        }
        ['tr', 'en', 'ru'].forEach(lang => {
            if (translationsData[lang]?.technicalLabels) {
                delete translationsData[lang].technicalLabels[editingTechnicalKey];
            }
            if (translationsData[lang]?.products?.[pid]?.technical) {
                delete translationsData[lang].products[pid].technical[editingTechnicalKey];
            }
        });
    }

    // Get selected icon
    const icon = document.getElementById('technicalIcon')?.value || selectedTechnicalIcon || 'settings';

    // Save to product data with icon
    if (!productData.details.technical) productData.details.technical = {};
    productData.details.technical[key] = { icon };

    // Initialize translation structures
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].technicalLabels) translationsData[lang].technicalLabels = {};
        if (!translationsData[lang].products) translationsData[lang].products = {};
        if (!translationsData[lang].products[pid]) translationsData[lang].products[pid] = {};
        if (!translationsData[lang].products[pid].technical) translationsData[lang].products[pid].technical = {};
    });

    // Save labels
    translationsData.tr.technicalLabels[key] = labelTr;
    translationsData.en.technicalLabels[key] = labelEn;
    translationsData.ru.technicalLabels[key] = labelRu;

    // Save descriptions
    translationsData.tr.products[pid].technical[key] = document.getElementById('technicalDescTr')?.value || '';
    translationsData.en.products[pid].technical[key] = document.getElementById('technicalDescEn')?.value || '';
    translationsData.ru.products[pid].technical[key] = document.getElementById('technicalDescRu')?.value || '';

    closeModal('technicalModal');
    editingTechnicalKey = null;
    renderTechnical();
}

function openRollerModal() {
    setValue('rollerId', '');
    setValue('rollerTypeTr', '');
    setValue('rollerTypeEn', '');
    setValue('rollerTypeRu', '');
    setValue('rollerDescTr', '');
    setValue('rollerDescEn', '');
    setValue('rollerDescRu', '');

    // Reset icon
    selectedRollerIcon = 'circle';
    setValue('rollerIcon', 'circle');
    updateRollerIconPreview();

    const title = document.getElementById('rollerModalTitle');
    if (title) title.textContent = 'Merdane Ekle';

    document.getElementById('rollerModal')?.classList.add('active');
}

window.editRoller = function (id) {
    editingRollerId = id;
    const pid = productData.id || currentProductId;
    const roller = productData.details.rollers?.find(r => r.id === id);

    setValue('rollerId', id);
    setValue('rollerTypeTr', translationsData.tr?.products?.[pid]?.rollers?.[id]?.type || '');
    setValue('rollerTypeEn', translationsData.en?.products?.[pid]?.rollers?.[id]?.type || '');
    setValue('rollerTypeRu', translationsData.ru?.products?.[pid]?.rollers?.[id]?.type || '');
    setValue('rollerDescTr', translationsData.tr?.products?.[pid]?.rollers?.[id]?.desc || '');
    setValue('rollerDescEn', translationsData.en?.products?.[pid]?.rollers?.[id]?.desc || '');
    setValue('rollerDescRu', translationsData.ru?.products?.[pid]?.rollers?.[id]?.desc || '');

    // Load icon and update preview
    const icon = roller?.icon || 'circle';
    selectedRollerIcon = icon;
    setValue('rollerIcon', icon);
    updateRollerIconPreview();

    const title = document.getElementById('rollerModalTitle');
    if (title) title.textContent = 'Merdane Duzenle';

    document.getElementById('rollerModal')?.classList.add('active');
};

function saveRoller() {
    const typeTr = document.getElementById('rollerTypeTr')?.value?.trim();
    if (!typeTr) {
        showToast('Turkce merdane tipi gerekli', 'error');
        return;
    }

    const typeEn = document.getElementById('rollerTypeEn')?.value?.trim() || typeTr;
    const typeRu = document.getElementById('rollerTypeRu')?.value?.trim() || typeTr;
    const icon = document.getElementById('rollerIcon')?.value || selectedRollerIcon || 'circle';
    const pid = productData.id || currentProductId;

    // Get or generate ID
    let id = document.getElementById('rollerId')?.value?.trim();
    const isEditing = editingRollerId !== null;

    if (!id || !isEditing) {
        id = slugify(typeTr);
        // Make sure ID is unique
        let baseId = id;
        let counter = 1;
        const existingIds = (productData.details?.rollers || []).map(r => r.id);
        while (existingIds.includes(id) && id !== editingRollerId) {
            id = `${baseId}_${counter}`;
            counter++;
        }
    }

    // Handle ID change when editing
    if (isEditing && editingRollerId !== id) {
        // Remove old roller
        const oldIndex = productData.details.rollers?.findIndex(r => r.id === editingRollerId);
        if (oldIndex > -1) {
            productData.details.rollers.splice(oldIndex, 1);
        }
        ['tr', 'en', 'ru'].forEach(lang => {
            if (translationsData[lang]?.products?.[pid]?.rollers) {
                delete translationsData[lang].products[pid].rollers[editingRollerId];
            }
        });
    }

    // Save to product data
    if (!productData.details.rollers) productData.details.rollers = [];

    const existingIndex = productData.details.rollers.findIndex(r => r.id === id);
    if (existingIndex > -1) {
        productData.details.rollers[existingIndex] = { id, icon };
    } else {
        productData.details.rollers.push({ id, icon });
    }

    // Initialize translation structures
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].products) translationsData[lang].products = {};
        if (!translationsData[lang].products[pid]) translationsData[lang].products[pid] = {};
        if (!translationsData[lang].products[pid].rollers) translationsData[lang].products[pid].rollers = {};
    });

    // Save translations
    translationsData.tr.products[pid].rollers[id] = {
        type: typeTr,
        desc: document.getElementById('rollerDescTr')?.value || ''
    };
    translationsData.en.products[pid].rollers[id] = {
        type: typeEn,
        desc: document.getElementById('rollerDescEn')?.value || ''
    };
    translationsData.ru.products[pid].rollers[id] = {
        type: typeRu,
        desc: document.getElementById('rollerDescRu')?.value || ''
    };

    closeModal('rollerModal');
    editingRollerId = null;
    renderRollers();
}

// ==================== SAVE PRODUCT ====================

async function saveProduct() {
    // URL Slugs - sanitize helper
    const sanitizeSlug = (slug) => {
        if (!slug) return '';
        return slug
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Get Turkish slug - this will be the product ID for new products
    const slugTr = sanitizeSlug(document.getElementById('slugTr')?.value);

    if (!slugTr) {
        showToast('Turkce URL Slug gerekli', 'error');
        return;
    }

    // For new products, use Turkish slug as product ID
    // For existing products, keep the current ID
    const productId = isNewProduct ? slugTr : (currentProductId || slugTr);

    // Update hidden product ID field
    document.getElementById('productId').value = productId;

    // Collect all data
    productData.id = productId;
    productData.category = document.getElementById('productCategory')?.value || '';
    productData.categoryIcon = document.getElementById('categoryIcon')?.value || 'package';
    productData.order = parseInt(document.getElementById('productOrder')?.value) || 1;
    productData.defaultImage = document.getElementById('defaultImage')?.value || '';
    productData.details.videoUrl = document.getElementById('videoUrl')?.value || null;

    // Update translations for names and descriptions
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].productNames) translationsData[lang].productNames = {};
        if (!translationsData[lang].productShortNames) translationsData[lang].productShortNames = {};
        if (!translationsData[lang].productDescriptions) translationsData[lang].productDescriptions = {};
    });

    translationsData.tr.productNames[productId] = document.getElementById('nameTr')?.value || '';
    translationsData.en.productNames[productId] = document.getElementById('nameEn')?.value || '';
    translationsData.ru.productNames[productId] = document.getElementById('nameRu')?.value || '';

    translationsData.tr.productShortNames[productId] = document.getElementById('shortNameTr')?.value || '';
    translationsData.en.productShortNames[productId] = document.getElementById('shortNameEn')?.value || '';
    translationsData.ru.productShortNames[productId] = document.getElementById('shortNameRu')?.value || '';

    translationsData.tr.productDescriptions[productId] = document.getElementById('descriptionTr')?.value || '';
    translationsData.en.productDescriptions[productId] = document.getElementById('descriptionEn')?.value || '';
    translationsData.ru.productDescriptions[productId] = document.getElementById('descriptionRu')?.value || '';

    // URL Slugs - save
    productData.slug = {
        tr: slugTr,
        en: sanitizeSlug(document.getElementById('slugEn')?.value) || productId,
        ru: sanitizeSlug(document.getElementById('slugRu')?.value) || productId
    };

    try {
        const token = localStorage.getItem('adminToken');

        // Save product
        const productUrl = isNewProduct ? `${API_BASE}/products` : `${API_BASE}/products/${currentProductId}`;
        const productMethod = isNewProduct ? 'POST' : 'PUT';

        const productResponse = await fetch(productUrl, {
            method: productMethod,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!productResponse.ok) {
            const error = await productResponse.json();
            throw new Error(error.error || 'Urun kaydedilemedi');
        }

        // Save translations
        const translationsResponse = await fetch(`${API_BASE}/translations`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(translationsData)
        });

        if (!translationsResponse.ok) {
            throw new Error('Ceviriler kaydedilemedi');
        }

        showToast('Urun basariyla kaydedildi', 'success');

        // If new product, redirect to edit page
        if (isNewProduct) {
            setTimeout(() => {
                window.location.href = `/admin/urun-duzenle.html?id=${productId}`;
            }, 1000);
        }

    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ==================== TOAST ====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const messageEl = toast.querySelector('.toast-message');
    if (messageEl) messageEl.textContent = message;

    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== GLOBAL FUNCTIONS ====================

window.logout = function () {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/index.html';
};

// ==================== NEW FEATURES: ICONS, PRESETS, MULTI-LANGUAGE ====================

// Global variables for new features
let defaultSpecs = [];
let iconPickerCallback = null;
let selectedIcon = 'tag';

// Icon list for picker (Lucide icons)
const availableIcons = {
    measurement: ['ruler', 'move-horizontal', 'arrow-right', 'arrow-up', 'arrow-down', 'git-commit-horizontal', 'maximize-2'],
    power: ['zap', 'gauge', 'settings', 'activity', 'battery-charging'],
    structure: ['square', 'layers', 'box', 'cylinder', 'frame', 'layout'],
    wheel: ['disc', 'circle', 'circle-dot', 'rotate-cw'],
    general: ['tag', 'anchor', 'link', 'octagon', 'plus-circle', 'chevron-up', 'weight', 'check-circle', 'info', 'package']
};

// Load default specs on startup
async function loadDefaultSpecs() {
    try {
        const response = await fetch('/data/defaultSpecs.json');
        if (response.ok) {
            const data = await response.json();
            defaultSpecs = data.specs || [];
        }
    } catch (error) {
        console.error('Failed to load default specs:', error);
    }
}

// Add to initialization
const originalInit = document.addEventListener;
document.addEventListener('DOMContentLoaded', async () => {
    await loadDefaultSpecs();
    setupNewFeatures();
});

function setupNewFeatures() {
    // Add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', openCategoryModal);
    }

    // Save category button
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', saveNewCategory);
    }

    // Icon picker search
    const iconSearchInput = document.getElementById('iconSearchInput');
    if (iconSearchInput) {
        iconSearchInput.addEventListener('input', filterIcons);
    }

    // Icon category buttons
    document.querySelectorAll('.icon-category').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.icon-category').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderIconGrid(btn.dataset.category);
        });
    });

    // Spec icon button
    const specIconBtn = document.getElementById('specIconBtn');
    if (specIconBtn) {
        specIconBtn.addEventListener('click', () => {
            openIconPicker((icon) => {
                selectedIcon = icon;
                document.getElementById('specIcon').value = icon;
                updateSpecIconPreview();
            });
        });
    }

    // Preset search
    const presetSearchInput = document.getElementById('presetSearchInput');
    if (presetSearchInput) {
        presetSearchInput.addEventListener('input', filterPresets);
    }

    // Add spec button - open spec modal directly with autocomplete
    const addSpecBtn = document.getElementById('addSpecBtn');
    if (addSpecBtn) {
        addSpecBtn.removeEventListener('click', arguments.callee);
        addSpecBtn.addEventListener('click', () => {
            editingSpecKey = null;
            openSpecModal();
        });
    }

    // Spec label autocomplete
    setupSpecAutocomplete();

    // Column icon button
    const columnIconBtn = document.getElementById('columnIconBtn');
    if (columnIconBtn) {
        columnIconBtn.addEventListener('click', () => {
            openIconPicker((icon) => {
                selectedColumnIcon = icon;
                document.getElementById('columnIcon').value = icon;
                updateColumnIconPreview();
            });
        });
    }

    // Technical icon button
    const technicalIconBtn = document.getElementById('technicalIconBtn');
    if (technicalIconBtn) {
        technicalIconBtn.addEventListener('click', () => {
            openIconPicker((icon) => {
                selectedTechnicalIcon = icon;
                document.getElementById('technicalIcon').value = icon;
                updateTechnicalIconPreview();
            });
        });
    }

    // Roller icon button
    const rollerIconBtn = document.getElementById('rollerIconBtn');
    if (rollerIconBtn) {
        rollerIconBtn.addEventListener('click', () => {
            openIconPicker((icon) => {
                selectedRollerIcon = icon;
                document.getElementById('rollerIcon').value = icon;
                updateRollerIconPreview();
            });
        });
    }

    // Column preset search
    const columnPresetSearchInput = document.getElementById('columnPresetSearchInput');
    if (columnPresetSearchInput) {
        columnPresetSearchInput.addEventListener('input', filterColumnPresets);
    }

    // Add column button - open column modal directly with autocomplete
    const addColumnBtn = document.getElementById('addColumnBtn');
    if (addColumnBtn) {
        // Remove existing listeners
        const newBtn = addColumnBtn.cloneNode(true);
        addColumnBtn.parentNode.replaceChild(newBtn, addColumnBtn);
        newBtn.addEventListener('click', () => {
            editingColumnIndex = null;
            openColumnModal();
        });
    }

    // Column label autocomplete
    setupColumnAutocomplete();
}

// ==================== CATEGORY DROPDOWN ====================

// Override populateCategories for dropdown - use translations categories
const originalPopulateCategories = populateCategories;
populateCategories = function () {
    const select = document.getElementById('productCategory');
    if (!select || select.tagName !== 'SELECT') {
        if (typeof originalPopulateCategories === 'function') {
            return originalPopulateCategories();
        }
        return;
    }

    // Get categories from translations (Ceviriler sayfasinda tanimlanan kategoriler)
    const categories = translationsData.tr?.categories || {};

    // Build options
    let html = '<option value="">Kategori secin...</option>';
    Object.entries(categories).forEach(([catId, catName]) => {
        const selected = productData?.category === catId ? 'selected' : '';
        html += `<option value="${catId}" ${selected}>${catName}</option>`;
    });

    select.innerHTML = html;
};

function openCategoryModal() {
    document.getElementById('newCategoryId').value = '';
    document.getElementById('newCategoryTr').value = '';
    document.getElementById('newCategoryEn').value = '';
    document.getElementById('newCategoryRu').value = '';
    document.getElementById('categoryModal')?.classList.add('active');
}

async function saveNewCategory() {
    const catId = document.getElementById('newCategoryId')?.value?.trim().toLowerCase().replace(/\s+/g, '-');
    const catTr = document.getElementById('newCategoryTr')?.value?.trim();

    if (!catId || !catTr) {
        showToast('Kategori ID ve Turkce adi gerekli', 'error');
        return;
    }

    const catEn = document.getElementById('newCategoryEn')?.value?.trim() || catTr;
    const catRu = document.getElementById('newCategoryRu')?.value?.trim() || catTr;

    // Add to local translationsData
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].categories) translationsData[lang].categories = {};
    });

    translationsData.tr.categories[catId] = catTr;
    translationsData.en.categories[catId] = catEn;
    translationsData.ru.categories[catId] = catRu;

    // Save to API (so it appears in Ceviriler page)
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE}/translations`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(translationsData)
        });

        if (!response.ok) {
            throw new Error('Failed to save translations');
        }

        // Refresh category dropdown
        populateCategories();

        // Set as current category
        const select = document.getElementById('productCategory');
        if (select) {
            select.value = catId;
        }

        closeModal('categoryModal');
        showToast('Kategori eklendi ve kaydedildi', 'success');
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('Kategori eklenemedi: ' + error.message, 'error');
    }
}

// ==================== ICON PICKER ====================

function openIconPicker(callback) {
    iconPickerCallback = callback;
    document.getElementById('iconSearchInput').value = '';
    renderIconGrid('all');
    document.getElementById('iconPickerModal')?.classList.add('active');
}

function renderIconGrid(category = 'all') {
    const grid = document.getElementById('iconGrid');
    if (!grid) return;

    let icons = [];
    if (category === 'all') {
        Object.values(availableIcons).forEach(arr => icons.push(...arr));
    } else if (availableIcons[category]) {
        icons = availableIcons[category];
    }

    // Remove duplicates
    icons = [...new Set(icons)];

    grid.innerHTML = icons.map(icon => `
        <div class="icon-item" data-icon="${icon}" onclick="selectIcon('${icon}')">
            <i data-lucide="${icon}"></i>
            <span>${icon}</span>
        </div>
    `).join('');

    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function filterIcons() {
    const search = document.getElementById('iconSearchInput')?.value?.toLowerCase() || '';
    const items = document.querySelectorAll('#iconGrid .icon-item');

    items.forEach(item => {
        const iconName = item.dataset.icon.toLowerCase();
        item.style.display = iconName.includes(search) ? '' : 'none';
    });
}

window.selectIcon = function (icon) {
    if (iconPickerCallback) {
        iconPickerCallback(icon);
    }
    closeModal('iconPickerModal');
};

function updateSpecIconPreview() {
    const preview = document.getElementById('specIconPreview');
    if (preview && selectedIcon) {
        preview.setAttribute('data-lucide', selectedIcon);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function updateTechnicalIconPreview() {
    const preview = document.getElementById('technicalIconPreview');
    if (preview && selectedTechnicalIcon) {
        preview.setAttribute('data-lucide', selectedTechnicalIcon);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function updateRollerIconPreview() {
    const preview = document.getElementById('rollerIconPreview');
    if (preview && selectedRollerIcon) {
        preview.setAttribute('data-lucide', selectedRollerIcon);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// ==================== SPEC PRESETS ====================

function openSpecPresetModal() {
    renderPresetList();
    document.getElementById('presetSearchInput').value = '';
    document.getElementById('specPresetModal')?.classList.add('active');
}

function renderPresetList(searchTerm = '') {
    const list = document.getElementById('presetList');
    if (!list) return;

    const existingKeys = Object.keys(productData?.specs || {});

    const filteredSpecs = defaultSpecs.filter(spec => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return spec.labels.tr.toLowerCase().includes(search) ||
            spec.labels.en.toLowerCase().includes(search) ||
            spec.key.toLowerCase().includes(search);
    });

    if (filteredSpecs.length === 0) {
        list.innerHTML = '<div class="empty-placeholder">Sonuc bulunamadi</div>';
        return;
    }

    list.innerHTML = filteredSpecs.map(spec => {
        const isAdded = existingKeys.includes(spec.key);
        return `
            <div class="preset-item ${isAdded ? 'added' : ''}" onclick="${isAdded ? '' : `selectPreset('${spec.key}')`}">
                <div class="preset-icon">
                    <i data-lucide="${spec.icon}"></i>
                </div>
                <div class="preset-info">
                    <div class="preset-name">${spec.labels.tr}</div>
                    <div class="preset-translations">${spec.labels.en} / ${spec.labels.ru}</div>
                </div>
                ${spec.defaultUnit?.tr ? `<span class="preset-unit">${spec.defaultUnit.tr}</span>` : ''}
                ${isAdded ? '<span class="preset-added-badge">Eklendi</span>' : ''}
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function filterPresets() {
    const search = document.getElementById('presetSearchInput')?.value || '';
    renderPresetList(search);
}

window.selectPreset = function (key) {
    const spec = defaultSpecs.find(s => s.key === key);
    if (!spec) return;

    closeModal('specPresetModal');

    // Open spec modal with preset data
    editingSpecKey = null;
    selectedIcon = spec.icon;

    // Fill the modal
    document.getElementById('specKey').value = '';
    document.getElementById('specIcon').value = spec.icon;
    document.getElementById('specLabelTr').value = spec.labels.tr;
    document.getElementById('specLabelEn').value = spec.labels.en;
    document.getElementById('specLabelRu').value = spec.labels.ru;

    // Set default units
    document.getElementById('specValueTr').value = '';
    document.getElementById('specValueEn').value = '';
    document.getElementById('specValueRu').value = '';
    document.getElementById('specUnitTr').value = spec.defaultUnit?.tr || '';
    document.getElementById('specUnitEn').value = spec.defaultUnit?.en || '';
    document.getElementById('specUnitRu').value = spec.defaultUnit?.ru || '';

    updateSpecIconPreview();

    document.getElementById('specModalTitle').textContent = 'Ozellik Ekle';
    document.getElementById('specModal')?.classList.add('active');
};

window.openManualSpecModal = function () {
    closeModal('specPresetModal');
    editingSpecKey = null;
    openSpecModal();
};

// ==================== UPDATED SPEC MODAL ====================

// Override openSpecModal for new structure
const originalOpenSpecModal = typeof openSpecModal !== 'undefined' ? openSpecModal : null;
openSpecModal = function () {
    selectedIcon = 'tag';

    document.getElementById('specKey').value = '';
    document.getElementById('specIcon').value = 'tag';
    document.getElementById('specLabelTr').value = '';
    document.getElementById('specLabelEn').value = '';
    document.getElementById('specLabelRu').value = '';
    document.getElementById('specValueTr').value = '';
    document.getElementById('specValueEn').value = '';
    document.getElementById('specValueRu').value = '';
    document.getElementById('specUnitTr').value = '';
    document.getElementById('specUnitEn').value = '';
    document.getElementById('specUnitRu').value = '';

    updateSpecIconPreview();

    document.getElementById('specModalTitle').textContent = 'Ozellik Ekle';
    document.getElementById('specModal')?.classList.add('active');
};

// Override editSpec for new structure
window.editSpec = function (key) {
    editingSpecKey = key;
    const spec = productData?.specs?.[key];
    if (!spec) return;

    const pid = productData.id || currentProductId;

    // Get icon (from spec or default)
    selectedIcon = spec.icon || 'tag';
    document.getElementById('specIcon').value = selectedIcon;

    // Get labels from translations
    document.getElementById('specKey').value = key;
    document.getElementById('specLabelTr').value = translationsData.tr?.specLabels?.[key] || key;
    document.getElementById('specLabelEn').value = translationsData.en?.specLabels?.[key] || '';
    document.getElementById('specLabelRu').value = translationsData.ru?.specLabels?.[key] || '';

    // Handle multi-language values
    if (spec.values) {
        // New structure with per-language values
        document.getElementById('specValueTr').value = spec.values.tr?.value || '';
        document.getElementById('specValueEn').value = spec.values.en?.value || '';
        document.getElementById('specValueRu').value = spec.values.ru?.value || '';
        document.getElementById('specUnitTr').value = spec.values.tr?.unit || '';
        document.getElementById('specUnitEn').value = spec.values.en?.unit || '';
        document.getElementById('specUnitRu').value = spec.values.ru?.unit || '';
    } else {
        // Old structure - single value/unit
        document.getElementById('specValueTr').value = spec.value || '';
        document.getElementById('specValueEn').value = spec.value || '';
        document.getElementById('specValueRu').value = spec.value || '';
        document.getElementById('specUnitTr').value = spec.unit || '';
        document.getElementById('specUnitEn').value = spec.unit || '';
        document.getElementById('specUnitRu').value = spec.unit || '';
    }

    updateSpecIconPreview();

    document.getElementById('specModalTitle').textContent = 'Ozellik Duzenle';
    document.getElementById('specModal')?.classList.add('active');
};

// Override saveSpec for new structure
const originalSaveSpec = typeof saveSpec !== 'undefined' ? saveSpec : null;
saveSpec = function () {
    const labelTr = document.getElementById('specLabelTr')?.value?.trim();
    if (!labelTr) {
        showToast('Turkce ozellik adi gerekli', 'error');
        return;
    }

    const labelEn = document.getElementById('specLabelEn')?.value?.trim() || labelTr;
    const labelRu = document.getElementById('specLabelRu')?.value?.trim() || labelTr;
    const icon = document.getElementById('specIcon')?.value || 'tag';

    const valueTr = document.getElementById('specValueTr')?.value?.trim() || '';
    const valueEn = document.getElementById('specValueEn')?.value?.trim() || valueTr;
    const valueRu = document.getElementById('specValueRu')?.value?.trim() || valueTr;

    const unitTr = document.getElementById('specUnitTr')?.value?.trim() || '';
    const unitEn = document.getElementById('specUnitEn')?.value?.trim() || unitTr;
    const unitRu = document.getElementById('specUnitRu')?.value?.trim() || unitTr;

    // Generate key from label if not editing
    let key = editingSpecKey;
    if (!key) {
        key = slugify(labelTr);
        // Make unique
        let baseKey = key;
        let counter = 1;
        while (productData.specs && productData.specs[key]) {
            key = `${baseKey}_${counter}`;
            counter++;
        }
    }

    // Save to product data with new structure
    if (!productData.specs) productData.specs = {};
    productData.specs[key] = {
        icon: icon,
        values: {
            tr: { value: valueTr, unit: unitTr },
            en: { value: valueEn, unit: unitEn },
            ru: { value: valueRu, unit: unitRu }
        }
    };

    // Save labels to translations
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].specLabels) translationsData[lang].specLabels = {};
    });

    translationsData.tr.specLabels[key] = labelTr;
    translationsData.en.specLabels[key] = labelEn;
    translationsData.ru.specLabels[key] = labelRu;

    closeModal('specModal');
    editingSpecKey = null;
    renderSpecs();
};

// Override renderSpecs for new design with icons
const originalRenderSpecs = renderSpecs;
renderSpecs = function () {
    const container = document.getElementById('specsEditor');
    if (!container || !productData) return;

    const specs = productData.specs || {};
    const keys = Object.keys(specs);

    if (keys.length === 0) {
        container.innerHTML = '<div class="empty-placeholder"><span>Henuz teknik ozellik eklenmemis</span></div>';
        return;
    }

    container.innerHTML = keys.map(key => {
        const label = translationsData.tr?.specLabels?.[key] || key;
        const spec = specs[key];
        const icon = spec.icon || 'tag';

        // Handle both old and new structure
        let valueDisplay = '';
        if (spec.values) {
            // New structure
            const tr = spec.values.tr || {};
            const en = spec.values.en || {};
            valueDisplay = `TR: ${tr.value || '-'} ${tr.unit || ''} | EN: ${en.value || '-'} ${en.unit || ''}`;
        } else {
            // Old structure
            valueDisplay = `${spec.value || '-'} ${spec.unit || ''}`;
        }

        return `
            <div class="spec-item" data-key="${key}">
                <div class="spec-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="spec-info">
                    <div class="spec-label">${label}</div>
                    <div class="spec-values">${valueDisplay}</div>
                </div>
                <div class="spec-actions">
                    <button class="btn-edit" onclick="editSpec('${key}')">Duzenle</button>
                    <button class="btn-delete" onclick="deleteSpec('${key}')">Sil</button>
                </div>
            </div>
        `;
    }).join('');

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};

// ==================== VIDEO TITLE/SUBTITLE ====================

// Override populateForm to include video title/subtitle
const originalPopulateForm = populateForm;
populateForm = function () {
    if (typeof originalPopulateForm === 'function') {
        originalPopulateForm();
    }

    // Video title and subtitle
    if (productData?.details?.videoTitle) {
        setValue('videoTitleTr', productData.details.videoTitle.tr || '');
        setValue('videoTitleEn', productData.details.videoTitle.en || '');
        setValue('videoTitleRu', productData.details.videoTitle.ru || '');
    }
    if (productData?.details?.videoSubtitle) {
        setValue('videoSubtitleTr', productData.details.videoSubtitle.tr || '');
        setValue('videoSubtitleEn', productData.details.videoSubtitle.en || '');
        setValue('videoSubtitleRu', productData.details.videoSubtitle.ru || '');
    }
};

// Update saveProduct to include video title/subtitle
const originalSaveProduct = saveProduct;
saveProduct = async function () {
    // URL Slugs - sanitize helper
    const sanitizeSlug = (slug) => {
        if (!slug) return '';
        return slug
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Get Turkish slug - this will be the product ID for new products
    const slugTr = sanitizeSlug(document.getElementById('slugTr')?.value);

    if (!slugTr) {
        showToast('Turkce URL Slug gerekli', 'error');
        return;
    }

    // For new products, use Turkish slug as product ID
    // For existing products, keep the current ID
    const productId = isNewProduct ? slugTr : (currentProductId || slugTr);

    // Update hidden product ID field
    document.getElementById('productId').value = productId;

    // Collect all data
    productData.id = productId;
    productData.category = document.getElementById('productCategory')?.value || '';
    productData.categoryIcon = document.getElementById('categoryIcon')?.value || 'package';
    productData.order = parseInt(document.getElementById('productOrder')?.value) || 1;
    productData.defaultImage = document.getElementById('defaultImage')?.value || '';
    productData.details.videoUrl = document.getElementById('videoUrl')?.value || null;

    // Video title/subtitle
    const videoTitleTr = document.getElementById('videoTitleTr')?.value?.trim();
    const videoTitleEn = document.getElementById('videoTitleEn')?.value?.trim();
    const videoTitleRu = document.getElementById('videoTitleRu')?.value?.trim();
    const videoSubtitleTr = document.getElementById('videoSubtitleTr')?.value?.trim();
    const videoSubtitleEn = document.getElementById('videoSubtitleEn')?.value?.trim();
    const videoSubtitleRu = document.getElementById('videoSubtitleRu')?.value?.trim();

    if (videoTitleTr || videoTitleEn || videoTitleRu) {
        productData.details.videoTitle = {
            tr: videoTitleTr || '',
            en: videoTitleEn || '',
            ru: videoTitleRu || ''
        };
    }
    if (videoSubtitleTr || videoSubtitleEn || videoSubtitleRu) {
        productData.details.videoSubtitle = {
            tr: videoSubtitleTr || '',
            en: videoSubtitleEn || '',
            ru: videoSubtitleRu || ''
        };
    }

    // Update translations for names and descriptions
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].productNames) translationsData[lang].productNames = {};
        if (!translationsData[lang].productShortNames) translationsData[lang].productShortNames = {};
        if (!translationsData[lang].productDescriptions) translationsData[lang].productDescriptions = {};
    });

    translationsData.tr.productNames[productId] = document.getElementById('nameTr')?.value || '';
    translationsData.en.productNames[productId] = document.getElementById('nameEn')?.value || '';
    translationsData.ru.productNames[productId] = document.getElementById('nameRu')?.value || '';

    translationsData.tr.productShortNames[productId] = document.getElementById('shortNameTr')?.value || '';
    translationsData.en.productShortNames[productId] = document.getElementById('shortNameEn')?.value || '';
    translationsData.ru.productShortNames[productId] = document.getElementById('shortNameRu')?.value || '';

    translationsData.tr.productDescriptions[productId] = document.getElementById('descriptionTr')?.value || '';
    translationsData.en.productDescriptions[productId] = document.getElementById('descriptionEn')?.value || '';
    translationsData.ru.productDescriptions[productId] = document.getElementById('descriptionRu')?.value || '';

    // URL Slugs - save
    productData.slug = {
        tr: slugTr,
        en: sanitizeSlug(document.getElementById('slugEn')?.value) || productId,
        ru: sanitizeSlug(document.getElementById('slugRu')?.value) || productId
    };

    try {
        const token = localStorage.getItem('adminToken');

        // Save product
        const productUrl = isNewProduct ? `${API_BASE}/products` : `${API_BASE}/products/${currentProductId}`;
        const productMethod = isNewProduct ? 'POST' : 'PUT';

        const productResponse = await fetch(productUrl, {
            method: productMethod,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!productResponse.ok) {
            const error = await productResponse.json();
            throw new Error(error.error || 'Urun kaydedilemedi');
        }

        // Save translations
        const translationsResponse = await fetch(`${API_BASE}/translations`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(translationsData)
        });

        if (!translationsResponse.ok) {
            throw new Error('Ceviriler kaydedilemedi');
        }

        showToast('Urun basariyla kaydedildi', 'success');

        // If new product, redirect to edit page
        if (isNewProduct) {
            setTimeout(() => {
                window.location.href = `/admin/urun-duzenle.html?id=${productId}`;
            }, 1000);
        }

    } catch (error) {
        showToast(error.message, 'error');
    }
};

// ==================== COLUMN PRESETS ====================

function openColumnPresetModal() {
    renderColumnPresetList();
    document.getElementById('columnPresetSearchInput').value = '';
    document.getElementById('columnPresetModal')?.classList.add('active');
}

function renderColumnPresetList(searchTerm = '') {
    const list = document.getElementById('columnPresetList');
    if (!list) return;

    // Get existing column keys
    const existingKeys = (productData?.tableColumns || []).map(c => c.key);

    const filteredSpecs = defaultSpecs.filter(spec => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return spec.labels.tr.toLowerCase().includes(search) ||
            spec.labels.en.toLowerCase().includes(search) ||
            spec.key.toLowerCase().includes(search);
    });

    if (filteredSpecs.length === 0) {
        list.innerHTML = '<div class="empty-placeholder">Sonuc bulunamadi</div>';
        return;
    }

    list.innerHTML = filteredSpecs.map(spec => {
        const isAdded = existingKeys.includes(spec.key);
        return `
            <div class="preset-item ${isAdded ? 'added' : ''}" onclick="${isAdded ? '' : `selectColumnPreset('${spec.key}')`}">
                <div class="preset-icon">
                    <i data-lucide="${spec.icon}"></i>
                </div>
                <div class="preset-info">
                    <div class="preset-name">${spec.labels.tr}</div>
                    <div class="preset-translations">${spec.labels.en} / ${spec.labels.ru}</div>
                </div>
                ${spec.defaultUnit?.tr ? `<span class="preset-unit">${spec.defaultUnit.tr}</span>` : ''}
                ${isAdded ? '<span class="preset-added-badge">Eklendi</span>' : ''}
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function filterColumnPresets() {
    const search = document.getElementById('columnPresetSearchInput')?.value || '';
    renderColumnPresetList(search);
}

window.selectColumnPreset = function (key) {
    const spec = defaultSpecs.find(s => s.key === key);
    if (!spec) return;

    closeModal('columnPresetModal');

    // Open column modal with preset data
    editingColumnIndex = null;
    selectedColumnIcon = spec.icon;

    // Fill the modal
    document.getElementById('columnKey').value = spec.key;
    document.getElementById('columnIcon').value = spec.icon;
    document.getElementById('columnUnit').value = spec.defaultUnit?.tr || '';
    document.getElementById('columnHighlighted').checked = false;

    updateColumnIconPreview();

    document.getElementById('columnModalTitle').textContent = 'Tablo Sutunu Ekle';
    document.getElementById('columnModal')?.classList.add('active');

    // Add labels to translations
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].modelSpecs) translationsData[lang].modelSpecs = {};
        if (!translationsData[lang].modelSpecs[spec.key]) {
            translationsData[lang].modelSpecs[spec.key] = spec.labels[lang];
        }
    });
};

window.openManualColumnModal = function () {
    closeModal('columnPresetModal');
    editingColumnIndex = null;
    openColumnModal();
};

// Make functions globally available
window.openColumnPresetModal = openColumnPresetModal;
window.filterColumnPresets = filterColumnPresets;

// ==================== SPEC AUTOCOMPLETE ====================

function setupSpecAutocomplete() {
    const input = document.getElementById('specLabelTr');
    const dropdown = document.getElementById('specAutocomplete');
    if (!input || !dropdown) return;

    let debounceTimer;

    // Show suggestions on input
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = input.value.trim().toLowerCase();
            renderSpecAutocomplete(searchTerm);
        }, 150);
    });

    // Show dropdown on focus (if has value)
    input.addEventListener('focus', () => {
        const searchTerm = input.value.trim().toLowerCase();
        if (searchTerm.length > 0 || defaultSpecs.length > 0) {
            renderSpecAutocomplete(searchTerm);
        }
    });

    // Hide dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

function renderSpecAutocomplete(searchTerm = '') {
    const dropdown = document.getElementById('specAutocomplete');
    if (!dropdown) return;

    let filtered = defaultSpecs;
    if (searchTerm) {
        filtered = defaultSpecs.filter(spec => {
            const trLabel = (spec.labels?.tr || '').toLowerCase();
            const enLabel = (spec.labels?.en || '').toLowerCase();
            const key = (spec.key || '').toLowerCase();
            return trLabel.includes(searchTerm) || enLabel.includes(searchTerm) || key.includes(searchTerm);
        });
    }

    // Limit to first 10 results
    filtered = filtered.slice(0, 10);

    if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-empty">Sonuc bulunamadi - ozel deger girin</div>';
        dropdown.classList.add('active');
        return;
    }

    dropdown.innerHTML = filtered.map(spec => `
        <div class="autocomplete-item" onclick="selectSpecAutocomplete('${spec.key}')">
            <div class="autocomplete-item-icon">
                <i data-lucide="${spec.icon || 'tag'}"></i>
            </div>
            <div class="autocomplete-item-content">
                <div class="autocomplete-item-name">${spec.labels?.tr || spec.key}</div>
                <div class="autocomplete-item-key">${spec.key}</div>
            </div>
        </div>
    `).join('');

    dropdown.classList.add('active');

    // Initialize Lucide icons in dropdown
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

window.selectSpecAutocomplete = function (key) {
    const spec = defaultSpecs.find(s => s.key === key);
    if (!spec) return;

    // Fill in all the fields
    document.getElementById('specKey').value = spec.key;
    document.getElementById('specLabelTr').value = spec.labels?.tr || spec.key;
    document.getElementById('specLabelEn').value = spec.labels?.en || '';
    document.getElementById('specLabelRu').value = spec.labels?.ru || '';

    // Set icon
    selectedIcon = spec.icon || 'tag';
    document.getElementById('specIcon').value = selectedIcon;
    updateSpecIconPreview();

    // Set default units
    document.getElementById('specUnitTr').value = spec.defaultUnit?.tr || '';
    document.getElementById('specUnitEn').value = spec.defaultUnit?.en || '';
    document.getElementById('specUnitRu').value = spec.defaultUnit?.ru || '';

    // Hide dropdown
    document.getElementById('specAutocomplete')?.classList.remove('active');

    // Add labels to translations
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].specLabels) translationsData[lang].specLabels = {};
        if (!translationsData[lang].specLabels[spec.key]) {
            translationsData[lang].specLabels[spec.key] = spec.labels[lang];
        }
    });
};

// ==================== COLUMN AUTOCOMPLETE ====================

function setupColumnAutocomplete() {
    const input = document.getElementById('columnLabelTr');
    const dropdown = document.getElementById('columnAutocomplete');
    if (!input || !dropdown) return;

    let debounceTimer;

    // Show suggestions on input
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = input.value.trim().toLowerCase();
            renderColumnAutocomplete(searchTerm);
        }, 150);
    });

    // Show dropdown on focus (if has value)
    input.addEventListener('focus', () => {
        const searchTerm = input.value.trim().toLowerCase();
        if (searchTerm.length > 0 || defaultSpecs.length > 0) {
            renderColumnAutocomplete(searchTerm);
        }
    });

    // Hide dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

function renderColumnAutocomplete(searchTerm = '') {
    const dropdown = document.getElementById('columnAutocomplete');
    if (!dropdown) return;

    let filtered = defaultSpecs;
    if (searchTerm) {
        filtered = defaultSpecs.filter(spec => {
            const trLabel = (spec.labels?.tr || '').toLowerCase();
            const enLabel = (spec.labels?.en || '').toLowerCase();
            const key = (spec.key || '').toLowerCase();
            return trLabel.includes(searchTerm) || enLabel.includes(searchTerm) || key.includes(searchTerm);
        });
    }

    // Limit to first 10 results
    filtered = filtered.slice(0, 10);

    if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-empty">Sonuc bulunamadi - ozel deger girin</div>';
        dropdown.classList.add('active');
        return;
    }

    dropdown.innerHTML = filtered.map(spec => `
        <div class="autocomplete-item" onclick="selectColumnAutocomplete('${spec.key}')">
            <div class="autocomplete-item-icon">
                <i data-lucide="${spec.icon || 'tag'}"></i>
            </div>
            <div class="autocomplete-item-content">
                <div class="autocomplete-item-name">${spec.labels?.tr || spec.key}</div>
                <div class="autocomplete-item-key">${spec.key}</div>
            </div>
        </div>
    `).join('');

    dropdown.classList.add('active');

    // Initialize Lucide icons in dropdown
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

window.selectColumnAutocomplete = function (key) {
    const spec = defaultSpecs.find(s => s.key === key);
    if (!spec) return;

    // Fill in all the fields
    document.getElementById('columnKey').value = spec.key;
    document.getElementById('columnLabelTr').value = spec.labels?.tr || spec.key;
    document.getElementById('columnLabelEn').value = spec.labels?.en || '';
    document.getElementById('columnLabelRu').value = spec.labels?.ru || '';

    // Set icon
    selectedColumnIcon = spec.icon || 'tag';
    document.getElementById('columnIcon').value = selectedColumnIcon;
    updateColumnIconPreview();

    // Set default unit (TR only for columns)
    document.getElementById('columnUnit').value = spec.defaultUnit?.tr || '';

    // Hide dropdown
    document.getElementById('columnAutocomplete')?.classList.remove('active');

    // Add labels to translations
    ['tr', 'en', 'ru'].forEach(lang => {
        if (!translationsData[lang]) translationsData[lang] = {};
        if (!translationsData[lang].modelSpecs) translationsData[lang].modelSpecs = {};
        if (!translationsData[lang].modelSpecs[spec.key]) {
            translationsData[lang].modelSpecs[spec.key] = spec.labels[lang];
        }
    });
};

// ==================== CATEGORY ICON PICKER ====================

// Update category icon preview
function updateCategoryIconPreview(iconName) {
    const preview = document.getElementById('categoryIconPreview');
    const nameEl = document.getElementById('categoryIconName');

    if (preview) {
        preview.setAttribute('data-lucide', iconName);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    if (nameEl) {
        nameEl.textContent = iconName;
    }
}

// Category icon picker - common icons for agriculture
const categoryIconOptions = [
    'package', 'box', 'truck', 'tractor', 'disc-3', 'grip', 'anchor',
    'arrow-down-to-line', 'layers', 'settings-2', 'wrench', 'cog',
    'component', 'move-horizontal', 'move-vertical', 'gauge',
    'circle-dot', 'hexagon', 'square', 'triangle', 'diamond',
    'sprout', 'leaf', 'sun', 'droplet', 'wind', 'mountain',
    'factory', 'hammer', 'drill', 'ruler', 'scale', 'timer',
    'arrow-up-down', 'maximize-2', 'minimize-2', 'rotate-cw'
];

// Initialize category icon picker
function initCategoryIconPicker() {
    const iconBtn = document.getElementById('categoryIconBtn');
    if (!iconBtn) return;

    iconBtn.addEventListener('click', () => {
        openCategoryIconModal();
    });
}

// Open icon picker modal for category
function openCategoryIconModal() {
    // Create modal if not exists
    let modal = document.getElementById('categoryIconModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'categoryIconModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content icon-picker-modal">
                <div class="modal-header">
                    <h3>Ikon Sec</h3>
                    <button class="modal-close" onclick="closeCategoryIconModal()">
                        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="icon-search-wrapper">
                        <input type="text" id="categoryIconSearch" placeholder="Ikon ara..." class="icon-search-input">
                    </div>
                    <div class="icon-grid" id="categoryIconGrid">
                        ${categoryIconOptions.map(icon => `
                            <button type="button" class="icon-grid-item" data-icon="${icon}" onclick="selectCategoryIcon('${icon}')">
                                <i data-lucide="${icon}"></i>
                                <span>${icon}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Initialize icons in modal
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Search functionality
        const searchInput = modal.querySelector('#categoryIconSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const items = modal.querySelectorAll('.icon-grid-item');
                items.forEach(item => {
                    const iconName = item.dataset.icon;
                    item.style.display = iconName.includes(query) ? '' : 'none';
                });
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCategoryIconModal();
        });
    }

    modal.classList.add('active');
}

// Close category icon modal
function closeCategoryIconModal() {
    const modal = document.getElementById('categoryIconModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Select category icon
function selectCategoryIcon(iconName) {
    document.getElementById('categoryIcon').value = iconName;
    updateCategoryIconPreview(iconName);
    closeCategoryIconModal();
}

// Make functions global
window.selectCategoryIcon = selectCategoryIcon;
window.closeCategoryIconModal = closeCategoryIconModal;

// Initialize category icon picker on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initCategoryIconPicker();
    }, 100);
});

})();
