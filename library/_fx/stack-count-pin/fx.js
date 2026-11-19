// Original scrollSticky — progress = Scroll × (number of photos − .5). --fx-p of photo i = Progress − (i − 1), --fx-n = Progress − i (both 0~1).
// The number is current section + (1 if that section is passed by more than turn). The first photo is always --fx-p 1 so it shows from the start
(() => {
  kfFx.register("stack-count-pin", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!frame || !items.length) return;
    const counts = [...el.querySelectorAll('[data-fx-part="count"]')];
    const per = +options.per || 150, turn = +(options.turn ?? 0.75);
    const total = items.length;
    const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    if (options.rise != null) put("--fx-rise", +options.rise + "%");
    if (options.push != null) put("--fx-push", +options.push + "%");
    if (options.zoom != null) put("--fx-zoom", String(+options.zoom));
    // If the cell isn’t a direct child (sharing a line with adjacent text), one sticky plate is placed — it moves the section’s first children over as they are
    let stick = el.querySelector(":scope > .fx-stack-stick");
    const made = !stick;
    if (made) {
      stick = document.createElement("div");
      stick.className = "fx-stack-stick";
      stick.append(...el.childNodes);
      el.append(stick);
    }
    el.style.height = `calc(${total} * ${per}lvh)`;
    let progress = 0;
    const paint = () => {
      const current = clamp(Math.floor(progress), 0, total - 0.5);
      const next = clamp(current + (progress - current > turn ? 1 : 0), 0, total - 1);
      counts.forEach((c) => { c.style.translate = `0 calc(-${next} * 100% / ${c.children.length || 1})`; });
      items.forEach((it, i) => {
        it.style.setProperty("--fx-n", String(clamp(progress - i)));
        it.style.setProperty("--fx-p", String(clamp(progress - (i - 1))));
      });
    };
    gsap.registerPlugin(ScrollTrigger);
    if (reduce) { progress = 0; paint(); }
    const st = reduce ? null : ScrollTrigger.create({
      scroller, trigger: el, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (s) => { progress = s.progress * (total - 0.5); paint(); },
    });
    paint();
    return () => {
      st?.kill();
      if (made && stick.isConnected) { el.prepend(...stick.childNodes); stick.remove(); }
      el.style.removeProperty("height");
      set.forEach((k) => el.style.removeProperty(k));
      items.forEach((it) => { it.style.removeProperty("--fx-n"); it.style.removeProperty("--fx-p"); });
      counts.forEach((c) => c.style.removeProperty("translate"));
    };
  });
})();
