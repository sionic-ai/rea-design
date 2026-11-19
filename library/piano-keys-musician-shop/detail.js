// One product — picking a size changes the price, clicking the photo opens the lightbox overlay in .3s
(() => {
  const sizes = [...document.querySelectorAll(".t-sizes button")];
  const out = document.querySelector("[data-price-out]");
  sizes.forEach((b) => b.addEventListener("click", () => {
    sizes.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    if (out) out.textContent = `${b.dataset.price} €`;
  }));
  const box = document.querySelector(".t-lightbox"), zoom = document.querySelector(".t-zoom");
  if (!box || !zoom) return;
  const open = () => { box.hidden = false; requestAnimationFrame(() => box.classList.add("is-open")); };
  const close = () => { box.classList.remove("is-open"); setTimeout(() => (box.hidden = true), 300); };
  zoom.addEventListener("click", open);
  box.addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && !box.hidden && close());
})();
