(() => {
  // Original site #pageHeaderLogoLarge: while the large wordmark floating in the screen center (min(640px, 80vw)) moves down half the screen height from the top,
  // Bound to scroll (no curve), it shrinks upward into the logo spot at header center (15px from the top, 240px wide). Progress is exported as --fx-dock so the header menu opens a gap in the center.
  // When fully shrunk, the large wordmark hides and the small logo in the header slot turns on — reversed when scrolling back up.
  kfFx.register("logo-dock-scrub", (el, { options, reduce, scroller }) => {
    const mark = el.querySelector('[data-fx-part="mark"]'), slot = el.querySelector('[data-fx-part="slot"]');
    if (!mark || !slot || !window.gsap || !window.ScrollTrigger) return;
    const top = +(options.top ?? 15), dist = +(options.dist ?? 0.5);
    const big = () => Math.min(+(options.max ?? 640), innerWidth * +(options.vw ?? 0.8));
    const small = () => slot.getBoundingClientRect().width || +(options.width ?? 240);
    const set = (p) => {
      el.style.setProperty("--fx-dock", String(p));
      mark.style.visibility = p >= 1 ? "hidden" : "";
      slot.style.visibility = p < 1 ? "hidden" : "";
    };
    if (reduce) { set(1); return () => { el.style.removeProperty("--fx-dock"); mark.style.visibility = ""; slot.style.visibility = ""; }; }
    if (options.at === "flow") {
      // at: flow — the big wordmark stays in document flow and only scales down around its top left. While scrolling at the top it moves down by wordmark top edge − slot top edge,
      // 1 → shrinks to slot width/wordmark width so the wordmark scrolled up lines up exactly with the header slot. When fully shrunk the wordmark goes transparent, the slot logo turns on, and the element gets is-docked (Brand Hero)
      const pos = () => (scroller ? scroller.scrollTop : scrollY);
      let ratio = 0;
      const measure = () => { ratio = 1 - small() / (mark.getBoundingClientRect().width / (+mark.style.scale || 1) || 1); };
      const dock = (p) => {
        el.style.setProperty("--fx-dock", String(p));
        mark.style.scale = String(1 - p * ratio);
        const on = p >= 1;
        mark.style.opacity = on ? "0" : "";
        slot.style.opacity = on ? "1" : "";
        slot.style.visibility = on ? "visible" : "";
        el.classList.toggle("is-docked", on);
      };
      if (reduce) { measure(); dock(0); return () => { el.style.removeProperty("--fx-dock"); mark.style.scale = ""; mark.style.opacity = ""; slot.style.opacity = ""; slot.style.visibility = ""; el.classList.remove("is-docked"); }; }
      mark.style.transformOrigin = "0 0";
      const flow = ScrollTrigger.create({
        ...(scroller && { scroller }), trigger: mark, start: 0, invalidateOnRefresh: true,
        end: () => "+=" + Math.max(1, mark.getBoundingClientRect().top + pos() - slot.getBoundingClientRect().top),
        onRefreshInit: () => { mark.style.scale = ""; },
        onRefresh: (s) => { measure(); dock(s.progress); },
        onUpdate: (s) => dock(s.progress),
      });
      measure(); dock(flow.progress);
      return () => { flow.kill(); el.style.removeProperty("--fx-dock"); mark.style.scale = ""; mark.style.transformOrigin = ""; mark.style.opacity = ""; slot.style.opacity = ""; slot.style.visibility = ""; el.classList.remove("is-docked"); };
    }
    // Original position: the big wordmark’s top edge sits above screen center by half the small logo’s height — so the big letters stand a little below center
    const ratio = () => (mark.offsetWidth || 1) / (mark.offsetHeight || 1);
    const st = { scroller, trigger: document.body, start: "top top", end: () => `+=${innerHeight * dist}`, scrub: true, invalidateOnRefresh: true, onUpdate: (s) => set(s.progress), onRefresh: (s) => set(s.progress) };
    let tw;
    if (options.at === "bottom") {
      // at: bottom — the large wordmark laid at the screen bottom (bottom px above it) rises and shrinks until its lower edge reaches the top px line from the top of the screen (frosted Hero)
      const floor = +(options.bottom ?? 20);
      gsap.set(mark, { position: "fixed", left: "50%", xPercent: -50, top: "auto" });
      tw = gsap.fromTo(mark, { width: big, bottom: floor }, { width: small, bottom: () => innerHeight - top, ease: "none", immediateRender: true, scrollTrigger: st });
    } else {
      gsap.set(mark, { position: "fixed", left: "50%", xPercent: -50, width: big });
      gsap.set(mark, { top: () => innerHeight / 2 - small() / ratio() / 2 });
      tw = gsap.to(mark, { top, width: small, ease: "none", scrollTrigger: st });
    }
    set(tw.scrollTrigger.progress);
    el.classList.add("is-ready");
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(mark, { clearProps: "all" }); el.style.removeProperty("--fx-dock"); mark.style.visibility = ""; slot.style.visibility = ""; el.classList.remove("is-ready"); };
  });
})();
