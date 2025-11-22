import { apiRequest, smoothReload } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    getAllInventory();
    const form = document.querySelector('#add-inventory-form');
    if (form) addInventory(form);
});


async function getAllInventory() {
    try {
        const inventories = await apiRequest('/admin/getAllInventory');
        if (!inventories) return;

        const tableBody = document.querySelector('#inventory-table tbody');
        const totalinventoryCard = document.querySelector('#total-inventory');

        totalinventoryCard.textContent = inventories.length;

        if (!tableBody) return;

        tableBody.innerHTML = inventories.map(product => `
            <tr data-id="${product.id}" class="hover:bg-gray-50 transition"> 
                            <td class="px-6 py-3">${product.name}</td>
                            <td class="px-6 py-3">${product.category}</td>
                            <td class="px-6 py-3">${product.price}</td>
                            <td class="px-6 py-3 text-green-600">${product.stockQuantity}</td>
                            <td class="px-6 py-3">${product.description}</td>
                            <td class="px-6 py-3 text-right">
                                <button
                                    class="threeDot hover:bg-gray-200 py-1 px-1 text-center rounded-md cursor-pointer">
                                    <i class="fa-solid fa-ellipsis"></i>
                                </button>
                            </td>
                        </tr> 
      `).join('');
        threeDotFunction();
    } catch (err) {
        console.error('Error fetching inventories:', err);
        alert('Failed to load inventories.');
    }
}

function threeDotFunction() {
    const tableBody = document.querySelector('#inventory-table tbody');

    tableBody.replaceWith(tableBody.cloneNode(true));
    const newTableBody = document.querySelector('#inventory-table tbody');

    newTableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.threeDot');

        if (!btn) return; // clicked elsewhere

        const row = btn.closest('tr');
        const id = row.dataset.id;

        if (id) {
            console.log('Selected inventory ID:', id);
            deleteInventory(id);
            updateInventory(id);
        }
    });
}

function deleteInventory(id) {
    const deleteBtn = document.querySelector('#remove-product-btn');
    deleteBtn.addEventListener('click', async () => {
        const response = await apiRequest(`/admin/deleteInventory/${id}`, 'DELETE');
        smoothReload();
    });
}


export function addInventory(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const description = form.querySelector('#description').value.trim();
        const category = form.querySelector('#category').value.trim();
        const price = form.querySelector('#price').value.trim();
        const stockQuantity = form.querySelector('#stockQuantity').value.trim();

        if (!name || !description || !category || !price || !stockQuantity) {
            alert('Please fill in all fields.');
            return;
        }

        const inventory = { name, description, category, price, stockQuantity };
        try {
            await apiRequest('/admin/addInventory', 'POST', inventory);
            form.reset();
            smoothReload();
        } catch (err) {
            console.error('Error adding Inventory:', err);
            alert('Failed to add Inventory.');
        }
    });
}


function updateInventory(id) {
    const form = document.querySelector('#update-inventory-form');
    const updateBtn = document.querySelector('#edit-inventory-btn');
    const saveBtn = document.querySelector('#save-inventory-btn');

    const restockStockQuantityBtn = document.querySelector('#restock-btn');
    const restockForm = document.querySelector('#restock-stock-form');
    const restockBtn = document.querySelector('#restock-product-btn');


    if (!form || !updateBtn || !saveBtn || !restockStockQuantityBtn) {
        console.error('Required elements not found in the DOM.');
        return;
    }

    updateBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const inventory = await apiRequest(`/admin/getInventoryById/${id}`);

            if (!inventory) {
                alert('Inventory not found.');
                return;
            }

            console.log(inventory);

            const { name, price, description, stockQuantity, category } = inventory;

            form.querySelector('#name').value = name || '';
            form.querySelector('#price').value = price || '';
            form.querySelector('#description').value = description || '';
            form.querySelector('#stockQuantity').value = stockQuantity || '';
            form.querySelector('#category').value = category || '';

        } catch (error) {
            console.error('Error fetching Inventory:', error);
            alert('Failed to load inventory details. Please try again.');
        }
    });

    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const updateInventoryData = {
            name: form.querySelector('#name').value.trim(),
            price: form.querySelector('#price').value.trim(),
            category: form.querySelector('#category').value.trim(),
            stockQuantity: form.querySelector('#stockQuantity').value.trim(),
            description: form.querySelector('#description').value.trim()
        };

        if (Object.values(updateInventoryData).some(v => !v)) {
            alert('Please fill out all fields before saving.');
            return;
        }

        try {
            const response = await apiRequest(`/admin/updateInventory/${id}`, 'PUT', updateInventoryData)
                .then(() => {
                    smoothReload();
                })
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('Failed to update customer. Please try again.');
        }
    });

    restockBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const namePara = document.querySelector('#product-name-paraTag');

        const inventory = await apiRequest(`/admin/getInventoryById/${id}`);
        namePara.innerHTML = `Update stock quantity for ${inventory.name}`

        restockForm.querySelector('#stockQuantity').value = inventory.stockQuantity;
        restockStockQuantityBtn.addEventListener('click', async (element) => {
            element.preventDefault();
            const newStock = restockForm.querySelector('#stockQuantity').value;
            apiRequest(`/admin/updateStockQuantity/${id}`, 'PUT', newStock).then(() => {
                smoothReload();
            })
        })
    })
}