document.addEventListener('DOMContentLoaded', function() {
    flatpickr(".date-picker-input", {
        enableTime: true,
        dateFormat: "d/m/Y H:i",
        time_24hr: true,
        allowInput: true
    });

    // document.querySelectorAll('.custom-select-btn').forEach(button => {
    //     const dropdownMenu = button.nextElementSibling;
    //     if(dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
    //         const items = dropdownMenu.querySelectorAll('.dropdown-item');
    //         items.forEach(item => {
    //             item.addEventListener('click', function(e) {
    //                 e.preventDefault();
    //                 button.innerHTML = this.innerHTML;
    //                 button.classList.remove('text-secondary');
    //             });
    //         });
    //     }
    // });

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

        fileUpload.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            if (files.length > 0) {
                const file = files[0];

                if (file.size > 5 * 1024 * 1024) {
                    alert('File vượt quá dung lượng tối đa 5MB');
                    return;
                }

                const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                if (!validTypes.includes(file.type)) {
                    alert('Vui lòng chọn đúng định dạng .jpg, .png, .pdf');
                    return;
                }
                const textElem = dropZone.querySelector('.text-dark');
                if (textElem) {
                    textElem.innerHTML = `Đã chọn: <span class="text-primary fw-bold">${file.name}</span>`;
                }
            }
        }
    }

    const btnSaveTransaction = document.getElementById('btn-save-transaction');
    if (btnSaveTransaction) {
        btnSaveTransaction.addEventListener('click', function() {
            let isValid = true;

            const amount = document.getElementById('trans-amount');
            if (!amount.value || amount.value <= 0) {
                amount.classList.add('is-invalid');
                isValid = false;
            } else {
                amount.classList.remove('is-invalid');
            }

            const category = document.getElementById('trans-category');
            if (!category.value) {
                category.classList.add('is-invalid');
                isValid = false;
            } else {
                category.classList.remove('is-invalid');
            }

            const date = document.getElementById('trans-date');
            if (!date.value) {
                date.classList.add('is-invalid');
                isValid = false;
            } else {
                date.classList.remove('is-invalid');
            }

            if (isValid) {
                // Do save action here
                // alert('Thêm giao dịch thành công!');
                // const modal = bootstrap.Modal.getInstance(document.getElementById('single-add-transaction'));
                // modal.hide();
            }
        });
    }

    const btnSaveCategory = document.getElementById('btn-save-category');
    if (btnSaveCategory) {
        btnSaveCategory.addEventListener('click', function() {
            let isValid = true;

            const name = document.getElementById('cat-name');
            if (!name.value.trim()) {
                name.classList.add('is-invalid');
                isValid = false;
            } else {
                name.classList.remove('is-invalid');
            }
            const type = document.getElementById('cat-type');
            if (!type.value) {
                type.classList.add('is-invalid');
                isValid = false;
            } else {
                type.classList.remove('is-invalid');
            }

            if (isValid) {
                const addCategoryModal = bootstrap.Modal.getInstance(document.getElementById('add-category'));
                if (addCategoryModal) {
                    addCategoryModal.hide();
                }
                const singleAddModal = new bootstrap.Modal(document.getElementById('single-add-transaction'));
                singleAddModal.show();
            }
        });
    }

    document.querySelectorAll('.form-control, .form-select').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
        input.addEventListener('change', function() {
            this.classList.remove('is-invalid');
        });
    });
});



data{"time":"2024-06-19T08:47:00.000Z", "type":"income", "category":"ăn uống", "detail":"Trà sữa Tocotoco", "account":"MOMO", "amount":50000, "monthly":false}
    {"name":"ăn uóng", "icon":"cup-hot", "color":"warning"}
    {"name":"MOMO", "icon":"wallet", "color":"primary", "qrid":2}
    {"name":"Minh", "title":"sinh viên năm 2", "balance":1000000}
    