/* Motion shared by all pages: smooth scroll (1200 and up), spring rise-in, wordmark fitted to screen width, and letters that thin out near the cursor, 
   Sticker (holographic shine, peel off and throw), pill menu below, black panel roof, review slider, video slot playback, city clock */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverNone = matchMedia("(hover: none)").matches;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  document.documentElement.classList.add("js");
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // The original uses Lenis only at width 1200 and above (lerp .1, anchor links smooth too)
  let lenis = null;
  if (!reduce && innerWidth >= 1200 && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false });
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.dvLenis = lenis;

  // Spring (bounce .2 → damping ratio .8, settles within 1% by 1s length) — the original motion’s { type: spring, duration: 1, bounce: .2 }
  const spring = (bounce = 0.2) => {
    const z = 1 - bounce, w = 4.6 / z, wd = w * Math.sqrt(1 - z * z);
    return (p) => (p >= 1 ? 1 : 1 - Math.exp(-z * w * p) * (Math.cos(wd * p) + ((z * w) / wd) * Math.sin(wd * p)));
  };
  window.dvSpring = spring;

  // Rise-in: data-appear='{"from":{"y":40},"trigger":"mount|inview","duration":1,"bounce":.2,"delay":.7}'
  function appear(el) {
    let o;
    try { o = JSON.parse(el.dataset.appear || "{}"); } catch { return; }
    const from = { opacity: 0, x: 0, y: 0, scale: 1, rotate: 0, skewX: 0, skewY: 0, ...o.from };
    if (reduce || !window.gsap) { el.style.opacity = "1"; return; }
    gsap.set(el, { opacity: from.opacity, x: from.x, y: from.y, scale: from.scale, rotate: from.rotate, skewX: from.skewX, skewY: from.skewY });
    const play = () => {
      const dur = o.duration ?? 1, ease = spring(o.bounce ?? 0.2);
      gsap.to(el, { opacity: 1, duration: dur * 0.45, delay: o.delay ?? 0, ease: "none" });
      gsap.to(el, { x: 0, y: 0, scale: 1, rotate: 0, skewX: 0, skewY: 0, duration: dur, delay: o.delay ?? 0, ease });
    };
    if (o.trigger === "mount") return play();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); play(); } }, { threshold: o.amount ?? 0 });
    io.observe(el);
  }

  // Fit to screen width: measure the text width and set a font size that exactly fills the column width
  function fitText(list) {
    const fit = (el) => {
      el.classList.add("fit-measuring");
      const w = el.clientWidth, r = document.createRange();
      r.selectNodeContents(el);
      const tw = r.getBoundingClientRect().width;
      if (!w || !tw) { el.classList.remove("fit-measuring"); return; }
      const fs = parseFloat(getComputedStyle(el).fontSize);
      el.classList.remove("fit-measuring");
      el.style.fontSize = `${(fs * w) / tw}px`;
      el.classList.add("fitted");
    };
    const ro = new ResizeObserver((es) => es.forEach((e) => fit(e.target)));
    document.fonts.ready.then(() => list.forEach((el) => { fit(el); ro.observe(el); }));
    setTimeout(() => list.forEach((el) => el.classList.add("fitted")), 2500);
    addEventListener("resize", () => list.forEach(fit));
  }

  // Cursor-thinning text: per letter, weight goes rest→near by smoothstep within the cursor-distance radius, following by .1 each frame, and line width is corrected with center alignment
  function weightHover(el) {
    const rest = +(el.dataset.weightRest ?? 900), near = +(el.dataset.weightNear ?? 200), radius = +(el.dataset.radius ?? 400);
    const lines = [""];
    el.childNodes.forEach((n) => { n.nodeName === "BR" ? lines.push("") : (lines[lines.length - 1] += n.textContent ?? ""); });
    lines.forEach((l, i) => (lines[i] = l.trim()));
    el.setAttribute("aria-label", lines.join(" "));
    el.textContent = "";
    const chars = [];
    lines.forEach((line, li) => {
      if (li > 0) el.append(document.createElement("br"));
      for (const ch of line) {
        const s = document.createElement("span");
        s.textContent = ch; s.setAttribute("aria-hidden", "true");
        s.style.fontVariationSettings = `"wght" ${rest}`;
        el.append(s);
        chars.push({ s, w: rest, line: li });
      }
    });
    const pos = [];
    const measure = () => {
      el.classList.add("fit-measuring");
      const keep = chars.map((c) => c.s.style.transform);
      chars.forEach((c) => (c.s.style.transform = ""));
      const b = el.getBoundingClientRect();
      chars.forEach((c, i) => { const r = c.s.getBoundingClientRect(); pos[i] = { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top }; });
      chars.forEach((c, i) => (c.s.style.transform = keep[i]));
      el.classList.remove("fit-measuring");
    };
    const stops = [near, (near + rest) / 2, rest];
    let widths = [], fs = 1;
    const widthAt = (i, wgt) => {
      for (let k = 1; k < stops.length; k++) if (wgt <= stops[k] || k === stops.length - 1) {
        const t = (wgt - stops[k - 1]) / (stops[k] - stops[k - 1]);
        return widths[k - 1][i] + (widths[k][i] - widths[k - 1][i]) * t;
      }
      return widths[stops.length - 1][i];
    };
    const settle = () => {
      if (!widths.length) return;
      fs = parseFloat(getComputedStyle(el).fontSize);
      for (let li = 0; li < lines.length; li++) {
        const idx = chars.map((c, i) => (c.line === li ? i : -1)).filter((i) => i >= 0);
        const full = idx.reduce((a, i) => a + widths[stops.length - 1][i], 0), now = idx.reduce((a, i) => a + widthAt(i, chars[i].w), 0);
        let acc = 0, off = (full - now) / 2;
        for (const i of idx) {
          const cell = widths[stops.length - 1][i], cur = widthAt(i, chars[i].w), d = off + cur / 2 - (acc + cell / 2);
          chars[i].s.style.transform = Math.abs(d) < 1e-4 ? "" : `translateX(${(d * fs).toFixed(2)}px)`;
          acc += cell; off += cur;
        }
      }
    };
    const calibrate = () => {
      const f = parseFloat(getComputedStyle(el).fontSize);
      widths = stops.map((wgt) => { chars.forEach((c) => (c.s.style.fontVariationSettings = `"wght" ${wgt}`)); return chars.map((c) => c.s.getBoundingClientRect().width / f); });
      const cell = widths[stops.length - 1];
      chars.forEach((c, i) => { c.s.style.fontVariationSettings = `"wght" ${c.w.toFixed(1)}`; c.s.style.display = "inline-block"; c.s.style.textAlign = "center"; c.s.style.width = `${cell[i]}em`; });
      measure(); settle();
    };
    measure();
    new ResizeObserver(() => { measure(); settle(); }).observe(el);
    document.fonts.ready.then(calibrate);
    if (reduce || hoverNone) return;
    const m = { x: -9999, y: -9999 };
    let running = false;
    const step = () => {
      let moving = false;
      const b = el.getBoundingClientRect();
      chars.forEach((c, i) => {
        const p = pos[i], d = Math.hypot(m.x - (b.left + p.x), m.y - (b.top + p.y)), u = Math.max(0, 1 - d / radius);
        const want = rest + (near - rest) * (u * u * (3 - 2 * u));
        c.w += (want - c.w) * 0.1;
        if (Math.abs(want - c.w) > 0.5) moving = true;
        c.s.style.fontVariationSettings = `"wght" ${c.w.toFixed(1)}`;
      });
      settle();
      running = moving;
      if (moving) requestAnimationFrame(step);
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { m.x = e.clientX; m.y = e.clientY; kick(); } }, { passive: true });
    document.addEventListener("pointerleave", () => { m.x = m.y = -9999; kick(); });
  }

  /* ── Sticker art: our own SVG per type (white border + gold gradient + moving sheen + ink) ── */
  let holoId = 0;
  const FOILS = {
    sun: ["--site-sun", "--kf-bg", "--kf-accent", "--site-sun"],
    orange: ["--kf-accent", "--site-sun", "--kf-accent", "--site-pink"],
    pink: ["--site-pink", "--kf-surface", "--site-pink", "--site-blue"],
    blue: ["--site-blue", "--site-lime", "--site-blue", "--site-pink"],
    lime: ["--site-lime", "--kf-surface", "--site-lime", "--site-sun"],
    ink: ["--kf-contrast-bg", "--kf-ink-soft", "--kf-contrast-bg", "--site-blue"],
  };
  function holoSvg(kind, tone, text, sub) {
    const id = `dv-holo-${holoId++}`;
    const stops = (FOILS[tone] || FOILS.sun).concat((FOILS[tone] || FOILS.sun)[0]).map((v, i, a) => `<stop offset="${(i / (a.length - 1)).toFixed(3)}" style="stop-color:var(${v})"/>`).join("");
    let w = 120, h = 120, shape = '<circle cx="60" cy="60" r="52"/>', ink = "";
    if (kind === "smile") ink = '<circle class="ink" cx="44" cy="50" r="6"/><circle class="ink" cx="76" cy="50" r="6"/><path class="ink-s" d="M40 70c9 13 31 13 40 0"/>';
    else if (kind === "star") { shape = '<path d="M60 6c5 30 24 49 54 54-30 5-49 24-54 54-5-30-24-49-54-54 30-5 49-24 54-54Z"/>'; }
    else if (kind === "rating") ink = `<text class="ink-t" x="60" y="62" text-anchor="middle">${text || "0.0"}</text><text class="ink-t sub-t" x="60" y="84" text-anchor="middle">★★★★★</text>`;
    else if (kind === "bubble") { w = 120; h = 96; shape = '<path d="M14 10h92a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H52l-22 18 4-18H14A10 10 0 0 1 4 64V20a10 10 0 0 1 10-10Z"/>'; ink = `<text class="ink-t pill-t" x="60" y="50" text-anchor="middle">${text || "hey!"}</text>`; }
    else if (kind === "pill") { const len = (text || "").length; w = Math.max(120, 24 + len * 12.6); h = 56; shape = `<rect x="4" y="4" width="${w - 8}" height="48" rx="24"/>`; ink = `<text class="ink-t pill-t" x="${w / 2}" y="36" text-anchor="middle">${text || ""}</text>`; }
    const scale = kind === "pill" ? 1 : 1.1;
    return `<svg viewBox="0 0 ${w} ${h}" width="${Math.round(w * scale)}" height="${Math.round(h * scale)}" aria-hidden="true"><defs>
      <linearGradient id="${id}-foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w * 0.6}" y2="${h * 0.6}" spreadMethod="reflect" data-foil>${stops}</linearGradient>
      <radialGradient id="${id}-shine" gradientUnits="userSpaceOnUse" cx="${w / 2}" cy="${h / 2}" r="${Math.max(w, h) * 0.45}" data-shine><stop offset="0" style="stop-color:var(--kf-surface);stop-opacity:.95"/><stop offset="1" style="stop-color:var(--kf-surface);stop-opacity:0"/></radialGradient>
      <g id="${id}-shape">${shape}</g></defs>
      <use href="#${id}-shape" class="border"/><use href="#${id}-shape" style="fill:url(#${id}-foil)"/><use href="#${id}-shape" class="shine" style="fill:url(#${id}-shine)"/><g>${ink}</g></svg>`;
  }
  function buildSticker(el) {
    if (el.querySelector(".peel-box")) return;
    const kind = el.dataset.sticker || "smile", tone = el.dataset.tone || "sun", text = el.dataset.text || "";
    const art = kind === "flat"
      ? `<span class="dv-pill-sticker dv-pill-sticker--${tone}">${text}</span>`
      : `<span class="dv-holo${el.hasAttribute("data-dark") ? " dv-holo--dark" : ""}" data-holo>${holoSvg(kind, tone, text)}</span>`;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="peel-box" data-peel><div class="peel-top"><div class="dv-art" data-art>${art}</div></div></div>`;
  }

  // Gloss: every frame shifts the gold-foil gradient and gloss center by .08 toward the cursor spot (a slowly orbiting spot if no mouse)
  function holoShine() {
    const list = [...document.querySelectorAll("[data-holo]")].map((el) => {
      const svg = el.querySelector("svg"), vb = svg.getAttribute("viewBox").split(" ").map(Number);
      return { el, w: vb[2], h: vb[3], foil: svg.querySelector("[data-foil]"), shine: svg.querySelector("[data-shine]"), x: 0.5, y: 0.5, vis: false };
    });
    if (!list.length || reduce) return;
    const m = { x: -1, y: -1, on: false };
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { m.x = e.clientX; m.y = e.clientY; m.on = true; } }, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => { const h = list.find((x) => x.el === e.target); if (h) h.vis = e.isIntersecting; }));
    list.forEach((h) => io.observe(h.el));
    const tick = (t) => {
      for (const h of list) {
        if (!h.vis) continue;
        const r = h.el.getBoundingClientRect();
        let tx, ty;
        if (m.on && !hoverNone) { tx = Math.min(1.5, Math.max(-0.5, (m.x - r.left) / r.width)); ty = Math.min(1.5, Math.max(-0.5, (m.y - r.top) / r.height)); }
        else { tx = 0.5 + Math.sin(t / 1600 + r.left / 200) * 0.6; ty = 0.5 + Math.cos(t / 2100 + r.top / 200) * 0.6; }
        h.x += (tx - h.x) * 0.08; h.y += (ty - h.y) * 0.08;
        const sx = (h.x - 0.5) * h.w * 0.9, sy = (h.y - 0.5) * h.h * 0.9;
        h.foil.setAttribute("x1", String(-sx)); h.foil.setAttribute("y1", String(-sy));
        h.foil.setAttribute("x2", String(h.w * 0.6 - sx)); h.foil.setAttribute("y2", String(h.h * 0.6 - sy));
        h.shine.setAttribute("cx", String(h.x * h.w)); h.shine.setAttribute("cy", String(h.y * h.h));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Tear: takes the edge nearest the pressed spot as the corner and tears, and past halfway it detaches from the document and sticks to the hand (follows at .22 each step, tilt ±16° by speed),
  // On release it falls with gravity 1600 and snaps back into place after 2.5 seconds. If it’s under half, it snaps back in .38s
  function peelSticker(n, Peel) {
    const box = n.querySelector("[data-peel]"), art = box && box.querySelector("[data-art]");
    if (!art) return;
    const out3 = (t) => 1 - (1 - t) ** 3;
    let peel = null, w = 0, h = 0;
    const setup = () => {
      w = art.offsetWidth; h = art.offsetHeight;
      if (!w || !h) return false;
      box.style.width = `${w}px`; box.style.height = `${h}px`;
      const back = document.createElement("div");
      back.className = "peel-back";
      const copy = art.cloneNode(true);
      copy.querySelectorAll("[data-holo]").forEach((x) => x.removeAttribute("data-holo"));
      copy.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
      back.append(copy);
      const bottom = document.createElement("div");
      bottom.className = "peel-bottom";
      box.append(back, bottom);
      peel = new Peel(box, { topShadow: false, backShadow: false, backReflection: false, bottomShadow: false });
      return true;
    };
    let clipKeep = "";
    const flat = (on) => {
      if (!peel) return;
      const t = peel.topLayer, b = peel.backLayer;
      if (on) { clipKeep ||= t.style.clipPath; t.style.clipPath = "none"; b.style.visibility = "hidden"; }
      else { if (clipKeep) t.style.clipPath = clipKeep; b.style.visibility = ""; }
    };
    const local = (cx, cy) => {
      const r = box.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      const rot = ((parseFloat(getComputedStyle(n).getPropertyValue("--rot")) || 0) * Math.PI) / 180, sc = parseFloat(getComputedStyle(n).scale) || 1;
      const dx = (cx - mx) / sc, dy = (cy - my) / sc;
      return { x: dx * Math.cos(-rot) - dy * Math.sin(-rot) + w / 2, y: dx * Math.sin(-rot) + dy * Math.cos(-rot) + h / 2 };
    };
    const edge = (p) => {
      let dx = p.x - w / 2, dy = p.y - h / 2;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) { dx = 1; dy = 1; }
      const k = Math.min(Math.abs(w / 2 / (dx || 1e-6)), Math.abs(h / 2 / (dy || 1e-6)));
      return { x: w / 2 + dx * k, y: h / 2 + dy * k };
    };
    let state = "idle", corner = { x: 0, y: 0 }, start = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, last = { x: 0, y: 0, t: 0 }, vel = { x: 0, y: 0 };
    const relax = (from) => {
      const t0 = performance.now();
      const f = (now) => { const k = Math.min(1, (now - t0) / 380), e = out3(k); peel.setPeelPosition(from.x + (corner.x - from.x) * e, from.y + (corner.y - from.y) * e); k < 1 ? requestAnimationFrame(f) : state === "idle" && flat(true); };
      requestAnimationFrame(f);
    };
    n.addEventListener("pointerdown", (e) => {
      if (state !== "idle" || (!peel && !setup())) return;
      e.preventDefault();
      state = "peeling"; n.classList.add("peeling"); n.setPointerCapture(e.pointerId);
      const p = local(e.clientX, e.clientY);
      corner = edge(p); flat(false);
      peel.corner = peel.getPoint(corner.x, corner.y);
      peel.setPeelPosition(corner.x, corner.y);
      start = p; cur = { ...corner }; last = { x: e.clientX, y: e.clientY, t: performance.now() }; vel = { x: 0, y: 0 };
    });
    const track = (e) => {
      const now = performance.now(), k = Math.max(1, now - last.t) / 16;
      vel = { x: vel.x * 0.5 + ((e.clientX - last.x) / k) * 0.5, y: vel.y * 0.5 + ((e.clientY - last.y) / k) * 0.5 };
      last = { x: e.clientX, y: e.clientY, t: now };
    };
    n.addEventListener("pointermove", (e) => {
      if (state !== "peeling") return;
      track(e);
      const p = local(e.clientX, e.clientY);
      cur = { x: corner.x + (p.x - start.x), y: corner.y + (p.y - start.y) };
      peel.setPeelPosition(cur.x, cur.y);
      if (peel.getAmountClipped() > 0.5) carry(e);
    });
    let home = null, pos = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, grab = { x: 0, y: 0 }, rot0 = 0, tilt = 0, lift = 0;
    const paint = () => {
      n.style.left = `${pos.x}px`; n.style.top = `${pos.y}px`;
      n.style.transform = `rotate(${rot0 + tilt}deg) scale(${1 + 0.08 * lift})`;
      n.style.filter = `drop-shadow(0 ${8 + 14 * lift}px ${14 + 12 * lift}px rgba(0,0,0,${0.16 + 0.14 * lift}))`; /* Not skin: shadow */
    };
    const follow = () => {
      if (state !== "carried") return;
      pos.x += (aim.x - pos.x) * 0.22; pos.y += (aim.y - pos.y) * 0.22;
      lift += (1 - lift) * 0.15;
      tilt += (Math.max(-16, Math.min(16, vel.x * 1.2)) - tilt) * 0.15;
      paint(); requestAnimationFrame(follow);
    };
    function carry(e) {
      state = "carried"; n.classList.remove("peeling");
      const from = { ...cur }, t0 = performance.now();
      const back = (now) => { const k = Math.min(1, (now - t0) / 160), q = out3(k); peel.setPeelPosition(from.x + (corner.x - from.x) * q, from.y + (corner.y - from.y) * q); k < 1 ? requestAnimationFrame(back) : flat(true); };
      requestAnimationFrame(back);
      lift = 0;
      const r = n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      home = { parent: n.parentElement, next: n.nextSibling, style: n.getAttribute("style") ?? "" };
      rot0 = parseFloat(getComputedStyle(n).getPropertyValue("--rot")) || 0;
      const sc = parseFloat(getComputedStyle(n).scale) || 1;
      document.body.append(n);
      Object.assign(n.style, { position: "fixed", right: "auto", bottom: "auto", margin: "0", translate: "none", zIndex: "999", animation: "none", transition: "none", cursor: "grabbing" });
      const ow = n.offsetWidth, oh = n.offsetHeight;
      pos = { x: cx - ow / 2, y: cy - oh / 2 };
      const a = (rot0 * Math.PI) / 180, bx = (corner.x - w / 2) * sc, by = (corner.y - h / 2) * sc;
      grab = { x: ow / 2 + bx * Math.cos(a) - by * Math.sin(a), y: oh / 2 + bx * Math.sin(a) + by * Math.cos(a) };
      aim = { x: e.clientX - grab.x, y: e.clientY - grab.y };
      paint(); requestAnimationFrame(follow);
    }
    document.addEventListener("pointermove", (e) => { if (state === "carried") { track(e); aim = { x: e.clientX - grab.x, y: e.clientY - grab.y }; } });
    const drop = () => {
      state = "falling"; n.style.pointerEvents = "none";
      let x = 0, y = 0, r = rot0 + tilt, vx = Math.max(-900, Math.min(900, vel.x * 40)), vy = Math.max(-500, Math.min(600, vel.y * 40)) - 120;
      const spin = vx * 0.35 + (Math.random() - 0.5) * 120, y0 = pos.y;
      let t0 = performance.now();
      const fall = (now) => {
        const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
        vy += 1600 * dt; x += vx * dt; y += vy * dt; vx *= 1 - 0.6 * dt; r += spin * dt;
        n.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1 + 0.08 * lift})`;
        if (y0 + y < innerHeight + 40) requestAnimationFrame(fall);
        else {
          n.style.visibility = "hidden";
          setTimeout(() => { if (!home) return; home.parent.insertBefore(n, home.next); n.setAttribute("style", home.style); n.style.animationDelay = "0s"; tilt = 0; state = "idle"; }, 2500);
        }
      };
      requestAnimationFrame(fall);
    };
    document.addEventListener("pointerup", () => { if (state === "carried") drop(); });
    document.addEventListener("pointercancel", () => { if (state === "carried") drop(); });
    const release = () => { if (state === "peeling") { n.classList.remove("peeling"); state = "idle"; relax(cur); } };
    n.addEventListener("pointerup", release);
    n.addEventListener("pointercancel", release);
  }
  const stickers = [...document.querySelectorAll("[data-sticker]")];
  stickers.forEach(buildSticker);
  holoShine();
  const armPeel = () => { if (window.Peel) stickers.forEach((s) => peelSticker(s, window.Peel)); };
  window.Peel ? armPeel() : addEventListener("dv-peel-ready", armPeel, { once: true });

  // Bottom pill menu: appears once past 60% of the screen, hides when the footer top comes within 40px of the screen bottom. ‹Services› opens a panel upward
  document.querySelectorAll("[data-dock]").forEach((dock) => {
    let busy = false;
    const check = () => {
      busy = false;
      const f = document.querySelector("footer"), near = f ? f.getBoundingClientRect().top < innerHeight - 40 : false;
      dock.classList.toggle("show", scrollY > innerHeight * 0.6 && !near);
    };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(check); } }, { passive: true });
    check();
    dock.querySelectorAll("[data-dock-toggle]").forEach((b) => {
      const panel = dock.querySelector(`#${b.getAttribute("aria-controls")}`);
      if (!panel) return;
      const set = (on) => { b.setAttribute("aria-expanded", String(on)); panel.classList.toggle("open", on); };
      b.addEventListener("click", (e) => { e.preventDefault(); set(b.getAttribute("aria-expanded") !== "true"); });
      if (!hoverNone) { b.parentElement.addEventListener("mouseleave", () => set(false)); }
      document.addEventListener("click", (e) => { if (!dock.contains(e.target)) set(false); });
    });
  });

  // Black panel roof: rises 0→1 as the panel head moves from the bottom of the screen upward
  document.querySelectorAll("[data-dome]").forEach((d) => {
    if (reduce) { d.style.setProperty("--curve", "0.6"); return; }
    let busy = false;
    const f = () => { busy = false; const top = d.parentElement.getBoundingClientRect().top; d.style.setProperty("--curve", clamp01(1 - top / innerHeight).toFixed(3)); };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(f); } }, { passive: true });
    addEventListener("resize", f);
    f();
  });

  // Reviews: start at 40% in view, advance every 8s, pause on hover. Words darken at 28ms intervals
  document.querySelectorAll("[data-testimonials]").forEach((root) => {
    const slides = [...root.querySelectorAll("[data-slide]")], counter = root.querySelector("[data-current]"), every = +(root.dataset.interval || 8000);
    root.style.setProperty("--interval", `${every}ms`);
    root.querySelectorAll("[data-words]").forEach((q) => {
      const words = (q.textContent ?? "").trim().split(/\s+/);
      q.setAttribute("aria-label", `“${words.join(" ")}”`);
      q.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--n:${i}">${i === 0 ? "“" : ""}${w}${i === words.length - 1 ? "”" : ""}</span>`).join(" ");
    });
    let cur = 0, timer = 0, started = false;
    const light = (s) => { slides.forEach((x) => x.classList.remove("lit")); void s.offsetWidth; requestAnimationFrame(() => s.classList.add("lit")); };
    const restart = () => { root.classList.remove("running"); void root.offsetWidth; if (!reduce) root.classList.add("running"); };
    const go = (i) => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { const on = k === cur; s.classList.toggle("active", on); on ? s.removeAttribute("aria-hidden") : s.setAttribute("aria-hidden", "true"); s.inert = !on; });
      if (counter) counter.textContent = String(cur + 1).padStart(2, "0");
      light(slides[cur]); restart(); next();
    };
    const next = () => { clearTimeout(timer); if (reduce || !started || root.classList.contains("paused")) return; timer = setTimeout(() => go(cur + 1), every); };
    root.querySelector("[data-prev]")?.addEventListener("click", () => go(cur - 1));
    root.querySelector("[data-next]")?.addEventListener("click", () => go(cur + 1));
    root.addEventListener("mouseenter", () => { root.classList.add("paused"); clearTimeout(timer); });
    root.addEventListener("mouseleave", () => { root.classList.remove("paused"); restart(); next(); });
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); started = true; go(0); } }, { threshold: 0.4 });
    io.observe(root);
  });

  // Video slot: plays when within 600px of the screen, pauses when it leaves (original video[data-autoplay])
  document.querySelectorAll("[data-autoplay]").forEach((v) => {
    new IntersectionObserver(([e]) => {
      if (v.tagName === "VIDEO") e.isIntersecting ? v.play().catch(() => {}) : v.pause();
      else v.classList.toggle("is-playing", e.isIntersecting && !reduce);
    }, { rootMargin: "600px 0px 600px 0px" }).observe(v);
  });

  // City clock (every 1s)
  const clocks = document.querySelectorAll("[data-city-time]");
  if (clocks.length) {
    const f = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: clocks[0].dataset.cityTime || "Asia/City" });
    const tick = () => clocks.forEach((c) => (c.textContent = f.format(new Date())));
    tick(); setInterval(tick, 1000);
  }

  document.querySelectorAll("[data-to-top]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); }));

  document.querySelectorAll("[data-appear]").forEach(appear);
  const fits = [...document.querySelectorAll("[data-fit-text]")];
  if (fits.length) fitText(fits);
  if (!reduce) document.querySelectorAll("[data-weight-hover]").forEach(weightHover);

  window.dv = { reduce, hoverNone, clamp01, lenis, spring, holoSvg };
})();
