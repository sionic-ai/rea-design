(() => {
  // Original interfere activity log (problem-timeline): from 1.4s on, rows appear one after another — dot from .8x and transparent over .4s, content from 4px blur and 4px below over .5s,
  // The line continuing to the next line is drawn from top to bottom. Normal lines take .8s, comment lines (data-kind="comment") the next line follows at .7s intervals.
  const TIMING = {
    item: { advance: 0.8, line: [0.5, 0.3], content: [0.5, 0.5], dot: [0.1, 0.4] },
    comment: { advance: 0.7, line: [0.6, 0.1], content: [0.1, 0.5], dot: [0.1, 0.4] },
  };
  kfFx.register("timeline-feed-in", (el, { options, reduce, scroller }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length || !window.gsap) return;
    if (reduce) return;
    const start = +(options.start ?? 1.4), speed = +(options.speed || 1);
    const easeOut = kfFx.ease(options.ease || "0,0,0.25,1", "power2.out");
    const easeIn = kfFx.ease("0.42,0,1,1", "power1.in");
    const tl = gsap.timeline({ paused: true });
    let t = start;
    rows.forEach((row) => {
      const k = TIMING[row.dataset.kind === "comment" ? "comment" : "item"];
      const dot = row.querySelector('[data-fx-part="dot"]');
      const body = row.querySelector('[data-fx-part="body"]');
      const line = row.querySelector('[data-fx-part="line"]');
      if (dot) tl.fromTo(dot, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: k.dot[1] / speed, ease: easeOut }, t + k.dot[0] / speed);
      if (body) tl.fromTo(body, { opacity: 0, filter: "blur(4px)", y: 4 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: k.content[1] / speed, ease: easeOut, clearProps: "filter" }, t + k.content[0] / speed);
      if (line) tl.fromTo(line, { scaleY: 0, transformOrigin: "50% 0" }, { scaleY: 1, duration: k.line[1] / speed, ease: easeIn }, t + k.line[0] / speed);
      t += k.advance / speed;
    });
    tl.progress(0).pause();
    let st = null;
    if (options.on === "view" && window.ScrollTrigger) {
      st = ScrollTrigger.create({ trigger: el, scroller, start: options["view-start"] || "top 85%", once: true, onEnter: () => tl.play(0) });
    } else tl.play(0);
    return () => { st?.kill(); tl.progress(1).kill(); gsap.set(rows.flatMap((r) => [...r.querySelectorAll("[data-fx-part]")]), { clearProps: "opacity,transform,filter" }); };
  });
})();
