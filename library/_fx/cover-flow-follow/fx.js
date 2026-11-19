// Cover flow that unfolds following the cursor: from a stack of overlapping cards, the sheet at the cursor’s horizontal position (panel width divided by sheet count) stands in front,
// Side sections shift sideways by their distance and stand rotated −45° on the Y axis (−10° for each step further, max −100°) — .8s elastic.out(1, .75), a judge-stack style from a template site
(() => {
  kfFx.register("cover-flow-follow", (el, { options, reduce }) => {
    const row = el.querySelector('[data-fx-part="row"]');
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!row || !cards.length) return;
    const faces = cards.map((c) => c.querySelector('[data-fx-part="face"]') || c);
    const n = cards.length, dur = +(options.dur ?? 0.8);
    const ease = kfFx.ease(options.ease || "elastic.out(1, 0.75)", "elastic.out(1, 0.75)");
    const spread = +(options.spread ?? 80), turn = +(options.turn ?? 45);
    const narrow = matchMedia(`(max-width: ${+(options.narrow ?? 767)}px)`);
    let at = Math.floor((n - 1) / 2) + 1;
    const show = (idx, d = dur) => {
      cards.forEach((c, i) => {
        const a = i - idx, m = Math.abs(a), s = Math.sign(a);
        gsap.to(c, { xPercent: a === 0 ? 0 : s * (spread + ((m - 1) * (42 - m)) / 2), duration: d, ease, overwrite: "auto" });
        gsap.to(faces[i], { rotationY: a === 0 ? 0 : s * Math.max(-100, -turn - (m - 1) * 10), scale: a === 0 ? (narrow.matches ? 0.85 : 0.94) : 1, duration: d, ease, overwrite: "auto" });
        c.style.zIndex = String(n - m);
        c.classList.toggle("is-fx-active", a === 0);
      });
      if (narrow.matches) gsap.to(row, { x: el.clientWidth / 2 - (cards[idx].offsetLeft + cards[idx].offsetWidth / 2), duration: d, ease, overwrite: "auto" });
      else gsap.set(row, { x: 0 });
    };
    if (reduce) { show(at - 1, 0); return () => { gsap.set([row, ...cards, ...faces], { clearProps: "transform" }); cards.forEach((c) => { c.style.zIndex = ""; c.classList.remove("is-fx-active"); }); }; }
    const pick = (x) => {
      const r = el.getBoundingClientRect(), k = Math.ceil(((x - r.left) / r.width) * n);
      if (k !== at && k > 0 && k <= n) show((at = k) - 1);
    };
    const move = (e) => pick(e.clientX);
    const touch = (e) => e.touches?.[0] && pick(e.touches[0].clientX);
    const mode = () => show(at - 1, 0);
    show(at - 1, 0);
    el.addEventListener("mousemove", move);
    el.addEventListener("touchstart", touch, { passive: true });
    el.addEventListener("touchmove", touch, { passive: true });
    narrow.addEventListener("change", mode);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("touchstart", touch);
      el.removeEventListener("touchmove", touch);
      narrow.removeEventListener("change", mode);
      gsap.killTweensOf([row, ...cards, ...faces]);
      gsap.set([row, ...cards, ...faces], { clearProps: "transform" });
      cards.forEach((c) => { c.style.zIndex = ""; c.classList.remove("is-fx-active"); });
    };
  });
})();
