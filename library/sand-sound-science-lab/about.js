/* About — panels stand on the right (wide screens) · top (narrow screens) drawing one shape, and the head title rises line by line */
(() => {
  const { plate, splitHeading } = window.clShared;
  const place = () => plate && (innerWidth >= 1024 ? plate.setRegion(0.7, 0.5, 0.95) : plate.setRegion(0.5, 0.26, 0.8));
  const start = () => {
    if (plate) { plate.setMode({ kind: "rect", m: 1, n: 2, sign: 1 }, 0); plate.setCamera("tilt"); place(); }
    const t = document.querySelector(".cl-about-title");
    if (t && window.clCame) splitHeading(t, { now: true, delay: 0.1 });
  };
  addEventListener("resize", place);
  if (window.clEntered) start(); else document.addEventListener("cl:entered", start, { once: true });
})();
