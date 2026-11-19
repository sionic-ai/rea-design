// About the company — when each section’s (li) top edge reaches 40% of the screen, switch the left number and the right photo to that section, and going back returns to the previous one (original about.js)
// The document rises at .3s after 300ms
(() => {
  const { reduce } = window.MR;
  const wrap = document.querySelector("[data-fade-in]");
  setTimeout(() => wrap.classList.add("is-show"), reduce ? 0 : 300);
  const dots = [...document.querySelectorAll(".mr-ab__dot")];
  const imgs = [...document.querySelectorAll(".mr-ab__swImg")];
  const set = (i, on) => { dots[i]?.classList.toggle("is-current", on); imgs[i]?.classList.toggle("is-current", on); };
  document.querySelectorAll("[data-page-area]").forEach((area, i) => {
    ScrollTrigger.create({
      trigger: area,
      start: "top 40%",
      onEnter: () => { set(i, true); if (i > 0) set(i - 1, false); },
      onLeaveBack: () => { set(i, false); if (i > 0) set(i - 1, true); },
    });
  });
  dots.forEach((d) => d.querySelector("a").addEventListener("click", (e) => {
    const t = document.querySelector(d.querySelector("a").getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" });
  }));
})();
