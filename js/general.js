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


let lastDailyToastTime = 0;
let lastDailyToastDate = '';
let lastMonthlyToastTime = 0;
let lastMonthlyToastMonth = '';

function checkBudget(categoryId = null, dateOrMonth = null, showWarningToast = true, savedTransactions = null) {
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
        const fromAll = allCategories.find(c => String(c.id) === String(catId));
        if (fromAll && fromAll.name) return fromAll.name;
        return `Danh mục #${catId}`;
    }

    function getTransMonth(timeVal) {
        if (!timeVal) return '';
        if (typeof timeVal === 'string') {
            const str = timeVal.trim();
            if (/^\d{4}-\d{2}/.test(str)) {
                return str.substring(0, 7);
            }
            if (str.includes('/')) {
                const parts = str.split(' ')[0].split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}`;
                }
            }
        }
        const d = new Date(timeVal);
        if (!isNaN(d.getTime())) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
        return '';
    }

    function getCategoryExpense(catId) {
        return allTransactions.reduce((total, trans) => {
            if (trans.type !== 'expense') return total;
            if (String(trans.category) !== String(catId)) return total;

            const transMonth = getTransMonth(trans.time);
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

    // ========================================
    // KIỂM TRA TỔNG CHI TIÊU TRONG THÁNG (MONTHLY TOTAL BUDGET)
    // ========================================
    let monthlyBudgetAmount = 0;
    if (monthData) {
        if (monthData.totalBudget !== undefined && Number(monthData.totalBudget) > 0) {
            monthlyBudgetAmount = Number(monthData.totalBudget);
        } else {
            const allocated = budgetCategories.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            monthlyBudgetAmount = allocated > 0 ? allocated : 3000000;
        }
    } else {
        monthlyBudgetAmount = 3000000;
    }

    const totalMonthExpense = allTransactions.reduce((total, trans) => {
        if (trans.type !== 'expense') return total;
        const transMonth = getTransMonth(trans.time);
        if (transMonth === monthKey) {
            return total + (Number(trans.amount) || 0);
        }
        return total;
    }, 0);

    const isMonthExceeded = monthlyBudgetAmount > 0 && totalMonthExpense > monthlyBudgetAmount;

    if (isMonthExceeded && showWarningToast) {
        const nowMs = Date.now();
        if (nowMs - lastMonthlyToastTime > 1000 || lastMonthlyToastMonth !== monthKey) {
            lastMonthlyToastTime = nowMs;
            lastMonthlyToastMonth = monthKey;
            if (typeof showToast === 'function') {
                const [y, m] = monthKey.split('-');
                const monthLabel = `tháng ${m}/${y}`;
                const monthSpentFormatted = new Intl.NumberFormat('vi-VN').format(totalMonthExpense);
                const monthBudgetFormatted = new Intl.NumberFormat('vi-VN').format(monthlyBudgetAmount);
                showToast(`Cảnh báo: Bạn đã vượt mức chi tiêu trong ${monthLabel}! (${monthSpentFormatted}đ / ${monthBudgetFormatted}đ)`, 'warning');
            }
        }
    }

    const monthlyResult = {
        month: monthKey,
        monthlyBudget: monthlyBudgetAmount,
        totalExpense: totalMonthExpense,
        isExceeded: isMonthExceeded,
        remain: monthlyBudgetAmount - totalMonthExpense,
        exceededAmount: Math.max(0, totalMonthExpense - monthlyBudgetAmount)
    };

    if (result && typeof result === 'object') {
        result.monthly = monthlyResult;
    }

    // ========================================
    // KIỂM TRA MỨC CHI TIÊU TRONG NGÀY (DAILY BUDGET)
    // ========================================
    const isMonthOnly = typeof dateOrMonth === 'string' && /^\d{4}-\d{2}$/.test(dateOrMonth.trim());

    if (!isMonthOnly) {
        let showDailyToast = showWarningToast;

        // Nếu truyền danh sách/giao dịch vừa lưu, kiểm tra xem có giao dịch loại 1 lần không
        if (savedTransactions !== null && savedTransactions !== undefined) {
            let hasOneTime = false;
            if (Array.isArray(savedTransactions)) {
                hasOneTime = savedTransactions.some(t => {
                    const isMonthly = t.monthly === true || t.monthly === 'true' || t.frequency === 'monthly';
                    return t.type === 'expense' && !isMonthly;
                });
            } else if (typeof savedTransactions === 'object') {
                const isMonthly = savedTransactions.monthly === true || savedTransactions.monthly === 'true' || savedTransactions.frequency === 'monthly';
                hasOneTime = savedTransactions.type === 'expense' && !isMonthly;
            }
            if (!hasOneTime) {
                showDailyToast = false;
            }
        }

        // Lấy thông tin profile
        const profile = JSON.parse(localStorage.getItem('profile')) || {};
        const rawBudget = profile.dailyBudget !== undefined 
            ? profile.dailyBudget 
            : (profile.dailybudget !== undefined ? profile.dailybudget : profile.daily_budget);

        let dailyBudget = 0;
        if (rawBudget !== undefined && rawBudget !== null && rawBudget !== '') {
            if (typeof rawBudget === 'number') {
                dailyBudget = rawBudget;
            } else {
                dailyBudget = parseInt(rawBudget.toString().replace(/\D/g, ''), 10) || 0;
            }
        } else {
            dailyBudget = 500000;
        }

        // Xác định ngày cần kiểm tra (mặc định là hôm nay)
        let targetDateObj = new Date();
        if (dateOrMonth instanceof Date && !isNaN(dateOrMonth.getTime())) {
            targetDateObj = dateOrMonth;
        } else if (typeof dateOrMonth === 'string' && dateOrMonth.trim() !== '') {
            const str = dateOrMonth.trim();
            if (str.includes('/')) {
                const parts = str.split(' ');
                const dateParts = parts[0].split('/');
                if (dateParts.length === 3) {
                    const day = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10) - 1;
                    const year = parseInt(dateParts[2], 10);
                    if (parts[1]) {
                        const timeParts = parts[1].split(':');
                        targetDateObj = new Date(year, month, day, parseInt(timeParts[0], 10) || 0, parseInt(timeParts[1], 10) || 0);
                    } else {
                        targetDateObj = new Date(year, month, day);
                    }
                }
            } else {
                const d = new Date(str);
                if (!isNaN(d.getTime())) {
                    targetDateObj = d;
                }
            }
        }

        function isSameDay(timeValue, compareDate) {
            if (!timeValue) return false;
            let d = null;
            if (timeValue instanceof Date) {
                d = timeValue;
            } else if (typeof timeValue === 'string') {
                const str = timeValue.trim();
                if (str.includes('/')) {
                    const parts = str.split(' ');
                    const dateParts = parts[0].split('/');
                    if (dateParts.length === 3) {
                        const day = parseInt(dateParts[0], 10);
                        const month = parseInt(dateParts[1], 10) - 1;
                        const year = parseInt(dateParts[2], 10);
                        d = new Date(year, month, day);
                    }
                } else {
                    d = new Date(str);
                }
            }
            if (!d || isNaN(d.getTime())) return false;
            return d.getFullYear() === compareDate.getFullYear() &&
                d.getMonth() === compareDate.getMonth() &&
                d.getDate() === compareDate.getDate();
        }

        // Chỉ tính các giao dịch thuộc loại 1 lần và loại chi tiêu (expense)
        const todayExpenses = allTransactions.filter(t => {
            if (t.type !== 'expense') return false;
            const isMonthly = t.monthly === true || t.monthly === 'true' || t.frequency === 'monthly';
            if (isMonthly) return false; // Không tính giao dịch định kỳ tháng
            return isSameDay(t.time, targetDateObj);
        });

        const spentToday = todayExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const isDailyExceeded = dailyBudget > 0 && spentToday > dailyBudget;

        if (isDailyExceeded && showDailyToast) {
            const nowMs = Date.now();
            const now = new Date();
            const isTargetToday = isSameDay(targetDateObj, now);
            const dateLabel = isTargetToday ? 'hôm nay' : `${String(targetDateObj.getDate()).padStart(2, '0')}/${String(targetDateObj.getMonth() + 1).padStart(2, '0')}/${targetDateObj.getFullYear()}`;

            // Tránh lặp toast ngày nếu checkBudget được gọi nhiều lần liên tiếp
            if (nowMs - lastDailyToastTime > 1000 || lastDailyToastDate !== dateLabel) {
                lastDailyToastTime = nowMs;
                lastDailyToastDate = dateLabel;
                if (typeof showToast === 'function') {
                    const spentFormatted = new Intl.NumberFormat('vi-VN').format(spentToday);
                    const budgetFormatted = new Intl.NumberFormat('vi-VN').format(dailyBudget);
                    showToast(`Cảnh báo: Bạn đã vượt mức chi tiêu trong ngày ${dateLabel}! (${spentFormatted}đ / ${budgetFormatted}đ)`, 'warning');
                }
            }
        }

        const dailyResult = {
            dailyBudget: dailyBudget,
            spentToday: spentToday,
            isExceeded: isDailyExceeded,
            remain: dailyBudget - spentToday,
            exceededAmount: Math.max(0, spentToday - dailyBudget)
        };

        if (result && typeof result === 'object') {
            result.daily = dailyResult;
        }
    }

    return result;
}

window.checkBudget = checkBudget;
window.checkCategoryBudget = checkBudget;

function checkDailyBudget(targetDate = null, showWarningToast = true, savedTransactions = null) {
    if (typeof targetDate === 'boolean') {
        savedTransactions = showWarningToast;
        showWarningToast = targetDate;
        targetDate = null;
    }
    const res = checkBudget(null, targetDate, showWarningToast, savedTransactions);
    return res && res.daily ? res.daily : res;
}

window.checkDailyBudget = checkDailyBudget;
window.checkTodayBudget = checkDailyBudget;

function checkMonthlyBudget(dateOrMonth = null, showWarningToast = true) {
    if (typeof dateOrMonth === 'boolean') {
        showWarningToast = dateOrMonth;
        dateOrMonth = null;
    }
    const res = checkBudget(null, dateOrMonth, showWarningToast);
    return res && res.monthly ? res.monthly : res;
}

window.checkMonthlyBudget = checkMonthlyBudget;


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

document.addEventListener('input', function (e) {
    if (e.target.classList.contains('amount-input-multi-add')) {
        let val = e.target.value.replace(/\D/g, '');
        if (val !== '') {
            val = parseInt(val, 10).toLocaleString('vi-VN');
        }
        e.target.value = val;
        updateMultiAddTotals();
    }
});

document.addEventListener('click', function (e) {
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
                        } else {
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
                    if (updatedHiddenInput && updatedHiddenInput.id === 'multi-add-transac-select-account') {
                        const tbody = document.getElementById('multi-add-trans-tbody');
                        if (tbody) {
                            const rows = tbody.querySelectorAll('tr');
                            rows.forEach(row => {
                                const accHidden = row.querySelector('.multi-add-trans-account-row');
                                if (accHidden) {
                                    accHidden.value = val;
                                }
                                const btn = row.querySelector('.btn-pick-account');
                                if (btn) {
                                    if (val === '') {
                                        btn.innerHTML = 'Tài khoản';
                                        btn.classList.add('text-secondary');
                                    } else {
                                        btn.innerHTML = dropdownItem.innerHTML;
                                        btn.classList.remove('text-secondary');
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    }
});

function translateColor(color) {
    switch (color) {
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

function safeParseStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        localStorage.removeItem(key);
        return [];
    }
}