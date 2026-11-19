// Service — a black curtain over the background by how far the service panel has entered (.5 × entered amount + .3 × passed amount). The header curtain is .7 once the panel’s top edge passes half the screen.
(() => {
  const list = document.querySelector(".service-list"), shade = document.querySelector(".works-backdrop__shade");
  const back = document.querySelector(".works-backdrop");
  let raf = 0;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const upd = () => {
    raf = 0;
    const h = innerHeight, r = list.getBoundingClientRect();
    shade.style.opacity = (0.5 * clamp((h - r.top) / h) + 0.3 * clamp(-r.top / Math.max(r.height - h, 1))).toFixed(3);
    document.body.classList.toggle("is-works-deep", r.top < h / 2);
  };
  const fit = () => { back.style.height = `${list.offsetTop + list.offsetHeight}px`; upd(); };
  addEventListener("scroll", () => { raf ||= requestAnimationFrame(upd); }, { passive: true });
  new ResizeObserver(fit).observe(list);
  fit();
})();
