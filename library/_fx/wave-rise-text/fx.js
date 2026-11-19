// Letters go into a mask slot and rise from below — the delay is the distance from the chunk’s center, so it spreads from the middle outward. Swapping text with fx:swap drops and rises in the same wave.
(() => {
  kfFx.register("wave-rise-text", (el, { options, reduce, scroller }) => {
    const dur = +(options.dur ?? 0.6), spread = +(options.spread ?? 0.4), delay = +(options.delay ?? 0), out = +(options.out ?? 0.28), when = options.when || "view";
    const original = el.innerHTML;
    let inners = [], tween = null, io = null;
    const lines = () => { const l = [...el.querySelectorAll('[data-fx-part="line"]')]; return l.length ? l : [el]; };
    const split = () => {
      inners = [];
      lines().forEach((line) => {
        if (line.querySelector(".fx-wrt-c")) { inners.push(...line.querySelectorAll(".fx-wrt-c > span")); return; }
        const frag = document.createDocumentFragment();
        line.textContent.split(/(\s+)/).forEach((tok) => {
          if (tok === "") return;
          if (/^\s+$/.test(tok)) { frag.append(document.createTextNode(tok)); return; }
          const w = document.createElement("span");
          w.className = "fx-wrt-w";
          [...tok].forEach((ch) => { const m = document.createElement("span"), i = document.createElement("span"); m.className = "fx-wrt-c"; i.textContent = ch; m.append(i); w.append(m); inners.push(i); });
          frag.append(w);
        });
        line.textContent = "";
        line.append(frag);
      });
    };
    const wave = (amount) => {
      const pts = inners.map((c) => { const r = c.parentElement.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      if (!pts.length) return () => 0;
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const d = pts.map(([x, y]) => Math.hypot(x - cx, y - cy)), max = Math.max(...d) || 1;
      return (i) => (d[i] / max) * amount;
    };
    const rise = (d, ease) => {
      if (!inners.length) return;
      if (tween) tween.kill();
      if (reduce) { gsap.set(inners, { yPercent: 0 }); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); return; }
      tween = gsap.fromTo(inners, { yPercent: 110 }, { yPercent: 0, duration: d, delay, ease, stagger: wave(spread), onComplete: () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })) });
    };
    const play = () => rise(dur, "power2.out");
    const swap = (e) => {
      const set = () => { if (e.detail && e.detail.html != null) el.innerHTML = e.detail.html; else el.textContent = (e.detail && e.detail.text) || ""; split(); rise(0.4, "power3.out"); };
      if (tween) tween.kill();
      if (reduce || !inners.length) { set(); return; }
      tween = gsap.to(inners, { yPercent: -110, duration: out, ease: "power2.in", stagger: wave(spread * 0.45), onComplete: set });
    };
    if (!el.textContent.trim()) { el.addEventListener("fx:swap", swap); return () => el.removeEventListener("fx:swap", swap); }
    split();
    if (!reduce) gsap.set(inners, { yPercent: 110 });
    el.addEventListener("fx:swap", swap);
    el.addEventListener("fx:play", play);
    if (when === "load") play();
    else if (when === "view") { io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); play(); } }, { root: scroller || null, threshold: 0.12 }); io.observe(el); }
    return () => {
      if (tween) tween.kill();
      if (io) io.disconnect();
      el.removeEventListener("fx:swap", swap);
      el.removeEventListener("fx:play", play);
      el.innerHTML = original;
    };
  });
})();
