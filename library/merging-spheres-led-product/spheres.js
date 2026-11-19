/* Sphere artwork — redraws the original’s 3D-rendered spheres (layered rings, dot map, smooth shell, merged sphere split in four, yellow glowing sphere) as SVG.
   [data-sphere="rings|dots|shell|combo|glow"] goes in this slot. Color is painted with --kf-* by the .sp-* rules in shared.css. */
(() => {
  let uid = 0;
  const shade = (id) => `<radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" class="sp-hi"/><stop offset=".55" class="sp-mid"/><stop offset="1" class="sp-lo"/></radialGradient>`;
  // Layered rings — thin horizontal slices of a sphere stacked up and down. Each slice has a top face (light) and an edge (dark)
  const rings = (id) => {
    let out = "";
    const n = 15;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, y = -48 + t * 96, r = Math.sqrt(Math.max(0, 48 * 48 - y * y));
      out += `<ellipse class="sp-ring" cx="0" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.32).toFixed(1)}"/>`;
    }
    return `<circle r="48" fill="url(#${id}g)"/><g clip-path="url(#${id}c)">${out}</g>`;
  };
  // Dot map — square dots lined up on a sphere, with dots squashed smaller toward the edge
  const dots = (id) => {
    let out = "";
    for (let gy = -44; gy <= 44; gy += 5) for (let gx = -44; gx <= 44; gx += 5) {
      const d = Math.hypot(gx, gy);
      if (d > 46) continue;
      // Leave gaps here and there like continent shapes — using a sine pattern so the same picture always appears
      if (Math.sin(gx * 0.13) + Math.cos(gy * 0.17 + gx * 0.05) < -0.2) continue;
      const k = Math.sqrt(1 - (d / 48) ** 2), s = 3.4 * (0.45 + 0.55 * k);
      out += `<rect class="sp-dot" x="${(gx - s / 2).toFixed(1)}" y="${(gy - s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" rx=".4"/>`;
    }
    return `<circle r="48" fill="url(#${id}g)"/><g>${out}</g>`;
  };
  // Smooth shell: a lit sphere with one thin band wound diagonally
  const shell = (id) => `<circle r="48" fill="url(#${id}g)"/><ellipse class="sp-band" cx="0" cy="0" rx="47" ry="14" transform="rotate(-24)"/><ellipse class="sp-band sp-band--thin" cx="0" cy="0" rx="40" ry="34" transform="rotate(-24)"/>`;
  const glow = (id) => `<radialGradient id="${id}y" cx="38%" cy="32%" r="70%"><stop offset="0" class="sp-y-hi"/><stop offset=".6" class="sp-y-mid"/><stop offset="1" class="sp-y-lo"/></radialGradient><circle r="48" fill="url(#${id}y)"/>`;
  // Combined sphere — split into four: top-left shell, top-right dot, bottom two layered rings (quadrant patchwork of the original main sphere)
  const combo = (id) => `<clipPath id="${id}q1"><rect x="-50" y="-50" width="50" height="50"/></clipPath><clipPath id="${id}q2"><rect x="0" y="-50" width="50" height="50"/></clipPath><clipPath id="${id}q3"><rect x="-50" y="0" width="100" height="50"/></clipPath>` +
    `<g clip-path="url(#${id}q1)">${shell(id)}</g><g clip-path="url(#${id}q2)">${dots(id)}</g><g clip-path="url(#${id}q3)">${rings(id)}</g>`;
  // Black circle — center panel holding the demo request form
  const dark = () => `<circle class="sp-dark" r="48"/>`;
  const kinds = { rings, dots, shell, combo, glow, dark };
  const svg = (kind) => {
    const id = "sp" + ++uid;
    const body = (kinds[kind] || shell)(id);
    return `<svg class="sp sp--${kind}" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><defs>${shade(id + "g")}<clipPath id="${id}c"><circle r="48"/></clipPath></defs>${body}</svg>`;
  };
  const fill = (root = document) => {
    root.querySelectorAll("[data-sphere]:not([data-sphere-done])").forEach((el) => {
      el.insertAdjacentHTML("afterbegin", svg(el.dataset.sphere));
      el.setAttribute("data-sphere-done", "");
    });
  };
  window.MDSphere = { svg, fill };
})();
