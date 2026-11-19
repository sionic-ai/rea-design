(() => {
  kfFx.register("strip-unroll", (el, { options, reduce }) => {
    const parts = (n) => [...el.querySelectorAll(`[data-fx-part="${n}"]`)];
    const strips = parts("strip"), bg = parts("bg"), img = parts("img"), btn = parts("btn"), pop = parts("pop");
    if (!strips.length && !bg.length && !img.length && !btn.length && !pop.length) return;
    const side = options.side || "left", edge = +(options.edge ?? 400);
    const goal = options.to != null ? +options.to : null;
    const lead = +(options.lead ?? 0.4), each = +(options.each ?? 0.15), unroll = +(options.unroll ?? 0.8);
    const io_ = kfFx.ease(options.ease || "0.42,0,0.58,1", "power1.inOut");
    const out = kfFx.ease("0,0,0.58,1", "power1.out");
    const all = [...strips, ...bg, ...img, ...btn, ...pop];
    if (reduce) return () => {};
    const put = (t, v) => { if (t.length) gsap.set(t, v); };
    put([...bg, ...img], { opacity: 0 });
    put(strips, { height: 1, opacity: 0, overflow: "hidden" });
    put(btn, { height: 1, opacity: 0, overflow: "hidden" });
    put(pop, { y: -30, opacity: 0 });
    let tl = null;
    const play = () => {
      tl = gsap.timeline({ onComplete: () => el.dispatchEvent(new CustomEvent("fx:done")) });
      // Original values: background .8s · profile button .5s after .6s · each band turns on .1s after .4 + .15i and grows from 1px to its height over .8s · picture .6s after 1.2s · button .3s ease-out after 1.5s
      if (bg.length) tl.to(bg, { opacity: 1, duration: 0.8, ease: io_ }, 0);
      if (pop.length) tl.to(pop, { y: 0, opacity: 1, duration: 0.5, ease: io_ }, 0.6);
      strips.forEach((s, i) => {
        tl.to(s, { opacity: 1, duration: 0.1, ease: io_ }, lead + each * i);
        tl.to(s, { height: () => goal ?? s.scrollHeight, duration: unroll, ease: io_ }, lead + each * i);
        tl.set(s, { clearProps: "height,overflow" });
      });
      if (img.length) tl.to(img, { opacity: 1, duration: 0.6, ease: io_ }, 1.2);
      btn.forEach((b) => { tl.to(b, { height: () => goal ?? b.scrollHeight, opacity: 1, duration: 0.3, ease: out }, 1.5); tl.set(b, { clearProps: "height,overflow" }); });
    };
    // Fires once when crossing a line that is edge inside from that edge of the screen — caught even inside a panel moving with transform
    const m = { left: `0px 0px 0px -${edge}px`, right: `0px -${edge}px 0px 0px`, bottom: `0px 0px -${edge}px 0px`, top: `-${edge}px 0px 0px 0px` }[side] || `0px 0px -${edge}px 0px`;
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); play(); } }, { rootMargin: m });
    io.observe(el);
    return () => { io.disconnect(); tl?.kill(); gsap.set(all, { clearProps: "height,opacity,overflow,transform" }); };
  });
})();
