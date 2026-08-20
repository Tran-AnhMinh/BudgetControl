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

    const rowsHTML = transactions.map((t, index) => {
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

        document.getElementById("transaction-count").textContent = transactions.length;
        document.getElementById("income-amount").textContent = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString('vi-VN') + 'đ';
        document.getElementById("expense-amount").textContent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString('vi-VN') + 'đ';
        document.getElementById("balance-amount").textContent = (transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('vi-VN') + 'đ';

        return `
            <tr class="align-middle">
                <td class="text-nowrap text-center" id="transaction-id" value="${index + 1}">${index + 1}</td>
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
            showToast('Xóa giao dịch thành công!');
        }
    }
});


