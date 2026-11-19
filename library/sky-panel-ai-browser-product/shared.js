// Motion shared across pages — when the sky panel head leaves the screen, the white fixed header comes down in .15s,
// Hovering the menu turns on a panel in the top layer of the screen, growing in .15s. On phone, the burger opens the menu row as a panel
document.documentElement.classList.add("js");
gsap.registerPlugin(ScrollTrigger, CustomEase);

(() => {
  const out = kfFx.ease("0.22,1,0.36,1", "expo.out");
  const sticky = document.querySelector(".as-sticky");
  const heroNav = document.querySelector(".as-hero .as-nav");
  if (sticky && heroNav) {
    new IntersectionObserver(([e]) => sticky.classList.toggle("is-on", !e.isIntersecting), { rootMargin: "0px 0px 0px 0px" }).observe(heroNav);
  }

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // One layer above the screen — the menu panel and download tooltip are copied here and floated (the original moves a portal layer outside the header into that spot).
  // When on, the layer stands right in place and the inner grows from .95 at .15s, and when off the inner shrinks at .1s and vanishes
  // Like the original (radix portal), each time it opens a layer is created fresh and attached at 0,0, then moved into place on the next frame, and on close the inside shrinks and fades before it detaches
  let pop = null, owner = null, hideT = 0;
  const make = () => {
    const el = document.createElement("div");
    el.className = "as-pop";
    el.innerHTML = '<div class="as-pop__in"></div>';
    el.addEventListener("pointerenter", () => clearTimeout(hideT));
    el.addEventListener("pointerleave", () => hide());
    document.body.append(el);
    return el;
  };
  const show = (anchor, html, tip) => {
    clearTimeout(hideT);
    if (owner === anchor && pop) { pop.classList.remove("is-off"); return; }
    pop?.remove();
    pop = make();
    owner = anchor;
    const inner = pop.firstElementChild;
    inner.innerHTML = html;
    inner.classList.toggle("is-tip", !!tip);
    const el = pop;
    requestAnimationFrame(() => {
      if (pop !== el) return;
      const r = anchor.getBoundingClientRect();
      const w = inner.offsetWidth || 260;
      const x = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2));
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(r.bottom + (tip ? 8 : 2))}px)`;
      el.classList.add("is-on");
    });
  };
  const hide = () => {
    if (!pop) return;
    const el = pop;
    el.classList.add("is-off");
    hideT = setTimeout(() => { el.remove(); if (pop === el) { pop = null; owner = null; } }, 80);
  };
  document.querySelectorAll(".as-nav__item").forEach((item) => {
    const menu = item.querySelector(".as-menu");
    const btn = item.querySelector(".as-nav__btn");
    if (!menu) return;
    const open = () => { show(btn, menu.innerHTML, false); btn.setAttribute("aria-expanded", "true"); };
    const close = () => { btn.setAttribute("aria-expanded", "false"); hide(); };
    if (fine) {
      item.addEventListener("pointerenter", open);
      item.addEventListener("pointerleave", (e) => { if (!pop || !pop.contains(e.relatedTarget)) close(); });
    }
    btn.addEventListener("click", () => (owner === btn && pop ? close() : open()));
  });
  // Download button — on hover a short tooltip appears below, and tapping clears it right away
  if (fine) document.querySelectorAll(".as-get > button:first-child").forEach((b) => {
    b.addEventListener("pointerenter", () => show(b, "Your one-line how-to-receive note here", true));
    b.addEventListener("pointerleave", () => hide());
    b.addEventListener("pointerdown", () => hide());
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  addEventListener("scroll", () => owner && hide(), { passive: true });

  // Phone burger — unfolds the menu rows into a panel
  document.querySelectorAll(".as-nav__burger").forEach((b) => b.addEventListener("click", () => {
    const nav = b.closest(".as-nav");
    const on = nav.classList.toggle("is-sheet");
    b.setAttribute("aria-expanded", on ? "true" : "false");
    const menu = nav.querySelector(".as-nav__menu");
    if (on) gsap.fromTo(menu, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.2, ease: out });
  }));
})();
