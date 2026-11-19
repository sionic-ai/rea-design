// Shared by all pages — 85% screen line appearing, English label split into letters, support button expanding, phone menu, two fixed footer photo panels
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => innerWidth <= 768;
  const canHover = matchMedia("(any-hover: hover)").matches;

  // English labels wrap each letter in i and raise them in turn at .03s
  document.querySelectorAll(".un-sh__sub").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("i");
      s.textContent = ch;
      s.style.setProperty("--i", i);
      s.setAttribute("aria-hidden", "true");
      el.append(s);
    });
  });

  // Appearance — when the element’s top crosses the (85% − data-delay) line of the screen, add is-inview, with data-remove, remove it again when scrolled back down.
  const inviews = [...document.querySelectorAll("[data-inview]")];
  const handleInview = () => {
    const vh = innerHeight;
    inviews.forEach((el) => {
      const hit = el.getBoundingClientRect().top;
      const d = parseFloat(el.dataset.inviewDelay) || 0;
      if (hit > vh * (0.85 - d)) {
        if (el.dataset.remove === "true") el.classList.remove("is-inview");
      } else el.classList.add("is-inview");
    });
  };
  if (reduce) inviews.forEach((el) => el.classList.add("is-inview"));

  // Support button — opens on hover with a mouse, on tap for phones
  document.querySelectorAll(".un-entry").forEach((en) => {
    if (canHover && !isSp()) {
      en.addEventListener("mouseenter", () => en.classList.add("is-open"));
      en.addEventListener("mouseleave", () => en.classList.remove("is-open"));
    } else en.querySelector(".un-entry__btn")?.addEventListener("click", () => en.classList.toggle("is-open"));
  });

  // Phone menu — two button lines fold into an X in .5s and an ink-dark panel descends from the top in .4s
  const hbg = document.querySelector(".un-hbg__btn");
  hbg?.addEventListener("click", () => {
    const open = !hbg.classList.contains("is-open");
    hbg.classList.toggle("is-open", open);
    hbg.classList.toggle("is-close", !open);
    body.classList.toggle("is-nav-open", open);
    body.classList.toggle("is-scroll-stop", open);
    hbg.setAttribute("aria-expanded", String(open));
  });

  const footer = () => {
    if (reduce) return;
    const top = document.querySelector(".un-ftop");
    if (top) {
      gsap.timeline({ scrollTrigger: { trigger: top, start: "top top", end: "bottom top", scrub: true, pin: true, pinSpacing: false, anticipatePin: 0.1, invalidateOnRefresh: true } })
        .to(top.querySelector(".un-ftop__mask"), { opacity: 0.6, ease: "none" })
        .to(top.querySelector(".un-ftop__inner"), { scale: 1, ease: "none" }, "<");
    }
    const bottom = document.querySelector(".un-fbottom");
    if (bottom) {
      gsap.timeline({ scrollTrigger: { trigger: bottom, start: "bottom bottom", end: () => `+=${bottom.offsetHeight}`, scrub: true, pin: true, pinSpacing: false, anticipatePin: 0.1, invalidateOnRefresh: true } })
        .fromTo(bottom.querySelector(".un-fbottom__inner"), { y: "15vh" }, { y: 0, ease: "none" });
    }
  };

  const readyCbs = [];
  window.unSite = { isSp, reduce, canHover, onReady: (cb) => readyCbs.push(cb), refreshInview: handleInview };
  const start = () => {
    footer();
    readyCbs.forEach((cb) => cb());
    ScrollTrigger.refresh();
    if (!reduce) {
      handleInview();
      addEventListener("scroll", handleInview, { passive: true });
      addEventListener("resize", handleInview);
    }
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
