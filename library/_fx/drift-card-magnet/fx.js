// Cards scattered across the Hero drift slowly opposite the cursor, and when you hover a card its inner panel (cover) grows and is pulled toward the cursor — the original Brand Hero video cards.
// Floating: each card picks a range of 70–100 horizontal and −50–50px vertical on open, and approaches the opposite of the value from half the cursor position scaled to window size into that range by 4% each frame.
// Interaction: after 10ms the panel scales to 1.08x over .8s expo.out, and the panel follows 30% of the distance to the cursor at 4% per frame. On release it returns to its place and size in 1s power4.out
(() => {
  kfFx.register("drift-card-magnet", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    const pair = (v, a, b) => { const p = String(v ?? "").split(",").map(Number); return p.length === 2 && p.every(Number.isFinite) ? p : [a, b]; };
    const [x0, x1] = pair(options["range-x"], 70, 100), [y0, y1] = pair(options["range-y"], -50, 50);
    const lerp = +(options.lerp ?? 0.04), pull = +(options.pull ?? 0.3), grow = +(options.grow ?? 1.08);
    const growEase = kfFx.ease(options["grow-ease"] || "expo.out", "expo.out"), backEase = kfFx.ease(options["back-ease"] || "power4.out", "power4.out");
    const mix = (a, b, t) => (1 - t) * a + t * b;
    const map = (v, a, b, c, d) => ((v - a) * (d - c)) / (b - a) + c;
    // The original treats the cursor as (0, 0) before it has moved, so right after opening, the card slowly drifts to the lower right.
    const mouse = { x: 0, y: 0 };
    const ac = new AbortController(), on = { signal: ac.signal };
    addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true, signal: ac.signal });

    const items = cards.map((card) => {
      const cover = card.querySelector('[data-fx-part="cover"]');
      const it = { card, cover, sx: gsap.utils.random(x0, x1), sy: gsap.utils.random(y0, y1), tx: 0, ty: 0, mx: 0, my: 0, magnet: false, wait: 0, inTl: null, outTl: null };
      if (cover) {
        card.addEventListener("mouseenter", () => {
          it.wait = setTimeout(() => {
            it.outTl?.kill();
            it.mx = +gsap.getProperty(cover, "x") || 0;
            it.my = +gsap.getProperty(cover, "y") || 0;
            it.magnet = true;
            it.inTl = gsap.to(cover, { scale: grow, duration: +(options["grow-dur"] ?? 0.8), ease: growEase });
          }, 10);
        }, on);
        card.addEventListener("mouseleave", () => {
          clearTimeout(it.wait);
          it.magnet = false;
          it.inTl?.kill();
          it.outTl = gsap.to(cover, { x: 0, y: 0, scale: 1, duration: +(options["back-dur"] ?? 1), ease: backEase });
        }, on);
      }
      return it;
    });

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const hx = mouse.x / 2, hy = mouse.y / 2;
      for (const it of items) {
        it.tx = mix(it.tx, map(hx, 0, innerWidth, -it.sx, it.sx), lerp);
        it.ty = mix(it.ty, map(hy, 0, innerHeight, -it.sy, it.sy), lerp);
        gsap.set(it.card, { x: -it.tx, y: -it.ty });
        if (it.magnet && it.cover) {
          const r = it.card.getBoundingClientRect();
          it.mx = mix(it.mx, pull * (mouse.x - (r.left + r.width / 2)), lerp);
          it.my = mix(it.my, pull * (mouse.y - (r.top + r.height / 2)), lerp);
          gsap.set(it.cover, { x: it.mx, y: it.my });
        }
      }
    };
    const io = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); raf = 0; if (en.isIntersecting) raf = requestAnimationFrame(tick); });
    io.observe(el);
    return () => {
      ac.abort();
      io.disconnect();
      cancelAnimationFrame(raf);
      items.forEach((it) => { clearTimeout(it.wait); gsap.killTweensOf([it.card, it.cover].filter(Boolean)); gsap.set([it.card, it.cover].filter(Boolean), { clearProps: "transform" }); });
    };
  });
})();
