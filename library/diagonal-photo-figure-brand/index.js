// Hero slide — next slide every --speed (5s). During the change (1.5s) wheel and nav arrow presses are ignored. Wheel down goes next, up goes previous.
window.miPages = window.miPages || {};
window.miPages.home = (scope, { reduce }) => {
  const kv = scope.querySelector(".mi-hero");
  if (!kv || kv.classList.contains("is-ready")) return;
  const items = [...kv.querySelectorAll(".mi-hero__item")];
  const ctrls = [...kv.querySelectorAll(".mi-hero__ctrl")];
  const copy = document.querySelector(".mi-header__copy");
  const speed = parseFloat(getComputedStyle(kv).getPropertyValue("--speed")) || 5;
  let cur = 0;
  let busy = false;
  let timer;
  const show = () => {
    busy = true;
    items.forEach((i) => { if (i.classList.contains("is-active")) { i.classList.remove("is-active"); i.classList.add("is-prev"); } });
    items[cur].classList.add("is-active");
    ctrls.forEach((c, i) => c.classList.toggle("is-active", i === cur));
    setTimeout(() => items.forEach((i) => i.classList.remove("is-prev")), 1000);
    setTimeout(() => { busy = false; }, 1500);
    if (!reduce) timer = setTimeout(() => { cur = (cur + 1) % items.length; show(); }, speed * 1000);
  };
  kv.classList.add("is-ready");
  copy && copy.classList.remove("is-active");
  setTimeout(() => { copy && copy.classList.add("is-active"); show(); }, 10);
  ctrls.forEach((c, i) => c.addEventListener("click", () => {
    if (busy) return;
    clearTimeout(timer);
    cur = i;
    show();
  }));
  kv.addEventListener("wheel", (e) => {
    if (busy) return;
    clearTimeout(timer);
    cur = e.deltaY + e.deltaX > 0 ? (cur + 1) % items.length : (cur - 1 + items.length) % items.length;
    show();
  }, { passive: true });
  return { destroy() { clearTimeout(timer); } };
};
