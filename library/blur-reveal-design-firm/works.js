// Work list. In the original, infinite-scroll hides the Next Projects button, and 600px before the bottom it fetches the next page of 20 cells and appends them (three dots while loading).
// The copy has no next-page document, so it builds and appends 20 cells in place — same when the button is pressed. Appended cells re-run the [data-animate] entrance
(() => {
  const NS = (window.NS = window.NS || { views: {} });
  let onScroll = null, timer = 0;
  NS.views.works = {
    init(c) {
      const grid = c.querySelector("[data-more-grid]");
      const loader = c.querySelector(".ns-loader");
      const wrap = c.querySelector("[data-more-wrap]");
      if (!grid) return;
      let pages = 1, busy = false;
      const MAX = 3;
      const more = () => {
        if (busy || pages >= MAX) return;
        busy = true;
        loader.hidden = false;
        timer = setTimeout(() => {
          const box = document.createElement("div");
          box.innerHTML = NS.workItems(20, pages * 20);
          const added = [...box.children];
          grid.append(...added);
          pages++;
          loader.hidden = true;
          busy = false;
          NS.watchAnimate?.(grid);
          NS.lenis?.resize();
          if (pages >= MAX) wrap.hidden = true;
        }, 600);
      };
      // Like the original, hides the button right after attaching and receives it near the bottom (scrollThreshold 600)
      setTimeout(() => { wrap.hidden = true; }, 500);
      wrap.querySelector("[data-more]").addEventListener("click", more);
      onScroll = () => {
        const left = document.documentElement.scrollHeight - (scrollY + innerHeight);
        if (left < 600) more();
      };
      addEventListener("scroll", onScroll, { passive: true });
    },
    destroy() {
      if (onScroll) removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      onScroll = null;
    },
  };
})();
