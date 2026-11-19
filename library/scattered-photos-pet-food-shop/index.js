// Home page — carry over the values from original top.js as they are.
// Once the loading curtain lifts, the wave enters from 20vw to the side over 1.8s, and photos gather from 200px below and scattered sideways (1.2~1.3s · 1.4s power2.out)
// After the center section becomes 2.4x, the header·progress bar·cursor turn on in .8s. Then Swiper (4s · 1s · loop · centered) runs, and
// On desktop the hero is pinned at 260%, the slider moves out to the left and six other cuts pass by
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const SP = matchMedia("(max-width: 769px)").matches;
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const px = (v) => (v * innerWidth) / (SP ? 414 : 1440);
  const slides = gsap.utils.toArray(".in-mv .swiper-slide");
  const UI = ["[data-in-ui]", ".in-head", ".in-logo", ".in-burger", ".in-contact"];
  // Side sections are scattered ±5° and ±30px (original random) — the center section (second) stays straight
  slides.forEach((s, i) => { if (i !== 1) gsap.set(s, { rotateZ: gsap.utils.random(-5, 5), y: gsap.utils.random(px(-30), px(30)) }); });
  gsap.set(slides[1], { zIndex: 10 });

  let swiper = null;
  const num = document.querySelector("[data-in-num]"), bar = document.querySelector("[data-in-bar]");
  const copies = [...document.querySelectorAll(".in-mv__copy [data-copy]")];
  const progress = (first) => { if (bar) gsap.fromTo(bar, { width: 0 }, { width: "100%", duration: first ? 4 : 5, ease: "none" }); };
  const showCopy = (n) => {
    if (num) { num.textContent = String(n).padStart(2, "0"); gsap.fromTo(num, { opacity: 0 }, { opacity: 1, duration: 0.2 }); }
    copies.forEach((c) => {
      c.classList.toggle("is-visible", c.dataset.copy === String(n));
      if (c.dataset.copy === String(n)) gsap.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: SP ? 0.2 : 1, ease: "none" });
    });
  };
  // PREV/NEXT cursor — follows the mouse over .3s, PREV on the left half of the screen · NEXT on the right half.
  // Follow is attached from the start as in the original: attaching after the appearance makes the circle fly in from screen center on the first move.
  // The strips are exactly the original F() at a 1600 base (180px at 1440 width) — the copy’s px() is a 1440 base, so it is not used
  const cursor = document.querySelector(".in-cursor"), slider = document.querySelector(".in-mv__slider");
  const F = (v) => v * (innerWidth > 1920 ? 1.2 : innerWidth < 769 ? innerWidth / 414 : innerWidth < 1080 ? 0.675 : innerWidth / 1600);
  const FOLLOW = cursor && slider && !SP && !REDUCE && matchMedia("(any-hover: hover)").matches;
  if (FOLLOW) addEventListener("mousemove", (e) => {
    gsap.to(cursor, { left: e.clientX, top: e.clientY, duration: 0.3 });
    cursor.textContent = e.clientX > innerWidth / 2 ? "NEXT" : "PREV";
  });
  const startSwiper = () => {
    gsap.set(slides, { clearProps: "opacity" });
    slides.forEach((s) => { s.style.transition = "transform 1s cubic-bezier(0.65, 0, 0.35, 1), opacity .4s linear"; });
    swiper = new Swiper(".in-mv .swiper-container", { speed: 1000, slidesPerView: "auto", initialSlide: 1, loop: true, centeredSlides: true, allowTouchMove: SP, autoplay: REDUCE ? false : { delay: 4000, disableOnInteraction: false } });
    // Original Zl(realIndex)+1 — the first slide (realIndex 1) is 01, realIndex 0 is the last number
    const real = () => (swiper.realIndex === 0 ? slides.length : swiper.realIndex);
    progress(true);
    showCopy(real());
    swiper.on("slideChangeTransitionStart", () => { progress(false); showCopy(real()); });
    // Show is hooked after the slider stands — in the top and bottom F(200) bands it shrinks and vanishes in .2s
    if (FOLLOW) {
      const show = (e) => gsap.to(cursor, e.clientY < F(200) || e.clientY > innerHeight - F(200) ? { autoAlpha: 0, scale: 0, duration: 0.2, ease: "none" } : { autoAlpha: 1, scale: 1, duration: 0.2, ease: "none" });
      slider.addEventListener("mouseenter", () => addEventListener("mousemove", show));
      addEventListener("mousemove", show);
      slider.addEventListener("mouseleave", () => { gsap.to(cursor, { autoAlpha: 0, scale: 0, duration: 0.2, ease: "none" }); removeEventListener("mousemove", show); });
    }
    if (slider && !SP) slider.addEventListener("click", (e) => { if (!e.target.closest(".in-mv__arrows")) e.clientX > innerWidth / 2 ? swiper.slideNext() : swiper.slidePrev(); });
    document.querySelectorAll(".in-mv__arrows button").forEach((b) => b.addEventListener("click", () => (b.dataset.dir === "next" ? swiper.slideNext() : swiper.slidePrev())));
  };

  // First entrance timeline (original Hc — first-visit version with no cache)
  const intro = gsap.timeline({ paused: true });
  intro.to(".in-loading", { opacity: 0, display: "none" });
  if (SP || REDUCE) intro.add(startSwiper, "<");
  else {
    gsap.set(UI, { autoAlpha: 0 });
    intro.fromTo(".in-wave", { x: 0.2 * innerWidth, opacity: 0 }, { opacity: 1, x: 0, duration: 1.8, ease: "power2.out" })
      .fromTo(".in-mv .swiper-wrapper", { opacity: 0 }, { opacity: 1 })
      .from(slides, { stagger: { from: "random", amount: 0.4, ease: "none" }, duration: () => 0.1 * Math.floor(2 * Math.random()) + 1.2, y: 200, ease: "power2.out" })
      .fromTo(slides, { x: (i) => (i - 1) * px(-485), opacity: 1 }, { stagger: { from: "random", ease: "none", each: 0.08 }, x: 0, opacity: (i) => (i === 1 ? 1 : 0.3), ease: "power2.out", duration: 1.4 })
      .to(slides[1], { scale: 2.4, clearProps: "scale", duration: 1.3, ease: "power2.out" }, "-=1")
      .fromTo(UI, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "none" }, "<")
      .add(startSwiper);
  }
  intro.add(setupScroll);
  // Original after load — if the document finished downloading within 2 seconds, show the loading screen 2.5 seconds more
  const t0 = performance.now();
  const go = () => (performance.now() - t0 > 2000 || REDUCE ? intro.play() : setTimeout(() => intro.play(), 2500));
  document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });

  function setupScroll() {
    if (REDUCE) return;
    if (!SP) {
      // Another cut tilts on the Y axis by scroll speed (±30°) — newly hooked only when tilting harder, and returned to 0 over 3s power2.out.
      const tilt = { r: 0 }, setR = gsap.quickSetter(".in-mv__others .wf-img", "rotateY", "deg"), clamp = gsap.utils.clamp(-30, 30);
      ScrollTrigger.create({ onUpdate: (self) => {
        const v = clamp(self.getVelocity() / -10);
        if (Math.abs(v) > Math.abs(tilt.r)) { tilt.r = v; gsap.to(tilt, { r: 0, duration: 3, ease: "power2.out", overwrite: true, onUpdate: () => setR(tilt.r) }); }
      } });
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".in-mv", start: "top top", end: "+=260%", scrub: true, pin: true } });
      tl.to(".in-mv .swiper-wrapper", { opacity: 0, duration: 0.4 }, "<")
        .to(".in-mv__slider", { xPercent: -100 }, "<")
        .to("[data-in-fade]", { autoAlpha: 0, duration: 0.2 }, "<")
        .to(".in-mv__others", { xPercent: -200, duration: 3 }, "-=0.2")
        .to(".in-mv__others .wf-img", { x: (i, el) => 100 * -(+el.dataset.speed || 0), duration: 3 }, "<")
        .fromTo(".in-mv__others .wf-img", { opacity: 0.3 }, { opacity: 1, stagger: 0.15, duration: 0.5 }, "<")
        .fromTo(".in-wave", { x: 0, opacity: 1 }, { duration: 1.2, opacity: 0, ease: "none" }, "-=1.6")
        .fromTo(".in-scrolldown", { opacity: 1 }, { opacity: 0 });
    } else {
      gsap.fromTo(".in-wave", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: ".in-mv", start: "top top", end: "+=100", scrub: true } });
    }
    // Copy — title letters from 30px below staggered .02s over 4s, body lines from 10px below staggered .04s over 2s (at 85% of the screen)
    const title = document.querySelector('[data-in-split="title"]');
    if (title) {
      const s = new SplitText(title, { type: "words,chars", charsClass: "in-char" });
      gsap.from(s.chars, { opacity: 0, y: 30, stagger: 0.02, duration: 4, ease: "power2.out", scrollTrigger: { trigger: ".in-copy", start: "top 85%" } });
    }
    document.querySelectorAll('[data-in-split="line"]').forEach((p) => {
      const s = new SplitText(p, { type: "lines,words,chars", charsClass: "in-char" });
      s.lines.forEach((line) => gsap.from(line.querySelectorAll(".in-char"), { opacity: 0, y: 10, stagger: 0.04, duration: 2, ease: "power2.out", scrollTrigger: { trigger: line, start: "top 85%" } }));
    });
    // Back circle — fixed, tied to scroll, it is drawn (custom curve) and then erased (power3.inOut)
    const circle = document.querySelector(".in-copy__circle path");
    if (circle) {
      CustomEase.create("in-custom", "M0,0,C0,0,0.018,0.367,0.5,0.5,0.848,0.596,1,1,1,1");
      const L = circle.getTotalLength();
      gsap.timeline({ scrollTrigger: { trigger: ".in-copy__circle", start: SP ? "center center" : "top top", endTrigger: ".in-copy", end: SP ? "80% center" : `bottom bottom-=${px(200)}`, pin: true, scrub: true, pinSpacing: false } })
        .fromTo(circle, { strokeDasharray: `${L}px ${L}px`, strokeDashoffset: -L }, { strokeDashoffset: 0, ease: "in-custom" })
        .fromTo(circle, { strokeDashoffset: 0 }, { strokeDashoffset: L, ease: "power3.inOut", delay: SP ? 2 : 0 });
    }
    // Section head — desktop: Korean letters in random order (within .4s) from 80% up·.7x·transparent over .7s power4.out, then English label·bar
    document.querySelectorAll("[data-in-scrolltext]").forEach((h) => {
      const ja = h.querySelector("[data-in-ja]"), en = h.querySelector(".in-sub__en"), b = h.querySelector(".in-sub__bar");
      if (!ja || !en || !b) return;
      if (SP) { gsap.timeline({ scrollTrigger: { trigger: h, start: "top 80%" } }).fromTo([en, b], { opacity: 0 }, { duration: 0.9, opacity: 1, ease: "none" }).from(ja, { duration: 0.9, opacity: 0, delay: 0.1, ease: "none" }, "<"); return; }
      const chars = new SplitText(ja, { type: "words,chars", charsClass: "in-char" }).chars;
      gsap.timeline({ scrollTrigger: { trigger: h, start: "top 90%" } }).set(b, { opacity: 0 })
        .from(chars, { duration: 0.7, opacity: 0, yPercent: -80, scale: 0.7, transformOrigin: "center", ease: "power4.out", stagger: { from: "random", grid: "auto", amount: 0.4, ease: "none" } })
        .from(en, { duration: 0.9, opacity: 0, yPercent: -20, ease: "power4.out" }, "-=0.5")
        .fromTo(b, { opacity: 0, y: -5 }, { duration: 0.9, opacity: 1, y: 0, ease: "power4.out" }, "-=0.7");
    });
    document.querySelectorAll("[data-in-lead]").forEach((t) => gsap.from(t, { scrollTrigger: { trigger: t, start: "top 80%" }, duration: 1.2, opacity: 0, delay: 0.4, ease: "none" }));
    // Feature cards — desktop: enter from the right at 90vw in sequence with .5s, and the title comes last with .4s (tied to scroll). Phone: appear at 70% of the screen
    const zig = document.querySelector("[data-in-zigzag]");
    if (zig) {
      const cards = zig.querySelectorAll(".in-card");
      if (SP) cards.forEach((c) => gsap.from(c, { opacity: 0, scrollTrigger: { trigger: c, start: "top bottom-=30%" } }));
      else {
        zig.style.overflowX = "hidden";
        cards.forEach((c, i) => {
          const ft = c.querySelectorAll("[data-in-ft]");
          gsap.timeline({ scrollTrigger: { trigger: zig, start: `top-=${px(200)} bottom`, end: `bottom center+=${px(200)}`, scrub: true } })
            .set(ft, { opacity: 0 }).fromTo(c, { x: "90vw" }, { x: 0, delay: 0.5 * i, duration: 1, ease: "power3.out" }).to(ft, { opacity: 1, duration: 0.4 }, "-=0.3");
        });
      }
    }
    // Wide photo — the photo slowly rises while passing through the section
    const wide = document.querySelector("[data-in-wide] .wf-img");
    if (wide) gsap.fromTo(wide, { yPercent: 0 }, { yPercent: -13, ease: "none", scrollTrigger: { trigger: "[data-in-wide]", start: "top bottom", end: "bottom top", scrub: true } });
    ScrollTrigger.refresh();
  }
  // Tabs — dog/cat panels cross-fade in .8s
  document.querySelectorAll(".in-tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".in-tabs button, .in-grid").forEach((el) => el.classList.toggle("is-selected", el.dataset.target === b.dataset.target));
    ScrollTrigger.refresh();
  }));
})();
