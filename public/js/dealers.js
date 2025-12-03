// Dealers Page Script

let domesticMap, internationalMap;
let domesticMarkers = [];
let internationalMarkers = [];

// Initialize maps
function initMaps() {
    // Modern minimal map style - CartoDB Positron (light, clean)
    const mapTiles = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const mapAttribution = '&copy; <a href="https://carto.com/attributions">CARTO</a>';

    // Domestic Map - Centered on Turkey
    domesticMap = L.map('domesticMap', {
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false
    }).setView([39.0, 35.0], 6);

    L.tileLayer(mapTiles, {
        attribution: mapAttribution,
        maxZoom: 18,
        subdomains: 'abcd'
    }).addTo(domesticMap);

    // Add minimal zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(domesticMap);

    // International Map - World view
    internationalMap = L.map('internationalMap', {
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false
    }).setView([25.0, 20.0], 2);

    L.tileLayer(mapTiles, {
        attribution: mapAttribution,
        maxZoom: 18,
        subdomains: 'abcd'
    }).addTo(internationalMap);

    // Add minimal zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(internationalMap);

    // Load dealers data
    loadDealers();
}

// Load all dealers
async function loadDealers() {
    try {
        const response = await fetch('/api/dealers');
        const data = await response.json();

        if (data.domestic && data.domestic.length > 0) {
            renderDealers(data.domestic, 'domestic');
        } else {
            showNoData('domesticDealers', 'Henüz yurt içi bayi eklenmemiş.');
        }

        if (data.international && data.international.length > 0) {
            renderDealers(data.international, 'international');
        } else {
            showNoData('internationalDealers', 'Henüz yurt dışı bayi eklenmemiş.');
        }

        if (data.certificates && data.certificates.length > 0) {
            renderCertificates(data.certificates);
        } else {
            showNoData('certificatesGrid', 'Henüz sertifika eklenmemiş.');
        }
    } catch (error) {
        console.error('Error loading dealers:', error);
        showNoData('domesticDealers', 'Bayiler yüklenirken bir hata oluştu.');
        showNoData('internationalDealers', 'Bayiler yüklenirken bir hata oluştu.');
        showNoData('certificatesGrid', 'Sertifikalar yüklenirken bir hata oluştu.');
    }
}

// Render dealers on map and list
function renderDealers(dealers, type) {
    const map = type === 'domestic' ? domesticMap : internationalMap;
    const markers = type === 'domestic' ? domesticMarkers : internationalMarkers;
    const listContainer = document.getElementById(type === 'domestic' ? 'domesticDealers' : 'internationalDealers');

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers.length = 0;

    // Clear list
    listContainer.innerHTML = '';

    // Modern minimal marker with pulse effect
    const customIcon = L.divIcon({
        className: 'modern-marker',
        html: `
            <div class="marker-pulse"></div>
            <div class="marker-dot"></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -16]
    });

    dealers.forEach(dealer => {
        // Add marker to map
        if (dealer.latitude && dealer.longitude) {
            const marker = L.marker([dealer.latitude, dealer.longitude], { icon: customIcon })
                .addTo(map)
                .bindPopup(createPopupContent(dealer));

            markers.push(marker);

            // Click dealer card to zoom to marker
            const mapId = type === 'domestic' ? 'domesticMap' : 'internationalMap';
            const dealerCard = createDealerCard(dealer, () => {
                map.setView([dealer.latitude, dealer.longitude], 13);
                marker.openPopup();
            }, mapId);

            listContainer.appendChild(dealerCard);
        }
    });

    // Fit map bounds to show all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Create popup content for marker - Modern minimal design
function createPopupContent(dealer) {
    return `
        <div class="modern-popup">
            <div class="modern-popup-header">
                <span class="modern-popup-badge">${dealer.city}</span>
            </div>
            <h3 class="modern-popup-title">${dealer.name}</h3>
            <p class="modern-popup-address">${dealer.address}</p>
            <div class="modern-popup-actions">
                ${dealer.phone ? `
                <a href="tel:${dealer.phone}" class="modern-popup-btn primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                </a>
                ` : ''}
                ${dealer.email ? `
                <a href="mailto:${dealer.email}" class="modern-popup-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </a>
                ` : ''}
                ${dealer.website ? `
                <a href="${dealer.website}" target="_blank" class="modern-popup-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Create dealer card for list - Modern minimal design
function createDealerCard(dealer, onClick, mapId) {
    const card = document.createElement('div');
    card.className = 'modern-dealer-card';

    // Click handler with smooth scroll to map
    card.onclick = () => {
        // Scroll to map
        const mapElement = document.getElementById(mapId);
        if (mapElement) {
            mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Execute original onClick after a small delay
        setTimeout(() => {
            if (onClick) onClick();
        }, 300);
    };

    card.innerHTML = `
        <div class="modern-dealer-indicator"></div>
        <div class="modern-dealer-content">
            <div class="modern-dealer-header">
                <h3 class="modern-dealer-name">${dealer.name}</h3>
                <span class="modern-dealer-city">${dealer.city}</span>
            </div>
            <p class="modern-dealer-address">${dealer.address}</p>
            <div class="modern-dealer-contact">
                ${dealer.phone ? `
                <a href="tel:${dealer.phone}" class="modern-contact-item" onclick="event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>${dealer.phone}</span>
                </a>
                ` : ''}
                ${dealer.email ? `
                <a href="mailto:${dealer.email}" class="modern-contact-item" onclick="event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>${dealer.email}</span>
                </a>
                ` : ''}
            </div>
            <div class="modern-dealer-footer">
                ${dealer.website ? `
                <a href="${dealer.website}" target="_blank" class="modern-website-link" onclick="event.stopPropagation()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>Website</span>
                </a>
                ` : ''}
                <div class="modern-view-map">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${window.i18n ? window.i18n.t('dealers.viewOnMap') : 'Haritada Gör'}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

// Render certificates
function renderCertificates(certificates) {
    const container = document.getElementById('certificatesGrid');
    container.innerHTML = '';

    certificates.forEach(cert => {
        const card = document.createElement('div');
        card.className = 'certificate-card';

        const imageUrl = cert.image || '/images/placeholder-certificate.png';


        card.innerHTML = `
            <div class="certificate-card-image" onclick="openLightbox('${imageUrl}')" style="cursor: pointer;">
                <img src="${imageUrl}" alt="${cert.title}" onerror="this.src='/images/placeholder-certificate.png'">
            </div>
            <div class="certificate-card-content">
                <h3 class="certificate-card-title">${cert.title}</h3>
                <p class="certificate-card-description">${cert.description || ''}</p>
                <div class="certificate-card-footer">

                    ${cert.file ? `
                    <a href="${cert.file}" class="certificate-card-download" download target="_blank">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        İndir
                    </a>
                    ` : ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// Show no data message
function showNoData(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="no-data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>Veri Bulunamadı</h3>
            <p>${message}</p>
        </div>
    `;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Leaflet is fully loaded
    setTimeout(() => {
        initMaps();
    }, 100);
});

// Lightbox function
function openLightbox(imageUrl) {
    if (!imageUrl) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    lightbox.appendChild(img);
    document.body.appendChild(lightbox);

    // Trigger animation
    requestAnimationFrame(() => {
        lightbox.style.opacity = '1';
        img.style.transform = 'scale(1)';
    });

    lightbox.onclick = () => {
        lightbox.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        setTimeout(() => lightbox.remove(), 300);
    };
}
window.openLightbox = openLightbox;

