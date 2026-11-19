// Scroll effects, slider, product dialog — same effect names and values as the original Layout.astro script.
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerEffect({ name: "fadeIn", defaults: { duration: 0.8, ease: "power4.out" }, effect: (t, c) => gsap.from(t, { autoAlpha: 0, ...c }), extendTimeline: true });
    gsap.registerEffect({ name: "pivot", defaults: { ease: "power4.out" }, effect: (t, c) => gsap.from(t, { yPercent: 50, ...c }), extendTimeline: true });
    gsap.registerEffect({ name: "maskOff", defaults: { ease: "power4.out" }, effect: (t, c) => gsap.to(t, { scaleY: 0, duration: 0.75, ...c }), extendTimeline: true });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const go = () => {
        gsap.to("#gg-firstview", { yPercent: 20, scrollTrigger: { trigger: "#gg-firstview", start: "top top", end: "bottom 20%", scrub: 0.8 } });
        gsap.timeline({ scrollTrigger: { trigger: "#gg-story-section", start: "top 20%" } })
          .fadeIn("#gg-story-heading", { duration: 1 })
          .pivot("#gg-story-heading", { yPercent: 60, duration: 1.25, ease: "power3.out" }, "<")
          .maskOff(".gg-story-line", { stagger: 0.5 }, "-=.75");
        gsap.timeline({ scrollTrigger: { trigger: ".gg-brand", start: "top 30%" } }).maskOff(".gg-brand-line", { stagger: 0.5 });
        gsap.utils.toArray(".gg-craft").forEach((sec) => {
          const title = sec.querySelector(".gg-craft-title"), name = sec.querySelector(".gg-craft-name"), tags = sec.querySelectorAll(".gg-craft__tags p");
          if (title || name || tags.length) {
            const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 20%" } });
            if (title) tl.fadeIn(title).pivot(title, { duration: 1.2 }, "<");
            if (name) tl.fadeIn(name, title ? "-=.75" : undefined).pivot(name, { duration: 1.5 }, "<");
            if (tags.length) tl.from(tags, { autoAlpha: 0, duration: 0.8, ease: "power4.inOut" }, "-=.8");
          }
          const grid = sec.querySelector(".gg-cards");
          const cards = grid ? grid.querySelectorAll(".gg-card") : [];
          if (cards.length) gsap.from(cards, { autoAlpha: 0, duration: 1, ease: "power2.out", stagger: 0.125, scrollTrigger: { trigger: grid, start: "top center" } });
          const prof = sec.querySelector(".gg-profile");
          if (prof) {
            const lines = prof.querySelectorAll(".gg-craft-line"), img = prof.querySelector(".gg-craft-image");
            const tl = gsap.timeline({ scrollTrigger: { trigger: prof, start: "top 0%" } });
            if (lines.length) tl.maskOff(lines, { stagger: 0.5 });
            if (img) tl.fadeIn(img, { duration: 1.2 });
          }
        });
        gsap.timeline({ scrollTrigger: { trigger: "#gg-instagram", start: "top 20%" } })
          .fadeIn("#gg-insta-1").from("#gg-insta-1", { rotate: 2, yPercent: 5 }, "<")
          .fadeIn("#gg-insta-2", "-=0.6").from("#gg-insta-2", { rotate: -1, yPercent: 5 }, "<");
      };
      document.fonts.ready.then(go);
    });
    mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(".gg-mask", { scaleY: 0 }));
  }

  // Slider: attached .75s after the loader ends (body.is-loaded) — hero · craftsman photo fade (1s · 6 s), workshop photo row auto-scroll (.7), material switch fade (.7s)
  const S = window.Splide;
  const mountSliders = () => {
    if (!S) return;
    document.querySelectorAll(".gg-fade").forEach((el) => new S(el, {
      type: "fade", autoplay: !reduce, rewind: true, arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false, interval: 6000, speed: 1000,
    }).mount());
    const AutoScroll = window.splide && window.splide.Extensions && window.splide.Extensions.AutoScroll;
    document.querySelectorAll(".gg-strip").forEach((el) => new S(el, {
      type: "loop", arrows: false, pagination: false, autoHeight: true, autoWidth: true, gap: "2rem", pauseOnFocus: false, pauseOnHover: false,
      autoScroll: { speed: reduce ? 0 : 0.7 },
    }).mount(AutoScroll ? { AutoScroll } : {}));
    document.querySelectorAll(".gg-type").forEach((el) => {
      const s = new S(el, { type: "fade", arrows: false, pagination: false, speed: 700 }).mount();
      el.querySelectorAll(".gg-dot").forEach((d) => d.addEventListener("click", (e) => { e.stopPropagation(); s.go(parseInt(d.dataset.index, 10)); }));
    });
  };
  const waitLoaded = () => {
    if (body.classList.contains("is-loaded")) return setTimeout(mountSliders, 750);
    const mo = new MutationObserver(() => { if (body.classList.contains("is-loaded")) { mo.disconnect(); setTimeout(mountSliders, 750); } });
    mo.observe(body, { attributes: true, attributeFilter: ["class"] });
  };
  waitLoaded();

  // Phone product dialog: pressing SPEC+ sets up a fade carousel (arrows) starting from that product and opens it as a modal. Closing rewinds to the first position and tears it down
  const dialog = document.getElementById("gg-dialog");
  let car = null;
  if (dialog && S) {
    const close = () => {
      const b = dialog.querySelector(".gg-dialog__body");
      if (b) b.scrollTop = 0;
      if (dialog.open) dialog.close();
      if (car) { car.destroy(); car = null; }
      body.classList.remove("is-dialog");
    };
    document.querySelectorAll(".gg-card__spec").forEach((btn) => btn.addEventListener("click", () => {
      car = new S(dialog.querySelector(".gg-dcar"), { type: "fade", arrows: true, pagination: false, autoHeight: true, drag: false, perPage: 1, start: parseInt(btn.dataset.index, 10) || 0 }).mount();
      dialog.showModal();
      body.classList.add("is-dialog");
    }));
    dialog.querySelector(".gg-dialog__x").addEventListener("click", close);
    dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  }

  // Collapsed artisan text on phone: tapping + expands it with 1s ease-out and the button hides
  // Original rule: at 769px and below, text is cut to width ÷ font size × 10 − 12 characters (about one column of lines) with … appended, and pressing + restores the original text
  if (matchMedia("(max-width: 769px)").matches) {
    document.querySelectorAll(".gg-more__t").forEach((t) => {
      const full = t.innerHTML, size = parseFloat(getComputedStyle(t).fontSize) || 12.5;
      const n = Math.floor((t.clientWidth / size) * 10 - 12), txt = t.textContent;
      t.dataset.full = full;
      if (txt.length > n) t.textContent = txt.slice(0, n) + "…";
    });
  }
  document.querySelectorAll(".gg-more__btn").forEach((b) => b.addEventListener("click", () => {
    const t = b.previousElementSibling;
    if (t && t.dataset.full) t.innerHTML = t.dataset.full;
    b.closest(".gg-more").classList.add("is-open");
    b.disabled = true;
  }));
})();
