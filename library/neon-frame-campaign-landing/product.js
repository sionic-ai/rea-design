// Search box: only one condition pill per group is on, and pressing search makes the result row appear at once, then drops to a spot 40px above it in .3s swing
// (original _finddevice.js — jQuery show() is immediate, scroll is animate 300. The original keeps only the manufacturer cell picked from the server list)
(() => {
  document.querySelectorAll(".pr-chips").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    g.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
  }));
  const result = document.querySelector(".pr-result");
  document.querySelector(".js-search").addEventListener("click", () => {
    result.hidden = false;
    const to = result.getBoundingClientRect().top + scrollY - 40, from = scrollY, t0 = performance.now();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, to);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 300);
      scrollTo(0, from + (to - from) * (0.5 - Math.cos(p * Math.PI) / 2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
