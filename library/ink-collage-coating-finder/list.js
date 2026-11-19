(() => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  // Region buttons — only the pressed region opens its height (.7s) and the others fold, pressing again folds it. Inner cells turn on .35s later over .7s
  const btns = $$(".js-area-switch");
  const wrapOf = (b) => document.querySelector(`.js-area.is-${b.dataset.area}`)?.closest(".js-area-wrapper");
  const sync = () => btns.forEach((b) => {
    const w = wrapOf(b);
    if (w) w.style.height = b.classList.contains("is-active") ? `${w.firstElementChild.offsetHeight}px` : "0";
  });
  btns.forEach((b) => b.addEventListener("click", () => {
    const was = b.classList.contains("is-active");
    btns.forEach((x) => { x.classList.remove("is-active"); wrapOf(x)?.classList.remove("is-active"); });
    if (!was) { b.classList.add("is-active"); wrapOf(b)?.classList.add("is-active"); }
    sync();
  }));
  sync();
  addEventListener("resize", sync);

  // Changing the condition — hide the footer if it is visible, only when the list has passed above the screen and scrolled more than one screen down
  const area = document.querySelector(".js-change_terms_area");
  const btn = document.querySelector(".js-change_terms_btn");
  const foot = document.querySelector(".p-footer");
  const update = () => {
    const past = area.getBoundingClientRect().top <= 0 && innerHeight < scrollY;
    const r = foot.getBoundingClientRect();
    btn.classList.toggle("is-show", past && !(r.top < innerHeight && r.bottom > 0));
  };
  window.arLenis.on("scroll", update);
  addEventListener("resize", update);
  update();

  document.forms.filter?.addEventListener("submit", (e) => e.preventDefault());
})();
