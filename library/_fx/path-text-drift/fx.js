// Binds the start offset of text on a curve (textPath) to scroll progress so it flows sideways — progress does not follow directly but chases it every frame with lerp,
// Position is bent with easeOutCubic, so it flows fast when coming in and slower toward the exit
(() => {
  kfFx.register("path-text-drift", (el, { options, reduce, scroller }) => {
    // look: step — regardless of scroll, every cycle seconds it slides by the by amount for move seconds with quint in-out, then rests. All textPaths inside move together in place
    // (brand: an ellipse of four laps, so 12.5% is half a lap, and with wrap 50 the same spot recurs every two laps, so there is no seam)
    if (options.look === "step") {
      const tps = [...el.querySelectorAll("textPath")];
      if (!tps.length) return;
      const base = tps.map((t) => parseFloat(t.getAttribute("startOffset")) || 0);
      const cycle = (+options.cycle || 13) * 1000, move = Math.min(cycle, (+options.move || 3) * 1000);
      const by = +(options.by ?? 12.5), wrap = +options.wrap || 50;
      const q = (e) => (e < 0.5 ? 16 * e ** 5 : 1 - (-2 * e + 2) ** 5 / 2);
      const put = (r) => tps.forEach((t, i) => t.setAttribute("startOffset", `${(base[i] + (r % wrap)) % 100}%`));
      if (reduce) return () => put(0);
      let raf = 0, t0 = null, last = null;
      // While resting the value is the same so it is not rewritten — writing the same startOffset every frame still makes the text lay out again
      const f = (now) => {
        if (t0 === null) t0 = now;
        const l = now - t0, o = Math.floor(l / cycle), s = l % cycle;
        const r = s < move ? by * o + by * q(s / move) : (o + 1) * by;
        if (r !== last) put((last = r));
        raf = requestAnimationFrame(f);
      };
      const wait = setTimeout(() => (raf = requestAnimationFrame(f)), +(options.delay ?? 0) * 1000);
      return () => { clearTimeout(wait); cancelAnimationFrame(raf); put(0); };
    }
    const tp = el.querySelector("textPath");
    if (!tp) return;
    const m = String(options.from ?? tp.getAttribute("startOffset") ?? "0%").match(/^(-?[\d.]+)\s*(%|px)?$/) || [0, 0, "%"];
    const from = +m[1], unit = m[2] || "%", delta = options.to != null ? parseFloat(options.to) - from : +(options.delta ?? -80), lerp = Math.min(0.35, Math.max(0.02, +(options.lerp ?? 0.05)));
    const set = (p) => tp.setAttribute("startOffset", (from + delta * (1 - Math.pow(1 - p, 3))).toFixed(3) + unit);
    set(0);
    if (reduce) return () => tp.setAttribute("startOffset", from + unit);
    // scrub: number — instead of chasing, GSAP scrub (follows that many seconds late) carries from → to on the ease curve (reference site 5s · power1.out)
    if (options.scrub != null) {
      const tw = gsap.fromTo(tp, { attr: { startOffset: from + unit } }, {
        attr: { startOffset: from + delta + unit }, ease: kfFx.ease(options.ease || "none", "none"),
        scrollTrigger: { trigger: el, scroller, start: options.start || "top 130%", end: options.end || "bottom -100%", scrub: +options.scrub || true },
      });
      return () => { tw.scrollTrigger?.kill(); tw.kill(); tp.setAttribute("startOffset", from + unit); };
    }
    let target = 0, cur = 0, raf = 0;
    const tick = () => {
      const d = target - cur;
      cur = Math.abs(d) > 5e-4 ? cur + d * lerp : target;
      set(cur);
      raf = cur === target ? 0 : requestAnimationFrame(tick);
    };
    // Original range ["start 130%", "end -100%"] — 0 when the element’s top edge is at 130% of screen height, 1 when its bottom edge reaches −100% above the screen
    const st = ScrollTrigger.create({
      trigger: el, scroller,
      start: options.start || "top 130%",
      end: options.end || "bottom -100%",
      onUpdate: (t) => { target = t.progress; if (!raf) raf = requestAnimationFrame(tick); },
    });
    return () => { st.kill(); cancelAnimationFrame(raf); tp.setAttribute("startOffset", from + unit); };
  });
})();
