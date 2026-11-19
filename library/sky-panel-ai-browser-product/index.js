// First page — app icon grid rises like a wave from below when visible, and the cursor in the use-case card goes to the button and presses repeatedly (in place of the original Rive),
// The benchmark tab is drawn by the tab-bar-swap part, the text after the password heading by the type-on part
(() => {
  const out = kfFx.ease("0.22,1,0.36,1", "expo.out");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // App icon — color is made by rotating the hue from the accent color, pattern is a simple shape
  const grid = document.querySelector(".as-icons__grid");
  if (grid) {
    const glyphs = [
      '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/>',
      '<rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor"/>',
      '<path d="M5 17L12 6l7 11z" fill="currentColor"/>',
      '<path d="M6 8h12M6 12h12M6 16h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
      '<circle cx="9" cy="12" r="3.5" fill="currentColor"/><circle cx="16" cy="12" r="3.5" fill="currentColor" opacity=".7"/>',
      '<path d="M7 17V7l10 10V7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
    ];
    const n = getComputedStyle(grid).gridTemplateColumns.split(" ").length * 3;
    for (let i = 0; i < n; i++) {
      const tile = document.createElement("span");
      tile.className = "as-app";
      tile.style.setProperty("--h", `${(i * 47) % 360}`);
      tile.style.setProperty("--l", `${0.55 + ((i * 13) % 30) / 100}`);
      tile.style.setProperty("--c", `${0.12 + ((i * 7) % 10) / 100}`);
      tile.innerHTML = `<svg viewBox="0 0 24 24">${glyphs[i % glyphs.length]}</svg>`;
      grid.append(tile);
    }
    if (!still) {
      const tiles = grid.querySelectorAll(".as-app");
      gsap.set(tiles, { y: 90, opacity: 0 });
      ScrollTrigger.create({ trigger: grid.closest(".as-icons"), start: "top 85%", once: true,
        onEnter: () => gsap.to(tiles, { y: 0, opacity: 1, duration: 0.8, ease: out, stagger: { each: 0.025, from: "center", grid: "auto" } }) });
    }
  }

  // Use-case card — the cursor moves toward the button in the window, presses it and returns, repeating (only while visible)
  if (!still) document.querySelectorAll(".as-ucard__art .as-cursor").forEach((c, i) => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true, delay: i * 0.4 })
      .fromTo(c, { x: 40, y: 40 }, { x: -60, y: -30, duration: 1.1, ease: "power2.inOut" })
      .to(c, { scale: 0.85, duration: 0.13, ease: "power1.out", yoyo: true, repeat: 1 })
      .to(c, { x: 40, y: 40, duration: 1.1, ease: "power2.inOut" }, "+=0.6");
    ScrollTrigger.create({ trigger: c.closest(".as-ucard"), start: "top bottom", end: "bottom top", onToggle: (st) => (st.isActive ? tl.play() : tl.pause()) });
  });

  // 「NAME」 — when visible, fades from pale gray to the text color
  const flash = document.querySelector(".as-flash");
  if (flash) ScrollTrigger.create({ trigger: flash, start: "top 85%", once: true, onEnter: () => flash.classList.add("is-lit") });

})();
