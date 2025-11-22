import { apiRequest } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    const usersTable = document.querySelector('#users-table tbody');
    if (!usersTable) return;
    getAllUsers(usersTable);
})

async function getAllUsers(usersTable) {
    const users = await apiRequest('/admin/users');

    const totalUsersCard = document.querySelector('#total-users-card');
    totalUsersCard.innerHTML = `${users.length}`;

    users.forEach(element => {
        const row = document.createElement('tr');
        row.classList = "hover:bg-gray-50 transition";
        row.innerHTML = `
                            <td class="px-6 py-3">${element.id}</td>
                            <td class="px-6 py-3">${element.name}</td>
                            <td class="px-6 py-3">${element.username}</td>
                            <td class="px-6 py-3">${element.roles}</td>
                            <td class="px-6 py-3">${element.createdAt}</td>
                            <td class="px-6 py-3">${element.updatedAt}</td>
        `;
        usersTable.append(row);
    });

}