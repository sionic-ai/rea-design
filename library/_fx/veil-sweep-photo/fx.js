(() => {
  // Once when the photo cell’s top edge touches the screen center: the photo clears from 1.2x and 10px blur to its normal size (2), and two gray curtains covering the cell pivot on the right edge
  // Folds one after another (1 + 1, power3.in), and the top white panel goes transparent from the left (1.5) then the transparent edge is pushed out to the right (1.5). The whole thing runs at 2.1x speed
  kfFx.register("veil-sweep-photo", (el, { options, reduce, scroller }) => {
    const photo = el.querySelector("[data-fx-part=photo]");
    if (!photo || reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const speed = +options.speed || 2.1, zoom = +(options.zoom ?? 1.2), blur = +(options.blur ?? 10);
    const before = { position: el.style.position, overflow: el.style.overflow };
    el.style.overflow = "hidden";
    el.style.position = getComputedStyle(el).position === "absolute" ? "absolute" : "relative";
    const cover = (cls) => {
      const c = document.createElement("div");
      c.className = `fx-vsp ${cls}`;
      c.setAttribute("aria-hidden", "true");
      el.append(c);
      return c;
    };
    const lower = cover("fx-vsp--veil fx-vsp--b"), upper = cover("fx-vsp--veil"), sweep = cover("fx-vsp--sweep");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: options.start || "top center", scroller: scroller || undefined } }).timeScale(speed);
    tl.addLabel("start")
      .fromTo(photo, { scale: zoom, filter: `blur(${blur}px)` }, { scale: 1, filter: "blur(0px)", duration: 2, ease: "none" }, "start")
      .fromTo(sweep, { "--a": 0, "--b": 0 }, { "--b": 100, duration: 1.5, ease: "none" }, "start")
      .to(sweep, { "--a": 100, duration: 1.5, ease: "none" })
      .fromTo(upper, { scaleX: 1 }, { scaleX: 0, duration: 1, ease: "power3.in" }, "start")
      .fromTo(lower, { scaleX: 1 }, { scaleX: 0, duration: 1, ease: "power3.in" }, "start+=1");
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      [lower, upper, sweep].forEach((c) => c.remove());
      gsap.set(photo, { clearProps: "transform,filter" });
      el.style.position = before.position;
      el.style.overflow = before.overflow;
    };
  });
})();
