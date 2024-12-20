// Get customer ID from URL
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');

// Load customer data
function loadCustomerData() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.id === parseInt(customerId));
    
    if (customer) {
        document.querySelector('.content').innerHTML = `
            <div class="customer-details">
                <h2>Customer Details - G Page</h2>
                <div class="detail-row">
                    <span>ID:</span>
                    <span>${customer.id}</span>
                </div>
                <div class="detail-row">
                    <span>Name:</span>
                    <span>${customer.name}</span>
                </div>
                <div class="detail-row">
                    <span>Address:</span>
                    <span>${customer.address}</span>
                </div>
                <div class="detail-row">
                    <span>Notes:</span>
                    <span>${customer.notes}</span>
                </div>
            </div>
        `;
    }
}

// Initialize
loadCustomerData();
