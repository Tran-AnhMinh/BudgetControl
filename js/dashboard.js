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

    let currentYearMonth = "";
    let transactions = [];
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
            balance: document.getElementById("balance")
        };
    }

    function loadTransactions() {
        try {
            transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            console.error("Lỗi đọc dữ liệu giao dịch:", e);
            transactions = [];
        }
    }

    function calculateStatistics() {
        if (!currentYearMonth) return;

        const [yearStr, monthStr] = currentYearMonth.split("-");
        const targetYear = Number(yearStr);
        const targetMonth = Number(monthStr) - 1;

        let income = 0;
        let expense = 0;

        transactions.forEach((transaction) => {
            const transactionDate = new Date(transaction.time);
            if (transactionDate.getFullYear() !== targetYear || transactionDate.getMonth() !== targetMonth) {
                return;
            }

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
        loadTransactions();
        calculateStatistics();
        bindEvents();
        render();
    }

    return {
        init,
        refresh: () => {
            loadTransactions();
            calculateStatistics();
            render();
        }
    };
})();

document.addEventListener("DOMContentLoaded", function () {
    Dashboard.init();
});