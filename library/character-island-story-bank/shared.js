// Header row of the bank’s main-site sections (rules · services · detail) — clicking a menu cell · login fades the panel in after .1s over .2s, and clicking another item, outside, or pressing Esc closes it.
// On phones the hamburger opens the menu row. The round ”Back to top” button appears after scrolling more than one screen.
(() => {
  const head = document.querySelector(".lb-head");
  if (!head) return;
  const toggles = [...head.querySelectorAll("[data-panel]")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // jQuery swing = A curve close to 0.5 − cos(πp)/2
  const SWING = "cubic-bezier(0.37, 0, 0.63, 1)";
  // Original gnav panel: fadeIn(200) about 100ms after the press — delay and length measured with motion-probe. On close, fadeOut(200)
  const slide = (panel, open) => {
    if (!panel) return;
    panel.getAnimations().forEach((a) => a.cancel());
    if (reduce) { panel.classList.toggle("is-open", open); return; }
    if (open) {
      panel.classList.add("is-open");
      panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 100, easing: SWING, fill: "backwards" });
    } else {
      panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: SWING }).onfinish = () => panel.classList.remove("is-open");
    }
  };
  const close = (except) => {
    for (const t of toggles) {
      if (t === except || t.getAttribute("aria-expanded") !== "true") continue;
      t.setAttribute("aria-expanded", "false");
      slide(document.getElementById(t.dataset.panel), false);
    }
  };
  for (const t of toggles) {
    t.setAttribute("aria-expanded", "false");
    t.addEventListener("click", (e) => {
      e.preventDefault();
      const open = t.getAttribute("aria-expanded") !== "true";
      close(t);
      t.setAttribute("aria-expanded", String(open));
      slide(document.getElementById(t.dataset.panel), open);
    });
  }

  // Body accordion — original slideToggle(300)
  for (const btn of document.querySelectorAll(".lb-acc__btn")) {
    const body = btn.closest(".lb-acc__item")?.querySelector(".lb-acc__body");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      if (!body) return;
      body.getAnimations().forEach((a) => a.cancel());
      if (open) body.hidden = false;
      const h = body.scrollHeight;
      if (reduce) { body.hidden = !open; return; }
      const anim = body.animate([{ height: open ? "0px" : `${h}px` }, { height: open ? `${h}px` : "0px" }], { duration: 300, easing: SWING });
      if (!open) anim.onfinish = () => { body.hidden = true; };
    });
  }
  document.addEventListener("click", (e) => { if (!head.contains(e.target)) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const shrink = () => head.classList.toggle("is-scrolled", scrollY > 100);
  addEventListener("scroll", shrink, { passive: true });
  shrink();

  const burger = head.querySelector(".lb-burger");
  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    head.classList.toggle("is-menu", open);
    if (!open) close();
  });

  const top = document.querySelector(".lb-site-top");
  if (top) {
    const check = () => top.classList.toggle("is-shown", scrollY > innerHeight);
    addEventListener("scroll", check, { passive: true });
    check();
    top.addEventListener("click", (e) => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }
})();
