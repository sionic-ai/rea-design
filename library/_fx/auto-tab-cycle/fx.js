(() => {
  kfFx.register("auto-tab-cycle", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), every = +options.every || 2, f = beat * 0.75, io = kfFx.ease("0.65,0,0.15,1", "power3.inOut");
      const tabs = [...el.querySelectorAll("[data-fx-part=tabs] > button")], rooms = [...el.querySelectorAll("[data-fx-part=rooms] > *")], ind = el.querySelector("[data-fx-part=indicator]");
      const n = Math.min(tabs.length, rooms.length);
      if (n < 2) return;
      const x = (k) => tabs[k].offsetLeft - 4;
      const press = (k) => tabs.forEach((t, j) => t.setAttribute("aria-pressed", String(j === k)));
      if (ind) gsap.set(ind, { width: tabs[0].offsetWidth + 8 });
      const tl = gsap.timeline({ paused: true, repeat: -1 });
      tl.set(rooms, { autoAlpha: 0 }, 0).set(rooms[0], { autoAlpha: 1 }, 0).set(ind, { x: x(0) }, 0).call(press, [0], 0);
      for (let k = 1; k <= n; k++) {
        const at = k * beat * every - f, to = k % n;
        tl.to(ind, { x: () => x(to), duration: f, ease: io }, at).to(rooms[to], { autoAlpha: 1, duration: f, ease: io }, at).to(rooms[k - 1], { autoAlpha: 0, duration: f, ease: io }, at).call(press, [to], at);
      }
      let held = false;
      if (reduce) tl.time(0.001); else ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => !held && (s.isActive ? tl.play() : tl.pause()) });
      el.querySelector("[data-fx-part=tabs]").addEventListener("click", (e) => {
        const k = tabs.indexOf(e.target.closest("button"));
        if (k < 0) return;
        held = true; tl.pause(); press(k);
        gsap.to(ind, { x: x(k), duration: reduce ? 0 : f, ease: io, overwrite: true });
        rooms.forEach((r, j) => gsap.to(r, { autoAlpha: j === k ? 1 : 0, duration: reduce ? 0 : f, ease: io, overwrite: true }));
      }, { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
