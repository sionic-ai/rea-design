(() => {
  // Divide the long span equally by the number of photos and pin only the current slot’s photo on screen — on entry it fades in over .5s while shrinking from 1.1 to 1, and when leaving the slot it turns off the same way.
  kfFx.register("slice-photo-stack", (el, { options, reduce, scroller }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length || !window.ScrollTrigger) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.5), zoom = reduce ? 1 : +(options.zoom ?? 1.1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const n = photos.length;
    const made = photos.map((photo, i) => {
      const img = photo.querySelector('[data-fx-part="image"]');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: `${(i * 100) / n}% top+=1`, end: `${((i + 1) * 100) / n}% top+=1`, toggleActions: "play reverse play reverse" },
      });
      tl.fromTo(photo, { opacity: 0 }, { opacity: 1, duration: dur, ease }, 0);
      if (img) tl.fromTo(img, { scale: zoom }, { scale: 1, duration: dur, ease }, 0);
      return { tl, photo, img };
    });
    return () => made.forEach(({ tl, photo, img }) => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([photo, img].filter(Boolean), { clearProps: "opacity,scale,transform" });
    });
  });
})();
