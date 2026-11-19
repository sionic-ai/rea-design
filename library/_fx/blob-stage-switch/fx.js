// A color-blob panel fixed behind the screen. When a section (data-blob-scene) crosses the screen’s center line, the panel’s data-scene becomes that name,
// Block position and size are set by the consumer’s CSS ([data-scene=Name] [data-fx-part=blob]) decides — the path it travels is a single transition in fx.css.
// enter: with fly, the blob flies in from the off-screen data-from position at 0 scale · .5 transparent and settles (loader). wait: when true, it waits until fx:enter is fired on the panel.
(() => {
  kfFx.register("blob-stage-switch", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const blobs = [...el.querySelectorAll('[data-fx-part="blob"]')];
    const attr = options.attr || "data-blob-scene", prefix = options.body || "";
    const set = (name) => {
      el.setAttribute("data-scene", name);
      if (!prefix) return;
      document.body.classList.forEach((c) => c.startsWith(prefix) && document.body.classList.remove(c));
      document.body.classList.add(prefix + name);
    };
    const triggers = [...document.querySelectorAll(`[${attr}]`)].map((sec) => ScrollTrigger.create({
      trigger: sec, start: options.start || "top center", end: options.end || "bottom center", ...(scroller && { scroller }),
      onEnter: () => set(sec.getAttribute(attr)), onEnterBack: () => set(sec.getAttribute(attr)),
    }));

    let tl = null;
    const done = () => el.dispatchEvent(new CustomEvent("fx:entered"));
    const fly = () => {
      tl?.kill();
      if (reduce || !blobs.length) { gsap.set(blobs, { opacity: 1, scale: 1, x: 0, y: 0 }); done(); return; }
      const dur = +(options.dur ?? 3), ease = kfFx.ease(options.ease || "0.455,0.03,0.515,0.955", "power1.inOut");
      tl = gsap.timeline({ defaults: { ease, duration: dur }, onComplete: done });
      blobs.forEach((b, i) => {
        tl.to(b, { scale: 1, opacity: 1, x: 0, y: 0 }, +(b.dataset.at ?? i * 0.5));
      });
    };
    if (options.enter === "fly") {
      if (!reduce) blobs.forEach((b) => {
        const [fx = 0, fy = 0] = (b.dataset.from || "").split(/[\s,]+/).map(Number);
        gsap.set(b, { opacity: 0.5, scale: 0, x: fx * innerWidth, y: fy * innerHeight });
      });
      if (options.wait === "true") el.addEventListener("fx:enter", fly);
      else fly();
    }
    return () => {
      triggers.forEach((t) => t.kill()); tl?.kill();
      el.removeEventListener("fx:enter", fly);
      el.removeAttribute("data-scene");
      const left = blobs.filter((b) => b.isConnected);
      if (left.length) gsap.set(left, { clearProps: "opacity,transform" });
    };
  });
})();
