(() => {
    'use strict';

    const BASE_URL =
        window.location.hostname === 'localhost' && window.location.port !== '8080'
            ? 'http://localhost:8080'
            : window.location.origin;

    const REPORT_TITLE = 'My Money My Budget Details';

    function getToken() {
        return localStorage.getItem('token');
    }

    async function apiFetch(path) {
        const response = await fetch(`${BASE_URL}${path}`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        let data = null;
        try {
            data = await response.json();
        } catch (_) {
            data = null;
        }

        if (!response.ok) {
            throw new Error(
                (data && (data.error || data.message)) ||
                `HTTP error ${response.status}`
            );
        }

        return data;
    }

    function currentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    function addMonths(ym, numberOfMonths) {
        const [year, month] = ym.split('-').map(Number);
        const date = new Date(year, month - 1 + numberOfMonths, 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    function monthLabel(ym) {
        if (!ym) return '';
        const [year, month] = String(ym).split('-').map(Number);
        if (!year || !month) return String(ym);
        return new Date(year, month - 1, 1).toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    function reportDateTime(date) {
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function moneyCents(value) {
        return Number(value || 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function moneyWhole(value) {
        return Math.round(Number(value || 0)).toLocaleString('en-US', {
            maximumFractionDigits: 0
        });
    }

    function yesNo(value) {
        return Number(value) ? 'Yes' : 'No';
    }

    function clearElement(element) {
        while (element.firstChild) element.removeChild(element.firstChild);
    }

    function makeElement(tag, options = {}) {
        const element = document.createElement(tag);
        if (options.className) element.className = options.className;
        if (options.text !== undefined) element.textContent = options.text;
        return element;
    }

    function createTable(headers, rows, options = {}) {
        const wrap = makeElement('div', { className: 'budget-details-table-wrap' });
        const table = makeElement('table', {
            className: `budget-details-table${options.compact ? ' compact' : ''}`
        });
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        headers.forEach(header => {
            headerRow.appendChild(makeElement('th', { text: header }));
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        if (!rows.length) {
            const row = document.createElement('tr');
            const cell = makeElement('td', { text: options.emptyText || 'No records.' });
            cell.colSpan = headers.length;
            cell.className = 'budget-details-empty';
            row.appendChild(cell);
            tbody.appendChild(row);
        } else {
            rows.forEach(rowData => {
                const row = document.createElement('tr');
                if (rowData.rowClass) row.className = rowData.rowClass;

                rowData.cells.forEach((cellData, index) => {
                    const cell = makeElement('td', {
                        text: cellData && typeof cellData === 'object'
                            ? cellData.text
                            : cellData
                    });
                    if (cellData && typeof cellData === 'object' && cellData.className) {
                        cell.className = cellData.className;
                    }
                    if (options.numericColumns && options.numericColumns.includes(index)) {
                        cell.classList.add('number-cell');
                    }
                    row.appendChild(cell);
                });

                tbody.appendChild(row);
            });
        }

        table.appendChild(tbody);

        if (options.totalRow) {
            const tfoot = document.createElement('tfoot');
            const totalRow = document.createElement('tr');
            totalRow.className = 'budget-details-total-row';

            options.totalRow.forEach((value, index) => {
                const cell = makeElement('td', { text: value });
                if (options.numericColumns && options.numericColumns.includes(index)) {
                    cell.classList.add('number-cell');
                }
                totalRow.appendChild(cell);
            });

            tfoot.appendChild(totalRow);
            table.appendChild(tfoot);
        }

        wrap.appendChild(table);
        return wrap;
    }

    function addSection(host, title, content, className = '') {
        const section = makeElement('section', {
            className: `budget-details-section ${className}`.trim()
        });
        section.appendChild(makeElement('h2', { text: title }));
        section.appendChild(content);
        host.appendChild(section);
        return section;
    }

    function renderMoneySection(host, data) {
        const rows = (data.records || []).map(record => ({
            cells: [record.AccountPocket || '', moneyCents(record.BalanceCurrent)]
        }));

        addSection(
            host,
            'MY MONEY — CURRENT ACCOUNTS',
            createTable(
                ['Account / Pocket', 'Balance Current'],
                rows,
                {
                    numericColumns: [1],
                    emptyText: 'No My Money accounts entered.',
                    totalRow: ['TOTAL MY MONEY', moneyCents(data.total)]
                }
            )
        );
    }

    function renderProjectionSection(host, summaryData) {
        const rows = (summaryData.summary || []).map(record => ({
            rowClass: record.MyMoneyShortage ? 'budget-details-shortage' : '',
            cells: [
                record.MonthLabel || monthLabel(record.Month),
                moneyCents(record.ProjectedMyMoney)
            ]
        }));

        addSection(
            host,
            'PROJECTED MY MONEY — CURRENT + 11 MONTHS',
            createTable(
                ['Month', 'Projected Balance of My Money'],
                rows,
                {
                    numericColumns: [1],
                    emptyText: 'No projected months found.'
                }
            )
        );
    }

    function renderInvestmentSection(host, data) {
        const rows = (data.records || []).map(record => ({
            cells: [record.Account || '', moneyCents(record.BalanceCurrent)]
        }));

        addSection(
            host,
            'MY INVESTMENTS — CURRENT ACCOUNTS',
            createTable(
                ['Account', 'Balance Current'],
                rows,
                {
                    numericColumns: [1],
                    emptyText: 'No My Investments accounts entered.',
                    totalRow: ['TOTAL MY INVESTMENTS', moneyCents(data.total)]
                }
            )
        );
    }

    function renderMonthlySummarySection(host, summaryData) {
        const rows = (summaryData.summary || []).map(record => ({
            rowClass: record.Deficit ? 'budget-details-deficit' : '',
            cells: [
                record.MonthLabel || monthLabel(record.Month),
                moneyWhole(record.In),
                moneyWhole(record.Out),
                {
                    text: moneyWhole(record.Net),
                    className: record.MyMoneyShortage ? 'budget-details-shortage-cell' : ''
                }
            ]
        }));

        const content = makeElement('div');
        const currentBalance = makeElement('p', {
            className: 'budget-details-current-balance',
            text: `My Money Current Balance: ${moneyCents(summaryData.MyMoneyCurrentBalance)}`
        });
        content.appendChild(currentBalance);
        content.appendChild(
            createTable(
                ['Month', 'In', 'Out', 'Net'],
                rows,
                {
                    numericColumns: [1, 2, 3],
                    emptyText: 'No months found for the current + 11 month range.'
                }
            )
        );

        addSection(
            host,
            'MY MONTHLY BUDGET — MONTHLY SUMMARY — CURRENT + 11 MONTHS',
            content
        );
    }

    const reportDefinitions = [
        {
            title: 'IN',
            path: '/budget/in?status=active',
            headers: ['From', 'Description', 'Date Begin', 'Date End', 'Amount', 'Active', 'Estimated'],
            numericColumns: [4],
            emptyText: 'No active In records.',
            row: r => [
                r.FromName || '',
                r.Description || '',
                r.DateBegin || '',
                r.DateEnd || '',
                moneyWhole(r.Amount),
                yesNo(r.Active),
                yesNo(r.Estimated)
            ]
        },
        {
            title: 'OUT',
            path: '/budget/out?status=active',
            headers: ['To', 'Description', 'Date Begin', 'Date End', 'Amount', 'Active', 'Estimated'],
            numericColumns: [4],
            emptyText: 'No active Out records.',
            row: r => [
                r.ToName || '',
                r.Description || '',
                r.DateBegin || '',
                r.DateEnd || '',
                moneyWhole(r.Amount),
                yesNo(r.Active),
                yesNo(r.Estimated)
            ]
        },
        {
            title: 'SUBSCRIPTION',
            path: '/budget/subscriptions?status=active',
            headers: ['To', 'Description', 'Amount', 'Payment Account', 'Date Begin', 'Date End', 'Auto Renew', 'Active', 'Amount is Estimated'],
            numericColumns: [2],
            emptyText: 'No active Subscription records.',
            row: r => [
                r.ToName || '',
                r.Description || '',
                moneyWhole(r.Amount),
                r.PaymentAccount || '',
                r.DateBegin || '',
                r.DateEnd || '',
                yesNo(r.AutoRenew),
                yesNo(r.Active),
                yesNo(r.Estimated)
            ]
        },
        {
            title: 'LOAN',
            path: '/budget/loans?status=active',
            headers: ['From', 'Date', 'Description', 'Loan Amount', 'Loan Amount Estimated', 'Payment Start Date', 'Payment End Date', 'Payment Amount', 'Payment Amount Estimated', 'Active'],
            numericColumns: [3, 7],
            emptyText: 'No active Loan records.',
            row: r => [
                r.FromName || '',
                r.DateLoan || '',
                r.Description || '',
                moneyWhole(r.LoanAmount),
                yesNo(r.LoanAmountIsEstimated),
                r.PaymentDateBegin || '',
                r.PaymentDateEnd || '',
                moneyWhole(r.PaymentAmount),
                yesNo(r.PaymentAmountIsEstimated),
                yesNo(r.Active)
            ]
        },
        {
            title: 'LEASE/RENT',
            path: '/budget/lease-rent?status=active',
            headers: ['To', 'Agreement Date', 'Description', 'Payment Start Date', 'Payment End Date', 'Payment Amount', 'Payment Amount Estimated', 'Active'],
            numericColumns: [5],
            emptyText: 'No active Lease/Rent records.',
            row: r => [
                r.ToName || '',
                r.AgreementDate || '',
                r.Description || '',
                r.PaymentDateBegin || '',
                r.PaymentDateEnd || '',
                moneyWhole(r.PaymentAmount),
                yesNo(r.PaymentAmountIsEstimated),
                yesNo(r.Active)
            ]
        },
        {
            title: 'CREDIT CARD',
            path: '/budget/cards?status=active',
            headers: ['Account Name', 'Last 4 Digits', 'Last Statement Date', 'Statement Balance', 'Payment Due Date', 'Minimum Payment Due', 'Include Monthly Payment', 'Alternative Amount', 'Credit Line Total', 'Credit Line Available', 'Active'],
            numericColumns: [3, 5, 7, 8, 9],
            emptyText: 'No active Credit Card records.',
            row: r => [
                r.AccountName || '',
                r.Last4Digits || '',
                r.LastStatementDate || '',
                moneyWhole(r.StatementBalance),
                r.PaymentDueDate || '',
                moneyWhole(r.MinimumPaymentDue),
                yesNo(r.MinimumPaymentDueChecked),
                r.MinimumPaymentAlternativeAmount == null ? '' : moneyWhole(r.MinimumPaymentAlternativeAmount),
                r.CreditLineTotal == null ? '' : moneyWhole(r.CreditLineTotal),
                r.CreditLineAvailable == null ? '' : moneyWhole(r.CreditLineAvailable),
                yesNo(r.Active)
            ]
        },
        {
            title: 'ESTIMATE/ALLOWANCE',
            path: '/budget/estimates?status=active',
            headers: ['In or Out', 'From/To', 'Description', 'Date Begin', 'Date End', 'Amount', 'Active'],
            numericColumns: [5],
            emptyText: 'No active Estimate/Allowance records.',
            row: r => [
                r.InOrOut || '',
                r.FromNameOrToName || '',
                r.Description || '',
                r.DateBegin || '',
                r.DateEnd || '',
                moneyWhole(r.Amount),
                yesNo(r.Active)
            ]
        }
    ];

    function renderDetailReports(host, reportData) {
        const detailContainer = makeElement('div');

        reportDefinitions.forEach((definition, index) => {
            const rows = (reportData[index] || []).map(record => ({
                cells: definition.row(record)
            }));

            const subsection = makeElement('section', {
                className: 'budget-details-subsection'
            });
            subsection.appendChild(makeElement('h3', { text: definition.title }));
            subsection.appendChild(
                createTable(definition.headers, rows, {
                    compact: true,
                    numericColumns: definition.numericColumns,
                    emptyText: definition.emptyText
                })
            );
            detailContainer.appendChild(subsection);
        });

        addSection(host, 'BUDGET DETAILS — ACTIVE RECORDS', detailContainer, 'budget-details-reports');
    }

    async function loadReport() {
        const modal = document.getElementById('budgetDetailsModal');
        const reportHost = document.getElementById('budgetDetailsReport');
        const status = document.getElementById('budgetDetailsStatus');
        const printButton = document.getElementById('budgetDetailsPrintBtn');
        const timestamp = document.getElementById('budgetDetailsTimestamp');

        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        clearElement(reportHost);
        status.textContent = 'Loading current Budget details...';
        status.className = 'budget-details-status';
        timestamp.textContent = '';
        printButton.disabled = true;

        const from = currentMonth();
        const to = addMonths(from, 11);

        try {
            const [moneyData, investmentData, summaryData, ...detailData] = await Promise.all([
                apiFetch('/budget/money'),
                apiFetch('/budget/investments'),
                apiFetch(`/budget/monthly/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
                ...reportDefinitions.map(definition => apiFetch(definition.path))
            ]);

            renderMoneySection(reportHost, moneyData);
            renderProjectionSection(reportHost, summaryData);
            renderInvestmentSection(reportHost, investmentData);
            renderMonthlySummarySection(reportHost, summaryData);
            renderDetailReports(reportHost, detailData);

            const generatedAt = new Date();
            timestamp.textContent = `Report Date: ${reportDateTime(generatedAt)}`;
            status.textContent = '';
            printButton.disabled = false;
        } catch (error) {
            clearElement(reportHost);
            status.textContent = `Unable to generate report: ${error.message}`;
            status.className = 'budget-details-status error';
        }
    }

    function closeReport() {
        const modal = document.getElementById('budgetDetailsModal');
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }

    function printReport() {
        document.body.classList.add('printing-budget-details');
        window.print();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const openButton = document.getElementById('printMyDetailsBtn');
        const closeButton = document.getElementById('budgetDetailsCloseBtn');
        const printButton = document.getElementById('budgetDetailsPrintBtn');
        const modal = document.getElementById('budgetDetailsModal');

        if (!openButton || !closeButton || !printButton || !modal) return;

        openButton.addEventListener('click', loadReport);
        closeButton.addEventListener('click', closeReport);
        printButton.addEventListener('click', printReport);

        modal.addEventListener('click', event => {
            if (event.target === modal) closeReport();
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('show')) {
                closeReport();
            }
        });

        window.addEventListener('afterprint', () => {
            document.body.classList.remove('printing-budget-details');
        });
    });
})();
