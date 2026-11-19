// Work list: row hover .3s power1 — white film 0→1 (1.01→1), text white→black, the body slides -20rem and the head +20rem so they pull apart, and
// VIEW MORE tag pops out with .4s back.out(1.7). If released before it is half open, it opens fully and then folds. Pressing opens the detail overlay
OU.page("list", (root, OU) => {
  const { $, $$, rem, paint, reverseLater } = OU;
  const white = paint("var(--kf-ink)"), black = paint("var(--site-ink-dark)");
  $$(".ou-works__item", root).forEach((item) => {
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "power1" } })
      .fromTo($(".ou-works__back-inner", item), { opacity: 0, scale: 1.01 }, { opacity: 1, scale: 1 })
      .fromTo(item, { "--color": white }, { "--color": black }, "<")
      .to($(".ou-works__content", item), { x: -20 * rem() }, "<")
      .to($(".ou-works__head", item), { x: 20 * rem() }, "<")
      .fromTo($(".ou-view-more", item), { opacity: 0, y: -20 * rem(), scale: 0, rotate: 10 }, { y: 0, rotate: 6, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }, "<");
    item.addEventListener("mouseenter", () => tl.play());
    item.addEventListener("mouseleave", () => reverseLater(tl));
    item.addEventListener("click", () => OU.openCover(item));
  });

  // When coming from the filter panel’s Apply: line up the chosen tags as pills in the header, and pressing × removes only that tag and moves on again (original filterTagRemove)
  const picked = (new URLSearchParams(location.search).get("tag") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const box = $(".ou-works__picked", root);
  if (box && picked.length) {
    box.hidden = false;
    box.replaceChildren(...picked.map((name) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ou-works__picked-tag";
      b.innerHTML = `<span></span><svg viewBox="0 0 10 10" stroke="currentColor" stroke-width="1.2"><path d="M1 1l8 8M9 1L1 9"/></svg>`;
      b.firstChild.textContent = name;
      b.addEventListener("click", () => {
        const rest = picked.filter((p) => p !== name);
        OU.go(rest.length ? `list.html?tag=${rest.map(encodeURIComponent).join(",")}` : "list.html");
      });
      return b;
    }));
  }
});
