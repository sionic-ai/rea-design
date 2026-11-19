// Scatter from center: among the photos in the panel, only those currently on screen are moved to the screen center and stacked, then turned on one by one at overlap order × .1s (the first also after .1s — original calc(var(--z-index) * .1s)),
// After the hold seconds, each piece scatters back into place with a random length (.8~1.4s) and random order (×.01s) on cubic-bezier(.77,0,.175,1) — the hero of a reference site
(() => {
  const shuffle = (n) => { const a = Array.from({ length: n }, (_, i) => i + 1); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  kfFx.register("center-scatter-in", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap) return;
    const items = [...el.querySelectorAll(':scope [data-fx-part="item"]')];
    if (!items.length) return;
    const ease = kfFx.ease(options.ease || "0.77,0,0.175,1", "power4.inOut");
    const each = +(options.each ?? 0.1), hold = +(options.hold ?? 1);
    const min = +(options.min ?? 0.8), max = +(options.max ?? 1.4);
    let tl, started = false;
    const vw = () => (scroller ? scroller.clientWidth : innerWidth), vh = () => (scroller ? scroller.clientHeight : innerHeight);
    const seen = items.filter((it) => { const r = it.getBoundingClientRect(); return r.bottom > 0 && r.top < vh() && r.right > 0 && r.left < vw(); });
    const z = shuffle(seen.length), order = shuffle(seen.length);
    const medias = seen.map((it) => it.querySelector('[data-fx-part="media"]') || it);
    // Moved to the screen center — pushes CSS translate as a variable so the element’s own transform isn’t touched
    seen.forEach((it, i) => {
      const r = medias[i].getBoundingClientRect();
      gsap.set(medias[i], { "--fx-csi-x": `${vw() / 2 - (r.left + r.width / 2)}px`, "--fx-csi-y": `${vh() / 2 - (r.top + r.height / 2)}px` });
      gsap.set(it, { zIndex: z[i], autoAlpha: 0 });
    });
    const start = () => {
      if (started) return;
      started = true;
      tl = gsap.timeline();
      seen.forEach((it, i) => tl.set(it, { autoAlpha: 1 }, z[i] * each));
      seen.forEach((it, i) => tl.to(medias[i], { "--fx-csi-x": "0px", "--fx-csi-y": "0px", duration: min + Math.random() * (max - min), ease }, hold + order[i] * 0.01));
    };
    // on: document event name — starts when it receives the loader-finished signal (immediately on attach if absent)
    if (options.on) document.addEventListener(options.on, start, { once: true });
    else start();
    return () => {
      if (options.on) document.removeEventListener(options.on, start);
      tl?.kill();
      gsap.set(medias, { clearProps: "--fx-csi-x,--fx-csi-y" });
      gsap.set(seen, { clearProps: "zIndex,opacity,visibility" });
    };
  });
})();
