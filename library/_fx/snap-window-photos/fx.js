// Cards pass over the stuck photo pile, switching on the paired photo, photos shrink while passing, and when it stops the card snaps to center
(() => {
  kfFx.register("snap-window-photos", (el, { options, reduce, scroller }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!photos.length || !cards.length) return;
    const links = [...el.querySelectorAll('[data-fx-part="link"]')];
    const keyOf = (n, i) => n.dataset.key ?? String(i + 1);
    const on = (key) => {
      photos.forEach((p, i) => p.classList.toggle("is-active", keyOf(p, i) === key));
      links.forEach((l, i) => l.classList.toggle("is-active", keyOf(l, i) === key));
    };
    on(keyOf(cards[0], 0));
    const triggers = [];
    const tweens = [];
    const zoom = +(options.zoom ?? 1.2);
    const snapOn = options.snap !== "off";
    const offset = +(options.offset ?? 0);
    cards.forEach((card, i) => {
      const key = keyOf(card, i);
      triggers.push(ScrollTrigger.create({ scroller, trigger: card, start: "top 75%", end: "bottom 25%", onEnter: () => on(key), onEnterBack: () => on(key) }));
      if (reduce) return;
      if (snapOn) triggers.push(ScrollTrigger.create({
        scroller, trigger: card, start: "top bottom", end: `bottom top+=${offset}px`,
        snap: { snapTo: (c) => (c > 0 && c < 1 ? 0.4999 : c), delay: +(options["snap-delay"] ?? 0.2), duration: { min: 0.2, max: 2 }, ease: "power3.inOut" },
      }));
      const photo = photos.find((p, j) => keyOf(p, j) === key);
      const img = photo && (photo.firstElementChild || photo);
      if (img && zoom !== 1) tweens.push(gsap.fromTo(img, { scale: zoom }, { scale: 1, ease: "none", scrollTrigger: { scroller, trigger: card, start: "top bottom", end: "bottom top", scrub: +(options.scrub ?? 0.5) } }));
    });
    const go = (e) => {
      const l = e.currentTarget;
      const card = cards.find((c, i) => keyOf(c, i) === keyOf(l, links.indexOf(l)));
      if (!card) return;
      e.preventDefault();
      card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    };
    links.forEach((l) => l.addEventListener("click", go));
    return () => {
      triggers.forEach((t) => t.kill());
      tweens.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.revert(); });
      links.forEach((l) => { l.removeEventListener("click", go); l.classList.remove("is-active"); });
      photos.forEach((p) => p.classList.remove("is-active"));
    };
  });
})();
