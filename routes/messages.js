const express = require('express');
const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const messagesPath = path.join(__dirname, '../data/messages.json');

// Helper functions
function getMessagesData() {
    if (!fs.existsSync(messagesPath)) {
        const defaultData = {
            emailSettings: {
                enabled: false,
                resendApiKey: '',
                notifyEmail: '',
                fromEmail: 'AYERMAK <onboarding@resend.dev>',
                emailSubject: 'Yeni İletişim Formu Mesajı'
            },
            messages: [],
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(messagesPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    const data = fs.readFileSync(messagesPath, 'utf8');
    return JSON.parse(data);
}

function saveMessagesData(data) {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(messagesPath, JSON.stringify(data, null, 2));
}

// Send email notification
async function sendEmailNotification(messageData) {
    const data = getMessagesData();
    const settings = data.emailSettings;

    if (!settings?.enabled || !settings?.resendApiKey || !settings?.notifyEmail) {
        return { sent: false, reason: 'Email notifications disabled or not configured' };
    }

    try {
        const resend = new Resend(settings.resendApiKey);

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #fabf1e 0%, #e6a800 100%); padding: 20px; text-align: center;">
                    <h1 style="color: #1a1a1a; margin: 0;">AYERMAK</h1>
                    <p style="color: #333; margin: 10px 0 0;">Yeni İletişim Formu Mesajı</p>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Ad Soyad:</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${messageData.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">E-posta:</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <a href="mailto:${messageData.email}" style="color: #b8860b;">${messageData.email}</a>
                            </td>
                        </tr>
                        ${messageData.phone ? `
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">Telefon:</td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                                <a href="tel:${messageData.phone}" style="color: #b8860b;">${messageData.phone}</a>
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                    <div style="margin-top: 20px;">
                        <p style="font-weight: bold; margin-bottom: 10px;">Mesaj:</p>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #fabf1e;">
                            ${messageData.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center; background: #1a1a1a; color: #999; font-size: 12px;">
                    <p style="margin: 0;">Bu e-posta AYERMAK web sitesi iletişim formundan otomatik olarak gönderilmiştir.</p>
                </div>
            </div>
        `;

        await resend.emails.send({
            from: settings.fromEmail,
            to: settings.notifyEmail,
            subject: settings.emailSubject || 'Yeni İletişim Formu Mesajı',
            html: emailHtml,
            replyTo: messageData.email
        });

        return { sent: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { sent: false, reason: error.message };
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Submit a new message (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Ad, e-posta ve mesaj zorunludur' });
        }

        const data = getMessagesData();
        const newMessage = {
            id: generateId(),
            name,
            email,
            phone: phone || '',
            message,
            read: false,
            createdAt: new Date().toISOString()
        };

        data.messages.unshift(newMessage);
        saveMessagesData(data);

        // Send email notification (don't wait, don't fail if email fails)
        sendEmailNotification(newMessage).catch(err => {
            console.error('Email notification failed:', err);
        });

        res.status(201).json({ success: true, message: 'Mesajınız başarıyla gönderildi' });
    } catch (error) {
        console.error('Submit message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all messages (protected)
router.get('/', authenticateToken, (req, res) => {
    try {
        const data = getMessagesData();
        res.json(data);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get unread count (protected)
router.get('/unread-count', authenticateToken, (req, res) => {
    try {
        const data = getMessagesData();
        const unreadCount = data.messages.filter(m => !m.read).length;
        res.json({ count: unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark message as read (protected)
router.put('/:id/read', authenticateToken, (req, res) => {
    try {
        const data = getMessagesData();
        const message = data.messages.find(m => m.id === req.params.id);

        if (!message) {
            return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }

        message.read = true;
        saveMessagesData(data);

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete message (protected)
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const data = getMessagesData();
        const index = data.messages.findIndex(m => m.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Mesaj bulunamadı' });
        }

        data.messages.splice(index, 1);
        saveMessagesData(data);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get email settings (protected)
router.get('/settings/email', authenticateToken, (req, res) => {
    try {
        const data = getMessagesData();
        // Mask API key for security
        const settings = { ...data.emailSettings };
        if (settings.resendApiKey) {
            settings.resendApiKey = settings.resendApiKey.slice(0, 8) + '...' + settings.resendApiKey.slice(-4);
            settings.hasApiKey = true;
        } else {
            settings.hasApiKey = false;
        }
        res.json(settings);
    } catch (error) {
        console.error('Get email settings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update email settings (protected)
router.put('/settings/email', authenticateToken, (req, res) => {
    try {
        const { enabled, resendApiKey, notifyEmail, fromEmail, emailSubject } = req.body;
        const data = getMessagesData();

        if (!data.emailSettings) {
            data.emailSettings = {};
        }

        if (typeof enabled !== 'undefined') {
            data.emailSettings.enabled = enabled;
        }
        if (resendApiKey && resendApiKey !== '' && !resendApiKey.includes('...')) {
            data.emailSettings.resendApiKey = resendApiKey;
        }
        if (typeof notifyEmail !== 'undefined') {
            data.emailSettings.notifyEmail = notifyEmail;
        }
        if (typeof fromEmail !== 'undefined') {
            data.emailSettings.fromEmail = fromEmail;
        }
        if (typeof emailSubject !== 'undefined') {
            data.emailSettings.emailSubject = emailSubject;
        }

        saveMessagesData(data);
        res.json({ success: true });
    } catch (error) {
        console.error('Update email settings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Test email (protected)
router.post('/settings/email/test', authenticateToken, async (req, res) => {
    try {
        const data = getMessagesData();
        const settings = data.emailSettings;

        if (!settings?.resendApiKey || !settings?.notifyEmail) {
            return res.status(400).json({ error: 'API anahtarı ve bildirim e-postası gerekli' });
        }

        const testMessage = {
            name: 'Test Kullanıcı',
            email: 'test@example.com',
            phone: '+90 555 555 55 55',
            message: 'Bu bir test mesajıdır. E-posta bildirimleri doğru şekilde çalışıyor!'
        };

        const result = await sendEmailNotification(testMessage);

        if (result.sent) {
            res.json({ success: true, message: 'Test e-postası gönderildi!' });
        } else {
            res.status(400).json({ error: result.reason || 'E-posta gönderilemedi' });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
});

module.exports = router;
