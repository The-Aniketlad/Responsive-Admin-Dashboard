(function() {
    const menuBtn = document.querySelector('#menu-btn');
    const closeBtn = document.querySelector('#close-btn');
    const body = document.body;
    const themeToggle = document.querySelector('#theme-toggle');

    function setupSidebar() {
        const sidebarToggleCheckbox = document.querySelector('#sidebar-toggle-checkbox');
        const sidebarToggleBtn = document.querySelector('#sidebar-toggle-btn');
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        // Restore collapsed state from localStorage (Desktop)
        // Note: checked = Expanded (displays Cross X)
        //       unchecked = Collapsed (displays Hamburger ☰)
        const isCollapsedSaved = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsedSaved && window.innerWidth > 768) {
            body.classList.add('collapsed-sidebar');
            if (sidebarToggleCheckbox) sidebarToggleCheckbox.checked = false; // Unchecked shows Hamburger (to open!)
            if (sidebarToggleBtn) sidebarToggleBtn.setAttribute('title', 'Expand sidebar');
        } else {
            body.classList.remove('collapsed-sidebar');
            if (sidebarToggleCheckbox) sidebarToggleCheckbox.checked = true; // Checked shows Cross (to close!)
            if (sidebarToggleBtn) sidebarToggleBtn.setAttribute('title', 'Collapse sidebar');
        }

        // Animated Hamburger Toggle Checkbox
        if (sidebarToggleCheckbox) {
            sidebarToggleCheckbox.addEventListener('change', () => {
                // When user unchecks -> collapse sidebar (and show hamburger)
                // When user checks -> expand sidebar (and show cross)
                const isNowCollapsed = !sidebarToggleCheckbox.checked;
                body.classList.toggle('collapsed-sidebar', isNowCollapsed);
                localStorage.setItem('sidebar_collapsed', isNowCollapsed);
                if (sidebarToggleBtn) {
                    sidebarToggleBtn.setAttribute('title', isNowCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
                }
            });
        }

        // Mobile drawer toggle
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                body.classList.add('show-sidebar');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                body.classList.remove('show-sidebar');
            });
        }

        // Close mobile drawer on outside click
        document.addEventListener('click', (e) => {
            const aside = document.querySelector('#sidebar-aside');
            if (body.classList.contains('show-sidebar') && aside && !aside.contains(e.target) && !menuBtn.contains(e.target)) {
                body.classList.remove('show-sidebar');
            }
        });

        // Interactive tab switching
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Auto-close drawer on mobile upon clicking a link
                if (window.innerWidth <= 768) {
                    body.classList.remove('show-sidebar');
                }
            });
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

    let currentOrders = typeof Orders !== 'undefined' ? [...Orders] : [];
    let sortColumn = null;
    let sortDirection = 'asc'; // 'asc' | 'desc'

    function renderOrdersTable(orders = currentOrders) {
        const tableBody = document.querySelector('#recent-orders-table tbody') || document.querySelector('table tbody');
        const countBadge = document.getElementById('order-count-badge');
        const footerInfo = document.getElementById('table-footer-info');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        const totalAvailable = typeof Orders !== 'undefined' ? Orders.length : orders.length;

        if (countBadge) {
            countBadge.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''}`;
        }
        if (footerInfo) {
            footerInfo.textContent = `Showing ${orders.length} of ${totalAvailable} orders`;
        }

        if (orders.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'table-empty-row';
            tr.innerHTML = `
                <td colspan="5">
                    <div class="table-empty-state">
                        <span class="material-symbols-sharp">search_off</span>
                        <p>No orders found matching your search</p>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
            return;
        }

        orders.forEach(order => {
            const tr = document.createElement('tr');

            // Shipping status badge with icon (Untitled UI BadgeWithIcon)
            let statusBadge = '';
            if (order.shipping === 'Delivered') {
                statusBadge = `
                    <span class="status-badge delivered">
                        <span class="material-symbols-sharp">check</span>
                        <span>Delivered</span>
                    </span>
                `;
            } else if (order.shipping === 'Pending') {
                statusBadge = `
                    <span class="status-badge pending">
                        <span class="material-symbols-sharp">schedule</span>
                        <span>Pending</span>
                    </span>
                `;
            } else {
                statusBadge = `
                    <span class="status-badge declined">
                        <span class="material-symbols-sharp">close</span>
                        <span>Declined</span>
                    </span>
                `;
            }

            // Payment pill
            const payLower = (order.paymentStatus || '').toLowerCase();
            const paymentBadge = `<span class="payment-badge ${payLower}">${order.paymentStatus}</span>`;

            tr.innerHTML = `
                <td>
                    <div class="product-cell">
                        <span class="product-icon">
                            <span class="material-symbols-sharp">flight_takeoff</span>
                        </span>
                        <span>${order.productName}</span>
                    </div>
                </td>
                <td class="number-cell">#${order.productNumber}</td>
                <td>${paymentBadge}</td>
                <td>${statusBadge}</td>
                <td class="text-right">
                    <div class="table-actions">
                        <button type="button" class="btn-action-details" title="View order details">
                            <span>Details</span>
                            <span class="material-symbols-sharp" style="font-size: 0.95rem;">chevron_right</span>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function populateOrdersTable(orders = currentOrders) {
        renderOrdersTable(orders);
    }

    function setupTableSorting() {
        const headers = document.querySelectorAll('#recent-orders-table thead th.sortable');
        headers.forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.column;
                if (!col) return;

                if (sortColumn === col) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = col;
                    sortDirection = 'asc';
                }

                // Update header icons and classes
                headers.forEach(h => {
                    h.classList.remove('sorted-asc', 'sorted-desc');
                    const icon = h.querySelector('.sort-icon');
                    if (icon) icon.textContent = 'unfold_more';
                });

                th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                const activeIcon = th.querySelector('.sort-icon');
                if (activeIcon) {
                    activeIcon.textContent = sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
                }

                // Sort current orders
                currentOrders.sort((a, b) => {
                    let first = a[sortColumn] || '';
                    let second = b[sortColumn] || '';

                    // Numerical comparison for productNumber
                    if (sortColumn === 'productNumber') {
                        const numA = parseInt(first, 10) || 0;
                        const numB = parseInt(second, 10) || 0;
                        return sortDirection === 'desc' ? numB - numA : numA - numB;
                    }

                    // String comparison
                    const cmp = String(first).localeCompare(String(second));
                    return sortDirection === 'desc' ? -cmp : cmp;
                });

                renderOrdersTable(currentOrders);
            });
        });
    }

    function setupOrderSearch() {
        const searchInput = document.getElementById('order-search');
        const clearBtn = document.getElementById('search-clear-btn');
        if (!searchInput) return;

        const handleSearch = () => {
            const term = searchInput.value.trim().toLowerCase();
            if (clearBtn) {
                clearBtn.style.display = term ? 'flex' : 'none';
            }

            const baseList = typeof Orders !== 'undefined' ? Orders : [];
            currentOrders = baseList.filter(order =>
                order.productName.toLowerCase().includes(term) ||
                order.productNumber.toLowerCase().includes(term) ||
                order.paymentStatus.toLowerCase().includes(term) ||
                order.shipping.toLowerCase().includes(term)
            );

            // Re-apply sort if active
            if (sortColumn) {
                currentOrders.sort((a, b) => {
                    let first = a[sortColumn] || '';
                    let second = b[sortColumn] || '';
                    if (sortColumn === 'productNumber') {
                        const numA = parseInt(first, 10) || 0;
                        const numB = parseInt(second, 10) || 0;
                        return sortDirection === 'desc' ? numB - numA : numA - numB;
                    }
                    const cmp = String(first).localeCompare(String(second));
                    return sortDirection === 'desc' ? -cmp : cmp;
                });
            }

            renderOrdersTable(currentOrders);
        };

        searchInput.addEventListener('input', handleSearch);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                handleSearch();
                searchInput.focus();
            });
        }
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
        today.setHours(0, 0, 0, 0);
        let selectedDate = new Date(); // Default selected today
        selectedDate.setHours(0, 0, 0, 0);
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

            // Restrict forward navigation to future months
            const isCurrentOrFutureMonth = (
                currentYear > today.getFullYear() ||
                (currentYear === today.getFullYear() && currentMonth >= today.getMonth())
            );

            if (isCurrentOrFutureMonth) {
                nextBtn.disabled = true;
                nextBtn.classList.add('disabled');
                nextBtn.setAttribute('aria-disabled', 'true');
            } else {
                nextBtn.disabled = false;
                nextBtn.classList.remove('disabled');
                nextBtn.removeAttribute('aria-disabled');
            }

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

                let prevM = currentMonth - 1;
                let prevY = currentYear;
                if (prevM < 0) {
                    prevM = 11;
                    prevY--;
                }
                const prevCellDate = new Date(prevY, prevM, dayNum);
                prevCellDate.setHours(0, 0, 0, 0);
                const isFuture = prevCellDate.getTime() > today.getTime();

                if (isFuture) {
                    btn.classList.add('disabled', 'future-day');
                    btn.disabled = true;
                    btn.setAttribute('aria-disabled', 'true');
                } else {
                    btn.addEventListener('click', () => {
                        currentMonth = prevM;
                        currentYear = prevY;
                        selectedDate = new Date(currentYear, currentMonth, dayNum);
                        selectedDate.setHours(0, 0, 0, 0);
                        valueSpan.textContent = formatDate(selectedDate);
                        renderCalendar();
                        setTimeout(() => togglePopover(false), 150);
                    });
                }
                daysContainer.appendChild(btn);
            }

            // Current Month Days
            for (let day = 1; day <= totalDaysCurrent; day++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'calendar-day-btn';
                btn.textContent = day;

                const cellDate = new Date(currentYear, currentMonth, day);
                cellDate.setHours(0, 0, 0, 0);
                const isFuture = cellDate.getTime() > today.getTime();

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

                if (isFuture) {
                    btn.classList.add('disabled', 'future-day');
                    btn.disabled = true;
                    btn.setAttribute('aria-disabled', 'true');
                    btn.title = "Future dates cannot be selected";
                } else {
                    btn.addEventListener('click', () => {
                        selectedDate = new Date(currentYear, currentMonth, day);
                        selectedDate.setHours(0, 0, 0, 0);
                        valueSpan.textContent = formatDate(selectedDate);
                        renderCalendar();
                        setTimeout(() => togglePopover(false), 150);
                    });
                }

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

                let nextM = currentMonth + 1;
                let nextY = currentYear;
                if (nextM > 11) {
                    nextM = 0;
                    nextY++;
                }
                const nextCellDate = new Date(nextY, nextM, nextDay);
                nextCellDate.setHours(0, 0, 0, 0);
                const isFuture = nextCellDate.getTime() > today.getTime();

                if (isFuture) {
                    btn.classList.add('disabled', 'future-day');
                    btn.disabled = true;
                    btn.setAttribute('aria-disabled', 'true');
                } else {
                    btn.addEventListener('click', () => {
                        currentMonth = nextM;
                        currentYear = nextY;
                        selectedDate = new Date(currentYear, currentMonth, nextDay);
                        selectedDate.setHours(0, 0, 0, 0);
                        valueSpan.textContent = formatDate(selectedDate);
                        renderCalendar();
                        setTimeout(() => togglePopover(false), 150);
                    });
                }
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
            if (nextBtn.disabled) return;
            const canGoNext = (
                currentYear < today.getFullYear() ||
                (currentYear === today.getFullYear() && currentMonth < today.getMonth())
            );
            if (!canGoNext) return;
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

    function setupExpenseChart() {
        const canvas = document.getElementById('balanceChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        const chartGlow = document.getElementById('chart-glow');
        const chartSwitch = document.getElementById('chart-switch');
        const timeTabs = document.getElementById('time-tabs');
        const amountEl = document.getElementById('expense-amount');
        const changeEl = document.getElementById('expense-change');

        let chartType = 'bar';
        let currentTimeframe = '1M';

        const isDark = () => document.body.classList.contains('dark-theme-variables');

        const getColors = () => {
            const dark = isDark();
            return {
                barDefault: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(132, 139, 200, 0.28)',
                barHighlight: '#ff7782',
                barHover: dark ? '#ff9aa2' : '#ff5463',
                pieShades: [
                    'rgba(255, 119, 130, 0.95)',
                    'rgba(115, 128, 236, 0.9)',
                    'rgba(65, 241, 182, 0.9)',
                    'rgba(255, 187, 85, 0.9)',
                    'rgba(17, 30, 136, 0.85)',
                    'rgba(125, 141, 161, 0.85)'
                ]
            };
        };

        const dataSets = {
            '1W': { 
                amount: '$3,840',
                change: '+8.4%',
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 
                data: [45, 52, 38, 65, 73, 48, 55],
                highlight: 4
            },
            '1M': { 
                amount: '$14,160',
                change: '+14.2%',
                labels: Array.from({length: 12}, (_, i) => `D${i * 2 + 2}`),
                data: [35, 42, 28, 55, 40, 68, 48, 82, 65, 50, 38, 45],
                highlight: 7
            },
            '6M': { 
                amount: '$84,520',
                change: '+18.6%',
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [320, 410, 280, 550, 480, 620],
                highlight: 3
            },
            '1Y': { 
                amount: '$168,200',
                change: '+22.4%',
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                data: [380, 460, 520, 440],
                highlight: 2
            },
            'ALL': { 
                amount: '$542,000',
                change: '+31.8%',
                labels: ['2023', '2024', '2025', '2026'],
                data: [2800, 3900, 4800, 5200],
                highlight: 3
            }
        };

        const getBarColors = (len, highlightIdx) => {
            const { barDefault, barHighlight } = getColors();
            return Array.from({length: len}, (_, i) => i === highlightIdx ? barHighlight : barDefault);
        };

        const initial = dataSets[currentTimeframe];
        let barColors = getBarColors(initial.data.length, initial.highlight);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: initial.labels,
                datasets: [{
                    data: initial.data,
                    backgroundColor: barColors,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.65,
                    categoryPercentage: 0.85,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: isDark() ? 'rgba(32, 37, 40, 0.95)' : 'rgba(54, 57, 73, 0.95)',
                        titleColor: '#dce1eb',
                        bodyColor: '#ffffff',
                        bodyFont: { size: 12, weight: 'bold' },
                        padding: 8,
                        displayColors: false,
                        cornerRadius: 8,
                        callbacks: {
                            title: (items) => items[0].label,
                            label: (item) => `$${item.raw.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: { display: false, beginAtZero: true }
                },
                onHover: (event, elements) => {
                    if (chartType !== 'bar') return;
                    const { barHover } = getColors();
                    const colors = [...barColors];
                    if (elements.length > 0) {
                        colors[elements[0].index] = barHover;
                    }
                    chart.data.datasets[0].backgroundColor = colors;
                    chart.update('none');
                }
            }
        });

        // Mouse follow glow effect
        if (canvas.parentElement) {
            canvas.parentElement.addEventListener('mousemove', (e) => {
                if (chartType !== 'bar' || !chartGlow) return;
                const rect = canvas.parentElement.getBoundingClientRect();
                const x = e.clientX - rect.left;
                chartGlow.style.left = `${x}px`;
                chartGlow.style.opacity = '1';
            });

            canvas.parentElement.addEventListener('mouseleave', () => {
                if (chartGlow) chartGlow.style.opacity = '0';
                if (chartType === 'bar') {
                    chart.data.datasets[0].backgroundColor = barColors;
                    chart.update('none');
                }
            });
        }

        // Toggle Switch: Bar vs Doughnut
        if (chartSwitch) {
            chartSwitch.addEventListener('click', () => {
                chartSwitch.classList.toggle('active');
                const isDoughnut = chartSwitch.classList.contains('active');
                chartType = isDoughnut ? 'doughnut' : 'bar';

                canvas.classList.add('chart-transitioning');
                setTimeout(() => {
                    chart.config.type = chartType;
                    const { pieShades } = getColors();

                    if (chartType === 'doughnut') {
                        chart.data.datasets[0].backgroundColor = pieShades.slice(0, chart.data.labels.length);
                        if (chartGlow) chartGlow.style.opacity = '0';
                    } else {
                        chart.data.datasets[0].backgroundColor = barColors;
                    }

                    chart.update();
                    setTimeout(() => canvas.classList.remove('chart-transitioning'), 180);
                }, 180);
            });
        }

        // Timeframe selector tabs
        if (timeTabs) {
            timeTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn || !btn.dataset.time || btn.dataset.time === currentTimeframe) return;

                currentTimeframe = btn.dataset.time;
                timeTabs.querySelectorAll('.time-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                canvas.classList.add('chart-transitioning');
                setTimeout(() => {
                    const currentData = dataSets[currentTimeframe];
                    if (amountEl) amountEl.textContent = currentData.amount;
                    if (changeEl) {
                        const span = changeEl.querySelector('span:last-child');
                        if (span) span.textContent = currentData.change;
                    }

                    barColors = getBarColors(currentData.data.length, currentData.highlight);
                    const { pieShades } = getColors();

                    chart.data.labels = currentData.labels;
                    chart.data.datasets[0].data = currentData.data;
                    chart.data.datasets[0].backgroundColor = chartType === 'bar' ? barColors : pieShades.slice(0, currentData.data.length);
                    chart.update();

                    canvas.classList.remove('chart-transitioning');
                }, 180);
            });
        }

        // React to Theme Toggle
        const themeToggleEl = document.querySelector('#theme-toggle');
        if (themeToggleEl) {
            themeToggleEl.addEventListener('change', () => {
                setTimeout(() => {
                    const cur = dataSets[currentTimeframe];
                    barColors = getBarColors(cur.data.length, cur.highlight);
                    const { pieShades } = getColors();
                    chart.data.datasets[0].backgroundColor = chartType === 'bar' ? barColors : pieShades.slice(0, cur.data.length);
                    chart.options.plugins.tooltip.backgroundColor = isDark() ? 'rgba(32, 37, 40, 0.95)' : 'rgba(54, 57, 73, 0.95)';
                    chart.update();
                }, 50);
            });
        }
    }

    function setupSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        const timeTabs = document.getElementById('sales-time-tabs');
        const amountEl = document.getElementById('sales-amount');
        const changeEl = document.getElementById('sales-change');
        const statDateEl = document.getElementById('sales-stat-date');
        const statValEl = document.getElementById('sales-stat-val');

        let currentTimeframe = '1M';
        const isDark = () => document.body.classList.contains('dark-theme-variables');

        function createGradient() {
            const grad = ctx.createLinearGradient(0, 0, 0, 125);
            grad.addColorStop(0, 'rgba(115, 128, 236, 0.45)');
            grad.addColorStop(1, 'rgba(115, 128, 236, 0.02)');
            return grad;
        }

        const dataSets = {
            '1M': {
                amount: '$25,024',
                change: '+18.4%',
                statDate: 'Jun 21',
                statVal: '$840.50',
                labels: ['Jun 1', 'Jun 6', 'Jun 11', 'Jun 16', 'Jun 21', 'Jun 26', 'Jun 30'],
                data: [18500, 19800, 21200, 22600, 24100, 24650, 25024]
            },
            '3M': {
                amount: '$72,450',
                change: '+14.8%',
                statDate: 'May 15',
                statVal: '$2,410.00',
                labels: ['Apr', 'May', 'Jun'],
                data: [21000, 24500, 26950]
            },
            '6M': {
                amount: '$142,800',
                change: '+21.2%',
                statDate: 'Mar 30',
                statVal: '$4,820.00',
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [19000, 21500, 23200, 25000, 26300, 27800]
            },
            '1Y': {
                amount: '$285,600',
                change: '+28.5%',
                statDate: 'Q3',
                statVal: '$74,500.00',
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                data: [62000, 69000, 74500, 80100]
            },
            'ALL': {
                amount: '$894,000',
                change: '+39.1%',
                statDate: '2025',
                statVal: '$260,000.00',
                labels: ['2023', '2024', '2025', '2026'],
                data: [180000, 220000, 244000, 250000]
            }
        };

        const initial = dataSets[currentTimeframe];

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: initial.labels,
                datasets: [{
                    label: 'Sales',
                    data: initial.data,
                    borderColor: '#7380ec',
                    backgroundColor: createGradient(),
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointBackgroundColor: '#7380ec',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: isDark() ? 'rgba(32, 37, 40, 0.95)' : 'rgba(54, 57, 73, 0.95)',
                        titleColor: '#dce1eb',
                        bodyColor: '#ffffff',
                        bodyFont: { size: 12, weight: 'bold' },
                        padding: 8,
                        displayColors: false,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                if (statValEl) statValEl.textContent = `$${context.parsed.y.toLocaleString()}`;
                                if (statDateEl) statDateEl.textContent = context.label;
                                return `$${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false,
                        grid: { display: false }
                    },
                    y: {
                        display: false,
                        grid: { display: false },
                        beginAtZero: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        // Reset stat values on mouseleave
        canvas.addEventListener('mouseleave', () => {
            const cur = dataSets[currentTimeframe];
            if (statDateEl) statDateEl.textContent = cur.statDate;
            if (statValEl) statValEl.textContent = cur.statVal;
        });

        // Timeframe selector tabs
        if (timeTabs) {
            timeTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn || !btn.dataset.time || btn.dataset.time === currentTimeframe) return;

                currentTimeframe = btn.dataset.time;
                timeTabs.querySelectorAll('.sales-time-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const currentData = dataSets[currentTimeframe];
                if (amountEl) amountEl.textContent = currentData.amount;
                if (changeEl) {
                    const span = changeEl.querySelector('span:last-child');
                    if (span) span.textContent = currentData.change;
                }
                if (statDateEl) statDateEl.textContent = currentData.statDate;
                if (statValEl) statValEl.textContent = currentData.statVal;

                chart.data.labels = currentData.labels;
                chart.data.datasets[0].data = currentData.data;
                chart.data.datasets[0].backgroundColor = createGradient();
                chart.update();
            });
        }

        // Theme Toggle reaction
        const themeToggleEl = document.querySelector('#theme-toggle');
        if (themeToggleEl) {
            themeToggleEl.addEventListener('change', () => {
                setTimeout(() => {
                    chart.data.datasets[0].backgroundColor = createGradient();
                    chart.options.plugins.tooltip.backgroundColor = isDark() ? 'rgba(32, 37, 40, 0.95)' : 'rgba(54, 57, 73, 0.95)';
                    chart.update();
                }, 50);
            });
        }
    }

    function setupIncomeChart() {
        const canvas = document.getElementById('incomeChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        const timeTabs = document.getElementById('income-time-tabs');
        const amountEl = document.getElementById('income-amount');
        const changeEl = document.getElementById('income-change');
        const percentEl = document.getElementById('income-center-percent');
        const subEl = document.getElementById('income-center-sub');

        const valReceivedEl = document.getElementById('val-received');
        const valPendingEl = document.getElementById('val-pending');
        const valProgressEl = document.getElementById('val-progress');
        const valRefundsEl = document.getElementById('val-refunds');
        const legendItems = document.querySelectorAll('.income-legend-item');

        let currentTimeframe = '1M';
        const isDark = () => document.body.classList.contains('dark-theme-variables');

        const dataSets = {
            '1M': {
                amount: '$10,864',
                change: '+24.8%',
                targetPercent: '68%',
                labels: ['Received', 'Pending', 'In Progress', 'Refunds'],
                data: [7388, 1955, 1086, 435],
                formatted: ['$7,388', '$1,955', '$1,086', '$435']
            },
            '3M': {
                amount: '$31,520',
                change: '+19.4%',
                targetPercent: '74%',
                labels: ['Received', 'Pending', 'In Progress', 'Refunds'],
                data: [23325, 4728, 2521, 946],
                formatted: ['$23,325', '$4,728', '$2,521', '$946']
            },
            '6M': {
                amount: '$68,400',
                change: '+22.1%',
                targetPercent: '81%',
                labels: ['Received', 'Pending', 'In Progress', 'Refunds'],
                data: [55404, 7524, 3830, 1642],
                formatted: ['$55,404', '$7,524', '$3,830', '$1,642']
            },
            '1Y': {
                amount: '$142,800',
                change: '+28.6%',
                targetPercent: '86%',
                labels: ['Received', 'Pending', 'In Progress', 'Refunds'],
                data: [122808, 11424, 6426, 2142],
                formatted: ['$122,808', '$11,424', '$6,426', '$2,142']
            },
            'ALL': {
                amount: '$428,000',
                change: '+35.2%',
                targetPercent: '92%',
                labels: ['Received', 'Pending', 'In Progress', 'Refunds'],
                data: [393760, 21400, 9416, 3424],
                formatted: ['$393,760', '$21,400', '$9,416', '$3,424']
            }
        };

        const sliceColors = ['#41f1b6', '#ffbb55', '#7380ec', '#ff7782'];
        const initial = dataSets[currentTimeframe];

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: initial.labels,
                datasets: [{
                    data: initial.data,
                    backgroundColor: sliceColors,
                    borderWidth: 0,
                    hoverOffset: 4,
                    spacing: 3,
                    borderRadius: 4
                }]
            },
            options: {
                cutout: '74%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: isDark() ? 'rgba(32, 37, 40, 0.95)' : 'rgba(54, 57, 73, 0.95)',
                        titleColor: '#dce1eb',
                        bodyColor: '#ffffff',
                        bodyFont: { size: 12, weight: 'bold' },
                        padding: 8,
                        displayColors: true,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const val = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = Math.round((val / total) * 100);
                                return ` ${context.label}: $${val.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                },
                onHover: (event, elements) => {
                    if (elements && elements.length > 0) {
                        const idx = elements[0].index;
                        const val = chart.data.datasets[0].data[idx];
                        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const pct = Math.round((val / total) * 100);
                        if (percentEl) percentEl.textContent = `${pct}%`;
                        if (subEl) subEl.textContent = dataSets[currentTimeframe].labels[idx];
                    }
                }
            }
        });

        // Reset center text on canvas mouseleave
        canvas.addEventListener('mouseleave', () => {
            const cur = dataSets[currentTimeframe];
            if (percentEl) percentEl.textContent = cur.targetPercent;
            if (subEl) subEl.textContent = 'Target';
        });

        // Interactive Legend Hover
        legendItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const idx = parseInt(item.dataset.index);
                if (isNaN(idx)) return;
                const val = chart.data.datasets[0].data[idx];
                const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const pct = Math.round((val / total) * 100);
                if (percentEl) percentEl.textContent = `${pct}%`;
                if (subEl) subEl.textContent = dataSets[currentTimeframe].labels[idx];
                chart.setActiveElements([{ datasetIndex: 0, index: idx }]);
                chart.tooltip.setActiveElements([{ datasetIndex: 0, index: idx }], { x: 0, y: 0 });
                chart.update();
            });

            item.addEventListener('mouseleave', () => {
                const cur = dataSets[currentTimeframe];
                if (percentEl) percentEl.textContent = cur.targetPercent;
                if (subEl) subEl.textContent = 'Target';
                chart.setActiveElements([]);
                chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                chart.update();
            });
        });

        function updateLegendValues(cur) {
            if (valReceivedEl) valReceivedEl.textContent = cur.formatted[0];
            if (valPendingEl) valPendingEl.textContent = cur.formatted[1];
            if (valProgressEl) valProgressEl.textContent = cur.formatted[2];
            if (valRefundsEl) valRefundsEl.textContent = cur.formatted[3];
        }

        // Timeframe selector tabs
        if (timeTabs) {
            timeTabs.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn || !btn.dataset.time || btn.dataset.time === currentTimeframe) return;

                currentTimeframe = btn.dataset.time;
                timeTabs.querySelectorAll('.income-time-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const cur = dataSets[currentTimeframe];
                if (amountEl) amountEl.textContent = cur.amount;
                if (changeEl) {
                    const span = changeEl.querySelector('span:last-child');
                    if (span) span.textContent = cur.change;
                }
                if (percentEl) percentEl.textContent = cur.targetPercent;
                if (subEl) subEl.textContent = 'Target';

                updateLegendValues(cur);

                chart.data.datasets[0].data = cur.data;
                chart.update();
            });
        }

        // React to theme switch
        const themeToggleEl = document.querySelector('#theme-toggle');
        if (themeToggleEl) {
            themeToggleEl.addEventListener('change', () => {
                setTimeout(() => {
                    chart.options.plugins.tooltip.backgroundColor = isDark() ? 'rgba(32, 37, 40, 0.95)' : 'rgba(54, 57, 73, 0.95)';
                    chart.update();
                }, 50);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupSidebar();
        setupThemeToggler();
        setupDatePicker();
        setupSalesChart();
        setupExpenseChart();
        setupIncomeChart();
        renderOrdersTable();
        setupTableSorting();
        setupOrderSearch();
    });
})();

