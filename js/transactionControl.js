let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
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
            onChange: function(selectedDates, dateStr, instance) {
                if (typeof renderTable === 'function') {
                    renderTable();
                }
            }
        });
    }
});
