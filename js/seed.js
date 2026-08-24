function generateMockData() {
    // Hàm phụ trợ sinh số nguyên ngẫu nhiên
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Lấy danh mục từ localStorage
    // Nếu chưa có thì dùng dữ liệu mặc định
    const savedCategories = JSON.parse(
        localStorage.getItem('categories')
    ) || [
            { id: 1, name: 'Ăn uống' },
            { id: 2, name: 'Lương' },
            { id: 3, name: 'Mua sắm' }
        ];

    // Lấy tài khoản từ localStorage
    // Nếu chưa có thì dùng dữ liệu mặc định
    const savedAccounts = JSON.parse(
        localStorage.getItem('accounts')
    ) || [
            { id: 1, name: 'Tiền mặt' },
            { id: 2, name: 'Thẻ ATM' }
        ];

    const newMockTransactions = [];

    // Tạo 60 giao dịch
    for (let i = 0; i < 60; i++) {

        // 70% chi, 30% thu
        const isExpense = Math.random() > 0.3;

        const typeStr = isExpense
            ? 'expense'
            : 'income';

        // Random danh mục
        const randomCategory =
            savedCategories[
                getRandomInt(0, savedCategories.length - 1)
            ].id;

        // Random tài khoản
        const randomAccount =
            savedAccounts[
                getRandomInt(0, savedAccounts.length - 1)
            ].id;

        // Random số tiền
        // Chi: 50.000 - 2.000.000
        // Thu: 5.000.000 - 50.000.000
        const amountVal = isExpense
            ? getRandomInt(5, 200) * 10000
            : getRandomInt(50, 500) * 100000;

        // Random thời gian trong 60 ngày gần nhất
        const randomDaysAgo = getRandomInt(0, 60);

        const date = new Date();

        date.setDate(
            date.getDate() - randomDaysAgo
        );

        // Random giờ từ 7h -> 22h
        date.setHours(
            getRandomInt(7, 22),
            getRandomInt(0, 59),
            0,
            0
        );

        const newTransaction = {
            time: date.toISOString(),

            type: typeStr,

            category: randomCategory,

            detail: `Mô tả tự động #${getRandomInt(1000, 9999)}`,

            account: randomAccount,

            amount: amountVal,

            // 20% khả năng là giao dịch hàng tháng
            monthly: Math.random() > 0.8
        };

        newMockTransactions.push(newTransaction);
    }

    // Thêm dữ liệu mới vào transactions hiện tại
    transactions.push(...newMockTransactions);

    // Sắp xếp mới nhất -> cũ nhất
    transactions.sort(
        (a, b) => new Date(b.time) - new Date(a.time)
    );

    // Lưu lại localStorage
    localStorage.setItem(
        'transactions',
        JSON.stringify(transactions)
    );

    // Render lại bảng
    if (typeof renderTable === 'function') {
        renderTable();
    }

    alert('Đã tạo thành công 60 giao dịch mẫu!');
}


// Bắt sự kiện click
document.addEventListener('DOMContentLoaded', () => {

    const btnGenerate =
        document.getElementById('btn-auto-generate');

    if (btnGenerate) {
        btnGenerate.addEventListener(
            'click',
            generateMockData
        );
    }

});