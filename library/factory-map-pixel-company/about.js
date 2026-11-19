// About only: team photo circle orbit. Original values: one turn per 80 seconds · reverses when scrolling down, goes forward when scrolling up ·
// Above scroll speed .2 it scales to 1.8x (follow .14) · hover 1.1x·y -10·±3.5° springs (1, .42) over .7s after .16s, and on leave springs (1, .5) over .55s.
(() => {
  const section = document.querySelector(".orbit");
  if (!section) return;
  const ring = section.querySelector(".orbit__ring");
  const items = [...ring.querySelectorAll(".orbit__item")];
  const reduced = SY.reduced;
  const SPEED = 360 / 80;
  let radius = 0;
  let originY = 0;
  let base = 0;
  let dir = -1;
  let mult = 1;
  let target = 1;
  let visible = true;

  const place = () => {
    if (!radius) return;
    items.forEach((el, i) => {
      const a = base + (i / items.length) * 360;
      const r = (a * Math.PI) / 180;
      gsap.set(el, { xPercent: -50, yPercent: -50, x: radius * Math.sin(r), y: originY - radius * Math.cos(r), rotation: a, force3D: true });
    });
    section.classList.add("is-ready");
  };
  const measure = () => {
    const h = ring.clientHeight;
    const cardH = items[0].offsetHeight;
    radius = Math.max(innerWidth * 0.55, h * 0.85);
    originY = radius - h / 2 + cardH / 2 + 48;
    place();
  };
  measure();
  new ResizeObserver(measure).observe(ring);
  if (reduced) return;

  new IntersectionObserver(([e]) => ((visible = e.isIntersecting), visible || (target = 1))).observe(section);
  gsap.ticker.add(() => {
    mult += (target - mult) * 0.14;
    if (!visible) return;
    base += dir * mult * SPEED * Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    place();
  });

  let lastY = scrollY;
  let idle = 0;
  addEventListener(
    "scroll",
    () => {
      const v = scrollY - lastY;
      lastY = scrollY;
      if (v) dir = -Math.sign(v);
      target = Math.abs(v) > 0.2 ? 1.8 : 1;
      clearTimeout(idle);
      idle = setTimeout(() => (target = 1), 120);
    },
    { passive: true }
  );

  items.forEach((item, i) => {
    const card = item.querySelector(".orbit__card");
    const tilt = i % 2 === 0 ? -3.5 : 3.5;
    let tl;
    item.addEventListener("pointerenter", () => {
      item.classList.add("is-hover");
      tl?.kill();
      tl = gsap
        .timeline()
        .to(card, { scale: 1.1, y: -10, rotation: tilt, duration: 0.16, ease: "power2.out" })
        .to(card, { scale: 1.055, y: -5, rotation: tilt * 0.35, duration: 0.7, ease: "elastic.out(1, 0.42)" });
    });
    item.addEventListener("pointerleave", () => {
      item.classList.remove("is-hover");
      tl?.kill();
      tl = gsap.to(card, { scale: 1, y: 0, rotation: 0, duration: 0.55, ease: "elastic.out(1, 0.5)" });
    });
  });
})();
