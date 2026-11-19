(() => {
  // Original (Framer scroll transform onScrollTarget): inside the wordmark panel, four copies of the same wordmark are stacked in the same spot (each copy is filled with the background color to hide the layer below),
  // From the moment the board’s top edge reaches 1px below the offset from the top of the screen, while scrolling through the board’s height, duplicate layer n follows upward without curve, up to −step×n px.
  // The top layer rises the most, and below it the end line of each layer’s step height shows like stairs
  kfFx.register("echo-slice-scroll", (el, { options, reduce, scroller }) => {
    const layer = el.querySelector('[data-fx-part="layer"]');
    if (!layer) return;
    gsap.registerPlugin(ScrollTrigger);
    const copies = Math.max(1, +(options.copies || 3)), step = +(options.step ?? 24), offset = +(options.offset ?? 24);
    const made = [];
    for (let i = 1; i <= copies; i++) {
      const cl = layer.cloneNode(true);
      cl.setAttribute("aria-hidden", "true");
      cl.classList.add("is-fx-echo");
      el.append(cl);
      made.push(cl);
    }
    if (reduce) return () => made.forEach((cl) => cl.remove());
    // Original input range — [max(plate top − 1 − offset, 0), plate top − 1 − offset + plate height]. Plate top is measured along the offsetTop chain (so a spot shifted during the reveal is not measured)
    const top = () => {
      if (scroller) return el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 1 - offset;
      let y = 0;
      for (let e = el; e; e = e.offsetParent) y += e.offsetTop;
      return y - 1 - offset;
    };
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    made.forEach((cl, i) => tl.fromTo(cl, { y: 0 }, { y: -step * (i + 1), duration: 1 }, 0));
    const st = ScrollTrigger.create({
      trigger: el, ...(scroller && { scroller }),
      start: () => Math.max(top(), 0), end: () => top() + el.clientHeight,
      animation: tl, scrub: true, invalidateOnRefresh: true,
    });
    return () => { st.kill(); tl.kill(); made.forEach((cl) => cl.remove()); };
  });
})();
