// First page motion — original values (where GSAP default .5s·power1.out is left as is, it stays)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const canvas = document.getElementById("canvas");
  // Value object read by the 3D bottle — original defaults. bottle3d.js loads after and draws with these values
  window.sdBottle = { state: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, innerRx: 0, orientation: 0, bottle: "ps", rotation: 0, smScale: 1, mdScale: 1, footer: 0, fadedZ: -10 } };
  const F = window.sdBottle.state;
  // three (2MB) and the bottle load after the loader finishes — loading them together at first stalls the GSAP clock and the loader starts over 1s late (the original also gets its model file late)
  let loading3d = false;
  const wake = () => {
    if (loading3d) return;
    loading3d = true;
    const add = (src, done) => { const s = document.createElement("script"); s.src = src; s.onload = done; document.body.append(s); };
    window.exports = {};
    add("../_vendor/three@0.178.0/build/three.cjs", () => {
      window.THREE = window.exports;
      add("bottle3d.js", () => window.sdBottle.start && window.sdBottle.start());
    });
  };
  const ns = "http://www.w3.org/2000/svg";

  // ── Drawing (original illustration spot): redraw a line drawing in the same spot and size
  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    parent.append(n);
    return n;
  };
  const label = (svg, x, y, t, anchor = "start") => { svgEl("text", { x, y, "text-anchor": anchor }, svg).textContent = t; };
  const mesh = q(".sd-illust--mesh");
  if (mesh) {
    // Wavy mesh plate — stands in for the original’s absorption and softness mesh pictures
    const P = (i, j) => [150 + j * 26 + i * 15, 200 + i * 20 - 70 * Math.sin((j / 20) * Math.PI * 1.4 + i * 0.18) * (1 - i / 22)];
    for (let i = 0; i <= 14; i++) svgEl("polyline", { "data-line": "", points: Array.from({ length: 21 }, (_, j) => P(i, j).join(",")).join(" ") }, mesh);
    for (let j = 0; j <= 20; j += 2) svgEl("polyline", { "data-line": "", points: Array.from({ length: 15 }, (_, i) => P(i, j).join(",")).join(" ") }, mesh);
    label(mesh, 690, 150, "Label 1");
    label(mesh, 120, 600, "Label 2");
  }
  const coil = q(".sd-illust--coil");
  if (coil) {
    // Overlapping rings — spot for the original’s spring graphic
    for (let i = 0; i < 16; i++) svgEl("ellipse", { "data-line": "", cx: 270 + Math.sin(i * 0.5) * 18, cy: 120 + i * 34, rx: 170 - Math.abs(i - 8) * 4, ry: 42 }, coil);
    label(coil, 460, 90, "Label 1");
    label(coil, 400, 700, "Label 2", "end");
  }
  const radar = q(".sd-illust--radar");
  if (radar) {
    // Seven-way spider web chart — graphic slot for the original’s no-additives items
    const cx = 382, cy = 360, R = 250, n = 7;
    const pt = (k, r) => [cx + r * Math.sin((k / n) * Math.PI * 2), cy - r * Math.cos((k / n) * Math.PI * 2)];
    [1, 0.75, 0.5, 0.25].forEach((f) => svgEl("polygon", { "data-line": "", points: Array.from({ length: n }, (_, k) => pt(k, R * f).join(",")).join(" ") }, radar));
    for (let k = 0; k < n; k++) {
      svgEl("line", { "data-line": "", x1: cx, y1: cy, x2: pt(k, R)[0], y2: pt(k, R)[1] }, radar);
      const [lx, ly] = pt(k, R + 34);
      label(radar, lx, ly, `Label ${k + 1}`, lx < cx - 10 ? "end" : lx > cx + 10 ? "start" : "middle");
    }
    svgEl("polygon", { "data-line": "", points: Array.from({ length: n }, (_, k) => pt(k, R * (0.3 + ((k * 37) % 5) * 0.12)).join(",")).join(" ") }, radar);
    svgEl("circle", { "data-line": "", cx, cy, r: 8 }, radar);
  }
  // Scent pyramid — top, middle and bottom bands and the scent name lines on the right
  qa(".sd-scent").forEach((svg) => {
    const bands = [["TOP", 58, 0.62], ["MIDDLE", 108, 0.78], ["BOTTOM", 160, 0.94]];
    let prev = 8;
    bands.forEach(([name, y, a], i) => {
      const half = (yy) => ((yy - 8) / 152) * 90;
      svgEl("polygon", { points: `${90 - half(prev)},${prev} ${90 + half(prev)},${prev} ${90 + half(y)},${y} ${90 - half(y)},${y}`, fill: "currentColor", opacity: a * 0.35 }, svg);
      const t = svgEl("text", { x: 90, y: (prev + y) / 2 + 4, "text-anchor": "middle", fill: "currentColor" }, svg);
      t.textContent = name;
      svgEl("line", { x1: 90 + half(y) - 4, y1: y - 4, x2: 382, y2: y - 4, stroke: "currentColor", "stroke-width": 1, opacity: 0.6 }, svg);
      const r = svgEl("text", { x: 382, y: y - 12, "text-anchor": "end", fill: "currentColor" }, svg);
      r.textContent = ["Scent 1 · Scent 2 · Scent 3", "Scent 4 · Scent 5 · Scent 6", "Scent 7 · Scent 8 · Scent 9"][i];
      prev = y;
    });
  });

  // ── Interaction response (still used with reduced motion)
  // FAQ — on open, set the open flag then animate height 0→auto, on close, animate height →0 then clear the open flag (.3s, GSAP default curve)
  qa(".sd-faq__item").forEach((item) => {
    const content = q(".sd-faq__content", item);
    let tl;
    q("summary", item).addEventListener("click", (e) => {
      e.preventDefault();
      if (tl) tl.kill();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.3;
      if (item.open) tl = gsap.timeline().to(content, { height: 0, duration: reduce }).call(() => { item.open = false; }).call(() => ScrollTrigger.refresh());
      else tl = gsap.timeline().call(() => { item.open = true; }).to(content, { height: "auto", duration: reduce }).call(() => ScrollTrigger.refresh());
    });
  });

  // Usage and scent-blend window — opacity and the backdrop (--progress) together in .5s
  qa("[data-modal]").forEach((btn) => {
    const dlg = document.getElementById(`modal-${btn.dataset.modal}`);
    if (!dlg) return;
    btn.addEventListener("click", () => {
      dlg.showModal();
      gsap.killTweensOf(dlg);
      gsap.to(dlg, { opacity: 1, "--progress": 1, duration: 0.5 });
    });
  });
  qa(".sd-modal").forEach((dlg) => {
    const close = () => { gsap.killTweensOf(dlg); gsap.to(dlg, { opacity: 0, "--progress": 0, duration: 0.5, onComplete: () => dlg.close() }); };
    q(".sd-modal__close", dlg).addEventListener("click", close);
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  });

  // News card row — same Embla as the original (drag, snap skipping, left aligned)
  const vp = q(".sd-news__viewport");
  if (vp && window.EmblaCarousel) window.EmblaCarousel(vp, { skipSnaps: true, align: "start" });

  // Left table of contents — bolds the section that sits on the center line (50%) of a section, and clicking smooth-scrolls to it
  const side = qa(".sd-side a");
  const setOn = (a) => side.forEach((x) => x.classList.toggle("is-on", x === a));
  side.forEach((a) => {
    const sec = q(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onEnter: () => setOn(a), onEnterBack: () => setOn(a) });
    a.addEventListener("click", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      sec.scrollIntoView({ behavior: "smooth" });
      if (a.getAttribute("href") !== "#main-visual") history.pushState({}, "", a.getAttribute("href"));
    });
  });

  // ── Show/hide product panel (the original cuts the previous one and hooks up a new one on every state change)
  const panels = qa(".sd-product");
  const sticky = q(".sd-products__sticky");
  const panelTl = new Map();
  let active = null;
  const parts = (p) => ({ h3: q(".sd-product__title", p), main: qa(".sd-product__lead, .sd-product__text, .sd-product__buttons, .sd-product__scent", p), items: q(".sd-product__items", p) });
  const show = (p, reduce) => {
    const { h3, main, items } = parts(p);
    panelTl.get(p)?.kill();
    const tl = gsap.timeline().set(p, { pointerEvents: "all" })
      .to(h3, { clipPath: "inset(-1% -1% -1% -1%)", duration: reduce ? 0 : 0.3 })
      .fromTo(main, { y: reduce ? 0 : "2rem" }, { opacity: 1, y: 0, duration: reduce ? 0 : 0.5 })
      .fromTo(items, { y: reduce ? 0 : "2rem" }, { opacity: 1, y: 0, duration: reduce ? 0 : 0.5 }, reduce ? ">" : "-=0.2");
    panelTl.set(p, tl);
  };
  const hide = (p, reduce) => {
    const { h3, main, items } = parts(p);
    panelTl.get(p)?.kill();
    panelTl.set(p, gsap.timeline().set(p, { pointerEvents: "none" }).set(h3, { clipPath: "inset(-1% 100% -1% -1%)" }).to([...main, items], { opacity: 0, duration: reduce ? 0 : 0.3 }));
  };
  const setActive = (i, reduce) => {
    if (active === i) return;
    active = i;
    panels.forEach((p, j) => (j === i ? show(p, reduce) : hide(p, reduce)));
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const reduce = ctx.conditions.reduce;
    active = null;
    setActive(-1, true);

    if (reduce) {
      // Final state — everything on without a loader, the bottle spins in the center (its own axis spin also stops)
      gsap.set(".sd-splash", { display: "none" });
      gsap.set(".sd-mv__bg, .sd-mv__b, .sd-mv__bottle, .sd-mv__copy, .sd-hlogo, .sd-about__pic, .sd-feat-intro__pic, .sd-feat-intro__text, .sd-feat-intro__icons, .sd-feat__pic, .sd-feat__panel, .sd-illust", { opacity: 1 });
      gsap.set(".sd-row", { clipPath: "inset(-1px 0% -1px -1px)" });
      gsap.set(".sd-underline", { "--underline-width": "100%" });
      gsap.set(canvas, { opacity: 1 });
      Object.assign(F, { fadedZ: 0 });
      addEventListener("load", wake, { once: true });
      const prod = q("#products");
      [0, 1, 2].forEach((g) => ScrollTrigger.create({
        trigger: prod, start: `${g * 25}% top`, end: g !== 2 ? `${(g + 1) * 25}% top` : "bottom center",
        onToggle: (self) => { if (self.isActive) { setActive(g, true); sticky.dataset.variant = g + 1; F.bottle = ["ps", "sf", "ff"][g]; } },
      }));
      return;
    }

    // Loader — the logo rises from half a cell below, stays .3s, then exits half a cell up, the curtain lifts, and background·marbles·bottle·copy switch on overlapping by .3s each
    gsap.timeline()
      .fromTo(".sd-splash__logo", { opacity: 0, y: "50%" }, { opacity: 1, y: "0%" })
      .to(".sd-splash__logo", { opacity: 0, y: "-50%", delay: 0.3 })
      .to(".sd-splash", { opacity: 0 }, "-=0.2")
      .set(".sd-splash", { display: "none" })
      .to(".sd-mv__bg", { opacity: 1 })
      .to(".sd-mv__b", { opacity: 1, duration: 0.6 }, "-=0.3")
      .to(".sd-mv__bottle", { opacity: 1, duration: 0.6 }, "-=0.3")
      .to(".sd-mv__copy, .sd-hlogo", { opacity: 1, duration: 0.6, y: "0%" }, "-=0.3");
    // The bottle first appears in the About section (about 1.8 screens below the Hero) — loading starts on the first scroll, or after 12s if the user stays idle.
    const early = () => wake();
    addEventListener("scroll", early, { once: true, passive: true });
    const idle = setTimeout(early, 12000);

    // About — the photo comes from 5rem below, the bottle approaches from z −10, and the canvas turns on (reverses when scrolling back up)
    gsap.fromTo(".sd-about__pic", { opacity: 0, y: "5rem" }, { opacity: 1, y: "0%", scrollTrigger: { once: true, trigger: ".sd-about__pic", start: "top 50%" } });
    gsap.timeline({ scrollTrigger: { trigger: "#about", start: "top 33%", end: "bottom 66%", toggleActions: "play none none reverse", onEnter: wake } })
      .fromTo(F, { fadedZ: -10 }, { fadedZ: 0, ease: "power1.inOut", duration: 0.5, delay: 0.25 })
      .fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.25 }, "<");

    // Feature — the bottle blurs and lies back (z −15), rolling forward one full turn through the section while swinging right and left
    const feat = q("#features");
    gsap.timeline({ scrollTrigger: { trigger: feat, start: "top bottom", end: "top top", scrub: 0.7 } })
      .fromTo(canvas, { filter: "blur(0px)" }, { filter: "blur(4px)" })
      .fromTo(F, { z: 0, orientation: 0 }, { z: -15, orientation: 1 }, "<");
    gsap.fromTo(F, { rx: 0 }, { rx: -Math.PI * 2, ease: "linear", scrollTrigger: { trigger: feat, start: "top top", end: "bottom bottom", scrub: 0.7 } });
    gsap.timeline({ scrollTrigger: { trigger: feat, start: "top bottom", end: "bottom top", scrub: 0.7 } })
      .fromTo(F, { x: 0, z: 0 }, { x: 0.5, y: -0.2, duration: 0.25, ease: "sine.inOut" })
      .to(F, { x: -0.75, duration: 0.375, ease: "sine.inOut" })
      .to(F, { x: 0, y: 0, duration: 0.375, ease: "sine.inOut" });
    gsap.timeline({ scrollTrigger: { trigger: feat, start: "bottom bottom", end: "bottom top", scrub: 0.7 } })
      .fromTo(canvas, { filter: "blur(4px)" }, { filter: "blur(0px)" })
      .fromTo(F, { z: -15, orientation: 1 }, { z: 0, orientation: 0 }, "<");

    // Feature header — the photo, then the title line opens with its white strip in .15s order, then text and icons in .3s order
    gsap.fromTo(".sd-feat-intro__pic", { opacity: 0, y: "5rem" }, { opacity: 1, y: "0%", scrollTrigger: { once: true, trigger: ".sd-feat-intro__pic", start: "top 50%" } });
    gsap.timeline({ scrollTrigger: { trigger: ".sd-feat-intro__heading", start: "top 50%", once: true } })
      .to(".sd-feat-intro .sd-row", { clipPath: "inset(-1px 0% -1px -1px)", stagger: 0.15, duration: 0.5 })
      .fromTo(".sd-feat-intro__text, .sd-feat-intro__icons", { opacity: 0, y: "2.5rem" }, { opacity: 1, y: "0%", stagger: 0.3 }, "-=0.2");

    // Features 01·02·03 — photo (and drawing) from 2rem below, panels overlapping by .2s, yellow underline 0→100%
    qa(".sd-feat").forEach((sec) => {
      const pics = qa(".sd-feat__pic", sec);
      const illust = q(".sd-illust", sec);
      const first = sec.classList.contains("sd-feat--01");
      const tl = gsap.timeline({ scrollTrigger: { trigger: pics[0], start: "top 50%", end: "bottom 50%", once: true } })
        .fromTo(first ? [...pics, illust] : pics, { opacity: 0, y: "2rem" }, { opacity: 1, y: 0, stagger: first ? 0 : 0.2 })
        .fromTo(q(".sd-feat__panel", sec), { opacity: 0, y: "2rem" }, { opacity: 1, y: 0 }, "-=0.2")
        .fromTo(qa(".sd-underline", sec), { "--underline-width": "0%" }, { "--underline-width": "100%" }, "-=0.2");
      if (!first && illust) tl.fromTo(illust, { opacity: 0, y: "2rem" }, { opacity: 1, y: 0 }, "-=0.2");
    });

    // Product — the bottle spins three times throughout the section (on phones it shrinks to .65× and returns), and panel, background and bottle colors change every 1/4
    const prod = q("#products");
    gsap.fromTo(F, { rotation: 0 }, { rotation: Math.PI * 6, scrollTrigger: { trigger: prod, start: "top top", end: "bottom bottom", scrub: 0.7 } });
    gsap.fromTo(F, { smScale: 1 }, { smScale: 0.65, scrollTrigger: { trigger: prod, start: "top bottom", end: "top top", scrub: 0.7 } });
    gsap.fromTo(F, { smScale: 0.65 }, { smScale: 1, immediateRender: false, scrollTrigger: { trigger: prod, start: "bottom bottom", end: "bottom top", scrub: 0.7 } });
    const keys = ["ps", "sf", "ff"];
    // On switching, it rolls once forward (.75s power4.inOut) and swaps the bottle at the fastest half-turn point
    const swap = (k) => gsap.timeline().fromTo(F, { innerRx: 0 }, { innerRx: Math.PI * 2, ease: "power4.inOut", duration: 0.75 }).call(() => { F.bottle = k; }, [], `-=${0.75 / 2}`);
    keys.forEach((_, g) => {
      const on = () => { setActive(g); sticky.dataset.variant = g + 1; };
      ScrollTrigger.create({
        trigger: prod, start: `${g * 25}% top`, end: g !== 2 ? `${(g + 1) * 25}% top` : "bottom center",
        onEnter: () => { on(); if (g !== 0) swap(keys[g]); },
        onEnterBack: () => { on(); swap(keys[g]); },
        onLeave: g === 2 ? () => swap("ps") : undefined,
        onLeaveBack: g === 0 ? () => setActive(-1) : undefined,
      });
    });

    // FAQ·News·Footer — the bottle blurs again and rolls, and at the end settles at bottom left (beside the logo) (phone 1.8x)
    const tail = q(".sd-tail");
    gsap.fromTo(F, { footer: 0 }, { footer: 1, scrollTrigger: { trigger: tail, start: "top top", end: "bottom bottom", scrub: 0.7 } });
    gsap.timeline({ scrollTrigger: { trigger: tail, start: "top bottom", end: "top top", scrub: 0.7 } })
      .fromTo(canvas, { filter: "blur(0px)" }, { filter: "blur(4px)" })
      .fromTo(F, { z: 0, orientation: 0 }, { z: -15, orientation: 1 }, "<");
    gsap.fromTo(F, { rx: 0 }, { rx: -Math.PI * 2, ease: "linear", scrollTrigger: { trigger: tail, start: "top top", end: "bottom bottom", scrub: 0.7 } });
    gsap.timeline({ scrollTrigger: { trigger: tail, start: "top bottom", end: "bottom bottom", scrub: 0.7 } })
      .fromTo(F, { x: 0, z: 0 }, { x: -0.25, y: -0.2, duration: 0.25, ease: "sine.inOut" })
      .to(F, { x: 0.75, duration: 0.375, ease: "sine.inOut" })
      .to(F, { x: 0, y: 0, duration: 0.375, ease: "sine.inOut" });
    gsap.timeline({ scrollTrigger: { trigger: tail, start: "90% bottom", end: "bottom bottom", scrub: 0.7 } })
      .to(canvas, { filter: "blur(0px)" })
      .to(F, { smScale: 1.8, orientation: 0 }, "<");
    return () => { removeEventListener("scroll", early); clearTimeout(idle); };
  });
})();
