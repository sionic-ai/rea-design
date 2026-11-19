(() => {
  const { doodle } = window.tcArt;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Four header line drawings — two copies of the same drawing (poses slightly twisted) alternate every 1.3 seconds, only when near the screen (200px)
  const flip = (name) => `<span class="ab-flip">${doodle(name)}${doodle(name, "is-b")}</span>`;
  const flips = [...document.querySelectorAll("[data-ab-flip]")];
  flips.forEach((el) => (el.innerHTML = flip(el.dataset.abFlip)));
  const track = document.querySelector("[data-ab-marquee]");
  // The phone scrolls four items horizontally (original react-fast-marquee autoFill · 30px/s) — chained enough to fill the panel and looping at half-turn length
  if (track) {
    const one = flips.map((el) => flip(el.dataset.abFlip)).join("");
    track.innerHTML = one + one + one + one;
    const setDur = () => track.style.setProperty("--ab-marquee-dur", `${(track.scrollWidth / 2 / 30).toFixed(2)}s`);
    new ResizeObserver(setDur).observe(track);
  }
  if (!reduce) {
    const timers = new Map();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const box = e.target.querySelector(".ab-flip") || e.target;
      if (e.isIntersecting && !timers.has(box)) timers.set(box, setInterval(() => box.classList.toggle("is-alt"), 1300));
      if (!e.isIntersecting && timers.has(box)) { clearInterval(timers.get(box)); timers.delete(box); }
    }), { rootMargin: "200px" });
    flips.forEach((el) => io.observe(el));
    track && track.querySelectorAll(".ab-flip").forEach((el) => io.observe(el));
  }

  // Body text rises .7s after opening
  const body = document.querySelector("[data-ab-rise]");
  if (body) reduce ? body.classList.add("is-in") : setTimeout(() => body.classList.add("is-in"), 700);

  // Highlighter band — when it enters the area excluding the bottom 30% of the screen, it paints for characters × 80ms
  const marks = document.querySelectorAll("[data-ab-mark]");
  marks.forEach((m) => (m.style.transitionDuration = `${m.textContent.trim().length * 80}ms`));
  const once = (els, margin, on) => {
    if (reduce) return els.forEach(on);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); on(e.target); } }), { rootMargin: margin });
    els.forEach((el) => io.observe(el));
  };
  once(marks, "0px 0px -30% 0px", (m) => m.classList.add("is-on"));

  // Rising cells and circles (original FadeIn: excluding the bottom 12% of the screen, the data value is the delay in ms)
  const ups = [...document.querySelectorAll("[data-ab-up], [data-ab-pop]")];
  ups.forEach((el) => (el.style.transitionDelay = `${el.dataset.abUp || el.dataset.abPop || 0}ms`));
  once(ups, "0px 0px -12% 0px", (el) => el.classList.add("is-in"));

  // Solution photo parallax — +40px when the photo cell touches the screen bottom, −40px when it fully leaves the top (no curve)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(min-width: 721px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-ab-parallax]").forEach((el) => {
        gsap.fromTo(el, { y: 40 }, { y: -40, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }
})();
