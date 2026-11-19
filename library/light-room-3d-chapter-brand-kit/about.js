// About — redraws the pie and bar charts on the numbered box faces (the original was an image asset).
(() => {
  window.BRAND.pages.about = (root) => {
  const pie = root.querySelector(".a-pie");
  const arc = (r0, r1, a0, a1, fill) => {
    const p = (r, a) => `${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)}`;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    return `<path d="M${p(r1, a0)} A${r1} ${r1} 0 ${big} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${big} 0 ${p(r0, a0)}Z" style="fill:${fill};stroke:oklch(from var(--kf-raised) calc(l * 0.9696) calc(c * 0.6786) calc(h - 4.86))" stroke-width="2"/>`;
  };
  const T = Math.PI * 2;
  pie.innerHTML = arc(48, 92, -T / 4, T * 0.15, "var(--kf-accent)") + arc(48, 92, T * 0.15, T * 0.45, "oklch(from var(--kf-accent) calc(l * 1.0555) calc(c * 1.0136) calc(h + 0.94))") + arc(48, 92, T * 0.45, T * 0.75, "var(--kf-accent)") +
    `<circle cx="100" cy="100" r="44" style="fill:var(--kf-on-accent)"/><text x="100" y="104" font-size="11" style="fill:var(--kf-accent)" text-anchor="middle">Needed for living</text>` +
    ["Element 1", "Element 2", "Element 3"].map((t, i) => { const a = -T / 4 + T * (0.2 + i * 0.3); return `<text x="${100 + Math.cos(a) * 70}" y="${104 + Math.sin(a) * 70}" font-size="10" style="fill:var(--kf-on-accent)" text-anchor="middle">${t}</text>`; }).join("");
  const bars = root.querySelector(".a-bars");
  const H = [44, 41, 37, 34, 31, 28, 26];
  bars.innerHTML = `<text x="14" y="18" font-size="12" style="fill:var(--kf-accent)">Your graph title here</text>` +
    `<line x1="30" y1="210" x2="310" y2="210" style="stroke:oklch(from var(--kf-raised) calc(l * 0.7104) 0 h)"/>` +
    H.map((h, i) => `<rect x="${40 + i * 38}" y="${210 - h * 3.6}" width="14" height="${h * 3.6}" style="fill:var(--kf-accent)"/><rect x="${56 + i * 38}" y="${210 - (h - 6) * 3.6}" width="14" height="${(h - 6) * 3.6}" style="fill:oklch(from var(--kf-accent) calc(l * 1.2499) calc(c * 0.6268) calc(h + 6.59))"/><text x="${55 + i * 38}" y="226" font-size="8" style="fill:oklch(from var(--kf-ink-soft) calc(l * 0.9716) 0 h)" text-anchor="middle">${10 + i * 10}Large</text>`).join("");

  /* Video box (original videoModal) — as soon as it opens, from −180° after .8s the front face stands up with a 1.2s elastic.out(1,.75), and it tilts following the cursor.
     On press it rolls 180° in .6s Power4.inOut so the back face stands, then .35s later fills the screen in .8s, and on close it rolls back in .6s and returns to its place in 1s */
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { lenis, magnet } = window.BRAND;
  const slot = root.querySelector(".a-concept__video"), box = slot.querySelector(".a-vbox"), cube = slot.querySelector(".a-vcube");
  const front = cube.querySelector(".is-front"), back = cube.querySelector(".is-back"), spin = cube.querySelector(".a-vcube__in") || cube, depth = cube.querySelector(".a-vcube__depth");
  const turn = { rx: -180 }, rect = { x: 0, y: 0, w: 0, h: 0 };
  let mg = { pos: { rx: 0, ry: 0, x: 0, y: 0, z: 0 } }, playing = false, busy = false;
  const draw = () => {
    const p = mg.pos, half = box.offsetHeight / 2;
    front.style.transform = `translateZ(${half}px)`;
    back.style.transform = `rotateX(180deg) translateZ(${half}px)`;
    // Like the original cubeBox, split into magnet frame · depth · rotation plate — at rest, the magnet frame and rotation plate are flat matrices
    cube.style.transform = `translate3d(${p.x * 0.2}px, ${p.y * 0.2}px, ${p.z * 0.2}px)`;
    if (depth) depth.style.transform = `translateZ(${-half}px)`;
    spin.style.transform = `rotateX(${turn.rx - p.rx}deg) rotateY(${-p.ry}deg)`;
  };
  mg = magnet(box, draw);
  draw();
  gsap.to(turn, { rx: 0, duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 0.8, ease: "elastic.out(1,0.75)", onUpdate: draw });
  const size = () => { box.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`; box.style.width = `${rect.w}px`; box.style.height = `${rect.h}px`; draw(); };
  const play = async () => {
    if (playing || busy) return;
    busy = playing = true;
    lenis?.stop();
    mg.lock(true);
    const r = slot.getBoundingClientRect();
    Object.assign(rect, { x: r.left, y: r.top, w: r.width, h: r.height });
    box.classList.add("is-on");
    box.style.left = box.style.top = "0px";
    size();
    gsap.to(turn, { rx: 180, duration: reduce ? 0 : 0.6, overwrite: true, ease: "power4.inOut", onUpdate: draw });
    await gsap.to(rect, { x: 0, y: 0, w: innerWidth, h: innerHeight, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.35, ease: "power4.inOut", onUpdate: size });
    box.classList.add("is-play");
    busy = false;
  };
  const stop = async () => {
    if (!playing || busy) return;
    busy = true;
    box.classList.remove("is-play");
    const r = slot.getBoundingClientRect();
    gsap.to(turn, { rx: 0, duration: reduce ? 0 : 0.6, ease: "power4.inOut", onUpdate: draw });
    await gsap.to(rect, { x: r.left, y: r.top, w: r.width, h: r.height, duration: reduce ? 0 : 1, ease: "power4.inOut", onUpdate: size });
    box.classList.remove("is-on");
    box.removeAttribute("style");
    mg.lock(false);
    lenis?.start();
    playing = busy = false;
    draw();
  };
  const onBox = (e) => { if (e.target.closest(".a-vclose")) stop(); else if (e.target.closest(".a-vthumb")) play(); };
  const onKey = (e) => { if (e.key === "Escape") stop(); };
  box.addEventListener("click", onBox);
  addEventListener("keydown", onKey);
  const onResize = () => { if (playing && !busy) { Object.assign(rect, { x: 0, y: 0, w: innerWidth, h: innerHeight }); size(); } else draw(); };
  addEventListener("resize", onResize);
  return () => { mg.off(); removeEventListener("keydown", onKey); removeEventListener("resize", onResize); gsap.killTweensOf([turn, rect]); if (playing) lenis?.start(); };
  };
})();
