(function () {
    const API_BASE = window.API_BASE || '/api';
    const LANGS = ['tr', 'en', 'ru'];
    const AVAILABLE_ICONS = ['shield-check', 'users', 'lightbulb', 'award', 'target', 'zap', 'heart', 'star', 'thumbs-up', 'check-circle'];

    let aboutData = null;
    let activeTab = 'hero';
    let activeLangs = {
        hero: 'tr',
        story: 'tr'
    };

    document.addEventListener('DOMContentLoaded', initAboutEditor);

    async function initAboutEditor() {
        if (!window.location.pathname.includes('about.html') || window.location.pathname.includes('public/about.html')) {
            return;
        }

        if (typeof checkAuth === 'function') {
            const authed = await checkAuth();
            if (!authed) return;
        }

        await loadAboutData();
        setupTabs();
        setupGalleryUpload();
        populateForm();
        lucide.createIcons();
    }

    async function loadAboutData() {
        try {
            const response = await apiRequest('/about');
            aboutData = await response.json();
        } catch (error) {
            console.error('Hakkimizda verisi yuklenemedi:', error);
            aboutData = getDefaultData();
        }
    }

    function getDefaultData() {
        return {
            hero: {
                badge: { tr: '', en: '', ru: '' },
                title: { tr: '', en: '', ru: '' },
                subtitle: { tr: '', en: '', ru: '' }
            },
            story: {
                badge: { tr: '', en: '', ru: '' },
                title: { tr: '', en: '', ru: '' },
                gallery: [],
                paragraphs: []
            },
            features: [],
            stats: []
        };
    }

    function setupTabs() {
        document.querySelectorAll('.about-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                switchTab(tab);
            });
        });
    }

    function switchTab(tabId) {
        activeTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.about-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabId}`);
        });

        lucide.createIcons();
    }

    function switchLang(lang, section) {
        activeLangs[section] = lang;

        // Update lang tabs for this section
        const container = document.getElementById(`tab-${section}`);
        if (!container) return;

        container.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });

        container.querySelectorAll('.lang-content').forEach(content => {
            const contentLang = content.id.split('-').pop();
            content.classList.toggle('active', contentLang === lang);
        });
    }

    function populateForm() {
        // Hero
        LANGS.forEach(lang => {
            setInputValue(`heroBadge${capitalize(lang)}`, aboutData.hero?.badge?.[lang] || '');
            setInputValue(`heroTitle${capitalize(lang)}`, aboutData.hero?.title?.[lang] || '');
            setInputValue(`heroSubtitle${capitalize(lang)}`, aboutData.hero?.subtitle?.[lang] || '');
        });

        // Story Header (badge & title)
        LANGS.forEach(lang => {
            setInputValue(`storyBadge${capitalize(lang)}`, aboutData.story?.badge?.[lang] || '');
            setInputValue(`storyTitle${capitalize(lang)}`, aboutData.story?.title?.[lang] || '');
        });

        // Gallery
        renderGallery();

        // Paragraphs
        renderParagraphs();

        // Features
        renderFeatures();

        // Stats
        renderStats();
    }

    function setInputValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }

    // ========== GALLERY ==========
    function setupGalleryUpload() {
        const zone = document.getElementById('galleryUploadZone');
        const input = document.getElementById('galleryInput');

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
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            for (const file of files) {
                await uploadGalleryImage(file);
            }
        });

        input.addEventListener('change', async (event) => {
            const files = Array.from(event.target.files);
            for (const file of files) {
                await uploadGalleryImage(file);
            }
            input.value = '';
        });
    }

    async function uploadGalleryImage(file) {
        const token = typeof Auth !== 'undefined' ? Auth.getToken() : null;
        if (!token) {
            alert('Oturum bulunamadi. Lutfen tekrar giris yapin.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_BASE}/about/upload`, {
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

            if (!aboutData.story.gallery) {
                aboutData.story.gallery = [];
            }
            aboutData.story.gallery.push(data.filename);
            renderGallery();
        } catch (error) {
            console.error('Gorsel yukleme hatasi:', error);
            alert(error.message || 'Gorsel yuklenirken bir hata olustu.');
        }
    }

    function renderGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        const gallery = aboutData.story?.gallery || [];

        grid.innerHTML = gallery.map((filename, index) => `
            <div class="gallery-item" data-index="${index}">
                <img src="/images/about/${filename}" alt="Galeri ${index + 1}">
                <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `).join('');

        lucide.createIcons();
    }

    window.removeGalleryImage = function (index) {
        if (confirm('Bu gorseli silmek istediginize emin misiniz?')) {
            aboutData.story.gallery.splice(index, 1);
            renderGallery();
        }
    };

    // ========== PARAGRAPHS ==========
    function renderParagraphs() {
        LANGS.forEach(lang => {
            const container = document.getElementById(`paragraphs${capitalize(lang)}`);
            if (!container) return;

            const paragraphs = aboutData.story?.paragraphs || [];

            container.innerHTML = paragraphs.map((p, index) => `
                <div class="paragraph-item" data-index="${index}">
                    <textarea
                        id="paragraph${capitalize(lang)}${index}"
                        rows="4"
                        placeholder="Paragraf ${index + 1}"
                        onchange="updateParagraph(${index}, '${lang}', this.value)"
                    >${p[lang] || ''}</textarea>
                    <button type="button" class="remove-btn" onclick="removeParagraph(${index})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `).join('');

            lucide.createIcons();
        });
    }

    window.addParagraph = function (lang) {
        if (!aboutData.story.paragraphs) {
            aboutData.story.paragraphs = [];
        }

        const newParagraph = { tr: '', en: '', ru: '' };
        aboutData.story.paragraphs.push(newParagraph);
        renderParagraphs();

        // Focus on the new textarea
        const index = aboutData.story.paragraphs.length - 1;
        setTimeout(() => {
            const textarea = document.getElementById(`paragraph${capitalize(lang)}${index}`);
            if (textarea) textarea.focus();
        }, 100);
    };

    window.updateParagraph = function (index, lang, value) {
        if (aboutData.story.paragraphs[index]) {
            aboutData.story.paragraphs[index][lang] = value;
        }
    };

    window.removeParagraph = function (index) {
        if (confirm('Bu paragraf tum dillerden silinecek. Devam etmek istiyor musunuz?')) {
            aboutData.story.paragraphs.splice(index, 1);
            renderParagraphs();
        }
    };

    // ========== FEATURES ==========
    function renderFeatures() {
        const container = document.getElementById('featuresContainer');
        if (!container) return;

        const features = aboutData.features || [];

        // Ensure we have 3 features
        while (features.length < 3) {
            features.push({
                id: `feature${features.length + 1}`,
                icon: AVAILABLE_ICONS[features.length] || 'star',
                title: { tr: '', en: '', ru: '' },
                description: { tr: '', en: '', ru: '' }
            });
        }
        aboutData.features = features;

        container.innerHTML = features.map((feature, index) => `
            <div class="feature-editor" data-index="${index}">
                <div class="feature-editor-header">
                    <div class="feature-editor-title">
                        <span class="feature-number">${index + 1}</span>
                        Ozellik ${index + 1}
                    </div>
                </div>

                <label style="font-size: 13px; color: #697386; margin-bottom: 8px; display: block;">Icon Secin</label>
                <div class="feature-icon-select">
                    ${AVAILABLE_ICONS.map(icon => `
                        <div class="icon-option ${feature.icon === icon ? 'active' : ''}"
                             onclick="selectFeatureIcon(${index}, '${icon}')">
                            <i data-lucide="${icon}"></i>
                        </div>
                    `).join('')}
                </div>

                <div class="feature-lang-tabs">
                    <button type="button" class="feature-lang-tab active" onclick="switchFeatureLang(${index}, 'tr')">TR</button>
                    <button type="button" class="feature-lang-tab" onclick="switchFeatureLang(${index}, 'en')">EN</button>
                    <button type="button" class="feature-lang-tab" onclick="switchFeatureLang(${index}, 'ru')">RU</button>
                </div>

                ${LANGS.map(lang => `
                    <div id="feature${index}-fields-${lang}" class="feature-fields ${lang === 'tr' ? 'active' : ''}">
                        <div class="form-field">
                            <label>Baslik (${lang.toUpperCase()})</label>
                            <input type="text"
                                   id="featureTitle${index}${capitalize(lang)}"
                                   value="${feature.title?.[lang] || ''}"
                                   placeholder="Ozellik basligi"
                                   onchange="updateFeature(${index}, 'title', '${lang}', this.value)">
                        </div>
                        <div class="form-field">
                            <label>Aciklama (${lang.toUpperCase()})</label>
                            <textarea id="featureDesc${index}${capitalize(lang)}"
                                      rows="3"
                                      placeholder="Ozellik aciklamasi"
                                      onchange="updateFeature(${index}, 'description', '${lang}', this.value)"
                            >${feature.description?.[lang] || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        lucide.createIcons();
    }

    window.selectFeatureIcon = function (index, icon) {
        aboutData.features[index].icon = icon;
        renderFeatures();
    };

    window.switchFeatureLang = function (index, lang) {
        const editor = document.querySelector(`.feature-editor[data-index="${index}"]`);
        if (!editor) return;

        editor.querySelectorAll('.feature-lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase() === lang);
        });

        editor.querySelectorAll('.feature-fields').forEach(fields => {
            const fieldsLang = fields.id.split('-').pop();
            fields.classList.toggle('active', fieldsLang === lang);
        });
    };

    window.updateFeature = function (index, field, lang, value) {
        if (!aboutData.features[index][field]) {
            aboutData.features[index][field] = { tr: '', en: '', ru: '' };
        }
        aboutData.features[index][field][lang] = value;
    };

    // ========== STATS ==========
    function renderStats() {
        const container = document.getElementById('statsContainer');
        if (!container) return;

        const stats = aboutData.stats || [];

        container.innerHTML = stats.map((stat, index) => `
            <div class="stat-editor-item" data-index="${index}">
                <div class="stat-editor-header">
                    <div class="stat-editor-title">Istatistik ${index + 1}</div>
                    <button type="button" class="remove-btn" onclick="removeStat(${index})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>

                <div class="stat-value-row">
                    <div class="form-field">
                        <label>Deger</label>
                        <input type="number"
                               id="statValue${index}"
                               value="${stat.value || 0}"
                               placeholder="35"
                               onchange="updateStatValue(${index}, 'value', this.value)">
                    </div>
                    <div class="form-field">
                        <label>Suffix</label>
                        <input type="text"
                               id="statSuffix${index}"
                               value="${stat.suffix || ''}"
                               placeholder="+"
                               onchange="updateStatValue(${index}, 'suffix', this.value)">
                    </div>
                </div>

                <div class="stat-lang-tabs">
                    <button type="button" class="stat-lang-tab active" onclick="switchStatLang(${index}, 'tr')">TR</button>
                    <button type="button" class="stat-lang-tab" onclick="switchStatLang(${index}, 'en')">EN</button>
                    <button type="button" class="stat-lang-tab" onclick="switchStatLang(${index}, 'ru')">RU</button>
                </div>

                ${LANGS.map(lang => `
                    <div id="stat${index}-label-${lang}" class="stat-label-fields ${lang === 'tr' ? 'active' : ''}">
                        <div class="form-field">
                            <label>Etiket (${lang.toUpperCase()})</label>
                            <input type="text"
                                   id="statLabel${index}${capitalize(lang)}"
                                   value="${stat.label?.[lang] || ''}"
                                   placeholder="Yillik Deneyim"
                                   onchange="updateStatLabel(${index}, '${lang}', this.value)">
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        lucide.createIcons();
    }

    window.addStat = function () {
        if (!aboutData.stats) {
            aboutData.stats = [];
        }

        // Maximum 3 stats allowed
        if (aboutData.stats.length >= 3) {
            if (window.toast) {
                window.toast.error('Maksimum 3 istatistik eklenebilir');
            } else {
                alert('Maksimum 3 istatistik eklenebilir');
            }
            return;
        }

        aboutData.stats.push({
            id: `stat${Date.now()}`,
            value: 0,
            suffix: '+',
            label: { tr: '', en: '', ru: '' }
        });

        renderStats();
    };

    window.removeStat = function (index) {
        if (confirm('Bu istatistigi silmek istediginize emin misiniz?')) {
            aboutData.stats.splice(index, 1);
            renderStats();
        }
    };

    window.updateStatValue = function (index, field, value) {
        if (field === 'value') {
            aboutData.stats[index].value = parseInt(value) || 0;
        } else {
            aboutData.stats[index][field] = value;
        }
    };

    window.updateStatLabel = function (index, lang, value) {
        if (!aboutData.stats[index].label) {
            aboutData.stats[index].label = { tr: '', en: '', ru: '' };
        }
        aboutData.stats[index].label[lang] = value;
    };

    window.switchStatLang = function (index, lang) {
        const item = document.querySelector(`.stat-editor-item[data-index="${index}"]`);
        if (!item) return;

        item.querySelectorAll('.stat-lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.textContent.toLowerCase() === lang);
        });

        item.querySelectorAll('.stat-label-fields').forEach(fields => {
            const fieldsLang = fields.id.split('-').pop();
            fields.classList.toggle('active', fieldsLang === lang);
        });
    };

    // ========== SAVE ==========
    async function saveAbout() {
        // Collect Hero data
        aboutData.hero = {
            badge: collectLangGroup('heroBadge'),
            title: collectLangGroup('heroTitle'),
            subtitle: collectLangGroup('heroSubtitle')
        };

        // Collect Story header data
        if (!aboutData.story) aboutData.story = {};
        aboutData.story.badge = collectLangGroup('storyBadge');
        aboutData.story.title = collectLangGroup('storyTitle');

        // Validate
        if (!aboutData.hero.title.tr?.trim()) {
            alert('Turkce baslik zorunludur.');
            switchTab('hero');
            return;
        }

        setSaving(true);

        try {
            await apiRequest('/about', {
                method: 'PUT',
                body: JSON.stringify(aboutData)
            });

            alert('Hakkimizda sayfasi basariyla kaydedildi.');
        } catch (error) {
            console.error('Kaydetme hatasi:', error);
            alert(error.message || 'Kaydedilirken hata olustu.');
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

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Story Header lang switch
    function switchStoryHeaderLang(lang) {
        const container = document.getElementById('tab-story');
        if (!container) return;

        // Find the story header card's lang tabs
        const headerCard = container.querySelector('.card:first-child');
        if (!headerCard) return;

        headerCard.querySelectorAll('.lang-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.lang === lang);
        });

        LANGS.forEach(l => {
            const fields = document.getElementById(`storyHeader-fields-${l}`);
            if (fields) {
                fields.classList.toggle('active', l === lang);
            }
        });
    }

    // Global functions
    window.switchTab = switchTab;
    window.switchLang = switchLang;
    window.switchStoryHeaderLang = switchStoryHeaderLang;
    window.saveAbout = saveAbout;

})();
