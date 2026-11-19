// Play in town: each season binds the whole plan range into one scrub and splits the progress per step (one photo).
// Original values as is — in the first half of a step the photo opens (after 0.2), at 70% open the text changes, and on portrait screens the first card is held two cells long and darkly covered from 0.4 on.
(() => {
  const portrait = matchMedia("(orientation: portrait)");
  let isP = portrait.matches;
  document.querySelectorAll(".es-season").forEach((sec) => {
    const plan = sec.querySelector(".es-plan");
    const texts = [...sec.querySelectorAll(".es-text")];
    const imgs = [...sec.querySelectorAll(".es-img")];
    const r = texts.length;
    plan.style.setProperty("--step-count", r);
    let li = -1, ls = -1;
    const apply = (idx, step, force = false) => {
      if (!force && li === idx && ls === step) return;
      li = idx; ls = step;
      const s = step < 0.5 ? step / 0.5 : 1;
      const rv = s <= 0.2 ? 0 : (s - 0.2) / 0.8;
      const swap = rv >= 0.7;
      const firstLand = idx === 0 && !isP;
      texts.forEach((t, o) => t.classList.toggle("is-active", o === idx ? firstLand || swap : o === idx - 1 && !swap));
      const m = Math.min(idx, imgs.length - 1);
      imgs.forEach((im, o) => {
        const now = o === m, before = o === m - 1;
        const reveal = now ? (m === 0 ? 1 : rv) : before ? 1 : 0;
        const overlay = now ? (step <= 0.4 ? 0 : (step - 0.4) / 0.6) : before ? 1 : 0;
        const box = im.querySelector(".es-img__reveal");
        box.style.setProperty("--reveal", reveal);
        box.style.setProperty("--overlay", overlay);
        im.style.zIndex = now ? 3 : before ? 2 : 0;
        im.classList.toggle("is-active", now);
      });
    };
    const split = (p) => {
      if (!isP) { const t = p * r; return { idx: Math.min(Math.floor(t), r - 1), step: t - Math.floor(t) }; }
      const t = p * (r - 1 + 2);
      if (t <= 2) return { idx: 0, step: t / 2 };
      const o = t - 2;
      return { idx: Math.min(Math.floor(o) + 1, r - 1), step: o - Math.floor(o) };
    };
    apply(0, isP ? 0 : 1, true);
    if (SM.reduced) { apply(0, 1, true); return; }
    ScrollTrigger.create({
      trigger: plan, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
      onUpdate: ({ progress }) => { const { idx, step } = split(progress); apply(idx, step); },
      onLeave: () => apply(r - 1, 1, true),
      onLeaveBack: () => apply(0, isP ? 0 : 1, true),
    });
    portrait.addEventListener("change", (e) => { isP = e.matches; li = -1; ls = -1; ScrollTrigger.refresh(); });
  });
})();
