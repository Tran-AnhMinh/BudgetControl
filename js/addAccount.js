function updateAccountSelect() {
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
                    btnAcc.innerHTML = 'Chọn tài khoản';
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
                    btnMultiAcc.innerHTML = 'Chọn tài khoản';
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
                            const dropdownDiv = accHidden.closest('.dropdown');
                            if (dropdownDiv) {
                                const btn = dropdownDiv.querySelector('[data-bs-toggle="dropdown"]');
                                if (btn) {
                                    if (val === '') {
                                        btn.innerHTML = 'Tài khoản';
                                        btn.classList.add('text-secondary');
                                    } else {
                                        btn.innerHTML = this.innerHTML;
                                        btn.classList.remove('text-secondary');
                                    }
                                }
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
                <li><a class="dropdown-item account-item text-secondary py-2" href="#" data-value="">Chọn tài khoản</a></li>
                ${accountHtml}
            `;
        }
    }

    const editAccMenu = document.getElementById('edit-menu-trans-account');
    if (editAccMenu) {
        editAccMenu.innerHTML = accountHtml;
    }
}
function initAddAccount() {
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

                const newCategory = {
                    name: accName,
                    icon: accIcon,
                    color: accColor
                };
                let cagetories = JSON.parse(localStorage.getItem('accounts')) || [];
                cagetories.push(newCategory);
                localStorage.setItem('accounts', JSON.stringify(cagetories));
                updateAccountSelect();

                showToast('Thêm tài khoản thành công!');

                const addAccountModal = bootstrap.Modal.getInstance(document.getElementById('add-account'));
                if (addAccountModal) {
                    addAccountModal.hide();
                }

                const singleAddModal = new bootstrap.Modal(document.getElementById('single-add-transaction'));
                singleAddModal.show();

                name.value = '';
                const accIconElem = document.getElementById('acc-icon');
                if (accIconElem) accIconElem.value = '';
                const accColorElem = document.getElementById('acc-color');
                if (accColorElem) accColorElem.value = '';
            }
        });
    }


}