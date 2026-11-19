// Home page — Hero image and title turn on, center sticky image in the service section (original js-sticky as is: fixed when scroll + half the screen is within range)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = (sel) => document.querySelectorAll(sel).forEach((el) => el.classList.add("is-active"));
  document.addEventListener("each:illust", () => on(".main__illust .illust__layer"));
  document.addEventListener("each:text", () => on(".title__row"));

  // Pinned picture — fixed only while the picture center passes the screen center within a section, placed at the top of the section before and at the bottom after.
  // For each cell dividing the section by item count (advanced by half a cell), one set of background and people gets is-animated
  const box = document.querySelector(".js-sticky");
  const el = box && box.querySelector(".js-sticky__item");
  if (!el) return;
  const groups = [...el.querySelectorAll(".js-sticky__changes")];
  const place = () => {
    if (getComputedStyle(el).display === "none") return;
    const pw = box.clientWidth, ph = box.offsetHeight, top = box.getBoundingClientRect().top + scrollY;
    const ew = el.offsetWidth, eh = el.offsetHeight;
    const left = el.dataset.pos === "right" ? pw - ew : el.dataset.pos === "left" ? 0 : (pw - ew) / 2;
    const pos = scrollY + innerHeight / 2, start = top + eh / 2, end = top + ph - eh / 2;
    if (start <= pos && pos <= end) {
      Object.assign(el.style, { position: "fixed", top: "50%", left: `${box.getBoundingClientRect().left + left}px`, transform: "translateY(-50%)" });
      el.classList.add("is-active");
      groups.forEach((g) => {
        const kids = [...g.children], k = ph / kids.length;
        kids.forEach((c, i) => {
          const t = k * i - k / 2;
          c.classList.toggle("is-animated", pos - start >= t && pos - start <= t + k);
        });
      });
    } else {
      el.classList.remove("is-active");
      Object.assign(el.style, { position: "absolute", top: start > pos ? "0px" : `${ph - eh}px`, left: `${left}px`, transform: "translateY(0)" });
    }
  };
  ["scroll", "resize", "load"].forEach((t) => addEventListener(t, place, { passive: true }));
  place();
  if (reduce) groups.forEach((g) => g.querySelectorAll(":scope > *").forEach((c) => (c.style.transition = "none")));
})();
