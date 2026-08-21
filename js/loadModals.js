let modalsLoaded = false;
let modalsPromise = null;

async function loadModals() {
    if (modalsLoaded) return;
    if (modalsPromise) return modalsPromise;

    modalsPromise = (async () => {
        try {
            const response = await fetch('modals.html');
            const html = await response.text();
            const container = document.getElementById('modals-container');
            if (container) {
                container.innerHTML = html;
            }
            modalsLoaded = true;

            if (typeof initSingleAddTransaction === 'function') initSingleAddTransaction();
            if (typeof initAddCategories === 'function') initAddCategories();
            if (typeof initAddAccount === 'function') initAddAccount();
            if (typeof initMultiAddTransaction === 'function') initMultiAddTransaction();
            if (typeof initTransactionTableModals === 'function') initTransactionTableModals();
            if (typeof updateCategorySelect === 'function') updateCategorySelect();
            if (typeof updateAccountSelect === 'function') updateAccountSelect();
        } catch (e) {
            console.error('Error loading modals', e);
        }
    })();
    return modalsPromise;
}

window.openModal = async function(modalId) {
    await loadModals();
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadModals();
});
