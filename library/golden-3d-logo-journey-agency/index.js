// Home page motion. The 3D logo interpolates by scroll position between poses (anchor) set per scene, and logo3d follows that target with a 0.1 lerp.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const expo = "cubic-bezier(0.16,1,0.3,1)";
  const EXPO = "expo.out";

  const logo = DK.logo3d($(".hx-logo"), { drag: true, size: 1 });

  // ── Placeholder video: stands in for the original reed video (1600×894 · 7.04s loop). A diagonal light band drifts like wind over the panel color and the bar below counts one loop.
  //    The ripple part (brush-ripple-hover, live) reads this panel every frame and warps it along the mouse. On file:// the video can’t be uploaded to WebGL (cross-origin), so it is drawn on a canvas —
  //    When swapping in real video, put it in this canvas’s place over http <video data-fx-part="image" autoplay muted loop playsinline>.
  (() => {
    const cv = $(".hx-hero__media");
    if (!cv) return;
    const g = cv.getContext("2d"), W = cv.width, H = cv.height, LOOP = 7.041667;
    const paint = (expr) => { const p = document.createElement("i"); p.style.cssText = `display:none;color:${expr}`; cv.parentElement.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
    const sky = getComputedStyle(cv.parentElement).backgroundColor, light = paint("var(--site-light)"), reed = paint("var(--site-gold-1)");
    const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono").trim();
    const label = cv.parentElement.dataset.label.split(" · ").slice(0, 2).join(" · ");
    const draw = (t) => {
      const ph = (t % LOOP) / LOOP, sway = Math.sin(ph * Math.PI * 2) * 24;
      g.fillStyle = sky;
      g.fillRect(0, 0, W, H);
      g.save();
      g.fillStyle = light;
      for (let i = -3; i < 14; i++) {
        const x = (i + ph) * 90;
        g.globalAlpha = 0.08 + 0.06 * Math.sin(i * 1.7);
        g.beginPath(); g.moveTo(x, H); g.lineTo(x + 36, H); g.lineTo(x + 36 + 160 + sway, 0); g.lineTo(x + 160 + sway, 0); g.fill();
      }
      // Thin reed stems — the original video has fine texture all over the screen so the cursor ripple is visible everywhere. On a pushed board the picture doesn’t change when the ripple passes
      g.strokeStyle = reed;
      g.lineCap = "round";
      for (let i = 0; i < 46; i++) {
        const x0 = ((i * 211) % 1100) - 120, lean = 120 + ((i * 53) % 140), bend = sway * (0.6 + ((i * 7) % 5) * 0.2);
        g.globalAlpha = 0.22 + ((i * 37) % 10) * 0.03;
        g.lineWidth = 2 + ((i * 13) % 4);
        g.beginPath(); g.moveTo(x0, H + 10); g.quadraticCurveTo(x0 + lean * 0.4, H * 0.5, x0 + lean + bend, H * (((i * 29) % 7) * 0.06)); g.stroke();
      }
      g.restore();
      g.fillStyle = light;
      g.font = `500 22px ${font}`;
      g.textAlign = "center";
      g.fillText(label, W / 2, H * 0.3);
      g.fillText(`${(t % LOOP).toFixed(2)} / ${LOOP.toFixed(2)}s`, W / 2, H * 0.3 + 32);
      g.fillRect(0, H - 4, W * ph, 4);
    };
    draw(0);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.ticker.add((time) => draw(time));
  })();
  DK.night($(".hx-services__sky"), { aurora: true });

  // ── Award strip data: 10 works, photos in pairs ──
  const AWARDS = Array.from({ length: 10 }, (_, i) => ({
    name: `Project Name ${String(i + 1).padStart(2, "0")}`,
    list: [["0000-00-00", "Award name - Organizer here"], ["0000-00-00", "Your other award - organizer here"], ...(i % 3 === 0 ? [["0000-00-00", "Your third award here"]] : [])],
  }));
  const SHOTS = ["Tablet mockup · on gray stone · front view", "Laptop screen · purple lighting · angled", "Architecture site capture · white background", "Black tablet · Dark stone floor · From above", "New photo site · gray sky · landscape", "Earth curve view · black space · landscape", "Indoor photo site · pink wall", "Sand texture screen · beige · landscape"];
  const stream = $(".hx-awards__stream");
  const cards = Array.from({ length: 20 }, (_, i) => {
    const el = document.createElement("div");
    el.className = "hx-aw-card wf-img";
    el.dataset.label = SHOTS[i % SHOTS.length];
    el.style.aspectRatio = ["4/3", "16/10", "3/2", "4/3", "16/9"][i % 5];
    stream.append(el);
    return el;
  });
  const names = $(".hx-awards__names");
  AWARDS.forEach((a) => { const s = document.createElement("span"); s.textContent = a.name; names.append(s); });
  const nameEls = $$("span", names);
  const list = $(".hx-awards__list");
  const counter = $(".hx-awards__nav span");
  const ARROW = '<svg viewBox="0 0 27 27"><path d="M8 19 19 8M10 8h9v9"/></svg>';
  let shown = -1;
  const showAward = (i) => {
    if (i === shown) return;
    const dir = i > shown ? 1 : -1;
    nameEls.forEach((el, k) => gsap.to(el, { opacity: k === i ? 1 : 0, y: k === i ? 0 : (k < i ? -12 : 12) * dir, duration: 0.45, ease: EXPO, overwrite: true }));
    list.innerHTML = AWARDS[i].list.map(([d, t]) => `<li><time>${d}</time><a href="#">${t}${ARROW}</a></li>`).join("");
    gsap.from(list.children, { opacity: 0, y: 10, duration: 0.5, stagger: 0.06, ease: EXPO });
    counter.textContent = `${String(i + 1).padStart(2, "0")} / 10`;
    shown = i;
  };

  // Diagonal band: the center one grows to 322px, and the sides line up diagonally at 139px intervals with ±450px gaps
  const placeCards = (pos) => {
    const vw = innerWidth, vh = innerHeight, narrow = vw < 768;
    const cx = narrow ? vw * 0.5 - 120 : vw * 0.376, cy = narrow ? vh * 0.3 : vh * 0.356;
    cards.forEach((el, i) => {
      const k = i / 2 - pos;
      const ak = Math.abs(k);
      const near = Math.max(0, 1 - ak * 2);
      const gap = (narrow ? 260 : 450) * Math.min(1, ak * 2) * Math.sign(k);
      const x = cx + gap + (k - Math.sign(k) * Math.min(ak, 0.5)) * (narrow ? 90 : 139);
      const y = cy - gap * 0.39 - (k - Math.sign(k) * Math.min(ak, 0.5)) * 34 + Math.sin(i * 1.7) * 14;
      el.style.transform = `translate(${x}px, ${y}px) scale(${(narrow ? 0.8 : 1) * (1 + near * 0.14)})`;
      el.style.zIndex = Math.round(100 - ak * 4);
      el.classList.toggle("is-active", ak < 0.5);
    });
  };

  // ── Logo pose table ──
  const POSE = (o) => ({ x: 0, y: 0, s: 0.8, rx: 0, ry: 0, rz: 0, split: 0, o: 1, ...o });
  let anchors = [];
  const buildAnchors = () => {
    const vh = innerHeight, narrow = innerWidth < 768;
    const top = (s) => $(s).getBoundingClientRect().top + scrollY;
    const ceo = top(".hx-ceo"), why = top(".hx-why"), whyLen = $(".hx-why").offsetHeight - vh;
    const slot = $("[data-logo-slot]").getBoundingClientRect();
    const slotDocY = slot.top + scrollY + slot.height / 2;
    const at = (scroll, docX, docY) => ({ x: (docX / innerWidth) * 2 - 1, y: ((docY - scroll) / vh) * 2 - 1 });
    const ceoAt = Math.max(0, ceo - vh * 0.1);
    const aw = top(".hx-awards"), awLen = $(".hx-awards").offsetHeight - vh;
    const sv = top(".hx-services"), svLen = $(".hx-services").offsetHeight - vh;
    anchors = [
      [0, POSE(narrow ? { y: -0.3, s: 1.1 } : { s: 0.6 })],
      [ceoAt, POSE({ ...at(ceoAt, slot.left + slot.width / 2, slotDocY), s: 0.42, rx: 1.1, ry: 0.3, rz: -0.25, split: 0.55 })],
      [why - vh * 0.15, POSE({ y: 0.25, s: 0.7, rx: 0.6, ry: 1.0, rz: 0.4, split: 0.4 })],
      [why, POSE({ y: 0.0, s: 0.95, ry: 1.52, rz: 0, split: 0 })],
      [why + whyLen * 0.25, POSE({ x: narrow ? 0 : 0.05, y: -0.1, s: 1.0, ry: 0.45, rz: 0.18 })],
      [why + whyLen * 0.5, POSE({ x: 0, y: -0.12, s: 1.12, ry: -0.35, rz: -0.28 })],
      [why + whyLen * 0.75, POSE({ x: narrow ? 0.1 : 0.12, y: -0.16, s: 1.2, ry: 0.4, rz: 0.08 })],
      [why + whyLen, POSE({ x: narrow ? 0.1 : 0.12, y: -0.16, s: 1.2, ry: 0.4, rz: 0.08 })],
      [top(".hx-clients") + vh * 0.1, POSE({ x: 0.02, y: 0.05, s: 0.42, rx: 0.5, ry: 0.7, rz: 0.8, split: 0.3 })],
      [top(".hx-work"), POSE({ x: 0.12, y: 0.02, s: 0.4, rx: 0.3, ry: -0.5, rz: -0.4, split: 0.38 })],
      [top(".hx-cases") + vh * 0.6, POSE({ x: 0.04, y: 0.12, s: 0.34, rx: 0.4, rz: 0.9, split: 0.2 })],
      [aw - vh * 0.3, POSE({ x: narrow ? -0.4 : -0.6, y: -0.4, s: 0.24, ry: 0.3 })],
      [aw, POSE({ x: narrow ? 0.55 : -0.66, y: narrow ? -0.72 : -0.36, s: narrow ? 0.18 : 0.24, ry: 0.3 })],
      [aw + awLen, POSE({ x: narrow ? 0.55 : -0.66, y: narrow ? -0.72 : -0.36, s: narrow ? 0.18 : 0.24, ry: 0.3 })],
      [aw + awLen + vh * 0.5, POSE({ x: -0.66, y: -0.36, s: 0.2, o: 0 })],
      [sv - vh * 0.2, POSE({ x: 0.02, y: 0.36, s: 0.5, rx: 1.15, rz: 0.65, o: 0 })],
      [sv, POSE({ x: 0.02, y: narrow ? 0.3 : 0.36, s: 0.5, rx: 1.15, rz: 0.65 })],
      [sv + svLen, POSE({ x: 0.02, y: narrow ? 0.3 : 0.36, s: 0.5, rx: 1.15, ry: 0.4, rz: 0.65 })],
      [sv + svLen + vh * 0.5, POSE({ x: 0.02, y: 0.36, s: 0.5, rx: 1.15, rz: 0.65, o: 0 })],
    ].sort((a, b) => a[0] - b[0]);
  };
  const ease = (t) => t * t * (3 - 2 * t);
  const poseAt = (y) => {
    if (y <= anchors[0][0]) return anchors[0][1];
    for (let i = 1; i < anchors.length; i++) {
      const [y1, p1] = anchors[i];
      if (y <= y1) {
        const [y0, p0] = anchors[i - 1];
        const t = ease((y - y0) / Math.max(1, y1 - y0));
        const p = {};
        for (const k in p1) p[k] = p0[k] + (p1[k] - p0[k]) * t;
        return p;
      }
    }
    return anchors[anchors.length - 1][1];
  };

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { motion } = ctx.conditions;

    // Hero title: each word rises from below (timed to the moment the curtain lifts)
    const hero = new SplitText(".hx-hero__title", { type: "words", wordsClass: "w" });
    if (motion) {
      gsap.set(hero.words, { yPercent: 60, opacity: 0 });
      document.addEventListener("dk:reveal", () => gsap.to(hero.words, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.035, ease: EXPO, delay: 0.35 }), { once: true });
    }

    // Lead text: on scroll the words fill from pale gray to dark ink
    const ceo = new SplitText(".hx-ceo__copy p", { type: "words", wordsClass: "w" });
    if (motion) gsap.fromTo(ceo.words, { opacity: 0.18 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".hx-ceo__copy", start: "top 85%", end: "bottom 45%", scrub: true } });

    DK.whySteps($(".hx-why"), motion);

    // Client title: letter by letter from below
    const cl = new SplitText(".hx-clients__title", { type: "chars", charsClass: "c" });
    if (motion) gsap.from(cl.chars, { yPercent: 100, opacity: 0, duration: 0.8, stagger: 0.025, ease: EXPO, scrollTrigger: { trigger: ".hx-clients", start: "top 70%" } });
    if (motion) gsap.from(".hx-clients__grid li", { opacity: 0, y: 30, duration: 0.8, stagger: 0.06, ease: EXPO, scrollTrigger: { trigger: ".hx-clients__grid", start: "top 85%" } });

    // Work heading: while pinned, letters lie at -30° from below (90%) and then stand up
    const wk = new SplitText(".hx-work__intro h2", { type: "chars", charsClass: "c" });
    if (motion) {
      gsap.timeline({ scrollTrigger: { trigger: ".hx-work", start: "top top", end: "+=100%", pin: true, scrub: true } })
        .from(wk.chars, { yPercent: 90, rotationX: -30, opacity: 0, stagger: 0.03, ease: "power3.out" })
        .from(".hx-work__intro p", { opacity: 0, y: 10 }, 0);
    }

    // Work card: enters rising 40px, and the photo inside has parallax
    $$(".hx-case").forEach((c) => {
      if (!motion) return;
      gsap.from(c, { y: 40, duration: 1, ease: EXPO, scrollTrigger: { trigger: c, start: "top 92%" } });
      gsap.fromTo($(".hx-case__img", c), { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Awards strip
    const awST = ScrollTrigger.create({
      trigger: ".hx-awards", start: "top top", end: "bottom bottom",
      onUpdate: (st) => { const pos = st.progress * 9.6; placeCards(pos); showAward(Math.min(9, Math.round(pos))); },
    });
    placeCards(0); showAward(0);
    $$(".hx-awards__nav button").forEach((b) => b.addEventListener("click", () => {
      const next = Math.max(0, Math.min(9, shown + Number(b.dataset.dir)));
      const y = awST.start + ((awST.end - awST.start) * next) / 9.6;
      DK.lenis ? DK.lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: motion ? "smooth" : "auto" });
    }));

    // Expanding video
    if (motion) gsap.fromTo(".hx-video__frame", { clipPath: innerWidth < 768 ? "inset(30% 8% round 16px)" : "inset(21% 29% round 24px)" }, { clipPath: "inset(0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".hx-video", start: "top top", end: "+=100%", scrub: true } });

    // Swap the service name
    const titles = $$(".hx-services__titles h2");
    const sdots = $(".hx-services__dots");
    sdots.innerHTML = titles.map((_, i) => `<button type="button" aria-label="Service ${i + 1}"><i></i></button>`).join("");
    const sbtn = $$("button", sdots);
    let si = 0;
    sbtn[0].classList.add("is-on");
    const swap = (i) => {
      if (i === si) return;
      const dir = i > si ? 1 : -1;
      gsap.to(titles[si], { autoAlpha: 0, yPercent: -40 * dir, duration: motion ? 0.6 : 0, ease: "power3.out", overwrite: true });
      gsap.fromTo(titles[i], { autoAlpha: 0, yPercent: 40 * dir }, { autoAlpha: 1, yPercent: 0, duration: motion ? 0.75 : 0, ease: EXPO, overwrite: true });
      sbtn.forEach((b, k) => b.classList.toggle("is-on", k === i));
      si = i;
    };
    const svST = ScrollTrigger.create({ trigger: ".hx-services", start: "top top", end: "bottom bottom", onUpdate: (st) => swap(Math.min(titles.length - 1, Math.floor(st.progress * titles.length))) });
    sbtn.forEach((b, i) => b.addEventListener("click", () => {
      const y = svST.start + ((svST.end - svST.start) * (i + 0.5)) / titles.length;
      DK.lenis ? DK.lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y });
    }));

    // Logo pose
    buildAnchors();
    ScrollTrigger.addEventListener("refresh", buildAnchors);
    const onScroll = () => logo.pose(poseAt(scrollY));
    logo.pose(poseAt(scrollY), true);
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: onScroll });
    onScroll();
  });

  // The play circle follows the mouse at 0.15, and pressing it opens the full video window
  const stage = $(".hx-video__stage"), cursor = $(".hx-video__cursor"), modal = $(".hx-modal");
  const cpos = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
  stage.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); cpos.tx = e.clientX - r.left; cpos.ty = e.clientY - r.top; });
  gsap.ticker.add(() => {
    cpos.x += (cpos.tx - cpos.x) * 0.15; cpos.y += (cpos.ty - cpos.y) * 0.15;
    cursor.style.transform = `translate(${cpos.x}px, ${cpos.y}px)`;
  });
  stage.addEventListener("click", () => { modal.hidden = false; DK.lenis && DK.lenis.stop(); });
  $(".hx-modal__close").addEventListener("click", () => { modal.hidden = true; DK.lenis && DK.lenis.start(); });
})();
