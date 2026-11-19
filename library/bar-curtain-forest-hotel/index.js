// Home loader — original home.bundle values as is. Each bar randomly draws a length of 0~0.8s and a delay of 0~1.2s
// Floor spot fits Circ.easeOut, the key takes 1.5 times that length with Circ.easeInOut (0.2 times later). Color at 2.7s, the curtain lifts at 4.7s over 1.2s
(() => {
  const BARS = [[0, 46, 56, 34, 41], [4.93, 35, 90, 26, 66], [9.86, 89, 26, 65, 19], [14.79, 77, 67, 56, 49], [19.72, 107, 27, 78, 20], [24.65, 86, 37, 63, 27], [29.58, 99, 4, 73, 3], [34.51, 119, 13, 87, 10], [39.44, 102, 8, 75, 6], [44.37, 131, 29, 96, 21], [49.3, 130, 26, 95, 19], [54.23, 114, 53, 83, 39], [59.16, 125, 0, 92, 0], [64.09, 128, 29, 94, 21], [69.02, 140, 5, 103, 4], [73.95, 91, 12, 67, 9], [78.88, 85, 57, 62, 42], [83.81, 105, 18, 77, 13], [88.74, 45, 45, 33, 33], [93.67, 71, 40, 52, 29], [98.6, 46, 56, 34, 41]];
  const loading = document.querySelector(".bh-loading");
  const logo = document.querySelector(".bh-loading__logo");
  if (!loading || !logo) return;
  logo.innerHTML = BARS.map(([x]) => `<span style="left:${x}%"></span>`).join("");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || reduce) { loading.remove(); return; }
  const sp = matchMedia("screen and (max-width: 768px)").matches;
  [...logo.children].forEach((s, i) => {
    const e = 0.8 * Math.random(), n = 1.2 * Math.random();
    const [, h, b, hsp, bsp] = BARS[i];
    gsap.to(s, { bottom: sp ? bsp : b, duration: e, delay: n, ease: "circ.out" });
    gsap.to(s, { height: sp ? hsp : h, duration: 1.5 * e, delay: n + 0.2 * e, ease: "circ.inOut" });
  });
  setTimeout(() => logo.classList.add("is-color-change"), 2700);
  setTimeout(() => {
    loading.classList.add("is-show");
    gsap.to(loading, { autoAlpha: 0, duration: 1.2, ease: "circ.out" });
  }, 4700);
})();
