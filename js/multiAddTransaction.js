function updateMultiAddTotals() {
    const tbody = document.getElementById('multi-add-trans-tbody');
    if (!tbody) return;
    
    let totalExpense = 0;
    let totalIncome = 0;

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const typeInput = row.querySelector('.multi-add-trans-type');
        const amountInput = row.querySelector('.amount-input-multi-add');
        
        if (typeInput && amountInput) {
            const type = typeInput.value;
            const amountRaw = amountInput.value.replace(/\D/g, '');
            const amount = parseInt(amountRaw, 10) || 0;

            if (type === 'income') {
                totalIncome += amount;
            } else {
                totalExpense += amount;
            }
        }
    });

    const expenseDisplay = document.getElementById('multi-add-total-expense');
    const incomeDisplay = document.getElementById('multi-add-total-income');
    
    if (expenseDisplay) expenseDisplay.textContent = totalExpense.toLocaleString('vi-VN') + 'đ';
    if (incomeDisplay) incomeDisplay.textContent = totalIncome.toLocaleString('vi-VN') + 'đ';
}

function createNewRowHTML(rowCount) {
    const defaultAccInput = document.getElementById('multi-add-transac-select-account');
    const defaultAccVal = defaultAccInput ? defaultAccInput.value : '';
    const defaultFreqSelect = document.getElementById('multi-add-default-frequency');
    const defaultFreqVal = defaultFreqSelect ? defaultFreqSelect.value : 'one-time';

    const accounts = JSON.parse(localStorage.getItem('accounts')) || [
        { id: 1, name: 'Tiền mặt', icon: 'cash-stack', color: 'success' },
        { id: 2, name: 'Thẻ ATM', icon: 'bank', color: 'primary' }
    ];
    const defaultAcc = accounts.find(a => String(a.id) === String(defaultAccVal));

    let accBtnHTML = 'Tài khoản';
    let accBtnClass = 'form-select text-start w-100 bg-white d-flex align-items-center btn-pick-account text-secondary';
    if (defaultAcc) {
        accBtnHTML = `<span class="icon-circle bg-${defaultAcc.color}-subtle text-${defaultAcc.color} me-2 flex-shrink-0" style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;"><i class="bi bi-${defaultAcc.icon}"></i></span><span class="text-truncate">${defaultAcc.name}</span>`;
        accBtnClass = 'form-select text-start w-100 bg-white d-flex align-items-center btn-pick-account';
    }

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    return `
        <tr>
            <td class="text-center fw-medium" style="padding-left: 1rem;" value="${rowCount}">${rowCount}</td>
            <td>
                <input type="time" class="multi-add-trans-time form-control form-control-sm text-center" value="${currentTime}" style="font-size: 13px;" placeholder="HH:mm">
            </td>
            <td>
                <button type="button" class="btn btn-sm border bg-white text-danger d-flex justify-content-center align-items-center w-100 btn-toggle-multi-type" style="font-size: 13px;">
                    <i class="bi bi-arrow-down me-1"></i> Chi
                </button>
                <input type="hidden" value="expense" class="multi-add-trans-type">
            </td>
            <td>
                <button type="button" class="form-select text-start w-100 bg-white d-flex align-items-center btn-pick-category text-secondary" style="font-size: 12px;">
                    Danh mục
                </button>
                <input type="hidden" value="" class="multi-add-trans-category-row">
            </td>
            <td>
                <input type="text" class="multi-add-trans-detail form-control form-control-sm" value="" placeholder="Nhập ghi chú" style="font-size: 13px; min-width: 100px;">
            </td>
            <td>
                <input type="text" inputmode="numeric" class="amount-input-multi-add form-control form-control-sm text-end" value="" placeholder="0" style="font-size: 13px; min-width: 130px;">
            </td>
            <td>
                <select class="form-select form-select-sm text-secondary trans-frequency" style="font-size: 13px;">
                    <option value="one-time" ${defaultFreqVal === 'one-time' ? 'selected' : ''}>Một lần</option>
                    <option value="monthly" ${defaultFreqVal === 'monthly' ? 'selected' : ''}>Hàng tháng</option>
                </select>
            </td>
            <td>
                <button type="button" class="${accBtnClass}" style="font-size: 12px;">
                    ${accBtnHTML}
                </button>
                <input type="hidden" value="${defaultAccVal}" class="multi-add-trans-account-row">
            </td>
            <td class="text-center">
                <button type="button" class="btn-remove-row btn btn-sm text-secondary p-0"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `;
}

const btnAddrowMultiAddTrans = document.getElementById('btn-add-row-multi-add-trans');
if (btnAddrowMultiAddTrans) {
    btnAddrowMultiAddTrans.addEventListener('click', function () {
        const multiaddtable = document.getElementById('multi-add-trans-tbody');
        if (!multiaddtable) return;
        const rowCount = multiaddtable.querySelectorAll('tr').length + 1;
        multiaddtable.insertAdjacentHTML('beforeend', createNewRowHTML(rowCount));
    });
}

const btnRemoveRowMultiAddTrans = document.getElementById('multi-add-trans-tbody');
if (btnRemoveRowMultiAddTrans) {
    btnRemoveRowMultiAddTrans.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.btn-remove-row');
        if (removeBtn) {
            const row = removeBtn.closest('tr');
            if (row) {
                row.remove();
                const rows = btnRemoveRowMultiAddTrans.querySelectorAll('tr');
                rows.forEach((r, index) => {
                    const firstCell = r.querySelector('td:first-child');
                    if (firstCell) {
                        firstCell.textContent = index + 1;
                    }
                });
                if (typeof updateMultiAddTotals === 'function') {
                    updateMultiAddTotals();
                }
            }
        }
    });
}

const multiAddDefaultFreq = document.getElementById('multi-add-default-frequency');
if (multiAddDefaultFreq) {
    multiAddDefaultFreq.addEventListener('change', function(e) {
        const val = e.target.value;
        if (!val) return;
        const tbody = document.getElementById('multi-add-trans-tbody');
        if (tbody) {
            tbody.querySelectorAll('.trans-frequency').forEach(select => {
                select.value = val;
            });
        }
    });
}

const btnSaveMultiTransaction = document.getElementById('btn-save-multi-transaction');
if (btnSaveMultiTransaction) {
    btnSaveMultiTransaction.addEventListener('click', function () {
        const dateInput = document.querySelector('#multi-add-transaction .date-picker-input-date-only');
        const dateVal = dateInput ? dateInput.value : '';
        if (!dateVal) {
            showToast('Vui lòng chọn ngày giao dịch!', 'error');
            return;
        }

        const [day, month, year] = dateVal.split('/');
        const baseDateStr = `${year}-${month}-${day}`;

        const tbody = document.getElementById('multi-add-trans-tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        if (rows.length === 0) {
            showToast('Vui lòng thêm ít nhất một giao dịch!', 'error');
            return;
        }

        let newTransactions = [];
        let hasError = false;

        rows.forEach((row) => {
            const timeInput = row.querySelector('.multi-add-trans-time');
            const typeInput = row.querySelector('.multi-add-trans-type');
            const catInput = row.querySelector('.multi-add-trans-category-row');
            const detailInput = row.querySelector('.multi-add-trans-detail');
            const amountInput = row.querySelector('.amount-input-multi-add');
            const freqInput = row.querySelector('.trans-frequency');
            const accInput = row.querySelector('.multi-add-trans-account-row');

            const timeVal = timeInput ? timeInput.value : '00:00';
            const typeVal = typeInput ? typeInput.value : 'expense';
            const catVal = catInput ? catInput.value : '';
            const detailVal = detailInput ? detailInput.value : '';
            const amountRaw = amountInput ? amountInput.value.replace(/\D/g, '') : '0';
            const amountVal = parseInt(amountRaw, 10) || 0;
            const freqVal = freqInput ? freqInput.value : 'one-time';
            const accVal = accInput ? accInput.value : '';

            if (!catVal || amountVal <= 0 || !accVal) {
                hasError = true;
            } else {
                const combinedDateTime = `${baseDateStr}T${timeVal || '00:00'}:00`;
                newTransactions.push({
                    time: combinedDateTime,
                    type: typeVal,
                    category: parseInt(catVal, 10),
                    detail: detailVal,
                    account: parseInt(accVal, 10),
                    amount: amountVal,
                    monthly: freqVal === 'monthly'
                });
            }
        });

        if (hasError) {
            showToast('Vui lòng điền đầy đủ Danh mục, Ghi chú, Số tiền > 0 và Tài khoản cho tất cả các dòng!', 'error');
            return;
        }

        transactions.push(...newTransactions);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        applyCurrentSort();
        renderTable();
        showToast(`Đã thêm thành công ${newTransactions.length} giao dịch!`);

        if (typeof checkBudget === 'function') {
            const checkedCats = new Set();
            newTransactions.forEach(t => {
                if (t.type === 'expense' && t.category && !checkedCats.has(t.category)) {
                    checkedCats.add(t.category);
                    checkBudget(t.category, t.time);
                }
            });
        }

        const modalEl = document.getElementById('multi-add-transaction');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        }
        tbody.innerHTML = '';
    });
}

// ----------------------------------------------------
// FLOATING PICKER ĐỘC LẬP CHO CATEGORY & ACCOUNT
// ----------------------------------------------------
let multiAddPickerEl = null;
let currentPickerBtn = null;
let currentPickerInput = null;

function getOrCreateMultiAddPicker() {
    if (!multiAddPickerEl) {
        multiAddPickerEl = document.createElement('div');
        multiAddPickerEl.id = 'multi-add-floating-picker';
        multiAddPickerEl.className = 'shadow-lg border rounded-3 bg-white p-1';
        multiAddPickerEl.style.cssText = 'position: fixed; display: none; z-index: 99999; max-height: 280px; overflow-y: auto; min-width: 220px; box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;';
        document.body.appendChild(multiAddPickerEl);

        multiAddPickerEl.addEventListener('click', function (e) {
            const item = e.target.closest('.picker-option-item');
            if (item && currentPickerBtn && currentPickerInput) {
                const val = item.getAttribute('data-value');
                currentPickerInput.value = val;
                currentPickerBtn.innerHTML = item.innerHTML;
                currentPickerBtn.classList.remove('text-secondary');
                closeMultiAddPicker();
            }
        });
    }
    return multiAddPickerEl;
}

function openMultiAddPicker(btn, input, type) {
    if (currentPickerBtn === btn && multiAddPickerEl && multiAddPickerEl.style.display === 'block') {
        closeMultiAddPicker();
        return;
    }

    currentPickerBtn = btn;
    currentPickerInput = input;
    const picker = getOrCreateMultiAddPicker();

    const items = type === 'category'
        ? (JSON.parse(localStorage.getItem('categories')) || [
            { id: 1, name: 'Ăn uống', icon: 'cup-hot', color: 'danger' },
            { id: 2, name: 'Lương', icon: 'cash', color: 'success' },
            { id: 3, name: 'Mua sắm', icon: 'cart', color: 'primary' }
        ])
        : (JSON.parse(localStorage.getItem('accounts')) || [
            { id: 1, name: 'Tiền mặt', icon: 'cash-stack', color: 'success' },
            { id: 2, name: 'Thẻ ATM', icon: 'bank', color: 'primary' }
        ]);

    picker.innerHTML = items.map(item => `
        <div class="picker-option-item d-flex align-items-center p-2 rounded-2" data-value="${item.id}" style="cursor: pointer; font-size: 13px;">
            <span class="icon-circle bg-${item.color}-subtle text-${item.color} me-2 flex-shrink-0" style="width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%;">
                <i class="bi bi-${item.icon}"></i>
            </span>
            <span class="text-truncate">${item.name}</span>
        </div>
    `).join('');

    picker.querySelectorAll('.picker-option-item').forEach(el => {
        el.onmouseenter = () => el.style.backgroundColor = '#f1f5f9';
        el.onmouseleave = () => el.style.backgroundColor = 'transparent';
    });

    // Ẩn tạm thời để đo kích thước thực tế của menu
    picker.style.visibility = 'hidden';
    picker.style.display = 'block';

    const rect = btn.getBoundingClientRect();
    const pickerWidth = picker.offsetWidth || 220;
    const pickerHeight = picker.offsetHeight || 120;

    // Vị trí ngang: Ưu tiên căn theo nút, nếu tràn mép phải thì căn theo cạnh phải của nút
    let left = rect.left;
    if (left + pickerWidth > window.innerWidth - 10) {
        left = rect.right - pickerWidth;
    }
    if (left + pickerWidth > window.innerWidth - 10) {
        left = window.innerWidth - pickerWidth - 10;
    }
    if (left < 10) left = 10;

    // Vị trí dọc: Ưu tiên mở ngay bên dưới nút (rect.bottom + 4)
    // Chỉ lật lên trên khi phía dưới không đủ chỗ VÀ phía trên đủ chỗ
    let top = rect.bottom + 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < pickerHeight + 10 && spaceAbove > pickerHeight + 10) {
        top = rect.top - pickerHeight - 4;
    }

    picker.style.top = `${Math.round(top)}px`;
    picker.style.left = `${Math.round(left)}px`;
    picker.style.visibility = 'visible';
}

function closeMultiAddPicker() {
    if (multiAddPickerEl) {
        multiAddPickerEl.style.display = 'none';
    }
    currentPickerBtn = null;
    currentPickerInput = null;
}

document.addEventListener('click', function (e) {
    // 1. Toggle Chi / Thu
    const toggleTypeBtn = e.target.closest('.btn-toggle-multi-type');
    if (toggleTypeBtn) {
        const row = toggleTypeBtn.closest('tr');
        const typeInput = row ? row.querySelector('.multi-add-trans-type') : null;
        const isExpense = !typeInput || typeInput.value === 'expense';
        
        if (isExpense) {
            if (typeInput) typeInput.value = 'income';
            toggleTypeBtn.className = 'btn btn-sm border bg-white text-success d-flex justify-content-center align-items-center w-100 btn-toggle-multi-type';
            toggleTypeBtn.innerHTML = '<i class="bi bi-arrow-up me-1"></i> Thu';
        } else {
            if (typeInput) typeInput.value = 'expense';
            toggleTypeBtn.className = 'btn btn-sm border bg-white text-danger d-flex justify-content-center align-items-center w-100 btn-toggle-multi-type';
            toggleTypeBtn.innerHTML = '<i class="bi bi-arrow-down me-1"></i> Chi';
        }
        if (typeof updateMultiAddTotals === 'function') {
            updateMultiAddTotals();
        }
        return;
    }

    // 2. Bấm mở Danh mục
    const catBtn = e.target.closest('.btn-pick-category');
    if (catBtn) {
        const row = catBtn.closest('tr');
        const input = row ? row.querySelector('.multi-add-trans-category-row') : null;
        openMultiAddPicker(catBtn, input, 'category');
        return;
    }

    // 3. Bấm mở Tài khoản
    const accBtn = e.target.closest('.btn-pick-account');
    if (accBtn) {
        const row = accBtn.closest('tr');
        const input = row ? row.querySelector('.multi-add-trans-account-row') : null;
        openMultiAddPicker(accBtn, input, 'account');
        return;
    }

    // 4. Bấm ra ngoài đóng picker
    if (multiAddPickerEl && multiAddPickerEl.style.display === 'block' && !multiAddPickerEl.contains(e.target)) {
        closeMultiAddPicker();
    }
});

const multiAddModalEl = document.getElementById('multi-add-transaction');
if (multiAddModalEl) {
    multiAddModalEl.addEventListener('hide.bs.modal', closeMultiAddPicker);
    multiAddModalEl.addEventListener('show.bs.modal', function() {
        if (typeof updateAccountSelect === 'function') updateAccountSelect();
        if (typeof updateCategorySelect === 'function') updateCategorySelect();
        const tbody = document.getElementById('multi-add-trans-tbody');
        if (tbody && tbody.children.length === 0) {
            tbody.insertAdjacentHTML('beforeend', createNewRowHTML(1));
        }
    });
}
const multiTableScroll = document.querySelector('#multi-add-transaction .table-responsive');
if (multiTableScroll) {
    multiTableScroll.addEventListener('scroll', closeMultiAddPicker);
}
