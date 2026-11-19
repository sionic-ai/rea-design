// Services — service row title words light up (same scrub 1.2 as the original), circle-window video (original services-promotion: from top 20%, text too once progress passes .19)
(() => {
  const { reduce } = G;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const start = () => {
    $$(".s-row__ttl").forEach((h) => {
      const words = G.splitWords(h);
      if (reduce) return;
      gsap.set(words, { opacity: 0.2 });
      gsap.to(words, { opacity: 1, duration: 0.18, ease: "none", stagger: { each: 0.16 }, scrollTrigger: { trigger: h, start: "top center+=20%", end: "bottom-=25% center", scrub: 1.2, invalidateOnRefresh: true } });
    });
    const sec = $(".s-mask"), img = $(".s-mask__img"), ttl = $(".s-mask__ttl"), video = $("video", img);
    if (reduce) { gsap.set([img, ttl], { clipPath: "circle(100% at 50% 50%)" }); return; }
    const tl = gsap.to([img, ttl], { clipPath: "circle(100% at 50% 50%)", duration: 1, ease: "none", paused: true });
    const set = (p) => { tl.progress(p); if (video.duration) video.currentTime = video.duration * p * 0.999; };
    ScrollTrigger.create({ trigger: sec, start: "top 20%", end: "bottom bottom", invalidateOnRefresh: true, onUpdate: (s) => set(s.progress), onEnter: (s) => set(s.progress), onEnterBack: (s) => set(s.progress), onLeaveBack: () => set(0), onLeave: () => set(1) });
  };
  G.boot(start);
})();
