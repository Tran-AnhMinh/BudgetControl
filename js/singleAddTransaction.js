const btnSingleAddTransOpen = document.getElementById('btn-single-add-trans-open');
if(btnSingleAddTransOpen){
    btnSingleAddTransOpen.addEventListener('click', function(){
        flatpickr(".date-picker-input", {
        enableTime: true,
        dateFormat: "d/m/Y H:i",
        time_24hr: true,
        allowInput: true,
        defaultDate: new Date()
        });
    });
}

const btnSaveTransaction = document.getElementById('btn-save-transaction');
if (btnSaveTransaction) {
    btnSaveTransaction.addEventListener('click', function () {
        let isValid = true;

        const amount = document.getElementById('trans-amount');
        const amountVal = amount.value ? parseInt(amount.value.replace(/\D/g, ''), 10) : 0;
        if (!amountVal || amountVal <= 0) {
            amount.classList.add('is-invalid');
            isValid = false;
            document.getElementById('vnd-icon').style.borderColor = 'var(--bs-danger)';

        } else {
            amount.classList.remove('is-invalid');
            document.getElementById('vnd-icon').style.borderColor = '';
        }

        const category = document.getElementById('trans-category');
        const btnCategory = document.getElementById('btn-trans-category');
        const errCategory = document.getElementById('error-trans-category');
        if (!category.value) {
            if (btnCategory) btnCategory.classList.add('is-invalid');
            if (errCategory) errCategory.classList.remove('d-none');
            isValid = false;
        } else {
            if (btnCategory) btnCategory.classList.remove('is-invalid');
            if (errCategory) errCategory.classList.add('d-none');
        }

        const date = document.getElementById('trans-date');
        const calenIcon = document.getElementById('trans-date-calen-icon');
        if (!date.value) {
            date.classList.add('is-invalid');
            isValid = false;
            if (calenIcon) calenIcon.parentElement.style.borderColor = 'var(--bs-danger)';
        } else {
            date.classList.remove('is-invalid');
            if (calenIcon) calenIcon.parentElement.style.borderColor = '';
        }

        if (isValid) {
            const typeStr = document.getElementById('expense').checked ? 'expense' : 'income';
            const timeStr = date.value;
            const parts = timeStr.split(' ');
            let isoTime = new Date().toISOString();
            if (parts.length === 2) {
                const dateParts = parts[0].split('/');
                const timeParts = parts[1].split(':');
                if (dateParts.length === 3 && timeParts.length === 2) {
                    isoTime = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]).toISOString();
                }
            }

            const newTransaction = {
                time: isoTime,
                type: typeStr,
                category: category.value,
                detail: document.getElementById('trans-detail').value,
                account: document.getElementById('trans-account').value,
                amount: amountVal,
                monthly: document.getElementById('trans-frequency')?.value === 'monthly'
            };

            transactions.push(newTransaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));

            showToast('Thêm giao dịch thành công!');

            const modal = bootstrap.Modal.getInstance(document.getElementById('single-add-transaction'));
            if (modal) {
                modal.hide();
            }

            applyCurrentSort();
            renderTable();
            amount.value = '';
            category.value = '';
            if (btnCategory) {
                btnCategory.innerHTML = 'Chọn danh mục';
                btnCategory.classList.add('text-secondary');
            }
            date.value = '';
            document.getElementById('trans-detail').value = '';

            const btnAcc = document.getElementById('btn-trans-account');
            if (btnAcc) {
                btnAcc.innerHTML = 'Chọn tài khoản';
                btnAcc.classList.add('text-secondary');
            }
        }
    });
}

const btn10k = document.getElementById('btn-10k');
if (btn10k) {
    btn10k.addEventListener('click', function () {
        const amountInput = document.getElementById('trans-amount');
        if (amountInput) {
            const currentVal = parseInt(amountInput.value.replace(/\D/g, '') || '0', 10);
            amountInput.value = (currentVal + 10000).toLocaleString('vi-VN');
            amountInput.classList.remove('is-invalid');
            const vndIcon = document.getElementById('vnd-icon');
            if (vndIcon) vndIcon.style.borderColor = '';
        }
    });
}

const btn20k = document.getElementById('btn-20k');
if (btn20k) {
    btn20k.addEventListener('click', function () {
        const amountInput = document.getElementById('trans-amount');
        if (amountInput) {
            const currentVal = parseInt(amountInput.value.replace(/\D/g, '') || '0', 10);
            amountInput.value = (currentVal + 20000).toLocaleString('vi-VN');
            amountInput.classList.remove('is-invalid');
            const vndIcon = document.getElementById('vnd-icon');
            if (vndIcon) vndIcon.style.borderColor = '';
        }
    });
}

const btn50k = document.getElementById('btn-50k');
if (btn50k) {
    btn50k.addEventListener('click', function () {
        const amountInput = document.getElementById('trans-amount');
        if (amountInput) {
            const currentVal = parseInt(amountInput.value.replace(/\D/g, '') || '0', 10);
            amountInput.value = (currentVal + 50000).toLocaleString('vi-VN');
            amountInput.classList.remove('is-invalid');
            const vndIcon = document.getElementById('vnd-icon');
            if (vndIcon) vndIcon.style.borderColor = '';
        }
    });
}

const btn100k = document.getElementById('btn-100k');
if (btn100k) {
    btn100k.addEventListener('click', function () {
        const amountInput = document.getElementById('trans-amount');
        if (amountInput) {
            const currentVal = parseInt(amountInput.value.replace(/\D/g, '') || '0', 10);
            amountInput.value = (currentVal + 100000).toLocaleString('vi-VN');
            amountInput.classList.remove('is-invalid');
            const vndIcon = document.getElementById('vnd-icon');
            if (vndIcon) vndIcon.style.borderColor = '';
        }
    });
}
