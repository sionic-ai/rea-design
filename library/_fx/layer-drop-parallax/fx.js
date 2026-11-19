// Layer i starts gaps[i] after the previous layer started (original '<+=' chain). The text enters after all layers are in place
(() => {
  kfFx.register("layer-drop-parallax", (el, { options, reduce }) => {
    const layers = [...el.querySelectorAll("[data-fx-part=layer]")];
    if (!layers.length) return;
    const words = [...el.querySelectorAll("[data-fx-part=word]")];
    const list = (v, d) => String(v ?? d).split(",").map((x) => +x);
    const at = (a, i) => a[Math.min(i, a.length - 1)];
    if (reduce) return;
    const durs = list(options.durs, "1.3,1.2,1.1,1"), gaps = list(options.gaps, ".3,.08,.16,.24");
    const from = +(options.from ?? 3), each = +(options.each ?? 0.08), delay = +(options.delay ?? 0.4), y = +(options.y ?? 200);
    const rise = options.rise || "8rem";
    let timer, play, mm;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set(layers, { opacity: 0 });
      if (words.length) gsap.set(words, { y: rise, opacity: 0 });
      const tl = gsap.timeline({ paused: true, onComplete: () => words.length && gsap.to(words, { y: 0, opacity: 1, stagger: each, delay: 0.05, duration: 0.5, ease: "power2.out" }) });
      layers.forEach((L, i) => {
        tl.fromTo(L, { scale: from }, { scale: 1, duration: at(durs, i), ease: "power2.out" }, `<+=${at(gaps, i)}`)
          .fromTo(L, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.inOut" }, "<");
      });
      play = () => { timer = setTimeout(() => tl.play(), delay * 1000); };
      mm = gsap.matchMedia();
      mm.add({ sp: "(max-width: 767px)", pc: "(min-width: 768px)" }, (c) => {
        const rates = list(c.conditions.sp ? options["rates-sp"] : options.rates, c.conditions.sp ? "1.3,1.1,.8,.3" : ".9,.8,.5,.1");
        const st = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: +(options.scrub ?? 0.2) } });
        layers.forEach((L, i) => st.to(L, { y: y * at(rates, i), ease: "power1.out" }, 0));
      });
    }, el);
    if (document.readyState === "complete") play();
    else addEventListener("load", play, { once: true });
    return () => { clearTimeout(timer); removeEventListener("load", play); mm?.revert(); ctx.revert(); };
  });
})();
