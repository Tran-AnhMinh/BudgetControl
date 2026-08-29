function updateAccountSelect() {
    const accounts = JSON.parse(localStorage.getItem('accounts')) || [
        { id: 1, name: 'Tiền mặt', icon: 'cash-stack', color: 'success' },
        { id: 2, name: 'Tài khoản MB', icon: 'bank', color: 'primary' }
    ];
    const accountHtml = `
        ${accounts.map(a => `
            <li>
                <a class="dropdown-item account-item py-2 d-flex align-items-center" href="#" data-value="${a.id}">
                    <span class="icon-circle bg-${a.color}-subtle text-${a.color} me-2 flex-shrink-0"><i class="bi bi-${a.icon}"></i></span><span class="text-truncate">${a.name}</span>
                </a>
            </li>
        `).join('')}
    `;

    const accInput = document.getElementById('trans-account');
    const accMenu = document.getElementById('menu-trans-account');
    const btnAcc = document.getElementById('btn-trans-account');
    
    if (accInput && accMenu && btnAcc) {
        accMenu.innerHTML = accountHtml;
        const items = accMenu.querySelectorAll('.account-item');
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const val = this.getAttribute('data-value');
                accInput.value = val;
                if (val === '') {
                    btnAcc.innerHTML = '<span class="text-truncate">Chọn tài khoản</span>';
                    btnAcc.classList.add('text-secondary');
                } else {
                    btnAcc.innerHTML = this.innerHTML;
                    btnAcc.classList.remove('text-secondary');
                }
            });
        });
    }

    const multiAccInput = document.getElementById('multi-add-transac-select-account');
    const multiAccMenu = document.getElementById('menu-multi-add-transac-select-account');
    const btnMultiAcc = document.getElementById('btn-multi-add-transac-select-account');
    
    if (multiAccInput && multiAccMenu && btnMultiAcc) {
        multiAccMenu.innerHTML = accountHtml;
        const items = multiAccMenu.querySelectorAll('.account-item');
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const val = this.getAttribute('data-value');
                multiAccInput.value = val;
                if (val === '') {
                    btnMultiAcc.innerHTML = '<span class="text-truncate">Chọn tài khoản</span>';
                    btnMultiAcc.classList.add('text-secondary');
                } else {
                    btnMultiAcc.innerHTML = this.innerHTML;
                    btnMultiAcc.classList.remove('text-secondary');
                }
                
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
                                btn.innerHTML = this.innerHTML;
                                btn.classList.remove('text-secondary');
                            }
                        }
                    });
                }
            });
        });
    }

    const filterAccInput = document.getElementById('table-sort-account');
    const filterBtnAcc = document.getElementById('btn-table-sort-account');
    if (filterAccInput && filterBtnAcc) {
        const filterAccMenu = filterBtnAcc.nextElementSibling;
        if (filterAccMenu && filterAccMenu.classList.contains('dropdown-menu')) {
            filterAccMenu.innerHTML = `
                <li><a class="dropdown-item account-item text-secondary py-2 d-flex align-items-center" href="#" data-value=""><span class="text-truncate">Tất cả tài khoản</span></a></li>
                ${accountHtml}
            `;
        }
    }

    const editAccMenu = document.getElementById('edit-menu-trans-account');
    if (editAccMenu) {
        editAccMenu.innerHTML = accountHtml;
    }
}
const btnSaveAccount = document.getElementById('btn-save-account');
if (btnSaveAccount) {
    btnSaveAccount.addEventListener('click', function () {
        let isValid = true;

        const name = document.getElementById('acc-name');
        if (!name.value.trim()) {
            name.classList.add('is-invalid');
            isValid = false;
        } else {
            name.classList.remove('is-invalid');
        }

        if (isValid) {
            const accName = document.getElementById('acc-name').value;
            const iconRadio = document.querySelector('input[name="accountIcon"]:checked');
            const accIcon = iconRadio ? iconRadio.id.replace('acc-icon-', '') : 'wallet2';
            const colorRadio = document.querySelector('input[name="accountColor"]:checked');
            const accColor = colorRadio ? colorRadio.id.replace('acc-color-', '') : 'secondary';

            let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
            const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id || 0)) + 1 : 1;
            const newAccount = {
                id: newId,
                name: accName,
                icon: accIcon,
                color: accColor
            };
            accounts.push(newAccount);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            
            if (typeof updateAccountSelect === 'function') {
                updateAccountSelect();
            }
            if (typeof renderAccountsTable === 'function') {
                renderAccountsTable();
            }

            if (typeof showToast === 'function') {
                showToast('Thêm tài khoản thành công!');
            } else {
                alert('Thêm tài khoản thành công!');
            }

            const accInput = document.getElementById('trans-account');
            const btnAcc = document.getElementById('btn-trans-account');
            if (accInput && btnAcc) {
                accInput.value = newId;
                btnAcc.innerHTML = `<span class="icon-circle bg-${accColor}-subtle text-${accColor} me-2"><i class="bi bi-${accIcon}"></i></span>${accName}`;
                btnAcc.classList.remove('text-secondary');
                btnAcc.classList.remove('is-invalid');
                const err = document.getElementById('error-trans-account');
                if (err) err.classList.add('d-none');
            }

            const addAccountModalElem = document.getElementById('add-account');
            if (addAccountModalElem) {
                const addAccountModal = bootstrap.Modal.getInstance(addAccountModalElem);
                if (addAccountModal) addAccountModal.hide();
            }

            const singleAddModalElem = document.getElementById('single-add-transaction');
            if (singleAddModalElem) {
                const singleAddModal = bootstrap.Modal.getOrCreateInstance(singleAddModalElem);
                if (singleAddModal) singleAddModal.show();
            }

            name.value = '';
            const accIconElem = document.getElementById('acc-icon');
            if (accIconElem) accIconElem.value = '';
            const accColorElem = document.getElementById('acc-color');
            if (accColorElem) accColorElem.value = '';
        }
    });
}

