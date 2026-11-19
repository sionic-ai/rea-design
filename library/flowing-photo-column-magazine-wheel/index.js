// First page — fold loader curtain → lift photo column cover·fade to gray → draw logo line, header drops after passing the awning, logo fades with scroll
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = document.querySelector(".cm-loader");
  const photos = document.querySelector(".cm-photos");
  const header = document.querySelector(".cm-header");
  const logo = document.querySelector(".cm-home__logo");
  const cue = document.querySelector(".cm-scroll");
  const lines = [...document.querySelectorAll(".cm-photos__line")];
  const strokes = logo ? [...logo.querySelectorAll("path, text")] : [];
  const KEY = "cm-home-visited";
  let visited = false;
  try { visited = !!sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, "1"); } catch {}
  if (visited || reduce) loader?.querySelector(".cm-loader__spinner")?.style.setProperty("display", "none");

  const vh = () => innerHeight;
  // First-visit session — the logo is lines only, the pillars are shifted ±1/4 screen under a white cover
  if (!visited && !reduce) {
    strokes.forEach((p) => {
      const len = p.getTotalLength ? p.getTotalLength() : 600;
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.fillOpacity = 0;
    });
    lines.forEach((l, i) => gsap.set(l.querySelector(".cm-photos__inner"), { y: (i % 2 ? -1 : 1) * vh() / 4 }));
    gsap.set(photos.querySelectorAll(".cm-photos__shot"), { filter: "grayscale(0)" });
  } else {
    gsap.set(photos, { opacity: 0.09 });
    photos.classList.add("is-done");
    cue?.classList.remove("is-out");
  }

  // Length over which the cover folds alternately up and down — screen height × 3ms (2.7s at 900), customOut
  const reveal = () => {
    const d = Math.floor(3000 * vh()) / 1e6;
    gsap.timeline({ onComplete: () => { photos.classList.add("is-done"); root.classList.remove("cm-loading"); cue?.classList.remove("is-out"); } })
      .to(photos.querySelectorAll(".cm-photos__veil"), { scaleY: 0, duration: d, ease: "cmOut" })
      .to(photos.querySelectorAll(".cm-photos__inner"), { y: 0, duration: d, ease: "cmOut" }, `-=${d}`)
      .to(photos.querySelectorAll(".cm-photos__shot"), { filter: "grayscale(1)", duration: 0.6 })
      .to(photos, { opacity: 0.09, duration: 0.6 }, "-=0.6")
      .to(strokes, { strokeDashoffset: 0, duration: 0.4 })
      .to(strokes, { fillOpacity: 1, duration: 0.4 });
  };
  addEventListener("load", () => {
    if (reduce) { root.classList.remove("cm-loading"); loader?.remove(); return; }
    if (visited) {
      gsap.timeline().to(loader.querySelector(".cm-loader__mask"), { scaleY: 0, duration: 1.1, ease: "cmInOut" })
        .to(loader, { scaleY: 0, duration: 1.1, ease: "cmInOut", onComplete: () => { root.classList.remove("cm-loading"); loader.remove(); } }, "-=0.5");
      return;
    }
    gsap.timeline()
      .to(loader.querySelector(".cm-loader__spinner"), { opacity: 0, duration: 1 })
      .to(loader.querySelector(".cm-loader__mask"), { scaleY: 0, duration: 1.1, ease: "cmInOut", onComplete: reveal }, "-=0.6")
      .to(loader, { scaleY: 0, duration: 1.1, ease: "cmInOut", onComplete: () => loader.remove() }, "-=0.5");
  });

  if (reduce) { header?.classList.add("is-enter"); return; }
  // After passing the awning fully, the header comes down (.8s), and hides again when scrolling back up
  ScrollTrigger.create({ trigger: ".cm-shades", start: "top top", end: "bottom center", onLeave: () => header?.classList.add("is-enter"), onEnterBack: () => header?.classList.remove("is-enter") });
  // Hero logo — fades while one screen scrolls and moves down by screen height/1.5 (follows with .1s)
  ScrollTrigger.create({ trigger: ".cm-home__header", start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => gsap.to(logo, { opacity: 1 - s.progress, y: (vh() * s.progress) / 1.5, duration: 0.1 }) });
  ScrollTrigger.create({ trigger: ".cm-mags", start: "top bottom", onEnter: () => cue?.classList.add("is-out"), onLeaveBack: () => cue?.classList.remove("is-out") });
})();
