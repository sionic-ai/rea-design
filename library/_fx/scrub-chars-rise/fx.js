// Splits the big wordmark into letters. From when the letter block touches the bottom of the screen until it has risen half its own height, letters shoot up in turn (.05) from 120% below — tied directly to scroll
(() => {
  kfFx.register("scrub-chars-rise", (el, { options, reduce, scroller }) => {
    const text = el.textContent.trim();
    if (!text || reduce) return;
    const original = el.innerHTML;
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((c) => `<span class="fx-scr-c" aria-hidden="true">${c === " " ? "&#32;" : c}</span>`).join("");
    const chars = [...el.querySelectorAll(".fx-scr-c")];
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    // trigger — measures against the nearest ancestor (footer etc.) instead of the text chunk (paradox-series footer: from when the footer reaches the bottom of the screen until the footer’s bottom edge reaches the bottom of the screen)
    const trigger = (options.trigger && el.closest(options.trigger)) || el;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (options.fan != null) {
        // fan — the nth letter in a word starts at y + n×fan % lower and all arrive in place together at the end (staggered by start depth instead of order, curve default none)
        let n = 0;
        const tl = gsap.timeline({ scrollTrigger: { trigger, ...(scroller && { scroller }), start: options.start || "top bottom", end: options.end || "top+=50% bottom", scrub: options.scrub ? +options.scrub : true } });
        const base = parseFloat(options.y || "100"), fan = +options.fan, ease = kfFx.ease(options.ease || "none", "none");
        chars.forEach((c) => {
          if (!c.textContent.trim()) { n = 0; return; }
          n += 1;
          tl.fromTo(c, { y: `${base + n * fan}%` }, { y: "0%", ease, duration: 1 }, 0);
        });
        return;
      }
      gsap.from(chars, {
        y: options.y || "120%", stagger: +(options.stagger ?? 0.05), ease: kfFx.ease(options.ease || "power1.out", "power1.out"),
        scrollTrigger: { trigger, ...(scroller && { scroller }), start: options.start || "top bottom", end: options.end || "top+=50% bottom", scrub: options.scrub ? +options.scrub : true },
      });
    });
    return () => { mm.revert(); el.innerHTML = original; el.removeAttribute("aria-label"); };
  });
})();
