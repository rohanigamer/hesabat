// State Management
let sales = {
    daily: 0,
    total: 0
};

let profit = {
    daily: 0,
    total: 0
};

// Dashboard state
let state = {
    gold: {
        received: 0,
        sent: 0,
        balance: 0
    },
    afn: {
        received: 0,
        sent: 0,
        balance: 0
    },
    usd: {
        received: 0,
        sent: 0,
        balance: 0
    },
    customers: {
        total: 0,
        active: 0,
        pending: 0
    }
};

// Debug function to log data
function debugData() {
    console.log('Customers:', localStorage.getItem('customers'));
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    customers.forEach(customer => {
        console.log(`Customer ${customer.id} Gold:`, localStorage.getItem(`transactions_${customer.id}`));
        console.log(`Customer ${customer.id} Money:`, localStorage.getItem(`transactions_money_${customer.id}`));
    });
}

// Update displays
function updateDisplays() {
    document.getElementById('dailySales').textContent = sales.daily.toFixed(2);
    document.getElementById('totalSales').textContent = sales.total.toFixed(2);
    document.getElementById('dailyProfit').textContent = profit.daily.toFixed(2);
    document.getElementById('totalProfit').textContent = profit.total.toFixed(2);
}

// Load data from localStorage
function loadData() {
    const savedSales = localStorage.getItem('sales');
    const savedProfit = localStorage.getItem('profit');
    
    if (savedSales) sales = JSON.parse(savedSales);
    if (savedProfit) profit = JSON.parse(savedProfit);
    
    updateDisplays();
}

// Calculate transactions within date range
function calculateTransactions(startDate) {
    try {
        // Get all customers
        const customers = JSON.parse(localStorage.getItem('customers')) || [];
        console.log('Total customers found:', customers.length);
        
        // Reset state
        state = {
            gold: { received: 0, sent: 0, balance: 0 },
            afn: { received: 0, sent: 0, balance: 0 },
            usd: { received: 0, sent: 0, balance: 0 },
            customers: { total: customers.length, active: 0, pending: 0 }
        };

        let activeCustomers = new Set(); // To count unique active customers

        customers.forEach(customer => {
            try {
                // Gold transactions
                const goldTransactions = JSON.parse(localStorage.getItem(`transactions_${customer.id}`)) || [];
                let customerGoldBalance = 0;
                
                goldTransactions.forEach(t => {
                    try {
                        const transactionDate = new Date(t.date);
                        if (transactionDate >= startDate) {
                            const value = parseFloat(t.value) || 0;
                            if (t.type === 'rec') {
                                state.gold.received += value;
                                customerGoldBalance += value;
                            } else {
                                state.gold.sent += value;
                                customerGoldBalance -= value;
                            }

                            // Check if customer is active today
                            if (transactionDate.toDateString() === new Date().toDateString()) {
                                activeCustomers.add(customer.id);
                            }
                        }
                    } catch (e) {
                        console.error('Error processing gold transaction:', e);
                    }
                });

                // Money transactions
                const moneyTransactions = JSON.parse(localStorage.getItem(`transactions_money_${customer.id}`)) || [];
                let customerAFNBalance = 0;
                let customerUSDBalance = 0;

                moneyTransactions.forEach(t => {
                    try {
                        const transactionDate = new Date(t.date);
                        if (transactionDate >= startDate) {
                            const amount = parseFloat(t.amount) || 0;
                            if (t.currency === 'AFN') {
                                if (t.type === 'rec') {
                                    state.afn.received += amount;
                                    customerAFNBalance += amount;
                                } else {
                                    state.afn.sent += amount;
                                    customerAFNBalance -= amount;
                                }
                            } else if (t.currency === 'USD') {
                                if (t.type === 'rec') {
                                    state.usd.received += amount;
                                    customerUSDBalance += amount;
                                } else {
                                    state.usd.sent += amount;
                                    customerUSDBalance -= amount;
                                }
                            }

                            // Check if customer is active today
                            if (transactionDate.toDateString() === new Date().toDateString()) {
                                activeCustomers.add(customer.id);
                            }
                        }
                    } catch (e) {
                        console.error('Error processing money transaction:', e);
                    }
                });

                // Calculate balances
                if (Math.abs(customerGoldBalance) > 0.001 || 
                    Math.abs(customerAFNBalance) > 0.001 || 
                    Math.abs(customerUSDBalance) > 0.001) {
                    state.customers.pending++;
                }
            } catch (e) {
                console.error('Error processing customer:', customer, e);
            }
        });

        // Calculate final balances
        state.gold.balance = state.gold.received - state.gold.sent;
        state.afn.balance = state.afn.received - state.afn.sent;
        state.usd.balance = state.usd.received - state.usd.sent;

        // Set active customers count
        state.customers.active = activeCustomers.size;

        console.log('Final state:', state);
        updateDisplay();
    } catch (e) {
        console.error('Error in calculateTransactions:', e);
    }
}

// Format number helper function
function formatNumber(num) {
    return parseFloat(num || 0).toFixed(2);
}

// Update display with current state
function updateDisplay() {
    try {
        // Update Gold Statistics
        const goldElements = {
            received: document.getElementById('goldReceived'),
            sent: document.getElementById('goldSent'),
            balance: document.getElementById('goldBalance')
        };

        if (goldElements.received) goldElements.received.textContent = formatNumber(state.gold.received);
        if (goldElements.sent) goldElements.sent.textContent = formatNumber(state.gold.sent);
        if (goldElements.balance) {
            goldElements.balance.textContent = formatNumber(state.gold.balance);
            goldElements.balance.className = state.gold.balance >= 0 ? 'positive' : 'negative';
        }

        // Update AFN Statistics
        const afnElements = {
            received: document.getElementById('afnReceived'),
            sent: document.getElementById('afnSent'),
            balance: document.getElementById('afnBalance')
        };

        if (afnElements.received) afnElements.received.textContent = formatNumber(state.afn.received);
        if (afnElements.sent) afnElements.sent.textContent = formatNumber(state.afn.sent);
        if (afnElements.balance) {
            afnElements.balance.textContent = formatNumber(state.afn.balance);
            afnElements.balance.className = state.afn.balance >= 0 ? 'positive' : 'negative';
        }

        // Update USD Statistics
        const usdElements = {
            received: document.getElementById('usdReceived'),
            sent: document.getElementById('usdSent'),
            balance: document.getElementById('usdBalance')
        };

        if (usdElements.received) usdElements.received.textContent = formatNumber(state.usd.received);
        if (usdElements.sent) usdElements.sent.textContent = formatNumber(state.usd.sent);
        if (usdElements.balance) {
            usdElements.balance.textContent = formatNumber(state.usd.balance);
            usdElements.balance.className = state.usd.balance >= 0 ? 'positive' : 'negative';
        }

        // Update Customer Statistics
        const customerElements = {
            total: document.getElementById('totalCustomers'),
            active: document.getElementById('activeCustomers'),
            pending: document.getElementById('pendingBalances')
        };

        if (customerElements.total) customerElements.total.textContent = state.customers.total;
        if (customerElements.active) customerElements.active.textContent = state.customers.active;
        if (customerElements.pending) customerElements.pending.textContent = state.customers.pending;

        // Calculate and update profit
        calculateProfit();
    } catch (e) {
        console.error('Error in updateDisplay:', e);
    }
}

// Calculate profit in USD
function calculateProfit() {
    try {
        const afnRate = parseFloat(document.getElementById('afnRate').value) || 89.5;
        const goldRate = parseFloat(document.getElementById('goldRate').value) || 2000;

        // USD profit is direct from balance
        const usdProfit = state.usd.balance;
        document.getElementById('profitUSD').textContent = formatNumber(usdProfit);
        
        // Gold profit calculation: (net gold / 12.15) * gold rate
        const goldProfit = (state.gold.balance / 12.15) * goldRate;
        document.getElementById('profitGold').textContent = formatNumber(goldProfit);
        
        // AFN profit calculation: net AFN / AFN rate
        const afnProfit = state.afn.balance / afnRate;
        document.getElementById('profitAFN').textContent = formatNumber(afnProfit);
        
        // Calculate total profit
        const totalProfit = usdProfit + goldProfit + afnProfit;
        const totalProfitElement = document.getElementById('totalProfit');
        
        if (totalProfitElement) {
            totalProfitElement.textContent = formatNumber(totalProfit);
            // Add positive/negative class based on the value
            totalProfitElement.className = totalProfit >= 0 ? 'positive' : 'negative';
        }

        // Log calculations for debugging
        console.log('Profit Calculations:', {
            usd: { balance: state.usd.balance, profit: usdProfit },
            gold: { balance: state.gold.balance, rate: goldRate, profit: goldProfit },
            afn: { balance: state.afn.balance, rate: afnRate, profit: afnProfit },
            total: totalProfit
        });
    } catch (e) {
        console.error('Error calculating profit:', e);
    }
}

// Initialize dashboard
function initializeDashboard() {
    try {
        // Start with "All Time" view
        const startDate = new Date(0); // Unix epoch start
        calculateTransactions(startDate);

        // Add event listeners for rate inputs
        const afnRate = document.getElementById('afnRate');
        const goldRate = document.getElementById('goldRate');

        if (afnRate) {
            afnRate.addEventListener('input', () => {
                console.log('AFN Rate changed:', afnRate.value);
                calculateProfit();
            });
        }
        if (goldRate) {
            goldRate.addEventListener('input', () => {
                console.log('Gold Rate changed:', goldRate.value);
                calculateProfit();
            });
        }

        // Handle date range changes
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                const today = new Date();
                let startDate;

                switch(e.target.value) {
                    case 'all':
                        startDate = new Date(0); // Start from Unix epoch
                        break;
                    case 'today':
                        startDate = new Date(today.setHours(0,0,0,0));
                        break;
                    case 'week':
                        startDate = new Date(today.setDate(today.getDate() - 7));
                        break;
                    case 'month':
                        startDate = new Date(today.setMonth(today.getMonth() - 1));
                        break;
                    case 'year':
                        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
                        break;
                    default:
                        startDate = new Date(0); // Default to all time
                }

                calculateTransactions(startDate);
            });
        }
    } catch (e) {
        console.error('Error initializing dashboard:', e);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// Navigation animation
const navLink = document.querySelector('.nav-link');
navLink.addEventListener('mouseover', () => {
    navLink.style.transform = 'translateX(10px)';
});

navLink.addEventListener('mouseout', () => {
    navLink.style.transform = 'translateX(0)';
});

// Simulated real-time updates (for demo purposes)
setInterval(() => {
    sales.daily += Math.random() * 10;
    sales.total += sales.daily;
    profit.daily += Math.random() * 5;
    profit.total += profit.daily;
    
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('profit', JSON.stringify(profit));
    
    updateDisplays();
}, 5000);
