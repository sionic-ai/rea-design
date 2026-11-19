// About: hovering a word switches its slider on in .1s (sections switch immediately every .4s) and it is pushed ±10vw · ±10vh following the mouse over the Hero (.2 per frame).
// Rolling down turns the slider off in .1s. A text block appears once it rises from the bottom of the screen by data-sn-rise % (default 30, customers 35, second paragraph 45, contact 5)
// Rises in .7s below 5vw, and the line draws 0→100% in .5s at 30%
(() => {
  const { reduce, ce } = window.snSite;
  gsap.registerPlugin(ScrollTrigger);
  const wrap = document.querySelector("[data-sn-sliders]");
  const intro = document.querySelector("[data-sn-intro]");
  const sliders = new Map([...document.querySelectorAll("[data-sn-slider]")].map((s) => [s.getAttribute("data-sn-slider"), s]));

  sliders.forEach((s) => {
    const slides = [...s.querySelectorAll("[data-sn-slide]")];
    let i = 0;
    slides[0]?.classList.add("is-on");
    if (reduce || slides.length < 2) return;
    setInterval(() => {
      slides[i].classList.remove("is-on");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-on");
    }, 400);
  });

  const show = (s, on) => gsap.to(s, { opacity: on ? 1 : 0, duration: reduce ? 0 : 0.1, ease: "none", overwrite: true });
  document.querySelectorAll("[data-sn-hot]").forEach((word) => {
    const s = sliders.get(word.getAttribute("data-sn-hot"));
    if (!s) return;
    word.addEventListener("mouseenter", () => show(s, true));
    word.addEventListener("mouseleave", () => show(s, false));
  });

  let lastY = scrollY;
  addEventListener("scroll", () => {
    if (scrollY > lastY) sliders.forEach((s) => show(s, false));
    lastY = scrollY;
  }, { passive: true });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const want = { x: 0.5, y: 0.5 }, at = { x: 0.5, y: 0.5 };
    const move = (e) => {
      const r = intro.getBoundingClientRect();
      want.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      want.y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    };
    const tick = () => {
      const k = 0.2;
      at.x += (want.x - at.x) * k;
      at.y += (want.y - at.y) * k;
      gsap.set(wrap, { x: (at.x - 0.5) * 2 * innerWidth * 0.1, y: (at.y - 0.5) * 2 * innerHeight * 0.1 });
    };
    intro.addEventListener("mousemove", move);
    gsap.ticker.add(tick);

    const riseEase = ce("0.023,0.664,0.298,0.944", "expo.out");
    document.querySelectorAll("[data-sn-rise]").forEach((el) => {
      gsap.set(el, { display: el.tagName === "SPAN" ? "inline-block" : null });
      const offset = +(el.getAttribute("data-sn-rise") || 30);
      gsap.timeline({ scrollTrigger: { trigger: el, start: `top ${100 - offset}%`, once: true } })
        .fromTo(el, { y: () => innerWidth * 0.05 }, { y: 0, duration: 0.7, ease: riseEase }, 0)
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" }, 0.1);
    });
    const ruleEase = ce("0.25,0.25,0.339,0.98", "power2.out");
    document.querySelectorAll("[data-sn-rule]").forEach((el) => {
      gsap.fromTo(el, { width: "0%" }, { width: "100%", duration: 0.5, ease: ruleEase, scrollTrigger: { trigger: el, start: "top 70%", once: true } });
    });
    return () => {
      intro.removeEventListener("mousemove", move);
      gsap.ticker.remove(tick);
      gsap.set(wrap, { clearProps: "transform" });
    };
  });
})();
