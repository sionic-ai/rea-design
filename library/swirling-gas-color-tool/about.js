// How it works — the photo panel grows with scroll from a small spot on the hero to a large spot below (Flip.fit), and the pinned sentence fills from the left,
// When palette panels stack, the lower panel gets slightly smaller, and the photo card row flows sideways while pinned, tilting along an arc the farther it is from the center
(() => {
  const { E, reduce } = window.aSite;
  const D = document, P = window.aPalettes;
  const mm = gsap.matchMedia();

  // Swatches painted from the palette (the color itself is the content)
  const strips = { l: (p) => p, c: (p) => [p[5], p[4], p[3], p[2], p[1], p[0]].reverse(), h: () => P.map((q) => q[3]).slice(0, 6) };
  D.querySelectorAll("[data-ramp]").forEach((el) => {
    const cols = strips[el.dataset.ramp](P[0]);
    el.innerHTML = cols.map((c) => `<span style="background:${c}"></span>`).join("");
  });
  D.querySelectorAll("[data-pair]").forEach((el) => {
    const p = P[[1, 7, 4][+el.dataset.pair]];
    el.style.background = p[+el.dataset.pair === 2 ? 4 : 1];
    el.style.color = p[+el.dataset.pair === 2 ? 0 : 5];
  });
  D.querySelectorAll(".a-stack__card").forEach((el, i) => {
    const p = P[[1, 7, 2][i]];
    el.style.background = p[i === 1 ? 0 : 4];
    el.style.color = p[i === 1 ? 5 : 0];
  });
  // Ratio bar — cell width is that color’s share of the photo
  D.querySelectorAll("[data-pal-prop]").forEach((el) => {
    const p = P[+el.dataset.palProp], share = [6.2, 3.8, 4.8, 8.4, 77.7].map((v) => v / 100);
    const cols = [p[5], p[4], p[3], p[2], p[1]];
    el.querySelector(".a-prop__bar").innerHTML = cols.map((c, i) => `<span style="background:${c};width:${share[i] * 100}%"></span>`).reverse().join("");
    el.querySelector(".a-prop__cells").innerHTML = cols.map((c, i) => `<span style="background:${c};color:${i > 2 ? p[5] : p[0]}"><b>${(share[i] * 100).toFixed(1)}%</b><em>Color name ${i + 1}</em></span>`).reverse().join("");
  });
  const ui = D.querySelector("[data-pal-ui]");
  if (ui) {
    const p = P[7], card = ui.querySelector(".a-roles__card"), chips = ui.querySelectorAll(".a-roles__chip");
    card.style.background = p[0]; card.style.color = p[5];
    chips[0].style.background = p[3]; chips[0].style.color = p[0];
    chips[1].style.background = p[1]; chips[1].style.color = p[4];
    ui.querySelectorAll("[data-role]").forEach((d) => (d.style.background = p[[0, 1, 3, 4][+d.dataset.role]]));
  }

  // Photo plate — from a small spot to a large spot
  const plate = D.querySelector("[data-plate]"), from = D.querySelector("[data-plate-from]"), to = D.querySelector("[data-plate-to]");
  const place = () => {
    if (!plate || !from) return;
    const r = from.getBoundingClientRect();
    gsap.set(plate, { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height });
  };
  place();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (plate && to) {
      gsap.timeline({ scrollTrigger: { trigger: from, start: "top 60%", endTrigger: to, end: "top 30%", scrub: true, invalidateOnRefresh: true, onRefreshInit: place } })
        .add(Flip.fit(plate, to, { duration: 1, ease: E.fold, absolute: false }) || gsap.to({}, { duration: 1 }));
    }
    // The pinned sentence fills in
    const fill = D.querySelector(".a-takeover__fill");
    if (fill) gsap.fromTo(fill, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".a-takeover", start: "top top", end: "bottom bottom", scrub: true } });
    // Stacked plates — each lower plate shrinks to .94 by however much the next plate covers it
    const cards = gsap.utils.toArray(".a-stack__card");
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (next) gsap.to(c, { scale: 0.94, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 64px", scrub: true } });
    });
    // Photo card arc
    const gal = D.querySelector(".a-gal"), track = D.querySelector(".a-gal__track");
    if (gal && track) {
      const cardsG = gsap.utils.toArray(".a-gal__card");
      const bend = () => cardsG.forEach((c) => {
        const r = c.getBoundingClientRect(), off = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
        gsap.set(c, { rotate: off * 18, y: Math.abs(off) * 120 });
      });
      gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: gal, start: "top top", end: () => `+=${track.scrollWidth}`, pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: bend, onRefresh: bend } });
    }
  });
  addEventListener("resize", place);
})();
