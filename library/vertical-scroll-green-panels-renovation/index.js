// In-section motion: Hero two-photo cross fade · photo pieces coming in · speech-bubble line blooming · overlay darkening · Contact form floating up
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => !matchMedia("(max-width: 768px)").matches;

  // Original swiper 6.3.4: starts 3.5s after load, fade crossFade · every 5s · 2.5s transition · no dragging
  const startSlides = () => {
    if (!window.Swiper) return;
    [".ow-fv1", ".ow-fv2"].forEach((sel) => new Swiper(sel, {
      loop: true, effect: "fade", fadeEffect: { crossFade: true },
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
      speed: reduce ? 0 : 2500, allowTouchMove: false,
    }));
  };
  const onLoad = () => setTimeout(startSlides, reduce ? 0 : 3500);
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad, { once: true });

  // Photo pieces: as in the original, screen height > Visible when the piece’s left − 500 is met (measured by left position since the panel is horizontal)
  const sa = [...document.querySelectorAll(".ow-sa")];
  const show = () => sa.forEach((el) => { if (reduce || innerHeight > el.getBoundingClientRect().left - 500) el.classList.add("is-show"); });
  const fuki01 = document.querySelector(".ow-fuki01"), fuki02 = document.querySelector(".ow-fuki02");
  const items = [...document.querySelectorAll(".ow-item")];
  const contactWrap = document.querySelector(".ow-contact-wrap");
  const steps = () => {
    const y = scrollY, h = innerHeight;
    if (y > h * 0.4 || reduce) fuki01?.classList.remove("is-zero");
    if (y > h * 1.4 || reduce) fuki02?.classList.remove("is-zero");
    items.forEach((it) => it.classList.toggle("is-bk", y > h * 1.5));
    contactWrap?.classList.toggle("is-bk", y > h * 3.5);
    show();
  };
  addEventListener("load", steps);
  addEventListener("scroll", steps, { passive: true });
  steps();

  // Contact form: original as is, fix_img 350% top → #contact 400% bottom, scrub 1
  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px)", () => {
    if (reduce) { gsap.set("#contact", { opacity: 1 }); return; }
    gsap.fromTo("#contact", {}, { opacity: 1, ease: "none", scrollTrigger: { trigger: ".ow-fiximg", endTrigger: "#contact", start: "350% top", end: "400% bottom", scrub: 1, invalidateOnRefresh: true } });
  });
  // Phone: entering the contact section covers the screen with a grain curtain (original contact_sp_wrap.mv)
  mm.add("(max-width: 768px)", () => {
    const st = ScrollTrigger.create({ trigger: contactWrap, start: "top 30%", onToggle: (s) => contactWrap.classList.toggle("is-bk", s.isActive) });
    return () => st.kill();
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
