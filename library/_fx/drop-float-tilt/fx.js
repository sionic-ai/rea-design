// Detached floating object — while the section is pinned, scroll makes the object fall diagonally from above into place (horizontal power3.out, vertical power2.out, from the second one delayed by lag),
// In place, items bob up and down with a sine (different period per item) and the shadow breathes along. Items tilt toward the mouse over the panel (quickTo .9s power3.out)
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  kfFx.register("drop-float-tilt", (el, { options, reduce, hover, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.gsap) return;
    const o = (k, d) => +(options[k] ?? d);
    const dropStart = o("drop-start", 0.1), dropEnd = o("drop-end", 0.58), sx = o("sx", 38), lift = o("lift", 120), rot = o("rot", 10.5), lag = o("lag", 0.1);
    const amp0 = o("float", 0.55), period = o("period", 3.4), tiltY = o("tilt-y", 7), tiltX = o("tilt-x", 4.5);
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    const e3 = gsap.parseEase("power3.out"), e2 = gsap.parseEase("power2.out");
    const made = items.map((item, i) => {
      const drop = document.createElement("div"), float = document.createElement("div"), tilt = document.createElement("div"), shadow = document.createElement("span");
      drop.className = "fx-dft__drop"; float.className = "fx-dft__float"; tilt.className = "fx-dft__tilt"; shadow.className = "fx-dft__shadow";
      const kids = [...item.childNodes];
      kids.forEach((k) => tilt.appendChild(k));
      float.appendChild(tilt); drop.appendChild(float); item.append(drop, shadow);
      const light = tilt.querySelector('[data-fx-part="light"]');
      const dir = i % 2 ? 1 : -1;
      return { item, kids, drop, float, tilt, shadow, light, dir, landed: reduce ? 1 : 0, lane: { sx: sx * dir, rot: (dir < 0 ? -11 : 10) * (rot / 10.5), lag: i * lag } };
    });
    const tweens = [];
    let st = null;
    const update = (v) => {
      const m = clamp((v - dropStart) / Math.max(0.001, dropEnd - dropStart));
      made.forEach((d) => {
        const a = clamp((m - d.lane.lag) / Math.max(0.001, 1 - d.lane.lag)), x = e3(a), y = e2(a);
        d.drop.style.transform = `translate(${(1 - x) * d.lane.sx}vw, ${(1 - y) * -lift}vh) rotate(${(1 - y) * d.lane.rot}deg)`;
        d.landed = clamp((a - 0.55) / 0.45);
      });
    };
    if (reduce) update(1);
    else {
      update(0);
      st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: o("scrub", 0.4), onUpdate: (s) => update(s.progress), onRefresh: (s) => update(s.progress) });
      made.forEach((d, i) => {
        const dur = period + i * 0.5, amp = (amp0 + i * 0.15) * fs;
        tweens.push(gsap.fromTo(d.float, { y: amp * 0.5 }, { y: -amp, duration: dur, delay: i * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate() {
          const k = (parseFloat(gsap.getProperty(d.float, "y")) + amp) / (amp * 1.5);
          gsap.set(d.shadow, { scaleX: 0.9 + k * 0.12, opacity: d.landed * (0.75 + k * 0.25) });
          if (d.light) d.light.style.opacity = String(0.72 + (1 - k) * 0.28);
        } }));
        tweens.push(gsap.to(d.float, { rotation: i % 2 ? -0.8 : 0.7, duration: dur * 1.27, delay: i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      });
    }
    const ac = new AbortController();
    if (hover && !reduce) {
      const q = made.map((d) => { gsap.set(d.tilt, { transformPerspective: 900 }); return { rx: gsap.quickTo(d.tilt, "rotationX", { duration: 0.9, ease: "power3.out" }), ry: gsap.quickTo(d.tilt, "rotationY", { duration: 0.9, ease: "power3.out" }), x: gsap.quickTo(d.tilt, "x", { duration: 1.1, ease: "power3.out" }) }; });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        q.forEach((t, i) => { const k = 1 + i * 0.3; t.ry(nx * tiltY * k); t.rx(-ny * tiltX * k); t.x(nx * 0.45 * fs * k); });
      }, { signal: ac.signal });
      el.addEventListener("pointerleave", () => q.forEach((t) => { t.rx(0); t.ry(0); t.x(0); }), { signal: ac.signal });
    }
    if (reduce) made.forEach((d) => { d.shadow.style.opacity = 1; });
    return () => {
      ac.abort(); st?.kill(); tweens.forEach((t) => t.kill());
      made.forEach((d) => { gsap.killTweensOf([d.float, d.tilt, d.shadow]); d.kids.forEach((k) => d.item.appendChild(k)); d.drop.remove(); d.shadow.remove(); });
    };
  });
})();
