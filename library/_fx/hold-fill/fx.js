// Fills only while held and drains on release — when full, fx:done. Progress is exposed as the element’s --fx-hold (0~1) so css draws the ring · wick · blur
(() => {
  kfFx.register("hold-fill", (el, { options, reduce }) => {
    const ac = new AbortController(), on = { signal: ac.signal };
    const ring = el.querySelector('[data-fx-part="ring"]');
    const dur = +(options.dur ?? 2.4), fast = +(options.fast ?? 1.6), back = +(options.back ?? 0.8), after = +(options.after ?? 0.5);
    const st = { p: 0 };
    let tw = null, done = false;
    const len = ring?.getTotalLength ? ring.getTotalLength() : 0;
    if (ring && len) { ring.style.strokeDasharray = len; ring.style.strokeDashoffset = len; }
    const paint = () => {
      el.style.setProperty("--fx-hold", st.p.toFixed(3));
      if (ring && len) ring.style.strokeDashoffset = len * (1 - st.p);
      el.dispatchEvent(new CustomEvent("fx:hold", { detail: { progress: st.p } }));
    };
    const blocked = () => el.getAttribute("aria-disabled") === "true";
    const press = (quick) => {
      if (done || tw || blocked()) return;
      const d = (quick ? fast : dur) * (1 - st.p) * (reduce ? 0.4 : 1);
      tw = gsap.to(st, { p: 1, duration: d, ease: "power1.in", onUpdate: paint, onComplete: () => {
        tw = null; done = true;
        el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
        gsap.to(st, { p: 0, duration: after, ease: "power2.out", onUpdate: paint, onComplete: () => (done = false) });
      } });
    };
    const release = () => { if (!tw) return; tw.kill(); tw = null; gsap.to(st, { p: 0, duration: back, ease: "power2.out", onUpdate: paint }); };
    el.addEventListener("pointerdown", (e) => { if (e.button === 0) { el.setPointerCapture?.(e.pointerId); press(false); } }, on);
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) el.addEventListener(ev, release, on);
    el.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(true); } }, on);
    el.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") release(); }, on);
    el.addEventListener("contextmenu", (e) => e.preventDefault(), on);
    paint();
    return () => { ac.abort(); tw?.kill(); gsap.killTweensOf(st); el.style.removeProperty("--fx-hold"); if (ring) { ring.style.strokeDasharray = ""; ring.style.strokeDashoffset = ""; } };
  });
})();
