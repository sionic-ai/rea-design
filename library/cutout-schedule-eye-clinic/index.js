// Home page: faint line patterns in the bottom-right corner of the consultation card (four original 250×190 decorative drawings — overlapping arcs·waves·arch·dot grid) redrawn at the same place and size
(() => {
  const W = 250, H = 190;
  const draw = {
    ring: () => Array.from({ length: 9 }, (_, i) => `<ellipse cx="200" cy="200" rx="${70 + i * 16}" ry="${44 + i * 10}" transform="rotate(-28 200 200)"/>`).join(""),
    wave: () => Array.from({ length: 14 }, (_, i) => `<path d="M40 ${200 - i * 11} q30 -26 60 0 t60 0 t60 0 t60 0"/>`).join(""),
    arch: () => Array.from({ length: 8 }, (_, i) => { const r = 26 + i * 12; return `<path d="M${130 - r} 190 v-40 a${r} ${r} 0 0 1 ${r * 2} 0 v40"/>`; }).join(""),
    dots: () => { let s = ""; for (let y = 14; y < H; y += 14) for (let x = 14 + (y % 28 ? 7 : 0); x < W; x += 14) if (x + y > 150) s += `<circle cx="${x}" cy="${y}" r="1.6"/>`; return s; },
  };
  document.querySelectorAll(".mk-svc__deco").forEach((el) => {
    const kind = [...el.classList].find((c) => c.startsWith("is-"))?.slice(3);
    if (!draw[kind]) return;
    const fill = kind === "dots";
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax slice"><g fill="${fill ? "currentColor" : "none"}" stroke="${fill ? "none" : "currentColor"}" stroke-width="1">${draw[kind]()}</g></svg>`;
  });

  // The original STUDIO attaches .appear to elements and removes it when they enter the screen (the first and second photos of the treatment environment have no shape rule so only the class changes, and the third section has overlapping images in a different structure) — the class is switched at the same moment
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }));
  document.querySelectorAll(".mk-env__item:not(:last-of-type) .mk-env__ph").forEach((el) => io.observe(el));
})();
