// Company info: giant word horizontal push, primary-color ball parallax, table of contents highlight, number counting, gallery with a different speed per column.
mSite.scene(({ reduce }) => {
  // Original Lottie (450×450, 60fps 126 frames) values: 3×3 dotted circles each rotate straight 0→90°, and primary-color circles fill 0→1x in three cells (lower-right-center · bottom-left · top-left) (.5,0,0,1).
  // Fill-up start frames 36·18·0, length 90 frames. One round is 2.1s, the pause between repeats is data-rings-rest (seconds)
  const CELLS = [75, 225, 375];
  const DISCS = [[375, 225, 36], [75, 375, 18], [75, 75, 0]];
  const grow = CustomEase.create("m-disc", "0.5,0,0,1");
  document.querySelectorAll("[data-rings]").forEach((svg) => {
    const discs = DISCS.map(([x, y]) => `<circle class="disc" cx="${x}" cy="${y}" r="75"/>`).join("");
    const rings = CELLS.flatMap((y) => CELLS.map((x) => `<circle class="ring" cx="${x}" cy="${y}" r="74.3"/>`)).join("");
    svg.innerHTML = `<g>${discs}</g><g>${rings}</g>`;
    const ringEls = svg.querySelectorAll(".ring"), discEls = svg.querySelectorAll(".disc");
    gsap.set([...ringEls, ...discEls], { transformOrigin: "50% 50%" });
    if (reduce) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: +(svg.dataset.ringsRest || 0) });
    tl.fromTo(ringEls, { rotation: 0 }, { rotation: 90, duration: 2.1, ease: "none" }, 0);
    DISCS.forEach(([, , f], i) => tl.fromTo(discEls[i], { scale: 0 }, { scale: 1, duration: 1.5, ease: grow }, f / 60));
  });

  const words = [...document.querySelectorAll("[data-word]")];
  const side = [...document.querySelectorAll(".ab-side a")];
  side.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && side.forEach((x) => x.classList.toggle("is-on", x === a)) });
  });
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    if (reduce) return;
    const st = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(st, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(st.v).toLocaleString("en-US")) }) });
  });
  if (reduce) return;
  words.forEach((w, i) => gsap.fromTo(w, { x: i % 2 ? -200 : 120 }, { x: i % 2 ? 160 : -420, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true } }));
  document.querySelectorAll("[data-orb]").forEach((o) => gsap.to(o, { y: -300 * +o.dataset.orb, ease: "none", scrollTrigger: { trigger: ".ab-dark", start: "top top", end: "bottom top", scrub: true } }));
  document.querySelectorAll("[data-speed]").forEach((c) => gsap.fromTo(c, { y: 0 }, { y: +c.dataset.speed * -1, ease: "none", scrollTrigger: { trigger: ".ab-gallery", start: "top bottom", end: "bottom top", scrub: true } }));
  gsap.fromTo(".ab-gallery__word", { x: 0 }, { x: -300, ease: "none", scrollTrigger: { trigger: ".ab-gallery", start: "top bottom", end: "bottom top", scrub: true } });
});
