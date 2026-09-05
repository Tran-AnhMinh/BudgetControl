function safeParseStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        localStorage.removeItem(key);
        return [];
    }
}

let transactions = safeParseStorage('transactions');
let categories = safeParseStorage('categories');
let accounts = safeParseStorage('accounts');

// if (localStorage.getItem('transactions') === null) {
//     localStorage.setItem('transactions', JSON.stringify([]));
// }
// if (localStorage.getItem('categories') === null) {
//     localStorage.setItem('categories', JSON.stringify([]));
// }
// if (localStorage.getItem('accounts') === null) {
//     localStorage.setItem('accounts', JSON.stringify([]));
// }

let indexTransInUse = 0;
transactions.sort((a, b) => new Date(b.time) - new Date(a.time));

let sortOrders = {
    date: 1,
    type: 1,
    category: 1,
    account: 1,
    amount: 1,
    frequency: 1
};

let currentSortColumn = 'date';
document.addEventListener('DOMContentLoaded', function () {
    updateCategorySelect();
    updateAccountSelect();
    renderTable();

    const dateFilter = document.getElementById('table-sort-date');
    if (dateFilter) {
        flatpickr(dateFilter, {
            mode: "range",
            dateFormat: "d/m/Y",
            placeholder: "Chọn ngày",
            locale: {
                rangeSeparator: " - "
            },
            onChange: function (selectedDates, dateStr, instance) {
                if (typeof renderTable === 'function') {
                    renderTable();
                }
            }
        });
    }
});
