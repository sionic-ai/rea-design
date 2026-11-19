// About motion. Original values: floating photo yPercent pair scrub 1.2 · group photo yPercent -13→13 + scale 1.2→1 scrub 1.3.
FN.onPage("about", () => {
  // Values that make each photo flow a different distance, modeled on the original Y2 (desktop) table
  const FLOAT = [[20, -40], [40, -30], [10, -50], [30, -20], [50, -10]];

  // Cursor reaction — original mouseParallax depths: flow section researcher [.15~.7] · plan section graph and people [0,1,.5,−.8]
  [[".ab-steps__art", 0.7], [".graph__art", 1]].forEach(([s, d]) => FN.parallax(document.querySelector(s), d));

  // Original feature card: when the cursor enters the list, a 350×280 (corner 20) photo follows with the cursor at its center — the current card photo is .52s (after .04s),
  // The rest take .68+.08d s (after .08+.04d s) expo.out by card distance d. Tilt is 8°/−6° for even/odd cards, with ±8° toward the cursor’s position within the list width (the rest at .65x).
  // Hovering another card makes its photo go 0→1 scale, −6°/8°→8°/−6° in .8s expo.out, and the previous photo disappears in .4s quart.out after .3s.
  // On enter and leave the inner drawing scales 0↔1 over .4s cubic-bezier(.075,.82,.165,1). Like the original, absent below 900 width
  const tilt = (i) => (i % 2 === 0 ? 8 : -6);
  document.querySelectorAll('[data-slot="feature-list"] .ab-feats, [data-slot="factory-list"] .ab-feats').forEach((list) => {
    if (!FN.cursorOK) return;
    const cards = [...list.querySelectorAll(":scope > .ab-feat")];
    list.insertAdjacentHTML("beforeend", `<div class="ab-float" aria-hidden="true">${cards.map((c, i) =>
      `<div class="ab-float__item"><div><div class="wf-img" data-label="${c.querySelector(".wf-img")?.dataset.label || `Feature ${i + 1} Photo · Product or on-site shot · Landscape 5:4`}"></div></div></div>`).join("")}</div>`);
    const items = [...list.querySelectorAll(".ab-float__item")];
    const inners = items.map((it) => it.firstElementChild);
    gsap.set(items, { autoAlpha: 0, zIndex: 0 });
    gsap.set(inners, { x: 0, y: 0, scale: 0, rotate: 15, transformOrigin: "center center" });
    let cur = items[0], over = false, sx = null, sy = null;
    gsap.set(cur, { autoAlpha: 1, zIndex: 10 });
    gsap.set(inners[0], { scale: 1, rotate: tilt(0) });
    const front = (it) => items.forEach((x) => (x.style.zIndex = x === it ? "10" : "0"));
    const pick = (it) => {
      if (it === cur) { front(it); gsap.killTweensOf(it); gsap.set(it, { autoAlpha: 1 }); return; }
      const old = cur;
      gsap.killTweensOf(old);
      gsap.to(old, { autoAlpha: 0, duration: 0.4, delay: 0.3, ease: "quart.out", onComplete: () => { if (old !== cur) old.style.zIndex = "0"; } });
      cur = it;
      front(it);
      const i = items.indexOf(it);
      gsap.killTweensOf(it);
      gsap.set(it, { autoAlpha: 1 });
      gsap.killTweensOf(inners[i]);
      gsap.fromTo(inners[i], { scale: 0, rotate: i % 2 === 0 ? -6 : 8 }, { scale: 1, rotate: tilt(i), duration: 0.8, ease: "expo.out" });
    };
    const follow = () => {
      if (sx === null) return;
      const r = list.getBoundingClientRect(), x = sx - r.left, y = sy - r.top;
      if (x < 0 || x > r.width || y < 0 || y > r.height) return;
      const lean = gsap.utils.clamp(-8, 8, (x / r.width - 0.5) * 16), at = items.indexOf(cur);
      inners.forEach((el, i) => {
        const d = Math.abs(i - at), me = i === at;
        gsap.to(el, { x: x - 175, y: y - 140, rotate: tilt(i) + lean * (me ? 1 : 0.65), duration: me ? 0.52 : 0.68 + d * 0.08, delay: me ? 0.04 : 0.08 + d * 0.04, ease: "expo.out", overwrite: "auto" });
      });
    };
    list.addEventListener("pointerenter", (e) => { over = true; sx = e.clientX; sy = e.clientY; list.classList.add("is-float"); pick(cur); follow(); });
    list.addEventListener("pointerleave", () => { over = false; list.classList.remove("is-float"); });
    list.addEventListener("pointermove", (e) => { sx = e.clientX; sy = e.clientY; follow(); });
    list.addEventListener("pointerover", (e) => {
      const card = e.target.closest?.(".ab-feat");
      const it = card && !card.contains(e.relatedTarget) ? items[cards.indexOf(card)] : null;
      if (it) pick(it);
    });
    const again = () => over && follow();
    addEventListener("scroll", again, { passive: true });
    addEventListener("resize", again);
    FN.cleanup(() => { removeEventListener("scroll", again); removeEventListener("resize", again); });
  });
  FN.scene(() => {
    // Original data-inview: when the top reaches screen center + 20% (30% at widths of 900 or less) it adds inview and never removes it — map circles and location markers appear (about.css)
    const map = document.querySelector(".network__map");
    if (map) ScrollTrigger.create({ trigger: map, start: () => (innerWidth <= 900 ? "top center+=30%" : "top center+=20%"), once: true, onEnter: () => map.classList.add("inview") });
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray(".optimization__img").forEach((el, i) => {
        const [a, b] = FLOAT[i];
        gsap.fromTo(el, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.2, invalidateOnRefresh: true } });
      });
      gsap.fromTo(".own__img", { yPercent: -13, scale: 1.2 }, { yPercent: 13, scale: 1, ease: "none", scrollTrigger: { trigger: ".own", start: "top bottom", end: "bottom top", scrub: 1.3 } });
      gsap.utils.toArray(".ab-intro__video .wf-img").forEach((v) => gsap.fromTo(v, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: v.parentElement, start: "top bottom", end: "center center", scrub: true } }));
      // The original graphCanvas plays once when the graph is 10% visible (threshold .1) and stops on the last frame
      gsap.from(".graph__bars i", { scaleY: 0, duration: 1.2, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".graph", start: "10% bottom", once: true } });
      const curve = document.querySelector(".graph__curve path");
      if (curve) {
        const len = curve.getTotalLength();
        gsap.fromTo(curve, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: ".graph", start: "10% bottom", once: true } });
      }
      gsap.from(".ab-balloon", { scale: 0, duration: 0.8, ease: "elastic.out(0.5, 0.4)", scrollTrigger: { trigger: ".ab-balloon", start: "top 85%", once: true } });
    });
  });
});
