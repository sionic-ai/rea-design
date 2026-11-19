// To avoid using the original’s mascot and photos, we draw new art here that fits the same spot and ratio.
(function () {
  const v = (n) => `var(${n})`;
  const PALETTE = ["--site-mint", "--site-yellow", "--site-purple", "--kf-accent", "--site-red", "--site-g1", "--site-g3"].map(v);
  const INK = v("--kf-ink"), PAPER = v("--kf-surface"), SOFT = v("--kf-ink-soft");

  // Canvas can’t read var(), so skin variables (or colors built from variables) are resolved to computed colors
  const probe = document.createElement("i");
  const colorCache = {};
  function color(c) {
    if (colorCache[c]) return colorCache[c];
    probe.style.color = c.startsWith("--") ? v(c) : c;
    document.documentElement.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return (colorCache[c] = out);
  }

  function rng(seed) {
    let a = seed * 2654435761 >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  // 200×320 coordinate system, soles of the feet at y=320. pose: stand | run | wave | jump | sit
  function bean(r, o = {}) {
    const body = o.body || pick(r, PALETTE);
    const head = o.head || (r() < 0.5 ? PAPER : body);
    const accent = o.accent || pick(r, PALETTE.filter((c) => c !== body));
    const pose = o.pose || "stand";
    const S = `stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`;
    const limb = (x1, y1, x2, y2, c, w = 26) =>
      `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${INK}" stroke-width="${w + 12}" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    const shoe = (x, y, flip) =>
      `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-26 -22 Q-26 -40 -6 -40 L10 -40 Q34 -36 40 -14 L40 0 L-26 0 Z" fill="${SOFT}" ${S}/><path d="M-26 -7 L40 -7" stroke="${PAPER}" stroke-width="5"/></g>`;
    let legs, arms;
    if (pose === "run") {
      legs = limb(86, 236, 52, 292, SOFT) + shoe(48, 316, true) + limb(116, 236, 150, 286, SOFT) + shoe(158, 304);
      arms = limb(56, 160, 22, 196, body, 22) + limb(144, 160, 182, 130, body, 22);
    } else if (pose === "wave") {
      legs = limb(84, 236, 80, 292, SOFT) + shoe(76, 318, true) + limb(116, 236, 122, 292, SOFT) + shoe(128, 318);
      arms = limb(56, 160, 34, 214, body, 22) + limb(144, 158, 186, 96, body, 22);
    } else if (pose === "jump") {
      legs = limb(84, 236, 62, 278, SOFT) + shoe(56, 300, true) + limb(116, 236, 140, 276, SOFT) + shoe(148, 298);
      arms = limb(56, 158, 18, 110, body, 22) + limb(144, 158, 184, 108, body, 22);
    } else if (pose === "sit") {
      legs = limb(84, 238, 40, 262, SOFT) + shoe(30, 290, true) + limb(116, 238, 164, 262, SOFT) + shoe(172, 290);
      arms = limb(56, 162, 40, 222, body, 22) + limb(144, 162, 160, 222, body, 22);
    } else {
      legs = limb(86, 236, 84, 292, SOFT) + shoe(80, 318, true) + limb(114, 236, 118, 292, SOFT) + shoe(124, 318);
      arms = limb(56, 160, 36, 222, body, 22) + limb(144, 160, 166, 222, body, 22);
    }
    const eyeY = 92 + (r() - 0.5) * 6;
    const look = (r() - 0.5) * 8;
    const eyes = `<ellipse cx="${80 + look}" cy="${eyeY}" rx="10" ry="15" fill="${INK}"/><ellipse cx="${120 + look}" cy="${eyeY}" rx="10" ry="15" fill="${INK}"/><circle cx="${83 + look}" cy="${eyeY - 6}" r="4" fill="${PAPER}"/><circle cx="${123 + look}" cy="${eyeY - 6}" r="4" fill="${PAPER}"/>`;
    const mouth = r() < 0.5 ? `<path d="M90 120 Q100 130 110 120" fill="none" ${S}/>` : `<path d="M92 118 Q100 134 108 118 Z" fill="${v("--site-red")}" ${S}/>`;
    const cheeks = `<ellipse cx="66" cy="114" rx="9" ry="5" fill="${v("--site-g3")}" opacity=".55"/><ellipse cx="134" cy="114" rx="9" ry="5" fill="${v("--site-g3")}" opacity=".55"/>`;
    const antenna = `<path d="M100 32 Q${100 + (r() - 0.5) * 30} 8 ${100 + (r() - 0.5) * 24} -6" fill="none" ${S}/><circle cx="${100 + (r() - 0.5) * 24}" cy="-8" r="11" fill="${accent}" ${S}/>`;
    const extra = r() < 0.35
      ? `<path d="M40 84 Q40 18 100 18 Q160 18 160 84" fill="none" stroke="${INK}" stroke-width="12"/><rect x="28" y="72" width="22" height="38" rx="9" fill="${accent}" ${S}/><rect x="150" y="72" width="22" height="38" rx="9" fill="${accent}" ${S}/>`
      : r() < 0.5 ? `<path d="M48 64 Q100 6 152 64 Z" fill="${accent}" ${S}/><path d="M140 60 L188 66" ${S}/>` : "";
    return `${legs}${arms}<rect x="50" y="138" width="100" height="110" rx="42" fill="${body}" ${S}/><ellipse cx="100" cy="196" rx="28" ry="30" fill="${PAPER}" opacity=".55"/>${antenna}<circle cx="100" cy="88" r="62" fill="${head}" ${S}/>${extra}${eyes}${cheeks}${mouth}`;
  }

  const place = (inner, x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  // Bird mascot with wings spread (subpage KV, environment art). 240×200 coordinate system.
  function bird(o = {}) {
    const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
    const wing = (flip) => `<path transform="${flip ? "translate(240 0) scale(-1 1)" : ""}" d="M104 96 C70 70 40 40 18 6 C30 46 40 74 62 104 C48 104 36 108 26 116 C52 122 76 120 98 112 Z" fill="${v("--site-wing")}" ${S}/><path transform="${flip ? "translate(240 0) scale(-1 1)" : ""}" d="M40 40 C56 62 70 78 90 94 M30 86 C52 96 70 100 92 104" fill="none" stroke="${v("--site-wing-line")}" stroke-width="3" stroke-linecap="round"/>`;
    return `${wing(false)}${wing(true)}
      <ellipse cx="120" cy="128" rx="40" ry="46" fill="${v("--site-bird")}" ${S}/>
      <ellipse cx="110" cy="118" rx="12" ry="16" fill="${PAPER}" opacity=".7"/>
      <path d="M86 92 C88 66 104 54 120 54 C136 54 152 66 154 92 Z" fill="${o.cap || v("--site-red")}" ${S}/>
      <path d="M92 92 L148 92 L146 108 C132 116 108 116 94 108 Z" fill="${SOFT}" ${S}/>
      <circle cx="108" cy="100" r="5" fill="${PAPER}"/><circle cx="132" cy="100" r="5" fill="${PAPER}"/>
      <path d="M112 114 L120 126 L128 114 Z" fill="${v("--site-yellow")}" ${S}/>
      <path d="M100 172 L94 196 M140 172 L146 196" ${S}/>`;
  }

  const BUILD = {
    bird(w, h) { const s = Math.min(w / 240, h / 200); return place(bird(), (w - 240 * s) / 2, (h - 200 * s) / 2, s); },
    // Vertically tall character group (illustration slot beside the original Vision·Mission): a bird on top, four overlapping below.
    crowd(w, h, r) {
      const s = w / 420;
      return [
        place(bird({ cap: v("--site-red") }), w * 0.16, h * 0.0, s * 0.95),
        place(bean(r, { pose: "stand", body: v("--site-bullet"), head: PAPER, accent: v("--site-mint") }), w * 0.36, h * 0.07, s * 1.35),
        place(bean(r, { pose: "wave", body: v("--site-yellow") }), w * 0.02, h * 0.25, s * 1.05, -4),
        place(bean(r, { pose: "jump", body: v("--kf-accent") }), w * 0.28, h * 0.42, s * 0.9),
        place(bean(r, { pose: "stand", body: v("--site-purple") }), w * 0.58, h * 0.38, s * 1),
        `<ellipse cx="${w * 0.6}" cy="${h * 0.66}" rx="${w * 0.36}" ry="${h * 0.035}" fill="${v("--site-shade")}" opacity=".6"/>`,
      ].join("");
    },
    // Avatar card slot from the original careers page: one face down to the shoulders.
    avatar(w, h, r) { const s = Math.min(w / 200, h / 200); return place(bean(r, { pose: "stand" }), (w - 200 * s) / 2, h * 0.08, s * 1.15); },
    hero(w, h, r) {
      return [
        place(bean(r, { pose: "jump", body: v("--site-purple") }), w * 0.08, h * 0.02, h / 520, -8),
        place(bean(r, { pose: "wave", body: v("--site-yellow") }), w * 0.5, h * 0.06, h / 470, 6),
        place(bean(r, { pose: "stand", body: v("--site-mint"), head: PAPER }), w * 0.2, h * 0.3, h / 410, -3),
        place(bean(r, { pose: "run", body: v("--kf-accent") }), w * 0.56, h * 0.38, h / 470, 4),
      ].join("");
    },
    tall(w, h, r) { return place(bean(r, { pose: r() < 0.5 ? "stand" : "wave" }), 0, h * 0.04, Math.min(w / 200, h / 330)); },
    big(w, h, r) { return place(bean(r, { pose: "sit", head: PAPER }), w * 0.02, h * 0.1, Math.min(w / 210, h / 330)); },
    pose(w, h, r) { return place(bean(r, { pose: pick(r, ["stand", "wave", "jump", "run"]) }), (w - Math.min(w / 200, h / 330) * 200) / 2, 4, Math.min(w / 200, h / 330)); },
    duo(w, h, r) { const s = Math.min(w / 420, h / 330); return place(bean(r, { pose: "wave" }), w * 0.02, 4, s) + place(bean(r, { pose: "stand" }), w * 0.5, 4, s); },
    runner(w, h, r) { return place(bean(r, { pose: "run" }), 0, 0, Math.min(w / 200, h / 330)); },
    group(w, h, r) {
      const s = w / 420;
      return [
        place(bean(r, { pose: "wave", body: v("--site-red") }), w * 0.14, h * 0.02, s * 0.9),
        place(bean(r, { pose: "jump", body: v("--site-mint") }), w * 0.56, h * 0.06, s * 0.95),
        place(bean(r, { pose: "stand", body: v("--site-yellow") }), w * 0.0, h * 0.34, s),
        place(bean(r, { pose: "run", body: v("--site-purple") }), w * 0.5, h * 0.4, s),
        place(bean(r, { pose: "sit", body: v("--kf-accent") }), w * 0.12, h * 0.66, s * 0.95),
      ].join("");
    },
    shadow(w, h) { return `<ellipse cx="${w * 0.5}" cy="${h * 0.5}" rx="${w * 0.48}" ry="${h * 0.42}" fill="${v("--site-shade")}" opacity=".75"/><ellipse cx="${w * 0.36}" cy="${h * 0.46}" rx="${w * 0.2}" ry="${h * 0.16}" fill="${v("--site-shade-2")}" opacity=".6"/>`; },
    face(w, h, r) { return `<rect width="${w}" height="${h}" fill="${v("--site-face")}"/>` + place(bean(r, { head: PAPER }), w * 0.5 - 50 * (w / 120), h * 0.12, w / 120); },
    // ENTRY icon panel (in place of the original 31-face sprite): the background is left empty so the circle panel colors (white · black · orange) show through.
    // The head circle (center 100,88 · radius 62) fills 8/10 of the cell width and sits slightly below center — the body is clipped outside the circle
    icon(w, h, r) { const s = w / 150; return place(bean(r, { head: r() < 0.6 ? PAPER : undefined }), w * 0.5 - 100 * s, h * 0.58 - 88 * s, s); },
    // Job card upper body (original 454×300 character art slot): stands off to the right and below the waist is clipped outside the card.
    bust(w, h, r) { const s = h / 230; return place(bean(r, { pose: pick(r, ["stand", "wave"]) }), w * 0.6 - 100 * s, h * 0.16, s); },
    mark(w, h) {
      const c = Math.min(w, h) / 2;
      return `<circle cx="${c}" cy="${c}" r="${c}" fill="${INK}"/><path d="M${c} ${c * 0.35} Q${c * 1.06} ${c * 0.94} ${c * 1.65} ${c} Q${c * 1.06} ${c * 1.06} ${c} ${c * 1.65} Q${c * 0.94} ${c * 1.06} ${c * 0.35} ${c} Q${c * 0.94} ${c * 0.94} ${c} ${c * 0.35}Z" fill="${PAPER}"/>`;
    },
  };

  function paintArt(root = document) {
    root.querySelectorAll("[data-art]").forEach((el) => {
      const w = Math.max(1, el.offsetWidth), h = Math.max(1, el.offsetHeight);
      const r = rng(Number(el.dataset.seed || 7) + w % 13);
      const kind = el.dataset.art;
      const inner = (BUILD[kind] || BUILD.pose)(w, h, r);
      el.innerHTML = kind === "face" || kind === "mark" || kind === "icon" || kind === "bust" ? `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>` : svg(w, h, inner);
    });
  }

  // Photo slot: a canvas painted in different colors and shapes per scene type. The same picture is used for the background and for the slit effect without WebGL.
  // Per scene [top background, bottom background, light]. Skin colors are mixed toward ink·cotton, so changing the skin also changes the photo slot.
  const dk = (n, p = 80) => `color-mix(in oklab, var(--kf-ink) ${p}%, var(${n}))`;
  const lt = (n, p = 60) => `color-mix(in oklab, var(--kf-surface) ${p}%, var(${n}))`;
  const SCENES = {
    street: [dk("--site-purple"), "--site-rb1", "--site-yellow"], studio: [dk("--kf-accent", 62), lt("--kf-accent", 50), "--kf-accent"],
    window: [lt("--site-g1", 58), lt("--site-g1", 90), dk("--site-mint", 55)], night: [dk("--site-g1", 85), "--site-g3", "--site-g2"],
    portrait: [lt("--kf-accent", 80), dk("--kf-accent", 55), "--kf-ink-soft"], neon: ["--kf-accent", "--site-yellow", "--site-g1"],
    talk: [dk("--site-g1", 75), lt("--site-yellow", 45), "--kf-accent"], party: [dk("--site-purple", 88), "--site-purple", "--site-yellow"],
    cafe: [dk("--kf-accent", 75), lt("--kf-accent", 30), lt("--site-yellow", 82)], lounge: [dk("--kf-ink", 88), "--site-mint", "--site-g3"],
    market: [dk("--site-red", 82), "--site-red", "--site-yellow"], radio: [lt("--site-yellow", 82), "--kf-accent", "--kf-ink-soft"],
    skate: [lt("--site-g1", 50), lt("--site-yellow", 92), "--site-red"], toy: ["--site-yellow", "--site-g1", "--site-g3"],
  };
  const photoCache = {};
  function photo(kind, W = 960, H = 640) {
    const key = `${kind}-${W}-${H}`;
    if (photoCache[key]) return photoCache[key];
    const [a, b, c] = (SCENES[kind] || SCENES.night).map(color);
    const ink = color("--kf-ink"), paper = color("--kf-surface");
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const r = rng(kind.length * 97 + kind.charCodeAt(0));
    const bg = g.createLinearGradient(0, 0, W * 0.3, H);
    bg.addColorStop(0, a); bg.addColorStop(1, b);
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = i % 2 ? a : c; g.globalAlpha = 0.18 + r() * 0.3;
      const bw = W * (0.08 + r() * 0.18), bh = H * (0.3 + r() * 0.6);
      g.fillRect(r() * W, H - bh, bw, bh);
    }
    for (let i = 0; i < 46; i++) {
      const x = r() * W, y = r() * H * 0.9, rad = 4 + r() * W * 0.05;
      const rg = g.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, i % 3 ? c : paper); rg.addColorStop(1, "transparent");
      g.globalAlpha = 0.25 + r() * 0.5; g.fillStyle = rg;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 0.9 * 0.55;
    g.translate(W * (0.35 + r() * 0.3), H * 0.12);
    const s = H / 360;
    g.scale(s, s);
    g.fillStyle = ink;
    g.beginPath(); g.arc(100, 88, 62, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.roundRect(50, 138, 100, 150, 42); g.fill();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 0.08;
    for (let y = 0; y < H; y += 3) { g.fillStyle = y % 6 ? paper : ink; g.fillRect(0, y, W, 1); }
    g.globalAlpha = 1;
    return (photoCache[key] = cv);
  }
  const photoURL = (kind, W, H) => {
    const cv = photo(kind, W, H);
    return cv._url || (cv._url = cv.toDataURL("image/jpeg", 0.86));
  };

  window.ZArt = { paintArt, photo, photoURL, rng, color };
})();
