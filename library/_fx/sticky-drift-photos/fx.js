// The text in the middle of the section sticks at 41% of the screen, and photos placed alternately on both sides are pushed up slightly faster than the scroll (extra by scroll × speed) and pass behind the text.
// Photos don’t use the value directly but follow late through a CSS transition (lag seconds), so they glide a moment after scrolling stops. Listens to scroll only while the section overlaps the screen
(() => {
  kfFx.register("sticky-drift-photos", (el, { options, reduce, scroller }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length || reduce) return;
    const speed = +(options.speed ?? 0.07);
    el.style.setProperty("--fx-lag", `${+(options.lag ?? 1.2)}s`);
    const box = scroller || null;
    // Measures the distance to the top of the document (inner panel) via the offsetTop chain so it measures the same spot even after a transform is applied — re-measured on every scroll so it stays correct even if an upper section grows late (slider · fonts)
    const topOf = (n) => { let y = 0; for (let e = n; e && e !== box; e = e.offsetParent) y += e.offsetTop; return y; };
    const view = () => (box ? box.clientHeight : innerHeight);
    const pos = () => (box ? box.scrollTop : scrollY);
    // If the photo is still below the screen (distance passed < 0) value is not used — in the original this becomes a broken value like ‹translateY(--5px)› that is ignored (the previous value stays), and it only shifts after entering the screen
    const update = () => photos.forEach((p) => {
      const d = pos() - topOf(p) + view();
      if (d >= 0) p.style.transform = `translateY(${-d * speed}px)`;
    });
    const target = box || window;
    let on = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; target.addEventListener("scroll", update, { passive: true }); update(); }
      else if (!e.isIntersecting && on) { on = false; target.removeEventListener("scroll", update); }
    }, box ? { root: box } : undefined);
    io.observe(el);
    return () => {
      io.disconnect();
      target.removeEventListener("scroll", update);
      photos.forEach((p) => { p.style.transform = ""; });
      el.style.removeProperty("--fx-lag");
    };
  });
})();
