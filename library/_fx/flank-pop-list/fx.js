// Side-popping thumbnails: hovering a row in the large text list makes square thumbnails pop out in a line on both sides of that row’s text (back.out(1), random .2~.53s per item).
// Depending on which of five screen columns the cursor is in, the left/right card counts split 8·4 → 4·8 — a template site’s ”Browse by platform”
(() => {
  const LEFT = [8, 7, 6, 5, 4], RIGHT = [5, 4, 3, 2, 1];
  kfFx.register("flank-pop-list", (el, { options, reduce, hover, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const labels = lines.map((l) => l.querySelector('[data-fx-part="label"]') || l);
    const layer = el.querySelector('[data-fx-part="medias"]');
    const slots = [...el.querySelectorAll('[data-fx-part="media"]')];
    const tip = el.querySelector('[data-fx-part="cursor"]');
    if (!lines.length || !layer || !slots.length) return;
    if (reduce) return;
    const half = slots.length / 2, fade = { duration: 0.2, ease: "power1.inOut" };
    const gapK = +(options.gap ?? 0.01875);
    let size = 0, gap = 0, zone = 2, cur = -1, on = false, z = 0, hidden = slots.map(() => false);
    gsap.set(layer, { autoAlpha: 0 });
    const measure = () => { size = slots[0].offsetWidth; gap = innerWidth * (innerWidth > 768 ? gapK : 0.015); };
    const layout = (label) => {
      const box = el.getBoundingClientRect(), r = label.getBoundingClientRect(), L = LEFT[zone], R = RIGHT[zone];
      return {
        y: r.top - box.top + r.height / 2 - size / 2,
        at: slots.map((_, i) => {
          if (i < half) { const e = i + 1; return { x: r.left - box.left - (L - e + 1) * (size + gap), hide: e > L }; }
          const a = i - half + 1;
          return { x: r.right - box.left + gap + (a - R) * (size + gap), hide: a < R };
        }),
      };
    };
    const arrange = (label, burst) => {
      const { y, at } = layout(label);
      slots.forEach((s, i) => {
        const p = at[i], d = burst ? Math.random() / 3 + 0.2 : 0.3, back = !p.hide && hidden[i] && !burst;
        if (p.hide) gsap.to(s, { scale: 0, autoAlpha: 0, duration: burst ? d : fade.duration, ease: burst ? "back.out(1)" : fade.ease, overwrite: "auto", ...(burst && { x: p.x, y }) });
        else if (back) { gsap.set(s, { x: p.x, y, overwrite: true }); gsap.to(s, { scale: 1, autoAlpha: 1, ...fade, overwrite: true }); }
        else { gsap.to(s, { x: p.x, y, scale: 1, duration: d, ease: "back.out(1)", overwrite: "auto" }); if (on) gsap.to(s, { autoAlpha: 1, ...fade }); }
        hidden[i] = p.hide;
      });
    };
    const open = (i) => {
      cur = i; on = true; z += 1;
      gsap.to(layer, { autoAlpha: 1, ...fade });
      const pics = slots.map((s) => s.children[i]).filter(Boolean);
      if (pics.length) gsap.fromTo(pics, { autoAlpha: 0, zIndex: z }, { autoAlpha: 1, ...fade, onComplete: () => slots.forEach((s) => [...s.children].forEach((c, k) => k !== i && gsap.set(c, { autoAlpha: 0 }))) });
      arrange(labels[i], true);
    };
    // Fading out uses CSS ease(.25,.1,.25,1) .14s — it dies down faster than the original’s fade-in (.2s power1.inOut)
    const easeOut = (x) => { let lo = 0, hi = 1, t = x; for (let i = 0; i < 20; i++) { t = (lo + hi) / 2; if (0.75 * t * (1 - t) ** 2 + 0.75 * t * t * (1 - t) + t ** 3 < x) lo = t; else hi = t; } return 0.3 * t * (1 - t) ** 2 + 3 * t * t * (1 - t) + t ** 3; };
    const close = () => { on = false; cur = -1; gsap.to(layer, { autoAlpha: 0, duration: 0.14, ease: easeOut }); };
    const zoneOf = (x) => Math.min(4, Math.floor(x / (innerWidth / 5)));
    const rowAt = (x, y) => {
      for (let i = 0; i < labels.length; i++) {
        const r = labels[i].getBoundingClientRect(), mid = r.top + r.height / 2;
        if (y >= mid - size / 2 && y <= mid + size / 2) return i;
      }
      return -1;
    };
    measure();
    const first = layout(labels[0]);
    slots.forEach((s, i) => { gsap.set(s, { x: first.at[i].x, y: first.y, scale: 1 }); hidden[i] = first.at[i].hide; });
    const offs = [];
    if (hover) {
      const move = (e) => {
        const i = rowAt(e.clientX, e.clientY);
        if (tip) gsap.set(tip, { x: e.clientX - el.getBoundingClientRect().left, y: e.clientY - el.getBoundingClientRect().top });
        if (i >= 0) {
          const zNew = zoneOf(e.clientX), changed = zNew !== zone;
          zone = zNew;
          if (cur === i && on) { if (changed) arrange(labels[i], false); }
          else open(i);
          el.classList.add("is-fx-row-on");
          return;
        }
        if (on) close();
        el.classList.remove("is-fx-row-on");
      };
      const leave = () => { close(); el.classList.remove("is-fx-row-on"); };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      offs.push(() => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); });
    } else if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const sts = lines.map((l, i) => ScrollTrigger.create({ trigger: l, scroller, start: "top center", end: "bottom center", onEnter: () => open(i), onEnterBack: () => open(i) }));
      sts.push(ScrollTrigger.create({ trigger: lines[0], scroller, start: "top center", onLeaveBack: close }));
      sts.push(ScrollTrigger.create({ trigger: lines[lines.length - 1], scroller, start: "top center", end: "bottom center", onLeave: close }));
      offs.push(() => sts.forEach((s) => s.kill()));
    }
    let t = 0;
    const re = () => { clearTimeout(t); t = setTimeout(() => { measure(); if (on && cur >= 0) arrange(labels[cur], false); }, 100); };
    addEventListener("resize", re);
    return () => {
      clearTimeout(t); removeEventListener("resize", re); offs.forEach((f) => f());
      el.classList.remove("is-fx-row-on");
      gsap.killTweensOf([layer, ...slots]);
      gsap.set([layer, ...slots], { clearProps: "all" });
      slots.forEach((s) => gsap.set([...s.children], { clearProps: "opacity,visibility,zIndex" }));
    };
  });
})();
