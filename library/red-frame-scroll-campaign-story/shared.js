// Frame — when the first opening (diagonal-open-intro) ends, turns on the Hero entrance and releases the scroll lock. The original blocks wheel, touch and arrow keys until the intro ends.
// Hamburger and expanded menu, right progress bar, and scene buttons (data-go) send to the spot on the single timeline built by index.js
(() => {
  const frame = document.querySelector(".jl-frame");
  const box = frame.querySelector(".jl-frame__box");
  const bnr = frame.querySelector(".jl-bnr");
  const block = (e) => { if (e.type !== "keydown" || ["ArrowDown", "ArrowUp", "Space", " ", "PageUp", "PageDown", "Home", "End"].includes(e.key)) e.preventDefault(); };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    addEventListener("wheel", block, { passive: false });
    addEventListener("touchmove", block, { passive: false });
    addEventListener("keydown", block, { passive: false });
  }
  const unblock = () => {
    removeEventListener("wheel", block);
    removeEventListener("touchmove", block);
    removeEventListener("keydown", block);
  };
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  box.addEventListener("fx:intro", () => {
    document.querySelector(".jl-bg")?.classList.add("is-intro");
    unblock();
    if (reduce) gsap.set(bnr, { autoAlpha: 1 });
    else gsap.fromTo(bnr, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out", delay: 1.3 });
  });

  const burger = frame.querySelector(".jl-burger");
  const setMenu = (open) => { frame.classList.toggle("is-menu", open); burger.setAttribute("aria-expanded", String(open)); };
  burger.addEventListener("click", () => setMenu(!frame.classList.contains("is-menu")));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  const fill = frame.querySelector(".jl-progress__fill");
  window.jlFrame = {
    progress: (p) => (fill.style.height = `${(p * 100).toFixed(2)}%`),
    go: null,
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go]");
    if (!t || !window.jlFrame.go) return;
    e.preventDefault();
    setMenu(false);
    window.jlFrame.go(t.dataset.go);
  });
})();
