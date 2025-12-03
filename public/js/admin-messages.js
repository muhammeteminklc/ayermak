// Admin Messages Controller
(function () {
    const API_BASE = '/api';
    let messagesData = null;
    let emailSettings = null;

    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        await Promise.all([loadMessages(), loadEmailSettings()]);
        renderMessages();
        renderEmailSettings();
        lucide.createIcons();
    }

    // Email Settings Functions
    async function loadEmailSettings() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/messages/settings/email`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load email settings');
            emailSettings = await response.json();
        } catch (error) {
            console.error('E-posta ayarları yüklenemedi:', error);
            emailSettings = {
                enabled: false,
                hasApiKey: false,
                notifyEmail: '',
                fromEmail: 'AYERMAK <onboarding@resend.dev>',
                emailSubject: 'Yeni İletişim Formu Mesajı'
            };
        }
    }

    function renderEmailSettings() {
        if (!emailSettings) return;

        // Update status badge
        const statusBadge = document.getElementById('emailStatusBadge');
        if (statusBadge) {
            if (emailSettings.enabled && emailSettings.hasApiKey && emailSettings.notifyEmail) {
                statusBadge.className = 'email-status enabled';
                statusBadge.innerHTML = '<i data-lucide="mail-check"></i> Bildirimler aktif';
            } else {
                statusBadge.className = 'email-status disabled';
                statusBadge.innerHTML = '<i data-lucide="mail-x"></i> Bildirimler kapalı';
            }
        }

        // Update toggle
        const toggle = document.getElementById('emailEnabledToggle');
        if (toggle) {
            toggle.classList.toggle('active', emailSettings.enabled);
        }

        // Update form fields
        const notifyEmail = document.getElementById('notifyEmail');
        const fromEmail = document.getElementById('fromEmail');
        const emailSubject = document.getElementById('emailSubject');
        const resendApiKey = document.getElementById('resendApiKey');

        if (notifyEmail) notifyEmail.value = emailSettings.notifyEmail || '';
        if (fromEmail) fromEmail.value = emailSettings.fromEmail || 'AYERMAK <onboarding@resend.dev>';
        if (emailSubject) emailSubject.value = emailSettings.emailSubject || 'Yeni İletişim Formu Mesajı';
        if (resendApiKey && emailSettings.hasApiKey) {
            resendApiKey.value = emailSettings.resendApiKey || '';
            resendApiKey.placeholder = 'API anahtarı kayıtlı (değiştirmek için yeni girin)';
        }

        lucide.createIcons();
    }

    // Toggle email settings panel
    window.toggleEmailSettings = function () {
        const body = document.getElementById('emailSettingsBody');
        const icon = document.getElementById('emailToggleIcon');
        if (body && icon) {
            body.classList.toggle('open');
            icon.classList.toggle('open');
        }
    };

    // Toggle email enabled
    window.toggleEmailEnabled = function (e) {
        e.stopPropagation();
        const toggle = document.getElementById('emailEnabledToggle');
        if (toggle) {
            toggle.classList.toggle('active');
            emailSettings.enabled = toggle.classList.contains('active');
        }
    };

    // Save email settings
    window.saveEmailSettings = async function () {
        const resendApiKey = document.getElementById('resendApiKey')?.value?.trim();
        const notifyEmail = document.getElementById('notifyEmail')?.value?.trim();
        const fromEmail = document.getElementById('fromEmail')?.value?.trim();
        const emailSubject = document.getElementById('emailSubject')?.value?.trim();
        const enabled = document.getElementById('emailEnabledToggle')?.classList.contains('active');

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/messages/settings/email`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enabled,
                    resendApiKey,
                    notifyEmail,
                    fromEmail,
                    emailSubject
                })
            });

            if (!response.ok) throw new Error('Failed to save');

            // Reload settings
            await loadEmailSettings();
            renderEmailSettings();

            if (window.toast) {
                window.toast.success('E-posta ayarları kaydedildi');
            }
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            if (window.toast) {
                window.toast.error('Ayarlar kaydedilemedi');
            }
        }
    };

    // Test email
    window.testEmail = async function () {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/messages/settings/email/test`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();

            if (response.ok) {
                if (window.toast) {
                    window.toast.success(result.message || 'Test e-postası gönderildi!');
                }
            } else {
                throw new Error(result.error || 'Test başarısız');
            }
        } catch (error) {
            console.error('Test hatası:', error);
            if (window.toast) {
                window.toast.error(error.message || 'Test e-postası gönderilemedi');
            }
        }
    };

    async function loadMessages() {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load messages');

            messagesData = await response.json();
        } catch (error) {
            console.error('Mesajlar yüklenemedi:', error);
            messagesData = { messages: [] };
        }
    }

    function renderMessages() {
        const container = document.getElementById('messagesList');
        const unreadBadge = document.getElementById('unreadBadge');
        const messages = messagesData?.messages || [];

        // Update unread count
        const unreadCount = messages.filter(m => !m.read).length;
        if (unreadCount > 0) {
            unreadBadge.textContent = `${unreadCount} okunmamış`;
            unreadBadge.style.display = 'inline-block';
        } else {
            unreadBadge.style.display = 'none';
        }

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <h3>Henüz mesaj yok</h3>
                    <p>İletişim formundan gönderilen mesajlar burada görünecek.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => `
            <div class="message-card ${msg.read ? '' : 'unread'}" data-id="${msg.id}">
                <div class="message-header">
                    <div class="message-sender">
                        <span class="message-name">${escapeHtml(msg.name)}</span>
                        <span class="message-contact">
                            <a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a>
                            ${msg.phone ? ` | <a href="tel:${msg.phone.replace(/\s/g, '')}">${escapeHtml(msg.phone)}</a>` : ''}
                        </span>
                    </div>
                    <span class="message-date">${formatDate(msg.createdAt)}</span>
                </div>
                <div class="message-body">${escapeHtml(msg.message)}</div>
                <div class="message-actions">
                    ${!msg.read ? `
                        <button class="message-btn read-btn" onclick="markAsRead('${msg.id}')">
                            <i data-lucide="check"></i>
                            Okundu
                        </button>
                    ` : ''}
                    <a href="mailto:${escapeHtml(msg.email)}?subject=Re: AYERMAK İletişim Formu" class="message-btn reply-btn">
                        <i data-lucide="reply"></i>
                        Yanıtla
                    </a>
                    <button class="message-btn delete-btn" onclick="deleteMessage('${msg.id}')">
                        <i data-lucide="trash-2"></i>
                        Sil
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Mark message as read
    window.markAsRead = async function (id) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/messages/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed');

            // Update local data
            const msg = messagesData.messages.find(m => m.id === id);
            if (msg) msg.read = true;

            renderMessages();
            if (typeof toast !== 'undefined') {
                toast.success('Mesaj okundu olarak işaretlendi');
            }
        } catch (error) {
            console.error('Hata:', error);
            if (typeof toast !== 'undefined') {
                toast.error('Bir hata oluştu');
            }
        }
    };

    // Delete message
    window.deleteMessage = async function (id) {
        if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE}/messages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed');

            // Remove from local data
            messagesData.messages = messagesData.messages.filter(m => m.id !== id);

            renderMessages();
            if (typeof toast !== 'undefined') {
                toast.success('Mesaj silindi');
            }
        } catch (error) {
            console.error('Hata:', error);
            if (typeof toast !== 'undefined') {
                toast.error('Bir hata oluştu');
            }
        }
    };

})();
