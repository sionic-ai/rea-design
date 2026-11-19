// Logo draw-in and settle onto the header: inside the background-color curtain, the logo is drawn as lines in stroke order (filled dots light up on their turn), held briefly, then,
// Accelerates to the real logo spot in the header, shrinks to that size and fades. The cover lifts during the flight, and at the end fires fx:done (+ a document event named done)
// — Hero loader of the Brand careers page (film jam: draw 1.4s, hold .73s, fly .3s)
(() => {
  kfFx.register("logo-draw-dock", (el, { options, reduce }) => {
    const logo = el.querySelector('[data-fx-part="logo"]');
    let fired = false;
    const cue = () => { if (options.done && !fired) { fired = true; document.dispatchEvent(new Event(options.done)); } };
    const fire = () => {
      cue();
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce || !logo || !window.gsap) {
      el.classList.add("is-gone");
      fire();
      return () => el.classList.remove("is-gone");
    }
    const shapes = [...logo.querySelectorAll("path, circle, ellipse, line, polyline, polygon, rect")];
    const draw = +(options.draw ?? 1.4), hold = +(options.hold ?? 0.73), fly = +(options.fly ?? 0.3), fade = +(options.fade ?? 0.2);
    const drawEase = kfFx.ease(options["draw-ease"] || "0.37,0,0.63,1", "sine.inOut"), flyEase = kfFx.ease(options["fly-ease"] || "0.55,0.085,0.68,0.53", "power2.in");
    // Things drawn as lines (no fill) get a turn by their length, filled dots by 15% of the average length, in sequence.
    const parts = shapes.map((n) => {
      const cs = getComputedStyle(n), stroke = cs.fill === "none" && typeof n.getTotalLength === "function";
      return { n, stroke, len: stroke ? n.getTotalLength() : 0 };
    });
    const avg = parts.filter((p) => p.stroke).reduce((s, p) => s + p.len, 0) / Math.max(1, parts.filter((p) => p.stroke).length) || 10;
    parts.forEach((p) => (p.w = p.stroke ? p.len : avg * 0.15));
    const total = parts.reduce((s, p) => s + p.w, 0) || 1;
    parts.forEach((p) => (p.stroke ? gsap.set(p.n, { strokeDasharray: p.len, strokeDashoffset: p.len }) : gsap.set(p.n, { opacity: 0 })));
    el.classList.add("is-fx-drawing");

    // Drawing splits one full curve across strokes — it is painted with a single progress value so it does not speed up or slow down at stroke boundaries
    const prog = { p: 0 }, drawFn = gsap.parseEase(drawEase);
    const paint = () => {
      let at = drawFn(prog.p) * total;
      for (const p of parts) {
        const k = Math.max(0, Math.min(1, at / p.w));
        if (p.stroke) p.n.style.strokeDashoffset = `${p.len * (1 - k)}`;
        else p.n.style.opacity = `${k}`;
        at -= p.w;
      }
    };
    const bg = getComputedStyle(el).backgroundColor, clear = bg.replace(/rgba?\(([^,]+),([^,]+),([^,)]+)(?:,[^)]+)?\)/, "rgba($1,$2,$3,0)");
    const tl = gsap.timeline({ onComplete: () => { el.classList.add("is-gone"); fire(); } });
    tl.to(prog, { p: 1, duration: draw, ease: "none", onUpdate: paint });
    tl.add(() => {
      const target = options.to && document.querySelector(options.to);
      const a = logo.getBoundingClientRect();
      if (!target) return void gsap.to(logo, { opacity: 0, duration: fly, ease: flyEase });
      const b = target.getBoundingClientRect();
      gsap.to(logo, {
        x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2),
        scale: a.width ? b.width / a.width : 1, opacity: fade, duration: fly, ease: flyEase,
      });
    }, draw + hold);
    // veil: lift — the curtain doesn’t fade but lifts upward over the same length (original loader)
    if (options.veil === "lift") {
      Object.assign(el.style, { backgroundColor: "transparent", backgroundImage: `linear-gradient(${bg}, ${bg})`, backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", backgroundPosition: "0px 0px" });
      tl.to(el, { backgroundPosition: () => `0px ${-innerHeight}px`, duration: fly, ease: flyEase }, draw + hold);
    } else tl.to(el, { backgroundColor: clear, duration: fly, ease: flyEase }, draw + hold);
    // lead: fires the done event some seconds before fully settled — in the original the first title starts rising .13s before the logo settles
    const lead = +(options.lead ?? 0);
    if (lead > 0) tl.call(cue, null, Math.max(0, draw + hold + fly - lead));
    return () => {
      tl.kill();
      gsap.killTweensOf(logo);
      gsap.set(logo, { clearProps: "transform,opacity" });
      if (options.veil === "lift") gsap.set(el, { clearProps: "backgroundColor,backgroundImage,backgroundRepeat,backgroundSize,backgroundPosition" });
      gsap.set(el, { clearProps: "backgroundColor" });
      parts.forEach((p) => gsap.set(p.n, { clearProps: "strokeDasharray,strokeDashoffset,opacity" }));
      el.classList.remove("is-fx-drawing", "is-gone");
    };
  });
})();
