/* Brand message — when the wheel scene ends (fx:done), the reason-for-being title, copy and body rise at 0, .1 and .2s in order, and the sections below rise over .5s when their top edge reaches 70% of the screen (90% for the tail illustration) (original brand/main.js setScrollAnm) */
(() => {
  const main = document.querySelector(".bm-main");
  if (!main) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const show = (el) => el && el.classList.add("is-in");
  const start = () => {
    const reason = document.querySelector(".bm-reason__in");
    const first = [...reason.querySelectorAll("[data-rv], [data-rv-copy]")];
    first.forEach((el, i) => setTimeout(() => show(el), i * 100));
    const rest = [...document.querySelectorAll("[data-rv], [data-rv-copy]")].filter((el) => !first.includes(el));
    if (reduce) { rest.forEach(show); document.querySelectorAll("[data-rv-bg], [data-rv-pic]").forEach(show); return; }
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      rest.forEach((el) => {
        const at = +(el.dataset.rvAt || 0.7);
        ScrollTrigger.create({
          trigger: el, start: `top ${at * 100}%`, once: true,
          onEnter: () => {
            show(el);
            if (el.classList.contains("bm-reason__foot")) {
              show(document.querySelector("[data-rv-bg]"));
              el.querySelectorAll("[data-rv-pic]").forEach((p, i) => setTimeout(() => show(p), 100 + i * 100));
            }
          },
        });
      });
    });
  };
  // Nothing finishes before the parts attach — with reduce, the parts fire fx:done as soon as they attach, so both take the same path
  main.addEventListener("fx:done", () => start(), { once: true });
})();
