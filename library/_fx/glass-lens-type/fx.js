(() => {
  // Text around the cursor looks as if seen through a glass lens — only while the cursor moves or presses, up to four text blocks overlapping the lens (26% of screen height, 120~300px)
  // Applies an SVG refraction filter. The lens center pushes outward and its rim mixes in a blurry ripple (.014). Intensity is speed × .9 (12 per second rising, 2.4 falling),
  // .5 while pressed, 1.3 at the moment of press then easing down at 1.8 per second — pressing makes the lens swell to double and return
  const NS = "http://www.w3.org/2000/svg";
    const LEVEL = "rgb(128,128,128)"; /* Not skin: the no-movement baseline of the displacement map (128 = 0) */
  let shared = null;
  const items = new Set();
  const setup = () => {
    if (shared) return shared;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;pointer-events:none";
    const defs = document.createElementNS(NS, "defs");
    svg.append(defs);
    document.body.append(svg);
    const n = 128, c = document.createElement("canvas");
    c.width = c.height = n;
    const x2 = c.getContext("2d"), img = x2.createImageData(n, n), h = n / 2;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const dx = (x + 0.5 - h) / h, dy = (y + 0.5 - h) / h, r = Math.hypot(dx, dy), i = (y * n + x) * 4;
      const fall = r < 1 ? (1 - r * r) ** 2 : 0, bend = r > 1e-4 ? -Math.sin(Math.PI * Math.min(r, 1)) / r : 0;
      img.data[i] = 128 + 127 * dx * bend; img.data[i + 1] = 128 + 127 * dy * bend; img.data[i + 2] = 128; img.data[i + 3] = 255 * fall;
    }
    x2.putImageData(img, 0, 0);
    const map = c.toDataURL("image/png");
    const slots = [];
    for (let k = 0; k < 4; k++) {
      const fl = document.createElementNS(NS, "filter");
      fl.id = `fx-glass-lens-${k}`;
      fl.setAttribute("filterUnits", "userSpaceOnUse"); fl.setAttribute("primitiveUnits", "userSpaceOnUse"); fl.setAttribute("color-interpolation-filters", "sRGB");
      fl.innerHTML = `<feFlood flood-color="${LEVEL}" result="level"/><feImage preserveAspectRatio="none" result="lens" href="${map}"/>
<feMerge result="bend"><feMergeNode in="level"/><feMergeNode in="lens"/></feMerge>
<feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="${k + 3}" result="noise"/>
<feComposite in="noise" in2="lens" operator="in" result="wake"/>
<feMerge result="ripple"><feMergeNode in="level"/><feMergeNode in="wake"/></feMerge>
<feComposite in="bend" in2="ripple" operator="arithmetic" k1="0" k2="1" k3="0.25" k4="-0.125" result="field"/>
<feDisplacementMap in="SourceGraphic" in2="field" scale="0" xChannelSelector="R" yChannelSelector="G"/>`;
      defs.append(fl);
      slots.push({ fl, lens: fl.querySelector("feImage"), mix: fl.querySelector("feComposite[operator=arithmetic]"), map: fl.querySelector("feDisplacementMap") });
    }
    const st = { tx: 0, ty: 0, px: 0, py: 0, lx: 0, ly: 0, speed: 0, poked: false, pressed: false, kick: 0, was: false, amt: 0, live: false, last: performance.now(), raf: 0 };
    const move = (e) => { st.tx = e.clientX; st.ty = e.clientY; st.poked = true; };
    const down = (e) => { move(e); st.pressed = true; };
    const up = () => { st.pressed = false; };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    addEventListener("pointerup", up, { passive: true });
    addEventListener("pointercancel", up, { passive: true });
    const clear = (it) => { if (it.slot >= 0) { it.el.style.filter = it.keep; it.slot = -1; } };
    const frame = (now) => {
      st.raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, Math.max(0.001, (now - st.last) / 1000)); st.last = now;
      const f = 1 - Math.exp(-14 * dt);
      st.px += (st.tx - st.px) * f; st.py += (st.ty - st.py) * f;
      const v = Math.hypot((st.px - st.lx) / innerWidth * 2, (st.py - st.ly) / innerHeight * 2) / dt; st.lx = st.px; st.ly = st.py;
      st.speed += (Math.min(1.6, 0.42 * v) - st.speed) * (1 - Math.exp(-9 * dt));
      if (st.pressed && !st.was) st.kick = 1;
      st.was = st.pressed;
      st.kick *= Math.exp(-1.8 * dt);
      const want = st.poked ? Math.min(1, 0.9 * st.speed) : 0;
      st.amt += (want - st.amt) * (1 - Math.exp(-(want > st.amt ? 12 : 2.4) * dt));
      const a = Math.max(st.amt, st.pressed ? 0.5 : 0, 1.3 * st.kick);
      if (a < 0.012) { if (st.live) items.forEach(clear); st.live = false; return; }
      st.live = true;
      let used = 0;
      for (const it of items) {
        const base = Math.min(300, Math.max(120, it.size * innerHeight));
        const rad = base + (base * (2 - st.kick) - base) * Math.min(1, 4 * st.kick);
        if (used >= 4 || it.el.closest("[hidden]") || getComputedStyle(it.el).visibility === "hidden") { clear(it); continue; }
        const r = it.el.getBoundingClientRect();
        if (!(r.width > 0 && r.right > st.px - rad && r.left < st.px + rad && r.bottom > st.py - rad && r.top < st.py + rad)) { clear(it); continue; }
        const s = slots[used], k3 = 0.25 + 0.55 * st.kick + 0.2 * st.amt;
        s.fl.setAttribute("x", -40); s.fl.setAttribute("y", -40); s.fl.setAttribute("width", Math.ceil(r.width + 80)); s.fl.setAttribute("height", Math.ceil(r.height + 80));
        s.lens.setAttribute("x", (st.px - r.left - rad).toFixed(1)); s.lens.setAttribute("y", (st.py - r.top - rad).toFixed(1));
        s.lens.setAttribute("width", (2 * rad).toFixed(1)); s.lens.setAttribute("height", (2 * rad).toFixed(1));
        s.mix.setAttribute("k3", k3.toFixed(3)); s.mix.setAttribute("k4", (-0.5 * k3).toFixed(3));
        s.map.setAttribute("scale", (it.strength * base * a).toFixed(2));
        if (it.slot !== used) { it.el.style.filter = `url(#fx-glass-lens-${used})`; it.slot = used; }
        used++;
      }
    };
    st.raf = requestAnimationFrame(frame);
    shared = { svg, st, clear, stop: () => { cancelAnimationFrame(st.raf); removeEventListener("pointermove", move); removeEventListener("pointerdown", down); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); svg.remove(); shared = null; } };
    return shared;
  };
  kfFx.register("glass-lens-type", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const s = setup();
    const it = { el, slot: -1, keep: el.style.filter, size: +(options.size ?? 0.26), strength: +(options.strength ?? 0.16) };
    items.add(it);
    return () => { s.clear(it); items.delete(it); if (!items.size) s.stop(); };
  });
})();
