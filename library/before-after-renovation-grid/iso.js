// Spot for the original’s hand-drawn isometric building illustration — redraws a building with the same 30° projection from box, window and roof props.
// <svg class="hz-iso" data-iso="aging" data-iso-state="after"> Pick a scene name and before/after and it fills in, like this. Colors come from the .hz-iso half of shared.css via --kf-*.
(() => {
  const C = Math.cos(Math.PI / 6);
  let box = [];
  const P = (x, y, z) => { const p = [(x - y) * C, (x + y) * 0.5 - z]; box.push(p); return p; };
  const pts = (a) => a.map((q) => P(...q).map((v) => v.toFixed(1)).join(",")).join(" ");
  const poly = (cls, a) => `<polygon class="${cls}" points="${pts(a)}"/>`;
  const seg = (cls, a, b) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line class="${cls}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; };
  const dot = (cls, x, y, z, r) => { const [cx, cy] = P(x, y, z); return `<circle class="${cls}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}"/>`; };

  // Box — only three faces are visible: top, left front (y end), right front (x end)
  const cube = (x, y, z, w, d, h, tone = "wall") =>
    poly(`${tone} is-top`, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]) +
    poly(`${tone} is-left`, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]) +
    poly(`${tone} is-right`, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]);
  // Window rows on the front two faces — a small parallelogram per floor per bay
  const windows = (x, y, z, w, d, floors, fh, cls = "glass", inset = 0.18) => {
    let s = "";
    for (let f = 0; f < floors; f++) {
      const z0 = z + f * fh + fh * 0.3, z1 = z + f * fh + fh * 0.78;
      const nw = Math.max(1, Math.round(w)), nd = Math.round(d);
      for (let i = 0; i < nw; i++) {
        const a = x + i * (w / nw) + inset, b = x + (i + 1) * (w / nw) - inset;
        s += poly(cls, [[a, y + d, z0], [b, y + d, z0], [b, y + d, z1], [a, y + d, z1]]);
      }
      for (let i = 0; i < nd; i++) {
        const a = y + i * (d / nd) + inset, b = y + (i + 1) * (d / nd) - inset;
        s += poly(cls, [[x + w, a, z0], [x + w, b, z0], [x + w, b, z1], [x + w, a, z1]]);
      }
    }
    return s;
  };
  const tree = (x, y, z, r = 0.35) => seg("trunk", [x, y, z], [x, y, z + r * 1.4]) + dot("leaf", x, y, z + r * 1.6, r) + dot("leaf is-light", x + 0.12, y - 0.1, z + r * 2, r * 0.62);
  const solar = (x, y, z, w, d) => {
    let s = "";
    for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) s += poly("solar", [[x + i + 0.08, y + j + 0.1, z + 0.12], [x + i + 0.92, y + j + 0.1, z + 0.12], [x + i + 0.92, y + j + 0.9, z + 0.4], [x + i + 0.08, y + j + 0.9, z + 0.4]]);
    return s;
  };
  const cracks = (x, y, z, w, h) => seg("crack", [x + w * 0.3, y, z + h * 0.8], [x + w * 0.42, y, z + h * 0.55]) + seg("crack", [x + w * 0.42, y, z + h * 0.55], [x + w * 0.36, y, z + h * 0.3]);
  const desk = (x, y, z) => cube(x, y, z, 0.9, 0.5, 0.32, "desk") + cube(x + 0.3, y + 0.12, z + 0.32, 0.3, 0.06, 0.24, "screen") + cube(x + 0.3, y + 0.62, z, 0.3, 0.3, 0.22, "chair");
  const crate = (x, y, z, s = 0.5) => cube(x, y, z, s, s, s * 0.8, "crate");
  const brace = (x, y, z, w, h) => seg("brace", [x, y, z], [x + w, y, z + h]) + seg("brace", [x + w, y, z], [x, y, z + h]);
  const braceR = (x, y, z, d, h) => seg("brace", [x, y, z], [x, y + d, z + h]) + seg("brace", [x, y + d, z], [x, y, z + h]);
  const slab = (x, y, z, w, d) => cube(x, y, z, w, d, 0.18, "slab");

  const scenes = {
    aging: (a) => {
      let s = cube(0, 0, 0, 3, 3, 6, a ? "wall" : "wall is-old") + windows(0, 0, 0, 3, 3, 6, 1, a ? "glass" : "glass is-old");
      if (a) { s += cube(0.2, 0.2, 6, 2.6, 2.6, 0.2, "planter"); for (const [x, y] of [[0.6, 0.6], [1.6, 0.8], [2.3, 1.8], [0.9, 2.2], [1.8, 2.5]]) s += tree(x, y, 6.2); s += tree(3.6, 1.2, 0, 0.45) + tree(1.4, 3.6, 0, 0.45); }
      else s += cracks(0, 3, 0, 3, 6) + cube(1, 1, 6, 0.8, 0.8, 0.6, "unit");
      return s;
    },
    zeb: (a) => {
      let s = cube(0, 0, 0, 5, 3, 3.3, "wall") + windows(0, 0, 0, 5, 3, 3, 1.1, a ? "glass is-pair" : "glass is-old");
      s += a ? solar(0.3, 0.3, 3.3, 4, 2) + tree(4.4, 2.6, 3.3, 0.25) : cube(0.6, 0.6, 3.3, 0.8, 0.6, 0.5, "unit") + cube(2.4, 1.2, 3.3, 0.8, 0.6, 0.5, "unit");
      return s;
    },
    bcp: (a) => {
      let s = cube(0, 0, 0, 2.4, 2, 8, "wall") + windows(0, 0, 0, 2.4, 2, 8, 1, "glass");
      if (a) { for (let f = 0; f < 8; f++) s += brace(0, 2, f, 1.2, 1) + brace(1.2, 2, f, 1.2, 1); s += cube(2.6, 1, 0, 1.6, 2.2, 0.15, "slab") + cube(0.6, 0.6, 8, 1.1, 0.9, 0.9, "unit"); }
      else s += poly("water", [[-0.6, 1.6, 0.02], [3.4, 1.6, 0.02], [3.4, 3.4, 0.02], [-0.6, 3.4, 0.02]]) + cracks(0, 2, 0, 2.4, 4);
      return s;
    },
    workplace: (a) => {
      let s = slab(0, 0, 0, 6, 4) + poly("wall is-left", [[0, 0, 0.18], [0, 4, 0.18], [0, 4, 2.2], [0, 0, 2.2]]) + poly("wall is-right", [[0, 0, 0.18], [6, 0, 0.18], [6, 0, 2.2], [0, 0, 2.2]]);
      for (let i = 0; i < 4; i++) s += poly("glass", [[0.5 + i * 1.4, 0, 0.9], [1.4 + i * 1.4, 0, 0.9], [1.4 + i * 1.4, 0, 1.8], [0.5 + i * 1.4, 0, 1.8]]);
      const rows = a ? [[1, 0.8], [2.5, 0.8], [4, 0.8], [1, 2.3], [2.5, 2.3], [4, 2.3]] : [[1.2, 1], [3.4, 2.2]];
      for (const [x, y] of rows) s += desk(x, y, 0.18);
      if (a) s += tree(5.5, 3.5, 0.18, 0.3) + tree(0.5, 3.5, 0.18, 0.3); else s += crate(4.6, 0.6, 0.18) + crate(4.9, 1.2, 0.18);
      return s;
    },
    facility: (a) => {
      let s = slab(0, 0, 0, 6, 4) + poly("wall is-right", [[0, 0, 0.18], [6, 0, 0.18], [6, 0, 2.4], [0, 0, 2.4]]) + poly("wall is-left", [[0, 0, 0.18], [0, 4, 0.18], [0, 4, 2.4], [0, 0, 2.4]]);
      if (a) { s += cube(0.4, 0.4, 0.18, 0.5, 3, 1.8, "rack") + cube(4.8, 1, 0.18, 0.8, 2.4, 0.4, "conveyor"); for (let i = 0; i < 3; i++) s += crate(1.6 + i * 0.9, 1.4, 0.18) + crate(1.6 + i * 0.9, 2.4, 0.18); }
      else for (const [x, y, z] of [[1, 1, 0.18], [1.4, 1.6, 0.18], [2.6, 2.2, 0.18], [1.2, 1.3, 0.58], [3.6, 0.8, 0.18], [4.4, 2.6, 0.18], [2, 3, 0.18]]) s += crate(x, y, z);
      return s;
    },
    compliance: (a) => {
      let s = cube(0, 0, 0, 4, 3, 2.4, "wall") + windows(0, 0, 0, 4, 3, 2, 1.2, "glass") + poly("roof is-left", [[0, 3, 2.4], [4, 3, 2.4], [4, 1.5, 3.4], [0, 1.5, 3.4]]) + poly("roof is-right", [[4, 0, 2.4], [4, 3, 2.4], [4, 1.5, 3.4]]);
      if (a) s += poly("ramp", [[4, 0.4, 0], [5.6, 0.4, 0], [5.6, 1.2, 0], [4, 1.2, 0.5]]) + cube(4, 2, 0, 0.6, 0.6, 1.2, "unit is-sign") + tree(-0.4, 3.6, 0, 0.3);
      else s += cracks(0, 3, 0, 4, 2.4);
      return s;
    },
    conversion: (a) => {
      let s = cube(0, 0, 0, 4, 3, 1.4, a ? "shop" : "wall is-old") + cube(0, 0, 1.4, 4, 3, 4.2, "wall") + windows(0, 0, 1.4, 4, 3, 3, 1.4, "glass");
      s += a ? poly("awning", [[0, 3, 1.3], [4, 3, 1.3], [4, 3.6, 1.0], [0, 3.6, 1.0]]) + windows(0, 0, 0, 4, 3, 1, 1.4, "glass is-shop", 0.1) + tree(4.6, 3.4, 0, 0.35) : windows(0, 0, 0, 4, 3, 1, 1.4, "shutter", 0.1);
      return s;
    },
    office: () => cube(0, 0, 0, 2.6, 2.6, 7, "wall") + windows(0, 0, 0, 2.6, 2.6, 7, 1, "glass is-band", 0.05),
    logistics: () => cube(0, 0, 0, 6, 3.6, 2.2, "wall") + windows(0, 3.5999, 0, 6, 0.0001, 1, 2.2, "shutter", 0.3) + cube(6.4, 1, 0, 1.6, 0.8, 0.8, "truck") + cube(8, 1, 0, 0.6, 0.8, 0.6, "truck is-cab"),
    industrial: () => cube(0, 0, 0, 5, 3, 2, "wall") + [0, 1.25, 2.5, 3.75].map((x) => poly("roof is-left", [[x, 3, 2], [x + 1.25, 3, 2], [x + 1.25, 3, 2.7], [x, 3, 2]])).join("") + cube(4, 0.4, 2, 0.5, 0.5, 2.2, "unit") + windows(0, 0, 0, 5, 3, 1, 2, "glass"),
    education: () => cube(0, 0, 0, 5, 2.6, 3.4, "wall") + windows(0, 0, 0, 5, 2.6, 3, 1.1, "glass") + cube(1.9, 2.6, 0, 1.2, 0.6, 1.2, "shop") + dot("clock", 2.5, 2.6, 4.2, 0.4) + cube(1.8, 1, 3.4, 1.4, 1.2, 1.4, "wall"),
    medical: () => cube(0, 0, 0, 4, 3, 4.4, "wall") + windows(0, 0, 0, 4, 3, 4, 1.1, "glass") + poly("cross", [[1.6, 3, 4.6], [2.4, 3, 4.6], [2.4, 3, 5.4], [1.6, 3, 5.4]]) + cube(1.6, 2.4, 4.4, 0.8, 0.6, 1, "wall"),
    hotel: () => cube(0, 0, 0, 2.2, 3.2, 7.4, "wall") + windows(0, 0, 0, 2.2, 3.2, 7, 1.05, "glass") + Array.from({ length: 6 }, (_, f) => cube(0, 3.2, 1.05 * (f + 1), 2.2, 0.3, 0.08, "slab")).join(""),
    commercial: () => cube(0, 0, 0, 6, 3, 2.4, "wall") + windows(0, 0, 0, 6, 3, 1, 1.4, "glass is-shop", 0.08) + poly("awning", [[0, 3, 1.5], [6, 3, 1.5], [6, 3.6, 1.2], [0, 3.6, 1.2]]) + cube(1, 1, 2.4, 2, 0.2, 0.8, "unit is-sign"),
  };

  const draw = (svg) => {
    const make = scenes[svg.dataset.iso];
    if (!make) return;
    box = [];
    const body = make(svg.dataset.isoState !== "before");
    const xs = box.map((p) => p[0]), ys = box.map((p) => p[1]), pad = 0.6;
    const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad, w = Math.max(...xs) - x0 + pad, h = Math.max(...ys) - y0 + pad;
    svg.setAttribute("viewBox", `${x0.toFixed(2)} ${y0.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = body;
  };
  window.hzIso = { draw, names: Object.keys(scenes) };
  document.querySelectorAll("svg[data-iso]").forEach(draw);
})();
