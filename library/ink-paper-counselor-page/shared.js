// Shared across the whole site — header, footer, loader, ink transition, smooth scroll, text reveal, paragraph blur reveal, drawn arrows, round buttons, flower art.
// The original is a single page app (React), so only the body changes during the transition. Here it is a normal navigation, so the ink curtain covers, then the next page is requested, and the new page walks in while still covered.
(() => {
  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth <= 767;
  const EG = (window.EG = { intro: [], ready: false });
  EG.onIntro = (fn) => (EG.ready ? fn() : EG.intro.push(fn));
  const startIntro = () => { if (EG.ready) return; EG.ready = true; EG.intro.splice(0).forEach((f) => f()); };

  // ── Smooth scroll: only on wide screens like the original (1.1s · 2^-10t curve), phones use default scroll
  let lenis = null;
  if (!reduce && !phone() && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  EG.lenis = lenis;
  const lock = (on) => { document.body.classList.toggle("is-locked", on); if (lenis) on ? lenis.stop() : lenis.start(); };
  EG.lock = lock;

  // ── Text splitting (character mask cells inside word chunks) — spaces between words are left as they are
  const splitChars = (el) => {
    if (el._chars) return el._chars;
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
            const w = document.createElement("span"); w.className = "eg-word";
            [...part].forEach((ch) => { const m = document.createElement("span"); m.className = "eg-mask"; const c = document.createElement("span"); c.className = "eg-char"; c.textContent = ch; m.append(c); w.append(m); chars.push(c); });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("br")) walk(n);
      });
    };
    walk(el);
    el.classList.add("is-split");
    return (el._chars = chars);
  };
  const splitWords = (el) => {
    if (el._words) return el._words;
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
            const w = document.createElement("span"); w.className = "eg-tword"; w.textContent = part; frag.append(w); words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("br, svg")) walk(n);
      });
    };
    walk(el);
    el.classList.add("is-split");
    return (el._words = words);
  };
  EG.splitChars = splitChars;
  EG.splitWords = splitWords;

  // Letter entrance: from 110% left inside the mask cell at 1.05s power2.out, spacing min(.085, .8/(n-1))
  EG.charReveal = (el, opts = {}) => {
    const chars = splitChars(el);
    const each = chars.length > 1 ? Math.min(0.085, (opts.span ?? 0.8) / (chars.length - 1)) : 0;
    gsap.set(chars, { autoAlpha: 0, xPercent: -110 });
    return gsap.timeline({ paused: true }).to(chars, { autoAlpha: 1, xPercent: 0, duration: opts.dur ?? 1.05, ease: "power2.out", stagger: each });
  };
  // Paragraph reveal: words grouped into lines, each line .22s later — from 4px blur and .28em below, 1.35s power2.out
  EG.lineReveal = (el) => {
    const words = splitWords(el);
    const lines = [];
    words.forEach((w) => { const top = w.offsetTop, last = lines[lines.length - 1]; if (!last || Math.abs(last.top - top) > 2) lines.push({ top, words: [w] }); else last.words.push(w); });
    gsap.set(words, { autoAlpha: 0, filter: "blur(4px)", y: "0.28em" });
    const tl = gsap.timeline({ paused: true });
    lines.forEach((l, i) => tl.to(l.words, { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 1.35, ease: "power2.out" }, 0.22 * i));
    return tl;
  };

  const bindReveals = () => {
    document.querySelectorAll('[data-reveal="chars"]').forEach((el) => {
      if (el.dataset.revealManual != null) return;
      const tl = EG.charReveal(el);
      if (el.dataset.revealScrub != null) {
        const [s, e] = (el.dataset.revealScrub || "top 55%|top 35%").split("|");
        ScrollTrigger.create({ animation: tl, trigger: el, start: phone() ? "top 52%" : s, end: phone() ? "top 32%" : e, scrub: 1.25 });
      } else ScrollTrigger.create({ trigger: el.closest(".eg-heading") || el, start: "top 88%", once: true, onEnter: () => tl.play() });
    });
    document.querySelectorAll('[data-reveal="words"]').forEach((el) => {
      if (el.dataset.revealManual != null) return;
      const tl = EG.lineReveal(el);
      if (el.dataset.revealScrub != null) {
        const [s, e] = (el.dataset.revealScrub || "top 78%|top 58%").split("|");
        ScrollTrigger.create({ animation: tl, trigger: el, start: s, end: e, scrub: 1.15 });
      } else ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tl.play() });
    });
    // Arrows: beside the title, drawn once on view at 1.7s power3.out, vertical arrows between paragraphs are scroll-bound (1.15) as they draw
    document.querySelectorAll(".eg-arrow").forEach((svg) => {
      const v = svg.classList.contains("eg-arrow--v");
      const from = v ? "inset(0% 0% 100% 0%)" : "inset(0% 100% 0% 0%)";
      const scrub = svg.dataset.draw;
      const tw = gsap.fromTo(svg, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", duration: scrub ? 1 : 1.7, ease: scrub ? "none" : "power3.out", paused: true });
      if (scrub) { const [s, e] = scrub.split("|"); ScrollTrigger.create({ animation: tw, trigger: svg.closest("[data-draw-trigger]") || svg, start: s, end: e, scrub: 1.15 }); }
      else ScrollTrigger.create({ trigger: svg.closest(".eg-heading") || svg, start: "top 88%", once: true, onEnter: () => tw.play() });
    });
    // Photo parallax: scaled up 1.2x and shifted 8% up and down while passing through the cell (.8x on phone)
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const img = box.firstElementChild;
      if (!img) return;
      const y = phone() ? 6.4 : +(box.dataset.parallax || 8), sc = phone() ? 1.16 : 1.2;
      gsap.set(img, { scale: sc, transformOrigin: "center center" });
      gsap.fromTo(img, { yPercent: -y }, { yPercent: y, ease: "none", scrollTrigger: { trigger: box, scrub: true } });
    });
  };
  EG.bindReveals = bindReveals;

  // ── Header logo: two sets per letter — on hover the current letter slides out to the right and the next letter enters from the left (2s, css)
  const buildLogo = (a) => {
    const text = a.textContent.trim();
    a.setAttribute("aria-label", text);
    a.innerHTML = `<span class="eg-logo__text" aria-hidden="true">${[...text].map((ch) => ch === " " ? '<span class="eg-logo__space"></span>' : `<span class="eg-logo__mask"><span class="eg-logo__ch eg-logo__ch--cur">${ch}</span><span class="eg-logo__ch eg-logo__ch--next">${ch}</span></span>`).join("")}</span>`;
  };
  // Letter roll link — original AnimatedLink values (current line .7s sine.inOut, from the last letter within .22s, next line .06s later)
  const buildLink = (a) => {
    const text = a.textContent.trim();
    if (a.getAttribute("aria-current") === "page") a.classList.add("is-current");
    const chars = [...text].map((ch) => `<span class="eg-ch">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
    a.innerHTML = `<span class="eg-link__text" aria-hidden="true"><span class="eg-link__line eg-link__line--cur">${chars}</span><span class="eg-link__line eg-link__line--next">${chars}</span></span><span class="eg-sr">${text}</span>`;
    if (reduce || a.getAttribute("aria-current") === "page") return;
    const cur = a.querySelectorAll(".eg-link__line--cur .eg-ch"), next = a.querySelectorAll(".eg-link__line--next .eg-ch");
    const shown = { x: 0, y: 0, scaleY: 1, autoAlpha: 1, filter: "blur(0px)", transformOrigin: "50% 50%" };
    gsap.set(next, { x: "-0.22em", y: "0.34em", scaleY: 0.35, autoAlpha: 0, filter: "blur(2px)", transformOrigin: "50% 100%" });
    // Header menu in the original revealFromLeft type — the current line blurs out to the right .24em and the next line comes in from left .24em .1s later (.85s, .025s per letter)
    const left = a.closest(".eg-nav");
    let tl;
    if (left) {
      gsap.set(next, { x: "-0.24em", y: 0, scaleY: 1, autoAlpha: 0, filter: "blur(2px)", transformOrigin: "50% 50%" });
      tl = gsap.timeline({ paused: true })
        .to(cur, { x: "0.24em", y: 0, rotation: 0, autoAlpha: 0, filter: "blur(2px)", duration: 0.85, ease: "sine.inOut", stagger: 0.025 }, 0)
        .to(next, { ...shown, duration: 0.85, ease: "sine.inOut", stagger: 0.025 }, 0.1);
    } else {
      const order = { amount: 0.22, from: "end" };
      tl = gsap.timeline({ paused: true })
        .to(cur, { x: "0.32em", y: "-0.55em", scaleY: 0.35, autoAlpha: 0, filter: "blur(2px)", transformOrigin: "50% 0%", duration: 0.7, ease: "sine.inOut", stagger: order }, 0)
        .to(next, { ...shown, duration: 0.7, ease: "sine.inOut", stagger: order }, 0.06);
    }
    a.addEventListener("pointerenter", () => tl.timeScale(1).play());
    a.addEventListener("focus", () => tl.timeScale(1).play());
    a.addEventListener("pointerleave", () => tl.timeScale(1).reverse());
    a.addEventListener("blur", () => tl.timeScale(1).reverse());
  };
  // Round button — takes the spot where the pointer entered as the circle’s center, gets pulled .16× following the pointer while scaling 1.04 (.45s), and the text moves .35× more (.55s). On leave returns in place in .8s · .9s power3.out
  const bindCircle = (b) => {
    const txt = b.querySelector(".eg-circle__text");
    const at = (e) => { const r = b.getBoundingClientRect(); b.style.setProperty("--cx", `${((e.clientX - r.left) / r.width) * 100}%`); b.style.setProperty("--cy", `${((e.clientY - r.top) / r.height) * 100}%`); };
    b.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && at(e));
    if (reduce) return b.addEventListener("pointerleave", at);
    b.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const r = b.getBoundingClientRect(), dx = 0.16 * (e.clientX - (r.left + r.width / 2)), dy = 0.16 * (e.clientY - (r.top + r.height / 2));
      gsap.to(b, { x: dx, y: dy, scale: 1.04, duration: 0.45, ease: "power2.out", overwrite: "auto" });
      gsap.to(txt, { x: 0.35 * dx, y: 0.35 * dy, duration: 0.55, ease: "power2.out", overwrite: "auto" });
    });
    b.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "touch") return;
      at(e);
      gsap.to(b, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power3.out", overwrite: "auto" });
      gsap.to(txt, { x: 0, y: 0, duration: 0.9, ease: "power3.out", overwrite: "auto" });
    });
  };
  // Pressing next makes that menu the current spot right away as in the original (color, underline) — the overlay spreads after that
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a.eg-link[href], a.eg-logo[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    document.querySelectorAll('.eg-nav .eg-link[aria-current="page"]').forEach((l) => l.removeAttribute("aria-current"));
    document.querySelectorAll(`.eg-nav .eg-link[href="${href}"]`).forEach((l) => l.setAttribute("aria-current", "page"));
  }, true);

  // ── Phone menu: Menu ↔ Close letters split up and down, and when the panel opens the MENU title, numbers and item letters rise from below
  const bindMenu = (header) => {
    const btn = header.querySelector(".eg-menu-btn");
    if (!btn) return;
    const words = btn.querySelectorAll(":scope > span");
    words.forEach((w) => { const t = w.dataset.word; w.innerHTML = `<span style="display:inline-flex">${[...t].map((c) => `<span class="eg-mask"><span class="eg-char">${c}</span></span>`).join("")}</span><i></i>`; });
    const [openW, closeW] = words;
    gsap.set(closeW.querySelectorAll(".eg-char"), { yPercent: 110 });
    gsap.set(closeW.querySelector("i"), { scaleX: 0 });
    const nav = header.querySelector(".eg-nav");
    const title = nav.querySelector(".eg-nav__title");
    if (title) splitChars(title);
    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      header.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      lock(open);
      const [out, inn] = open ? [openW, closeW] : [closeW, openW];
      gsap.to(out.querySelectorAll(".eg-char"), { yPercent: -110, duration: 0.45, ease: "power3.in", stagger: 0.03, overwrite: true });
      gsap.to(out.querySelector("i"), { scaleX: 0, duration: 0.45, ease: "power3.inOut", overwrite: true });
      gsap.fromTo(inn.querySelectorAll(".eg-char"), { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.03, delay: 0.2, overwrite: true });
      gsap.fromTo(inn.querySelector("i"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out", delay: 0.3, overwrite: true });
      if (open) {
        const rows = nav.querySelectorAll("li");
        gsap.fromTo(nav, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
        if (title) gsap.fromTo(title._chars, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.04, delay: 0.1 });
        rows.forEach((li, i) => gsap.fromTo(li.querySelectorAll(".eg-nav__num, .eg-ch"), { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.02, delay: 0.2 + 0.08 * i }));
      }
    });
  };

  // ── Footer: fixed behind the body with only the space left empty. While it is revealed, the blur clears line by line
  const bindFooter = () => {
    const f = document.querySelector(".eg-footer"), space = document.querySelector(".eg-footer-space");
    if (!f || !space) return;
    const size = () => { space.style.height = phone() ? "0px" : `${f.offsetHeight}px`; };
    size();
    new ResizeObserver(() => { size(); ScrollTrigger.refresh(); }).observe(f);
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(f.querySelectorAll(".eg-footer__fade"), { autoAlpha: 0, filter: "blur(8px)", y: 30 }, { autoAlpha: 1, filter: "blur(0px)", y: 0, ease: "none", stagger: 0.08, scrollTrigger: { trigger: space, start: "top bottom", end: "bottom bottom", scrub: 1 } });
    });
  };

  // ── Flower art (drawn on a canvas in place of a photo) — grain-lens-image takes it and renders it as a grain plate
  const FLOWERS = {
    tulip: { petal: ["#f6dfe0", "#e9a6a8", "#f07f86"], core: "#5a3424", stem: ["#c9ccb0", "#8d9a6c"] }, /* Not Skin: flower drawing color */
    lily: { petal: ["#fbecee", "#f4b9c3", "#ef6f88"], core: "#b94a3c", stem: ["#d7d3b8", "#9aa477"] }, /* Not Skin: flower drawing color */
    anemone: { petal: ["#eaf3fa", "#8ec6ea", "#3f8fcf"], core: "#e9b48e", stem: ["#c7a69a", "#8e6a62"], second: ["#f8e3e0", "#f39a8f", "#e8584d"] }, /* Not Skin: flower drawing color */
    magnolia: { petal: ["#fffaf7", "#f6e8e2", "#e4cfc6"], core: "#c8703a", stem: ["#c8d1b4", "#7f9466"] }, /* Not Skin: flower drawing color */
  };
  const petal = (c, len, wid, cols, tilt = 0, curl = 0) => {
    const g = c.createLinearGradient(0, 0, 0, -len);
    g.addColorStop(0, cols[2]); g.addColorStop(0.45, cols[1]); g.addColorStop(1, cols[0]);
    c.save(); c.rotate(tilt);
    c.fillStyle = g;
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(-wid, -len * 0.25, -wid * (0.8 + curl), -len * 0.85, 0, -len);
    c.bezierCurveTo(wid * (0.8 - curl), -len * 0.85, wid, -len * 0.25, 0, 0);
    c.fill();
    c.globalAlpha = 0.18; c.strokeStyle = cols[0]; c.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(0, -len * 0.05); c.quadraticCurveTo(i * wid * 0.25, -len * 0.5, i * wid * 0.18, -len * 0.92); c.stroke(); }
    c.restore();
  };
  const stemLine = (c, x0, y0, x1, y1, w, cols, bend = 0) => {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, cols[1]); g.addColorStop(1, cols[0]);
    c.strokeStyle = g; c.lineWidth = w; c.lineCap = "round";
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + bend, (y0 + y1) / 2, x1, y1); c.stroke();
  };
  EG.paintFlower = (cv, kind) => {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height, P = FLOWERS[kind] || FLOWERS.tulip;
    c.clearRect(0, 0, W, H);
    c.filter = "blur(1.2px)";
    if (kind === "magnolia") {
      stemLine(c, W * 0.5, H * 0.62, W * 0.47, H, W * 0.035, P.stem, -W * 0.03);
      c.save(); c.translate(W * 0.47, H * 0.6);
      for (let i = 0; i < 9; i++) petal(c, H * (0.42 + (i % 3) * 0.06), W * 0.2, P.petal, -2.6 + i * 0.62, (i % 2) * 0.3);
      c.fillStyle = P.core;
      for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, r = Math.random() * W * 0.08; c.beginPath(); c.ellipse(Math.cos(a) * r, -H * 0.04 + Math.sin(a) * r * 0.7, W * 0.012, W * 0.03, a, 0, Math.PI * 2); c.fill(); }
      c.restore();
    } else if (kind === "lily") {
      c.save(); c.translate(W * 0.5, H * 0.62);
      for (let i = 0; i < 6; i++) petal(c, H * 0.42, W * 0.11, P.petal, -2.4 + i * 0.95, 0.25);
      c.strokeStyle = P.petal[2]; c.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const a = -2.1 + i * 0.25; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * H * 0.18, Math.sin(a) * H * 0.18); c.stroke(); c.fillStyle = P.core; c.beginPath(); c.ellipse(Math.cos(a) * H * 0.18, Math.sin(a) * H * 0.18, 6, 12, a, 0, Math.PI * 2); c.fill(); }
      c.restore();
    } else if (kind === "anemone") {
      stemLine(c, W * 0.5, H * 0.32, W * 0.46, H, 10, P.stem, W * 0.06);
      stemLine(c, W * 0.6, H * 0.66, W * 0.5, H, 8, P.stem, -W * 0.04);
      c.save(); c.translate(W * 0.5, H * 0.3);
      for (let i = 0; i < 8; i++) petal(c, H * 0.24, W * 0.13, P.petal, i * 0.785, 0.15);
      c.fillStyle = P.core; for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, r = Math.random() * 30; c.fillRect(Math.cos(a) * r, Math.sin(a) * r, 4, 10); }
      c.restore();
      c.save(); c.translate(W * 0.62, H * 0.62); c.globalAlpha = 0.85;
      for (let i = 0; i < 6; i++) petal(c, H * 0.12, W * 0.08, P.second, i * 1.05 + 0.3, 0.2);
      c.restore();
    } else {
      // Tulip: two milky outer petals form a cup, the inside is coral, with a dark stamen column in the center
      stemLine(c, W * 0.5, H * 0.6, W * 0.47, H * 0.98, W * 0.05, P.stem, -W * 0.03);
      const cup = (x0, x1, top, wav, cols) => {
        const g = c.createLinearGradient(0, H * 0.62, 0, H * top);
        g.addColorStop(0, cols[2]); g.addColorStop(0.5, cols[1]); g.addColorStop(1, cols[0]);
        c.fillStyle = g; c.beginPath(); c.moveTo(W * 0.5, H * 0.64);
        c.bezierCurveTo(W * x0, H * 0.6, W * (x0 - 0.04), H * 0.3, W * x0, H * top);
        for (let i = 1; i <= 6; i++) c.quadraticCurveTo(W * (x0 + (x1 - x0) * (i - 0.5) / 6), H * (top - wav * (i % 2 ? 1 : -0.3)), W * (x0 + (x1 - x0) * i / 6), H * top);
        c.bezierCurveTo(W * (x1 + 0.04), H * 0.3, W * x1, H * 0.6, W * 0.5, H * 0.64); c.fill();
      };
      cup(0.14, 0.86, 0.1, 0.02, ["#f3ecea", "#e9d6d3", "#d9c3bf"]); /* Not skin: outer petals */
      cup(0.3, 0.72, 0.24, 0.015, [P.petal[1], P.petal[2], "#e8857e"]); /* Not skin: inner petal coral */
      c.save(); c.translate(W * 0.36, H * 0.6); petal(c, H * 0.36, W * 0.14, ["#f6eedc", "#f0d2b0", "#e9b8a0"], -0.25, 0.1); c.restore(); /* Not skin: front petal */
      const st = c.createLinearGradient(W * 0.47, 0, W * 0.55, 0); st.addColorStop(0, "#3a2214"); st.addColorStop(0.5, "#7a4a2a"); st.addColorStop(1, "#2a160c"); /* Not Skin: Stamen */
      c.fillStyle = st; c.beginPath(); c.ellipse(W * 0.52, H * 0.4, W * 0.04, H * 0.17, 0.04, 0, Math.PI * 2); c.fill();
    }
    c.filter = "none";
  };

  // Draw the flowers before parts attach (before DOMContentLoaded) — drawn late, parts would get an empty canvas
  document.querySelectorAll("canvas[data-flower]").forEach((cv) => { EG.paintFlower(cv, cv.dataset.flower); cv.closest('[data-fx~="grain-lens-image"]')?.dispatchEvent(new Event("fx:repaint")); });
  EG.onIntro(() => document.querySelectorAll('[data-fx~="grain-lens-image"]').forEach((el) => el.dispatchEvent(new Event("fx:start"))));

  // ── Ink curtain and loader — on first visit, after the letter-style loader ends the curtain lifts from the screen center (46% · 44%) over 5.6s sine.inOut, and once past 20% the first section’s entrance runs
  const body = document.body;
  const boot = () => {
    const arrived = document.documentElement.classList.contains("fx-ink-arrived");
    const loader = document.querySelector(".eg-loader");
    document.querySelectorAll(".eg-logo, .eg-footer__logo").forEach(buildLogo);
    document.querySelectorAll(".eg-link").forEach(buildLink);
    document.querySelectorAll(".eg-lang a[aria-current]").forEach((a) => a.classList.add("is-current"));
    document.querySelectorAll(".eg-circle").forEach(bindCircle);
    const header = document.querySelector(".eg-header");
    if (header) bindMenu(header);
    bindFooter();
    bindReveals();
    if (reduce || !loader || arrived) {
      if (loader) loader.remove();
      // When arriving via a transition, the body is already there while the curtain lifts (2.8s) — the original releases scroll about 1.8s into the lift and runs the heading
      gsap.delayedCall(arrived && !reduce ? 0.3 : 0, startIntro);
      return;
    }
    lock(true);
    loader.addEventListener("fx:done", () => {
      body.dispatchEvent(new CustomEvent("fx:ink-play", { detail: { direction: "reveal", dur: 5.6, x: 0.46, y: 0.44, ease: "sine.inOut", edge: 0.08, block: false, seed: Math.random() * 12, onProgress: (p) => p >= 0.2 && startIntro() } }));
      loader.remove();
      lock(false);
    }, { once: true });
  };
  // The part (fx-core) attaches first on DOMContentLoaded, so this runs after it and reads the fx-ink-arrived flag
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else queueMicrotask(boot);
  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
