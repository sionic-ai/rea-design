// About — the red background is pinned from the hero to the values section and rises slowly (111% panel), team cell hover reaction, and hovering a service name swaps the description and photo with a blur
(() => {
  const back = document.querySelector(".page-backdrop"), drift = document.querySelector(".page-backdrop__drift");
  const values = document.querySelector(".values"), shade = document.querySelector(".page-backdrop__shade");
  const fit = () => { back.style.height = `${values.offsetTop + values.offsetHeight}px`; };
  new ResizeObserver(fit).observe(document.querySelector("main"));
  fit();
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.registerPlugin(ScrollTrigger);
    const t = gsap.fromTo(drift, { yPercent: 0 }, { yPercent: -9.9, ease: "none", scrollTrigger: { trigger: back, start: "top top", end: "bottom bottom", scrub: true } });
    const s = gsap.fromTo(shade, { opacity: 0 }, { opacity: 0.5, ease: "none", scrollTrigger: { trigger: values, start: "top bottom", end: "bottom bottom", scrub: true } });
    return () => { t.scrollTrigger.kill(); s.scrollTrigger.kill(); };
  });

  const grid = document.querySelector(".team__grid");
  let off = 0;
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) grid.querySelectorAll(".team__member").forEach((m) => {
    m.addEventListener("mouseenter", () => { clearTimeout(off); grid.classList.add("is-focused"); grid.querySelectorAll(".team__member").forEach((x) => x.classList.toggle("is-hovered", x === m)); });
    m.addEventListener("mouseleave", () => { clearTimeout(off); off = setTimeout(() => { grid.classList.remove("is-focused"); grid.querySelectorAll(".is-hovered").forEach((x) => x.classList.remove("is-hovered")); }, 120); });
  });

  const items = [...document.querySelectorAll(".services__item")];
  const slots = { text: document.querySelector('[data-swap="text"]'), image: document.querySelector('[data-swap="image"]'), project: document.querySelector('[data-swap="project"]') };
  let cur = -1, timer = 0;
  const fill = (i) => {
    const t = document.querySelector(`template[data-svc="${i}"]`).content;
    slots.text.replaceChildren(t.querySelector(".services__description").cloneNode(true));
    slots.image.replaceChildren(t.querySelector(".services__image").cloneNode(true));
    slots.project.replaceChildren(t.querySelector(".services__project-text").cloneNode(true));
  };
  const pick = (i, first) => {
    if (i === cur) return;
    cur = i;
    items.forEach((b, k) => b.classList.toggle("is-active", k === i));
    if (first) return fill(i);
    Object.values(slots).forEach((s) => s.classList.add("is-out"));
    clearTimeout(timer);
    timer = setTimeout(() => { fill(cur); requestAnimationFrame(() => Object.values(slots).forEach((s) => s.classList.remove("is-out"))); }, 300);
  };
  items.forEach((b, i) => { b.addEventListener("mouseenter", () => pick(i)); b.addEventListener("focus", () => pick(i)); b.addEventListener("click", () => pick(i)); });
  pick(0, true);
})();
