(() => {
  "use strict";

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");

  if (nav) {
    const todayLink = nav.querySelector('a[href="almanac.html"]');
    if (todayLink) {
      todayLink.textContent = "Today";
      nav.prepend(todayLink);
    }
  }

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 981px)").matches) {
      setMenuOpen(false);
    }
  });

  function setMenuOpen(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
})();
