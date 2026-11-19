// Home page scenes — for each section the .a-sec group overlaps down over the previous section like a curtain · fixed hold, collection mask open, parallax, history line drawing, 360° spinner.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sec = (name) => document.querySelector(`.a-sec[data-sec="${name}"]`);

  // ── 360° spinner: swapping the video by color circle (new video wipes over from the left in 1.3s), circles that grow like a dock, drag to rotate, a ”Drag” pill that follows late, text that rises on scroll ──
  document.querySelectorAll("[data-spinner]").forEach((root) => {
    const videos = [...root.querySelectorAll(".a-spin__video")];
    const swatches = [...root.querySelectorAll(".a-spin__swatch")];
    const label = root.querySelector("[data-label]");
    const countOut = root.querySelector("[data-count-out]");
    const stage = root.querySelector(".a-spin__stage");
    const cursor = root.querySelector("[data-cursor]");
    const text = root.querySelector("[data-text]");
    let active = Math.max(0, videos.findIndex((v) => v.classList.contains("is-active")));
    const play = (v) => { if (!reduce) v.play().catch(() => {}); };
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) play(videos[active]); else videos[active].pause(); })).observe(root);

    const select = (i) => {
      if (i === active || !videos[i]) return;
      const from = videos[active], to = videos[i];
      swatches[active].classList.remove("is-active");
      swatches[i].classList.add("is-active");
      swatches[i].style.removeProperty("--sw-scale");
      active = i;
      const d = swatches[i].dataset;
      if (label && d.name) label.textContent = d.name;
      if (countOut && d.count) countOut.textContent = d.count;
      try { to.currentTime = from.currentTime || 0; } catch (e) { /* Before metadata loads, start from the beginning */ }
      to.classList.add("is-active");
      play(to);
      if (!window.gsap || reduce) { from.classList.remove("is-active"); from.pause(); return; }
      const mask = "linear-gradient(90deg, var(--kf-ink) calc(var(--wipe) - 7%), transparent var(--wipe))";
      gsap.set(to, { zIndex: 2 });
      to.style.webkitMaskImage = to.style.maskImage = mask;
      gsap.fromTo(to, { "--wipe": "0%" }, {
        "--wipe": "110%", duration: 1.3, ease: "power2.out", overwrite: "auto",
        onComplete: () => {
          to.style.webkitMaskImage = to.style.maskImage = "";
          gsap.set(to, { clearProps: "zIndex" });
          if (from !== videos[active]) { from.classList.remove("is-active"); from.pause(); }
        },
      });
    };
    swatches.forEach((s, i) => s.addEventListener("click", () => select(i)));

    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const row = root.querySelector(".a-spin__swatches");
    if (row && fine) {
      // Circles within 132px of the cursor scale up to 1.38x in a cosine shape
      let x = 0, raf = false;
      const dock = () => {
        raf = false;
        swatches.forEach((s, i) => {
          if (i === active) { s.style.removeProperty("--sw-scale"); return; }
          const r = s.getBoundingClientRect(), dist = Math.abs(x - (r.left + r.width / 2));
          const f = dist < 132 ? 0.5 * (1 + Math.cos(Math.PI * dist / 132)) : 0;
          s.style.setProperty("--sw-scale", (1 + 0.38 * f).toFixed(3));
        });
      };
      row.addEventListener("pointermove", (e) => { x = e.clientX; if (!raf) { raf = true; requestAnimationFrame(dock); } });
      row.addEventListener("pointerleave", () => swatches.forEach((s) => s.style.removeProperty("--sw-scale")));
    }
    if (text && matchMedia("(min-width: 990px)").matches) {
      // While the panel’s top edge goes from screen bottom to top, the text moves from below into place by (panel height − text height − 108px)
      const shift = () => {
        const r = root.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (innerHeight - r.top) / innerHeight));
        const travel = Math.max(0, r.height - text.offsetHeight - 108);
        text.style.setProperty("--text-shift", `${(-(1 - p) * travel).toFixed(1)}px`);
      };
      addEventListener("scroll", shift, { passive: true });
      shift();
    }
    if (cursor && fine) {
      const c = { x: 0, y: 0, tx: 0, ty: 0, lastX: 0, primed: false, raf: false };
      const lerp = () => {
        c.raf = false;
        if (!c.primed) { c.x = c.tx; c.y = c.ty; c.primed = true; }
        c.x += (c.tx - c.x) * 0.2; c.y += (c.ty - c.y) * 0.2;
        cursor.style.setProperty("--cx", `${c.x.toFixed(1)}px`);
        cursor.style.setProperty("--cy", `${c.y.toFixed(1)}px`);
        if (Math.abs(c.tx - c.x) > 0.4 || Math.abs(c.ty - c.y) > 0.4) { c.raf = true; requestAnimationFrame(lerp); }
      };
      root.addEventListener("pointermove", (e) => {
        c.tx = e.clientX; c.ty = e.clientY;
        const dx = e.clientX - c.lastX; c.lastX = e.clientX;
        if (dx > 1.2) cursor.classList.remove("is-left"); else if (dx < -1.2) cursor.classList.add("is-left");
        const over = e.target.closest?.(".a-spin__swatch, .a-spin__btn, .a-spin__menu");
        root.classList.toggle("is-cursor-on", !over);
        if (!c.raf) { c.raf = true; requestAnimationFrame(lerp); }
      });
      root.addEventListener("pointerleave", () => root.classList.remove("is-cursor-on"));
    }
    // Drag — dragging the panel width scrubs one full video loop (whole length)
    let drag = null;
    stage.addEventListener("pointerdown", (e) => {
      const v = videos[active];
      drag = { x: e.clientX, t: v.currentTime || 0 };
      root.classList.add("is-dragging");
      v.pause();
      stage.setPointerCapture?.(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const v = videos[active], dur = v.duration || 0;
      if (!dur) return;
      let t = drag.t - (e.clientX - drag.x) / stage.clientWidth * dur;
      t = ((t % dur) + dur) % dur;
      try { v.currentTime = t; } catch (err) { /* Can’t Wind Yet */ }
    });
    const up = () => { if (!drag) return; drag = null; root.classList.remove("is-dragging"); play(videos[active]); };
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
  });

  const M = window.aMotion;
  if (reduce || !M) return;
  const { DESKTOP, docTop, rectDrive, once } = M;
  const vh = () => innerHeight;

  // ── Quote: a gradient mask sweeps top to bottom down to 140% while an 8px blur clears (2.5s power2.out, section head at 75% of the screen) ──
  const stmtWrap = sec("statement"), stmt = stmtWrap?.querySelector(".a-statement");
  if (stmt) {
    const block = stmt.querySelector(".a-statement__inner") || stmt;
    const st = { p: 0 };
    const mask = () => { const m = `linear-gradient(to bottom, var(--kf-ink) ${st.p - 40}%, transparent ${st.p}%)`; block.style.webkitMaskImage = m; block.style.maskImage = m; };
    mask();
    block.style.filter = "blur(8px)";
    gsap.timeline({ scrollTrigger: { trigger: stmt, start: "top 75%", once: true } })
      .to(st, { p: 140, duration: 2.5, ease: "power2.out", onUpdate: mask }, 0)
      .to(block, { filter: "blur(0px)", duration: 2.5, ease: "power2.out" }, 0)
      .add(() => { block.style.webkitMaskImage = block.style.maskImage = ""; block.style.filter = ""; });
  }

  // ── Pinned quote → category: with the quote section pinned, the category panel overlaps in from above (−distance) at .6x down to 1x, the two columns go .85 → 1 from the outside, and the quote fades ──
  const catWrap = sec("cats"), cats = catWrap?.querySelector(".a-cats");
  if (stmtWrap && cats && DESKTOP) {
    const dist = () => Math.max(docTop(catWrap) - docTop(stmtWrap), 1);
    let D = dist();
    gsap.set(stmtWrap, { zIndex: -1 });
    gsap.set([catWrap, cats], { backgroundColor: "transparent" });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stmtWrap, start: "top top", end: () => `+=${dist()}`, scrub: true, pin: true, pinSpacing: false, invalidateOnRefresh: true,
        onRefresh: (self) => { D = self.end - self.start; },
        onUpdate: (self) => cats.classList.toggle("is-armed", self.progress > 0.55),
        onLeave: () => cats.classList.add("is-armed"),
        onEnterBack: () => cats.classList.remove("is-armed"),
      },
    });
    tl.fromTo(cats, { y: () => -D, scale: 0.6, transformOrigin: () => `50% ${stmtWrap.offsetHeight / 2}px` }, { y: 0, scale: 1, ease: "none", duration: 1 }, 0);
    tl.fromTo(cats, { filter: "blur(6px)" }, { filter: "blur(0px)", ease: "none", duration: 0.45 }, 0);
    tl.fromTo(cats, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.12 }, 0);
    const tiles = cats.querySelectorAll(".a-cats__tile");
    if (tiles.length > 1) {
      tl.fromTo(tiles[0], { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.35 }, 0.05);
      tl.fromTo(tiles[0], { scale: 0.85, transformOrigin: "100% 50%" }, { scale: 1, ease: "none", duration: 0.55 }, 0.05);
      tl.fromTo(tiles[1], { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.45 }, 0.1);
      tl.fromTo(tiles[1], { scale: 0.85, transformOrigin: "0% 50%" }, { scale: 1, ease: "none", duration: 0.9 }, 0.1);
    }
    tl.fromTo(stmt.querySelector(".a-statement__body") || stmt, { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", ease: "none", duration: 0.45 }, 0);
    ScrollTrigger.create({ trigger: catWrap, start: () => docTop(catWrap), end: () => docTop(catWrap) + Math.round(vh() * 0.55), pin: true, pinSpacing: true, invalidateOnRefresh: true });
  } else if (cats) cats.classList.add("is-armed");

  // ── Collection: mask opens bottom to top while 6px blur clears (2s, section head at 70% of screen), cards rise from 56px below at .14 stagger 1.1s (65%). Promo photo scaled 1.32 moves −15% → 15% ──
  document.querySelectorAll(".a-coll").forEach((coll) => {
    const wrap = coll.closest(".a-sec");
    if (!wrap) return;
    if (DESKTOP) {
      const rv = { p: 0 };
      const mask = () => { const m = `linear-gradient(to top, var(--kf-ink) ${rv.p - 40}%, transparent ${rv.p}%)`; coll.style.webkitMaskImage = m; coll.style.maskImage = m; };
      mask();
      coll.style.filter = "blur(6px)";
      const entry = gsap.timeline({ paused: true })
        .to(rv, { p: 140, duration: 2, ease: "power2.out", onUpdate: mask }, 0)
        .to(coll, { filter: "blur(0px)", duration: 2, ease: "power2.out" }, 0)
        .add(() => { coll.style.webkitMaskImage = coll.style.maskImage = ""; coll.style.filter = ""; });
      const cards = coll.querySelectorAll(".a-coll__card");
      gsap.set(cards, { y: 56, autoAlpha: 0 });
      const cardsTw = gsap.to(cards, { y: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out", stagger: 0.14, paused: true });
      once(() => wrap.getBoundingClientRect().top < vh() * 0.7, () => entry.play());
      once(() => wrap.getBoundingClientRect().top < vh() * 0.65, () => cardsTw.play());
    }
    const media = coll.querySelector(".a-coll__promo-media");
    if (media) {
      gsap.set(media, { scale: 1.32 });
      const setYP = gsap.quickSetter(media, "yPercent");
      const upd = () => { const r = coll.getBoundingClientRect(); setYP(-15 + 30 * Math.max(0, Math.min(1, (vh() - r.top) / (vh() + r.height)))); };
      ScrollTrigger.create({ trigger: wrap, start: () => docTop(wrap) - vh(), end: () => docTop(wrap) + wrap.offsetHeight + vh() * 2.5, invalidateOnRefresh: true, onUpdate: upd, onRefresh: upd });
      upd();
    }
  });

  // Curtain — the photo and frame come down from above the screen height (photo 1.06 → 1), and the covered previous section is pushed −25%.
  const curtain = (wrap, ed, pushed) => {
    const tl = gsap.timeline();
    const media = ed.querySelector(".a-ed__media"), frame = ed.querySelector(".a-ed__frame");
    if (media) tl.fromTo(media, { y: () => -vh(), scale: 1.06 }, { y: 0, scale: 1, ease: "none", duration: 1 }, 0);
    if (frame) tl.fromTo(frame, { y: () => -vh() }, { y: 0, ease: "none", duration: 1 }, 0);
    if (pushed) tl.fromTo(pushed, { yPercent: 0 }, { yPercent: -25, ease: "none", duration: 1 }, 0);
    rectDrive(wrap, tl);
  };
  // Box — from .7x · blur 8px over .9s, text .45s · button .6s later from 24px below
  const boxIn = (ed) => {
    const box = ed.querySelector(".a-ed__box");
    if (!box) return null;
    const bits = [box.querySelector(".a-ed__body"), box.querySelector(".a-ed__btn, .a-ed__link")].filter(Boolean);
    gsap.set(box, { scale: 0.7, autoAlpha: 0, filter: "blur(8px)", transformOrigin: "50% 50%" });
    if (bits.length) gsap.set(bits, { y: 24, autoAlpha: 0, filter: "blur(6px)" });
    const tl = gsap.timeline({ paused: true }).to(box, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.9, ease: "power2.out" }, 0);
    if (bits[0]) tl.to(bits[0], { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, 0.45);
    if (bits[1]) tl.to(bits[1], { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.8, ease: "power2.out" }, 0.6);
    return tl;
  };
  const stepsIn = (ed) => {
    const steps = ed.querySelectorAll(".a-ed__step");
    if (!steps.length) return null;
    gsap.set(steps, { y: 18, autoAlpha: 0, filter: "blur(6px)" });
    return gsap.to(steps, { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out", stagger: 0.15, paused: true });
  };
  // Dwell — pinned after the section is fully visible until the next section’s header arrives
  const dwellStart = (wrap) => docTop(wrap) + Math.max(wrap.offsetHeight - vh(), 0);
  const dwell = (wrap, next, extra, spacing, onEnter) => ScrollTrigger.create({
    trigger: wrap, start: () => dwellStart(wrap), end: () => (next && !extra ? docTop(next) : dwellStart(wrap) + Math.round(vh() * extra)),
    pin: true, pinSpacing: !!spacing, invalidateOnRefresh: true, onEnter,
  });

  const poppyWrap = sec("poppy"), poppy = poppyWrap?.querySelector(".a-coll");
  const pieceWrap = sec("piece"), piece = pieceWrap?.querySelector(".a-ed");
  const womanWrap = sec("woman"), woman = womanWrap?.querySelector(".a-ed");
  const budaWrap = sec("budapest"), buda = budaWrap?.querySelector(".a-ed");
  const spinWrap = sec("spinner"), spin = spinWrap?.querySelector(".a-spin");
  const thermalWrap = sec("thermal"), thermal = thermalWrap?.querySelector(".a-coll");
  const susWrap = sec("sustain"), sus = susWrap?.querySelector(".a-ed");

  // ── Single dot only ──
  if (pieceWrap && piece && poppyWrap) {
    gsap.set(pieceWrap, { position: "relative", zIndex: 2 });
    if (DESKTOP) {
      ScrollTrigger.create({ trigger: poppyWrap, start: () => dwellStart(poppyWrap), end: () => docTop(pieceWrap), pin: true, pinSpacing: false, invalidateOnRefresh: true });
      curtain(pieceWrap, piece, poppy);
    }
    const box = boxIn(piece);
    if (box) ScrollTrigger.create({ trigger: pieceWrap, start: "top 30%", once: true, onEnter: () => box.play() });
    const steps = stepsIn(piece);
    if (DESKTOP) dwell(pieceWrap, womanWrap, womanWrap ? 0 : 0.35, false, () => steps?.play());
    else if (steps) once(() => pieceWrap.getBoundingClientRect().bottom <= vh() + 2, () => steps.play());
  }

  // ── Person: curtain, center text goes from 1.12x scale and 6px blur in 1s ──
  if (womanWrap && woman) {
    gsap.set(womanWrap, { position: "relative", zIndex: 3 });
    if (DESKTOP) curtain(womanWrap, woman);
    const content = woman.querySelector(".a-ed__content");
    if (content) {
      gsap.set(content, { scale: 1.12, autoAlpha: 0, filter: "blur(6px)", transformOrigin: "50% 50%" });
      gsap.to(content, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 1, ease: "power2.out", scrollTrigger: { trigger: womanWrap, start: "top 30%", once: true } });
    }
    if (DESKTOP) dwell(womanWrap, budaWrap, budaWrap ? 0 : 0.35);
  }

  // ── City: on scroll down it clips in from the right (from the ⅓ point for ⅔ of the span), a white band sweeps from right 200% → left −100%, and the front photo·frame get pushed by −18vw·−32vw. Text slides in 70px from the right at progress .4~.9 ──
  if (budaWrap && buda) {
    gsap.set(budaWrap, { position: "relative", zIndex: 4 });
    gsap.set(buda, { position: "relative", zIndex: 1 });
    const content = buda.querySelector(".a-ed__content");
    let contentTw = null;
    if (content && DESKTOP) { gsap.set(content, { x: 70, autoAlpha: 0 }); contentTw = gsap.to(content, { x: 0, autoAlpha: 1, ease: "none", duration: 1, paused: true }); }
    if (DESKTOP) {
      const band = document.createElement("div");
      band.className = "a-sweep-band";
      band.style.cssText = "position:absolute;top:0;bottom:0;left:0;width:50%;background:var(--kf-bg);z-index:2;pointer-events:none;";
      budaWrap.appendChild(band);
      const wMedia = woman?.querySelector(".a-ed__media"), wFrame = woman?.querySelector(".a-ed__frame"), bMedia = buda.querySelector(".a-ed__media");
      const tl = gsap.timeline();
      tl.fromTo(buda, { y: () => -vh() }, { y: 0, ease: "none", duration: 1 }, 0);
      tl.fromTo(band, { y: () => -vh() }, { y: 0, ease: "none", duration: 1 }, 0);
      tl.fromTo(band, { xPercent: 200 }, { xPercent: -100, ease: "none", duration: 1 }, 0);
      tl.fromTo(buda, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 0.667 }, 0.333);
      if (bMedia) tl.fromTo(bMedia, { x: () => Math.round(innerWidth * 0.05) }, { x: 0, ease: "none", duration: 0.667 }, 0.333);
      if (wMedia) tl.fromTo(wMedia, { x: 0 }, { x: () => -Math.round(innerWidth * 0.18), ease: "none", duration: 0.6 }, 0);
      if (wFrame) tl.fromTo(wFrame, { x: 0 }, { x: () => -Math.round(innerWidth * 0.32), ease: "none", duration: 0.6 }, 0);
      rectDrive(budaWrap, tl, (p) => { if (!contentTw) return; const cp = Math.max(0, Math.min(1, (p - 0.4) / 0.5)); if (cp > contentTw.progress()) contentTw.progress(cp); });
      dwell(budaWrap, spinWrap, spinWrap ? 0 : 0.25);
    }
  }

  // ── Spinner: opens by clip from the right while descending, and the front photo and frame move −18vw and −14vw. After fully visible it stays .75 of a screen longer ──
  if (spinWrap && spin) {
    gsap.set(spinWrap, { position: "relative", zIndex: 5 });
    if (DESKTOP) {
      const bMedia = buda?.querySelector(".a-ed__media"), bFrame = buda?.querySelector(".a-ed__frame");
      const tl = gsap.timeline();
      tl.fromTo(spin, { y: () => -vh() }, { y: 0, ease: "none", duration: 1 }, 0);
      tl.fromTo(spin, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 }, 0);
      if (bMedia) tl.fromTo(bMedia, { x: 0 }, { x: () => -Math.round(innerWidth * 0.18), ease: "none", duration: 1 }, 0);
      if (bFrame) tl.fromTo(bFrame, { x: 0 }, { x: () => -Math.round(innerWidth * 0.14), ease: "none", duration: 1 }, 0);
      rectDrive(spinWrap, tl);
      dwell(spinWrap, null, 0.75, true);
    }
  }

  // ── Sustainable: holds Collection 2 and covers it with a curtain (Collection 2 −25%). Box when the section head is 30% above the screen, steps when entering the hold ──
  if (susWrap && sus && thermalWrap) {
    gsap.set(susWrap, { position: "relative", zIndex: 6 });
    gsap.set(sus, { overflow: "hidden" });
    if (DESKTOP) {
      ScrollTrigger.create({ trigger: thermalWrap, start: () => dwellStart(thermalWrap), end: () => docTop(susWrap), pin: true, pinSpacing: false, invalidateOnRefresh: true });
      curtain(susWrap, sus, thermal);
    }
    const box = boxIn(sus);
    if (box) once(() => susWrap.getBoundingClientRect().top < vh() * 0.3, () => box.play());
    const steps = stepsIn(sus);
    ScrollTrigger.create({ trigger: susWrap, start: () => dwellStart(susWrap), end: () => dwellStart(susWrap) + 1, invalidateOnRefresh: true, onEnter: () => steps?.play() });
  }

  // ── Three worlds: photo·video 1.32× −15% → 15%, header text from 28px below at .12 spacing for 1.1s (section top at 75% of screen) ──
  const worlds = sec("worlds")?.querySelector(".a-worlds");
  if (worlds) {
    const layers = worlds.querySelectorAll(".a-worlds__media > .wf-img, .a-worlds__video");
    gsap.set(layers, { scale: 1.32 });
    const setters = [...layers].map((el) => gsap.quickSetter(el, "yPercent"));
    const upd = () => { const r = worlds.getBoundingClientRect(); const t = Math.max(0, Math.min(1, (vh() - r.top) / (vh() + r.height))); setters.forEach((s) => s(-15 + 30 * t)); };
    ScrollTrigger.create({ trigger: sec("worlds"), start: "top bottom", end: "bottom top", onUpdate: upd, onRefresh: upd });
    upd();
    const bits = [".a-worlds__title", ".a-worlds__intro"].map((s) => worlds.querySelector(s)).filter(Boolean);
    gsap.set(bits, { y: 28, autoAlpha: 0 });
    once(() => worlds.getBoundingClientRect().top < vh() * 0.75, () => gsap.to(bits, { y: 0, autoAlpha: 1, duration: 1.1, ease: "power2.out", stagger: 0.12 }));
  }

  // ── History: panel photo 1.28x −12% → 12%, header text from 20px below (75%), and when the section’s bottom end enters the screen the dot·caption (.55s) and line (.6s, .22 later) run at .7 spacing ──
  const her = sec("heritage")?.querySelector(".a-heritage");
  if (her) {
    const bg = her.querySelector(".a-heritage__media > .wf-img");
    if (bg) {
      gsap.set(bg, { scale: 1.28 });
      const setBg = gsap.quickSetter(bg, "yPercent");
      const upd = () => { const r = her.getBoundingClientRect(); setBg(-12 + 24 * Math.max(0, Math.min(1, (vh() - r.top) / (vh() + r.height)))); };
      ScrollTrigger.create({ trigger: sec("heritage"), start: "top bottom", end: "bottom top", onUpdate: upd, onRefresh: upd });
      upd();
    }
    const bits = [".a-heritage__eyebrow", ".a-heritage__heading", ".a-heritage__link"].map((s) => her.querySelector(s)).filter(Boolean);
    gsap.set(bits, { y: 20, autoAlpha: 0 });
    const conns = her.querySelectorAll(".a-heritage__conn");
    const seq = gsap.timeline({ paused: true });
    her.querySelectorAll(".a-heritage__mile").forEach((m, i) => {
      const pieces = [m.querySelector(".a-heritage__dot"), m.querySelector(".a-heritage__cap")].filter(Boolean);
      gsap.set(pieces, { y: 14, autoAlpha: 0 });
      seq.to(pieces, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power2.out" }, i * 0.7);
      if (conns[i]) { gsap.set(conns[i], { scaleX: 0, transformOrigin: "left center" }); seq.to(conns[i], { scaleX: 1, duration: 0.6, ease: "power1.inOut" }, i * 0.7 + 0.22); }
    });
    once(() => her.getBoundingClientRect().top < vh() * 0.75, () => gsap.to(bits, { y: 0, autoAlpha: 1, duration: 1, ease: "power2.out", stagger: 0.12 }));
    once(() => her.getBoundingClientRect().bottom <= vh() + 2, () => seq.play());
  }

  // ── Trust logos: when the bottom of the section enters the screen, 16px from below over 1.4s, .3 interval ──
  const logos = sec("logos")?.querySelector(".a-logos");
  if (logos) {
    const items = logos.querySelectorAll(".a-logos__item");
    gsap.set(items, { y: 16, autoAlpha: 0 });
    once(() => logos.getBoundingClientRect().bottom <= vh() + 2, () => gsap.to(items, { y: 0, autoAlpha: 1, duration: 1.4, ease: "power2.out", stagger: 0.3 }));
  }

  // ── Phone: instead of the curtain, each photo scales 1.18x with −8% → 8% parallax ──
  if (!DESKTOP) {
    const drivers = [];
    const add = (holder, layer) => {
      if (!holder || !layer) return;
      gsap.set(holder, { overflow: "hidden" });
      gsap.set(layer, { scale: 1.18 });
      const set = gsap.quickSetter(layer, "yPercent");
      drivers.push(() => { const r = holder.getBoundingClientRect(); if (r.bottom < -60 || r.top > vh() + 60) return; set(-8 + 16 * Math.max(0, Math.min(1, (vh() - r.top) / (vh() + r.height)))); });
    };
    document.querySelectorAll(".a-ed .a-ed__media").forEach((m) => add(m.closest(".a-ed"), m.firstElementChild || m));
    const hm = document.querySelector(".a-hero__media");
    add(hm, hm?.querySelector("video, .wf-img"));
    document.querySelectorAll(".a-cats__tile").forEach((t) => add(t, t.querySelector(".a-cats__media > .wf-img")));
    if (drivers.length) gsap.ticker.add(() => drivers.forEach((d) => d()));
  }
})();
