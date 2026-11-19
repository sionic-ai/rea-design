(() => {
  // Once when 25% visible — for each line (the span right below) a band is painted from the left (.55s) and at about 70% of the band the text is revealed from the left (.55s), .18s between lines.
  // look: photo — the band is painted in 1.1s (60%) then exits to the right, and .42s into that the photo is revealed from the left in .6s
  kfFx.register("bar-wipe-reveal", (el, { options, reduce, scroller }) => {
    const photo = options.look === "photo";
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-bg", options.bg != null ? `${+options.bg}s` : null);
    set("--fx-txt", options.txt != null ? `${+options.txt}s` : null);
    set("--fx-step", options.stagger != null ? `${+options.stagger}s` : null);
    if (!photo) [...el.children].filter((c) => c.tagName === "SPAN").forEach((c, i) => c.style.setProperty("--fx-i", i));
    if (reduce) { el.classList.add("is-inview"); return () => el.classList.remove("is-inview"); }
    const io = new IntersectionObserver((list) => {
      list.forEach((en) => {
        if (!en.isIntersecting) return;
        el.classList.add("is-inview");
        io.disconnect();
      });
    }, { threshold: +(options.threshold ?? 0.25), ...(scroller && { root: scroller }) });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-inview"); };
  });
})();
