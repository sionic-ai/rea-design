// Shared by subpages: the body rises from 20px below in 1s after .2s, and .3s earlier an empty box is drawn and the header-line hiding applies
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // main: "rise" — Work list (1s, from 20px below, .2s after the body) · "fade" — Blog (.7s blur only) · "none" — About · Services (body stays as is, only header elements in sequence)
  window.ai.page = ({ change = "-40%", main = "rise" } = {}) => {
    const el = document.querySelector("[data-main]");
    const box = document.querySelectorAll("[data-fv2]");
    const ready = () => { box.forEach((b) => b.classList.add("is-active")); window.ai.headerReady(); };
    if (reduce || main === "none") { gsap.set(el, { opacity: 1, y: 0 }); if (reduce) ready(); }
    else if (main === "fade") { gsap.set(el, { y: 0 }); gsap.to(el, { opacity: 1, duration: 0.7, ease: "sine.out" }); ready(); }
    else gsap.timeline().to(el, { opacity: 1, y: 0, duration: 1, ease: "sine.out" }, "+=0.2").add(ready, "-=0.7");
    window.ai.watch("[data-watch]", change);
    return ready;
  };
})();
// Article line splitting — each line gets a mask, and when the line top reaches the 60% line of the screen it moves in from 20% below over .6s sine.out
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.ai.split = (sel = "[data-split]") => addEventListener("load", () => document.fonts.ready.then(() => {
    if (reduce || !window.SplitText) return;
    document.querySelectorAll(sel).forEach((el) => {
      gsap.set(el, { opacity: 0 });
      const st = new SplitText(el, { type: "lines", linesClass: "line" });
      st.lines.forEach((l) => { const w = document.createElement("div"); w.style.overflow = "hidden"; l.parentNode.insertBefore(w, l); w.appendChild(l); });
      gsap.set(el, { opacity: 1 });
      gsap.set(st.lines, { opacity: 0, yPercent: 20 });
      st.lines.forEach((l) => gsap.to(l, { opacity: 1, yPercent: 0, duration: 0.6, ease: "sine.out", scrollTrigger: { trigger: l, start: "top 60%", once: true } }));
    });
  }));
})();
