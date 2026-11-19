// When the group (element) enters the margin band inside the screen, the cells within float up, each delayed by its number (data-key) × step.
// Numbers follow the order the original set, not document order — photos come before text and video comes last, mixed together (original lazysizes ls_anm_grp).
(() => {
  kfFx.register("group-step-rise", (el, { options, scroller }) => {
    // If the same part group exists further inside (like vertical-writing letters), that cell belongs to the inner group
    const items = [...el.querySelectorAll("[data-fx-part=item]")].filter((it) => it.parentElement.closest('[data-fx~="group-step-rise"]') === el);
    if (!items.length) return;
    const step = +(options.step ?? 0.5), dur = +(options.dur ?? 1), margin = +(options.margin ?? 100);
    const ease = kfFx.ease(options.ease || "0.39,0.58,0.57,1", "sine.inOut");
    // y in rem uses the html font size — the original .5rem is 7~8px at each window width
    const yRaw = String(options.y ?? "0.5rem").trim();
    const yPx = () => (yRaw.endsWith("rem") ? parseFloat(yRaw) * parseFloat(getComputedStyle(document.documentElement).fontSize) : parseFloat(yRaw) || 0);
    // wait: scroll — appears only after the first scroll happens (original is-1st-scrolled). With none, it appears right on entry
    const wait = (options.wait || "scroll") === "scroll";
    const host = options.host ? el.closest(options.host) || el : el;
    const view = scroller || window;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(items, { opacity: 0, y: yPx() });
      let inView = false, scrolled = !wait || (scroller ? scroller.scrollTop : scrollY) > 0, done = false;
      const play = () => {
        if (done || !inView || !scrolled) return;
        done = true;
        items.forEach((it, i) => {
          const k = it.dataset.key != null ? +it.dataset.key : i;
          gsap.to(it, { opacity: 1, y: 0, duration: dur, ease, delay: k * step });
        });
        stop();
      };
      const io = new IntersectionObserver((es) => { inView = es.some((e) => e.isIntersecting); play(); }, { root: scroller || null, rootMargin: `-${margin}px 0px -${margin}px 0px` });
      io.observe(host);
      const onScroll = () => { scrolled = true; play(); };
      if (!scrolled) view.addEventListener("scroll", onScroll, { passive: true });
      const stop = () => { io.disconnect(); view.removeEventListener("scroll", onScroll); };
      return () => { stop(); gsap.killTweensOf(items); gsap.set(items, { clearProps: "opacity,transform" }); };
    });
    return () => mm.revert();
  });
})();
