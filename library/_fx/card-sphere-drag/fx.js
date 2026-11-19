// Card sphere — cards are placed evenly on a sphere by a golden-angle spiral, the sphere’s angle is folded by .4x and spread so all show in one front dome (front cards largest, smaller the farther).
// Drag · wheel only change the angle target, and the actual sphere follows with 1s power2.out (quickTo). When released and stopped, the card nearest the center comes to the center in .9s expo.inOut.
// Pressing a card rotates it to the center and fires fx:pick once it arrives (immediately if it is the center card). At first the cards grow in turn from .5× to their own size
(() => {
  const GOLD = Math.PI * (3 - Math.sqrt(5)), DEG = Math.PI / 180;
  const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  const qaxis = (x, y, z, ang) => { const s = Math.sin(ang / 2); return [x * s, y * s, z * s, Math.cos(ang / 2)]; };
  const qrot = (q, v) => {
    const [x, y, z, w] = q, ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2];
    return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
  };
  const qnorm = (q) => { const l = Math.hypot(...q) || 1; return q.map((v) => v / l); };
  const qslerp = (a, b, t) => {
    let c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], bb = b;
    if (c < 0) { c = -c; bb = b.map((v) => -v); }
    if (c > 0.9995) return qnorm(a.map((v, i) => v + (bb[i] - v) * t));
    const th = Math.acos(c), s = Math.sin(th);
    return a.map((v, i) => (v * Math.sin((1 - t) * th) + bb[i] * Math.sin(t * th)) / s);
  };

  kfFx.register("card-sphere-drag", (el, { options, reduce }) => {
    const own = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!own.length || !window.gsap) return;
    const fold = +(options.fold ?? 0.4), fill = Math.max(own.length, +(options.fill ?? 48)), wheelK = +(options.wheel ?? 0.1);
    const snapDur = +(options.snap ?? 0.9), follow = +(options.follow ?? 1);
    const clones = [];
    for (let i = own.length; i < fill; i++) {
      const c = own[i % own.length].cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.querySelectorAll("a,button,[tabindex]").forEach((n) => n.setAttribute("tabindex", "-1"));
      if (c.matches("a,button")) c.setAttribute("tabindex", "-1");
      c.dataset.fxClone = "";
      el.append(c);
      clones.push(c);
    }
    const cards = own.concat(clones).map((node, i, all) => {
      const y = 1 - ((i + 0.5) / all.length) * 2, r = Math.sqrt(1 - y * y), th = i * GOLD;
      return { node, dir: [Math.cos(th) * r, y, Math.sin(th) * r], intro: reduce ? 1 : 0, src: own[i % own.length] };
    });
    el.classList.add("is-fx-sphere");

    // Original values per width — dome radius (Dn), pull toward the eye (kn), perspective distance, card size (On)
    let Dn = 0, kn = 0, dist = 0, size = 0, W = 0, H = 0;
    const layout = () => {
      const r = el.getBoundingClientRect();
      W = r.width; H = r.height;
      if (W <= 500) { Dn = 275; kn = 250; dist = 1000; size = 72; }
      else if (W <= 1400) { Dn = 820; kn = -310; dist = 3920; size = 250; }
      else { Dn = 0.58 * W; kn = -0.22 * W; dist = 2.8 * W; size = 0.18 * W; }
      size *= +(options.size ?? 1);
      el.style.setProperty("--fx-card", `${size}px`);
      dirty = true;
    };

    // Initial pose — first card centered
    let q = [0, 0, 0, 1], dirty = true;
    const centerOn = (card) => {
      const d = qrot(q, card.dir), n = Math.hypot(d[0], d[1]);
      if (n < 1e-4) return q;
      return qnorm(qmul(qaxis(d[1] / n, -d[0] / n, 0, Math.acos(Math.max(-1, Math.min(1, d[2])))), q));
    };
    q = centerOn(cards[0]);

    const place = () => {
      const R = Dn / fold, camZ = kn + Dn - R;
      for (const c of cards) {
        const d = qrot(q, c.dir), a = Math.acos(Math.max(-1, Math.min(1, d[2]))) * fold, o = Math.atan2(d[1], d[0]);
        const x = Math.sin(a) * Math.cos(o) * R, y = Math.sin(a) * Math.sin(o) * R, z = camZ + Math.cos(a) * R;
        const w = Math.max(0.05, (dist - z) / dist), s = (1 / w) * (0.5 + 0.5 * c.intro);
        c.a = a;
        c.node.style.transform = `translate(-50%, -50%) translate3d(${(x / w).toFixed(2)}px, ${(-y / w).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
        c.node.style.zIndex = String(Math.round(1000 - a * 600));
      }
    };

    // Hand — when the angle target (ci) changes, the visible angle (Q) follows with 1s power2, and the sphere rotates by that difference
    const Q = { x: 0, y: 0 }, ci = { x: 0, y: 0 };
    let lx = 0, ly = 0, snapTw = null, dragging = false, moved = 0;
    const onQ = () => {
      const dy = Q.y - ly, dx = Q.x - lx;
      ly = Q.y; lx = Q.x;
      if (dx || dy) { q = qnorm(qmul(qmul(qaxis(1, 0, 0, dx * DEG), qaxis(0, 1, 0, dy * DEG)), q)); dirty = true; }
    };
    const nearest = () => cards.reduce((b, c) => (c.a < b.a ? c : b), cards[0]);
    const snapTo = (card, done) => {
      snapTw?.kill();
      const from = q.slice(), to = centerOn(card), p = { t: 0 };
      if (reduce) { q = to; dirty = true; done?.(); return; }
      snapTw = gsap.to(p, { t: 1, duration: snapDur, ease: "expo.inOut", onUpdate: () => { q = qslerp(from, to, p.t); dirty = true; }, onComplete: () => { snapTw = null; done?.(); } });
    };
    const settle = () => { if (!dragging && !snapTw && Math.abs(ci.x - Q.x) < 0.5 && Math.abs(ci.y - Q.y) < 0.5) snapTo(nearest()); };
    const toY = gsap.quickTo(Q, "y", { duration: follow, ease: "power2", onUpdate: onQ, onComplete: settle });
    const toX = gsap.quickTo(Q, "x", { duration: follow, ease: "power2", onUpdate: onQ });
    const nudge = (dx, dy) => { snapTw?.kill(); snapTw = null; ci.y += dx; ci.x += dy; toY(ci.y); toX(ci.x); };

    let px = 0, py = 0, pid = null;
    const down = (e) => { if (e.button !== 0) return; dragging = true; moved = 0; px = e.clientX; py = e.clientY; pid = e.pointerId; };
    const move = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      px = e.clientX; py = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4 && !el.classList.contains("is-fx-grabbing")) { el.classList.add("is-fx-grabbing"); el.setPointerCapture?.(e.pointerId); }
      const k = (180 / Math.PI) / Dn;
      if (moved > 4) nudge(dx * k, dy * k);
    };
    const up = () => { if (!dragging) return; dragging = false; el.classList.remove("is-fx-grabbing"); setTimeout(settle, 0); };
    const wheel = (e) => { e.preventDefault(); nudge(-e.deltaX * wheelK, -e.deltaY * wheelK); };
    const click = (e) => {
      const node = e.target.closest('[data-fx-part="card"]');
      if (!node || moved > 4) { if (moved > 4) e.preventDefault(); return; }
      const card = cards.find((c) => c.node === node);
      if (!card) return;
      e.preventDefault();
      const fire = () => card.src.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { card: card.src } }));
      if (card.a < 0.02) fire(); else snapTo(card, fire);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("click", click);
    const onKey = (e) => { if (e.target.closest?.('[data-fx-part="card"]') && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { const step = e.key === "ArrowLeft" ? 1 : -1; nudge(step * 25, 0); } };
    el.addEventListener("keydown", onKey);
    const focus = (e) => { const c = cards.find((x) => x.node === e.target.closest('[data-fx-part="card"]')); if (c && c.a > 0.02) snapTo(c); };
    el.addEventListener("focusin", focus);

    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout();
    let raf = 0;
    const frame = () => { raf = requestAnimationFrame(frame); if (dirty) { place(); dirty = false; } };
    raf = requestAnimationFrame(frame);
    const intro = reduce ? null : gsap.to(cards, { intro: 1, duration: +(options.dur ?? 1.2), ease: "power3.out", stagger: { each: 0.03, from: "start" }, delay: +(options.delay ?? 0), onUpdate: () => (dirty = true) });
    place();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); intro?.kill(); snapTw?.kill(); gsap.killTweensOf(Q);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up); el.removeEventListener("wheel", wheel); el.removeEventListener("click", click);
      el.removeEventListener("keydown", onKey); el.removeEventListener("focusin", focus);
      clones.forEach((c) => c.remove());
      own.forEach((n) => { n.style.transform = ""; n.style.zIndex = ""; });
      el.classList.remove("is-fx-sphere", "is-fx-grabbing");
    };
  });
})();
