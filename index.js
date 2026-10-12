(function() {
    const menuBtn = document.querySelector('#menu-btn');
    const closeBtn = document.querySelector('#close-btn');
    const body = document.body;
    const themeToggler = document.querySelector(".theme-toggler");

    function setupSidebar() {
        menuBtn.addEventListener('click', () => {
            body.classList.add('show-sidebar');
        });

        closeBtn.addEventListener('click', () => {
            body.classList.remove('show-sidebar');
        });
    }

    function setupThemeToggler() {
        themeToggler.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme-variables');
            document.getElementById('light-mode-icon').classList.toggle('active');
            document.getElementById('dark-mode-icon').classList.toggle('active');
        });
    }

    function populateOrdersTable(orders = Orders) {
        const tableBody = document.querySelector('table tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        orders.forEach(order => {
            const tr = document.createElement('tr');
            const trContent = `
                <td>${order.productName}</td>
                <td>${order.productNumber}</td>
                <td>${order.paymentStatus}</td>
                <td class="${order.shipping === 'Declined' ? 'danger' : order.shipping === 'Pending' ? 'warning' : 'primary'}">${order.shipping}</td>
                <td class="primary">Details</td>
            `;
            tr.innerHTML = trContent;
            tableBody.appendChild(tr);
        });
    }

    function updateProgressCircles() {
        const circles = document.querySelectorAll('.progress svg circle');
        circles.forEach(circle => {
            const radius = circle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            const p = circle.closest('.progress').querySelector('p').textContent;
            const percent = parseInt(p.replace('%', ''));
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
        });
    }

    function setupOrderSearch() {
        const searchInput = document.getElementById('order-search');
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredOrders = Orders.filter(order =>
                order.productName.toLowerCase().includes(searchTerm)
            );
            populateOrdersTable(filteredOrders);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupSidebar();
        setupThemeToggler();
        populateOrdersTable();
        updateProgressCircles();
        setupOrderSearch();
    });
})();

