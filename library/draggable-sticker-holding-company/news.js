(() => {
  // Category filter — leaving text blurs out in .2s easeOut, staying text slides into place (after .2s, .5s curve .19,1,.22,1), and newly entering text turns on with the same tempo.
  // Pressing the same branch again returns to all (original popLayout + layoutId). Nothing moves on first open
  const list = document.querySelector(".ax-posts");
  const btns = [...document.querySelectorAll(".ax-filters button")];
  const items = [...list.children];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swift = window.CustomEase ? CustomEase.create("ax-swift", "0.19,1,0.22,1") : "expo.out";
  let cat = "";

  const apply = (next) => {
    cat = next;
    btns.forEach((b) => b.dataset.active = String(b.dataset.cat === cat));
    const want = (li) => !cat || li.dataset.cat === cat;
    const shown = items.filter((li) => !li.hidden);
    const first = new Map(shown.map((li) => [li, li.getBoundingClientRect().top]));
    const leaving = shown.filter((li) => !want(li));
    const entering = items.filter((li) => li.hidden && want(li));
    if (reduce) { items.forEach((li) => { li.hidden = !want(li); }); return; }

    // Leaving text fades out while its space is held (overlaid) — the remaining text slides straight into its new place
    const top0 = list.getBoundingClientRect().top;
    const ghosts = leaving.map((li) => {
      const r = li.getBoundingClientRect();
      const g = li.cloneNode(true);
      Object.assign(g.style, { position: "absolute", left: 0, right: 0, top: `${r.top - top0}px`, pointerEvents: "none", margin: 0 });
      return g;
    });
    list.style.position = "relative";
    leaving.forEach((li) => { li.hidden = true; });
    entering.forEach((li) => { li.hidden = false; });
    ghosts.forEach((g) => { list.append(g); gsap.to(g, { opacity: 0, duration: 0.2, ease: "power1.out", onComplete: () => g.remove() }); });

    items.filter((li) => !li.hidden).forEach((li) => {
      if (first.has(li)) {
        const dy = first.get(li) - li.getBoundingClientRect().top;
        if (dy) gsap.fromTo(li, { y: dy }, { y: 0, duration: 0.5, delay: 0.2, ease: swift, overwrite: true });
      } else gsap.fromTo(li, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2, ease: swift, overwrite: true });
    });
  };
  btns.forEach((b) => b.addEventListener("click", () => apply(b.dataset.cat === cat ? "" : b.dataset.cat)));
})();
