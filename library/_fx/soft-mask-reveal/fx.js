(() => {
  kfFx.register("soft-mask-reveal", (el, { options, reduce, scroller }) => {
    const done = () => { el.classList.remove("is-fx-in"); el.classList.add("is-fx-done"); };
    if (reduce) { done(); return () => el.classList.remove("is-fx-done"); }
    // The original runs 2s for the seep type (Hotel A) and the diagonal type (Cafe B), 4.5s for the wave type (Site C), 3s for the corner type (Site D) and 1.8s for the cloud type (Site E), so default lengths differ
    const look = options.look || "";
    // Slash type (Brand) takes 1s
    // half type (brand) is 2.5 seconds
    el.style.setProperty("--fx-dur", +(options.dur ?? (/half/.test(look) ? 2.5 : /slash/.test(look) ? 1 : /seep|diagonal|band/.test(look) ? 2 : /grow/.test(look) ? 3.4 : /wave/.test(look) ? 4.5 : /corner/.test(look) ? 3 : /cloud/.test(look) ? 1.8 : /rise/.test(look) ? 3.2 : /ink/.test(look) ? 5 : 4)) + "s");
    el.style.setProperty("--fx-delay", +(options.delay ?? 0) + "s");
    // End size and curve of the round type (Brand 300% · ease)
    if (options.to) el.style.setProperty("--fx-to", /%$/.test(options.to) ? options.to : `${+options.to}%`);
    if (options.ease) el.style.setProperty("--fx-ease", /^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    const margin = +(options.margin ?? 20);
    // offset is px from the bottom of the screen — for sites measured in px, like “when the top of the element rises 100px above the screen bottom”
    const bottom = options.offset != null ? `-${+options.offset}px` : `-${margin}%`;
    const root = scroller && scroller !== window ? scroller : null;
    const play = () => { el.classList.remove("is-fx-done", "is-fx-in"); void el.offsetWidth; el.classList.add("is-fx-in"); };
    el.addEventListener("fx:play", play);
    // back: true — when it exits the bottom of the screen again (scrolling back up) it returns to its initial form so it spreads again next time (Brand)
    // back: both — when fully off screen either upward or downward, returns to the initial form (Brand: removes fadein on onLeave · onLeaveBack)
    const back = options.back === "true" || options.back === "both";
    // at: center — spreads when the element’s center touches the bottom of the screen (Brand: start "50% bottom"). margin·offset are not used
    const center = options.at === "center";
    const steps = center ? Array.from({ length: 21 }, (_, i) => i / 20) : 0;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      if (center) {
        const rb = e.rootBounds ? e.rootBounds.bottom : innerHeight, r = e.boundingClientRect;
        if (r.top + r.height / 2 > rb) return;
      }
      el.classList.add("is-fx-in");
      if (!back) io.disconnect();
    }), { root, rootMargin: center ? "0px" : `0px 0px ${bottom} 0px`, threshold: steps });
    const out = back ? new IntersectionObserver(([e]) => { if (!e.isIntersecting && (options.back === "both" || e.boundingClientRect.top > 0)) el.classList.remove("is-fx-in", "is-fx-done"); }, { root }) : null;
    if (options.on !== "manual") { io.observe(el); out?.observe(el); }
    const end = (e) => { if (e.target === el && /fx-soft-mask/.test(e.animationName)) done(); };
    el.addEventListener("animationend", end);
    return () => {
      io.disconnect();
      out?.disconnect();
      el.removeEventListener("fx:play", play);
      el.removeEventListener("animationend", end);
      el.classList.remove("is-fx-in", "is-fx-done");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-delay");
      el.style.removeProperty("--fx-to");
      el.style.removeProperty("--fx-ease");
    };
  });
})();
