(() => {
  // Lay N translucent background-color vertical strips over the photo, then on load (or when visible) fold them away one by one around the top-right corner — the original uses CSS transition on four ::before · ::after
  kfFx.register("shine-slats", (el, { options, reduce, scroller }) => {
    const n = Math.max(1, Math.round(+options.count || 4));
    const dur = +(options.dur ?? 0.9), each = +(options.each ?? 0.12);
    const box = document.createElement("span");
    box.className = "fx-shine-slats";
    box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i");
      s.style.left = (100 / n) * i + "%";
      s.style.width = 100 / n + "%";
      s.style.transitionDuration = dur + "s";
      s.style.transitionDelay = each * i + "s";
      box.append(s);
    }
    el.append(box);
    if (reduce) { box.remove(); return; }
    let io;
    const open = () => requestAnimationFrame(() => el.classList.add("is-shine-open"));
    if (options.on === "scroll") {
      io = new IntersectionObserver((en) => {
        if (!en.some((e) => e.isIntersecting)) return;
        io.disconnect();
        open();
      }, { root: scroller || null });
      io.observe(el);
    } else if (document.readyState === "complete") open();
    else addEventListener("load", open, { once: true });
    return () => { io?.disconnect(); removeEventListener("load", open); box.remove(); el.classList.remove("is-shine-open"); };
  });
})();
