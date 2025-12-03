// Admin Dealers Management Script

const API_BASE = window.API_BASE || '/api';

let currentDealerType = 'domestic';
let editingDealer = null;
let editingCertificate = null;
let modalMap = null;
let modalMarker = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth using global checkAuth function
    if (typeof checkAuth === 'function') {
        const authed = await checkAuth();
        if (!authed) return;
    }

    initTabs();
    loadAllDealers();
    initEventListeners();
});

// Initialize event listeners
function initEventListeners() {
    // Certificate image preview
    const certImageInput = document.getElementById('certificateImage');
    if (certImageInput) {
        certImageInput.addEventListener('change', handleCertificateImageChange);
    }

    // Form submissions
    const dealerForm = document.getElementById('dealerForm');
    if (dealerForm) {
        dealerForm.addEventListener('submit', handleDealerFormSubmit);
    }

    const certificateForm = document.getElementById('certificateForm');
    if (certificateForm) {
        certificateForm.addEventListener('submit', handleCertificateFormSubmit);
    }
}

// Tab Management
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            const content = document.querySelector(`[data-tab-content="${tabName}"]`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

// Load all dealers and certificates
async function loadAllDealers() {
    try {
        const response = await fetch('/api/dealers');
        const data = await response.json();

        renderDealers(data.domestic || [], 'domestic');
        renderDealers(data.international || [], 'international');
        renderCertificates(data.certificates || []);
    } catch (error) {
        console.error('Error loading dealers:', error);
        showError('Bayiler yüklenirken bir hata oluştu.');
    }
}

// Render dealers
function renderDealers(dealers, type) {
    const gridId = type === 'domestic' ? 'domesticDealersGrid' : 'internationalDealersGrid';
    const grid = document.getElementById(gridId);

    if (dealers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Henüz bayi eklenmemiş</h3>
                <p>Yeni bayi eklemek için yukarıdaki butonu kullanın.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = dealers.map(dealer => `
        <div class="dealer-item">
            <div class="dealer-item-header">
                <div class="dealer-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div class="dealer-item-title">
                    <h3>${dealer.name}</h3>
                    <p>${dealer.city}, ${dealer.country}</p>
                </div>
            </div>
            <div class="dealer-item-body">
                <div class="dealer-item-info">
                    <div class="dealer-info-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${dealer.address}</span>
                    </div>
                    ${dealer.phone ? `
                    <div class="dealer-info-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>${dealer.phone}</span>
                    </div>
                    ` : ''}
                    ${dealer.email ? `
                    <div class="dealer-info-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <span>${dealer.email}</span>
                    </div>
                    ` : ''}
                    <div class="dealer-info-row">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        <span><strong>Konum:</strong> ${dealer.latitude}, ${dealer.longitude}</span>
                    </div>
                </div>
            </div>
            <div class="dealer-item-footer">
                <button class="btn btn-sm btn-edit" onclick='editDealer(${JSON.stringify(dealer)}, "${type}")'>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Düzenle
                </button>
                <button class="btn btn-sm btn-delete" onclick='deleteDealer("${dealer.id}", "${type}")'>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Sil
                </button>
            </div>
        </div>
    `).join('');
}

// Render certificates
function renderCertificates(certificates) {
    const grid = document.getElementById('certificatesGrid');

    if (certificates.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Henüz sertifika eklenmemiş</h3>
                <p>Yeni sertifika eklemek için yukarıdaki butonu kullanın.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = certificates.map(cert => {
        const imageUrl = cert.image || '';


        return `
            <div class="certificate-item">
                <div class="certificate-item-image" onclick="openLightbox('${imageUrl}')" style="cursor: pointer;">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${cert.title}">` : '<div class="certificate-placeholder">🏆</div>'}
                </div>
                <div class="certificate-item-body">
                    <h3>${cert.title}</h3>
                    <p>${cert.description || ''}</p>
                </div>
                <div class="certificate-item-footer">
                    <button class="btn btn-sm btn-edit" onclick='editCertificate(${JSON.stringify(cert).replace(/'/g, "&apos;")})'>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Düzenle
                    </button>
                    <button class="btn btn-sm btn-delete" onclick='deleteCertificate("${cert.id}")'>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Sil
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ==== DEALER MODAL ====

function openDealerModal(type) {
    currentDealerType = type;
    editingDealer = null;

    const modal = document.getElementById('dealerModal');
    if (!modal) return;

    const form = document.getElementById('dealerForm');
    const title = document.getElementById('dealerModalTitle');

    if (title) {
        title.innerHTML = `
            <span class="modal-title-icon">📍</span>
            ${type === 'domestic' ? 'Yurt İçi Bayi Ekle' : 'Yurt Dışı Bayi Ekle'}
        `;
    }

    if (form) {
        form.reset();
    }

    const setValueIfExists = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    setValueIfExists('dealerId', '');
    setValueIfExists('dealerType', type);
    setValueIfExists('dealerLatitude', '');
    setValueIfExists('dealerLongitude', '');

    const coordsDisplay = document.getElementById('selectedCoords');
    if (coordsDisplay) {
        coordsDisplay.textContent = 'Haritada bir konum seçin';
    }

    modal.classList.add('active');

    // Initialize map after modal is visible
    setTimeout(() => {
        initModalMap(type);
    }, 100);
}

function editDealer(dealer, type) {
    currentDealerType = type;
    editingDealer = dealer;

    const modal = document.getElementById('dealerModal');
    if (!modal) return;

    const title = document.getElementById('dealerModalTitle');
    if (title) {
        title.innerHTML = `
            <span class="modal-title-icon">✏️</span>
            Bayi Düzenle
        `;
    }

    const setValueIfExists = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };

    setValueIfExists('dealerId', dealer.id);
    setValueIfExists('dealerType', type);
    setValueIfExists('dealerName', dealer.name);
    setValueIfExists('dealerCity', dealer.city);
    setValueIfExists('dealerAddress', dealer.address);
    setValueIfExists('dealerCountry', dealer.country);
    setValueIfExists('dealerPhone', dealer.phone);
    setValueIfExists('dealerEmail', dealer.email);
    setValueIfExists('dealerWebsite', dealer.website);
    setValueIfExists('dealerLatitude', dealer.latitude);
    setValueIfExists('dealerLongitude', dealer.longitude);

    modal.classList.add('active');

    // Initialize map with existing location
    setTimeout(() => {
        initModalMap(type, dealer.latitude, dealer.longitude);
    }, 100);
}

function closeDealerModal() {
    const modal = document.getElementById('dealerModal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Clean up map
    if (modalMap) {
        modalMap.remove();
        modalMap = null;
        modalMarker = null;
    }

    editingDealer = null;
}

// ==== MAP FUNCTIONS ====

function initModalMap(type, lat = null, lng = null) {
    const mapContainer = document.getElementById('dealerModalMap');
    if (!mapContainer) return;

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Harita yüklenemedi. Sayfayı yenileyin.</div>';
        return;
    }

    // Remove existing map if any
    if (modalMap) {
        modalMap.remove();
    }

    // Default centers
    const defaultCenter = type === 'domestic' ? [39.0, 35.0] : [30.0, 10.0];
    const defaultZoom = type === 'domestic' ? 6 : 2;

    // Use provided coordinates or defaults
    const center = (lat && lng) ? [lat, lng] : defaultCenter;
    const zoom = (lat && lng) ? 13 : defaultZoom;

    // Create map
    modalMap = L.map('dealerModalMap').setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(modalMap);

    // Create custom marker icon
    const customIcon = L.divIcon({
        className: 'custom-modal-marker',
        html: `<div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #E8A824 0%, #d49920 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <span style="transform: rotate(45deg); font-size: 20px;">📍</span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    // Add marker if coordinates provided
    if (lat && lng) {
        modalMarker = L.marker([lat, lng], {
            icon: customIcon,
            draggable: true
        }).addTo(modalMap);

        modalMarker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            updateLocationDisplay(pos.lat, pos.lng);
        });

        updateLocationDisplay(lat, lng);
    }

    // Click to zoom in progressively, then place marker when zoomed enough
    modalMap.on('click', function (e) {
        const currentZoom = modalMap.getZoom();
        const minZoomForSelection = 13; // Minimum zoom level to allow marker placement

        if (currentZoom < minZoomForSelection) {
            // Not zoomed in enough - zoom in closer to clicked point
            modalMap.setView(e.latlng, currentZoom + 3, {
                animate: true,
                duration: 0.5
            });
        } else {
            // Zoomed in enough - place marker
            if (modalMarker) {
                modalMarker.setLatLng(e.latlng);
            } else {
                modalMarker = L.marker(e.latlng, {
                    icon: customIcon,
                    draggable: true
                }).addTo(modalMap);

                modalMarker.on('dragend', function (e) {
                    const pos = e.target.getLatLng();
                    updateLocationDisplay(pos.lat, pos.lng);
                    reverseGeocode(pos.lat, pos.lng);
                });
            }
            updateLocationDisplay(e.latlng.lat, e.latlng.lng);
            reverseGeocode(e.latlng.lat, e.latlng.lng);
        }
    });

    // Update zoom indicator on zoom change
    modalMap.on('zoomend', function () {
        const mapEl = document.getElementById('dealerModalMap');
        const currentZoom = modalMap.getZoom();

        // Change cursor based on zoom level
        if (mapEl) {
            if (currentZoom < 13) {
                mapEl.classList.add('zoom-mode');
            } else {
                mapEl.classList.remove('zoom-mode');
            }
        }
    });

    // Set initial cursor state
    if (mapContainer && modalMap.getZoom() < 13) {
        mapContainer.classList.add('zoom-mode');
    }

    // Fix map size after modal animation
    setTimeout(() => {
        modalMap.invalidateSize();
    }, 300);
}

function updateLocationDisplay(lat, lng) {
    // Update hidden inputs
    const latInput = document.getElementById('dealerLatitude');
    const lngInput = document.getElementById('dealerLongitude');

    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);

    // Update display
    const coordsDisplay = document.getElementById('selectedCoords');
    if (coordsDisplay) {
        coordsDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

// Reverse geocoding - get address from coordinates
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        if (data.address) {
            const address = data.address;

            const cityInput = document.getElementById('dealerCity');
            const countryInput = document.getElementById('dealerCountry');
            const addressInput = document.getElementById('dealerAddress');

            // Auto-fill city (prioritize province/state for Turkey)
            if (cityInput) {
                let cityValue = null;

                if (address.state) {
                    cityValue = address.state;
                } else if (address.city) {
                    cityValue = address.city;
                } else if (address.province) {
                    cityValue = address.province;
                } else if (address.town) {
                    cityValue = address.town;
                }

                if (cityValue) {
                    cityInput.value = cityValue;
                    cityInput.style.background = '#fffbf0';
                    setTimeout(() => {
                        cityInput.style.background = '';
                    }, 1500);
                }
            }

            // Auto-fill country
            if (countryInput && address.country) {
                countryInput.value = address.country;
                countryInput.style.background = '#fffbf0';
                setTimeout(() => {
                    countryInput.style.background = '';
                }, 1500);
            }

            // Auto-fill address - always update when location selected from map
            if (addressInput) {
                const addressParts = [];

                // Add district/town/suburb first
                if (address.town && address.town !== cityInput?.value) {
                    addressParts.push(address.town);
                } else if (address.suburb) {
                    addressParts.push(address.suburb);
                } else if (address.neighbourhood) {
                    addressParts.push(address.neighbourhood);
                } else if (address.quarter) {
                    addressParts.push(address.quarter);
                }

                // Add road and number
                if (address.road) {
                    if (address.house_number) {
                        addressParts.push(address.road + ' No: ' + address.house_number);
                    } else {
                        addressParts.push(address.road);
                    }
                }

                // Add postcode if available
                if (address.postcode) {
                    addressParts.push(address.postcode);
                }

                if (addressParts.length > 0) {
                    addressInput.value = addressParts.join(', ');
                    addressInput.style.background = '#fffbf0';
                    setTimeout(() => {
                        addressInput.style.background = '';
                    }, 1500);
                }
            }

            showToast('✅ Konum bilgileri güncellendi', 'success');
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Don't show error to user, it's not critical
    }
}

// Toast notification helper
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast custom-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function searchLocation() {
    const searchInput = document.getElementById('locationSearch');
    if (!searchInput) return;

    const query = searchInput.value.trim();

    if (!query) {
        showToast('⚠️ Lütfen bir adres girin', 'error');
        return;
    }

    if (!modalMap) {
        showToast('❌ Harita henüz yüklenmedi', 'error');
        return;
    }

    try {
        // Use Nominatim API for geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const results = await response.json();

        if (!results || results.length === 0) {
            showToast('❌ Konum bulunamadı. Farklı bir arama deneyin.', 'error');
            return;
        }

        showToast('✅ Konum bulundu!', 'success');

        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // Move map to location with appropriate zoom
        if (modalMap) {
            const targetZoom = 15; // Good zoom level for placing marker
            modalMap.setView([lat, lng], targetZoom);

            // Create custom marker icon
            const customIcon = L.divIcon({
                className: 'custom-modal-marker',
                html: `<div style="
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #E8A824 0%, #d49920 100%);
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <span style="transform: rotate(45deg); font-size: 20px;">📍</span>
                </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });

            // Add or update marker
            if (modalMarker) {
                modalMarker.setLatLng([lat, lng]);
            } else {
                modalMarker = L.marker([lat, lng], {
                    icon: customIcon,
                    draggable: true
                }).addTo(modalMap);

                modalMarker.on('dragend', function (e) {
                    const pos = e.target.getLatLng();
                    updateLocationDisplay(pos.lat, pos.lng);
                });
            }

            updateLocationDisplay(lat, lng);
            reverseGeocode(lat, lng);
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        showToast('❌ Konum aranırken bir hata oluştu', 'error');
    }
}

// Handle dealer form submission
async function handleDealerFormSubmit(e) {
    e.preventDefault();

    // Validate location
    const lat = document.getElementById('dealerLatitude').value;
    const lng = document.getElementById('dealerLongitude').value;

    if (!lat || !lng) {
        showError('❌ Lütfen haritada bir konum seçin!');
        return;
    }

    const formData = new FormData(e.target);
    const dealerId = formData.get('id');
    const dealerType = formData.get('type');

    try {
        const token = localStorage.getItem('adminToken');
        let url = `/api/dealers/${dealerType}`;
        let method = 'POST';

        if (dealerId) {
            url = `/api/dealers/${dealerType}/${dealerId}`;
            method = 'PUT';
        }

        console.log('Submitting dealer:', { url, method, type: dealerType });

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            showSuccess('✅ Bayi başarıyla kaydedildi!');
            closeDealerModal();
            loadAllDealers();
        } else {
            const error = await response.json();
            showError('❌ ' + (error.error || 'Bayi kaydedilirken bir hata oluştu.'));
        }
    } catch (error) {
        console.error('Error saving dealer:', error);
        showError('Bayi kaydedilirken bir hata oluştu.');
    }
}

// Delete dealer
async function deleteDealer(dealerId, type) {
    if (!confirm('Bu bayiyi silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/dealers/${type}/${dealerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showSuccess('✅ Bayi başarıyla silindi!');
            loadAllDealers();
        } else {
            const error = await response.json();
            showError('❌ ' + (error.error || 'Bayi silinirken bir hata oluştu.'));
        }
    } catch (error) {
        console.error('Error deleting dealer:', error);
        showError('❌ Bayi silinirken bir hata oluştu.');
    }
}

// ==== CERTIFICATE MODAL ====

function openCertificateModal() {
    editingCertificate = null;

    const modal = document.getElementById('certificateModal');
    const form = document.getElementById('certificateForm');
    const title = document.getElementById('certificateModalTitle');

    title.innerHTML = `
        <span class="modal-title-icon">🏆</span>
        Yeni Sertifika Ekle
    `;
    form.reset();
    document.getElementById('certificateId').value = '';

    const imagePreview = document.getElementById('certificateImagePreview');
    imagePreview.classList.remove('active');
    imagePreview.innerHTML = '';

    // Reset upload area
    const imageUploadArea = document.getElementById('certificateFileUploadArea');
    if (imageUploadArea) {
        const content = imageUploadArea.querySelector('.file-upload-content');
        if (content) {
            content.innerHTML = `
                <span class="file-upload-icon">🖼️</span>
                <p class="file-upload-text">Görsel yüklemek için tıklayın</p>
                <p class="file-upload-hint">JPG, PNG, GIF (Maks. 10MB)</p>
            `;
        }
    }

    modal.classList.add('active');
}

function editCertificate(certificate) {
    editingCertificate = certificate;

    const modal = document.getElementById('certificateModal');
    const title = document.getElementById('certificateModalTitle');

    title.innerHTML = `
        <span class="modal-title-icon">✏️</span>
        Sertifika Düzenle
    `;

    document.getElementById('certificateId').value = certificate.id;
    document.getElementById('certificateTitle').value = certificate.title;
    document.getElementById('certificateDescription').value = certificate.description || '';

    if (certificate.image) {
        const preview = document.getElementById('certificateImagePreview');
        preview.innerHTML = `<img src="${certificate.image}" alt="Preview">`;
        preview.classList.add('active');

        const imageUploadArea = document.getElementById('certificateFileUploadArea');
        if (imageUploadArea) {
            const content = imageUploadArea.querySelector('.file-upload-content');
            if (content) {
                content.innerHTML = `
                    <span class="file-upload-icon">✅</span>
                    <p class="file-upload-text">Mevcut görsel yüklü</p>
                    <p class="file-upload-hint">Değiştirmek için yeni dosya seçin</p>
                `;
            }
        }
    }

    modal.classList.add('active');
}

function closeCertificateModal() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingCertificate = null;
}

// Handle certificate form submission
async function handleCertificateFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const certificateId = formData.get('id');

    // Validate required fields
    if (!formData.get('title') || formData.get('title').trim() === '') {
        showError('❌ Lütfen sertifika başlığını girin!');
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        let url = '/api/dealers/certificates/add';
        let method = 'POST';

        if (certificateId && certificateId !== '') {
            url = `/api/dealers/certificates/${certificateId}`;
            method = 'PUT';
        }

        console.log('Sending certificate request:', { url, method });

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Certificate response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Certificate saved:', data);
            showSuccess('✅ Sertifika başarıyla kaydedildi!');
            closeCertificateModal();
            loadAllDealers();
        } else {
            let errorMessage = 'Sertifika kaydedilirken bir hata oluştu.';
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    errorMessage = error.error || errorMessage;
                    console.error('Certificate error response:', error);
                } else {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    errorMessage = `Sunucu hatası (${response.status})`;
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
            }

            // Show user-friendly error message
            if (response.status === 400) {
                showError('❌ ' + errorMessage);
            } else {
                showError('❌ ' + errorMessage);
            }
        }
    } catch (error) {
        console.error('Error saving certificate:', error);
        showError('❌ Sertifika kaydedilirken bir hata oluştu: ' + error.message);
    }
}

// Delete certificate
async function deleteCertificate(certificateId) {
    if (!confirm('Bu sertifikayı silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/dealers/certificates/${certificateId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showSuccess('✅ Sertifika başarıyla silindi!');
            loadAllDealers();
        } else {
            const error = await response.json();
            showError('❌ ' + (error.error || 'Sertifika silinirken bir hata oluştu.'));
        }
    } catch (error) {
        console.error('Error deleting certificate:', error);
        showError('❌ Sertifika silinirken bir hata oluştu.');
    }
}

// Image preview handler (only for certificates)
function handleCertificateImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        // Update upload area
        const uploadArea = document.getElementById('certificateFileUploadArea');
        if (uploadArea) {
            const content = uploadArea.querySelector('.file-upload-content');
            if (content) {
                content.innerHTML = `
                    <span class="file-upload-icon">✅</span>
                    <p class="file-upload-text">${file.name}</p>
                    <p class="file-upload-hint">Değiştirmek için tekrar tıklayın</p>
                `;
            }
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('certificateImagePreview');
            if (preview) {
                preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                preview.classList.add('active');
            }
        };
        reader.readAsDataURL(file);
    }
}

// Notification functions
function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        closeDealerModal();
        closeCertificateModal();
    }
});

// Close modals with Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDealerModal();
        closeCertificateModal();
    }
});

// Make functions globally accessible for inline onclick handlers
window.openDealerModal = openDealerModal;
window.editDealer = editDealer;
window.deleteDealer = deleteDealer;
window.openCertificateModal = openCertificateModal;
window.editCertificate = editCertificate;
window.deleteCertificate = deleteCertificate;
window.searchLocation = searchLocation;
window.closeDealerModal = closeDealerModal;
window.closeCertificateModal = closeCertificateModal;

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

