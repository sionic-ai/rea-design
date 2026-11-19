// Home: intro (lava · list · mint wipe · letter-hole zoom) → showreel hero → pinned once (+6900px, scrub 1.2) to pass through About, brand and footer
(() => {
  const { reduced, fine } = PP;
  const mobile = matchMedia("(max-width: 991px)").matches || !fine;

  // 14 hero works (7 ads + 7 features). Video reuses four placeholder videos with lengths measured from the original (5.04~6.01s, no repeat)
  const SCENES = [
    "Aerial shot of a boat cutting across the sea · midday · full-width landscape", "Close-up of a car taillight in a dark alley · night · full-width landscape",
    "Person holding a camera in a white gallery, front view · soft indoor light · full-width landscape", "Motorcycle speeding along a road, side view · late afternoon · full-width landscape",
    "Close-up of a driver in a convertible · backlit · full-width landscape", "People by a park ping-pong table · tree shade · full-width screen",
    "Close-up of an instant camera screen in hand · natural light · landscape full-bleed screen",
  ];
  const HUES = [205, 15, 40, 120, 30, 95, 180, 280, 330, 60, 250, 10, 160, 300];
  const projects = [0, 1].flatMap((list) =>
    Array.from({ length: 7 }, (_, i) => ({
      list, row: i, hue: HUES[list * 7 + i], clip: ["reel-a", "reel-b", "reel-c", "reel-d"][(list * 7 + i) % 4],
      title: `${list ? "Series" : "Project"} Name ${String(i + 1).padStart(2, "0")}`,
      made: `Studio Name ${String(i + 1).padStart(2, "0")}`, director: `Director Name ${String(i + 1).padStart(2, "0")}`,
      label: SCENES[(i + list * 3) % SCENES.length],
    }))
  );

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $("[data-hero-stage]");

  // ---------- Building the screen ----------
  projects.forEach((p, i) => {
    const ap = document.createElement("div");
    ap.className = "home-hero__aperture";
    ap.innerHTML = `<div class="home-hero__scene"><div class="wf-img pp-shot wf-video" style="--h:${p.hue}" data-video="${p.clip}" data-play="manual" data-loop="false" data-label="${p.label}"></div></div>`;
    stage.append(ap);
    p.aperture = ap;
    p.scene = ap.firstElementChild;
    p.video = PP.mountVideo(p.scene.firstElementChild);
    const item = document.createElement("div");
    item.className = "home-hero__item pp-iline";
    item.dataset.magnet = "";
    item.innerHTML = `<span class="c"><div>[${String(p.row + 1).padStart(2, "0")}]</div><div>${p.title}</div></span><span class="m"></span>`;
    $(`[data-hero-list="${p.list}"]`).append(item);
    p.item = item;
    item.addEventListener("click", (e) => { e.stopPropagation(); if (current !== i) go(i); });
  });

  const brandNames = Array.from({ length: 7 }, (_, i) => `Brand Name 0${i + 1}`);
  const brandList = $("[data-brands-list]"), brandBg = $("[data-brands-bg]");
  const brands = brandNames.map((name, i) => {
    const el = document.createElement("div");
    el.className = "home-brands__item t-body";
    el.dataset.magnet = "";
    el.dataset.cursorText = "View more";
    el.dataset.label = "Your brand’s English name here";
    el.innerHTML = `<span>${name}</span>`;
    brandList.append(el);
    const bg = document.createElement("div");
    bg.className = "wf-img pp-shot wf-video";
    bg.dataset.video = ["reel-d", "reel-a", "reel-b", "reel-c"][i % 4];
    bg.dataset.play = "manual";
    bg.dataset.loop = "false";
    bg.style.setProperty("--h", 20 + i * 45);
    bg.dataset.label = `${name} Ad scene · smiling person in black-and-white close-up · full-width background video`;
    brandBg.append(bg);
    return { el, bg, video: PP.mountVideo(bg) };
  });

  // ---------- Intro ----------
  const root = document.documentElement;
  const seen = sessionStorage.getItem("pp-intro-seen");
  const skipIntro = reduced || seen;
  root.classList.add(skipIntro ? "home-intro-skip" : "home-intro-pending");

  const loader = $(".home-loader");
  const fillList = (col, n, right) => {
    col.innerHTML = Array.from({ length: n }, (_, i) =>
      `<div class="home-loader__item"><b>[${String(n - i).padStart(2, "0")}]</b><span>${right ? "Series" : "Project"} Name ${String(n - i).padStart(2, "0")}${i % 3 ? "" : " - Subtitle Line"}</span></div>`).join("");
  };
  const leftCol = $('[data-intro-list="left"]'), rightCol = $('[data-intro-list="right"]');
  fillList(leftCol, 79, false);
  fillList(rightCol, 36, true);

  // Letter-hole screen: draw the sentence words onto a canvas at the same spot and typeface, cut them out of a magenta plate, 'You' Zooms in 1200x centered on the nearby area
  const createCut = (heading) => {
    const canvas = document.createElement("canvas");
    canvas.className = "home-cut";
    document.body.append(canvas);
    const ctx = canvas.getContext("2d");
    const textC = document.createElement("canvas"), tctx = textC.getContext("2d");
    const st = { scale: 1, opening: 0, ox: 0, oy: 0, dpr: 1, base: `rgb(${PP.rgb("--kf-accent").join(",")})` };
    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = st.base;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.translate(st.ox, st.oy); ctx.scale(st.scale, st.scale); ctx.translate(-st.ox, -st.oy);
      ctx.globalCompositeOperation = "difference";
      ctx.drawImage(textC, 0, 0, w, h);
      if (st.opening > 0) { ctx.globalCompositeOperation = "destination-out"; ctx.globalAlpha = st.opening; ctx.drawImage(textC, 0, 0, w, h); }
      ctx.restore();
    };
    const sync = () => {
      const t = heading.querySelector("[data-cut-origin]").getBoundingClientRect();
      st.ox = t.left + t.width * 0.14; st.oy = t.top + t.height * 0.4;
      st.dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = textC.width = Math.ceil(innerWidth * st.dpr);
      canvas.height = textC.height = Math.ceil(innerHeight * st.dpr);
      tctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      tctx.fillStyle = `rgb(${PP.rgb("--site-flip").join(",")})`;
      tctx.textBaseline = "middle";
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode, cs = getComputedStyle(node.parentElement);
        tctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        tctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
        for (const m of node.textContent.matchAll(/\S+/g)) {
          const r = document.createRange();
          r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
          const b = r.getBoundingClientRect();
          if (b.width) tctx.fillText(m[0].toUpperCase(), b.left, b.top + b.height / 2);
        }
      }
      draw();
    };
    return { canvas, sync, setScale: (s) => { st.scale = s; draw(); }, setOpening: (o) => { st.opening = o; draw(); }, destroy: () => canvas.remove() };
  };

  const runIntro = () => new Promise((resolve) => {
    if (skipIntro) { resolve(); return; }
    CustomEase.create("homeIntroTravel", "M0,0 C0.42,0 0.3,1 1,1");
    CustomEase.create("homeIntroWipeFill", "M0,0 C0.76,0 0.24,1 1,1");
    CustomEase.create("homeIntroWipeReveal", "M0,0 C0.16,1 0.3,1 1,1");
    CustomEase.create("homeIntroScale", "M0,0 C0.55,0 0.75,0.35 1,1");
    const T = { listStart: .2, listDuration: 3.4, itemStagger: .024, headingStart: .75, fill: .46, reveal: .4, wipeStagger: .065,
      entryPause: 1.2, listsFade: 2.65, textureFade: 2.95, cutStart: 3.6, handoff: .2, cutScale: 4.15, zoom: .9, zoomFade: 4.8, complete: 5.2 };
    const heading = $(".home-loader__heading");
    const lines = $$(".home-loader__line", heading);
    const masks = lines.map((l) => $(".m", l)), contents = lines.map((l) => $(".c", l));
    const lava = $(".pp-lava", loader);
    const endY = (col) => -(Math.max(0, col.scrollHeight - innerHeight) + innerHeight * 0.025);
    const leftItems = $$(".home-loader__item", leftCol), rightItems = $$(".home-loader__item", rightCol);
    const cut = createCut(heading);
    const waitForTap = mobile;
    gsap.set([leftCol, rightCol], { y: innerHeight + 24 });

    const finish = () => {
      cut.destroy();
      root.classList.remove("home-intro-pending");
      root.classList.add("home-intro-skip");
      sessionStorage.setItem("pp-intro-seen", "1");
      ScrollTrigger.refresh();
    };
    const exit = gsap.timeline({ paused: waitForTap, onComplete: finish });
    const at = (t) => (waitForTap ? t - T.textureFade : t);
    const tl = gsap.timeline();
    tl.to(leftCol, { y: endY(leftCol), duration: T.listDuration, ease: "homeIntroTravel" }, T.listStart)
      .to(rightCol, { y: endY(rightCol), duration: T.listDuration, ease: "homeIntroTravel" }, T.listStart + .05)
      .to(leftItems, { autoAlpha: 1, duration: .28, ease: "power1.inOut", stagger: T.itemStagger }, T.listStart + .05)
      .to(rightItems, { autoAlpha: 1, duration: .28, ease: "power1.inOut", stagger: T.itemStagger }, T.listStart + .12)
      .to(masks, { scaleX: 1, transformOrigin: "right center", duration: T.fill, ease: "homeIntroWipeFill", stagger: T.wipeStagger }, T.headingStart)
      .set(contents, { visibility: "visible", stagger: T.wipeStagger }, T.headingStart + T.fill)
      .to(masks, { scaleX: 0, transformOrigin: "left center", duration: T.reveal, ease: "homeIntroWipeReveal", stagger: T.wipeStagger }, T.headingStart + T.fill)
      .to([leftCol, rightCol], { autoAlpha: 0, duration: .95, ease: "power2.out" }, T.listsFade);
    if (waitForTap) {
      const btn = $(".home-loader__proceed");
      tl.to(btn, { autoAlpha: 1, duration: .65, ease: "power2.out" }, T.headingStart + T.fill + T.reveal + 4 * T.wipeStagger + T.entryPause);
      btn.addEventListener("click", () => { gsap.to(btn, { autoAlpha: 0, duration: .3, ease: "power2.in" }); exit.play(); }, { once: true });
    }
    exit.to(lava.children, { autoAlpha: 0, duration: .62, ease: "power2.inOut" }, at(T.textureFade))
      .to(lava, { "--pp-vignette": 0, duration: .62, ease: "power2.inOut" }, at(T.textureFade))
      .call(resolve, null, at(T.zoomFade))
      .call(() => cut.sync(), null, at(T.cutStart))
      .to(cut.canvas, { autoAlpha: 1, duration: T.handoff, ease: "none" }, at(T.cutStart))
      .set([heading, loader], { autoAlpha: 0 }, at(T.cutStart + T.handoff))
      .to({ o: 0 }, { o: 1, duration: T.cutScale - T.cutStart - T.handoff, ease: "power2.inOut", onUpdate() { cut.setOpening(this.targets()[0].o); } }, at(T.cutStart + T.handoff))
      .to({ p: 0 }, { p: 1, duration: T.zoom, ease: "homeIntroScale", onUpdate() { cut.setScale((innerWidth < 768 ? 800 : 1200) ** this.targets()[0].p); } }, at(T.cutScale))
      .to(cut.canvas, { autoAlpha: 0, duration: T.complete - T.zoomFade, ease: "power2.inOut" }, at(T.zoomFade));
    if (!waitForTap) tl.add(exit, 0);
  });

  // ---------- Hero showreel ----------
  // Color matrix: only inside the opening window is tinted purple→lemon→mint·magenta→purple→primary, and center contrast rises by 0.24
  const M = {
    violetCitron: [0.115, 0.386, 0.039, 0, 0.29, 0.136, 0.458, 0.046, 0, 0.22, -0.089, -0.3, -0.031, 0, 0.72, 0, 0, 0, 1, 0],
    citronViolet: [-0.115, -0.386, -0.039, 0, 0.83, -0.136, -0.458, -0.046, 0, 0.86, 0.089, 0.3, 0.031, 0, 0.3, 0, 0, 0, 1, 0],
    mintMagenta: [0.182, -0.153, -0.019, 0, 0.63, 0.183, 0.615, 0.062, 0, 0.12, -0.114, -0.114, 0.068, 0, 0.8, 0, 0, 0, 1, 0],
    identity: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  };
  const stops = [[0, "violetCitron"], [0.28, "citronViolet"], [0.48, "mintMagenta"], [0.66, "violetCitron"], [0.78, "identity"]].map(([o, k]) => ({ o, v: M[k] }));
  const colorAt = (p) => {
    const i = Math.max(0, stops.findLastIndex((s) => p >= s.o));
    const cur = stops[i], prev = stops[Math.max(0, i - 1)];
    const b = Math.min(1, (p - cur.o) / (i === stops.length - 1 ? 0.2 : 0.12)), e = b * b * (3 - 2 * b);
    const k = 1 + 0.24 * Math.sin(Math.PI * Math.min(1, p / 0.94));
    return cur.v.map((v, c) => { const m = prev.v[c] + (v - prev.v[c]) * e; return c >= 15 ? m : m * k + (c % 5 === 4 ? (1 - k) / 2 : 0); }).join(" ");
  };
  const svgNS = "http://www.w3.org/2000/svg";
  const filterSvg = document.createElementNS(svgNS, "svg");
  filterSvg.setAttribute("width", "0"); filterSvg.setAttribute("height", "0");
  filterSvg.style.position = "absolute";
  filterSvg.innerHTML = `<filter id="pp-hero-rgb" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${M.identity.join(" ")}"/></filter>`;
  document.body.append(filterSvg);
  const matrix = filterSvg.querySelector("feColorMatrix");

  const REVEAL = 900;
  let current = 0, running = null, progressOn = false;
  const titleEl = $("[data-hero-title]"), madeEl = $("[data-hero-made]"), dirEl = $("[data-hero-director]");
  const previewImg = $(".home-hero__preview-img");

  const swapText = (el, text, animate) => {
    if (!animate || reduced) { el.textContent = text; return; }
    gsap.timeline()
      .to(el, { yPercent: -110, duration: .24, ease: "power2.in" })
      .add(() => { el.textContent = text; })
      .fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: .6, ease: "power3.out" });
  };
  const updateUI = (i, animate) => {
    const p = projects[i], next = projects[(i + 1) % projects.length];
    projects.forEach((q, j) => { q.item.classList.toggle("is-selected", j === i); q.item.style.setProperty("--p", "0"); });
    swapText(titleEl, p.title, animate);
    swapText(madeEl, p.made, animate);
    swapText(dirEl, p.director, animate);
    previewImg.style.setProperty("--h", next.hue);
    previewImg.dataset.label = `Next work preview · ${next.label.split(" · ")[0]}`;
    // As in the original, loop the next Work video small
    if (!previewVideo.src.endsWith(`${next.clip}.mp4`)) { previewVideo.src = `media/${next.clip}.mp4`; previewVideo.play()?.catch(() => {}); }
  };

  const play = (from, to) => {
    const a = projects[from], b = projects[to];
    running?.finish();
    a.aperture.style.zIndex = 1;
    b.aperture.style.zIndex = 2;
    b.aperture.classList.add("is-active");
    if (reduced) { a.aperture.classList.remove("is-active"); b.aperture.style.zIndex = 1; return; }
    b.aperture.style.filter = "url(#pp-hero-rgb)";
    const timing = { duration: REVEAL, fill: "both" };
    const clip = b.aperture.animate([{ clipPath: "inset(50% 50%)" }, { clipPath: "inset(0% 0%)" }], { ...timing, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });
    const scale = b.scene.animate([{ transform: "scale(2)" }, { transform: "scale(1)" }], { ...timing, easing: "cubic-bezier(0.33, 1, 0.68, 1)" });
    const alpha = b.aperture.animate([{ opacity: 0, offset: 0 }, { opacity: 0, offset: 0.2, easing: "cubic-bezier(0.42, 0, 0.58, 1)" }, { opacity: 1, offset: 0.9 }, { opacity: 1, offset: 1 }], timing);
    let raf, done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      [clip, scale, alpha].forEach((an) => an.cancel());
      b.aperture.style.filter = "";
      matrix.setAttribute("values", M.identity.join(" "));
      a.aperture.classList.remove("is-active");
      a.aperture.style.zIndex = 0;
      b.aperture.style.zIndex = 1;
      running = null;
    };
    const sync = () => {
      matrix.setAttribute("values", colorAt(Math.min(1, (Number(clip.currentTime) || 0) / REVEAL)));
      if (!done) raf = requestAnimationFrame(sync);
    };
    sync();
    clip.finished.then(finish).catch(() => {});
    running = { finish };
  };

  const go = (to, animate = true) => {
    to = (to + projects.length) % projects.length;
    if (to === current) return;
    play(current, to);
    const prev = projects[current].video;
    current = to;
    startClip(projects[to].video);
    setTimeout(() => prev.pause(), reduced ? 0 : REVEAL);
    updateUI(to, animate);
  };

  // The current row’s white bar shrinks following the video playback position, and 0.9s (the slide length) before the end it moves on to the next work — measured by video time, like the original.
  const startClip = (v) => { v.currentTime = 0; v.play()?.catch(() => {}); };
  const tick = () => {
    const v = projects[current].video;
    if (progressOn && !document.hidden && v.duration > 0) {
      const end = Math.max(0, v.duration - REVEAL / 1000 * Math.max(0, v.playbackRate));
      const p = end > 0 ? Math.min(1, v.currentTime / end) : 1;
      projects[current].item.style.setProperty("--p", p.toFixed(4));
      if (v.ended || v.currentTime >= end) go(current + 1);
    }
    requestAnimationFrame(tick);
  };

  projects[0].aperture.classList.add("is-active");
  projects[0].aperture.style.zIndex = 1;
  const previewVideo = PP.mountVideo(previewImg);
  updateUI(0, false);
  startClip(projects[0].video);

  const hero = $(".home-hero");
  hero.addEventListener("click", (e) => {
    if (e.target.closest(".home-hero__current, .home-hero__item, a, button")) return;
    go(current + 1);
  });
  $$("[data-go]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); go(current + (b.dataset.go === "next" ? 1 : -1)); }));
  const preview = $("[data-hero-preview]");
  preview.addEventListener("click", (e) => { e.stopPropagation(); go(current + 1); });

  // Next-work preview hover: shrinks the preview video frame to 2px cells and scales it back up (no smoothing), covers it in grayscale, contrast 1.6, multiply, and overlays a 5px grid at .55.
  // While the video plays, redraw every frame. Meanwhile the current-work video behind turns black and white (CSS)
  const halftone = $(".home-hero__halftone", preview);
  const hctx = halftone.getContext("2d"), tiny = document.createElement("canvas"), tctx2 = tiny.getContext("2d");
  let hovered = false, hraf = 0;
  const sizeHalftone = () => {
    const r = preview.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (halftone.width === w && halftone.height === h) return;
    halftone.width = w; halftone.height = h;
    tiny.width = Math.max(1, Math.round(w / 2)); tiny.height = Math.max(1, Math.round(h / 2));
    hctx.imageSmoothingEnabled = tctx2.imageSmoothingEnabled = false;
  };
  const renderHalftone = () => {
    hraf = 0;
    if (!hovered || document.hidden) return;
    const v = previewVideo;
    if (v.readyState >= 2 && v.videoWidth) {
      const sr = v.videoWidth / v.videoHeight, tr = halftone.width / halftone.height;
      const sw = sr > tr ? v.videoHeight * tr : v.videoWidth, sh = sr > tr ? v.videoHeight : v.videoWidth / tr;
      tctx2.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, tiny.width, tiny.height);
      hctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, 0, 0, halftone.width, halftone.height);
    }
    if (!v.paused && !v.ended) hraf = requestAnimationFrame(renderHalftone);
  };
  if (fine) {
    preview.addEventListener("pointerenter", () => { hovered = true; sizeHalftone(); preview.classList.add("is-halftone"); cancelAnimationFrame(hraf); renderHalftone(); });
    preview.addEventListener("pointerleave", () => { hovered = false; preview.classList.remove("is-halftone"); cancelAnimationFrame(hraf); hraf = 0; });
    previewVideo.addEventListener("playing", () => { cancelAnimationFrame(hraf); renderHalftone(); });
    new ResizeObserver(sizeHalftone).observe(preview);
  }

  // Hero entrance: a white bar wipe on each list title and row (.24+.28s, .025 row · .15 column gaps), the black card slides up from below in 1.1s
  const heroIntro = () => {
    const wipe = CustomEase.create("pspHeroWipe", "0.76, 0, 0.24, 1");
    const slide = CustomEase.create("pspHeroCurrentSlide", "0.25, 0.1, 0.04, 1");
    const panel = $(".home-hero__current");
    const tl = gsap.timeline({ onComplete: () => { document.body.classList.add("hero-intro-complete"); progressOn = true; startClip(projects[current].video); } });
    $$(".home-hero__list-wrap").forEach((wrap, col) => {
      [$(".home-hero__list-title", wrap), ...$$(".home-hero__item", wrap)].forEach((line, row) => {
        const m = $(".m", line), c = $(".c", line), at = .25 + col * .15 + row * .025;
        if (reduced) { gsap.set(c, { autoAlpha: 1 }); line.classList.add("is-revealed"); return; }
        tl.fromTo(m, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: .24, ease: wipe }, at)
          .add(() => { gsap.set(c, { autoAlpha: 1 }); line.classList.add("is-revealed"); }, at + .24)
          .to(m, { scaleX: 0, transformOrigin: "right center", duration: .28, ease: wipe }, at + .24);
      });
    });
    gsap.set(panel, { autoAlpha: 1, yPercent: reduced ? 0 : 100 });
    if (!reduced) tl.to(panel, { yPercent: 0, duration: 1.1, ease: slide }, .35);
  };

  // ---------- Brand list ----------
  // The chosen brand’s black-and-white video plays from the start, the bar under the line fills following the playback position, and it moves to the next brand when it ends
  let brandCur = 0;
  const setBrand = (i) => {
    brandCur = i;
    brands.forEach((b, j) => {
      b.el.classList.toggle("is-selected", j === i);
      b.bg.classList.toggle("is-active", j === i);
      b.el.style.setProperty("--p", 0);
      if (j === i) startClip(b.video); else b.video.pause();
    });
  };
  brands.forEach((b, i) => b.el.addEventListener("click", () => setBrand(i)));
  setBrand(0);
  const brandTick = () => {
    const v = brands[brandCur].video;
    if (v.duration > 0) {
      brands[brandCur].el.style.setProperty("--p", Math.min(1, v.currentTime / v.duration).toFixed(4));
      if (v.ended) setBrand((brandCur + 1) % brands.length);
    }
    requestAnimationFrame(brandTick);
  };

  // ---------- Pinned scroll ----------
  const pin = $(".home-pin");
  const about = $(".home-about"), brandsSec = $(".home-brands"), footer = $(".home-pin > .footer");
  const paraBlocks = $$(".home-about__block"), paraContents = paraBlocks.map((b) => b.firstElementChild);
  const links = $(".home-about__links"), linksFill = $(".home-about__fill");
  const aboutLines = $$(".home-about__heading .pp-wipe-line");
  const aboutEnd = $(".home-about__end");
  const brandLines = $$(".home-brands__heading .pp-wipe-line");
  const brandSlides = $$("[data-brands-slide]");
  const footerMedia = $(".footer__video", footer), footerHi = $(".footer__hi", footer);
  const logo = $(".pp-logo");
  const fill = CustomEase.create("fill", "0.85, 0, 0.15, 1");
  const reveal = CustomEase.create("reveal", "0.19, 1, 0.22, 1");
  const wipeIn = (lines, dFill, dReveal, stagger) => {
    const tl = gsap.timeline();
    const ms = lines.map((l) => $(".pp-wipe-mask", l)), cs = lines.map((l) => $(".c", l));
    tl.to(ms, { scaleX: 1, transformOrigin: "right center", duration: dFill, stagger, ease: fill })
      .set(cs, { visibility: "visible" }, ">")
      .to(ms, { scaleX: 0, transformOrigin: "left center", duration: dReveal, stagger, ease: reveal }, "<");
    return tl;
  };

  const buildDesktop = () => {
    gsap.set(about, { yPercent: 100 });
    gsap.set(brandsSec, { xPercent: 100 });
    gsap.set(footer, { yPercent: 120, autoAlpha: 0 });
    gsap.set(paraContents, { y: "50vh" });
    gsap.set(links, { y: "50vh" });
    gsap.set(aboutEnd, { autoAlpha: 0, y: 30 });
    gsap.set(brandSlides, { x: () => innerWidth * 0.4 });
    gsap.set(footerMedia, { scale: 2, yPercent: -68 });
    gsap.set(footerHi, { clipPath: "inset(0 100% 0 0)" });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: pin, start: "top top", end: "+=6900", scrub: 1.2, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
    });
    const aboutIn = gsap.timeline()
      .to(about, { yPercent: 0, duration: 1, ease: "none" })
      .to(paraContents, { y: 0, duration: .7, stagger: .09, ease: "power3.out" }, .5)
      .to(links, { y: 0, duration: .62, ease: "power3.out" }, "-=0.65");
    const headingWipe = wipeIn(aboutLines, .8, .8, .1).to(aboutEnd, { autoAlpha: 1, y: 0, duration: .6, ease: "power3.out" }, "+=0.5");
    const horizontal = gsap.timeline()
      .to(linksFill, { scaleX: 1, duration: 2.8, ease: "power2.inOut" }, 0)
      .to(aboutLines, { x: "-200vw", duration: 4, stagger: { amount: .4 }, ease: "power1.inOut" }, 0)
      .to(paraBlocks, { x: "-150vw", duration: 1.8, stagger: { amount: .2 }, ease: "power2.in" }, 0)
      .to(links, { x: "-150vw", duration: 1.6, ease: "power2.in" }, 0)
      .to(aboutEnd, { x: "-150vw", duration: 1.7, ease: "power2.in" }, 0)
      .to(brandsSec, { xPercent: 0, duration: 3.08, ease: "none" }, 1.5);
    const brandsIn = wipeIn(brandLines, .55, .45, .05)
      .to(brandSlides, { x: 0, duration: 2.2, stagger: .15, ease: "power2.out" }, 0);
    const footerIn = gsap.timeline()
      .set(footer, { autoAlpha: 1 })
      .to(footer, { yPercent: 0, duration: 3.2, ease: "power2.out" })
      .to(footerMedia, { scale: 1, yPercent: 0, duration: 3.2, ease: "none" }, 0)
      .to(footerHi, { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "power1.inOut" }, 1.2)
      .to(logo, { autoAlpha: 0, duration: .15, ease: "power2.out" }, .7);
    tl.add(aboutIn, 0).add(headingWipe, .8).add(horizontal, ">+=2.2").add(brandsIn, ">").add(footerIn, "<+=3");
    return tl;
  };

  // Phone: only the board movement is tied to scroll (About 1 → Brand 1 → rest .1 → Footer 1.2, screen height×3.3×1.18), and the text wipe plays once when the board enters
  const buildMobile = () => {
    gsap.set(about, { yPercent: 100 });
    gsap.set(brandsSec, { xPercent: 100 });
    gsap.set(footer, { yPercent: 120, autoAlpha: 0 });
    const aboutW = wipeIn(aboutLines, .3, .45, .05).pause();
    const brandW = wipeIn(brandLines, .3, .45, .05).pause();
    const tl = gsap.timeline({
      scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${Math.round(innerHeight * 3.3 * 1.18)}`, scrub: true, pin: true, invalidateOnRefresh: true,
        onUpdate: (st) => { if (st.progress > 0.2) aboutW.play(); if (st.progress > 0.5) brandW.play(); } },
    });
    tl.to(about, { yPercent: 0, duration: 1, ease: "none" })
      .to(brandsSec, { xPercent: 0, duration: 1, ease: "none" })
      .to({}, { duration: .1 })
      .set(footer, { autoAlpha: 1 })
      .to(footer, { yPercent: 0, duration: 1.2, ease: "none" })
      .to(logo, { autoAlpha: 0, duration: .08, ease: "none" }, "<+=0.18");
    return tl;
  };

  // About cursor video: a 300×175 window follows the mouse at a .17 ratio, stretches when moving fast (.065), and folds away outside the panel and after 20% of the brand
  const initAboutCursor = (master) => {
    const win = $(".home-about__cursor");
    if (!fine || reduced) return;
    const video = PP.mountVideo(win);
    gsap.set(win, { xPercent: -50, yPercent: -50, force3D: true });
    let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my, reveal = 0, stretch = 0, last = performance.now(), over = false;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; over = !!e.target.closest(".home-about") && !e.target.closest("a, button"); }, { passive: true });
    const loop = (now) => {
      const dt = Math.min(64, now - last); last = now;
      const ap = gsap.getProperty(about, "yPercent"), bp = 1 - gsap.getProperty(brandsSec, "xPercent") / 100;
      const active = over && ap < 5 && bp < 0.2;
      const k = 1 - Math.pow(1 - 0.17, dt / 16.666);
      const px = x, py = y;
      x += (mx - x) * k; y += (my - y) * k;
      const speed = Math.min(1, Math.hypot(x - px, y - py) / 40);
      stretch += (speed * 0.065 - stretch) * 0.2;
      reveal += ((active ? 1 : 0) - reveal) * 0.12;
      if (Math.abs(reveal) < 0.002) reveal = active ? reveal : 0;
      const mX = Math.min(170, innerWidth / 2), mY = Math.min(107, innerHeight / 2);
      const s = 0.72 + (1 - Math.pow(1 - reveal, 3)) * 0.28 + Math.sin(reveal * Math.PI) * 0.06;
      gsap.set(win, { x: Math.max(mX, Math.min(innerWidth - mX, x)), y: Math.max(mY, Math.min(innerHeight - mY, y)), scaleX: s * (1 + stretch), scaleY: s * (1 - stretch), autoAlpha: reveal < 0.005 ? 0 : reveal });
      // As in the original, plays the video only while the window is visible and pauses once it is fully gone
      if (reveal > 0 && video.paused) video.play()?.catch(() => {});
      else if (reveal === 0 && !video.paused) video.pause();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  // Video parallax: videos in the Hero and brand panels shift by the cursor position in the panel (-1 to 1) × up to 72px in x (5% of panel width) and 48px in y (5% of height), scaled 1.12x to hide the edges.
  // Follows with a 220ms time constant and settles at about 1.2 seconds, returns to 0 when covered by later panels (About · Brand · footer) and less than 35% is visible — value measured from the original (x 60px → -65.8px)
  const initVideoParallax = () => {
    if (!fine || reduced || navigator.maxTouchPoints > 0) return;
    const layers = [$(".home-hero"), about, brandsSec, footer];
    const groups = [[layers[0], ".home-hero__scene .pp-video"], [brandsSec, ".home-brands__bg .pp-video"]]
      .map(([el, sel]) => ({ el, depth: layers.indexOf(el), videos: $$(sel, el), x: 0, y: 0 }));
    const ptr = { x: 0, y: 0, on: false };
    let raf = 0, prev = 0;
    const shown = (el) => { const s = getComputedStyle(el); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0; };
    // Share of the 10×10 dots on a plate that are on screen and not covered by the plate behind
    const exposure = (b, covers) => {
      let n = 0;
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
        const x = b.left + (i + 0.5) * b.width / 10, y = b.top + (j + 0.5) * b.height / 10;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        if (!covers.some((c) => x >= c.left && x <= c.right && y >= c.top && y <= c.bottom)) n++;
      }
      return n / 100;
    };
    const frame = (now) => {
      raf = 0;
      const k = 1 - Math.exp(-(prev ? Math.min(64, now - prev) : 16.67) / 220);
      const boxes = layers.map((el) => el && { b: el.getBoundingClientRect(), on: shown(el) });
      let busy = false;
      for (const g of groups) {
        const { b, on } = boxes[g.depth];
        const covers = boxes.slice(g.depth + 1).filter((c) => c && c.on).map((c) => c.b);
        const live = ptr.on && !document.hidden && on && exposure(b, covers) >= 0.35;
        const tx = live ? (gsap.utils.clamp(0, 1, (ptr.x - b.left) / b.width) * 2 - 1) * Math.min(72, b.width * 0.05) : 0;
        const ty = live ? (gsap.utils.clamp(0, 1, (ptr.y - b.top) / b.height) * 2 - 1) * Math.min(48, b.height * 0.05) : 0;
        g.x += (tx - g.x) * k; g.y += (ty - g.y) * k;
        const moving = Math.abs(tx - g.x) + Math.abs(ty - g.y) > 0.02;
        if (!moving) { g.x = tx; g.y = ty; }
        for (const v of g.videos) {
          v.style.transform = `translate3d(${g.x.toFixed(3)}px, ${g.y.toFixed(3)}px, 0) scale(1.12)`;
          v.style.willChange = live || moving ? "transform" : "";
        }
        busy ||= moving;
      }
      prev = busy ? now : 0;
      if (busy) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const leave = () => { ptr.on = false; kick(); };
    document.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true;
      kick();
    }, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", leave);
    addEventListener("blur", leave);
    document.addEventListener("visibilitychange", leave);
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick, { passive: true });
    kick();
  };
  initVideoParallax();

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    if (conditions.still) {
      $$(".pp-wipe-line .c").forEach((c) => (c.style.visibility = "visible"));
      return;
    }
    const master = mobile ? buildMobile() : buildDesktop();
    initAboutCursor(master);
  });

  if (reduced) $$(".pp-wipe-line .c").forEach((c) => (c.style.visibility = "visible"));
  requestAnimationFrame(tick);
  requestAnimationFrame(brandTick);
  (document.fonts?.ready ?? Promise.resolve()).then(() => runIntro()).then(heroIntro);
})();
