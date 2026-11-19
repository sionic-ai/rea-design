// Services: the big title rises letter by letter, numbers count up from 0, and the usage list unfolds its height.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$(".sv-acc").forEach((acc) => {
    const head = acc.querySelector(".sv-acc__head"), body = acc.querySelector(".sv-acc__body");
    head.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", open);
      if (reduce) return;
      gsap.fromTo(body, { height: open ? 0 : body.scrollHeight }, { height: open ? "auto" : 0, duration: 0.45, ease: "power2.out", onComplete: () => ScrollTrigger.refresh() });
    });
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Groups letters into words so two English words do not break mid-word at phone width
    const split = new SplitText(".sv-hero__h span", { type: "words,chars" });
    gsap.from(split.chars, { yPercent: 60, opacity: 0, duration: 0.8, stagger: 0.03, ease: "power2.out", delay: 0.2 });
    gsap.from(".sv-hero__sub", { y: 20, opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.6 });
    $$("[data-count]").forEach((el) => {
      const to = +el.dataset.count;
      gsap.fromTo(el, { textContent: 0 }, { textContent: to, duration: 1.4, ease: "power2.out", snap: { textContent: 1 }, scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    // Left green marker line: visible only in the body range and redrawn each time it passes a section
    const mark = document.querySelector(".sv-mark");
    ScrollTrigger.create({ trigger: ".sv-col", endTrigger: ".bs-talk", start: "top 60%", end: "top 60%", onToggle: (st) => gsap.to(mark, { opacity: st.isActive ? 1 : 0, duration: 0.3 }) });
    $$(".sv-col, .sv-block, .sv-item").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 50%", onEnter: () => gsap.fromTo(mark, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "power2.out" }) }));
    // Fixed button: slides up from below after the hero
    gsap.from(".sv-ctas > *", { y: 30, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: ".sv-hero", start: "bottom 80%", toggleActions: "play none none reverse" } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
  });
})();
