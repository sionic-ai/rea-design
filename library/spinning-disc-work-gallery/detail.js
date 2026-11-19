// Work detail — original values: hero entrance (title lines .7s 120% · gap .08, text from .12 by .03, lines from .08 at .06 intervals .9s, corner + from .38 .5s .05, button .09),
// Torn edge (starts at 81% of hero height l and is eaten up to 60% by scrolling, wobble .13l, center dip .13l, grain 230px, first revealed over 1.5s, breathing .15 turns/s),
// Dialogue words (when the line reaches the bottom of the screen: line .9s, words from .16 at .8s with .09 gaps, mask opens from .5em below, button from .26 at .7s),
// Next work (over panel progress .3~.97 the disc rises from below, tilting from −52°·10° to −30°·−30°, pushing further at the end gathers 620px and moves on to the next work).
(() => {
  const A = (window.A24 ||= {});
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const HERO = { inDuration: 0.7, inShift: 120, titleLineStagger: 0.08, textStart: 0.12, textStagger: 0.03, ruleStart: 0.08, ruleStagger: 0.06, ruleDuration: 0.9, ctaStart: 0.38, popDuration: 0.5, popStagger: 0.05, btnStagger: 0.09 };
  const DIS = { reach: 0.4, peek: 0.19, wander: 0.13, intro: 1.5, center: 0.13, centerX: 0.5, edge: 0.5, life: 0.85, lifeSpeed: 0.15, agitate: 2.2, velocityRef: 2600, velocityEase: 0.13, surge: 0.55, finish: 0.85, scale: 230, warp: 1.25, grid: 16 };
  const QUOTE = { ruleDuration: 0.9, lineStart: 0.16, lineStagger: 0.09, lineDuration: 0.8, lineRise: "0.5em", clipFrom: "inset(-35% 0% 100% 0%)", clipTo: "inset(-35% 0% -12% 0%)", btnStart: 0.26, btnDuration: 0.7, btnShift: 120 };
  const NEXT = { restTiltX: -30, restTiltY: -30, arriveTiltX: -52, arriveTiltY: 10, arriveStart: 0.3, arriveEnd: 0.97, discVh: 120, pushWheel: 620, pushLift: 0.1, pushGrow: 1.04, exitDuration: 0.7, exitSpin: -16, exitLift: 0.35, fillFps: 10 };
  const LB = { stripDuration: 0.45, openDuration: 1.05, plateFadeAt: 0.12, plateFadeDuration: 0.6, stageScaleFrom: 0.94, videoRevealAt: 0.35, videoFadeDuration: 0.5, uiRevealAt: 0.55, uiFadeDuration: 0.6, closeDuration: 0.85 };

  // Value noise (sine hash like the original + smooth interpolation) — two-layer fbm
  const hash = (x, y) => { const r = Math.sin(x * 127.1 + y * 311.7 + 74.7) * 43758.5453; return r - Math.floor(r); };
  const vnoise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return hash(xi, yi) * (1 - u) * (1 - v) + hash(xi + 1, yi) * u * (1 - v) + hash(xi, yi + 1) * (1 - u) * v + hash(xi + 1, yi + 1) * u * v;
  };
  const fbm = (x, y) => vnoise(x, y) * 0.66 + vnoise(x * 2.03 + 5.2, y * 2.03 - 1.3) * 0.24 + vnoise(x * 4.1 - 3.1, y * 4.1 + 7.7) * 0.1;
  const smoother = (t) => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

  const mount = (root) => {
    const cleanups = [];
    const tweens = [];
    const keep = (t) => { tweens.push(t); return t; };

    // ── Hero Entrance
    const hero = A.q(".d-hero", root);
    const titleLines = A.lineWrap(A.q('[data-reveal="lines"]', hero));
    const texts = A.qa('[data-reveal="text"]', hero).map((el) => { el.style.overflow = "hidden"; return A.lineWrap(el); }).flat();
    const rules = A.qa('[data-reveal="rule"]', hero);
    const pops = A.qa('[data-reveal="pop"]', hero);
    const btns = A.qa('.d-cta [data-reveal="btn"]', hero);
    const btnParts = (b) => ({ lines: A.qa(".a-btn__line", b), text: A.q(".a-btn__p", b) });
    if (A.reduce) {
      gsap.set([...titleLines, ...texts], { yPercent: 0 });
    } else {
      const tl = keep(gsap.timeline({ delay: A.nextIntro === "detail" ? 0.05 : 0.2 }));
      tl.fromTo(titleLines, { yPercent: HERO.inShift }, { yPercent: 0, duration: HERO.inDuration, ease: "energy", stagger: HERO.titleLineStagger }, 0);
      tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: HERO.ruleDuration, ease: "energy", stagger: HERO.ruleStagger }, HERO.ruleStart);
      tl.fromTo(texts, { yPercent: HERO.inShift }, { yPercent: 0, duration: HERO.inDuration, ease: "energy", stagger: HERO.textStagger }, HERO.textStart);
      tl.fromTo(pops, { scale: 0 }, { scale: 1, duration: HERO.popDuration, ease: "energy", stagger: HERO.popStagger }, HERO.ctaStart);
      btns.forEach((b, i) => {
        const p = btnParts(b);
        tl.fromTo(p.lines, { scaleX: 0 }, { scaleX: 1, duration: HERO.inDuration, ease: "energy" }, HERO.ctaStart + i * HERO.btnStagger);
        tl.fromTo(p.text, { yPercent: HERO.inShift }, { yPercent: 0, duration: HERO.inDuration, ease: "energy" }, HERO.ctaStart + i * HERO.btnStagger);
      });
    }

    // ── Torn edge
    const trailer = A.q(".d-trailer", root);
    let disST = null, disTick = null;
    if (!A.reduce && CSS.supports("clip-path", 'path("M 0 0 L 1 0 Z")')) {
      let l = 0, w = 0, U = 0, H = 0, V = 0, vel = 0, last = 0;
      // As in the original, an extra height (apron) is placed below the Hero so the boundary can start below the content (1.07l), and the trailer panel overlaps by that amount
      const measure = () => {
        l = A.q(".d-hero__content", hero).offsetHeight; w = hero.offsetWidth;
        const u = DIS.wander * l, d = DIS.center * l, below = 0.4, reserve = 0.8 * u, m = DIS.surge * u;
        const g = u + d + u * below, f = DIS.peek * l, p = Math.max(DIS.reach * l, f + u);
        const apron = Math.max(0, Math.ceil((g + m + reserve - f) * 1.12));
        hero.style.setProperty("--dissolve-apron", `${apron}px`);
        trailer.style.setProperty("--dissolve-overlap", `${Math.ceil(apron + p + m + reserve)}px`);
      };
      measure();
      hero.setAttribute("data-dissolve-ready", "");
      const draw = () => {
        const n = smoother(U);
        const peekY = l - DIS.peek * l, reachY = l - DIS.reach * l;
        const base = l - n * (l - (peekY + V * (reachY - peekY))) + (DIS.wander + DIS.center) * l * n - vel * DIS.surge * DIS.wander * l * n;
        const amp = DIS.wander * l * n, dent = DIS.center * l * n, life = H * DIS.life;
        const pts = [];
        for (let x = -DIS.grid; x <= w + DIS.grid; x += DIS.grid) {
          const c = Math.cos(Math.PI * clamp(x / w - DIS.centerX, -0.5, 0.5));
          const a = Math.max(0, c);
          const nx = x / DIS.scale;
          const wx = nx + (fbm(nx * 0.5, life * 0.3 + 9.1) - 0.5) * DIS.warp;
          const k = (fbm(wx, life * 0.35) - 0.478) / 0.26;
          const y = base - dent * a * a + Math.tanh(k) * amp * (DIS.edge + (1 - DIS.edge) * a);
          pts.push(`${x.toFixed(1)} ${clamp(y, -l, hero.offsetHeight + 2).toFixed(1)}`);
        }
        hero.style.clipPath = `path(evenodd, "M ${-DIS.grid} ${-l} L ${w + DIS.grid} ${-l} L ${pts.reverse().join(" L ")} Z")`;
      };
      disST = ScrollTrigger.create({
        trigger: trailer, start: "clamp(top bottom)", end: () => `top top-=${Math.ceil(l * DIS.wander * 1.4)}`, scrub: true, invalidateOnRefresh: true,
        onRefresh: () => { measure(); draw(); },
      });
      last = gsap.ticker.time;
      disTick = () => {
        const t = gsap.ticker.time, dt = Math.min(0.1, Math.max(0, t - last));
        last = t;
        const r = disST.progress;
        V = clamp(DIS.finish < 1 ? r / DIS.finish : r, 0, 1);
        const v = clamp(disST.getVelocity() / DIS.velocityRef, -1, 1);
        vel += (v - vel) * DIS.velocityEase;
        if (U < 1) U = Math.min(1, U + dt / DIS.intro);
        H += dt * DIS.lifeSpeed * (1 + Math.abs(vel) * DIS.agitate) * Math.PI * 2;
        draw();
      };
      gsap.ticker.add(disTick);
      const ro = new ResizeObserver(() => { measure(); draw(); });
      ro.observe(hero);
      cleanups.push(() => { ro.disconnect(); hero.style.clipPath = ""; });
    }

    // ── Teaser photo parallax (original data-parallax −10 → 10)
    const img = A.q("[data-parallax]", root);
    if (img && !A.reduce) keep(gsap.fromTo(img, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: A.q(".d-trailer__vh", root), start: "top bottom", end: "bottom top", scrub: true } }));

    // ── Dialogue words — scattered on the lines of rows 2, 3, 4, 5 (the original sets the seed from the title and scatters them)
    const quote = A.q("[data-trailer-quote]", root);
    const words = (quote.dataset.text || "").split(" ");
    const chunks = [words[0], words[1], words.slice(2, -1).join(" "), words[words.length - 1]].filter(Boolean);
    const qRows = A.qa(".d-quote__row", quote);
    const slots = [[1, 0.62], [2, 0], [3, 0.82], [4, 0.3]];
    const wordEls = chunks.map((c, i) => {
      const [row, x] = slots[i];
      const el = document.createElement("p");
      el.className = "t-heading-l d-word";
      el.innerHTML = `<span>${c}</span>`;
      qRows[row].append(el);
      el.dataset.x = x;
      return el;
    });
    const placeWords = () => wordEls.forEach((el) => {
      const W = el.parentElement.clientWidth, ww = el.offsetWidth;
      el.style.left = `${clamp(+el.dataset.x * W, 0, W - ww)}px`;
    });
    placeWords();
    addEventListener("resize", placeWords);
    cleanups.push(() => removeEventListener("resize", placeWords));
    const qRules = A.qa(".a-rule", quote), qBtn = A.q("[data-trailer-open]", quote);
    if (A.reduce) gsap.set(wordEls, { clipPath: QUOTE.clipTo });
    else {
      const tl = keep(gsap.timeline({ paused: true }));
      tl.fromTo(qRules, { scaleX: 0 }, { scaleX: 1, duration: QUOTE.ruleDuration, ease: "energy", stagger: 0.06 }, 0);
      tl.fromTo(wordEls, { clipPath: QUOTE.clipFrom }, { clipPath: QUOTE.clipTo, duration: QUOTE.lineDuration, ease: "energy", stagger: QUOTE.lineStagger }, QUOTE.lineStart);
      tl.fromTo(wordEls.map((e) => e.firstChild), { y: QUOTE.lineRise }, { y: 0, duration: QUOTE.lineDuration, ease: "energy", stagger: QUOTE.lineStagger }, QUOTE.lineStart);
      const p = btnParts(qBtn);
      tl.fromTo(p.lines, { scaleX: 0 }, { scaleX: 1, duration: QUOTE.btnDuration, ease: "energy" }, QUOTE.btnStart);
      tl.fromTo(p.text, { yPercent: QUOTE.btnShift }, { yPercent: 0, duration: QUOTE.btnDuration, ease: "energy" }, QUOTE.btnStart);
      keep(ScrollTrigger.create({ trigger: quote, start: "top bottom", once: true, onEnter: () => tl.play() }));
    }

    // ── Storyline
    const syn = A.lineWrap(A.q(".d-desc__synopsis", root));
    if (!A.reduce) keep(gsap.fromTo(syn, { yPercent: 120 }, { yPercent: 0, duration: 0.8, ease: "energy", stagger: 0.09, scrollTrigger: { trigger: A.q(".d-desc", root), start: "top 85%", once: true } }));

    // ── Trailer act
    const lb = A.q("[data-trailer-lightbox]", root);
    const strips = A.qa(".d-lightbox__strip", lb), canvas = A.q(".d-lightbox__canvas", lb), stage = A.q(".d-lightbox__stage", lb), player = A.q(".d-lightbox__player", lb), ui = A.q(".d-lightbox__ui", lb);
    let lbTl = null;
    const openLb = (e) => {
      e.preventDefault();
      lbTl?.kill();
      lb.setAttribute("data-open", "");
      lb.setAttribute("aria-hidden", "false");
      A.lenis?.stop();
      const d = A.reduce ? 0 : 1;
      lbTl = gsap.timeline();
      lbTl.fromTo(strips, { scaleY: 0, opacity: 1 }, { scaleY: 1, duration: LB.stripDuration * d, ease: "energy" }, 0);
      lbTl.set(canvas, { opacity: 1 }, LB.stripDuration * d);
      lbTl.to(strips, { opacity: 0, duration: LB.plateFadeDuration * d, ease: "energy" }, (LB.stripDuration + LB.plateFadeAt * LB.openDuration) * d);
      lbTl.fromTo(stage, { scale: LB.stageScaleFrom }, { scale: 1, duration: LB.openDuration * d, ease: "energy" }, LB.stripDuration * d);
      lbTl.fromTo(player, { opacity: 0 }, { opacity: 1, duration: LB.videoFadeDuration * d, ease: "energy" }, (LB.stripDuration + LB.videoRevealAt * LB.openDuration) * d);
      lbTl.fromTo(ui, { opacity: 0 }, { opacity: 1, duration: LB.uiFadeDuration * d, ease: "energy" }, (LB.stripDuration + LB.uiRevealAt * LB.openDuration) * d);
    };
    const closeLb = (e) => {
      e?.preventDefault();
      if (!lb.hasAttribute("data-open")) return;
      lbTl?.kill();
      lbTl = gsap.timeline({ onComplete: () => { lb.removeAttribute("data-open"); lb.setAttribute("aria-hidden", "true"); A.lenis?.start(); } });
      lbTl.to([ui, player], { opacity: 0, duration: LB.closeDuration * 0.4, ease: "energy" }, 0);
      lbTl.to(canvas, { opacity: 0, duration: LB.closeDuration * 0.6, ease: "energy" }, LB.closeDuration * 0.4);
    };
    qBtn?.addEventListener("click", openLb);
    A.q("[data-trailer-close]", lb)?.addEventListener("click", closeLb);
    const onEsc = (e) => { if (e.key === "Escape") closeLb(); };
    addEventListener("keydown", onEsc);
    cleanups.push(() => { qBtn?.removeEventListener("click", openLb); removeEventListener("keydown", onEsc); lbTl?.kill(); A.lenis?.start(); });

    // ── Next work
    const next = A.q("[data-scroll-next]", root);
    const nextData = JSON.parse(A.q("script[data-next]", next).textContent)[0];
    const nRows = A.qa(".d-next__row", next);
    const tWords = nextData.title.split(" ");
    const tSlots = [[2, 0.31], [3, 0.58], [1, 0.12]];
    const titleEls = tWords.slice(0, 3).map((t, i) => {
      const el = document.createElement("p");
      el.className = "t-heading-l d-word";
      el.innerHTML = `<span>${t}</span>`;
      nRows[tSlots[i][0]].append(el);
      el.dataset.x = tSlots[i][1];
      return el;
    });
    const placeTitle = () => titleEls.forEach((el) => { const W = el.parentElement.clientWidth; el.style.left = `${clamp(+el.dataset.x * W, 0, W - el.offsetWidth)}px`; });
    placeTitle();
    addEventListener("resize", placeTitle);
    cleanups.push(() => removeEventListener("resize", placeTitle));
    const nRules = A.qa(".a-rule", next);
    if (A.reduce) gsap.set(titleEls, { clipPath: QUOTE.clipTo });
    else {
      const tl = keep(gsap.timeline({ paused: true }));
      tl.fromTo(nRules, { scaleX: 0 }, { scaleX: 1, duration: QUOTE.ruleDuration, ease: "energy", stagger: 0.06 }, 0);
      tl.fromTo(titleEls, { clipPath: QUOTE.clipFrom }, { clipPath: QUOTE.clipTo, duration: 0.8, ease: "energy", stagger: 0.09 }, QUOTE.lineStart);
      tl.fromTo(titleEls.map((e) => e.firstChild), { y: QUOTE.lineRise }, { y: 0, duration: 0.8, ease: "energy", stagger: 0.09 }, QUOTE.lineStart);
      keep(ScrollTrigger.create({ trigger: next, start: "top 70%", once: true, onEnter: () => tl.play() }));
    }

    const stageD = A.discStage();
    const host = A.q("[data-disc-canvas]", next);
    stageD.mount(host);
    const disc = stageD.makeDisc(A.discArt(nextData));
    const fillRing = stageD.makeScribble();
    const DG = new THREE.Group();
    DG.add(disc.group, fillRing.group);
    stageD.scene.add(DG);
    const N = { arrive: 0, push: 0, exit: 0, gone: false };
    const rad = THREE.MathUtils.degToRad;
    const arriveST = ScrollTrigger.create({ trigger: next, start: "top bottom", end: "bottom bottom" });
    let fillLast = 0;
    const nextTick = () => {
      const r = arriveST.progress;
      N.arrive = 1 - (1 - clamp((r - NEXT.arriveStart) / (NEXT.arriveEnd - NEXT.arriveStart), 0, 1)) ** 3;
      const visH = 2 * stageD.camera.position.z * Math.tan(rad(stageD.camera.fov / 2));
      const hostH = host.clientHeight || innerHeight;
      const unit = visH / hostH;
      const R = (Math.min(NEXT.discVh / 100 * innerHeight, (innerWidth <= 991 ? 1.08 : 1.3) * innerWidth) / 2) * unit;
      const restY = visH / 2 - 0.75 * visH - R * 0.98;
      const a = N.arrive;
      disc.group.scale.setScalar(R * (1 + N.push * (NEXT.pushGrow - 1)));
      disc.group.position.set(0, restY - (1 - a) * R * 1.9 + N.push * NEXT.pushLift * R + N.exit * NEXT.exitLift * visH * 2, 0);
      disc.group.rotation.set(rad(NEXT.arriveTiltX + (NEXT.restTiltX - NEXT.arriveTiltX) * a), rad(NEXT.arriveTiltY + (NEXT.restTiltY - NEXT.arriveTiltY) * a), 0);
      disc.spin.rotation.z = rad(NEXT.exitSpin) * N.exit * 6 + N.push * rad(-6);
      disc.group.visible = a > 0.001;
      fillRing.group.position.copy(disc.group.position);
      fillRing.group.quaternion.copy(disc.group.quaternion);
      fillRing.group.scale.copy(disc.group.scale);
      const now = performance.now();
      fillRing.group.visible = N.push > 0.02 && !N.exit && !A.reduce;
      if (fillRing.group.visible && now - fillLast > 1000 / NEXT.fillFps) { fillLast = now; fillRing.draw(Math.min(1, N.push)); }
      stageD.render();
    };
    gsap.ticker.add(nextTick);

    // After scrolling to the end, pushing further gathers up and then moves on
    let pushTimer = 0;
    const goNext = () => {
      if (N.gone) return;
      N.gone = true;
      gsap.to(N, { exit: 1, duration: NEXT.exitDuration, ease: "power2.in", onComplete: () => {
        const href = A.q("[data-scroll-next-link]", next).getAttribute("href");
        if (window.barba && /^https?:$/.test(location.protocol)) barba.go(href); else location.href = href;
      } });
    };
    const atEnd = () => Math.ceil((A.lenis ? A.lenis.scroll : scrollY) + innerHeight) >= document.documentElement.scrollHeight - 2;
    const onWheel = (e) => {
      if (N.gone || e.deltaY <= 0 || !atEnd() || arriveST.progress < 0.99) return;
      gsap.killTweensOf(N, "push");
      N.push = Math.min(1, N.push + e.deltaY / NEXT.pushWheel);
      clearTimeout(pushTimer);
      if (N.push >= 1) { goNext(); return; }
      pushTimer = setTimeout(() => gsap.to(N, { push: 0, duration: 0.6, ease: "energy" }), 350);
    };
    addEventListener("wheel", onWheel, { passive: true });
    cleanups.push(() => {
      removeEventListener("wheel", onWheel);
      clearTimeout(pushTimer);
      gsap.ticker.remove(nextTick);
      gsap.killTweensOf(N);
      stageD.scene.remove(DG);
      disc.front.material.map?.dispose();
      disc.dispose();
      fillRing.dispose();
    });

    return {
      destroy() {
        tweens.forEach((t) => t.kill());
        disST?.kill();
        if (disTick) gsap.ticker.remove(disTick);
        arriveST.kill();
        cleanups.forEach((f) => f());
      },
    };
  };
  A.page("production", mount);
})();
