function updateCategorySelect() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryHtml = `
        ${categories.map(c => `
            <li>
                <a class="dropdown-item category-item py-2" href="#" data-value="${c.id}">
                    <span class="icon-circle bg-${c.color}-subtle text-${c.color} me-2"><i class="bi bi-${c.icon}"></i></span>${c.name}
                </a>
            </li>
        `).join('')}
    `;

    const categoryInput = document.getElementById('trans-category');
    const categoryMenu = document.getElementById('menu-trans-category');
    const btnCategory = document.getElementById('btn-trans-category');
    
    if (categoryInput && categoryMenu && btnCategory) {
        categoryMenu.innerHTML = categoryHtml;
        const items = categoryMenu.querySelectorAll('.category-item');
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const val = this.getAttribute('data-value');
                categoryInput.value = val;
                if (val === '') {
                    btnCategory.innerHTML = 'Chọn danh mục';
                    btnCategory.classList.add('text-secondary');
                } else {
                    btnCategory.innerHTML = this.innerHTML;
                    btnCategory.classList.remove('text-secondary');
                }
                
                btnCategory.classList.remove('is-invalid');
                const err = document.getElementById('error-trans-category');
                if (err) err.classList.add('d-none');
            });
        });
    }

    const multiCategoryInput = document.getElementById('multi-add-trans-category');
    const multiCategoryMenu = document.getElementById('menu-multi-add-trans-category');
    const btnMultiCategory = document.getElementById('btn-multi-add-trans-category');

    if (multiCategoryInput && multiCategoryMenu && btnMultiCategory) {
        multiCategoryMenu.innerHTML = categoryHtml;
        const items = multiCategoryMenu.querySelectorAll('.category-item');
        items.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const val = this.getAttribute('data-value');
                multiCategoryInput.value = val;
                if (val === '') {
                    btnMultiCategory.innerHTML = 'Danh mục';
                    btnMultiCategory.classList.add('text-secondary');
                } else {
                    btnMultiCategory.innerHTML = this.innerHTML;
                    btnMultiCategory.classList.remove('text-secondary');
                }
            });
        });
    }

    const filterCatInput = document.getElementById('table-sort-category');
    const filterBtnCat = document.getElementById('btn-table-sort-category');
    if (filterCatInput && filterBtnCat) {
        const filterCatMenu = filterBtnCat.nextElementSibling;
        if (filterCatMenu && filterCatMenu.classList.contains('dropdown-menu')) {
            filterCatMenu.innerHTML = `
                <li><a class="dropdown-item category-item text-secondary py-2" href="#" data-value="">Tất cả danh mục</a></li>
                ${categoryHtml}
            `;
        }
    }

    const editCatMenu = document.getElementById('edit-menu-trans-category');
    if (editCatMenu) {
        editCatMenu.innerHTML = categoryHtml;
    }
}

let fromTrans = 0;
if(document.getElementById('btn-trans-category')){fromTrans = 1;}

const btnSaveCategory = document.getElementById('btn-save-category');
if (btnSaveCategory) {
    btnSaveCategory.addEventListener('click', function () {
        let isValid = true;

        const name = document.getElementById('cat-name');
        if (!name.value.trim()) {
            name.classList.add('is-invalid');
            isValid = false;
        } else {
            name.classList.remove('is-invalid');
        }

        if (isValid) {
            const cageName = document.getElementById('cat-name').value;
            const iconRadio = document.querySelector('input[name="categoryIcon"]:checked');
            const cageIcon = iconRadio ? iconRadio.id.replace('icon-', '') : 'tag';
            const colorRadio = document.querySelector('input[name="categoryColor"]:checked');
            const cageColor = colorRadio ? colorRadio.id.replace('color-', '') : 'secondary';

            let cagetories = JSON.parse(localStorage.getItem('categories')) || [];
            const newId = cagetories.length > 0 ? Math.max(...cagetories.map(c => c.id || 0)) + 1 : 1;
            const newCategory = {
                id: newId,
                name: cageName,
                icon: cageIcon,
                color: cageColor
            };
            cagetories.push(newCategory);
            localStorage.setItem('categories', JSON.stringify(cagetories));
            if (typeof updateCategorySelect === 'function') {
                updateCategorySelect();
            }
            if (typeof renderCagetoriesTable === 'function') {
                renderCagetoriesTable();
            }

            if (typeof showToast === 'function') {
                showToast('Thêm danh mục thành công!');
            } else {
                alert('Thêm danh mục thành công!');
            }

            if(fromTrans){
                const categoryInput = document.getElementById('trans-category');
                const btnCategory = document.getElementById('btn-trans-category');
                if (categoryInput && btnCategory) {
                    categoryInput.value = newId;
                    btnCategory.innerHTML = `<span class="icon-circle bg-${cageColor}-subtle text-${cageColor} me-2"><i class="bi bi-${cageIcon}"></i></span>${cageName}`;
                    btnCategory.classList.remove('text-secondary');
                    btnCategory.classList.remove('is-invalid');
                    const err = document.getElementById('error-trans-category');
                    if (err) err.classList.add('d-none');
                }
                fromTrans = 0;
            }

            const addCategoryModalElem = document.getElementById('add-category');
            if (addCategoryModalElem) {
                const addCategoryModal = bootstrap.Modal.getInstance(addCategoryModalElem);
                if (addCategoryModal) addCategoryModal.hide();
            }

            const singleAddModalElem = document.getElementById('single-add-transaction');
            if (singleAddModalElem) {
                const singleAddModal = bootstrap.Modal.getOrCreateInstance(singleAddModalElem);
                if (singleAddModal) singleAddModal.show();
            }

            name.value = '';
            const catIcon = document.getElementById('cat-icon');
            if (catIcon) catIcon.value = '';
            const catColor = document.getElementById('cat-color');
            if (catColor) catColor.value = '';
        }
    });
}

document.querySelectorAll('.form-control, .form-select').forEach(input => {
    input.addEventListener('input', function () {
        this.classList.remove('is-invalid');
        if (this.id === 'trans-amount') {
            const vndIcon = document.getElementById('vnd-icon');
            if (vndIcon) vndIcon.style.borderColor = '';
            let val = this.value.replace(/\D/g, '');
            if (val !== '') {
                this.value = parseInt(val, 10).toLocaleString('vi-VN');
            } else {
                this.value = '';
            }
        }

        if (this.id === 'trans-date') {
            const calenIcon = document.getElementById('trans-date-calen-icon');
            if (calenIcon) calenIcon.parentElement.style.borderColor = '';
        }
    });
    input.addEventListener('change', function () {
        this.classList.remove('is-invalid');
        if (this.id === 'trans-amount') {
            const vndIcon = document.getElementById('vnd-icon');
            if (vndIcon) vndIcon.style.borderColor = '';
        }
        if (this.id === 'trans-date') {
            const calenIcon = document.getElementById('trans-date-calen-icon');
            if (calenIcon) calenIcon.parentElement.style.borderColor = '';
        }
    });
});
