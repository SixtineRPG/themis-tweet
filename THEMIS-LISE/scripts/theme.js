export function initTheme() {
  const themeToggle = document.querySelector("#theme-toggle");
  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("night-mode");

    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun" aria-hidden="true"></i> Mode clair' : '<i class="fa-solid fa-moon" aria-hidden="true"></i> Mode sombre';
  });
}
