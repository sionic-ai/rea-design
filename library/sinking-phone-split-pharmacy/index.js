// Home page — blue loading curtain → mark · copy Lottie inside the phone → while the scroll is pinned the phone drops out and two cells split apart. Pressing a map pin shows a store card.
(() => {
  const { progress, reduce } = window.adSite;
  const body = document.body;
  const fv = document.querySelector(".ad-fv");
  const phone = fv.querySelector(".ad-fv__phone");
  const copyEl = document.getElementById("ad-copy");
  const markEl = document.getElementById("ad-mark");
  const PC = "(min-width: 960px) and (min-aspect-ratio: 5/4)";
  const isPC = () => matchMedia(PC).matches;
  body.classList.toggle("is-pc", isPC());

  // Turn a skin variable into a Lottie color ([r,g,b] 0~1) — values like oklch are also read by painting a dot on a canvas
  const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = v;
    cv.fillRect(0, 0, 1, 1);
    const [r, g, b] = cv.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };

  const st = (v) => ({ a: 0, k: v });
  const tr = () => ({ ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) });
  const path = (pts) => ({ ty: "sh", ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: true }) });
  const fill = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1 });
  const stroke = (c, w) => ({ ty: "st", c: st(c), o: st(100), w: st(w), lc: 2, lj: 2, ml: 4 });
  const group = (...it) => ({ ty: "gr", it: [...it, tr()] });
  // Curve between keys of the original Lottie (.167/.833) and key times and angles — the artwork is ours, only the motion values are carried over
  const rotKeys = (pairs) => ({
    a: 1,
    k: pairs.map(([t, s], i) => (i < pairs.length - 1 ? { t, s: [s], o: { x: [0.167], y: [0.167] }, i: { x: [0.833], y: [0.833] } } : { t, s: [s] })),
  });
  const shapeLayer = (ind, nm, anchor, keys, shapes) => ({
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op: 80, st: 0, bm: 0,
    ks: { o: st(100), r: rotKeys(keys), p: st([...anchor, 0]), a: st([...anchor, 0]), s: st([100, 100, 100]) },
    shapes,
  });

  // Mark — house-shaped body · center capsule · two feet over 80 frames (29.97fps, 2x speed = Hops every 1.33s)
  const markData = () => {
    const ink = rgb("--kf-ink"), acc = rgb("--kf-accent"), paper = rgb("--kf-surface");
    return {
      v: "5.7.5", fr: 29.97, ip: 0, op: 80, w: 1200, h: 1200, nm: "mark", ddd: 0, assets: [],
      layers: [
        shapeLayer(1, "leg-r", [642, 833], [[0, 0], [10, 41], [20, 30], [30, 48], [40, 56], [45, 80], [50, 104], [60, 104], [70, 82], [80, 0]],
          [group(path([[604, 830], [724, 838], [736, 960], [612, 958]]), stroke(ink, 30), fill(acc))]),
        shapeLayer(2, "leg-l", [377, 819], [[0, 0], [10, 51], [20, 65], [30, 27], [40, -55], [45, -35], [50, -15], [60, -25], [70, 2], [80, 0]],
          [group(path([[330, 846], [432, 806], [476, 912], [356, 966]]), stroke(ink, 30), fill(acc))]),
        shapeLayer(3, "pill", [538, 421], [[0, 0], [5, -4], [10, 5], [20, 5], [30, 2], [40, 0], [45, -7], [50, 5], [60, 6], [70, 2], [80, 0]],
          [
            group({ ty: "rc", d: 1, s: st([470, 220]), p: st([538, 421]), r: st(110) }, stroke(ink, 34)),
            group(path([[538, 311], [648, 311], [700, 340], [753, 421], [700, 502], [648, 531], [538, 531]]), fill(acc)),
            group({ ty: "rc", d: 1, s: st([470, 220]), p: st([538, 421]), r: st(110) }, fill(paper)),
          ]),
        shapeLayer(4, "body", [540, 738], [[0, 0], [5, -4], [10, 5], [20, 6], [30, 2], [40, 0], [45, -4], [50, 5], [60, 6], [70, 2], [80, 0]],
          [group(path([[540, 120], [940, 330], [940, 738], [140, 738], [140, 330]]), stroke(ink, 40), fill(paper))]),
      ],
    };
  };

  // Copy — 9 letters pop up from 54 below at 4-frame intervals (16f, 8 overshoot) and settle in 6f. They also gather horizontally toward the center
  const copyData = () => {
    const ink = rgb("--kf-ink");
    const family = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim() || "sans-serif";
    const chars = [...(copyEl.getAttribute("aria-label") || "").replace(/\s/g, "")].slice(0, 9);
    const n = chars.length, size = 56;
    const dx = [23, 17, 10, 5, 0, -6, -11, -18, -25];
    const over = [[-4, -8], [-4, -7], [-3, -6], [-1, -9], [0, -8], [-1, -9], [1, -7], [2, -6], [2, -5]];
    const rise = { o: { x: [0.019], y: [0] }, i: { x: [0.59], y: [1] } };
    const settle = { o: { x: [0.487], y: [0] }, i: { x: [0.485], y: [1] } };
    const arc = (i) => {
      const u = n > 1 ? i / (n - 1) : 0.5;
      return { x: 60 + u * 520, y: 120 - Math.sin(u * Math.PI) * 58, r: (u - 0.5) * 44 };
    };
    const layers = chars.map((t, i) => {
      const { x, y, r } = arc(i), t0 = i * 4, j = Math.min(i, 8);
      const kx = [{ t: t0, s: [x + dx[j]], ...rise }, { t: t0 + 16, s: [x + over[j][0]], ...settle }, { t: t0 + 22, s: [x] }];
      const ky = [{ t: t0, s: [y + 54], ...rise }, { t: t0 + 16, s: [y + over[j][1]], ...settle }, { t: t0 + 22, s: [y] }];
      return {
        ddd: 0, ind: i + 1, ty: 5, nm: `c${i}`, sr: 1, ao: 0, ip: 0, op: 60, st: 0, bm: 0,
        ks: { o: st(100), r: st(r), p: { s: true, x: { a: 1, k: kx }, y: { a: 1, k: ky } }, a: st([0, -size * 0.36, 0]), s: st([100, 100, 100]) },
        t: { d: { k: [{ s: { s: size, f: "kf", t, j: 2, tr: 0, lh: size * 1.2, ls: 0, fc: ink.slice(0, 3) }, t: 0 }] }, p: {}, m: { g: 1, a: st([0, 0]) }, a: [] },
      };
    });
    // Clip just below the line where letters settle so they are hidden at first: a six-vertex mask running down along the arc
    const cut = [0, 0.25, 0.5, 0.75, 1].map((u) => [60 + u * 520, 120 - Math.sin(u * Math.PI) * 58 + 30]);
    const mask = [[-21, -1], [661, -1], [661, cut[4][1]], ...cut.slice().reverse(), [-21, cut[0][1]]];
    return {
      v: "5.7.5", fr: 29.97, ip: 0, op: 60, w: 640, h: 200, nm: "copy", ddd: 0,
      fonts: { list: [{ fName: "kf", fFamily: family, fStyle: "Bold", fWeight: "700", ascent: 72, fOrigin: "n" }] },
      assets: [{ id: "chars", layers }],
      layers: [{
        ddd: 0, ind: 1, ty: 0, nm: "copy", refId: "chars", sr: 1, ao: 0, ip: 0, op: 60, st: 0, bm: 0, w: 640, h: 200,
        ks: { o: st(100), r: st(0), p: st([320, 100, 0]), a: st([320, 100, 0]), s: st([100, 100, 100]) },
        hasMask: true,
        masksProperties: [{ inv: false, mode: "a", nm: "cut", o: st(100), x: st(0), pt: st({ i: mask.map(() => [0, 0]), o: mask.map(() => [0, 0]), v: mask, c: true }) }],
      }],
    };
  };

  const mark = lottie.loadAnimation({ container: markEl, renderer: "svg", loop: true, autoplay: !reduce, animationData: markData() });
  mark.setSpeed(2);
  const copy = lottie.loadAnimation({ container: copyEl, renderer: "svg", loop: false, autoplay: false, animationData: copyData() });
  copy.setSpeed(2);

  const logoIn = () => {
    markEl.classList.add("is-in");
    if (reduce) copy.goToAndStop(copy.totalFrames - 1, true);
    else copy.play();
  };
  const btn = fv.querySelector(".ad-fv__btn");
  const loader = document.querySelector(".ad-loader");
  const loaderTxt = loader.querySelector(".ad-loader__txt");
  const paper = fv.querySelector(".ad-fv__paper");
  const d = (s) => (reduce ? 0 : s);

  // First visit — a phone floats up over the curtain and 2.65s later the curtain folds upward
  const firstVisit = () => {
    scrollTo(0, 0);
    body.classList.add("is-start");
    const finish = () => {
      gsap.to(loader, {
        scaleY: 0, duration: d(0.75), ease: "power1.in",
        onComplete: () => {
          body.classList.remove("is-loading");
          if (!isPC()) gsap.to(phone, { y: "0%", duration: d(0.5) });
          gsap.to(btn, { opacity: 1, duration: d(0.5), delay: d(0.5) });
          logoIn();
          body.classList.add("is-end");
        },
      });
    };
    gsap.delayedCall(d(2.65), () => {
      gsap.to(loaderTxt, { opacity: 0, scale: 1.05, duration: d(0.15), ease: "none", onComplete: isPC() ? finish : undefined });
      if (isPC()) gsap.to(paper, { opacity: 0, scale: 1.05, duration: d(0.5), ease: "power4.out" });
      else gsap.to(phone, { y: "110%", duration: d(0.5), ease: "power1.in", onComplete: () => { body.classList.remove("is-loading"); finish(); } });
    });
  };
  // Returning from the same site — no wait, just fold the curtain away in .5s
  const returnVisit = () => {
    scrollTo(0, 0);
    gsap.set(loaderTxt, { opacity: 0 });
    if (!isPC()) {
      gsap.set(phone, { y: "110%" });
      body.classList.remove("is-loading");
      body.classList.add("is-start", "is-end");
      gsap.to(btn, { opacity: 1, duration: d(0.5), delay: d(0.5) });
      gsap.to(phone, { y: "0%", duration: d(0.5) });
      logoIn();
    } else {
      body.classList.add("is-start");
      gsap.set(paper, { opacity: 0 });
    }
    gsap.to(loader, {
      scaleY: 0, duration: d(0.5), ease: "power1.in",
      onComplete: () => {
        gsap.to(btn, { opacity: 1, duration: d(0.5) });
        if (isPC()) { body.classList.remove("is-loading"); logoIn(); }
        body.classList.add("is-end");
      },
    });
  };
  const fromSite = document.referrer && new URL(document.referrer, location.href).origin === location.origin && !/index\.html$|\/$/.test(new URL(document.referrer).pathname);
  progress(() => (fromSite ? returnVisit : firstVisit)());
  addEventListener("load", () => scrollTo(0, 0));

  // Split pin — original timeline units: phone y 105% (0~5) · copy fades (0~1) · both images left 50% (0~10, power1.inOut) · text opens (9~15)
  const section = document.querySelector(".ad-split-pin");
  const wrap = section.querySelector(".ad-split-pin__wrap");
  const sides = section.querySelectorAll(".ad-col__in");
  const txts = section.querySelectorAll(".ad-col__txt");
  new IntersectionObserver(([e]) => { if (e.isIntersecting) body.classList.remove("is-faded"); }, { threshold: [1] })
    .observe(document.querySelector(".ad-scrollpoint"));

  const mm = gsap.matchMedia();
  mm.add({ pc: PC, reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    body.classList.toggle("is-pc", ctx.conditions.pc);
    if (!ctx.conditions.pc) return;
    if (ctx.conditions.reduce) {
      gsap.set(sides, { left: "50%" });
      gsap.set(txts, { opacity: 1, height: "auto" });
      section.classList.add("is-border");
      return () => { gsap.set([...sides, ...txts], { clearProps: "all" }); section.classList.remove("is-border"); };
    }
    let sideTween;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap, start: "top top", end: "bottom bottom", endTrigger: section, scrub: true, pin: true,
        onUpdate: (self) => {
          if (sideTween.progress() === 1) section.classList.add("is-border");
          else if (self.progress < 1) section.classList.remove("is-border");
        },
      },
    });
    tl.to(phone, { y: "105%", duration: 5 }, 0)
      .to(copyEl, { opacity: 0, duration: 1, onComplete: () => body.classList.add("is-faded") }, 0)
      .to(sides, { left: "50%", duration: 10, ease: "power1.inOut" }, 0)
      .to(txts, { opacity: 1, height: "auto", duration: 6 }, 9);
    sideTween = tl.getChildren()[2];
    return () => {
      gsap.set([phone, copyEl, ...sides, ...txts], { clearProps: "all" });
      section.classList.remove("is-border");
    };
  });

  // Map pin — clicking shows a card with the store name and link above that pin (original is a map service InfoWindow)
  const map = document.querySelector(".ad-access__map");
  const info = map.querySelector(".ad-map__info");
  map.querySelectorAll(".ad-map__pin").forEach((pin) => {
    pin.addEventListener("click", () => {
      info.hidden = false;
      info.style.left = pin.style.left;
      info.style.top = pin.style.top;
      info.querySelector(".ad-map__name").textContent = pin.getAttribute("aria-label");
    });
  });
  map.addEventListener("click", (e) => { if (!e.target.closest(".ad-map__pin, .ad-map__info")) info.hidden = true; });
})();
