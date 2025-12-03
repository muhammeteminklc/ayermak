(function () {
const API_BASE = window.API_BASE || '/api';
const LANGS = ['tr', 'en', 'ru'];

let currentNewsId = null;
let currentNews = null;
let isNew = false;
let activeLang = 'tr';

document.addEventListener('DOMContentLoaded', initNewsEditor);

async function initNewsEditor() {
    if (!window.location.pathname.includes('news-edit')) {
        return;
    }

    if (typeof checkAuth === 'function') {
        const authed = await checkAuth();
        if (!authed) return;
    }

    const params = new URLSearchParams(window.location.search);
    currentNewsId = params.get('id');
    isNew = !currentNewsId || params.get('new') === 'true';

    setupLangTabs();
    setupImageUpload();
    bindSaveButton();
    updatePageTitle();

    if (currentNewsId && !isNew) {
        await loadNewsItem();
    }
}

function updatePageTitle() {
    const title = document.getElementById('pageTitle');
    if (title) {
        title.textContent = isNew ? 'Haber Ekle' : 'Haber Düzenle';
    }
}

function setupLangTabs() {
    document.querySelectorAll('.lang-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.textContent.trim().toLowerCase().includes('tr') ? 'tr'
                : btn.textContent.toLowerCase().includes('en') ? 'en'
                : btn.textContent.toLowerCase().includes('ru') ? 'ru'
                : btn.getAttribute('data-lang');
            switchLang(lang || 'tr');
        });
    });
}

function bindSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveNews();
        });
    }
}

async function loadNewsItem() {
    try {
        const response = await apiRequest(`/news/${currentNewsId}`);
        currentNews = await response.json();
        populateForm(currentNews);
        renderImagePreview(currentNews.image);
    } catch (error) {
        console.error('Haber yüklenemedi:', error);
        alert('Haber bilgileri getirilemedi.');
    }
}

function populateForm(news) {
    LANGS.forEach(lang => {
        setInputValue(`title${capitalize(lang)}`, news.title?.[lang] || '');
        setInputValue(`slug${capitalize(lang)}`, news.slug?.[lang] || '');
        setInputValue(`summary${capitalize(lang)}`, news.summary?.[lang] || '');
        setInputValue(`content${capitalize(lang)}`, news.content?.[lang] || '');
    });

    const hiddenImage = document.getElementById('newsImage');
    if (hiddenImage && news.image) {
        hiddenImage.value = news.image;
    }
}

function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function setupImageUpload() {
    const zone = document.getElementById('imageUploadZone');
    const input = document.getElementById('imageInput');

    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    input.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await uploadNewsImage(file);
    });
}

async function uploadNewsImage(file) {
    const token = typeof Auth !== 'undefined' ? Auth.getToken() : null;
    if (!token) {
        alert('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/news/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Görsel yüklenemedi');
        }

        const hiddenImage = document.getElementById('newsImage');
        if (hiddenImage) {
            hiddenImage.value = data.filename;
        }

        renderImagePreview(data.filename);
    } catch (error) {
        console.error('Görsel yükleme hatası:', error);
        alert(error.message || 'Görsel yüklenirken bir hata oluştu.');
    }
}

function renderImagePreview(filename) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    if (!filename) {
        preview.innerHTML = '';
        return;
    }

    const src = filename.startsWith('http') ? filename : `/images/news/${filename}`;
    preview.innerHTML = `<img src="${src}" alt="Haber görseli">`;
}

async function saveNews() {
    const payload = {
        title: collectLangGroup('title'),
        slug: collectLangGroup('slug'),
        summary: collectLangGroup('summary'),
        content: collectLangGroup('content'),
        image: document.getElementById('newsImage')?.value || currentNews?.image || '',
        date: currentNews?.date || new Date().toISOString()
    };

    // Validate and sanitize slugs
    LANGS.forEach(lang => {
        if (payload.slug[lang]) {
            // Convert to lowercase, replace spaces with hyphens, remove special characters
            payload.slug[lang] = payload.slug[lang]
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }
    });

    if (!payload.title.tr?.trim()) {
        alert('Turkce baslik zorunludur.');
        return;
    }

    if (!payload.slug.tr?.trim()) {
        alert('Turkce URL slug zorunludur.');
        return;
    }

    const isUpdate = currentNewsId && !isNew;
    const endpoint = isUpdate ? `/news/${currentNewsId}` : '/news';
    const method = isUpdate ? 'PUT' : 'POST';

    setSaving(true);
    try {
        await apiRequest(endpoint, {
            method,
            body: JSON.stringify(payload)
        });

        alert('Haber başarıyla kaydedildi.');
        window.location.href = '/admin/news.html';
    } catch (error) {
        console.error('Haber kaydetme hatası:', error);
        alert(error.message || 'Haber kaydedilirken hata oluştu.');
    } finally {
        setSaving(false);
    }
}

function collectLangGroup(prefix) {
    const group = {};
    LANGS.forEach(lang => {
        const id = `${prefix}${capitalize(lang)}`;
        const el = document.getElementById(id);
        group[lang] = el ? el.value.trim() : '';
    });
    return group;
}

function setSaving(state) {
    const btn = document.getElementById('saveBtn');
    if (!btn) return;
    btn.disabled = state;
    btn.classList.toggle('loading', state);
}

function switchLang(lang) {
    if (!lang || activeLang === lang) return;
    activeLang = lang;

    document.querySelectorAll('.lang-tab').forEach(tab => {
        const label = tab.textContent.toLowerCase();
        const btnLang = label.includes('tr') ? 'tr' : label.includes('en') ? 'en' : label.includes('ru') ? 'ru' : tab.getAttribute('data-lang');
        tab.classList.toggle('active', btnLang === lang);
    });

    document.querySelectorAll('.lang-content').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    const target = document.getElementById(`fields-${lang}`);
    if (target) {
        target.style.display = '';
        target.classList.add('active');
    }
}

function capitalize(lang) {
    return lang.charAt(0).toUpperCase() + lang.slice(1);
}

window.saveNews = saveNews;
window.switchLang = switchLang;

})(); 

