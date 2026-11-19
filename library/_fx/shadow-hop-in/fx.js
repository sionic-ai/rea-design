(() => {
  // velocity 1.x spring curve — overshoots at the end and settles after a couple of wobbles
  const spring = (p) => 1 - Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6);
  kfFx.register("shadow-hop-in", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const shs = items.map((it) => it.querySelector('[data-fx-part="shadow"]')).filter(Boolean);
    const pics = items.map((it) => it.querySelector('[data-fx-part="pic"]')).filter(Boolean);
    if (reduce || !window.ScrollTrigger) { gsap.set([...shs, ...pics], { opacity: 1 }); return () => gsap.set([...shs, ...pics], { clearProps: "opacity" }); }
    gsap.registerPlugin(ScrollTrigger);
    const each = +(options.each ?? 0.15), grow = +(options.grow ?? 0.6), settle = +(options.settle ?? 0.8);
    const picDelay = +(options["pic-delay"] ?? 0.8), picEach = +(options["pic-each"] ?? 0.2), lift = +(options.lift ?? 8);
    const up = +(options.up ?? 0.2), down = +(options.down ?? 0.6), over = +(options.over ?? 1.1);
    const inQuad = kfFx.ease("0.55,0.085,0.68,0.53", "power2.in"), outQuad = kfFx.ease("0.25,0.46,0.45,0.94", "power2.out"), inOutQuad = kfFx.ease("0.455,0.03,0.515,0.955", "power2.inOut");
    gsap.set(shs, { scaleX: 0, scaleY: 0, opacity: 1 });
    gsap.set(pics, { opacity: 0 });
    const tls = [];
    // The shadow first spreads from 0 to over times its width, then settles at 1x with a spring, after which the images lift by lift in turn and settle back down
    const play = () => {
      shs.forEach((s, i) => tls.push(gsap.timeline({ delay: i * each }).to(s, { scaleX: over, scaleY: 1, duration: grow, ease: inQuad }).to(s, { scaleX: 1, duration: settle, ease: spring })));
      pics.forEach((p, i) => tls.push(gsap.timeline({ delay: picDelay + i * picEach }).to(p, { opacity: 1, y: -lift, duration: up, ease: i ? outQuad : inOutQuad }).to(p, { y: 0, duration: down, ease: inOutQuad })));
    };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top bottom-=400", once: true, onEnter: play });
    return () => {
      st.kill();
      tls.forEach((t) => t.kill());
      gsap.set([...shs, ...pics], { clearProps: "transform,opacity" });
    };
  });
})();
