// Contact Page Controller
(function () {
    const API_BASE = '/api';
    let contactData = null;
    let currentLang = 'tr';

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        // Get current language from i18n module
        currentLang = window.i18n?.currentLang || localStorage.getItem('lang') || 'tr';

        // Listen for language changes
        window.addEventListener('languageChanged', (e) => {
            currentLang = e.detail.lang;
            renderPage();
        });

        await loadContactData();
        renderPage();

        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Setup form submission
        setupForm();
    }

    async function loadContactData() {
        try {
            const response = await fetch(`${API_BASE}/contact`);
            contactData = await response.json();
        } catch (error) {
            console.error('İletişim verisi yüklenemedi:', error);
            contactData = null;
        }
    }

    function renderPage() {
        if (!contactData) return;

        renderHero();
        renderInfo();
        renderForm();
        renderMap();

        // Show content after rendering
        document.querySelectorAll('.contact-content-hidden').forEach(el => {
            el.classList.add('visible');
        });
    }

    function renderHero() {
        const badge = document.getElementById('heroBadge');
        const title = document.getElementById('heroTitle');
        const subtitle = document.getElementById('heroSubtitle');

        if (badge) {
            badge.textContent = getText(contactData.hero?.badge) || 'İLETİŞİM';
        }
        if (title) {
            title.textContent = getText(contactData.hero?.title) || 'Bize Ulaşın';
        }
        if (subtitle) {
            subtitle.textContent = getText(contactData.hero?.subtitle) || '';
        }
    }

    function renderInfo() {
        const infoTitle = document.getElementById('infoTitle');
        const addressLabel = document.getElementById('addressLabel');
        const addressText = document.getElementById('addressText');
        const phoneLabel = document.getElementById('phoneLabel');
        const phoneText = document.getElementById('phoneText');
        const emailLabel = document.getElementById('emailLabel');
        const emailText = document.getElementById('emailText');

        if (infoTitle) {
            infoTitle.textContent = getText(contactData.info?.title) || 'Bize Ulaşın';
        }

        if (addressLabel) {
            addressLabel.textContent = getText(contactData.info?.addressLabel) || 'Adres';
        }
        if (addressText) {
            const address = getText(contactData.info?.address) || '';
            addressText.innerHTML = address.replace(/\n/g, '<br>');
        }

        if (phoneLabel) {
            phoneLabel.textContent = getText(contactData.info?.phoneLabel) || 'Telefon';
        }
        if (phoneText) {
            const phones = contactData.info?.phones || [];
            if (phones.length > 0) {
                phoneText.innerHTML = phones.map(p => {
                    const label = getText(p.label);
                    const labelHtml = label ? `<small style="color:#999;font-size:12px;">${label}</small><br>` : '';
                    return `${labelHtml}<a href="tel:${p.number.replace(/\s/g, '')}">${p.number}</a>`;
                }).join('<br style="margin-bottom:8px;">');
            } else {
                phoneText.innerHTML = '';
            }
        }

        if (emailLabel) {
            emailLabel.textContent = getText(contactData.info?.emailLabel) || 'E-posta';
        }
        if (emailText) {
            const email = contactData.info?.email || '';
            emailText.innerHTML = `<a href="mailto:${email}">${email}</a>`;
        }
    }

    function renderForm() {
        const formTitle = document.getElementById('formTitle');
        const nameLabel = document.getElementById('nameLabel');
        const emailLabel = document.getElementById('emailLabelForm');
        const phoneLabel = document.getElementById('phoneLabelForm');
        const messageLabel = document.getElementById('messageLabel');
        const submitBtn = document.getElementById('submitBtn');

        if (formTitle) {
            formTitle.textContent = getText(contactData.form?.title) || 'Mesaj Gönderin';
        }
        if (nameLabel) {
            nameLabel.textContent = getText(contactData.form?.labels?.name) || 'Adınız Soyadınız';
        }
        if (emailLabel) {
            emailLabel.textContent = getText(contactData.form?.labels?.email) || 'E-posta Adresiniz';
        }
        if (phoneLabel) {
            phoneLabel.textContent = getText(contactData.form?.labels?.phone) || 'Telefon Numaranız';
        }
        if (messageLabel) {
            messageLabel.textContent = getText(contactData.form?.labels?.message) || 'Mesajınız';
        }
        if (submitBtn) {
            submitBtn.textContent = getText(contactData.form?.labels?.send) || 'Mesaj Gönder';
        }
    }

    function renderMap() {
        const iframe = document.getElementById('mapIframe');
        if (iframe && contactData.map?.embedUrl) {
            iframe.src = contactData.map.embedUrl;
        }
    }

    function getText(obj) {
        if (!obj) return '';
        return obj[currentLang] || obj.tr || '';
    }

    // Custom alert fallback (in case toast.js doesn't load)
    function showCustomAlert(message, type = 'info') {
        // Remove existing alert
        const existing = document.getElementById('custom-alert-overlay');
        if (existing) existing.remove();

        const colors = {
            success: { bg: '#22c55e', icon: '✓' },
            error: { bg: '#ef4444', icon: '✕' },
            info: { bg: '#3b82f6', icon: 'ℹ' }
        };
        const config = colors[type] || colors.info;

        const overlay = document.createElement('div');
        overlay.id = 'custom-alert-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            animation: fadeIn 0.2s ease;
        `;

        overlay.innerHTML = `
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            </style>
            <div style="
                background: white;
                border-radius: 16px;
                padding: 30px 40px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.3s ease;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: ${config.bg};
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 28px;
                    color: white;
                ">${config.icon}</div>
                <p style="font-size: 16px; color: #333; line-height: 1.5; margin: 0 0 25px;">${message}</p>
                <button onclick="this.closest('#custom-alert-overlay').remove()" style="
                    background: ${config.bg};
                    color: white;
                    border: none;
                    padding: 12px 40px;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Tamam</button>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    function setupForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = currentLang === 'tr' ? 'Gönderiliyor...' : currentLang === 'en' ? 'Sending...' : 'Отправка...';

            try {
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    message: document.getElementById('message').value
                };

                const response = await fetch(`${API_BASE}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) throw new Error('Submit failed');

                const successMessage = getText(contactData.form?.successMessage) ||
                    'Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.';

                if (window.toast && window.toast.success) {
                    window.toast.success(successMessage);
                } else {
                    showCustomAlert(successMessage, 'success');
                }
                form.reset();
            } catch (error) {
                console.error('Form submit error:', error);
                const errorMessage = currentLang === 'tr' ? 'Bir hata oluştu. Lütfen tekrar deneyin.' :
                    currentLang === 'en' ? 'An error occurred. Please try again.' :
                    'Произошла ошибка. Пожалуйста, попробуйте еще раз.';
                if (window.toast && window.toast.error) {
                    window.toast.error(errorMessage);
                } else {
                    showCustomAlert(errorMessage, 'error');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

})();
