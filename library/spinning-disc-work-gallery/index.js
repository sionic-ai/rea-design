// Works and television disc gallery — a three disc row with the original settings copied as is.
// Placement (disc i, current spot L): m=i-L, each m×.35, x=sin(angle)×2.3×2.4, z=2.4(1−cos angle), center y +.06, other sizes max(.8, 1−|m|×.2×.6),
// Whole row X·Y −30°·1.08x. One wheel tick moves one cell in .51s discGlide(.32,.72,0,1), arrow keys .42+.05×distance (≤.6), press .45+.11×distance (.46~1.05),
// After releasing a drag, inertia (friction .89) is followed by a .46s power3.out snap. Moving the mouse over the central disc tilts it by .21, and two layers of scribble circles are redrawn at 10fps.
(() => {
  const A = (window.A24 ||= {});
  const W = {
    galleryScale: 1.08, hGap: 2.3, depthGap: 1, activeDiscY: 0.06, galleryRotX: -30, galleryRotY: -30, inactiveScale: 0.8,
    hoverTiltStrength: 0.21, dragSensitivity: 0.95, friction: 0.89, dragStartDistance: 5, snapDuration: 0.46,
    flowLean: 0.055, flowLeanMax: 0.3, flowBank: 0.32, flowDip: 0.014, flowDipMax: 0.09,
    followTight: 15, followBase: 11, followFalloff: 1.15, followMin: 6.5,
    flightRecede: 2.2, flightStagger: 0.45, flightStaggerIn: 0.28, flightStaggerMax: 4, flightPopScale: 0.35, flightPopScaleIn: 0.02,
    preloadSpin: 1.1, preloadRiseFrom: 3, preloadFanDuration: 1.15,
    touchActiveScale: 1.5, touchInactiveScale: 0.6, touchFlickVelocity: 0.035,
    wheelStepThreshold: 6, wheelEventCap: 24, wheelPauseGap: 130, wheelIdleReset: 150, wheelMinStepTick: 90, wheelSustainDelay: 480, wheelSustainRatio: 0.8,
    renderRadius: 5,
  };
  // Text change (original discTransitions): exit .4s, line stagger .016, up 120%, enter .7s, line .05, group .035, from 120% below, .06 between info → review
  const TX = { settleDelay: 100, outDuration: 0.4, outLineStagger: 0.016, outShift: -120, inDuration: 0.7, inLineStagger: 0.05, inItemStagger: 0.035, inGroupGap: 0.06, inShift: 120 };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rad = THREE.MathUtils.degToRad;

  const mount = (root) => {
    const sec = A.q("[data-disc-gallery]", root);
    if (!sec) return {};
    sec.setAttribute("data-lenis-prevent", "");
    const films = JSON.parse(A.q("script[data-films]", sec).textContent);
    const host = A.q("[data-disc-canvas]", sec);
    const stage = A.discStage();
    stage.mount(host);
    const G = new THREE.Group();
    G.rotation.set(rad(W.galleryRotX), rad(W.galleryRotY), 0);
    G.scale.setScalar(W.galleryScale);
    stage.scene.add(G);
    const discs = films.map((f, i) => {
      const d = stage.makeDisc(A.discArt(f));
      d.index = i;
      d.hover = 0;
      d.group.visible = false;
      G.add(d.group);
      return d;
    });
    const scrib = stage.makeScribble();
    G.add(scrib.group);

    const S = { L: 0, target: 0, prevL: 0, flow: 0, active: 0, others: 0, inbound: false, rise: 1, turn: 1, exit: 0, exitSpin: 0, hoverIdx: -1, px: 0, py: 0, dragging: false, alive: true };
    let cur = 0;
    const narrow = () => stage.camera.aspect < 1;

    // ── Layout: original br() as is (on phone one disc is enlarged to fit the screen width, with the next disc slightly visible on the right)
    const layout = (dt, snap) => {
      const n = Math.round(clamp(S.L, 0, films.length - 1));
      const lean = !A.reduce ? clamp(Math.sign(S.flow) * Math.sqrt(Math.abs(S.flow)) * W.flowLean, -W.flowLeanMax, W.flowLeanMax) : 0;
      const dip = !A.reduce ? Math.min(W.flowDipMax, Math.abs(S.flow) * W.flowDip) : 0;
      const follow = S.dragging ? W.followTight : W.followBase;
      const touch = narrow();
      const visW = 2 * stage.camera.position.z * Math.tan(rad(stage.camera.fov / 2)) * stage.camera.aspect;
      discs.forEach((d, i) => {
        const m = i - S.L, h = Math.abs(m), on = i === n;
        if (h > W.renderRadius + 1) { d.group.visible = false; return; }
        const ang = m * 0.35;
        let x = Math.sin(ang) * W.hGap * 2.4, y = (on ? W.activeDiscY : 0) - dip * (on ? 0.7 : 1), z = -Math.cos(ang) * W.depthGap * 2.4 + W.depthGap * 2.4;
        let ry = -ang + lean * (on ? 1 : 1.12);
        let sc = on ? 1 : Math.max(W.inactiveScale, 1 - h * (1 - W.inactiveScale) * 0.6);
        if (touch) {
          const big = (visW * 0.46) / W.galleryScale;
          x = (m * visW * 0.58) / W.galleryScale / 0.866;
          y = (on ? 0 : -h * 0.12 * big) - dip;
          z = -h * 0.5;
          ry = clamp(-m, 0, 1) * -2 * rad(W.galleryRotY) * 0.3 + lean;
          sc = on ? big : big * (W.touchInactiveScale / W.touchActiveScale);
        }
        const rz = -lean * W.flowBank * (on ? 0.7 : 1);
        let vis = true;
        if (on) sc *= S.active;
        else {
          const e = clamp(S.others, 0, 2);
          const st = clamp(S.inbound ? W.flightStaggerIn : W.flightStagger, 0, 0.9);
          const lag = (Math.min(h, W.flightStaggerMax) / W.flightStaggerMax) * st;
          const o = clamp((Math.min(1, e) - lag) / Math.max(0.1, 1 - st), 0, 1);
          const s = (S.inbound ? 1 - (1 - o) ** 3 : o * (2 - o)) + Math.max(0, e - 1);
          vis = s > (S.inbound ? W.flightPopScaleIn : W.flightPopScale);
          sc *= s;
          z -= (1 - Math.min(1, s)) * W.flightRecede;
        }
        // First entrance: the center disc rises from below (3) spinning 1.1 turns
        if (on && S.rise < 1) { y -= (1 - S.rise) * W.preloadRiseFrom; }
        // Leaving for detail: the disc flies upward while rolling half a turn onto its side
        if (on && S.exit > 0) { y += S.exit * 3.2; z += S.exit * 0.8; }
        d.group.visible = vis && sc > 0.001;
        const hoverOn = S.hoverIdx === i && !S.dragging ? 1 : 0;
        d.hover += (hoverOn - d.hover) * Math.min(1, dt * 10);
        const tiltX = d.hover * W.hoverTiltStrength * S.py, tiltY = d.hover * W.hoverTiltStrength * S.px;
        const k = snap ? 1 : Math.min(1, dt * clamp(follow - h * W.followFalloff, W.followMin, W.followTight));
        const g = d.group;
        g.position.x += (x - g.position.x) * k;
        g.position.y += (y - g.position.y) * k;
        g.position.z += (z - g.position.z) * k;
        g.rotation.x += (tiltX - g.rotation.x) * k;
        g.rotation.y += (ry + tiltY - g.rotation.y) * k;
        g.rotation.z += (rz - g.rotation.z) * k;
        const ts = Math.max(1e-4, sc);
        g.scale.setScalar(g.scale.x + (ts - g.scale.x) * (snap ? 1 : Math.min(1, k * 1.4)));
        d.spin.rotation.z = on ? (1 - S.turn) * W.preloadSpin * Math.PI * 2 : 0;
        d.spin.rotation.y = on ? S.exitSpin : 0;
      });
      return n;
    };

    // ── Doodle circle state (original ji): entering .3→.5→.72→1, leaving .72→.5→.3, 100ms per step. Follows the disc position late with 1−e^(−15·dt)
    const SC = A.DISC;
    let sState = "hidden", sStep = 0, sLast = 0, sFor = -1;
    const settled = () => !S.dragging && Math.abs(S.L - Math.round(S.L)) < 0.0015 && !gsap.isTweening(S);
    const scribble = (now, dt) => {
      const want = S.alive && S.active >= 0.999 && S.exit === 0 && (A.coarse || S.hoverIdx === cur) && settled();
      const d = discs[want ? cur : sFor];
      const follow = (snap) => {
        if (!d) return;
        const f = snap ? 1 : 1 - Math.exp(-SC.scribbleLag * dt);
        scrib.group.position.lerp(d.group.position, f);
        scrib.group.quaternion.slerp(d.group.quaternion, f);
        scrib.group.scale.lerp(d.group.scale, f);
      };
      const gap = 1000 / SC.scribbleFps;
      if (!want) {
        if (sState === "hidden") return;
        if (sState !== "out") { sState = "out"; sStep = 0; sLast = now; }
        follow(false);
        if (now - sLast < gap) return;
        sLast = now;
        if (sStep >= SC.scribbleOut.length) { sState = "hidden"; scrib.group.visible = false; sFor = -1; return; }
        scrib.draw(SC.scribbleOut[sStep++]);
        return;
      }
      if (sState === "hidden" || sFor !== cur) {
        sState = "in"; sStep = 1; sFor = cur; sLast = now;
        follow(true);
        scrib.draw(SC.scribbleIn[0]);
        scrib.group.visible = !A.reduce;
        return;
      }
      follow(false);
      if (A.reduce || now - sLast < gap) return;
      sLast = now;
      if (sState === "in" && sStep < SC.scribbleIn.length) scrib.draw(SC.scribbleIn[sStep++]);
      else { sState = "on"; scrib.draw(1); }
    };

    // ── Work info text swap
    const info = A.q(".g-info", sec), reviews = A.q(".g-reviews", sec);
    const fields = (k) => A.qa(`[data-film-target="${k}"]`, sec);
    const lines = (scope) => [...A.qa("[data-film-target]", scope).flatMap((el) => A.lineWrap(el)), ...A.qa("[data-film-stars]", scope)];
    const rules = A.qa("[data-film-rule]", sec);
    const starsHtml = (n) => {
      const svg = A.q(".g-review__stars svg", sec)?.outerHTML.replace(/ class="[^"]*"/, "") || "";
      return Array.from({ length: 5 }, (_, i) => svg.replace("<svg", `<svg class="${i + 1 <= n ? "" : i + 0.5 <= n ? "is-half" : "is-off"}"`)).join("");
    };
    const fill = (f) => {
      A.setText(fields("title")[0], f.title);
      A.setText(fields("director")[0], f.director);
      A.setText(fields("year")[0], f.year);
      A.setText(fields("starring")[0], f.starring.join("<br>"));
      A.qa("[data-review]", sec).forEach((r, i) => {
        const v = f.reviews[i] || {};
        A.setText(A.q('[data-film-target="pub"]', r), v.pub || "");
        A.setText(A.q('[data-film-target="quote"]', r), v.quote || "");
        A.q("[data-film-stars]", r).innerHTML = starsHtml(v.stars || 0);
      });
    };
    let swapTl = null, swapTimer = 0, shown = 0;
    const textIn = (delay = 0) => {
      const tl = gsap.timeline({ delay });
      const a = lines(info), b = lines(reviews);
      if (A.reduce) { gsap.set([...a, ...b], { yPercent: 0 }); gsap.set(rules, { scaleX: 1 }); return tl; }
      tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "energy", stagger: TX.inItemStagger }, 0);
      tl.fromTo(a, { yPercent: TX.inShift }, { yPercent: 0, duration: TX.inDuration, ease: "energy", stagger: TX.inLineStagger }, 0);
      tl.fromTo(b, { yPercent: TX.inShift }, { yPercent: 0, duration: TX.inDuration, ease: "energy", stagger: TX.inItemStagger }, TX.inGroupGap);
      return tl;
    };
    const textOut = () => {
      const all = [...lines(info), ...lines(reviews)];
      return gsap.to(all, { yPercent: TX.outShift, duration: TX.outDuration, ease: "energy", stagger: TX.outLineStagger, overwrite: true });
    };
    const swapTo = (i) => {
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        if (i === shown || !S.alive) return;
        shown = i;
        swapTl?.kill();
        if (A.reduce) { fill(films[i]); textIn(); return; }
        swapTl = gsap.timeline();
        swapTl.add(textOut());
        swapTl.call(() => { if (shown === i) { fill(films[i]); swapTl.add(textIn(), ">"); } });
      }, TX.settleDelay);
    };

    // ── Flipping
    const go = (i, source = "snap") => {
      const to = clamp(i, 0, films.length - 1), dist = Math.abs(to - S.L);
      const sd = W.snapDuration;
      const v = {
        wheel: { duration: sd + 0.05, ease: "discGlide", kick: 2.5 },
        key: { duration: Math.min(0.6, sd - 0.04 + dist * 0.05), ease: "discGlide", kick: 4 },
        click: { duration: clamp(0.45 + dist * 0.11, sd, 1.05), ease: "discGlide", kick: Math.min(5, dist * 1.4) },
        flick: { duration: sd + 0.1, ease: "discGlide", kick: 0 },
        snap: { duration: sd, ease: "power3.out", kick: 0 },
      }[source];
      gsap.killTweensOf(S, "L");
      S.target = to;
      if (!A.reduce && v.kick) S.flow = clamp(S.flow + Math.sign(to - S.L) * v.kick, -12, 12);
      if (A.reduce) { S.L = to; return; }
      gsap.to(S, { L: to, duration: v.duration, ease: v.ease });
    };
    const openDetail = (i) => {
      const href = films[i]?.href || "detail.html";
      if (window.barba && /^https?:$/.test(location.protocol)) barba.go(href);
      else location.href = href;
    };

    // Wheel — one step per gesture. A gap over 130ms starts a new gesture, and pushing at the same strength for over 480ms gives one more step
    let wAcc = 0, wDir = 0, wLast = 0, wStep = -1e9, wPeak = 0, wGesture = false;
    const onWheel = (e) => {
      if (!S.alive || S.active < 0.99) return;
      e.preventDefault();
      const dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const mag = Math.abs(dy) * (e.deltaMode === 1 ? 16 : 1);
      const now = performance.now(), gapMs = now - wLast;
      wLast = now;
      if (gapMs > W.wheelIdleReset) { wGesture = false; wAcc = 0; wPeak = 0; }
      const dir = dy > 0 ? 1 : -1;
      if (dir !== wDir) { wAcc = 0; wDir = dir; }
      wPeak = Math.max(wPeak * 0.9, mag);
      wAcc += Math.min(mag, W.wheelEventCap);
      const fresh = !wGesture && (gapMs >= W.wheelPauseGap || now - wStep >= W.wheelMinStepTick);
      const sustain = wGesture && now - wStep >= W.wheelSustainDelay && mag >= wPeak * W.wheelSustainRatio;
      if (wAcc < W.wheelStepThreshold || !(fresh || sustain)) return;
      wGesture = true; wStep = now; wAcc = 0;
      go(S.target + dir, "wheel");
    };

    // Drag — must move over 5px to count as a drag, on release inertia then the nearest slot
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const pickAt = (cx, cy) => {
      const r = sec.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, stage.camera);
      const hit = ray.intersectObjects(discs.filter((d) => d.group.visible).map((d) => d.pick), false)[0];
      return hit ? discs.find((d) => d.pick === hit.object).index : -1;
    };
    let down = null, vel = 0, lastX = 0, lastT = 0;
    const onDown = (e) => {
      if (!S.alive || S.active < 0.99 || e.button > 0) return;
      down = { x: e.clientX, y: e.clientY, L: S.L, moved: false, id: e.pointerId };
      lastX = e.clientX; lastT = performance.now(); vel = 0;
    };
    const onMove = (e) => {
      const r = sec.getBoundingClientRect();
      S.px = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      S.py = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      if (!down) {
        if (e.pointerType === "mouse") {
          S.hoverIdx = pickAt(e.clientX, e.clientY);
          sec.style.cursor = S.hoverIdx >= 0 ? "pointer" : "grab";
        }
        return;
      }
      const dx = e.clientX - down.x;
      if (!down.moved && Math.hypot(dx, e.clientY - down.y) < W.dragStartDistance) return;
      if (!down.moved) {
        down.moved = true; S.dragging = true; S.hoverIdx = -1;
        sec.setAttribute("data-disc-dragging", "");
        gsap.killTweensOf(S, "L");
        down.L = S.L; down.x = e.clientX;
      }
      const span = narrow() ? r.width * 0.7 : r.width * 0.35;
      S.L = clamp(down.L - ((e.clientX - down.x) / span) * W.dragSensitivity, -0.35, films.length - 0.65);
      const now = performance.now();
      vel = (-(e.clientX - lastX) / span) * W.dragSensitivity / Math.max(1, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
    };
    const onUp = (e) => {
      if (!down) return;
      const d = down;
      down = null;
      if (!d.moved) {
        const i = pickAt(e.clientX, e.clientY);
        if (i < 0) return;
        if (i === cur) openDetail(i);
        else go(i, "click");
        return;
      }
      S.dragging = false;
      sec.removeAttribute("data-disc-dragging");
      // Inertia: decays by .89 each frame and snaps to the nearest cell from where it drifted
      let L = S.L, v = clamp(vel, -0.5, 0.5);
      for (let k = 0; k < 120 && Math.abs(v) > 1e-4; k++) { L += v; v *= W.friction; }
      const flick = narrow() && Math.abs(vel) > W.touchFlickVelocity;
      go(flick ? Math.round(S.L) + Math.sign(vel) : Math.round(L), flick ? "flick" : "snap");
    };
    const onLeave = () => { S.hoverIdx = -1; };
    const onKey = (e) => {
      if (!S.alive || S.active < 0.99 || /input|textarea/i.test(document.activeElement?.tagName || "")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(S.target + 1, "key"); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(S.target - 1, "key"); }
      else if (e.key === "Enter" && document.activeElement === sec) openDetail(cur);
    };
    sec.addEventListener("wheel", onWheel, { passive: false });
    sec.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    sec.addEventListener("pointerleave", onLeave);
    addEventListener("keydown", onKey);

    // ── Every frame
    let lastNow = performance.now();
    const tick = () => {
      const now = performance.now(), dt = clamp((now - lastNow) / 1000, 1 / 240, 0.1);
      lastNow = now;
      const e = clamp((S.L - S.prevL) / dt, -40, 40);
      S.prevL = S.L;
      S.flow += (e - S.flow) * Math.min(1, dt * (Math.abs(e) > Math.abs(S.flow) ? 14 : 6));
      if (Math.abs(S.flow) < 0.01) S.flow = 0;
      const n = layout(dt, false);
      if (n !== cur) {
        cur = n;
        A.navActive?.(n);
        swapTo(n);
      }
      scribble(now, dt);
      stage.render();
    };

    // ── Enter·Exit
    const fan = (inbound, dur) => {
      S.inbound = inbound;
      const tl = gsap.timeline();
      tl.to(S, { active: 1, duration: dur, ease: "discGlide" }, 0);
      tl.to(S, { others: 1, duration: dur * 0.85, ease: "none" }, dur * 0.1);
      return tl;
    };
    const intro = A.nextIntro;
    if (intro || A.reduce) A.q(".g-reviews", sec).style.animation = "none";
    fill(films[0]);
    A.navActive?.(0);
    gsap.set([...lines(info), ...lines(reviews)], { yPercent: TX.inShift });
    gsap.set(rules, { scaleX: 0 });
    if (A.reduce) {
      Object.assign(S, { active: 1, others: 1, rise: 1, turn: 1 });
      textIn();
    } else if (intro === "flip" || intro === "fade" || intro === "detail") {
      fan(true, A.T.flipIn);
      textIn(A.T.flipIn * 0.35);
    } else {
      // First visit (original loader measured 2.68s): nav is up at 83ms and stays still for 1.5s while the original image loads,
      // From 1.58s the center disc rises spinning from below (.8 size) and other discs pop out in turn from behind (1.15s), changing most of the screen within .4s
      Object.assign(S, { active: 0.8, others: 0, rise: 0, turn: 0 });
      // The delay counts from when the document opened (performance.now 0) — waiting less by the time spent loading three and waiting for fonts (adding .25s until the first paint, making 1.8)
      const tl = gsap.timeline({ delay: Math.max(0.1, 1.8 - performance.now() / 1000) });
      tl.to(S, { rise: 1, turn: 1, duration: 2, ease: "expo.out" }, 0);
      tl.add(fan(false, W.preloadFanDuration), 0.05);
      tl.add(textIn(), W.preloadFanDuration * 0.45);
      // The original nav builds the ”list” item only after receiving all disc images (siteNavLoadingApi.revealAll)
      const idx = A.q(".a-nav__index-li");
      if (idx) { gsap.set(idx, { autoAlpha: 0 }); tl.to(idx, { autoAlpha: 1, duration: 0.5, ease: "energy" }, 0.95); }
    }
    layout(0.016, true);
    gsap.ticker.add(tick);

    const out = (kind) => new Promise((res) => {
      S.alive = false;
      S.hoverIdx = -1;
      gsap.killTweensOf(S);
      const tl = gsap.timeline({ onComplete: res });
      tl.add(textOut(), 0);
      if (kind === "detail") {
        // Original plate exits in .8s (half turn π/2 lying down), the rest recede in .55s
        tl.to(S, { exit: 1, duration: A.T.detailExit, ease: "power2.in" }, 0);
        tl.to(S, { exitSpin: Math.PI / 2, duration: A.T.detailExit, ease: "energy" }, 0);
        tl.to(S, { others: 0, duration: A.T.detailOut, ease: "power2.in" }, 0);
      } else {
        S.inbound = false;
        tl.to(S, { others: 0, duration: A.T.flipOut, ease: "power2.in" }, 0);
        tl.to(S, { active: 0, duration: A.T.flipOut, ease: "power2.in" }, 0.05);
      }
    });
    sec.__gallery = { out };
    root.__gallery = sec.__gallery;
    A.gallery = { films: root.dataset.barbaNamespace, go: (i, src) => go(i, src) };

    return {
      destroy() {
        S.alive = false;
        gsap.ticker.remove(tick);
        gsap.killTweensOf(S);
        swapTl?.kill();
        clearTimeout(swapTimer);
        sec.removeEventListener("wheel", onWheel);
        sec.removeEventListener("pointerdown", onDown);
        removeEventListener("pointermove", onMove);
        removeEventListener("pointerup", onUp);
        sec.removeEventListener("pointerleave", onLeave);
        removeEventListener("keydown", onKey);
        discs.forEach((d) => { G.remove(d.group); d.front.material.map?.dispose(); d.dispose(); });
        G.remove(scrib.group);
        scrib.dispose();
        stage.scene.remove(G);
        A.gallery = null;
        A.navActive?.(-1);
      },
    };
  };
  A.page("films", mount);
  A.page("television", mount);
})();
