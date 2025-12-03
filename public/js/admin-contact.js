// Admin Contact Page Controller
(function () {
    const API_BASE = '/api';
    let contactData = null;

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        await loadContactData();
        populateFields();
        setupMapPreview();
        lucide.createIcons();
    }

    async function loadContactData() {
        try {
            const response = await fetch(`${API_BASE}/contact`);
            contactData = await response.json();
        } catch (error) {
            console.error('İletişim verisi yüklenemedi:', error);
            contactData = {};
        }
    }

    function populateFields() {
        if (!contactData) return;

        // Hero section
        if (contactData.hero) {
            setValue('heroTitleTr', contactData.hero.title?.tr);
            setValue('heroTitleEn', contactData.hero.title?.en);
            setValue('heroTitleRu', contactData.hero.title?.ru);
            setValue('heroSubtitleTr', contactData.hero.subtitle?.tr);
            setValue('heroSubtitleEn', contactData.hero.subtitle?.en);
            setValue('heroSubtitleRu', contactData.hero.subtitle?.ru);
        }

        // Info section
        if (contactData.info) {
            setValue('infoTitleTr', contactData.info.title?.tr);
            setValue('infoTitleEn', contactData.info.title?.en);
            setValue('infoTitleRu', contactData.info.title?.ru);
            setValue('infoAddressTr', contactData.info.address?.tr);
            setValue('infoAddressEn', contactData.info.address?.en);
            setValue('infoAddressRu', contactData.info.address?.ru);
            // Multiple phones support
            if (contactData.info.phones && contactData.info.phones.length > 0) {
                setValue('infoPhone1', contactData.info.phones[0]?.number);
                setValue('infoPhone1LabelTr', contactData.info.phones[0]?.label?.tr);
                setValue('infoPhone1LabelEn', contactData.info.phones[0]?.label?.en);
                setValue('infoPhone1LabelRu', contactData.info.phones[0]?.label?.ru);
            }
            if (contactData.info.phones && contactData.info.phones.length > 1) {
                setValue('infoPhone2', contactData.info.phones[1]?.number);
                setValue('infoPhone2LabelTr', contactData.info.phones[1]?.label?.tr);
                setValue('infoPhone2LabelEn', contactData.info.phones[1]?.label?.en);
                setValue('infoPhone2LabelRu', contactData.info.phones[1]?.label?.ru);
            }

            setValue('infoEmail', contactData.info.email);
        }

        // Form section
        if (contactData.form) {
            setValue('formTitleTr', contactData.form.title?.tr);
            setValue('formTitleEn', contactData.form.title?.en);
            setValue('formTitleRu', contactData.form.title?.ru);

            if (contactData.form.labels) {
                setValue('formNameTr', contactData.form.labels.name?.tr);
                setValue('formNameEn', contactData.form.labels.name?.en);
                setValue('formNameRu', contactData.form.labels.name?.ru);
                setValue('formEmailTr', contactData.form.labels.email?.tr);
                setValue('formEmailEn', contactData.form.labels.email?.en);
                setValue('formEmailRu', contactData.form.labels.email?.ru);
                setValue('formPhoneTr', contactData.form.labels.phone?.tr);
                setValue('formPhoneEn', contactData.form.labels.phone?.en);
                setValue('formPhoneRu', contactData.form.labels.phone?.ru);
                setValue('formMessageTr', contactData.form.labels.message?.tr);
                setValue('formMessageEn', contactData.form.labels.message?.en);
                setValue('formMessageRu', contactData.form.labels.message?.ru);
                setValue('formSendTr', contactData.form.labels.send?.tr);
                setValue('formSendEn', contactData.form.labels.send?.en);
                setValue('formSendRu', contactData.form.labels.send?.ru);
            }

            setValue('formSuccessTr', contactData.form.successMessage?.tr);
            setValue('formSuccessEn', contactData.form.successMessage?.en);
            setValue('formSuccessRu', contactData.form.successMessage?.ru);
        }

        // Map section
        if (contactData.map) {
            setValue('mapEmbedUrl', contactData.map.embedUrl);
            updateMapPreview();
        }
    }

    function setValue(id, value) {
        const el = document.getElementById(id);
        if (el && value !== undefined && value !== null) {
            el.value = value;
        }
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function setupMapPreview() {
        const mapUrlInput = document.getElementById('mapEmbedUrl');
        if (mapUrlInput) {
            mapUrlInput.addEventListener('input', debounce(updateMapPreview, 500));
        }
    }

    function updateMapPreview() {
        const url = getValue('mapEmbedUrl');
        const iframe = document.getElementById('mapIframe');
        if (iframe && url) {
            iframe.src = url;
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Save contact data
    window.saveContact = async function () {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Kaydediliyor...';
        lucide.createIcons();

        try {
            const data = {
                hero: {
                    title: {
                        tr: getValue('heroTitleTr'),
                        en: getValue('heroTitleEn'),
                        ru: getValue('heroTitleRu')
                    },
                    subtitle: {
                        tr: getValue('heroSubtitleTr'),
                        en: getValue('heroSubtitleEn'),
                        ru: getValue('heroSubtitleRu')
                    }
                },
                info: {
                    title: {
                        tr: getValue('infoTitleTr'),
                        en: getValue('infoTitleEn'),
                        ru: getValue('infoTitleRu')
                    },
                    address: {
                        tr: getValue('infoAddressTr'),
                        en: getValue('infoAddressEn'),
                        ru: getValue('infoAddressRu')
                    },
                    addressLabel: contactData.info?.addressLabel || {
                        tr: "Adres",
                        en: "Address",
                        ru: "Адрес"
                    },
                    phones: [
                        {
                            number: getValue('infoPhone1'),
                            label: {
                                tr: getValue('infoPhone1LabelTr') || 'Sabit Hat',
                                en: getValue('infoPhone1LabelEn') || 'Landline',
                                ru: getValue('infoPhone1LabelRu') || 'Стационарный'
                            }
                        },
                        {
                            number: getValue('infoPhone2'),
                            label: {
                                tr: getValue('infoPhone2LabelTr') || 'Mobil',
                                en: getValue('infoPhone2LabelEn') || 'Mobile',
                                ru: getValue('infoPhone2LabelRu') || 'Мобильный'
                            }
                        }
                    ].filter(p => p.number), // Only include phones with numbers
                    phoneLabel: contactData.info?.phoneLabel || {
                        tr: "Telefon",
                        en: "Phone",
                        ru: "Телефон"
                    },
                    email: getValue('infoEmail'),
                    emailLabel: contactData.info?.emailLabel || {
                        tr: "E-posta",
                        en: "Email",
                        ru: "Эл. почта"
                    }
                },
                form: {
                    title: {
                        tr: getValue('formTitleTr'),
                        en: getValue('formTitleEn'),
                        ru: getValue('formTitleRu')
                    },
                    labels: {
                        name: {
                            tr: getValue('formNameTr'),
                            en: getValue('formNameEn'),
                            ru: getValue('formNameRu')
                        },
                        email: {
                            tr: getValue('formEmailTr'),
                            en: getValue('formEmailEn'),
                            ru: getValue('formEmailRu')
                        },
                        phone: {
                            tr: getValue('formPhoneTr'),
                            en: getValue('formPhoneEn'),
                            ru: getValue('formPhoneRu')
                        },
                        message: {
                            tr: getValue('formMessageTr'),
                            en: getValue('formMessageEn'),
                            ru: getValue('formMessageRu')
                        },
                        send: {
                            tr: getValue('formSendTr'),
                            en: getValue('formSendEn'),
                            ru: getValue('formSendRu')
                        }
                    },
                    successMessage: {
                        tr: getValue('formSuccessTr'),
                        en: getValue('formSuccessEn'),
                        ru: getValue('formSuccessRu')
                    }
                },
                map: {
                    embedUrl: getValue('mapEmbedUrl')
                }
            };

            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/contact`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Kaydetme hatası');
            }

            contactData = await response.json();

            saveBtn.innerHTML = '<i data-lucide="check"></i> Kaydedildi!';
            saveBtn.style.background = '#22c55e';
            lucide.createIcons();

            setTimeout(() => {
                saveBtn.innerHTML = '<i data-lucide="save"></i> Kaydet';
                saveBtn.style.background = '';
                saveBtn.disabled = false;
                lucide.createIcons();
            }, 2000);

        } catch (error) {
            console.error('Kaydetme hatası:', error);
            saveBtn.innerHTML = '<i data-lucide="x"></i> Hata!';
            saveBtn.style.background = '#ef4444';
            lucide.createIcons();

            setTimeout(() => {
                saveBtn.innerHTML = '<i data-lucide="save"></i> Kaydet';
                saveBtn.style.background = '';
                saveBtn.disabled = false;
                lucide.createIcons();
            }, 2000);
        }
    };

    // Tab switching
    window.switchTab = function (tabName) {
        // Update tab buttons
        document.querySelectorAll('.about-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
    };

    // Language switching within a tab
    window.switchLang = function (lang, section) {
        const container = document.getElementById(`tab-${section}`);
        if (!container) return;

        // Update lang tab buttons
        container.querySelectorAll('.lang-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update lang content panels
        container.querySelectorAll('.lang-content').forEach(content => {
            content.classList.toggle('active', content.id === `${section}-fields-${lang}`);
        });
    };

})();
