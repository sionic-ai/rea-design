(() => {
  // The ring grows over links, principle cards and tags, like the original
  document.querySelectorAll("a, .ab-pr .pc, .ab-cl .tags span").forEach((el) => el.setAttribute("data-m", ""));

  // Hero — title right away, pattern and intro text 80ms later
  document.querySelectorAll(".ab-hero .rise").forEach((el) => el.classList.add("in"));
  setTimeout(() => { const h = document.querySelector("[data-ab-hero]"); if (h) h.classList.add("rdy"); }, 80);

  // Sentence — split into text chunks, staggered by .012s
  const p = document.querySelector("[data-ab-chars]");
  if (p) {
    p.innerHTML = [...p.textContent.trim()].map((c) => (c === " " ? " " : `<span class="w">${c.replace(/</g, "&lt;")}</span>`)).join("");
    p.querySelectorAll(".w").forEach((w, i) => { w.style.transitionDelay = (i * 0.012).toFixed(3) + "s"; });
  }

  // Once when visible (15%, minus 8% at the bottom) — if scrolled down to 86%, trigger then at the latest
  const els = [...document.querySelectorAll(".rv, [data-ab-stm]")];
  const on = (el) => el.classList.add("in");
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { on(e.target); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  els.forEach((el) => io.observe(el));
  addEventListener("scroll", () => els.forEach((el) => { if (!el.classList.contains("in") && el.getBoundingClientRect().top < innerHeight * 0.86) on(el); }), { passive: true });
})();
