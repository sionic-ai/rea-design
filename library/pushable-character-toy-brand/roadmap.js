// Roadmap: a dot-grid flashlight follows the cursor (first section and maker section), and the maker character’s front shakes every 120ms through center, right, center and left frames
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".mr-dots, .mr-exec__dots").forEach((dots) => {
    const zone = dots.parentElement;
    zone.addEventListener("mousemove", (e) => {
      const r = dots.getBoundingClientRect();
      dots.style.setProperty("--mx", `${e.clientX - r.left}px`);
      dots.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
  const front = document.querySelector(".mr-avatar__face--front .ms-doll");
  if (front && !reduce) {
    const order = ["center", "right", "center", "left"];
    let k = 0;
    setInterval(() => front.setAttribute("data-frame", order[(k = (k + 1) % order.length)]), 120);
  }
})();
