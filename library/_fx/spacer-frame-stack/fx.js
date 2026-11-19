(() => {
  // Take the frame out of the document flow and stand only the cells, so the frame length (scroll space) can be set separately from the content
  kfFx.register("spacer-frame-stack", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector(':scope > [data-fx-part="stage"]') || el;
    const frames = [...stage.querySelectorAll(':scope > [data-fx-part="frame"]')];
    if (!frames.length || reduce) return;
    const fin = +(options.in ?? 0.2), fout = +(options.out ?? 0.15), at = +(options.at ?? 0.85);
    const spacers = frames.map((f) => {
      const d = document.createElement("div");
      d.setAttribute("data-fx-part", "spacer");
      d.style.height = f.dataset.height || "100svh";
      el.append(d);
      return d;
    });
    const prog = frames.map(() => ({ p: 0 }));
    let last = -1;
    const emit = () => {
      const total = prog.reduce((s, x) => s + x.p, 0);
      if (Math.abs(total - last) < 1e-4) return;
      last = total;
      el.dispatchEvent(new CustomEvent("fx:progress", { detail: { total } }));
    };
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      frames.forEach((f, i) => {
        const sp = spacers[i], tl = gsap.timeline();
        if (i === 0 || f.hasAttribute("data-cut")) {
          tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: "none" }, 0);
          tl.to(f, { opacity: 0, duration: 0.001, ease: "none" }, 0.999);
        } else {
          tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: fin, ease: "none" }, 0);
          tl.fromTo(f, { opacity: 1 }, { opacity: 0, duration: fout, ease: "none", immediateRender: false }, at);
        }
        tl.add(() => {}, 1);
        ScrollTrigger.create({ trigger: sp, scroller, start: i === 0 ? "top-=1px top" : "top top", end: "bottom top", scrub: true, toggleClass: { targets: f, className: "is-on" }, animation: tl });
        if (i > 0) gsap.timeline({
          scrollTrigger: { trigger: sp, scroller, scrub: true, start: i === 1 ? "top+=50% bottom" : "top center", end: i === frames.length - 1 ? "center center" : "bottom center", onUpdate: emit },
        }).fromTo(prog[i], { p: 0 }, { p: i === 1 ? 2 : 1, duration: 1, ease: "none" }, 0);
      });
    }, el);
    return () => { ctx.revert(); spacers.forEach((s) => s.remove()); frames.forEach((f) => f.classList.remove("is-on")); };
  });
})();
