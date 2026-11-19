// The moment a card lands in place — white flash (.04s on → .7s off), the panel pops to 1.035x·±1.8° then settles with elastic.out(1.1, .3) in .9s,
// The stamp wipes from the left in .32s and the shadow in .5s, text rises 18px from below in .6s expo.out at .08 intervals. Once, whether in a horizontal strip (x) or vertical list (y)
(() => {
  let seq = 0;
  kfFx.register("flash-land-stamp", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const q = (r) => [...el.querySelectorAll(`[data-fx-part="${r}"]`)];
    const box = q("box")[0] || el, stamps = q("stamp"), shades = q("shade"), facts = q("fact");
    let flash = q("flash")[0], made = null;
    if (!flash) { made = flash = document.createElement("span"); flash.className = "fx-fls__flash"; flash.setAttribute("aria-hidden", "true"); (q("media")[0] || el).appendChild(flash); }
    const tilt = +(options.tilt ?? 1.8) * (seq++ % 2 ? -1 : 1), axis = options.axis === "x" ? "x" : "y", at = +(options.at ?? (axis === "x" ? 0.6 : 0.75));
    if (reduce) return () => made?.remove();
    if (stamps.length) gsap.set(stamps, { clipPath: "inset(-40% 100% -40% 0%)" });
    if (shades.length) gsap.set(shades, { autoAlpha: 0 });
    if (facts.length) gsap.set(facts, { autoAlpha: 0, y: 18 });
    const tl = gsap.timeline({ paused: true })
      .fromTo(flash, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: "power1.out", immediateRender: false }, 0)
      .to(flash, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0.08)
      .to(box, { scale: 1.035, rotation: -tilt, duration: 0.07, ease: "power2.out" }, 0)
      .to(box, { scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1.1, 0.3)" }, 0.07);
    if (stamps.length) tl.to(stamps, { clipPath: "inset(-40% 0% -40% 0%)", duration: 0.32, ease: "power1.inOut" }, 0.12);
    if (shades.length) tl.to(shades, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.45);
    if (facts.length) tl.to(facts, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.08 }, 0.55);
    let done = false, raf = 0;
    const view = scroller || null;
    const check = () => {
      raf = 0;
      if (done) return;
      const r = el.getBoundingClientRect(), W = view ? view.clientWidth : innerWidth, H = view ? view.clientHeight : innerHeight;
      const hit = axis === "x" ? r.left < W * at && r.right > 0 && r.top < H && r.bottom > 0 : r.top < H * at && r.bottom > 0;
      if (hit) { done = true; tl.play(); }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(check); };
    const src = view || window;
    src.addEventListener("scroll", queue, { passive: true });
    const tick = () => queue();
    gsap.ticker.add(tick);
    check();
    return () => { src.removeEventListener("scroll", queue); gsap.ticker.remove(tick); cancelAnimationFrame(raf); tl.kill(); made?.remove(); gsap.set([box, ...stamps, ...shades, ...facts], { clearProps: "all" }); };
  });
})();
