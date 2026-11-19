(() => {
  // Original Brand initVideoScrub: a rounded diamond (851×810) window shows only its edge at 35vh from the bottom of the screen, then,
  // From when the panel head passes 25vh above the screen until the panel’s bottom touches the top of the screen, the size grows with no curve from min(max(width×.35,400), height×.55) → (width+height)×2.4.
  // Before that (panel head moves from screen bottom → 25vh up) the window rises from 50% below, following along, and the video inside is wound start to end over progress .04 → .65. Header text blurs over the first 8/72.
  const SVG = (w, h, k) => {
    const P = [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]];
    const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const t = k / Math.hypot(w / 2, h / 2);
    let d = "";
    P.forEach((c, i) => {
      const a = at(c, P[(i + 3) % 4], t), b = at(c, P[(i + 1) % 4], t);
      d += `${i ? "L" : "M"}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${c[0]} ${c[1]} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    });
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d='${d}Z' fill='currentColor'/></svg>`)}")`;
  };
  kfFx.register("diamond-window-scrub", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.gsap || !window.ScrollTrigger) return;
    const head = el.querySelector('[data-fx-part="head"]');
    const video = media.querySelector("video");
    const grow = +(options.grow ?? 2.4), peek = +(options.peek ?? 0.35), lag = +(options.lag ?? 25);
    const v0 = +(options["video-from"] ?? 0.04), v1 = +(options["video-to"] ?? 0.65);
    const AR = 810 / 851;
    const mask = SVG(851, 810, +(options.round ?? 70));
    Object.assign(media.style, { maskImage: mask, webkitMaskImage: mask, maskRepeat: "no-repeat", webkitMaskRepeat: "no-repeat" });
    const vw = () => (scroller ? scroller.clientWidth : innerWidth), vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const s0 = () => Math.min(Math.max(vw() * 0.35, 400), vh() * 0.55);
    const s1 = () => (vw() + vh()) * grow;
    const o = { p: 0 };
    const upd = () => {
      const size = s0() + (s1() - s0()) * o.p;
      media.style.maskSize = media.style.webkitMaskSize = `${size}px ${size * AR}px`;
      media.style.maskPosition = media.style.webkitMaskPosition = `center calc(70% + ${vh() * peek * (1 - o.p)}px)`;
    };
    const clean = () => { ["maskImage", "webkitMaskImage", "maskSize", "webkitMaskSize", "maskPosition", "webkitMaskPosition", "maskRepeat", "webkitMaskRepeat"].forEach((k) => (media.style[k] = "")); };
    if (video) video.pause();
    if (reduce) { o.p = 1; upd(); return clean; }
    upd();
    const tw = gsap.fromTo(media, { yPercent: 50 }, { yPercent: 0, ease: "none", scrollTrigger: { scroller, trigger: el, start: "top bottom", end: () => `top top-=${vh() * lag / 100}`, scrub: true } });
    const tl = gsap.timeline({
      scrollTrigger: {
        scroller, trigger: el, start: () => `top top-=${vh() * lag / 100}`, end: options.end || "bottom top", scrub: true, onRefresh: upd,
        onUpdate(self) {
          if (!video || video.readyState < 1) return;
          const vp = gsap.utils.clamp(0, 1, (self.progress - v0) / (v1 - v0));
          video.currentTime = Math.min(vp * video.duration, video.duration - 0.01);
        },
      },
    });
    tl.to(o, { p: 1, duration: 12, ease: "none", onUpdate: upd }, 0);
    if (head) tl.to(head, { opacity: 0, duration: 8, ease: "none" }, 0);
    tl.to({}, { duration: 72 - 12 }, 12);
    return () => { tw.scrollTrigger?.kill(); tw.kill(); tl.scrollTrigger?.kill(); tl.kill(); gsap.set([media, head].filter(Boolean), { clearProps: "transform,opacity" }); clean(); };
  });
})();
