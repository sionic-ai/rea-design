// Scene card — on hover or focus the scene loops at its own length, and on release it stops in place
(() => {
  const SVG = "http://www.w3.org/2000/svg";
  document.querySelectorAll(".d-card").forEach((card) => {
    const crowd = card.querySelector(".dc-crowd");
    for (let i = 0; i < 9; i++) {
      const p = document.createElementNS(SVG, "path");
      const x = 70 + i * 22, h = 18 + (i % 3) * 4;
      p.setAttribute("d", `M${x} ${150 - h} c-5 0 -7 5 -7 9 l-4 ${h - 6} h22 l-4 ${-(h - 6)} c0 -4 -2 -9 -7 -9z`);
      crowd.append(p);
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = gsap.timeline({ paused: true, repeat: -1 })
      .to(card.querySelector(".dc-wheel"), { rotation: 360, svgOrigin: "160 112", duration: 4, ease: "none" }, 0)
      .to(card.querySelector(".dc-lava"), { attr: { ry: 40 }, duration: 1, yoyo: true, repeat: 3, ease: "sine.inOut" }, 0)
      .to(card.querySelectorAll(".dc-lamps circle"), { opacity: 0.4, duration: 0.15, yoyo: true, repeat: 13, stagger: 0.1, ease: "none" }, 0);
    const play = () => scene.play();
    const stop = () => scene.pause();
    card.addEventListener("mouseenter", play);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", stop);
  });
})();
