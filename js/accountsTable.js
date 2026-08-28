let searchQueryAcc = '';
let currentSortAcc = '';
let curruentPageAcc = 1;
let itemsPerPageAcc = 10;

let sortOrdersAcc = {
    name: 1,
    icon: 1,
    color: 1
};

const AccountsTableBody = document.getElementById("accounts-table-body");

function applyCurrentAccSort(accounts){
    switch (currentSortAcc) {
        case 'name':
        accounts.sort((a,b) => sortOrdersAcc.name * (a.name || '').localeCompare(b.name || ''));
        break;
        case 'icon':
        accounts.sort((a,b) => sortOrdersAcc.icon * (a.icon || '').localeCompare(b.icon || ''));
        break;
        case 'color':
        accounts.sort((a,b) => sortOrdersAcc.color * (a.color || '').localeCompare(b.color || ''));
        break;
    }
}

const btnSortAccName = document.getElementById("btn-sort-acc-name");
if (btnSortAccName) {
    btnSortAccName.addEventListener("click", function() {
        currentSortAcc = 'name';
        sortOrdersAcc.name *= -1;
        renderAccountsTable();
    });
}

const btnSortAccIcon = document.getElementById("btn-sort-acc-icon");
if (btnSortAccIcon) {
    btnSortAccIcon.addEventListener("click", function() {
        currentSortAcc = 'icon';
        sortOrdersAcc.icon *= -1;
        renderAccountsTable();
    });
}

const btnSortAccColor = document.getElementById("btn-sort-acc-color");
if (btnSortAccColor) {
    btnSortAccColor.addEventListener("click", function() {
        currentSortAcc = 'color';
        sortOrdersAcc.color *= -1;
        renderAccountsTable();
    });
}

const searchAccountInput = document.getElementById('search-account-input');
if (searchAccountInput) {
    searchAccountInput.addEventListener('input', function(e) {
        searchQueryAcc = e.target.value;
        curruentPageAcc = 1;
        renderAccountsTable();
    });
}

function renderAccountsTable() {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    
    if (searchQueryAcc.trim() !== '') {
        const query = searchQueryAcc.toLowerCase();
        accounts = accounts.filter(a => (a.name || '').toLowerCase().includes(query));
    }
    
    applyCurrentAccSort(accounts);

    const accCountElem = document.getElementById("account-count") || document.getElementById("account-count");
    if (accCountElem) {
        accCountElem.textContent = accounts.length;
    }

    const totalAccPages = Math.ceil(accounts.length / itemsPerPageAcc) || 1;
    if (curruentPageAcc > totalAccPages) {
        curruentPageAcc = totalAccPages;
    }
    const startAccIndex = (curruentPageAcc - 1) * itemsPerPageAcc;
    const endAccIndex = startAccIndex + itemsPerPageAcc;
    const accountsToDisplay = accounts.slice(startAccIndex, endAccIndex);
    
    if (typeof renderPaginationAcc === 'function') {
        renderPaginationAcc(totalAccPages);
    }

    const rowsHTMLAcc = accountsToDisplay.map((acc, i) => {
        const index = accounts.indexOf(acc);
        const displayIndex = startAccIndex + i + 1;
        const accName = acc.name || '';
        const accIcon = acc.icon || '';
        const accColor = acc.color || 'secondary';
        const accColorTranslated = translateColor(accColor);

        return `
            <tr class="align-middle">
                <td class="text-nowrap text-center" id="account-id" value="${displayIndex}">${displayIndex}</td>
                <td class="text-nowrap text-center"><span class="fw-medium">${accName}</span></td>
                <td class="text-nowrap text-center"><i class="text-${accColor} bi bi-${accIcon} fs-5"></i></td>
                <td class="text-nowrap text-center">
                    <span class="badge bg-${accColor}-subtle text-${accColor} px-3 py-2 rounded-pill">
                        ${accColorTranslated}
                    </span>
                </td>
                <td class="text-center text-nowrap">
                    <div class="dropdown">
                        <button class="btn btn-sm text-secondary" type="button" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}' aria-expanded="false" id="dropdownMenuButtonAcc${acc.id}">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <button class="dropdown-item edit-account-btn" data-id="${acc.id}">
                                    <i class="bi bi-pencil me-2"></i> Chỉnh sửa
                                </button>
                            </li>
                            <li>
                                <button class="dropdown-item text-danger delete-account-btn" data-id="${acc.id}">
                                    <i class="bi bi-trash me-2"></i> Xóa
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (AccountsTableBody) {
        AccountsTableBody.innerHTML = rowsHTMLAcc;
    }
}

function renderPaginationAcc(totalPages) {
    const container = document.getElementById('pagination-container-acc');
    if (!container) return;
    
    let html = '';
    
    html += `<li class="page-item mx-1 ${curruentPageAcc === 1 ? 'disabled' : ''}">
                <a class="page-link text-secondary pagination-btn-acc rounded-2" href="#" data-page="${curruentPageAcc - 1}">
                    <i class="bi bi-chevron-left"></i>
                </a>
             </li>`;
             
    let startPage = Math.max(1, curruentPageAcc - 2);
    let endPage = Math.min(totalPages, curruentPageAcc + 2);
    
    if (startPage > 1) {
        html += `<li class="page-item mx-1"><a class="page-link text-secondary pagination-btn-acc rounded-2" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item mx-1"><span class="page-link text-secondary border-0 bg-transparent">...</span></li>`;
        }
    }
    
    for (let p = startPage; p <= endPage; p++) {
        if (p === curruentPageAcc) {
            html += `<li class="page-item active mx-1"><a class="page-link pagination-btn-acc rounded-2" href="#" data-page="${p}">${p}</a></li>`;
        } else {
            html += `<li class="page-item mx-1"><a class="page-link text-secondary pagination-btn-acc rounded-2" href="#" data-page="${p}">${p}</a></li>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item mx-1"><span class="page-link text-secondary border-0 bg-transparent">...</span></li>`;
        }
        html += `<li class="page-item mx-1"><a class="page-link text-secondary pagination-btn-acc rounded-2" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }
    
    html += `<li class="page-item mx-1 ${curruentPageAcc === totalPages ? 'disabled' : ''}">
                <a class="page-link text-secondary pagination-btn-acc rounded-2" href="#" data-page="${curruentPageAcc + 1}">
                    <i class="bi bi-chevron-right"></i>
                </a>
             </li>`;
             
    container.innerHTML = html;
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.pagination-btn-acc');
    if (btn) {
        e.preventDefault();
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (!isNaN(page)) {
            curruentPageAcc = page;
            renderAccountsTable();
        }
    }
});

const itemsPerPageSelectAcc = document.getElementById('items-per-page-select-acc');
if (itemsPerPageSelectAcc) {
    itemsPerPageSelectAcc.addEventListener('change', function() {
        itemsPerPageAcc = parseInt(this.value, 10);
        curruentPageAcc = 1;
        renderAccountsTable();
    });
}

if (AccountsTableBody) {
    AccountsTableBody.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-account-btn');
        if (deleteBtn) {
            const id = parseInt(deleteBtn.getAttribute('data-id'), 10);
            if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
                let accounts = getAccounts();
                const index = accounts.findIndex(a => a.id === id);
                if (index > -1) {
                    accounts.splice(index, 1);
                    localStorage.setItem('accounts', JSON.stringify(accounts));
                    renderAccountsTable();
                    if (typeof showToast === 'function') {
                        showToast('Xóa tài khoản thành công!');
                    }
                }
            }
        }

        const editBtn = e.target.closest('.edit-account-btn');
        if (editBtn) {
            const id = parseInt(editBtn.getAttribute('data-id'), 10);
            let accounts = getAccounts();
            const account = accounts.find(a => a.id === id);
            if (account) {
                document.getElementById('edit-acc-name').value = account.name || '';

                const iconRadio = document.getElementById(`edit-acc-icon-${account.icon}`);
                if (iconRadio) {
                    iconRadio.checked = true;
                }

                const colorRadio = document.getElementById(`edit-acc-color-${account.color}`);
                if (colorRadio) {
                    colorRadio.checked = true;
                }

                document.getElementById('edit-acc-index').value = id;

                const editModalElem = document.getElementById('editAccountModal');
                if (editModalElem) {
                    const editModal = bootstrap.Modal.getOrCreateInstance(editModalElem);
                    editModal.show();
                }
            }
        }
    });
}

const btnSaveEditAccount = document.getElementById('edit-btn-save-account');
if (btnSaveEditAccount) {
    btnSaveEditAccount.addEventListener('click', function() {
        let isValid = true;
        const nameInput = document.getElementById('edit-acc-name');
        
        if (!nameInput.value.trim()) {
            nameInput.classList.add('is-invalid');
            isValid = false;
        } else {
            nameInput.classList.remove('is-invalid');
        }

        if (isValid) {
            const id = parseInt(document.getElementById('edit-acc-index').value, 10);
            const accName = nameInput.value.trim();
            const iconRadio = document.querySelector('input[name="editAccountIcon"]:checked');
            const accIcon = iconRadio ? iconRadio.id.replace('edit-acc-icon-', '') : 'wallet2';
            const colorRadio = document.querySelector('input[name="editAccountColor"]:checked');
            const accColor = colorRadio ? colorRadio.id.replace('edit-acc-color-', '') : 'secondary';

            let accounts = getAccounts();
            const index = accounts.findIndex(c => c.id === id);
            if (index > -1) {
                accounts[index].name = accName;
                accounts[index].icon = accIcon;
                accounts[index].color = accColor;
                
                localStorage.setItem('accounts', JSON.stringify(accounts));
                renderAccountsTable();

                if (typeof showToast === 'function') {
                    showToast('Cập nhật tài khoản thành công!');
                }

                const editModalElem = document.getElementById('editAccountModal');
                if (editModalElem) {
                    const editModal = bootstrap.Modal.getInstance(editModalElem);
                    if (editModal) editModal.hide();
                }
            }
        }
    });
}

function getAccounts() {
    return JSON.parse(localStorage.getItem('accounts')) || [];
}

renderAccountsTable();
function saveExcelAccounts() {
    let accounts = getAccounts();
    if (!accounts || accounts.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Không có dữ liệu để xuất!');
        }
        return;
    }

    const data = [];
    data.push(['ID', 'Tên tài khoản', 'Icon', 'Màu sắc']);
    
    for (const a of accounts) {
        data.push([
            a.id || '',
            a.name || '',
            a.icon || '',
            a.color || ''
        ]);
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Tài khoản");

    XLSX.writeFile(wb, "accounts.xlsx");

    if (typeof showToast === 'function') {
        showToast('Xuất dữ liệu Excel thành công!');
    }
}

const btnExportAccounts = document.getElementById('btn-export-excel-accounts');
if (btnExportAccounts) {
    btnExportAccounts.addEventListener('click', saveExcelAccounts);
}

