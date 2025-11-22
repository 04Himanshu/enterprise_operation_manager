import { addCustomer } from "./customers.js";
import { addInventory } from "./inventory.js";

document.addEventListener("DOMContentLoaded", () => {
    const addCustomerForm = document.querySelector('#add-customer-form');
    const addInventoryForm = document.querySelector('#add-inventory-form');
    if (addCustomerForm) {
        addCustomer(addCustomerForm);
    }
    if (addInventoryForm) {
        addInventory(addInventoryForm);
    }
});