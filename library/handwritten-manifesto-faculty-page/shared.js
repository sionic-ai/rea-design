// Hero — exactly the original timeline: loading text 1s power3.inOut on → 2s expo.out off, 1.2s handwritten title · 1.5s lead line (on phones the two are in reverse order) ·
// 1.7s image 3s power3.out · 1.9s cloud 2s power2.inOut (curtain removed and scroll released at this point). Then scroll on/off for header line · badge · image.
(() => {
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const badge = $(".nh-badge");
  if (badge) badge.style.top = `${innerHeight - 300}px`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap) { body.classList.remove("is-loading"); return; }
  gsap.registerPlugin(ScrollTrigger);
  const freeLoader = () => { body.classList.remove("is-loading"); const l = $(".nh-loading"); if (l) l.remove(); };
  const finals = () => {
    gsap.set([".nh-statement", ".nh-statement__top", ".nh-statement__title", ".nh-statement__illust", ".nh-cloud"].filter((s) => $(s)), { opacity: 1 });
    freeLoader();
  };
  if (reduce) { finals(); gsap.set(".nh-header", { opacity: 1 }); return; }

  const tog = (target, vars, trigger, start) => {
    if (!$(target) || !$(trigger)) return;
    gsap.to(target, { ...vars, scrollTrigger: { trigger, start, toggleActions: "play none none reverse" } });
  };
  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 1100px)", sp: "(max-width: 1099px)" }, (ctx) => {
    const pc = ctx.conditions.pc;
    const tl = gsap.timeline({ onComplete: () => { if (!pc) spScroll(); } });
    if (pc) tl.eventCallback("onStart", () => gsap.set(".nh-statement__illust", { opacity: 0 }));
    else gsap.set(".nh-statement", { opacity: 1 });
    tl.to(".nh-loading__inner", { duration: 1, ease: "power3.inOut", opacity: 1 }, 0)
      .to(".nh-loading__inner", { onStart: () => { if (pc) gsap.set(".nh-statement", { opacity: 1 }); }, duration: 2, ease: "expo.out", opacity: 0 })
      .to(pc ? ".nh-statement__title" : ".nh-statement__top", { duration: 2, ease: "expo.out", opacity: 1 }, 1.2)
      .to(pc ? ".nh-statement__top" : ".nh-statement__title", { duration: 2, ease: "expo.out", opacity: 1 }, 1.5)
      .to(".nh-statement__illust", { duration: 3, ease: "power3.out", opacity: 1 }, 1.7)
      .to(".nh-cloud", { onStart: freeLoader, duration: 2, ease: "power2.inOut", opacity: 1 }, 1.9);
    if (pc) {
      tog(".nh-header", { duration: 0.8, ease: "expo.out", opacity: 1 }, ".nh-statement__header", "bottom center");
      tog(".nh-badge", { duration: 0.8, ease: "expo.out", opacity: 0 }, ".nh-statement__paragraph", "top bottom-=50");
      tog(".nh-statement__illust", { duration: 1, ease: "power4.out", opacity: 0 }, ".nh-statement__paragraph", "bottom center+=200");
    }
    function spScroll() {
      tog(".nh-badge", { duration: 0.8, ease: "expo.out", opacity: 0 }, ".nh-statement__paragraph", "top bottom-=50");
      tog(".nh-cloud__i.is-1", { duration: 0.5, ease: "expo.out", opacity: 0 }, ".nh-statement__paragraph", "top center+=100");
      tog(".nh-statement__top", { duration: 0.8, ease: "expo.out", opacity: 0 }, ".nh-statement__paragraph", "top bottom-=100");
      tog(".nh-statement__title", { duration: 0.8, ease: "expo.out", opacity: 0 }, ".nh-statement__paragraph", "top bottom-=100");
      tog(".nh-header", { duration: 0.8, ease: "expo.out", opacity: 1 }, ".nh-statement__paragraph", "top bottom-=100");
      tog(".nh-statement__illust", { duration: 2, ease: "power3.out", opacity: 0 }, ".nh-statement__paragraph", "bottom center");
      document.querySelectorAll(".nh-statement__paragraph p").forEach((p) => {
        gsap.to(p, { duration: 1, ease: "expo.out", y: -1, opacity: 0, scrollTrigger: { trigger: p, start: "top top+=100", toggleActions: "play none none reverse" } });
      });
    }
    return () => freeLoader();
  });
})();
