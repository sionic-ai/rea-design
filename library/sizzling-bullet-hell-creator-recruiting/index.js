// Home page motion. Scroll ranges, travel distances and easings are values measured by _study/brand-clone while running the original. Shared tools are ZK in shared.js.
(function () {
  const { $, $$, isSP, px, vw, r, lenis, attachScribble, gradFor, roughLine } = ZK;
  // In the original the bundle runs after the loader is drawn and counts a minimum of 2s from then — here counting starts from the frame after the first paint
  let T0 = performance.now();
  requestAnimationFrame(() => requestAnimationFrame(() => (T0 = performance.now())));
  lenis.stop();

  /* ---------- JOIN US marquee: solid text and outlined text flow alternately ---------- */
  function buildJoin() {
    const join = $(".z-join__marquee");
    const bolt = '<svg viewBox="0 0 45 61"><path d="M27 1 L4 34 L20 34 L13 60 L41 22 L24 22 L33 1 Z" fill="var(--site-yellow)" stroke="var(--kf-ink)" stroke-width="3" stroke-linejoin="round"/></svg>';
    const one = (outline) => `<div class="z-join__one${outline ? " is-outline" : ""}"><p>JOIN US.</p>${bolt}</div>`;
    join.innerHTML = `<div class="z-join__set">${one(false)}${one(true)}</div>`.repeat(3);
    new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-inview", e.isIntersecting))).observe($(".z-join"));
  }

  // During the frenzy, the pen border on each sentence box jitters at 30fps (only while visible).
  function statementOutlines() {
    const wrap = $(".z-statement");
    const spans = $$(".z-statement__lines span");
    spans.forEach((s) => { const c = document.createElement("canvas"); s.appendChild(c); s._cv = c; });
    let inview = false, on = false, last = 0;
    new IntersectionObserver((es) => es.forEach((e) => (inview = e.isIntersecting))).observe(wrap);
    const render = () => {
      const now = performance.now();
      if (!on || !inview || now - last < 1000 / 30) return;
      last = now;
      const k = Math.max(1, innerWidth / 1440);
      spans.forEach((s) => {
        const cv = s._cv, W = s.offsetWidth, H = s.offsetHeight;
        if (cv.width !== W + 20) { cv.width = W + 20; cv.height = H + 20; }
        const g = cv.getContext("2d");
        g.clearRect(0, 0, cv.width, cv.height);
        g.strokeStyle = gradFor(g, W + 20);
        const x0 = 10 + r(-1, 1) * 2, y0 = 10 + r(-1, 1) * 2, x1 = x0 + W + r(-1, 1) * 2, y1 = y0 + H + r(-1, 1) * 2;
        const u = (x1 - x0) / 6, v = (y1 - y0) / 3, j = () => r(-1, 1);
        const pts = [[x0, y0]];
        for (let i = 1; i <= 5; i++) pts.push([x0 + u * i, y0 + j()]);
        pts.push([x1, y0], [x1 + j(), y0 + v], [x1 + j(), y0 + v * 2], [x1, y1]);
        for (let i = 5; i >= 1; i--) pts.push([x0 + u * i, y1 + j()]);
        pts.push([x0, y1], [x0 + j(), y0 + v * 2], [x0 + j(), y0 + v], [x0, y0]);
        roughLine(g, pts, (isSP() ? r(0.5, 1) : r(1, 1.5)) * k, r(3, 7));
      });
    };
    gsap.ticker.add(render);
    const set = (v) => {
      on = v;
      wrap.classList.toggle("is-active", v);
      if (!v) spans.forEach((s) => s._cv.getContext("2d").clearRect(0, 0, s._cv.width, s._cv.height));
    };
    ZBack.on("start", () => set(true));
    ZBack.on("stop", () => set(false));
    if (ZBack.active) set(true);
  }

  /* ---------- JOIN US: while visible, a pen underline lands on one item at 1–2s intervals ---------- */
  function joinScribble() {
    const ones = $$(".z-join__one");
    ones.forEach((o) => attachScribble($("p", o)));
    const seen = new Set();
    const io1 = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target))));
    ones.forEach((o) => io1.observe(o));
    let c1, c2;
    const stop = () => { c1 && c1.kill(); c2 && c2.kill(); ones.forEach((o) => $("p", o)._stop()); };
    const run = () => {
      stop();
      let t = r(1, 2);
      c1 = gsap.delayedCall(t, () => { const list = [...seen]; const o = list[Math.floor(r(0, list.length))]; o && $("p", o)._start(); });
      t += r(2, 3);
      c2 = gsap.delayedCall(t, run);
    };
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? run() : stop()))).observe($(".z-join"));
  }

  /* ---------- Mint bar dripping below JOIN: shrinks as the bottom section rises (estimated) ---------- */
  function joinDrip() {
    const svg = $(".z-join__drip");
    const n = 36;
    svg.setAttribute("viewBox", `0 0 ${n} 100`);
    const hs = Array.from({ length: n }, () => r(4, 34));
    svg.innerHTML = hs.map((h, i) => `<rect x="${i}" y="0" width="1.02" height="${h}"/>`).join("");
    const rects = $$("rect", svg);
    ScrollTrigger.create({
      trigger: ".z-bottom", start: "top bottom", end: "top 30%", scrub: true,
      onUpdate: (st) => rects.forEach((rc, i) => rc.setAttribute("height", hs[i] * (1 - st.progress))),
    });
  }

  /* ---------- Scroll-linked ---------- */
  function scrollMotion() {
    const mm = gsap.matchMedia();
    mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { pc, reduce } = ctx.conditions;
      if (reduce) return;

      // 01: for the first 2546px, title and hero descend 1100px (linear) and 1320px (sine.out) respectively. Corner letters 1250px (sine.in).
      if (pc) {
        const head = { start: 0, end: () => px(2546), scrub: true, invalidateOnRefresh: true };
        gsap.fromTo(".z-identity__title", { y: 0 }, { y: () => px(1100), ease: "linear", scrollTrigger: { ...head } });
        gsap.fromTo(".z-identity__hero", { y: 0 }, { y: () => px(1320), ease: "sine.out", scrollTrigger: { ...head } });
        gsap.fromTo(".z-statement__corner", { y: 0 }, { y: () => px(1250), ease: "sine.in", scrollTrigger: { trigger: ".z-statement", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      }

      const imgs = [".z-msg__img--1", ".z-msg__img--2", ".z-msg__img--3", ".z-msg__movie"];
      const tlImg = gsap.timeline({ paused: true }).set(imgs, { autoAlpha: 0 });
      imgs.forEach((s) => tlImg.to(s, { duration: 1, ease: "power3.out", autoAlpha: 1 }));
      ScrollTrigger.create({ trigger: ".z-msg", start: "top bottom-=10%", end: () => (pc ? `top+=${px(1008)} bottom` : `top+=${px(464)} bottom-=20%`), invalidateOnRefresh: true, onUpdate: (st) => tlImg.progress(st.progress) });

      const lines = $$(".z-msg__txt p");
      const d = pc ? 50 : 0, ez = pc ? "power1.out" : "none", ov = pc ? 0.5 : 0.75;
      const tlTxt = gsap.timeline({ paused: true });
      lines.forEach((p, i) => tlTxt.fromTo(p, { x: p.classList.contains("l") ? -px(d) : px(d), autoAlpha: 0 }, { duration: 1, ease: ez, x: 0, autoAlpha: 1 }, i ? `-=${ov}` : 0));
      ScrollTrigger.create({
        trigger: ".z-msg", invalidateOnRefresh: true,
        start: () => (pc ? `top+=${px(716)} bottom-=20%` : `top+=${px(526)} bottom-=10%`),
        end: () => (pc ? `top+=${px(1323)} bottom-=30%` : `top+=${px(639)} bottom-=20%`),
        onUpdate: (st) => tlTxt.progress(st.progress),
      });

      // 02·05: vertical title -160px, character -80→160px (rear ones 0.8x). Mobile uses vw units.
      const chapter = (root, cfg) => {
        const body = $(".z-chapter__body", root);
        const st = { trigger: body, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true };
        gsap.fromTo($(".z-chapter__title", root), { y: () => (pc ? 0 : vw(4)) }, { y: () => (pc ? px(-160) : 0), ease: "none", scrollTrigger: { ...st } });
        gsap.fromTo($(".z-chapter__chara1", root), { y: () => (pc ? px(-80) : vw(cfg.c1sp[0])) }, { y: () => (pc ? px(160) : vw(cfg.c1sp[1])), ease: "none", scrollTrigger: { ...st } });
        gsap.fromTo([$(".z-chapter__chara2", root), $(".z-chapter__shadow", root)], { y: () => (pc ? px(-80 * cfg.k) : vw(-10)) }, { y: () => (pc ? px(160 * cfg.k) : vw(10)), ease: "none", scrollTrigger: { ...st } });
        const a = $$(".z-chapter__txt--a span", root), b = $$(".z-chapter__txt--b span", root);
        if (pc) {
          [[a, cfg.ax, ".z-chapter__txt--a"], [b, -cfg.ax, ".z-chapter__txt--b"]].forEach(([spans, x, sel]) => {
            const tl = gsap.timeline({ paused: true });
            spans.forEach((s, i) => tl.fromTo(s, { x: px(x), autoAlpha: 0 }, { duration: 1, ease: "sine.out", x: 0, autoAlpha: 1 }, i ? "-=0.45" : 0));
            ScrollTrigger.create({ trigger: $(sel, root), start: "top bottom-=20%", end: "top bottom-=45%", invalidateOnRefresh: true, onUpdate: (s) => tl.progress(s.progress) });
          });
        } else {
          const tl = gsap.timeline({ paused: true });
          [...a, ...b].forEach((s, i) => tl.fromTo(s, { autoAlpha: 0 }, { duration: 1, ease: "none", autoAlpha: 1 }, i ? "-=0.75" : 0));
          ScrollTrigger.create({ trigger: $(".z-chapter__txt--a", root), start: "top bottom-=10%", end: "bottom bottom-=25%", onUpdate: (s) => tl.progress(s.progress) });
        }
      };
      chapter($(".z-chapter--creators"), { k: 1, ax: -100, c1sp: [-14, 14] });
      chapter($(".z-chapter--cultures"), { k: 0.8, ax: 100, c1sp: [-5, 14] });

      // 03·04: description · title · profile rows slide in from ±50px.
      $$(".z-journey").forEach((j) => {
        const isA = j.classList.contains("z-journey--a");
        const group = (spans, xs, trig, start, end) => {
          const tl = gsap.timeline({ paused: true });
          spans.forEach((s, i) => tl.fromTo(s, { x: px(pc ? xs(i) : 0), autoAlpha: 0 }, { duration: 1, ease: pc ? "power1.out" : "none", x: 0, autoAlpha: 1 }, i ? `-=${pc ? 0.5 : 0.75}` : 0));
          ScrollTrigger.create({ trigger: trig, start, end, invalidateOnRefresh: true, onUpdate: (s) => tl.progress(s.progress) });
        };
        const desc = $$(".z-journey__desc span", j);
        group(desc, (i) => (isA && i >= 8 ? -50 : 50), $(".d1", j), pc ? "top bottom-=30%" : "top bottom-=10%", pc ? "top bottom-=50%" : "bottom bottom-=20%");
        const head = $$(".z-journey__head > span", j);
        group(head, (i) => (!isA && i > 0 ? -50 : 50), head[0], pc ? "top bottom-=20%" : "top bottom-=10%", pc ? "top bottom-=45%" : "bottom bottom-=20%");
        const prof = $$(".z-journey__profile span", j);
        group(prof, () => -50, $(".z-journey__profile", j), "top bottom-=10%", "top bottom-=35%");
      });

      // 06: six cards pass from lower right → center → upper left (4 segments per card, 1 second apart). The title and card board are fixed.
      const cards = $$(".z-card");
      const tl = gsap.timeline({ paused: true });
      const em = (v) => px(v * 16);
      if (pc) {
        cards.forEach((c, i) => tl.add(`c${i}`, i));
        cards.forEach((c, i) => {
          tl.fromTo(c, { x: () => em(60), y: () => em(30), scale: 0.6, rotate: -27 }, { duration: 1, ease: "none", x: () => em(25), y: () => em(12), scale: 0.75, rotate: -13 }, `c${i}`);
          tl.to(c, { duration: 1, ease: "none", x: 0, y: 0, scale: 1, rotate: -3 }, `c${i}+=1`);
          tl.to(c, { duration: 1, ease: "none", x: () => em(-25), y: () => em(-12), scale: 0.75, rotate: 13 }, `c${i}+=2`);
          tl.to(c, { duration: 1, ease: "none", x: () => em(-60), y: () => em(-30), scale: 0.6, rotate: 27 }, `c${i}+=3`);
        });
        ScrollTrigger.create({ trigger: ".z-originals", start: "top center+=20%", end: "bottom center-=15%", invalidateOnRefresh: true, onUpdate: (s) => tl.progress(s.progress) });
        ScrollTrigger.create({ trigger: ".z-originals__slide", endTrigger: ".z-originals", start: "center center", end: "bottom bottom-=20%", pin: true, pinSpacing: false, invalidateOnRefresh: true });
        ScrollTrigger.create({ trigger: ".z-originals__title", endTrigger: ".z-originals", start: "center center-=20%", end: "bottom bottom-=20%", pin: true, pinSpacing: false, invalidateOnRefresh: true });
      } else {
        cards.forEach((c, i) => tl.add(`c${i}`, i * 0.85));
        cards.forEach((c, i) => {
          tl.fromTo(c, { x: () => vw(35), y: () => vw(150), scale: 0.6, rotate: -27 }, { duration: 1, ease: "none", x: () => vw(10), y: () => vw(75), scale: 0.75, rotate: -14 }, `c${i}`);
          tl.to(c, { duration: 1, ease: "none", x: 0, y: 0, scale: 1, rotate: -3 }, `c${i}+=1`);
          tl.to(c, { duration: 1, ease: "none", x: () => vw(-5), y: () => vw(-75), scale: 0.75, rotate: 10 }, `c${i}+=2`);
          tl.to(c, { duration: 1, ease: "none", x: () => vw(-10), y: () => vw(-150), scale: 0.6, rotate: 20 }, `c${i}+=3`);
          tl.set(c, { autoAlpha: 0 });
        });
        ScrollTrigger.create({ trigger: ".z-originals", start: "top-=15% center+=1%", end: "bottom center-=30%", onUpdate: (s) => tl.progress(s.progress) });
        ScrollTrigger.create({ trigger: ".z-originals__slide", endTrigger: ".z-originals", start: "center center", end: "bottom bottom-=70%", pin: true, pinSpacing: false });
        ScrollTrigger.create({ trigger: ".z-originals__title", endTrigger: ".z-originals", start: "bottom center-=20%", end: "bottom bottom-=20%", pin: true, pinSpacing: false });
      }

      // 09: text -700→50px, character group -600→0px. Linear across the whole bottom section range.
      const bt = { trigger: ".z-bottom", start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true };
      const slogan = $(".z-bottom__slogan"), chara = $(".z-bottom__chara");
      gsap.fromTo(slogan, { y: () => (pc ? px(-700) : vw(-110)) }, { y: () => (pc ? px(50) : 0), ease: "none", onStart: () => (slogan.style.visibility = chara.style.visibility = "visible"), scrollTrigger: { ...bt } });
      gsap.fromTo(chara, { y: () => (pc ? px(-600) : vw(-100)) }, { y: 0, ease: "none", scrollTrigger: { ...bt } });
    });

    // When it enters the middle of the bottom section, hides the front text strip and flash.
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && e.boundingClientRect.top > 0) document.body.classList.add("is-bottom");
      else if (!e.isIntersecting && e.boundingClientRect.top > 0) document.body.classList.remove("is-bottom");
      $(".z-front").classList.toggle("is-hide", document.body.classList.contains("is-bottom"));
    }), { rootMargin: "-50% 0%" }).observe($(".z-bottom"));
  }

  /* ---------- Loading: after showing for at least 2 seconds, wipes from bottom to top and raises the title into place ---------- */
  function endLoading() {
    const wait = Math.max(0, 2000 - (performance.now() - T0)) / 1000;
    gsap.delayedCall(wait, () => {
      $(".z-loader").classList.add("is-end");
      document.body.classList.add("is-ready");
      ZBack.burstFromLoading();
      gsap.delayedCall(1, () => { document.body.classList.remove("is-loading"); document.body.classList.add("is-head"); lenis.start(); });
      gsap.delayedCall(1.6, ZK.showEntry);
      gsap.delayedCall(1.7, () => { $(".z-loader").classList.add("is-gone"); ScrollTrigger.refresh(); });
    });
  }

  ZK.ready(async () => {
    $$(".z-glitch").forEach((el) => (el.dataset.text = el.textContent));
    buildJoin();
    joinScribble();
    joinDrip();
    statementOutlines();
    scrollMotion();
    endLoading();
  });
})();
