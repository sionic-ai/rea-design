// Subpage motion — staircase heading letter rise, case heading Flip, list rows with photo following · text list photo panel, FAQ, work cloud tilt, expanded layer (case), next case video, article TOC progress line
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!window.gsap || !window.ScrollTrigger) return;

  /* Stair header — same text rise as the first screen (140%·8°·1.15s expo.out·.035, line .12) */
  Promise.all([document.fonts?.ready, window.siteIntro]).then(([, wait = 0.15]) => {
    if (reduce || !window.SplitText) return;
    const parts = [...document.querySelectorAll("[data-intro-chars]")].map((el) => SplitText.create(el, { type: "chars", mask: "chars", charsClass: "split-char", aria: "none" }));
    const tl = gsap.timeline({ delay: wait });
    parts.forEach((s, i) => tl.from(s.chars, { yPercent: 140, rotate: 8, duration: 1.15, ease: "expo.out", stagger: 0.035 }, 0.12 * i));
    const sub = document.querySelectorAll("[data-intro-fade]");
    if (sub.length) tl.from(sub, { opacity: 0, y: 14, duration: 0.7, ease: "power2.out", stagger: 0.08 }, 0.75);
    tl.from(document.querySelector("[data-reel-tilt]") || ".page-hero__inline", { scale: 0.4, opacity: 0, rotate: -18, duration: 1, ease: "back.out(1.7)" }, 0.35);
  });

  /* Case head video box — the same original hero module as the first page: from when the box center reaches the screen center until the showreel center reaches the screen center 
     Flip the panel inside the box into the showreel slot (scrub .25). Over the first third, the −5° and the hand tilt (data-max-rotate 14°, .5s power3.out) go to 0 */
  const caseBox = document.querySelector("[data-flip='case-hero']"), caseReel = document.querySelector("[data-flip='case-reel']"), caseTilt = document.querySelector("[data-reel-tilt]");
  if (caseBox && caseReel && caseTilt) {
    let k = 1, flipTl = null;
    const ang = { rx: 0, ry: 0 }, holder = caseBox.parentElement;
    const paintTilt = () => gsap.set(caseTilt, { rotationZ: -5 * k, rotationX: ang.rx * k, rotationY: ang.ry * k });
    gsap.set(caseTilt, { transformPerspective: 900, rotationZ: -5 });
    const build = () => {
      if (flipTl) { flipTl.scrollTrigger?.kill(); flipTl.kill(); gsap.set(caseBox, { clearProps: "all" }); }
      if (reduce || !window.Flip) return;
      flipTl = gsap.timeline({ scrollTrigger: { trigger: holder, start: "clamp(center center)", endTrigger: caseReel, end: "center center", scrub: 0.25 } });
      flipTl.add(Flip.fit(caseBox, caseReel, { duration: 1, ease: "none" }));
      flipTl.eventCallback("onUpdate", () => { k = 1 - Math.min(1, flipTl.progress() * 3); paintTilt(); });
    };
    // Measure after the font loads and the header text lines change — measuring earlier leaves the reel position off by however far the boxes moved
    Promise.resolve(document.fonts?.ready).then(() => requestAnimationFrame(build));
    let lastW = innerWidth;
    addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; build(); } });
    if (fine && !reduce) {
      const D = +(caseTilt.dataset.maxRotate || 14), lim = (v) => Math.max(-1, Math.min(1, v));
      addEventListener("pointermove", (e) => {
        const r = holder.getBoundingClientRect();
        gsap.to(ang, { rx: -lim((e.clientY - r.top - r.height / 2) / (r.height / 2 || 1)) * D * k, ry: lim((e.clientX - r.left - r.width / 2) / (r.width / 2 || 1)) * D * k, duration: 0.5, ease: "power3.out", overwrite: true, onUpdate: paintTilt });
      }, { passive: true });
    }
  }

  /* Next-case panel — on hover (900 wide and up) the video plays, on phones and tablets it plays once the panel is more than half visible (original hover-video) */
  if (!reduce) document.querySelectorAll("[data-hover-video]").forEach((el) => {
    if (fine && matchMedia("(min-width: 900px)").matches) {
      const on = () => el.classList.add("is-playing"), off = () => el.classList.remove("is-playing");
      el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off); el.addEventListener("focusin", on); el.addEventListener("focusout", off);
    } else new IntersectionObserver(([en]) => el.classList.toggle("is-playing", en.isIntersecting), { threshold: 0.5 }).observe(el);
  });

  /* Row list — the photo of the hovered row follows the cursor (.45s power3.out) */
  const rows = document.querySelectorAll("[data-row-img]");
  if (rows.length && fine && !reduce) {
    const img = document.createElement("div");
    img.className = "hover-img";
    img.innerHTML = '<span class="ph"></span>';
    document.body.appendChild(img);
    const ph = img.firstChild, qx = gsap.quickTo(img, "x", { duration: 0.45, ease: "power3.out" }), qy = gsap.quickTo(img, "y", { duration: 0.45, ease: "power3.out" });
    gsap.set(img, { autoAlpha: 0, scale: 0.95 });
    // Doesn’t follow outside the row — the only thing following the hand anywhere on the page is the cursor label
    addEventListener("pointermove", (e) => { if (img.classList.contains("is-on")) { qx(e.clientX + 24); qy(e.clientY - 80); } }, { passive: true });
    rows.forEach((r) => {
      r.addEventListener("pointerenter", (e) => { gsap.set(img, { x: e.clientX + 24, y: e.clientY - 80 }); ph.dataset.label = r.dataset.rowImg; img.classList.add("is-on"); gsap.to(img, { autoAlpha: 1, scale: 1, duration: 0.42, ease: "power2.out", overwrite: "auto" }); });
      r.addEventListener("pointerleave", () => { img.classList.remove("is-on"); gsap.to(img, { autoAlpha: 0, scale: 0.95, duration: 0.17, ease: "power2.out", overwrite: "auto" }); });
    });
  }

  /* Text row list (original services) — the photo panel attaches to the hover spot in the list. At first it hides at 8% right, vertically centered, −3°, .95, then
     When it enters the first line, it jumps straight to the interaction spot and settles in .5s power3.out, with x·y .7s · tilt .8s power3.out (×.4 of the sideways movement, ±8°, −3° base).
     When the row changes, only that row’s photo turns on at .35s power2.out. On leaving the list it goes to .95 and vanishes at .2s power2.out */
  if (fine && !reduce) document.querySelectorAll("[data-svc-host]").forEach((host) => {
    const list = host.querySelector("[data-svc]"), prev = host.querySelector("[data-svc-prev]");
    if (!list || !prev) return;
    const media = [...prev.querySelectorAll("[data-svc-media]")];
    list.querySelectorAll("[data-svc-row]").forEach((r, i) => (r.dataset.svcRow = String(i)));
    gsap.set(prev, { xPercent: 8, yPercent: -50, scale: 0.95, autoAlpha: 0, rotation: -3 });
    const qx = gsap.quickTo(prev, "x", { duration: 0.7, ease: "power3.out" }), qy = gsap.quickTo(prev, "y", { duration: 0.7, ease: "power3.out" });
    const qr = gsap.quickTo(prev, "rotation", { duration: 0.8, ease: "power3.out" });
    let on = false, cur = -1, lastX = 0;
    const at = (e) => { const r = host.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    list.addEventListener("pointerover", (e) => {
      const row = e.target.closest("[data-svc-row]");
      if (!row) return;
      if (!on) { const p = at(e); qx(p.x, p.x); qy(p.y, p.y); lastX = p.x; }
      const n = +row.dataset.svcRow;
      if (n !== cur) { cur = n; media.forEach((m, i) => gsap.to(m, { autoAlpha: i === n ? 1 : 0, duration: 0.35, ease: "power2.out", overwrite: true })); }
      if (!on) { on = true; gsap.to(prev, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" }); }
    });
    list.addEventListener("pointermove", (e) => {
      const p = at(e);
      if (on) { qx(p.x); qy(p.y); } else { qx(p.x, p.x); qy(p.y, p.y); }
      qr(Math.max(-8, Math.min(8, 0.4 * (p.x - lastX))) - 3);
      lastX = p.x;
    });
    list.addEventListener("pointerleave", () => { on = false; cur = -1; gsap.to(prev, { scale: 0.95, autoAlpha: 0, duration: 0.2, ease: "power2.out", overwrite: "auto" }); });
  });

  /* FAQ (original fq) — only one opens per group. On open, panel height goes 0→content over .45s power3.inOut, and .12s later the light answer panel is painted in with four brush strokes
     (per stroke end 0→1 .24s power4.out · .076s stagger, even strokes from the right · odd strokes from the left, inside panel 0 · end overshoot ×.3, the faster the blurrier the end ≤.3).
     On close, the stroke rewinds at double speed and .1s later the height folds in over .36s. The original uses an SVG mask (Safari uses the same rectangle as clip-path) — here clip-path */
  const FQ_ENDS = [[0.05, 0.09], [0.08, 0.04], [0.04, 0.07], [0.07, 0.05]], FQ_LAG = 0.24 * (1 - Math.pow(0.15, 0.2)), fqOpen = new Map();
  const fqGeo = (W, H, end = 0.3) => {
    const d = H / 1.069, w = 0.34 * d, k = 0.05 * d;
    return FQ_ENDS.map(([v, h], i) => {
      const r = (0.17 + 0.243 * i) * d, g = W * v * end, y = W * (1 - h * end), [x0, x1] = i % 2 === 0 ? [y, g] : [g, y];
      return { x0, y0: r - k / 2, x1, y1: r + k / 2, w };
    });
  };
  const fqQuad = (s, b) => {
    const dx = s.x1 - s.x0, dy = s.y1 - s.y0, len = Math.hypot(dx, dy) || 1, nx = (-dy / len) * s.w / 2, ny = (dx / len) * s.w / 2;
    const P = (t, e) => `${(s.x0 + dx * t + nx * e).toFixed(1)} ${(s.y0 + dy * t + ny * e).toFixed(1)}`;
    return `M${P(0, 1)}L${P(b, 1)}L${P(b, -1)}L${P(0, -1)}Z`;
  };
  document.querySelectorAll("[data-fq-item]").forEach((item) => {
    const group = item.closest("[data-fq]") || document, sum = item.querySelector("summary"), panel = item.querySelector("[data-fq-panel]"), ans = item.querySelector("[data-fq-answer]"), plus = item.querySelector(".fq__plus");
    if (!sum || !panel || !ans) return;
    const st = FQ_ENDS.map(() => ({ e: 0, le: 0 }));
    let geo = [];
    const paint = () => {
      const d = st.map((k, i) => { const u = k.le > 0.9 * k.e && k.le > 0 ? (0.9 * k.e) / k.le : 1, b = k.e - (k.le * u) / 2; return b > 5e-4 ? fqQuad(geo[i], b) : ""; }).join("");
      ans.style.clipPath = `path('${d || "M0 0Z"}')`;
    };
    const measure = () => { geo = fqGeo(ans.offsetWidth, ans.offsetHeight); paint(); };
    const tl = gsap.timeline({ paused: true }), ease = gsap.parseEase("power4.out"), E = (v) => ease(Math.min(1, Math.max(0, v))), c = 1 / 60 / 0.24;
    st.forEach((k, i) => {
      const p = { u: 0 };
      tl.to(p, { u: 1, duration: 0.24, ease: "none", onUpdate: () => { const r = E(p.u); k.e = r; k.le = p.u >= 1 ? 0 : Math.min(0.3, Math.abs(r - E(p.u - c)) * 2.2); if (geo.length) paint(); } }, i * FQ_LAG);
    });
    let busy = false, later = null;
    const close = () => {
      if (fqOpen.get(group) === close) fqOpen.delete(group);
      plus?.classList.remove("is-open");
      later?.kill(); later = null;
      gsap.killTweensOf(panel);
      if (reduce) { item.open = false; return; }
      busy = true;
      tl.timeScale(2).reverse();
      gsap.to(panel, { height: 0, duration: 0.45 * 0.8, delay: 0.1, ease: "power3.inOut", onComplete: () => { item.open = false; gsap.set(panel, { clearProps: "height" }); tl.timeScale(1); busy = false; } });
    };
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (busy) return;
      if (item.open) return close();
      fqOpen.get(group)?.();
      fqOpen.set(group, close);
      item.open = true;
      plus?.classList.add("is-open");
      if (reduce) return;
      busy = true;
      st.forEach((k) => { k.e = 0; k.le = 0; });
      tl.pause(0);
      measure();
      gsap.fromTo(panel, { height: 0 }, { height: panel.scrollHeight, duration: 0.45, ease: "power3.inOut", onComplete: () => { gsap.set(panel, { height: "auto" }); busy = false; } });
      later = gsap.delayedCall(0.12, () => tl.play());
    });
    new ResizeObserver(() => { if (item.open && geo.length) measure(); }).observe(ans);
  });

  /* Free check box — on entering the screen, a search result demo: the my-site row slides in from 18px left (.3s), the ranking table turns green (.5s), 
     The AI answer panel stands up (.35s), the four lines inside fill from the left (.3s, .17 apart), then the sparkle turns 50° (.8s) */
  const serp = document.querySelector("[data-serp]");
  if (serp && !reduce) {
    const you = serp.querySelector(".serp__row.is-you"), rank = serp.querySelector(".serp__rank"), ai = serp.querySelector(".serp__ai");
    // Like the original, repeats while on screen (rests 1.5s after finishing)
    const demo = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.5 });
    ScrollTrigger.create({ trigger: serp, start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? demo.play() : demo.pause()) });
    demo
      .fromTo(you, { x: -18, opacity: 0.08 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, 0)
      .fromTo(rank, { backgroundColor: getComputedStyle(rank).backgroundColor }, { backgroundColor: getComputedStyle(serp).getPropertyValue("--serp-on").trim() || undefined, duration: 0.5, ease: "power1.out" }, 0.56)
      .fromTo(ai, { opacity: 0.14 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0.96)
      .fromTo(ai.querySelectorAll(".serp__line"), { scaleX: 0.14 }, { scaleX: 1, duration: 0.3, ease: "power2.out", stagger: 0.17, transformOrigin: "0% 50%" }, 1.26)
      .fromTo(ai.querySelector(".serp__spark"), { rotate: 1 }, { rotate: 50, duration: 0.8, ease: "power2.out" }, 2.5);
  }

  /* Work cloud — the photo board tilts back with scroll and leans slightly toward the mouse */
  const plane = document.querySelector("[data-cloud-plane]");
  if (plane && !reduce) {
    gsap.fromTo(plane, { rotateX: 28, rotateZ: -10, yPercent: 0 }, { rotateX: 44, rotateZ: -14, yPercent: -12, ease: "none", scrollTrigger: { trigger: plane.parentElement, start: "top top", end: "bottom top", scrub: 0.6 } });
    gsap.from(plane.children, { opacity: 0, z: -400, duration: 0.9, ease: "expo.out", stagger: { each: 0.01, from: "random" } });
    if (fine) {
      const rx = gsap.quickTo(plane, "x", { duration: 1, ease: "power3.out" }), ry = gsap.quickTo(plane, "y", { duration: 1, ease: "power3.out" });
      plane.parentElement.addEventListener("pointermove", (e) => { rx(-(e.clientX / innerWidth - 0.5) * 60); ry(-(e.clientY / innerHeight - 0.5) * 40); });
    }
  }

  /* Unfolded layers (original layers, 992 and up) — attach 48×(3.3+1.2×(layer−1))%, scrub .6, power2.inOut. The layer group lies down at X 52°·Z −14°·.86, and each layer moves back (−150z) · up (−46) · sideways (18),
     After spreading (1), the stack lifts at 24°·−7°·.9 and the first layer comes forward (z 70·y −24·x −10) while the rest recede, darkened (.38·blur 1.2+.5i) (.6). Then each layer swaps front and back (.7) and the text goes .28↔1
     Rests .5 after switching. At the end it overlaps again (.9). The scene tilts toward the hand by X ±5° and Y ±7° (.9s power3.out) */
  const ex = document.querySelector("[data-explode]");
  if (ex && !reduce) gsap.matchMedia().add("(min-width: 992px)", () => {
    const stack = ex.querySelector(".explode__stack"), scene = ex.querySelector(".explode__stage"), layers = [...ex.querySelectorAll(".explode__layer")], notes = [...ex.querySelectorAll(".explode__step")], n = layers.length;
    gsap.set(scene, { perspective: 1800 });
    gsap.set(stack, { transformStyle: "preserve-3d" });
    gsap.set(layers, { z: (i) => -i, filter: "blur(0px) brightness(1)" });
    gsap.set(notes, { opacity: 0.28 });
    const back = (t) => ({ z: -150 * t, y: -46 * t, x: 18 * t, filter: `blur(${1.2 + 0.5 * t}px) brightness(0.38)` });
    const front = { z: 70, y: -24, x: -10, filter: "blur(0px) brightness(1)" };
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: ex.querySelector(".explode__pin"), pin: true, start: "top top", end: `+=${Math.round(48 * (3.3 + 1.2 * (n - 1)))}%`, scrub: 0.6 } });
    tl.to(stack, { rotationX: 52, rotationZ: -14, scale: 0.86, duration: 1 }, 0);
    layers.forEach((l, i) => tl.to(l, { z: -150 * i, y: -46 * i, x: 18 * i, filter: `blur(${0.9 * i}px) brightness(${1 - 0.13 * i})`, duration: 1 }, 0));
    tl.to(stack, { rotationX: 24, rotationZ: -7, scale: 0.9, duration: 0.6 }, ">");
    tl.to(layers[0], { ...front, duration: 0.6 }, "<");
    layers.slice(1).forEach((l, i) => tl.to(l, { ...back(i + 1), duration: 0.6 }, "<"));
    tl.to(notes[0], { opacity: 1, duration: 0.4, ease: "none" }, "<");
    tl.to({}, { duration: 0.5 });
    for (let v = 1; v < n; v++) {
      tl.to(layers[v - 1], { ...back(v - 1), duration: 0.7 }, ">");
      tl.to(layers[v], { ...front, duration: 0.7 }, "<");
      tl.to(notes[v - 1], { opacity: 0.28, duration: 0.35, ease: "none" }, "<");
      tl.to(notes[v], { opacity: 1, duration: 0.35, ease: "none" }, "<0.25");
      tl.to({}, { duration: 0.5 });
    }
    tl.to(stack, { rotationX: 0, rotationZ: 0, scale: 1, duration: 0.9 }, ">");
    tl.to(layers, { z: (i) => (i === n - 1 ? 2 : -i), y: 0, x: 0, filter: "blur(0px) brightness(1)", duration: 0.9 }, "<");
    tl.to({}, { duration: 0.3 });
    let move = null;
    if (fine) {
      const rx = gsap.quickTo(scene, "rotationX", { duration: 0.9, ease: "power3.out" }), ry = gsap.quickTo(scene, "rotationY", { duration: 0.9, ease: "power3.out" });
      move = (e) => { rx(-5 * (e.clientY / innerHeight * 2 - 1)); ry(7 * (e.clientX / innerWidth * 2 - 1)); };
      ex.addEventListener("pointermove", move);
    }
    return () => { if (move) ex.removeEventListener("pointermove", move); gsap.set(notes, { clearProps: "opacity" }); };
  });

  /* Article TOC — the line fills as the body is read, and the current section’s link brightens */
  const toc = document.querySelector("[data-toc]");
  if (toc) {
    const bar = toc.querySelector(".toc__bar i"), links = [...toc.querySelectorAll("a")], heads = links.map((a) => document.querySelector(a.getAttribute("href")));
    const body = document.querySelector(".post__body");
    ScrollTrigger.create({ trigger: body, start: "top 30%", end: "bottom bottom", onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }) });
    const mark = () => { let on = -1; heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top < innerHeight * 0.35) on = i; }); links.forEach((a, i) => a.classList.toggle("is-on", i === on)); };
    ScrollTrigger.create({ trigger: body, start: "top bottom", end: "bottom top", onUpdate: mark, onRefresh: mark });
    links.forEach((a) => a.addEventListener("click", (e) => { const h = document.querySelector(a.getAttribute("href")); if (!h) return; e.preventDefault(); if (window.lenis) window.lenis.scrollTo(h, { offset: -100 }); else h.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }));
  }
})();
