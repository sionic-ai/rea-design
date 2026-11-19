// Program guide — FAQ open/close (original function.js #faq: fix the current height, toggle .close, then switch to auto/0 at 100ms) and
// 700ms swing scroll for same-page table-of-contents links (offset 150px for the header row · 70px on phone)
(() => {
  document.querySelectorAll(".ac-faq dt").forEach((dt) => {
    const dd = dt.nextElementSibling;
    dd.style.height = "0px";
    dt.setAttribute("role", "button");
    dt.tabIndex = 0;
    dt.setAttribute("aria-expanded", "false");
    const toggle = () => {
      const open = dt.classList.contains("is-open");
      dd.style.height = `${dd.firstElementChild.offsetHeight}px`;
      if (open) dd.offsetHeight;
      dd.classList.toggle("is-close", open);
      dt.classList.toggle("is-open", !open);
      dt.setAttribute("aria-expanded", String(!open));
      // The original applies auto/0 on the next image after a 100ms timer (measured end 204ms) — we defer by one frame after the timer
      setTimeout(() => requestAnimationFrame(() => { dd.style.height = open ? "0px" : "auto"; }), 100);
    };
    dt.addEventListener("click", toggle);
    dt.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  const swing = (t) => 0.5 - Math.cos(t * Math.PI) / 2;
  document.querySelectorAll('.ac-pnav a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const from = scrollY, end = to.getBoundingClientRect().top + scrollY - (innerWidth > 768 ? 150 : 70);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { scrollTo(0, end); return; }
    const t0 = performance.now();
    const step = (now) => { const t = Math.min(1, (now - t0) / 700); scrollTo(0, from + (end - from) * swing(t)); if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }));
})();
