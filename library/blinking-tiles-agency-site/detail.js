// Work detail — on open the panel rises immediately and the page behind steps back. On close (close button · Esc · backdrop) the panel goes down in .52s and then returns to the work list (without a cell transition)
(() => {
  const ov = document.querySelector(".project-overlay"), root = document.documentElement;
  const scroller = ov.querySelector("[data-scroller]");
  const P = window.unPanels;
  root.classList.add("has-overlay");
  P.open.add("overlay");
  P.recede();
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add("is-in")));
  // Scroll inside the board also uses Lenis like the original (lerp .07 · 1.2s)
  let inner = null;
  if (window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches && !matchMedia("(hover: none), (pointer: coarse)").matches) {
    inner = new Lenis({ wrapper: scroller, content: scroller.firstElementChild, lerp: 0.07, duration: 1.2, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), wheelMultiplier: 0.8, autoRaf: false });
    gsap.ticker.add((t) => inner.raf(t * 1000));
  }
  window.unLenis?.stop();
  let closing = false;
  const close = () => {
    if (closing) return;
    closing = true;
    ov.classList.add("is-closing");
    ov.classList.remove("is-in");
    P.open.delete("overlay");
    P.recede();
    setTimeout(() => { try { sessionStorage.setItem("kf-fx-tile-flicker-nav", "plain"); } catch {} location.href = "works.html"; }, 520);
  };
  ov.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
