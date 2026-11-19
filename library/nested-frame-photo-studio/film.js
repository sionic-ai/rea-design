// Service 2: stair window header (spreads to fill the screen with pinned scrub) → three overlapping videos → big text·panels pass over a pinned aerial video → three vertical videos.
// Split the original 769px-and-up and below branches as they are with gsap.matchMedia.
// When arriving from another page the header timeline is kept paused and played with start (original autoplay:false)
FW.page("film", (box, { k, internal }) => {
  const $ = (s, r = box) => r.querySelector(s);
  const $$ = (s, r = box) => [...r.querySelectorAll(s)];

  // Collapse and expand the flight description panel on phone (tap the bar or swipe up/down)
  const sheet = $(".vd__sheet"), bar = $(".vd__bar");
  const fold = (on) => {
    const c = typeof on === "boolean" ? on : !sheet.classList.contains("is-collapsed");
    sheet.classList.toggle("is-collapsed", c);
    bar.setAttribute("aria-expanded", String(!c));
  };
  sheet.addEventListener("click", (e) => {
    if (innerWidth > 768) return;
    if (e.target.closest(".vd__bar") || sheet.classList.contains("is-collapsed")) { e.preventDefault(); fold(); }
  });
  let y0 = 0, x0 = 0;
  sheet.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    const dy = e.changedTouches[0].clientY - y0, dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx)) fold(dy > 0);
  }, { passive: true });

  if (FW.reduced) {
    gsap.set([".fw-line"], { opacity: 1, y: 0, rotate: 0 });
    return {};
  }

  const title = $$(".vh__title .fw-line"), tags = $$(".vh__tag"), copy = $$(".vh__copy .fw-line"), media = $(".vh__media"), inner = $(".vh__inner .wf-img");
  const mm = k.mm;
  let heroTl = null;

  mm.add("(min-width: 769px)", () => {
    gsap.set(tags, { y: 20, opacity: 0 });
    gsap.set(inner, { scale: 1.1, xPercent: -2 });
    heroTl = gsap.timeline({ paused: internal })
      .to(title, { y: "0%", rotate: 0, opacity: 1, duration: 1.05, ease: "power3.out" }, 0.1)
      .to(tags, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, 0.35)
      .to(copy, { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.25)
      .to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.inOut" }, 0.2)
      .to(inner, { scale: 1, xPercent: 0, duration: 1.8, ease: "power2.out" }, 0.2);

    const time = $(".vh__tag.is-time");
    const pin = gsap.timeline({ scrollTrigger: { trigger: ".vh__wrap", start: "top 25%", end: "+=100%", scrub: 1, pin: ".vh", pinSpacing: true } });
    pin.to([".vh__type", ".vh__copy"], { y: "-100vh", duration: 1, ease: "none" }, 0)
      .to([".vh__type", ".vh__copy"], { opacity: 0, duration: 0.4, ease: "none" }, 0.25)
      .fromTo(".vh__wrap",
        { clipPath: "polygon(62% 0%, 100% 0%, 100% 75%, 70% 75%, 70% 100%, 0% 100%, 0% 45%, 62% 45%)" },
        { top: "4vw", bottom: "4vw", clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%, 0% 100%, 0% 0%, 0% 0%)", duration: 1, ease: "power1.inOut" }, 0)
      .to(time, { duration: 1, onUpdate() { const p = this.progress(); time.textContent = `[ 00:00:0${p > 0.8 ? 3 : p > 0.5 ? 2 : p > 0.2 ? 1 : 0} ]`; } }, 0);

    const lines = $$(".vm__line"), paras = $$(".vm__pline");
    gsap.set(".vm__label", { y: 20, opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".vm", start: "top 75%" } })
      .to(".vm__label", { y: 0, opacity: 0.6, duration: 0.8, ease: "power3.out" }, 0)
      .to(lines, { y: "0%", rotation: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" }, 0.2)
      .to(paras, { y: "0%", rotation: 0, duration: 1, stagger: 0.1, ease: "power3.out" }, 0.6);
    $$(".vm__wrap").forEach((w, n) => gsap.to(w, { y: -150 - n * 120, ease: "none", scrollTrigger: { trigger: ".vm", start: "top bottom", end: "bottom top", scrub: true } }));
    $$(".vm__img").forEach((im) => gsap.to(im, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".vm", start: "top bottom", end: "bottom top", scrub: true } }));

    gsap.timeline({ scrollTrigger: { trigger: ".vd__intro", start: "top 75%" } })
      .to($$(".vd__hline"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0)
      .to($$(".vd__pline"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.25);
    gsap.timeline({ scrollTrigger: { trigger: ".vd__stage", start: "top top", end: "+=250%", scrub: 1, pin: true, pinSpacing: false } })
      .to(".vd__huge", { xPercent: -100, x: "-100vw", ease: "none", duration: 0.6 }, 0)
      .to(sheet, { x: "0%", ease: "power2.out", duration: 0.2 }, 0.35)
      .to(sheet, { x: "100%", ease: "power2.in", duration: 0.2 }, 0.7);

    reels(1.2, 0.15);
    gsap.timeline({ scrollTrigger: { trigger: ".vr", start: "top bottom", end: "bottom top", scrub: 1 } })
      .to(".vr__line.is-a", { x: "-2vw", ease: "none" }, 0)
      .to(".vr__line.is-b", { x: "2vw", ease: "none" }, 0)
      .to(".vr__frame.is-1", { y: "-6vh", ease: "none" }, 0)
      .to(".vr__frame.is-2", { y: "-2vh", ease: "none" }, 0)
      .to(".vr__frame.is-3", { y: "-8vh", ease: "none" }, 0);
  });

  mm.add("(max-width: 768px)", () => {
    gsap.set(title, { rotation: 2 });
    gsap.set(tags, { y: 20, opacity: 0 });
    gsap.set(inner, { scale: 1.1, xPercent: -2 });
    heroTl = gsap.timeline({ paused: internal })
      .to(title, { y: "0%", rotation: 0, opacity: 1, duration: 1.4, ease: "power4.out" }, 0.1)
      .to(tags, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, 0.5)
      .to(copy, { y: "0%", rotation: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power3.out" }, 0.7)
      .to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power3.inOut" }, 0.3)
      .to(inner, { scale: 1, xPercent: 0, duration: 2, ease: "power2.out" }, 0.3);

    gsap.set(".vm__label", { y: 20, opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".vm", start: "top 75%" } })
      .to(".vm__label", { y: 0, opacity: 0.6, duration: 0.8, ease: "power3.out" }, 0)
      .to($$(".vm__line"), { y: "0%", rotation: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" }, 0.2)
      .to($$(".vm__pline"), { y: "0%", rotation: 0, duration: 1, stagger: 0.1, ease: "power3.out" }, 0.6);
    $$(".vm__wrap").forEach((w, n) => gsap.to(w, { y: -80 - n * 60, ease: "none", scrollTrigger: { trigger: ".vm", start: "top bottom", end: "bottom top", scrub: true } }));
    $$(".vm__img").forEach((im) => gsap.to(im, { yPercent: 15, ease: "none", scrollTrigger: { trigger: ".vm", start: "top bottom", end: "bottom top", scrub: true } }));

    gsap.timeline({ scrollTrigger: { trigger: ".vd__intro", start: "top 75%" } })
      .to($$(".vd__hline"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0)
      .to($$(".vd__pline"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.25);
    gsap.set(".vd__huge", { x: 0, opacity: 0 });
    gsap.set(sheet, { opacity: 0, clearProps: "x,y,transform" });
    gsap.timeline({ scrollTrigger: { trigger: ".vd__stage", start: "top 80%" } })
      .to(".vd__huge", { opacity: 0.2, duration: 1 }, 0)
      .to(sheet, { opacity: 1, ease: "power2.out", duration: 0.8 }, 0.4);

    reels(1.2, 0.15);
  });

  function reels(dur, stagger) {
    gsap.set(".vr__meta span", { opacity: 0, y: 15 });
    gsap.timeline({ scrollTrigger: { trigger: ".vr", start: "top 70%" } })
      .to([".vr__line.is-a", ".vr__line.is-b"], { y: "0%", rotation: 0, duration: dur, stagger, ease: "power3.out" }, 0)
      .to(".vr__frame.is-1", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.out" }, 0.2)
      .to(".vr__frame.is-2", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.out" }, 0.3)
      .to(".vr__frame.is-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.out" }, 0.4)
      .to(".vr__meta span", { opacity: 0.6, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }, 0.4)
      .to($$(".vr__cline"), { y: "0%", rotation: 0, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.45);
  }

  FW.cta($(".fw-cta"));
  return { start: () => heroTl?.play() };
});
