// Journey: in the hero, once the curtain lifts, line drawing, photo fill-up and text rise play (CSS), and the photo changes every 4.5s (1.4s overlap, 6s zoom-in).
// The statement and the four steps unfold at 30% visible. While the four steps come in (section top edge 75% → 30%), the two sections’ background shifts from burgundy to night green.
// The four-step line is re-measured as a curved path joining the points. Only one question opens at a time (.55s).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const type = document.querySelector(".yj-hero__type");
  if (type) {
    const go = () => requestAnimationFrame(() => type.classList.add("is-in"));
    // As in the original, expand when the curtain lifts or after 3.5 seconds (whichever comes first)
    if (document.querySelector("[data-revealer]:not([hidden])")) { addEventListener("page-revealed", go, { once: true }); setTimeout(go, 3500); } else go();
    const imgs = [...type.querySelectorAll(".yj-hero__fill-img")];
    let k = 0;
    setInterval(() => { if (document.hidden || imgs.length < 2) return; imgs[k].classList.remove("is-active"); k = (k + 1) % imgs.length; imgs[k].classList.add("is-active"); }, 4500);
  }
  // Text ripple: only inside the area around the cursor (a dot of radius 170 growing by .12) are letters pushed by turbulence. Strength accumulates with distance moved (×.35, max 40) and
  // Shrinks by .9 each frame, displacement = Follows 28 + 19.2 × speed (max 60) at .08 per step. The turbulence grain slowly breathes over time
  const svg = type?.querySelector(".yj-hero__svg");
  const words = svg?.querySelector(".yj-hero__words");
  if (svg && words && matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
    const spot = svg.querySelector("#yj-liquid feImage"), turb = svg.querySelector("#yj-liquid feTurbulence"), disp = svg.querySelector("#yj-liquid feDisplacementMap");
    // Round dot image with a white center (the This-spot-only marker of the displacement map) — it is an intensity value, not a color
    spot.setAttribute("href", "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><radialGradient id='s'><stop offset='0' stop-color='white'/><stop offset='1' stop-color='white' stop-opacity='0'/></radialGradient></defs><circle cx='50' cy='50' r='50' fill='url(#s)'/></svg>"));
    words.setAttribute("filter", "url(#yj-liquid)");
    const cur = { x: 0, y: 0, r: 0, scale: 0 }, aim = { x: 0, y: 0, r: 0, speed: 0 };
    let last = null, raf = 0;
    const t0 = performance.now();
    const step = (now) => {
      cur.x += (aim.x - cur.x) * 0.18; cur.y += (aim.y - cur.y) * 0.18; cur.r += (aim.r - cur.r) * 0.12;
      const want = aim.r ? Math.min(60, 28 + 19.2 * aim.speed) : 0;
      cur.scale += (want - cur.scale) * 0.08;
      aim.speed *= 0.9;
      const d = Math.max(0.5, cur.r);
      spot.setAttribute("x", (cur.x - d).toFixed(1)); spot.setAttribute("y", (cur.y - d).toFixed(1));
      spot.setAttribute("width", (2 * d).toFixed(1)); spot.setAttribute("height", (2 * d).toFixed(1));
      const u = (now - t0) / 1000;
      turb.setAttribute("baseFrequency", `${(0.007 + 0.002 * Math.sin(0.9 * u)).toFixed(4)} ${(0.016 + 0.004 * Math.cos(0.7 * u)).toFixed(4)}`);
      disp.setAttribute("scale", cur.scale.toFixed(2));
      raf = !aim.r && cur.r < 0.5 && cur.scale < 0.1 ? 0 : requestAnimationFrame(step);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    svg.addEventListener("pointermove", (e) => {
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      if (last) aim.speed = Math.min(40, aim.speed + 0.35 * Math.hypot(p.x - last.x, p.y - last.y));
      if (!aim.r) { cur.x = p.x; cur.y = p.y; }
      last = p; aim.x = p.x; aim.y = p.y; aim.r = 170;
      kick();
    });
    svg.addEventListener("pointerleave", () => { aim.r = 0; last = null; kick(); });
  }
  const shown = (el) => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-shown"); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
  };
  const man = document.querySelector(".yj-manifesto");
  const steps = document.querySelector(".yj-steps");
  shown(man);
  shown(steps);
  const main = document.querySelector("main");
  if (steps && main) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(main, { "--yj-mix": 0 }, { "--yj-mix": 100, ease: "none", scrollTrigger: { trigger: steps, start: "top 75%", end: "top 30%", scrub: true } });
      // Leaf shadow in the declaration section drifts sideways while passing through
      man?.querySelectorAll(".yj-manifesto__shadow").forEach((s, i) => gsap.fromTo(s, { x: () => (i ? -4 : 4) * innerWidth / 100 }, { x: () => (i ? 4 : -4) * innerWidth / 100, ease: "none", scrollTrigger: { trigger: man, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true } }));
    });
    // Connect the point positions into a smooth curve (Bezier pulled halfway between midpoints)
    const track = steps.querySelector(".yj-steps__track"), svg = track.querySelector(".yj-steps__line"), dots = [...track.querySelectorAll(".yj-steps__dot")];
    const draw = () => {
      const t = track.getBoundingClientRect();
      const pts = dots.map((d) => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2 - t.left, r.top + r.height / 2 - t.top]; });
      if (pts.length < 2) return;
      let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; d += ` C${mx.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`; }
      const w = t.width;
      d = `M${-w * 0.04},${pts[0][1] + 40} Q${pts[0][0] / 2},${pts[0][1] + 20} ` + d.slice(1) + ` Q${(pts.at(-1)[0] + w) / 2},${pts.at(-1)[1] - 30} ${w * 1.04},${pts.at(-1)[1] - 50}`;
      svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
      svg.setAttribute("viewBox", `0 0 ${t.width} ${t.height}`);
    };
    new ResizeObserver(draw).observe(track);
  }
  const items = [...document.querySelectorAll(".yj-faq__item")];
  items.forEach((it) => it.querySelector("button").addEventListener("click", () => {
    const open = it.dataset.open !== "true";
    items.forEach((x) => {
      const on = x === it && open;
      x.dataset.open = String(on);
      x.querySelector("button").setAttribute("aria-expanded", String(on));
      x.querySelector(".yj-faq__a").inert = !on;
    });
  }));
})();
