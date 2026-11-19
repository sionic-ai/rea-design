// Benefits and career design icons: with lottie-web 5.12.2 as in the original, the entering animation (60fps, frames 90→211) and the looping animation (frames 210→end) are layered.
// When the section is visible, after .8s play the entrance animation once and hide it when done, then after 3s play the looping animation (values from the original recruit.js).
// Instead of the original JSON, the drawing is a Lottie baked from our line art with the same frame count — strokes draw on when entering, and on repeat it breathes up and down in place.
(() => {
  const ICONS = [
    '<rect x="14" y="10" width="40" height="52" rx="3"/><path d="M22 22h24M22 32h24M22 42h14"/><path d="M60 30l12 12-18 18H42V48z"/>',
    '<rect x="10" y="14" width="44" height="30" rx="2"/><path d="M32 44v10M20 58h24"/><circle cx="68" cy="28" r="8"/><path d="M56 60c0-8 6-14 12-14s12 6 12 14"/>',
    '<path d="M10 22h60v10c-3.314 0-6 2.686-6 6s2.686 6 6 6v10H10V44c3.314 0 6-2.686 6-6s-2.686-6-6-6z"/><path d="M48 22v32" data-dash="4"/><circle cx="76" cy="20" r="6"/>',
    '<path d="M14 14h22v48H14zM38 18h18v44H38zM58 22l14-4 10 40-14 4z"/>',
    '<path d="M10 62l24-44 24 44z"/><path d="M34 18v-8l12 4-12 4"/><circle cx="66" cy="22" r="6"/><path d="M66 10v4M66 30v4M54 22h4M74 22h4"/>',
    '<path d="M40 6h12v10l6 8v38H34V24l6-8z"/><path d="M14 40h22v22H14z"/><path d="M36 46h6c2.209 0 4 1.791 4 4s-1.791 4-4 4h-6"/>',
    '<circle cx="28" cy="24" r="9"/><path d="M12 60c0-10 7-18 16-18s16 8 16 18"/><circle cx="60" cy="24" r="9"/><path d="M44 60c0-10 7-18 16-18s16 8 16 18"/>',
    '<rect x="8" y="10" width="64" height="40" rx="3"/><path d="M34 22l14 8-14 8z"/><path d="M24 62h32M40 50v12"/>',
    '<rect x="10" y="18" width="60" height="40" rx="3"/><path d="M10 28h60"/><circle cx="18" cy="23" r="1.5"/><path d="M24 40l8 8 18-18"/>',
  ];
  // End frames of the original looping art (software · seminar · viewing · book · camp · drink / meeting · video study · CG study) — the loop length differs per icon
  const LOOP_END = [361, 437, 360, 370, 421, 421, 390, 541, 586];
  const W = 88, H = 70, FR = 60;

  // SVG path → Lottie path (vertex v, incoming and outgoing handles i·o are relative to the vertex)
  const pathOf = (d) => {
    const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+/g);
    const out = [];
    let k = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, cur = null, lastC = null;
    const num = () => +tok[k++];
    const start = (nx, ny) => { cur = { v: [[nx, ny]], i: [[0, 0]], o: [[0, 0]], c: false }; out.push(cur); sx = nx; sy = ny; };
    const line = (nx, ny) => { cur.v.push([nx, ny]); cur.i.push([0, 0]); cur.o.push([0, 0]); };
    const curve = (x1, y1, x2, y2, nx, ny) => {
      const n = cur.v.length - 1;
      cur.o[n] = [x1 - cur.v[n][0], y1 - cur.v[n][1]];
      cur.v.push([nx, ny]); cur.i.push([x2 - nx, y2 - ny]); cur.o.push([0, 0]);
      lastC = [x2, y2];
    };
    while (k < tok.length) {
      if (/[a-zA-Z]/.test(tok[k])) cmd = tok[k++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const bx = rel ? x : 0, by = rel ? y : 0;
      if (C !== "C" && C !== "S") lastC = null;
      if (C === "M") { x = bx + num(); y = by + num(); start(x, y); cmd = rel ? "l" : "L"; }
      else if (C === "L") { x = bx + num(); y = by + num(); line(x, y); }
      else if (C === "H") { x = bx + num(); line(x, y); }
      else if (C === "V") { y = by + num(); line(x, y); }
      else if (C === "C") { const a = [bx + num(), by + num(), bx + num(), by + num(), bx + num(), by + num()]; curve(...a); x = a[4]; y = a[5]; }
      else if (C === "S") {
        const r = lastC ? [2 * x - lastC[0], 2 * y - lastC[1]] : [x, y];
        const a = [bx + num(), by + num(), bx + num(), by + num()];
        curve(r[0], r[1], ...a); x = a[2]; y = a[3];
      } else if (C === "Z") {
        const n = cur.v.length - 1;
        if (n > 0 && cur.v[n][0] === sx && cur.v[n][1] === sy) { cur.i[0] = cur.i[n]; cur.v.pop(); cur.i.pop(); cur.o.pop(); }
        cur.c = true; x = sx; y = sy;
      }
    }
    return out.map((p) => ({ ty: "sh", ks: { a: 0, k: p } }));
  };
  const shapesOf = (src) => {
    const svg = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${src}</svg>`, "image/svg+xml").documentElement;
    return [...svg.children].map((el) => {
      const n = (a) => +(el.getAttribute(a) || 0);
      const geo = el.tagName === "rect" ? [{ ty: "rc", d: 1, p: { a: 0, k: [n("x") + n("width") / 2, n("y") + n("height") / 2] }, s: { a: 0, k: [n("width"), n("height")] }, r: { a: 0, k: n("rx") } }]
        : el.tagName === "circle" ? [{ ty: "el", d: 1, p: { a: 0, k: [n("cx"), n("cy")] }, s: { a: 0, k: [n("r") * 2, n("r") * 2] } }]
        : pathOf(el.getAttribute("d"));
      const dash = el.dataset.dash ? [{ n: "d", nm: "dash", v: { a: 0, k: +el.dataset.dash } }, { n: "g", nm: "gap", v: { a: 0, k: +el.dataset.dash } }] : undefined;
      // Stroke color is overridden by CSS through skin variables (.ic svg path)
      return [...geo, { ty: "st", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2, ...(dash && { d: dash }) }];
    });
  };
  const ease = { o: { x: [0.33], y: [0] }, i: { x: [0.2], y: [1] } };
  const sine = { o: { x: [0.37], y: [0] }, i: { x: [0.63], y: [1] } };
  const layer = (groups, ks, extra = []) => ({
    ddd: 0, ind: 1, ty: 4, nm: "icon", sr: 1, ao: 0, ip: 0, op: 1000, st: 0, bm: 0,
    ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, a: { a: 0, k: [W / 2, H / 2, 0] }, s: { a: 0, k: [100, 100, 100] }, ...ks },
    // For Lottie, trim (tm) must come before stroke (st) so the trimmed path is drawn — order: shape, trim, stroke, transform
    shapes: groups.map((it) => ({ ty: "gr", it: [...it.slice(0, -1), ...extra, it[it.length - 1], { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] })),
  });
  // Lottie rewrites the data it receives in place — if one object is referenced from several places (the same trim per group) paths get tangled, so pass a full copy
  const comp = (ip, op, l) => JSON.parse(JSON.stringify({ v: "5.12.2", fr: FR, ip, op, w: W, h: H, nm: "icon", ddd: 0, assets: [], layers: [l] }));
  // Incoming drawing: from frame 90 the strokes draw fully in 1.5s and stay until frame 211
  const intro = (groups) => comp(90, 211, layer(groups, { p: { a: 0, k: [W / 2, H / 2, 0] } }, [{ ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 90, s: [0], ...ease }, { t: 180, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 }]));
  // Looping art: from frame 210 to the last frame it rises 4px and settles — the last frame equals the first so there is no seam
  const loop = (groups, end) => comp(210, end, layer(groups, { p: { a: 1, k: [{ t: 210, s: [W / 2, H / 2, 0], ...sine }, { t: (210 + end) / 2, s: [W / 2, H / 2 - 4, 0], ...sine }, { t: end, s: [W / 2, H / 2, 0] }] } }));

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const icons = [...document.querySelectorAll(".ic[data-icon]")].map((f) => {
    const n = +f.dataset.icon, groups = shapesOf(ICONS[n]);
    f.innerHTML = '<i class="ic-load"></i><i class="ic-loop"></i>';
    const [inBox, loopBox] = f.children;
    const a = lottie.loadAnimation({ container: inBox, renderer: "svg", loop: false, autoplay: false, animationData: intro(groups) });
    const b = lottie.loadAnimation({ container: loopBox, renderer: "svg", loop: true, autoplay: false, animationData: loop(groups, LOOP_END[n]) });
    loopBox.hidden = !reduce;
    inBox.hidden = reduce;
    a.addEventListener("complete", () => { inBox.hidden = true; loopBox.hidden = false; });
    return { f, a, b };
  });
  if (reduce) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    icons.filter((ic) => e.target.contains(ic.f)).forEach(({ a, b }) => {
      setTimeout(() => a.play(), 800);
      setTimeout(() => b.play(), 3000);
    });
  }));
  document.querySelectorAll("#welfare, #career").forEach((s) => io.observe(s));
})();
