(() => {
  // List rows turn on from the top at .08s intervals over .75s power1.inOut, and hovering a row makes that row’s three photos rise in turn at the right of the top strip
  const el = document.querySelector(".uv-index__in");
  const wrap = document.querySelector(".uv-index__previews");
  if (!el) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, d = reduce ? 0 : 1;
  gsap.to(el.querySelectorAll(".uv-index__row--head, .uv-index__list li"), { opacity: 1, ease: "power1.inOut", duration: 0.75 * d, stagger: 0.08 * d });
  if (!wrap || !matchMedia("(hover: hover)").matches) return;
  const figs = [...wrap.querySelectorAll(".uv-index__preview")];
  el.querySelectorAll(".uv-index__row[data-label]").forEach((row) => {
    row.addEventListener("pointerenter", () => {
      const name = row.children[1]?.textContent || "";
      figs.forEach((f, i) => { f.dataset.label = `${name} Photo ${i + 1} · ${row.dataset.label}`; });
      wrap.classList.add("is-on");
    });
    row.addEventListener("pointerleave", () => {
      wrap.classList.remove("is-on");
    });
  });
})();
