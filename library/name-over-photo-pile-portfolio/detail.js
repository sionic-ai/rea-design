// Work gallery: the photo of the nearest thumbnail floats in the center (fx:active of center-nudge-list), pressing a thumbnail eases that cell to the center,
// ↑↓ keys go back and forth, and hook up info (.5s open/close) · contents (thumbnails to grid positions in .79s · cells farther from center come .015s later). On phone the lower horizontal row is pushed by vertical scroll.
(() => {
  const { reduce } = window.GC;
  const body = document.body;
  const thumbs = document.querySelector("[data-gal-thumbs]");
  if (!thumbs) return;
  const items = [...thumbs.querySelectorAll(".gal-thumb")];
  const focus = [...document.querySelectorAll(".gal-focus")];
  const mobile = () => innerWidth <= 768;
  if (mobile()) thumbs.setAttribute("data-fx-center-nudge-list", "axis: x");
  const cubic = "M0,0 C0.77,0 0.175,1 1,1";
  const ease = window.CustomEase ? CustomEase.create("gc", cubic) : "power4.inOut";

  // Set top and bottom padding from the first and last box sizes, and on first entry each box slides in late by its distance from the active box (×.03s)
  const measure = () => {
    const f = items[0], l = items[items.length - 1];
    thumbs.style.setProperty("--first-h", f.offsetHeight + "px"); thumbs.style.setProperty("--last-h", l.offsetHeight + "px");
    thumbs.style.setProperty("--first-w", f.offsetWidth + "px");
    if (mobile()) document.querySelector(".gal").style.height = innerHeight + Math.max(0, thumbs.scrollWidth - innerWidth) + "px";
    else document.querySelector(".gal").style.removeProperty("height");
  };
  measure(); addEventListener("resize", measure);
  let active = 0;
  const delays = (from) => items.forEach((it, i) => it.querySelector(".gal-thumb__m").style.setProperty("--startdelay", Math.abs(i - from)));
  setTimeout(() => delays(active), 280);

  thumbs.addEventListener("fx:active", (e) => {
    if (body.classList.contains("js-index--isopen")) return;
    active = e.detail;
    focus.forEach((f, i) => f.classList.toggle("is--active", i === active));
  });

  // Phone: pushes the horizontal row left by the amount of vertical scroll
  const slide = () => { if (mobile() && !body.classList.contains("js-index--isopen")) thumbs.style.left = -window.GC.scrollStart + "px"; else thumbs.style.removeProperty("left"); requestAnimationFrame(slide); };
  requestAnimationFrame(slide);

  const centerOn = (it, smooth = true) => {
    const r = it.getBoundingClientRect();
    const by = mobile() ? r.left + r.width / 2 - innerWidth / 2 : r.top + r.height / 2 - innerHeight / 2;
    scrollBy({ top: by, behavior: smooth ? "smooth" : "auto" });
  };
  items.forEach((it, i) => it.addEventListener("click", () => {
    if (body.classList.contains("js-index--isopen")) return toggleIndex(i);
    if (body.classList.contains("js-info--isopen")) document.querySelector("[data-info]").click();
    centerOn(it);
  }));
  addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const n = items[active + (e.key === "ArrowDown" ? 1 : -1)];
    if (n) { e.preventDefault(); n.click(); }
  });

  // Info, opening .5s → open, closing .5s → closed
  document.querySelector("[data-info]").addEventListener("click", () => {
    const L = body.classList;
    if (L.contains("js-info--isopen")) { L.add("js-info--isclosing"); setTimeout(() => L.remove("js-info--isopen", "js-info--isclosing"), 500); }
    else if (!L.contains("js-info--isclosing")) {
      if (L.contains("js-index--isopen")) toggleIndex(active);
      L.add("js-info--isopening"); setTimeout(() => { L.remove("js-info--isopening"); L.add("js-info--isopen"); }, 500);
    }
  });

  // Table of contents — thumbnails fly from where they are to their grid spots. On close, the tapped cell (or the current one if none) is centered as it returns to the row
  let busy = false;
  const toggleIndex = (to) => {
    if (busy) return;
    busy = true;
    const opening = !body.classList.contains("js-index--isopen");
    const from = opening ? active : to;
    const state = window.Flip ? Flip.getState(items) : null;
    body.classList.add("js-phat--disable");
    body.classList.toggle("js-index--isopen", opening);
    if (!opening) { active = to; focus.forEach((f, i) => f.classList.toggle("is--active", i === to)); measure(); window.GC.syncPhat(); centerOn(items[to], false); window.GC.syncPhat(); }
    else { measure(); window.GC.syncPhat(); scrollTo(0, Math.max(0, (document.documentElement.scrollHeight - innerHeight) / 2)); window.GC.syncPhat(); }
    const done = () => { busy = false; body.classList.remove("js-phat--disable"); };
    if (state && !reduce) Flip.from(state, { duration: 0.79, ease, delay: (i) => Math.min(Math.abs(i - from), 40) * 0.015, onComplete: done });
    else done();
  };
  document.querySelector("[data-index-switch]").addEventListener("click", () => {
    if (body.classList.contains("js-info--isopen")) document.querySelector("[data-info]").click();
    toggleIndex(active);
  });
})();
