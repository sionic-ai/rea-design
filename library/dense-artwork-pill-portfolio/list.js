// List: 6-column stone tiles, filter by header chips (filters and restacks .5s after the press, and the pile reappears at .8s·.5s), pressing a tile opens a photo overlay that pages from that shot.
(() => {
  DT.page("list", (main) => {
    const offs = [];
    const gridEl = main.querySelector("[data-grid]");
    const grid = DT.masonry(gridEl);
    offs.push(() => grid.destroy());

    const chips = [...document.querySelectorAll(".dt-tag")];
    const timers = [];
    // Original: on press the pile leaves first (.42s), and only .5s later does the chosen chip change and filtering happen
    const pick = (chip) => {
      const tag = chip.dataset.tag;
      gridEl.classList.add("is-loading");
      timers.push(setTimeout(() => {
        chips.forEach((c) => c.classList.toggle("is-current", c === chip));
        grid.items.forEach((el) => { el.hidden = !!tag && !el.dataset.tags.split(" ").includes(tag); });
        grid.relayout();
        timers.push(setTimeout(() => gridEl.classList.remove("is-loading"), tag ? 500 : 800));
      }, 500));
    };
    const onChip = (e) => pick(e.currentTarget);
    chips.forEach((c) => c.addEventListener("click", onChip));
    offs.push(() => {
      chips.forEach((c) => c.removeEventListener("click", onChip));
      timers.forEach(clearTimeout);
      chips.forEach((c, i) => c.classList.toggle("is-current", i === 0));
    });

    const box = main.querySelector("[data-lightbox]");
    let em = null;
    const prev = box.querySelector("[data-prev]"), next = box.querySelector("[data-next]");
    const sync = () => { prev.hidden = !em.canScrollPrev(); next.hidden = !em.canScrollNext(); };
    const modal = DT.modal(box, {
      onOpen(i) {
        if (!em) { em = EmblaCarousel(box.querySelector("[data-viewport]"), { draggable: true, startIndex: i }); em.on("select", sync); }
        else em.scrollTo(i, true);
        sync();
        timers.push(setTimeout(() => { em.reInit({ draggable: true, startIndex: em.selectedScrollSnap() }); sync(); }, 1000));
      },
    });
    grid.items.forEach((tile) => tile.addEventListener("click", () => modal.open(+tile.dataset.i)));
    const step = (dir) => (e) => { e.preventDefault(); e.stopPropagation(); if (em) dir < 0 ? em.scrollPrev() : em.scrollNext(); };
    prev.addEventListener("click", step(-1));
    next.addEventListener("click", step(1));
    const key = (e) => {
      if (!box.classList.contains("is-on") || !em) return;
      if (e.key === "ArrowRight") em.scrollNext();
      if (e.key === "ArrowLeft") em.scrollPrev();
    };
    addEventListener("keydown", key);
    offs.push(() => { removeEventListener("keydown", key); modal.destroy(); em && em.destroy(); });

    return () => offs.forEach((f) => f());
  });
})();
