// Common to all pages: draws in the header·menu panel·closing footer, and hooks up the transition curtain·smooth wheel·header hide·text effects (type·rise·lines·sweep·fade·pop·media)·rolling text·lens cursor·photo parallax·scroll tilt·brightness shift.
// Original values: wheel follow 1−e^(−7.5·dt) · band once the head passes 24px, hidden when scrolling down more than 6px below 160px · logo eye rotation 1−e^(−16·dt) · lens follow 1−e^(−25·dt), photo spring (size 210/17 · position 90/15)
// · Text effects use Web Animations with the original keyframes as is (FX below) · transition .72s cubic-bezier(.76,0,.24,1), name letters 22ms apart
(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const span = (c) => { const e = document.createElement("span"); if (c) e.className = c; return e; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const RI = (window.RI = { reduced, fine, ticks: new Set() });
  if (!reduced) root.classList.add("fx-live", "ri-motion");

  // Brightness — remembers an even slab like the original
  const savedTheme = localStorage.getItem("ri-theme");
  if (savedTheme === "dark") root.dataset.theme = "dark";

  const arrow = '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M5 13 13 5M6.5 5H13v6.5" stroke="currentColor" stroke-width="1.4"/></svg>';
  RI.arrow = arrow;
  // Logo slot — our symbol with two eyes that follow the cursor
  const mark = '<svg viewBox="0 0 48 30" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="13" r="9"/><circle cx="35" cy="13" r="9"/><path d="M12 22v6M35 22v6"/></g><g class="eye" data-cx="12" data-cy="13"><circle cx="16.2" cy="13" r="2.8" fill="currentColor"/></g><g class="eye" data-cx="35" data-cy="13"><circle cx="39.2" cy="13" r="2.8" fill="currentColor"/></g></svg>';
  const nav = [["home", "index.html", "Home"], ["about", "about.html", "About"], ["works", "works.html", "Work"], ["detail", "detail.html", "Work details"]];
  const cur = (k) => (k === page ? ' aria-current="page"' : "");
  RI.names = { home: "Home", about: "About", works: "Work", detail: "Work details" };

  const head = document.querySelector('[data-slot="header"]');
  if (head) head.innerHTML = `
    <header class="studio-header" data-seq>
      <a class="studio-brand" href="index.html" aria-label="Home" data-fx="fade" data-at="360"><span class="studio-brand-icon">${mark}</span><span>Word<span class="brand-dot">.</span>Mark</span></a>
      <div class="studio-header-actions">
        <button class="studio-theme" type="button" aria-label="Switch to dark version" title="Light / Dark" data-fx="pop" data-at="420"><span aria-hidden="true">◐</span></button>
        <a class="studio-connect" href="#contact" data-fx="pop" data-at="460"><span data-roll>CONNECT</span><span aria-hidden="true">↗</span></a>
        <button class="studio-menu-toggle" type="button" aria-label="Open Menu" aria-haspopup="dialog" aria-controls="studio-navigation" aria-expanded="false" data-fx="pop" data-at="500"><span data-roll>MENU</span><svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 6h14M2 12h14" stroke="currentColor" stroke-width="1.4"/></svg></button>
      </div>
    </header>
    <dialog class="studio-menu" id="studio-navigation" aria-label="Site Menu" data-slot="menu">
      <div class="studio-menu-head"><span>Wordmark / Contents</span><button class="studio-menu-close" type="button" aria-label="Close Menu">CLOSE <span aria-hidden="true">×</span></button></div>
      <nav aria-label="Main menu">${nav.map(([k, h, t], i) => `<a href="${h}" style="--i:${i}"${cur(k)}><sup>0${i + 1}</sup><span data-roll>${t}</span><span aria-hidden="true">↗</span></a>`).join("")}</nav>
      <div class="studio-menu-foot"><span>Your what-we-do line here</span><a href="#">hello@your.email ↗</a></div>
    </dialog>`;

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) foot.innerHTML = `
    <footer class="studio-footer page-container" id="contact" aria-labelledby="studio-contact-title">
      <div class="studio-footer-head"><p class="eyebrow" data-fx="type">(Contact)</p><p class="studio-footer-lead" data-fx="sweep">Starting from an idea that has no shape yet,<br>Shall we talk together?</p></div>
      <h2 class="studio-contact-title" id="studio-contact-title" data-fx="rise">Let’s create<br><span class="accent">together.</span></h2>
      <div class="studio-contact-detail"><a class="studio-contact-email" href="#" data-fx="fade"><span data-roll>hello@your.email</span><span aria-hidden="true">↗</span></a><a class="blue-link" href="#" data-fx="pop"><span data-roll>LET’S TALK</span><span aria-hidden="true">↗</span></a></div>
      <div class="studio-footer-bottom">
        <a class="studio-footer-brand" href="index.html" data-fx="fade">Word<span>.</span>Mark</a>
        <nav aria-label="Footer Menu" data-fx="fade">${nav.slice(0, 3).map(([k, h, t]) => `<a href="${h}"${cur(k)}><span data-roll>${t}</span></a>`).join("")}</nav>
        <button class="studio-top" type="button" data-fx="pop"><span data-roll>Back to top</span><span aria-hidden="true">↑</span></button>
        <span class="studio-copyright" data-fx="type">© 2026 Wordmark</span>
      </div>
    </footer>`;

  /* ---------- Text Effects ---------- */
  const E = { out: "cubic-bezier(.16, 1, .3, 1)", io: "cubic-bezier(.76, 0, .24, 1)", back: "cubic-bezier(.34, 1.56, .64, 1)", snap: "cubic-bezier(.19, 1, .22, 1)" };
  const STEP = "steps(1, end)";
  const play = (el, kf, o) => el.animate(kf, { fill: "backwards", ...o });
  // Earlier pieces go faster, later ones are delayed so they bunch up — original delay curve n·(1−(1−i/(N−1))²)
  const spread = (i, n, total) => (n < 2 ? 0 : total * (1 - (1 - i / (n - 1)) ** 2));
  const blue = () => getComputedStyle(root).getPropertyValue("--site-blue-ink").trim() || getComputedStyle(root).getPropertyValue("--kf-accent").trim();
  const CLOSE = /[、。，．·：；！？」』）】〕〉》ー〜…,.!?:;)\]’”]/, OPEN = /[「『（【〔〈《(\[‘“]/, LATIN = /[A-Za-z0-9À-ɏ'’\-&.가-힣]/;

  function glyphs(el, words) {
    const list = [], vis = span(words ? "fx-chars" : "fx-inline");
    vis.setAttribute("aria-hidden", "true");
    const walk = (from, into) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        let w = null, prev = "";
        for (const ch of n.textContent) {
          if (/\s/.test(ch)) { w = null; prev = ""; into.append(" "); continue; }
          const g = span("fx-g");
          g.textContent = ch;
          list.push(g);
          if (!words) { into.append(g); continue; }
          if (!(w && ((LATIN.test(ch) && LATIN.test(prev)) || CLOSE.test(ch) || OPEN.test(prev)))) { w = span("fx-w"); into.append(w); }
          const m = span("fx-m");
          m.append(g); w.append(m); prev = ch;
        }
      } else if (n.nodeName === "BR") into.append(document.createElement("br"));
      else if (n.nodeType === 1 && !n.classList.contains("ri-sr")) { const c = n.cloneNode(false); c.removeAttribute("id"); into.append(c); walk(n, c); }
    });
    walk(el, vis);
    const sr = span("ri-sr");
    sr.textContent = el.textContent.replace(/\s+/g, " ").trim();
    el.textContent = "";
    el.append(sr, vis);
    return { glyphs: list, visual: vis };
  }
  function lines(el) {
    const rows = [[]];
    [...el.childNodes].forEach((n) => (n.nodeName === "BR" ? rows.push([]) : rows.at(-1).push(n)));
    el.textContent = "";
    return rows.map((r) => { const l = span("fx-l"), i = span(); i.append(...r); l.append(i); el.append(l); return i; });
  }
  const flicker = (el, delay, dur = 420) => el.animate([{ opacity: 1, easing: STEP }, { opacity: 0.12, offset: 0.16, easing: STEP }, { opacity: 1, offset: 0.32, easing: STEP }, { opacity: 0.4, offset: 0.56, easing: STEP }, { opacity: 1, offset: 0.74 }, { opacity: 1 }], { duration: dur, delay, fill: "none" });
  const accentFlicker = (el, d) => el.querySelectorAll('[class*="accent"]').forEach((a) => flicker(a, d, 520));
  const SCRAMBLE = "ABCDEFGHJKMNPQRSTUVWXYZ0123456789/#+*";
  function scramble(g, d) {
    const real = g.textContent;
    setTimeout(() => {
      g.style.cssText = `display:inline-block;text-align:center;width:${g.getBoundingClientRect().width}px`;
      let k = 0;
      const tick = () => { if (k++ < 2) { g.textContent = SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]; setTimeout(tick, 34); } else { g.textContent = real; g.removeAttribute("style"); } };
      tick();
    }, d);
  }
  const FX = {
    // Prints one character at a time with a flicker (140ms), alphanumerics shuffle twice before settling, and the cursor follows up to the last character
    type(el, at, { glyphs: gs, visual }) {
      const n = gs.length;
      if (!n) return 0;
      const each = clamp(300 / n, 9, 22), all = n * each;
      gs.forEach((g, i) => {
        const d = at + i * each;
        play(g, [{ opacity: 0, easing: STEP }, { opacity: 1, offset: 0.25, easing: STEP }, { opacity: 0.2, offset: 0.5, easing: STEP }, { opacity: 1, offset: 0.75 }, { opacity: 1 }], { duration: 140, delay: d });
        if (/[A-Za-z0-9]/.test(g.textContent)) scramble(g, d);
      });
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const box = el.getBoundingClientRect();
      const pts = gs.map((g) => { const r = g.getBoundingClientRect(); return { x: r.right - box.left, y: r.top - box.top, h: r.height }; });
      const caret = span("fx-caret");
      caret.setAttribute("aria-hidden", "true");
      caret.style.height = `${Math.max(...pts.map((p) => p.h))}px`;
      el.append(caret);
      const total = all + 300, k = all / total;
      caret.animate([...pts.map((p, i) => ({ transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`, offset: (i * each) / total, easing: STEP })), { transform: `translate(${pts.at(-1).x.toFixed(1)}px, ${pts.at(-1).y.toFixed(1)}px)`, offset: 1 }], { duration: total, delay: at, fill: "forwards" });
      caret.animate([{ opacity: 1, easing: STEP }, { opacity: 1, offset: k, easing: STEP }, { opacity: 0, offset: k + (1 - k) * 0.2, easing: STEP }, { opacity: 1, offset: k + (1 - k) * 0.4, easing: STEP }, { opacity: 0, offset: k + (1 - k) * 0.65 }, { opacity: 0 }], { duration: total, delay: at, fill: "forwards" });
      setTimeout(() => caret.remove(), at + total + 40);
      flicker(visual, at + all + 60, 260);
      return Math.min(all * 0.3, 110) + 30;
    },
    // Letters pop up from 120% below tilted 6~12°, overshoot −6%, then settle (.9s)
    rise(el, at, { glyphs: gs }) {
      const n = gs.length, all = Math.min(38 * n, 360);
      gs.forEach((g, i) => {
        const dx = ((i - (n - 1) / 2) * 0.08).toFixed(3);
        play(g, [{ transform: `translate(${dx}em, 120%) rotate(${6 + (i % 3) * 3}deg)`, easing: E.snap }, { transform: "translate(0, -6%) rotate(-1.2deg)", offset: 0.6, easing: "cubic-bezier(.5, 0, .25, 1)" }, { transform: "none" }], { duration: 900, delay: at + spread(i, n, all) });
      });
      accentFlicker(el, at + all + 320);
      return 110;
    },
    // The line settles at 108%, 2°, blur 8px over .82s
    lines(el, at, { lines: ls }) {
      const n = ls.length, all = 85 * (n - 1);
      ls.forEach((l, i) => play(l, [{ transform: "translateY(108%) rotate(2deg)", opacity: 0, filter: "blur(8px)", easing: E.out }, { transform: "none", opacity: 1, filter: "blur(0px)" }], { duration: 820, delay: at + spread(i, n, all) }));
      accentFlicker(el, at + all + 420);
      return 100;
    },
    // Each line lights up blue 40ms later and each letter 2.5ms later, then returns to its own color
    sweep(el, at, { glyphs: gs }) {
      const c = blue();
      let row = -1, col = 0, top = -Infinity;
      gs.map((g) => { const t = g.offsetTop; if (Math.abs(t - top) > 2) { row++; col = 0; top = t; } return { g, d: at + row * 40 + col++ * 2.5, ink: getComputedStyle(g).color }; })
        .forEach(({ g, d, ink }) => play(g, [{ opacity: 0, color: c }, { opacity: 1, color: c, offset: 0.32 }, { opacity: 1, color: ink }], { duration: 480, delay: d, easing: "cubic-bezier(.3, .6, .3, 1)" }));
      return 80;
    },
    fade(el, at) { play(el, [{ opacity: 0, transform: "translateY(24px)", filter: "blur(8px)", easing: E.out }, { opacity: 1, transform: "none", filter: "blur(0px)" }], { duration: 720, delay: at }); return 60; },
    pop(el, at) {
      play(el, [{ opacity: 0, transform: "scale(.5)", easing: "cubic-bezier(.3, 1.45, .5, 1)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: at });
      const tip = el.querySelector(':scope > [aria-hidden="true"]:last-child');
      if (tip) play(tip, [{ opacity: 0, transform: "translate(-70%, 70%) rotate(-60deg)", easing: E.back }, { opacity: 1, transform: "none" }], { duration: 520, delay: at + 110 });
      return 50;
    },
    // Photo slot — block: a blue curtain covers from the left and exits to the right while the photo goes 1.36→1 · rise: opens from below · line: opens up and down from a center horizontal line
    media(el, at) {
      const v = el.dataset.variant || "line", cs = getComputedStyle(el), r = cs.getPropertyValue("--ri-radius").trim() || cs.borderTopLeftRadius || "0px";
      const img = el.querySelector("[data-parallax='img'], .ph");
      const base = img && getComputedStyle(img).scale !== "none" ? getComputedStyle(img).scale : "1";
      const zoom = (d, from, dur) => img && play(img, [{ scale: from, easing: E.out }, { scale: base }], { duration: dur, delay: d });
      if (v === "block") {
        const b = span("fx-block");
        el.append(b);
        play(b, [{ transform: "scaleX(0)", transformOrigin: "0 50%", easing: E.io }, { transform: "scaleX(1)", transformOrigin: "0 50%", offset: 0.44, easing: STEP }, { transform: "scaleX(1)", transformOrigin: "100% 50%", offset: 0.48, easing: E.io }, { transform: "scaleX(0)", transformOrigin: "100% 50%" }], { duration: 900, delay: at, fill: "both" }).finished.then(() => b.remove(), () => b.remove());
        const hold = (p, a, z) => [{ [p]: a, easing: STEP }, { [p]: a, offset: 0.46, easing: STEP }, { [p]: z, offset: 0.461 }, { [p]: z }];
        play(el, hold("backgroundColor", "transparent", cs.backgroundColor), { duration: 900, delay: at });
        [...el.children].forEach((c) => c !== b && play(c, hold("opacity", 0, getComputedStyle(c).opacity), { duration: 900, delay: at }));
        zoom(at + 414, "1.36", 1200);
      } else if (v === "rise") {
        play(el, [{ clipPath: `inset(100% 0% 0% 0% round ${r})`, easing: E.io }, { clipPath: `inset(0% 0% 0% 0% round ${r})` }], { duration: 900, delay: at });
        zoom(at, "1.28", 1300);
      } else {
        play(el, [{ clipPath: `inset(50% 50% 50% 50% round ${r})`, easing: "cubic-bezier(.65, 0, .35, 1)" }, { clipPath: `inset(49.3% 0% 49.3% 0% round ${r})`, offset: 0.36, easing: E.io }, { clipPath: `inset(0% 0% 0% 0% round ${r})` }], { duration: 1100, delay: at });
        zoom(at + 220, "1.5", 1500);
        if (img) play(img, [{ filter: "brightness(2.1) contrast(.85)", easing: E.out }, { filter: "brightness(1) contrast(1)" }], { duration: 1000, delay: at + 320 });
      }
      return 120;
    },
  };
  function prep(el) {
    if (el.__fx) return;
    const kind = el.dataset.fx;
    if (!FX[kind]) { el.classList.add("fx-on"); return; }
    const s = { kind };
    if (!reduced) {
      if (kind === "type" || kind === "sweep") Object.assign(s, glyphs(el, false));
      else if (kind === "rise") Object.assign(s, glyphs(el, true));
      else if (kind === "lines") s.lines = lines(el);
    }
    el.__fx = s;
  }
  const run = (el, at = 0) => { el.classList.add("fx-on"); return !el.__fx || reduced ? 0 : FX[el.__fx.kind](el, at, el.__fx) || 0; };
  const order = (a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  let queueEnd = 0;
  // Items arriving together are staggered in document order by the share the earlier one finishes — but never delayed more than .35s
  function batch(list) {
    const now = performance.now();
    list.sort(order).forEach((el) => { const s = Math.max(now, Math.min(queueEnd, now + 350)); queueEnd = s + run(el, s - now); });
  }
  // data-seq group — when the group is visible, the inner elements play once, timed to data-at (ms)
  function seq(box) {
    box.classList.add("fx-on");
    const now = performance.now();
    let end = now;
    box.querySelectorAll("[data-fx]").forEach((el) => { const at = parseFloat(el.dataset.at) || 0; end = Math.max(end, now + at + run(el, at)); });
    queueEnd = Math.max(queueEnd, end);
  }
  RI.fxRun = run;
  RI.fxSeq = seq;
  const manual = (el) => el.classList.contains("fx-on") || el.closest("[data-fx-manual]");
  let io;
  function startFx() {
    document.querySelectorAll("[data-fx]").forEach(prep);
    if (reduced || !("IntersectionObserver" in window)) { document.querySelectorAll("[data-fx], [data-seq]").forEach((e) => e.classList.add("fx-on")); return; }
    io = new IntersectionObserver((es) => {
      const list = [];
      es.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target); if (e.target.hasAttribute("data-seq")) seq(e.target); else if (!manual(e.target)) list.push(e.target); });
      if (list.length) batch(list);
    }, { rootMargin: "0px 0px -2% 0px" });
    document.querySelectorAll("[data-seq]").forEach((e) => !manual(e) && io.observe(e));
    document.querySelectorAll("[data-fx]").forEach((e) => !manual(e) && !e.parentElement.closest("[data-seq]") && io.observe(e));
    // On reaching the very bottom, turn on everything left (so a short last section doesn’t miss the -2% threshold)
    addEventListener("scroll", () => {
      if (scrollY + innerHeight < root.scrollHeight - 4) return;
      const left = [...document.querySelectorAll("[data-fx]:not(.fx-on)")].filter((n) => { if (manual(n) || n.parentElement.closest("[data-seq]:not(.fx-on)")) return false; const r = n.getBoundingClientRect(); return r.height > 0 && r.top < innerHeight && r.bottom > 0; });
      left.forEach((n) => io.unobserve(n));
      if (left.length) batch(left);
    }, { passive: true });
  }

  /* ---------- Rolling-swap text ---------- */
  function roll(el) {
    if (el.__roll) return;
    el.__roll = 1;
    const t = el.textContent, box = span("ri-roll");
    const make = (c) => { const s = span(c); [...t].forEach((ch, i) => { const g = span(); g.textContent = ch; g.style.setProperty("--i", i); s.append(g); }); return s; };
    const b = make("ri-roll-b");
    b.setAttribute("aria-hidden", "true");
    box.append(make("ri-roll-a"), b);
    el.textContent = "";
    el.append(box);
  }
  document.querySelectorAll("[data-roll]").forEach(roll);

  /* ---------- Smooth wheel ---------- */
  const wheel = { on: !reduced && fine, y: scrollY, target: scrollY, moving: false };
  const maxY = () => Math.max(0, root.scrollHeight - innerHeight);
  RI.scrollTo = (y, instant) => { y = clamp(y, 0, maxY()); if (!wheel.on || instant) { wheel.moving = false; scrollTo(0, y); return; } if (!wheel.moving) wheel.y = scrollY; wheel.target = y; wheel.moving = true; };
  if (wheel.on) {
    root.classList.add("ri-smooth");
    addEventListener("wheel", (e) => {
      if (e.ctrlKey || root.classList.contains("ri-covered")) { if (root.classList.contains("ri-covered")) e.preventDefault(); return; }
      if (document.body.style.overflow === "hidden" || e.target.closest?.("dialog,[data-native-scroll]")) return;
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 32; else if (e.deltaMode === 2) d *= innerHeight;
      if (Math.abs(e.deltaX) > Math.abs(d)) return;
      e.preventDefault();
      if (!wheel.moving) wheel.y = wheel.target = scrollY;
      wheel.target = clamp(wheel.target + d, 0, maxY());
      wheel.moving = true;
    }, { passive: false });
    addEventListener("scroll", () => { if (wheel.moving) { if (Math.abs(scrollY - wheel.y) > 4) { wheel.moving = false; wheel.y = wheel.target = scrollY; } } else wheel.y = wheel.target = scrollY; }, { passive: true });
    RI.ticks.add((dt) => {
      if (!wheel.moving) return false;
      wheel.y += (wheel.target - wheel.y) * (1 - Math.exp(-7.5 * dt));
      if (Math.abs(wheel.target - wheel.y) < 0.4) { wheel.y = wheel.target; wheel.moving = false; }
      scrollTo(0, wheel.y);
      return wheel.moving;
    });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const t = a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    RI.scrollTo(t.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(t).scrollMarginTop) || 0));
    // As in the original, leave the hash in the address and move focus to the target section — if focus stays on a button, the header can’t hide via focus-within
    history.pushState(null, "", a.getAttribute("href"));
    if (!t.matches("a, button, input, textarea, select, [tabindex]")) t.setAttribute("tabindex", "-1");
    t.focus({ preventScroll: true });
  });

  /* ---------- Header ---------- */
  const bar = document.querySelector(".studio-header"), menu = document.querySelector(".studio-menu");
  let lastY = scrollY, raf = 0;
  const onScroll = () => {
    raf = 0;
    const y = scrollY;
    bar?.classList.toggle("is-scrolled", y > 24);
    if (y < 160 || y < lastY - 6) bar?.classList.remove("is-hidden");
    else if (y > lastY + 6 && !menu?.open && page !== "home") bar?.classList.add("is-hidden");
    if (Math.abs(y - lastY) > 6 || y < 160) lastY = y;
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();
  const toggle = document.querySelector(".studio-menu-toggle");
  toggle?.addEventListener("click", () => { menu.showModal(); toggle.setAttribute("aria-expanded", "true"); });
  menu?.querySelector(".studio-menu-close").addEventListener("click", () => menu.close());
  menu?.addEventListener("close", () => toggle.setAttribute("aria-expanded", "false"));
  menu?.addEventListener("click", (e) => { if (e.target === menu) menu.close(); });
  document.querySelector(".studio-top")?.addEventListener("click", () => RI.scrollTo(0));
  const themeBtn = document.querySelector(".studio-theme");
  themeBtn?.addEventListener("click", () => {
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    localStorage.setItem("ri-theme", dark ? "dark" : "light");
    themeBtn.setAttribute("aria-pressed", String(dark));
    dispatchEvent(new CustomEvent("ri:theme"));
  });
  // Logo eyes (Home also has the thought-section symbol eyes) — pupils are offset from center, and the eyes turn toward the cursor (following with 1−e^(−16·dt))
  const eyes = [...document.querySelectorAll(".studio-brand-icon .eye, .c2n-thinking-symbol .eye")].map((el) => ({ el, svg: el.ownerSVGElement, x: +el.dataset.cx, y: +el.dataset.cy, a: 0, t: 0 }));
  if (fine && !reduced && eyes.length) {
    const pt = eyes[0].svg.createSVGPoint();
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      eyes.forEach((o) => {
        const m = o.svg.getScreenCTM();
        if (!m) return;
        pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(m.inverse());
        let d = Math.atan2(p.y - o.y, p.x - o.x) - o.a; d -= Math.PI * 2 * Math.round(d / (Math.PI * 2)); o.t = o.a + d;
      });
    }, { passive: true });
    RI.ticks.add((dt) => { eyes.forEach((o) => { o.a += (o.t - o.a) * (1 - Math.exp(-16 * dt)); o.el.setAttribute("transform", `rotate(${((o.a * 180) / Math.PI).toFixed(2)} ${o.x} ${o.y})`); }); return true; });
  }

  /* ---------- Lens — over a work photo a white eye circle (difference blend) follows the cursor, and the photo springs to 1.065x and shifts 14px away from the cursor ---------- */
  const LENS = ".project-card-image, .ab-work-frame";
  if (fine && !reduced && document.querySelector(LENS)) {
    const lens = document.createElement("div");
    lens.className = "ri-lens";
    lens.setAttribute("aria-hidden", "true");
    lens.innerHTML = '<svg class="ri-lens-face" viewBox="0 0 112 112"><circle class="ri-lens-disc" cx="56" cy="56" r="56"/><circle class="ri-lens-ring" cx="56" cy="56" r="17"/><circle class="ri-lens-dot" cx="56" cy="56" r="4.5"/></svg>';
    document.body.append(lens);
    const springs = new Map(), m = { x: 0, y: 0, on: false }, L = { x: 0, y: 0, shown: false };
    let host = null;
    const spring = (el) => { let s = springs.get(el); if (!s) { const img = el.querySelector(".ph"); if (!img) return null; s = { img, s: 1, vs: 0, x: 0, vx: 0, y: 0, vy: 0 }; springs.set(el, s); img.style.transition = "none"; } return s; };
    addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; m.x = e.clientX; m.y = e.clientY; m.on = true; }, { passive: true });
    document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) m.on = false; });
    RI.ticks.add((dt) => {
      const el = m.on ? document.elementFromPoint(m.x, m.y)?.closest(LENS) : null;
      if (el !== host) { host?.classList.remove("is-lens-target"); host = el; host?.classList.add("is-lens-target"); if (host) spring(host); }
      if (host && !L.shown) { L.x = m.x; L.y = m.y; L.shown = true; lens.classList.add("is-visible"); }
      if (!host && L.shown) { L.shown = false; lens.classList.remove("is-visible"); }
      if (L.shown) { const k = 1 - Math.exp(-25 * dt); L.x += (m.x - L.x) * k; L.y += (m.y - L.y) * k; lens.style.transform = `translate3d(${L.x.toFixed(2)}px,${L.y.toFixed(2)}px,0)`; }
      springs.forEach((s, el) => {
        let S = 1, X = 0, Y = 0;
        if (el === host) { const r = el.getBoundingClientRect(), cx = Math.max(-1, Math.min(1, ((m.x - r.left) / r.width) * 2 - 1)), cy = Math.max(-1, Math.min(1, ((m.y - r.top) / r.height) * 2 - 1)); S = 1.065; X = -cx * 14; Y = -cy * 14 * 0.75; }
        s.vs += ((S - s.s) * 210 - s.vs * 17) * dt; s.s += s.vs * dt;
        s.vx += ((X - s.x) * 90 - s.vx * 15) * dt; s.x += s.vx * dt;
        s.vy += ((Y - s.y) * 90 - s.vy * 15) * dt; s.y += s.vy * dt;
        const rest = Math.abs(s.s - S) < 4e-4 && Math.abs(s.vs) < 0.002 && Math.abs(s.x - X) < 0.05 && Math.abs(s.y - Y) < 0.05 && Math.abs(s.vx) + Math.abs(s.vy) < 0.05;
        if (rest && S === 1 && el !== host) { s.img.style.transform = ""; s.img.style.transition = ""; springs.delete(el); return; }
        s.img.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) scale(${s.s.toFixed(4)})`;
      });
      return true;
    });
  }

  /* ---------- Photo parallax · scroll tilt ---------- */
  // Parallax — moves only the offset share from the initial position (scroll 0), follows with 1−e^(−8·dt) and snaps when within .3px
  const para = [...document.querySelectorAll("[data-parallax]")].map((el) => ({ el, inFrame: el.dataset.parallax === "img", speed: parseFloat(el.dataset.parallax) || 0, offset: 0, target: 0 }));
  const skews = [...document.querySelectorAll("[data-skew]")];
  const vel = { y: scrollY, v: 0, shown: 0 };
  if (!reduced && (para.length || skews.length)) RI.ticks.add((dt) => {
    const h = innerHeight, sy = scrollY, ease = 1 - Math.exp(-8 * dt);
    para.forEach((p) => {
      const r = (p.inFrame ? p.el.parentElement : p.el).getBoundingClientRect();
      if (r.bottom < -h * 0.25 || r.top > h * 1.25) return;
      const top = r.top - (p.inFrame ? 0 : p.offset), span = h / 2 + r.height / 2;
      const now = clamp((top + r.height / 2 - h / 2) / span, -1, 1), docTop = top + sy, base = docTop < h ? clamp((docTop + r.height / 2 - h / 2) / span, -1, 1) : 0;
      p.target = p.inFrame ? -(now - base) * 0.065 * r.height : (now - base) * p.speed * h;
      const d = p.target - p.offset;
      if (Math.abs(d) < 0.05) return;
      p.offset = Math.abs(d) < 0.3 ? p.target : p.offset + d * ease;
      p.el.style.translate = `0 ${p.offset.toFixed(2)}px`;
    });
    if (skews.length) {
      const y = scrollY, v = (y - vel.y) / Math.max(dt, 1 / 240);
      vel.y = y;
      vel.v += (v - vel.v) * (1 - Math.exp(-7 * dt));
      const s = Math.round(clamp(vel.v * 0.0012, -2.4, 2.4) * 100) / 100;
      if (s !== vel.shown) { vel.shown = s; skews.forEach((el) => (el.style.transform = s ? `skewY(${s}deg)` : "")); }
    }
    return true;
  });

  // One beat — keeps turning even when registered items are idle (value is small, so no load)
  let last = 0;
  const loop = (t) => { const dt = last ? Math.min((t - last) / 1000, 0.05) : 1 / 60; last = t; RI.ticks.forEach((f) => f(dt)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  /* ---------- Transition Curtain ---------- */
  let curtain, label, note;
  function makeCurtain() {
    if (curtain) return;
    curtain = document.createElement("div");
    curtain.className = "ri-curtain";
    curtain.setAttribute("aria-hidden", "true");
    curtain.innerHTML = '<div class="ri-curtain-shade"></div><div class="ri-curtain-panel"><div class="ri-curtain-top"><span>Word<span>.</span>Mark</span><span class="ri-curtain-note"></span></div><div class="ri-curtain-main"><span class="ri-curtain-label"></span></div></div>';
    label = curtain.querySelector(".ri-curtain-label");
    note = curtain.querySelector(".ri-curtain-note");
    document.body.append(curtain);
  }
  function name(text) {
    label.textContent = "";
    let em = 0;
    [...text].forEach((ch, i) => { const o = span(), n = span(); n.textContent = ch === " " ? " " : ch; n.style.setProperty("--i", i); o.append(n); label.append(o); em += /[가-힣ぁ-ヿ一-鿿]/.test(ch) ? 0.95 : ch === " " ? 0.28 : 0.6; });
    label.style.setProperty("--em", em.toFixed(2));
    note.textContent = `(${text})`;
  }
  const pageOf = (href) => { const f = new URL(href, location.href).pathname.split("/").pop() || "index.html"; return RI.names[f.replace(/\.html$/, "").replace(/^index$/, "home").replace(/^works$/, "works")] || "Wordmark"; };
  function lift() {
    curtain.classList.add("is-anim", "is-lift");
    curtain.classList.remove("is-cover");
    root.classList.remove("ri-covered");
    setTimeout(() => (curtain.className = "ri-curtain"), 950);
    return wait(160);
  }
  // Page arrived from elsewhere — starts covered, the name stands (.45s wait), leaves, and then the veil lifts. On a first visit (not home), it starts with the name rising up
  RI.arrive = async (held) => {
    const fromNav = sessionStorage.getItem("ri:nav") === "1";
    sessionStorage.removeItem("ri:nav");
    root.classList.remove("ri-arriving");
    if (reduced) return;
    makeCurtain();
    curtain.className = "ri-curtain is-on is-cover";
    root.classList.add("ri-covered");
    name(RI.names[page] || "Wordmark");
    if (fromNav) curtain.classList.add("is-label", "is-label-static");
    await frame2();
    curtain.classList.remove("is-label-static");
    curtain.classList.add("is-label");
    await Promise.all([Promise.race([document.fonts.ready, wait(fromNav ? 450 : 700)]), held]);
    await wait(fromNav ? 40 : 200);
    curtain.classList.add("is-label-out");
    await wait(150);
    return lift();
  };
  let going = false;
  async function go(href) {
    if (going) return;
    going = true;
    sessionStorage.setItem("ri:nav", "1");
    root.classList.add("ri-covered");
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    makeCurtain();
    name(pageOf(href));
    curtain.className = "ri-curtain is-on";
    await frame2();
    curtain.classList.add("is-anim", "is-cover");
    setTimeout(() => curtain.classList.add("is-label"), 240);
    await wait(700);
    location.href = href;
  }
  if (!reduced) document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || (a.target && a.target !== "_self")) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search) || a.getAttribute("href").startsWith("#")) return;
    e.preventDefault();
    go(u.href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && curtain?.classList.contains("is-cover")) { going = false; lift(); } });

  // Start — after the curtain lifts on each page, turn on the text effect. On home, index.js finishes the loader and calls RI.after()
  const after = () => { startFx(); RI.afterCurtain?.(); RI.floatBegin?.(); };
  RI.after = after;
  if (page !== "home") RI.arrive(RI.held).then(after);
})();
