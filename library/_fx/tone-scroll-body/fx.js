// When a section head passes the screen center (going down or coming back up), the page background and text color change to that section’s color over .3s linear.
// Colors are resolved from the section’s --fx-tone-bg · --fx-tone-ink (skin variables · color-mix also work) into real sRGB and passed on — GSAP can’t read oklch(from …)
(() => {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  const rgb = (css) => {
    pg.clearRect(0, 0, 1, 1);
    pg.fillStyle = "transparent";
    pg.fillStyle = css;
    pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
  };
  const resolve = (el, name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    el.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    return rgb(c);
  };

  kfFx.register("tone-scroll-body", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const target = options.target ? document.querySelector(options.target) : document.body;
    if (!target) return;
    const dur = +(options.dur ?? 0.3);
    const apply = () => {
      const bg = resolve(el, "--fx-tone-bg"), ink = resolve(el, "--fx-tone-ink");
      // Even if the label changes the target’s css color directly, read it first so it starts from the currently visible color
      const cs = getComputedStyle(target), from = { backgroundColor: cs.backgroundColor, color: cs.color };
      if (options.name) target.dataset.tone = options.name;
      gsap.fromTo(target, from, { backgroundColor: bg, color: ink, duration: reduce ? 0 : dur, ease: "none", overwrite: true });
    };
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top center", end: options.end || "bottom center", onEnter: apply, onEnterBack: apply });
    return () => st.kill();
  });
})();
