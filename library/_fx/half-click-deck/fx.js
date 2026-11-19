// Stack of cards piled in one spot — only the top card sits straight and the rest tilt staggered at −8.5~8.2°.
// Pressing the top half of the board (swiping up on touch) sends the top card flying up (.38s power2.inOut), then it slots in at the back (.38s power2.out),
// Pressing the lower half brings the last card up from the bottom to the top. On mouse, a round arrow follows the cursor and flips depending on the upper or lower half.
(() => {
  const ANGLES = [-7.5, 6.8, -5.5, 8.2, -8.5, 6.2, -7.0, 7.8];
  kfFx.register("half-click-deck", (el, { options, reduce, hover }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (cards.length < 2) return;
    const ticksBox = el.querySelector('[data-fx-part="ticks"]');
    const cursor = el.querySelector('[data-fx-part="cursor"]');
    const out = +(options.out ?? 0.38), settle = +(options.settle ?? 0.35), fly = +(options.fly ?? 140);
    const n = cards.length;
    let cur = 0, busy = false;
    const angle = (i) => ANGLES[i % ANGLES.length];
    const order = () => cards.forEach((c, i) => (c.style.zIndex = String(n - ((i - cur + n) % n))));
    order();
    cards.forEach((c, i) => gsap.set(c, { xPercent: 0, yPercent: 0, rotation: i === cur ? 0 : angle(i), transformOrigin: "50% 50%" }));

    const ticks = [];
    if (ticksBox) {
      ticksBox.replaceChildren();
      for (let i = 0; i < n; i++) {
        const t = document.createElement("i");
        t.className = "fx-deck-tick";
        ticksBox.append(t);
        ticks.push(t);
      }
    }
    const mark = (k, anim) => ticks.forEach((t, i) => gsap[anim ? "to" : "set"](t, { width: i === k ? 34 : 14, opacity: i === k ? 1 : 0.35, ...(anim ? { duration: 0.35, ease: "power2.out", overwrite: "auto" } : {}) }));
    mark(cur, false);

    const restack = () => {
      cards.forEach((c, i) => {
        c.style.zIndex = String(n - ((i - cur + n) % n));
        if (i !== cur) gsap.to(c, { rotation: angle(i), xPercent: 0, yPercent: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
      });
    };
    const next = () => {
      if (busy) return;
      busy = true;
      const o = cur, inc = (cur + 1) % n;
      if (reduce) { cur = inc; order(); gsap.set(cards[inc], { rotation: 0 }); gsap.set(cards[o], { rotation: angle(o) }); mark(cur, false); busy = false; return; }
      gsap.to(cards[inc], { rotation: 0, xPercent: 0, yPercent: 0, duration: settle, ease: "power2.out" });
      gsap.to(cards[o], {
        yPercent: -fly, rotation: angle(o) + (o % 2 ? -9 : 9), duration: out, ease: "power2.inOut",
        onComplete: () => {
          cur = inc;
          restack();
          cards[o].style.zIndex = "1";
          gsap.to(cards[o], { yPercent: 0, rotation: angle(o), duration: out, ease: "power2.out", onComplete: () => { restack(); busy = false; } });
        },
      });
      mark(inc, true);
    };
    const prev = () => {
      if (busy) return;
      busy = true;
      const p = (cur - 1 + n) % n;
      if (reduce) { cur = p; order(); cards.forEach((c, i) => gsap.set(c, { rotation: i === cur ? 0 : angle(i) })); mark(cur, false); busy = false; return; }
      gsap.to(cards[cur], { rotation: angle(cur), xPercent: 0, yPercent: 0, duration: settle, ease: "power2.out" });
      gsap.to(cards[p], {
        yPercent: fly * 0.857, rotation: angle(p) + (p % 2 ? -8 : 8), duration: out, ease: "power2.inOut",
        onComplete: () => {
          cur = p;
          restack();
          cards[p].style.zIndex = String(n + 10);
          gsap.to(cards[p], { yPercent: 0, rotation: 0, duration: out, ease: "power2.out", onComplete: () => { restack(); busy = false; } });
        },
      });
      mark(p, true);
    };

    const offs = [];
    const on = (t, type, fn, o) => (t.addEventListener(type, fn, o), offs.push(() => t.removeEventListener(type, fn, o)));
    let swiped = false, sy = 0, sx = 0;
    on(el, "touchstart", (e) => { if (e.touches.length === 1) { sy = e.touches[0].clientY; sx = e.touches[0].clientX; swiped = false; } }, { passive: true });
    on(el, "touchend", (e) => {
      if (e.changedTouches.length !== 1) return;
      const dy = e.changedTouches[0].clientY - sy, dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) { swiped = true; dy < 0 ? next() : prev(); }
    }, { passive: true });
    on(el, "click", (e) => {
      if (e.target.closest("a, button") || swiped) return;
      const r = el.getBoundingClientRect();
      e.clientY - r.top < r.height / 2 ? next() : prev();
    });
    on(el, "keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); next(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); prev(); }
    });

    if (cursor) {
      if (!hover) cursor.style.display = "none";
      else {
        // Hidden at the center of the panel at first — entering from the center keeps the spot from jumping
        gsap.set(cursor, { position: "absolute", top: 0, left: 0, x: el.offsetWidth / 2, y: el.offsetHeight / 2, scale: 0, opacity: 0, xPercent: -50, yPercent: -50, pointerEvents: "none", zIndex: 999 });
        const qx = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" }), qy = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });
        let dir = 0;
        const at = (e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r.height]; };
        on(el, "mouseenter", (e) => {
          const [x, y, h] = at(e);
          dir = y < h / 2 ? 0 : 180;
          gsap.set(cursor, { x, y, rotation: dir });
          gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)", overwrite: "auto" });
        });
        on(el, "mousemove", (e) => {
          const [x, y, h] = at(e);
          qx(x);
          qy(y);
          const want = y < h / 2 ? 0 : 180;
          if (want !== dir) { dir = want; gsap.to(cursor, { rotation: want, duration: 0.25, ease: "power2.out" }); }
        });
        on(el, "mouseleave", () => gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.in", overwrite: "auto" }));
      }
    }
    return () => {
      offs.forEach((f) => f());
      gsap.killTweensOf([...cards, ...ticks, cursor].filter(Boolean));
      gsap.set([...cards, cursor].filter(Boolean), { clearProps: "all" });
      cards.forEach((c) => (c.style.zIndex = ""));
      ticks.forEach((t) => t.remove());
    };
  });
})();
