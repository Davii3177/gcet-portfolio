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

  const scottyWrapper = document.getElementById("scotty-wrapper");
  const scotty = document.getElementById("scotty");
  const scottyClose = document.getElementById("scotty-close");
  const scottyShow = document.getElementById("scotty-show");

  if (scottyWrapper && scotty) {
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

    // Dragging: track pointer movement on the wrapper; a genuine click (no
    // movement past the threshold) triggers a bark instead of a reposition.
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const clampPosition = (left, top) => {
      const maxLeft = window.innerWidth - scottyWrapper.offsetWidth;
      const maxTop = window.innerHeight - scottyWrapper.offsetHeight;
      return {
        left: Math.max(0, Math.min(maxLeft, left)),
        top: Math.max(0, Math.min(maxTop, top)),
      };
    };

    const applyPosition = (left, top) => {
      scottyWrapper.style.left = left + "px";
      scottyWrapper.style.top = top + "px";
      scottyWrapper.style.right = "auto";
      scottyWrapper.style.bottom = "auto";
    };

    try {
      const savedPos = JSON.parse(localStorage.getItem("scottyPos") || "null");
      if (savedPos && typeof savedPos.left === "number" && typeof savedPos.top === "number") {
        const clamped = clampPosition(savedPos.left, savedPos.top);
        applyPosition(clamped.left, clamped.top);
      }
    } catch (e) {}

    scottyWrapper.addEventListener("pointerdown", (event) => {
      if (event.target === scottyClose || (scottyClose && scottyClose.contains(event.target))) {
        return;
      }
      dragging = true;
      moved = false;
      const rect = scottyWrapper.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      scottyWrapper.setPointerCapture(event.pointerId);
    });

    scottyWrapper.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        moved = true;
      }
      if (!moved) return;
      const clamped = clampPosition(startLeft + dx, startTop + dy);
      applyPosition(clamped.left, clamped.top);
    });

    scottyWrapper.addEventListener("pointerup", (event) => {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        const rect = scottyWrapper.getBoundingClientRect();
        try {
          localStorage.setItem("scottyPos", JSON.stringify({ left: rect.left, top: rect.top }));
        } catch (e) {}
      } else if (event.target !== scottyClose && !(scottyClose && scottyClose.contains(event.target))) {
        bark();
      }
    });

    scottyWrapper.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        bark();
      }
    });

    const setScottyHidden = (hidden) => {
      scottyWrapper.classList.toggle("is-hidden", hidden);
      if (scottyShow) {
        scottyShow.classList.toggle("is-visible", hidden);
      }
      try {
        localStorage.setItem("scottyHidden", hidden ? "1" : "0");
      } catch (e) {}
    };

    if (scottyClose) {
      scottyClose.addEventListener("click", () => setScottyHidden(true));
      scottyClose.addEventListener("pointerdown", (event) => event.stopPropagation());
    }
    if (scottyShow) {
      scottyShow.addEventListener("click", () => setScottyHidden(false));
    }
    try {
      if (localStorage.getItem("scottyHidden") === "1") {
        setScottyHidden(true);
      }
    } catch (e) {}
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

  const journalEntries = document.querySelectorAll(".journal-entry");
  const entryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entryObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  journalEntries.forEach((entry, index) => {
    entry.classList.add("reveal-item");
    entry.style.transitionDelay = (index % 4) * 0.08 + "s";
    entryObserver.observe(entry);
  });
});
