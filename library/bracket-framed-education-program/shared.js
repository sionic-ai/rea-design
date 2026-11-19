// Shared by all pages: draws the header, burger drawer and footer, and hooks up bracket frames, pill button hover, cursor trail and words, accordion, modal, and a fixed button that hides before the footer.
// Original values: quantum (.42,.1,0,1) · quantum.out (.15,.32,0,1) · burger .4s/.32s · drawer items 40ms apart .8s · button .4s/.8s with .14s delay ·
// Trail 1px, 5-point average, catmull-rom in 5 subdivisions, disappears over .7s after .3s · words 10px ±30px probability .2 at 200~400ms intervals, on for .2s, off over .8s after .8s.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("quantum", "0.42, 0.1, 0, 1");
  CustomEase.create("quantum.out", "0.15, 0.32, 0, 1");
  gsap.defaults({ overwrite: "auto" });

  const page = document.body.dataset.page || "home";
  const home = page === "home" ? "" : "index.html";
  const touch = "ontouchend" in document && matchMedia("(pointer: coarse)").matches;
  const QS = (window.QS = {});

  const hl = (text, cls = "") => `<span class="qs-hl-text ${cls}">${text}<span class="qs-hl-bg" aria-hidden="true"></span></span>`;
  const loop = (text) => `<span class="qs-loop-wrap qs-hl-text"><span class="qs-loop-text"><span class="qs-loop-row"><span>${text}</span><span>${text}</span></span></span><span class="qs-hl-bg" aria-hidden="true"></span></span>`;
  QS.loop = loop;

  const menu = [
    { href: `${home}#about`, label: "Menu 1 About" },
    { href: `${home}#program`, label: "Menu 2 Program", kids: [["detail.html", "0000"], ["detail.html", "0000"]] },
    { href: `${home}#support`, label: "Menu 3 support program info", br: "Menu 3 Support programs<br>Guide", kids: [["guide.html", "0000"]] },
    { href: `${home}#alumni`, label: "Menu 4 Meetup" },
  ];

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.innerHTML = `
      <div class="qs-header-bar" data-graphic="safe">
        <a class="qs-logo" href="index.html" aria-label="Back to start">Name</a>
        <nav class="qs-header-nav" aria-label="Main menu"><ul>
          ${menu.map((m) => `<li><a class="qs-hl" href="${m.href}">${hl(`<span>${m.label}</span>`)}</a></li>`).join("")}
        </ul></nav>
      </div>
      <button class="qs-burger" type="button" aria-label="Open Menu" data-graphic="safe">
        <span class="qs-burger-line"></span><span class="qs-burger-line"></span><span class="qs-burger-line"></span>
      </button>
      <div class="qs-nav" data-slot="menu-drawer" data-graphic="safe">
        <div class="qs-nav-contents">
          <p class="qs-nav-logo"><a href="index.html"><span>Name</span></a></p>
          <ul class="qs-nav-list">
            ${menu.map((m) => `<li class="qs-nav-item"><a class="qs-nav-link" href="${m.href}"><span>${m.br || m.label}</span></a>${
              m.kids ? `<ul class="qs-nav-child">${m.kids.map(([h, t]) => `<li class="qs-nav-child-item"><a href="${h}"><span>→</span><span>${t}</span></a></li>`).join("")}</ul>` : ""
            }</li>`).join("")}
          </ul>
        </div>
        <div class="qs-nav-bg" aria-hidden="true"></div>
      </div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("qs-footer");
    footer.id = "footer";
    footer.innerHTML = `
      <div class="qs-footer-primary">
        <a class="qs-footer-logo" href="index.html" aria-label="Back to start">
          <span class="qs-wordmark"><span class="qs-wordmark-big">Name</span><span class="qs-wordmark-sub">Placeholder Subtitle</span></span>
        </a>
        <div class="qs-footer-nav">
          <ul data-graphic="safe">
            ${menu.map((m) => `<li><a class="qs-hl qs-footer-nav-link" href="${m.href}">${hl(m.label)}</a></li>`).join("")}
          </ul>
          <p class="qs-footer-contact"><b>Contact :</b><span>Your secretariat name here / mail@example.jp</span></p>
        </div>
        <div class="qs-footer-line is-top" aria-hidden="true"></div>
        <div class="qs-footer-line is-bottom" aria-hidden="true"></div>
      </div>
      <div class="qs-footer-secondary">
        <div class="qs-footer-desc">
          <p>Your one line goes here naming the supporting agency and program (short program name slot).</p>
          <p>Placeholder line for the funding program in English.</p>
        </div>
        <ul class="qs-footer-credit" data-graphic="safe"><li><span class="qs-logo-ph">Institution Logo 1</span></li><li><span class="qs-logo-ph">Logo 2</span></li></ul>
        <ul class="qs-footer-sub"><li><a class="qs-hl qs-footer-sub-link" href="#" data-graphic="safe">${hl("Privacy Policy")}</a></li></ul>
        <p class="qs-footer-copy">Copyright © 0000 Name. All rights reserved.</p>
        <p class="qs-pagetop"><a class="qs-hl qs-pagetop-link" href="#top" data-graphic="safe">${loop("← PAGE TOP")}</a></p>
      </div>`;
  }

  document.querySelectorAll("[data-loop]").forEach((el) => {
    el.classList.add("qs-hl", "qs-loop-link");
    el.setAttribute("data-graphic", "safe");
    el.innerHTML = loop(el.dataset.loop);
  });

  // Bracket frame: a thin curve with a dot at the end — a left-right pair on desktop, top-bottom arcs on phone
  const PAREN = { s: [2.2, 16.8], m: [3.8, 40.8], sm: [2.1, 20.5], xs: [0.7, 5.2] };
  const parenSVG = (W, H, flip) => {
    const r = W < 10 ? 3 : 4;
    const a = W - r - 0.5;
    const half = (H - 2 * (r + 0.5)) / 2;
    const ry = half / 0.9;
    const rx = (a - 0.5) / (1 - Math.sqrt(1 - 0.81));
    const top = r + 0.5;
    return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><g${flip ? ` transform="rotate(180 ${W / 2} ${H / 2})"` : ""}>
      <path d="M${a} ${H - top} A ${rx} ${ry} 0 0 1 ${a} ${top}"/><circle cx="${a}" cy="${top}" r="${r}"/></g></svg>`;
  };
  const arcSVG = (flip) => `<svg viewBox="0 0 340 30" preserveAspectRatio="none" aria-hidden="true"><g${flip ? ' transform="rotate(180 170 15)"' : ""}>
      <path d="M0 26.5 Q170 -26 340 26.5"/></g></svg><i class="qs-arc-dot"></i>`;
  document.querySelectorAll("[data-paren]").forEach((el) => {
    const [w, h] = PAREN[el.dataset.paren] || PAREN.s;
    el.classList.add("qs-paren");
    el.style.setProperty("--pw", `${w}rem`);
    el.style.setProperty("--ph", `${h}rem`);
    const W = w * 10, H = h * 10;
    el.insertAdjacentHTML("afterbegin",
      `<span class="qs-paren-l">${parenSVG(W, H, false)}</span><span class="qs-paren-r">${parenSVG(W, H, true)}</span>` +
      (el.dataset.paren === "xs" ? "" : `<span class="qs-paren-t">${arcSVG(false)}</span><span class="qs-paren-b">${arcSVG(true)}</span>`));
  });

  // Pill button: just write the text and it fills in the arrow line, the clone and the background
  const iconChild = (cls) => `<span class="qs-btn-icon-child ${cls}"><span class="qs-btn-line"></span><span class="qs-btn-shape"></span></span>`;
  document.querySelectorAll(".qs-btn").forEach((b) => {
    const text = b.textContent.trim();
    b.setAttribute("data-graphic", "safe");
    b.innerHTML = `<span class="qs-btn-icon" aria-hidden="true">${iconChild("is-original")}${b.classList.contains("is-disabled") ? "" : iconChild("is-clone")}</span>
      <span class="qs-btn-text">${text}</span><span class="qs-btn-bg" aria-hidden="true"></span>`;
  });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduced || touch) return;

    const offs = [];
    document.querySelectorAll(".qs-btn:not(.is-disabled)").forEach((b) => {
      const o = b.querySelector(".is-original"), ol = o.querySelector(".qs-btn-line"), os = o.querySelector(".qs-btn-shape");
      const c = b.querySelector(".is-clone"), cl = c.querySelector(".qs-btn-line"), cs = c.querySelector(".qs-btn-shape");
      const all = [o, ol, os, c, cl, cs];
      const d = 0.14;
      let busy = false;
      const enter = () => {
        b.classList.add("is-hover");
        if (busy) return;
        busy = true;
        all.forEach((t) => gsap.killTweensOf(t));
        gsap.set(ol, { scaleX: 1, transformOrigin: "right center" });
        gsap.set(o, { x: 0, opacity: 1 });
        gsap.set(os, { opacity: 1 });
        gsap.set(cl, { scaleX: 1 });
        gsap.set(c, { x: 0, width: "0%" });
        gsap.set(cs, { opacity: 0 });
        gsap.to(o, { x: 20, duration: 0.4, ease: "quantum" });
        gsap.to(o, { opacity: 0, duration: 0.4, ease: "power1.out", overwrite: false });
        gsap.to(ol, { scaleX: 0, duration: 0.4, ease: "quantum" });
        gsap.to(os, { opacity: 0, duration: 0.2, ease: "power1.out" });
        gsap.fromTo(cs, { opacity: 0 }, { opacity: 1, duration: 0.1, delay: d, ease: "power1.out" });
        gsap.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: d, ease: "power1.out", overwrite: false });
        gsap.fromTo(c, { x: -30, width: "0%" }, { x: 0, width: "100%", duration: 0.8, delay: d, ease: "quantum.out", overwrite: false });
        gsap.delayedCall(0.8, () => (busy = false));
      };
      const leave = () => b.classList.remove("is-hover");
      b.addEventListener("mouseenter", enter);
      b.addEventListener("mouseleave", leave);
      offs.push(() => { b.removeEventListener("mouseenter", enter); b.removeEventListener("mouseleave", leave); });
    });

    const stopGraphic = startGraphic();
    return () => { offs.forEach((f) => f()); stopGraphic(); };
  });

  // Cursor trail and words — like the original, one Konva stage with two layers: trail layer and word layer. Color and typeface are read from skin variables
  function startGraphic() {
    if (typeof Konva === "undefined") return () => {};
    const box = document.createElement("div");
    box.className = "qs-graphic";
    box.id = "graphic";
    box.setAttribute("aria-hidden", "true");
    document.body.append(box);
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--kf-ink-soft").trim() || css.getPropertyValue("--kf-ink").trim();
    const face = css.getPropertyValue("--kf-font-sans").trim();
    const WORDS = ["Term", "Word one", "Your term here", "Field term Two", "Short words", "Slightly long term slot", "Term Three", "Theory name here", "Device Name", "Phenomenon name four",
      "Tech Terms", "Unit name", "Principle name here", "Your word here", "Five Concepts", "Experiment name", "Six slots for long field terms", "Symbol", "Model name", "Law Name Slot"];
    const stage = new Konva.Stage({ container: box, width: box.clientWidth, height: box.clientHeight });
    const trailLayer = new Konva.Layer(), textLayer = new Konva.Layer();
    stage.add(trailLayer);
    stage.add(textLayer);

    // Trail: joins control points picked by a 5-point average with catmull-rom 5-subdivision lines, and each line fades out after .3s over .7s power2.out
    const T = { segs: [], tw: new Map(), ctrl: [], buf: [], last: null, move: null, dy: 0, spawn: { v: 1 } };
    const cr = (p0, p1, p2, p3, t) => {
      const t2 = t * t, t3 = t2 * t;
      return {
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    };
    const dropSeg = (line) => {
      const i = T.segs.indexOf(line);
      if (i !== -1) T.segs.splice(i, 1);
      const p = T.tw.get(line);
      if (p) gsap.killTweensOf(p);
      T.tw.delete(line);
      line.destroy();
    };
    const addSeg = (pts) => {
      const a = T.spawn.v;
      const line = new Konva.Line({ points: pts, stroke: ink, strokeWidth: 1, lineCap: "round", lineJoin: "round", opacity: a });
      trailLayer.add(line);
      T.segs.push(line);
      const p = { o: a };
      T.tw.set(line, p);
      gsap.to(p, { o: 0, duration: 0.7, delay: 0.3, ease: "power2.out", onUpdate: () => { line.opacity(p.o); trailLayer.batchDraw(); }, onComplete: () => dropSeg(line) });
      if (T.segs.length > 512) dropSeg(T.segs[0]);
    };
    const drawLatest = () => {
      const n = T.ctrl.length;
      if (n < 2) return;
      const p0 = T.ctrl[Math.max(0, n - 3)], p1 = T.ctrl[n - 2], p2 = T.ctrl[n - 1];
      const pts = [p1.x, p1.y];
      for (let i = 1; i <= 5; i++) { const q = cr(p0, p1, p2, p2, i / 5); pts.push(q.x, q.y); }
      addSeg(pts);
      if (T.ctrl.length > 32) T.ctrl = T.ctrl.slice(-4);
    };
    const flush = () => {
      const dy = T.dy, mv = T.move;
      T.dy = 0; T.move = null;
      if (dy) {
        T.segs.forEach((l) => { const p = l.points(); for (let i = 1; i < p.length; i += 2) p[i] -= dy; l.points(p); });
        T.ctrl = T.ctrl.map((p) => ({ x: p.x, y: p.y - dy }));
        T.buf = T.buf.map((p) => ({ x: p.x, y: p.y - dy }));
        if (T.ctrl.length && T.last) {
          T.buf = [T.last];
          T.ctrl.push(T.last);
          const keep = T.spawn.v;
          T.spawn.v = 0; drawLatest(); T.spawn.v = keep;
        }
      }
      if (mv) {
        T.buf.push(mv);
        if (T.buf.length > 5) T.buf.shift();
        const s = T.buf.reduce((o, p) => ({ x: o.x + p.x, y: o.y + p.y }), { x: 0, y: 0 });
        T.ctrl.push({ x: s.x / T.buf.length, y: s.y / T.buf.length });
        drawLatest();
      }
      if (dy || mv) trailLayer.batchDraw();
    };
    let raf = 0;
    const loop = () => { flush(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    // Words: probability .2 · every 200~400ms a 10px word appears within ±30px of the cursor in .2s, then disappears over .8s after .8s
    const W = { texts: [], tw: new Map(), on: true, lastAt: 0, gap: 0 };
    const spawnWord = (x, y) => {
      const t = new Konva.Text({ x: x + (Math.random() * 2 - 1) * 30, y: y + (Math.random() * 2 - 1) * 30, text: WORDS[(Math.random() * WORDS.length) | 0], fontFamily: face, fontStyle: "500", fontSize: 10, fill: ink, opacity: 0 });
      t.x(t.x() - t.width() / 2);
      textLayer.add(t);
      W.texts.push(t);
      const p = { o: 0 };
      W.tw.set(t, p);
      gsap.to(p, { o: 1, duration: 0.2, ease: "power2.out", onUpdate: () => { t.opacity(p.o); textLayer.batchDraw(); }, onComplete: () => {
        gsap.to(p, { o: 0, duration: 0.8, delay: 0.8, ease: "power2.out", onUpdate: () => { t.opacity(p.o); textLayer.batchDraw(); }, onComplete: () => {
          const i = W.texts.indexOf(t);
          if (i !== -1) W.texts.splice(i, 1);
          W.tw.delete(t);
          t.destroy();
        } });
      } });
    };
    const clearAll = () => {
      T.tw.forEach((p) => gsap.killTweensOf(p)); T.tw.clear(); T.segs.forEach((l) => l.destroy()); T.segs = []; trailLayer.batchDraw();
      W.tw.forEach((p) => gsap.killTweensOf(p)); W.tw.clear(); W.texts.forEach((t) => t.destroy()); W.texts = []; textLayer.batchDraw();
    };

    let prevY = scrollY, safe = false;
    const onMove = (e) => {
      T.move = { x: e.clientX, y: e.clientY };
      T.last = T.move;
      if (safe || !W.on || Math.random() > 0.2 || Date.now() - W.lastAt < W.gap) return;
      W.lastAt = Date.now();
      W.gap = 200 + Math.random() * 200;
      spawnWord(e.clientX, e.clientY);
    };
    const onScroll = () => {
      const dy = scrollY - prevY;
      prevY = scrollY;
      T.dy += dy;
      W.texts.forEach((t) => t.y(t.y() - dy));
      textLayer.batchDraw();
    };
    const enterSafe = () => {
      if (safe) return;
      safe = true; W.on = false;
      gsap.killTweensOf(T.spawn); gsap.to(T.spawn, { v: 0, duration: 0.2, ease: "power2.out" });
      gsap.killTweensOf(box); gsap.to(box, { opacity: 0, duration: 0.2, onComplete: clearAll });
    };
    const leaveSafe = () => {
      if (!safe) return;
      safe = false; W.on = true;
      gsap.killTweensOf(T.spawn); gsap.to(T.spawn, { v: 1, duration: 0.2, ease: "power2.out" });
      gsap.killTweensOf(box); gsap.to(box, { opacity: 1, duration: 0.2 });
    };
    const ro = new ResizeObserver(() => { const w = box.clientWidth, h = box.clientHeight; if (w > 0 && h > 0) stage.size({ width: w, height: h }); });
    ro.observe(box);

    const safeEls = [...document.querySelectorAll('[data-graphic="safe"]')];
    addEventListener("mousemove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", enterSafe);
    document.addEventListener("mouseenter", leaveSafe);
    safeEls.forEach((el) => { el.addEventListener("mouseenter", enterSafe); el.addEventListener("mouseleave", leaveSafe); });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", onMove);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", enterSafe);
      document.removeEventListener("mouseenter", leaveSafe);
      safeEls.forEach((el) => { el.removeEventListener("mouseenter", enterSafe); el.removeEventListener("mouseleave", leaveSafe); });
      gsap.killTweensOf(box); gsap.killTweensOf(T.spawn);
      clearAll(); ro.disconnect(); stage.destroy(); box.remove();
    };
  }

  // Burger drawer: closes on scrolling past 100px, tapping outside, or Esc
  const burger = document.querySelector(".qs-burger"), nav = document.querySelector(".qs-nav");
  if (burger && nav) {
    let open = false, y0 = 0;
    nav.querySelectorAll(".qs-nav-logo, .qs-nav-item, .qs-nav-child-item").forEach((el, i) => {
      el.querySelector("a").style.setProperty("--index", i);
    });
    const onScroll = () => Math.abs(scrollY - y0) >= 100 && close();
    const onDoc = (e) => !nav.contains(e.target) && !burger.contains(e.target) && close();
    const show = () => {
      if (open) return;
      open = true; y0 = scrollY;
      burger.setAttribute("aria-label", "Close Menu");
      burger.classList.add("is-active"); nav.classList.add("is-active");
      addEventListener("scroll", onScroll, { passive: true });
      setTimeout(() => document.addEventListener("click", onDoc));
    };
    const close = () => {
      if (!open) return;
      open = false;
      burger.setAttribute("aria-label", "Open Menu");
      burger.classList.remove("is-active"); nav.classList.remove("is-active");
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onDoc);
    };
    burger.addEventListener("click", () => (open ? close() : show()));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  document.querySelectorAll("[aria-controls].qs-acc-btn").forEach((b) => {
    const frame = document.getElementById(b.getAttribute("aria-controls"));
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(on));
      on ? frame.removeAttribute("hidden") : frame.setAttribute("hidden", "");
    });
  });

  const modal = document.querySelector(".qs-modal");
  if (modal) {
    const container = modal.querySelector(".qs-modal-container");
    const contents = modal.querySelector(".qs-modal-contents");
    // Original: on open and on resize, feeds cell width, content width and content height as variables to place the close button
    const measure = () => {
      modal.style.setProperty("--modal-width", `${container.clientWidth}px`);
      modal.style.setProperty("--modal-contents-width", `${contents.clientWidth}px`);
      modal.style.setProperty("--modal-contents-height", `${contents.clientHeight}px`);
    };
    let ro = null;
    const set = (on) => {
      if (on) { measure(); ro = new ResizeObserver(measure); ro.observe(modal); } else { ro?.disconnect(); ro = null; }
      modal.classList.toggle("is-active", on);
      document.body.style.overflow = on ? "hidden" : "";
      if (on) container.scrollTo(0, 0);
    };
    document.querySelectorAll("[data-modal-trigger]").forEach((t) => t.addEventListener("click", () => set(true)));
    modal.addEventListener("click", () => set(false));
    modal.querySelector(".qs-modal-contents").addEventListener("click", (e) => e.stopPropagation());
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  QS.hideAtFooter = (sel) => {
    const el = document.querySelector(sel);
    if (!el || !footer) return;
    ScrollTrigger.create({ trigger: footer, start: "top bottom", onEnter: () => el.classList.add("is-hidden"), onLeaveBack: () => el.classList.remove("is-hidden") });
  };
})();
