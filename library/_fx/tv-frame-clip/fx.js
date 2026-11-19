// Crops the video and photo plates into a window shaped like a convex TV screen — e=0 shows a center screen (66% wide · 82% tall, four sides slightly convex, rounded corners),
// e=When 1, a full square. Tie it to scroll (on: scroll), play once when visible (on: load), or open it with fx:play (on: manual)
(() => {
  let seq = 0;
  const tv = (e) => {
    const t = 1 - e, wide = innerHeight > innerWidth ? 1.3 : 1;
    const L = 0.5 - (0.5 - 0.17 * t) * wide, R = 1 - L, T = 0.09 * t, B = 1 - T;
    const bx = 0.012 * t, by = 0.022 * t, r = 0.03 * t, f = (v) => v.toFixed(4);
    return `M${f(L + r)} ${f(T + by)}Q0.5 ${f(T - by)} ${f(R - r)} ${f(T + by)}Q${f(R)} ${f(T + by)} ${f(R)} ${f(T + by + r)}Q${f(R + bx)} 0.5 ${f(R)} ${f(B - by - r)}Q${f(R)} ${f(B - by)} ${f(R - r)} ${f(B - by)}Q0.5 ${f(B + by)} ${f(L + r)} ${f(B - by)}Q${f(L)} ${f(B - by)} ${f(L)} ${f(B - by - r)}Q${f(L - bx)} 0.5 ${f(L)} ${f(T + by + r)}Q${f(L)} ${f(T + by)} ${f(L + r)} ${f(T + by)}Z`;
  };
  kfFx.register("tv-frame-clip", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const id = `fx-tv-${++seq}`;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML = `<defs><clipPath id="${id}" clipPathUnits="objectBoundingBox"><path/></clipPath></defs>`;
    document.body.append(svg);
    const path = svg.querySelector("path");
    const from = +(options.from ?? 0), to = +(options.to ?? 1);
    const st = { e: from };
    const draw = () => path.setAttribute("d", tv(st.e));
    draw();
    el.style.clipPath = `url(#${id})`;
    const on = options.on || "scroll";
    let tween = null, trig = null;
    if (reduce) { st.e = to; draw(); }
    else if (on === "scroll" && window.ScrollTrigger) {
      trig = ScrollTrigger.create({ trigger: el.closest("[data-fx-part=track]") || el, scroller, start: options.start || "top bottom", end: options.end || "bottom bottom", scrub: +(options.scrub ?? 1.2),
        onUpdate: (s) => { st.e = from + (to - from) * s.progress; draw(); } });
    } else {
      const play = () => { tween?.kill(); st.e = from; tween = gsap.to(st, { e: to, duration: +(options.dur ?? 1.6), delay: +(options.delay ?? 0), ease: kfFx.ease(options.ease || "power3.inOut", "power3.inOut"), onUpdate: draw }); };
      if (on === "load") {
        const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); play(); } });
        io.observe(el);
        el._fxTvIo = io;
      }
      el.addEventListener("fx:play", play);
      el._fxTvPlay = play;
    }
    addEventListener("resize", draw);
    return () => {
      removeEventListener("resize", draw);
      trig?.kill();
      tween?.kill();
      el._fxTvIo?.disconnect();
      if (el._fxTvPlay) el.removeEventListener("fx:play", el._fxTvPlay);
      delete el._fxTvIo;
      delete el._fxTvPlay;
      el.style.clipPath = "";
      svg.remove();
    };
  });
})();
