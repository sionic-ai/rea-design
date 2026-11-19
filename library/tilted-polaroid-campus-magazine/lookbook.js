// Gallery: header panel pinned (original handleFixedScrollSections — the photo cell covers the header panel and rises) · photo enlarge view (.3s curtain + white panel rising 20px)
(() => {
  const fixed = document.querySelector(".lb-fixed");
  const content = document.querySelector(".lb-content");
  if (fixed && content) {
    // The header panel is pinned in place and the photo cell is pushed down by its height — on scroll only the photo cell rises and covers the header panel
    const hold = () => { content.style.marginTop = `${fixed.offsetHeight}px`; };
    fixed.classList.add("is-fixed");
    hold();
    addEventListener("resize", hold);
    // When the About section comes in, hide the header plate so it doesn’t show through
    const about = document.querySelector('[data-slot="about"]');
    if (about) new IntersectionObserver(([e]) => { fixed.style.visibility = e.boundingClientRect.top < innerHeight ? "hidden" : ""; }).observe(about);
  }
  const box = document.querySelector(".lb-box");
  if (!box) return;
  const cap = box.querySelector("p");
  const big = box.querySelector(".wf-img");
  const open = (fig) => {
    cap.textContent = fig.querySelector("figcaption")?.textContent || "";
    big.dataset.label = fig.querySelector(".wf-img")?.dataset.label || "";
    document.body.style.overflow = "hidden";
    box.classList.add("visible");
  };
  const close = () => { box.classList.remove("visible"); document.body.style.overflow = ""; };
  document.querySelectorAll(".lb-open").forEach((b) => b.addEventListener("click", () => open(b.closest("figure"))));
  box.querySelector(".lb-box__x").addEventListener("click", close);
  box.querySelector(".lb-box__mask").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
