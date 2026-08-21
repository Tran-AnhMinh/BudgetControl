function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}
/**Header calendar pick */
const monthPickerBtn = document.getElementById("monthPickerBtn");
const monthPicker = document.getElementById("monthPicker");
const monthPickerText = document.getElementById("monthPickerText");

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");

const currentMonth = `${year}-${month}`;

monthPicker.max = currentMonth;
monthPicker.value = currentMonth;

function formatMonth(value) {
    const [year, month] = value.split("-");

    return `Tháng ${month}/${year}`;
}

monthPickerText.textContent = formatMonth(monthPicker.value);

monthPickerBtn.addEventListener("click", () => {
    monthPicker.showPicker();
});

monthPicker.addEventListener("change", () => {
    const value = monthPicker.value;

    if (!value) return;

    monthPickerText.textContent = formatMonth(value);

    const [year, month] = value.split("-");

    renderDashboard(Number(year), Number(month) - 1);
});



function renderDashboard() {
    const value = monthPicker.value;

    if (!value) return;

    const [year, month] = value.split("-");

    const statistics = getMonthlyStatistics(
        Number(year),
        Number(month) - 1,
    );

    document.getElementById("totalIncome").textContent = formatCurrency(
        statistics.totalIncome,
    );

    document.getElementById("totalExpense").textContent = formatCurrency(
        statistics.totalExpense,
    );

    document.getElementById("balance").textContent = formatCurrency(
        statistics.balance,
    );
}

function getTransactions() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

function getMonthlyStatistics(year, month) {
    const transactions = getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
        const date = new Date(transaction.time);
        if (date.getFullYear() != year || date.getMonth() !== month) {
            return;
        }

        const amount = Number(transaction.amount);

        if (transaction.type === "expense") {
            totalExpense += amount;
        } else if (transaction.type === "income") {
            totalIncome += amount;
        }
    });

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
    };
}

function initDashboard() {
    renderDashboard();
}

initDashboard();

