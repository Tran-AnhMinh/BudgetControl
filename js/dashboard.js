const Dashboard = (function () {

    const STORAGE_KEY = "transactions";

    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";
    }

    function formatMonth(yearMonthStr) {
        if (!yearMonthStr) return "";
        const [year, month] = yearMonthStr.split("-");
        return `Tháng ${month}/${year}`;
    }

    function resolveCategory(id) {
        return categories.find(c => c.id == id)
            || { id, name: `Danh mục #${id}`, icon: "question-circle", color: "secondary" };
    }

    function isSameMonth(timeValue, targetYear, targetMonth) {
        const date = new Date(timeValue);
        return !isNaN(date.getTime()) && date.getFullYear() === targetYear && date.getMonth() === targetMonth;
    }

    function isToday(timeValue) {
        const date = new Date(timeValue);
        const now = new Date();
        return !isNaN(date.getTime())
            && date.getFullYear() === now.getFullYear()
            && date.getMonth() === now.getMonth()
            && date.getDate() === now.getDate();
    }

    let currentYearMonth = "";
    let transactions = [];
    let categories = [];
    let monthlyBudgetStore = {};
    let statistics = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    };

    let DOM = {};

    function cacheDOM() {
        DOM = {
            monthPickerBtn: document.getElementById("monthPickerBtn"),
            monthPicker: document.getElementById("monthPicker"),
            monthPickerText: document.getElementById("monthPickerText"),

            totalIncome: document.getElementById("totalIncome"),
            totalExpense: document.getElementById("totalExpense"),
            balance: document.getElementById("balance"),

            monthlyBudgetTitle: document.getElementById("monthlyBudgetTitle"),
            monthlyBudgetList: document.getElementById("monthlyBudgetList"),

            todayBudgetValue: document.getElementById("todayBudgetValue"),
            todaySpentValue: document.getElementById("todaySpentValue"),
            todayRemainValue: document.getElementById("todayRemainValue"),
            todayProgressBar: document.getElementById("todayProgressBar"),
            todayProgressPercent: document.getElementById("todayProgressPercent"),
            todayDetailsList: document.getElementById("todayDetailsList")
        };
    }

    function loadData() {
        try {
            transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            console.error("Lỗi đọc dữ liệu giao dịch:", e);
            transactions = [];
        }
        categories = JSON.parse(localStorage.getItem("categories")) || [];
        monthlyBudgetStore = JSON.parse(localStorage.getItem("monthly_budget")) || {};
    }

    function calculateStatistics() {
        if (!currentYearMonth) return;

        const [yearStr, monthStr] = currentYearMonth.split("-");
        const targetYear = Number(yearStr);
        const targetMonth = Number(monthStr) - 1;

        let income = 0;
        let expense = 0;

        transactions.forEach((transaction) => {
            if (!isSameMonth(transaction.time, targetYear, targetMonth)) return;

            const amount = Number(transaction.amount) || 0;

            if (transaction.type === "expense") {
                expense += amount;
            } else if (transaction.type === "income") {
                income += amount;
            }
        });

        statistics = {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense
        };
    }

    function setMonth(newMonth) {
        currentYearMonth = newMonth;
        calculateStatistics();
        render();
    }

    function render() {
        renderMonthPicker();
        renderStats();
        renderMonthlyBudgetCard();
        renderTodayCard();
    }

    function renderMonthPicker() {
        if (DOM.monthPicker) {
            DOM.monthPicker.value = currentYearMonth;
        }
        if (DOM.monthPickerText) {
            DOM.monthPickerText.textContent = formatMonth(currentYearMonth);
        }
    }

    function renderStats() {
        if (DOM.totalIncome) {
            DOM.totalIncome.textContent = formatCurrency(statistics.totalIncome);
        }
        if (DOM.totalExpense) {
            DOM.totalExpense.textContent = formatCurrency(statistics.totalExpense);
        }
        if (DOM.balance) {
            DOM.balance.textContent = formatCurrency(statistics.balance);
        }
    }

    function renderMonthlyBudgetCard() {
        if (DOM.monthlyBudgetTitle) {
            DOM.monthlyBudgetTitle.textContent = `Ngân sách ${formatMonth(currentYearMonth).toLowerCase()}`;
        }

        if (!DOM.monthlyBudgetList) return;

        const budgetCategories = monthlyBudgetStore[currentYearMonth]?.categories || [];

        if (budgetCategories.length === 0) {
            DOM.monthlyBudgetList.innerHTML = `<div class="text-muted small py-3">Chưa thiết lập ngân sách tháng này.</div>`;
            return;
        }

        const [yearStr, monthStr] = currentYearMonth.split("-");
        const targetYear = Number(yearStr);
        const targetMonth = Number(monthStr) - 1;

        DOM.monthlyBudgetList.innerHTML = budgetCategories.map((budgetCat) => {
            const info = resolveCategory(budgetCat.id);
            const budgetAmount = Number(budgetCat.amount) || 0;

            const spent = transactions.reduce((sum, t) => {
                if (t.type !== "expense" || String(t.category) !== String(budgetCat.id)) return sum;
                if (!isSameMonth(t.time, targetYear, targetMonth)) return sum;
                return sum + (Number(t.amount) || 0);
            }, 0);

            const percent = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
            const isExceeded = spent > budgetAmount;
            const barColor = isExceeded ? "bg-danger" : "bg-success";
            const textColor = isExceeded ? "text-danger" : "text-success";

            return `
                <div class="budget-item">
                    <div class="budget-icon bg-${info.color}-subtle text-${info.color}">
                        <i class="bi bi-${info.icon}"></i>
                    </div>
                    <span class="budget-name">${info.name}</span>
                    <div class="progress budget-progress">
                        <div class="progress-bar ${barColor}" style="width: ${Math.min(percent, 100)}%"></div>
                    </div>
                    <span class="budget-money">${formatCurrency(spent)} / ${formatCurrency(budgetAmount)}</span>
                    <span class="budget-percent ${textColor}">${percent}%</span>
                </div>
            `;
        }).join("");
    }

    function renderTodayCard() {
        const profile = JSON.parse(localStorage.getItem("profile")) || {};
        const dailyBudget = Number(profile.dailyBudget) || 0;

        const todayExpenses = transactions.filter(t => t.type === "expense" && !t.monthly && isToday(t.time));
        const spentToday = todayExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const remain = dailyBudget - spentToday;
        const percent = dailyBudget > 0 ? Math.round((spentToday / dailyBudget) * 100) : 0;
        const isExceeded = spentToday > dailyBudget;

        if (DOM.todayBudgetValue) DOM.todayBudgetValue.textContent = formatCurrency(dailyBudget);
        if (DOM.todaySpentValue) DOM.todaySpentValue.textContent = formatCurrency(spentToday);
        if (DOM.todayRemainValue) DOM.todayRemainValue.textContent = formatCurrency(remain);
        if (DOM.todayProgressPercent) DOM.todayProgressPercent.textContent = `${percent}%`;
        if (DOM.todayProgressBar) {
            DOM.todayProgressBar.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
            DOM.todayProgressBar.classList.toggle("bg-danger", isExceeded);
            DOM.todayProgressBar.classList.toggle("bg-success", !isExceeded);
        }

        if (!DOM.todayDetailsList) return;

        if (todayExpenses.length === 0) {
            DOM.todayDetailsList.innerHTML = `<div class="text-muted small">Chưa có chi tiêu hôm nay.</div>`;
            return;
        }

        const totalsByCategory = {};
        todayExpenses.forEach((t) => {
            const key = String(t.category);
            totalsByCategory[key] = (totalsByCategory[key] || 0) + (Number(t.amount) || 0);
        });

        const sorted = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 3);
        const restTotal = sorted.slice(3).reduce((sum, [, amount]) => sum + amount, 0);

        let html = top.map(([catId, amount]) => `
            <div>
                <span>${resolveCategory(catId).name}</span>
                <strong>${formatCurrency(amount)}</strong>
            </div>
        `).join("");

        if (restTotal > 0) {
            html += `
                <div>
                    <span>Khác</span>
                    <strong>${formatCurrency(restTotal)}</strong>
                </div>
            `;
        }

        DOM.todayDetailsList.innerHTML = html;
    }

    function bindEvents() {
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
    }

    function init() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const defaultMonth = `${year}-${month}`;

        cacheDOM();

        if (DOM.monthPicker) {
            DOM.monthPicker.max = defaultMonth;
        }

        currentYearMonth = defaultMonth;
        loadData();
        calculateStatistics();
        bindEvents();
        render();
    }

    return {
        init,
        refresh: () => {
            loadData();
            calculateStatistics();
            render();
        }
    };
})();

document.addEventListener("DOMContentLoaded", function () {
    Dashboard.init();
});
