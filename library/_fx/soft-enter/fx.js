// Gathers items on the same page and raises them in turn all at once — raising them one by one makes the gaps miss the tempo. Ones that arrive late after that rise on their own
(() => {
  const items = [];
  let ran = false;
  document.documentElement.classList.add("fx-entering");
  kfFx.register("soft-enter", (el, { options, reduce }) => {
    const beat = 60 / (+options.bpm || 142), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
    const item = { el, from: options.soft === "true" ? 0.45 : 0, order: +(options.order ?? 0) };
    const off = () => { const k = items.indexOf(item); if (k >= 0) items.splice(k, 1); gsap.killTweensOf(el); gsap.set(el, { clearProps: "opacity" }); };
    if (ran) {
      if (!reduce) gsap.fromTo(el, { opacity: item.from }, { opacity: 1, duration: beat, ease: out });
      return off;
    }
    items.push(item);
    if (items.length === 1) document.fonts.ready.then(() => {
      ran = true;
      document.documentElement.classList.remove("fx-entering");
      if (reduce || !items.length) return;
      items.sort((a, b) => a.order - b.order);
      gsap.fromTo(items.map((i) => i.el), { opacity: (k) => items[k].from }, { opacity: 1, duration: beat, ease: out, stagger: beat / 2 });
    });
    return off;
  });
})();
