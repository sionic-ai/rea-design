/* Home page — values read from the original bundle (page·setupHomeDesktopStage) */
(() => {
  // As in the original check — a touch tablet (below 900px) also follows the phone flow (no fixed stage)
  const JJ = window.JJ, reduce = JJ.reduce, phone = matchMedia("(max-width: 767px), (max-width: 900px) and (pointer: coarse)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const run = $(".hm-run"), pin = $(".hm-pin"), hero = $("[data-hero]"), cards = $("[data-cards]"), yard = $("[data-jj-yardlines]");
  const back = $("[data-jj-backdrop]"), headline = $("[data-jj-headline]"), light = $("[data-jj-light]"), quote = $(".hm-quote");
  const headMid = $("[data-hero-name]");

  // Length of the pinned stage: on wide screens 150vh × 5 − 100vh. The dot quote covers its 66%~100% range — the part records the spot before it sweeps.
  // The phone has no fixed stage like the original (home-native-flow): hero 100lvh → card band with a slanted top edge → 300lvh quote and photo section. The quote and photo move into that section’s pinned panel
  const stageVh = 150 * 5 - 100;
  const qp = phone ? document.createElement("div") : null;
  if (qp) {
    qp.className = "hm-qp";
    qp.innerHTML = '<div class="hm-qp__pin"></div>';
    qp.firstElementChild.append(quote, $(".hm-photos"));
    pin.append(qp);
    // While the quote floats up from below (section top edge from below the screen to above), the dot cluster shrinks into letters
    quote.setAttribute("data-fx-dot-matrix-text", "trigger: .hm-qp; start: top bottom; end: top top; scrub: .3; step: 6.4");
  } else quote.setAttribute("data-fx-dot-matrix-text", `trigger: .hm-run; start: top top-=${(stageVh * 0.66).toFixed(1)}%; end: top top-=${stageVh}%; scrub: .3; step: 3.8`);

  // Yard scale — 10·20·30·40·50 at each thick line, four thin ticks between
  yard.innerHTML = [10, 20, 30, 40, 50, 60].map((n) => `<div class="hm-yard__u">${'<div class="hm-yard__t"><i></i><i></i></div>'.repeat(4)}<div class="hm-yard__big"><b>${n}</b></div>${'<div class="hm-yard__t"><i></i><i></i></div>'.repeat(4)}</div>`).join("");
  // Partner strip logo slot
  const marks = $("[data-marks]");
  if (marks) {
    const one = [40, 38, 45, 58, 52, 81, 46, 40, 44].map((h, i) => `<span class="jj-mark" style="height:${h * 0.5}px;aspect-ratio:${[1.58, 1.78, 1, 1.18, 1.89, 1, 1, 2.1, 1.4][i]};border-radius:${i % 3 ? "4px" : "50%"}"></span>`).join("");
    marks.innerHTML = `<div style="display:flex;align-items:center">${one}</div><div style="display:flex;align-items:center">${one}</div>`;
  }

  // ── Card 3D tilt (original hero-card · signature card): toward the cursor Y 13° · X −9°, 1.05 scale, 46px forward — transform .2s (.22,1,.36,1) ──
  const tilt = (el, inner) => {
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    el.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const l = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2)), s = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2));
      Object.entries({ "--hover": "1", "--mxf": String(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))), "--ry-cursor": `${13 * s}deg`, "--rx": `${-9 * l}deg`, "--scale": "1.05", "--tz": "46px" }).forEach(([k, v]) => inner.style.setProperty(k, v));
    });
    el.addEventListener("pointerleave", () => Object.entries({ "--hover": "0", "--ry-cursor": "0deg", "--rx": "0deg", "--scale": "1", "--tz": "0px" }).forEach(([k, v]) => inner.style.setProperty(k, v)));
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } });
  };
  if (!reduce) {
    const hc = $("[data-hero-card]");
    tilt(hc, hc.querySelector(".hm-hero__card3d"));
  }

  // ── Portrait drift (original hero mouse.panAmount .15 · panEase .022/60fps): the panel is pushed late to the side opposite the cursor by .34×.15, and downward by .07×.15 world units.
  //    The original panel sits in front of a full-screen camera (fov 19 · z 2.65), so world 1 = Screen height / 0.887 px. The tilt (.12 and .016 rad) is handled by depth-tilt-photo ──
  const panEl = $("[data-hero-portrait]");
  if (panEl && !reduce && !phone) {
    const unit = 2 * Math.tan((19 * Math.PI) / 360) * 2.65, tgt = { x: 0, y: 0 }, pan = { x: 0, y: 0 };
    let last = 0, raf = 0;
    addEventListener("mousemove", (e) => { tgt.x = (e.clientX / innerWidth) * 2 - 1; tgt.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    const step = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60, k = 1 - Math.pow(1 - 0.022, 60 * dt);
      last = now;
      pan.x += (tgt.x - pan.x) * k; pan.y += (tgt.y - pan.y) * k;
      const px = innerHeight / unit;
      panEl.style.translate = `${(-0.34 * 0.15 * pan.x * px).toFixed(2)}px ${(-0.07 * 0.15 * pan.y * px).toFixed(2)}px`;
      raf = requestAnimationFrame(step);
    };
    new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); raf = 0; last = 0; if (e.isIntersecting) raf = requestAnimationFrame(step); }).observe(panEl);
  }

  // ── Card view overlay — the original presses a card to enter a video scene. Here a 16:9 video slot appears in the same place (.45s power2.out) ──
  const modal = document.createElement("div");
  modal.className = "hm-modal";
  modal.dataset.slot = "card-modal";
  modal.innerHTML = `<div class="hm-modal__box"><div class="jj-ph" data-label="Scene video · highlight clip · landscape 16:9 · click to play"></div><button type="button" class="hm-modal__x" aria-label="Close"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2 2l10 10M12 2 2 12"/></svg></button></div>`;
  document.body.append(modal);
  gsap.set(modal, { autoAlpha: 0 });
  const openModal = () => { JJ.lenis?.stop(); gsap.to(modal, { autoAlpha: 1, duration: 0.45, ease: "power2.out", overwrite: "auto" }); };
  const closeModal = () => { JJ.lenis?.start(); gsap.to(modal, { autoAlpha: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" }); };
  $$(".hm-card").forEach((c) => c.addEventListener("click", openModal));
  modal.addEventListener("click", (e) => (e.target === modal || e.target.closest(".hm-modal__x")) && closeModal());
  addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  // ── Hero intro video slot: a tunnel of yellow light rays spreading from the vanishing point (a canvas runs the same length instead of a video) ──
  const intro = $("[data-hero-intro]"), ic = intro.querySelector("canvas"), ix = ic.getContext("2d");
  let introRaf = 0;
  const rays = Array.from({ length: 46 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), w: 1 + Math.random() * 3, s: 0.2 + Math.random() * 0.6 }));
  const introColor = JJ.color("--site-cta");
  const tunnel = (x, w, h, t, lw = 1, color = introColor, alpha = 1) => {
    const cx = w * 0.5, cy = h * 0.42, L = Math.hypot(w, h);
    x.strokeStyle = color;
    rays.forEach((r) => {
      const d = ((r.r + t * r.s * 0.0004) % 1);
      x.globalAlpha = (0.15 + 0.6 * d) * alpha;
      x.lineWidth = r.w * (0.5 + d * 3) * lw;
      x.beginPath();
      x.moveTo(cx + Math.cos(r.a) * L * d * 0.4, cy + Math.sin(r.a) * L * d * 0.4);
      x.lineTo(cx + Math.cos(r.a) * L * (d * 0.4 + 0.25), cy + Math.sin(r.a) * L * (d * 0.4 + 0.25));
      x.stroke();
    });
    x.globalAlpha = 1;
  };
  const drawIntro = (t) => {
    const w = (ic.width = innerWidth), h = (ic.height = innerHeight);
    ix.clearRect(0, 0, w, h);
    tunnel(ix, w, h, t);
    introRaf = requestAnimationFrame(drawIntro);
  };

  // ── Lens reflection video slot: the original loops the intro video (a tunnel) endlessly onto the sunglasses lens — we keep drawing the same tunnel on a small plate so the depth plate reads from the lens.
  //    The original lens is fully bright with stadium light at the tunnel end — on a background spreading from the exit light (center) to golden stands (edges), draw the tunnel ribs darkly ──
  const refl = $("[data-hero-reflection]");
  if (refl) {
    const rx = refl.getContext("2d"), RW = refl.width, RH = refl.height;
    const exitLight = JJ.color("--site-gold-bright"), stands = JJ.color("--site-gold"), deep = JJ.color("--site-ink");
    const paintRefl = (t) => {
      rx.globalAlpha = 1;
      const g = rx.createRadialGradient(RW * 0.5, RH * 0.42, 0, RW * 0.5, RH * 0.42, RW * 0.6);
      g.addColorStop(0, exitLight); g.addColorStop(0.4, introColor); g.addColorStop(1, stands);
      rx.fillStyle = g; rx.fillRect(0, 0, RW, RH);
      tunnel(rx, RW, RH, t, RW / innerWidth * 2, deep, 0.55);
    };
    paintRefl(0);
    if (!reduce) {
      let rr = 0;
      const loop = (t) => { if (hero.style.visibility !== "hidden") paintRefl(t); rr = requestAnimationFrame(loop); };
      new IntersectionObserver(([e]) => { cancelAnimationFrame(rr); rr = e.isIntersecting ? requestAnimationFrame(loop) : 0; }).observe(refl.parentElement);
    }
  }

  // ── Hero intro timeline (original): at 1s progress to .4 over 1.2s sine.inOut → at 2.2s to 1 over 1.8s power3.out,
  //    At 2.9s name · text 1.4s power2.out, at 3.2s side boxes x 0 1.4s power3.out, typing 2.2s linear ──
  const left = $("[data-hero-left]"), right = $("[data-hero-right]"), portrait = $("[data-hero-portrait]");
  const typeEl = $("[data-type]");
  const letters = [];
  typeEl.innerHTML = typeEl.textContent.split(" ").map((w) => `<span style="display:inline-block">${[...w].map((ch) => `<span class="ch">${ch}</span>`).join("")}</span>`).join(" ");
  letters.push(...typeEl.querySelectorAll(".ch"));
  const sig = JJ.signature($("[data-hero-right] [data-signature]"));
  const prog = { v: 0 };
  const applyProg = () => {
    const v = prog.v;
    portrait.style.setProperty("--fx-reveal", Math.max(0, Math.min(1, (v - 0.1) / 0.9)).toFixed(3));
    intro.style.opacity = String(1 - Math.max(0, Math.min(1, (v - 0.1) / 0.8)));
    intro.style.transform = `scale(${1 + 0.18 * v})`;
  };
  if (reduce) {
    prog.v = 1; applyProg(); intro.style.display = "none";
    sig?.goToAndStop(152, true);
  } else {
    gsap.set([left], { autoAlpha: 0, x: -40 });
    gsap.set([right], { autoAlpha: 0, x: 40 });
    gsap.set(headMid, { autoAlpha: 0 });
    letters.forEach((l) => (l.style.visibility = "hidden"));
    applyProg();
    introRaf = requestAnimationFrame(drawIntro);
    const tl = gsap.timeline({ paused: true, defaults: { ease: JJ.ease("editorial") } });
    tl.to(prog, { v: 0.4, duration: 1.2, ease: "sine.inOut", onUpdate: applyProg }, 1)
      .to(prog, { v: 1, duration: phone ? 2.1 : 1.8, ease: "power3.out", onUpdate: applyProg, onComplete: () => { cancelAnimationFrame(introRaf); intro.style.display = "none"; } }, 2.2)
      .to(headMid, { autoAlpha: 1, duration: 1.4, ease: "power2.out" }, 2.9)
      .to(left, { autoAlpha: 1, x: 0, duration: 1.4, ease: "power3.out" }, 3.2)
      .to(right, { autoAlpha: 1, x: 0, duration: 1.4, ease: "power3.out" }, 3.2)
      .call(() => sig?.play(), null, 3.2);
    const shown = { n: 0 };
    tl.to(shown, { n: letters.length, duration: 2.2, ease: "none", onUpdate: () => { const k = Math.round(shown.n); letters.forEach((l, i) => (l.style.visibility = i < k ? "" : "hidden")); } }, 3.2);
    // When the cover starts lifting, starts the timeline from the .2s point — the empty lead-in (1s) overlaps the .8s lift so the intro follows right as it clears
    let started = false;
    const go = (at) => { if (started) return; started = true; tl.play(at); };
    addEventListener("jj:lift", () => go(0.2), { once: true });
    JJ.onReveal(() => go(1));
  }

  // ── Pinned stage — original setupHomeDesktopStage as one timeline (scrub .3) with length 1 ──
  const vw = () => Math.min(innerWidth, 2560);
  const mm = gsap.matchMedia();
  if (!phone) mm.add("(prefers-reduced-motion: no-preference)", () => {
    const Y = () => pin.offsetHeight || innerHeight;
    const X = () => Math.max(1, (stageVh / 100) * innerHeight);
    const wipe = (t) => {
      hero.style.setProperty("--wipe-l", `${(1 - 1.2 * t) * 100}%`);
      hero.style.setProperty("--wipe-r", `${(1 - 1.8 * t) * 100}%`);
      hero.style.visibility = t >= 0.99 ? "hidden" : "";
      document.body.dataset.tone = t > 0.45 ? "dark" : "light";
    };
    const W = { t: 0 };
    const O = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: run, start: "top top", end: () => `+=${X()}`, scrub: 0.3, invalidateOnRefresh: true } });
    O.fromTo(W, { t: 0 }, { t: 1, duration: 0.215, onUpdate: () => wipe(W.t) }, 0);
    O.fromTo(cards, { x: () => vw() }, { x: () => -cards.scrollWidth - 0.5 * vw() + vw() * 0.0, duration: 0.615 }, 0);
    O.fromTo(yard, { x: 0 }, { x: () => -0.45 * (cards.scrollWidth + 0.5 * vw() + vw()), duration: 0.615 }, 0);
    // The Hero card flies to the strip’s first card position making one full turn (360°) — .02~.15, power2.inOut.
    const heroCard = $("[data-hero-card]"), first = cards.querySelector(".hm-card"), firstBox = first.querySelector(".hm-card__3d");
    const flight = document.createElement("div");
    flight.className = "hm-flight";
    flight.innerHTML = `<div class="hm-card__3d" style="--ar:auto"><div class="hm-card__face jj-ph" data-label="Scene 1 card · in flight"></div><div class="hm-card__frame"></div></div>`;
    pin.append(flight);
    const fly = { p: 0 }, e2 = gsap.parseEase("power2.inOut");
    const drawFlight = () => {
      const p = fly.p;
      if (p <= 0 || p >= 1) {
        flight.style.visibility = "hidden";
        heroCard.style.visibility = p >= 1 ? "hidden" : "";
        firstBox.style.visibility = p >= 1 || p <= 0 ? "" : "hidden";
        return;
      }
      const a = heroCard.getBoundingClientRect(), b = firstBox.getBoundingClientRect(), base = pin.getBoundingClientRect(), v = e2(p);
      const w = a.width + (b.width - a.width) * v, h = a.height + (b.height - a.height) * v;
      const x = a.left + (b.left - a.left) * v - base.left, y = a.top + (b.top - a.top) * v - base.top;
      heroCard.style.visibility = "hidden"; firstBox.style.visibility = "hidden";
      flight.style.visibility = "";
      flight.style.width = `${w}px`; flight.style.height = `${h}px`;
      flight.style.transform = `translate(${x}px, ${y}px)`;
      flight.firstElementChild.style.transform = `rotateY(${360 * v}deg)`;
    };
    O.fromTo(fly, { p: 0 }, { p: 1, duration: 0.13, onUpdate: drawFlight }, 0.02);
    O.fromTo(light, { "--jj-light-fade": 1 }, { "--jj-light-fade": 0, duration: 0.092 }, 0.4);
    O.to([yard, headline], { opacity: 0, duration: 0.062 }, 0.431);
    O.fromTo(back, { backgroundColor: JJ.color("--kf-bg") }, { backgroundColor: JJ.color("--site-stage-tint"), duration: 0.123 }, 0.492);
    // The dot quote panel becomes visible after 66%
    const qt = ScrollTrigger.create({ trigger: run, start: () => `top top-=${0.66 * X()}`, end: () => `+=${0.34 * X()}`, onToggle: (s) => (quote.style.opacity = s.isActive || s.progress >= 1 ? "1" : "0"), onLeave: () => (quote.style.opacity = "1"), onLeaveBack: () => (quote.style.opacity = "0") });

    // ── Polaroids: fly in from below and stack over the quote (scrub .9). Original timing (110+44i−36)/w · length 36/w, background color from 82/w for 130/w ──
    const polars = $$(".hm-polar"), wN = 110 + 44 * polars.length;
    const P = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: run, start: () => `top top-=${X()}`, end: "bottom bottom", scrub: 0.9, invalidateOnRefresh: true } });
    polars.forEach((el, i) => {
      const xo = parseFloat(el.style.getPropertyValue("--x")) || 0, rot = parseFloat(el.style.getPropertyValue("--r")) || 0;
      P.fromTo(el, { x: 0, y: 0, xPercent: xo, yPercent: () => ((Y() / 2 + el.offsetHeight / 2) / (el.offsetHeight || 1)) * 100 + 35, rotation: -2 * rot, opacity: 1 }, { y: 0, yPercent: 0, rotation: rot, duration: 36 / wN, ease: "power2.out" }, (110 + 44 * i - 36) / wN);
    });
    P.fromTo(back, { backgroundColor: JJ.color("--site-stage-tint") }, { immediateRender: false, backgroundColor: JJ.color("--kf-bg"), duration: 130 / wN }, 82 / wN);
    P.add(() => {}, 1);
    return () => { qt.kill(); flight.remove(); };
  });

  // ── Phone: card rail (original rail — slot width 66pu · gap 14px · sides 24px, free swipe) · dot indicator (6px tall, current slot 18px·.9 · others 6px·.3, .3s) ──
  if (phone) {
    const list = $$(".hm-card", cards), dotsBox = $("[data-cards-dots]");
    dotsBox.innerHTML = list.map((_, i) => `<button type="button" class="hm-dots__b" aria-label="Scene ${i + 1} / ${list.length}"><i></i></button>`).join("");
    const dotEls = $$(".hm-dots__b", dotsBox);
    const step = () => (list[0].offsetWidth || 1) + 14;
    let at = -1;
    const mark = () => {
      const i = Math.max(0, Math.min(list.length - 1, Math.round(cards.scrollLeft / step())));
      if (i === at) return;
      at = i;
      list.forEach((c, k) => c.toggleAttribute("aria-current", k === i));
      dotEls.forEach((d, k) => d.toggleAttribute("aria-current", k === i));
    };
    mark();
    cards.addEventListener("scroll", mark, { passive: true });
    dotEls.forEach((d, i) => d.addEventListener("click", () => cards.scrollTo({ left: i * step(), behavior: reduce ? "auto" : "smooth" })));
    // Header color: when the dark panel of the card strip touches the header line, text turns light
    ScrollTrigger.create({ trigger: back, start: "top top+=30", onEnter: () => (document.body.dataset.tone = "dark"), onLeaveBack: () => (document.body.dataset.tone = "light") });
    quote.style.opacity = "1";
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The quote moves from 55% below at 1.25x into place while the section’s top edge comes in (1−(1−t)²)
      const wrap = $(".hm-quote__wrap", quote);
      const rise = gsap.fromTo(wrap, { yPercent: 55, scale: 1.25 }, { yPercent: 0, scale: 1, ease: "power1.out", scrollTrigger: { trigger: qp, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
      // Photo: original phone timetable (110+44i+52−36)/300 · length 36/300, from when the section touches the screen bottom to the end (scrub .9)
      const polars = $$(".hm-polar"), H = () => qp.firstElementChild.offsetHeight || innerHeight;
      const P = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: qp, start: "top bottom", end: "bottom bottom", scrub: 0.9, invalidateOnRefresh: true } });
      polars.forEach((el, i) => {
        const xo = parseFloat(el.style.getPropertyValue("--x")) || 0, rot = parseFloat(el.style.getPropertyValue("--r")) || 0;
        P.fromTo(el, { x: 0, y: 0, xPercent: xo, yPercent: () => ((H() / 2 + el.offsetHeight / 2) / (el.offsetHeight || 1)) * 100 + 35, rotation: -2 * rot, opacity: 1 }, { y: 0, yPercent: 0, rotation: rot, duration: 36 / 300, ease: "power2.out" }, (110 + 44 * i + 52 - 36) / 300);
      });
      P.add(() => {}, 1);
      return () => { rise.scrollTrigger?.kill(); rise.kill(); };
    });
  }

  // ── Partners: six fixed cells — when the cell changes, the description text comes in from blur in .65s power3.out (.07 stagger, 22px), and the product swaps in .8s power3.out ──
  const pt = $(".pt"), stage = $("[data-pt-stage]"), products = $$(".pt__product"), descs = $$(".pt__desc"), dots = $$(".pt__dot"), prodWrap = $("[data-pt-products]");
  const N = products.length;
  let cur = 0;
  const show = (i, dir) => {
    if (i === cur) return;
    const prev = cur, t = dir === "down" ? 22 : -22;
    cur = i;
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
    descs.forEach((d, k) => d.classList.toggle("is-on", k === i));
    products.forEach((p, k) => k !== i && k !== prev && p.classList.remove("is-on"));
    products[i].classList.add("is-on");
    if (reduce) { products[prev].classList.remove("is-on"); return; }
    gsap.fromTo(descs[i].children, { opacity: 0, y: t, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, ease: "power3.out", stagger: 0.07, clearProps: "filter,transform", overwrite: "auto" });
    gsap.fromTo(products[i], { opacity: 0, y: t }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", clearProps: "transform", overwrite: "auto" });
    gsap.to(products[prev], { opacity: 0, y: -t, duration: 0.8, ease: "power3.out", overwrite: "auto", onComplete: () => cur !== prev && products[prev].classList.remove("is-on") });
  };
  const span = N + 0.6, d = N / span;
  if (!phone) ScrollTrigger.create({
    trigger: pt, start: "top top", end: "bottom bottom",
    onUpdate: (s) => {
      const root = document.documentElement;
      if (s.progress <= d) {
        const c = (s.progress / d) * N, u = Math.min(N - 1, Math.floor(c));
        show(u, s.direction > 0 ? "down" : "up");
        stage.style.setProperty("--p-wipe", "0");
        if (!reduce) { const e = Math.min(1, (s.progress * span * 100) / 30); gsap.set(prodWrap, { yPercent: 18 * (1 - e) * (1 - e) }); }
        document.body.dataset.tone = "dark";
      } else {
        const w = (s.progress - d) / (1 - d);
        stage.style.setProperty("--p-wipe", String(Math.min(1, w * 1.2)));
        document.body.dataset.tone = w > 0.5 ? "light" : "dark";
      }
    },
    onLeave: () => (document.body.dataset.tone = "light"),
  });
  if (!phone) dots.forEach((dot, i) => dot.addEventListener("click", () => {
    const top = pt.getBoundingClientRect().top + scrollY, l = pt.offsetHeight - innerHeight;
    const to = top + ((i + 0.5) / N) * d * l;
    JJ.lenis ? JJ.lenis.scrollTo(to, { duration: 0.7 }) : scrollTo({ top: to, behavior: "smooth" });
  }));

  // ── Phone partner rail (original rail): text panels snap one at a time, and images swap overlapping by the swipe distance (1−distance).
  //    1.2s after release, once over half the section is visible, the current dot fills over 5.5s and when full, advances to the next slot ──
  if (phone) {
    const rail = $("[data-pt-descs]"), gapPx = 12;
    const at = () => rail.scrollLeft / ((descs[0].offsetWidth || 1) + gapPx);
    let k = -1, fill = 0, idleFrom = performance.now(), auto = false;
    const paint = () => {
      const a = at(), i = Math.max(0, Math.min(N - 1, Math.round(a)));
      products.forEach((p, j) => { const v = Math.max(0, 1 - Math.abs(a - j)); p.style.opacity = v.toFixed(3); p.style.visibility = v > 0 ? "visible" : "hidden"; });
      if (i !== k) {
        k = i; cur = i; fill = 0;
        dots.forEach((dd, j) => { dd.classList.toggle("is-on", j === i); dd.style.removeProperty("--fill"); });
        products.forEach((p, j) => p.classList.toggle("is-on", j === i));
      }
    };
    const go = (i) => { auto = true; rail.scrollTo({ left: ((i + N) % N) * ((descs[0].offsetWidth || 1) + gapPx), behavior: reduce ? "auto" : "smooth" }); };
    paint();
    rail.addEventListener("scroll", () => { if (!auto) idleFrom = performance.now(); paint(); }, { passive: true });
    rail.addEventListener("scrollend", () => (auto = false));
    ["touchstart", "pointerdown"].forEach((ev) => rail.addEventListener(ev, () => { auto = false; idleFrom = performance.now(); }, { passive: true }));
    dots.forEach((dot, i) => dot.addEventListener("click", () => { idleFrom = performance.now(); go(i); }));
    ScrollTrigger.create({ trigger: pt, start: "top top+=30", onEnter: () => (document.body.dataset.tone = "dark"), onLeaveBack: () => (document.body.dataset.tone = "dark") });
    if (!reduce) {
      let raf = 0, last = 0;
      const tick = (now) => {
        const dt = last ? Math.min(100, now - last) : 16;
        last = now;
        if (!auto && now - idleFrom > 1200) {
          fill = Math.min(1, fill + dt / 5500);
          dots[k]?.style.setProperty("--fill", fill.toFixed(4));
          if (fill >= 1) { fill = 0; idleFrom = now; go(k + 1); }
        }
        raf = requestAnimationFrame(tick);
      };
      new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); last = 0; raf = e.isIntersecting ? requestAnimationFrame(tick) : 0; }, { threshold: 0.5 }).observe(rail);
    }
  }
  // ── Photo pair (original pair cell): follows the cursor at .055 per frame only while that cell is on — front sheet 20 · 12px · −4+1.4°, back sheet −13 · −8px · 2.5−1°.
  //    When a cell turns off, its target returns to 0 and stops after settling ──
  const pairEl = $("[data-pt-pair]");
  if (pairEl && !reduce) {
    const front = $("[data-pair-front]", pairEl), back = $("[data-pair-back]", pairEl), a = { tx: 0, ty: 0, cx: 0, cy: 0 };
    let pr = 0, active = false;
    const onMove = (e) => { a.tx = (e.clientX / innerWidth) * 2 - 1; a.ty = (e.clientY / innerHeight) * 2 - 1; };
    const step = () => {
      a.cx += (a.tx - a.cx) * 0.055; a.cy += (a.ty - a.cy) * 0.055;
      front.style.transform = `translate3d(${(20 * a.cx).toFixed(2)}px, ${(12 * a.cy).toFixed(2)}px, 0) rotate(${(-4 + 1.4 * a.cx).toFixed(2)}deg)`;
      back.style.transform = `translate3d(${(-13 * a.cx).toFixed(2)}px, ${(-8 * a.cy).toFixed(2)}px, 0) rotate(${(2.5 - a.cx).toFixed(2)}deg)`;
      if (!active && Math.abs(a.cx) < 0.002 && Math.abs(a.cy) < 0.002) { a.cx = a.cy = 0; front.style.transform = back.style.transform = ""; pr = 0; return; }
      pr = requestAnimationFrame(step);
    };
    const setActive = (on) => {
      if (on === active) return;
      active = on;
      if (on) addEventListener("pointermove", onMove, { passive: true });
      else { removeEventListener("pointermove", onMove); a.tx = a.ty = 0; }
      if (!pr) pr = requestAnimationFrame(step);
    };
    new MutationObserver(() => setActive(pairEl.classList.contains("is-on"))).observe(pairEl, { attributes: true, attributeFilter: ["class"] });
  }

  // Product panels shift ±34px opposite to the mouse — quickTo 1.4s power3.out, only while the section is visible
  if (!reduce && JJ.fine) {
    const qx = gsap.quickTo(prodWrap, "x", { duration: 1.4, ease: "power3.out" });
    let on = false;
    ScrollTrigger.create({ trigger: pt, start: "top bottom", end: "bottom top", onToggle: (s) => { on = s.isActive; if (!on) qx(0); } });
    addEventListener("pointermove", (e) => on && qx(-(34 * ((e.clientX / innerWidth) * 2 - 1))));
  }

  // Over the previous section, header color: dark text on light sections (e.g. Foundation, Play)
  ScrollTrigger.create({ trigger: ".fd", start: "top 10%", endTrigger: ".mp", end: "bottom 10%", onToggle: (s) => s.isActive && (document.body.dataset.tone = "light"), onLeave: () => (document.body.dataset.tone = "dark") });
})();
