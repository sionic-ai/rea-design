(() => {
  // When a line enters at the spot excluding the bottom 20% of the screen, it gets .is-show once — fx.css handles the look (original ScrollTrigger start: top 80% · onEnter)
  kfFx.register("chat-pop-rumble", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-show"); return () => el.classList.remove("is-show"); }
    const at = String(options.start ?? 80).replace("%", "");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { el.classList.add("is-show"); io.disconnect(); } });
    }, { root: scroller || null, rootMargin: `0px 0px -${100 - +at}% 0px`, threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-show"); };
  });
})();
