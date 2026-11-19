// News list — year list sticky top = 60 + head height − hidden head amount (original values). Click a year to keep only that year’s rows, with the page number reset to just 1.
(() => {
  const { rpx, isSP } = window.HD;
  const root = document.querySelector(".nidx");
  const nav = root.querySelector(".nidx__nav");
  const stick = () => (nav.style.top = rpx(60 + (isSP() ? 85 : 120)) - (window.HD.hide || 0) + "px");
  window.HD.lenis.on("scroll", stick);
  addEventListener("hd:ready", stick);
  stick();

  const rows = root.querySelectorAll(".hd-newsrow");
  nav.querySelectorAll(".nidx__item").forEach((item) => item.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const y = item.dataset.year;
    nav.querySelectorAll(".nidx__item").forEach((i) => i.classList.toggle("is-current", i === item));
    rows.forEach((r) => (r.hidden = y !== "all" && r.dataset.year !== y));
    root.classList.toggle("is-year", y !== "all");
    ScrollTrigger.refresh();
  }));
})();
