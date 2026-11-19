// Interaction shared by all sections — menu drawer, bead image fill and staggered floating
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Silhouettes of three beads (shapes of the original five bead photos) — defined once and the same drawing reused in each spot
  const SHAPES = {
    one: { box: "0 0 100 100", balls: [[50, 50, 49]] },
    pair: { box: "0 0 292 264", balls: [[104, 168, 96], [206, 78, 72]] },
    trio: { box: "0 0 428 524", balls: [[150, 396, 128], [332, 238, 94], [330, 92, 82]] },
  };
  const defs = document.createElement("div");
  defs.className = "sd-defs";
  defs.setAttribute("aria-hidden", "true");
  defs.innerHTML = `<svg width="0" height="0"><defs>
    <radialGradient id="sd-ball" cx="0.36" cy="0.3" r="0.78">
      <stop offset="0" data-stop="hi"/><stop offset="0.5" data-stop="mid"/><stop offset="1" data-stop="lo"/>
    </radialGradient>
    <filter id="sd-goo" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b"/>
      <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/>
      <feComposite in="SourceGraphic" in2="g" operator="atop"/>
    </filter></defs></svg>`;
  document.body.prepend(defs);

  document.querySelectorAll(".sd-bubble").forEach((el) => {
    const shape = SHAPES[el.dataset.shape] || SHAPES.one;
    const balls = shape.balls.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sd-ball)"/>`).join("");
    const goo = shape.balls.length > 1 ? ' filter="url(#sd-goo)"' : "";
    el.innerHTML = `<svg viewBox="${shape.box}" aria-hidden="true"><g${goo}>${balls}</g></svg>`;
    // In the original each bead starts early by a random 0–3s so the same beat doesn’t overlap
    el.style.setProperty("--fx-delay", `${-(Math.random() * 3).toFixed(2)}s`);
  });

  // Menu drawer — .3s after showModal, --translate 1→0 · opacity 0→1 (GSAP default curve), and on close it reverses and then closes
  const menu = document.querySelector(".sd-menu");
  const openBtn = document.querySelector(".sd-menu-btn");
  if (menu && openBtn) {
    const open = () => {
      if (menu.open) return;
      menu.showModal();
      gsap.killTweensOf(menu);
      gsap.to(menu, { "--translate": 0, opacity: 1, duration: reduce ? 0 : 0.3 });
    };
    const close = () => {
      gsap.killTweensOf(menu);
      gsap.to(menu, { "--translate": 1, opacity: 0, duration: reduce ? 0 : 0.3, onComplete: () => menu.close() });
    };
    openBtn.addEventListener("click", open);
    menu.querySelector(".sd-menu__close").addEventListener("click", close);
    menu.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    menu.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", close));
  }
})();
