(() => {
  // Hero curtain — a small circle at top left turns on in .25s and the wordmark letters at the bottom rise from 150% below in 1s power1.inOut (letter stagger total .15s).
  // Inside the circle a progress ring (stroke-dashoffset) fills with sine over fill, rests 1s, then the wordmark rises to the page’s same wordmark spot (to) in 1s power2.inOut and overlaps it.
  // At that moment remove the curtain, turn on the reveal targets (header menu) in .5s with a .05s stagger, and fire fx:done.
  kfFx.register("ring-logo-loader", (el, { options, reduce }) => {
    const logo = el.querySelector('[data-fx-part="logo"]');
    const chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    const ringWrap = el.querySelector('[data-fx-part="ring-wrap"]');
    const ring = el.querySelector('[data-fx-part="ring"]');
    const reveal = options.reveal ? [...document.querySelectorAll(options.reveal)] : [];
    const done = () => { el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (!window.gsap || !logo) { el.style.display = "none"; done(); return () => { el.style.display = ""; }; }
    if (reduce) { gsap.set(el, { autoAlpha: 0 }); done(); return () => gsap.set(el, { clearProps: "all" }); }
    const rise = +(options.rise ?? 1), fill = +(options.fill ?? 0.5), wait = +(options.wait ?? 1), dock = +(options.dock ?? 1), at = +(options["fill-at"] ?? 0.25);
    const len = ring && ring.getTotalLength ? ring.getTotalLength() : 0;
    if (ring) gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
    if (reveal.length) gsap.set(reveal, { autoAlpha: 0 });
    // delay — seconds to wait with only the curtain laid. The original is an empty curtain for about 1.15s until the app wakes up and starts fetching fonts
    const tl = gsap.timeline({ delay: +(options.delay ?? 0) });
    if (ringWrap) tl.fromTo(ringWrap, { alpha: 0 }, { duration: 0.25, alpha: 1, ease: "power1.inOut" }, 0);
    if (chars.length) tl.fromTo(chars, { y: "150%" }, { duration: rise, y: "0%", ease: "power1.inOut", stagger: { amount: +(options.stagger ?? 0.15) } }, 0);
    if (ring) tl.to(ring, { duration: fill, strokeDashoffset: 0, ease: "sine" }, at);
    // Where the wordmark lands — its top edge is aligned with the same wordmark (to) on the page
    const target = options.to ? document.querySelector(options.to) : null;
    tl.to(logo, { duration: dock, ease: "power2.inOut", y: () => (target ? target.getBoundingClientRect().top - logo.getBoundingClientRect().top + (+gsap.getProperty(logo, "y") || 0) : 0) }, at + fill + wait);
    tl.add(() => {
      gsap.set(el, { autoAlpha: 0 });
      if (reveal.length) gsap.to(reveal, { duration: 0.5, autoAlpha: 1, stagger: 0.05 });
      done();
    });
    return () => { tl.kill(); gsap.set([el, logo, ...chars, ringWrap, ring, ...reveal].filter(Boolean), { clearProps: "all" }); };
  });
})();
