(() => {
  // The curtain is a single path stretching a 1000×1000 viewBox to the screen — full → only the bottom center lifted to 76% → folded at the top edge.
  // Joins the lifting half (.5s power3.in) and the folding half (.6~.8s power3.out), so the bottom edge peels back like cloth pulled up from the middle.
  const FULL = "M0,0 L1000,0 L1000,1000 C1000,1000 750,1000 500,1000 C250,1000 0,1000 0,1000 L0,0 Z";
  const SAG = "M0,0 L1000,0 L1000,1000 C1000,1000 750,760 500,760 C250,760 0,1000 0,1000 L0,0 Z";
  const GONE = "M0,0 L1000,0 L1000,1 C1000,1 750,1 500,1 C250,1 0,1 0,1 L0,0 Z";
  kfFx.register("sag-lift-loader", (el, { options, reduce }) => {
    const sheets = [...el.querySelectorAll("[data-fx-part=sheet]")].map((s) => (s.tagName.toLowerCase() === "path" ? s : s.querySelector("path"))).filter(Boolean);
    if (!sheets.length) return;
    const logo = el.querySelector("[data-fx-part=logo]");
    const fire = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    const end = () => { el.classList.add("is-done"); fire("fx:done"); };
    if (reduce) { end(); return () => el.classList.remove("is-done"); }
    const delay = +(options.delay ?? 0.35), up = +(options.up ?? 0.5), gap = +(options.gap ?? 0.2);
    const fold = String(options.fold ?? "0.6,0.6,0.8").split(",").map(Number);
    // Document order is lower section → upper section, so it’s reversed — the top section is lifted first and the lower ones are revealed in turn
    const order = sheets.slice().reverse();
    gsap.set(sheets, { attr: { d: FULL } });
    const tl = gsap.timeline({ onComplete: end });
    order.forEach((p, i) => {
      const at = delay + gap * i;
      tl.to(p, { attr: { d: SAG }, duration: up, ease: "power3.in" }, at)
        .to(p, { attr: { d: GONE }, duration: fold[Math.min(i, fold.length - 1)], ease: "power3.out" }, at + up);
    });
    // 1 second before the bottom section starts folding, the logo blurs for 1 second (original "< -1"), then .9s later wakes the Hero
    const fadeAt = Math.max(0, delay + gap * (order.length - 1) + up - 1);
    if (logo) tl.to(logo, { opacity: 0, duration: 1, ease: "expo.out" }, fadeAt);
    tl.call(() => fire("fx:reveal"), null, fadeAt + +(options.reveal ?? 0.9));
    return () => { tl.kill(); gsap.set(sheets, { attr: { d: FULL } }); if (logo) gsap.set(logo, { clearProps: "opacity" }); el.classList.remove("is-done"); };
  });
})();
