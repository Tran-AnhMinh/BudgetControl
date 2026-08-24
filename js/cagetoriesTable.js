let currentSortCage = '';
let curruentPageCage = 1;
let itemsPerPageCage = 10;

let sortOrdersCage = {
    name: 1,
    icon: 1,
    color: 1
};

const CagetoriesTableBody = document.getElementById("cagetories-table-body");

function applyCurrentCageSort(cagetories){
    switch (currentSortCage) {
        case 'name':
        cagetories.sort((a,b) => sortOrdersCage.name * (a.name || '').localeCompare(b.name || ''));
        break;
        case 'icon':
        cagetories.sort((a,b) => sortOrdersCage.icon * (a.icon || '').localeCompare(b.icon || ''));
        break;
        case 'color':
        cagetories.sort((a,b) => sortOrdersCage.color * (a.color || '').localeCompare(b.color || ''));
        break;
    }
}

const btnSortCageName = document.getElementById("btn-sort-cage-name");
if (btnSortCageName) {
    btnSortCageName.addEventListener("click", function() {
        currentSortCage = 'name';
        sortOrdersCage.name *= -1;
        renderCagetoriesTable();
    });
}

const btnSortCageIcon = document.getElementById("btn-sort-cage-icon");
if (btnSortCageIcon) {
    btnSortCageIcon.addEventListener("click", function() {
        currentSortCage = 'icon';
        sortOrdersCage.icon *= -1;
        renderCagetoriesTable();
    });
}

const btnSortCageColor = document.getElementById("btn-sort-cage-color");
if (btnSortCageColor) {
    btnSortCageColor.addEventListener("click", function() {
        currentSortCage = 'color';
        sortOrdersCage.color *= -1;
        renderCagetoriesTable();
    });
}

function renderCagetoriesTable() {
    let cagetories = JSON.parse(localStorage.getItem('categories')) || [];
    
    applyCurrentCageSort(cagetories);

    const cageCountElem = document.getElementById("category-count") || document.getElementById("cagetory-count");
    if (cageCountElem) {
        cageCountElem.textContent = cagetories.length;
    }
    
    const totalCagePages = Math.ceil(cagetories.length / itemsPerPageCage) || 1;
    if (curruentPageCage > totalCagePages) {
        curruentPageCage = totalCagePages;
    }
    const startCageIndex = (curruentPageCage - 1) * itemsPerPageCage;
    const endCageIndex = startCageIndex + itemsPerPageCage;
    const cagetoriesToDisplay = cagetories.slice(startCageIndex, endCageIndex);
    
    if (typeof renderPaginationCage === 'function') {
        renderPaginationCage(totalCagePages);
    }

    const rowsHTMLCage = cagetoriesToDisplay.map((cage, i) => {
        const index = cagetories.indexOf(cage);
        const displayIndex = startCageIndex + i + 1;
        const cageName = cage.name || '';
        const cageIcon = cage.icon || '';
        const cageColor = cage.color || 'secondary';
        const cageColorTranslated = translateColor(cageColor);

        return `
            <tr class="align-middle">
                <td class="text-nowrap text-center" id="cagetory-id" value="${displayIndex}">${displayIndex}</td>
                <td class="text-nowrap text-center"><span class="fw-medium">${cageName}</span></td>
                <td class="text-nowrap text-center"><i class="text-${cageColor} bi bi-${cageIcon} fs-5"></i></td>
                <td class="text-nowrap text-center">
                    <span class="badge bg-${cageColor}-subtle text-${cageColor} px-3 py-2 rounded-pill">
                        ${cageColorTranslated}
                    </span>
                </td>
                <td class="text-center text-nowrap">
                    <div class="dropdown">
                        <button class="btn btn-sm text-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="dropdownMenuButtonCage${cage.id}">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <button class="dropdown-item edit-category-btn" data-id="${cage.id}">
                                    <i class="bi bi-pencil me-2"></i> Chỉnh sửa
                                </button>
                            </li>
                            <li>
                                <button class="dropdown-item text-danger delete-category-btn" data-id="${cage.id}">
                                    <i class="bi bi-trash me-2"></i> Xóa
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (CagetoriesTableBody) {
        CagetoriesTableBody.innerHTML = rowsHTMLCage;
    }
}

function renderPaginationCage(totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    let html = '';
    
    html += `<li class="page-item mx-1 ${curruentPageCage === 1 ? 'disabled' : ''}">
                <a class="page-link text-secondary pagination-btn-cage rounded-2" href="#" data-page="${curruentPageCage - 1}">
                    <i class="bi bi-chevron-left"></i>
                </a>
             </li>`;
             
    let startPage = Math.max(1, curruentPageCage - 2);
    let endPage = Math.min(totalPages, curruentPageCage + 2);
    
    if (startPage > 1) {
        html += `<li class="page-item mx-1"><a class="page-link text-secondary pagination-btn-cage rounded-2" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item mx-1"><span class="page-link text-secondary border-0 bg-transparent">...</span></li>`;
        }
    }
    
    for (let p = startPage; p <= endPage; p++) {
        if (p === curruentPageCage) {
            html += `<li class="page-item active mx-1"><a class="page-link pagination-btn-cage rounded-2" href="#" data-page="${p}">${p}</a></li>`;
        } else {
            html += `<li class="page-item mx-1"><a class="page-link text-secondary pagination-btn-cage rounded-2" href="#" data-page="${p}">${p}</a></li>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item mx-1"><span class="page-link text-secondary border-0 bg-transparent">...</span></li>`;
        }
        html += `<li class="page-item mx-1"><a class="page-link text-secondary pagination-btn-cage rounded-2" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }
    
    html += `<li class="page-item mx-1 ${curruentPageCage === totalPages ? 'disabled' : ''}">
                <a class="page-link text-secondary pagination-btn-cage rounded-2" href="#" data-page="${curruentPageCage + 1}">
                    <i class="bi bi-chevron-right"></i>
                </a>
             </li>`;
             
    container.innerHTML = html;
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.pagination-btn-cage');
    if (btn) {
        e.preventDefault();
        const page = parseInt(btn.getAttribute('data-page'), 10);
        if (!isNaN(page)) {
            curruentPageCage = page;
            renderCagetoriesTable();
        }
    }
});

const itemsPerPageSelect = document.getElementById('items-per-page-select');
if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPageCage = parseInt(this.value, 10);
        curruentPageCage = 1;
        renderCagetoriesTable();
    });
}

if (CagetoriesTableBody) {
    CagetoriesTableBody.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-category-btn');
        if (deleteBtn) {
            const id = parseInt(deleteBtn.getAttribute('data-id'), 10);
            if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
                let cagetories = getCagetories();
                const index = cagetories.findIndex(c => c.id === id);
                if (index > -1) {
                    cagetories.splice(index, 1);
                    localStorage.setItem('categories', JSON.stringify(cagetories));
                    renderCagetoriesTable();
                    if (typeof showToast === 'function') {
                        showToast('Xóa danh mục thành công!');
                    }
                }
            }
        }

        const editBtn = e.target.closest('.edit-category-btn');
        if (editBtn) {
            const id = parseInt(editBtn.getAttribute('data-id'), 10);
            let cagetories = getCagetories();
            const category = cagetories.find(c => c.id === id);
            if (category) {
                document.getElementById('edit-cat-name').value = category.name || '';
                
                const iconRadio = document.getElementById(`edit-icon-${category.icon}`);
                if (iconRadio) {
                    iconRadio.checked = true;
                }
                
                const colorRadio = document.getElementById(`edit-color-${category.color}`);
                if (colorRadio) {
                    colorRadio.checked = true;
                }

                document.getElementById('edit-cat-index').value = id;

                // Show modal
                const editModalElem = document.getElementById('editCategoryModal');
                if (editModalElem) {
                    const editModal = bootstrap.Modal.getOrCreateInstance(editModalElem);
                    editModal.show();
                }
            }
        }
    });
}

const btnSaveEditCategory = document.getElementById('edit-btn-save-category');
if (btnSaveEditCategory) {
    btnSaveEditCategory.addEventListener('click', function() {
        let isValid = true;
        const nameInput = document.getElementById('edit-cat-name');
        
        if (!nameInput.value.trim()) {
            nameInput.classList.add('is-invalid');
            isValid = false;
        } else {
            nameInput.classList.remove('is-invalid');
        }

        if (isValid) {
            const id = parseInt(document.getElementById('edit-cat-index').value, 10);
            const cageName = nameInput.value.trim();
            const iconRadio = document.querySelector('input[name="editCategoryIcon"]:checked');
            const cageIcon = iconRadio ? iconRadio.id.replace('edit-icon-', '') : 'tag';
            const colorRadio = document.querySelector('input[name="editCategoryColor"]:checked');
            const cageColor = colorRadio ? colorRadio.id.replace('edit-color-', '') : 'secondary';

            let cagetories = getCagetories();
            const index = cagetories.findIndex(c => c.id === id);
            if (index > -1) {
                cagetories[index].name = cageName;
                cagetories[index].icon = cageIcon;
                cagetories[index].color = cageColor;
                
                localStorage.setItem('categories', JSON.stringify(cagetories));
                renderCagetoriesTable();

                if (typeof showToast === 'function') {
                    showToast('Cập nhật danh mục thành công!');
                }

                const editModalElem = document.getElementById('editCategoryModal');
                if (editModalElem) {
                    const editModal = bootstrap.Modal.getInstance(editModalElem);
                    if (editModal) editModal.hide();
                }
            }
        }
    });
}



// Helper to get categories
function getCagetories() {
    return JSON.parse(localStorage.getItem('categories')) || [];
}

renderCagetoriesTable();
function saveExcelCagetories() {
    let cagetories = getCagetories();
    if (!cagetories || cagetories.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Không có dữ liệu để xuất!');
        }
        return;
    }

    const data = [];
    data.push(['ID', 'Tên danh mục', 'Icon', 'Màu sắc']);
    
    for (const c of cagetories) {
        data.push([
            c.id || '',
            c.name || '',
            c.icon || '',
            c.color || ''
        ]);
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Danh mục");

    XLSX.writeFile(wb, "categories.xlsx");

    if (typeof showToast === 'function') {
        showToast('Xuất dữ liệu Excel thành công!');
    }
}

const btnExportCagetories = document.getElementById('btn-export-excel-cagetories');
if (btnExportCagetories) {
    btnExportCagetories.addEventListener('click', saveExcelCagetories);
}

