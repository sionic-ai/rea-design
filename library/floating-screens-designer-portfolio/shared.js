// Shared by all pages: draws the header (solid layer + difference layer), phone menu, bottom dock, first-visit halftone loader, ghost wordmark and CONTACT footer, and
// Hooks up Lenis, letter rolling, line entrances, cursor text and page transitions.
// Original values: dock magnify 1.6x, radius 100px with linear falloff, spring 277/12/.1 · dock entrance y8 scale .4 → .6s back.out(1.4) ·
// Preview .45s power2.out (close .35) · letter roll 90° .3s power3.inOut stagger .06 (logo .08) · line entrance .3s power3.out stagger .12, 1.2 lines from below, -90° flip ·
// Cursor text follow .15 · offset 18/24px. WebGL and physics for the header logo and footer keycaps are in keys.js.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const coarse = matchMedia("(pointer: coarse)").matches;
  const REDUCE = "(prefers-reduced-motion: reduce)";
  const MOTION = "(prefers-reduced-motion: no-preference)";
  const IM = (window.IM = { lenis: null, mm: gsap.matchMedia() });
  const mm = IM.mm;
  let readyResolve;
  IM.ready = new Promise((r) => (readyResolve = r));

  const arrowR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>';
  const burger = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 5.5h12M2 10.5h12"/></svg>';
  const close = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3.5 3.5 9 9M12.5 3.5l-9 9"/></svg>';
  const keys = (cls = "") => ["A", "B", "C"].map((k) => `<span class="logo-key ${cls}"><b>${k}</b></span>`).join("");
  const time = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  const clock = (cls = "") => `<div class="clock ${cls}"><span class="clock__dot"></span><span data-label="Your city of residence (English name) here">City,</span><time>${time()}</time></div>`;
  const tabs = [["index.html#works", "Works", "3"], ["about.html", "About", ""], ["#", "Resume", "+"]];
  const btn = (label, cls = "", href = "#contact", icon = "") => `<a class="btn ${cls}" href="${href}"><span class="btn__label" data-roll>${label}</span>${icon ? `<span class="btn__icon">${icon}</span>` : ""}</a>`;
  IM.icons = { arrowR };

  // ── Header ──
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="site-header page-grid" data-slot="header">
      ${btn("Contact", "site-header__cta")}
      <button class="btn site-header__burger" type="button" aria-label="Open Menu"><span class="btn__icon">${burger}</span></button>
      <div class="menu" hidden data-slot="mobile-menu">
        <div class="menu__top">${clock("menu__clock")}<button class="btn" type="button" data-menu-close aria-label="Close Menu"><span class="btn__icon">${close}</span></button></div>
        <nav class="menu__links">${tabs.map(([h, t, s]) => `<a class="menu__link" href="${h}">${t}${s ? `<sup>${s}</sup>` : ""}</a>`).join("")}</nav>
        ${btn("Contact", "btn--solid")}
      </div>
    </div>
    <div class="blend-layer" aria-hidden="false">
      <header class="site-header page-grid">
        ${clock()}
        <a class="site-header__logo" href="index.html" aria-label="Home">${keys()}</a>
        <nav class="tabs" aria-label="Main menu">${tabs.map(([h, t, s]) => `<a class="tab" href="${h}"><span class="tab__label" data-roll>${t}</span>${s ? `<sup data-roll>${s}</sup>` : ""}</a>`).join("")}</nav>
      </header>
      <span class="cursor-label"><span class="cursor-label__text"></span></span>
    </div>`);
  setInterval(() => document.querySelectorAll(".clock time").forEach((t) => (t.textContent = time())), 30000);

  // ── Dock ──
  const icons = [
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" style="fill:var(--kf-accent)"/><circle cx="9" cy="10.5" r="1.4" style="fill:var(--kf-ink)"/><circle cx="15" cy="10.5" r="1.4" style="fill:var(--kf-ink)"/><path d="M8.5 14.5q3.5 3 7 0" style="stroke:var(--kf-ink)" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M17.5 6.5Q16 3 12 3T6.4 6.6q0 3.6 5.6 4.6t5.6 4.4Q17.6 21 12 21t-6-3.8" fill="none" style="stroke:var(--kf-ink)" stroke-width="3.4" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 2.5c3.6 0 6 2.8 6 6.5v3.5l3 9h-5l-1.6-5h-4.8L8 21.5H3l3-9V9c0-3.7 2.4-6.5 6-6.5Z" style="fill:var(--kf-ink)"/><circle cx="12" cy="9" r="2.6" style="fill:var(--kf-bg)"/></svg>',
  ];
  const lock = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="7" width="9" height="6.5" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';
  const dockItems = [
    { href: "detail.html?work=1", name: "Project 01", label: "Three app screens · light purple background · front view", icon: icons[0] },
    { href: "detail.html?work=2", name: "Project 02", label: "Dark dashboard · front-on screenshot", icon: icons[1] },
    { href: "", name: "Project 03", label: "White admin screen · purple border", icon: icons[2], soon: true },
  ];
  document.body.insertAdjacentHTML("beforeend", `
    <nav class="dock" data-slot="dock" aria-label="Go to work">
      ${dockItems.map((d) => `<${d.href ? `a href="${d.href}"` : "span"} class="dock__item" ${d.href ? "" : 'aria-disabled="true"'}>${d.icon}${d.soon ? `<span class="dock__badge">${lock}</span>` : ""}</${d.href ? "a" : "span"}>`).join("")}
      <div class="dock__stage" aria-hidden="true"><div class="dock__window"><div class="dock__track">${dockItems.map((d) => `<div class="dock__panel"><span class="dock__shot wf-img" data-label="${d.label}"></span><span class="dock__meta t-b2"><span>${d.name}</span>${d.soon ? '<span class="tag tag--outline">Launching soon</span>' : ""}</span></div>`).join("")}</div></div></div>
      <div class="dock__genie" aria-hidden="true"></div>
    </nav>`);

  // ── Ghost wordmark ──
  const main = document.querySelector("main");
  const ghostWord = document.body.dataset.ghost;
  // Starts at the spot inside the hero (data-ghost-anchor) and sticks behind the head as you scroll
  if (main && ghostWord) {
    main.insertAdjacentHTML("afterbegin", `<div class="ghost-wrap" aria-hidden="true"><span class="ghost">${ghostWord}</span></div>`);
    const wrap = main.firstElementChild, anchor = document.querySelector("[data-ghost-anchor]");
    const fit = () => anchor && (wrap.style.paddingTop = `${anchor.getBoundingClientRect().top - main.getBoundingClientRect().top}px`);
    fit();
    addEventListener("resize", fit);
    document.fonts.ready.then(fit);
  }

  // ── CONTACT footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  const social = (d) => `<a class="btn btn--outline btn--lg" href="#" aria-label="Social"><span class="btn__icon"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">${d}</svg></span></a>`;
  if (foot) {
    foot.outerHTML = `
    <footer class="footer page-grid" id="contact" data-slot="footer">
      <div class="footer__stage">
        <span class="footer__word" aria-hidden="true">CONTACT</span>
        <canvas class="keycaps" data-slot="keycaps" aria-label="Three keycaps — can be grabbed and thrown"></canvas>
      </div>
      <p class="footer__coord footer__coord--n cap-md">00.0000° N</p>
      <p class="footer__quote cap-md" data-label="Your one-line English closing here">A short closing line that signs off the whole page.</p>
      <p class="footer__coord footer__coord--e cap-md">00.0000° E</p>
      <div class="footer__rights">
        <span class="footer__stickers"><span class="sticker">●</span><span class="sticker">'0000</span></span>
        <p class="t-h4" data-label="Designer name in English here">First Lastname</p>
      </div>
      <ul class="footer__socials">${social('<rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M5.5 7v3.5M5.5 5v.2M8 10.5V7.5m0 1q.5-1 1.6-1t1.4 1v2"/>')}${social('<path d="m2.5 7.5 11-5-2 11-3.5-3-2 2v-3l5-4.5-6 3.5z"/>')}${social('<circle cx="8" cy="8" r="5.5"/><path d="M3 6.5q5 1 9.5-2M4.5 12q2.5-5 9-4M6 2.8q4 4.5 4.8 10.6"/>')}${social('<rect x="2.5" y="2.5" width="11" height="11" rx="3.2"/><circle cx="8" cy="8" r="2.6"/>')}</ul>
      ${btn("Contact", "btn--primary btn--lg footer__cta", "#", arrowR)}
    </footer>`;
  }

  // ── Smooth scroll ──
  mm.add(MOTION, () => {
    const lenis = new Lenis({ lerp: 0.1 });
    IM.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); IM.lenis = null; };
  });

  // ── Letter roll — the original is a cube where the whole label box flips 90° vertically: front face = Label, top face = Same label, underside = Empty box.
  // Perspective = 6 × depth × 2 (depth = height/2) · +90° on enter, −90° on exit · .3s power3.inOut · several in one link are .06 apart · back to 0 when done ──
  IM.roll = (el) => {
    const holder = document.createElement("span");
    holder.className = "roll";
    el.before(holder);
    const copy = el.cloneNode(true), plain = el.cloneNode(false);
    [copy, plain].forEach((c) => { c.removeAttribute("data-roll"); c.setAttribute("aria-hidden", "true"); c.classList.add("roll__copy"); c.inert = true; c.style.visibility = "hidden"; });
    holder.append(el, copy, plain);
    return { holder, copy, plain, deg: 0 };
  };
  const rollTo = (r, deg, dir = Math.sign(deg) || 1) => {
    const { holder, copy, plain } = r;
    if (Math.abs(deg) < 0.01) {
      holder.style.transform = "";
      [copy, plain].forEach((c) => { c.style.transform = ""; c.style.visibility = "hidden"; });
      return;
    }
    const w = holder.offsetWidth, depth = holder.offsetHeight / 2, origin = `${w / 2}px ${depth}px`, inset = Math.max(0, depth - 0.75);
    holder.style.transformOrigin = origin;
    holder.style.transform = `perspective(${6 * depth * 2}px) translateZ(${-depth}px) rotateX(${deg}deg) translateZ(${depth}px)`;
    [copy, plain].forEach((c, i) => {
      c.style.transformOrigin = origin;
      c.style.transform = `translateZ(${-depth}px) rotateX(${(i === 0 ? -dir : dir) * 90}deg) translateZ(${inset}px)`;
      c.style.visibility = "inherit";
    });
  };
  let lastDown = null;
  addEventListener("pointerdown", (e) => (lastDown = { x: e.clientX, y: e.clientY }), { capture: true, passive: true });
  const hosts = new Map();
  new Set(document.querySelectorAll(".btn .btn__label, .btn .btn__icon, [data-roll]")).forEach((el) => {
    const host = el.closest(".btn, a, button") || el;
    hosts.set(host, [...(hosts.get(host) || []), IM.roll(el)]);
  });
  IM.rollTo = rollTo;
  // Roll-in — original arrival effect (from -90° in .3s power3.out, several in one chunk at .12 intervals)
  IM.rollIn = (el, delay = 0) => {
    if (!hosts.has(el)) hosts.set(el, [IM.roll(el)]);
    hosts.get(el).forEach((r, i) => {
      r.holder.style.visibility = "hidden";
      const s = { deg: -90 };
      gsap.to(s, { deg: 0, duration: 0.3, ease: "power3.out", delay: delay + i * 0.12,
        onStart: () => { r.holder.style.visibility = ""; rollTo(r, -90, 1); }, onUpdate: () => rollTo(r, s.deg, 1), onComplete: () => rollTo(r, 0) });
    });
  };
  hosts.forEach((rolls, host) => {
    const turn = (sign) => {
      if (matchMedia(REDUCE).matches || coarse) return;
      rolls.forEach((r, i) => {
        const to = sign * 90, back = Math.abs(r.deg) > 0.01 && Math.sign(r.deg) !== Math.sign(to), end = back ? 0 : to, dir = Math.sign(back ? r.deg : to) || 1;
        gsap.to(r, { deg: end, duration: 0.3 * Math.max(0.2, Math.abs(end - r.deg) / 90), ease: "power3.inOut", delay: back ? 0 : i * 0.06, overwrite: true,
          onUpdate: () => rollTo(r, r.deg, dir), onComplete: () => { r.deg = 0; rollTo(r, 0); } });
      });
    };
    // As in the original, a pointer re-entering within 2px of the spot just pressed doesn’t roll — this happens when pressing changes the button and a new one stands under the cursor
    host.addEventListener("pointerenter", (e) => !(lastDown && Math.hypot(e.clientX - lastDown.x, e.clientY - lastDown.y) < 2) && turn(1));
    host.addEventListener("pointerleave", () => turn(-1));
  });
  const logo = document.querySelector(".blend-layer .site-header__logo");
  // Flat keys for when the WebGL keycaps (keys.js) fail to appear: one slot (90°) .3s power3.inOut stagger .08
  logo.addEventListener("mouseenter", () => {
    if (matchMedia(REDUCE).matches || logo.classList.contains("is-gl")) return;
    gsap.fromTo(logo.querySelectorAll(".logo-key"), { rotationX: 0 }, { rotationX: 90, duration: 0.3, ease: "power3.inOut", stagger: 0.08, overwrite: true, onComplete: () => gsap.set(logo.querySelectorAll(".logo-key"), { rotationX: 0 }) });
  });

  // ── Phone menu ──
  const menu = document.querySelector(".menu");
  const openMenu = () => {
    menu.hidden = false;
    IM.lenis && IM.lenis.stop();
    gsap.fromTo(menu, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
  };
  const closeMenu = () => {
    if (menu.hidden) return;
    IM.lenis && IM.lenis.start();
    gsap.to(menu, { opacity: 0, scale: 0.96, duration: 0.2, ease: "power2.in", onComplete: () => (menu.hidden = true) });
  };
  document.querySelector(".site-header__burger").addEventListener("click", openMenu);
  menu.querySelector("[data-menu-close]").addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // ── Dock: grows with cursor distance, preview on hover ──
  const dock = document.querySelector(".dock");
  const items = [...dock.querySelectorAll(".dock__item")];
  // Magnify — like the original, only the horizontal distance from the cursor counts (radius 100, linear, 1.6x). Cells stay put and icons scale up from the bottom (--s)
  // The dock pushes sideways (--x) by the amount the preceding cells grew and widens by that much (--spread). Size integrates a spring 277/12/.1 in 4ms steps
  const base = items[0].offsetWidth || 24, sizes = items.map(() => ({ s: base, v: 0 }));
  let px = null, running = false;
  const want = (it) => (px === null ? base : base * (1 + 0.6 * Math.max(0, 1 - Math.abs(px - (dock.getBoundingClientRect().left + it.offsetLeft + base / 2)) / 100)));
  const paint = () => {
    const extra = sizes.map((p) => p.s - base), total = extra.reduce((a, b) => a + b, 0), rest = sizes.every((p) => Math.abs(p.s - base) < 0.01);
    rest ? dock.style.removeProperty("--spread") : dock.style.setProperty("--spread", `${total}px`);
    let run = 0;
    items.forEach((it, i) => {
      if (rest) { it.style.removeProperty("--s"); it.style.removeProperty("--x"); }
      else { it.style.setProperty("--s", String(sizes[i].s / base)); it.style.setProperty("--x", `${run + extra[i] / 2 - total / 2}px`); }
      run += extra[i];
    });
  };
  const step = (t, dt) => {
    const span = Math.min(dt, 64), n = Math.max(1, Math.ceil(span / 4)), h = span / 1000 / n, goal = items.map(want);
    let moving = false;
    sizes.forEach((p, i) => {
      for (let k = 0; k < n; k++) { p.v += ((277 * (goal[i] - p.s) - 12 * p.v) / 0.1) * h; p.s += p.v * h; }
      if (Math.abs(goal[i] - p.s) > 0.01 || Math.abs(p.v) > 0.01) moving = true; else { p.s = goal[i]; p.v = 0; }
    });
    paint();
    if (!moving && px === null) { running = false; gsap.ticker.remove(step); }
  };
  const wake = () => { if (!running) { running = true; gsap.ticker.add(step); } };
  if (!coarse) {
    // Moving over the preview panel releases the zoom, like the original
    dock.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse" || matchMedia(REDUCE).matches) return; px = e.target.closest(".dock__stage") ? null : e.clientX; wake(); });
    dock.addEventListener("pointerleave", () => { px = null; wake(); });
    genie();
  }

  // Preview — shows a window (one strip with a panel per work laid out horizontally) in a genie shape. Original values: from the icon width, height rises up to progress .6,
  // The top edge widens up to .5 and the bottom edge from .35, with side lines following a squared curve · appears in the first 10% · blur .6px→0 · 96 slices pasted at a tilt ·
  // Open .45s power2.out (close .35s, after .1s) · moving to another icon slides the plate with .3s power3.inOut
  function genie() {
    const stage = dock.querySelector(".dock__stage"), win = stage.querySelector(".dock__window"), track = stage.querySelector(".dock__track"), layer = dock.querySelector(".dock__genie");
    const P = { rise: 0.6, top: 0.5, widen: 0.35, pinch: 1, curve: 2, fade: 0.1, soft: 0.6, slices: 96 };
    const clamp01 = (v) => Math.min(1, Math.max(0, v)), smooth = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
    const st = { p: 0, offset: 0 }, out = gsap.parseEase("power2.out");
    let at = null, tween = null, slide = null, timer = 0, glass = null, ink = null, slices = [];
    const place = (el) => (el.querySelector(".dock__track").style.transform = `translateX(${st.offset}px)`);
    const build = () => {
      if (slices.length) return;
      glass = document.createElement("span"); glass.className = "dock__genie-glass";
      ink = document.createElement("span"); ink.className = "dock__genie-ink";
      layer.append(glass, ink);
      slices = Array.from({ length: P.slices }, () => { const c = stage.cloneNode(true); c.className = "dock__slice"; ink.appendChild(c); return c; });
    };
    const clear = () => { layer.replaceChildren(); slices = []; glass = ink = null; };
    const draw = () => {
      if (at === null || !glass) return;
      const g = st.p, D = dock.getBoundingClientRect(), S = stage.getBoundingClientRect(), icon = (items[at].querySelector("svg") || items[at]).getBoundingClientRect();
      const b = stage.offsetWidth, h = stage.offsetHeight, R = parseFloat(getComputedStyle(stage).borderTopLeftRadius) || 0;
      const cx = icon.left + icon.width / 2 - S.left, iy = icon.top - S.top, narrow = Math.max(1, icon.width * P.pinch);
      const E = smooth(g / P.rise), T = smooth(g / P.top), O = smooth((g - P.widen) / (1 - P.widen));
      const k = Math.max(0.001, h * E), bottom = iy + (h - iy) * E, top = bottom - k;
      const wTop = narrow + (b - narrow) * T, cTop = cx + (b / 2 - cx) * T, wBot = narrow + (b - narrow) * O, cBot = cx + (b / 2 - cx) * O;
      const width = (t) => wTop + (wBot - wTop) * t ** P.curve, mid = (t) => cTop + (cBot - cTop) * t ** P.curve;
      const ox = S.left - D.left, oy = S.top - D.top, alpha = String(P.fade > 0 ? clamp01(g / P.fade) : 1);
      const r1 = Math.min(R, wTop / 2, k / 2), r2 = Math.min(R * O, wBot / 2, k / 2), pts = [];
      const pt = (x, y) => pts.push(`${x.toFixed(2)}px ${y.toFixed(2)}px`);
      const arc = (x, y, r, a0, a1) => { for (let i = 0; i <= 6; i++) { const a = ((a0 + ((a1 - a0) * i) / 6) * Math.PI) / 180; pt(x + r * Math.cos(a), y + r * Math.sin(a)); } };
      arc(cTop - wTop / 2 + r1, top + r1, r1, 270, 180);
      for (let i = 1; i < 40; i++) pt(mid(i / 40) - width(i / 40) / 2, top + k * (i / 40));
      arc(cBot - wBot / 2 + r2, bottom - r2, r2, 180, 90); arc(cBot + wBot / 2 - r2, bottom - r2, r2, 90, 0);
      for (let i = 39; i > 0; i--) pt(mid(i / 40) + width(i / 40) / 2, top + k * (i / 40));
      arc(cTop + wTop / 2 - r1, top + r1, r1, 0, -90);
      Object.assign(glass.style, { left: `${ox}px`, top: `${oy}px`, width: `${b}px`, height: `${Math.max(h, iy + icon.height)}px`, opacity: alpha, clipPath: `polygon(${pts.join(", ")})` });
      ink.style.filter = P.soft > 0 ? `blur(${(P.soft * (1 - g)).toFixed(2)}px)` : "";
      const sy = k / h, n = slices.length;
      slices.forEach((el, i) => {
        const a = i / n, z = (i + 1) / n, y0 = h * a, y1 = h * z, x0 = mid(a), x1 = mid(z), sx = Math.max(0.001, width((a + z) / 2) / b), skew = (x1 - x0) / (y1 - y0);
        Object.assign(el.style, { width: `${b}px`, height: `${h}px`, opacity: alpha, transform: `matrix(${sx}, 0, ${skew}, ${sy}, ${x0 - (sx * b) / 2 - skew * y0 + ox}, ${top + oy})`, clipPath: `inset(${Math.max(0, y0 - 0.5)}px 0 ${Math.max(0, h - y1 - 0.5)}px 0)` });
        place(el);
      });
    };
    const update = () => {
      place(stage);
      const shown = at !== null && st.p >= 1;
      stage.toggleAttribute("data-shown", shown);
      if (at === null || shown || st.p <= 0) return clear();
      build(); draw();
    };
    const go = (to) => {
      tween?.kill();
      const span = Math.abs(to - st.p);
      tween = gsap.to(st, { p: to, duration: (to ? 0.45 : 0.35) * span, ease: to ? out : (t) => 1 - out(1 - t), onUpdate: update, onComplete: () => { if (!to) at = null; update(); } });
    };
    const show = (i) => {
      clearTimeout(timer);
      const x = -i * win.clientWidth;
      if (at === null || st.p <= 0) { slide?.kill(); st.offset = x; at = i; return go(1); }
      if (i !== at) { at = i; slide?.kill(); slide = gsap.to(st, { offset: x, duration: 0.3, ease: "power3.inOut", onUpdate: update }); }
      if (tween?.isActive() ? tween.vars.p !== 1 : st.p < 1) go(1);
    };
    const hide = () => { clearTimeout(timer); timer = setTimeout(() => at !== null && go(0), 100); };
    gsap.ticker.add(() => at !== null && st.p > 0 && st.p < 1 && draw());
    dock.addEventListener("pointerover", (e) => {
      if (e.pointerType !== "mouse" || matchMedia(REDUCE).matches) return;
      const it = e.target.closest(".dock__item"), i = items.indexOf(it);
      if (i >= 0) show(i); else if (e.target.closest(".dock__stage") || at !== null) clearTimeout(timer);
    });
    dock.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && hide());
  }

  // ── Cursor text (over work card) ──
  const label = document.querySelector(".cursor-label");
  if (!coarse) {
    const lx = gsap.quickTo(label, "x", { duration: 0.15, ease: "power2.out" });
    const ly = gsap.quickTo(label, "y", { duration: 0.15, ease: "power2.out" });
    // Follows only while over a card — if it always follows while hidden, the motion mixes in with other hovers
    let on = false;
    addEventListener("pointermove", (e) => { if (on) { lx(e.clientX + 18); ly(e.clientY + 24); } }, { passive: true });
    document.addEventListener("mouseover", (e) => {
      const hit = e.target.closest("[data-cursor]");
      if (hit && !on) gsap.set(label, { x: e.clientX + 18, y: e.clientY + 24 });
      on = !!hit;
      label.style.visibility = hit ? "visible" : "hidden";
      if (hit) label.firstElementChild.textContent = hit.dataset.cursor;
    });
  }

  // ── Line entrance — each line rises 1.2 lines from below and stands up from -90° (.4s power3.out, stagger .08, perspective 6em, axis depth .5em),
  // Meanwhile the letter edges melt into halftone dots and set again (melt: blur .4em · hardness 27.5 · dots .79 · dot size .09em, 1.3× the total length) ──
  const NS = "http://www.w3.org/2000/svg";
  let defs = null, meltCount = 0;
  const melt = (el, M = { amount: 0.4, hardness: 27.5, dots: 0.79, dotSize: 0.09 }) => {
    if (!defs?.isConnected) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      defs = document.createElementNS(NS, "defs");
      svg.append(defs);
      document.body.append(svg);
    }
    const size = parseFloat(getComputedStyle(el).fontSize) || 16, d = Math.max(2, M.dotSize * size), id = `im-melt-${++meltCount}`;
    const dot = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="${NS}" width="${d}" height="${d}"><defs><radialGradient id="g"><stop offset="0" stop-opacity="1"/><stop offset="1" stop-opacity="0"/></radialGradient></defs><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="url(#g)"/></svg>`);
    const f = document.createElementNS(NS, "filter");
    Object.entries({ id, x: "-15%", y: "-40%", width: "130%", height: "180%", "color-interpolation-filters": "sRGB" }).forEach(([k, v]) => f.setAttribute(k, v));
    // Blur the letter shape and filter through a halftone tile to get edges, then cut the blurred letters with those edges to make them firm
    f.innerHTML = `
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="full"/>
      <feGaussianBlur in="full" stdDeviation="0" result="shape"/>
      <feImage href="${dot}" x="0" y="0" width="${d}" height="${d}" result="dot"/>
      <feTile in="dot" result="dots"/>
      <feComposite in="shape" in2="dots" operator="arithmetic" k1="0" k2="1" k3="0" k4="0" result="screened"/>
      <feColorMatrix in="screened" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="edge"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="ink"/>
      <feColorMatrix in="ink" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 0" result="solid"/>
      <feComposite in="solid" in2="edge" operator="in"/>`;
    defs.append(f);
    const [, shapeBlur, , , mix, edge, inkBlur] = f.children;
    return {
      id,
      set: (t) => {
        const spread = M.amount * size * (1 - t), grain = M.dots * (1 - t), hard = M.hardness + (1 - M.hardness) * Math.max(0, (t - 0.75) / 0.25);
        shapeBlur.setAttribute("stdDeviation", spread); inkBlur.setAttribute("stdDeviation", spread);
        mix.setAttribute("k3", grain); mix.setAttribute("k4", -grain / 2);
        edge.setAttribute("values", `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${hard} ${0.5 - 0.5 * hard}`);
      },
      remove: () => f.remove(),
    };
  };
  // Like the original, apply the recording filter right at creation and hide it while setting up word pieces, then show at 0s and set up each line at .08 intervals
  // The wordmark panel uses the original wordmark settings — 1s, spacing .15, bleed .3em, halftone size .28em
  const PRESET = { base: { dur: 0.4, each: 0.08, melt: undefined }, wordmark: { dur: 1, each: 0.15, melt: { amount: 0.3, hardness: 27.5, dots: 0.79, dotSize: 0.28 } } };
  const lines = (el, opts = {}, kind = "base") => {
    el._undo?.();
    const { dur, each } = PRESET[kind];
    const size = parseFloat(getComputedStyle(el).fontSize) || 16, m = melt(el, PRESET[kind].melt), st = { t: 0 };
    m.set(0);
    // The filter originally applied (blur of the ghost wordmark) is appended after recording
    const keep = el.style.filter ? "" : getComputedStyle(el).filter, chain = keep && keep !== "none" ? ` ${keep}` : "";
    el.style.filter = `url(#${m.id})${chain}`;
    el.style.visibility = "hidden";
    const split = SplitText.create(el, { type: "words", wordsClass: "tr-move", mask: "words" });
    const rows = [], tops = split.words.map((w) => w.getBoundingClientRect().top);
    [...tops].sort((x, y) => x - y).forEach((t) => (!rows.length || t - rows[rows.length - 1] > 4) && rows.push(t));
    const row = tops.map((t) => rows.filter((r) => t >= r - 4).length - 1), total = Math.max(0, ...row) * each + dur;
    const undo = () => { tl.kill(); el.style.filter = ""; m.remove(); split.revert(); el._undo = null; };
    const tl = gsap.timeline({ ...opts, onComplete: undo });
    tl.set(el, { visibility: "visible" }, 0);
    split.words.forEach((w, i) => tl.fromTo(w, { yPercent: 120, rotationX: -90, transformPerspective: 6 * size, transformOrigin: "50% 50% -0.5em" }, { yPercent: 0, rotationX: 0, duration: dur, ease: "power3.out", immediateRender: true }, row[i] * each));
    tl.to(st, { t: 1, duration: total * 1.3, ease: "power3.out", onUpdate: () => m.set(st.t) }, 0);
    el._undo = () => { el.style.visibility = "visible"; undo(); };
    return tl;
  };
  IM.lines = lines;

  // ── First-visit loader ──
  // The original splash exists only on the first home visit (no splash on about and detail documents)
  const first = page === "home" && !sessionStorage.getItem("im-visited");
  if (page === "home") sessionStorage.setItem("im-visited", "1");
  const runSplash = () => {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="splash" data-slot="loader">
        <canvas class="splash__halftone"></canvas>
        <div class="splash__keys">${keys()}</div>
        <span class="splash__label splash__label--l cap" data-label="Your first word of English nickname here">Nick</span><span class="splash__label splash__label--r cap" data-label="Second word of your English nickname here">Name</span>
        <div class="splash__loader"><div class="splash__bar"><div class="splash__dots">${"<i></i>".repeat(40)}</div></div><div class="splash__percent"><span>0%</span></div></div>
      </div>`);
    const sp = document.querySelector(".splash");
    const cv = sp.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const dots = [...sp.querySelectorAll(".splash__dots i")];
    const pct = sp.querySelector(".splash__percent span");
    const st = { p: 0, r: 0 };
    let W, H, dpr;
    const size = () => { dpr = Math.min(2, devicePixelRatio); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
    size();
    const ink = getComputedStyle(root).getPropertyValue("--kf-ink").trim();
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ink;
      const cell = 18 * dpr, cx = W / 2, cy = H / 2, R = st.r * Math.hypot(cx, cy);
      for (let y = cell / 2; y < H + cell; y += cell) for (let x = cell / 2; x < W + cell; x += cell) {
        const a = Math.atan2(y - cy, x - cx);
        const wob = 1 + 0.18 * Math.sin(a * 5 + t * 0.002) + 0.08 * Math.sin(a * 9 - t * 0.003);
        const d = Math.hypot(x - cx, y - cy) / wob;
        const k = Math.min(1, Math.max(0, (d - R) / (cell * 6)));
        if (k <= 0) continue;
        ctx.beginPath(); ctx.arc(x, y, cell * 0.74 * k, 0, 6.2832); ctx.fill();
      }
    };
    const loop = () => draw(performance.now());
    gsap.ticker.add(loop);
    gsap.to(sp.querySelectorAll(".logo-key"), { rotationX: 360, rotationY: 180, duration: 1.6, ease: "power2.inOut", stagger: 0.1, repeat: -1, repeatDelay: 0.2 });
    gsap.timeline({ onComplete: () => { gsap.ticker.remove(loop); sp.remove(); readyResolve(); } })
      .to(st, { p: 1, r: 0.16, duration: 1.6, ease: "power1.inOut", onUpdate: () => {
        pct.textContent = Math.round(st.p * 100) + "%";
        dots.forEach((d, i) => d.style.setProperty("--ink", st.p * dots.length > i ? 1 : 0));
      } })
      .call(() => sp.classList.add("is-revealing"))
      .to(sp.querySelectorAll(".splash__keys, .splash__label, .splash__loader"), { autoAlpha: 0, duration: 0.3 })
      .to(st, { r: 1.25, duration: 1.2, ease: "power4.inOut" }, "<");
  };
  // If there is no splash, arrival starts after page load finishes (where the original astro:page-load sits) — so the timeline doesn’t run ahead while a big script loads
  if (first && !matchMedia(REDUCE).matches) runSplash();
  else if (document.readyState === "complete") readyResolve();
  else addEventListener("load", () => readyResolve(), { once: true });

  // ── Entrance (after loader) ──
  IM.ready.then(() => document.fonts.ready).then(() => {
    mm.add(MOTION, () => {
      gsap.from(dock, { y: 8, scale: 0.4, autoAlpha: 0, duration: 0.6, ease: "back.out(1.4)" });
      document.querySelectorAll('[data-rv="load"]').forEach((el, i) => lines(el, { delay: el.dataset.rvAt ? +el.dataset.rvAt : 0.1 + i * 0.12 }));
      // Ghost wordmark — wordmark panel rows appear at original arrival 0s (About·detail 0.2s later)
      document.querySelectorAll(".ghost").forEach((el) => lines(el, { delay: page === "home" ? 0 : 0.2 }, "wordmark"));
      document.querySelectorAll('[data-rv="lines"]').forEach((el) => lines(el, { scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
      document.querySelectorAll('[data-rv="fade"]').forEach((el) => gsap.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
    });
    mm.add(REDUCE, () => gsap.set("[data-rv]", { visibility: "visible", opacity: 1 }));
    document.dispatchEvent(new Event("im:ready"));
    ScrollTrigger.refresh();
  });

  // ── Anchors·page transitions — the original is the Astro ClientRouter default fade (old page 180ms, new page 210ms after 30ms, cubic-bezier(.76,0,.24,1)) = power3.inOut) ──
  if (!matchMedia(REDUCE).matches && sessionStorage.getItem("im-nav")) gsap.fromTo("main, .footer", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.21, delay: 0.03, ease: "power3.inOut", clearProps: "opacity,visibility" });
  sessionStorage.removeItem("im-nav");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href === "#") return e.preventDefault();
    if (href.startsWith("#")) {
      const t = document.querySelector(href);
      if (t) { e.preventDefault(); IM.lenis ? IM.lenis.scrollTo(t) : t.scrollIntoView(); }
      return;
    }
    if (a.target === "_blank" || a.hostname !== location.hostname || /^(mailto|tel):/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html", [there, hash] = href.split("#");
    if (there === here && hash) {
      const t = document.getElementById(hash);
      if (t) { e.preventDefault(); IM.lenis ? IM.lenis.scrollTo(t) : t.scrollIntoView(); }
      return;
    }
    e.preventDefault();
    if (matchMedia(REDUCE).matches) return (location.href = a.href);
    sessionStorage.setItem("im-nav", "1");
    gsap.to("main, .footer", { autoAlpha: 0, duration: 0.18, ease: "power3.inOut", onComplete: () => (location.href = a.href) });
  });
  addEventListener("pageshow", (e) => e.persisted && location.reload());
})();
