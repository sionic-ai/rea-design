// Site-wide — Lenis smooth scroll (1.3.26 defaults, tied to the GSAP clock), Skin · typeface · flip state changed by the play cells (Skin and typeface persist for the next visit)
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };
  if (store.get("mp-theme") === "light") root.dataset.theme = "light";
  if (store.get("mp-typeface") === "play") root.dataset.typeface = "play";

  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  window.MP = {
    reduce,
    lenis,
    scrollTo(y) { lenis ? lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); },
    toggleTheme() { const light = root.dataset.theme !== "light"; light ? (root.dataset.theme = "light") : delete root.dataset.theme; store.set("mp-theme", light ? "light" : "dark"); },
    toggleType() { const play = root.dataset.typeface !== "play"; play ? (root.dataset.typeface = "play") : delete root.dataset.typeface; store.set("mp-typeface", play ? "play" : "sans"); requestAnimationFrame(() => ScrollTrigger.refresh()); return play; },
    toggleFlip() { root.classList.toggle("is-upside"); },
  };
})();
