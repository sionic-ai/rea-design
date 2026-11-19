// Menu panel open/close and Studio-style entrance — first leave it as .is-pre (blurred·transparent), then remove it when it enters view so it returns to place
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const btn = document.querySelector(".ud-menu-btn");
  const menu = document.querySelector(".ud-menu");
  if (btn && menu) {
    let cover = 0;
    const set = (open) => {
      // In the original, the moment the modal covers the button (measured: the background starts changing .13~.16s after the press) the button hover is released and the background returns to paper color in .3s — if the pointer doesn’t move the browser won’t release hover, so we set it with a marker
      clearTimeout(cover);
      if (open) cover = setTimeout(() => btn.classList.add("is-covered"), 35);
      else btn.classList.remove("is-covered");
      btn.classList.toggle("open", open);
      menu.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    };
    btn.addEventListener("click", () => set(!menu.classList.contains("open")));
    menu.querySelector(".ud-menu-close")?.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  const appear = [...document.querySelectorAll(".ap, .ap-fade, .ap-pop, .ap-tilt")];
  const toggles = [...document.querySelectorAll("[data-on]")];
  if (reduce) { toggles.forEach((el) => el.classList.add("is-on")); return; }
  appear.forEach((el) => el.classList.add("is-pre"));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.remove("is-pre");
    e.target.classList.add("is-on");
    io.unobserve(e.target);
  }));
  // Watch only after painting the first image with .is-pre, so the transition fires when it is released
  requestAnimationFrame(() => requestAnimationFrame(() => appear.concat(toggles).forEach((el) => io.observe(el))));
})();
