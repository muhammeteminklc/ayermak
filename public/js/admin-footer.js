// Admin Footer Management
let footerData = null;
let currentLang = 'tr';
let originalData = null;

// Social media icon definitions
const socialIcons = {
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    if (window.renderAdminSidebar) {
        const sidebar = document.getElementById('adminSidebar');
        if (sidebar) renderAdminSidebar(sidebar);
    }

    await loadFooterData();
    setupLangTabs();
    renderForm();
    updatePreview();
});

// Setup language tabs
function setupLangTabs() {
    document.querySelectorAll('.lang-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentLang = tab.dataset.lang;
            renderForm();
            updatePreview();
        });
    });
}

// Load footer data from API
async function loadFooterData() {
    try {
        const response = await fetch('/api/footer');
        footerData = await response.json();
        originalData = JSON.parse(JSON.stringify(footerData));
    } catch (error) {
        console.error('Error loading footer data:', error);
        showToast('Footer verileri yüklenirken hata oluştu', 'error');
    }
}

// Render form with current data
function renderForm() {
    if (!footerData) return;

    // Company description
    const descEl = document.getElementById('companyDescription');
    if (descEl) {
        descEl.value = footerData.companyInfo?.description?.[currentLang] || '';
    }

    // Contact info
    document.getElementById('contactEnabled').checked = footerData.contactInfo?.enabled !== false;
    // Support multiple phones - display as formatted string
    if (footerData.contactInfo?.phones && footerData.contactInfo.phones.length > 0) {
        const phonesStr = footerData.contactInfo.phones.map(p => p.number).join('\n');
        document.getElementById('contactPhone').value = phonesStr;
    } else {
        document.getElementById('contactPhone').value = footerData.contactInfo?.phone || '';
    }
    document.getElementById('contactEmail').value = footerData.contactInfo?.email || '';
    document.getElementById('contactAddress').value = footerData.contactInfo?.address?.[currentLang] || '';

    // Social links
    document.getElementById('socialEnabled').checked = footerData.socialLinks?.enabled !== false;
    renderSocialLinks();

    // Menu sections
    renderMenuSections();

    // Legal links
    document.getElementById('legalEnabled').checked = footerData.legalLinks?.enabled !== false;
    renderLegalLinks();

    // Copyright
    document.getElementById('copyrightText').value = footerData.copyright?.text?.[currentLang] || '';

    // Add input event listeners for live preview
    setupInputListeners();
}

// Setup input listeners for live preview
function setupInputListeners() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.removeEventListener('input', handleInputChange);
        input.addEventListener('input', handleInputChange);
    });
}

function handleInputChange() {
    collectFormData();
    updatePreview();
}

// Collect form data into footerData object
function collectFormData() {
    if (!footerData) return;

    // Company description
    if (!footerData.companyInfo) footerData.companyInfo = { description: {} };
    if (!footerData.companyInfo.description) footerData.companyInfo.description = {};
    footerData.companyInfo.description[currentLang] = document.getElementById('companyDescription').value;

    // Contact info
    if (!footerData.contactInfo) footerData.contactInfo = {};
    footerData.contactInfo.enabled = document.getElementById('contactEnabled').checked;
    // Parse multiple phones from textarea (one per line)
    const phoneInput = document.getElementById('contactPhone').value;
    const phoneLines = phoneInput.split('\n').filter(p => p.trim());
    if (phoneLines.length > 0) {
        footerData.contactInfo.phones = phoneLines.map((num, idx) => ({
            number: num.trim(),
            label: { tr: idx === 0 ? 'Sabit Hat' : 'Mobil', en: idx === 0 ? 'Landline' : 'Mobile', ru: idx === 0 ? 'Стационарный' : 'Мобильный' }
        }));
    }
    footerData.contactInfo.email = document.getElementById('contactEmail').value;
    if (!footerData.contactInfo.address) footerData.contactInfo.address = {};
    footerData.contactInfo.address[currentLang] = document.getElementById('contactAddress').value;

    // Social links enabled
    if (!footerData.socialLinks) footerData.socialLinks = { items: [] };
    footerData.socialLinks.enabled = document.getElementById('socialEnabled').checked;

    // Collect social links
    const socialItems = [];
    document.querySelectorAll('.social-item').forEach(item => {
        socialItems.push({
            id: item.dataset.id,
            name: item.querySelector('.social-name').value,
            url: item.querySelector('.social-url').value,
            icon: item.dataset.icon || 'facebook',
            enabled: item.querySelector('.social-enabled').checked
        });
    });
    footerData.socialLinks.items = socialItems;

    // Collect menu sections
    const menuSections = [];
    document.querySelectorAll('.menu-section-card').forEach(section => {
        const sectionId = section.dataset.id;
        const titleInput = section.querySelector('.section-title-input');
        
        const links = [];
        section.querySelectorAll('.link-item').forEach(linkItem => {
            const textInput = linkItem.querySelector('.link-text');
            const urlInput = linkItem.querySelector('.link-url');
            
            // Find existing link data to preserve other language translations
            const existingSection = footerData.menuSections?.find(s => s.id === sectionId);
            const existingLink = existingSection?.links?.find(l => l.id === linkItem.dataset.id);
            
            const linkData = {
                id: linkItem.dataset.id,
                text: existingLink?.text || {},
                url: urlInput.value
            };
            linkData.text[currentLang] = textInput.value;
            
            links.push(linkData);
        });

        // Find existing section to preserve other language titles
        const existingSection = footerData.menuSections?.find(s => s.id === sectionId);
        const sectionData = {
            id: sectionId,
            title: existingSection?.title || {},
            links: links
        };
        sectionData.title[currentLang] = titleInput.value;
        
        menuSections.push(sectionData);
    });
    footerData.menuSections = menuSections;

    // Legal links enabled
    if (!footerData.legalLinks) footerData.legalLinks = { items: [] };
    footerData.legalLinks.enabled = document.getElementById('legalEnabled').checked;

    // Collect legal links
    const legalItems = [];
    document.querySelectorAll('.legal-item').forEach(item => {
        const existingItem = footerData.legalLinks.items?.find(i => i.id === item.dataset.id);
        const legalData = {
            id: item.dataset.id,
            text: existingItem?.text || {},
            url: item.querySelector('.legal-url').value
        };
        legalData.text[currentLang] = item.querySelector('.legal-text').value;
        legalItems.push(legalData);
    });
    footerData.legalLinks.items = legalItems;

    // Copyright
    if (!footerData.copyright) footerData.copyright = { text: {} };
    if (!footerData.copyright.text) footerData.copyright.text = {};
    footerData.copyright.text[currentLang] = document.getElementById('copyrightText').value;
}

// Render social links
function renderSocialLinks() {
    const container = document.getElementById('socialLinksList');
    if (!container) return;

    const items = footerData.socialLinks?.items || [];
    
    container.innerHTML = items.map((item, index) => `
        <div class="item-card social-item" data-id="${item.id}" data-icon="${item.icon || 'facebook'}">
            <div class="item-card-header">
                <span class="item-card-title">${item.name || 'Sosyal Medya'}</span>
                <div class="item-card-actions">
                    <div class="switch-container" style="margin-right: 8px;">
                        <label class="switch" style="width: 40px; height: 22px;">
                            <input type="checkbox" class="social-enabled" ${item.enabled !== false ? 'checked' : ''}>
                            <span class="switch-slider" style="--switch-before-size: 16px;"></span>
                        </label>
                    </div>
                    <button type="button" class="icon-button icon-button-danger" onclick="removeSocialLink('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Platform</label>
                    <input type="text" class="social-name" value="${item.name || ''}" placeholder="Platform adı" onchange="handleInputChange()">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>URL</label>
                    <input type="url" class="social-url" value="${item.url || ''}" placeholder="https://..." onchange="handleInputChange()">
                </div>
            </div>
            <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
                <label>İkon</label>
                <div class="social-icon-picker">
                    ${Object.keys(socialIcons).map(icon => `
                        <button type="button" class="social-icon-btn ${item.icon === icon ? 'active' : ''}" 
                            data-icon="${icon}" onclick="selectSocialIcon(this, '${item.id}')">
                            ${socialIcons[icon]}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Select social icon
function selectSocialIcon(btn, itemId) {
    const container = btn.closest('.social-item');
    container.querySelectorAll('.social-icon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    container.dataset.icon = btn.dataset.icon;
    handleInputChange();
}

// Add social link
function addSocialLink() {
    if (!footerData.socialLinks) footerData.socialLinks = { enabled: true, items: [] };
    if (!footerData.socialLinks.items) footerData.socialLinks.items = [];

    const newId = 'social-' + Date.now();
    footerData.socialLinks.items.push({
        id: newId,
        name: '',
        url: '',
        icon: 'facebook',
        enabled: true
    });

    renderSocialLinks();
    setupInputListeners();
    updatePreview();
}

// Remove social link
function removeSocialLink(id) {
    if (!footerData.socialLinks?.items) return;
    footerData.socialLinks.items = footerData.socialLinks.items.filter(item => item.id !== id);
    renderSocialLinks();
    setupInputListeners();
    updatePreview();
}

// Render menu sections
function renderMenuSections() {
    const container = document.getElementById('menuSectionsList');
    if (!container) return;

    const sections = footerData.menuSections || [];

    container.innerHTML = sections.map((section, sIndex) => `
        <div class="menu-section-card" data-id="${section.id}">
            <div class="menu-section-header">
                <div class="form-group" style="margin: 0; flex: 1;">
                    <input type="text" class="section-title-input" value="${section.title?.[currentLang] || ''}" 
                        placeholder="Bölüm başlığı" style="font-weight: 600;" onchange="handleInputChange()">
                </div>
                <button type="button" class="icon-button icon-button-danger" style="margin-left: 12px;" 
                    onclick="removeMenuSection('${section.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
            <div class="menu-section-body">
                <div class="links-container">
                    ${(section.links || []).map((link, lIndex) => `
                        <div class="link-item" data-id="${link.id}">
                            <input type="text" class="link-text" value="${link.text?.[currentLang] || ''}" 
                                placeholder="Link metni" onchange="handleInputChange()">
                            <input type="text" class="link-url" value="${link.url || ''}" 
                                placeholder="/sayfa-url" onchange="handleInputChange()">
                            <button type="button" class="icon-button icon-button-danger" 
                                onclick="removeMenuLink('${section.id}', '${link.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="add-btn" style="margin-top: 8px;" onclick="addMenuLink('${section.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Link Ekle
                </button>
            </div>
        </div>
    `).join('');
}

// Add menu section
function addMenuSection() {
    if (!footerData.menuSections) footerData.menuSections = [];

    const newId = 'section-' + Date.now();
    footerData.menuSections.push({
        id: newId,
        title: { tr: '', en: '', ru: '' },
        links: []
    });

    renderMenuSections();
    setupInputListeners();
    updatePreview();
}

// Remove menu section
function removeMenuSection(sectionId) {
    if (!footerData.menuSections) return;
    footerData.menuSections = footerData.menuSections.filter(s => s.id !== sectionId);
    renderMenuSections();
    setupInputListeners();
    updatePreview();
}

// Add menu link
function addMenuLink(sectionId) {
    const section = footerData.menuSections?.find(s => s.id === sectionId);
    if (!section) return;
    if (!section.links) section.links = [];

    const newId = 'link-' + Date.now();
    section.links.push({
        id: newId,
        text: { tr: '', en: '', ru: '' },
        url: ''
    });

    renderMenuSections();
    setupInputListeners();
    updatePreview();
}

// Remove menu link
function removeMenuLink(sectionId, linkId) {
    const section = footerData.menuSections?.find(s => s.id === sectionId);
    if (!section?.links) return;
    section.links = section.links.filter(l => l.id !== linkId);
    renderMenuSections();
    setupInputListeners();
    updatePreview();
}

// Render legal links
function renderLegalLinks() {
    const container = document.getElementById('legalLinksList');
    if (!container) return;

    const items = footerData.legalLinks?.items || [];

    container.innerHTML = items.map((item, index) => `
        <div class="item-card legal-item" data-id="${item.id}">
            <div class="item-card-header">
                <span class="item-card-title">${item.text?.[currentLang] || 'Yasal Link'}</span>
                <button type="button" class="icon-button icon-button-danger" onclick="removeLegalLink('${item.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group" style="margin-bottom: 0;">
                    <label>Metin</label>
                    <input type="text" class="legal-text" value="${item.text?.[currentLang] || ''}" 
                        placeholder="Link metni" onchange="handleInputChange()">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>URL</label>
                    <input type="text" class="legal-url" value="${item.url || ''}" 
                        placeholder="/sayfa-url" onchange="handleInputChange()">
                </div>
            </div>
        </div>
    `).join('');
}

// Add legal link
function addLegalLink() {
    if (!footerData.legalLinks) footerData.legalLinks = { enabled: true, items: [] };
    if (!footerData.legalLinks.items) footerData.legalLinks.items = [];

    const newId = 'legal-' + Date.now();
    footerData.legalLinks.items.push({
        id: newId,
        text: { tr: '', en: '', ru: '' },
        url: ''
    });

    renderLegalLinks();
    setupInputListeners();
    updatePreview();
}

// Remove legal link
function removeLegalLink(id) {
    if (!footerData.legalLinks?.items) return;
    footerData.legalLinks.items = footerData.legalLinks.items.filter(item => item.id !== id);
    renderLegalLinks();
    setupInputListeners();
    updatePreview();
}

// Update preview
function updatePreview() {
    const preview = document.getElementById('footerPreview');
    if (!preview || !footerData) return;

    const year = new Date().getFullYear();
    const copyrightText = (footerData.copyright?.text?.[currentLang] || '© {year} AYERMAK')
        .replace('{year}', year);

    let html = `<div class="preview-title">Footer Önizleme (${currentLang.toUpperCase()})</div>`;
    html += '<div class="preview-footer">';

    // Company info
    html += `
        <div class="preview-col">
            <h4 style="margin-bottom: 8px;">
                <img src="/images/ayermak.png" alt="AYERMAK" style="height: 28px; filter: brightness(0) invert(1);">
            </h4>
            <p style="font-size: 12px; line-height: 1.5;">${footerData.companyInfo?.description?.[currentLang] || ''}</p>
        </div>
    `;

    // Menu sections
    (footerData.menuSections || []).forEach(section => {
        html += `
            <div class="preview-col">
                <h4>${section.title?.[currentLang] || 'Başlık'}</h4>
                ${(section.links || []).map(link => `
                    <a href="#">${link.text?.[currentLang] || 'Link'}</a>
                `).join('')}
            </div>
        `;
    });

    // Contact info
    if (footerData.contactInfo?.enabled !== false) {
        html += `
            <div class="preview-col">
                <h4>${currentLang === 'tr' ? 'İletişim' : currentLang === 'en' ? 'Contact' : 'Контакты'}</h4>
                ${footerData.contactInfo?.phones ? footerData.contactInfo.phones.map(p => `<p>${p.number}</p>`).join('') : (footerData.contactInfo?.phone ? `<p>${footerData.contactInfo.phone}</p>` : '')}
                ${footerData.contactInfo?.email ? `<p>${footerData.contactInfo.email}</p>` : ''}
            </div>
        `;
    }

    html += '</div>';

    // Copyright
    html += `
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.4);">${copyrightText}</p>
        </div>
    `;

    preview.innerHTML = html;
}

// Save footer data
async function saveFooter() {
    try {
        collectFormData();

        const response = await fetch('/api/footer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(footerData)
        });

        if (!response.ok) throw new Error('Save failed');

        const savedData = await response.json();
        footerData = savedData;
        originalData = JSON.parse(JSON.stringify(savedData));

        showToast('Footer başarıyla kaydedildi', 'success');
    } catch (error) {
        console.error('Error saving footer:', error);
        showToast('Footer kaydedilirken hata oluştu', 'error');
    }
}

// Reset changes
function resetChanges() {
    if (originalData) {
        footerData = JSON.parse(JSON.stringify(originalData));
        renderForm();
        updatePreview();
        showToast('Değişiklikler sıfırlandı', 'info');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 14px 24px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;

    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

