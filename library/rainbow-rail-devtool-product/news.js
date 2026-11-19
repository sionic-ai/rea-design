// Blog filter — the original Finsweet list filtering (topic · search · featured post). Filtered-out cards fade at .25s and then drop out
(() => {
  const list = document.querySelector("[data-gb-posts]");
  if (!list) return;
  const posts = [...list.querySelectorAll(".gb-post")];
  const topic = document.querySelector("[data-gb-topic]");
  const search = document.querySelector("[data-gb-search]");
  const clear = document.querySelector("[data-gb-clear]");
  const empty = document.querySelector(".gb-posts__empty");
  const apply = () => {
    const t = topic?.value || "", q = (search?.value || "").trim();
    let shown = 0;
    posts.forEach((p) => {
      const ok = (!t || p.dataset.tags.split("|").includes(t)) && (!q || p.textContent.includes(q));
      if (ok) shown++;
      if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (ok) { p.hidden = false; gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.25, overwrite: true }); }
        else gsap.to(p, { opacity: 0, duration: 0.25, overwrite: true, onComplete: () => (p.hidden = true) });
      } else p.hidden = !ok;
    });
    if (empty) empty.hidden = shown > 0;
  };
  topic?.addEventListener("change", apply);
  search?.addEventListener("input", apply);
  clear?.addEventListener("click", () => setTimeout(apply, 0));
})();
