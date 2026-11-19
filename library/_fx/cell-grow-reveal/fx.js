(() => {
  const CELLS = ["0% 0%, 33.5% 0%, 33.5% 33%, 0% 33.5%", "33% 0%, 66.5% 0%, 66.5% 33%, 33% 33.5%", "66% 0%, 100% 0%, 100% 33%, 66% 33.5%",
    "0% 33%, 33.5% 33%, 33.5% 66%, 0% 66.5%", "33% 33%, 66.5% 33%, 66.5% 66%, 33% 66.5%", "66% 33%, 100% 33%, 100% 66%, 66% 66.5%",
    "0% 66%, 33.5% 66%, 33.5% 100%, 0% 100%", "33% 66%, 66.5% 66%, 66.5% 100%, 33% 100%", "66% 66%, 100% 66%, 100% 100%, 66% 100%"];
  const GROUPS = [[0], [1, 3], [2, 4, 6], [5, 7], [8]];
  const corner = (i) => { const p = CELLS[i].split(",")[0].trim(); return `polygon(${p}, ${p}, ${p}, ${p})`; };

  kfFx.register("cell-grow-reveal", (el, { options, reduce, scroller }) => {
    const photo = el.querySelector(':scope > [data-fx-part="photo"]') || el.firstElementChild;
    if (reduce || !photo) return;
    gsap.registerPlugin(ScrollTrigger);
    // The same photo set in every cell — when all are open, nine sets overlap and read as one
    const cells = CELLS.map((_, i) => {
      const cell = document.createElement("div");
      cell.className = "fx-cell-grow-reveal__cell";
      cell.setAttribute("aria-hidden", "true");
      const c = photo.cloneNode(true);
      c.removeAttribute("data-fx-part");
      cell.append(c);
      cell.style.clipPath = corner(i);
      el.append(cell);
      return cell;
    });
    if (!photo.hasAttribute("data-fx-part")) photo.setAttribute("data-fx-part", "photo"), (photo.dataset.fxAdded = "");
    el.classList.add("fx-cell-grow-reveal--on");
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const dur = +(options.dur ?? 0.5), each = +(options.each ?? 0.1), group = +(options.group ?? 0.125);
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top 80%", toggleActions: options.once === "true" ? "play none none none" : "play none none reverse" } });
    GROUPS.forEach((g, o) => tl.to(g.map((i) => cells[i]), { clipPath: (k) => `polygon(${CELLS[g[k]]})`, duration: dur, ease, stagger: each }, group * o));
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      cells.forEach((c) => c.remove());
      el.classList.remove("fx-cell-grow-reveal--on");
      if ("fxAdded" in photo.dataset) photo.removeAttribute("data-fx-part"), delete photo.dataset.fxAdded;
    };
  });
})();
