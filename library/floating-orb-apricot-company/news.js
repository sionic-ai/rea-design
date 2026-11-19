// News: on PC the category box sticks 90px from the top of the screen and follows to the end of the list (original Cy) — re-measured when the list height changes
(() => {
  const nav = document.querySelector("#news-category-nav");
  if (!nav) return;
  const box = nav.parentElement;
  const mm = gsap.matchMedia();
  mm.add("(min-width: 841px)", () => {
    gsap.set([nav, box], { transition: "none" });
    ScrollTrigger.create({ trigger: box, pin: nav, start: "top 90px", end: () => `bottom ${nav.getBoundingClientRect().height + 90}px`, invalidateOnRefresh: true });
  });
  new ResizeObserver(() => ScrollTrigger.refresh()).observe(nav.querySelector("ul"));
})();
// ”Read more” — the original fetches the next batch from the CMS and appends it after .55s. The copy appends two placeholder cards at the same time, so the button is pushed down
(() => {
  const more = document.querySelector("#read-more");
  const grid = document.querySelector(".an-newsgrid");
  if (!more || !grid) return;
  more.addEventListener("click", () => {
    setTimeout(() => {
      [...grid.children].slice(0, 2).forEach((li) => {
        const c = li.cloneNode(true);
        c.classList.add("is-in");
        grid.append(c);
      });
      ScrollTrigger.refresh();
    }, 425);
  });
})();
