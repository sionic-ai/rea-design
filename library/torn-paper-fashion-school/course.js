// Course page: the head photo recedes (attach the original is-zoom-out, then remove it after 10s) and the Show more lessons expand (height .5s ease-out).
(() => {
  const kv = document.querySelector(".yf-ckv");
  if (kv && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    kv.classList.add("is-zoom-out");
    setTimeout(() => kv.classList.remove("is-zoom-out"), 10000);
  }
  const btn = document.querySelector(".yf-picks__more"), more = document.querySelector(".yf-picks__extra");
  btn?.addEventListener("click", () => {
    more.style.display = "grid";
    const h = more.scrollHeight;
    more.style.height = "0";
    more.style.overflow = "hidden";
    more.offsetHeight;
    more.classList.add("is-open");
    more.style.height = `${h}px`;
    btn.classList.add("is-hidden");
    btn.setAttribute("aria-expanded", "true");
    more.addEventListener("transitionend", function end() { more.style.height = "auto"; more.style.overflow = ""; more.removeEventListener("transitionend", end); });
  });
})();
