// Brand first page motion — original framer-motion values (chunk 7087) in GSAP.
// The spring is a damped oscillation curve solved from mass, stiffness and damping as is (same formula as the sticker-float-drag part).
(() => {
  const springOf = (m, k, c) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    let x, slow;
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
      slow = z * w0;
    } else if (z > 1) {
      // Overdamping (FAQ height .2·280·18 → damping ratio 1.2) — the slow pole sets the length
      const wd = w0 * Math.sqrt(z * z - 1);
      x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cosh(wd * t) + ((z * w0) / wd) * Math.sinh(wd * t));
      slow = w0 * (z - Math.sqrt(z * z - 1));
    } else {
      x = (t) => 1 - (1 + w0 * t) * Math.exp(-w0 * t);
      slow = w0;
    }
    const duration = Math.log(1000) / slow;
    return { duration, ease: (p) => (p >= 1 ? 1 : x(p * duration)) };
  };
  const S800 = springOf(4, 800, 80), S2000 = springOf(4, 2000, 80);
  const sp = (s) => ({ duration: s.duration, ease: s.ease });
  const ce = (c, fb) => (window.CustomEase ? CustomEase.create(`fa-${c}`, c) : fb);
  const expo = ce("0.19,1,0.22,1", "expo.out");
  const io = ce("0.42,0,0.58,1", "power1.inOut");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hero title word chunks — spaces are left as they are
  $$(".fa-hero__line").forEach((line) => {
    const words = line.textContent.trim().split(" ");
    line.innerHTML = words.map((w) => `<span class="fa-hero__word">${w}</span>`).join(" ");
  });

  // 2s loop — like the original, it keeps running off screen too (setInterval)
  const every = (ms, fn) => { let i = 0; return setInterval(() => fn(++i, false), ms); };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { reduce } = ctx.conditions;
    const timers = [];
    const later = (id) => timers.push(id);

    // Hero — sticker panel y 32 → 0 .937s · title words rotateX −45°, y 100% → 0 (.3 / .6 + .05s gap) · description 1s · button 1.1s
    if (!reduce) {
      // fa-js in the head hid it before painting, so specify the end value too (opacity 1)
      gsap.fromTo(".fa-hero__art-wrap, .fa-hero__mini", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.937, ease: expo });
      $$(".fa-hero__line").forEach((line) => {
        const d = +line.dataset.delay;
        $$(".fa-hero__word", line).forEach((w, i) => gsap.fromTo(w, { opacity: 0, rotationX: -45, yPercent: 100 }, { opacity: 1, rotationX: 0, yPercent: 0, duration: 0.937, ease: expo, delay: d + 0.05 * i }));
      });
      $$(".fa-rise").forEach((el) => gsap.fromTo(el, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.937, ease: expo, delay: +el.dataset.delay }));
    }

    // Easy — next row every 2s (original setInterval 2e3, 4 steps). Lit row: panel fill .01→.1 · line .01→.1 · [1,.99,1,1,1,1] press (spring 4·800·80).
    // First-row Lottie plays once at 2x speed when turned on, and returns to the first frame when turned off. The icon does its own motion .1s later when turned on
    const easy = $(".fa-easy");
    if (easy) {
      const rows = $$(".fa-easy__row", easy);
      const holder = $(".fa-easy__lottie", easy);
      const anim = window.lottie && window.fxLottie && holder ? lottie.loadAnimation({ container: holder, renderer: "svg", loop: false, autoplay: false, animationData: window.fxLottie.famSend }) : null;
      anim?.setSpeed(2);
      const step = (i, first) => {
        const n = i % 4;
        rows.forEach((r, k) => {
          const on = k === n;
          const t = reduce || first ? { duration: 0 } : sp(S800);
          gsap.to($(".fa-easy__bg", r), { attr: { "fill-opacity": on ? 0.1 : 0.01 }, ...t });
          gsap.to($(".fa-easy__ln", r), { attr: { "stroke-opacity": on ? 0.1 : 0.01 }, ...t });
          if (on && !reduce && !first) gsap.fromTo(r, { scale: 1 }, { keyframes: { scale: [1, 0.99, 1, 1, 1, 1] }, ...sp(S800) });
        });
        if (reduce) return;
        if (n === 0) anim?.goToAndPlay(0, true); else anim?.goToAndStop(0, true);
        const d = { ...sp(S800), delay: 0.1 };
        if (n === 1) gsap.fromTo($(".fa-easy__swap", easy), { rotation: 0, scale: 1 }, { rotation: 360, keyframes: { scale: [1, 1.1, 1, 1, 1] }, transformOrigin: "50% 50%", ...d });
        if (n === 2) { gsap.fromTo($(".fa-easy__dn1", easy), { y: 0 }, { y: 100, keyframes: { scale: [1, 1.1, 1, 1, 1] }, ...d }); gsap.fromTo($(".fa-easy__dn2", easy), { y: -100 }, { y: 0, ...d }); }
        if (n === 3) gsap.fromTo($(".fa-easy__buy", easy), { y: 0 }, { keyframes: { y: [0, -2, 2, 0], scale: [1, 1.1, 1, 1, 1] }, transformOrigin: "50% 50%", ...d });
      };
      gsap.set($(".fa-easy__dn2", easy), { y: -100 });
      step(0, true);
      if (!reduce) later(every(2000, step));
    }

    // Safety — 220×80 pill, 3 stages, 2s: plate at stage 0 is .92× · [.9,1] .2s on change · two rings (outer [.1,.5,.1] 1s rewinding .15s later, inner [.25,1,.25] 1s)
    // The outer ring group turns on only in step 1 over 1s, and the whole ring turns off in step 2 over 1s, .2s late · text group x 42↔67 · icon scale 0 at step 0
    const sec = $(".fa-sec");
    if (sec) {
      const all = $(".fa-sec__all", sec), rings = $(".fa-sec__rings", sec), outer = $(".fa-sec__outer", sec);
      const words = $(".fa-sec__words", sec), w1 = $(".fa-sec__w1", sec), w2 = $(".fa-sec__w2", sec), w3 = $(".fa-sec__w3", sec);
      const icon = $(".fa-sec__icon", sec), check = $(".fa-sec__check", sec), spin = $(".fa-sec__spin", sec), spin2 = $(".fa-sec__spin2", sec);
      const so = { transformOrigin: "50% 50%" };
      gsap.set([all, icon, check, spin, spin2], so);
      gsap.set(words, { x: 67, y: 40 });
      const layout = (n) => {
        // 0 “Save It” · 1 “Saving It” · 2 “Saved It” — the second word shifts by the width of the previous word
        w2.textContent = n === 1 ? "ing" : n === 2 ? "d" : "";
        const a = w1.getComputedTextLength(), b = w2.getComputedTextLength();
        gsap.set(w2, { attr: { x: a } });
        return a + b + 5;
      };
      const step = (n, first) => {
        n %= 3;
        const t = reduce || first ? { duration: 0 } : sp(S800);
        const x3 = layout(n);
        gsap.to(w3, { attr: { x: x3 }, ...t });
        if (!first && !reduce) n === 0 ? gsap.to(all, { scale: 0.92, duration: 0.2 }) : gsap.fromTo(all, { scale: 0.9 }, { scale: 1, duration: 0.2 });
        else gsap.set(all, { scale: n === 0 ? 0.92 : 1 });
        gsap.to(outer, { opacity: n === 1 ? 1 : 0, duration: reduce || first ? 0 : 1 });
        gsap.to(rings, { opacity: n !== 2 ? 1 : 0, duration: reduce || first ? 0 : 1, delay: reduce || first ? 0 : 0.2 });
        gsap.to(words, { x: n === 0 ? 42 : 67, ...t });
        gsap.to(icon, { scale: n === 0 ? 0 : 1, ...t });
        gsap.to(check, { scale: n === 2 ? 1 : 0, ...t });
        gsap.to(spin, { scale: n === 1 ? 1 : 0, opacity: n === 1 ? 1 : 0, ...t });
      };
      step(0, true);
      if (!reduce) {
        gsap.fromTo($(".fa-sec__ring1", sec), { opacity: 0.1 }, { keyframes: { opacity: [0.1, 0.5, 0.1], easeEach: io }, duration: 1, repeat: -1, yoyo: true, delay: 0.15 });
        gsap.fromTo($(".fa-sec__ring2", sec), { opacity: 0.25 }, { keyframes: { opacity: [0.25, 1, 0.25], easeEach: io }, duration: 1, repeat: -1 });
        gsap.fromTo(spin, { rotation: 0 }, { rotation: 720, duration: 1, ease: io, repeat: -1 });
        gsap.fromTo(spin2, { rotation: 0 }, { rotation: 360, duration: 0.75, ease: "none", repeat: -1 });
        later(every(2000, step));
      }
    }

    // Fast — 3 stages 2s: circle and text fill by css 100ms, inner white circle (hole) · check · spinner by spring 4·800·80, spinner [0,720] 3s + [0,360] .5s
    const steps = $(".fa-steps");
    if (steps) {
      const test = (expr, i) => (expr === "i>0" ? i > 0 : expr === "i==0" ? i === 0 : expr === "i==1" ? i === 1 : expr === "i==2" ? i === 2 : expr === "i!=2" ? i !== 2 : expr === "i>=2" ? i >= 2 : false);
      $$(".fa-steps__hole, .fa-steps__ok, .fa-steps__busy, .fa-steps__date", steps).forEach((g) => gsap.set(g, { transformOrigin: "50% 50%" }));
      const step = (i, first) => {
        const n = i % 3;
        const t = reduce || first ? { duration: 0 } : sp(S800);
        $$("[data-on]", steps).forEach((el) => el.classList.toggle("is-on", test(el.dataset.on, n)));
        $$("[data-hole]", steps).forEach((g) => gsap.to(g, { scale: test(g.dataset.hole, n) ? 1 : 0, ...t }));
        $$("[data-ok]", steps).forEach((g) => gsap.to(g, { scale: test(g.dataset.ok, n) ? 1 : 0, ...t }));
        $$("[data-busy]", steps).forEach((g) => gsap.to(g, { scale: test(g.dataset.busy, n) ? 1 : 0, ...t }));
        $$("[data-show]", steps).forEach((g) => gsap.to(g, { opacity: test(g.dataset.show, n) ? 1 : 0, ...t }));
      };
      step(0, true);
      if (!reduce) {
        gsap.fromTo($(".fa-steps__spin", steps), { rotation: 0 }, { rotation: 720, duration: 3, ease: io, repeat: -1, svgOrigin: "24 66" });
        gsap.fromTo($(".fa-steps__spin2", steps), { rotation: 0 }, { rotation: 360, duration: 0.5, ease: "none", repeat: -1, svgOrigin: "24 66" });
        later(every(2000, step));
      }
    }

    // Strong — 3 steps 2s: three texts y 0 / next 10 / previous −10 · transparent · .96× (spring 4·2000·80, .1s later when turning on), the seconds number counts from the previous value → the new value,
    // Scale dots: lit dot 1.5x, opacity 0, icon 1.35x · row group y shift (as in the original)
    const speed = $(".fa-speed");
    if (speed) {
      const opts = $$(".fa-speed__opt", speed), rows = $$(".fa-speed__row", speed), num = $(".fa-speed__n", speed);
      const secs = [[15, 60], [60, 30], [30, 15]];
      const rowY = [[0, -2, -2], [0, -3, -8], [0, 0, -4]];
      const dotS = [[1.5, 1, 0.5], [1, 1.5, 1], [0.5, 1, 1.5]];
      rows.forEach((r) => { gsap.set($(".fa-speed__dot", r), { transformOrigin: "50% 50%" }); gsap.set($(".fa-speed__ic", r), { transformOrigin: "50% 50%" }); });
      const step = (i, first) => {
        const n = i % 3;
        const t = reduce || first ? { duration: 0 } : sp(S2000);
        opts.forEach((o, k) => {
          const on = k === n;
          gsap.to(o, { y: on ? 0 : k === (n + 1) % 3 ? 10 : -10, opacity: on ? 1 : 0, scale: on ? 1 : 0.96, ...t, delay: on && !first && !reduce ? 0.1 : 0 });
        });
        rows.forEach((r, k) => {
          gsap.to(r, { y: rowY[k][n], ...t });
          gsap.to($(".fa-speed__dot", r), { scale: dotS[k][n], opacity: k === n ? 0 : 1, ...t });
          gsap.to($(".fa-speed__ic", r), { scale: k === n ? 1.35 : 0.5, opacity: k === n ? 1 : 0, ...t });
        });
        const [a, b] = secs[n], o = { v: a };
        reduce || first ? (num.textContent = b) : gsap.to(o, { v: b, ...sp(S2000), onUpdate: () => (num.textContent = Math.round(o.v)) });
      };
      step(0, true);
      if (!reduce) later(every(2000, step));
    }

    // Fun — every 2s (n+1)%9: line moves −100/27% each (css 1000ms (.19,1,.22,1)), lit circle 1.25×, lit face repeats its .75s ((.63,.01,.54,1.03)) motion 10 more times with .25s rests
    const fun = $(".fa-fun");
    if (fun) {
      const track = $(".fa-fun__track", fun), ics = $$(".fa-fun__ic", fun);
      const dance = ce("0.63,0.01,0.54,1.03", "power2.inOut");
      const moves = [
        { rotation: [0, 10, 0, 10, 0, 10, 0], transformOrigin: "10% 80%" }, { rotation: [0, 10, -10, 10, 0], y: [0, -5, 0], transformOrigin: "50% 80%" },
        { y: [0, -10, 0, 0, 0, -10, 0, 0], scaleY: [1, 1.1, 1, 1, 1, 1.1, 1, 1], scaleX: [1, 1, 1.1, 1, 1, 1, 1.1, 1] }, { y: [0, -5, 5, -5, 5, -5, 0] },
        { y: [0, -2, 0, 0, 0, -2, 0, 0], scaleY: [1, 1.1, 1, 1, 1, 1.1, 1, 1], scaleX: [1, 1, 1.1, 1, 1, 1, 1.1, 1] }, { rotation: [0, 10, -10, 10, 0], y: [0, -5, 0], transformOrigin: "50% 80%" },
        { y: [0, -10, 0, 0, 0, -10, 0, 0], scaleY: [1, 1.1, 1, 1, 1, 1.1, 1, 1], scaleX: [1, 1, 1.1, 1, 1, 1, 1.1, 1] }, { y: [0, 0, 2, -35, -35, -38, 0] },
        { y: [0, -10, 0, 0, 0, -10, 0, 0], scaleY: [1, 1.1, 1, 1, 1, 1.1, 1, 1], scaleX: [1, 1, 1.1, 1, 1, 1, 1.1, 1] },
      ];
      let play = null;
      const step = (i) => {
        const n = i % 9;
        track.style.transform = `translateX(${(-100 / 27) * n}%)`;
        ics.forEach((c, k) => c.classList.toggle("is-on", k === n));
        play?.kill();
        if (reduce) return;
        const face = $(".fa-fun__face", ics[n]);
        const { transformOrigin, ...kf } = moves[n];
        play = gsap.to(face, { keyframes: { ...kf, easeEach: "none" }, transformOrigin: transformOrigin || "50% 50%", duration: 0.75, ease: dance, repeat: 10, repeatDelay: 0.25 });
      };
      step(0);
      if (!reduce) later(every(2000, step));
    }

    // Three phones — when visible, the active phone’s video plays once from the start, then moves on to the next phone. Active plate 1.1x, name 42px below
    $$("[data-phone-cycle]").forEach((wrap) => {
      const cols = $$(".fa-phones__col", wrap);
      const vids = cols.map((c) => $("video", c));
      let on = 0, inView = false;
      const wide = () => innerWidth > 768;
      const paint = () => cols.forEach((c, k) => {
        const panel = $(".fa-phones__panel", c), name = $(".fa-phones__name", c);
        const a = k === on && wide();
        if (reduce) return gsap.set([panel, name], { clearProps: "transform" });
        gsap.to(panel, { scale: a ? 1.1 : 1, ...sp(S800) });
        gsap.to(name, { y: a ? 42 : 0, ...sp(S800) });
      });
      const play = () => vids.forEach((v, k) => { if (k === on && inView) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); });
      vids.forEach((v, k) => v.addEventListener("ended", () => { if (k !== on) return; on = (on + 1) % vids.length; paint(); play(); }));
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) play(); else vids.forEach((v) => v.pause()); }).observe(wrap);
      paint();
    });

    // Share section phone — loops while visible
    $$("video[data-inview]").forEach((v) => new IntersectionObserver(([e]) => (e.isIntersecting && !reduce ? v.play().catch(() => {}) : v.pause())).observe(v));

    // Safety illustration — the mascot floats up as if breathing, and four marks around it tap in turn every 2s
    const safe = $(".fa-safe__art svg");
    if (safe && !reduce) {
      gsap.fromTo($(".fa-safe__float", safe), { y: -6 }, { y: 6, duration: 2, ease: io, repeat: -1, yoyo: true });
      gsap.fromTo($(".fa-safe__pond", safe), { scaleX: 0.94 }, { scaleX: 1.04, duration: 2, ease: io, repeat: -1, yoyo: true, transformOrigin: "50% 50%" });
      const badges = $$(".fa-safe__badge", safe);
      later(every(2000, (i) => badges.forEach((b, k) => gsap.to(b, { scale: k % 3 === i % 3 ? 1.15 : 1, opacity: k % 3 === i % 3 ? 1 : 0.7, ...sp(S800), transformOrigin: "50% 50%" }))));
    }

    // Detail 1 — three notification cards cycle through top, middle and bottom (2s). The card heading down rises 80px then settles behind
    const stack = $(".fa-stack");
    if (stack) {
      const toasts = $$(".fa-toast", stack);
      const pose = { top: { y: 0, scale: 1.01, z: 3 }, middle: { y: 10, scale: 0.94, z: 2 }, bottom: { y: 20, scale: 0.88, z: 1 } };
      // Original tK·tQ·t1: at step t, card k takes [bottom, center, top][(t + k) % 3]
      const roleOf = (k, t) => ["bottom", "middle", "top"][(k + t) % 3];
      const step = (t) => toasts.forEach((el, k) => {
        const r = roleOf(k, t % 3), p = pose[r];
        if (reduce) return gsap.set(el, { y: p.y, scale: p.scale, zIndex: p.z });
        gsap.delayedCall(0.5, () => gsap.set(el, { zIndex: p.z }));
        // A spring with three or more values runs in framer as .8s-long keyframes — rises 80px up then settles back down
        if (r === "bottom") gsap.to(el, { keyframes: { y: [1, -80, 20], easeEach: io }, scale: 0.88, duration: 0.8, ease: "none" });
        else gsap.to(el, { y: p.y, scale: p.scale, ...sp(S800) });
      });
      toasts.forEach((el, k) => { const p = pose[roleOf(k, 0)]; gsap.set(el, { y: p.y, scale: p.scale, zIndex: p.z }); });
      if (!reduce) later(every(2000, (i) => i && step(i)));
    }

    // Detail 2 — Analyzing ↔ Safe (1.75s): pill width shrinks and color changes in .4s, spin .4375s · check anticipate 1.75s, word x spring
    const scan = $(".fa-scan");
    if (scan) {
      const a = $(".fa-scan__a", scan), b = $(".fa-scan__b", scan), c = $(".fa-scan__c", scan), spin = $(".fa-scan__spin", scan), ok = $(".fa-scan__ok", scan);
      const step = (i) => {
        const safeNow = i % 2 === 1;
        // Switch with data instead of changing the class — the element name stays the same so it reads as a board that changes by itself
        scan.dataset.safe = safeNow ? "1" : "";
        const t = reduce ? { duration: 0 } : sp(S800);
        gsap.to(spin, { opacity: safeNow ? 0 : 1, scale: safeNow ? 0.5 : 1, ...t });
        gsap.to(ok, { opacity: safeNow ? 1 : 0, scale: safeNow ? 1 : 0.5, ...t });
        const gap = parseFloat(getComputedStyle(a.parentElement).columnGap) || 5;
        gsap.to(a, { x: safeNow ? -30 : 0, opacity: safeNow ? 0 : 1, ...t });
        gsap.to(b, { x: safeNow ? -a.offsetWidth - gap : 0, ...t });
        gsap.to(c, { x: safeNow ? b.offsetWidth + gap : a.offsetWidth + b.offsetWidth + gap * 2, opacity: safeNow ? 1 : 0, ...t });
      };
      if (!reduce) {
        gsap.to(spin, { rotation: 360, duration: 0.4375, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
        later(every(1750, step));
      } else step(1);
    }

    // Detail 4 — bundle picker: every 2s toggles start↔end, the chosen row presses to .98x and the checkmark grows with a spring
    const groups = $(".fa-groups");
    if (groups) {
      const rows = $$(".fa-groups__row", groups);
      const step = (i) => rows.forEach((r, k) => {
        const pick = k === i % 2;
        const tick = $(".fa-groups__tick", r);
        if (reduce) return gsap.set(tick, { scale: pick ? 1 : 0 });
        gsap.to(tick, { scale: pick ? 1 : 0, ...sp(S800) });
        if (pick) gsap.fromTo(r, { scale: 1 }, { keyframes: { scale: [1, 0.98, 1, 1, 1] }, ...sp(S800) });
      });
      if (!reduce) later(every(2000, step)); else step(0);
    }

    return () => timers.forEach(clearInterval);
  });

  // Q&A — only one open at a time. Horizontal bar 180°, vertical bar scale 0 · 80° (spring .5·220·20), height (.2·280·18), text .1s later (.5·200·18)
  const bar = springOf(0.5, 220, 20), hgt = springOf(0.2, 280, 18), txt = springOf(0.5, 200, 18);
  const reduceNow = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = $$(".fa-acc__item");
  const setItem = (item, open) => {
    const btn = $(".fa-acc__toggle", item), a = $(".fa-acc__a", item), p = $("p", a);
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Close" : "Open");
    const t = (s) => (reduceNow() ? { duration: 0 } : sp(s));
    gsap.to($(".is-h", btn), { rotation: open ? 180 : 0, ...t(bar) });
    gsap.to($(".is-v", btn), { scale: open ? 0 : 1, rotation: open ? 80 : 0, ...t(bar) });
    gsap.to(a, { height: open ? "auto" : 0, ...t(hgt) });
    gsap.to(p, { opacity: open ? 1 : 0, ...t(txt), delay: open && !reduceNow() ? 0.1 : 0 });
  };
  items.forEach((item) => {
    const toggle = () => {
      const open = $(".fa-acc__toggle", item).getAttribute("aria-expanded") !== "true";
      items.forEach((o) => o !== item && $(".fa-acc__toggle", o).getAttribute("aria-expanded") === "true" && setItem(o, false));
      setItem(item, open);
    };
    $(".fa-acc__toggle", item).addEventListener("click", toggle);
    $(".fa-acc__q", item).addEventListener("click", toggle);
    // Opacity .5 while pressed (.1s)
    $(".fa-acc__toggle", item).addEventListener("pointerdown", (e) => gsap.to(e.currentTarget, { opacity: 0.5, duration: 0.1 }));
    ["pointerup", "pointerleave"].forEach((ev) => $(".fa-acc__toggle", item).addEventListener(ev, (e) => gsap.to(e.currentTarget, { opacity: 1, duration: 0.1 })));
  });
})();
