// Home. Original values: camera curve cubic-bezier(.77,0,.175,1) 1s · entrance (.23,1,.32,1) · blur-out (.4,0,.2,1)
// Previous sentence recedes to .32 · scroll length = Screen height × timeline length × .78 · scrub .5
// At 1100px or wider with motion allowed: a fixed-screen cinematic, otherwise a vertical read where color panels stack sticky.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, DrawSVGPlugin, Draggable);
  const root = document.documentElement;
  const IDS = ["founder", "why", "features", "try", "pricing", "faq", "privacy"];
  // Skin variables as #rrggbb that gsap and the color picker can read — gsap can’t read color-mix or oklch expressions, so one point is painted and read back
  const cssColor = (() => {
    const cx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    const probe = document.createElement("i");
    return (name) => {
      probe.style.color = `var(${name})`;
      document.body.append(probe);
      cx.fillStyle = getComputedStyle(probe).color;
      probe.remove();
      cx.fillRect(0, 0, 1, 1);
      return "#" + [...cx.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join("");
    };
  })();
  const INK = cssColor("--kf-on-accent");
  const camEase = CustomEase.create("mp-camera", "0.77,0,0.175,1");
  const reveal = CustomEase.create("mp-reveal", "0.23,1,0.32,1");
  const fade = CustomEase.create("mp-fade", "0.4,0,0.2,1");
  const DIM = 0.32;

  const world = document.querySelector("[data-map-world]");
  const exp = document.querySelector(".map-experience");
  const vp = document.querySelector(".map-viewport");
  const camera = document.querySelector(".map-camera");
  const ch = {};
  document.querySelectorAll("[data-chapter]").forEach((el) => {
    const d = el.dataset;
    ch[el.id] = { el, label: el.querySelector(".chapter-label"), x: +d.x, y: +d.y, w: +d.w, h: +d.h };
    ["x", "y", "w", "h"].forEach((k) => el.style.setProperty(`--${k}`, `${d[k]}px`));
  });
  const overlays = Object.fromEntries(IDS.map((id) => [id, document.querySelector(`[data-story-overlay="${id}"]`)]));
  const beats = Object.fromEntries(IDS.map((id) => [id, [...document.querySelectorAll(`[data-beat^="${id}-"]`)]]));
  const railLinks = [...document.querySelectorAll(".mp-rail__nav [data-scene]")];
  const hashScene = () => (ch[location.hash.slice(1)] ? location.hash.slice(1) : null);
  const markRail = (id) => railLinks.forEach((a) => (a.dataset.scene === id ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
  const setHash = (id) => location.hash !== `#${id}` && history.replaceState(history.state, "", `#${id}`);

  // ── Cinematic ──
  function cinematic() {
    root.classList.add("cinematic-mode");
    const splits = new Map();
    document.querySelectorAll(".story-overlay .story-beat h1, .story-overlay .story-beat h2").forEach((h) => splits.set(h, SplitText.create(h, { type: "words,chars" })));

    const RAIL = 300;
    let cx = 0, cy = 0, scene = "founder", ready = false;
    const overview = {}, zoom = {}, labelSize = {};
    // Scale at which the whole map fits in the empty space right of the contents card (max .28), the section pill is the smaller of 48% width and 55% height
    function measure() {
      const W = vp.clientWidth || innerWidth, usable = Math.max(760, W - RAIL), H = vp.clientHeight || innerHeight;
      cx = RAIL + usable / 2;
      cy = H / 2;
      const cs = IDS.map((id) => ch[id]);
      const minX = Math.min(...cs.map((c) => c.x)), minY = Math.min(...cs.map((c) => c.y));
      const bw = Math.max(...cs.map((c) => c.x + c.w)) - minX, bh = Math.max(...cs.map((c) => c.y + c.h)) - minY;
      const s = Math.min((usable - 110) / bw, (H - 100) / bh, 0.28);
      Object.assign(overview, { scale: s, x: cx - (minX + bw / 2) * s, y: cy - (minY + bh / 2) * s });
      IDS.forEach((id) => {
        const c = ch[id], ls = labelSize[id] || (labelSize[id] = { w: 520, h: 190 });
        ls.w = c.label.offsetWidth || ls.w;
        ls.h = c.label.offsetHeight || ls.h;
        const z = Math.min((usable * 0.48) / ls.w, (H * 0.55) / ls.h);
        zoom[id] = Object.assign(zoom[id] || {}, { scale: z, x: cx - (c.x + c.w / 2) * z, y: cy - (c.y + c.h / 2) * z });
      });
    }
    const FULL = "inset(0px 0px 0px 0px round 0px)";
    // A clip in the same pill shape pulled to the screen center — once it expands to the full screen here, the pill color becomes the next section’s background
    function pill(id) {
      const z = zoom[id], ls = labelSize[id];
      const W = Math.max(1, vp.clientWidth || innerWidth), H = Math.max(1, vp.clientHeight || innerHeight);
      const w = ls.w * z.scale, h = ls.h * z.scale, l = cx - w / 2, t = cy - h / 2;
      return `inset(${t}px ${W - l - w}px ${H - t - h}px ${l}px round ${h / 2}px)`;
    }
    const clipTo = (id) => ({ clipPath: () => pill(id) });
    const cam = (o) => ({ x: () => o.x, y: () => o.y, scale: () => o.scale, transformOrigin: "0 0", force3D: true });
    const toOverview = () => cam(overview);
    const toChapter = (id) => cam(zoom[id]);

    function setScene(id) {
      scene = id;
      IDS.forEach((k) => ch[k].el.classList.toggle("is-active", k === id));
      markRail(id);
      if (ready) setHash(id);
    }
    // When a color panel covers it, the map-side pills can’t be pressed
    let inertRaf = 0;
    const syncInert = () => {
      if (inertRaf) return;
      inertRaf = requestAnimationFrame(() => {
        inertRaf = 0;
        camera.inert = IDS.some((k) => Number(gsap.getProperty(overlays[k], "opacity")) > 0.01);
      });
    };

    measure();
    const labels = IDS.map((id) => ch[id].label);
    const edges = [...document.querySelectorAll(".map-edge")];
    const photo = document.querySelector("[data-story-photo]");
    const whyLines = [...document.querySelectorAll('[data-beat="why-a2"] p')];
    const papers = [...document.querySelectorAll('[data-beat="why-papers"] .paper')];
    const cards = [...document.querySelectorAll("[data-feature-card]")];
    const allBeats = IDS.flatMap((id) => beats[id]).concat(photo ? [photo] : []);
    gsap.set(world, toChapter("founder"));
    gsap.set(labels, { autoAlpha: 1 });
    gsap.set(edges, { drawSVG: "100%" });
    gsap.set(allBeats, { autoAlpha: 0 });
    gsap.set([...whyLines, ...papers, ...cards], { autoAlpha: 0 });
    gsap.set("[data-story-node]", { autoAlpha: 0 });
    gsap.set(ch.founder.label, { autoAlpha: 0, color: "transparent" });
    gsap.set(overlays.founder, { autoAlpha: 1, clipPath: FULL });
    const f1 = document.querySelector('[data-beat="founder-1"]');
    const f2 = document.querySelector('[data-beat="founder-2"]');
    gsap.set(f1, { autoAlpha: 1 });
    const PHOTO_FROM = { y: -120, rotation: 75, scale: 0.7, force3D: true };
    if (photo) gsap.set(photo, { autoAlpha: 0, ...PHOTO_FROM });
    setScene("founder");

    const start = hashScene();
    let intro = null;
    const h1split = splits.get(f1.querySelector("h1"));
    if ((!start || start === "founder") && h1split) {
      const each = Math.max(0.018, Math.min(0.034, 1.35 / h1split.chars.length));
      gsap.set(h1split.chars, { autoAlpha: 0 });
      intro = gsap.timeline({ delay: 0.12 }).to(h1split.chars, { autoAlpha: 1, duration: 0.045, ease: "none", stagger: each });
    }

    const tl = gsap.timeline({ paused: true, defaults: { ease: camEase }, onUpdate: syncInert });

    function headline(el, at) {
      const h = el.querySelector("h2"), sp = h && splits.get(h);
      if (!sp) return tl.to(el, { autoAlpha: 1, duration: 0.6, ease: fade }, at);
      tl.set(el, { autoAlpha: 1 }, at);
      const each = Math.max(0.008, Math.min(0.03, 0.7 / sp.chars.length));
      tl.fromTo(sp.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05, ease: "none", stagger: each }, at);
      const rest = [...el.children].filter((c) => c.tagName !== "H2");
      if (rest.length) {
        tl.set(rest, { autoAlpha: 0 }, at);
        tl.to(rest, { autoAlpha: 1, duration: 0.5, ease: fade }, `${at}+=0.5`);
      }
    }

    const marks = [];
    // One section: zoom in from hub to pill (1) → pill text disappears (.26) → pill clip expands to the screen (1) → tempos → folds back to the pill in reverse → retreats to the hub (1)
    function chapter(id, body) {
      const ov = overlays[id], lb = ch[id].label, A = `${id}-approach`, B = `${id}-beats`, X = `${id}-exit`, R = `${id}-return`;
      tl.addLabel(A);
      tl.to(world, { ...toChapter(id), duration: 1 });
      tl.to(lb, { color: "transparent", duration: 0.26, ease: fade }, `${A}+=0.74`);
      tl.addLabel(`${id}-expand`);
      tl.set(ov, { autoAlpha: 1 });
      tl.set(lb, { autoAlpha: 0 }, "<");
      tl.fromTo(ov, clipTo(id), { clipPath: FULL, duration: 1, ease: camEase, immediateRender: false });
      tl.addLabel(B, `${id}-expand+=0.68`);
      body(B);
      tl.addLabel(X);
      tl.to(beats[id], { autoAlpha: 0, duration: 0.4, ease: fade }, X);
      tl.to(ov, { ...clipTo(id), duration: 1, ease: camEase }, `${X}+=0.25`);
      tl.set(lb, { autoAlpha: 1, color: "transparent" });
      tl.set(ov, { autoAlpha: 0 }, "<");
      tl.to(lb, { color: INK, duration: 0.4, ease: fade });
      tl.addLabel(R);
      tl.to(world, { ...toOverview(), duration: 1 }, R);
      tl.to({}, { duration: 0.5 });
      marks.push({ id, from: tl.labels[A] + 0.55 });
    }
    const hold = (d) => tl.to({}, { duration: d });
    const q = (s) => document.querySelector(s);

    // The first section starts already unfolded. The photo falls from above rotating 75 degrees and stands at 9 degrees
    tl.addLabel("founder", 0);
    tl.addLabel("founder-beats", 0);
    tl.addLabel("founder-photo", 0);
    if (photo) {
      tl.fromTo(photo, PHOTO_FROM, { y: 0, rotation: 9, scale: 1, duration: 1.4, ease: reveal, immediateRender: true }, "founder-photo");
      tl.fromTo(photo, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: fade, immediateRender: true }, "founder-photo");
    } else hold(1.4);
    hold(0.2);
    tl.addLabel("founder-b2");
    tl.to(f1, { opacity: 0.35, duration: 0.55, ease: fade }, "founder-b2");
    if (photo) tl.to(photo, { opacity: 0.35, duration: 0.55, ease: fade }, "founder-b2");
    tl.to(f2, { autoAlpha: 1, duration: 0.55, ease: fade }, "founder-b2");
    hold(0.7);
    tl.addLabel("founder-exit");
    tl.to([f1, f2, photo].filter(Boolean), { autoAlpha: 0, duration: 0.4, ease: fade }, "founder-exit");
    tl.to(overlays.founder, { ...clipTo("founder"), duration: 1, ease: camEase }, "founder-exit+=0.25");
    tl.set(ch.founder.label, { autoAlpha: 1, color: "transparent" });
    tl.set(overlays.founder, { autoAlpha: 0 }, "<");
    tl.to(ch.founder.label, { color: INK, duration: 0.4, ease: fade });
    tl.addLabel("founder-return");
    tl.to(world, { ...toOverview(), duration: 1 }, "founder-return");
    hold(0.5);
    marks.push({ id: "founder", from: 0 });

    // Note → three sheets of paper fly in → erase and answer → branches are drawn on a small map and nodes sprout
    chapter("why", (at) => {
      const a1 = q('[data-beat="why-a1"]'), a2 = q('[data-beat="why-a2"]'), pp = q('[data-beat="why-papers"]');
      const b1 = q('[data-beat="why-b1"]'), b2 = q('[data-beat="why-b2"]');
      const sEdges = [...document.querySelectorAll("[data-story-edge]")], sNodes = [...document.querySelectorAll("[data-story-node]")];
      headline(a1, at);
      hold(0.3);
      tl.addLabel("why-a2");
      tl.to(a1, { opacity: DIM, duration: 0.5, ease: fade }, "why-a2");
      tl.set(a2, { autoAlpha: 1 }, "why-a2");
      tl.to(whyLines[0], { autoAlpha: 1, duration: 0.45, ease: fade }, "why-a2");
      tl.to(whyLines[0], { opacity: DIM, duration: 0.45, ease: fade }, "why-a2+=0.4");
      tl.to(whyLines[1], { autoAlpha: 1, duration: 0.45, ease: fade }, "why-a2+=0.4");
      hold(0.3);
      tl.addLabel("why-papers");
      tl.set(pp, { autoAlpha: 1 }, "why-papers");
      tl.to(whyLines, { opacity: DIM, duration: 0.5, ease: fade }, "why-papers+=0.15");
      papers.forEach((p, i) => {
        const at2 = `why-papers+=${(0.15 + i * 0.18).toFixed(2)}`, r = [-11, 9, -14][i] || 0;
        tl.fromTo(p, { x: 260, rotation: r + 9, scale: 0.96 }, { x: 0, rotation: r, scale: 1, duration: 0.9, ease: reveal }, at2);
        tl.to(p, { autoAlpha: 1, duration: 0.4, ease: fade }, at2);
      });
      hold(0.5);
      tl.addLabel("why-clear");
      tl.to([a1, a2, pp], { autoAlpha: 0, duration: 0.5, ease: fade }, "why-clear");
      hold(0.15);
      tl.addLabel("why-answer");
      headline(b1, "why-answer");
      hold(0.3);
      tl.addLabel("why-b2");
      tl.to(b1, { opacity: DIM, duration: 0.5, ease: fade }, "why-b2");
      tl.fromTo(b2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.05, ease: "none" }, "why-b2");
      tl.fromTo(b2, { y: 30 }, { y: 0, duration: 1.05, ease: reveal }, "why-b2");
      const draw = 0.85;
      if (sNodes[0]) tl.fromTo(sNodes[0], { scale: 0.72, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: reveal }, "why-b2+=0.75");
      sEdges.forEach((e, i) => {
        const t0 = 1.25 + i * 0.42;
        tl.fromTo(e, { drawSVG: "0%" }, { drawSVG: "100%", duration: draw, ease: "power1.inOut" }, `why-b2+=${t0.toFixed(2)}`);
        const n = sNodes[i + 1];
        if (n) tl.fromTo(n, { scale: 0.72, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: reveal }, `why-b2+=${(t0 + draw - 0.18).toFixed(2)}`);
      });
      hold(1.4);
    });

    // Feature card stack: flies in from the bottom right (520,160) tilted 13 degrees more and stacks up, while earlier cards get pushed by (-14,-16,-2.6deg) each
    chapter("features", (at) => {
      const b1 = q('[data-beat="features-1"]'), deck = q('[data-beat="features-cards"]'), tilt = [-3, -2, -4, -2.5, -3.5, -2];
      headline(b1, at);
      hold(0.3);
      tl.addLabel("features-deal");
      tl.to(b1, { opacity: DIM, duration: 0.5, ease: fade }, "features-deal");
      tl.set(deck, { autoAlpha: 1 }, "features-deal");
      cards.forEach((c, i) => {
        const L = `features-card-${i}`, r = tilt[i % tilt.length];
        tl.addLabel(L);
        if (i > 0) tl.to(cards.slice(0, i), { x: "-=14", y: "-=16", rotation: "-=2.6", duration: 0.5, ease: fade }, L);
        tl.fromTo(c, { x: 520, y: 160, rotation: r + 13 }, { x: 0, y: 0, rotation: r, duration: 0.75, ease: reveal }, L);
        tl.to(c, { autoAlpha: 1, duration: 0.35, ease: fade }, L);
        hold(0.25);
      });
      hold(0.55);
    });

    chapter("try", (at) => {
      const t1 = q('[data-beat="try-1"]'), stage = q('[data-beat="try-stage"]');
      headline(t1, at);
      hold(0.3);
      tl.addLabel("try-play");
      tl.to(t1, { opacity: DIM, duration: 0.55, ease: fade }, "try-play");
      tl.fromTo(stage, { scale: 0.97, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.65, ease: reveal }, "try-play");
      hold(2.2);
    });

    // Title → two short lines light up in turn, the earlier one dims to .32 → white panel rises at .965
    const stepped = (id) => (at) => {
      const b = [1, 2, 3].map((n) => q(`[data-beat="${id}-${n}"]`)), card = q(`[data-beat="${id}-card"]`);
      const lastLabel = id === "pricing" ? "pricing-offer" : "privacy-paperwork";
      headline(b[0], at);
      hold(0.3);
      tl.addLabel(`${id}-2`);
      tl.to(b[0], { opacity: DIM, duration: 0.55, ease: fade }, `${id}-2`);
      tl.to(b[1], { autoAlpha: 1, duration: 0.55, ease: fade }, `${id}-2`);
      hold(0.3);
      tl.addLabel(`${id}-3`);
      tl.to(b[1], { opacity: DIM, duration: 0.55, ease: fade }, `${id}-3`);
      tl.to(b[2], { autoAlpha: 1, duration: 0.55, ease: fade }, `${id}-3`);
      hold(0.3);
      tl.addLabel(lastLabel);
      tl.to(b[2], { opacity: DIM, duration: 0.55, ease: fade }, lastLabel);
      tl.fromTo(card, { scale: 0.965, y: 18 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.65, ease: reveal }, lastLabel);
      hold(0.8);
    };
    chapter("pricing", stepped("pricing"));

    chapter("faq", (at) => {
      const b1 = q('[data-beat="faq-1"]'), cardsBeat = q('[data-beat="faq-cards"]');
      headline(b1, at);
      hold(0.3);
      tl.addLabel("faq-drop");
      tl.to(b1, { opacity: DIM, duration: 0.5, ease: fade }, "faq-drop");
      tl.set(cardsBeat, { autoAlpha: 1 }, "faq-drop");
      hold(2.4);
    });
    const faqOn = tl.labels["faq-drop"] + 0.1, faqOff = tl.labels["faq-exit"] + 0.45;

    chapter("privacy", stepped("privacy"));
    hold(1.1);

    const physics = faqPhysics(q(".faq-playground"));
    let faqActive = false;
    const st = ScrollTrigger.create({
      trigger: exp,
      animation: tl,
      start: "top top",
      end: () => "+=" + Math.round(innerHeight * tl.duration() * 0.78),
      pin: vp,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (self) => {
        syncInert();
        const t = self.progress * tl.duration();
        let cur = "founder";
        for (const m of marks) {
          if (t < m.from) break;
          cur = m.id;
        }
        if (cur !== scene) setScene(cur);
        const on = t >= faqOn && t <= faqOff;
        if (on !== faqActive) {
          faqActive = on;
          on ? physics.start() : physics.stop();
        }
      },
    });

    const drags = Draggable.create(cards, { type: "x,y", bounds: vp, cursor: "grab", activeCursor: "grabbing" });

    // On pressing contents or pill: folds the unfolded panel and retreats to the hub in 1.25s → teleports to that section’s approach point → scrolls to the tempo for 1.95s
    const targetTime = { founder: () => 0, faq: () => tl.labels["faq-drop"] + 0.15 };
    const timeOf = (id) => (targetTime[id] ? targetTime[id]() : tl.labels[`${id}-beats`] + 0.9);
    const scrollFor = (t) => st.start + (t / tl.duration()) * (st.end - st.start);
    let scrollTw = null, flyTw = null;
    const killJump = () => {
      scrollTw && scrollTw.kill();
      flyTw && flyTw.kill();
      scrollTw = flyTw = null;
    };
    function jumpTo(t) {
      scrollTo({ top: Math.round(scrollFor(t)), behavior: "instant" });
      ScrollTrigger.update();
      const tw = st.getTween && st.getTween();
      if (tw) tw.progress(1);
      syncInert();
    }
    function go(id, animated) {
      killJump();
      const t = timeOf(id);
      if (!animated) return jumpTo(t);
      const A = tl.labels[`${id}-approach`];
      const fly = () => {
        if (Number.isFinite(A)) {
          jumpTo(A);
          const o = { y: scrollY };
          scrollTw = gsap.to(o, {
            y: Math.round(scrollFor(t)),
            duration: 1.95,
            ease: "power2.inOut",
            onUpdate: () => { scrollTo({ top: o.y, behavior: "instant" }); ScrollTrigger.update(); },
            onComplete: () => (scrollTw = null),
          });
          return;
        }
        const ov = overlays[id], lb = ch[id].label;
        flyTw = gsap.timeline({ onUpdate: syncInert, onComplete: () => { flyTw = null; jumpTo(t); gsap.set(ov, { autoAlpha: 1, clipPath: FULL }); gsap.set(lb, { autoAlpha: 0, color: "transparent" }); } });
        flyTw.to(world, { x: zoom[id].x, y: zoom[id].y, scale: zoom[id].scale, transformOrigin: "0 0", duration: 1.15, ease: camEase }, 0);
        flyTw.to(lb, { color: "transparent", duration: 0.5, ease: fade }, 0.65);
        flyTw.set(ov, { autoAlpha: 1, clipPath: pill(id) }, 0.75);
        flyTw.set(lb, { autoAlpha: 0 }, 0.75);
        flyTw.to(ov, { clipPath: FULL, duration: 0.9, ease: camEase }, 0.75);
      };
      const ov = overlays[scene], lb = ch[scene] && ch[scene].label;
      const covered = ov && Number(getComputedStyle(ov).opacity) > 0.05;
      if (scene === id || !covered) return fly();
      flyTw = gsap.timeline({ onUpdate: syncInert, onComplete: () => { flyTw = null; fly(); } });
      flyTw.to(world, { x: overview.x, y: overview.y, scale: overview.scale, transformOrigin: "0 0", duration: 1.25, ease: camEase }, 0);
      flyTw.to(ov, { autoAlpha: 0, duration: 0.6, ease: fade }, 0);
      if (lb) {
        flyTw.set(lb, { autoAlpha: 1 }, 0);
        flyTw.to(lb, { color: INK, duration: 0.45, ease: fade }, 0);
      }
    }
    const onClick = (e) => {
      const a = e.target.closest("[data-scene]");
      if (!a || !ch[a.dataset.scene] || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      setHash(a.dataset.scene);
      go(a.dataset.scene, true);
    };
    document.addEventListener("click", onClick);
    addEventListener("wheel", killJump, { passive: true });
    addEventListener("touchstart", killJump, { passive: true });

    ScrollTrigger.refresh();
    ready = true;
    if (start) requestAnimationFrame(() => go(start, false));

    return () => {
      killJump();
      document.removeEventListener("click", onClick);
      removeEventListener("wheel", killJump);
      removeEventListener("touchstart", killJump);
      physics.stop();
      drags.forEach((d) => d.kill());
      st.kill(true);
      tl.kill();
      intro && intro.kill();
      splits.forEach((s) => s.revert());
      gsap.set([world, ...labels, ...edges, ...Object.values(overlays), ...allBeats, ...whyLines, ...papers, ...cards], { clearProps: "all" });
      gsap.set("[data-story-node], [data-story-edge]", { clearProps: "all" });
      IDS.forEach((k) => ch[k].el.classList.remove("is-active"));
      camera.inert = false;
      root.classList.remove("cinematic-mode");
    };
  }

  // Drops eight question notes into a roofless box and closes the lid once they are all in. They can be grabbed and thrown with the mouse.
  function faqPhysics(box) {
    const ITEMS = [
      ["20%", -180, -8, -0.009], ["43%", -430, 5, 0.007], ["68%", -250, -4, -0.005], ["80%", -610, 6, 0.006],
      ["29%", -760, 7, 0.01], ["53%", -930, -5, -0.006], ["74%", -800, -7, -0.008], ["38%", -1120, 9, 0.008],
    ];
    const qa = [...document.querySelectorAll(".mobile-faq-list details")].map((d) => [d.querySelector("summary").textContent, d.querySelector("p").textContent]);
    const M = window.Matter;
    let engine = null, raf = 0, mouse = null, sealed = false, bodies = [];
    function start() {
      if (engine || !M) return;
      const W = box.offsetWidth, H = box.offsetHeight, T = 200;
      engine = M.Engine.create({ enableSleeping: true });
      engine.gravity.y = 1;
      const wall = { isStatic: true, friction: 1 };
      M.Composite.add(engine.world, [
        M.Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, wall),
        M.Bodies.rectangle(W + T / 2, H / 2, T, H * 3, wall),
        M.Bodies.rectangle(-T / 2, H / 2, T, H * 3, wall),
      ]);
      bodies = ITEMS.map(([x, y, angle, spin], i) => {
        const el = document.createElement("article");
        el.className = "faq-note";
        el.innerHTML = `<h3></h3><p></p>`;
        el.querySelector("h3").textContent = qa[i] ? qa[i][0] : "";
        el.querySelector("p").textContent = qa[i] ? qa[i][1] : "";
        box.append(el);
        const w = el.offsetWidth, h = el.offsetHeight;
        const b = M.Bodies.rectangle((parseFloat(x) / 100) * W, y, w, h, { restitution: 0.85, friction: 0.15, frictionAir: 0.02, density: 0.001, angle: (angle * Math.PI) / 180 });
        // The roof closes after everything is in, so at first it drops from above the box (24px above the bottom edge)
        if (b.bounds.max.y > -24) M.Body.translate(b, { x: 0, y: -24 - b.bounds.max.y });
        M.Body.setAngularVelocity(b, spin);
        M.Composite.add(engine.world, b);
        return { el, b, w, h };
      });
      mouse = M.Mouse.create(box);
      // Matter blocks wheel and touch — release them so page scrolling continues. A held note does not lock rotation (angularStiffness 0) so dragging spins it
      for (const [type, fn] of [["wheel", "mousewheel"], ["mousewheel", "mousewheel"], ["DOMMouseScroll", "mousewheel"], ["touchmove", "mousemove"], ["touchstart", "mousedown"], ["touchend", "mouseup"]]) box.removeEventListener(type, mouse[fn]);
      const mc = M.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.7, angularStiffness: 0, render: { visible: false } } });
      M.Composite.add(engine.world, mc);
      sealed = false;
      let last = 0;
      const tick = (now) => {
        // The rAF time may be earlier than a previously measured time — if turned negative, sleeping catches on the first frame and the note freezes in midair
        M.Engine.update(engine, Math.min(1000 / 60, Math.max(1, now - (last || now))));
        last = now;
        let inside = true;
        for (const { el, b, w, h } of bodies) {
          el.style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y - h / 2}px) rotate(${b.angle}rad)`;
          if (b.position.y - h / 2 < 0) inside = false;
        }
        if (!sealed && inside) {
          sealed = true;
          M.Composite.add(engine.world, M.Bodies.rectangle(W / 2, -T / 2, W + T * 2, T, wall));
        }
        const over = M.Query.point(bodies.map((o) => o.b), mouse.position).length > 0;
        box.classList.toggle("is-grab", over && !mc.body);
        box.classList.toggle("is-grabbing", !!mc.body);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (!engine) return;
      cancelAnimationFrame(raf);
      M.Mouse.clearSourceEvents(mouse);
      [["mousemove", "mousemove"], ["mousedown", "mousedown"], ["mouseup", "mouseup"], ["touchmove", "mousemove"], ["touchstart", "mousedown"], ["touchend", "mouseup"]]
        .forEach(([type, fn]) => box.removeEventListener(type, mouse[fn]));
      M.Composite.clear(engine.world, false);
      M.Engine.clear(engine);
      bodies.forEach(({ el }) => el.remove());
      box.classList.remove("is-grab", "is-grabbing");
      engine = mouse = null;
      bodies = [];
    }
    return { start, stop };
  }

  // ── Vertical Reading ──
  function stacked() {
    root.classList.add("mobile-cinematic-mode");
    camera.inert = true;
    const moving = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens = [], splits = [], touched = new Set();
    let ranges = [], raf = 0, io = null;

    function layout() {
      let y = vp.getBoundingClientRect().top + scrollY;
      ranges = IDS.map((id) => {
        const ov = overlays[id], h = ov.offsetHeight;
        ov.style.setProperty("--sticky-top", `${Math.min(0, innerHeight - h)}px`);
        const r = { id, start: y, end: y + h };
        y += h;
        return r;
      });
    }
    // While the next board rises by the screen height, a same-color curtain covers it with progress² (the first board starts after 42% for a 42% span)
    function cover() {
      const H = innerHeight;
      ranges.forEach((r, i) => {
        const next = ranges[i + 1];
        const p = next ? 1 - (next.start - scrollY) / H : 0;
        const off = r.id === "founder" ? 0.42 : 0, span = r.id === "founder" ? 0.42 : 0.5;
        const e = Math.min(1, Math.max(0, (p - off) / span));
        overlays[r.id].style.setProperty("--cover", (e * e).toFixed(3));
      });
    }
    const frame = () => {
      raf = 0;
      cover();
      const probe = scrollY + innerHeight * 0.34;
      const r = ranges.find((x) => probe >= x.start && probe < x.end) || ranges[ranges.length - 1];
      if (r) markRail(r.id);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const onResize = () => { layout(); onScroll(); };

    if (moving) {
      const profile = (el) =>
        el.matches("h1, h2") ? "headline" : el.matches("[data-story-photo]") ? "portrait" : el.matches(".paper") ? "paper"
          : el.matches(".story-map") ? "map" : el.matches(".feature-card") ? "feature" : el.matches(".demo-layout, .price-panel, .legal-panel") ? "panel"
          : el.matches("details") ? "card" : "text";
      const GAP = { paper: 0.12, feature: 0.12, card: 0.12, portrait: 0.28, map: 0.28, panel: 0.22, headline: 0.18, text: 0.18 };
      const pending = new Map();
      io = new IntersectionObserver((list) => list.forEach((en) => {
        if (!en.isIntersecting) return;
        const run = pending.get(en.target);
        if (!run) return;
        pending.delete(en.target);
        io.unobserve(en.target);
        run();
      }), { rootMargin: "0px 0px -4% 0px" });

      IDS.forEach((id) => {
        const units = [];
        [...overlays[id].children].forEach((child) => {
          if (child.classList.contains("wf-note")) return;
          const faq = child.querySelectorAll(":scope > .mobile-faq-list details");
          const deck = child.querySelectorAll(":scope > .feature-card");
          if (faq.length) units.push(...faq);
          else if (deck.length) units.push(...deck);
          else if (child.classList.contains("story-beat")) units.push(...[...child.children].filter((c) => !c.matches(".faq-playground")));
          else units.push(child);
        });
        // Within one panel they queue up one by one — the next starts as the previous one nears its end (after the interval)
        const queue = { free: 0 };
        const slot = (gap) => { const now = performance.now() / 1000, at = Math.max(now, queue.free); queue.free = at + gap; return at - now; };
        const count = { paper: 0, feature: 0, card: 0 };
        units.forEach((el) => {
          const kind = profile(el), n = count[kind] !== undefined ? count[kind]++ : 0;
          touched.add(el);
          let play;
          if (kind === "headline") {
            const sp = SplitText.create(el, { type: "words,chars" });
            splits.push(sp);
            gsap.set(sp.chars, { autoAlpha: 0 });
            const each = Math.max(0.012, Math.min(0.026, 0.62 / sp.chars.length));
            play = (d) => tweens.push(gsap.to(sp.chars, { autoAlpha: 1, duration: 0.045, ease: "none", stagger: each, delay: d }));
          } else if (kind === "portrait") {
            gsap.set(el, { autoAlpha: 0, y: -120, rotation: 75, scale: 0.7, force3D: true });
            play = (d) => tweens.push(gsap.timeline({ delay: d }).to(el, { y: 0, rotation: 9, scale: 1, duration: 1.4, ease: reveal }, 0).to(el, { autoAlpha: 1, duration: 0.5, ease: fade }, 0));
          } else if (kind === "paper") {
            const r = [-7, 6, -9][n] ?? -7, x = [96, -96, 96][n] ?? 96;
            gsap.set(el, { autoAlpha: 0, x, y: 24, rotation: r + (x < 0 ? -8 : 8), scale: 0.96 });
            play = (d) => tweens.push(gsap.to(el, { autoAlpha: 1, x: 0, y: 0, rotation: r, scale: 1, duration: 0.72, ease: reveal, delay: d }));
          } else if (kind === "map") {
            const nodes = [...el.querySelectorAll("[data-story-node]")], es = [...el.querySelectorAll("[data-story-edge]")];
            nodes.concat(es).forEach((x) => touched.add(x));
            gsap.set(el, { autoAlpha: 0, y: 28, scale: 0.975 });
            gsap.set(nodes, { autoAlpha: 0, scale: 0.84 });
            gsap.set(es, { autoAlpha: 0, drawSVG: "0%" });
            play = (d) => {
              const t = gsap.timeline({ delay: d });
              t.to(el, { autoAlpha: 1, y: 0, scale: 1, duration: 0.64, ease: reveal }, 0);
              t.to(nodes[0], { autoAlpha: 1, scale: 1, duration: 0.36, ease: reveal }, 0.3);
              es.forEach((e, i) => {
                const at = 0.58 + i * 0.2;
                t.to(e, { autoAlpha: 1, drawSVG: "100%", duration: 0.42, ease: "power1.inOut" }, at);
                if (nodes[i + 1]) t.to(nodes[i + 1], { autoAlpha: 1, scale: 1, duration: 0.34, ease: reveal }, at + 0.24);
              });
              tweens.push(t);
            };
          } else if (kind === "feature") {
            const x = n % 2 === 0 ? 64 : -64, shot = el.querySelector(".feature-shot");
            if (shot) { touched.add(shot); gsap.set(shot, { autoAlpha: 0, y: 18, scale: 0.985 }); }
            gsap.set(el, { autoAlpha: 0, x, y: 22, rotation: n % 2 === 0 ? 1.2 : -1.2, scale: 0.985 });
            play = (d) => {
              const t = gsap.timeline({ delay: d }).to(el, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.62, ease: reveal }, 0);
              if (shot) t.to(shot, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: reveal }, 0.18);
              tweens.push(t);
            };
          } else {
            const from = kind === "panel" ? { y: 20, scale: 0.975 } : kind === "card" ? { x: n % 2 === 0 ? 16 : -16, y: 16, rotation: n % 2 === 0 ? 0.5 : -0.5, scale: 0.99 } : { y: 18 };
            const dur = kind === "panel" ? 0.64 : 0.5;
            gsap.set(el, { autoAlpha: 0, ...from });
            play = (d) => tweens.push(gsap.to(el, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: dur, ease: reveal, delay: d }));
          }
          pending.set(el, () => play(slot(GAP[kind])));
          io.observe(el);
        });
      });
    }

    layout();
    cover();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    IDS.forEach((id) => ro.observe(overlays[id]));
    const onClick = (e) => {
      const a = e.target.closest("[data-scene]");
      if (!a || !overlays[a.dataset.scene]) return;
      e.preventDefault();
      layout();
      const r = ranges.find((x) => x.id === a.dataset.scene);
      scrollTo({ top: r ? Math.round(r.start) : 0, behavior: "smooth" });
      setHash(a.dataset.scene);
    };
    document.addEventListener("click", onClick);
    const start = hashScene();
    if (start) requestAnimationFrame(() => { layout(); const r = ranges.find((x) => x.id === start); r && scrollTo(0, r.start); });

    return () => {
      io && io.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      document.removeEventListener("click", onClick);
      tweens.forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
      gsap.set([...touched], { clearProps: "all" });
      IDS.forEach((id) => { overlays[id].style.removeProperty("--sticky-top"); overlays[id].style.removeProperty("--cover"); });
      camera.inert = false;
      root.classList.remove("mobile-cinematic-mode");
    };
  }

  // ── Try it: a small mind map editor supporting up to twelve nodes and three levels ──
  function demo() {
    const stage = document.getElementById("playStage");
    if (!stage) return;
    const links = stage.querySelector(".demo-links"), status = document.getElementById("demo-status");
    const swatches = document.querySelector(".demo-swatches"), picker = document.querySelector(".demo-picker");
    const hex = document.querySelector(".demo-hex input"), size = document.querySelector(".demo-size");
    const COLORS = ["--site-tone-blue", "--site-tone-yellow", "--site-tone-orange", "--site-tone-red", "--site-tone-pink"].map(cssColor), BASE = 16, MAX = 12, DEEP = 2;
    const palette = [...COLORS], save = document.querySelector(".demo-hex button");
    // The color picker is HSV like the original (react-colorful) — panel horizontal is saturation, vertical is brightness, bottom bar is hue. Hue is remembered even when it goes gray
    let hsv = [225, 0.6, 0.9];
    const toHsv = (c) => {
      const [r, g, b] = gsap.utils.splitColor(c).map((v) => v / 255), max = Math.max(r, g, b), d = max - Math.min(r, g, b);
      let h = !d ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
      return [h, max ? d / max : 0, max];
    };
    const toHex = ([h, sat, v]) => {
      const f = (n) => { const k = (n + h / 60) % 6; return v - v * sat * Math.max(0, Math.min(k, 4 - k, 1)); };
      return "#" + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
    };
    let nodes = [
      { id: 1, parent: null, label: "Core theme", color: COLORS[0], size: BASE },
      { id: 2, parent: 1, label: "Branch 1", color: COLORS[1], size: BASE },
      { id: 3, parent: 1, label: "Branch 2", color: COLORS[2], size: BASE },
      { id: 4, parent: 1, label: "Branch 3", color: COLORS[4], size: BASE },
    ];
    let nextId = 5, sel = 1, editing = false;
    const manual = new Map(), els = new Map();
    const get = (id) => nodes.find((n) => n.id === id);
    const kids = (id) => nodes.filter((n) => n.parent === id);
    const depth = (n) => { let d = 0; while (n && n.parent !== null) { d++; n = get(n.parent); } return d; };
    const say = (t) => { status.textContent = t; };

    // x by depth, y by leaf order — a parent sits at the middle of its children’s y
    function auto() {
      const W = stage.clientWidth || 280, H = Math.max(stage.clientHeight, 340), pos = {};
      const maxD = Math.max(0, ...nodes.map(depth)), pad = Math.min(88, Math.max(46, W * 0.2)), span = Math.max(1, W - pad * 2);
      const leaves = (n) => { const k = kids(n.id); return k.length ? k.reduce((s, c) => s + leaves(c), 0) : 1; };
      const roots = nodes.filter((n) => n.parent === null), unit = H / (roots.reduce((s, r) => s + leaves(r), 0) + 1);
      let i = 0;
      const place = (n, d) => {
        const k = kids(n.id);
        let y;
        if (!k.length) y = unit * ++i;
        else { const ys = k.map((c) => place(c, d + 1)); y = (Math.min(...ys) + Math.max(...ys)) / 2; }
        pos[n.id] = { x: maxD ? pad + (span * d) / maxD : pad + span / 2, y };
        return y;
      };
      roots.forEach((r) => place(r, 0));
      return pos;
    }
    function draw(animate) {
      const base = auto();
      const pos = (id) => manual.get(id) || base[id];
      nodes.forEach((n) => {
        let el = els.get(n.id);
        if (!el) {
          el = document.createElement("div");
          el.className = "demo-node";
          el.dataset.id = n.id;
          el.innerHTML = '<span class="label"></span>';
          stage.append(el);
          els.set(n.id, el);
          const p = n.parent ? pos(n.parent) : pos(n.id);
          gsap.set(el, { left: p.x, top: p.y });
        }
        el.querySelector(".label").textContent = n.label;
        el.style.background = n.color;
        el.style.fontSize = `${n.size}px`;
        el.style.padding = `${Math.round((10 * n.size) / BASE)}px ${Math.round((24 * n.size) / BASE)}px`;
        el.classList.toggle("selected", n.id === sel);
        el.classList.toggle("editing", n.id === sel && editing);
        el.querySelectorAll(".demo-handle").forEach((h) => h.remove());
        if (n.id === sel) {
          el.insertAdjacentHTML("beforeend", `<button type="button" class="demo-handle add-child" data-add="child" tabindex="-1"><span class="demo-handle-key">Tab</span></button>` + (n.parent ? `<button type="button" class="demo-handle add-sibling" data-add="sibling" tabindex="-1"><span class="demo-handle-key">Enter</span></button>` : ""));
        }
        const p = pos(n.id);
        gsap.to(el, { left: p.x, top: p.y, duration: animate ? 0.45 : 0, ease: reveal, overwrite: "auto", onUpdate: wires });
      });
      [...els.keys()].forEach((id) => { if (!get(id)) { els.get(id).remove(); els.delete(id); manual.delete(id); } });
      wires();
      syncProps();
    }
    function wires() {
      const at = (id) => { const el = els.get(id); return { x: parseFloat(el.style.left), y: parseFloat(el.style.top) }; };
      links.innerHTML = nodes.filter((n) => n.parent !== null && els.get(n.id) && els.get(n.parent)).map((n) => {
        const a = at(n.parent), b = at(n.id), m = (a.x + b.x) / 2;
        return `<path d="M${a.x} ${a.y} C ${m} ${a.y}, ${m} ${b.y}, ${b.x} ${b.y}"/>`;
      }).join("");
    }
    function add(kind) {
      const cur = get(sel);
      if (!cur) return;
      if (nodes.length >= MAX) return say("This board can hold up to twelve nodes. Delete one and continue.");
      if (kind === "child" && depth(cur) >= DEEP) return say("This version goes up to three levels. Press Enter to add a sibling, or pick a parent to add a child.");
      const parent = kind === "child" || cur.parent === null ? cur.id : cur.parent;
      const n = { id: nextId++, parent, label: "New idea", fresh: true, color: kind === "child" ? COLORS[(nodes.length + 1) % COLORS.length] : cur.color, size: BASE };
      nodes.push(n);
      sel = n.id;
      editing = true;
      say("");
      draw(true);
    }
    function remove() {
      const cur = get(sel);
      if (!cur || cur.parent === null) return;
      const gone = new Set([cur.id]);
      let grew = true;
      while (grew) { grew = false; nodes.forEach((n) => { if (!gone.has(n.id) && gone.has(n.parent)) { gone.add(n.id); grew = true; } }); }
      nodes = nodes.filter((n) => !gone.has(n.id));
      sel = cur.parent;
      editing = false;
      say("");
      draw(true);
    }
    function syncProps() {
      const n = get(sel);
      if (!n) return;
      swatches.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b.dataset.c.toLowerCase() === n.color.toLowerCase()));
      hex.value = n.color.toUpperCase();
      const w = Math.round(((n.size - 12) / 84) * 100);
      size.style.setProperty("--sw", `calc(${68.57 - (68.57 * w) / 100}px + ${w + 4.76}%)`);
      size.querySelector(".demo-size__value").textContent = n.size;
      size.setAttribute("aria-valuenow", n.size);
      if (toHex(hsv) !== toHex(toHsv(n.color))) { const next = toHsv(n.color); hsv = [next[1] && next[2] ? next[0] : hsv[0], next[1], next[2]]; }
      picker.style.setProperty("--hue", hsv[0]);
      picker.style.setProperty("--hx", `${(hsv[0] / 360) * 100}%`);
      picker.style.setProperty("--px", `${hsv[1] * 100}%`);
      picker.style.setProperty("--py", `${(1 - hsv[2]) * 100}%`);
      picker.style.setProperty("--pick", n.color);
      sat.setAttribute("aria-valuetext", `Saturation ${Math.round(hsv[1] * 100)}%, Lightness ${Math.round(hsv[2] * 100)}%`);
      hueBar.setAttribute("aria-valuenow", Math.round(hsv[0]));
      save.disabled = palette.some((c) => toHex(toHsv(c)) === toHex(toHsv(n.color)));
    }
    function drawSwatches() {
      swatches.innerHTML = palette.map((c) => `<button type="button" data-c="${c}" aria-label="Color ${c}" style="background:${c}"></button>`).join("");
    }

    drawSwatches();
    // Pick by dragging the plate or bar, or with arrows (5% steps). Save adds the current color to the end of the palette (removes it if already there)
    const sat = picker.querySelector(".demo-picker__sat"), hueBar = picker.querySelector(".demo-picker__hue");
    const pick = (next) => { const n = get(sel); if (!n) return; hsv = next; n.color = toHex(hsv); draw(false); };
    const clamp01 = gsap.utils.clamp(0, 1);
    const slide = (el, at, key) => {
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        el.focus({ preventScroll: true });
        el.setPointerCapture(e.pointerId);
        const move = (ev) => { const r = el.getBoundingClientRect(); at(clamp01((ev.clientX - r.left) / r.width), clamp01((ev.clientY - r.top) / r.height)); };
        const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
        move(e);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      });
      el.addEventListener("keydown", (e) => {
        const dx = e.key === "ArrowRight" ? 0.05 : e.key === "ArrowLeft" ? -0.05 : 0, dy = e.key === "ArrowDown" ? 0.05 : e.key === "ArrowUp" ? -0.05 : 0;
        if (!dx && !dy) return;
        e.preventDefault();
        key(dx, dy);
      });
    };
    slide(sat, (x, y) => pick([hsv[0], x, 1 - y]), (dx, dy) => pick([hsv[0], clamp01(hsv[1] + dx), clamp01(hsv[2] - dy)]));
    slide(hueBar, (x) => pick([x * 360, hsv[1], hsv[2]]), (dx) => pick([gsap.utils.clamp(0, 360, hsv[0] + dx * 360), hsv[1], hsv[2]]));
    save.addEventListener("click", () => {
      const n = get(sel);
      if (!n || save.disabled) return;
      palette.push(n.color);
      drawSwatches();
      syncProps();
    });
    swatches.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      const n = get(sel);
      if (b && n) { n.color = b.dataset.c; draw(false); }
    });
    hex.addEventListener("change", () => {
      const n = get(sel);
      if (n && /^#[0-9a-f]{6}$/i.test(hex.value.trim())) { n.color = hex.value.trim(); draw(false); }
    });
    const sizeAt = (x) => {
      const r = size.getBoundingClientRect(), n = get(sel);
      if (!n) return;
      n.size = 12 + Math.round((Math.min(1, Math.max(0, (x - r.left) / r.width)) * 84) / 2) * 2;
      draw(false);
    };
    size.addEventListener("pointerdown", (e) => {
      size.setPointerCapture(e.pointerId);
      sizeAt(e.clientX);
      const mv = (ev) => sizeAt(ev.clientX);
      size.addEventListener("pointermove", mv);
      size.addEventListener("pointerup", () => size.removeEventListener("pointermove", mv), { once: true });
    });

    let drag = null;
    stage.addEventListener("pointerdown", (e) => {
      const h = e.target.closest("[data-add]");
      if (h) { e.preventDefault(); add(h.dataset.add); stage.focus({ preventScroll: true }); return; }
      const el = e.target.closest(".demo-node");
      stage.classList.add("is-active");
      if (!el) { editing = false; draw(false); return; }
      const id = +el.dataset.id;
      if (sel !== id) editing = false;
      sel = id;
      draw(false);
      const r = stage.getBoundingClientRect();
      drag = { id, el, dx: e.clientX - r.left - parseFloat(el.style.left), dy: e.clientY - r.top - parseFloat(el.style.top), moved: false };
      el.setPointerCapture(e.pointerId);
      stage.focus({ preventScroll: true });
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const r = stage.getBoundingClientRect();
      const x = Math.min(r.width - 20, Math.max(20, e.clientX - r.left - drag.dx)), y = Math.min(r.height - 16, Math.max(16, e.clientY - r.top - drag.dy));
      drag.moved = true;
      drag.el.classList.add("dragging");
      manual.set(drag.id, { x, y });
      gsap.set(drag.el, { left: x, top: y });
      wires();
    });
    const endDrag = () => {
      if (!drag) return;
      drag.el.classList.remove("dragging");
      if (!drag.moved) { editing = true; draw(false); }
      drag = null;
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("keydown", (e) => {
      const n = get(sel);
      if (!n) return;
      if (e.key === "Escape") { editing = false; stage.classList.remove("is-active"); draw(false); return; }
      if (!stage.classList.contains("is-active")) {
        if (e.key === "Enter") { stage.classList.add("is-active"); draw(false); e.preventDefault(); }
        return;
      }
      if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); add("child"); return; }
      if (e.key === "Enter") { e.preventDefault(); n.parent === null ? add("child") : add("sibling"); return; }
      if ((e.key === "Delete" || e.key === "Backspace") && !editing) { e.preventDefault(); remove(); return; }
      if (e.key === "Backspace" && editing) { e.preventDefault(); n.label = n.label.slice(0, -1); draw(false); return; }
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        editing = false;
        const sib = n.parent === null ? [n] : kids(n.parent), i = sib.indexOf(n);
        if (e.key === "ArrowLeft" && n.parent !== null) sel = n.parent;
        else if (e.key === "ArrowRight" && kids(n.id).length) sel = kids(n.id)[0].id;
        else if (e.key === "ArrowUp" && i > 0) sel = sib[i - 1].id;
        else if (e.key === "ArrowDown" && i < sib.length - 1) sel = sib[i + 1].id;
        draw(false);
        return;
      }
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // A new node’s placeholder name and its name when not being edited are swapped wholesale at the first character
        if (!editing || n.fresh) { editing = true; n.fresh = false; n.label = ""; }
        n.label = (n.label + e.key).slice(0, 24);
        draw(false);
      }
    });
    document.getElementById("autoLayout").addEventListener("click", () => { manual.clear(); draw(true); });
    addEventListener("resize", () => draw(false));
    draw(false);
    new ResizeObserver(() => draw(false)).observe(stage);
  }

  demo();
  const wide = matchMedia("(min-width: 1100px)"), still = matchMedia("(prefers-reduced-motion: reduce)");
  let mode = null, undo = null;
  const pick = () => {
    const next = wide.matches && !still.matches ? "cinematic" : "stacked";
    if (next === mode) return;
    if (undo) undo();
    mode = next;
    undo = next === "cinematic" ? cinematic() : stacked();
  };
  wide.addEventListener("change", pick);
  still.addEventListener("change", pick);
  pick();
})();
