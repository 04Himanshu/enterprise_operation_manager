import { apiRequest, smoothReload } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const customerSearchForm = document.querySelector("#customer-search-form");
    const customerResponseDetailsForm = document.querySelector("#customer-response-details-form");
    const orderForm = document.querySelector("#order-form");
    if (!customerSearchForm || !customerResponseDetailsForm || !orderForm) return;

    initCustomerSearch(customerSearchForm, customerResponseDetailsForm, orderForm);
    getAllOrders();
});


//  Customer Search Function
function initCustomerSearch(customerSearchForm, customerResponseDetailsForm, orderForm) {
    const searchBtn = customerSearchForm.querySelector("#search-btn");

    searchBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const customer = getFormData(customerSearchForm, ["name", "username"]);
        const customerResponse = await apiRequest("/admin/getCustomerByNameAndUsername", "POST", customer);
        customerSearchForm.reset();

        if (customerResponse) {
            populateCustomerDetails(customerResponseDetailsForm, customerResponse);
            await populateInventory(orderForm, customer);
        } else {
            showElement("#first-register-customer");
        }
    });
}


//  Populate Customer Details
function populateCustomerDetails(form, customerData) {
    form.classList.replace("hidden", "grid");

    ["name", "phone", "username", "address"].forEach((field) => {
        const input = form.querySelector(`#${field}`);
        if (input) input.value = customerData[field] ?? "";
    });
}


//  Load Inventory
async function populateInventory(orderForm, customer) {
    const inventories = await apiRequest("/admin/getAllInventory");
    const itemsContainer = orderForm.querySelector("#items");

    inventories.forEach(({ id, name }) => {
        const option = new Option(name, id);
        itemsContainer.appendChild(option);
    });

    initOrderCreation(itemsContainer, orderForm, customer);
}


//  Create Order Logic
function initOrderCreation(itemsContainer, orderForm, customer) {
    const orderedList = document.querySelector("#ordered-list");
    const saveBtn = orderForm.querySelector("#saveBtn");
    const createOrderBtn = document.querySelector("#create-order-btn");

    const orderData = { customer, orderItems: [] };

    saveBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const quantity = parseInt(orderForm.querySelector("#quantity").value);
        const selectedOptions = Array.from(itemsContainer.selectedOptions);

        if (!selectedOptions.length || !quantity) return;

        selectedOptions.forEach((option) => {
            const id = parseInt(option.value);

            // Avoid duplicates
            if (orderData.orderItems.some((item) => item.inventory.id === id)) return;

            orderData.orderItems.push({ inventory: { id }, quantity });
            addListItem(orderedList, option.textContent, quantity, id, orderData);
        });

        toggleListVisibility(orderedList, true);
        orderForm.reset();
    });

    createOrderBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!orderData.orderItems.length) return alert("Please add at least one item.");

        const response = await apiRequest("/staff/createOrder", "POST", orderData);
        if (response) {
            smoothReload();
        }
    });
}


//  Utility Functions
function getFormData(form, fields) {
    return fields.reduce((acc, field) => {
        const input = form.querySelector(`#${field}`);
        acc[field] = input ? input.value.trim() : "";
        return acc;
    }, {});
}

function showElement(selector) {
    const el = document.querySelector(selector);
    el?.classList.remove("hidden");
}

function toggleListVisibility(list, show = true) {
    list.classList.toggle("hidden", !show);
    list.classList.toggle("flex", show);
}

function addListItem(list, name, quantity, id, orderData) {
    const li = document.createElement("li");
    li.className = "px-2 bg-blue-100 rounded-xl flex items-center";
    li.innerHTML = `
    <p class="font-medium">${name}: <span>${quantity}</span></p>
    <i class="fa-solid fa-xmark text-sm text-gray-600 cursor-pointer ml-2 close-order-list"></i>
  `;

    // Handle remove
    li.querySelector(".close-order-list").addEventListener("click", () => {
        li.remove();
        orderData.orderItems = orderData.orderItems.filter((item) => item.inventory.id !== id);
        if (!orderData.orderItems.length) toggleListVisibility(list, false);
    });

    list.appendChild(li);
}


async function getAllOrders() {
    const data = await apiRequest('/staff/getAllOrders');
    const orderCard = document.querySelector('#total-orders-card');
    orderCard.innerHTML = `${data.length}`;
    renderOrderTable(data);
    threeDotFunction();
}

function renderOrderTable(orders) {
    const tableBody = document.querySelector('#order-table tbody');
    tableBody.innerHTML = ''; // clear old rows

    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-6 text-gray-500">No orders found</td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        const totalQuantity = (order.orderItems || []).reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
        );

        const tr = document.createElement('tr');
        tr.setAttribute('data-id', `${order.id}`);
        tr.className = 'hover:bg-gray-50 transition text-sm sm:text-base';

        // Customer
        const customerTd = document.createElement('td');
        customerTd.className = 'px-6 py-4 whitespace-nowrap align-top';
        customerTd.innerHTML = `
            <div class="font-semibold">${order.customerName}</div>
            <div class="text-gray-500 text-sm">${order.customerUsername}</div>
        `;

        // Items
        const itemsTd = document.createElement('td');
        itemsTd.className = 'px-6 py-4 align-top';
        itemsTd.innerHTML = `
            <span class="text-gray-700 font-medium">
                ${(order.orderItems || []).map(item => item.productName).join(', ')}
            </span>
        `;

        // Total quantity
        const quantityTd = document.createElement('td');
        quantityTd.className = 'px-6 py-4 text-gray-700 font-medium whitespace-nowrap align-top';
        quantityTd.textContent = totalQuantity;

        // Status
        const statusTd = document.createElement('td');
        statusTd.className = `
            px-6 py-4 font-semibold whitespace-nowrap align-top
            ${order.status === 'Pending'
                ? 'text-yellow-600'
                : order.status === 'Ordered'
                    ? 'text-green-600'
                    : 'text-gray-600'}
        `;
        statusTd.textContent = order.status;

        // Action
        const actionTd = document.createElement('td');
        actionTd.className = 'px-6 py-4 text-right whitespace-nowrap align-top';
        actionTd.innerHTML = `
            <button class="threeDot hover:bg-gray-200 py-1 px-2 text-center rounded-md cursor-pointer">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
        `;

        tr.append(customerTd, itemsTd, quantityTd, statusTd, actionTd);
        tableBody.appendChild(tr);
    });
}


// Main: Handle 3-dot click and fetch invoice data
function threeDotFunction() {
    const tableBody = document.querySelector('#order-table tbody');

    // Prevent duplicate listeners (use event delegation)
    const newTableBody = tableBody.cloneNode(true);
    tableBody.replaceWith(newTableBody);

    newTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.threeDot');
        if (!btn) return;

        const row = btn.closest('tr');
        const id = row.dataset.id;
        const firstCell = row.querySelector('td');
        if (!firstCell) return;

        // Extract name and username
        const parts = firstCell.innerText.split('\n').map(p => p.trim()).filter(Boolean);
        const customer = {
            name: parts[0] || '',
            username: parts[1] || ''
        };

        try {
            // Fetch invoice data from API
            const invoiceData = await apiRequest('/staff/createInvoice', 'POST', customer);

            printInvoice(customer);

            // The API returns an array, use first element
            const order = Array.isArray(invoiceData) ? invoiceData[0] : invoiceData;
            if (order) {
                populateInvoice(order);
            }
            else {
                console.error("Invalid invoice data response:", invoiceData);
            }
        } catch (err) {
            console.error("Error fetching invoice:", err);
        }
    });
}

// Populate invoice popup with API data
function populateInvoice(order) {
    const popup = document.querySelector("#invoice-popup");

    const {
        orderId,
        date,
        paymentStatus,
        customerName,
        username,
        phone,
        orderItems,
        totalItemsPrice
    } = order;

    // Cache elements for faster updates
    const els = {
        invoiceId: popup.querySelector("[data-invoice-id]"),
        orderId: popup.querySelector("[data-order-id]"),
        date: popup.querySelector("[data-date]"),
        paymentStatus: popup.querySelector("[data-payment-status]"),
        customerName: popup.querySelector("[data-customer-name]"),
        customerEmail: popup.querySelector("[data-customer-email]"),
        customerPhone: popup.querySelector("[data-customer-phone]"),
        tbody: popup.querySelector("tbody"),
        subtotal: popup.querySelector("[data-subtotal]"),
        tax: popup.querySelector("[data-tax]"),
        total: popup.querySelector("[data-total]")
    };

    // Fill invoice details
    els.invoiceId.textContent = `INV-${String(orderId).padStart(4, "0")}`;
    els.orderId.textContent = orderId;
    els.date.textContent = new Date(date).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric"
    });

    els.paymentStatus.textContent = paymentStatus ? "Paid" : "Unpaid";
    els.paymentStatus.className = `font-semibold ${paymentStatus ? "text-green-600" : "text-red-600"}`;

    els.customerName.textContent = customerName;
    els.customerEmail.textContent = username;
    els.customerPhone.textContent = `+91 ${phone}`;

    // Render order items
    els.tbody.innerHTML = orderItems.map(({ productName, quantity, price, totalPrice }) => `
        <tr class="border-b last:border-none">
            <td class="py-3 px-4">${productName}</td>
            <td class="py-3 px-4 text-right">${quantity}</td>
            <td class="py-3 px-4 text-right">${formatCurrency(price)}</td>
            <td class="py-3 px-4 text-right">${formatCurrency(totalPrice)}</td>
        </tr>
    `).join("");

    console.log("totalItemsPrice:".totalItemsPrice);

    // Totals
    let subtotal = Number(totalItemsPrice);

    console.log("subtotal:", subtotal);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    els.subtotal.textContent = formatCurrency(subtotal);
    els.tax.textContent = formatCurrency(tax);
    els.total.textContent = formatCurrency(total);
}

// Utility: Currency formatter
function formatCurrency(num) {
    return `₹ ${Number(num).toLocaleString("en-IN")}`;
}


function cancelOrder(id) {
    const cancelBtn = document.querySelector("#cancel-order-btn");
    cancelBtn.addEventListener('click', async () => {
        apiRequest(`/staff/cancelOrder/${id}`, 'DELETE');
        smoothReload();
    })
}

function printInvoice(customer) {
    const btn = document.querySelector('#invoice-print-btn');
    btn.addEventListener('click', () => {
        fetch("http://localhost:8080/api/v1/staff/createPdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(customer)
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "invoice.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    })
}