// Hero — on entering, the body deepens from the background in 1.25s (uEnter 0→1), spinning at 4x at first then settling to normal speed in 2.5s
(() => {
  const { on, reduce } = window.aSite;
  on("arrive", () => {
    const s = window.aSmoke;
    if (!s) return;
    if (reduce) { s.uniforms.uEnter.value = 1; return; }
    gsap.fromTo(s.uniforms.uEnter, { value: 0 }, { value: 1, duration: 1.25, ease: "a-entrance" });
    gsap.fromTo(s.uniforms.uSpin, { value: 4 }, { value: 1, duration: 2.5, ease: "a-entrance" });
  });
})();
