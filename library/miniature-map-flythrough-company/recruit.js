// Apply: rows are stacked overlapping (shared stickyStack), and the Apply button opens a five-sheet window — a card passed on stays behind, small and blurred.
(() => {
  const V = window.V;
  V.stickyStack(document.querySelector(".ap-sections"), { item: ".ap-wrapper", row: ".ap-section", card: ".ap-section__content", overlay: ".ap-section__overlay" });

  const modal = document.querySelector(".ap-modal");
  const cards = [...modal.querySelectorAll(".m-card")];
  let step = 0;
  const go = (n) => {
    if (n < 0 || n >= cards.length) return;
    step = n;
    cards.forEach((c, i) => {
      c.classList.toggle("is-active", i === n);
      c.classList.toggle("is-done", i === n - 1);
    });
  };
  const close = () => {
    modal.classList.remove("is-open");
    V.lenis?.start();
    setTimeout(() => go(0), 300);
  };
  document.querySelectorAll("[data-apply]").forEach((b) =>
    b.addEventListener("click", () => {
      modal.classList.add("is-open");
      V.lenis?.stop();
    })
  );
  modal.querySelectorAll("[data-next]").forEach((b) => b.addEventListener("click", () => go(step + 1)));
  modal.querySelectorAll("[data-prev]").forEach((b) => b.addEventListener("click", () => go(step - 1)));
  modal.querySelector(".ap-modal__close").addEventListener("click", close);
  modal.querySelector(".m-submit").addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("is-open") && close());
})();
