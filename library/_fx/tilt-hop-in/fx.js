// One picture pops upright from the bottom right, slightly tilted — when entering the screen, right on open, or on receiving fx:play (the pictures when a drawer opens)
(() => {
  kfFx.register("tilt-hop-in", (el, { options, reduce, scroller }) => {
    const marked = el.querySelectorAll('[data-fx-part="item"]');
    const items = marked.length ? [...marked] : [el];
    const range = (s, d) => String(s ?? d).split(",").map(Number);
    const [y0, y1] = range(options.y, "30,40"), [x0, x1] = range(options.x, "13,18"), [r0, r1] = range(options.rot, "0.025,0.05");
    const dur = +(options.dur ?? 0.75), each = +(options.stagger ?? 0.05), delay = +(options.delay ?? 0);
    // Original random: y is um(a~b), x · tilt are mm (flips the sign of a with even odds — mm(13, 18) → 13~18 or −13~−8)
    const um = (a, b) => Math.random() * (b - a) + a;
    const mm = (a, b) => Math.random() * (b - a) + a * (Math.random() < 0.5 ? -1 : 1);
    let st = null;
    if (reduce) return;
    gsap.set(items, { opacity: 0, transformOrigin: "50% 100%" });
    // Original Wm: y 30~40 · x 13~18 · tilt .025~.05π over .75s — height and tilt use back.out(8), sideways power2.out, opacity uses .4 of the length with expo.out
    const play = () => items.forEach((it, i) => {
      const at = delay + each * i;
      gsap.killTweensOf(it);
      gsap.fromTo(it, { y: Math.round(um(y0, y1)), rotation: mm(r0, r1) * 180 }, { y: 0, rotation: 0, duration: dur, delay: at, ease: "back.out(8)" });
      gsap.fromTo(it, { x: mm(x0, x1) }, { x: 0, duration: dur, delay: at, ease: "power2.out" });
      gsap.fromTo(it, { opacity: 0 }, { opacity: 1, duration: dur * 0.4, delay: at, ease: "expo.out" });
    });
    if (options.on === "load") play();
    else if (options.on === "event") el.addEventListener("fx:play", play);
    else st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 90%", once: true, onEnter: play });
    return () => {
      if (st) st.kill();
      el.removeEventListener("fx:play", play);
      gsap.killTweensOf(items);
      gsap.set(items, { clearProps: "transform,opacity" });
    };
  });
})();
