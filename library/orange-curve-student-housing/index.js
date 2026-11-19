// Home — dot loader, hero where the curve, person and copy come in with a 5.9s loop, FAQ collapse (height transition).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mains = [...document.querySelectorAll(".js-fv-main")];
  const points = [...document.querySelectorAll(".js-fv-point")];
  const copy = document.querySelector(".js-fv-copy");
  const desc = document.querySelector(".js-fv-description");
  const wrap = document.querySelector(".ch-fv .js-fv-curve-wrap");
  const loader = document.querySelector(".js-loader");

  // Person — slides in from 30 left and 8px below over 1s, appears over .4s after .1s, then blur 8→0 (.3s) after .2s
  const mainIn = (el) => gsap.timeline()
    .fromTo(el, { x: -30, y: 8 }, { x: 0, y: 0, duration: 1, ease: "power2.out" })
    .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.in" }, "<0.1")
    .fromTo(el, { filter: "blur(8px)" }, { filter: "blur(0px)", duration: 0.3, ease: "power2.out" }, "<0.2");
  const mainOut = (el, delay = 0, done = () => {}) => gsap.timeline({ delay, onComplete: done })
    .to(el, { filter: "blur(8px)", duration: 0.3, ease: "power2.out" })
    .to(el, { autoAlpha: 0, x: 10, y: -4, duration: 0.35, ease: "power2.inOut" }, "<");

  function cycle(l, u, c) {
    const total = ChCurve.list("top").length;
    let delayed = null;
    const step = () => {
      mainIn(mains[l]);
      ChCurve.play(wrap, { type: "top", index: c });
      delayed = gsap.delayedCall(5.9, () => {
        const nl = (l + 1) % mains.length, nu = (u + 1) % points.length, nc = (c + 1) % total;
        gsap.timeline()
          .add(mainOut(mains[l]))
          .add(ChCurve.dismiss(wrap, 0, () => { l = nl; u = nu; c = nc; step(); }), "<0.05")
          .to(points[nu], { autoAlpha: 1, duration: 0.3, ease: "power2.inOut" }, "-=0.4")
          .to(points[u], { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, "<0.1");
      });
    };
    matchMedia("(max-width: 768px)").addEventListener("change", () => { delayed?.kill(); ChCurve.dismiss(wrap, 0, step); });
    step();
  }

  function entrance() {
    if (!mains.length || !points.length || !copy || !desc || !wrap) return;
    if (reduce) { gsap.set([mains[0], points[0], copy, desc], { autoAlpha: 1 }); ChCurve.play(wrap, { type: "top", index: 0 }).progress(1); return; }
    const sp = innerWidth <= 768;
    const from = sp ? [{ clipPath: "inset(0 100% 0 0)", x: -20, y: 6, autoAlpha: 0 }, 1] : [{ clipPath: "inset(0 100% 0 0)", x: -40, y: 10, autoAlpha: 0 }, 1.2];
    const first = ChCurve.pick("top");
    gsap.set([mains, points, copy, desc], { autoAlpha: 0 });
    const hold = sp ? 3.1 : 3.4;
    gsap.timeline({ onComplete: () => {
      mainOut(mains[0], hold);
      gsap.delayedCall(hold + 1.1, () => gsap.timeline()
        .to(points[1], { autoAlpha: 1, duration: 0.3, ease: "power2.inOut" })
        .to(points[0], { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, "<0.1"));
      ChCurve.dismiss(wrap, hold + 0.05, () => cycle(1, 1, (first + 1) % ChCurve.list("top").length));
    } })
      .fromTo(mains[0], { x: -30, y: 8 }, { x: 0, y: 0, duration: 1, ease: "power2.out" })
      .fromTo(mains[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.in" }, "<0.1")
      .fromTo(mains[0], { filter: "blur(8px)" }, { filter: "blur(0px)", duration: 0.3, ease: "power2.out" }, "<0.2")
      .fromTo(copy, from[0], { clipPath: "inset(0 0% 0 0)", x: 0, y: 0, autoAlpha: 1, duration: from[1], ease: "power3.out" }, "-=0.6")
      .add(ChCurve.play(wrap, { type: "top", index: first }), "<")
      .fromTo(points[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.inOut" }, "<0.1")
      .to(desc, { autoAlpha: 1, duration: 0.3, ease: "power1.inOut" }, "<0.05");
  }

  // Loader: lifts in .4s once the hero image has fully arrived, then the appearances run (a placeholder, so immediate if there is no image)
  if (loader) {
    const imgs = [...document.querySelectorAll("#fv img")];
    Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }))))
      .then(() => { loader.classList.add("is-dismissed"); gsap.to(loader, { autoAlpha: 0, duration: 0.4, ease: "power3.out", onComplete: entrance }); });
  } else entrance();

  // FAQ — height grows to scrollHeight (.35s) then becomes auto at the end, when closing, goes to 0 after two frames. Opening one closes the other cells
  const accs = [...document.querySelectorAll(".js-accordion")];
  accs.forEach((acc) => {
    const btn = acc.querySelector('[role="button"][aria-expanded]'), panel = acc.querySelector(`#${btn.getAttribute("aria-controls")}`);
    let open = !panel.hidden, busy = false;
    panel.style.height = open ? "" : "0";
    const wait = async () => { const a = panel.getAnimations(); if (a.length) await Promise.allSettled(a.map((x) => x.finished)); };
    const toggle = async (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true; open = !open; btn.setAttribute("aria-expanded", String(open));
      if (open) {
        accs.forEach((o) => { const b = o.querySelector("[aria-expanded]"); if (o !== acc && b.getAttribute("aria-expanded") === "true") b.click(); });
        panel.hidden = false; panel.style.height = `${panel.scrollHeight}px`; await wait(); panel.style.height = "auto"; busy = false;
      } else {
        panel.style.height = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => requestAnimationFrame(async () => { panel.style.height = "0"; await wait(); panel.hidden = "until-found"; busy = false; }));
      }
    };
    btn.addEventListener("click", toggle);
    btn.addEventListener("keydown", (e) => e.key === " " && toggle(e));
  });
})();
