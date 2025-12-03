document.addEventListener('DOMContentLoaded', () => {
    loadNews();

    // Listen for language changes to re-render news
    window.addEventListener('languageChanged', () => {
        loadNews();
    });
});

async function loadNews() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    try {
        const response = await fetch('/api/news');
        const news = await response.json();

        if (news.length === 0) {
            grid.innerHTML = `
                <div class="no-news">
                    <p data-i18n="newsPage.noNews">${window.i18n?.t('newsPage.noNews') || 'Henüz haber bulunmuyor.'}</p>
                </div>
            `;
            return;
        }

        const currentLang = window.i18n?.currentLang || 'tr';
        const readMoreText = window.i18n?.t('newsPage.readMore') || 'Devamını Oku';

        grid.innerHTML = news.map(item => {
            const title = item.title?.[currentLang] || item.title?.tr || '';
            const summary = item.summary?.[currentLang] || item.summary?.tr || '';
            const date = new Date(item.date).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : (currentLang === 'en' ? 'en-US' : 'ru-RU'), {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Use slug if available, otherwise use ID
            const newsSlug = item.slug?.[currentLang] || item.id;
            const newsUrl = window.i18n?.getNewsDetailUrl(newsSlug) || `/${currentLang}/haberler/${newsSlug}`;

            return `
                <a href="${newsUrl}" class="news-card">
                    <img src="/images/news/${item.image}" alt="${title}" class="news-image" loading="lazy">
                    <div class="news-content">
                        <div class="news-date">
                            <i data-lucide="calendar"></i>
                            ${date}
                        </div>
                        <h3 class="news-title">${title}</h3>
                        <p class="news-summary">${summary}</p>
                        <div class="news-link">
                            ${readMoreText}
                            <i data-lucide="arrow-right"></i>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    } catch (error) {
        console.error('Error loading news:', error);
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: red;">Haberler yüklenirken bir hata oluştu.</p>';
    }
}
