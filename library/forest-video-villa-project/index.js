(() => {
  const { lenis, isSp, reduce, pill } = window.NH;
  const EXT = (window.splide && window.splide.Extensions) || {};
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ───── Loader — the number fills to 99 (jumps straight ahead once the video is ready), hits 100, then plays the video and lifts the panel ─────
  const loader = document.querySelector("[data-loader]");
  const video = document.querySelector("[data-mv-video]");
  const num = document.querySelector("[data-loader-num]");
  const play = () => video?.play().catch(() => {});
  const finish = () => {
    play();
    loader.classList.add("is-loading");
    loader.querySelector("[data-loader-bg]").classList.add("is-loading");
    loader.querySelector("[data-loader-logo]").classList.add("is-loading");
    lenis?.start();
    setTimeout(() => loader.classList.add("is-gone"), 3000);
  };
  if (reduce) { num.textContent = "100"; finish(); }
  else {
    lenis?.stop();
    (async () => {
      for (let n = 0; n < 99; n++) { await wait(12); num.textContent = String(n + 1); }
      num.textContent = "100";
      await wait(100);
      finish();
    })();
  }

  // ───── Wave — the gradient nodes and lines sway with sines of different tempos (only when visible) ─────
  const wave = document.querySelector("[data-wave]");
  if (wave && !reduce) {
    const stops = [...wave.querySelectorAll("linearGradient")].map((g) => g.querySelectorAll("stop"));
    const paths = [...wave.querySelectorAll("path")];
    const t0 = performance.now();
    let raf = 0;
    const draw = (now) => {
      const e = 3e-4 * (now - t0), n = Math.sin(e), i = Math.sin(3.5 * e), r = (Math.sin(0.7 * e) + 1) / 2, o = (Math.sin(1.3 * e) + 1) / 2, s = (Math.sin(2.6 * e) + 1) / 2;
      const set = (k, a, b) => { stops[k][0].setAttribute("offset", `${a}%`); stops[k][1].setAttribute("offset", `${b}%`); };
      set(0, 40 + 50 * i, 100 - 10 * o); set(1, 80 + 10 * n, 100 - 10 * o); set(2, 10 * o, 20 + 10 * i); set(3, 10 * s, 20 + 10 * i);
      paths[0].setAttribute("transform", `translate(${5 + 15 * n},0) scale(${1 + 0.5 * r},1)`);
      paths[1].setAttribute("transform", `translate(${-5 * i},${4 * o}) scale(1,${1 + 0.2 * s})`);
      paths[2].setAttribute("transform", `translate(${6 * r},${-3 * n})`);
      paths[3].setAttribute("transform", `translate(${-4 * s},${3 * i}) scale(${1 + 0.3 * o})`);
      raf = requestAnimationFrame(draw);
    };
    new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(draw); }, { rootMargin: "-10px 0px -10px 0px" }).observe(document.querySelector(".h-waveWrap"));
  }

  // ───── Flowing big text — roll a Splide infinite row at speed .5 (only when visible) ─────
  if (window.Splide) document.querySelectorAll("[data-text-loop]").forEach((el) => {
    new Splide(el, { mediaQuery: "min", type: "loop", pagination: false, arrows: false, gap: "0.2em", autoplay: "pause", autoWidth: true, drag: false,
      autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false }, intersection: { inView: { autoScroll: true }, outView: { autoScroll: false } } })
      .mount({ Intersection: EXT.Intersection, AutoScroll: EXT.AutoScroll });
  });

  // ───── Concept text — split into lines, when visible starts 35% down at .05 transparent, 1.6s power1.out, .2s per line ─────
  const lines = document.querySelector(".h-concept__lines");
  if (lines && window.SplitText && !reduce) {
    gsap.registerPlugin(SplitText);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      SplitText.create(lines.querySelectorAll("[data-split]"), { type: "words,lines", linesClass: "line", autoSplit: true, mask: "lines",
        onSplit: (s) => gsap.from(s.lines, { duration: 1.6, yPercent: 35, opacity: 0.05, stagger: 0.2, ease: "power1.out" }) });
    });
    io.observe(lines);
  }

  // ───── Concept photo slide — Splide fade 4s. Just before advancing, is-finished is added to the current slide and text so it folds away over 1.4s, then it advances ─────
  const cs = document.querySelector("[data-concept-slider]");
  const title = document.querySelector("[data-cs-title]");
  const text = document.querySelector("[data-cs-text]");
  if (cs && window.Splide) {
    const contents = [...cs.querySelectorAll(".splide__slide")].map((s) => ({ title: s.dataset.title, text: s.dataset.text }));
    const Finish = (sp, C) => {
      const ctrl = C.Controller, go = ctrl.go;
      let lock = false;
      return { mount() {
        ctrl.go = (dest, allow) => {
          if (lock) return;
          const cur = C.Slides.getAt(sp.index)?.slide;
          if (!cur || reduce) { go(dest, allow); return; }
          [cur, title, text].forEach((x) => x.classList.add("is-finished"));
          lock = true;
          setTimeout(() => { go(dest, allow); [cur, title, text].forEach((x) => x.classList.remove("is-finished")); lock = false; }, 1400);
        };
      } };
    };
    const sp = new Splide(cs, { mediaQuery: "min", type: "fade", rewind: true, pagination: true, arrows: false, drag: false, pauseOnHover: false, interval: 4000, autoplay: "pause",
      breakpoints: { 768: { pagination: false } }, intersection: { rootMargin: "0% 0% 0% 0%", inView: { autoplay: true }, outView: { autoplay: false } } });
    sp.on("move", (i) => {
      title.classList.remove("is-active"); text.classList.remove("is-active");
      setTimeout(() => { title.textContent = contents[i].title; text.innerHTML = contents[i].text; title.classList.add("is-active"); text.classList.add("is-active"); }, 500);
    });
    sp.mount({ Intersection: EXT.Intersection, Finish });
    title.classList.add("is-active"); text.classList.add("is-active");
    cs.addEventListener("fx:next", () => sp.go(">"));
    cs.addEventListener("fx:prev", () => sp.go("<"));
  }

  // ───── Project map — one line bound to scroll, from when the section reaches screen center until it ends ─────
  const proj = document.querySelector("[data-proj]");
  if (proj && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    const probe = document.createElement("i");
    probe.style.color = "var(--kf-contrast-bg)";
    document.body.append(probe);
    const ink = getComputedStyle(probe).color.match(/[\d.]+/g).slice(0, 3).join(", ");
    probe.remove();
    const circles = proj.querySelectorAll("[data-proj-circle]");
    gsap.set(circles, { scale: 0 });
    const q = (s) => proj.querySelector(s);
    const tl = gsap.timeline({ scrollTrigger: { trigger: proj, start: isSp ? "top 80%" : "top center", end: "bottom bottom", scrub: true } });
    tl.fromTo(".h-waveWrap", { backgroundColor: `rgba(${ink}, 0)` }, { backgroundColor: `rgba(${ink}, 1)`, duration: 1 })
      .to(q("[data-proj-title]"), { opacity: 1 }, 0.7)
      .to(q("[data-proj-text]"), { opacity: 1, duration: 1 }, 1)
      .to(q("[data-proj-graph]"), { opacity: 1 }, 1)
      .to(q("[data-proj-city]"), { opacity: 1, duration: 0.5 }, 1)
      .to(proj.querySelectorAll("[data-proj-pt]"), { opacity: 1, duration: 0.5 }, 1)
      .to(circles[0], { scale: 1, opacity: 0.1, duration: 0.5 }, 1.1)
      .to(circles[1], { scale: 1, opacity: 0.1, duration: 0.5 }, 1.3)
      .to(circles[2], { scale: 1, opacity: 0.1, duration: 0.5 }, 1.45)
      .to(circles[3], { scale: 1, opacity: 0.1, duration: 0.5 }, 1.6)
      .to({}, { duration: 0.3 });
  } else if (proj) gsap.set(proj.querySelectorAll("[data-proj-title],[data-proj-text],[data-proj-graph],[data-proj-city],[data-proj-pt]"), { opacity: 1 });

  // ───── Villa photos — an infinite row that advances every 3.5s (1s cubic-bezier(.4,.15,.25,1), .7s on phone) ─────
  if (window.Splide) document.querySelectorAll("[data-villa-slider]").forEach((el) => {
    new Splide(el, { mediaQuery: "min", type: "loop", pagination: true, arrows: false, drag: true, pauseOnHover: false, interval: 3500, autoplay: "pause", speed: 700,
      breakpoints: { 768: { speed: 1000 } }, easing: "cubic-bezier(0.4, 0.15, 0.25, 1)", intersection: { rootMargin: "0% 0% 0% 0%", inView: { autoplay: true }, outView: { autoplay: false } } })
      .mount({ Intersection: EXT.Intersection });
  });

  // ───── Three news rows ─────
  const rows = document.querySelector("[data-news-rows]");
  if (rows) rows.innerHTML = [["2026.03.10", "SEASIDE", "A villa has begun accepting reservations (simultaneous press release)"], ["2026.02.27", "SEASIDE", "Launched a website for a villa"], ["2026.01.28", "RIVERSIDE", "One villa was chosen for the ”Magazine Name” list of 10 stays with saunas"]]
    .map(([d, t, s]) => `<article><a class="n-newsRow n-lineLink" data-hold="0.7" href="article.html"><span class="n-newsRow__meta en-label-l"><span class="n-newsRow__date">${d}</span><span class="n-newsRow__tag">${t}</span></span><span class="n-newsRow__title ja-body-s">${s}</span><span class="n-newsRow__go">${pill}</span><span class="n-lineLink__base"></span><span class="n-lineLink__run"></span></a></article>`).join("");
})();
