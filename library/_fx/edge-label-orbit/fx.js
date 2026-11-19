// Each time a section crosses the screen center, the section names on the four sides shift one slot around the border — going to the next section: top → left → bottom-left → bottom-right → right → top, and the reverse when going up.
// Keyframes have a fixed start frame (as in the original CSS), so jumping at once to a non-adjacent section returns to the initial position without keyframes.
(() => {
  const css = (e) => (String(e).includes(",") ? `cubic-bezier(${e})` : e);
  kfFx.register("edge-label-orbit", (el, { options, reduce, scroller }) => {
    const labels = [...el.querySelectorAll('[data-fx-part="label"]')].slice(0, 5);
    if (!labels.length || !window.ScrollTrigger) return;
    const sections = [...document.querySelectorAll(options.sections || "section")].filter((s) => !el.contains(s));
    const dur = +(options.dur ?? 0.55), ease = css(options.ease || "ease");
    labels.forEach((lab, k) => lab.setAttribute("data-station", String(k)));
    let last = null;
    const play = (from, to) => {
      const step = to - from;
      labels.forEach((lab, k) => {
        if (reduce || !dur) {
          lab.style.animation = "";
          lab.setAttribute("data-station", String(Math.abs(step) === 1 ? (k + to) % 5 : k));
          return;
        }
        const s = (k + from) % 5;
        lab.style.animation = "none";
        void lab.offsetWidth;
        lab.style.animation = step === 1 ? `fx-elo-f${s} ${dur}s ${ease} forwards` : step === -1 ? `fx-elo-b${s} ${dur}s ${ease} forwards` : "";
      });
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: to } }));
    };
    const triggers = sections.map((sec, i) => {
      const enter = () => {
        if (last !== null && last !== i) play(last, i);
        last = i;
      };
      return ScrollTrigger.create({ trigger: sec, scroller, start: "top center", end: "bottom center", onEnter: enter, onEnterBack: enter });
    });
    return () => {
      triggers.forEach((t) => t.kill());
      labels.forEach((lab) => { lab.style.animation = ""; lab.removeAttribute("data-station"); });
    };
  });
})();
