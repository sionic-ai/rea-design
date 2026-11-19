// Attached and detached per page — the router swaps only the body, so every page loads this one file and picks by namespace.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // First page — original Top.intro_animation: text goes from 10px blur · 1.1x, after 1.6s runs 1.6s, photo from 4px blur (stays 1.02x), after 1.2s runs 2s.
  // Photos inside the recruiting section circle use a splide fade with 2 second autoplay (original Slider)
  FN.page("home", {
    ready(box) {
      const copy = box.querySelector(".fn-hero__copy"), img = box.querySelector(".fn-hero__image");
      const tweens = [];
      if (!reduce && copy && img) {
        tweens.push(gsap.fromTo(copy, { opacity: 0, filter: "blur(10px)", scale: 1.1 }, { delay: 1.6, duration: 1.6, opacity: 1, filter: "blur(0px)", scale: 1 }));
        tweens.push(gsap.fromTo(img, { filter: "blur(4px)", scale: 1.02 }, { delay: 1.2, duration: 2, filter: "blur(0px)" }));
      }
      let splide = null;
      const sl = box.querySelector("[data-recruit-slider]");
      if (sl && window.Splide) {
        splide = new Splide(sl, { type: "fade", rewind: true, gap: 0, pagination: false, arrows: false, drag: false, autoWidth: true, autoplay: !reduce, interval: 2000, focus: "center" });
        splide.mount();
      }
      return () => { tweens.forEach((t) => t.kill()); splide?.destroy(); };
    },
  });

  // Our Thinking — original Thought (VS): a three-ring graphic stays pinned on screen through the body and turns 0 → 180° (scrub 1, opacity .6)
  FN.page("about", {
    ready(box) {
      const wrap = box.querySelector(".fn-about__wrap"), bg = box.querySelector(".fn-about__bg");
      if (!wrap || !bg || reduce) return;
      gsap.set(bg, { opacity: 0.6 });
      const t = gsap.fromTo(bg, { rotate: 0 }, { rotate: 180, scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", pin: bg, pinSpacing: false, scrub: 1 } });
      return () => { t.scrollTrigger?.kill(); t.kill(); gsap.set(bg, { clearProps: "all" }); };
    },
  });

  // Services — original Service (FS): the left table of contents sticks 40px below the header (992px and up), and each section lights its TOC dot as it passes the screen center
  FN.page("service", {
    ready(box) {
      const inner = box.querySelector(".fn-svc__inner"), index = box.querySelector(".fn-svc__index");
      if (!inner || !index) return;
      const links = [...index.querySelectorAll("a")];
      const on = (a) => { links.forEach((l) => l.classList.remove("is-active")); a.classList.add("is-active"); };
      const mm = gsap.matchMedia();
      mm.add("(min-width: 992px)", () => {
        const top = (document.querySelector("[data-header]")?.offsetHeight || 75) + 40;
        ScrollTrigger.create({ trigger: inner, start: `top top+=${top}`, endTrigger: inner, end: () => `bottom top+=${top + index.offsetHeight}`, pin: index, pinSpacing: false });
        links.forEach((a) => {
          const sec = box.querySelector(a.getAttribute("href").replace(/^[^#]*/, ""));
          if (sec) ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onEnter: () => on(a), onEnterBack: () => on(a) });
        });
        const ro = new ResizeObserver(() => ScrollTrigger.refresh());
        ro.observe(inner);
        return () => ro.disconnect();
      });
      return () => mm.revert();
    },
  });
})();
