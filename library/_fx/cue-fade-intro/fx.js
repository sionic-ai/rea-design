// Hero sequential turn-on — the notice text (note) over the veil turns on in 1s power3.inOut and off in 2s expo.out, meanwhile the hero pieces (cue)
// Each item fades in from transparent at data-at (seconds) for data-dur (default 2s). At release (default 1.9s) the cover is removed and scroll is released, firing fx:open (Brand site).
(() => {
  kfFx.register("cue-fade-intro", (el, { options, reduce }) => {
    const cover = el.querySelector('[data-fx-part="cover"]');
    const note = el.querySelector('[data-fx-part="note"]');
    const cues = [...el.querySelectorAll('[data-fx-part="cue"]')];
    const root = document.documentElement;
    const lock = options.lock === "true";
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const release = () => { if (cover) cover.hidden = true; if (lock) root.style.overflow = ""; fire("fx:open"); };
    if (reduce) { if (cues.length) gsap.set(cues, { opacity: 1 }); release(); return () => { if (cover) cover.hidden = false; if (cues.length) gsap.set(cues, { clearProps: "opacity" }); }; }
    if (lock) root.style.overflow = "hidden";
    const tl = gsap.timeline({ onComplete: () => fire("fx:done") });
    if (note) tl.to(note, { opacity: 1, duration: +(options.in ?? 1), ease: kfFx.ease(options.inease || "power3.inOut", "power3.inOut") }, 0)
      .to(note, { opacity: 0, duration: +(options.out ?? 2), ease: kfFx.ease(options.outease || "expo.out", "expo.out") });
    cues.forEach((c, i) => {
      tl.to(c, { opacity: 1, duration: +(c.dataset.dur ?? 2), ease: kfFx.ease(c.dataset.ease || "expo.out", "expo.out") }, +(c.dataset.at ?? 1.2 + i * 0.3));
    });
    tl.call(release, null, +(options.release ?? 1.9));
    const touched = [note, ...cues].filter(Boolean);
    return () => { tl.kill(); if (lock) root.style.overflow = ""; if (cover) cover.hidden = false; if (touched.length) gsap.set(touched, { clearProps: "opacity" }); };
  });
})();
