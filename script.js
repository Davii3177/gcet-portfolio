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

    const bubble = document.getElementById("scotty-bubble");
    let bubbleTimer;
    let audioCtx;

    const playBark = () => {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = audioCtx || new Ctx();
        const now = audioCtx.currentTime;

        [0, 0.16].forEach((offset) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(320, now + offset);
          osc.frequency.exponentialRampToValueAtTime(90, now + offset + 0.11);
          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.28, now + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.13);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.15);
        });
      } catch (e) {}
    };

    const bark = () => {
      playBark();

      scotty.classList.remove("is-barking");
      // eslint-disable-next-line no-unused-expressions
      scotty.offsetWidth;
      scotty.classList.add("is-barking");

      if (bubble) {
        bubble.classList.add("is-visible");
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => {
          bubble.classList.remove("is-visible");
        }, 900);
      }
    };

    scotty.addEventListener("click", bark);
    scotty.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        bark();
      }
    });
  }

  const sidebarHide = document.getElementById("sidebar-hide");
  const sidebarShow = document.getElementById("sidebar-show");

  const setSidebarHidden = (hidden) => {
    document.body.classList.toggle("sidebar-hidden", hidden);
    try {
      localStorage.setItem("sidebarHidden", hidden ? "1" : "0");
    } catch (e) {}
  };

  if (sidebarHide) {
    sidebarHide.addEventListener("click", () => setSidebarHidden(true));
  }
  if (sidebarShow) {
    sidebarShow.addEventListener("click", () => setSidebarHidden(false));
  }
  try {
    if (localStorage.getItem("sidebarHidden") === "1") {
      setSidebarHidden(true);
    }
  } catch (e) {}

  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle("is-visible", window.scrollY > 400);
      },
      { passive: true }
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
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
