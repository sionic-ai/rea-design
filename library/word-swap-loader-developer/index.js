// Home — business tabs (old text exits upward → new text rises after .8s, photo opens from below), project card scroll video (frame stepping), mission title gap opening
(() => {
  const LV = window.LV;
  const qa = (s, r) => [...r.querySelectorAll(s)];

  // Original initTabsParts
  LV.tabs = (root) => {
    qa("[data-tabs]", root).forEach((box) => {
      const trig = qa("[data-tab-trigger]", box);
      let cur = 0, busy = false;
      const items = (i) => qa(`[data-tab-content="${i}"]`, box);
      const parts = (i, k) => items(i).flatMap((c) => qa(`[data-tab="${k}"]`, c).concat(c.matches(`[data-tab="${k}"]`) ? [c] : []));
      trig.forEach((t, i) => t.addEventListener("click", () => {
        if (i === cur || busy) return;
        busy = true;
        const was = cur;
        cur = i;
        trig[was].classList.remove("is-active");
        t.classList.add("is-active");
        items(i).forEach((c) => { c.classList.add("is-active"); gsap.set(c, { position: "relative", zIndex: 1 }); });
        items(was).forEach((c) => gsap.set(c, { position: "absolute", inset: 0, zIndex: 0 }));
        LV.textH(parts(i, "h"), "initial"); LV.textP(parts(i, "p"), "initial"); LV.ctn(parts(i, "ctn"), "initial");
        gsap.timeline({ onComplete: () => (busy = false) })
          .add(() => {
            LV.textH(parts(was, "h"), "hide", 0); LV.textP(parts(was, "p"), "hide", 0); LV.ctn(parts(was, "ctn"), "hide", 0);
            LV.slide(parts(was, "slide"), "hide", 0); LV.slide(parts(i, "slide"), "reveal", 0);
          })
          .to({}, { duration: LV.durM })
          .add(() => { LV.textH(parts(i, "h"), "reveal", 0); LV.textP(parts(i, "p"), "reveal", 0); LV.ctn(parts(i, "ctn"), "reveal", 0); })
          .to({}, { duration: LV.durS })
          .add(() => items(was).forEach((c) => { c.classList.remove("is-active"); gsap.set(c, { clearProps: "position,inset,zIndex" }); }));
      }));
    });
  };

  // Original ActiveFrame — advances the video frames from when the card touches 25% of the screen until its end passes 75% (scrub 1).
  // Instead of video, a placeholder scene of the same length (frame count) is drawn on canvas: sky band, eave horizon, approaching pillars
  LV.scrubVideos = (root) => {
    const col = (v) => (v.startsWith("--kf-font") ? getComputedStyle(document.documentElement).getPropertyValue(v) : LV.color(v));
    qa("[data-scrub-video]", root).forEach((box, n) => {
      const cv = box.querySelector("canvas"), ctx = cv.getContext("2d"), frames = +box.dataset.frames || 120;
      const draw = (f) => {
        const w = (cv.width = cv.clientWidth * Math.min(devicePixelRatio, 2)), h = (cv.height = cv.clientHeight * Math.min(devicePixelRatio, 2));
        const t = f / (frames - 1);
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, col("--site-sun")); g.addColorStop(0.55, col("--site-photo-a")); g.addColorStop(1, col("--site-photo-b"));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = col("--site-photo-b");
        const eave = h * (0.18 + 0.1 * t);
        ctx.fillRect(0, eave - h * 0.04, w, h * 0.04);
        for (let i = 0; i < 9; i++) {
          const x = ((i / 8 - 0.5) * (1 + t * (1.2 + n * 0.2)) + 0.5) * w, cw = w * 0.012 * (1 + t * 2);
          ctx.fillRect(x - cw / 2, eave, cw, h - eave);
        }
        ctx.fillStyle = col("--site-cream-10");
        ctx.fillRect(0, h * (0.78 - 0.08 * t), w, h);
        ctx.fillStyle = col("--site-cream-50");
        ctx.font = `${Math.round(h * 0.018)}px ${col("--kf-font-sans")}`;
        ctx.fillText(`Frame ${String(f + 1).padStart(3, "0")} / ${frames}`, w * 0.012, h * 0.04);
      };
      draw(0);
      const ro = new ResizeObserver(() => draw(box._f || 0));
      ro.observe(cv);
      if (LV.reduce) return;
      LV.matchMedia.add("(min-width: 992px)", () => {
        ScrollTrigger.create({ trigger: box, start: "top 25%", end: "bottom 75%", scrub: 1, onUpdate: (s) => { const f = Math.round(s.progress * (frames - 1)); if (f !== box._f) { box._f = f; draw(f); } } });
      });
    });
  };

  LV.pages.home = (root) => {
    LV.tabs(root);
    LV.scrubVideos(root);
    const off = root.querySelector(".mt-off");
    if (off && !LV.reduce) gsap.from(off, { width: 0, ease: "InOut", duration: LV.durL, delay: 0.3, scrollTrigger: { trigger: off, start: "top bottom" } });
    const sk = LV.sketch?.(root);
    return () => sk?.();
  };
})();
