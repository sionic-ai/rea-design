// Read each line’s text color first (turning the text transparent loses currentColor), then shift the band position (--fill-pos)
(() => {
  const START = -16, END = 111;
  kfFx.register("edge-fill-lines", (el, { options, reduce, scroller }) => {
    let lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const self = !lines.length;
    if (self) { if (!el.textContent.trim()) return; lines = [el]; }
    const rest = +(options.rest ?? 0.18);
    const prev = lines.map((l) => l.getAttribute("style"));
    lines.forEach((l) => {
      const c = getComputedStyle(l).color;
      const n = c.match(/[\d.]+/g) || [];
      l.style.setProperty("--fx-to", c);
      l.style.setProperty("--fx-from", n.length >= 3 ? `rgba(${n[0]}, ${n[1]}, ${n[2]}, ${rest})` : c);
      l.style.setProperty("--fill-pos", reduce ? END : START);
    });
    el.classList.add(self ? "fx-edge-self" : "fx-edge-on");
    if (options.align === "center") el.classList.add("fx-edge-center");
    if (options.align === "end") el.classList.add("fx-edge-end");
    const undo = () => {
      el.classList.remove("fx-edge-on", "fx-edge-self", "fx-edge-center", "fx-edge-end");
      lines.forEach((l, i) => (prev[i] == null ? l.removeAttribute("style") : l.setAttribute("style", prev[i])));
    };
    if (reduce) return undo;
    const dur = +(options.dur ?? 1);
    const lag = +(options.lag ?? dur);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const tl = gsap.timeline({ paused: true });
    lines.forEach((l, i) => tl.fromTo(l, { "--fill-pos": START }, { "--fill-pos": END, duration: dur, ease }, i * lag));
    const scrub = options.mode === "scrub";
    const st = ScrollTrigger.create({
      trigger: el,
      scroller,
      start: options.start || "top 80%",
      end: scrub ? options.end || "bottom 40%" : undefined,
      animation: scrub ? tl : undefined,
      scrub: scrub ? true : undefined,
      once: !scrub,
      onEnter: scrub ? undefined : () => tl.play(),
    });
    return () => { st.kill(); tl.kill(); undo(); };
  });
})();
