// First page — hero descends 15% slower than scroll while a black veil rises to .8, photo moves from -7% to +1%. Work-row hover reaction and cell crosses.
(() => {
  const mm = gsap.matchMedia();
  const hero = document.querySelector(".home-hero");
  const shade = hero.querySelector(".home-hero__shade");
  const media = hero.querySelector(".home-hero__media");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.registerPlugin(ScrollTrigger);
    const set = () => {
      const t = Math.min(1, Math.max(0, scrollY / hero.offsetHeight));
      gsap.set(shade, { opacity: t * 0.8 });
      gsap.set(hero, { y: t * hero.offsetHeight * 0.15, force3D: true });
      gsap.set(media, { yPercent: -7 + t * 8, force3D: true });
    };
    const st = ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onUpdate: set, onRefresh: set });
    set();
    return () => st.kill();
  });

  // Work row — only the hovered row keeps its photo and lights the crosshairs around the row. Releases 120ms after leaving
  const list = document.querySelector(".project-list");
  const rows = [...list.querySelectorAll(".project-list__row")];
  let off = 0, crosses = [];
  const place = () => {
    const pts = [];
    rows.forEach((r, i) => { const y = r.offsetTop; pts.push(["0%", `${y}px`, i * 40], ["50%", `${y}px`, i * 40], ["100%", `${y}px`, i * 40]); });
    const end = rows.at(-1).offsetTop + rows.at(-1).offsetHeight;
    pts.push(["0%", `${end}px`, rows.length * 40], ["50%", `${end}px`, rows.length * 40], ["100%", `${end}px`, rows.length * 40]);
    crosses = window.unCrosses(list, pts, true);
  };
  const focus = (row) => {
    clearTimeout(off);
    list.classList.add("is-focused");
    rows.forEach((r) => r.classList.toggle("is-hovered", r === row));
    const i = rows.indexOf(row);
    crosses.forEach((c, k) => c.classList.toggle("is-on", Math.floor(k / 3) === i || Math.floor(k / 3) === i + 1));
  };
  const blur = () => {
    clearTimeout(off);
    off = setTimeout(() => { list.classList.remove("is-focused"); rows.forEach((r) => r.classList.remove("is-hovered")); crosses.forEach((c) => c.classList.remove("is-on")); }, 120);
  };
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    place();
    new ResizeObserver(place).observe(list);
    rows.forEach((r) => { r.addEventListener("mouseenter", () => focus(r)); r.addEventListener("mouseleave", blur); });
  }
})();
