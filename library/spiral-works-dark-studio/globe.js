// Dot globe — uses the same cobe as the original (MIT, 2.x redraws via update). It always rotates .0032 rad per frame, and dragging adds distance moved ÷ 200 rad. The color is read from the Skin
(() => {
const createGlobe = window.createGlobe;
const canvas = document.querySelector("[data-globe]");
if (canvas && createGlobe) {
  const css = getComputedStyle(document.documentElement);
  const rgb = (name) => {
    const g = document.createElement("canvas").getContext("2d");
    g.fillStyle = css.getPropertyValue(name).trim();
    g.fillRect(0, 0, 1, 1);
    return [...g.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((x) => x / 255);
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let phi = 0, drag = null, offset = 0, extra = 0, width = canvas.offsetWidth, globe = null;
  const start = () => {
    width = canvas.offsetWidth || 400;
    const light = document.documentElement.dataset.theme === "light";
    globe = createGlobe(canvas, {
      devicePixelRatio: 2, width: width * 2, height: width * 2, phi: 0, theta: 0.28, mapSamples: 16000,
      dark: light ? 0 : 1, diffuse: 1.2, mapBrightness: 6, baseColor: rgb("--kf-raised").map((x) => Math.max(x, 0.3)),
      markerColor: rgb("--kf-accent"), glowColor: rgb("--kf-surface"), markers: [],
    });
    const loop = () => { requestAnimationFrame(loop); if (drag === null && !reduce) phi += 0.0032; globe.update({ phi: phi + extra, width: width * 2, height: width * 2 }); };
    requestAnimationFrame(loop);
    requestAnimationFrame(() => canvas.classList.add("is-on"));
  };
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); start(); } }, { rootMargin: "100% 0px" }).observe(canvas);
  addEventListener("resize", () => (width = canvas.offsetWidth));
  canvas.addEventListener("pointerdown", (e) => { drag = e.clientX - offset; canvas.style.cursor = "grabbing"; });
  const stop = () => { drag = null; canvas.style.cursor = "grab"; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointerout", stop);
  canvas.addEventListener("pointermove", (e) => { if (drag !== null) { offset = e.clientX - drag; extra = offset / 200; } });
}
})();
