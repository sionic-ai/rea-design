// About — four handwritten notes above the photo change one at a time every 2 seconds (original setInterval 2000, switches instantly)
(() => {
  const items = [...document.querySelectorAll(".fv__copy li")];
  if (items.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  setInterval(() => {
    items[i].classList.remove("is-active");
    i = (i + 1) % items.length;
    items[i].classList.add("is-active");
  }, 2000);
})();
