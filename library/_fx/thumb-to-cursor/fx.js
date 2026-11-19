(() => {
  // When the pointer is over a line (card), that line’s image pops out of place and sticks to the cursor center with no lag — on leave it returns to place.
  // Instead of hover, compares the cursor position and the row box every frame (it sticks even when scrolling brings a row under the cursor).
  // Child: data-fx-part="thumb"(Image to follow, does nothing if absent) · data-fx-part if present="hover"(Visible only while a hand is present — arrows, etc.)
  let mx = -1e4, my = -1e4;
  const move = (e) => { mx = e.clientX; my = e.clientY; };
  let bound = 0;
  kfFx.register("thumb-to-cursor", (el, { options, reduce, hover }) => {
    const thumb = el.querySelector('[data-fx-part="thumb"]');
    if (!thumb || !hover) return;
    const extras = [...el.querySelectorAll('[data-fx-part="hover"]')];
    const block = options.block || "";
    if (!bound++) addEventListener("mousemove", move, { capture: true, passive: true });
    const clone = thumb.cloneNode(true);
    clone.removeAttribute("data-fx-part");
    clone.setAttribute("aria-hidden", "true");
    Object.assign(clone.style, { position: "fixed", left: "0", top: "0", margin: "0", display: "none", visibility: "visible", pointerEvents: "none", zIndex: "5000", willChange: "transform", transform: "translate3d(-1000px,-1000px,0)" });
    extras.forEach((x) => (x.style.visibility = "hidden"));
    let on = false, raf = 0;
    const set = (v) => {
      if (v === on) return;
      on = v;
      if (v) {
        const r = thumb.getBoundingClientRect();
        if (r.width) { clone.style.width = `${r.width}px`; clone.style.height = `${r.height}px`; }
        if (!clone.isConnected) document.body.append(clone);
        clone.style.display = "block";
        // Clear only when the in-place picture is visible. Do not touch the original hidden (display: none) for clone-only use.
        if (thumb.getClientRects().length) thumb.style.visibility = "hidden";
        el.style.cursor = "none";
      } else {
        clone.style.display = "none";
        thumb.style.visibility = "";
        el.style.cursor = "";
      }
      extras.forEach((x) => (x.style.visibility = v ? "" : "hidden"));
      el.classList.toggle("is-cursor-thumb", v);
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!el.isConnected) return set(false);
      const r = el.getBoundingClientRect();
      let inside = mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
      if (inside && block) inside = !document.elementFromPoint(mx, my)?.closest(block);
      set(inside);
      if (on) clone.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    };
    if (!reduce) raf = requestAnimationFrame(tick);
    const blur = () => set(false);
    addEventListener("blur", blur);
    return () => {
      cancelAnimationFrame(raf);
      set(false);
      clone.remove();
      extras.forEach((x) => (x.style.visibility = ""));
      removeEventListener("blur", blur);
      if (!--bound) removeEventListener("mousemove", move, { capture: true });
    };
  });
})();
