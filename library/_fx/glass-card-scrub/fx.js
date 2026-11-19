(() => {
  const NS = "http://www.w3.org/2000/svg";
  // Glass refraction — distorts the background a little with four noises of different grain. Each card picks one at random
  function ensureFilters() {
    if (document.getElementById("fx-glass-1")) return;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.innerHTML = [[0.008, 0.012, 2, 40], [0.012, 0.006, 3, 30], [0.02, 0.02, 1, 24], [0.006, 0.016, 2, 46]].map(([fx, fy, oct, sc], i) =>
      `<filter id="fx-glass-${i + 1}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="${oct}" seed="${i * 7 + 3}" result="n"/><feGaussianBlur in="n" stdDeviation="2" result="b"/><feDisplacementMap in="SourceGraphic" in2="b" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join("");
    document.body.append(svg);
  }

  kfFx.register("glass-card-scrub", (el, { options, reduce, scroller }) => {
    ensureFilters();
    el.style.setProperty("--fx-glass-filter", `url(#fx-glass-${1 + Math.floor(Math.random() * 4)})`);
    if (reduce || !window.gsap || !window.ScrollTrigger) return () => el.style.removeProperty("--fx-glass-filter");
    gsap.registerPlugin(ScrollTrigger);
    const texts = [...el.querySelectorAll('[data-fx-part="text"]')];
    const rise = +(options.rise ?? 52), from = +(options.from ?? 0.94), blurIn = +(options.blur ?? 14);
    const lift = +(options.lift ?? -72), to = +(options.to ?? 1.08), blurOut = +(options["blur-out"] ?? 18);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${options.min ?? 768}px)`, () => {
      gsap.set(el, { y: rise, scale: from, "--fx-glass-o": 0 });
      if (texts.length) gsap.set(texts, { opacity: 0, filter: `blur(${blurIn}px)` });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        trigger: el, scroller, start: options.start || "top 92%", end: options.end || "bottom 6%", scrub: +(options.scrub ?? 0.6), invalidateOnRefresh: true,
        onToggle: (st) => el.classList.toggle("is-glass-live", st.isActive),
      } });
      tl.to(el, { y: 0, scale: 1, "--fx-glass-o": 1, duration: 0.24, ease: "power2.out" }, 0);
      if (texts.length) {
        tl.to(texts, { opacity: 1, filter: "blur(0px)", duration: 0.18, ease: "power2.out", stagger: 0.05 }, 0.06);
        tl.to(texts, { opacity: 0, filter: `blur(${blurOut}px)`, duration: 0.34, ease: "power1.in", stagger: 0.03 }, 0.62);
      }
      tl.to(el, { y: lift, scale: to, "--fx-glass-o": 0, duration: 0.36, ease: "power2.in" }, 0.64);
      return () => { gsap.set(el, { clearProps: "transform,--fx-glass-o" }); if (texts.length) gsap.set(texts, { clearProps: "opacity,filter" }); el.classList.remove("is-glass-live"); };
    });
    return () => { mm.revert(); el.style.removeProperty("--fx-glass-filter"); };
  });
})();
