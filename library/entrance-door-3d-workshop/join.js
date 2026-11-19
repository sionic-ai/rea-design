// Join — the big title words rise from 115% below line by line at .12s intervals (.76s), and the picture glyph scales from 0→1 pushing the neighboring words aside to open space (.95s, .14s later)
(() => {
  const EASE = "cubic-bezier(.22,1,.36,1)";
  const wrap = document.querySelector(".join-heading");
  const reduce = CL.reduce;
  const anims = [];
  const done = () => { wrap.dataset.motion = "complete"; anims.forEach((a) => a.cancel()); };

  async function play() {
    if (reduce.matches || document.hidden) return done();
    let t = 0;
    await Promise.race([
      Promise.all([document.fonts.load(`92px ${CL.font("--kf-font-display")}`).catch(() => {})]),
      new Promise((r) => { t = setTimeout(r, 1200); }),
    ]);
    clearTimeout(t);
    if (reduce.matches || document.hidden) return done();
    wrap.dataset.motion = "measuring";
    const words = [...wrap.querySelectorAll(".join-word-mask")].map((el) => ({ el, r: el.getBoundingClientRect() }));
    const slots = [...wrap.querySelectorAll("[data-rebus-slot]")].map((el) => ({ el, r: el.getBoundingClientRect() }));
    const lines = [];
    for (const w of words) {
      let l = lines.find((x) => Math.abs(x.top - w.r.top) < 3);
      if (!l) lines.push((l = { top: w.r.top, mid: w.r.top + w.r.height / 2, words: [], slots: [] }));
      l.words.push(w);
    }
    lines.sort((a, b) => a.top - b.top);
    for (const s of slots) {
      const c = s.r.top + s.r.height / 2;
      lines.reduce((a, b) => (Math.abs(b.mid - c) < Math.abs(a.mid - c) ? b : a)).slots.push(s);
    }
    wrap.dataset.motion = "playing";
    lines.forEach((line, i) => {
      const delay = 120 * i;
      const total = line.slots.reduce((a, s) => a + s.r.width, 0);
      // Words whose image glyph width was 0 take their place here: they gather at the line center, then spread apart as the image grows
      const shiftAt = (x) => total / 2 - line.slots.reduce((a, s) => a + (s.r.left < x ? s.r.width : 0), 0);
      for (const { el, r } of line.words) {
        anims.push(el.querySelector(".join-word").animate([{ transform: "translate3d(0, 115%, 0)" }, { transform: "translate3d(0, 0, 0)" }], { duration: 760, delay, easing: EASE, fill: "both" }));
        const dx = shiftAt(r.left + r.width / 2);
        if (dx) anims.push(el.animate([{ transform: `translate3d(${dx}px, 0, 0)` }, { transform: "translate3d(0, 0, 0)" }], { duration: 950, delay: delay + 140, easing: EASE, fill: "both" }));
      }
      for (const { el, r } of line.slots) {
        const dx = shiftAt(r.left) - r.width / 2;
        anims.push(el.animate([{ transform: `translate3d(${dx}px, 0, 0)` }, { transform: "translate3d(0, 0, 0)" }], { duration: 950, delay: delay + 140, easing: EASE, fill: "both" }));
        const arts = el.matches("[data-rebus-art]") ? [el] : [...el.querySelectorAll("[data-rebus-art]")];
        arts.forEach((a) => anims.push(a.animate([{ scale: "0" }, { scale: "1" }], { duration: 950, delay: delay + 140, easing: EASE, fill: "both" })));
      }
    });
    await Promise.all(anims.map((a) => a.finished.catch(() => {})));
    done();
  }

  // If we arrived under the curtain, lift it once the art fully resolves (max .7s) and raise the title after the curtain has fully lifted (.85s)
  if (document.querySelector('.page-curtain[data-phase="waiting"]')) {
    let t = 0;
    Promise.race([
      Promise.all([...document.querySelectorAll(".join-heading img")].map((i) => i.decode().catch(() => {}))),
      new Promise((r) => { t = setTimeout(r, 700); }),
    ]).then(() => {
      clearTimeout(t);
      CL.reveal();
      document.querySelector(".join-heading h1").focus({ preventScroll: true });
      setTimeout(play, reduce.matches ? 0 : 850);
    });
  } else play();

  document.querySelector(".join-form").addEventListener("submit", (e) => {
    e.preventDefault();
    e.currentTarget.querySelector(".join-form__notice").textContent = "Send slot — this copy is not sent anywhere.";
  });
})();
