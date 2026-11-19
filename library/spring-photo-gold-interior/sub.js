// Subpage: service expand (height 0 → auto .8s outExpo · inner −100% → 0 · chevron −180° 1s outExpo · title gold .3s),
// Work list category filtering (expand .6s outExpo · ＋ −90° → 0 1s) and per-category card picking
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tw = (el, vars) => (window.gsap && !reduce ? gsap.to(el, vars) : gsap?.set(el, { ...vars, duration: 0 }));
  const refresh = () => window.avLoco?.update();

  document.querySelectorAll(".av-acc__item").forEach((item) => {
    const head = item.querySelector(".av-acc__head"), reveal = item.querySelector(".av-acc__reveal"), inner = item.querySelector(".av-acc__inner"), icon = item.querySelector(".av-acc__icon");
    gsap.set(reveal, { height: 0 });
    gsap.set(inner, { yPercent: -100 });
    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);
      tw(reveal, { height: open ? "auto" : 0, duration: 0.8, ease: "expo.out", onComplete: refresh });
      tw(inner, { yPercent: open ? 0 : -100, duration: 0.8, ease: "expo.out" });
      tw(icon, { rotate: open ? -180 : 0, duration: 1, ease: "expo.out" });
    });
  });

  const filter = document.querySelector(".av-filter");
  if (filter) {
    const head = filter.querySelector(".av-filter__head"), wrap = filter.querySelector(".av-filter__wrap"), list = filter.querySelector(".av-filter__list"), plus = filter.querySelector(".av-plus");
    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") !== "true";
      head.setAttribute("aria-expanded", String(open));
      tw(wrap, { height: open ? "auto" : 0, duration: 0.6, ease: "expo.out" });
      tw(list, { yPercent: open ? 0 : -100, duration: 0.6, ease: "expo.out" });
      tw(plus, { rotate: open ? 0 : -90, duration: 1, ease: "expo.out" });
    });
    const boxes = [...filter.querySelectorAll("input[type=checkbox]")];
    const cards = [...document.querySelectorAll(".av-wc")];
    const apply = () => {
      const on = boxes.map((b, i) => (b.checked ? String(i + 1) : null)).filter(Boolean);
      cards.forEach((c) => { c.hidden = on.length > 0 && !on.includes(c.dataset.cat); });
      refresh();
    };
    boxes.forEach((b) => b.addEventListener("change", apply));
    filter.querySelector(".av-filter__reset").addEventListener("click", () => { boxes.forEach((b) => { b.checked = false; }); apply(); });
  }
})();
