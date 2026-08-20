let currentPage = 1;
let itemsPerPage = 10;
const transactionTableBody = document.getElementById('transaction-table-body');
function applyCurrentSort() {
    switch(currentSortColumn) {
        case 'date':
            transactions.sort((a, b) => sortOrders.date * (new Date(b.time) - new Date(a.time)));
            break;
        case 'type':
            transactions.sort((a, b) => sortOrders.type * a.type.localeCompare(b.type));
            break;
        case 'category':
            transactions.sort((a, b) => sortOrders.category * a.category.localeCompare(b.category));
            break;
        case 'account':
            transactions.sort((a, b) => sortOrders.account * a.account.localeCompare(b.account));
            break;
        case 'amount':
            transactions.sort((a, b) => sortOrders.amount * (b.amount* (b.type === 'expense' ? 1 : -1) - a.amount * (a.type === 'expense' ? 1 : -1)));
            break;
        case 'frequency':
            transactions.sort((a, b) => sortOrders.frequency * String(a.frequency || a.monthly).localeCompare(String(b.frequency || b.monthly)));
            break;
    }
}

const btnsortDate = document.getElementById('btn-sort-date');
if (btnsortDate) {
    btnsortDate.addEventListener('click', function () {
        currentSortColumn = 'date';
        sortOrders.date *= -1;
        applyCurrentSort();
        renderTable();
    });
}
const btnsortType = document.getElementById('btn-sort-type');
if (btnsortType) {
    btnsortType.addEventListener('click', function () {
        currentSortColumn = 'type';
        sortOrders.type *= -1;
        applyCurrentSort();
        renderTable();
    });
}

const btnsortCategory = document.getElementById('btn-sort-category');
if (btnsortCategory) {
    btnsortCategory.addEventListener('click', function () {
        currentSortColumn = 'category';
        sortOrders.category *= -1;
        applyCurrentSort();
        renderTable();
    });
}

const btnsortAccount = document.getElementById('btn-sort-account');
if (btnsortAccount) {
    btnsortAccount.addEventListener('click', function () {
        currentSortColumn = 'account';
        sortOrders.account *= -1;
        applyCurrentSort();
        renderTable();
    });
}

const btnsortAmount = document.getElementById('btn-sort-amount');
if (btnsortAmount) {
    btnsortAmount.addEventListener('click', function () {
        currentSortColumn = 'amount';
        sortOrders.amount *= -1;
        applyCurrentSort();
        renderTable();
    });
}

const btnsortFrequency = document.getElementById('btn-sort-frequency');
if (btnsortFrequency) {
    btnsortFrequency.addEventListener('click', function () {
        currentSortColumn = 'frequency';
        sortOrders.frequency *= -1;
        applyCurrentSort();
        renderTable();
    });
}

function renderTable() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    const filterCategory = document.getElementById('table-sort-category')?.value || '';
    const filterTypeInput = document.querySelector('.table-sort-type');
    const filterType = filterTypeInput ? filterTypeInput.value : 'all-type';
    const filterAccount = document.getElementById('table-sort-account')?.value || '';
    const filterFrequency = document.getElementById('table-sort-frequency')?.value || '';
    const filterAmountMin = document.getElementById('table-sort-amount-min')?.value;
    const filterAmountMax = document.getElementById('table-sort-amount-max')?.value;
    
    const dateInput = document.getElementById('table-sort-date');
    const selectedDates = dateInput && dateInput._flatpickr ? dateInput._flatpickr.selectedDates : [];

    let filteredTransactions = transactions;

    if (selectedDates && selectedDates.length > 0) {
        let startDate = new Date(selectedDates[0]);
        startDate.setHours(0, 0, 0, 0);
        
        let endDate = new Date(selectedDates.length > 1 ? selectedDates[1] : selectedDates[0]);
        endDate.setHours(23, 59, 59, 999);

        filteredTransactions = filteredTransactions.filter(t => {
            const tDate = new Date(t.time);
            return tDate >= startDate && tDate <= endDate;
        });
    }

    if (filterCategory) {
        filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
    }
    if (filterType !== 'all-type' && filterType !== '') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
    }
    if (filterAccount) {
        filteredTransactions = filteredTransactions.filter(t => t.account === filterAccount);
    }
    if (filterFrequency === 'monthly') {
        filteredTransactions = filteredTransactions.filter(t => t.monthly);
    } else if (filterFrequency === 'one-time') {
        filteredTransactions = filteredTransactions.filter(t => !t.monthly);
    }

    if (filterAmountMin !== '' && filterAmountMin !== undefined) {
        filteredTransactions = filteredTransactions.filter(t => t.amount >= parseFloat(filterAmountMin));
    }
    if (filterAmountMax !== '' && filterAmountMax !== undefined) {
        filteredTransactions = filteredTransactions.filter(t => t.amount <= parseFloat(filterAmountMax));
    }

    document.getElementById("transaction-count").textContent = filteredTransactions.length;
    document.getElementById("income-amount").textContent = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString('vi-VN') + 'đ';
    document.getElementById("expense-amount").textContent = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString('vi-VN') + 'đ';
    document.getElementById("balance-amount").textContent = (filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('vi-VN') + 'đ';

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    renderPagination(totalPages);

    const rowsHTML = paginatedTransactions.map((t, i) => {
        const index = transactions.indexOf(t);
        const displayIndex = startIndex + i + 1;
        const dateObj = new Date(t.time);
        const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        const isExpense = t.type === 'expense';
        const typeClass = isExpense ? 'text-danger' : 'text-success';
        const typeIcon = isExpense ? 'bi-arrow-down' : 'bi-arrow-up';
        const typeText = isExpense ? 'Chi' : 'Thu';

        const cat = categories.find(c => c.name === t.category) || { icon: 'tag', color: 'secondary' };
        const acc = accounts.find(a => a.name === t.account) || { icon: 'wallet2', color: 'secondary' };

        const amountSign = isExpense ? '-' : '+';
        const amountClass = isExpense ? 'text-danger' : 'text-success';
        const formattedAmount = (t.amount || 0).toLocaleString('vi-VN') + 'đ';

        const frequencyText = t.monthly ? 'Hàng tháng' : 'Một lần';
        const frequencyColor = t.monthly ? 'primary' : 'secondary';

        return `
            <tr class="align-middle">
                <td class="text-nowrap text-center" id="transaction-id" value="${index + 1}">${displayIndex}</td>
                <td class="text-nowrap text-center">
                    <div class="text-dark fw-medium">${dateStr}</div>
                    <div class="text-secondary" style="font-size: 12px;">${timeStr}</div>
                </td>
                <td class="text-nowrap text-center"><span class="${typeClass} fw-medium"><i class="bi ${typeIcon}"></i> ${typeText}</span></td>
                <td class="text-nowrap "><span class="icon-circle bg-${cat.color}-subtle text-${cat.color} me-2"><i class="bi bi-${cat.icon}"></i></span> ${t.category}</td>
                <td>${t.detail || ''}</td>
                <td class="text-nowrap"><span class="icon-circle bg-${acc.color}-subtle text-${acc.color} me-2"><i class="bi bi-${acc.icon}"></i></span> ${t.account}</td>
                <td class="${amountClass} fw-bold text-end text-nowrap text-center">${amountSign}${formattedAmount}</td>
                <td class="text-nowrap text-center"><span class="badge badge-custom bg-${frequencyColor}-subtle text-${frequencyColor}">${frequencyText}</span></td>
                <td class="text-end">
                    <div class="dropdown">
                        <button class="btn btn-sm text-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="dropdownMenuButton${index}">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <button class="dropdown-item edit-transaction-btn" data-index="${index}">
                                    <i class="bi bi-pencil me-2"></i> Chỉnh sửa
                                </button>
                            </li>
                            <li>
                                <button class="dropdown-item text-danger delete-transaction-btn" data-index="${index}">
                                    <i class="bi bi-trash me-2"></i> Xóa
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    transactionTableBody.innerHTML = rowsHTML;
}

transactionTableBody.addEventListener('click', function(e) {
    const deleteBtn = e.target.closest('.delete-transaction-btn');
    if (deleteBtn) {
        const index = parseInt(deleteBtn.getAttribute('data-index'), 10);
        if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
            transactions.splice(index, 1);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            renderTable();
            if (typeof showToast === 'function') {
                showToast('Xóa giao dịch thành công!');
            }
        }
    }

    const editBtn = e.target.closest('.edit-transaction-btn');
    if (editBtn) {
        const index = parseInt(editBtn.getAttribute('data-index'), 10);
        const transaction = transactions[index];
        if (transaction) {
            if (transaction.type === 'expense') {
                document.getElementById('edit-expense').checked = true;
            } else {
                document.getElementById('edit-income').checked = true;
            }

            document.getElementById('edit-trans-amount').value = (transaction.amount || 0).toLocaleString('vi-VN');

            const catInput = document.getElementById('edit-trans-category');
            if (catInput) catInput.value = transaction.category || '';
            const catBtn = document.getElementById('edit-btn-trans-category');
            if (catBtn) {
                catBtn.innerHTML = transaction.category || 'Chọn danh mục';
                if (transaction.category) {
                    catBtn.classList.remove('text-secondary');
                } else {
                    catBtn.classList.add('text-secondary');
                }
            }

            const accInput = document.getElementById('edit-trans-account');
            if (accInput) accInput.value = transaction.account || '';
            const accBtn = document.getElementById('edit-btn-trans-account');
            if (accBtn) {
                accBtn.innerHTML = transaction.account || 'Chọn tài khoản';
                if (transaction.account) {
                    accBtn.classList.remove('text-secondary');
                } else {
                    accBtn.classList.add('text-secondary');
                }
            }

            const dateInput = document.getElementById('edit-trans-date');
            if (dateInput) {
                if (!dateInput._flatpickr) {
                    flatpickr(dateInput, {
                        enableTime: true,
                        dateFormat: "d/m/Y H:i",
                        time_24hr: true,
                        defaultDate: transaction.time
                    });
                } else {
                    dateInput._flatpickr.setDate(transaction.time);
                }
            }

            const freqSelect = document.getElementById('edit-trans-frequency');
            if (freqSelect) {
                freqSelect.value = transaction.monthly ? 'monthly' : 'one-time';
            }

            const detailInput = document.getElementById('edit-trans-detail');
            if (detailInput) {
                detailInput.value = transaction.detail || '';
            }
            
            document.getElementById('edit-btn-save-transaction').setAttribute('data-index', index);

            const editModal = new bootstrap.Modal(document.getElementById('edit-single-add-transaction'));
            editModal.show();
        }
    }
});

const saveEditBtn = document.getElementById('edit-btn-save-transaction');
if (saveEditBtn) {
    saveEditBtn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'), 10);
        
        const type = document.getElementById('edit-expense').checked ? 'expense' : 'income';
        const amountStr = document.getElementById('edit-trans-amount').value.replace(/\D/g, '');
        const amount = parseInt(amountStr, 10) || 0;
        const category = document.getElementById('edit-trans-category').value;
        const dateInput = document.getElementById('edit-trans-date');
        const time = dateInput._flatpickr && dateInput._flatpickr.selectedDates[0] ? dateInput._flatpickr.selectedDates[0] : new Date();
        const frequency = document.getElementById('edit-trans-frequency').value === 'monthly';
        const account = document.getElementById('edit-trans-account').value;
        const detail = document.getElementById('edit-trans-detail').value;

        let isValid = true;
        if (!amount || amount <= 0) {
            document.getElementById('edit-trans-amount').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('edit-trans-amount').classList.remove('is-invalid');
        }

        if (!category) {
            document.getElementById('edit-error-trans-category').classList.remove('d-none');
            isValid = false;
        } else {
            document.getElementById('edit-error-trans-category').classList.add('d-none');
        }

        if (!dateInput.value) {
            dateInput.classList.add('is-invalid');
            isValid = false;
        } else {
            dateInput.classList.remove('is-invalid');
        }

        if (!isValid) return;

        transactions[index] = {
            type,
            amount,
            category,
            time: time.toISOString(),
            monthly: frequency,
            account,
            detail
        };

        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        const modalEl = document.getElementById('edit-single-add-transaction');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        renderTable();
        
        if (typeof showToast === 'function') {
            showToast('Cập nhật giao dịch thành công!');
        }
    });
}

const editAmountInput = document.getElementById('edit-trans-amount');
if (editAmountInput) {
    editAmountInput.addEventListener('input', function () {
        let value = this.value.replace(/\D/g, '');
        if (value !== '') {
            value = parseInt(value, 10).toLocaleString('vi-VN');
            this.value = value;
        } else {
            this.value = '';
        }
    });
}

['10k', '20k', '50k', '100k'].forEach(val => {
    const btn = document.getElementById(`edit-btn-${val}`);
    if (btn) {
        btn.addEventListener('click', () => {
            const amountInput = document.getElementById('edit-trans-amount');
            if(amountInput) {
                let currentAmount = parseFloat(amountInput.value.replace(/\D/g, '')) || 0;
                currentAmount += parseInt(val) * 1000;
                amountInput.value = currentAmount.toLocaleString('vi-VN');
            }
        });
    }
});

const filterAmountMin = document.getElementById('table-sort-amount-min');
if (filterAmountMin) {
    filterAmountMin.addEventListener('input', renderTable);
}

const filterAmountMax = document.getElementById('table-sort-amount-max');
if (filterAmountMax) {
    filterAmountMax.addEventListener('input', renderTable);
}

const btnResetFilters = document.getElementById('btn-reset-filters');
if (btnResetFilters) {
    btnResetFilters.addEventListener('click', function() {
        currentPage = 1;
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.value = '';

        const catInput = document.getElementById('table-sort-category');
        if (catInput) {
            catInput.value = '';
            const btn = document.getElementById('btn-table-sort-category');
            if (btn) {
                btn.innerHTML = 'Tất cả danh mục';
                btn.classList.add('text-secondary');
            }
        }

        const accInput = document.getElementById('table-sort-account');
        if (accInput) {
            accInput.value = '';
            const btn = document.getElementById('btn-table-sort-account');
            if (btn) {
                btn.innerHTML = 'Tất cả tài khoản';
                btn.classList.add('text-secondary');
            }
        }

        const typeInput = document.querySelector('.table-sort-type');
        if (typeInput) {
            typeInput.value = 'all-type';
            const dropdown = typeInput.closest('.dropdown');
            if (dropdown) {
                const btn = dropdown.querySelector('button');
                if (btn) {
                    btn.classList.remove('text-success', 'text-danger');
                    btn.innerHTML = `Tất cả loại<i class="bi bi-chevron-down ms-1"></i>`;
                }
            }
        }

        const freqInput = document.getElementById('table-sort-frequency');
        if (freqInput) {
            freqInput.value = '';
            const dropdown = freqInput.closest('.dropdown');
            if (dropdown) {
                const textSpan = dropdown.querySelector('.dropdown-text');
                if (textSpan) textSpan.textContent = 'Tần suất';
            }
        }

        if (filterAmountMin) filterAmountMin.value = '';
        if (filterAmountMax) filterAmountMax.value = '';

        const dateInput = document.getElementById('table-sort-date');
        if (dateInput && dateInput._flatpickr) {
            dateInput._flatpickr.clear();
        }

        renderTable();
    });
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    let html = '';
    
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link text-secondary pagination-btn" href="#" data-page="${currentPage - 1}">
                    <i class="bi bi-chevron-left"></i>
                </a>
             </li>`;
             
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link text-secondary pagination-btn" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item"><span class="page-link text-secondary border-0 bg-transparent">...</span></li>`;
        }
    }
    
    for (let p = startPage; p <= endPage; p++) {
        if (p === currentPage) {
            html += `<li class="page-item active"><a class="page-link pagination-btn" href="#" data-page="${p}">${p}</a></li>`;
        } else {
            html += `<li class="page-item"><a class="page-link text-secondary pagination-btn" href="#" data-page="${p}">${p}</a></li>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item"><span class="page-link text-secondary border-0 bg-transparent">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link text-secondary pagination-btn" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }
    
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link text-secondary pagination-btn" href="#" data-page="${currentPage + 1}">
                    <i class="bi bi-chevron-right"></i>
                </a>
             </li>`;
             
    container.innerHTML = html;
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.pagination-btn');
    if (btn) {
        e.preventDefault();
        const li = btn.closest('.page-item');
        if (li && li.classList.contains('disabled')) return;
        
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (!isNaN(page)) {
            currentPage = page;
            renderTable();
        }
    }
});

const itemsPerPageSelect = document.getElementById('items-per-page-select');
if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value, 10) || 10;
        currentPage = 1;
        renderTable();
    });
}


