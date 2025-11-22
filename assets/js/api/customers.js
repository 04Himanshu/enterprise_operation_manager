import { apiRequest, smoothReload } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
  getAllCustomers();
  const addCustomerForm = document.querySelector('#addCustomerForm');
  if (addCustomerForm) addCustomer(addCustomerForm);
});


export function addCustomer(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const username = form.querySelector('#username').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const address = form.querySelector('#address').value.trim();

    if (!name || !username || !phone || !address) {
      alert('Please fill in all fields.');
      return;
    }

    const customerObj = { name, username, phone, address };

    try {
      await apiRequest('/admin/addCustomer', 'POST', customerObj);
      // alert('Customer added successfully!');
      form.reset();
      // await getAllCustomers(); // Refresh list after adding
      smoothReload();
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Failed to add customer.');
    }
  });
}


async function getAllCustomers() {
  try {
    const customers = await apiRequest('/admin/allCustomers', 'GET');
    if (!customers) return;

    const tableBody = document.querySelector('#customers-table tbody');
    const totalCustomersCard = document.querySelector('#total-customers');
    totalCustomersCard.textContent = customers.length;

    if (!tableBody) return;

    tableBody.innerHTML = customers.map(c => `
      <tr data-id="${c.id}" class="hover:bg-gray-50 transition">
        <td class="px-6 py-3">${c.name}</td>
        <td class="px-6 py-3">${c.username}<br></td>
        <td class="px-6 py-3">${c.phone}</td>
        <td class="px-6 py-3">${c.address}</td>
        <td class="px-6 py-3">
          <button class="threeDot hover:bg-gray-200 py-1 px-1 text-center rounded-md cursor-pointer">
            <i class="fa-solid fa-ellipsis"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Attach event once globally (delegation)
    threeDotFunction();

  } catch (err) {
    console.error('Error fetching customers:', err);
    alert('Failed to load customers.');
  }
}

function threeDotFunction() {
  const tableBody = document.querySelector('#customers-table tbody');

  // Prevent duplicate listeners
  tableBody.replaceWith(tableBody.cloneNode(true));
  const newTableBody = document.querySelector('#customers-table tbody');

  // Event delegation — listen on table body, not each button
  newTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.threeDot');
    if (!btn) return; // clicked elsewhere

    const row = btn.closest('tr');
    const id = row.dataset.id;

    if (id) {
      deleteCustomerById(id);
      updateCustomer(id);
    }
  });
}


function deleteCustomerById(id) {
  const deleteBtn = document.querySelector('#delete-customer-btn');
  deleteBtn.addEventListener('click', async () => {
    apiRequest(`/admin/deleteCustomer/${id}`, 'DELETE')
      .then(() => {
        smoothReload();
      })
      .catch(err => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer.');
      });
  });
}

function updateCustomer(id) {
  const form = document.querySelector('#update-customer-form');
  const updateBtn = document.querySelector('#edit-customer-btn');
  const saveBtn = document.querySelector('#save-customer-btn');

  if (!form || !updateBtn || !saveBtn) {
    console.error('Required elements not found in the DOM.');
    return;
  }

  updateBtn.addEventListener('click', async () => {
    try {
      const customer = await apiRequest(`/admin/getCustomerById/${id}`);

      if (!customer) {
        alert('Customer not found.');
        return;
      }

      const { name, username, phone, address } = customer;

      form.querySelector('#name').value = name || '';
      form.querySelector('#email').value = username || '';
      form.querySelector('#phone').value = phone || '';
      form.querySelector('#address').value = address || '';

    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Failed to load customer details. Please try again.');
    }
  });

  saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const updatedCustomerData = {
      name: form.querySelector('#name').value.trim(),
      username: form.querySelector('#email').value.trim(),
      phone: form.querySelector('#phone').value.trim(),
      address: form.querySelector('#address').value.trim()
    };

    if (Object.values(updatedCustomerData).some(v => !v)) {
      alert('Please fill out all fields before saving.');
      return;
    }

    try {
      const response = await apiRequest(`/admin/updateCustomer/${id}`, 'PUT', updatedCustomerData)
        .then(() => {
          smoothReload();
        })
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  });
}