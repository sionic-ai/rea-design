// Subpage frame — sticky title bar indicator, MENU expand (.3s height), back-to-top button
(() => {
  const bar = document.querySelector(".pa-titlebar");
  const btn = document.querySelector(".pa-menu-btn"), panel = document.querySelector(".pa-subnav");
  if (btn && panel) btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    panel.style.height = open ? panel.scrollHeight + "px" : "0px";
  });
  const gTgl = document.querySelector(".pa-gnav__tgl"), gDrop = document.querySelector(".pa-gdrop");
  if (gTgl && gDrop) gTgl.addEventListener("click", (e) => {
    e.preventDefault();
    const open = gTgl.getAttribute("aria-expanded") !== "true";
    gTgl.setAttribute("aria-expanded", String(open));
    if (open) { gDrop.classList.add("is-open"); gDrop.style.height = gDrop.scrollHeight + "px"; }
    else { gDrop.style.height = "0px"; setTimeout(() => gTgl.getAttribute("aria-expanded") !== "true" && gDrop.classList.remove("is-open"), 300); }
  });
  const sBtn = document.querySelector(".pa-hsearch__btn"), sPanel = document.querySelector(".pa-hsearch__panel");
  if (sBtn && sPanel) sBtn.addEventListener("click", () => {
    const open = sBtn.getAttribute("aria-expanded") !== "true";
    sBtn.setAttribute("aria-expanded", String(open));
    sPanel.setAttribute("aria-hidden", String(!open));
    if (open) setTimeout(() => sPanel.querySelector("input")?.focus(), 300);
  });
  const top = document.querySelector(".pa-pagetop");
  const onScroll = () => {
    if (bar) bar.classList.toggle("is-stuck", bar.getBoundingClientRect().top <= 0 && scrollY > 0);
    top?.classList.toggle("is-show", scrollY > 200);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  document.querySelectorAll(".pa-pagetop, .js-pagetop").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
})();
