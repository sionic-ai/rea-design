// First section — loader symbol panel, video head pushed vertically to swap (Swiper 11, same virtualTranslate vertical panel as the original)
(() => {
  const OL = (window.OL = window.OL || { pages: {} });
  const NS = "http://www.w3.org/2000/svg";

  // Loader: 1s of darkness → a small circle (four arcs) lights up → spreads to the four corners → eight arrowhead pieces spin in a circle. An 8s panel
  OL.loaderIntro = (svg) => {
    const tl = gsap.timeline();
    if (!svg) return tl;
    const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); svg.append(n); return n; };
    const arcs = [0, 1, 2, 3].map(() => mk("path", { d: "M-0.92 -0.38A1 1 0 0 1 -0.38 -0.92", fill: "none", stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" }));
    const orbit = mk("g", {});
    const darts = Array.from({ length: 8 }, () => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M0 -9L7 7L0 3L-7 7Z");
      p.setAttribute("fill", "currentColor");
      orbit.append(p);
      return p;
    });
    const corner = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    arcs.forEach((a, i) => gsap.set(a, { rotation: i * 90, scale: 0, opacity: 0, transformOrigin: "0 0", x: 0, y: 0 }));
    darts.forEach((d, i) => {
      const ang = (i / 8) * Math.PI * 2;
      gsap.set(d, { x: Math.cos(ang) * 150, y: Math.sin(ang) * 150, rotation: (ang * 180) / Math.PI + 90, scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    });
    tl.to(arcs, { scale: 32, opacity: 1, duration: 0.8, ease: "ol-tide" }, 1)
      .to(arcs, { scale: 40, x: (i) => corner[i][0] * 80, y: (i) => corner[i][1] * 80, duration: 0.9, ease: "ol-dive" }, 2.2)
      .to(arcs, { scale: 22, x: (i) => corner[i][0] * 120, y: (i) => corner[i][1] * 120, duration: 0.9, ease: "ol-dive" }, 3.1)
      .to(darts, { scale: 1, opacity: 1, duration: 0.5, ease: "ol-tide", stagger: 0.05 }, 3.3)
      .fromTo(orbit, { rotation: 0, transformOrigin: "0 0" }, { rotation: 300, duration: 4.7, ease: "none" }, 3.3)
      .to(darts, { scaleX: -1, duration: 0.45, ease: "ol-dive", stagger: { each: 0.06, repeat: 5, yoyo: true } }, 3.9)
      .to(arcs, { rotation: (i) => i * 90 + 45, duration: 1.6, ease: "ol-dive" }, 4.6);
    tl.set({}, {}, 8);
    return tl;
  };

  OL.page("home", (root) => {
    const sec = root.querySelector(".ol-hs");
    if (!sec) return;
    const sliderEl = sec.querySelector(".ol-hs__slider");
    const texts = [...sec.querySelectorAll(".ol-hs__text")];
    const pag = sec.querySelector(".ol-hs__pagination");
    const slides0 = [...sliderEl.querySelectorAll(".swiper-slide")];
    slides0.forEach((s, i) => (s.dataset.n = i));
    texts.forEach((t) => { t.hidden = false; t.classList.add("is-hidden"); });
    const dots = slides0.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ol-hs__dot";
      b.setAttribute("aria-label", `${i + 1}Go to section`);
      b.innerHTML = `<span class="ol-hs__dot-label">${String(i + 1).padStart(2, "0")}. ${s.dataset.label}</span><span class="ol-hs__dot-track"></span>`;
      pag.append(b);
      return b;
    });
    const OUTRO = 1.2, IMAGE = 6;
    let timer = 0, startAt = 0, dur = IMAGE, leaving = null, ready = false;

    const inviewEls = (t) => (t ? [...t.querySelectorAll("[data-split], [data-inview]")] : []);
    const textIn = (i) => {
      texts.forEach((t) => t.classList.toggle("is-hidden", +t.dataset.i !== i));
      const els = inviewEls(texts[i]);
      els.forEach((e) => { e.classList.remove("is-in", "is-out"); void e.offsetWidth; });
      requestAnimationFrame(() => els.forEach((e) => e.classList.add("is-in")));
    };
    const textOut = (i) => inviewEls(texts[i]).forEach((e) => { e.classList.remove("is-in"); void e.offsetWidth; e.classList.add("is-out"); });
    const setProgress = (i, v) => dots[i] && dots[i].style.setProperty("--progress", Math.min(Math.max(v, 0), 1));

    // Video slot: a progress bar fills over the video length, and 1.2s before the end it goes to the next section (original getMediaOutroTime)
    const run = (i) => {
      cancelAnimationFrame(timer);
      dots.forEach((d, k) => k !== i && setProgress(k, 0));
      const s = slides0[i];
      dur = s.dataset.duration ? Math.max(+s.dataset.duration - OUTRO, 0.1) : IMAGE;
      startAt = performance.now();
      const tick = () => {
        const p = (performance.now() - startAt) / 1000 / dur;
        setProgress(i, p);
        if (p >= 1) { swiper.slideNext(); return; }
        timer = requestAnimationFrame(tick);
      };
      timer = requestAnimationFrame(tick);
    };
    const pin = (sw) => sw.slides.forEach((sl) => { sl.style.transform = `translate3d(0, ${-(sl.swiperSlideOffset || 0)}px, 0)`; });
    const reveal = (sw) => {
      const act = sw.slides[sw.activeIndex];
      sw.slides.forEach((sl) => sl !== act && sl !== leaving && sl.classList.remove("is-active", "is-leaving"));
      if (leaving && leaving !== act) { leaving.classList.remove("is-active"); leaving.classList.add("is-leaving"); }
      act.classList.remove("is-leaving");
      act.classList.add("is-active");
      const prev = leaving;
      leaving = act;
      return prev;
    };
    const cleanupLeaving = (sw) => {
      const act = sw.slides[sw.activeIndex];
      const old = sw.slides.filter((sl) => sl !== act && sl.classList.contains("is-leaving"));
      old.forEach((sl) => { sl.classList.add("is-resetting"); sl.classList.remove("is-leaving"); });
      void sw.wrapperEl.offsetWidth;
      old.forEach((sl) => sl.classList.remove("is-resetting"));
    };
    const swiper = new Swiper(sliderEl, {
      direction: "vertical",
      slidesPerView: 1,
      watchSlidesProgress: true,
      virtualTranslate: true,
      loop: true,
      loopAdditionalSlides: 1,
      speed: 1400,
      threshold: 25,
      allowTouchMove: false,
      breakpoints: { 1024: { allowTouchMove: true } },
      keyboard: true,
      on: {
        setTranslate: (sw) => pin(sw),
        slideChangeTransitionStart: (sw) => {
          if (!ready) return;
          sliderEl.classList.add("is-transitioning");
          const prev = reveal(sw);
          const now = +sw.slides[sw.activeIndex].dataset.n;
          if (prev && prev !== sw.slides[sw.activeIndex]) textOut(+prev.dataset.n);
          dots.forEach((d, k) => d.classList.toggle("is-active", k === now));
          textIn(now);
          run(now);
          clearTimeout(sw._end);
          sw._end = setTimeout(() => { cleanupLeaving(sw); sliderEl.classList.remove("is-transitioning"); sw.animating = false; }, 1400);
        },
      },
    });
    dots.forEach((d, i) => d.addEventListener("click", () => { if (i !== swiper.realIndex) swiper.slideToLoop(i); }));
    const begin = () => {
      ready = true;
      pin(swiper);
      reveal(swiper);
      const now = +swiper.slides[swiper.activeIndex].dataset.n;
      dots[now].classList.add("is-active");
      textIn(now);
      run(now);
    };
    if (OL.reduce) { ready = true; reveal(swiper); textIn(0); dots[0].classList.add("is-active"); }
    else begin();
    // Detach is called from the old section during the transition — the shape stays as is and only the clock stops (the new section is rebuilt from the newly fetched HTML)
    return () => { cancelAnimationFrame(timer); clearTimeout(swiper._end); swiper.destroy(false, false); };
  });
})();
