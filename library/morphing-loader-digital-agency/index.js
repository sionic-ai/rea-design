// Front page scene — original home.js values as they are:
// Wordmark loader (once per session): each letter offset by .058s scales horizontally 0→1 (.29s smilScale), from .29s later rounded bars → letter shapes (.44s smilMorph, the O inner -45°→0),
//   menu-slot dot from the side .4s, logo·dot to the header slot 1s power3.inOut, panel folds up, header .5s, Contact button opens from the right .8s, dots Flip into four toggle dots .6s,
//   menu text enters from the end over .6s. Then the Hero: video opens from the center as a rounded window (.6s) · title lines .2s apart · body .6s.
// 768px and up: hero pinned (spacer height × 1.3, scrub .2) — video scales .35 → 1, the title fades over the first 70%, and an echo layer grows with scroll speed then returns.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, MorphSVGPlugin, Flip);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = window.lenisInstance;

  const pre = $(".an-preloader");
  const header = $(".an-header");
  const showPre = pre && document.documentElement.classList.contains("an-show-preloader") && !reduce;

  const preloaderTl = () => {
    const bg = $(".an-preloader__bg", pre), logo = $(".an-preloader__logo", pre), ph = $(".an-preloader__menu", pre);
    const items = $$(".an-menu > li", header), cta = $$(".an-header__cta", header);
    lenis?.stop();
    const tl = gsap.timeline({ paused: true, onComplete: () => {
      pre.classList.add("is-hidden");
      header.classList.remove("is-preloading");
      sessionStorage.setItem("an-preloader", "true");
      pre.remove();
      lenis?.start();
    } });
    const r = logo.getBoundingClientRect(), mid = (innerHeight - r.height) / 2 - r.top;
    tl.set(logo, { autoAlpha: 1, y: mid });
    tl.set(ph, { autoAlpha: 0, xPercent: 100, y: mid });
    tl.set(header, { autoAlpha: 0 });
    if (items.length) tl.set(items, { autoAlpha: 0, xPercent: -80 });
    if (cta.length) tl.set(cta, { clipPath: "inset(0% 0% 0% 100% round 24px)", x: 36 });
    header.classList.add("is-preloading");
    CustomEase.create("smilScaleEase", "M0,0 C0.8,0 0.833,0.833 1,1");
    CustomEase.create("smilMorphEase", "M0,0 C0.167,0.167 0.2,1 1,1");
    const letters = gsap.timeline();
    $$(".an-morph-letter", pre).forEach((l, i) => {
      const a = $(".an-morph-start", l), b = $(".an-morph-end", l), inner = $(".an-morph-inner", l);
      const t0 = 0.058 * i, t1 = 0.29 + 0.058 * i;
      gsap.set(l, { opacity: 0, scaleX: 0, transformOrigin: "50% 50%" });
      letters.set(l, { opacity: 1 }, t0);
      letters.to(l, { scaleX: 1, duration: 0.29, ease: "smilScaleEase" }, t0);
      letters.to(a, { morphSVG: { shape: b, shapeIndex: "auto" }, duration: 0.44, ease: "smilMorphEase" }, t1);
      if (l.dataset.letter === "O" && inner) {
        gsap.set(inner, { rotation: -45, transformOrigin: "50% 50%" });
        letters.to(inner, { rotation: 0, duration: 0.44, ease: "smilMorphEase" }, t1);
      }
    });
    tl.add(letters, "<");
    tl.to(ph, { autoAlpha: 1, xPercent: 0, duration: 0.4 }, "-=.8");
    tl.addLabel("initialRevealEnd");
    tl.to(logo, { y: 0, duration: 1, ease: "power3.inOut" }, "initialRevealEnd");
    tl.to(ph, { y: 0, duration: 1, ease: "power3.inOut" }, "initialRevealEnd");
    tl.to(bg, { scaleY: 0, transformOrigin: "top" }, "initialRevealEnd");
    tl.addLabel("preloaderMovedUp");
    tl.to(header, { duration: 0.5, autoAlpha: 1 }, "preloaderMovedUp");
    if (cta.length) tl.to(cta, { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 0.8, x: 0, clearProps: "all" }, "preloaderMovedUp");
    tl.set(pre, { pointerEvents: "none" }, "preloaderMovedUp");
    // The four dots inside the loader’s big dot Flip across to the header toggle spot while the big dot shrinks
    tl.call(() => {
      const big = $(".an-preloader__dot", pre), tog = $(".an-toggle", header);
      if (!big || !tog) return;
      const dots = $$(".an-toggle__dot", tog);
      dots.forEach((d) => big.appendChild(d));
      gsap.set(dots, { scale: 3.5, transformOrigin: "50% 50%" });
      const state = Flip.getState(dots);
      dots.forEach((d) => tog.appendChild(d));
      gsap.set(dots, { scale: 1 });
      const gap = gsap.getProperty(".an-header__actions", "gap");
      Flip.from(state, { duration: 0.6, ease: "none", absolute: true, scale: true });
      gsap.to(big, { scale: 0, x: gap, duration: 0.5, ease: "power3.in" });
    }, null, "preloaderMovedUp-=.2");
    if (items.length) tl.to(items, { autoAlpha: 1, xPercent: 0, duration: 0.6, stagger: { amount: 0.6, from: "end" } }, "<");
    tl.addLabel("contentReveal");
    tl.set(pre, { display: "none" }, "contentReveal");
    return tl;
  };
  const g = showPre ? preloaderTl() : null;
  if (pre && !showPre) pre.remove();

  const hero = $(".an-hero"), vid = $(".an-hero__video"), title = $(".an-hero__title");
  const content = $(".an-home"), footer = $(".an-footer");
  const layers = $$(".an-echo__layer", vid || document.createElement("i"));
  if (vid) window.anMotion.paintEcho(vid);

  // Clicking the video opens a full video window (placeholder video)
  if (vid) {
    const dlg = document.createElement("dialog");
    dlg.className = "an-modal";
    dlg.innerHTML = '<div class="an-modal__content"><button type="button" class="an-btn is-plain an-modal__close">Close</button><video class="an-modal__video" controls playsinline src="media/placeholder-16x9.mp4"></video></div>';
    document.body.append(dlg);
    const mv = $("video", dlg);
    const close = () => { mv.pause(); dlg.close(); };
    vid.addEventListener("click", () => { mv.currentTime = 0; dlg.showModal(); mv.play().catch(() => {}); });
    $(".an-modal__close", dlg).addEventListener("click", close);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  }

  document.fonts.ready.then(() => {
    if (!hero || !vid || !title) return;
    if (reduce) { gsap.set([vid, title], { autoAlpha: 1, clipPath: "none" }); return; }
    const tl = gsap.timeline({ paused: true });
    gsap.set(content, { autoAlpha: 0 });
    gsap.set(footer, { autoAlpha: 0 });
    gsap.set(vid, { autoAlpha: 1, clipPath: "inset(50% round 20px)" });
    gsap.set(title, { autoAlpha: 1 });
    tl.to(vid, { clipPath: "inset(0% round 20px)", duration: 0.6, onComplete: () => gsap.set(vid, { clipPath: "none" }) }, "<");
    tl.addLabel("revealTitle", "<");
    SplitText.create(title, { type: "lines", linesClass: "an-line", autoSplit: false, onSplit(s) {
      tl.from(s.lines, { opacity: 0, yPercent: 100, stagger: 0.2, id: "lines" }, "revealTitle");
    } });
    tl.to(content, { autoAlpha: 1, duration: 0.6 }, "-=.5");
    tl.to(footer, { autoAlpha: 1 }, "<");
    tl.eventCallback("onComplete", () => document.body.classList.add("intro-done"));
    if (g) { g.add(tl, "preloaderMovedUp"); tl.paused(false); g.play(); }
    else setTimeout(() => tl.play(), 400);

    gsap.matchMedia().add("(min-width: 768px)", () => {
      const spacer = $(".an-hero-spacer")?.offsetHeight || 0, len = spacer + 0.3 * spacer;
      const pin = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: `+=${len}`, scrub: 0.2, pin: true, pinSpacing: false,
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity()) / 8000;
          layers.forEach((l, i) => {
            const n = 0.5 * (i + 1), a = 0.15 + 0.05 * i, s = gsap.utils.clamp(1, 1 + a, 1 + v * n);
            gsap.to(l, { scale: s, duration: 0.1, overwrite: true, ease: "none" });
            gsap.to(l, { scale: 1, duration: 0.3 + 0.1 * i, overwrite: "auto", ease: "power1.out" });
          });
        } } });
      pin.to(title, { autoAlpha: 0, duration: 0.8 * 0.7 }, 0);
      pin.fromTo(vid, { scale: 0.35 }, { scale: 1, duration: 0.8 }, 0);
      pin.set({}, {}, 1);
    });
  });
})();
