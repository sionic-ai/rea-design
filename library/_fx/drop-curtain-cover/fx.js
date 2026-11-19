// Curtain covering from above: the previous section (immediate sibling) is pinned at its fully read position, and for one screen while this section rises from below, the inner photo and Frame stay above the screen height
// Comes down (photo 1.06 → 1) and appears to stay still on screen while covering the previous section. The inside of the previous section is pushed up by −25% — Brand full-photo sections
(() => {
  kfFx.register("drop-curtain-cover", (el, { options, reduce, scroller }) => {
    if (reduce || !matchMedia(`(min-width: ${options.min || 1025}px)`).matches) return;
    const q = (p) => [...el.querySelectorAll(`[data-fx-part="${p}"]`)];
    const media = q("media"), frame = q("frame");
    if (!media.length && !frame.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const under = options.under ? document.querySelector(options.under) : el.previousElementSibling;
    const pushTarget = under && (under.querySelector('[data-fx-part="pushed"]') || under.firstElementChild || under);
    const push = +(options.push ?? -25), from = +(options.scale ?? 1.06);
    const docTop = (n) => { let y = 0; for (; n; n = n.offsetParent) y += n.offsetTop; return y; };
    const sts = [];
    gsap.set(el, { position: "relative", zIndex: +(options.z ?? 2), overflow: "hidden" });
    if (under) {
      sts.push(ScrollTrigger.create({
        trigger: under, ...(scroller && { scroller }),
        start: () => docTop(under) + Math.max(under.offsetHeight - innerHeight, 0),
        end: () => docTop(el), pin: true, pinSpacing: false, invalidateOnRefresh: true,
      }));
    }
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
    if (media.length) tl.fromTo(media, { y: () => -innerHeight, scale: from }, { y: 0, scale: 1, ease: "none", duration: 1 }, 0);
    if (frame.length) tl.fromTo(frame, { y: () => -innerHeight }, { y: 0, ease: "none", duration: 1 }, 0);
    if (pushTarget && push) tl.fromTo(pushTarget, { yPercent: 0 }, { yPercent: push, ease: "none", duration: 1 }, 0);
    sts.push(tl.scrollTrigger);
    return () => {
      sts.forEach((s) => s?.kill(true));
      tl.kill();
      gsap.set([el, ...media, ...frame, pushTarget].filter(Boolean), { clearProps: "transform,position,zIndex,overflow" });
    };
  });
})();
