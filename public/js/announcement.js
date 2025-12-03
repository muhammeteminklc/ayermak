/**
 * AYERMAK Announcement Popup System
 * Displays promotional popups on the homepage with smart display frequency
 */
(function () {
    const STORAGE_KEY = 'ayermak_announcement';
    const SESSION_KEY = 'ayermak_announcement_session';
    const DISPLAY_DELAY = 2500; // 2.5 seconds after page load

    let currentAnnouncement = null;
    let hasShownThisPageload = false;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', initAnnouncement);

    async function initAnnouncement() {
        // Only run on homepage
        if (!isHomepage()) return;

        // Fetch active announcement from API
        const announcement = await fetchActiveAnnouncement();
        if (!announcement) return;

        // Check if should show
        if (!shouldShow(announcement)) return;

        currentAnnouncement = announcement;

        // Show popup after delay
        setTimeout(() => {
            if (!hasShownThisPageload) {
                showPopup();
            }
        }, DISPLAY_DELAY);
    }

    function isHomepage() {
        const path = window.location.pathname;
        return path === '/' ||
               path === '/index.html' ||
               /^\/(tr|en|ru)\/?$/.test(path) ||
               /^\/(tr|en|ru)\/index\.html$/.test(path);
    }

    async function fetchActiveAnnouncement() {
        try {
            const response = await fetch('/api/announcement');
            if (!response.ok) return null;
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch announcement:', error);
            return null;
        }
    }

    function shouldShow(announcement) {
        if (!announcement) return false;

        const stored = getStorageData();
        const session = getSessionData();

        // Check if already closed in this session
        if (session.closedInSession && session.id === announcement.id) {
            return false;
        }

        // Check if user opted out for this announcement
        if (stored.dontShowAgain && stored.id === announcement.id) {
            return false;
        }

        // Check if announcement is new (ID or updatedAt changed)
        const isNew = stored.id !== announcement.id ||
            stored.lastSeenUpdatedAt !== announcement.updatedAt;

        if (isNew) {
            // Reset storage for new announcement
            clearStorageData();
            clearSessionData();
            return true;
        }

        // Check if reset interval has passed
        const { resetIntervalMinutes } = announcement.displaySettings;
        const resetMs = resetIntervalMinutes * 60 * 1000;
        const now = Date.now();

        if (stored.firstViewTime && (now - stored.firstViewTime) > resetMs) {
            // Time-based reset
            clearStorageData();
            clearSessionData();
            return true;
        }

        // Check view count
        const { maxViewsPerUser } = announcement.displaySettings;
        if ((stored.viewCount || 0) >= maxViewsPerUser) {
            return false;
        }

        return true;
    }

    function showPopup() {
        if (hasShownThisPageload || !currentAnnouncement) return;
        hasShownThisPageload = true;

        renderPopup();
        recordView();

        // Animate in
        requestAnimationFrame(() => {
            const popup = document.getElementById('announcement-popup');
            if (popup) {
                popup.classList.add('active');
            }
        });
    }

    function renderPopup() {
        const lang = getCurrentLanguage();
        const a = currentAnnouncement;

        const title = a.title?.[lang] || a.title?.tr || '';
        const description = a.description?.[lang] || a.description?.tr || '';
        const buttonText = a.button?.text?.[lang] || a.button?.text?.tr || getDefaultText(lang, 'button');

        // Get language-specific link (fallback to old single link format for backwards compatibility)
        const buttonLink = a.button?.links?.[lang] || a.button?.link || '';

        const dontShowText = getDefaultText(lang, 'dontshow');

        const html = `
            <div class="announcement-popup" id="announcement-popup">
                <div class="announcement-overlay" data-action="close"></div>
                <div class="announcement-modal">
                    <button class="announcement-close" data-action="close" aria-label="Close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                    ${a.image ? `
                    <div class="announcement-image">
                        <img src="/images/announcement/${a.image}" alt="${title}">
                    </div>
                    ` : ''}
                    <div class="announcement-content">
                        ${title ? `<h2 class="announcement-title">${title}</h2>` : ''}
                        ${description ? `<div class="announcement-body">${description}</div>` : ''}
                        ${buttonLink ? `
                        <a href="${buttonLink}" class="announcement-cta">${buttonText}</a>
                        ` : ''}
                        <div class="announcement-dontshow-wrapper">
                            <label class="announcement-dontshow">
                                <input type="checkbox" id="announcement-dontshow-checkbox">
                                <span>${dontShowText}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        attachEventListeners();
    }

    function getDefaultText(lang, type) {
        const texts = {
            tr: { dontshow: 'Bir daha gösterme', button: 'Detaylar' },
            en: { dontshow: "Don't show again", button: 'Details' },
            ru: { dontshow: 'Больше не показывать', button: 'Подробности' }
        };
        return texts[lang]?.[type] || texts.tr[type];
    }

    function getCurrentLanguage() {
        // Try to get from i18n system
        if (window.i18n?.currentLang) {
            return window.i18n.currentLang;
        }
        // Try to get from URL
        const match = window.location.pathname.match(/^\/(tr|en|ru)/);
        if (match) {
            return match[1];
        }
        // Try to get from HTML lang attribute
        const htmlLang = document.documentElement.lang;
        if (['tr', 'en', 'ru'].includes(htmlLang)) {
            return htmlLang;
        }
        return 'tr';
    }

    function attachEventListeners() {
        const popup = document.getElementById('announcement-popup');
        if (!popup) return;

        // Close button and overlay click
        popup.querySelectorAll('[data-action="close"]').forEach(el => {
            el.addEventListener('click', closePopup);
        });

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Prevent body scroll when popup is open
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        const popup = document.getElementById('announcement-popup');
        const dontShowCheckbox = document.getElementById('announcement-dontshow-checkbox');

        // Mark as closed in this session
        markClosedInSession();

        if (dontShowCheckbox?.checked) {
            setDontShowAgain();
        }

        popup?.classList.remove('active');

        setTimeout(() => {
            popup?.remove();
            document.body.style.overflow = '';
        }, 300);
    }

    function recordView() {
        const stored = getStorageData();
        const now = Date.now();

        const newData = {
            id: currentAnnouncement.id,
            lastSeenUpdatedAt: currentAnnouncement.updatedAt,
            viewCount: (stored.viewCount || 0) + 1,
            firstViewTime: stored.firstViewTime || now,
            dontShowAgain: stored.dontShowAgain || false
        };

        saveStorageData(newData);
    }

    function setDontShowAgain() {
        const stored = getStorageData();
        stored.dontShowAgain = true;
        saveStorageData(stored);
    }

    function markClosedInSession() {
        if (!currentAnnouncement) return;
        saveSessionData({
            id: currentAnnouncement.id,
            closedInSession: true
        });
    }

    // LocalStorage functions (persistent)
    function getStorageData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.warn('Could not read announcement storage:', e);
        }
        return {};
    }

    function saveStorageData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save announcement storage:', e);
        }
    }

    function clearStorageData() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Could not clear announcement storage:', e);
        }
    }

    // SessionStorage functions (per browser session)
    function getSessionData() {
        try {
            const stored = sessionStorage.getItem(SESSION_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.warn('Could not read session storage:', e);
        }
        return {};
    }

    function saveSessionData(data) {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save session storage:', e);
        }
    }

    function clearSessionData() {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (e) {
            console.warn('Could not clear session storage:', e);
        }
    }

    // Expose for debugging
    window.announcementManager = {
        show: showPopup,
        close: closePopup,
        clear: () => {
            clearStorageData();
            clearSessionData();
        }
    };
})();
