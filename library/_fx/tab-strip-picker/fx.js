// Several color tabs overlap in a strip on the left (4.875 cells) and the chosen panel fills the space beside it. Choosing an earlier tab pushes the tabs already passed 51 cells to the right
// Becomes a right-hand strip, the passed panel peels away from the left edge (clip 1.1s) and the chosen panel comes one strip to the left. Choosing backwards covers in reverse.
// A unit (u) is panel width/90 — in the original rem was screen width/90. Tabs and panels pair up in order (first tab = …is the first board) and the first tab sits at the far right (top).
(() => {
  kfFx.register("tab-strip-picker", (el, { options, reduce }) => {
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const pans = [...el.querySelectorAll('[data-fx-part="panel"]')];
    const N = Math.min(tabs.length, pans.length);
    if (N < 2) return;
    const step = Number(options.step || 4.875);
    const tabW = Number(options.tab || 9);
    const push = +(options.push ?? 51);
    const radius = +(options.radius ?? 0.625);
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const clipDur = reduce ? 0 : +(options["clip-dur"] ?? 1.1);
    const late = +(options.late ?? 0.1);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    let sel = +(options.start ?? 0);
    let u = el.clientWidth / 90;

    const layout = () => {
      u = el.clientWidth / 90;
      for (let i = 0; i < N; i++) {
        const idx = N - i - 1;
        Object.assign(tabs[i].style, { position: "absolute", top: "0", bottom: "0", left: `${idx * step * u}px`, width: `${tabW * u}px`, zIndex: (N - i) * 2 - 1 });
        Object.assign(pans[i].style, {
          position: "absolute", top: "0", bottom: "0", zIndex: (N - i) * 2,
          left: `${(idx + (i ? 1 : 0)) * step * u}px`,
          width: `${el.clientWidth - (step + radius) * (N - 2) * u}px`,
          clipPath: `inset(0 0 0 var(--fx-clip, 0%) round ${radius * u}px)`,
        });
      }
    };
    const state = (C, from, instant) => {
      const fwd = from - C <= 0;
      const d = instant ? 0 : dur;
      pans.slice(0, N).forEach((p, i) => (p.style.visibility = i === C || i === from ? "visible" : "hidden"));
      tabs.slice(0, N).forEach((t, i) => {
        gsap.to(t, { x: i < C ? push * u : 0, duration: d, ease });
        t.setAttribute("aria-selected", i === C);
      });
      pans.slice(0, N).forEach((p, i) => {
        gsap.to(p, { x: i === C && C !== 0 ? -step * u : 0, duration: d, ease, delay: !instant && !fwd && i === N - 1 && C !== N - 1 ? late : 0 });
        gsap.to(p, i < C ? { "--fx-clip": "100%", duration: instant ? 0 : clipDur, ease } : { "--fx-clip": "0%", duration: d, ease });
      });
    };
    const pick = (k, instant) => {
      const C = Math.max(0, Math.min(N - 1, k));
      if (C === sel && !instant) return;
      state(C, sel, instant);
      sel = C;
      el.dispatchEvent(new CustomEvent("fx:tab-strip-picker", { detail: { index: C } }));
    };
    layout();
    sel = Math.max(0, Math.min(N - 1, sel));
    state(sel, sel, true);
    const offs = tabs.slice(0, N).map((t, i) => {
      const on = () => pick(i);
      t.addEventListener("click", on);
      return () => t.removeEventListener("click", on);
    });
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const goPrev = () => pick(sel - 1), goNext = () => pick(sel + 1);
    prev?.addEventListener("click", goPrev);
    next?.addEventListener("click", goNext);
    const onPick = (e) => typeof e.detail?.index === "number" && pick(e.detail.index);
    el.addEventListener("fx:pick", onPick);
    const ro = new ResizeObserver(() => { layout(); state(sel, sel, true); });
    ro.observe(el);
    return () => {
      ro.disconnect();
      offs.forEach((f) => f());
      prev?.removeEventListener("click", goPrev);
      next?.removeEventListener("click", goNext);
      el.removeEventListener("fx:pick", onPick);
      gsap.killTweensOf([...tabs, ...pans]);
      [...tabs, ...pans].forEach((n) => { n.removeAttribute("style"); n.removeAttribute("aria-selected"); });
    };
  });
})();
