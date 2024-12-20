// DOM Elements
const customerList = document.getElementById('customerList');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const addCustomerModal = document.getElementById('addCustomerModal');
const customerForm = document.getElementById('customerForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentPageSpan = document.getElementById('currentPage');

// State
let customers = [];
let currentPage = 1;
const rowsPerPage = 8;
let sales = { daily: 0, total: 0 };
let profit = { daily: 0, total: 0 };

// Event Listeners
addCustomerBtn.addEventListener('click', () => {
    addCustomerModal.style.display = 'block';
});

window.addEventListener('click', (e) => {
    if (e.target === addCustomerModal) {
        addCustomerModal.style.display = 'none';
    }
});

customerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newCustomer = {
        id: customers.length + 1,
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        notes: document.getElementById('notes').value
    };
    
    customers.push(newCustomer);
    saveData();
    renderCustomers();
    addCustomerModal.style.display = 'none';
    customerForm.reset();
});

// Render Functions
function createActionButtons(customerId) {
    const actions = document.createElement('div');
    actions.className = 'action-buttons';
    
    const buttons = [
        { class: 'btn-print', text: 'P' },
        { class: 'btn-modify', text: 'M' },
        { class: 'btn-edit', text: 'E' },
        { class: 'btn-delete', text: 'D' }
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `action-btn ${btn.class}`;
        button.textContent = btn.text;
        button.onclick = () => handleAction(btn.class, customerId);
        actions.appendChild(button);
    });
    
    return actions;
}

function renderCustomers() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedCustomers = customers.slice(start, end);
    
    customerList.innerHTML = '';
    
    paginatedCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.address}</td>
            <td>${customer.notes}</td>
            <td></td>
        `;
        
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.appendChild(createActionButtons(customer.id));
        customerList.appendChild(row);
    });
    
    updatePagination();
    updateStats();
}

function updatePagination() {
    const totalPages = Math.ceil(customers.length / rowsPerPage);
    currentPageSpan.textContent = currentPage;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function updateStats() {
    document.getElementById('dailySales').textContent = sales.daily.toFixed(2);
    document.getElementById('totalSales').textContent = sales.total.toFixed(2);
    document.getElementById('dailyProfit').textContent = profit.daily.toFixed(2);
    document.getElementById('totalProfit').textContent = profit.total.toFixed(2);
}

// Action Handlers
function handleAction(action, customerId) {
    const customer = customers.find(c => c.id === customerId);
    
    switch(action) {
        case 'btn-print':
            console.log('Printing customer:', customer);
            break;
        case 'btn-modify':
            console.log('Modifying customer:', customer);
            break;
        case 'btn-edit':
            console.log('Editing customer:', customer);
            break;
        case 'btn-delete':
            customers = customers.filter(c => c.id !== customerId);
            saveData();
            renderCustomers();
            break;
    }
}

// Pagination Handlers
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderCustomers();
    }
});

nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(customers.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderCustomers();
    }
});

// Data Persistence
function saveData() {
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('profit', JSON.stringify(profit));
}

function loadData() {
    const savedCustomers = localStorage.getItem('customers');
    const savedSales = localStorage.getItem('sales');
    const savedProfit = localStorage.getItem('profit');
    
    if (savedCustomers) customers = JSON.parse(savedCustomers);
    if (savedSales) sales = JSON.parse(savedSales);
    if (savedProfit) profit = JSON.parse(savedProfit);
}

// Initialize
loadData();
renderCustomers();