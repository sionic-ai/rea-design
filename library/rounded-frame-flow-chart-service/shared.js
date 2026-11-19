// Shared by all pages — back-to-top button, current-page marker in the media header, phone menu drawer and search window open/close (same order as the original theme)
(() => {
  const root = document.documentElement;
  // Like the original, when the observer dot placed 100px from the top leaves the screen, html[data-scrolled=true] — the button appears when css sees that value
  const top = document.querySelector("[data-pagetop]");
  if (top) {
    const mark = document.createElement("div");
    mark.className = "mb-scroll-observer";
    mark.setAttribute("aria-hidden", "true");
    document.body.append(mark);
    root.dataset.scrolled = "false";
    new IntersectionObserver(([e]) => { root.dataset.scrolled = String(!e.isIntersecting); }).observe(mark);
    top.addEventListener("click", () => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  }
  const cur = document.body.dataset.page;
  document.querySelectorAll(".mb-gnav__li[data-cur]").forEach((li) => li.classList.toggle("is-cur", li.dataset.cur === cur));

  // The drawer opens and closes only via data-spmenu on html — hiding it entirely 1s after closing is css’s job
  if (document.querySelector(".mb-spmenu")) {
    root.dataset.spmenu = "closed";
    document.querySelectorAll("[data-sp-menu]").forEach((b) => b.addEventListener("click", () => {
      root.dataset.spmenu = root.dataset.spmenu === "opened" ? "closed" : "opened";
    }));
    // The submenu button sits inside a link, so stop the press from bubbling to the link
    document.querySelectorAll("[data-sub-toggle]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      b.classList.toggle("is-opened");
      b.parentElement.nextElementSibling?.classList.toggle("is-opened");
    }));
  }

  const search = document.querySelector(".mb-search");
  if (search) {
    const input = search.querySelector("input");
    document.querySelectorAll("[data-search-toggle]").forEach((b) => b.addEventListener("click", () => {
      const open = !search.classList.contains("is-opened");
      search.classList.toggle("is-opened", open);
      if (open) setTimeout(() => input?.focus(), 250);
    }));
    search.querySelector("[data-search-form]")?.addEventListener("submit", (e) => e.preventDefault());
  }
})();
