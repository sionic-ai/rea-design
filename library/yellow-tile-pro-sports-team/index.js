// Home motion — original app.js values as is: entrance (four tiles shrink in .5s with 0.2s gaps → .25s star → after .5s the group (x -140, y 190) → sides·center·front row .25s each → .35s slogan in two layers (x -150)).
// Sliders use the same Swiper 11.2.10 settings as the original script.js — News vertical slide (3s·.8s), pickup fan (creative ±38rem·5rem·±10°, lower axis), player card row. Hologram tilt up to ±30°.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // ── Entrance ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const head = $(".ys-head");
    const glow = $(".ys-bg2");
    const mark = $(".h-hero__mark");
    const [v1, v2, v3, v4] = [1, 2, 3, 4].map((n) => $(`.h-hero__visual--${n}`));
    const [title, title2] = $$(".h-hero__title");
    const sns = $(".h-hero__sns");
    const navi = $(".h-hero__navi");
    gsap.set([head, glow, mark, v2, v3, v4, sns, navi], { opacity: 0 });
    gsap.set(v1, { opacity: 0, x: -140, y: 190 });
    gsap.set([title, title2], { opacity: 0, x: -150 });
    const tl = gsap.timeline({ onComplete: () => sessionStorage.setItem("ys_animated", "1") });
    tl.to(".h-hero__tiles i", { delay: 1.05, duration: 0.5, scale: 0, stagger: { each: 0.2 } })
      .to(glow, { duration: 0.25, opacity: 1 })
      .to(mark, { duration: 0.25, opacity: 1 }, "<")
      .to(v1, { duration: 0.5, x: 0, y: 0, opacity: 1 })
      .to(v2, { duration: 0.25, opacity: 1 })
      .to(v3, { duration: 0.25, opacity: 1 })
      .to(v4, { duration: 0.25, opacity: 1 })
      .to(title, { duration: 0.35, x: 0, opacity: 1 })
      .to(title2, { duration: 0.35, x: 0, opacity: 1 }, "<")
      .addLabel("skip")
      .to(navi, { duration: 0.4, opacity: 1 }, "<")
      .to(head, { opacity: 1 }, "<")
      .to(sns, { opacity: 1 }, "<");
    // On a second visit in the same tab, skip the entrance like the original
    if (sessionStorage.getItem("ys_animated")) tl.seek("skip");
  });
  if (reduce.matches) gsap.set(".h-hero__tiles", { display: "none" });

  // ── News card vertical slider: vertical·loop·.8s·3s auto·10px gap, up·down buttons ──
  const vs = $("[data-vslider]");
  new Swiper(vs, {
    direction: "vertical", loop: true, speed: 800, autoplay: { delay: 3000 }, spaceBetween: 10,
    navigation: { nextEl: $(".h-topics__next", vs), prevEl: $(".h-topics__prev", vs) },
  });

  // ── pickup fan: creative effect — only the center is upright, both sides tilt ±10° on a bottom axis and shift ±38rem · 5rem (phone ±25rem · 2.5rem), 3 overflow cards.
  //    Cards two apart get next2 · prev2 so css pushes them further by (±2rem, 5rem) (original on handler as is) ──
  const fan = $("[data-fan]");
  const fanEl = $(".h-fan__track", fan);
  const mark2 = (sw) => {
    fanEl.querySelectorAll(".next2, .prev2").forEach((el) => el.classList.remove("next2", "prev2"));
    sw.slides[sw.activeIndex + 2]?.classList.add("next2");
    sw.slides[Math.max(0, sw.activeIndex - 2)]?.classList.add("prev2");
  };
  const side = (tx, ty) => ({
    perspective: true, limitProgress: 3,
    prev: { translate: [`-${tx}rem`, `${ty}rem`, 0], rotate: [0, 0, -10], origin: "bottom center" },
    next: { translate: [`${tx}rem`, `${ty}rem`, 0], rotate: [0, 0, 10], origin: "bottom center" },
  });
  new Swiper(fanEl, {
    loop: true, centeredSlides: true, observer: true, observeParents: true, updateOnWindowResize: true,
    pagination: { el: $(".h-fan__dots", fan), clickable: true, renderBullet: (i, cls) => `<span class="${cls}">${window.YS.BALL}</span>` },
    navigation: { nextEl: $(".h-fan__nav .h-arrow:not(.h-arrow--prev)", fan), prevEl: $(".h-fan__nav .h-arrow--prev", fan) },
    slidesPerView: 1.2, effect: "creative", creativeEffect: side(25, 2.5),
    breakpoints: { 768: { slidesPerView: 3.05, creativeEffect: side(38, 5) } },
    on: { init: mark2, slideChange: mark2 },
  });

  // ── Player card row: slidesPerView auto, 20px gap, arrows ──
  const [pPrev, pNext] = $$(".h-players__nav .h-arrow");
  new Swiper($(".h-players__track"), { slidesPerView: "auto", spaceBetween: 20, navigation: { nextEl: pNext, prevEl: pPrev } });

  // ── Holo card: passes tilt and light position to variables from the pointer position (original formula as is, clamped to ±30°) ──
  $$("[data-tilt]").forEach((card) => {
    const update = (x, y) => {
      const b = card.getBoundingClientRect();
      const rx0 = (x - b.x) / b.width, ry0 = (y - b.y) / b.height;
      const clamp = (v) => Math.max(-30, Math.min(30, v));
      card.style.setProperty("--ratiox", rx0);
      card.style.setProperty("--ratioy", ry0);
      card.style.setProperty("--mx", `${rx0 * 100}%`);
      card.style.setProperty("--my", `${ry0 * 100}%`);
      card.style.setProperty("--rx", `${clamp((rx0 - 0.5) * -30)}deg`);
      card.style.setProperty("--ry", `${clamp((ry0 - 0.5) * 100)}deg`);
      card.style.setProperty("--posy", `${50 + (ry0 - 0.5) * 28}%`);
      card.style.setProperty("--hyp", Math.hypot(rx0 - 0.5, ry0 - 0.5) * 10 / 7);
    };
    card.addEventListener("pointermove", (e) => { if (!reduce.matches) requestAnimationFrame(() => update(e.clientX, e.clientY)); });
    card.addEventListener("pointerleave", () => { ["--rx", "--ry"].forEach((v) => card.style.setProperty(v, "0deg")); card.style.setProperty("--hyp", 0); });
  });
})();
