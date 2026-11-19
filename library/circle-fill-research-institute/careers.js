/* Careers — staff map (same concentric contours · color dots as About) and number counting. The pattern Lottie is played by shared.js */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const NS = "http://www.w3.org/2000/svg";
  const rings = document.querySelector("[data-rings]"), dots = document.querySelector("[data-dots]");
  if (rings) for (let r = 30; r < 900; r += 18) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 330); c.setAttribute("cy", 160); c.setAttribute("r", r);
    rings.append(c);
  }
  const tones = ["var(--kf-accent)", "var(--site-plum)", "var(--site-olive)", "var(--site-peri)", "var(--site-yellow-600)"];
  [[330, 160], [345, 150], [320, 175], [340, 140], [80, 220], [180, 330], [560, 380], [900, 40], [700, 30], [950, 340]].forEach(([x, y], i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 9); c.setAttribute("fill", tones[i % tones.length]);
    dots?.append(c);
  });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.2, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });
})();
