// Home page — loader where photos stack then clear and the logo rises (Lottie), Hero photo advance, intro sentence scrub, scattered photos, phone photo strip
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loader — same tempo as the original Lottie (50fps · 300 frames): 10 photos switch on for 4 frames each at frames 0·15·30·43·57·73·90·105·119·135 and stack up,
  // While it lifts over frames 175→223 the logo rises over frames 182→217 and disappears over 265→289. When done, the curtain lifts in .5s
  const loader = $(".loader");
  // Skin variables can be hex or oklch, anything — so paint one point and read it as pixels
  const toRgb = (() => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    return (v) => {
      c.clearRect(0, 0, 1, 1);
      c.fillStyle = v.trim();
      c.fillRect(0, 0, 1, 1);
      return [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((n) => n / 255);
    };
  })();
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n);
  const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
  const STARTS = [0, 15, 30, 43, 57, 73, 90, 105, 119, 135];
  const ease = { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] } };
  const still = (k) => ({ a: 0, k });
  const tr = { ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0) };
  const line = (a, b) => ({ ty: "sh", ks: still({ c: false, v: [a, b], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }) });
  const buildLottie = () => {
    const light = toRgb(css("--kf-raised")), dark = toRgb(css("--kf-dim")), edge = toRgb(css("--kf-line"));
    const layers = STARTS.map((t, n) => ({
      ddd: 0, ind: n + 1, ty: 4, nm: `photo-${n + 1}`, sr: 1, ao: 0, ip: 0, op: 300, st: 0, bm: 0,
      ks: { o: { a: 1, k: [{ t, s: [0], ...ease }, { t: t + 4, s: [100], ...ease }, { t: 175, s: [100], ...ease }, { t: 223, s: [0] }] }, r: still(0), p: still([300, 300, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]) },
      shapes: [
        { ty: "gr", it: [line([-255, -255], [255, 255]), line([255, -255], [-255, 255]), { ty: "st", c: still([...edge, 1]), o: still(100), w: still(1), lc: 1, lj: 1, ml: 4 }, tr] },
        { ty: "gr", it: [{ ty: "rc", d: 1, s: still([510, 510]), p: still([0, 0]), r: still(0) }, { ty: "fl", c: still([...mix(light, dark, (n % 5) / 6), 1]), o: still(100), r: 1 }, tr] },
      ],
    })).reverse();
    return { v: "5.12.2", fr: 50, ip: 0, op: 300, w: 600, h: 600, nm: "loader", ddd: 0, assets: [], layers };
  };
  if (loader) {
    const logo = $(".loader__logo", loader);
    const done = () => loader.classList.add("is-loaded");
    if (reduce || !window.lottie) {
      done();
    } else {
      const anim = lottie.loadAnimation({ container: $("#lottie"), renderer: "svg", loop: false, autoplay: true, animationData: buildLottie() });
      // Logo artwork text stays HTML and follows only the opacity to match the Lottie frames (original logo layers frames 182→217 · 265→289)
      const fade = (f) => (f < 182 ? 0 : f < 217 ? (f - 182) / 35 : f < 265 ? 1 : f < 289 ? 1 - (f - 265) / 24 : 0);
      anim.addEventListener("enterFrame", () => { logo.style.opacity = fade(anim.currentFrame); });
      anim.addEventListener("complete", done);
      // If data is passed directly, loading can finish inside loadAnimation so autoplay isn’t applied on some builds — play it manually
      if (anim.isLoaded) anim.play();
      else anim.addEventListener("DOMLoaded", () => anim.play());
    }
  }

  // Three hero photos — each does a 1s crossfade every 3s
  if (window.Swiper) {
    $$(".fv .swiper").forEach((el) => new Swiper(el, { effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: 1000, autoplay: { delay: 3000 } }));
    // Phone photo strip — the top row flows left, the bottom row flows right, one step every 10s in a straight line
    $$(".program__slide").forEach((el) => new Swiper(el, { loop: true, loopAdditionalSlides: 1, spaceBetween: 20, slidesPerView: "auto", speed: 10000, allowTouchMove: false, autoplay: { delay: 0, reverseDirection: el.classList.contains("is-bottom") } }));
  }

  window.siteMM.add("(prefers-reduced-motion: no-preference)", () => {
    // About text — each line floats up from 20px below and transparent at .3 intervals, tied to scroll
    $$(".lead__text").forEach((t) => {
      gsap.fromTo($$("span", t), { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.3, scrollTrigger: { trigger: t, start: "top 90%", end: "bottom 50%", scrub: true } });
    });
    // 8 scattered photos — when 30% of the section reaches the bottom of the screen, they turn on at .2 intervals over .6s
    gsap.to(".program__images li", { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power2.out", scrollTrigger: { trigger: ".program", start: "30% bottom" } });
  });
  window.siteMM.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".program__images li", { opacity: 1 });
  });
})();
