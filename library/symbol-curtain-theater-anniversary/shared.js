// Motion shared by all sections — carries over the original common.js (scrollClass · intervalChange · splitText) and the header and sitemap values.
// Float-up: is-shown once when the element’s top passes 80% of the screen (50% for centered type). Photo cycle: next photo every 5s (1.4s overlap).
// Text splitting: each letter floats up over .8s, 90ms later than the last. Sitemap: the circle at upper right opens in .9s (heavy1).
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.kgReduce = reduce;

  // Split text into characters (original splitText: delayChange 90ms)
  document.querySelectorAll(".js-splittext").forEach((el) => {
    const walk = (node, out) => node.childNodes.forEach((n) => {
      if (n.nodeType === 3) [...n.textContent].forEach((ch) => out.push([ch, null]));
      else out.push([null, n]);
    });
    const parts = [];
    walk(el, parts);
    el.textContent = "";
    let i = 0;
    parts.forEach(([ch, node]) => {
      if (node) {
        const t = node.textContent; node.textContent = "";
        [...t].forEach((c) => { const s = document.createElement("span"); s.className = "js-splittext__text"; s.style.transitionDelay = (i++ * 0.09) + "s"; s.textContent = c; node.append(s); });
        el.append(node);
        return;
      }
      const cell = document.createElement("span");
      cell.className = "js-splittext__cell";
      const s = document.createElement("span");
      s.className = "js-splittext__text";
      s.style.transitionDelay = (i++ * 0.09) + "s";
      s.textContent = ch;
      cell.append(s);
      el.append(cell);
    });
  });

  // Rise-in trigger
  const shown = (el) => el.classList.add("is-shown");
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) { document.querySelectorAll(".js-trigger, .js-trigger-center, .js-load-trigger").forEach(shown); return; }
    document.querySelectorAll(".js-trigger").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => shown(el) }));
    document.querySelectorAll(".js-trigger-center").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 50%", once: true, onEnter: () => shown(el) }));
  });
  addEventListener("load", () => setTimeout(() => document.querySelectorAll(".js-load-trigger").forEach(shown), 1300));

  // Photo rotation
  window.kgSlider = (root, { each = 5000, onChange } = {}) => {
    const items = [...root.querySelectorAll(":scope > li, :scope > ul > li, .js-slider__content > li")].filter((li, i, a) => a.indexOf(li) === i);
    if (items.length < 2 || reduce) return;
    let cur = Math.max(0, items.findIndex((li) => li.classList.contains("is-active")));
    setInterval(() => {
      items[cur].classList.remove("is-active");
      items[cur].classList.add("is-prev");
      const prev = cur;
      cur = (cur + 1) % items.length;
      items[cur].classList.add("is-active");
      setTimeout(() => items[prev].classList.remove("is-prev"), 1400);
      onChange?.(cur, items[cur]);
    }, each);
  };
  document.querySelectorAll(".js-slider").forEach((el) => window.kgSlider(el));

  // Header — sitemap open/close, translucent white bar (is-sticky) when over a white panel
  const header = document.querySelector(".kg-header");
  const map = document.querySelector(".kg-sitemap");
  const open = (on) => { map.classList.toggle("is-open", on); body.style.overflow = on ? "hidden" : ""; };
  // Original popup module adds the open marker after a short gap (about 50ms) following the press (probe circle open delay 315 ↔ copy 270ms)
  header.querySelector(".kg-header__button").addEventListener("click", () => setTimeout(() => open(true), 50));
  map.querySelector(".kg-sitemap__close").addEventListener("click", () => open(false));
  map.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open(false)));
  const stickyAt = document.querySelector(".kg-container");
  if (stickyAt) {
    const onScroll = () => header.classList.toggle("is-sticky", stickyAt.getBoundingClientRect().top <= 0);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
