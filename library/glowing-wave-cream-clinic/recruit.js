// Careers — left job pill: lights the pill of the job block now passing below the header height (original scroll spy), clicking scrolls to that block with jQuery animate 800ms (swing) (leaving 100px for the header)
(() => {
  const links = [...document.querySelectorAll(".js-anchor-scroll a")];
  if (!links.length) return;
  const isSP = () => matchMedia("(max-width: 768px)").matches;
  const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!isSP()) links[0].classList.add("is-current", "is-active");
  const spy = () => {
    if (isSP()) return;
    const y = scrollY + document.querySelector(".aa-head").offsetHeight;
    secs.forEach((s, i) => {
      const top = s.getBoundingClientRect().top + scrollY;
      if (top < y && y < top + s.offsetHeight) { links.forEach((l) => l.classList.remove("is-current")); links[i].classList.add("is-current"); }
    });
  };
  addEventListener("scroll", spy, { passive: true });
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    links.forEach((l) => { l.classList.remove("is-active"); if (isSP()) l.classList.remove("is-current"); });
    a.classList.add("is-active");
    const t = document.querySelector(a.getAttribute("href"));
    if (t) jQuery("html, body").stop().animate({ scrollTop: t.getBoundingClientRect().top + scrollY - (isSP() ? 85 : 100) }, 800);
  }));
})();
