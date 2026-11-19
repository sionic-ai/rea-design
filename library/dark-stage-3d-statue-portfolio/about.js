// About: the portrait card enters slightly enlarged, the handwritten title over the video is drawn, numbers count up, and the signature is drawn.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(".ab-hero__card", { scale: 0.94, opacity: 0, duration: 1, ease: "power2.out", delay: 0.15 });
    gsap.from(".ab-hero__h", { y: 30, opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.5 });
    gsap.to(".ab-hero__card .wf-img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".ab-hero__card", start: "top top", end: "bottom top", scrub: true } });

    const vt = gsap.timeline({ scrollTrigger: { trigger: ".ab-video", start: "top 60%" } });
    vt.from(".ab-video__frame", { scale: 0.92, opacity: 0, duration: 0.9, ease: "power2.out" })
      .from(".ab-video__who b", { opacity: 0, y: 10, duration: 0.5, ease: "power2.out" }, 0.6)
      .from(".ab-video__script path", { drawSVG: 0, duration: 1.6, ease: "power2.out" }, 0.9);
    bsVideo.bar(document.querySelector(".ab-video video"), document.querySelector(".ab-video__ctrl i b"));

    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count, dec = +(el.dataset.dec || 0);
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.4, ease: "power2.out", onUpdate: () => (el.textContent = o.v.toFixed(dec)), scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    gsap.from(".ab-sign path", { drawSVG: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.3, scrollTrigger: { trigger: ".ab-sign", start: "top 80%" } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  });
})();
