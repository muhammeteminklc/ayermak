const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const contactPath = path.join(__dirname, '../data/contact.json');

// Helper functions
function getContactData() {
    if (!fs.existsSync(contactPath)) {
        const defaultData = {
            hero: {
                title: {
                    tr: "İletişim",
                    en: "Contact",
                    ru: "Контакты"
                },
                subtitle: {
                    tr: "Sorularınız için bizimle iletişime geçin. Size yardımcı olmaktan memnuniyet duyarız.",
                    en: "Feel free to reach out to us with any questions. We are happy to help you.",
                    ru: "Свяжитесь с нами по любым вопросам. Мы рады помочь вам."
                }
            },
            info: {
                title: {
                    tr: "Bize Ulaşın",
                    en: "Get in Touch",
                    ru: "Свяжитесь с нами"
                },
                address: {
                    tr: "Organize Sanayi Bölgesi\nKonya, Türkiye",
                    en: "Organized Industrial Zone\nKonya, Turkey",
                    ru: "Организованная промышленная зона\nКонья, Турция"
                },
                addressLabel: {
                    tr: "Adres",
                    en: "Address",
                    ru: "Адрес"
                },
                phone: "+90 332 251 23 45",
                phoneLabel: {
                    tr: "Telefon",
                    en: "Phone",
                    ru: "Телефон"
                },
                email: "info@ayermak.com",
                emailLabel: {
                    tr: "E-posta",
                    en: "Email",
                    ru: "Эл. почта"
                },
                workingHours: {
                    tr: "Pazartesi - Cumartesi: 08:00 - 18:00\nPazar: Kapalı",
                    en: "Monday - Saturday: 08:00 - 18:00\nSunday: Closed",
                    ru: "Понедельник - Суббота: 08:00 - 18:00\nВоскресенье: Закрыто"
                },
                workingHoursLabel: {
                    tr: "Çalışma Saatleri",
                    en: "Working Hours",
                    ru: "Рабочие часы"
                }
            },
            form: {
                title: {
                    tr: "Mesaj Gönderin",
                    en: "Send a Message",
                    ru: "Отправить сообщение"
                },
                labels: {
                    name: { tr: "Adınız Soyadınız", en: "Your Name", ru: "Ваше имя" },
                    email: { tr: "E-posta Adresiniz", en: "Your Email", ru: "Ваш email" },
                    phone: { tr: "Telefon Numaranız", en: "Your Phone", ru: "Ваш телефон" },
                    message: { tr: "Mesajınız", en: "Your Message", ru: "Ваше сообщение" },
                    send: { tr: "Mesaj Gönder", en: "Send Message", ru: "Отправить" }
                },
                successMessage: {
                    tr: "Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.",
                    en: "Your message has been sent! We will get back to you as soon as possible.",
                    ru: "Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время."
                }
            },
            map: {
                embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d195884.30093056886!2d32.62030645!3d37.87135235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d08f60c1f4b8c1%3A0x9bf0c0e0e0e0e0e0!2sKonya%2C%20Turkey!5e0!3m2!1sen!2str!4v1234567890"
            },
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(contactPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    const data = fs.readFileSync(contactPath, 'utf8');
    return JSON.parse(data);
}

function saveContactData(data) {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(contactPath, JSON.stringify(data, null, 2));
}

// Routes

// Get contact data (public)
router.get('/', (req, res) => {
    try {
        const data = getContactData();
        res.json(data);
    } catch (error) {
        console.error('Get contact data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update contact data (protected)
router.put('/', authenticateToken, (req, res) => {
    try {
        const currentData = getContactData();
        const updatedData = {
            ...currentData,
            ...req.body
        };
        saveContactData(updatedData);
        res.json(updatedData);
    } catch (error) {
        console.error('Update contact data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
