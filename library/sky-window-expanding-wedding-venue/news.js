// News list: the selected-post strip advances one slide every 5s (0.75s) and can also be chosen with page dots. The archive accordion opens its height in 0.5s.
(() => {
  const car = document.querySelector(".sl-carousel");
  const box = car.querySelector(".sl-carousel__container");
  const pages = [...car.querySelectorAll(".sl-carousel__page")];
  let pos = 0, timer;
  const go = (i) => {
    pos = (i + pages.length) % pages.length;
    car.dataset.position = pos;
    const sp = SL.isSP();
    box.style.transform = sp ? `translate3d(calc(${-100 * pos}% - ${pos}rem), 0, 0)` : `translate3d(calc(${-50 * pos}% - ${0.75 * pos}rem), 0, 0)`;
    pages.forEach((p, k) => {
      p.classList.toggle("is-active", k === pos);
      const c = p.querySelector("circle");
      c.style.animation = "none";
      c.offsetWidth;
      c.style.animation = "";
    });
    clearTimeout(timer);
    if (!SL.reduced) timer = setTimeout(() => go(pos + 1), 5000);
  };
  pages.forEach((p, k) => p.addEventListener("click", () => go(k)));
  go(0);

  const acc = document.querySelector(".sl-acc");
  const label = acc.querySelector(".sl-acc__label");
  const body = acc.querySelector(".sl-acc__body");
  label.addEventListener("click", () => {
    const open = !acc.classList.contains("is-open");
    acc.classList.toggle("is-open", open);
    label.setAttribute("aria-expanded", open);
    body.style.height = open ? body.firstElementChild.offsetHeight + "px" : "0px";
  });
})();
