// First page motion: chapter video insertion, full video Swiper flip, chapter theater 16000px pin, hiding the header, turning to night at the end.
// The hero video (media/fv.mp4) is html’s <video autoplay loop muted playsinline> keeps spinning as is.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mobile = matchMedia("(max-width: 766px)");
  const mm = gsap.matchMedia();

  /* ── Chapter video: PC (767 and up) gets a muted looping video, phones get a still-image placeholder (original pcView decided once when opened) ── */
  if (innerWidth > 766) {
    document.querySelectorAll(".mh-chap-video[data-video]").forEach((box) => {
      box.insertAdjacentHTML("afterbegin", `<video src="${box.dataset.video}" autoplay loop muted playsinline aria-hidden="true"></video>`);
    });
  }

  /* ── Full video: Swiper 8.2.6 flip (speed 1500 · autoplay 3000 · no loop · can’t be swiped by hand) ──
     When a hand comes over the video it stops, and on leaving it spins again if not playing. Playing stops it, and pausing spins it again (original YouTube onStateChange) */
  const reduceNow = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fullVersionSlide = new Swiper("#full-version-slide", {
    effect: "flip",
    speed: 1500,
    loop: false,
    allowTouchMove: false,
    autoplay: { delay: 3000, stopOnLastSlide: false, disableOnInteraction: false, reverseDirection: false },
  });
  if (reduceNow) fullVersionSlide.autoplay.stop();
  let videoStart = false;
  document.querySelectorAll(".mh-full__video").forEach((wrap) => {
    wrap.addEventListener("mouseover", () => fullVersionSlide.autoplay.stop());
    wrap.addEventListener("mouseleave", () => (videoStart || reduceNow ? fullVersionSlide.autoplay.stop() : fullVersionSlide.autoplay.start()));
    const v = wrap.querySelector("video");
    if (!v) return;
    v.addEventListener("play", () => { fullVersionSlide.autoplay.stop(); videoStart = true; });
    const resume = () => { videoStart = false; if (!reduceNow) fullVersionSlide.autoplay.start(); };
    v.addEventListener("pause", resume);
    v.addEventListener("ended", resume);
  });

  /* ── Phone (portrait): when scrolling up, the chapter stage height is the current screen height (px), when scrolling down 100vh — so the stage doesn’t jolt as the address bar comes and goes (original spView) ── */
  if (innerWidth < 766 && innerHeight >= innerWidth) {
    const stage = document.querySelector("#chapter-slide");
    let pos = scrollY;
    addEventListener("scroll", () => {
      stage.style.height = scrollY < pos ? `${innerHeight}px` : "100vh";
      pos = scrollY;
    }, { passive: true });
  }

  /* ── Chapter theater ──────────────────────────────────── */
  // Original timeline as is: first section rests 10 and clears in 5 → per chapter [rest 5, video 0→1 (5) · cutout fade (2) · title after 1 (2) · after 5 video 3x and disappears (5) · cutout·title overlap −1 and disappear (2)]
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const chapters = [...document.querySelectorAll(".mh-chap")];
    if (ctx.conditions.reduce) {
      // With motion off, set up only the first chapter fully visible
      gsap.set("#chapter-first", { opacity: 0 });
      gsap.set(chapters[0], { display: "block" });
      return;
    }
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#chapter-slide", start: "top top", end: "+=16000", pin: true, scrub: true } });
    tl.fromTo("#chapter-first", { opacity: 1 }, { opacity: 0, duration: 5, ease: "circ.out" }, "+=10");
    chapters.forEach((ch) => {
      const [film, layer, desc] = ch.children;
      tl.fromTo(ch, { display: "none" }, { display: "block" })
        .fromTo(film, { scale: 0 }, { scale: 1, duration: 5, ease: "circ.out" }, "+=5")
        .fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 2, ease: "circ.out" })
        .fromTo(desc, { opacity: 0 }, { opacity: 1, duration: 2, ease: "circ.out" }, "+=1")
        .to(film, { scale: 3, opacity: 0, duration: 5, ease: "circ.out" }, "+=5")
        .to(layer, { opacity: 0, duration: 2, ease: "circ.out" }, "-=1")
        .to(desc, { opacity: 0, duration: 2, ease: "circ.out" }, "-=1")
        .to(ch, { display: "none" });
    });
  });

  /* ── Header: hidden while the Hero is visible · inside the chapter theater ─────── */
  const body = document.body;
  const gnav = document.querySelector(".mh-gnav");
  const bar = document.querySelector(".mh-header__bar");
  const sns = document.querySelector(".mh-sns");
  const spTop = [document.querySelector(".mh-logo"), document.querySelector(".mh-menu-btn")];
  const spCorner = [document.querySelector(".mh-lang"), sns];
  const show = (els, on) => els.forEach((el) => el && (el.classList.toggle("is-shown", on), el.classList.toggle("is-hidden", !on)));
  const clear = (els) => els.forEach((el) => el && el.classList.remove("is-shown", "is-hidden"));
  let fvIn = true;
  let chapterIn = false;
  const apply = () => {
    clear([gnav, bar, sns, ...spTop, ...spCorner]);
    if (mobile.matches) {
      // Phone: at the hero only language and SNS show, after that only the logo and menu button. Inside a chapter, the logo and menu button hide too
      show(spTop, !fvIn && !chapterIn);
      show(spCorner, fvIn);
    } else {
      show([gnav], !fvIn);
      show([bar, sns], !chapterIn);
    }
  };
  new IntersectionObserver(([e]) => { fvIn = e.isIntersecting; apply(); }).observe(document.querySelector(".mh-fv__inner"));
  new IntersectionObserver(([e]) => { chapterIn = e.isIntersecting; apply(); }).observe(document.querySelector("#chapter-slide"));
  mobile.addEventListener("change", apply);
  apply();

  /* ── Night at the end: when the footer shows, a black plate for 2s, text turns white ─────────── */
  const night = document.querySelector(".mh-night");
  new IntersectionObserver(([e]) => {
    body.classList.toggle("is-night", e.isIntersecting);
    night.classList.toggle("is-shown", e.isIntersecting);
    night.classList.toggle("is-hidden", !e.isIntersecting);
  }).observe(document.querySelector(".mh-footer"));
})();
