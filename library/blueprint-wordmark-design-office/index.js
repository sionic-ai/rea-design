// Home scenes: hero photo walk-replace loop, process table columns (PC hover · phone accordion), process step art (doodle-filled shapes).
(() => {
  const SP = "(max-width: 766.98px)";
  const isSP = () => matchMedia(SP).matches;

  // Hero: rests 2.5s, then over 1.2s lifts the cover from the left to overlay the next work photo.
  // So two cells don’t show the same photo at once, exclude what is currently visible from candidates
  const pool = [...document.querySelectorAll(".ct-projects__item .wf-img")].map((n) => ({ label: n.dataset.label, tone: n.dataset.tone }));
  const wipes = [...document.querySelectorAll("[data-wipe]")];
  const active = [];
  const pick = (i, exclude) => {
    let c = pool.filter((p) => p !== exclude && !active.includes(p));
    if (!c.length) c = pool.filter((p) => p !== exclude);
    return c[Math.floor(Math.random() * c.length)];
  };
  const tile = (p) => {
    const d = document.createElement("div");
    d.className = "wf-img";
    d.dataset.label = p.label;
    if (p.tone) d.dataset.tone = p.tone;
    return d;
  };
  wipes.forEach((box, i) => {
    const p = pick(i);
    active[i] = p;
    box.replaceChildren(tile(p));
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const calls = [];
    wipes.forEach((box, i) => {
      const loop = () => {
        calls[i] = gsap.delayedCall(2.5, () => {
          const next = pick(i, active[i]);
          active[i] = next;
          const t = tile(next);
          t.style.zIndex = 2;
          t.style.clipPath = "inset(0 100% 0 0)";
          box.append(t);
          t.getBoundingClientRect();
          t.style.transition = "clip-path 1200ms ease";
          t.style.clipPath = "inset(0 0 0 0)";
          calls[i] = gsap.delayedCall(1.2, () => {
            while (box.children.length > 1) box.firstElementChild.remove();
            t.style.transition = "";
            t.style.zIndex = 1;
            loop();
          });
        });
      };
      loop();
    });
    return () => calls.forEach((c) => c && c.kill());
  });

  // Process chart: on PC only the hovered column opens, leaving returns to the first column
  const items = [...document.querySelectorAll("[data-acd]")];
  const DEFAULT = 0;
  const openOnly = (n) => items.forEach((it, i) => it.classList.toggle("is-open", i === n));
  items.forEach((it, i) => {
    it.addEventListener("mouseenter", () => { if (!isSP()) openOnly(i); });
    it.addEventListener("mouseleave", () => { if (!isSP()) openOnly(DEFAULT); });
  });

  // Phone: tapping + unfolds the description and the vertical stroke of + rotates and disappears — the same jQuery slideToggle as the original (400ms swing)
  items.forEach((it) => {
    const dt = it.querySelector("dt"), plus = it.querySelector(".plus");
    dt.addEventListener("click", () => {
      if (!isSP()) return;
      plus.classList.toggle("is-open");
      const $dd = jQuery(it.querySelector("dd")).stop();
      matchMedia("(prefers-reduced-motion: reduce)").matches ? $dd.toggle() : $dd.slideToggle();
    });
  });
  // When the width changes to PC, clear the explanation state left open on phone
  matchMedia(SP).addEventListener("change", () => {
    items.forEach((it) => {
      it.querySelector(".plus").classList.remove("is-open");
      jQuery(it.querySelector("dd")).stop(true, true).removeAttr("style");
    });
    openOnly(DEFAULT);
  });

  // Contact form: same jQuery Validation 1.19.3 as the original — name, email and message required, email format check, error text in p.myError under the field. Nothing is actually sent
  const required = "※Required field.", correct = "※ Please enter in the correct format.";
  jQuery("#form").validate({
    rules: { name: { required: true }, email: { required: true, email: true }, message: { required: true } },
    messages: { name: required, email: { required, email: correct }, message: required },
    errorElement: "p",
    errorClass: "myError",
    errorPlacement: (error, element) => element.parents("dd").find(".errorWrap").append(error),
    submitHandler: () => false,
  });

  // Process step art: stack a few blue hand-drawn-looking shapes and fill the inside with loop scribbles (a stand-in for the original’s flower and stone tower illustrations)
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  };
  // Illustration colors are painted via style with --site-ill-* made from the skin (the fill attribute can’t read var())
  const C = { deep: "var(--site-ill-deep)", mid: "var(--site-ill-mid)", light: "var(--site-ill-light)", pale: "var(--site-ill-pale)", paper: "var(--site-ill-paper)" };
  const wobble = (pts, seed) => {
    let s = seed;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280 - 0.5) * 3;
    return pts.map(([x, y]) => [x + r(), y + r()]);
  };
  const smooth = (pts) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d + "Z";
  };
  const circle = (cx, cy, r, n = 10) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * Math.sin((i / n) * Math.PI * 2)]);
  const blob = (cx, cy, rx, ry, n = 10, k = 0.12, seed = 3) => {
    let s = seed;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280 - 0.5) * 2 * k + 1;
    return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; const m = r(); return [cx + rx * m * Math.cos(a), cy + ry * m * Math.sin(a)]; });
  };
  const petals = (cx, cy, R, n) => {
    const pts = [];
    for (let i = 0; i < n * 4; i++) {
      const a = (i / (n * 4)) * Math.PI * 2;
      const rr = R * (0.55 + 0.45 * Math.abs(Math.cos((a * n) / 2)));
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return pts;
  };
  // Shape: [shape vertices, fill color, doodle color, whether to join with a curve]
  const ICONS = {
    1: [[[[118, 58], [176, 52], [150, 92], [178, 128], [116, 128], [140, 92]], C.deep, C.paper, false], [blob(78, 118, 30, 22, 9), C.light, C.mid, true], [blob(74, 152, 40, 30, 10, 0.1, 9), C.light, C.mid, true], [circle(146, 152, 19), C.mid, null, true]],
    2: [[petals(100, 92, 52, 6), C.light, C.mid, true], [circle(100, 92, 16), C.deep, C.paper, true], [[[96, 140], [104, 140], [106, 190], [94, 190]], C.mid, null, false], [blob(70, 168, 24, 10, 8, 0.15, 5), C.pale, C.mid, true]],
    3: [[[[100, 30], [160, 120], [40, 120]], C.light, C.mid, false], [[[62, 120], [138, 120], [138, 180], [62, 180]], C.deep, C.paper, false], [circle(156, 64, 14), C.mid, null, true]],
    4: [[[[40, 180], [40, 96], [100, 44], [160, 96], [160, 180], [130, 180], [130, 112], [70, 112], [70, 180]], C.light, C.mid, false], [circle(100, 150, 22), C.deep, C.paper, true], [blob(168, 60, 14, 14, 8, 0.12, 2), C.mid, null, true]],
    5: [[blob(98, 116, 34, 60, 12, 0.08, 11), C.light, C.mid, true], [[[86, 40], [112, 40], [108, 62], [90, 62]], C.deep, null, false], [blob(150, 150, 22, 30, 9, 0.12, 4), C.deep, C.paper, true], [circle(52, 164, 13), C.mid, null, true]],
    6: [[[[40, 100], [100, 48], [160, 100], [160, 176], [40, 176]], C.light, C.mid, false], [[[86, 128], [114, 128], [114, 176], [86, 176]], C.deep, null, false], [blob(150, 52, 22, 16, 9, 0.12, 6), C.mid, C.paper, true]],
  };
  // A doodle that chains loops and zigzags to fill the shape width
  const scribble = (box, seed) => {
    const [x0, y0, x1, y1] = box;
    let s = seed;
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    let d = "";
    const rows = Math.max(2, Math.round((y1 - y0) / 18));
    for (let row = 0; row < rows; row++) {
      const yc = y0 + ((row + 0.5) / rows) * (y1 - y0);
      const loops = Math.max(2, Math.round((x1 - x0) / 16));
      const rad = 7 + r() * 5;
      for (let u = 0; u <= loops * Math.PI * 2; u += 0.35) {
        const t = u / (loops * Math.PI * 2);
        const x = (row % 2 ? x1 - t * (x1 - x0) : x0 + t * (x1 - x0)) + rad * Math.cos(u);
        const y = yc + rad * 0.8 * Math.sin(u) + (r() - 0.5) * 2;
        d += `${d ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
      }
    }
    return d;
  };
  document.querySelectorAll(".ct-flow__img[data-icon]").forEach((svg) => {
    const shapes = ICONS[svg.dataset.icon] || ICONS[1];
    const defs = el("defs", {}, svg);
    shapes.forEach(([pts, fill, ink, curved], i) => {
      const w = wobble(pts, i * 31 + +svg.dataset.icon);
      const d = curved ? smooth(w) : `M${w.map((p) => p.join(",")).join("L")}Z`;
      const id = `ct-flow-${svg.dataset.icon}-${i}`;
      const cp = el("clipPath", { id }, defs);
      el("path", { d }, cp);
      el("path", { d, style: `fill: ${fill}`, opacity: 0.92 }, svg);
      if (!ink) return;
      const xs = w.map((p) => p[0]), ys = w.map((p) => p[1]);
      el("path", { d: scribble([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], i * 17 + 5), fill: "none", style: `stroke: ${ink}`, "stroke-width": 1.1, "stroke-linecap": "round", opacity: 0.85, "clip-path": `url(#${id})` }, svg);
    });
  });
})();
