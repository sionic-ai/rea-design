// An Embla carousel (loop) + AutoScroll plugin make the strip flow on its own. Dragging by hand pushes it with Embla’s drag as is, and by default, like the original, it stops afterward (stopOnInteraction).
// If the strip content is shorter than the panel, the loop won’t hold, so clone children until it reaches 2.2 times the panel width (clones are aria-hidden and removed on detach)
(() => {
  kfFx.register("embla-auto-marquee", (el, { options, reduce }) => {
    if (typeof EmblaCarousel !== "function" || typeof EmblaCarouselAutoScroll !== "function") return;
    const track = el.querySelector("[data-fx-part=track]") || el.firstElementChild;
    if (!track || !track.children.length) return;
    const originals = [...track.children];
    const clones = [];
    let guard = 0;
    while (track.scrollWidth < el.clientWidth * 2.2 && guard++ < 12) {
      originals.forEach((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); track.append(k); clones.push(k); });
    }
    const api = EmblaCarousel(el, {
      loop: true,
      dragFree: options.free === "true",
      align: options.align || "start",
      skipSnaps: true,
      containScroll: "trimSnaps",
      watchDrag: options.drag !== "off",
      container: track
    }, [EmblaCarouselAutoScroll({
      speed: +(options.speed ?? 0.4),
      startDelay: +(options.delay ?? 0),
      direction: options.dir === "backward" ? "backward" : "forward",
      playOnInit: !reduce,
      stopOnInteraction: options.stop !== "none",
      stopOnMouseEnter: options.stop === "hover",
      stopOnFocusIn: options.stop !== "none"
    })]);
    return () => { api.destroy(); clones.forEach((k) => k.remove()); };
  });
})();
