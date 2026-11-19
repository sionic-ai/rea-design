// Brand picker: draws a dark forest (three layers of tree silhouettes) and a wooden house, and the panel appears over .8s when opened.
(() => {
  const trees = (n, h, c, s) => { GM.rnd(); let p = ""; for (let i = 0; i < n; i++) { const x = (i / n) * 1600 + GM.rnd(-30, 30), w = GM.rnd(60, 140), t = h + GM.rnd(-120, 80); p += `<path d="M${x} 900V${t}l${-w / 2} 160h${w * 0.3}l${-w * 0.3} 140h${w * 1.0}l${-w * 0.3}-140h${w * 0.3}z" fill="${c}"/>`; } return p; };
  document.querySelector("[data-forest]").innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1600" height="900" fill="var(--site-forest-0)"/>${trees(18, 260, "var(--site-forest-1)")}${trees(14, 380, "var(--site-forest-1)")}${trees(10, 520, "var(--site-forest-0)")}</svg>`;
  document.querySelector("[data-brand-house]").innerHTML = `<svg class="gm-ill" viewBox="0 0 500 520" aria-hidden="true">
    <path d="M250 0v110" stroke="url(#gm-silver)" stroke-width="22"/><path d="M250 70c-50-40-100-40-150-10M250 50c50-40 110-40 150 0" stroke="url(#gm-silver)" stroke-width="6" fill="none"/>
    <path d="M70 160L250 70l180 90z" fill="url(#gm-navy)" stroke="var(--site-silver-mid)"/><rect x="90" y="160" width="320" height="200" fill="url(#gm-navy)" stroke="var(--site-silver-mid)"/>
    <path d="M170 176c40-12 120-12 160 0v26c-40-12-120-12-160 0z" fill="var(--site-silver-white)"/><text x="250" y="196" text-anchor="middle" style="font-family:var(--kf-font-display)" font-weight="800" font-size="14" letter-spacing="3" fill="var(--kf-accent-text)">WORD MARK</text>
    ${GM.box(116, 280, 40, 50, 16, 0)}${GM.box(170, 280, 34, 40, 14, 2)}${GM.box(300, 280, 40, 50, 16, 1)}${GM.box(354, 280, 30, 36, 12, 3)}
    <path d="M250 160v200" stroke="url(#gm-silver)" stroke-width="16"/>
    <path d="M250 360c0 60-30 100-90 130M250 360c0 60 30 100 90 130M250 360v150" stroke="url(#gm-silver)" stroke-width="10" fill="none" stroke-linecap="round"/>
    ${GM.box(110, 470, 50, 40, 18, 2)}${GM.box(330, 470, 50, 40, 18, 3)}
  </svg>`;
  const br = document.querySelector(".br");
  requestAnimationFrame(() => br.classList.add("is-open"));
  // The panel appears right away in .8s, and the close line is drawn 1.35s later in .4s (original modal-banner).
  gsap.delayedCall(1.35, () => document.querySelector(".br__close").classList.add("is-show"));
  document.querySelectorAll(".br__close, [data-close]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); br.classList.add("is-closed"); }));
})();
