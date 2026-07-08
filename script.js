document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const labelFor = (theme) =>
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

    themeToggle.setAttribute(
      "aria-label",
      labelFor(document.documentElement.getAttribute("data-theme"))
    );

    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      themeToggle.setAttribute("aria-label", labelFor(next));
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  }

  const scotty = document.getElementById("scotty");
  if (scotty) {
    let lastScrollY = window.scrollY;
    let scottyResetTimer;

    window.addEventListener(
      "scroll",
      () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        const tilt = Math.max(-18, Math.min(18, delta * 2.5));
        const bounce = Math.max(-10, Math.min(10, -delta));
        scotty.style.transform = `translateY(${bounce}px) rotate(${tilt}deg)`;

        clearTimeout(scottyResetTimer);
        scottyResetTimer = setTimeout(() => {
          scotty.style.transform = "translateY(0) rotate(0deg)";
        }, 180);
      },
      { passive: true }
    );
  }

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const sections = document.querySelectorAll("main section:not(.hero)");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((section) => {
    section.classList.add("reveal-section");
    observer.observe(section);
  });
});
