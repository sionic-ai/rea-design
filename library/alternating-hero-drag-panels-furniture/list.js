// Product list — grid size toggle (cards fade out in .18s and relight in the new cells after 160ms), phone type and condition expanders
(() => {
  const grid = document.querySelector(".sg-plist__grid");
  const btns = document.querySelectorAll(".sg-plist__switch button");
  btns.forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-active") || !grid) return;
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    grid.classList.add("is-out");
    setTimeout(() => {
      grid.classList.toggle("is-small", b.dataset.view === "small");
      requestAnimationFrame(() => grid.classList.remove("is-out"));
    }, 160);
  }));
  // Search box bidirectional pinning — if the box is taller than the screen it sticks to the bottom (20px) when scrolling down and to the top (20px below the bar) when scrolling up, holding in place in between. It never goes past the end of the list
  const aside = document.querySelector(".sg-plist__aside"), box = document.querySelector(".sg-plist"), bar = document.querySelector(".sg-plist__bar");
  if (aside && box) {
    let y = null;
    const place = () => {
      if (innerWidth <= 780) { aside.style.transform = ""; y = null; return; }
      aside.style.transform = "";
      const top0 = aside.getBoundingClientRect().top + scrollY, h = aside.offsetHeight, vh = innerHeight;
      const gapTop = (bar?.offsetHeight || 0) + 20, gapBottom = 20;
      const lo = scrollY + vh - gapBottom - h, hi = scrollY + gapTop;
      if (y === null) y = top0;
      y = h + gapTop + gapBottom <= vh ? hi : Math.min(Math.max(y, lo), hi);
      const maxY = box.getBoundingClientRect().bottom + scrollY - 76 - h;
      y = Math.min(Math.max(y, top0), Math.max(top0, maxY));
      aside.style.transform = `translateY(${Math.round(y - top0)}px)`;
    };
    addEventListener("scroll", place, { passive: true });
    addEventListener("resize", () => { y = null; place(); });
    place();
  }
  document.querySelectorAll(".sg-plist__drop").forEach((d) => d.addEventListener("click", () => {
    const box = d.closest(".sg-plist__cat, .sg-plist__filter");
    const other = document.querySelector(box.classList.contains("sg-plist__cat") ? ".sg-plist__filter" : ".sg-plist__cat");
    other?.classList.remove("is-open");
    box.classList.toggle("is-open");
  }));
})();
