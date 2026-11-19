// Work list — on entry the headings rise in turn, and pressing a category re-opens the cards filtered while the transition curtain covers (original work.js)
(() => {
  const body = document.body;
  const cards = [...document.querySelectorAll(".wk-card")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = "all", busy = false;
  const apply = (f) => {
    active = f;
    filters.forEach((a) => { const on = a.dataset.filter === f; a.classList.toggle("is-active", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
    let n = 0;
    cards.forEach((c) => {
      c.hidden = f !== "all" && !c.dataset.category.split(" ").includes(f);
      if (!c.hidden) c.querySelector(".wk-card__n").textContent = `(${String(++n).padStart(2, "0")})`;
    });
  };
  const enter = () => {
    if (reduce) { body.classList.add("wk-in"); abSite.watch(); return; }
    body.classList.add("wk-ready");
    body.classList.remove("wk-in");
    cards.forEach((c) => c.classList.remove("is-in"));
    abSite.watch();
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add("wk-in")));
  };
  abSite.revealed.then(() => requestAnimationFrame(() => requestAnimationFrame(enter)));
  const ease = kfFx.ease("0.9,0,0.1,1", "expo.inOut");
  filters.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const next = a.dataset.filter;
    if (next === active || busy) return;
    const veil = document.querySelector(".fx-veil"), shade = document.querySelector(".fx-veil-shade");
    if (reduce || !veil) { apply(next); return; }
    busy = true;
    const tl = gsap.timeline({ onComplete: () => {
      apply(next);
      requestAnimationFrame(() => requestAnimationFrame(() => { gsap.set(veil, { yPercent: 100 }); if (shade) gsap.set(shade, { opacity: 0 }); enter(); busy = false; }));
    } });
    tl.fromTo(veil, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0, duration: 1.6, ease }, 0);
    if (shade) tl.fromTo(shade, { opacity: 0 }, { opacity: 0.46, duration: 1.6, ease }, 0);
  }));
})();
