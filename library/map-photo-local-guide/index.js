(() => {
  // Shop row — original mSlider (slide, 380ms easeInOutQuad, random first cell). One more set of cells is attached before and after so it loops endlessly, and
  // If the turn ends outside the center band, jump to the same cell position without a transition
  const box = document.querySelector(".kx-shops");
  if (!box) return;
  const track = box.querySelector(".kx-shops__track");
  const cells = [...track.children];
  const n = cells.length;
  if (!n) return;
  const before = cells.map((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.querySelectorAll("a").forEach((a) => (a.tabIndex = -1)); return k; });
  const after = cells.map((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.querySelectorAll("a").forEach((a) => (a.tabIndex = -1)); return k; });
  track.prepend(...before);
  track.append(...after);
  let at = n + Math.floor(Math.random() * n);
  let busy = false;
  const unit = () => track.children[0].getBoundingClientRect().width;
  const place = (jump) => {
    track.classList.toggle("is-jump", jump);
    track.style.transform = `translate3d(${-at * unit()}px,0,0)`;
    if (jump) void track.offsetWidth;
  };
  place(true);
  track.classList.remove("is-jump");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap = () => { if (at < n || at >= 2 * n) at = ((at - n) % n + n) % n + n; };
  const go = (d) => {
    if (reduce) { at += d; wrap(); place(true); return; }
    if (busy) return;
    busy = true;
    at += d;
    place(false);
  };
  track.addEventListener("transitionend", (e) => {
    if (e.target !== track) return;
    if (at < n || at >= 2 * n) { wrap(); place(true); track.classList.remove("is-jump"); }
    busy = false;
  });
  box.querySelector(".kx-shops__arrow--prev").addEventListener("click", () => go(-1));
  box.querySelector(".kx-shops__arrow--next").addEventListener("click", () => go(1));
  addEventListener("resize", () => place(true));
  let sx = null;
  box.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") sx = e.clientX; });
  box.addEventListener("pointerup", (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
})();
