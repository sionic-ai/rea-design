// Sentence swap in pinned section: while passing a tall section the stage stays pinned to the screen, and when progress crosses a step boundary the sentence group disappears over dur and then
// Switches to the next sentence and appears at dur — brand (500vh black section, three sentences, a button at the end)
(() => {
  kfFx.register("pin-sentence-swap", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!stage || lines.length < 2) return;
    const wrap = lines[0].parentElement;
    const dur = +(options.dur ?? 0.4);
    const ease = kfFx.ease(options.ease || "0.44,0,0.56,1", "sine.inOut");
    const cuts = (options.cuts || "").split(",").map(Number).filter((n) => n > 0 && n < 1);
    const edges = cuts.length === lines.length - 1 ? cuts : lines.map((_, i) => (i + 1) / lines.length).slice(0, -1);
    let shown = 0, want = 0, busy = null;
    const show = (i) => lines.forEach((l, k) => { l.hidden = k !== i; });
    show(0);
    if (reduce) return () => lines.forEach((l) => { l.hidden = false; });
    const swap = () => {
      if (busy || want === shown) return;
      busy = gsap.to(wrap, {
        opacity: 0, duration: dur, ease,
        onComplete: () => {
          shown = want; show(shown);
          busy = gsap.to(wrap, { opacity: 1, duration: dur, ease, onComplete: () => { busy = null; swap(); } });
        },
      });
    };
    const read = () => {
      const r = el.getBoundingClientRect();
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const top = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      const p = Math.min(1, Math.max(0, -top / Math.max(1, r.height - vh)));
      let i = 0;
      while (i < edges.length && p >= edges[i]) i++;
      if (i !== want) { want = i; swap(); }
    };
    const src = scroller || window;
    src.addEventListener("scroll", read, { passive: true });
    addEventListener("resize", read);
    read();
    return () => {
      src.removeEventListener("scroll", read);
      removeEventListener("resize", read);
      busy?.kill();
      gsap.set(wrap, { clearProps: "opacity" });
      lines.forEach((l) => { l.hidden = false; });
    };
  });
})();
