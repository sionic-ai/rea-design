// Day/night plate and page entrance/close.
// First page: header line turns on as a .3s straight line, and once the logo image is called, the card grid rises 15px from below with .5s easeInOut.
// Sub page: rises with the same .5s easeInOut delayed by .3s, hovering the close button lowers the body 20px, and pressing drops it 25px and it vanishes at .4s easeOut, then returns to the first page.
(() => {
  const root = document.documentElement;
  window.nfTheme = {
    get dark() { return root.dataset.theme === "dark"; },
    set(dark) {
      if (dark) root.dataset.theme = "dark";
      else delete root.dataset.theme;
      try { localStorage.setItem("nf-theme", dark ? "dark" : "light"); } catch (e) {}
      document.dispatchEvent(new CustomEvent("nf:theme", { detail: { dark } }));
    },
  };

  if (window.CustomEase) CustomEase.create("nf", "0.85,0,0.3,1");

  // Converts the framer-motion default spring (mass 1) into a curve and length by the same formula — rest detection also works like framer: remaining distance restDelta, velocity restSpeed (in value units)
  window.nfSpring = (stiffness, damping, delta = 1, restDelta = 0.5, restSpeed = 10) => {
    const w = Math.sqrt(stiffness), z = damping / (2 * w), wd = w * Math.sqrt(1 - z * z);
    const x = (t) => 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    const v = (t) => (x(t + 1e-4) - x(t)) / 1e-4;
    let T = 0.05;
    while (T < 3 && !(Math.abs(1 - x(T)) * delta < restDelta && Math.abs(v(T)) * delta < restSpeed)) T += 1 / 240;
    const name = `nf-spring-${stiffness}-${damping}-${delta}`;
    if (!window.CustomEase) return { ease: "back.out(1.7)", duration: T };
    const pts = Array.from({ length: 61 }, (_, i) => `${(i / 60).toFixed(4)},${x((T * i) / 60).toFixed(4)}`);
    return { ease: CustomEase.get(name) || CustomEase.create(name, `M0,0 L${pts.slice(1).join(" L")}`), duration: T };
  };
  const head = document.querySelector(".nf-head");
  const grid = document.querySelector(".nf-grid");
  const page = document.querySelector(".nf-sub__page");
  const wrap = document.querySelector(".nf-sub__wrap");
  const close = document.querySelector(".nf-close");

  const mm = gsap.matchMedia();
  mm.add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const still = ctx.conditions.reduce;
    if (head && grid) {
      if (still) { gsap.set([head, grid], { opacity: 1 }); return; }
      gsap.fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" });
      // The original raised the grid after the logo drawing was called once the header line turned on (measured at about .07s later)
      gsap.fromTo(grid, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.07, ease: "power1.inOut" });
    }
    if (page) {
      if (still) gsap.set(page, { opacity: 1 });
      else gsap.fromTo(page, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: "power1.inOut" });
    }
  });

  if (close && page && wrap) {
    const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Original framer’s default y spring (stiffness 500 · damping 25 · rest .5px)
    const spring = window.nfSpring(500, 25, 20);
    const sink = (on) => gsap.to(wrap, { y: on ? 20 : 0, duration: reduce() ? 0 : spring.duration, ease: spring.ease, overwrite: true });
    close.addEventListener("pointerenter", () => sink(true));
    close.addEventListener("pointerleave", () => sink(false));
    // As in the original, a button and not a link — goes to the first page only after the panels are fully out
    close.addEventListener("click", () => {
      const go = () => { location.href = close.dataset.href || "index.html"; };
      if (reduce()) return go();
      gsap.to(page, { y: 25, opacity: 0, duration: 0.4, ease: "power1.out", overwrite: true, onComplete: go });
    });
  }
})();
