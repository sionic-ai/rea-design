// Work list motion — light-beam Hero, list head and row entrances, category picking, focus-area illustration
(() => {
  const { inView, reduce, small, px, WIPE_EASE, INTRO, WIPE, CONTENT_DELAY, barAt, ctaStartFor, wipeLine, riseInto, hideLines } = window.RP;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Category pick · load more (runs regardless of motion)
  const btn = $(".wsel__btn"), menu = $(".wsel__menu"), items = $$(".witem"), count = $(".wlist__count");
  const open = (on) => { btn.dataset.open = menu.dataset.open = String(on); btn.setAttribute("aria-expanded", on); };
  btn.addEventListener("click", () => open(btn.dataset.open !== "true"));
  addEventListener("pointerdown", (e) => { if (!e.target.closest(".wsel")) open(false); });
  $$(".wsel__opt").forEach((o) => o.addEventListener("click", () => {
    const f = o.dataset.filter; let n = 0;
    items.forEach((it) => { const on = f === "all" || it.dataset.cat === f; it.hidden = !on; n += on; });
    btn.querySelector("span").textContent = o.textContent.trim();
    count.textContent = String(f === "all" ? n + 2 : n).padStart(2, "0");
    open(false); ScrollTrigger.refresh();
  }));
  const more = $(".wmore");
  let loaded = 0;
  more.addEventListener("click", () => {
    items.slice(0, 2).forEach((it) => { const c = it.cloneNode(true); c.hidden = false; $(".wlist__items").append(c); if (!reduce) gsap.fromTo(c, { opacity: 0 }, { opacity: 1, duration: WIPE.step, ease: "power2.inOut" }); });
    if (++loaded >= 3) more.parentElement.remove();
    gsap.delayedCall(0.4, () => ScrollTrigger.refresh());
  });

  const hero = $(".whero__in");
  if (reduce) { gsap.set(hero, { autoAlpha: 1 }); return; }
  hideLines($(".wfocus"));

  // ── Hero
  const bars = $$(".whero__bars i"), letter = $(".whero__letter"), o = { duration: INTRO.contentFade, ease: INTRO.ease };
  gsap.timeline({ delay: CONTENT_DELAY }).fromTo($(".whero__bg"), { autoAlpha: 0 }, { autoAlpha: 1, ...o }, 0).fromTo($(".whero__title"), { autoAlpha: 0, y: INTRO.contentRise }, { autoAlpha: 1, y: 0, ...o }, 0).fromTo($(".whero__sub"), { autoAlpha: 0, y: INTRO.contentRise }, { autoAlpha: 1, y: 0, ...o }, 0.12);
  gsap.set(hero, { autoAlpha: 1 });
  if (!small()) {
    const BARS = [[57.481, 40], [37.256, 43], [31.172, 60], [19.024, 40], [2.743, 40], [19.024, 40], [0, 40]], snap = { "--bar-from": 0.2, "--bar-alpha": 0.5 };
    const rand = gsap.utils.random, cf = gsap.utils.clamp(-30, 72), ca = gsap.utils.clamp(0, 100), settle = 1.25 + 0.07 * Math.floor((BARS.length - 1) / 2) + 0.8;
    gsap.timeline({ delay: CONTENT_DELAY }).fromTo(letter, { "--letter-wipe": 0 }, { "--letter-wipe": 1, duration: 0.5, ease: WIPE_EASE }, 0.9).fromTo(bars, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: INTRO.ease, stagger: { each: 0.07, from: "center" } }, 1.25);
    bars.forEach((b, i) => {
      const [from, alpha] = BARS[i];
      gsap.set(b, { "--bar-from": from, "--bar-alpha": alpha });
      const tl = gsap.timeline({ repeat: -1, delay: CONTENT_DELAY + settle + rand(0, 1.5), defaults: { ease: "sine.inOut" } });
      for (let k = 0; k < 5; k++) tl.to(b, { "--bar-from": cf(rand(from - 40, from + 40)), "--bar-alpha": ca(rand(alpha - 14, alpha + 14)), duration: rand(4.5, 9), snap });
      tl.to(b, { "--bar-from": from, "--bar-alpha": alpha, duration: rand(4.5, 9), snap });
    });
  }

  // ── List
  gsap.timeline({ scrollTrigger: { trigger: $(".wlist__head"), start: "top 85%", once: true } }).fromTo($$("[data-fade]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: WIPE.step, ease: "power2.inOut" });
  items.forEach((it) => gsap.timeline({ scrollTrigger: { trigger: it, start: "top 85%", once: true } }).fromTo(it, { autoAlpha: 0 }, { autoAlpha: 1, duration: WIPE.step, ease: "power2.inOut" }));

  // ── Focus area guide: the ring comes in from the right, the ball from the left 0.2s later
  {
    const sec = $(".wfocus"), rings = $('[data-art="rings"]'), ball = $('[data-art="ball"]'), k = small() ? 0.4 : 1;
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 65%", once: true } }), rise = riseInto(tl);
    const slide = (el, x, at) => tl.fromTo(el, { autoAlpha: 0, x }, { autoAlpha: 1, x: 0, duration: 1, ease: "power3.out" }, at);
    slide(rings, px(80 * k), 0); slide(ball, -px(120 * k), 0.2);
    const lines = $$("[data-line]", sec);
    lines.forEach((l, i) => (small() ? rise(l, barAt(i)) : wipeLine(tl, l, barAt(i))));
    rise($(".wfocus__note"), ctaStartFor(lines.length)); rise($(".wfocus__cta"), ctaStartFor(lines.length) + 0.1);
    gsap.matchMedia().add("(min-width: 1025px) and (hover: hover)", () => {
      const art = $(".wfocus__art"), q = { duration: 0.9, ease: "power2.out" }, qx = gsap.quickTo(art, "x", q), qy = gsap.quickTo(art, "y", q);
      const move = (e) => { qx(-(((e.clientX / innerWidth) * 2 - 1) * 16)); qy(-(((e.clientY / innerHeight) * 2 - 1) * 16)); };
      addEventListener("mousemove", move);
      return () => removeEventListener("mousemove", move);
    });
  }
})();
