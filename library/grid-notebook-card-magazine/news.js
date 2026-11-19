// Magazine list — original infinite scroll: page links are hidden, and when the list end reaches the screen the next page of cards is fetched and appended (spinner while loading, new cards appear in .5s)
(() => {
  const pager = document.querySelector("[data-more]");
  const tpl = document.getElementById("yk-more-cards");
  const list = document.querySelector(".yk-cards");
  if (!pager || !tpl || !list || !("IntersectionObserver" in window)) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let left = +pager.dataset.more || 3, busy = false, n = 0;
  pager.hidden = true;
  const spin = document.createElement("div");
  spin.className = "yk-loading";
  spin.setAttribute("role", "status");
  spin.setAttribute("aria-label", "Loading more");
  list.after(spin);
  const io = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting || busy || left <= 0) return;
    busy = true;
    spin.classList.add("is-on");
    setTimeout(() => {
      const frag = tpl.content.cloneNode(true);
      n++;
      frag.querySelectorAll("[id]").forEach((el) => { el.id = `${el.id}-p${n}`; });
      frag.querySelectorAll("textPath").forEach((t) => t.setAttribute("href", `${t.getAttribute("href")}-p${n}`));
      const items = [...frag.children];
      list.append(frag);
      if (!reduce) gsap.fromTo(items, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" });
      spin.classList.remove("is-on");
      busy = false;
      if (--left <= 0) { io.disconnect(); spin.remove(); }
    }, reduce ? 0 : 600);
  }, { rootMargin: "0px 0px 200px 0px" });
  io.observe(spin);
})();
