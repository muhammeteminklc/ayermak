(function () {
    const SIDEBAR_TEMPLATE = `
<aside class="admin-sidebar">
    <div class="sidebar-header">
        <div class="sidebar-brand">
            <img src="/images/ayermak.png" alt="AYERMAK" class="sidebar-logo">
            <div class="sidebar-brand-text">
                <span class="brand-title">AYERMAK</span>
                <span class="brand-subtitle">Admin Paneli</span>
            </div>
        </div>
        <div class="sidebar-badge">Kontrol Merkezi</div>
    </div>

    <nav class="sidebar-nav">
        <p class="sidebar-section-label">Genel</p>
        <a href="/admin/homepage.html" class="sidebar-link" data-nav="homepage">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Anasayfa</span>
                <small>Vitrin & içerikler</small>
            </div>
        </a>

        <a href="/admin/messages.html" class="sidebar-link" data-nav="messages">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Mesajlar</span>
                <small>Gelen kutusu</small>
            </div>
        </a>

        <a href="/admin/products.html" class="sidebar-link" data-nav="products">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Ürünler</span>
                <small>Envanter & sıralama</small>
            </div>
        </a>

        <a href="/admin/news.html" class="sidebar-link" data-nav="news">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19h16a2 2 0 0 0 2-2V5H5a1 1 0 0 0-1 1z"></path>
                    <path d="M2 7v10a2 2 0 0 0 2 2"></path>
                    <path d="M16 3v4"></path>
                    <path d="M12 3v4"></path>
                    <path d="M8 3v4"></path>
                    <path d="M7 11h7"></path>
                    <path d="M7 15h10"></path>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Haberler</span>
                <small>Blog & duyurular</small>
            </div>
        </a>

        <a href="/admin/announcement.html" class="sidebar-link" data-nav="announcement">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Popup Duyuru</span>
                <small>Acilis bildirimi</small>
            </div>
        </a>

        <a href="/admin/dealers.html" class="sidebar-link" data-nav="dealers">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Bayiler</span>
                <small>Bayiler & sertifikalar</small>
            </div>
        </a>

        <a href="/admin/translations.html" class="sidebar-link" data-nav="translations">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9"></circle>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"></path>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Çeviriler</span>
                <small>Çok dil desteği</small>
            </div>
        </a>

        <a href="/admin/about.html" class="sidebar-link" data-nav="about">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Hakkımızda</span>
                <small>Kurumsal bilgiler</small>
            </div>
        </a>

        <a href="/admin/contact.html" class="sidebar-link" data-nav="contact">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>İletişim</span>
                <small>İletişim sayfası</small>
            </div>
        </a>

        <a href="/admin/footer.html" class="sidebar-link" data-nav="footer">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Footer</span>
                <small>Alt bilgi alanı</small>
            </div>
        </a>
    </nav>

    <div class="sidebar-divider"></div>

    <div class="sidebar-footer">
        <div class="sidebar-footer-text">
            <span>Güvenli Çıkış</span>
            <small>Hesabınızdan ayrılın</small>
        </div>
        <button type="button" class="sidebar-link sidebar-link-ghost" onclick="logout()">
            <span class="sidebar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            </span>
            <div class="sidebar-text">
                <span>Çıkış Yap</span>
                <small>Admin oturumunu kapat</small>
            </div>
        </button>
    </div>
</aside>
`.trim();

    window.renderAdminSidebar = function renderAdminSidebar(container) {
        if (!container) return;
        container.innerHTML = SIDEBAR_TEMPLATE;

        const activeKey = container.dataset.active;
        if (activeKey) {
            container.querySelectorAll('[data-nav]').forEach(link => {
                link.classList.toggle('active', link.dataset.nav === activeKey);
            });
        }
    };
})();

