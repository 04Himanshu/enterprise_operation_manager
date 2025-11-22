// ===== Utility Functions =====

// Show popup
function openPopup(popup, overlay) {
    if (popup && overlay) {
        document.body.classList.remove('no-scroll');
        popup.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

// Hide popup
function closePopup(popup, overlay) {
    if (popup && overlay) {
        document.body.classList.add('no-scroll');
        popup.classList.add('hidden');
        overlay.classList.add('hidden');
    }
}

// Common setup for any popup
function setupPopup(openBtn, popup, overlay, closeBtn, cancelBtn = null) {
    if (!openBtn || !popup || !overlay) return;

    openBtn.addEventListener('click', () => openPopup(popup, overlay));
    overlay.addEventListener('click', () => closePopup(popup, overlay));
    closeBtn?.addEventListener('click', () => closePopup(popup, overlay));
    cancelBtn?.addEventListener('click', () => closePopup(popup, overlay));
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {

    // ===== Inventory Add Popup =====
    setupPopup(
        document.querySelector('#add-inventory-btn'),
        document.querySelector('#popup-inventory'),
        document.querySelector('#overlay'),
        document.querySelector('#close-popup')
    );

    // ===== Edit Inventory Popup =====
    setupPopup(
        document.querySelector('#edit-inventory-btn'),
        document.querySelector('#update-inventory-popup'),
        document.querySelector('#update-overlay'),
        document.querySelector('#close-update-popup')
    );

    // ===== Three-dot Menu Popup =====
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.threeDot');
        const dotsPopup = document.querySelector('.threeDot-popup');
        const dotsOverlay = document.querySelector('#dots-overlay');

        if (btn && dotsPopup && dotsOverlay) {
            e.stopPropagation();
            const rect = btn.getBoundingClientRect();
            dotsPopup.style.position = 'absolute';
            dotsPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
            dotsPopup.style.left = `${rect.left + window.scrollX - 150}px`;
            openPopup(dotsPopup, dotsOverlay);
        }

        // close if clicked outside
        if (!btn && dotsPopup && !dotsPopup.contains(e.target)) {
            closePopup(dotsPopup, dotsOverlay);
        }
    });

    document.querySelector('#dots-overlay')?.addEventListener('click', () => {
        closePopup(document.querySelector('.threeDot-popup'), document.querySelector('#dots-overlay'));
    });


    // ===== Restock Product Popup =====
    setupPopup(
        document.querySelector('#restock-product-btn'),
        document.querySelector('#restock-popup'),
        document.querySelector('#restock-overlay'),
        document.querySelector('#close-restock-popup')
    );

    // ===== Remove Product Popup =====
    setupPopup(
        document.querySelector('#remove-product-btn'),
        document.querySelector('#delete-popup'),
        document.querySelector('#delete-overlay'),
        document.querySelector('#close-delete-popup')
    );

    // ===== Add Customer Popup =====
    setupPopup(
        document.querySelector('#add-customer-btn'),
        document.querySelector('#add-customer-popup'),
        document.querySelector('#customer-overlay'),
        document.querySelector('#customer-close-popup'),
        document.querySelector('#customer-cancel-btn')
    );

    // ===== Edit Customer Popup =====
    setupPopup(
        document.querySelector('#edit-customer-btn'),
        document.querySelector('#update-customer-popup'),
        document.querySelector('#update-customer-overlay'),
        document.querySelector('#close-update-popup')
    );
    
    // ===== Create Order Popup =====
    setupPopup(
        document.querySelector('#add-order-btn'),
        document.querySelector('#popup-create-order'),
        document.querySelector('#create-order-overlay'),
        document.querySelector('#close-order-popup')
    )

    // ===== Invoice Popup =====
    setupPopup(
        document.querySelector('#order-invoice-btn'),
        document.querySelector('#invoice-popup'),
        document.querySelector('#invoice-popup-overlay'),
        document.querySelector('#close-invoice-popup')
    )
});
