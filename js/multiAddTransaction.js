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


const btnAddrowMultiAddTrans = document.getElementById('btn-add-row-multi-add-trans');
if (btnAddrowMultiAddTrans) {
    btnAddrowMultiAddTrans.addEventListener('click', function () {
        const multiaddtable = document.getElementById('multi-add-trans-tbody');
        const rowCount = multiaddtable.querySelectorAll('tr').length + 1;
        
        
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const categoryHtml = `
            ${categories.map(c => `
                <li>
                    <a class="dropdown-item category-item py-2" href="#" data-value="${c.name}">
                        <span class="icon-circle bg-${c.color}-subtle text-${c.color} me-2"><i class="bi bi-${c.icon}"></i></span>${c.name}
                    </a>
                </li>
            `).join('')}
        `;

        const accounts = JSON.parse(localStorage.getItem('accounts')) || [];
        const accountHtml = `
            ${accounts.map(a => `
                <li>
                    <a class="dropdown-item account-item py-2" href="#" data-value="${a.name}">
                        <span class="icon-circle bg-${a.color}-subtle text-${a.color} me-2"><i class="bi bi-${a.icon}"></i></span>${a.name}
                    </a>
                </li>
            `).join('')}
        `;

        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const newRowHTML = `
            <tr>
                <td class="text-center fw-medium" style="padding-left: 1rem;" value="${rowCount}">${rowCount}</td>
                <td>
                    <input type="time" class="multi-add-trans-time form-control form-control-sm text-center" value="${currentTime}" style="font-size: 13px;" placeholder="HH:mm">
                </td>
                <td>
                    <div class="dropdown w-100">
                        <button class="btn btn-sm border bg-white text-danger d-flex justify-content-center align-items-center w-100" style="font-size: 13px;" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-arrow-down me-1"></i> Chi
                        </button>
                        <ul class="dropdown-menu shadow-sm border-0">
                            <li selected>
                                <button class="dropdown-item d-flex align-items-center" type="button" value="expense">
                                    <i class="bi bi-arrow-down me-2 text-danger"></i> Chi
                                </button>
                            </li>
                            <li>
                                <button class="dropdown-item d-flex align-items-center" type="button" value="income">
                                    <i class="bi bi-arrow-up me-2 text-success"></i> Thu
                                </button>
                            </li>
                        </ul>
                        <input type="hidden" value="expense" class="multi-add-trans-type">
                    </div>
                </td>
                <td>
                    <div class="dropdown w-100">
                        <button class="form-select text-start w-100 bg-white d-flex align-items-center" style="font-size: 12px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Danh mục
                        </button>
                        <ul class="dropdown-menu w-100 shadow-sm border-0" style="max-height: 250px; overflow-y: auto;">
                            ${categoryHtml}
                        </ul>
                        <input type="hidden" value="" class="multi-add-trans-category-row">
                    </div>
                </td>
                <td>
                    <input type="text" class="multi-add-trans-detail form-control form-control-sm" value="" placeholder="Nhập ghi chú" style="font-size: 13px; min-width: 280px;">
                </td>
                <td>
                    <input type="text" inputmode="numeric" class="amount-input-multi-add form-control form-control-sm text-end" value="" placeholder="0" style="font-size: 13px;">
                </td>
                <td>
                    <div class="dropdown w-100">
                        <button class="btn btn-sm border bg-white text-dark text-start d-flex justify-content-between align-items-center w-100" style="font-size: 13px;" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="text-truncate dropdown-text">Chọn tần suất</span>
                            <i class="bi bi-chevron-down text-secondary" style="font-size: 10px;"></i>
                        </button>
                        <ul class="dropdown-menu shadow-sm border-0">
                            <li>
                                <button class="dropdown-item" type="button" value="one-time">Một lần</button>
                            </li>
                            <li>
                                <button class="dropdown-item" type="button" value="monthly">Hàng tháng</button>
                            </li>
                        </ul>
                        <input type="hidden" class="trans-frequency" value="one-time">
                    </div>
                </td>
                <td>
                    <div class="dropdown w-100">
                        <button class="form-select text-start w-100 bg-white d-flex align-items-center" style="font-size: 12px;" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Tài khoản
                        </button>
                        <ul class="dropdown-menu w-100 shadow-sm border-0" style="max-height: 250px; overflow-y: auto;">
                            ${accountHtml}
                        </ul>
                        <input type="hidden" value="" class="multi-add-trans-account-row">
                    </div>
                </td>
                <td class="text-center">
                    <button class="btn-remove-row btn btn-sm text-secondary p-0"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        multiaddtable.insertAdjacentHTML('beforeend', newRowHTML);
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
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const freqHidden = row.querySelector('.trans-frequency');
                if (freqHidden) {
                    freqHidden.value = val;
                    const dropdownDiv = freqHidden.closest('.dropdown');
                    if (dropdownDiv) {
                        const btn = dropdownDiv.querySelector('[data-bs-toggle="dropdown"]');
                        if (btn) {
                            const textSpan = btn.querySelector('.dropdown-text');
                            const text = e.target.options[e.target.selectedIndex].text;
                            if (textSpan) {
                                textSpan.textContent = text;
                            } else {
                                btn.innerHTML = `<span class="text-truncate dropdown-text">${text}</span><i class="bi bi-chevron-down text-secondary" style="font-size: 10px;"></i>`;
                            }
                        }
                    }
                }
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

        rows.forEach((row, index) => {
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

        const modalEl = document.getElementById('multi-add-transaction');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        }
        tbody.innerHTML = '';
    });
}

const dropZone = document.getElementById('drop-zone');
const fileUpload = document.getElementById('file-upload');

if (dropZone && fileUpload) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('bg-secondary-subtle');
            dropZone.classList.remove('bg-light');
        }, false);
    });


    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('bg-secondary-subtle');
            dropZone.classList.add('bg-light');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);

    fileUpload.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];

            if (file.size > 5 * 1024 * 1024) {
                showToast('File vượt quá dung lượng tối đa 5MB', 'danger');
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                showToast('Vui lòng chọn đúng định dạng .jpg, .png, .pdf', 'danger');
                return;
            }
            const textElem = dropZone.querySelector('.text-dark');
            if (textElem) {
                textElem.innerHTML = `Đã chọn: <span class="text-primary fw-bold">${file.name}</span>`;
            }
        }
    }
}

updateCategorySelect();
updateAccountSelect();
