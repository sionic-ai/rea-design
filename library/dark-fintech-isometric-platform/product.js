// On the consumer side: three cylinders drop and overlap with scroll (original th-sui — blue 929 · white 819 · gray 199, power2.in, top bottom → center 40%) and the client filter.
// Our own art coordinates, so the fall-distance ratio (929:819:199) is kept and scaled by .548 — that way the three stack up on the gray in order.
(() => {
  const { reduce } = window.DB;
  const why = document.querySelector(".db-why__stage");
  if (why && !reduce) {
    const k = 0.548, g = (n) => why.querySelector(`[data-cyl="${n}"]`);
    const blue = g("blue"), white = g("white"), gray = g("gray");
    gsap.set(blue, { y: -320 }); gsap.set(white, { y: -400 });
    const st = { p: 0 };
    gsap.to(st, {
      p: 1, ease: "power2.in",
      scrollTrigger: { trigger: why, start: "top bottom", end: "center 40%", scrub: true },
      onUpdate: () => {
        const e = st.p;
        gsap.set(blue, { y: -320 + 929 * k * e }); gsap.set(white, { y: -400 + 819 * k * e }); gsap.set(gray, { y: 199 * k * e });
      },
    });
  }
  // Filter — keeps only the pressed category cell (blue background fills from the center in .4s)
  const btns = [...document.querySelectorAll(".db-filter__btn")], items = [...document.querySelectorAll(".db-proj--dark .db-proj__item")];
  btns.forEach((b) => b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.click(); } }));
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    const f = b.dataset.filter;
    items.forEach((it) => it.classList.toggle("is-out", f !== "all" && it.dataset.cat !== f));
    const shown = items.filter((it) => !it.classList.contains("is-out"));
    if (!reduce) gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "Product", overwrite: true });
    ScrollTrigger.refresh();
  }));
  window.DB.ready();
})();
