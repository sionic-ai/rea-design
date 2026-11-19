// Home: Hero entrance (diagonal strip scaleY .2s · .5s + .15s stagger → photo 1.4→1 bounce.out .4s · 1.5s + .12s stagger → workers .2s · 2s + .05s stagger →
// At 2.5s the title enters dragging its shadow .6s power2.inOut), duplicates the flowing line twice, and redraws the welfare icons.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap = document.querySelector(".mv-flowwrap"), flow = wrap.querySelector(".mv-flow");
  // Original home.js: clones at most twice, until the row width is twice the parent’s width. Photo and worker entrances apply only when cloning happens
  const minLoop = (flow.parentElement?.offsetWidth || 1000) * 2;
  let total = flow.scrollWidth, copies = 0;
  while (total < minLoop && copies < 2) {
    const c = Object.assign(flow.cloneNode(true), { className: "mv-flow is-clone" });
    wrap.append(c);
    total += c.scrollWidth;
    copies++;
  }

  if (!reduced) {
    gsap.utils.toArray(".mv-bgwrap i").forEach((el, i) => {
      gsap.fromTo(el, { scaleY: 0, transformOrigin: i % 2 === 0 ? "top left" : "bottom left" }, { scaleY: 1, delay: 0.5 + i * 0.15, duration: 0.2, ease: "none" });
    });
    // The original also raises opacity to 10 — already fully visible early in the curve
    if (copies) gsap.utils.toArray(".mv-flow").forEach((f) => {
      f.querySelectorAll(".mv-photo").forEach((el, i) => gsap.fromTo(el, { opacity: 0, scale: 1.4 }, { opacity: 10, scale: 1, duration: 0.4, ease: "bounce.out", delay: 1.5 + i * 0.12 }));
      f.querySelectorAll(".mv-illust").forEach((el, i) => gsap.fromTo(el, { opacity: 0, scale: 1.4 }, { opacity: 10, scale: 1, duration: 0.2, delay: 2 + i * 0.05 }));
    });
    gsap.fromTo(".mv-title", { opacity: 0, x: -50, y: 50, textShadow: "100px -100px 0 rgba(0,0,0,1)" },
      { opacity: 1, x: 0, y: 0, textShadow: "0px 0px 0px rgba(0,0,0,1)", delay: 2.5, duration: 0.6, ease: "power2.inOut" });
  } else {
    wrap.style.animation = "none";
  }

  // Same-size solid line drawings instead of the original icons (image files)
  const ICON = {
    hand: '<path d="M6 30 h10 l10 6 h12 a3 3 0 0 1 0 6 h-12 M6 30 v14 h10 l14 6 l22 -10 a3 3 0 0 0 -3 -5 l-14 5" /><circle cx="40" cy="14" r="8"/>',
    shield: '<path d="M10 22 h44 M14 22 q-4 -12 18 -14 q22 2 18 14 M32 22 v20 q0 6 -6 6"/><path d="M8 40 l10 6 h14"/>',
    palm: '<path d="M30 54 q2 -20 0 -34 M30 20 q-12 -10 -22 -2 M30 20 q12 -10 22 -2 M30 20 q-4 -12 -14 -14 M30 20 q6 -12 16 -12 M14 56 h32"/>',
    screen: '<rect x="8" y="10" width="44" height="30" rx="3"/><path d="M22 48 h16 M30 40 v8 M16 20 h10 M16 26 h16"/>',
    coin: '<path d="M18 22 q-10 10 -10 20 q0 12 22 12 q22 0 22 -12 q0 -10 -10 -20 z M22 14 h16 l-4 8 h-8z"/><path d="M26 34 l4 6 4 -6 M30 40 v8 M25 44 h10"/>',
    stack: '<ellipse cx="30" cy="14" rx="16" ry="5"/><path d="M14 14 v8 q16 8 32 0 v-8 M14 22 v8 q16 8 32 0 v-8 M14 30 v8 q16 8 32 0 v-8 M14 38 v8 q16 8 32 0 v-8"/>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = `<svg viewBox="0 0 60 60" fill="none" style="stroke:var(--kf-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[el.dataset.icon]}</svg>`;
  });
})();
