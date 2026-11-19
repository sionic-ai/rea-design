(() => {
  // Only roll the changed places so just the last digits spin fast while the leading digits stay still, like a real meter
  kfFx.register("odometer-roll", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const snap = kfFx.ease("0.55,0,0.1,1", "power3.inOut");
      const time = options.mode === "time", max = +options.max || 100;
      const fmt = (v) => (time ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}` : String(v).padStart(+options.digits || 3, "0"));
      const build = (s) => {
        el.replaceChildren(...[...s].map((c) => {
          if (!/\d/.test(c)) { const t = document.createElement("span"); t.textContent = c; return t; }
          const d = document.createElement("span"); d.className = "fx-d";
          d.innerHTML = `<span class="fx-stack"><span data-cur>${c}</span><span data-next>${c}</span></span>`;
          return d;
        }));
      };
      const saved = [...el.childNodes];
      signal.addEventListener("abort", () => el.replaceChildren(...saved));
      let value = 0, shown = fmt(0), tween = null;
      build(shown);
      const set = (v, dir) => {
        if (v === value) return;
        tween?.progress(1);
        value = v;
        const s = fmt(v);
        if (s.length !== shown.length || reduce) { shown = s; return build(s); }
        const wheels = [...el.children], moving = [];
        [...s].forEach((c, i) => { const w = wheels[i]; if (w.classList.contains("fx-d") && c !== shown[i]) { w.querySelector("[data-next]").textContent = c; w.classList.toggle("is-down", dir < 0); moving.push(w); } });
        shown = s;
        if (!moving.length) return;
        tween = gsap.fromTo(moving, { "--d": 0 }, { "--d": 1, duration: 0.24, ease: snap, onComplete: () => { build(shown); tween = null; } });
      };
      let last = 0;
      ScrollTrigger.create({ scroller, start: 0, end: "max", onUpdate: (st) => { const p = st.progress; set(Math.min(max, Math.floor(p * max)), p >= last ? 1 : -1); last = p; } });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
