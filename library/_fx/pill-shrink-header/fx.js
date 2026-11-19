(() => {
  // At the very top the header bar spread to nearly the window width (99vw), and once scrolled past at px it becomes the center pill width (60rem, 16rem below 1024)
  // Pill (is-pill) settles in, shrinking, with .6s power4.out. The original re-creates the same tween on every scroll event — here only when the state or the width step changes.
  kfFx.register("pill-shrink-header", (el, { options, reduce, scroller }) => {
    const box = scroller || window, top = () => (scroller ? scroller.scrollTop : scrollY);
    const at = +(options.at ?? 10), dur = reduce ? 0 : +(options.dur ?? 0.6), bp = +(options.bp ?? 1024);
    const wide = options.wide || "99vw", narrow = options.narrow || "60rem", narrowSp = options["narrow-sp"] || "16rem";
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    // If hide is given, while scrolling down past it the header row is pulled up (lift px · lift-sp px below bp), and it comes back down at the slightest upward scroll — original 1s cubic-bezier(.135,.9,.15,1)
    const hide = +(options.hide ?? 0), lift = +(options.lift ?? 112), liftSp = +(options["lift-sp"] ?? 64);
    const hideEase = kfFx.ease(options["hide-ease"] || "0.135,0.9,0.15,1", "expo.out"), hideDur = reduce ? 0 : +(options["hide-dur"] ?? 1);
    let state = null, prevY = top(), tucked = false;
    const tuck = () => {
      if (!hide) return;
      const y = top(), down = y > prevY;
      if (y !== prevY) {
        const want = down && y > hide;
        if (want !== tucked) {
          tucked = want;
          el.classList.toggle("is-tucked", want);
          gsap.to(el, { y: want ? -(innerWidth < bp ? liftSp : lift) : 0, duration: hideDur, ease: hideEase, overwrite: false });
        }
      }
      prevY = y;
    };
    const target = () => (top() > at ? (innerWidth < bp ? narrowSp : narrow) : wide);
    const update = (force) => {
      const s = top() > at ? "pill" : "wide";
      const w = target();
      if (!force && s === state && el.dataset.fxW === w) return;
      state = s; el.dataset.fxW = w;
      el.classList.toggle("is-pill", s === "pill");
      gsap.to(el, { width: w, duration: dur, ease, overwrite: "auto" });
    };
    gsap.set(el, { width: target() });
    state = top() > at ? "pill" : "wide";
    el.classList.toggle("is-pill", state === "pill");
    el.dataset.fxW = target();
    const onScroll = () => { update(false); tuck(); };
    const onResize = () => update(true);
    box.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      box.removeEventListener("scroll", onScroll); removeEventListener("resize", onResize);
      el.classList.remove("is-pill", "is-tucked"); delete el.dataset.fxW; gsap.set(el, { clearProps: "width,transform" });
    };
  });
})();
