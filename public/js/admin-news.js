(function () {
const API_BASE = window.API_BASE || '/api';
const LANGS = ['tr', 'en', 'ru'];

let currentNewsId = null;
let currentNews = null;
let isNew = false;
let activeLang = 'tr';

// Quill editors for each language
const editors = {};

// Quill toolbar configuration
const toolbarOptions = [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    ['blockquote'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
];

// Placeholder texts for each language
const placeholders = {
    tr: 'Haber icerigini buraya yazin...',
    en: 'Write your news content here...',
    ru: 'Напишите содержание новости здесь...'
};

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
    initQuillEditors();
    bindSaveButton();
    updatePageTitle();

    if (currentNewsId && !isNew) {
        await loadNewsItem();
    }
}

function initQuillEditors() {
    LANGS.forEach(lang => {
        const container = document.getElementById(`editor${capitalize(lang)}`);
        if (!container) return;

        editors[lang] = new Quill(container, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        image: function() {
                            imageHandler(lang);
                        }
                    }
                }
            },
            placeholder: placeholders[lang]
        });

        // Setup drag & drop for images
        setupEditorDragDrop(editors[lang], lang);
    });

    // Add Turkish tooltips to toolbar buttons
    addToolbarTooltips();
}

function addToolbarTooltips() {
    const tooltips = {
        'ql-bold': 'Kalin',
        'ql-italic': 'Italik',
        'ql-underline': 'Alti Cizili',
        'ql-blockquote': 'Alinti',
        'ql-list[value="ordered"]': 'Numarali Liste',
        'ql-list[value="bullet"]': 'Madde Listesi',
        'ql-link': 'Link Ekle',
        'ql-image': 'Gorsel Ekle',
        'ql-video': 'Video Ekle',
        'ql-clean': 'Formati Temizle'
    };

    // Apply tooltips
    document.querySelectorAll('.ql-toolbar button').forEach(btn => {
        const classList = Array.from(btn.classList);
        for (const [selector, tooltip] of Object.entries(tooltips)) {
            if (classList.some(c => selector.includes(c))) {
                btn.setAttribute('title', tooltip);
            }
        }
    });

    // Header dropdown tooltip
    document.querySelectorAll('.ql-header .ql-picker-label').forEach(el => {
        el.setAttribute('title', 'Baslik Boyutu');
    });
}

function imageHandler(lang) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (file) {
            await uploadAndInsertImage(file, lang);
        }
    };
}

function setupEditorDragDrop(editor, lang) {
    const editorContainer = editor.root;

    editorContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editorContainer.classList.add('drag-over');
    });

    editorContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        editorContainer.classList.remove('drag-over');
    });

    editorContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        editorContainer.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                await uploadAndInsertImage(file, lang);
            }
        }
    });
}

async function uploadAndInsertImage(file, lang) {
    const token = typeof Auth !== 'undefined' ? Auth.getToken() : null;
    if (!token) {
        alert('Oturum bulunamadi. Lutfen tekrar giris yapin.');
        return;
    }

    // Show loading state
    const editor = editors[lang];
    const range = editor.getSelection(true);

    // Insert placeholder
    editor.insertText(range.index, 'Gorsel yukleniyor...', { 'color': '#999', 'italic': true });
    const placeholderLength = 'Gorsel yukleniyor...'.length;

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
            throw new Error(data.error || 'Gorsel yuklenemedi');
        }

        // Remove placeholder
        editor.deleteText(range.index, placeholderLength);

        // Insert image
        const imageUrl = `/images/news/${data.filename}`;
        editor.insertEmbed(range.index, 'image', imageUrl);
        editor.setSelection(range.index + 1);

    } catch (error) {
        console.error('Gorsel yukleme hatasi:', error);
        // Remove placeholder
        editor.deleteText(range.index, placeholderLength);
        alert(error.message || 'Gorsel yuklenirken bir hata olustu.');
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
        console.error('Haber yuklenemedi:', error);
        alert('Haber bilgileri getirilemedi.');
    }
}

function populateForm(news) {
    LANGS.forEach(lang => {
        setInputValue(`title${capitalize(lang)}`, news.title?.[lang] || '');
        setInputValue(`slug${capitalize(lang)}`, news.slug?.[lang] || '');
        setInputValue(`summary${capitalize(lang)}`, news.summary?.[lang] || '');

        // Load content into Quill editor
        if (editors[lang] && news.content?.[lang]) {
            const content = news.content[lang];
            // Check if content is HTML or plain text
            if (content.includes('<') && content.includes('>')) {
                // HTML content
                editors[lang].root.innerHTML = content;
            } else {
                // Plain text - convert to HTML paragraphs
                const htmlContent = content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');
                editors[lang].root.innerHTML = htmlContent;
            }
        }
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

    // Drag & drop for cover image
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await uploadNewsImage(file);
        }
    });

    input.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        await uploadNewsImage(file);
    });
}

async function uploadNewsImage(file) {
    const token = typeof Auth !== 'undefined' ? Auth.getToken() : null;
    if (!token) {
        alert('Oturum bulunamadi. Lutfen tekrar giris yapin.');
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
            throw new Error(data.error || 'Gorsel yuklenemedi');
        }

        const hiddenImage = document.getElementById('newsImage');
        if (hiddenImage) {
            hiddenImage.value = data.filename;
        }

        renderImagePreview(data.filename);
    } catch (error) {
        console.error('Gorsel yukleme hatasi:', error);
        alert(error.message || 'Gorsel yuklenirken bir hata olustu.');
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
    preview.innerHTML = `<img src="${src}" alt="Haber gorseli">`;
}

async function saveNews() {
    const payload = {
        title: collectLangGroup('title'),
        slug: collectLangGroup('slug'),
        summary: collectLangGroup('summary'),
        content: collectEditorContent(),
        image: document.getElementById('newsImage')?.value || currentNews?.image || '',
        date: currentNews?.date || new Date().toISOString()
    };

    // Validate and sanitize slugs
    LANGS.forEach(lang => {
        if (payload.slug[lang]) {
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

        alert('Haber basariyla kaydedildi.');
        window.location.href = '/admin/news.html';
    } catch (error) {
        console.error('Haber kaydetme hatasi:', error);
        alert(error.message || 'Haber kaydedilirken hata olustu.');
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

function collectEditorContent() {
    const content = {};
    LANGS.forEach(lang => {
        if (editors[lang]) {
            // Get HTML content from Quill
            let html = editors[lang].root.innerHTML;
            // Clean up empty paragraphs
            if (html === '<p><br></p>' || html === '<p></p>') {
                html = '';
            }
            content[lang] = html;
        } else {
            content[lang] = '';
        }
    });
    return content;
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
