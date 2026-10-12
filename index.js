(function() {
    const menuBtn = document.querySelector('#menu-btn');
    const closeBtn = document.querySelector('#close-btn');
    const body = document.body;
    const themeToggle = document.querySelector('#theme-toggle');

    function setupSidebar() {
        menuBtn.addEventListener('click', () => {
            body.classList.add('show-sidebar');
        });

        closeBtn.addEventListener('click', () => {
            body.classList.remove('show-sidebar');
        });
    }

    function setupThemeToggler() {
        if (!themeToggle) return;

        // Check saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme-variables');
            themeToggle.checked = true;
        }

        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('dark-theme-variables');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme-variables');
                localStorage.setItem('theme', 'light');
            }
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
        if (!searchInput) return;
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredOrders = Orders.filter(order =>
                order.productName.toLowerCase().includes(searchTerm)
            );
            populateOrdersTable(filteredOrders);
        });
    }

    function setupDatePicker() {
        const datepicker = document.getElementById('custom-datepicker');
        const trigger = document.getElementById('datepicker-trigger');
        const popover = document.getElementById('datepicker-popover');
        const valueSpan = document.getElementById('datepicker-value');
        const monthYearSpan = document.getElementById('calendar-month-year');
        const daysContainer = document.getElementById('calendar-days');
        const prevBtn = document.getElementById('prev-month-btn');
        const nextBtn = document.getElementById('next-month-btn');
        const todayBtn = document.getElementById('calendar-today-btn');
        const clearBtn = document.getElementById('calendar-clear-btn');

        if (!datepicker || !trigger || !popover) return;

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const shortMonths = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const today = new Date();
        let selectedDate = new Date(); // Default selected today
        let currentMonth = selectedDate.getMonth();
        let currentYear = selectedDate.getFullYear();

        function formatDate(d) {
            if (!d) return "Pick a date";
            return `${shortMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        }

        // Set initial trigger text
        valueSpan.textContent = formatDate(selectedDate);

        function togglePopover(show) {
            const isOpen = show !== undefined ? show : !popover.classList.contains('open');
            if (isOpen) {
                popover.classList.add('open');
                trigger.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            } else {
                popover.classList.remove('open');
                trigger.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        }

        function renderCalendar() {
            monthYearSpan.textContent = `${months[currentMonth]} ${currentYear}`;
            daysContainer.innerHTML = '';

            const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
            const totalDaysCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
            const totalDaysPrev = new Date(currentYear, currentMonth, 0).getDate();

            // Previous Month Days
            for (let i = firstDayIndex - 1; i >= 0; i--) {
                const dayNum = totalDaysPrev - i;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'calendar-day-btn other-month';
                btn.textContent = dayNum;
                btn.addEventListener('click', () => {
                    currentMonth--;
                    if (currentMonth < 0) {
                        currentMonth = 11;
                        currentYear--;
                    }
                    selectedDate = new Date(currentYear, currentMonth, dayNum);
                    valueSpan.textContent = formatDate(selectedDate);
                    renderCalendar();
                    setTimeout(() => togglePopover(false), 150);
                });
                daysContainer.appendChild(btn);
            }

            // Current Month Days
            for (let day = 1; day <= totalDaysCurrent; day++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'calendar-day-btn';
                btn.textContent = day;

                const isToday = (
                    day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear()
                );
                if (isToday) btn.classList.add('today');

                const isSelected = (
                    selectedDate &&
                    day === selectedDate.getDate() &&
                    currentMonth === selectedDate.getMonth() &&
                    currentYear === selectedDate.getFullYear()
                );
                if (isSelected) btn.classList.add('selected');

                btn.addEventListener('click', () => {
                    selectedDate = new Date(currentYear, currentMonth, day);
                    valueSpan.textContent = formatDate(selectedDate);
                    renderCalendar();
                    setTimeout(() => togglePopover(false), 150);
                });

                daysContainer.appendChild(btn);
            }

            // Next Month Days (pad out to complete the row)
            const totalRendered = firstDayIndex + totalDaysCurrent;
            const remaining = (7 - (totalRendered % 7)) % 7;
            for (let nextDay = 1; nextDay <= remaining; nextDay++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'calendar-day-btn other-month';
                btn.textContent = nextDay;
                btn.addEventListener('click', () => {
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;
                        currentYear++;
                    }
                    selectedDate = new Date(currentYear, currentMonth, nextDay);
                    valueSpan.textContent = formatDate(selectedDate);
                    renderCalendar();
                    setTimeout(() => togglePopover(false), 150);
                });
                daysContainer.appendChild(btn);
            }
        }

        // Trigger Click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePopover();
        });

        // Navigation
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });

        // Today button
        todayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedDate = new Date();
            currentMonth = selectedDate.getMonth();
            currentYear = selectedDate.getFullYear();
            valueSpan.textContent = formatDate(selectedDate);
            renderCalendar();
            setTimeout(() => togglePopover(false), 150);
        });

        // Clear button
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedDate = null;
            valueSpan.textContent = "Pick a date";
            renderCalendar();
            setTimeout(() => togglePopover(false), 150);
        });

        // Outside Click Dismiss
        document.addEventListener('click', (e) => {
            if (!datepicker.contains(e.target)) {
                togglePopover(false);
            }
        });

        // ESC Key Dismiss
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                togglePopover(false);
            }
        });

        // Initial render
        renderCalendar();
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupSidebar();
        setupThemeToggler();
        setupDatePicker();
        populateOrdersTable();
        updateProgressCircles();
        setupOrderSearch();
    });
})();

