(() => {
  // For each letter, stack three copies with two more copies of the same letter placed at 100% and 200% below, then lift the whole chunk up to −200% — while the first copy exits upward
  // The second bee passes and the third bee stands in place. While scrolling, letters roll two slots like a slot machine as they appear (opacity 0 → 1 goes along)
  kfFx.register("slot-scrub-chars", (el, { options, reduce, scroller }) => {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const text = el.textContent;
    if (!text.trim()) return;
    const was = el.innerHTML;
    el.setAttribute("aria-label", text.trim());
    const frag = document.createDocumentFragment();
    const items = [];
    text.trim().split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { frag.append(" "); return; }
      const word = document.createElement("span");
      word.className = "fx-ssc-word";
      word.setAttribute("aria-hidden", "true");
      for (const ch of w) {
        const box = document.createElement("span");
        box.className = "fx-ssc-box";
        const item = document.createElement("span");
        item.className = "fx-ssc-item";
        item.textContent = ch;
        for (let k = 1; k <= 2; k++) {
          const c = document.createElement("span");
          c.className = "fx-ssc-clone";
          c.style.top = `${100 * k}%`;
          c.textContent = ch;
          item.append(c);
        }
        box.append(item);
        word.append(box);
        items.push(item);
      }
      frag.append(word);
    });
    el.replaceChildren(frag);
    const off = () => { tween?.scrollTrigger?.kill(); tween?.kill(); fade?.kill(); el.innerHTML = was; el.removeAttribute("aria-label"); gsap.set(el, { clearProps: "opacity,transform" }); };
    let tween = null, fade = null;
    if (reduce) { gsap.set(items, { yPercent: -200, opacity: 1 }); return off; }
    const stagger = +(options.stagger ?? 0.02);
    const from = { yPercent: 0, opacity: options.fade === "none" ? 1 : 0 };
    if (options.on === "hover") {
      // Each time the pointer enters the wrapper panel (within), it rolls again from the start (without the panel rising) — 1.2s power3.out
      const host = (options.within && el.closest(options.within)) || el;
      const dur = +(options.dur ?? 1.2), ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power3.out");
      const run = () => { tween = gsap.fromTo(items, from, { yPercent: -200, opacity: 1, stagger, duration: dur, ease, overwrite: true }); };
      host.addEventListener("pointerenter", run);
      return () => { host.removeEventListener("pointerenter", run); off(); };
    }
    if (options.on === "view") {
      // Once on entering view: rolls with 1.2s power3.out, and the panel rises from 1em below, transparent, over the same duration.
      const dur = +(options.dur ?? 1.2), ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power3.out");
      gsap.set(items, from);
      gsap.set(el, { opacity: 0 });
      const run = () => {
        tween = gsap.to(items, { yPercent: -200, opacity: 1, stagger, duration: dur, ease });
        fade = gsap.fromTo(el, { opacity: 0, y: "1em" }, { opacity: 1, y: 0, duration: dur, ease });
      };
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); run(); } }, { root: scroller || null });
      io.observe(el);
      return () => { io.disconnect(); off(); };
    }
    // Tied to scroll: by default from when the element top touches the screen bottom until its bottom reaches 75% of the screen (GSAP default .5s·power1.out with .02 delay per letter)
    tween = gsap.fromTo(items, from, {
      yPercent: -200, opacity: 1, stagger, ease: kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out"),
      scrollTrigger: { trigger: (options.within && el.closest(options.within)) || el, scroller, start: options.start || "top bottom", end: options.end || "bottom 75%", scrub: true },
    });
    return off;
  });
})();
