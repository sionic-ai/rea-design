// Hero: white-bordered photos stack one by one at the panel center — the first rises from 100px below at -8° over lead seconds (default 1.2) easeOutQuart, and
// The others land in staggered left-right spots (up 120→50px · sides ±200→60px, proportional to a 470px panel width) and ±tilt°, at intervals of each s (default .18), easing dur (default .7) easeOutCubic.
// Then the last section (last) rises from 60px below with .2s easeInQuart · rise seconds (default 1) easeOutQuart and fills the panel in grow seconds (default .8) easeOutQuart,
// The border disappears in .2s — fx:open when filling starts, fx:done when filled. Brand hero (original Velocity values as is)
(() => {
  kfFx.register("photo-pile-open", (el, { options, reduce }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const last = el.querySelector('[data-fx-part="last"]');
    const pile = el.querySelector('[data-fx-part="pile"]');
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    if (!photos.length && !last) return;
    const finish = () => {
      if (pile) gsap.set(pile, { opacity: 0 });
      if (last) gsap.set(last, { opacity: 1, width: "100%", height: "100%", y: 0, borderWidth: 0 });
    };
    if (reduce) {
      finish();
      const t = setTimeout(() => { fire("fx:open"); fire("fx:done"); }, 0);
      return () => { clearTimeout(t); gsap.set([pile, last].filter(Boolean), { clearProps: "all" }); };
    }
    const out = kfFx.ease("0.165,0.84,0.44,1", "power3.out"), cubic = kfFx.ease("0.215,0.61,0.355,1", "power2.out"), inq = kfFx.ease("0.895,0.03,0.685,0.22", "power4.in");
    const delay = +(options.delay ?? 0.3), lead = +(options.lead ?? 1.2), each = +(options.each ?? 0.18), dur = +(options.dur ?? 0.7);
    const rise = +(options.rise ?? 1), grow = +(options.grow ?? 0.8), tilt = +(options.tilt ?? 5), spread = +(options.spread ?? 1);
    const k = (pile ? pile.offsetWidth : el.offsetWidth) / 470 || 1;
    const tl = gsap.timeline({ delay });
    if (photos[0]) tl.fromTo(photos[0], { opacity: 0, y: 100 * k, rotation: -8 }, { opacity: 1, y: 0, rotation: 0, duration: lead, ease: out });
    const start = tl.duration();
    photos.slice(1).forEach((p, i) => {
      const side = i % 2 ? 1 : -1;
      const x = side * Math.max(60, 200 - 20 * i) * spread * k, y = Math.max(50, 120 - 10 * i) * spread * k;
      gsap.set(p, { opacity: 0 });
      tl.to(p, { opacity: 1, duration: 0.25, ease: cubic }, start + i * each);
      tl.fromTo(p, { x, y, rotation: side * tilt }, { x: 0, y: 0, rotation: 0, duration: dur, ease: cubic }, start + i * each);
    });
    if (last) {
      const at = start + each * 7.5;
      gsap.set(last, { opacity: 0, y: 60 * k });
      tl.to(last, { opacity: 1, y: 30 * k, duration: 0.2, ease: inq }, at)
        .to(last, { y: 0, duration: rise, ease: out })
        .add(() => fire("fx:open"))
        .add(() => pile && gsap.set(pile, { opacity: 0 }))
        .to(last, { width: "100%", height: "100%", duration: grow, ease: out })
        .to(last, { borderWidth: 0, duration: 0.2, ease: out }, "<")
        .add(() => fire("fx:done"));
    } else tl.add(() => { fire("fx:open"); fire("fx:done"); });
    return () => { tl.kill(); gsap.set([...photos, pile, last].filter(Boolean), { clearProps: "all" }); };
  });
})();
