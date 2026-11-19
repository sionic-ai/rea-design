// Work room: on each slide change the number (two digits) · number line progress · work name update, and the name is rewritten from blank (original ScrambleText 44ms stagger + 0~35ms · 45ms×2)
(() => {
  const room = document.querySelector(".st");
  if (!room) return;
  const n = room.querySelector("[data-study-n]"), c = room.querySelector("[data-study-c]"), t = room.querySelector("[data-study-t]"), bar = room.querySelector(".st-count i");
  const two = (v) => String(v).padStart(2, "0");
  room.addEventListener("fx:change", (e) => {
    const { index } = e.detail;
    const slide = room.querySelectorAll('[data-fx-part="slide"]')[index];
    if (n) n.textContent = two(index + 1);
    if (c) c.textContent = two(index + 1);
    const g = bar?.querySelector("b");
    if (g) { g.classList.remove("is-run"); void g.offsetWidth; g.classList.add("is-run"); }
    if (t && slide) {
      // text-scramble remembers the text when attached and restores it when detached, so detach first, then change the text and attach again
      const fx = t.getAttribute("data-fx") || t.dataset.fxWas;
      t.dataset.fxWas = fx;
      t.removeAttribute("data-fx");
      requestAnimationFrame(() => {
        t.textContent = slide.dataset.title;
        t.setAttribute("data-fx", fx);
        requestAnimationFrame(() => t.dispatchEvent(new CustomEvent("fx:play")));
      });
    }
  });
  const m = room.querySelector("[data-mark]");
  if (m) m.innerHTML = AM.mark;
  // The thumbnail window rises from 120px below over .7s cubic-bezier(.16,1,.3,1) when opened
  requestAnimationFrame(() => requestAnimationFrame(() => room.querySelector(".st-win")?.classList.add("is-in")));
})();
