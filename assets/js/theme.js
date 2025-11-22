// Restore saved theme on load
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for navbar to load (if it's included dynamically)
  setTimeout(() => {
    const themeBtn = document.querySelector("#theme-toggle");

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");

        document.querySelector('nav').classList.toggle('navBar');

        // Save theme in localStorage
        const isDark = document.documentElement.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
      });
    }
  }, 300); // adjust delay if navbar loads slower
});
