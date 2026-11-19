// First page: stone pile, multi-section card Embla slides, story curtain.
(() => {
  DT.page("home", (main) => {
    const offs = [];
    const grid = DT.masonry(main.querySelector("[data-grid]"));
    offs.push(() => grid.destroy());

    main.querySelectorAll("[data-slider]").forEach((card) => {
      const em = EmblaCarousel(card.querySelector("[data-viewport]"), { draggable: true });
      const prev = card.querySelector("[data-prev]"), next = card.querySelector("[data-next]"), count = card.querySelector("[data-count]");
      const total = em.slideNodes().length;
      const sync = () => {
        count.textContent = `${em.selectedScrollSnap() + 1} / ${total}`;
        prev.hidden = !em.canScrollPrev();
        next.hidden = !em.canScrollNext();
      };
      em.on("select", sync);
      sync();
      const step = (dir) => (e) => { e.preventDefault(); e.stopPropagation(); dir < 0 ? em.scrollPrev() : em.scrollNext(); };
      prev.addEventListener("click", step(-1));
      next.addEventListener("click", step(1));
      // Drag-and-release is not a press — don’t follow the card link
      card.addEventListener("click", (e) => { if (!em.clickAllowed()) e.preventDefault(); });
      offs.push(() => em.destroy());
    });

    const story = main.querySelector("[data-story]");
    if (story) {
      const slides = [...story.querySelectorAll(".dt-storymodal__slide")];
      const bars = [...story.querySelectorAll(".dt-storymodal__bars i")];
      let em = null;
      const mark = () => {
        const at = em.selectedScrollSnap();
        slides.forEach((s, i) => s.classList.toggle("is-current", i === at));
        bars.forEach((b, i) => b.classList.toggle("is-seen", i <= at));
      };
      const modal = DT.modal(story, {
        onOpen() {
          const opts = { containScroll: innerWidth <= 769 ? "trimSnaps" : "", draggable: true, startIndex: 0 };
          if (!em) { em = EmblaCarousel(story.querySelector("[data-viewport]"), opts); em.on("select", mark); }
          // The original rebuilds the story panel on open, so the caption rise (.8s) plays then — it plays again when re-grabbed 100ms later
          const caps = slides.map((s) => s.querySelector(".dt-storymodal__cap p"));
          // Hold at the first keyframe step (transparent · 10px below) until played again so it doesn’t jump
          caps.forEach((p) => { p.style.animation = "none"; p.style.opacity = "0"; p.style.transform = "translate3d(0,10px,0)"; });
          mark();
          // The original’s caption runs late by the time spent drawing the panel after the press (about 100ms measured) — processing time after the press adds up, so setting 16ms gives the same timing
          setTimeout(() => caps.forEach((p) => { ["animation", "opacity", "transform"].forEach((k) => p.style.removeProperty(k)); }), 16);
          setTimeout(() => { em.reInit(opts); mark(); }, 100);
        },
      });
      const step = (dir) => (e) => { e.preventDefault(); e.stopPropagation(); if (em) dir < 0 ? em.scrollPrev() : em.scrollNext(); };
      story.querySelector("[data-prev]").addEventListener("click", step(-1));
      story.querySelector("[data-next]").addEventListener("click", step(1));
      const opener = main.querySelector("[data-story-open]");
      const openIt = () => modal.open();
      opener.addEventListener("click", openIt);
      opener.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIt(); } });
      offs.push(() => { modal.destroy(); em && em.destroy(); });
    }

    return () => offs.forEach((f) => f());
  });
})();
