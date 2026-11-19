// Service page only — the attached photo changes as each line lifts away from the bottom (1.1s power4.inOut) while the right-hand scale fills up, FAQ expand (.5s 0.9,0,0.1,1)
(() => {
  const { reduce } = window.brand;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const imgs = $$("[data-sticky-img]"), rows = $$("[data-sticky-row]"), rail = document.querySelector("[data-sticky-progress]");
  let cur = 0;
  const show = (i) => {
    if (i === cur || !imgs[i]) return;
    const down = i > cur; cur = i;
    imgs.forEach((im, k) => { im.style.zIndex = k === i ? 2 : 1; });
    if (reduce) { imgs.forEach((im, k) => (im.style.clipPath = k === i ? "inset(0 0 0 0)" : "inset(100% 0 0 0)")); return; }
    gsap.fromTo(imgs[i], { clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut", overwrite: true });
  };
  rows.forEach((row, i) => ScrollTrigger.create({ trigger: row, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && show(i) }));
  if (rail && rows.length) ScrollTrigger.create({ trigger: rows[0].parentElement, start: "top top", end: "bottom bottom", onUpdate: (s) => rail.style.setProperty("--p", s.progress.toFixed(3)) });

  $$("[data-faq]").forEach((item) => {
    const q = item.querySelector("button"), a = item.querySelector(".b-faq__a");
    q.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open); q.setAttribute("aria-expanded", String(open));
      gsap.to(a, { height: open ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "power4.inOut", onComplete: () => ScrollTrigger.refresh() });
    });
  });
})();
