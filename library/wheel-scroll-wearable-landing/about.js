/* About page — one page of ”A Ticket to a Healthy Life”. Everything is a function of the clock p (original about.js map): 
     /  0 → 1  Pull the stub and tear it at the perforation, flip to the barcode face and fly off. The ticket moves to the center, the right list exits upward and the red ring comes in
     1 → 2.2    the table rises up to the gauge panel
     2.2 → 5.2  The panel stops and three gauges fill in turn with scroll — red dot level · green bar wave · red tick ring (001~003 beside them follow)
     5.2 → 6.4  To stamp plate
     6.4 → 10.2 a stamp attaches as it rises in and peels off as it leaves
     10.2 → 11.2 the table end rises and rolls away from the top (11.05 → 11.4 ring disappears)
     11.45 → 12.6 three routes are drawn (drawn along the path) and the title and guide come in — after that it’s a hands-on scene
     12.6 → 13.7 panel slides out and the footer (light pillars) comes in */
(() => {
  const NF = window.NF;
  if (!NF || NF.phone) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { seg, mix, sm, band, reduce } = NF;
  const eio = NF.ease("power3.inOut"), eo = NF.ease("power3.out");
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  /* ---- Drawn graphics: barcode · QR (same seed, so identical every time it opens) ---- */
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function paint(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.fillStyle = css("--kf-contrast-ink"); fn(x); return `url(${c.toDataURL()})`; }
  const qr = paint(35, 35, (x) => { const r = rng(5); for (let i = 0; i < 35; i++) for (let j = 0; j < 35; j++) if (r() > 0.52) x.fillRect(i, j, 1, 1); [[0, 0], [26, 0], [0, 26]].forEach(([a, b]) => { x.clearRect(a, b, 9, 9); x.fillRect(a, b, 9, 9); x.clearRect(a + 1, b + 1, 7, 7); x.fillRect(a + 2, b + 2, 5, 5); }); });
  const barh = paint(330, 70, (x) => { const r = rng(9); for (let i = 0; i < 330; i += 1) for (let j = 0; j < 70; j += 6) if (r() > 0.48) x.fillRect(i, j, 1 + ((r() * 3) | 0), 5); });
  const barv = paint(34, 120, (x) => { const r = rng(3); let y = 0; while (y < 118) { const bw = 1 + ((r() * 4) | 0); x.fillRect(0, y, 34, bw); y += bw + 1 + ((r() * 3) | 0); } });
  root.style.setProperty("--nf-qr", qr); root.style.setProperty("--nf-barh", barh); root.style.setProperty("--nf-barv", barv);

  const wrap = $(".tk-wrap"), stub = $(".tk-stub"), lists = $(".ab-lists"), rings = $$(".ab-ring"), ringOn = $(".ab-ring--on");
  const roll = document.createElement("i"); roll.className = "tk-roll"; roll.setAttribute("aria-hidden", "true"); document.body.appendChild(roll);
  const title = $(".tk-title"), dial = $(".tk-dial canvas"), dx = dial.getContext("2d"), thumbs = $$(".tk-thumbs div");
  const stamps = $$(".tk-stamp");
  const texts = [$(".tk-about__txt"), $(".tk-gauge__txt"), $(".tk-end__txt")];
  texts.forEach((el) => NF.lines.prime(el));
  /* ---- Entrance: .35s after the font, the table unfolds from the top over 1.9s, and with it the list words rise from 150% below and underlines are drawn (1.2s·1.1s, each word later) ---- */
  $$(".ab-row .t, .ab-row li").forEach((el, i) => {
    if (el.matches("ul")) return;
    el.style.setProperty("--d", (Math.min(i, 60) * 0.018).toFixed(3));
    if (!el.querySelector("i") && !el.matches("ul")) el.innerHTML = `<i>${el.textContent}</i>`;
  });
  const enter = () => {
    root.classList.add("fl-in");
    if (reduce) return;
    wrap.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }], { duration: 1900, easing: "cubic-bezier(.215,.61,.355,1)" });
  };
  if (reduce) root.classList.add("fl-in");
  else (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(enter, 350));

  const GAUGES = ["Assisted oxygen saturation", "Adaptive airflow regulation", "Dynamic air intake control"];
  let gShown = 0;

  /* Screen y of the top of the ticket intro cell — crosses each section with power3.inOut */
  const KEYS = [[0, 315], [1, 100], [2.2, -610], [5.2, -610], [6.4, -1510], [10.2, -1510], [11.2, -2440]];
  function tkY(p) {
    for (let i = 1; i < KEYS.length; i++) if (p <= KEYS[i][0]) { const [a, ya] = KEYS[i - 1], [b, yb] = KEYS[i]; return mix(ya, yb, eio(seg(a, b, p))); }
    return KEYS[KEYS.length - 1][1];
  }

  /* ---- Gauge drawing (280px circle) ---- */
  function drawDial(which, k, t) {
    const S = dial.width = dial.height = 268;
    const R = S / 2;
    dx.clearRect(0, 0, S, S);
    dx.fillStyle = css("--kf-bg"); dx.beginPath(); dx.arc(R, R, R, 0, Math.PI * 2); dx.fill();
    const red = css("--kf-accent"), green = css("--kf-success"), dim = css("--kf-line");
    if (which === 0) {
      for (let y = 4; y < S; y += 6) for (let x = 4; x < S; x += 6) {
        if (Math.hypot(x - R, y - R) > R - 4) continue;
        const level = S - k * S * 0.62 + Math.sin(x / 28 + t * 2) * 6;
        dx.fillStyle = y > level ? red : dim; dx.globalAlpha = y > level ? 1 : 0.55;
        dx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
      dx.globalAlpha = 1;
    } else if (which === 1) {
      dx.fillStyle = green;
      for (let x = 6; x < S - 6; x += 4) {
        const hgt = (0.35 + 0.35 * Math.sin(x / 34 + t * 1.6) + 0.15 * Math.sin(x / 13)) * S * k;
        const top = Math.max(S - hgt, R - Math.sqrt(Math.max(0, R * R - (x - R) * (x - R))));
        const bot = R + Math.sqrt(Math.max(0, R * R - (x - R) * (x - R)));
        if (bot > top) dx.fillRect(x, top, 2, bot - top);
      }
    } else {
      const n = 72, on = Math.round(k * n);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        dx.strokeStyle = i < on ? red : dim; dx.globalAlpha = i < on ? 1 : 0.5; dx.lineWidth = 3;
        dx.beginPath(); dx.moveTo(R + Math.cos(a) * (R - 26), R + Math.sin(a) * (R - 26)); dx.lineTo(R + Math.cos(a) * (R - 8), R + Math.sin(a) * (R - 8)); dx.stroke();
      }
      dx.globalAlpha = 1; dx.fillStyle = red; dx.beginPath(); dx.arc(R, R, 4, 0, Math.PI * 2); dx.fill();
    }
  }

  /* ---- Route game: picker screen (hover to brighten only that route) → press for that route’s board. Module in three of six slots ---- */
  const gm = $(".gm"), routes = $$(".gm-r"), nodes = $$(".gm-node"), level = $(".gm-level"), sites = $(".gm-sites"), card = $(".gm-card");
  const gTitle = $(".gm-title"), gCheck = $(".gm-check"), gHidden = $(".gm-hidden");
  const LV = [
    { bg: "var(--kf-success)", ink: "var(--kf-bg)", r: "50%" },
    { bg: "var(--kf-ink)", ink: "var(--kf-bg)", r: "0" },
    { bg: "var(--kf-accent)", ink: "var(--kf-ink)", r: "50%" },
  ];
  const SPOTS = [[24, 14], [34, 34], [47, 50], [58, 64], [72, 76], [82, 92]];
  const found = [new Set(), new Set(), new Set()], done = [false, false, false];
  let cur = -1, hidden = [];
  nodes.forEach((n, i) => {
    n.addEventListener("pointerenter", () => { gm.classList.add("is-hover"); routes[i].classList.add("is-lit"); });
    n.addEventListener("pointerleave", () => { gm.classList.remove("is-hover"); routes[i].classList.remove("is-lit"); });
    n.addEventListener("click", () => enterLevel(i));
  });
  function enterLevel(i) {
    cur = i;
    const L = LV[i];
    level.style.setProperty("--lv-bg", L.bg); level.style.setProperty("--lv-ink", L.ink); level.style.setProperty("--lv-r", L.r);
    const r = Math.random; hidden = [0, 1, 2, 3, 4, 5].sort(() => r() - 0.5).slice(0, 3);
    sites.innerHTML = SPOTS.map(([x, y], k) => `<button type="button" style="left:${x}%;top:${y}%" data-k="${k}" aria-label="Seat ${k + 1}"><span class="t">${found[i].has(k) ? "✓" : "?"}</span></button>`).join("");
    $$("button", sites).forEach((b) => { if (found[i].has(+b.dataset.k)) b.classList.add("is-found"); b.addEventListener("click", () => openSite(+b.dataset.k, b)); });
    $(".gm-level__n").textContent = `Level ${i + 1} — ${found[i].size} / 3`;
    level.hidden = false;
    if (!reduce) level.animate([{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" }], { duration: 700, easing: "cubic-bezier(.215,.61,.355,1)" });
  }
  function openSite(k, b) {
    const hit = hidden.includes(k) || found[cur].has(k);
    card.classList.toggle("is-ok", hit); card.classList.toggle("is-miss", !hit);
    $(".gm-card__k").textContent = hit ? `Module ${found[cur].size + (found[cur].has(k) ? 0 : 1)} found` : "Information missing";
    $(".gm-card__txt").textContent = hit ? "Describe in two lines what this module does — why breathing stays even when things move or heights change." : "Nothing is here. Try pressing another spot.";
    if (hit) { found[cur].add(k); b.classList.add("is-found"); b.querySelector(".t").textContent = "✓"; }
    card.hidden = false;
    $(".gm-level__n").textContent = `Level ${cur + 1} — ${found[cur].size} / 3`;
  }
  $(".gm-card__ok").addEventListener("click", () => {
    card.hidden = true;
    if (found[cur].size >= 3 && !done[cur]) { done[cur] = true; nodes[cur].classList.add("is-done"); $$(`.d--${cur + 1}`).forEach((d) => d.classList.add("is-on")); }
    if (done.every(Boolean)) $(".gm-check p").classList.add("is-done");
  });
  $(".gm-back").addEventListener("click", () => { level.hidden = true; card.hidden = true; cur = -1; });
  let gTitled = false;

  const fin = NF.footer($(".fin-host"));

  NF.onFrame((p, dt, now) => {
    const W = innerWidth, H = innerHeight;
    /* 0 → 1 ticket stub tears off, flips and flies away, the ticket moves from the left (157) to center */
    const c = eio(seg(0, 1, p));
    const x = mix(W * 0.109, W / 2 - 229, c);
    const y = tkY(p);
    wrap.style.transform = `translate3d(${x.toFixed(1)}px,${(y - 167).toFixed(1)}px,0)`;
    const pull = seg(0, 0.25, p), flip = eio(seg(0.15, 0.5, p)), fly = eio(seg(0.35, 0.75, p));
    stub.style.transform = `translate3d(${(-fly * 520).toFixed(1)}px,${(-pull * 14 - fly * 380).toFixed(1)}px,0) rotate(${(-pull * 3 - fly * 24).toFixed(2)}deg) rotateX(${(flip * 180).toFixed(1)}deg)`;
    stub.style.opacity = 1 - sm(seg(0.6, 0.8, p));
    lists.style.transform = `translate3d(0,${(-c * H * 0.9).toFixed(1)}px,0)`;
    lists.style.opacity = 1 - sm(seg(0.4, 0.9, p));
    /* Red ring = Page progress bar */
    rings.forEach((r) => { r.style.opacity = band(0.5, 1.1, 11.05, 11.4, p); });
    ringOn.style.setProperty("--ring", (seg(1, 11, p) * 360).toFixed(1) + "deg");

    /* Three Gauges */
    const gi = p < 3.2 ? 0 : p < 4.2 ? 1 : 2;
    const gk = seg(gi === 0 ? 2.3 : 2.2 + gi + 0.1, 2.2 + gi + 0.9, p);
    if (p > 1.2 && p < 6.4) drawDial(gi, reduce ? 1 : gk, now);
    if (gi !== gShown) { gShown = gi; title.textContent = GAUGES[gi]; title.setAttribute("aria-label", GAUGES[gi]); NF.scramble(title); }
    thumbs.forEach((t, i) => { t.classList.toggle("is-on", i === gi && p > 2.0); t.style.setProperty("--th", i === 1 ? "var(--kf-success)" : "var(--kf-accent)"); });
    NF.lines.set(texts[0], p < 1.6);
    NF.lines.set(texts[1], p > 1.6 && p < 6.0);

    /* Stamp: sticks while rising from below (1.15 → 1), peels off while leaving upward (folding toward upper right) */
    if (p > 5.0 && p < 10.6) {
      const base = mix(900, -900, seg(6.4, 10.2, p));
      stamps.forEach((s, i) => {
        const sy = base + i * 210 + 120;
        const stick = sm(seg(H * 0.95, H * 0.62, sy + y + 1510));
        const peel = sm(seg(H * 0.18, -60, sy + y + 1510));
        s.style.transform = `translate3d(${(peel * 160).toFixed(1)}px,${(sy - peel * 120).toFixed(1)}px,0) scale(${mix(1.15, 1, stick).toFixed(3)}) rotate(${(peel * 18 + (1 - stick) * -4).toFixed(2)}deg) rotateX(${(peel * 55).toFixed(1)}deg)`;
        s.style.opacity = stick * (1 - sm(seg(0.6, 1, peel)));
      });
    }
    NF.lines.set(texts[2], p > 9.6 && p < 11.0);

    /* The end cell rolls up from the top: the rolled spot (band) comes down and cuts the table at that line */
    const rl = seg(10.4, 11.2, p);
    roll.style.opacity = band(10.4, 10.55, 11.15, 11.3, p);
    roll.style.transform = `translate3d(${(W / 2 - 229).toFixed(1)}px,${(-10 + rl * 0).toFixed(1)}px,0) scaleY(${mix(0.6, 1, sm(rl)).toFixed(3)})`;
    wrap.style.clipPath = p > 10.4 ? `inset(${Math.max(0, -(y - 167) + 40).toFixed(1)}px 0 0 0)` : "";
    wrap.style.visibility = p < 11.3 ? "visible" : "hidden";

    /* Route Game */
    const gOn = p > 11.2 && p < 13.5;
    gm.style.visibility = gOn ? "visible" : "hidden";
    if (gOn) {
      gm.style.opacity = (sm(seg(11.2, 11.45, p)) * (1 - sm(seg(12.95, 13.35, p)))).toFixed(3);
      routes.forEach((r, i) => { r.style.strokeDashoffset = (1 - eio(seg(11.45 + i * 0.05, 12.2 + i * 0.05, p))).toFixed(4); });
      nodes.forEach((n, i) => { n.style.transform = `scale(${eo(seg(12.0 + i * 0.06, 12.3 + i * 0.06, p)).toFixed(3)})`; });
      const ui = sm(seg(12.2, 12.6, p));
      gCheck.style.opacity = gHidden.style.opacity = ui;
      gTitle.style.opacity = ui > 0 ? 1 : 0;
      gTitle.style.filter = ui < 1 ? `blur(${((1 - ui) * 14).toFixed(1)}px) contrast(${(1 + (1 - ui) * 6).toFixed(2)})` : "";
      if (ui > 0 && !gTitled) { gTitled = true; $$("span", gTitle).forEach((s, i) => setTimeout(() => NF.scramble(s), i * 90)); }
      if (ui <= 0) gTitled = false;
      gm.style.pointerEvents = p > 12.55 && p < 12.95 ? "auto" : "none";
    }
    if (!gOn && !level.hidden) { level.hidden = true; card.hidden = true; }

    /* 13.2 → Footer */
    fin(p >= 13.2, seg(13.2, 13.5, p), seg(13.45, 13.7, p), now);
    $(".nf-nav").style.opacity = 1 - sm(seg(13.0, 13.2, p));
    $(".nf-nav").style.visibility = p < 13.2 ? "" : "hidden";
  });
})();
