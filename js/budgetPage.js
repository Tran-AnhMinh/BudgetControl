const Helper = {
    parseMoney(value) {
        if (!value) return 0;
        return parseInt(value.toString().replace(/[^0-9]/g, ""), 10) || 0;
    },

    formatMoney(value, hasCurrency = true) {
        const formatted = new Intl.NumberFormat("vi-VN").format(value || 0);
        return hasCurrency ? `${formatted}` : formatted;
    },

    formatMonth(yearMonthStr) {
        if (!yearMonthStr) return "";
        const [year, month] = yearMonthStr.split("-");
        return `Tháng ${month}/${year}`;
    }
};


const MonthlyBudgetModule = (function () {

    // ========================================
    // 1. CONSTANTS & HELPERS
    // ========================================

    const STORAGE_KEY = "monthly_budget";

    const SYSTEM_CATEGORIES = JSON.parse(localStorage.getItem('categories')) || [];

    function parseMoney(value) {
        if (!value) return 0;
        return parseInt(value.toString().replace(/[^0-9]/g, ""), 10) || 0;
    }



    // ========================================
    // 2. STATE
    // ========================================

    let currentMonth = "";
    let totalBudget = 0;
    let categories = [];
    let isEditing = false;


    let backupState = {
        totalBudget: 0,
        categories: []
    };


    // ========================================
    // 3. DOM CACHE
    // ========================================

    let DOM = {};

    function cacheDOM() {
        DOM = {
            // Month Picker
            monthPickerBtn: document.getElementById("monthPickerBtn"),
            monthPicker: document.getElementById("monthPicker"),
            monthPickerText: document.getElementById("monthPickerText"),


            totalBudgetText: document.getElementById("totalBudgetText"),
            totalBudgetInput: document.getElementById("totalBudgetInput"),
            totalBudgetWrapper: document.getElementById("totalBudgetInputWrapper"),

            // Actions
            viewGroup: document.getElementById("viewModeActions"),
            editGroup: document.getElementById("editModeActions"),
            editBtn: document.getElementById("editBtn"),
            cancelBtn: document.getElementById("cancelBtn"),
            saveBtn: document.getElementById("saveBtn"),
            addCategoryBtn: document.getElementById("addCategoryBtn"),

            // Table & Modal
            tableBody: document.getElementById("categoryTableBody"),
            availableCategoryList: document.getElementById("availableCategoryList"),
            budgetModal: document.getElementById("budgetModal"),

            // Bottom Stats
            statTotal: document.getElementById("statTotalBudget"),
            statAllocated: document.getElementById("statAllocated"),
            statRemaining: document.getElementById("statRemaining"),
            statTotalPercent: document.getElementById("statTotalPercent"),
            statStatusBadge: document.getElementById("statStatusBadge")
        };
    }


    // ========================================
    // 4. STORAGE
    // ========================================

    function loadData() {
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (savedData && savedData[currentMonth]) {
            totalBudget = savedData[currentMonth].totalBudget || 3000000;
            categories = savedData[currentMonth].categories || [];
        } else {
            totalBudget = 0;
            categories = [];
        }
    }

    function saveData() {
        console.log(categories);
        const fullStore = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        fullStore[currentMonth] = {
            totalBudget: totalBudget,
            categories: categories
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStore));
    }


    // ========================================
    // 5. DATA / BUSINESS LOGIC
    // ========================================

    function setMonth(newMonth) {
        currentMonth = newMonth;
        loadData();
        render();
    }

    function addCategory(catId) {


        const isAlreadyAdded = categories.some(c => c.id == catId);
        if (isAlreadyAdded) return;

        const target = SYSTEM_CATEGORIES.find(c => c.id == catId);
        if (!target) return;

        categories.push({
            id: target.id,
            name: target.name,
            icon: target.icon,
            color: target.color,
            amount: 0
        });

        render();
    }

    function removeCategory(index) {
        const targetCat = categories[index];
        if (!targetCat) return;

        const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa ${targetCat.name} không?`);

        if (isConfirmed) {
            categories.splice(index, 1);
            render();
        }
    }

    function updateCategoryAmount(index, amount) {
        if (categories[index]) {
            categories[index].amount = amount;
            renderRealtimeCalculations();
        }
    }

    function updateTotalBudget(amount) {
        totalBudget = amount;
        renderRealtimeCalculations();
    }

    function toggleEditMode(editing) {
        isEditing = editing;

        if (isEditing) {
            // Sao lưu dữ liệu hiện tại
            backupState = {
                totalBudget: totalBudget,
                categories: JSON.parse(JSON.stringify(categories))
            };

            DOM.totalBudgetText?.classList.add("d-none");
            DOM.totalBudgetWrapper?.classList.remove("d-none");
            DOM.addCategoryBtn?.classList.remove("d-none");
            DOM.viewGroup?.classList.add("d-none");
            DOM.editGroup?.classList.remove("d-none");
        } else {
            DOM.totalBudgetText?.classList.remove("d-none");
            DOM.totalBudgetWrapper?.classList.add("d-none");
            DOM.addCategoryBtn?.classList.add("d-none");
            DOM.editGroup?.classList.add("d-none");
            DOM.viewGroup?.classList.remove("d-none");
        }

        render();
    }

    function cancelEdit() {
        totalBudget = backupState.totalBudget;
        categories = JSON.parse(JSON.stringify(backupState.categories));
        toggleEditMode(false);
    }

    function saveEdit() {
        saveData();
        toggleEditMode(false);
    }


    // ========================================
    // 6. RENDER
    // ========================================

    function render() {
        renderHeader();
        renderTable();
        renderRealtimeCalculations();
        renderModalAvailableCategories();
    }

    function renderHeader() {
        if (DOM.monthPicker) DOM.monthPicker.value = currentMonth;
        if (DOM.monthPickerText) DOM.monthPickerText.textContent = Helper.formatMonth(currentMonth);

        if (DOM.totalBudgetText) DOM.totalBudgetText.textContent = `${Helper.formatMoney(totalBudget)}đ`;
        if (DOM.totalBudgetInput) DOM.totalBudgetInput.value = totalBudget;
    }

    function renderTable() {
        if (!DOM.tableBody) return;
        DOM.tableBody.innerHTML = "";

        categories.forEach((cat, index) => {
            const percent = totalBudget > 0 ? Math.round((cat.amount / totalBudget) * 100) : 0;
            const tr = document.createElement("tr");

            tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-${cat.color}-subtle text-${cat.color}" style="width: 40px; height: 40px; min-width: 40px;">
                        <i class="bi bi-${cat.icon} fs-5"></i>
                    </div>
                    <div class="fw-bold text-dark">${cat.name}</div>
                </div>
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control text-start fw-semibold budget-input" 
                           data-index="${index}" value="${Helper.formatMoney(cat.amount)}"}" ${!isEditing ? 'disabled' : ''} />
                    <span class="input-group-text bg-white text-muted">đ</span>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <span class="small fw-semibold text-muted text-nowrap row-percent" style="width: 35px">${percent}%</span>
                    <div class="progress flex-grow-1" style="height: 6px">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                </div>
            </td>
            <td class="text-center">
                <button type="button" class="btn btn-sm btn-link text-secondary p-1 delete-cat-btn" 
                        data-index="${index}" ${!isEditing ? 'disabled' : ''}>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
            DOM.tableBody.appendChild(tr);
        });
    }

    function renderRealtimeCalculations() {
        const allocatedTotal = categories.reduce((sum, item) => sum + item.amount, 0);
        const remaining = totalBudget - allocatedTotal;
        const totalPercent = totalBudget > 0 ? Math.round((allocatedTotal / totalBudget) * 100) : 0;

        // Cập nhật từng hàng mà không cần vẽ lại DOM table
        const rows = DOM.tableBody?.querySelectorAll("tr") || [];
        rows.forEach((tr, index) => {
            if (categories[index]) {
                const percent = totalBudget > 0 ? Math.round((categories[index].amount / totalBudget) * 100) : 0;
                const percentText = tr.querySelector(".row-percent");
                const progressBar = tr.querySelector(".progress-bar");

                if (percentText) percentText.textContent = `${percent}%`;
                if (progressBar) progressBar.style.width = `${Math.min(percent, 100)}%`;
            }
        });

        if (DOM.statTotal) DOM.statTotal.textContent = `${Helper.formatMoney(totalBudget)}đ`;
        if (DOM.statAllocated) DOM.statAllocated.textContent = `${Helper.formatMoney(allocatedTotal)}đ`;
        if (DOM.statRemaining) DOM.statRemaining.textContent = `${Helper.formatMoney(remaining)}đ`;
        if (DOM.statTotalPercent) DOM.statTotalPercent.textContent = `${Helper.formatMoney(totalPercent)}%`;

        // Badge Status
        if (DOM.statStatusBadge) {
            if (totalPercent === 100 && remaining === 0) {
                DOM.statStatusBadge.className = "badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small";
                DOM.statStatusBadge.innerHTML = 'Đã hợp lệ <i class="bi bi-check"></i>';
            } else if (totalPercent > 100 || remaining < 0) {
                DOM.statStatusBadge.className = "badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill small";
                DOM.statStatusBadge.innerHTML = 'Vượt ngân sách <i class="bi bi-exclamation-triangle"></i>';
            } else {
                DOM.statStatusBadge.className = "badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-pill small";
                DOM.statStatusBadge.innerHTML = 'Chưa phân bổ hết <i class="bi bi-dash"></i>';
            }
        }
    }

    function renderModalAvailableCategories() {
        if (!DOM.availableCategoryList) return;

        const available = SYSTEM_CATEGORIES.filter(
            sysCat => !categories.some(cat => cat.id === sysCat.id)
        );

        if (available.length === 0) {
            DOM.availableCategoryList.innerHTML = `<div class="text-center text-muted py-3 small">Đã thêm toàn bộ danh mục!</div>`;
            return;
        }

        DOM.availableCategoryList.innerHTML = available.map(cat => `
            <button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-3 border rounded-3 p-2 select-modal-cat-btn" data-id="${cat.id}">
                <div class="rounded-circle d-flex align-items-center justify-content-center text-${cat.color} bg-${cat.color}-subtle" style="width: 38px; height: 38px;">
                    <i class="bi bi-${cat.icon}"></i>
                </div>
                <span class="fw-semibold text-dark">${cat.name}</span>
            </button>
        `).join("");
    }


    // ========================================
    // 7. EVENTS
    // ========================================

    function bindEvents() {
        // MonthPicker
        DOM.monthPickerBtn?.addEventListener("click", () => {
            if ("showPicker" in HTMLInputElement.prototype) {
                DOM.monthPicker.showPicker();
            } else {
                DOM.monthPicker.focus();
            }
        });

        DOM.monthPicker?.addEventListener("change", (e) => {
            if (!e.target.value) return;
            setMonth(e.target.value);
        });

        // Mode Actions
        DOM.editBtn?.addEventListener("click", () => toggleEditMode(true));
        DOM.cancelBtn?.addEventListener("click", cancelEdit);
        DOM.saveBtn?.addEventListener("click", saveEdit);

        // Input Tổng ngân sách
        DOM.totalBudgetInput?.addEventListener("input", (e) => {
            updateTotalBudget(parseMoney(e.target.value));
        });

        // Input số tiền từng danh mục trong bảng
        DOM.tableBody?.addEventListener("input", (e) => {
            if (e.target.classList.contains("budget-input")) {
                const index = parseInt(e.target.dataset.index, 10);
                updateCategoryAmount(index, parseMoney(e.target.value));
            }
        });

        DOM.tableBody?.addEventListener("focusout", (e) => {
            if (e.target.classList.contains("budget-input")) {
                const index = parseInt(e.target.dataset.index, 10);
                if (categories[index]) {
                    e.target.value = Helper.formatMoney(categories[index].amount);
                }
            }
        });

        DOM.totalBudgetInput?.addEventListener("focusout", (e) => {
            e.target.value = Helper.formatMoney(totalBudget);
        });



        // Xóa dòng trong bảng
        DOM.tableBody?.addEventListener("click", (e) => {
            const btn = e.target.closest(".delete-cat-btn");
            if (!btn || !isEditing) return;
            removeCategory(parseInt(btn.dataset.index, 10));
        });

        // Chọn danh mục từ Modal
        DOM.availableCategoryList?.addEventListener("click", (e) => {
            const btn = e.target.closest(".select-modal-cat-btn");
            if (!btn) return;

            addCategory(btn.dataset.id);

            const modal = bootstrap.Modal.getInstance(DOM.budgetModal);
            if (modal) modal.hide();
        });
    }


    // ========================================
    // 8. INIT
    // ========================================

    function init() {
        const now = new Date();
        currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        cacheDOM();
        loadData();
        bindEvents();
        toggleEditMode(false);
    }


    // ========================================
    // PUBLIC
    // ========================================

    return {
        init
    };

})();

const DailyBudgetModule = (function () {

    // ========================================
    // 1. CONSTANTS & STORAGE KEY
    // ========================================
    const STORAGE_KEY = "daily_budget";
    const DEFAULT_BUDGET = 500000;

    function parseMoney(value) {
        if (!value) return 0;
        return parseInt(value.toString().replace(/[^0-9]/g, ""), 10) || 0;
    }


    // ========================================
    // 2. STATE
    // ========================================
    let dailyBudget = DEFAULT_BUDGET;
    let isEditing = false;
    let backupBudget = DEFAULT_BUDGET;

    // ========================================
    // 3. DOM CACHE
    // ========================================
    let DOM = {};

    function cacheDOM() {
        DOM = {
            input: document.getElementById("dailyBudgetInput"),
            saveBtn: document.getElementById("saveDailyBudget")
        };
    }

    // ========================================
    // 4. STORAGE
    // ========================================
    function loadData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        dailyBudget = saved !== null ? parseMoney(saved) : DEFAULT_BUDGET;
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, dailyBudget);
    }

    // ========================================
    // 5. BUSINESS LOGIC & TOGGLE
    // ========================================
    function toggleEditMode(editing) {
        isEditing = editing;

        if (isEditing) {
            // Lưu lại giá trị trước khi sửa để phòng khi cần khôi phục
            backupBudget = dailyBudget;
            if (DOM.input) {
                DOM.input.removeAttribute("disabled");
                DOM.input.focus();
                DOM.input.select();
            }
            if (DOM.saveBtn) {
                DOM.saveBtn.textContent = "Lưu thay đổi";
                DOM.saveBtn.classList.remove("btn-outline-primary");
                DOM.saveBtn.classList.add("btn-primary");
            }
        } else {
            if (DOM.input) {
                DOM.input.setAttribute("disabled", "true");
            }
            if (DOM.saveBtn) {
                DOM.saveBtn.textContent = "Chỉnh sửa";
                DOM.saveBtn.classList.remove("btn-primary");
                DOM.saveBtn.classList.add("btn-outline-primary");
            }
        }

        render();
    }

    // ========================================
    // 6. RENDER
    // ========================================
    function render() {
        if (DOM.input) {

            DOM.input.value = Helper.formatMoney(dailyBudget);
        }
    }

    // ========================================
    // 7. EVENTS
    // ========================================
    function bindEvents() {
        // Bấm nút: chuyển đổi giữa "Chỉnh sửa" và "Lưu thay đổi"
        DOM.saveBtn?.addEventListener("click", () => {
            if (isEditing) {
                // Đang sửa -> Bấm để Lưu
                dailyBudget = parseMoney(DOM.input.value);
                saveData();
                toggleEditMode(false);
            } else {
                // Đang khóa -> Bấm để Chỉnh sửa
                toggleEditMode(true);
            }
        });

        // Tự động cập nhật và format số khi người dùng gõ
        DOM.input?.addEventListener("input", (e) => {
            const rawValue = parseMoney(e.target.value);
            dailyBudget = rawValue;
        });

        // Nhấn Enter để lưu nhanh, Escape để hủy
        DOM.input?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                dailyBudget = parseMoney(DOM.input.value);
                saveData();
                toggleEditMode(false);
            } else if (e.key === "Escape") {
                dailyBudget = backupBudget;
                toggleEditMode(false);
            }
        });
    }

    // ========================================
    // 8. INIT
    // ========================================
    function init() {
        cacheDOM();
        loadData();
        bindEvents();
        toggleEditMode(false);
    }

    return {
        init,
        getValue: () => dailyBudget,
        setValue: (val) => {
            dailyBudget = parseMoney(val);
            saveData();
            render();
        }
    };
})();

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", function () {
    MonthlyBudgetModule.init();
    DailyBudgetModule.init();
});