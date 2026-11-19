// Project detail: tabs (Render · Real photo) · floor plan drawing · large text filling gray→ink · six vertical photos in a pinned horizontal flow
// Original tab data-duration-in 300 / out 100 · the fill could not get the original IX3 values, so set to top 80% → bottom 55% scrub .8
(() => {
  const { reduced } = window.ST;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $$("[data-tab]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-tab]").forEach((x) => x.classList.toggle("is-on", x === b));
    $$(".dt-visual__pane").forEach((p, i) => p.classList.toggle("is-on", i === +b.dataset.tab));
  }));

  // Floor plan: instead of the original drawing, a new brown line drawing of the same type (L-shaped house · several rooms · furniture · door swing)
  const r = (x, y, w, h, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
  const walls = [r(90, 210, 430, 330), r(250, 40, 170, 175), r(410, 10, 140, 210)].join("");
  const rooms = [r(100, 220, 140, 150), r(100, 380, 140, 150), r(250, 220, 60, 90), r(320, 220, 190, 310), r(260, 50, 150, 155), r(420, 20, 120, 190)].join("");
  const furn = [r(120, 250, 90, 70, 'rx="4"'), r(130, 400, 60, 40), r(355, 300, 110, 70, 'rx="6"'), r(340, 420, 50, 90), r(430, 60, 80, 50), r(280, 70, 50, 40), r(450, 140, 60, 50, 'rx="25"')].join("");
  const chairs = Array.from({ length: 6 }, (_, i) => `<circle cx="${365 + (i % 3) * 45}" cy="${i < 3 ? 290 : 380}" r="7"/>`).join("");
  const arcs = [[240, 300], [310, 260], [420, 120], [250, 470]].map(([x, y]) => `<path d="M${x} ${y}v-26a26 26 0 0 1 26 26z" stroke-width="0.8"/>`).join("");
  const plants = [[120, 560], [180, 570], [460, 560], [500, 565]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" stroke-dasharray="3 3"/><circle cx="${x}" cy="${y}" r="6"/>`).join("");
  $(".dt-plan__svg").innerHTML = `<svg viewBox="60 0 520 600" fill="none" stroke="currentColor" aria-hidden="true"><g stroke-width="6">${walls}</g><g stroke-width="1.2">${rooms}</g><g stroke-width="1">${furn}${chairs}${arcs}${plants}</g><path d="M90 540c40 20 140 30 200 20M400 545c40 15 90 15 120 0" stroke-width="1"/></svg>`;

  if (reduced) return;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    (document.fonts?.ready || Promise.resolve()).then(() => {
      $$("[data-gray]").forEach((el) => {
        const sp = new SplitText(el, { type: "words", wordsClass: "word-wrap" });
        gsap.to(sp.words, { color: window.ST.cssColor("var(--kf-ink)"), stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 55%", scrub: 0.8 } });
      });
      const six = $(".dt-six"), track = $(".dt-six__track"), view = $(".dt-six__view");
      const travel = () => Math.max(0, track.scrollWidth - view.clientWidth + 2 * parseFloat(getComputedStyle(view).paddingLeft));
      gsap.to(track, { x: () => -travel(), ease: "none", scrollTrigger: { trigger: six, start: "center center", end: () => "+=" + travel(), pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      ScrollTrigger.refresh();
    });
  });
})();
