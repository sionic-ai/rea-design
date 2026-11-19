// Work detail — the illustration rises from the bottom of the screen (100vh) with 1s power4.out and the title follows .1 later (original work transition),
// Text paragraphs fill from the left (.9s power3.out), lines are drawn, and the 14 moons in the last ”keep scrolling” line fill as far as the scroll goes, then it moves on to the list.
(() => {
  const { reduce } = window.PS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.addEventListener("ps:ready", () => {
    const moons = $(".d-moons");
    for (let i = 0; i < 14; i++) moons.append(document.createElement("li"));
    const ring = $(".d-progress .on");
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      ring.style.strokeDashoffset = String(1 - scrollY / Math.max(1, max));
    };
    addEventListener("scroll", upd, { passive: true });
    upd();
    if (reduce) { $$(".d-text__d .fill").forEach((f) => (f.style.backgroundPosition = "0 0")); return; }

    gsap.timeline()
      .from(".d-illu__img", { y: "100vh", duration: 1, ease: "power4.out" })
      .from([".d-back", ".d-illu__cue"], { opacity: 0, duration: 0.75, ease: "power3.out" }, "<0.5")
      .from(".d-hero__title, .d-hero__sub", { y: "100vh", duration: 1, ease: "power4.out", stagger: 0.1 }, "<0.2");
    gsap.to(".d-illu__img", { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".d-illu", start: "top top", end: "bottom top", scrub: true } });

    $$(".d-text__grid").forEach((g) => {
      gsap.timeline({ scrollTrigger: { trigger: g, start: "top 90%" } })
        .from($(".d-text__t", g), { opacity: 0, duration: 0.6, ease: "power3.out" }, 0)
        .fromTo($(".fill", g), { backgroundPosition: "100% 0%" }, { backgroundPosition: "0% 0%", duration: 0.9, ease: "power3.out" }, 0.2);
    });
    $$(".d-num__t .ps-line").forEach((l) => gsap.fromTo(l, { width: "0%" }, { width: "100%", duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: l, start: "top 90%" } }));
    $$(".d-media").forEach((m) => gsap.from(m, { opacity: 0, y: 60, duration: 1, ease: "power3.out", scrollTrigger: { trigger: m, start: "top 95%" } }));
    $$("[data-count]").forEach((el) => {
      const to = Number(el.dataset.count), suf = el.dataset.suffix || "", o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 1, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-US") + suf) }) });
    });
    // Open button: when visible it opens from the center 35% to both sides over 1s power2.out and the line is drawn along with it
    gsap.timeline({ scrollTrigger: { trigger: ".d-cta", start: "top 80%" } })
      .fromTo(".d-cta__btn", { clipPath: "inset(0% 35% round 64px)" }, { clipPath: "inset(0% 0% round 64px)", duration: 1, ease: "power2.out" })
      .fromTo(".d-cta .ps-line", { width: "0%" }, { width: "100%", duration: 1, ease: "power3.inOut" }, "<");
    // Keep scrolling to go to the list — moons fill one by one, and it moves on when full
    const ms = $$(".d-moons li");
    let gone = false, wheelAt = 0;
    addEventListener("wheel", () => (wheelAt = performance.now()), { passive: true });
    addEventListener("touchmove", () => (wheelAt = performance.now()), { passive: true });
    ScrollTrigger.create({ trigger: ".d-return", start: "top bottom", end: "bottom bottom", onUpdate: (s) => {
      const p = s.progress * ms.length;
      ms.forEach((m, i) => m.style.setProperty("--ph", String(gsap.utils.clamp(0, 1, p - i))));
      if (s.progress > 0.995 && !gone && performance.now() - wheelAt < 1000) { gone = true; $(".d-return__a").click(); }
    } });
  });
})();
