// Motion on this site is mostly CSS transition, and JS just adds a class when the time comes, as in the original (measuring positions with ScrollTrigger).
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const header = document.querySelector(".cd-header");

  // Split the English section name into letters — each letter stands up 35ms later (--i)
  document.querySelectorAll("[data-split-text]").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.setProperty("--i", i + 1);
      el.append(s);
    });
    el.setAttribute("aria-label", text);
  });

  // In-section navigation — original: gsap scrollTo 1s power3.inOut, minus the header height
  const go = (key) => {
    const to = document.querySelector(`[data-anchor-target="${key}"]`);
    if (!to) return;
    const y = to.getBoundingClientRect().top + scrollY - (header ? header.clientHeight : 0);
    gsap.to(window, { duration: 1, ease: "power3.inOut", scrollTo: y });
  };
  document.querySelectorAll("[data-anchor]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    header?.classList.remove("is-open");
    go(b.dataset.anchor);
  }));
  document.querySelector(".cd-nav__toggle")?.addEventListener("click", (e) => {
    const open = header.classList.toggle("is-open");
    e.currentTarget.setAttribute("aria-expanded", open ? "true" : "false");
  });

  const mm = gsap.matchMedia();
  mm.add({ normal: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const shows = document.querySelectorAll("[data-scroll-show]");
    if (ctx.conditions.reduce) { shows.forEach((el) => el.classList.add("is-show")); }
    else {
      // Once when visible — when the top edge reaches 80% of the screen
      shows.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, toggleClass: { targets: el, className: "is-show" } }));
    }
    // Header: once the hero’s top edge passes above the screen, a white panel spreads and shrinks
    if (header && document.querySelector(".cd-mv")) {
      ScrollTrigger.create({ trigger: ".cd-mv", start: "top 0%", onEnter: () => header.classList.add("is-scroll"), onLeaveBack: () => header.classList.remove("is-scroll") });
    }
    // Floating Free consultation round button — appears after the News section and hides once the Contact section is visible
    const float = document.querySelector(".cd-float");
    if (float) {
      ScrollTrigger.create({ trigger: ".cd-news", start: "top 0%", onEnter: () => float.classList.add("is-show"), onLeaveBack: () => float.classList.remove("is-show") });
      ScrollTrigger.create({ trigger: ".cd-contact", start: "top 100%", onEnter: () => float.classList.remove("is-show"), onLeaveBack: () => float.classList.add("is-show") });
    }
  });
})();
