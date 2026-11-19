// Business side: scattered photos appear at random as blur clears · scroll hint hides after scrolling 100px · each section list item switches the map at left · greeting window.
// Original values: photo delay 0 to 1s · y 5 to 30px · scale .95 to 1 · blur(+10px) → 1.2s power2.out / window close .3s 20px downward
(() => {
  SO.pages.service = (root) => {
  const { reduced } = SO;

  // Four district maps — one district colored onto the same land at a time
  const zones = [
    { c: "var(--site-list-1)", d: "M120 120C220 70 330 80 380 130 330 200 230 230 140 220 110 190 105 150 120 120Z" },
    { c: "var(--kf-accent)", d: "M210 230C260 200 330 200 360 250 340 300 280 320 230 300 205 280 200 255 210 230Z" },
    { c: "var(--site-list-3)", d: "M380 130C430 160 450 230 430 290 380 300 360 250 330 200Z" },
    { c: "var(--site-list-4)", d: "M140 300C200 330 280 340 340 330 330 400 270 440 200 430 150 400 130 350 140 300Z" },
  ];
  const fig = root.querySelector(".areas__head .figure");
  fig.innerHTML = zones
    .map((z, i) => `<svg viewBox="0 0 504 520" class="${i === 0 ? "is-show" : ""}">
      <rect width="504" height="520" style="fill: var(--site-land-2)"/>
      <path d="M90 90C200 20 380 40 450 140 500 240 470 380 380 450 290 510 160 500 110 420 60 340 40 180 90 90Z" style="fill: var(--site-land-3)"/>
      <g fill="none" stroke-width="1.5" opacity=".8" style="stroke: var(--site-white)"><path d="M40 260C160 250 330 270 504 240"/><path d="M260 0C250 160 270 360 300 520"/></g>
      <path d="${z.d}" fill="${z.c}" fill-opacity=".85"/>
      <g transform="rotate(-28 250 250)" style="fill: var(--site-white)"><rect x="244" y="200" width="9" height="100" rx="2"/><rect x="262" y="210" width="7" height="80" rx="2"/><path d="M228 240h50l5 18-30 14-30-14Z"/></g>
      <g transform="translate(24 470)"><rect width="150" height="30" rx="2" style="fill: var(--site-white)"/><circle cx="18" cy="15" r="6" fill="${z.c}"/><text x="32" y="20" font-size="12" style="fill: var(--kf-ink)">Area Name ${i + 1}</text></g>
    </svg>`)
    .join("");
  const figs = [...fig.querySelectorAll("svg")];
  root.querySelectorAll(".area_list > li").forEach((li, i) => {
    ScrollTrigger.create({
      trigger: li, start: "top center", end: "bottom center",
      onEnter: () => figs.forEach((f, j) => f.classList.toggle("is-show", j === i)),
      onEnterBack: () => figs.forEach((f, j) => f.classList.toggle("is-show", j === i)),
    });
  });

  // Greeting window — as in the original, the button’s commandfor and command="show-modal" Opens it (JS · no scroll lock), closedby="any" Accepts Esc and outside press.
  // Close button or outside press drops 20px down and closes after .3s. Wheel inside the window is not passed to Lenis
  root.querySelectorAll(".biz .modal").forEach((m) => {
    const close = () => {
      m.style.opacity = "0";
      m.style.transform = "translateY(20px)";
      setTimeout(() => { m.close(); m.style.opacity = ""; m.style.transform = ""; }, reduced ? 0 : 300);
    };
    m.querySelector(".close").addEventListener("click", (e) => { e.preventDefault(); close(); });
    m.addEventListener("click", (e) => {
      const r = m.getBoundingClientRect();
      if (m.open && !(r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right)) close();
    });
    m.addEventListener("wheel", (e) => e.stopPropagation());
  });

  const scroll = root.querySelector(".biz-scroll");
  const items = root.querySelectorAll(".biz .fv .bg .item");
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    if (conditions.reduce) { gsap.set(items, { opacity: 1 }); return; }
    items.forEach((p) => {
      const blur = parseFloat((getComputedStyle(p).filter.match(/blur\(([\d.]+)px\)/) || [0, 0])[1]);
      gsap.set(p, { opacity: 0, y: 5 + Math.random() * 25, scale: 0.95 + Math.random() * 0.05, filter: `blur(${blur + 10}px)` });
      gsap.to(p, { opacity: 1, y: 0, scale: 1, filter: `blur(${blur}px)`, duration: 1.2, delay: Math.random(), ease: "power2.out" });
    });
    ScrollTrigger.create({
      trigger: document.body, start: "top top-=100", end: "top top-=100",
      onEnter: () => gsap.to(scroll, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => (scroll.style.visibility = "hidden") }),
      onLeaveBack: () => { scroll.style.visibility = "visible"; gsap.to(scroll, { opacity: 1, duration: 0.3, ease: "power2.out" }); },
    });
  });
  return { destroy: () => { root.querySelectorAll(".biz .modal[open]").forEach((m) => m.close()); mm.revert(); } };
  };
})();
