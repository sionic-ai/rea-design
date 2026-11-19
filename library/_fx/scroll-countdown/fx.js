(() => {
  // The original rewrites Math.round(377 × (1 − position ÷ scrollable length)) on every scroll — same formula, with only the start and end values opened up as options
  kfFx.register("scroll-countdown", (el, { options, scroller }) => {
    const num = el.querySelector('[data-fx-part="num"]') || el;
    const was = num.textContent;
    const from = options.from != null ? +options.from : parseFloat(was);
    const to = +(options.to ?? 0);
    if (!Number.isFinite(from)) return;
    const box = scroller || null;
    const pos = () => (box ? box.scrollTop : scrollY);
    const span = () => (box ? box.scrollHeight - box.clientHeight : document.documentElement.scrollHeight - innerHeight);
    // track: the attached section (closest [data-fx-part=track], or the parent if none) is measured from when its top edge touches the top of the screen until its bottom edge touches the bottom of the screen
    const track = options.track === "section" ? el.closest('[data-fx-part="track"]') || el.parentElement : null;
    const curve = options.ease === "out" ? (t) => 1 - (1 - t) * (1 - t) : (t) => t;
    const draw = () => {
      let t;
      if (track) { const r = track.getBoundingClientRect(), h = box ? box.clientHeight : innerHeight, top = box ? r.top - box.getBoundingClientRect().top : r.top; t = Math.min(Math.max(r.height - h > 0 ? -top / (r.height - h) : 0, 0), 1); }
      else { const max = span(); t = Math.min(max > 0 ? pos() / max : 0, 1); }
      num.textContent = Math.round(from + (to - from) * curve(t));
    };
    const target = box || window;
    target.addEventListener("scroll", draw, { passive: true });
    addEventListener("resize", draw);
    draw();
    return () => { target.removeEventListener("scroll", draw); removeEventListener("resize", draw); num.textContent = was; };
  });
})();
