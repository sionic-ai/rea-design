// Keeps the screen fixed and flips through a frame set by scroll amount — a pre-rendered sequence stage where the product spins and comes apart.
// The frame <img data-fx-part="frame"> Draws it on a canvas, or if there is none, the consumer draws it from the fx:frame event (detail.progress · index).
(() => {
  kfFx.register("pin-sprite-scrub", (el, { options, reduce, scroller }) => {
    const pinEl = el.querySelector('[data-fx-part="pin"]') || el;
    const stage = el.querySelector('[data-fx-part="stage"]');
    const canvas = el.querySelector('[data-fx-part="canvas"]');
    const imgs = [...el.querySelectorAll('img[data-fx-part="frame"]')];
    const points = [...el.querySelectorAll('[data-fx-part="point"]')];
    const dist = +(options.dist ?? 2600), end = +(options.end ?? 0.8) || 1, show = +(options.show ?? 0.65);
    const frames = imgs.length || Math.max(2, +options.frames || 171);
    const blur = +(options.blur ?? 8), rise = +(options.rise ?? 75), zoom = +(options.zoom ?? 1.15), drift = +(options.drift ?? -20);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    let last = -1;
    const draw = (p) => {
      const i = Math.min(frames - 1, Math.max(0, Math.round(p * (frames - 1))));
      if (i === last) return;
      last = i;
      if (canvas && imgs[i]?.complete && imgs[i].naturalWidth) {
        const g = canvas.getContext("2d");
        if (canvas.width !== imgs[i].naturalWidth) { canvas.width = imgs[i].naturalWidth; canvas.height = imgs[i].naturalHeight; }
        g.clearRect(0, 0, canvas.width, canvas.height);
        g.drawImage(imgs[i], 0, 0);
      }
      el.dispatchEvent(new CustomEvent("fx:frame", { detail: { progress: p, index: i, frames } }));
    };
    const setPoints = (on) => points.forEach((p) => p.classList.toggle("is-on", on));
    if (reduce) {
      draw(1);
      setPoints(true);
      return () => setPoints(false);
    }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let out = false;
      ScrollTrigger.create({
        trigger: pinEl, scroller, start: "top top", end: `+=${dist}`, scrub: true, pin: true, anticipatePin: 1,
        onUpdate: (st) => { draw(Math.min(st.progress / end, 1)); if (!out) setPoints(st.progress > show); },
        onRefresh: (st) => draw(Math.min(st.progress / end, 1)),
      });
      if (stage) {
        gsap.fromTo(stage, { yPercent: rise, scale: zoom, autoAlpha: 0.5, filter: `blur(${blur}px)` }, {
          yPercent: 0, scale: 1, autoAlpha: 1, filter: "blur(0px)", ease,
          scrollTrigger: { trigger: el, scroller, start: "5% 80%", end: "top top", scrub: true },
        });
        const first = stage.firstElementChild;
        if (first) gsap.fromTo(first, { yPercent: 0 }, {
          yPercent: drift, ease: "power2.in",
          scrollTrigger: { trigger: el, scroller, start: "85% bottom", end: "bottom top", scrub: true, onUpdate: (st) => { out = st.progress > 0.75; if (out) setPoints(false); } },
        });
      }
      draw(0);
    });
    return () => { mm.revert(); setPoints(false); };
  });
})();
