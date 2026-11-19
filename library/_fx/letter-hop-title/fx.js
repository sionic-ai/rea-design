// Original position values "<=0.125"·"<=0.45" Is previous tween start plus that value in GSAP
(() => {
  kfFx.register("letter-hop-title", (el, { options, reduce }) => {
    const line = el.querySelector("[data-fx-part=letters]");
    if (!line || !line.textContent.trim()) return;
    const sub = el.querySelector("[data-fx-part=sub]");
    const follows = [...el.querySelectorAll("[data-fx-part=follow]")];
    const original = line.innerHTML;
    line.innerHTML = [...line.textContent].map((c) => (c === " " ? " " : `<span class="fx-letter">${c}</span>`)).join("");
    const letters = [...line.querySelectorAll(".fx-letter")];
    if (reduce) return () => { line.innerHTML = original; };
    gsap.registerPlugin(ScrollTrigger);
    const each = +(options.each ?? 0.08), dur = +(options.dur ?? 0.125), hop = options.hop || "1rem";
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: options.start || "top 60%" } });
      tl.fromTo(letters, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, stagger: each })
        .to(letters, { y: `-${hop}`, duration: dur, stagger: each }, "<")
        .to(letters, { y: 0, duration: dur, stagger: each }, `<${dur}`);
      if (sub) tl.fromTo(sub, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: +(options["sub-dur"] ?? 0.8), ease: "power4.out" }, `<${+(options["sub-at"] ?? 0.45)}`);
      follows.forEach((f, i) => tl.fromTo(f, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, i ? "<" : "<0.3"));
    }, el);
    return () => { ctx.revert(); line.innerHTML = original; };
  });
})();
