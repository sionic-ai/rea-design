// the bar page — exactly the original the-bar.bundle: parallax bands (paroller foreground, PC .25 · phone .1),
// In each section two photo slides (swiper 4.2.2, 0.9s loop) advance together with one button. On phone the second is hidden and it becomes a single slide.
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("screen and (max-width: 768px)").matches;
  if ($ && $.fn.paroller && !reduce) addEventListener("load", () => $(".js-prlx").paroller({ factor: sp ? "0.1" : "0.25", type: "foreground" }));
  if (!window.Swiper) return;
  const opt = { speed: reduce ? 0 : 900, loop: true, touchRatio: 0.01, grabCursor: true };
  document.querySelectorAll(".bh-fu").forEach((u) => {
    const a = u.querySelector(".js-swpr-f1"), b = u.querySelector(".js-swpr-f2"), ctl = u.querySelector(".bh-sctl");
    if (!a || !b || !ctl) return;
    const sa = new Swiper(a, opt);
    const sb = sp ? null : new Swiper(b, opt);
    ctl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dir]");
      if (!btn) return;
      if (btn.dataset.dir === "next") { sa.slideNext(); sb?.slideNext(); } else { sa.slidePrev(); sb?.slidePrev(); }
    });
  });
})();
