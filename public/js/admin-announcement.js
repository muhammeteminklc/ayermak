/**
 * AYERMAK Admin - Announcement Management
 */
(function () {
    const API_BASE = '/api';
    const LANGS = ['tr', 'en', 'ru'];

    let announcementData = null;
    let activeLang = 'tr';

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initAnnouncementEditor);

    async function initAnnouncementEditor() {
        // Check if on announcement page
        if (!window.location.pathname.includes('announcement')) {
            return;
        }

        // Check authentication
        if (typeof checkAuth === 'function') {
            const authed = await checkAuth();
            if (!authed) return;
        }

        setupLangTabs();
        setupImageUpload();
        setupToggle();
        setupSaveButton();

        await loadAnnouncementData();
    }

    async function loadAnnouncementData() {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE}/announcement/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load announcement data');
            }

            announcementData = await response.json();
            populateForm(announcementData);
        } catch (error) {
            console.error('Error loading announcement:', error);
            showToast('Duyuru verileri yuklenemedi', 'error');
        }
    }

    function populateForm(data) {
        // Enabled toggle
        const enabledEl = document.getElementById('popupEnabled');
        if (enabledEl) {
            enabledEl.checked = data.enabled || false;
            updateStatusBadge();
        }

        // Multi-language fields
        LANGS.forEach(lang => {
            const titleEl = document.getElementById(`title${capitalize(lang)}`);
            const descEl = document.getElementById(`description${capitalize(lang)}`);
            const btnTextEl = document.getElementById(`buttonText${capitalize(lang)}`);

            if (titleEl) titleEl.value = data.title?.[lang] || '';
            if (descEl) descEl.value = data.description?.[lang] || '';
            if (btnTextEl) btnTextEl.value = data.button?.text?.[lang] || '';
        });

        // Button links (3 languages)
        const linkTrEl = document.getElementById('buttonLinkTr');
        const linkEnEl = document.getElementById('buttonLinkEn');
        const linkRuEl = document.getElementById('buttonLinkRu');

        // Support both old single link format and new multi-language format
        const defaultLink = data.button?.link || '';
        if (linkTrEl) linkTrEl.value = data.button?.links?.tr || defaultLink;
        if (linkEnEl) linkEnEl.value = data.button?.links?.en || defaultLink;
        if (linkRuEl) linkRuEl.value = data.button?.links?.ru || defaultLink;

        // Display settings
        const maxShowEl = document.getElementById('maxShowCount');
        const resetEl = document.getElementById('resetIntervalHours');

        if (maxShowEl) maxShowEl.value = data.displaySettings?.maxViewsPerUser || 3;
        if (resetEl) resetEl.value = Math.round((data.displaySettings?.resetIntervalMinutes || 180) / 60);

        // Image
        if (data.image) {
            document.getElementById('popupImage').value = data.image;
            showImagePreview(data.image);
        }
    }

    function setupLangTabs() {
        const tabs = document.querySelectorAll('.lang-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const lang = tab.dataset.lang;
                switchLang(lang);
            });
        });
    }

    function switchLang(lang) {
        if (!lang || activeLang === lang) return;
        activeLang = lang;

        // Update tab styles
        document.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });

        // Show/hide content
        document.querySelectorAll('.lang-content').forEach(section => {
            section.classList.remove('active');
        });

        const target = document.getElementById(`fields-${lang}`);
        if (target) {
            target.classList.add('active');
        }
    }

    function setupToggle() {
        const toggle = document.getElementById('popupEnabled');
        if (toggle) {
            toggle.addEventListener('change', updateStatusBadge);
        }
    }

    function updateStatusBadge() {
        const enabled = document.getElementById('popupEnabled')?.checked;
        const badge = document.getElementById('statusBadge');
        if (badge) {
            badge.className = `status-badge ${enabled ? 'active' : 'inactive'}`;
            badge.textContent = enabled ? 'Aktif' : 'Pasif';
        }
    }

    function setupImageUpload() {
        const zone = document.getElementById('imageUploadZone');
        const input = document.getElementById('imageInput');
        const removeBtn = document.getElementById('removeImageBtn');

        if (!zone || !input) return;

        // Click to upload
        zone.addEventListener('click', (e) => {
            if (e.target.closest('.image-remove-btn')) return;
            input.click();
        });

        // File selected
        input.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await uploadImage(file);
        });

        // Drag & drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.style.borderColor = '#E8A824';
        });

        zone.addEventListener('dragleave', () => {
            zone.style.borderColor = '';
        });

        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.style.borderColor = '';
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
                await uploadImage(file);
            }
        });

        // Remove image
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeImage();
            });
        }
    }

    async function uploadImage(file) {
        const token = getToken();
        if (!token) {
            showToast('Oturum bulunamadi', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_BASE}/announcement/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            document.getElementById('popupImage').value = data.filename;
            showImagePreview(data.filename);
            showToast('Gorsel yuklendi', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showToast(error.message || 'Gorsel yuklenemedi', 'error');
        }
    }

    function showImagePreview(filename) {
        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImage');
        const zone = document.getElementById('imageUploadZone');

        if (placeholder) placeholder.style.display = 'none';
        if (preview) preview.style.display = 'block';
        if (img) img.src = `/images/announcement/${filename}`;
        if (zone) zone.classList.add('has-image');

        // Re-render lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function removeImage() {
        const placeholder = document.getElementById('uploadPlaceholder');
        const preview = document.getElementById('imagePreview');
        const hiddenInput = document.getElementById('popupImage');
        const zone = document.getElementById('imageUploadZone');
        const fileInput = document.getElementById('imageInput');

        if (placeholder) placeholder.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (hiddenInput) hiddenInput.value = '';
        if (zone) zone.classList.remove('has-image');
        if (fileInput) fileInput.value = '';
    }

    function setupSaveButton() {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveAnnouncement);
        }
    }

    async function saveAnnouncement() {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Kaydediliyor...';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        try {
            // Collect form data
            const payload = {
                enabled: document.getElementById('popupEnabled')?.checked || false,
                image: document.getElementById('popupImage')?.value || '',
                title: {
                    tr: document.getElementById('titleTr')?.value || '',
                    en: document.getElementById('titleEn')?.value || '',
                    ru: document.getElementById('titleRu')?.value || ''
                },
                description: {
                    tr: document.getElementById('descriptionTr')?.value || '',
                    en: document.getElementById('descriptionEn')?.value || '',
                    ru: document.getElementById('descriptionRu')?.value || ''
                },
                button: {
                    text: {
                        tr: document.getElementById('buttonTextTr')?.value || 'Detaylar',
                        en: document.getElementById('buttonTextEn')?.value || 'Details',
                        ru: document.getElementById('buttonTextRu')?.value || 'Подробности'
                    },
                    links: {
                        tr: document.getElementById('buttonLinkTr')?.value || '',
                        en: document.getElementById('buttonLinkEn')?.value || '',
                        ru: document.getElementById('buttonLinkRu')?.value || ''
                    }
                },
                displaySettings: {
                    maxViewsPerUser: parseInt(document.getElementById('maxShowCount')?.value) || 3,
                    resetIntervalMinutes: (parseInt(document.getElementById('resetIntervalHours')?.value) || 3) * 60
                },
                regenerateId: true // Generate new ID when content changes
            };

            const token = getToken();
            const response = await fetch(`${API_BASE}/announcement`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Save failed');
            }

            announcementData = await response.json();
            showToast('Duyuru basariyla kaydedildi', 'success');
        } catch (error) {
            console.error('Save error:', error);
            showToast(error.message || 'Kaydetme hatasi', 'error');
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i data-lucide="save"></i> Kaydet';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    }

    function getToken() {
        return localStorage.getItem('adminToken');
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.custom-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `custom-toast custom-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#333'};
        `;

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
        .spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
})();
