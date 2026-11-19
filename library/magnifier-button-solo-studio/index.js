/* Home — ruler · building section (line → grid → layout → font → color → code → publish → button) · word blackout · fan · stacking cards · measuring crosshair */
(() => {
  const { mm, reduce, fine, lenis, clamp } = window.mtShared;

  /* Left ruler — a tick every 8px, a number every 64px */
  const ruler = document.querySelector(".mt-ruler");
  if (ruler) {
    const h = ruler.getBoundingClientRect().height || innerHeight;
    let out = "";
    for (let y = 0; y < h; y += 8) {
      const big = y % 64 === 0, mid = y % 32 === 0;
      out += `<i style="top:${y}px;width:${big ? 14 : mid ? 9 : 5}px"></i>`;
      if (big && y) out += `<b style="top:${y}px">${y}</b>`;
    }
    ruler.innerHTML = out;
  }

  /* ── Building ── */
  const STEPS = [0, 1.3, 2.5, 3.9, 5.1, 6.3, 7.6, 8.6];
  const CAPS = [
    ["One line.", "Your step description here in one line. Positions are measured and set."],
    ["The grid.", "Your one-line step description goes here. Everything else is matched to this later."],
    ["The layout.", "Your two-line step description here. Lines become planes: header, title, image, button."],
    ["The type.", "Your one-line step description goes here. Match size and width line by line."],
    ["The colour.", "Your one-line step description goes here. Paper, ink, one red."],
    ["Some code.", "Put a one-line step description here. What was drawn gets built by hand."],
    ["Go live.", "Your one-line step description goes here. Loads fast and stays crisp everywhere."],
    ["Your move.", "Your step description goes here, in two lines. Everything you have just seen is contained in this one button."],
  ];
  const sec = document.querySelector(".mt-build");
  const stage = sec && sec.querySelector(".mt-build-stage");
  const art = sec && sec.querySelector(".mt-build-art");
  const capBox = sec && sec.querySelector(".mt-captions");
  const countEl = sec && sec.querySelector("[data-count]");
  const skip = sec && sec.querySelector("[data-skip]");
  if (capBox) {
    capBox.innerHTML = CAPS.map(([t, p], i) => `<div class="mt-cap${i === 0 ? " is-on" : ""}"><div class="mt-measure"><span class="mt-accent">${String(i + 1).padStart(2, "0")}</span><i></i><span>${String(CAPS.length).padStart(2, "0")}</span></div><h3 class="mt-d3">${t}</h3><p>${p}</p></div>`).join("");
  }
  const caps = capBox ? [...capBox.children] : [];
  const showCap = (i) => caps.forEach((c, j) => c.classList.toggle("is-on", j === i));
  if (skip) skip.addEventListener("click", () => {
    const y = sec.offsetTop + sec.offsetHeight - 0.1 * innerHeight;
    lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: "smooth" });
  });

  const measurer = document.createElement("canvas").getContext("2d");
  const css = window.mtShared.css;
  const measure = (text, weight, size, kind) => {
    const fam = kind === "display" ? css("--kf-font-display") : kind === "mono" ? css("--kf-font-mono") : css("--kf-font-sans");
    measurer.font = `${weight} ${size}px ${fam}`;
    return measurer.measureText(text).width;
  };
  const WORDS = { headline: "A big title here.", lead: "Your intro sentence goes here. One person does both sides: design and code. Fill it through to the last line.", label: "Start Project", secondary: "View work", nav: ["Menu 1", "Menu 2", "Menu 3"], menu: "Menu" };

  // Measures blueprint positions from the panel size — same ratios as the original (wide screens panel width .64 and 1.6 ratio, narrow screens .6 ratio)
  const layout = (Wd, Ht) => {
    const nar = Wd < 700 || Wd / Ht < 0.85;
    const top = (Wd < 768 ? 64 : 72) + (nar ? 10 : 20);
    const room = Math.max(200, Ht - (nar ? 196 : 168) - top);
    let w, h;
    if (nar) { w = Math.min(Wd - 32, 440); h = Math.min(room, w / 0.6); } else { w = Math.min(0.64 * Wd, 1080, 1.6 * room); h = w / 1.6; }
    const A = { x: Math.round((Wd - w) / 2), y: Math.round(top + (room - h) / 2), w: Math.round(w), h: Math.round(h) };
    const at = (r) => ({ x: A.x + A.w * r[0], y: A.y + A.h * r[1], w: A.w * r[2], h: A.h * r[3] });
    const barH = Math.round(clamp(A.h * (nar ? 0.055 : 0.065), 22, 40));
    const L = nar ? { logo: [0.07, 0.1, 0.26, 0.035], head: [0.07, 0.19, 0.86, 0.19], lead: [0.07, 0.41, 0.82, 0.09], btnY: 0.54, btnH: 0.075, img: [0.07, 0.66, 0.86, 0.29] }
      : { logo: [0.05, 0.13, 0.1, 0.045], head: [0.05, 0.28, 0.5, 0.24], lead: [0.05, 0.58, 0.36, 0.1], btnY: 0.73, btnH: 0.1, img: [0.58, 0.2, 0.37, 0.66] };
    const logo = at(L.logo);
    const nav = nar ? [{ r: at([0.72, 0.1, 0.21, 0.035]), label: WORDS.menu }] : WORDS.nav.map((t, i) => ({ r: at([0.6 + 0.09 * i, 0.13, 0.08, 0.045]), label: t }));
    const head = at(L.head);
    const hw = (t) => measure(t, 500, 100, "display") - 3.5 * Math.max(0, t.length - 1);
    const words = WORDS.headline.split(" ");
    let lines = [WORDS.headline], best = Infinity;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(" "), b = words.slice(i).join(" "), m = Math.max(hw(a), hw(b)); if (m < best) { best = m; lines = [a, b]; } }
    const widest = Math.max(...lines.map(hw));
    const headSize = Math.floor(Math.min((head.w / widest) * 100, head.h / (0.98 * lines.length)));
    const headLines = lines.map((t) => ({ text: t, w: (hw(t) * headSize) / 100 }));
    const lead = at(L.lead);
    const leadSize = nar ? 11 : Math.round(clamp(0.0165 * A.w, 10, 15));
    const leadLines = [];
    { let cur = ""; for (const wd of WORDS.lead.split(" ")) { const n = cur ? `${cur} ${wd}` : wd; if (measure(n, 400, leadSize, "text") <= lead.w || !cur) cur = n; else { leadLines.push(cur); cur = wd; if (leadLines.length === 3) break; } } if (leadLines.length < 3 && cur) leadLines.push(cur); }
    const btnW = Math.round(measure(WORDS.label, 500, 15.2, "text") + 24 + 14 + 36 + 8);
    const sBtn = clamp((A.h * L.btnH) / 52, 0.5, 1);
    const btn = { x: Math.round(A.x + A.w * (nar ? 0.07 : 0.05)), y: Math.round(A.y + A.h * L.btnY), w: btnW * sBtn, h: 52 * sBtn };
    const dot = { x: btn.x + (btnW - 26) * sBtn, y: btn.y + 26 * sBtn, r: 18 * sBtn };
    let btn2 = null;
    if (!nar) { const w2 = (measure(WORDS.secondary, 500, 15.2, "text") + 24 + 14 + 36 + 8) * sBtn, x2 = btn.x + btn.w + 12 * sBtn; if (x2 + w2 < A.x + 0.56 * A.w) btn2 = { x: x2, y: btn.y, w: w2, h: btn.h }; }
    const img = at(L.img);
    const nCols = nar ? 4 : 12, cx0 = A.x + A.w * (nar ? 0.07 : 0.05), cx1 = A.x + A.w * (nar ? 0.93 : 0.95), gap = A.w * (nar ? 0.04 : 0.016), cw = (cx1 - cx0 - gap * (nCols - 1)) / nCols;
    const cols = Array.from({ length: nCols }, (_, i) => ({ x: cx0 + i * (cw + gap), y: A.y + barH, w: cw, h: A.h - barH }));
    const pct = (v) => `${(clamp(v, 0, 1) * 100).toFixed(3)}%`;
    const hLine = (key, y, from, kind, span) => { const o = from === "l" ? 0 : Wd, f = (v) => Math.abs(v - o) / Wd; return { key, d: `M${o} ${Math.round(y) + 0.5}H${from === "l" ? Wd : 0}`, trim: span ? `${pct(Math.min(f(span[0]), f(span[1])))} ${pct(Math.max(f(span[0]), f(span[1])))}` : null, kind }; };
    const vLine = (key, x, from, kind, span) => { const o = from === "t" ? 0 : Ht, f = (v) => Math.abs(v - o) / Ht; return { key, d: `M${Math.round(x) + 0.5} ${o}V${from === "t" ? Ht : 0}`, trim: span ? `${pct(Math.min(f(span[0]), f(span[1])))} ${pct(Math.max(f(span[0]), f(span[1])))}` : null, kind }; };
    const XS = [A.x, A.x + A.w], YS = [A.y, A.y + A.h];
    const guides = [hLine("frame-top", A.y, "l", "frame", XS), vLine("frame-right", A.x + A.w, "b", "frame", YS), hLine("frame-bottom", A.y + A.h, "r", "frame", XS), vLine("frame-left", A.x, "t", "frame", YS),
      hLine("bar", A.y + barH, "r", "bar", XS), hLine("head", head.y, "l", "el", [head.x, head.x + head.w]), hLine("lead", lead.y, "r", "el", [lead.x, lead.x + lead.w]),
      hLine("btn", btn.y, "l", "el", [btn.x, btn.x + btn.w]), vLine("img", img.x, "b", "el", [img.y, img.y + img.h]), hLine("img-top", img.y, "r", "el", [img.x, img.x + img.w])];
    const axis = vLine("axis", A.x + A.w / 2, "t", "axis");
    let code;
    if (nar) code = { x: A.x + 0.04 * A.w, y: A.y + 0.635 * A.h, w: 0.92 * A.w, h: 0.34 * A.h };
    else { const cw2 = Math.min(0.52 * A.w, 460), ch = Math.min(0.7 * A.h, 300); code = { x: Math.min(A.x + 1.04 * A.w - cw2, Wd - 24 - cw2), y: A.y + 0.2 * A.h, w: cw2, h: ch }; }
    const codeSize = nar ? 10 : clamp(code.w / 34, 10, 13.5);
    const to = { ink: { x: head.x + (headLines[0] ? headLines[0].w : head.w) * 0.35, y: head.y + 0.55 * headSize }, paper: { x: A.x + A.w * (nar ? 0.5 : 0.32), y: A.y + A.h * (nar ? 0.155 : 0.205) }, red: { x: dot.x, y: dot.y } };
    const sw = [{ cls: "b-sw-ink", name: "Eat", to: to.ink }, { cls: "b-sw-paper", name: "Paper", to: to.paper }, { cls: "b-sw-red", name: "Dot", to: to.red }];
    const swatches = !nar && A.x >= 130 ? sw.map((s, i) => ({ ...s, x: A.x - 56, y: A.y + A.h * (0.3 + 0.22 * i), side: "left" }))
      : nar ? sw.map((s, i) => ({ ...s, x: A.x + A.w * (0.6 + 0.14 * i), y: btn.y + btn.h / 2 - 6, side: "below" })) : sw.map((s, i) => ({ ...s, x: A.x + A.w * (0.25 + 0.25 * i), y: A.y + 0.5 * A.h, side: "below" }));
    const fs = nar ? 1.12 : 1.3;
    const final = { x: Wd / 2 - (btnW * fs) / 2, y: top + 0.46 * room - 26 * fs, s: fs };
    const finalRect = { x: final.x - 12, y: final.y - 12, w: btnW * fs + 24, h: 52 * fs + 24 };
    return { Wd, Ht, nar, A, radius: nar ? 18 : 12, barH, logo, logoSize: Math.round(0.95 * logo.h), nav, navSize: clamp(A.w * (nar ? 0.03 : 0.0135), 9, 13), head, headLines, headSize, lead, leadLines, leadSize, btn, sBtn, btnW, dot, btn2, img, cols, guides, axis, code, codeSize, swatches, final, finalRect, top };
  };


  // Handwritten arrow pointing at the finished button — as in the original, from the right of the button (above it when narrow) the curve opens from the left over .55s, the head .22s (after .62s), the lettering .9s (after .7s)
  const clickNote = (g) => {
    const s = g.finalRect, side = !g.nar && s.x + s.w + 250 < g.Wd;
    const r = side ? { x: s.x + s.w + 44, y: s.y - 22 } : { x: s.x + 0.5 * s.w - 6, y: s.y - 70 };
    const n = side ? { x: s.x + s.w + 8, y: s.y + 0.5 * s.h } : { x: s.x + 0.4 * s.w, y: s.y - 8 };
    const o = side ? { x: r.x + 6, y: r.y + 16 } : { x: r.x - 8, y: r.y + 10 };
    const c = side ? { x: o.x - 4, y: o.y + 26 } : { x: o.x - 34, y: o.y + 4 };
    const h = side ? { x: n.x + 34, y: n.y + 4 } : { x: n.x - 6, y: n.y - 30 };
    const a = Math.atan2(n.y - h.y, n.x - h.x), m = [a + Math.PI - 0.5, a + Math.PI + 0.5].map((e) => ({ x: n.x + 11 * Math.cos(e), y: n.y + 11 * Math.sin(e) }));
    return `<div class="b-click" aria-hidden="true"><svg viewBox="0 0 ${g.Wd} ${g.Ht}"><path class="b-click-line" pathLength="1" d="M${o.x} ${o.y}C${c.x} ${c.y} ${h.x} ${h.y} ${n.x} ${n.y}"/><path class="b-click-head" pathLength="1" d="M${m[0].x} ${m[0].y}L${n.x} ${n.y}L${m[1].x} ${m[1].y}"/></svg><span class="b-click-text" style="left:${r.x}px;top:${r.y}px">Go on, press it.</span></div>`;
  };
  const center = (x, y, w, h) => `data-cx="${x + w / 2}" data-cy="${y + h / 2}"`;
  const render = (g) => {
    const { A, Wd, Ht } = g;
    const corners = [[A.x, A.y], [A.x + A.w, A.y], [A.x, A.y + A.h], [A.x + A.w, A.y + A.h]];
    const compR = Math.max(36, 0.62 * g.btn.w);
    const P = 0.98 * g.headSize, base = g.head.y + 4 + 0.845 * g.headSize, xh = base - 0.52 * g.headSize;
    const k = g.nar ? 1.55 : 1.7, lineH = g.codeSize * k, codeTop = g.code.y + 44;
    const from = g.nar ? { x: g.btn.x + 0.5 * g.btn.w, y: g.btn.y + g.btn.h + 4 } : { x: g.btn.x + g.btn.w + 4, y: g.btn.y + g.btn.h / 2 };
    const to = g.nar ? { x: from.x, y: g.code.y } : { x: g.code.x, y: codeTop + 0.5 * lineH };
    const codeLeader = g.nar ? `M${to.x} ${to.y}V${from.y}` : `M${to.x} ${to.y}C${to.x - 60} ${to.y} ${from.x + 60} ${from.y} ${from.x} ${from.y}`;
    const fr = g.finalRect, fc = [[fr.x, fr.y], [fr.x + fr.w, fr.y], [fr.x, fr.y + fr.h], [fr.x + fr.w, fr.y + fr.h]];
    const CODE = [[["<", "dim"], ["Button", "tag"], [" href", "prop"], ["=", "dim"], ['"contact.html"', ""], [">", "dim"]], [[`  ${WORDS.label}`, ""]], [["</", "dim"], ["Button", "tag"], [">", "dim"]], [["", ""]],
      [[".btn", "tag"], [" {", "dim"]], [["  height", "prop"], [": ", "dim"], ["52px", ""], [";", "dim"]], [["  border-radius", "prop"], [": ", "dim"], ["999px", ""], [";", "dim"]], [["}", "dim"]], [[".btn-dot", "tag"], [" { ", "dim"], ["background", "prop"], [": ", "dim"], ["var(--accent)", ""], [" }", "dim"]]];
    const svg = `<svg viewBox="0 0 ${Wd} ${Ht}" width="${Wd}" height="${Ht}">
      <g>${g.cols.map((c) => `<rect class="b-col" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}"/>`).join("")}</g>
      ${g.guides.map((l) => `<path class="b-guide" data-kind="${l.kind}" ${l.trim ? `data-trim="${l.trim}"` : ""} d="${l.d}"/>`).join("")}
      <path class="b-axis" d="${g.axis.d}"/>
      ${corners.map(([x, y], i) => `<g><path class="b-reg" d="M${x - 7} ${y + 0.5}H${x + 8}M${x + 0.5} ${y - 7}V${y + 8}"/><text class="b-coord b-label" x="${x + (i % 2 ? -10 : 10)}" y="${y + (i < 2 ? -10 : 18)}" text-anchor="${i % 2 ? "end" : "start"}">x ${Math.round(x)} · y ${Math.round(y)}</text></g>`).join("")}
      <circle class="b-compass" cx="${g.dot.x}" cy="${g.dot.y}" r="${compR}" transform="rotate(-90 ${g.dot.x} ${g.dot.y})"/>
      <text class="b-compass-label b-label b-label-accent" x="${g.dot.x + compR + 8}" y="${g.dot.y - 6}">r ${Math.round(compR)}</text>
      <rect class="b-frame" x="${A.x + 0.5}" y="${A.y + 0.5}" width="${A.w - 1}" height="${A.h - 1}" rx="${g.radius}"/>
      ${[0, 1, 2].map((t) => { const cx = A.x + 0.62 * g.barH + t * g.barH * 0.42, cy = A.y + g.barH / 2; return `<circle class="b-bardot b-collapse" cx="${cx}" cy="${cy}" r="${0.12 * g.barH}" ${center(cx, cy, 0, 0)}/>`; }).join("")}
      <g class="b-dimA"><path class="b-dimline" d="M${A.x} ${A.y - 14}H${A.x + A.w}M${A.x + 0.5} ${A.y - 19}v10M${A.x + A.w - 0.5} ${A.y - 19}v10"/><text class="b-label b-label-accent" x="${A.x + A.w / 2}" y="${A.y - 20}" text-anchor="middle">${A.w} × ${A.h}</text></g>
      <g class="b-el b-collapse" data-el="logo" data-unfold="y" ${center(g.logo.x, g.logo.y, g.logo.w, g.logo.h)}><rect class="b-wire" x="${g.logo.x}" y="${g.logo.y}" width="${g.logo.w}" height="${g.logo.h}" rx="3"/></g>
      <g class="b-el b-collapse" data-el="nav" data-unfold="y" ${center(g.nav[0].r.x, g.nav[0].r.y, g.nav[g.nav.length - 1].r.x + g.nav[g.nav.length - 1].r.w - g.nav[0].r.x, g.nav[0].r.h)}>${g.nav.map((n) => `<rect class="b-wire" x="${n.r.x}" y="${n.r.y}" width="${n.r.w}" height="${n.r.h}" rx="${n.r.h / 2}"/>`).join("")}</g>
      <g class="b-el b-collapse" data-el="head" data-unfold="y" ${center(g.head.x, g.head.y, g.head.w, g.head.h)}><rect class="b-wire" x="${g.head.x}" y="${g.head.y}" width="${g.head.w}" height="${g.head.h}" rx="3"/>${g.headLines.map((l, i) => `<rect class="b-ph" x="${g.head.x + 6}" y="${g.head.y + 6 + i * P + 0.18 * P}" width="${Math.max(10, l.w - 12)}" height="${0.56 * P}" rx="2"/>`).join("")}</g>
      <g class="b-el b-collapse" data-el="lead" data-unfold="y" ${center(g.lead.x, g.lead.y, g.lead.w, g.lead.h)}><rect class="b-wire" x="${g.lead.x}" y="${g.lead.y}" width="${g.lead.w}" height="${g.lead.h}" rx="3"/>${g.leadLines.map((l, i) => `<rect class="b-ph" x="${g.lead.x + 5}" y="${g.lead.y + 5 + i * g.leadSize * 1.45}" width="${(g.lead.w - 10) * (i === g.leadLines.length - 1 ? 0.62 : 0.94)}" height="${0.6 * g.leadSize}" rx="2"/>`).join("")}</g>
      <g class="b-el" data-el="img" data-unfold="x"><rect class="b-wire" x="${g.img.x}" y="${g.img.y}" width="${g.img.w}" height="${g.img.h}" rx="${0.7 * g.radius}"/><path class="b-wire" d="M${g.img.x} ${g.img.y}L${g.img.x + g.img.w} ${g.img.y + g.img.h}M${g.img.x + g.img.w} ${g.img.y}L${g.img.x} ${g.img.y + g.img.h}"/></g>
      <g class="b-el" data-el="btn" data-unfold="y"><rect class="b-wire" x="${g.btn.x}" y="${g.btn.y}" width="${g.btn.w}" height="${g.btn.h}" rx="${g.btn.h / 2}"/><rect class="b-ph" x="${g.btn.x + 24 * g.sBtn}" y="${g.btn.y + 0.4 * g.btn.h}" width="${(g.btnW - 90) * g.sBtn}" height="${0.2 * g.btn.h}" rx="2"/></g>
      ${g.btn2 ? `<g class="b-el" data-el="btn2" data-unfold="y"><rect class="b-wire" x="${g.btn2.x}" y="${g.btn2.y}" width="${g.btn2.w}" height="${g.btn2.h}" rx="${g.btn2.h / 2}"/></g>` : ""}
      <g class="b-dim"><path class="b-dimline" d="M${g.btn.x - 10} ${g.btn.y}v${g.btn.h}M${g.btn.x - 14} ${g.btn.y + 0.5}h8M${g.btn.x - 14} ${g.btn.y + g.btn.h - 0.5}h8"/><text class="b-label b-label-accent" x="${g.btn.x - 16}" y="${g.btn.y + g.btn.h / 2 + 3}" text-anchor="end">52</text></g>
      <g class="b-dim"><path class="b-dimline" d="M${g.head.x} ${g.head.y + g.head.h + 6}H${g.head.x + g.head.w}"/><text class="b-label b-label-accent" x="${g.head.x + g.head.w / 2}" y="${g.head.y + g.head.h + 18}" text-anchor="middle">${Math.round(g.head.w)}</text></g>
      <g class="b-dim"><path class="b-dimline" d="M${g.img.x + g.img.w + 8} ${g.img.y}V${g.img.y + g.img.h}"/><text class="b-label b-label-accent" x="${g.img.x + g.img.w + 12}" y="${g.img.y + g.img.h / 2}">${Math.round(g.img.h)}</text></g>
      <g class="b-typo"><path class="b-typo-line" d="M${A.x} ${base}H${A.x + A.w}"/><path class="b-typo-line is-soft" d="M${A.x + A.w} ${xh}H${A.x}"/><text class="b-label b-label-accent" x="${g.head.x}" y="${g.head.y - 8}">Title typeface · ${g.headSize}/${Math.round(P)}</text></g>
      ${g.swatches.map((s, i) => { const d = s.side === "left" ? `M${s.x + 14} ${s.y}H${A.x + 0.022 * A.w + 4 * i}V${s.to.y}H${s.to.x}` : Math.abs(s.to.y - s.y) < 24 ? `M${s.x - 14} ${s.y}H${s.to.x}` : `M${s.x} ${s.y + (s.to.y > s.y ? 14 : -14)}V${(s.y + s.to.y) / 2}H${s.to.x}V${s.to.y}`;
        return `<g><path class="b-leader" d="${d}"/><g class="b-swatch"><circle class="b-swatch-dot ${s.cls}" cx="${s.x}" cy="${s.y}" r="${g.nar ? 10 : 13}"/><text class="b-swatch-label" x="${s.side === "left" ? s.x - 20 : s.x}" y="${s.side === "left" ? s.y + 3 : s.y + 26}" text-anchor="${s.side === "left" ? "end" : "middle"}">${s.name}</text></g></g>`; }).join("")}
      <path class="b-code-leader" d="${codeLeader}"/><circle class="b-code-end" cx="${from.x}" cy="${from.y}" r="3.5"/>
      ${fc.map(([x, y], i) => `<path class="b-final-line" d="M${x + (i % 2 ? 1 : -1) * 18} ${y}H${x}V${y + (i < 2 ? -1 : 1) * 18}" transform="translate(0 0)"/>`).join("")}
      ${fc.map(([x, y]) => `<rect class="b-handle" x="${x - 3.5}" y="${y - 3.5}" width="7" height="7"/>`).join("")}
      <text class="b-final-label b-label b-label-accent" x="${fr.x}" y="${fr.y - 10}">Button · ${Math.round(fr.w - 24)} × ${Math.round(fr.h - 24)}</text>
      <circle class="b-dot-ring" cx="${Wd / 2}" cy="${Ht / 2}" r="9"/>
      <circle class="b-dot" cx="${Wd / 2}" cy="${Ht / 2}" r="5"/>
    </svg>`;
    const headHtml = g.headLines.map((l, i) => `<div class="b-head" style="left:${g.head.x + 6}px;top:${g.head.y + 4 + i * P}px;font-size:${g.headSize}px">${l.text.split(" ").map((w) => `<span class="b-word">${w} </span>`).join("")}</div>`).join("");
    const leadHtml = g.leadLines.map((l, i) => `<div class="b-leadline" style="left:${g.lead.x + 5}px;top:${g.lead.y + 2 + i * g.leadSize * 1.45}px;font-size:${g.leadSize}px">${l}</div>`).join("");
    const navHtml = g.nav.map((n) => `<div class="b-navlabel" style="left:${n.r.x + n.r.w / 2}px;top:${n.r.y + n.r.h / 2}px;font-size:${g.navSize}px;transform:translate(-50%,-50%)">${n.label}</div>`).join("");
    const codeHtml = CODE.map((line) => { const chars = line.reduce((s, [t]) => s + t.length, 0); return `<span class="b-codeline" data-chars="${chars}">${line.map(([t, c]) => `<span class="${c ? `b-tok-${c}` : ""}">${t.replace(/</g, "&lt;") || " "}</span>`).join("")}</span>`; }).join("");
    art.innerHTML = `<div class="b-board b-collapse" style="left:${A.x}px;top:${A.y}px;width:${A.w}px;height:${A.h}px;border-radius:${g.radius}px" ${center(A.x, A.y, A.w, A.h)}></div>
      ${svg}
      <div class="b-html">
        <div class="b-img b-collapse" style="left:${g.img.x}px;top:${g.img.y}px;width:${g.img.w}px;height:${g.img.h}px;border-radius:${0.7 * g.radius}px" ${center(g.img.x, g.img.y, g.img.w, g.img.h)}><div data-ph data-label="Site hero image slot · bright landscape · vertical"></div></div>
        <div class="b-logo b-collapse" style="left:${g.logo.x}px;top:${g.logo.y + g.logo.h / 2}px;font-size:${g.logoSize}px;transform:translateY(-50%)" ${center(g.logo.x, g.logo.y, g.logo.w, g.logo.h)}>studio<i class="b-logo-dot">.</i></div>
        <div class="b-collapse" ${center(g.nav[0].r.x, g.nav[0].r.y, g.nav[0].r.w, g.nav[0].r.h)}>${navHtml}</div>
        <div class="b-collapse" ${center(g.head.x, g.head.y, g.head.w, g.head.h)}>${headHtml}</div>
        <div class="b-collapse" ${center(g.lead.x, g.lead.y, g.lead.w, g.lead.h)}>${leadHtml}</div>
        ${g.btn2 ? `<div class="b-btn2 b-collapse" style="left:${g.btn2.x}px;top:${g.btn2.y}px;width:${g.btn2.w}px;height:${g.btn2.h}px" ${center(g.btn2.x, g.btn2.y, g.btn2.w, g.btn2.h)}><span class="mt-btn mt-btn--secondary" style="transform:scale(${g.sBtn});transform-origin:0 0"><span class="mt-btn-label">${WORDS.secondary}</span><span class="mt-btn-dot"></span></span></div>` : ""}
        <div class="b-code" style="left:${g.code.x}px;top:${g.code.y}px;width:${g.code.w}px;font-size:${g.codeSize}px;line-height:${k}"><div class="b-code-bar"><i></i><i></i><i></i></div>${codeHtml}</div>
        <div class="b-url" style="left:${A.x + A.w / 2}px;top:${A.y + g.barH / 2}px;transform:translate(-50%,-50%)"><i></i>example.com</div>
        <div class="b-chip" style="left:${A.x + A.w - 10}px;top:${A.y + A.h + 14}px;transform:translateX(-100%)">Fast · 0.0s</div>
        <div class="b-chip" style="left:${A.x + 10}px;top:${A.y + A.h + 14}px">Shown in search</div>
        ${clickNote(g)}
        <div class="b-cta" style="left:${g.btn.x}px;top:${g.btn.y}px"><a class="mt-btn mt-btn--primary" href="contact.html" data-label="Start Project" tabindex="-1"><span class="mt-btn-glow"></span><span class="mt-btn-label">${WORDS.label}</span><span class="mt-btn-dot"><svg viewBox="0 0 14 14" fill="currentColor"><path d="M4.4 3h6.6v6.6H9.6V5.4l-5.2 5.2-1-1L8.6 4.4H4.4z"/></svg></span></a></div>
      </div>`;
  };

  let tl = null;
  const buildTimeline = () => {
    if (!art) return;
    if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); tl = null; }
    const b = stage.getBoundingClientRect();
    const g = layout(Math.round(b.width), Math.round(b.height));
    render(g);
    const q = gsap.utils.selector(art);
    const btnC = { x: g.btn.x + g.btn.w / 2, y: g.btn.y + g.btn.h / 2 };
    gsap.set(q(".b-guide"), { drawSVG: "0% 0%" });
    gsap.set(q(".b-reg, .b-coord, .b-compass-label, .b-frame, .b-axis, .b-dimA, .b-dim, .b-typo, .b-el, .b-swatch, .b-board, .b-url, .b-chip, .b-final-label, .b-code-end, .b-bardot"), { autoAlpha: 0 });
    gsap.set(q(".b-compass, .b-leader, .b-code-leader, .b-final-line, .b-typo-line"), { drawSVG: "0% 0%" });
    gsap.set(q(".b-col"), { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(q('.b-el[data-unfold="y"]'), { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set(q('.b-el[data-unfold="x"]'), { scaleX: 0, transformOrigin: "0% 50%" });
    gsap.set(q(".b-word"), { yPercent: 70, autoAlpha: 0, "--wdth": 70, filter: "blur(6px)" });
    gsap.set(q(".b-leadline, .b-codeline, .b-url"), { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(q(".b-logo, .b-navlabel, .b-btn2"), { autoAlpha: 0, y: 4 });
    gsap.set(q(".b-logo-dot"), { scale: 0, transformOrigin: "50% 80%" });
    gsap.set(q(".b-swatch"), { x: g.swatches[0] && g.swatches[0].side === "left" ? -28 : 0, y: g.swatches[0] && g.swatches[0].side === "below" ? 14 : 0 });
    gsap.set(q(".b-img"), { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(q(".b-code"), { autoAlpha: 0, clipPath: "inset(0% 0% 0% 100% round 12px)" });
    gsap.set(q(".b-cta"), { x: 0, y: 0, scale: g.sBtn, transformOrigin: "0 0", clipPath: "inset(0% 100% 0% 0% round 999px)" });
    gsap.set(q(".b-handle"), { scale: 0, transformOrigin: "50% 50%" });
    gsap.set(q(".b-chip"), { y: 6 });
    gsap.set(q(".b-board"), { "--lift": 0 });
    let lastStep = -1;
    const cta = q(".b-cta")[0], note = q(".b-click")[0];
    tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6 },
      onUpdate() {
        const t = tl.time();
        let s = 0;
        for (let i = 0; i < STEPS.length; i++) if (t >= STEPS[i] - 0.05) s = i;
        if (s !== lastStep) { showCap(s); lastStep = s; }
        if (countEl) countEl.textContent = String(Math.round(100 * Math.min(1, t / 9.9))).padStart(3, "0");
        if (skip) skip.classList.toggle("is-done", t > 9.6);
        if (cta) cta.classList.toggle("is-live", t > 9.95);
        if (note) note.classList.toggle("is-on", t > 9.95);
        if (t > 9.8 && window.mtShared.discover) window.mtShared.discover("zoom");
      },
    });
    const W2 = g.Wd / 2, H2 = g.Ht / 2;
    tl.to(q(".b-dot-ring"), { scale: 3.2, autoAlpha: 0, duration: 0.7, transformOrigin: "50% 50%" }, 0)
      .to(q('.b-guide[data-kind="frame"]'), { drawSVG: "0% 100%", duration: 0.75, stagger: 0.1, ease: "power2.inOut" }, 0.05)
      .to(q('.b-guide[data-kind="el"], .b-guide[data-kind="bar"]'), { drawSVG: "0% 100%", duration: 0.6, stagger: 0.07, ease: "power2.inOut" }, 0.35)
      .to(q(".b-reg"), { autoAlpha: 1, duration: 0.25, stagger: 0.05 }, 0.7)
      .to(q(".b-coord"), { autoAlpha: 1, duration: 0.25, stagger: 0.04 }, 0.8)
      .to(q(".b-dot"), { x: g.dot.x - W2, y: g.dot.y - H2, duration: 0.85, ease: "power3.inOut" }, 0.3)
      .to(q(".b-compass"), { drawSVG: "0% 100%", duration: 0.55, ease: "power1.inOut" }, 0.8)
      .to(q(".b-compass-label"), { autoAlpha: 1, duration: 0.2 }, 1.05);
    q('.b-guide[data-kind="frame"], .b-guide[data-kind="bar"]').forEach((el, i) => tl.to(el, { drawSVG: el.getAttribute("data-trim") || "0% 100%", duration: 0.6, ease: "power3.inOut" }, 1.3 + 0.04 * i));
    tl.to(q(".b-axis"), { autoAlpha: 1, duration: 0.3 }, 1.45)
      .to(q(".b-col"), { scaleY: 1, duration: 0.6, stagger: 0.03, ease: "power2.out" }, 1.55)
      .to(q(".b-frame"), { autoAlpha: 1, duration: 0.25 }, 1.8)
      .to(q('.b-guide[data-kind="frame"]'), { autoAlpha: 0, duration: 0.2 }, 2)
      .to(q(".b-bardot"), { autoAlpha: 1, duration: 0.2, stagger: 0.05 }, 2)
      .to(q(".b-dimA"), { autoAlpha: 1, duration: 0.3 }, 1.95)
      .to(q(".b-compass, .b-compass-label, .b-reg, .b-coord"), { autoAlpha: 0, duration: 0.3 }, 2.2);
    q('.b-guide[data-kind="el"]').forEach((el, i) => tl.to(el, { drawSVG: el.getAttribute("data-trim") || "0% 100%", duration: 0.5, ease: "power3.inOut" }, 2.5 + 0.04 * i));
    ["logo", "nav", "head", "img", "lead", "btn", "btn2"].forEach((name, i) => {
      const el = q(`.b-el[data-el="${name}"]`);
      if (!el.length) return;
      const unfold = el[0].getAttribute("data-unfold") === "x" ? { scaleX: 1 } : { scaleY: 1 };
      tl.to(el, { autoAlpha: 1, duration: 0.06 }, 2.75 + 0.08 * i).to(el, { ...unfold, duration: 0.45, ease: "power3.out" }, 2.75 + 0.08 * i);
    });
    tl.to(q('.b-guide[data-kind="el"]'), { autoAlpha: 0, duration: 0.25 }, 3.35)
      .to(q(".b-col"), { autoAlpha: 0.35, duration: 0.3 }, 3.3)
      .to(q(".b-axis, .b-dimA"), { autoAlpha: 0, duration: 0.3 }, 3.45)
      .to(q(".b-dim"), { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, 3.4)
      .to(q('.b-el[data-el="head"] .b-ph'), { scaleX: 0, transformOrigin: "100% 50%", duration: 0.4, stagger: 0.1, ease: "power2.in" }, 3.9)
      .to(q(".b-word"), { yPercent: 0, autoAlpha: 1, "--wdth": 100, filter: "blur(0px)", duration: 0.6, stagger: 0.07, ease: "power3.out" }, 3.95)
      .to(q(".b-typo"), { autoAlpha: 1, duration: 0.2 }, 4.05)
      .to(q(".b-typo-line"), { drawSVG: "0% 100%", duration: 0.5, stagger: 0.06, ease: "power2.inOut" }, 4.05)
      .to(q('.b-el[data-el="lead"] .b-ph'), { scaleX: 0, transformOrigin: "100% 50%", duration: 0.3, stagger: 0.06, ease: "power2.in" }, 4.35)
      .to(q(".b-leadline"), { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, stagger: 0.09, ease: "none" }, 4.4)
      .to(q(".b-logo, .b-navlabel"), { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05 }, 4.55)
      .to(q('.b-el[data-el="head"] .b-wire, .b-el[data-el="lead"] .b-wire, .b-el[data-el="logo"] .b-wire, .b-el[data-el="nav"] .b-wire'), { autoAlpha: 0, duration: 0.3 }, 4.7)
      .to(q(".b-typo"), { autoAlpha: 0, duration: 0.3 }, 4.85)
      .to(q(".b-swatch"), { autoAlpha: 1, x: 0, y: 0, duration: 0.35, stagger: 0.08 }, 5.1)
      .to(q(".b-leader"), { drawSVG: "0% 100%", duration: 0.4, stagger: 0.08, ease: "power2.inOut" }, 5.25)
      .to(q(".b-board"), { autoAlpha: 1, duration: 0.4 }, 5.45)
      .to(q(".b-col"), { autoAlpha: 0, duration: 0.3 }, 5.45)
      .to(q(".b-logo-dot"), { scale: 1, duration: 0.3, ease: "back.out(3)" }, 5.5)
      .to(q(".b-dot"), { attr: { r: g.dot.r }, duration: 0.35, ease: "back.out(2)" }, 5.45)
      .to(q(".b-cta"), { clipPath: "inset(0% 0% 0% 0% round 999px)", duration: 0.45, ease: "power2.inOut" }, 5.6)
      .to(q(".b-btn2"), { autoAlpha: 1, y: 0, duration: 0.3 }, 5.7)
      .to(q(".b-img"), { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut" }, 5.65)
      .to(q('.b-el[data-el="btn"], .b-el[data-el="btn2"], .b-el[data-el="img"]'), { autoAlpha: 0, duration: 0.25 }, 6)
      .to(q(".b-dot"), { autoAlpha: 0, duration: 0.15 }, 6.02)
      .to(q(".b-swatch, .b-leader"), { autoAlpha: 0, duration: 0.25 }, 6.1)
      .to(q(".b-code"), { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0% round 12px)", duration: 0.45, ease: "power3.inOut" }, 6.3);
    q(".b-codeline").forEach((el, i) => { const n = Number(el.getAttribute("data-chars")) || 1; tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.05 + 0.006 * n, ease: `steps(${Math.max(1, n)})` }, 6.55 + 0.085 * i); });
    tl.to(q(".b-code-leader"), { drawSVG: "0% 100%", duration: 0.4, ease: "power2.inOut" }, 6.95)
      .to(q(".b-code-end"), { autoAlpha: 1, duration: 0.15 }, 7.3)
      .to(q(".b-code"), { autoAlpha: 0, x: 40, duration: 0.35, ease: "power2.in" }, 7.6)
      .to(q(".b-code-leader, .b-code-end, .b-dim, .b-el"), { autoAlpha: 0, duration: 0.3 }, 7.6)
      .to(q(".b-board"), { "--lift": 1, duration: 0.6 }, 7.75)
      .to(q(".b-url"), { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "steps(12)" }, 7.85)
      .to(q(".b-chip"), { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.1 }, 8.05)
      .to(q(".b-collapse, .b-url, .b-chip"), {
        x: (i, el) => (btnC.x - Number(el.getAttribute("data-cx") || btnC.x)) * 0.94,
        y: (i, el) => (btnC.y - Number(el.getAttribute("data-cy") || btnC.y)) * 0.94,
        scale: 0.12, autoAlpha: 0, filter: "blur(3px)", duration: 0.6, stagger: { each: 0.035, from: "end" }, ease: "power3.in",
      }, 8.6)
      .to(q('.b-guide[data-kind="bar"], .b-bardot'), { autoAlpha: 0, duration: 0.3 }, 8.6)
      .to(q(".b-frame"), { attr: { x: g.btn.x - 6, y: g.btn.y - 6, width: g.btn.w + 12, height: g.btn.h + 12, rx: (g.btn.h + 12) / 2 }, duration: 0.65, ease: "power3.inOut" }, 8.7)
      .to(q(".b-cta"), { x: g.final.x - g.btn.x, y: g.final.y - g.btn.y, scale: g.final.s, duration: 0.6, ease: "power3.inOut" }, 9.3)
      .to(q(".b-frame"), { attr: { x: g.finalRect.x, y: g.finalRect.y, width: g.finalRect.w, height: g.finalRect.h, rx: 6 }, duration: 0.6, ease: "power3.inOut" }, 9.3)
      .to(q(".b-final-line"), { drawSVG: "0% 100%", duration: 0.5, stagger: 0.07, ease: "power2.inOut" }, 9.45)
      .to(q(".b-handle"), { scale: 1, duration: 0.2, stagger: 0.04, ease: "back.out(3)" }, 9.8)
      .to(q(".b-final-label"), { autoAlpha: 1, duration: 0.25 }, 9.85)
      .to({}, { duration: 0.01 }, 10.7);
  };

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (sec) {
      buildTimeline();
      gsap.fromTo(stage, { "--dots": 0 }, { "--dots": 1, ease: "none", scrollTrigger: { trigger: sec, start: "top 85%", end: "top 5%", scrub: true } });
      let rw = innerWidth;
      const ro = new ResizeObserver(() => { if (Math.abs(innerWidth - rw) > 40) { rw = innerWidth; buildTimeline(); ScrollTrigger.refresh(); } });
      ro.observe(stage);
      document.fonts && document.fonts.ready.then(() => { buildTimeline(); ScrollTrigger.refresh(); });
    }

    /* Stacking work cards — while the next card’s top moves from the screen bottom → 96px below the nav, the previous card goes to .94 scale · brightness .92 · saturation .85 (no curve) */
    const cards = gsap.utils.toArray("[data-card]");
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.fromTo(c, { scale: 1, filter: "brightness(1) saturate(1)" }, { scale: 0.94, filter: "brightness(0.92) saturate(0.85)", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top top+=96", scrub: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    if (art) { const b = stage.getBoundingClientRect(); render(layout(Math.round(b.width), Math.round(b.height))); sec.style.height = "100vh"; showCap(caps.length - 1); }
    if (countEl) countEl.textContent = "100";
  });

  /* Word fill — from the sentence top at 78% → bottom at 42%, that range’s share × word count is lit from the front (.45s color transition) */
  document.querySelectorAll("[data-scrub]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="mt-sw">${w}</span>`).join(" ");
    const list = [...el.querySelectorAll(".mt-sw")];
    if (reduce) { list.forEach((w) => w.classList.add("is-on")); return; }
    let last = -1;
    ScrollTrigger.create({ trigger: el, start: "top 78%", end: "bottom 42%", onUpdate: (st) => {
      const n = Math.round(st.progress * list.length);
      if (n !== last) { last = n; list.forEach((w, i) => w.classList.toggle("is-on", i < n)); }
    } });
  });

  /* Fan — on wide screens the selected cell unfolds, on narrow screens press the header to open */
  document.querySelectorAll("[data-fan]").forEach((fan) => {
    const items = [...fan.children];
    const open = (li) => items.forEach((o) => o.classList.toggle("is-on", o === li));
    items.forEach((li) => {
      li.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && innerWidth >= 768) open(li); });
      const tap = li.querySelector(".mt-fan-tap");
      if (tap) tap.addEventListener("click", () => open(li));
    });
  });

  /* Measuring crosshair — cursor spot coordinates inside the card */
  document.querySelectorAll("[data-mf]").forEach((wrap) => {
    const card = wrap.querySelector(".mt-card") || wrap;
    const xy = wrap.querySelector(".mt-mf-xy");
    card.addEventListener("pointermove", (e) => {
      const b = card.getBoundingClientRect(), x = Math.round(e.clientX - b.left), y = Math.round(e.clientY - b.top);
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      if (xy) xy.textContent = `x ${x}   y ${y}`;
      if (e.pointerType === "mouse") wrap.classList.add("is-mf");
    });
    card.addEventListener("pointerleave", () => wrap.classList.remove("is-mf"));
  });

  /* Journal card guide line length = Image height */
  const setCx = () => document.querySelectorAll(".mt-jcard").forEach((c) => { const b = c.querySelector(".mt-cx-body"); if (b) c.style.setProperty("--cxh", `${b.offsetHeight}px`); });
  setCx();
  window.addEventListener("resize", setCx);
})();
