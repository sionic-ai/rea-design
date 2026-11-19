// First page — original values as they are:
// Loader: bar 0→100% 1.2s power2.inOut → (+.2s) inner y -20 and fade .4s power2.out → (-.2s) a round hole opens from bottom center over 1.5s power2.inOut (transparent v% to opaque v+30%, v -30→150).
// Hero entrance: title · text · photo · round button go y 40→0, transparent → visible 1.2s power3.out, .15s apart. The original calls this once under the loader and once more when the hole starts to open —
// So through the hole you only see the already-lit chunk rising again from 40px below.
// Hero photo: Splide fade (rewind · auto 6s · transition 2.5s) + 1.15→1x over 6s on each change.
// Pinning: +2000 below the header, scrub 1.5 — with text y -30 and fade (.8, .1 stagger) the photo widens to 100vw×100vh, holds for a beat, then shrinks to .95x and disappears.
// Section rise: when the section head reaches 75% of the screen, the inner blocks move y 40→0, 1.5s power3.out, .15s stagger (once).
// Floating news: after 50px of scroll, y 20 · transparent in .4s power2.out, and it returns when back at the top. Rabbit button: appears when the hero’s bottom edge reaches the bottom of the screen, on click, curtain .4s power2.out + panel x 100%→0 .6s expo.out.
// Collage strip: enters from 100px to the right, transparent, over 1.5s power2.out, then moves endlessly 25% per 40s.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const { reduced } = window.DD;
  const hero = document.querySelector(".dd-hero");
  const visual = hero.querySelector(".dd-hero__visual");
  const header = () => document.querySelector(".dd-header")?.offsetHeight || 0;
  const heroParts = [".dd-hero__title", ".dd-hero__catch", ".dd-hero__visual", ".dd-hero__scroll"];

  // ── Hero Reveal ──
  const intro = () => {
    if (reduced) return gsap.set(heroParts, { autoAlpha: 1 });
    gsap.set(heroParts, { y: 40 });
    gsap.to(heroParts, { y: 0, autoAlpha: 1, duration: 1.2, ease: "power3.out", stagger: 0.15, clearProps: "transform" });
  };

  // ── Loader ──
  const loading = document.querySelector(".dd-loading");
  const unlock = () => document.body.classList.remove("is-locked");
  intro();
  if (!loading || reduced) {
    loading?.remove();
  } else {
    document.body.classList.add("is-locked");
    setTimeout(() => { if (loading.isConnected) { loading.remove(); unlock(); } }, 8000);
    const hole = { v: -30 };
    const paint = () => {
      const m = `radial-gradient(circle at 50% 100%, transparent ${Math.max(0, hole.v)}%, var(--kf-ink) ${Math.max(0, hole.v + 30)}%)`;
      loading.style.webkitMaskImage = m;
      loading.style.maskImage = m;
    };
    paint();
    gsap.timeline({ onComplete: () => loading.remove() })
      .to(loading.querySelector(".dd-loading__progress i"), { width: "100%", duration: 1.2, ease: "power2.inOut", force3D: true })
      .to(loading.querySelector(".dd-loading__inner"), { y: -20, opacity: 0, duration: 0.4, ease: "power2.out", force3D: true }, "+=0.2")
      .to(hole, { v: 150, duration: 1.5, ease: "power2.inOut", onStart: () => { unlock(); intro(); }, onUpdate: paint }, "-=0.2");
  }

  // ── Hero photo swap (Splide fade) ──
  const slider = new Splide(hero.querySelector(".dd-hero__slider"), {
    type: "fade", rewind: true, autoplay: !reduced, interval: 6000, speed: 2500,
    arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false,
  });
  slider.on("mounted active", () => {
    if (reduced) return;
    const img = slider.Components.Elements.slides[slider.index].querySelector(".dd-hero__img");
    gsap.killTweensOf(img);
    gsap.fromTo(img, { scale: 1.15, transformOrigin: "center center" }, { scale: 1, duration: 6, ease: "none", transformOrigin: "center center" });
  });
  slider.mount();

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // ── Pin it and spread out the photos ──
    const spacer = document.createElement("div");
    spacer.className = "dd-hero-spacer";
    gsap.set(spacer, { height: 1200 });
    hero.after(spacer);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: () => `top ${header()}px`, end: "+=2000", scrub: 1.5, pin: true, pinSpacing: false, pinType: "fixed", anticipatePin: 1, invalidateOnRefresh: true },
    });
    tl.fromTo(".dd-hero__title, .dd-hero__catch, .dd-hero__scroll", { opacity: 1, y: 0 }, { opacity: 0, y: -30, duration: 0.8, stagger: 0.1, ease: "none", immediateRender: false }, 0);
    tl.to(visual, { width: "100vw", height: "100vh", marginLeft: "calc(50% - 50vw)", y: () => -(visual.getBoundingClientRect().top - hero.getBoundingClientRect().top), ease: "none", duration: 1, force3D: true }, 0);
    tl.to({}, { duration: 1 });
    tl.to(visual, { opacity: 0, scale: 0.95, ease: "none", duration: 1, force3D: true });
    tl.to(hero, { autoAlpha: 0, duration: 0.01 });

    // ── Section Rising ──
    document.querySelectorAll("[data-reveal]").forEach((sec) => {
      const items = sec.querySelectorAll("[data-reveal-item]");
      if (!items.length) return;
      gsap.set(items, { y: 40, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: sec, start: "top 75%", once: true,
        onEnter: () => gsap.to(items, { y: 0, autoAlpha: 1, duration: 1.5, ease: "power3.out", stagger: 0.15, clearProps: "transform" }),
      });
    });

    return () => spacer.remove();
  });

  // ── Floating news ──
  const news = document.querySelector(".dd-float-news");
  ScrollTrigger.create({
    trigger: "body", start: "top -50",
    onEnter: () => gsap.to(news, { autoAlpha: 0, y: 20, duration: reduced ? 0 : 0.4, ease: "power2.out" }),
    onLeaveBack: () => gsap.to(news, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.4, ease: "power2.out" }),
  });

  // ── Rabbit button + topic drawer ──
  const rabbit = document.querySelector(".dd-rabbit");
  const topics = document.querySelector(".dd-topics");
  ScrollTrigger.create({ trigger: hero, start: "bottom 100%", once: true, onEnter: () => rabbit.classList.add("is-visible") });
  const drawer = gsap.timeline({ paused: true })
    .set(topics, { autoAlpha: 1 })
    .to(topics.querySelector(".dd-topics__overlay"), { opacity: 1, duration: reduced ? 0 : 0.4, ease: "power2.out" })
    .to(topics.querySelector(".dd-topics__body"), { x: "0%", duration: reduced ? 0 : 0.6, ease: "expo.out" }, "<");
  rabbit.addEventListener("click", () => {
    topics.classList.add("is-active");
    rabbit.setAttribute("aria-expanded", "true");
    topics.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    drawer.play();
  });
  const closeTopics = () =>
    drawer.reverse().then(() => {
      topics.classList.remove("is-active");
      rabbit.setAttribute("aria-expanded", "false");
      topics.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
    });
  topics.querySelectorAll(".js-topics-close").forEach((b) => b.addEventListener("click", closeTopics));

  // ── Vertical video modal: backdrop and panel fade in with .3s ease, and after a spinning ring the video reveals over .4s once loaded (the original’s video embed spot) ──
  const vmodal = document.querySelector(".dd-vmodal");
  const vbody = vmodal.querySelector(".dd-vmodal__body");
  document.querySelectorAll("[data-video]").forEach((a) =>
    a.addEventListener("click", (e) => {
      if (e.defaultPrevented || a.closest(".is-dragging")) return;
      e.preventDefault();
      vmodal.classList.toggle("is-horizontal", a.dataset.orientation === "horizontal");
      vmodal.classList.add("is-open", "is-loading");
      vmodal.classList.remove("is-loaded");
      vmodal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const v = document.createElement("video");
      Object.assign(v, { src: a.getAttribute("href"), autoplay: true, controls: true, playsInline: true, loop: true });
      v.setAttribute("aria-label", "Vertical video slot · 9:16");
      v.addEventListener("loadeddata", () => { vmodal.classList.remove("is-loading"); vmodal.classList.add("is-loaded"); }, { once: true });
      vbody.replaceChildren(v);
    }),
  );
  vmodal.querySelectorAll(".js-vmodal-close").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      vmodal.classList.remove("is-open", "is-loading", "is-loaded");
      vmodal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(() => vbody.replaceChildren(), 300);
    }),
  );
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (vmodal.classList.contains("is-open")) vmodal.querySelector(".js-vmodal-close").click();
    if (topics.classList.contains("is-active")) closeTopics();
  });

  // ── Collage strip (four sets laid end to end) ──
  const track = document.querySelector(".dd-collage__track");
  const set = track.firstElementChild;
  for (let i = 0; i < 3; i++) track.append(set.cloneNode(true));
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const t = gsap.timeline({ scrollTrigger: { trigger: "#aboutTeaser", start: "top 80%", once: true } });
    t.fromTo(track, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 1.5, ease: "power2.out" });
    t.add(() => gsap.to(track, { xPercent: -25, ease: "none", duration: 40, repeat: -1 }));
  });
})();
