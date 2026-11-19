// When the hand enters the strip, an 83px disc follows the cursor late (.14 per step), and in the 20% at each screen edge the disc’s arrow points that way,
// Pressing advances the strip. At center the card link is pressed as usual. The disc position uses translate, while the on and pressed sizes use transform separately.
(() => {
  const SVG = '<svg class="fx-erc-disc" viewBox="0 0 148 148" aria-hidden="true"><circle cx="74" cy="74" r="71"/><circle class="fx-erc-ring" pathLength="1" cx="73.5" cy="74.5" r="70" transform="rotate(-20 74 74)"/><circle class="fx-erc-ring" pathLength="1" cx="74" cy="74.5" r="73" transform="rotate(40 74 74)"/></svg><span class="fx-erc-arrow"><svg viewBox="0 0 16 12" aria-hidden="true"><path d="m10 12-1.4-1.45L12.15 7H0V5h12.15L8.6 1.45 10 0l6 6z"/></svg></span>';

  kfFx.register("edge-ring-cursor", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const zone = +(options.zone ?? 0.2), k = +(options.follow ?? 0.14);
    const skip = options.hide || "";
    const area = el.querySelector('[data-fx-part="area"]') || el;
    const prevBtn = el.querySelector('[data-fx-part="prev"]'), nextBtn = el.querySelector('[data-fx-part="next"]');
    let cur = el.querySelector('[data-fx-part="cursor"]');
    const made = !cur;
    if (made) {
      cur = document.createElement("div");
      cur.setAttribute("data-fx-part", "cursor");
      cur.setAttribute("aria-hidden", "true");
      cur.innerHTML = SVG;
      el.append(cur);
    }
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, armed = null;
    const place = () => { cur.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`; };
    const tick = () => {
      x += (tx - x) * k;
      y += (ty - y) * k;
      if (Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05) { x = tx; y = ty; place(); raf = 0; return; }
      place();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    // If it cannot be paged further that way (button disabled, aria-disabled, swiper-button-disabled), the arrow is not raised
    const can = (dir) => {
      const b = dir === "prev" ? prevBtn : nextBtn;
      return !b || !(b.disabled || b.getAttribute("aria-disabled") === "true" || b.classList.contains("swiper-button-disabled"));
    };
    const edgeAt = (cx) => {
      const d = cx < innerWidth * zone ? "prev" : cx > innerWidth * (1 - zone) ? "next" : null;
      return d && can(d) ? d : null;
    };
    const skipped = (e) => skip && e.target.closest?.(skip);
    const mark = (d) => {
      area.classList.toggle("is-edge", !!d);
      if (d) cur.dataset.edge = d;
    };
    // The original disc lives only at the handoff spot (last 20%) — at the center it turns off and card hover returns. When it reaches the end again it turns on right there
    const leave = () => { cur.classList.remove("is-active", "is-pressed"); stop(); mark(null); };
    const show = (e, d) => {
      tx = x = e.clientX; ty = y = e.clientY;
      place();
      cur.classList.add("is-active");
      mark(d);
    };
    const move = (e) => {
      const d = skipped(e) ? null : edgeAt(e.clientX);
      if (!d) return leave();
      if (!cur.classList.contains("is-active")) return show(e, d);
      tx = e.clientX; ty = e.clientY;
      mark(d);
      if (reduce) { x = tx; y = ty; place(); } else if (!raf) raf = requestAnimationFrame(tick);
    };
    const enter = move;
    const down = (e) => {
      cur.classList.add("is-pressed");
      armed = e.pointerType === "mouse" && e.button === 0 && cur.classList.contains("is-active") && !skipped(e) ? edgeAt(e.clientX) : null;
    };
    const up = () => cur.classList.remove("is-pressed");
    const noSelect = (e) => { if (armed) e.preventDefault(); };
    const click = (e) => {
      const d = armed;
      armed = null;
      if (!d || e.detail === 0) return;
      e.preventDefault();
      e.stopPropagation();
      const b = d === "prev" ? prevBtn : nextBtn;
      b ? b.click() : el.dispatchEvent(new CustomEvent(d === "prev" ? "fx:prev" : "fx:next", { bubbles: true }));
    };
    const noDrag = (e) => e.preventDefault();
    area.addEventListener("mouseenter", enter);
    area.addEventListener("mousemove", move);
    area.addEventListener("mouseleave", leave);
    area.addEventListener("pointerdown", down, true);
    area.addEventListener("mousedown", noSelect, true);
    area.addEventListener("click", click, true);
    area.addEventListener("dragstart", noDrag);
    addEventListener("pointerup", up);
    return () => {
      stop();
      area.removeEventListener("mouseenter", enter);
      area.removeEventListener("mousemove", move);
      area.removeEventListener("mouseleave", leave);
      area.removeEventListener("pointerdown", down, true);
      area.removeEventListener("mousedown", noSelect, true);
      area.removeEventListener("click", click, true);
      area.removeEventListener("dragstart", noDrag);
      removeEventListener("pointerup", up);
      area.classList.remove("is-edge");
      if (made) cur.remove();
      else { cur.classList.remove("is-active", "is-pressed"); cur.style.translate = ""; delete cur.dataset.edge; }
    };
  });
})();
