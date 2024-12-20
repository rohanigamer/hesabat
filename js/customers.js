// Initialize customers array and DOM elements
let customers = JSON.parse(localStorage.getItem('customers') || '[]');
const customerTable = document.getElementById('customerTable');
const customerList = document.getElementById('customerList');
const customerForm = document.getElementById('customerForm');
const addCustomerModal = document.getElementById('addCustomerModal');
const printOptionsModal = document.getElementById('printOptionsModal');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const noResults = document.getElementById('noResults');
let filteredCustomers = [];

// Pagination settings
let currentPage = 1;
const rowsPerPage = 10;

// Create action buttons for a customer
function createActionButtons(customerId) {
    return `
        <button onclick="handleAction('btn-print', ${customerId})" class="btn btn-primary btn-sm">Print</button>
        <button onclick="handleAction('btn-g', ${customerId})" class="btn btn-info btn-sm">G</button>
        <button onclick="handleAction('btn-m', ${customerId})" class="btn btn-warning btn-sm">M</button>
        <button onclick="handleAction('btn-edit', ${customerId})" class="btn btn-success btn-sm">Edit</button>
        <button onclick="handleAction('btn-delete', ${customerId})" class="btn btn-danger btn-sm">Delete</button>
    `;
}

// Update pagination
function updatePagination() {
    const displayCustomers = searchInput.value ? filteredCustomers : customers;
    const totalPages = Math.ceil(displayCustomers.length / rowsPerPage);
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const displayCustomers = searchInput.value ? filteredCustomers : customers;
    const totalPages = Math.ceil(displayCustomers.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderCustomers();
}

// Render customers table
function renderCustomers() {
    customerList.innerHTML = '';
    
    const displayCustomers = searchInput.value ? filteredCustomers : customers;
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedCustomers = displayCustomers.slice(start, end);
    
    paginatedCustomers.forEach(customer => {
        // Calculate Gold Balance
        const goldTransactions = JSON.parse(localStorage.getItem(`transactions_${customer.id}`)) || [];
        let goldBalance = 0;
        goldTransactions.forEach(t => {
            if (t.type === 'rec') goldBalance += t.value;
            if (t.type === 'send') goldBalance -= t.value;
        });

        // Calculate Money Balance
        const moneyTransactions = JSON.parse(localStorage.getItem(`transactions_money_${customer.id}`)) || [];
        let moneyBalanceAFN = 0;
        let moneyBalanceUSD = 0;
        moneyTransactions.forEach(t => {
            if (t.type === 'rec') {
                if (t.currency === 'AFN') moneyBalanceAFN += t.amount;
                if (t.currency === 'USD') moneyBalanceUSD += t.amount;
            }
            if (t.type === 'send') {
                if (t.currency === 'AFN') moneyBalanceAFN -= t.amount;
                if (t.currency === 'USD') moneyBalanceUSD -= t.amount;
            }
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="customer-name">${customer.name}</td>
            <td>${customer.address || ''}</td>
            <td>
                <div class="balance-badge ${goldBalance >= 0 ? 'positive' : 'negative'}">
                    <div class="balance-content">
                        <span class="balance-amount">${Math.abs(goldBalance).toFixed(2)}</span>
                        <span class="balance-label">Gold</span>
                    </div>
                    <div class="balance-icon">
                        <i class="bi ${goldBalance >= 0 ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'}"></i>
                    </div>
                </div>
            </td>
            <td>
                <div class="balance-stack">
                    <div class="balance-badge ${moneyBalanceAFN >= 0 ? 'positive' : 'negative'}">
                        <div class="balance-content">
                            <span class="balance-amount">${Math.abs(moneyBalanceAFN).toFixed(2)}</span>
                            <span class="balance-label">AFN</span>
                        </div>
                        <div class="balance-icon">
                            <i class="bi ${moneyBalanceAFN >= 0 ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'}"></i>
                        </div>
                    </div>
                    <div class="balance-badge ${moneyBalanceUSD >= 0 ? 'positive' : 'negative'}">
                        <div class="balance-content">
                            <span class="balance-amount">${Math.abs(moneyBalanceUSD).toFixed(2)}</span>
                            <span class="balance-label">USD</span>
                        </div>
                        <div class="balance-icon">
                            <i class="bi ${moneyBalanceUSD >= 0 ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'}"></i>
                        </div>
                    </div>
                </div>
            </td>
            <td>${createActionButtons(customer.id)}</td>
        `;
        customerList.appendChild(tr);
    });
    
    updatePagination();
    
    // Show/hide no results message
    if (searchInput.value && paginatedCustomers.length === 0) {
        noResults.style.display = 'block';
        document.getElementById('customerTable').style.display = 'none';
    } else {
        noResults.style.display = 'none';
        document.getElementById('customerTable').style.display = 'table';
    }
}

// Search functionality
function filterCustomers(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm) ||
        customer.notes.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    renderCustomers();
    updatePagination();
}

searchInput.addEventListener('input', (e) => {
    filterCustomers(e.target.value);
    clearSearch.style.display = e.target.value ? 'block' : 'none';
});

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    filterCustomers('');
    clearSearch.style.display = 'none';
});

// Form Submission
customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editId = customerForm.dataset.editId;
    const newName = document.getElementById('name').value.trim();
    const newAddress = document.getElementById('address').value.trim();
    const newNotes = document.getElementById('notes').value.trim();
    
    if (!newName || !newAddress) {
        alert('Name and Address are required!');
        return;
    }
    
    // Check if customer with same name and address exists
    const customerExists = customers.some(customer => 
        customer.id !== parseInt(editId) && // Skip current customer when editing
        customer.name.toLowerCase() === newName.toLowerCase() && 
        customer.address.toLowerCase() === newAddress.toLowerCase()
    );
    
    if (customerExists) {
        alert('A customer with this name and address already exists!');
        return;
    }
    
    const newCustomer = {
        id: editId ? parseInt(editId) : Date.now(),
        name: newName,
        address: newAddress,
        notes: newNotes
    };

    try {
        // Create G page file
        const gPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>G Page - ${newCustomer.name}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="page-container">
        <div class="header">
            <h1>Gold Transactions - ${newCustomer.name}</h1>
            <div class="nav-buttons">
                <a href="../index.html" class="nav-link">← Dashboard</a>
                <a href="../customers.html" class="nav-link">← Back to Customers</a>
                <a href="${newCustomer.id}_m.html" class="switch-page-btn">
                    <i class="bi bi-currency-dollar"></i> Switch to Money Page
                </a>
            </div>
        </div>

        <div class="summary-cards">
            <div class="card summary-card balance">
                <div class="card-body">
                    <h5 class="card-title">Balance</h5>
                    <p class="card-amount" id="balance">0</p>
                </div>
            </div>
            <div class="card summary-card received">
                <div class="card-body">
                    <h5 class="card-title">Total Received</h5>
                    <p class="card-amount" id="totalReceived">0</p>
                </div>
            </div>
            <div class="card summary-card sent">
                <div class="card-body">
                    <h5 class="card-title">Total Sent</h5>
                    <p class="card-amount" id="totalSent">0</p>
                </div>
            </div>
        </div>

        <button id="addEntryBtn" class="btn btn-primary action-button">
            <i class="bi bi-plus-lg"></i> Add Entry
        </button>

        <div class="table-container">
            <table id="transactionTable" class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Karate</th>
                        <th>Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="transactionList"></tbody>
            </table>
        </div>

        <!-- Add Entry Modal -->
        <div id="addEntryModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h5>Add New Entry</h5>
                    <span class="close">&times;</span>
                </div>
                <form id="entryForm">
                    <div class="form-group">
                        <label for="date">Date:</label>
                        <input type="date" id="date" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Description:</label>
                        <input type="text" id="description" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="type">Type:</label>
                        <select id="type" class="form-control" required>
                            <option value="">Select Type</option>
                            <option value="rec">Received</option>
                            <option value="send">Sent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="amount">Amount:</label>
                        <input type="number" id="amount" class="form-control" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="karate">Karate:</label>
                        <input type="number" id="karate" class="form-control" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="value">Value:</label>
                        <input type="text" id="value" class="form-control" readonly>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save Entry</button>
                        <button type="button" class="btn btn-secondary close">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Initialize data from localStorage
        const customerId = '${newCustomer.id}';
        const customerName = '${newCustomer.name}';
        let transactions = JSON.parse(localStorage.getItem(\`transactions_\${customerId}\`)) || [];

        // DOM Elements
        const addEntryBtn = document.getElementById('addEntryBtn');
        const addEntryModal = document.getElementById('addEntryModal');
        const entryForm = document.getElementById('entryForm');
        const closeButtons = document.querySelectorAll('.close');
        const amountInput = document.getElementById('amount');
        const karateInput = document.getElementById('karate');
        const valueInput = document.getElementById('value');

        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();

        // Calculate value when amount or karate changes
        function calculateValue() {
            const amount = parseFloat(amountInput.value) || 0;
            const karate = parseFloat(karateInput.value) || 0;
            const value = (amount * karate / 23.88).toFixed(2);
            valueInput.value = value;
        }

        amountInput.addEventListener('input', calculateValue);
        karateInput.addEventListener('input', calculateValue);

        // Show modal
        addEntryBtn.addEventListener('click', () => {
            addEntryModal.style.display = 'block';
            document.getElementById('date').valueAsDate = new Date();
            entryForm.reset();
        });

        // Close modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                addEntryModal.style.display = 'none';
            });
        });

        // Edit transaction
        function editTransaction(id) {
            const transaction = transactions.find(t => t.id === id);
            if (!transaction) return;

            // Fill the form with transaction data
            document.getElementById('date').value = transaction.date;
            document.getElementById('description').value = transaction.description;
            document.getElementById('type').value = transaction.type;
            document.getElementById('amount').value = transaction.amount;
            document.getElementById('karate').value = transaction.karate;
            document.getElementById('value').value = transaction.value;

            // Show modal in edit mode
            addEntryModal.style.display = 'block';
            const submitBtn = entryForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Entry';
            
            // Store the ID being edited
            entryForm.dataset.editId = id;
        }

        // Handle form submission
        entryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const transaction = {
                id: entryForm.dataset.editId ? parseInt(entryForm.dataset.editId) : Date.now(),
                date: document.getElementById('date').value,
                description: document.getElementById('description').value,
                type: document.getElementById('type').value,
                amount: parseFloat(amountInput.value),
                karate: parseFloat(karateInput.value),
                value: parseFloat(valueInput.value)
            };

            if (entryForm.dataset.editId) {
                // Update existing transaction
                const index = transactions.findIndex(t => t.id === parseInt(entryForm.dataset.editId));
                if (index !== -1) {
                    transactions[index] = transaction;
                }
                showNotification('Entry updated successfully!', 'success');
            } else {
                // Add new transaction
                transactions.push(transaction);
                showNotification('Entry added successfully!', 'success');
            }

            localStorage.setItem(\`transactions_\${customerId}\`, JSON.stringify(transactions));
            renderTransactions();
            addEntryModal.style.display = 'none';
            entryForm.reset();
            delete entryForm.dataset.editId;
            entryForm.querySelector('button[type="submit"]').textContent = 'Save Entry';
        });

        // Reset form when closing modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                addEntryModal.style.display = 'none';
                entryForm.reset();
                delete entryForm.dataset.editId;
                entryForm.querySelector('button[type="submit"]').textContent = 'Save Entry';
            });
        });

        // Delete transaction
        function deleteTransaction(id) {
            if (confirm('Are you sure you want to delete this entry?')) {
                transactions = transactions.filter(t => t.id !== id);
                localStorage.setItem(\`transactions_\${customerId}\`, JSON.stringify(transactions));
                renderTransactions();
                showNotification('Entry deleted successfully!', 'success');
            }
        }

        // Render transactions
        function renderTransactions() {
            const transactionList = document.getElementById('transactionList');
            transactionList.innerHTML = '';
            
            let totalRec = 0;
            let totalSend = 0;

            transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
                if (transaction.type === 'rec') totalRec += transaction.value;
                if (transaction.type === 'send') totalSend += transaction.value;

                const row = document.createElement('tr');
                row.className = \`transaction-row \${transaction.type}\`;
                row.innerHTML = \`
                    <td>\${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>\${transaction.description}</td>
                    <td class="type-\${transaction.type}">\${transaction.type === 'rec' ? 'Received' : 'Sent'}</td>
                    <td>\${transaction.amount.toFixed(2)}</td>
                    <td>\${transaction.karate.toFixed(2)}</td>
                    <td>\${transaction.value.toFixed(2)}</td>
                    <td>
                        <button onclick="editTransaction(\${transaction.id})" class="btn btn-success btn-sm" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deleteTransaction(\${transaction.id})" class="btn btn-danger btn-sm" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                \`;
                transactionList.appendChild(row);
                
                // Add animation
                requestAnimationFrame(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                });
            });

            // Update summary
            document.getElementById('totalReceived').textContent = totalRec.toFixed(2);
            document.getElementById('totalSent').textContent = totalSend.toFixed(2);
            document.getElementById('balance').textContent = (totalRec - totalSend).toFixed(2);
        }

        // Show notification
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.innerHTML = \`
                <i class="bi bi-\${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                \${message}
            \`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Initial render
        renderTransactions();
    </script>
</body>
</html>`;

        // Create M page file
        const mPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M Page - ${newCustomer.name}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="page-container">
        <div class="header">
            <h1>Money Transactions - ${newCustomer.name}</h1>
            <div class="nav-buttons">
                <a href="../index.html" class="nav-link">← Dashboard</a>
                <a href="../customers.html" class="nav-link">← Back to Customers</a>
                <a href="${newCustomer.id}_g.html" class="switch-page-btn">
                    <i class="bi bi-coin"></i> Switch to Gold Page
                </a>
            </div>
        </div>

        <div class="summary-cards">
            <div class="card summary-card balance">
                <div class="card-body">
                    <h5 class="card-title">Balance</h5>
                    <div class="currency-amounts">
                        <p class="card-amount"><span id="balanceAFN">0</span> AFN</p>
                        <p class="card-amount"><span id="balanceUSD">0</span> USD</p>
                    </div>
                </div>
            </div>
            <div class="card summary-card received">
                <div class="card-body">
                    <h5 class="card-title">Total Received</h5>
                    <div class="currency-amounts">
                        <p class="card-amount"><span id="totalReceivedAFN">0</span> AFN</p>
                        <p class="card-amount"><span id="totalReceivedUSD">0</span> USD</p>
                    </div>
                </div>
            </div>
            <div class="card summary-card sent">
                <div class="card-body">
                    <h5 class="card-title">Total Sent</h5>
                    <div class="currency-amounts">
                        <p class="card-amount"><span id="totalSentAFN">0</span> AFN</p>
                        <p class="card-amount"><span id="totalSentUSD">0</span> USD</p>
                    </div>
                </div>
            </div>
        </div>

        <button id="addEntryBtn" class="btn btn-primary action-button">
            <i class="bi bi-plus-lg"></i> Add Entry
        </button>

        <div class="table-container">
            <table id="transactionTable" class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Currency</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="transactionList"></tbody>
            </table>
        </div>

        <!-- Add Entry Modal -->
        <div id="addEntryModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h5>Add New Entry</h5>
                    <span class="close">&times;</span>
                </div>
                <form id="entryForm">
                    <div class="form-group">
                        <label for="date">Date:</label>
                        <input type="date" id="date" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Description:</label>
                        <input type="text" id="description" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="currency">Currency:</label>
                        <select id="currency" class="form-control" required>
                            <option value="">Select Currency</option>
                            <option value="AFN">AFN</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="type">Type:</label>
                        <select id="type" class="form-control" required>
                            <option value="">Select Type</option>
                            <option value="rec">Received</option>
                            <option value="send">Sent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="amount">Amount:</label>
                        <input type="number" id="amount" class="form-control" step="0.01" required>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save Entry</button>
                        <button type="button" class="btn btn-secondary close">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Initialize data from localStorage
        const customerId = '${newCustomer.id}';
        const customerName = '${newCustomer.name}';
        let transactions = JSON.parse(localStorage.getItem(\`transactions_money_\${customerId}\`)) || [];

        // DOM Elements
        const addEntryBtn = document.getElementById('addEntryBtn');
        const addEntryModal = document.getElementById('addEntryModal');
        const entryForm = document.getElementById('entryForm');
        const closeButtons = document.querySelectorAll('.close');
        const amountInput = document.getElementById('amount');

        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();

        // Show modal
        addEntryBtn.addEventListener('click', () => {
            addEntryModal.style.display = 'block';
            document.getElementById('date').valueAsDate = new Date();
            entryForm.reset();
        });

        // Close modal
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                addEntryModal.style.display = 'none';
                entryForm.reset();
                delete entryForm.dataset.editId;
                entryForm.querySelector('button[type="submit"]').textContent = 'Save Entry';
            });
        });

        // Edit transaction
        function editTransaction(id) {
            const transaction = transactions.find(t => t.id === id);
            if (!transaction) return;

            // Fill the form with transaction data
            document.getElementById('date').value = transaction.date;
            document.getElementById('description').value = transaction.description;
            document.getElementById('currency').value = transaction.currency;
            document.getElementById('type').value = transaction.type;
            document.getElementById('amount').value = transaction.amount;

            // Show modal in edit mode
            addEntryModal.style.display = 'block';
            const submitBtn = entryForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Entry';
            
            // Store the ID being edited
            entryForm.dataset.editId = id;
        }

        // Handle form submission
        entryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const transaction = {
                id: entryForm.dataset.editId ? parseInt(entryForm.dataset.editId) : Date.now(),
                date: document.getElementById('date').value,
                description: document.getElementById('description').value,
                currency: document.getElementById('currency').value,
                type: document.getElementById('type').value,
                amount: parseFloat(amountInput.value)
            };

            if (entryForm.dataset.editId) {
                // Update existing transaction
                const index = transactions.findIndex(t => t.id === parseInt(entryForm.dataset.editId));
                if (index !== -1) {
                    transactions[index] = transaction;
                }
                showNotification('Entry updated successfully!', 'success');
            } else {
                // Add new transaction
                transactions.push(transaction);
                showNotification('Entry added successfully!', 'success');
            }

            localStorage.setItem(\`transactions_money_\${customerId}\`, JSON.stringify(transactions));
            renderTransactions();
            addEntryModal.style.display = 'none';
            entryForm.reset();
            delete entryForm.dataset.editId;
            entryForm.querySelector('button[type="submit"]').textContent = 'Save Entry';
        });

        // Delete transaction
        function deleteTransaction(id) {
            if (confirm('Are you sure you want to delete this entry?')) {
                transactions = transactions.filter(t => t.id !== id);
                localStorage.setItem(\`transactions_money_\${customerId}\`, JSON.stringify(transactions));
                renderTransactions();
                showNotification('Entry deleted successfully!', 'success');
            }
        }

        // Render transactions
        function renderTransactions() {
            const transactionList = document.getElementById('transactionList');
            transactionList.innerHTML = '';
            
            let totalRecAFN = 0;
            let totalRecUSD = 0;
            let totalSendAFN = 0;
            let totalSendUSD = 0;

            transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
                if (transaction.type === 'rec') {
                    if (transaction.currency === 'AFN') totalRecAFN += transaction.amount;
                    if (transaction.currency === 'USD') totalRecUSD += transaction.amount;
                }
                if (transaction.type === 'send') {
                    if (transaction.currency === 'AFN') totalSendAFN += transaction.amount;
                    if (transaction.currency === 'USD') totalSendUSD += transaction.amount;
                }

                const row = document.createElement('tr');
                row.className = \`transaction-row \${transaction.type}\`;
                row.innerHTML = \`
                    <td>\${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>\${transaction.description}</td>
                    <td>\${transaction.currency}</td>
                    <td class="type-\${transaction.type}">\${transaction.type === 'rec' ? 'Received' : 'Sent'}</td>
                    <td>\${transaction.amount.toFixed(2)}</td>
                    <td>
                        <button onclick="editTransaction(\${transaction.id})" class="btn btn-success btn-sm" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="deleteTransaction(\${transaction.id})" class="btn btn-danger btn-sm" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                \`;
                transactionList.appendChild(row);
                
                // Add animation
                requestAnimationFrame(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                });
            });

            // Update summary
            document.getElementById('totalReceivedAFN').textContent = totalRecAFN.toFixed(2);
            document.getElementById('totalReceivedUSD').textContent = totalRecUSD.toFixed(2);
            document.getElementById('totalSentAFN').textContent = totalSendAFN.toFixed(2);
            document.getElementById('totalSentUSD').textContent = totalSendUSD.toFixed(2);
            document.getElementById('balanceAFN').textContent = (totalRecAFN - totalSendAFN).toFixed(2);
            document.getElementById('balanceUSD').textContent = (totalRecUSD - totalSendUSD).toFixed(2);
        }

        // Show notification
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = \`notification \${type}\`;
            notification.innerHTML = \`
                <i class="bi bi-\${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                \${message}
            \`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Initial render
        renderTransactions();
    </script>
</body>
</html>`;

        // Save the G and M pages first
        const response = await fetch('http://localhost:3000/create-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: newCustomer.id,
                gContent: gPageContent,
                mContent: mPageContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create customer pages');
        }

        if (editId) {
            // Update existing customer
            const index = customers.findIndex(c => c.id === parseInt(editId));
            if (index !== -1) {
                customers[index] = newCustomer;
            }
        } else {
            // Add new customer
            customers.push(newCustomer);
        }
        
        // Save to localStorage
        localStorage.setItem('customers', JSON.stringify(customers));
        
        // Update display
        renderCustomers();
        
        // Reset form and close modal with success message
        alert(editId ? 'Customer updated successfully!' : 'Customer added successfully!');
        customerForm.reset();
        delete customerForm.dataset.editId;
        addCustomerModal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            addCustomerModal.style.display = 'none';
            addCustomerModal.style.animation = '';
        }, 300);

    } catch (error) {
        console.error('Error creating customer:', error);
        alert('Error creating customer: ' + error.message);
        customerForm.reset();
    }
});

// Handle action button clicks
function handleAction(action, customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    switch(action) {
        case 'btn-print':
            showPrintOptions(customerId);
            break;
        case 'btn-g':
            window.location.href = `customers/${customerId}_g.html`;
            break;
        case 'btn-m':
            window.location.href = `customers/${customerId}_m.html`;
            break;
        case 'btn-edit':
            editCustomer(customerId);
            break;
        case 'btn-delete':
            showDeleteConfirmation(customerId);
            break;
    }
}

// Show/hide modals
document.getElementById('addCustomerBtn').addEventListener('click', () => {
    addCustomerModal.style.display = 'block';
    addCustomerModal.style.animation = 'fadeIn 0.3s ease-in';
});

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.animation = '';
        }, 300);
    });
});

// Print options functions
function showPrintOptions(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Show print options modal
    printOptionsModal.style.display = 'block';
    printOptionsModal.style.animation = 'fadeIn 0.3s ease-in';
    
    // Store the customer ID for printing
    printOptionsModal.dataset.customerId = customerId;

    // Add event listeners to print buttons
    const printButtons = printOptionsModal.querySelectorAll('.print-option');
    printButtons.forEach(button => {
        button.onclick = function() {
            const type = this.dataset.type;
            printPage(customerId, type);
            printOptionsModal.style.display = 'none';
        };
    });
}

// Handle print selection
document.getElementById('printOptionsModal').addEventListener('click', function(e) {
    if (e.target.classList.contains('print-option')) {
        const customerId = this.dataset.customerId;
        const type = e.target.dataset.type;
        if (customerId && type) {
            printPage(customerId, type);
            this.style.display = 'none';
        }
    }
});

// Print functions
function printPage(customerId, type) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    let transactions;
    let printTitle;
    let printContent;

    if (type === 'M') {
        transactions = JSON.parse(localStorage.getItem(`transactions_money_${customerId}`)) || [];
        printTitle = 'Money Transactions';
        
        // Calculate totals
        let totalRecAFN = 0, totalRecUSD = 0, totalSendAFN = 0, totalSendUSD = 0;
        transactions.forEach(t => {
            if (t.type === 'rec') {
                if (t.currency === 'AFN') totalRecAFN += t.amount;
                if (t.currency === 'USD') totalRecUSD += t.amount;
            }
            if (t.type === 'send') {
                if (t.currency === 'AFN') totalSendAFN += t.amount;
                if (t.currency === 'USD') totalSendUSD += t.amount;
            }
        });

        printContent = `
            <div class="summary-section">
                <div class="summary-item">
                    <h3>Balance</h3>
                    <p class="balance-amount">${(totalRecAFN - totalSendAFN).toFixed(2)} AFN</p>
                    <p class="balance-amount">${(totalRecUSD - totalSendUSD).toFixed(2)} USD</p>
                </div>
                <div class="summary-item">
                    <h3>Total Received</h3>
                    <p class="received-amount">AFN: ${totalRecAFN.toFixed(2)}</p>
                    <p class="received-amount">USD: ${totalRecUSD.toFixed(2)}</p>
                </div>
                <div class="summary-item">
                    <h3>Total Sent</h3>
                    <p class="sent-amount">AFN: ${totalSendAFN.toFixed(2)}</p>
                    <p class="sent-amount">USD: ${totalSendUSD.toFixed(2)}</p>
                </div>
            </div>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Currency</th>
                        <th>Type</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(t => `
                            <tr class="type-${t.type}">
                                <td>${new Date(t.date).toLocaleDateString()}</td>
                                <td>${t.description}</td>
                                <td>${t.currency}</td>
                                <td class="type-${t.type}">${t.type === 'rec' ? 'Received' : 'Sent'}</td>
                                <td class="type-${t.type}">${t.amount.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'G') {
        transactions = JSON.parse(localStorage.getItem(`transactions_${customerId}`)) || [];
        printTitle = 'Gold Transactions';
        
        // Calculate totals
        let totalRec = 0, totalSend = 0;
        transactions.forEach(t => {
            if (t.type === 'rec') totalRec += t.value;
            if (t.type === 'send') totalSend += t.value;
        });

        printContent = `
            <div class="summary-section">
                <div class="summary-item">
                    <h3>Balance</h3>
                    <p class="balance-amount">${(totalRec - totalSend).toFixed(2)}</p>
                </div>
                <div class="summary-item">
                    <h3>Total Received</h3>
                    <p class="received-amount">${totalRec.toFixed(2)}</p>
                </div>
                <div class="summary-item">
                    <h3>Total Sent</h3>
                    <p class="sent-amount">${totalSend.toFixed(2)}</p>
                </div>
            </div>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Karate</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(t => `
                            <tr class="type-${t.type}">
                                <td>${new Date(t.date).toLocaleDateString()}</td>
                                <td>${t.description}</td>
                                <td class="type-${t.type}">${t.type === 'rec' ? 'Received' : 'Sent'}</td>
                                <td class="type-${t.type}">${t.amount.toFixed(2)}</td>
                                <td>${t.karate.toFixed(2)}</td>
                                <td class="type-${t.type}">${t.value.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                </tbody>
            </table>
        `;
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${printTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Montserrat:wght@400;500&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Montserrat', Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #ddd;
                    position: relative;
                }
                .logo-section {
                    flex: 0 0 200px;
                }
                .logo-section img {
                    max-width: 100%;
                    height: auto;
                }
                .business-name {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                    font-family: 'Playfair Display', serif;
                }
                .business-name h1 {
                    font-size: 28px;
                    margin: 0;
                    color: #2c3e50;
                    letter-spacing: 1px;
                }
                .business-name .subtitle {
                    font-family: 'Montserrat', sans-serif;
                    font-size: 16px;
                    color: #666;
                    margin-top: 5px;
                    font-weight: 500;
                }
                .business-name .contact-info {
                    margin-top: 10px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 14px;
                    color: #666;
                }
                .business-name .contact-info p {
                    margin: 5px 0;
                }
                .business-name .contact-info i {
                    color: #25D366;
                    margin-right: 5px;
                }
                .customer-info {
                    flex: 1;
                    text-align: right;
                }
                .customer-info h2 {
                    color: #2c3e50;
                    font-size: 20px;
                    margin-bottom: 10px;
                }
                .customer-info p {
                    margin: 5px 0;
                    color: #666;
                }
                .summary-section {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 30px;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }
                .summary-item {
                    flex: 1;
                    text-align: center;
                }
                .summary-item h3 {
                    margin-top: 0;
                    color: #2c3e50;
                    font-size: 1.2em;
                    margin-bottom: 15px;
                }
                .summary-item p {
                    margin: 5px 0;
                    font-size: 1.1em;
                }
                .balance-amount {
                    font-size: 1.4em !important;
                    font-weight: bold;
                    color: #2c3e50;
                }
                .received-amount {
                    color: #2e7d32;
                    font-weight: bold;
                }
                .sent-amount {
                    color: #c62828;
                    font-weight: bold;
                }
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .print-table th {
                    background-color: #f8f9fa;
                    padding: 12px;
                    text-align: left;
                    border-bottom: 2px solid #ddd;
                }
                .print-table td {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                }
                .type-rec {
                    background-color: #e8f5e9;
                }
                .type-rec.type-rec {
                    color: #2e7d32;
                    font-weight: bold;
                }
                .type-send {
                    background-color: #ffebee;
                }
                .type-send.type-send {
                    color: #c62828;
                    font-weight: bold;
                }
                .print-footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                    .print-header { margin-bottom: 20px; }
                    .type-rec { 
                        background-color: #f8fff8 !important;
                    }
                    .type-rec.type-rec {
                        color: #2e7d32 !important;
                    }
                    .type-send { 
                        background-color: #fff8f8 !important;
                    }
                    .type-send.type-send {
                        color: #c62828 !important;
                    }
                    .summary-section { background-color: #fafafa !important; }
                    .summary-item { break-inside: avoid; }
                    .received-amount { color: #2e7d32 !important; }
                    .sent-amount { color: #c62828 !important; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <div class="logo-section">
                    <img src="../logo/logo.png" alt="Company Logo">
                </div>
                <div class="business-name">
                    <h1>Haji Taimor</h1>
                    <div class="subtitle">Gold and Jewelry</div>
                    <div class="contact-info">
                        <p><i class="bi bi-whatsapp"></i>+93774224344 حاجی تیمور</p>
                        <p><i class="bi bi-whatsapp"></i>+93747080090 قاری فردین</p>
                    </div>
                </div>
                <div class="customer-info">
                    <h2>${customer.name}</h2>
                    <p>Print Date: ${new Date().toLocaleDateString()}</p>
                    <p>Customer ID: ${customer.id}</p>
                    ${customer.address ? `<p>Address: ${customer.address}</p>` : ''}
                </div>
            </div>
            <h1>${printTitle}</h1>
            ${printContent}
            <div class="print-footer">
                <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
    `);
    
    // Wait for images to load before printing
    setTimeout(() => {
        printWindow.print();
        // Don't close the window automatically so user can save as PDF if needed
    }, 500);
}

// Delete customer functions
function editCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Fill form with customer data
    document.getElementById('name').value = customer.name;
    document.getElementById('address').value = customer.address;
    document.getElementById('notes').value = customer.notes || '';
    
    // Show modal
    addCustomerModal.style.display = 'block';
    addCustomerModal.style.animation = 'fadeIn 0.3s ease-in';
    
    // Store customer ID for editing
    customerForm.dataset.editId = customerId;
}

function showDeleteConfirmation(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const password = prompt('Enter password to delete customer:');
    if (password === 'Rohani') {
        deleteCustomer(customerId);
    } else {
        alert('Incorrect password!');
    }
}

async function deleteCustomer(customerId) {
    try {
        // Delete customer pages
        const response = await fetch(`http://localhost:3000/delete-pages/${customerId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete customer pages');
        }

        // Remove from array and localStorage
        customers = customers.filter(c => c.id !== customerId);
        localStorage.setItem('customers', JSON.stringify(customers));
        
        // Update display
        renderCustomers();
        alert('Customer deleted successfully!');
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer: ' + error.message);
    }
}

// Initial render
renderCustomers();
