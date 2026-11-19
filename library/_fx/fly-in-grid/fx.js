(() => {
  // Each line flies in from staggered spots (70~100px above · ±20~30px sideways) over .5s circ.out at .07s steps and settles — original messages panel
  const ROW_A = [{ y: 100, x: 30 }, { y: 100, x: -30 }, { y: 70, x: 20 }, { y: 70, x: -20 }];
  const ROW_B = [{ y: 70, x: 20 }, { y: 70, x: -20 }, { y: 100, x: 30 }, { y: 100, x: -30 }];
  const SIDE = [{ x: -150, y: 50, r: 10 }, { x: -80, y: 50, r: 7 }, { x: 80, y: 50, r: -7 }, { x: 150, y: 50, r: -10 }];
  kfFx.register("fly-in-grid", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.ScrollTrigger) return;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const small = matchMedia("(max-width: 767px)").matches;
    const cols = small ? +options.sp || 2 : +options.cols || 4, side = options.look === "side", each = +(options.each ?? 0.07);
    const sideEase = kfFx.ease("0,0.55,0.45,1", "circ.out");
    const rows = [];
    items.forEach((it, i) => { (rows[Math.floor(i / cols)] ||= []).push(it); });
    const sts = rows.map((row, r) => {
      const pat = side ? SIDE : (r % 2 === 0 ? ROW_A : ROW_B).slice(0, cols);
      row.forEach((it, k) => { const o = pat[k % pat.length]; gsap.set(it, { x: o.x, y: o.y, rotation: o.r || 0, autoAlpha: side ? 0.5 : 0 }); });
      return ScrollTrigger.create({ trigger: row[0], ...(scroller && { scroller }), start: `top+=${side ? 50 : 100} bottom`, once: true, onEnter: () => row.forEach((it, k) => {
        gsap.to(it, side ? { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.67, delay: k * each, ease: sideEase } : { x: 0, y: 0, autoAlpha: 1, duration: 0.5, delay: k * each, ease: "circ.out" });
        setTimeout(() => it.classList.add("is-dot-active"), (k * each + 0.37) * 1000);
      }) });
    });
    return () => { sts.forEach((s) => s.kill()); gsap.set(items, { clearProps: "transform,opacity,visibility" }); items.forEach((it) => it.classList.remove("is-dot-active")); };
  });
})();
