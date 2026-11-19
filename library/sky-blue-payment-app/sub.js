// Scroll choreography on sub pages — the original Webflow While scrolling group moved to ScrollTrigger scrub with the same ranges and values (original smoothing 50~60 ≒ scrub .5~.6)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const OUT_CIRC = "circ.out";
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Wide photo header: while the cell passes, the inner photo moves 30px up from the 55% mark to the 90% mark
    document.querySelectorAll("[data-kv-par]").forEach((box) => {
      const img = box.firstElementChild;
      const span = () => innerHeight + box.offsetHeight;
      gsap.fromTo(img, { y: 0 }, { y: -30, ease: "none", scrollTrigger: { trigger: box, start: () => `top+=${-innerHeight + span() * 0.55} top`, end: () => `top+=${-innerHeight + span() * 0.9} top`, scrub: 0.5 } });
    });
    // The big sky-blue circle of the deposit method: from 10vh below at .8 scale up to the 80% position at −5vh (curve inOutQuart).
    const att = document.querySelector("[data-attention]");
    if (att) gsap.fromTo(att, { y: () => innerHeight * 0.1, scale: 0.8 }, { y: () => -innerHeight * 0.05, ease: "power3.inOut", scrollTrigger: { trigger: att.parentElement, start: "top bottom", end: () => `+=${(innerHeight + att.parentElement.offsetHeight) * 0.8}`, scrub: 0.6 } });

    // Recruiting hero: after everything is drawn (original PAGE_FINISH = Window load) Vision and three lines of big text rise from below 100% over .8s (delayed 0 · .1 · .15 · .2s), the description fades in over .3s starting at .8s and rises over .8s starting at 1s
    const rk = (k) => document.querySelector(`[data-rk="${k}"]`);
    if (rk(1)) {
      const tl = gsap.timeline({ paused: true });
      const go = () => tl.play();
      if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
      [0, 1, 2, 3].forEach((k, i) => rk(k) && tl.fromTo(rk(k), { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: OUT_CIRC }, [0, 0.1, 0.15, 0.2][i]));
      const d = rk("desc");
      if (d) {
        tl.fromTo(d, { yPercent: 100, opacity: 0 }, { opacity: 1, duration: 0.3, ease: "circ.inOut" }, 0.8);
        tl.to(d, { yPercent: 0, duration: 0.8, ease: OUT_CIRC }, 1.0);
      }
    }
    // Big English (Our Future …): as the section enters, it rises from 1em below up to the 47% mark (curve in that range is outCirc)
    document.querySelectorAll("[data-en]").forEach((t) => {
      const sec = t.closest("section");
      gsap.fromTo(t, { y: () => parseFloat(getComputedStyle(t).fontSize) }, { y: 0, ease: OUT_CIRC, scrollTrigger: { trigger: sec, start: "top bottom", end: () => `+=${(innerHeight + sec.offsetHeight) * 0.47}`, scrub: 0.6 } });
    });
    // Mission photo: from the 18% mark to the end, the inside shifts −18%
    const mi = document.querySelector("[data-mission-img] .wf-img");
    if (mi) gsap.fromTo(mi, { yPercent: 0 }, { yPercent: -18, ease: "none", scrollTrigger: { trigger: mi.closest("section"), start: () => `top+=${-innerHeight + (innerHeight + mi.closest("section").offsetHeight) * 0.18} top`, end: "bottom top", scrub: 0.6 } });
  });
})();
