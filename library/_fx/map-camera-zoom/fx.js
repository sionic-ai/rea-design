(() => {
  // Cut the node pill in the shape it was pulled to the screen center, then spread it to full screen — so the color seen on the map becomes the next section background without a break
  kfFx.register("map-camera-zoom", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const vp = el.querySelector("[data-fx-part=viewport]"), world = el.querySelector("[data-fx-part=world]");
      const nodes = world ? [...world.querySelectorAll("[data-fx-part=node]")] : [];
      if (!vp || !nodes.length) return;
      gsap.registerPlugin(ScrollTrigger);
      const cam = kfFx.ease("0.77,0,0.175,1", "power3.inOut"), fade = kfFx.ease("0.4,0,0.2,1", "power1.inOut");
      const overs = Object.fromEntries([...el.querySelectorAll("[data-fx-part=overlay]")].map((o) => [o.dataset.node, o]));
      const MAX = options.max ? +options.max : 0.28, HOLD = options.hold ? +options.hold : 1.6, FULL = "inset(0px 0px 0px 0px round 0px)";
      const tone = (n) => getComputedStyle(n).getPropertyValue("--tone");
      nodes.forEach((n) => { const o = overs[n.dataset.node]; if (o && tone(n)) o.style.setProperty("--tone", tone(n)); });
      const box = (n) => ({ x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight });
      const view = {}, zoom = {};
      const measure = () => {
        const W = vp.clientWidth, H = vp.clientHeight, bs = nodes.map(box);
        const minX = Math.min(...bs.map((b) => b.x)), minY = Math.min(...bs.map((b) => b.y));
        const bw = Math.max(...bs.map((b) => b.x + b.w)) - minX, bh = Math.max(...bs.map((b) => b.y + b.h)) - minY;
        const s = Math.min((W - 110) / bw, (H - 100) / bh, MAX);
        Object.assign(view, { scale: s, x: W / 2 - (minX + bw / 2) * s, y: H / 2 - (minY + bh / 2) * s });
        nodes.forEach((n, i) => { const b = bs[i], z = Math.min((W * 0.48) / b.w, (H * 0.55) / b.h); zoom[n.dataset.node] = { scale: z, x: W / 2 - (b.x + b.w / 2) * z, y: H / 2 - (b.y + b.h / 2) * z, w: b.w * z, h: b.h * z }; });
      };
      const pill = (id) => { const z = zoom[id], W = vp.clientWidth, H = vp.clientHeight, l = (W - z.w) / 2, t = (H - z.h) / 2; return `inset(${t}px ${W - l - z.w}px ${H - t - z.h}px ${l}px round ${z.h / 2}px)`; };
      const to = (o) => ({ x: () => o.x, y: () => o.y, scale: () => o.scale });
      measure();
      gsap.set(world, to(view));
      if (reduce) return;
      const tl = gsap.timeline({ paused: true, defaults: { ease: cam } });
      nodes.forEach((n) => {
        const id = n.dataset.node, ov = overs[id], label = n.firstElementChild || n, beats = ov ? [...ov.querySelectorAll("[data-fx-part=beat]")] : [];
        tl.to(world, { ...to(zoom[id]), duration: 1 });
        tl.to(label, { opacity: 0, duration: 0.26, ease: fade }, "-=0.26");
        if (ov) {
          if (beats.length) gsap.set(beats, { autoAlpha: 0 });
          tl.set(ov, { visibility: "visible" }).fromTo(ov, { clipPath: () => pill(id) }, { clipPath: FULL, duration: 1, immediateRender: false });
          beats.forEach((b, i) => tl.to(b, { autoAlpha: 1, duration: 0.6, ease: fade }, i ? ">-0.1" : "-=0.32"));
          tl.to({}, { duration: HOLD });
          // Sections without text keep the same pause before lifting — so scroll length doesn’t differ per section
          if (beats.length) tl.to(beats, { autoAlpha: 0, duration: 0.4, ease: fade });
          else tl.to({}, { duration: 0.4 });
          tl.to(ov, { clipPath: () => pill(id), duration: 1 }, "+=0.25").set(ov, { visibility: "hidden" });
        }
        tl.to(label, { opacity: 1, duration: 0.4, ease: fade }).to(world, { ...to(view), duration: 1 }).to({}, { duration: 0.5 });
      });
      ScrollTrigger.create({ scroller, trigger: el, animation: tl, start: "top top", end: () => "+=" + Math.round((scroller ? scroller.clientHeight : innerHeight) * tl.duration() * 0.78), pin: vp, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: measure });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
