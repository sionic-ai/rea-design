(() => {
  // Original (hero of a resort site): each background scene stays for one screen, then the next scene wipes up from below over one screen (scrub 1).
  // 150px ahead of where the wipe is halfway, the center photo and side text change with a 1.5s fade — photo and text are not tied to scroll, only their state changes
  kfFx.register("wipe-up-scenes", (el, { options, reduce, scroller }) => {
    const scenes = [...el.querySelectorAll('[data-fx-part="scene"]')];
    if (scenes.length < 2 || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const hold = +(options.hold ?? 1);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    const n = scenes.length;
    el.style.setProperty("--fx-screens", hold + (n - 1) * (1 + hold) + 1);
    photos.forEach((p, i) => p.classList.toggle("is-fx-off", i > 0));
    lines.forEach((l, i) => l.classList.toggle("is-fx-down", i > 0));
    const H = () => (scroller ? scroller.clientHeight : innerHeight);
    const wipeAt = (k) => (hold + (k - 1) * (1 + hold)) * H();

    const mm = gsap.matchMedia();
    const build = (swap) => {
      for (let k = 1; k < n; k++) {
        const scene = scenes[k];
        if (reduce) {
          ScrollTrigger.create({ trigger: el, scroller, start: () => `top+=${wipeAt(k) + H() / 2} top`, invalidateOnRefresh: true,
            onEnter: () => scene.style.setProperty("--fx-clip", "0%"), onLeaveBack: () => scene.style.setProperty("--fx-clip", "100%") });
        } else {
          gsap.fromTo(scene, { "--fx-clip": "100%" }, {
            "--fx-clip": "0%", ease: "none",
            scrollTrigger: { trigger: el, scroller, start: () => `top+=${wipeAt(k)} top`, end: () => `top+=${wipeAt(k) + H()} top`, scrub, invalidateOnRefresh: true },
          });
        }
        const photo = photos[k], prev = lines[k - 1], line = lines[k];
        if (!photo && !line) continue;
        ScrollTrigger.create({
          trigger: el, scroller, start: () => `top+=${wipeAt(k) + H() / 2 - swap} top`, invalidateOnRefresh: true,
          onEnter: () => { photo?.classList.remove("is-fx-off"); prev?.classList.remove("is-fx-down"); prev?.classList.add("is-fx-up"); line?.classList.remove("is-fx-down"); },
          onLeaveBack: () => { photo?.classList.add("is-fx-off"); prev?.classList.remove("is-fx-up"); line?.classList.add("is-fx-down"); },
        });
      }
    };
    const phone = +(options.phone ?? 991);
    mm.add(`(min-width: ${phone + 1}px)`, () => build(+(options.swap ?? 150)));
    mm.add(`(max-width: ${phone}px)`, () => build(+(options["phone-swap"] ?? options.swap ?? 150)));
    return () => {
      mm.revert();
      el.style.removeProperty("--fx-screens");
      scenes.forEach((s) => s.style.removeProperty("--fx-clip"));
      photos.forEach((p) => p.classList.remove("is-fx-off"));
      lines.forEach((l) => l.classList.remove("is-fx-up", "is-fx-down"));
    };
  });
})();
