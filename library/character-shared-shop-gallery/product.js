// Product list: pick a category, fold the member list, drag the price handle, unfold the phone filter
(() => {
  const sideCats = document.querySelector("[data-cats]");
  const spCats = document.querySelector("[data-cats-sp]");
  if (spCats) spCats.innerHTML = sideCats.innerHTML;
  document.querySelectorAll(".pl-cats").forEach((list) => list.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    list.querySelectorAll("li").forEach((x) => x.classList.toggle("is-active", x === li));
    // The original keeps the category in the URL (?category=Load it into ) — swap only the address without re-reading
    const n = [...list.children].indexOf(li);
    history.pushState(null, "", n > 0 ? `?category=${n}` : location.pathname);
  }));

  const toggle = document.querySelector("[data-member-toggle]");
  const members = document.querySelector("[data-members]");
  toggle.addEventListener("click", () => {
    // The original folds and unfolds the list immediately, and only the arrow rotates in .2s
    members.hidden = toggle.classList.toggle("is-closed");
  });

  document.querySelectorAll("[data-sp-toggle]").forEach((b) => b.addEventListener("click", () => {
    document.querySelector(`[data-sp-panel="${b.dataset.spToggle}"]`)?.classList.toggle("is-open");
  }));

  // Price handles: the two handles can’t cross each other
  document.querySelectorAll(".pl-price__track").forEach((track) => {
    const [l, r] = track.querySelectorAll("[data-thumb]");
    const fill = track.querySelector(".pl-price__fill");
    const pos = { l: 0, r: 1 };
    const paint = () => {
      l.style.left = pos.l * 100 + "%";
      r.style.left = pos.r * 100 + "%";
      fill.style.left = pos.l * 100 + "%";
      fill.style.right = (1 - pos.r) * 100 + "%";
    };
    [l, r].forEach((thumb) => thumb.addEventListener("pointerdown", (e) => {
      thumb.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const box = track.getBoundingClientRect();
        const v = Math.min(1, Math.max(0, (ev.clientX - box.left) / box.width));
        if (thumb === l) pos.l = Math.min(v, pos.r - 0.05); else pos.r = Math.max(v, pos.l + 0.05);
        paint();
      };
      thumb.addEventListener("pointermove", move);
      thumb.addEventListener("pointerup", () => thumb.removeEventListener("pointermove", move), { once: true });
    }));
  });
})();
