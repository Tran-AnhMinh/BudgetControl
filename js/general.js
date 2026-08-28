function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    let bgClass = 'text-bg-success';
    let iconClass = 'bi-check-circle-fill';
    let btnCloseClass = 'btn-close-white';

    if (type === 'warning') {
        bgClass = 'text-bg-warning text-dark';
        iconClass = 'bi-exclamation-triangle-fill text-dark';
        btnCloseClass = '';
    } else if (type === 'error' || type === 'danger') {
        bgClass = 'text-bg-danger';
        iconClass = 'bi-exclamation-circle-fill';
        btnCloseClass = 'btn-close-white';
    } else if (type === 'info') {
        bgClass = 'text-bg-info text-dark';
        iconClass = 'bi-info-circle-fill text-dark';
        btnCloseClass = '';
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center ${bgClass} border-0 mb-2 shadow`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex" style="z-index: 9999;">
            <div class="toast-body d-flex align-items-center fw-medium">
                <i class="bi ${iconClass} me-2 fs-5"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close ${btnCloseClass} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 4500 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}


function checkBudget(categoryId = null, dateOrMonth = null, showWarningToast = true) {
    let monthKey = '';
    if (dateOrMonth instanceof Date) {
        const year = dateOrMonth.getFullYear();
        const month = String(dateOrMonth.getMonth() + 1).padStart(2, '0');
        monthKey = `${year}-${month}`;
    } else if (typeof dateOrMonth === 'string' && dateOrMonth.trim() !== '') {
        const str = dateOrMonth.trim();
        if (/^\d{4}-\d{2}$/.test(str)) {
            monthKey = str;
        } else if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
            monthKey = str.substring(0, 7);
        } else if (str.includes('/')) {
            const parts = str.split(' ')[0].split('/');
            if (parts.length === 3) {
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                monthKey = `${year}-${month}`;
            }
        } else {
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
        }
    }

    if (!monthKey) {
        const now = new Date();
        monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    const monthlyBudgets = JSON.parse(localStorage.getItem('monthly_budget')) || {};
    const monthData = monthlyBudgets[monthKey];
    const budgetCategories = (monthData && Array.isArray(monthData.categories)) ? monthData.categories : [];
    const allCategories = JSON.parse(localStorage.getItem('categories')) || [];
    const allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];

    function getCategoryName(catId) {
        const fromBudget = budgetCategories.find(c => String(c.id) === String(catId));
        if (fromBudget && fromBudget.name) return fromBudget.name;
        const fromAll = allCategories.find(c => String(c.id) === String(catId));
        if (fromAll && fromAll.name) return fromAll.name;
        return `Danh mục #${catId}`;
    }

    function getCategoryExpense(catId) {
        return allTransactions.reduce((total, trans) => {
            if (trans.type !== 'expense') return total;
            if (String(trans.category) !== String(catId)) return total;

            let transMonth = '';
            if (trans.time) {
                if (typeof trans.time === 'string' && /^\d{4}-\d{2}/.test(trans.time)) {
                    transMonth = trans.time.substring(0, 7);
                } else {
                    const d = new Date(trans.time);
                    if (!isNaN(d.getTime())) {
                        transMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    }
                }
            }

            if (transMonth === monthKey) {
                return total + (Number(trans.amount) || 0);
            }
            return total;
        }, 0);
    }

    function checkSingleCategory(catId) {
        const catBudget = budgetCategories.find(c => String(c.id) === String(catId));
        const budgetAmount = catBudget ? (Number(catBudget.amount) || 0) : 0;
        const catName = getCategoryName(catId);
        const totalExpense = getCategoryExpense(catId);
        const isExceeded = budgetAmount > 0 && totalExpense > budgetAmount;

        if (isExceeded && showWarningToast) {
            showToast(`Vượt ngân sách danh mục: "${catName}"`, 'warning');
        }

        return {
            categoryId: catId,
            categoryName: catName,
            month: monthKey,
            budgetAmount: budgetAmount,
            totalExpense: totalExpense,
            isExceeded: isExceeded,
            exceededAmount: Math.max(0, totalExpense - budgetAmount)
        };
    }

    let result;
    if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
        result = checkSingleCategory(categoryId);
    } else {
        result = budgetCategories.map(c => checkSingleCategory(c.id));
    }
    return result;
}

window.checkBudget = checkBudget;
window.checkCategoryBudget = checkBudget;


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
                            button.innerHTML = dropdownItem.innerHTML;
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