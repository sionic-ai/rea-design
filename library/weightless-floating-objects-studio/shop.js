// Shop: the aisle-walk-gl part handles the aisle walk, here only the pill below is handled.
// Once the aisle is ready, the pill rises from 96px below on a spring (500 · 50), and the product row (shelf with an interaction), the product list and the cart open at spring height.
// When the list or cart opens, the background is dimmed and walking stops. Pressing a shelf raises a product photo panel from below.
(() => {
  const dock = document.querySelector(".tm-dock--shop");
  const aisle = document.querySelector(".tm-aisle");
  if (!dock || !aisle || !window.TM) return;
  const { spring, heightSpring } = window.TM;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rise = spring({ value: 96, onUpdate: (y) => { dock.style.translate = `-50% ${y}px`; dock.style.opacity = String(Math.max(0, Math.min(1, 1 - y / 96))); } });
  const start = () => rise.to(0);
  if (aisle.classList.contains("is-ready")) start();
  else new MutationObserver((_, mo) => { if (aisle.classList.contains("is-ready")) { mo.disconnect(); start(); } }).observe(aisle, { attributes: true, attributeFilter: ["class"] });

  const row = heightSpring(dock.querySelector(".tm-dock__panel--product"));
  const list = heightSpring(dock.querySelector(".tm-dock__panel--all"));
  const cart = heightSpring(dock.querySelector(".tm-dock__panel--cart"));
  const name = dock.querySelector(".tm-shoprow__name"), price = dock.querySelector(".tm-shoprow__price");
  const items = [...document.querySelectorAll(".tm-products [data-product]")];
  const pause = (on) => aisle.dispatchEvent(new CustomEvent(on ? "fx:pause" : "fx:resume"));
  const setOpen = (which) => {
    list.toggle(which === "list"); cart.toggle(which === "cart");
    document.body.classList.toggle("is-shop-open", !!which);
    pause(!!which);
  };
  dock.querySelector(".tm-shopbar__list").addEventListener("click", () => setOpen(list.open ? null : "list"));
  dock.querySelector(".tm-shopbar__cart").addEventListener("click", () => setOpen(cart.open ? null : "cart"));
  aisle.addEventListener("fx:hover", (e) => {
    const li = items[e.detail.index];
    if (li) { name.textContent = li.dataset.product; price.firstChild.textContent = `${li.dataset.price} `; }
    if (!!li !== row.open) row.toggle(!!li);
  });

  const gallery = document.querySelector(".tm-gallery");
  const gy = spring({ value: innerHeight, onUpdate: (y) => { gallery.style.translate = `0 ${y}px`; } });
  const closeGallery = () => {
    if (!gallery.classList.contains("is-open")) return;
    gy.to(innerHeight, () => { gallery.classList.remove("is-open"); gallery.setAttribute("aria-hidden", "true"); });
    document.body.classList.remove("is-shop-open");
    pause(false);
  };
  aisle.addEventListener("fx:pick", () => {
    gallery.classList.add("is-open"); gallery.setAttribute("aria-hidden", "false");
    gy.set(reduce ? 0 : innerHeight); gy.to(0);
    document.body.classList.add("is-shop-open");
    pause(true);
  });
  gallery.addEventListener("click", closeGallery);
  document.querySelector(".tm-veil")?.addEventListener("click", () => { setOpen(null); closeGallery(); });
})();
