import { apiRequest } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector('#signup-form');
    const loginForm = document.querySelector('#login-form');
    // const logoutBtn = document.querySelector('#logout-btn');

    if (signupForm) handleSignup(signupForm);
    if (loginForm) handleLogin(loginForm);
});


// =================== SIGNUP HANDLER ===================
function handleSignup(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        const address = document.querySelector('#address').value;
        const phone = document.querySelector('#phone').value;

        const userInput = { name, username: email, password, address, phone };

        try {
            localStorage.setItem("token", null);

            const user = await apiRequest("/auth/signup", "POST", userInput);

            alert("Signup successful! Please log in.");
            // window.location.href = "/login.html";
        }
        catch (err) {
            console.error("Signup Error:", err.message);
            if (err.message.includes("409")) {
                alert("User already exists! Please log in instead.");
            } else {
                alert("Signup failed. Please try again.");
            }
        }
    });
}


// =================== LOGIN HANDLER ===================
function handleLogin(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        localStorage.removeItem("token");

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        const credentials = { username: email, password };

        try {
            const response = await apiRequest("/auth/login", "POST", credentials);

            localStorage.setItem("token", response.jwtToken);
            localStorage.setItem("username", response.username);
            localStorage.setItem("roles", response.roles);

            alert(`Welcome back, ${response.username}!`);
            window.location.href = "/dashboard.html";
        }
        catch (err) {
            console.error("Login Error:", err.message);

            if (err.message.includes("401")) {
                alert("Invalid email or password!");
            } else {
                alert("Login failed. Please try again.");
            }
        }
    });
}


function logOut() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
}