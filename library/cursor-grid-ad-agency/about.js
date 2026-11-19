/* Company — office photos change every 4 seconds, opening from the right, and the small text around them is scrambled with symbols (backslash, square, percent, etc.) for .6s, then after staying 2~6 seconds clears back to a backslash. 
   Neon photo has a 10% parallax on scroll. */
(() => {
  const TB = window.TB;
  if (!TB) return;
  const { reduce } = TB;
  const CH = "STUDIONAME\\■%*/+@@!?><";

  const fv = (scope) => {
    const imgs = [...scope.querySelectorAll(".ab-fv__img")];
    const notes = [...scope.querySelectorAll(".ab-fv__notes li")];
    if (!imgs.length) return () => {};
    let i = 0, timer = 0;
    const timers = [];
    const loop = () => {
      const prev = imgs[i];
      i = (i + 1) % imgs.length;
      imgs.forEach((im) => im.classList.remove("is-prev"));
      prev.classList.remove("is-active"); prev.classList.add("is-prev");
      imgs[i].classList.add("is-active");
    };
    if (!reduce && imgs.length > 1) timer = setInterval(loop, 4000);
    notes.forEach((n) => { n.dataset.text = n.innerHTML; });
    const cycle = (n) => {
      const html = n.dataset.text, text = html.replace(/<br>/g, "\n");
      gsap.to(n, { duration: 0.6, scrambleText: { text: text.replace(/\n/g, " "), chars: CH, speed: 0.7, delimiter: "" }, onComplete: () => {
        n.innerHTML = html;
        timers.push(setTimeout(() => gsap.to(n, { duration: 0.6, scrambleText: { text: "", chars: "\\\\\\\\\\\\\\", speed: 1, delimiter: "" }, onComplete: () => timers.push(setTimeout(() => cycle(n), 400)) }), Math.max(6000 * Math.random(), 2000)));
      } });
    };
    if (!reduce) notes.forEach((n, k) => timers.push(setTimeout(() => cycle(n), 100 * k + 900)));
    return () => { clearInterval(timer); timers.forEach(clearTimeout); gsap.killTweensOf(notes); };
  };

  const neon = (scope) => {
    const img = scope.querySelector(".ab-neon__img");
    if (!img || reduce) return () => {};
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => mm.revert();
  };

  const reveals = (scope) => {
    const els = [...scope.querySelectorAll(".ab-we span, .ab-data__dl div, .ab-network__logos li, .ab-access__body > *")];
    els.forEach((el, i) => { el.classList.add("tb-in-right"); el.style.setProperty("--index", i % 4); });
    return TB.inview ? TB.inview(els) : () => {};
  };

  TB.pages.about = ({ scope }) => {
    const offs = [fv(scope), neon(scope), reveals(scope)];
    if (TB.slashLinesInit) offs.push(TB.slashLinesInit(scope));
    return () => offs.forEach((f) => f && f());
  };
})();
