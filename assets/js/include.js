async function includeHTML() {
    const includeElements = document.querySelectorAll("[data-include]");
    for (let el of includeElements) {
        const file = el.getAttribute("data-include");
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const html = await response.text();
            el.innerHTML = html;
        } catch (error) {
            el.innerHTML = "<p>Failed to load component.</p>";
            console.error(error);
        }

        if (file.includes("navbar.html")) {
            setupNavbarToggle();
        }
    }
}

function setupNavbarToggle() {
    const openMenu = document.getElementById("open-menu");
    const closeMenu = document.getElementById("close-menu");
    const closeNavbar = document.getElementById("close-navbar");

    if (openMenu && closeMenu && closeNavbar) {
        openMenu.addEventListener("click", () => {
            closeNavbar.classList.remove("hidden");
        });

        closeMenu.addEventListener("click", () => {
            closeNavbar.classList.add("hidden");
        });
    } else {
        console.warn("Navbar toggle elements not found!");
    }
}

function handleToggle() {
    const openMenu = document.querySelector('#open-menu');
    const closeMenu = document.querySelector('#close-menu');
    const closeNavbar = document.querySelector('#close-navbar');

    openMenu.addEventListener('click', () => {
        closeNavbar.classList.toggle('hidden');
    });

    closeMenu.addEventListener('click', () => {
        closeNavbar.classList.toggle('hidden');
    });
}

window.addEventListener("DOMContentLoaded", includeHTML);