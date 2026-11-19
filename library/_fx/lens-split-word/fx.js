(() => {
  // Original (Rive state machine · hover in/out): hovering over the large pixel wordmark makes a color-inverted circle follow the cursor position,
  // Letter cells split sideways around that horizontal spot — left cells go left, right cells go right, shrinking in a bell shape the farther they are from center
  // (3.3% of max width · spread σ 5.1% of width). The center of the split chases the cursor by .2 per frame, and on release it sweeps off past the left edge in .33s as the letters return to place
  kfFx.register("lens-split-word", (el, { options, reduce, hover }) => {
    const svg = el.querySelector('[data-fx-part="word"]');
    if (!svg || reduce || !hover || !window.gsap) return;
    const NS = "http://www.w3.org/2000/svg";
    const cells = [...svg.children].filter((n) => n instanceof SVGGraphicsElement && !n.classList.contains("is-fx-lens"));
    if (!cells.length) return;
    const vb = svg.viewBox.baseVal, W = vb.width || svg.getBBox().width;
    const A = +(options.strength ?? 0.033) * W, S = +(options.spread ?? 0.051) * W, R = +(options.radius ?? 0.02) * W, follow = +(options.follow ?? 0.2);
    const home = vb.x - 4 * S;
    const centers = cells.map((n) => { const b = n.getBBox(); return b.x + b.width / 2; });
    // Inside the circle, text color and background color are swapped — the same cell is drawn once more in the background color and clipped to the circle
    const id = `fx-lens-${Math.random().toString(36).slice(2, 8)}`;
    const lens = document.createElementNS(NS, "g");
    lens.setAttribute("class", "is-fx-lens");
    lens.innerHTML = `<defs><clipPath id="${id}"><circle r="${R}"/></clipPath></defs><circle class="is-fx-lens-dot" r="${R}"/><g class="is-fx-lens-ink" clip-path="url(#${id})"></g>`;
    const clipDot = lens.querySelector("clipPath circle"), dot = lens.querySelector(".is-fx-lens-dot"), ink = lens.querySelector(".is-fx-lens-ink");
    const twins = cells.map((n) => ink.appendChild(n.cloneNode(true)));
    svg.append(lens);
    let lx = home, tx = home, px = vb.x, py = vb.y + vb.height / 2, inside = false, raf = 0, slide = null, shown = false;
    const toLocal = (e) => {
      const r = svg.getBoundingClientRect();
      return [vb.x + ((e.clientX - r.left) / r.width) * vb.width, vb.y + ((e.clientY - r.top) / r.height) * vb.height];
    };
    const paint = () => {
      cells.forEach((n, i) => {
        const d = centers[i] - lx;
        const dx = Math.sign(d || 1) * A * Math.exp(-(d * d) / (2 * S * S));
        const t = Math.abs(dx) < 1e-3 ? "" : `translate(${dx.toFixed(3)} 0)`;
        n.setAttribute("transform", t);
        twins[i].setAttribute("transform", t);
      });
      for (const c of [clipDot, dot]) { c.setAttribute("cx", px); c.setAttribute("cy", py); }
      lens.style.visibility = shown ? "visible" : "hidden";
    };
    const tick = () => {
      if (inside) lx += (tx - lx) * follow;
      paint();
      raf = inside || Math.abs(tx - lx) > 1e-3 ? requestAnimationFrame(tick) : 0;
    };
    const run = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e) => {
      [px, py] = toLocal(e); tx = px;
      if (!inside) { inside = true; shown = true; slide?.kill(); slide = null; }
      run();
    };
    const onLeave = (e) => {
      inside = false;
      [px, py] = toLocal(e);
      cancelAnimationFrame(raf); raf = 0;
      const st = { x: lx };
      slide = gsap.to(st, { x: home, duration: +(options.out ?? 0.33), ease: "power2.in", onUpdate: () => { lx = st.x; paint(); } });
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    paint();
    return () => {
      cancelAnimationFrame(raf); slide?.kill();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cells.forEach((n) => n.removeAttribute("transform"));
      lens.remove();
    };
  });
})();
