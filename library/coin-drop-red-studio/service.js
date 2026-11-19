// Service page: spinning the card stack with tabs (tab slide .4s) · work method cards in a fan-shaped pinned section (landing squash, on drag they return with .9s elastic).
// Original values (ServicesShowcase·HowWeWork): fan x −126/−42/42/126% · tilt −4.82/−.7/3.78/7.83° · y 28/0/44/16px · card 1 beat power2.out
// · landing spread .1s power1.out → 1s elastic.out(1,.3) · below 1023 once at ±26%·±2.4° with .85s expo.out.
(() => {
  const { reduced } = AW;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Tab — the chosen card goes to the front (0), the rest step back in order
  const tabs = $$(".sv-tab"), cards = $$(".sv-card"), glider = $(".sv-glider"), bar = $(".sv-bar");
  const slide = (t) => { const b = bar.getBoundingClientRect(), r = t.getBoundingClientRect(); glider.style.width = `${r.width}px`; glider.style.transform = `translateX(${r.left - b.left}px)`; };
  const pick = (k) => {
    tabs.forEach((t, i) => { const on = i === k; t.toggleAttribute("data-active", on); t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    cards.forEach((c, i) => { const pos = (i - k + cards.length) % cards.length; c.dataset.pos = String(pos); c.setAttribute("aria-hidden", String(pos !== 0)); });
    slide(tabs[k]);
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => pick(i)));
  bar.addEventListener("keydown", (e) => { const k = tabs.findIndex((t) => t.hasAttribute("data-active")); if (e.key === "ArrowRight") { pick((k + 1) % tabs.length); tabs[(k + 1) % tabs.length].focus(); } if (e.key === "ArrowLeft") { pick((k + tabs.length - 1) % tabs.length); tabs[(k + tabs.length - 1) % tabs.length].focus(); } });
  document.fonts.ready.then(() => slide($(".sv-tab[data-active]")));
  addEventListener("resize", () => slide($(".sv-tab[data-active]")));

  // How we work — fan out and settle in
  const items = $$(".sv-how__card");
  const ROT = [-4.82, -0.7, 3.78, 7.83], XP = [-126, -42, 42, 126], Y = [28, 0, 44, 16];
  const squash = (el) => {
    const w = el.offsetWidth, h = el.offsetHeight, l = 1.5 * parseFloat(getComputedStyle(el).fontSize);
    gsap.timeline().to(el, { scaleX: (w + l) / w, scaleY: (h - 0.33 * l) / h, duration: 0.1, ease: "power1.out" }).to(el, { scaleX: 1, scaleY: 1, duration: 1, ease: "elastic.out(1, 0.3)" });
  };
  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { wide, reduce } = ctx.conditions;
    if (reduce) { if (wide) items.forEach((c, i) => gsap.set(c, { xPercent: XP[i], rotate: ROT[i], y: Y[i] })); return; }
    if (!wide) {
      items.forEach((c, i) => { const a = i % 2 === 0 ? -1 : 1; gsap.from(c, { xPercent: 26 * a, rotate: 2.4 * a, autoAlpha: 0, duration: 0.85, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%", once: true } }); });
      return;
    }
    const tl = gsap.timeline();
    let st = null;
    items.forEach((c, i) => {
      gsap.set(c, { rotate: 0, x: 0, y: 0, xPercent: 0, yPercent: 0 });
      tl.fromTo(c, { y: () => innerHeight, yPercent: 0, opacity: 1, rotate: 0, xPercent: 0 }, { yPercent: 0, opacity: 1, rotate: ROT[i], xPercent: XP[i], y: Y[i], ease: "power2.out", duration: 1 }, i);
      tl.call(() => { if (st?.direction === 1) squash(c); }, null, i + 1);
    });
    st = ScrollTrigger.create({ animation: tl, trigger: ".sv-how__pin", start: "top top", end: () => `+=${innerHeight * 0.8 * items.length}`, pin: true, scrub: true, invalidateOnRefresh: true });
    // The seated card can be dragged, and on release it returns to place with .9s elastic.out(1,.55)
    const drags = window.Draggable ? items.map((c) => Draggable.create(c.parentElement, {
      type: "x,y", onPress() { gsap.killTweensOf(this.target); this.target.style.zIndex = "90"; },
      onRelease() { const t = this.target; gsap.to(t, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.55)", onComplete: () => t.style.removeProperty("z-index") }); },
    })[0]) : [];
    return () => { st.kill(); tl.kill(); drags.forEach((d) => d.kill()); gsap.set(items, { clearProps: "transform" }); };
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
