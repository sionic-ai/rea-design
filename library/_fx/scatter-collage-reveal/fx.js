(() => {
  // When the section head touches the top of the screen (original rootMargin 0 0 −100%), is-visible is added once — the motion itself is done by the transition in fx.css.
  // at: "enter" When the surface reaches the 15% line from the bottom of the screen. A panel already passed (the very first screen) is pinned right away.
  kfFx.register("scatter-collage-reveal", (el, { options, reduce }) => {
    if (!el.querySelector('[data-fx-part="tile"], [data-fx-part="center"], [data-fx-part="cover"]')) return;
    const fire = () => { el.classList.add("is-visible"); el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true })); };
    if (reduce || el.getBoundingClientRect().top <= 0) { fire(); return () => el.classList.remove("is-visible"); }
    const margin = options.at === "enter" ? "0px 0px -15% 0px" : "0px 0px -100% 0px";
    const io = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) { fire(); io.disconnect(); } }), { rootMargin: margin });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-visible"); };
  });
})();
