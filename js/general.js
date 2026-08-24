function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const bgClass = type === 'success' ? 'text-bg-success' : 'text-bg-danger';
    const iconClass = type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle';

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center ${bgClass} border-0 mb-2`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex" style="z-index: 9999;">
            <div class="toast-body d-flex align-items-center fw-medium">
                <i class="bi ${iconClass} me-2 fs-5"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

flatpickr(".date-picker-input", {
    enableTime: true,
    dateFormat: "d/m/Y H:i",
    time_24hr: true,
    allowInput: true,
    defaultDate: new Date()
});

flatpickr(".date-picker-input-date-only", {
    enableTime: false,
    dateFormat: "d/m/Y",
    allowInput: true,
    defaultDate: new Date()
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('amount-input-multi-add')) {
        let val = e.target.value.replace(/\D/g, '');
        if (val !== '') {
            val = parseInt(val, 10).toLocaleString('vi-VN');
        }
        e.target.value = val;
        updateMultiAddTotals();
    }
});

document.addEventListener('click', function(e) {
    const dropdownItem = e.target.closest('.dropdown-item');
    if (dropdownItem) {
        if (dropdownItem.classList.contains('edit-transaction-btn') || dropdownItem.classList.contains('delete-transaction-btn')) {
            return;
        }
        const dropdownMenu = dropdownItem.closest('.dropdown-menu');
        if (dropdownMenu) {
            const dropdown = dropdownMenu.closest('.dropdown');
            if (dropdown) {
                const button = dropdown.querySelector('[data-bs-toggle="dropdown"]');
                if (button) {
                    if (dropdownItem.value === 'expense' || dropdownItem.value === 'income' || dropdownItem.value === 'all-type') {
                        e.preventDefault();
                        const isIncome = dropdownItem.value;
                        if (isIncome === 'income') {
                            button.classList.remove('text-danger');
                            button.classList.add('text-success');
                            button.innerHTML = `<i class="bi bi-arrow-up me-1"></i> Thu`;
                        } else if (isIncome === 'expense') {
                            button.classList.remove('text-success');
                            button.classList.add('text-danger');
                            button.innerHTML = `<i class="bi bi-arrow-down me-1"></i> Chi`;
                        } else{
                            button.classList.remove('text-success', 'text-danger');
                            button.innerHTML = `Tất cả <i class="bi bi-chevron-down ms-1"></i>`;
                        }
                        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
                        if (hiddenInput) {
                            hiddenInput.value = dropdownItem.value;
                            if (hiddenInput.classList.contains('-type') && typeof updateMultiAddTotals === 'function') {
                                updateMultiAddTotals();
                            }
                        }

                    } else if (dropdownItem.value === 'one-time' || dropdownItem.value === 'monthly' || (dropdownItem.value === '' && !dropdownItem.classList.contains('category-item') && !dropdownItem.classList.contains('account-item'))) {
                        e.preventDefault();
                        const textSpan = button.querySelector('.dropdown-text');
                        const textToSet = dropdownItem.value === '' ? 'Chọn tần suất' : dropdownItem.textContent.trim();
                        
                        if (textSpan) {
                            textSpan.textContent = textToSet;
                        } else {
                            button.innerHTML = `<span class="text-truncate dropdown-text">${textToSet}</span><i class="bi bi-chevron-down text-secondary" style="font-size: 10px;"></i>`;
                        }

                        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
                        if (hiddenInput) {
                            hiddenInput.value = dropdownItem.value;
                        }

                    } else if (dropdownItem.classList.contains('category-item') || dropdownItem.classList.contains('account-item')) {
                        e.preventDefault();
                        const val = dropdownItem.getAttribute('data-value');
                        
                        if (val === '') {
                            button.innerHTML = dropdownItem.classList.contains('category-item') ? 'Chọn danh mục' : 'Chọn tài khoản';
                            button.classList.add('text-secondary');
                        } else {
                            button.innerHTML = dropdownItem.innerHTML;
                            button.classList.remove('text-secondary');
                        }
                        
                        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
                        if (hiddenInput) {
                            hiddenInput.value = val;
                        }
                    }
                    
                    const updatedHiddenInput = dropdown.querySelector('input[type="hidden"]');
                    if (updatedHiddenInput && (updatedHiddenInput.id.startsWith('table-sort') || updatedHiddenInput.classList.contains('table-sort-type'))) {
                        if (typeof renderTable === 'function') {
                            renderTable();
                        }
                    }
                }
            }
        }
    }
});

function translateColor(color){
    switch(color){
        case 'primary':
            return 'Xanh dương';
            break;
        case 'secondary':
            return 'Xám';
            break;
        case 'success':
            return 'Xanh lá';
            break;
        case 'danger':
            return 'Đỏ';
            break;
        case 'warning':
            return 'Vàng';
            break;
        case 'info':
            return 'Xanh lơ';
            break;
        case 'light':
            return 'Trắng';
            break;
        case 'dark':
            return 'Đen';
            break;
    }
}