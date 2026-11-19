(() => {
  // The original attaches is-show once via jquery.inview (when even slightly visible)
  kfFx.register("blur-clear-in", (el, { reduce, scroller }) => {
    const media = el.querySelector(':scope > [data-fx-part="media"]') || el.firstElementChild;
    const marked = media && !media.hasAttribute("data-fx-part");
    if (marked) media.setAttribute("data-fx-part", "media");
    const show = () => el.classList.add("is-fx-in");
    let io = null;
    if (reduce) show();
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(); io.disconnect(); } }), { root: scroller || null });
      io.observe(el);
    }
    return () => { io?.disconnect(); el.classList.remove("is-fx-in"); if (marked) media.removeAttribute("data-fx-part"); };
  });
})();
