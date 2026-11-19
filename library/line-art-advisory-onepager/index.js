// First page — machine illustration entrance and repeating dots, title letters rising, words and lines rising (tied to scroll), gear rotation, service photo parallax, horizontal story, light gap of the second machine
(() => {
  const mm = gsap.matchMedia();
  const opt = (s) => Object.fromEntries((s || "").split(";").map((p) => p.split(":").map((x) => x.trim())).filter((p) => p[0]));

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Machine parts — original IX3 t-bcd9da18 (on load): transparent 0 → 1, into place from below, above and the side, 2s (rear parts 2.41s) power4.out
    const FROM = { 1: [0, 25, 1.16], 2: [0, -15, 1.41], 3: [0, 15, 1.16], 4: [0, -25, 1.37], 5: [0, 25, 1.36], 6: [0, -15, 1.61], 7: [0, 15, 1.36], 8: [0, -25, 1.57],
      9: [0, 25, 1.47], 10: [0, -15, 1.72], 11: [0, 15, 1.47], 12: [0, -25, 1.68], 13: [20, 0, 1.72], 14: [20, 0, 1.96], 15: [0, 5, 2.12], 16: [0, -5, 2.24],
      17: [0, 5, 2.36], 18: [0, -5, 2.48], 19: [0, 5, 2.6], 20: [0, -5, 2.72], 21: [-20, 0, 2.06], 22: [-20, 0, 2.16] };
    const em = parseFloat(getComputedStyle(document.body).fontSize);
    const scale = () => { const svg = document.querySelector(".cw-machine svg"); return svg ? 900 / svg.getBoundingClientRect().width : 1; };
    const k = scale();
    document.querySelectorAll(".cw-mi").forEach((g) => {
      const [x, y, at] = FROM[g.dataset.i] || [0, 0, 1.2];
      gsap.fromTo(g, { opacity: 0, x: x * em * k, y: y * em * k }, { opacity: .7, x: 0, y: 0, duration: g.dataset.i > 12 ? 2.41 : 2, delay: at, ease: "power4.out" });
    });
    // Moving dot — original dot-test: 3s loop, x 5→30em (power1.inOut), y 8.7→1.8em (power3.inOut), opacity 1→0 (power2.in)
    const dot = document.querySelector(".cw-dot");
    if (dot) {
      gsap.fromTo(dot, { x: 5 * em * k }, { x: 30 * em * k, duration: 3, repeat: -1, ease: "power1.inOut" });
      gsap.fromTo(dot, { y: 8.7 * em * k }, { y: 1.8 * em * k, duration: 3, repeat: -1, ease: "power3.inOut" });
      gsap.fromTo(dot, { opacity: 1 }, { opacity: 0, duration: 3, repeat: -1, ease: "power2.in" });
    }

    // Title and large text letter rise — original IX3 splitText chars + mask, y 100% → 0, tied to scroll (scrub .8, top bottom → end)
    document.querySelectorAll("[data-chars]").forEach((el) => {
      const o = opt(el.dataset.chars);
      const sp = SplitText.create(el, { type: "words,chars", mask: "chars" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: o.end || "bottom top", scrub: .8 } });
      tl.fromTo(sp.chars, { yPercent: 100 }, { yPercent: 0, duration: +(o.dur || 1), ease: o.ease || "power4.out", stagger: { amount: +(o.amount || .3) } }, +(o.delay || 0));
      if (o.delay) tl.to({}, { duration: .5 });
    });
    // Word rise (summary and service text) — t-cc0cfc6b, t-8a84f6da: words + mask, y 100% → 0, scrub .8
    document.querySelectorAll("[data-words]").forEach((el) => {
      const sp = SplitText.create(el, { type: "words", mask: "words" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: .8 } })
        .fromTo(sp.words, { yPercent: 100 }, { yPercent: 0, duration: .1, stagger: { amount: .1 }, ease: "power4.out" }, 0)
        .to({}, { duration: .67 }, .33);
    });
    // Line rise (value summary) — t-5919ff61: lines + mask, .14 · scrub .8
    document.querySelectorAll("[data-lines]").forEach((el) => {
      const sp = SplitText.create(el, { type: "lines", mask: "lines" });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: .8 } })
        .fromTo(sp.lines, { yPercent: 100 }, { yPercent: 0, duration: .14, ease: "power4.out" }, .01).to({}, { duration: .3 }, 0);
    });

    // Values illustration gear — t-c462e6be: rotates 360° while passing through the section (_3-values) (no curve, scrub .8)
    const scope = document.querySelector("[data-rotate-scope]");
    if (scope) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: .8 } });
      scope.querySelectorAll("[data-rot]").forEach((g) => {
        const [a, b] = g.dataset.rot.includes(":") ? g.dataset.rot.split(":").map(Number) : [0, +g.dataset.rot];
        tl.fromTo(g, { rotation: a, svgOrigin: "100 100" }, { rotation: b, svgOrigin: "100 100", duration: 1, ease: "none" }, 0);
      });
    }

    // Service photo inner parallax — ix2 image-vert-parallax: 0 → 18%
    document.querySelectorAll(".cw-serv__img .wf-img").forEach((img) => {
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: 18, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Horizontal story — ix2 story-parallax: while the section is in view the strip moves 0 → −211.5vw and the photo insides move 0 → −7·−20·−17·−10%
    const slider = document.querySelector(".cw-slider");
    const track = slider?.querySelector("[data-track]");
    if (track) {
      const imgs = [...track.querySelectorAll("[data-story-img] .wf-img")];
      const tl = gsap.timeline({ scrollTrigger: { trigger: slider, start: "top bottom", end: "bottom top", scrub: true } });
      tl.fromTo(track, { x: 0 }, { x: () => -2.115 * innerWidth, ease: "none", duration: 100 }, 0);
      if (imgs[0]) tl.fromTo(imgs[0], { xPercent: -7 }, { xPercent: -20, ease: "none", duration: 35 }, 0);
      if (imgs[1]) tl.fromTo(imgs[1], { xPercent: 0 }, { xPercent: -20, ease: "none", duration: 60 }, 10);
      if (imgs[2]) tl.fromTo(imgs[2], { xPercent: 0 }, { xPercent: -17, ease: "none", duration: 56 }, 44);
      if (imgs[3]) tl.fromTo(imgs[3], { xPercent: 0 }, { xPercent: -10, ease: "none", duration: 20 }, 80);
    }

    // Second machine light gap — original image-mask eight: width 3% → 1%, sweeping across horizontally while the image inside moves the opposite way (a line shows through at the same spot), repeating at 1.76~2.19s
    const SLIT = { 1: [0, 32, 2, 0], 2: [0, 32, 2, .38], 3: [60, 33, 1.76, .72], 4: [60, 33, 1.92, .2], 5: [60, 33, 2.14, 0], 6: [0, 32, 2.19, .22], 7: [0, 32, 1.76, .73], 8: [33, 60, 2.14, 0] };
    const box = document.querySelector(".cw-m2");
    if (box) {
      box.querySelectorAll("[data-slit]").forEach((s) => {
        const [a, b, dur, at] = SLIT[s.dataset.slit];
        const inner = s.firstElementChild;
        const vw = innerWidth / 100;
        gsap.fromTo(s, { x: a * vw, width: "3%" }, { x: b * vw, width: "1%", duration: dur, delay: at, repeat: -1, ease: "none" });
        gsap.fromTo(inner, { x: -a * vw }, { x: -b * vw, duration: dur, delay: at, repeat: -1, ease: "none" });
      });
      // t-594992f3: while passing through the section, panel .4→1 · .9→1, center circle .9→1.1
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".cw-machine2", start: "top bottom", end: "bottom top", scrub: .8 } });
      tl.fromTo(box, { opacity: .4, scale: .9 }, { opacity: 1, scale: 1, duration: .71, ease: "none" }, 0)
        .fromTo("[data-circles]", { scale: .9 }, { scale: 1.1, duration: .71, ease: "none" }, 0)
        .to({}, { duration: .29 });
    }
  });

  // Team card — like the original, each person cell holds a card panel off screen (left 100vw), and on click it comes straight to −100vw and turns on in .3s.
  // People-slot photos return from 1.1x with the original curve (cubic-bezier(.3,.7,.3,.9) .63s) (.is-active)
  let openModal = null;
  const closeModal = () => { if (!openModal) return; openModal.closest(".cw-member")?.classList.remove("is-active"); openModal.classList.remove("is-open"); openModal.setAttribute("aria-hidden", "true"); openModal = null; window.lenis?.start(); };
  document.querySelectorAll(".cw-member").forEach((m) => {
    const modal = m.querySelector(".cw-modal");
    if (!modal) return;
    const open = () => {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      openModal = modal;
      m.classList.add("is-active");
      window.lenis?.stop();
    };
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]") || e.target === modal) { e.stopPropagation(); closeModal(); return; }
      if (!e.target.closest(".cw-modal")) open();
    });
    m.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !openModal) { e.preventDefault(); open(); } });
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // Scroll arrow
  document.querySelector("[data-scroll-next]")?.addEventListener("click", () => {
    const next = document.querySelector(".cw-statement");
    if (window.lenis) window.lenis.scrollTo(next); else next.scrollIntoView({ behavior: "smooth" });
  });
})();
