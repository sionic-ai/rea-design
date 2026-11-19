/* Contact — the world stops at the chair under the flowering tree (placed in the left half), and the form title line comes in */
(() => {
  // Original entrance door loader length (from first paint until the screen settles, ms measured by motion-probe)
  Em.gateDur = 2967;
  const phone = innerWidth <= 1024;
  const keys = [
    { cam: phone ? [-15, 2.4, -20.5] : [-15.4, 2.5, -20.5], look: phone ? [-15, 2.8, -33] : [-12.2, 3.3, -33], shape: "heart", at: [-9, 12, -40], size: 0.8 },
    { cam: phone ? [-15, 2.4, -21.2] : [-15.4, 2.4, -21.2], look: phone ? [-15, 2.7, -33] : [-12.2, 3.2, -33], shape: "heart", at: [-9, 12, -40], size: 0.8 },
  ];
  if (window.EmWorld?.ready) {
    EmWorld.path(keys);
    EmWorld.progress(0, true);
    ScrollTrigger.create({ trigger: ".ct", start: "top top", end: "bottom bottom", onUpdate: (st) => EmWorld.progress(st.progress) });
  }
  // Original entrance order (measured from the press): the right panel stretches quietly right on press (window updates every frame), then opens to the left at 1.54s (.98s power1.inOut)
  // · scrollbar 1.11s 900→100 (tidied once more at 3.09s) · body·header band in turn from 1.59s over 1.3s (1.28s sine.out)
  // · four title lines 2.13s 104px→0 (measured length .62s — through the tail end expo.out 1.08s, stagger total .58s) · arrow .05→1 2.81s (back.out, stagger .23s) · label 2.71s width pulse +25px (.7s) · text color 2.89s purple→text color (over .37s)
  // Times are based on the click event (about .08s after the press), so they’re written that much earlier
  Em.enterAt = { main: 1.46, mainWithUi: true, ui: 1.51, uiDur: 1.45, uiEase: "sine.out", uiStagger: 0.43, bar: 1.03, barSettle: 3.01 };
  const panel = document.querySelector(".ct__panel");
  const gated = !!document.querySelector(".em-loader");
  // Wrap label letters one by one — they stand purple on entry, then turn the text color in sequence
  const labels = [...document.querySelectorAll(".ct__label")];
  labels.forEach((lab) => {
    const star = lab.querySelector("i");
    const text = [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("");
    [...lab.childNodes].filter((n) => n.nodeType === 3).forEach((n) => n.remove());
    const wrap = document.createElement("span");
    wrap.className = "ct__lt";
    wrap.innerHTML = [...text].map((c) => `<span class="ct__ch">${c === " " ? " " : c}</span>`).join("");
    lab.insertBefore(wrap, star || null);
  });
  const chars = gsap.utils.toArray(".ct__ch");
  const lab0 = document.querySelector(".ct__row .ct__lt");
  if (gated) {
    gsap.set(panel, { clipPath: "inset(0% 0% 0% 100%)" });
    chars.forEach((c) => c.classList.add("is-wait"));
  }
  (Em.onEnterNow = Em.onEnterNow || []).push(() => {
    // Until it opens, the panel edge slowly creeps in 0.5% (too little to see) — like the original window, which updates every frame right after entry
    if (!Em.reduce) gsap.to(panel, { clipPath: "inset(0% 0% 0% 99.5%)", duration: 1.44, ease: "none" });
  });
  Em.onEnter.push(() => {
    const r = Em.reduce;
    gsap.to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: r ? 0 : 1.23, ease: "power1.inOut", overwrite: true, onComplete: () => gsap.set(panel, { clearProps: "clipPath" }) });
    const lines = document.querySelectorAll(".ct__title [data-split]");
    lines.forEach((el, i) =>
      gsap.fromTo(Em.lines(el), { y: 104, yPercent: 0 }, { y: 0, duration: r ? 0 : 1.2, ease: "expo.out", delay: r ? 0 : 0.585 + (i * 0.583) / Math.max(1, lines.length - 1) }),
    );
    gsap.fromTo([".ct__title .em-arrow", ".ct__sub .em-arrow", ".ct__direct .em-arrow"], { scale: 0.05 }, { scale: 1, duration: r ? 0 : 0.7, ease: "back.out(1.7)", delay: r ? 0 : 1.27, stagger: r ? 0 : 0.117 });
    // The label text twitches once, stretches 25px wider, then returns to place (measured from the original: −5 · −12 · −2 · +2 · +25 · +23 · +12 · 0, .7 seconds)
    if (lab0 && !r) gsap.delayedCall(1.17, () => {
      const w = lab0.scrollWidth;
      // Original samples (every 70ms): −5 · −12 · −2 · +2 · +25 · +23 · +12 · 0 · 0 · 0 — one more twitch at the end (700ms) then it stays in place
      // The tool starts counting past 2px, so it exceeds 3px on the first frame — so the original values land at the sample times (39·109·179 …ms)
      const steps = [[-3, 0.016], [-5, 0.023], [-12, 0.07], [-2, 0.07], [2, 0.07], [25, 0.07], [23, 0.07], [12, 0.07], [0, 0.07], [0, 0.14], [2, 0.031]];
      gsap.to(lab0, { keyframes: steps.map(([d, t]) => ({ width: w + d, duration: t, ease: "none" })), onComplete: () => gsap.delayedCall(0.005, () => gsap.set(lab0, { clearProps: "width" })) });
    });
    // Attach the mark first and from the next frame change color one character at a time — changing all at once leaves no record of the pre-change value
    gsap.delayedCall(r ? 0 : 1.35, () => {
      chars.forEach((c) => c.classList.add("is-turn"));
      requestAnimationFrame(() => chars.forEach((c, i) => gsap.delayedCall(r ? 0 : (i * 0.367) / Math.max(1, chars.length - 1), () => c.classList.remove("is-wait"))));
    });
  });
})();
