// A swarm of picture pieces hides at the bottom right, tilted heavily, then springs into place — each piece wobbles differently so the picture comes alive ‹piece by piece›
(() => {
  kfFx.register("scatter-pop-pieces", (el, { options, reduce, scroller }) => {
    const marked = el.querySelectorAll('[data-fx-part="piece"]');
    const pieces = marked.length ? [...marked] : [...el.children];
    if (!pieces.length || reduce) return;
    const dur = +(options.dur ?? 2.25), each = +(options.stagger ?? 0.015), delay = +(options.delay ?? 0);
    // Original random: um is a~b, mm flips the sign of a with even odds (mm(10, 30) → 10~30 or −10~10)
    const um = (a, b) => Math.random() * (b - a) + a;
    const mm = (a, b) => Math.random() * (b - a) + a * (Math.random() < 0.5 ? -1 : 1);
    let tl = null, st = null;
    gsap.set(pieces, { opacity: 0, transformOrigin: "50% 100%" });
    // Original qP.show: per group picks x 10~30 · y 80~100 and adds 5~10 per piece. Tilt goes from .3~.5π (+.01~.02π) per piece down to 0
    const play = () => {
      const gx = mm(10, 30), gy = Math.round(um(80, 100));
      tl = gsap.timeline();
      pieces.forEach((p, i) => {
        const at = delay + each * i;
        tl.fromTo(p, { y: gy + mm(5, 10) }, { y: 0, duration: dur, ease: "elastic.out(4, 0.75)" }, at)
          .fromTo(p, { x: gx + mm(5, 10) }, { x: 0, duration: dur, ease: "power4.out" }, at)
          .fromTo(p, { rotation: (mm(0.3, 0.5) + mm(0.01, 0.02)) * 180 }, { rotation: 0, duration: dur, ease: "elastic.out(1, 1)" }, at)
          .fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "expo.out" }, at);
      });
    };
    if (options.on === "load") play();
    else st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: play });
    return () => {
      if (st) st.kill();
      if (tl) tl.kill();
      gsap.set(pieces, { clearProps: "transform,opacity" });
    };
  });
})();
