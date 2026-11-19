(() => {
  // The pinned hero title blurs, shrinks, fades and recedes by the scroll px — values are set directly on each scroll and the .4s transition in fx.css follows (Brand hero-home-bis)
  const px = (v, vh) => (String(v).trim().endsWith("vh") ? (parseFloat(v) * vh) / 100 : parseFloat(v));
  kfFx.register("scroll-blur-recede", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const per = +options.blur || 100;
    const shrink = +options.shrink || 3500;
    const fade = +options.fade || 2000;
    const src = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    let until = 0, back = 0, last = top();
    const measure = () => {
      const vh = scroller ? scroller.clientHeight : innerHeight;
      until = options.until != null ? px(options.until, vh) : vh;
      back = options.back != null ? px(options.back, vh) : 600 + vh / 2;
    };
    const set = (b, s, o) => {
      el.style.filter = `blur(${b}px)`;
      el.style.transform = `scale(${s})`;
      el.style.opacity = o;
    };
    const gone = () => set(100, 0, 0);
    const run = () => {
      const y = top();
      const b = y / per, s = 1 - y / shrink, o = 1 - y / fade;
      if (y > last) {
        el.dataset.scrollDirection = "down";
        if (y > until) gone(); else set(b, s, o);
      } else {
        el.dataset.scrollDirection = "up";
        if (y < back) set(b, s, o);
      }
      last = y;
    };
    measure();
    if (top() > until) gone();
    src.addEventListener("scroll", run, { passive: true });
    addEventListener("resize", measure);
    return () => {
      src.removeEventListener("scroll", run);
      removeEventListener("resize", measure);
      el.style.filter = el.style.transform = el.style.opacity = "";
      delete el.dataset.scrollDirection;
    };
  });
})();
