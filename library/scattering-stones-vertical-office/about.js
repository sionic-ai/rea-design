/* About us — entrance (body panel .5s → big stone appears .3s and untilts in steps(3) → title and stone title letters at .1s intervals → body lines),
   Eight forms (circle → text → picture settles in place with steps(3)), people About fade-up, rice ball, face logo blink */
(() => {
  if (!window.gsap) return;
  const reduce = Tanu.reduce;

  const entrance = () => {
    const t = new SplitText(".js-fv-title", { type: "chars", charsClass: "cChar" }), st = new SplitText(".js-fv-stone-title", { type: "chars", charsClass: "cChar" });
    const lines = [];
    document.querySelectorAll(".js-fv-split-text").forEach((e) => {
      if (getComputedStyle(e).display !== "none") e.querySelectorAll(".js-fv-split-text-item").forEach((p) => lines.push(...new SplitText(p, { type: "lines", linesClass: "cLine" }).lines));
    });
    if (reduce) { gsap.set([".js-page", ".js-fv-stone", ...t.chars, ...st.chars, ...lines], { opacity: 1 }); return; }
    gsap.set([...t.chars, ...st.chars, ...lines], { opacity: 0 });
    gsap.set(".js-fv-stone", { opacity: 0, y: -20, rotate: innerWidth >= 960 ? -15 : 0 });
    Tanu.fonts().then(() => {
      const tl = gsap.timeline();
      tl.to(".js-page", { opacity: 1, duration: 0.5, ease: "sine.out" })
        .to(".js-fv-stone", { opacity: 1, duration: 0.3, ease: "sine.out" })
        .to(".js-fv-stone", { y: 0, rotate: 0, duration: 0.35, ease: "steps(3)" })
        .to(t.chars, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "power4.out" })
        .to(st.chars, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "power4.out" }, "-=0.3")
        .to(lines, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "power4.out" }, "<");
      Tanu.registerEntrance?.(tl);
    });
  };

  const hasso = () => {
    if (reduce) { gsap.set(".js-tanuki-circle, .js-tanuki-text", { opacity: 1 }); return; }
    gsap.set(".js-tanuki-icon", { xPercent: () => gsap.utils.random(-10, 10), yPercent: () => gsap.utils.random(10, 10), rotation: () => gsap.utils.random(-25, 25), opacity: 0 });
    gsap.utils.toArray(".js-tanuki").forEach((t) => {
      gsap.timeline({ scrollTrigger: { trigger: t, start: "top 80%", toggleActions: "play none none none" } })
        .to(t.querySelector(".js-tanuki-circle"), { opacity: 1, duration: 0.3, ease: "sine.out" })
        .to(t.querySelector(".js-tanuki-text"), { opacity: 1, duration: 0.3, ease: "sine.out" })
        .to(t.querySelector(".js-tanuki-icon"), { opacity: 1, duration: 0.6, ease: "sine.out" })
        .to(t.querySelector(".js-tanuki-icon"), { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.35, ease: "steps(3)" }, "<");
    });
  };

  /* Face logo — while visible, eyes open for .1s after .5s, close after 1.5s, then rest 4s */
  const logoBlink = () => {
    const box = document.querySelector(".js-logo-illust"), eye = document.querySelector(".js-logo-illust-hover");
    if (!box || !eye || reduce) return;
    let tl = null;
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { tl?.kill(); tl = gsap.timeline({ repeat: -1 }).to(eye, { opacity: 1, duration: 0.1, delay: 0.5 }).to(eye, { opacity: 0, duration: 0.1, delay: 1.5 }).to({}, { duration: 4 }); }
      else { tl?.kill(); tl = null; gsap.set(eye, { opacity: 0 }); }
    }), { threshold: 0 }).observe(box);
  };

  document.addEventListener("DOMContentLoaded", () => {
    entrance();
    Tanu.split();
    hasso();
    Tanu.reveal();
    Tanu.tegaki();
    logoBlink();
    const targets = gsap.utils.toArray(".js-scroll-target");
    if (reduce) gsap.set(targets, { y: 0, opacity: 1 });
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { gsap.to(e.target, { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px -40% 0px" });
      targets.forEach((t) => io.observe(t));
    }
    gsap.utils.toArray(".js-staff-onigiri").forEach((o) => {
      if (reduce) return;
      gsap.set(o, { opacity: 0, x: gsap.utils.random(-10, 10), y: gsap.utils.random(-10, 10), rotate: gsap.utils.random(-30, 30) });
      gsap.timeline({ scrollTrigger: { trigger: o, start: "top 80%" } }).to(o, { opacity: 1, duration: 0.6, ease: "sine.out" }).to(o, { x: 0, y: 0, rotate: 0, duration: 0.35, ease: "steps(3)" }, "<");
    });
  });
})();
