// The cursor sits inside the panel with position: fixed — if the panel or one of its ancestors has a transform, fixed becomes relative to that box, so don’t use it on such panels (fx.json note)
(() => {
  kfFx.register("half-arrow-cursor", (el, { options, hover }) => {
    if (!hover) return;
    const min = +(options.min ?? 1001);
    const halves = (options.mode || "halves") === "halves";
    const dx = +(options.x ?? 30), dy = +(options.y ?? 12);
    let cur = el.querySelector('[data-fx-part="cursor"]');
    const made = !cur;
    if (made) {
      cur = document.createElement("span");
      cur.setAttribute("data-fx-part", "cursor");
      cur.setAttribute("aria-hidden", "true");
      cur.innerHTML = '<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1"><circle cx="30" cy="30" r="29"/><path d="M22 30h16M32 24l6 6-6 6"/></svg>';
      el.append(cur);
    }
    const area = el.querySelector('[data-fx-part="area"]') || el;
    const prevBtn = el.querySelector('[data-fx-part="prev"]'), nextBtn = el.querySelector('[data-fx-part="next"]');
    const on = () => innerWidth >= min;
    const isLeft = (e) => { const r = area.getBoundingClientRect(); return halves && e.clientX - r.left < r.width / 2; };
    // hide — hides the cursor inside it (over card links a hand shows instead of an arrow · Brand)
    const skip = options.hide || "";
    const move = (e) => {
      if (!on()) return;
      if (skip && e.target.closest(skip)) { hide(); return; }
      cur.style.left = `${e.clientX - dx}px`;
      cur.style.top = `${e.clientY - dy}px`;
      cur.classList.toggle("is-left", isLeft(e));
      cur.classList.add("is-on");
    };
    const hide = () => cur.classList.remove("is-on");
    // Press to go that way — if prev/next buttons exist, press them, otherwise fire fx:prev and fx:next on the panel (the slider side receives them and advances)
    const click = (e) => {
      if (!on() || e.target.closest('[data-fx-part="prev"], [data-fx-part="next"], a, button') || (skip && e.target.closest(skip))) return;
      const left = isLeft(e), btn = left ? prevBtn : nextBtn;
      btn ? btn.click() : el.dispatchEvent(new CustomEvent(left ? "fx:prev" : "fx:next", { bubbles: true }));
    };
    const io = new IntersectionObserver(([en]) => en.isIntersecting || hide());
    io.observe(area);
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", hide);
    area.addEventListener("click", click);
    addEventListener("resize", hide);
    return () => {
      io.disconnect();
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", hide);
      area.removeEventListener("click", click);
      removeEventListener("resize", hide);
      made ? cur.remove() : (cur.classList.remove("is-on", "is-left"), cur.style.left = cur.style.top = "");
    };
  });
})();
