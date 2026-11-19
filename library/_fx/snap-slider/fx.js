// Sticky spot = On each visible card, the left edge (the end card is cut to fit the row end). The handle moves one slot by pitch
(() => {
  kfFx.register("snap-slider", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(Draggable, InertiaPlugin);
      const track = el.querySelector("[data-fx-part=track]"), dots = el.querySelector("[data-fx-part=dots]"), knob = el.querySelector("[data-fx-part=knob]");
      if (!track) return;
      const pitch = +options.pitch || 14;
      let snaps = [], drag, kdrag;
      const setKnob = () => {
        if (!knob) return;
        const min = drag.minX || -1, p = min ? gsap.utils.clamp(0, 1, drag.x / min) : 0;
        gsap.set(knob, { x: p * (snaps.length - 1) * pitch });
      };
      const build = () => {
        const cards = [...track.children].filter((c) => c.offsetParent !== null);
        const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
        const max = Math.max(0, track.scrollWidth - (el.clientWidth - pad) + 40);
        snaps = cards.map((c) => -Math.min(c.offsetLeft, max)).filter((v, i, a) => a.indexOf(v) === i);
        drag && drag.kill();
        drag = Draggable.create(track, { type: "x", bounds: { minX: -max, maxX: 0 }, inertia: true, throwResistance: 2500, maxDuration: 1, edgeResistance: 0.85,
          snap: (v) => snaps.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), 0), onDrag: setKnob, onThrowUpdate: setKnob })[0];
        gsap.set(track, { x: 0 });
        drag.update();
        if (!knob) return;
        if (dots) dots.innerHTML = snaps.map(() => "<i></i>").join("");
        kdrag && kdrag.kill();
        kdrag = Draggable.create(knob, { type: "x", bounds: { minX: 0, maxX: (snaps.length - 1) * pitch }, inertia: true, throwResistance: 4000, maxDuration: 0.5,
          snap: (v) => Math.round(v / pitch) * pitch,
          onDrag() { gsap.set(track, { x: snaps[Math.round(this.x / pitch)] || 0 }); drag.update(); },
          onThrowUpdate() { gsap.to(track, { x: snaps[Math.round(this.x / pitch)] || 0, duration: 0.4, ease: "power3.out", onUpdate: () => drag.update() }); } })[0];
        setKnob();
      };
      build();
      let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(build, 200); }, { signal });
      el.addEventListener("fx:refresh", build, { signal });
      signal.addEventListener("abort", () => { drag?.kill(); kdrag?.kill(); });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
