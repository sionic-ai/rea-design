// Like the original, while dragging only the target position follows the hand, and each time the element gets a new .4s back.out(1.15) tween toward that target — so it follows late and slightly overshoots when it stops
(() => {
  kfFx.register("drag-follow", (el, { options, reduce, hover }) => {
    // Not draggable on phones — intercepting touch would stop the page from scrolling when you swipe over this element
    if (!hover) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const bounds = options.bounds != null && options.bounds !== "false";
    let pos = null, last = null, tw = null;
    const clamp = (x, y) => {
      if (!bounds) return [x, y];
      const p = el.parentElement.getBoundingClientRect(), r = el.getBoundingClientRect(), cx = gsap.getProperty(el, "x"), cy = gsap.getProperty(el, "y");
      return [Math.min(Math.max(x, cx + p.left - r.left), cx + p.right - r.right), Math.min(Math.max(y, cy + p.top - r.top), cy + p.bottom - r.bottom)];
    };
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-selected");
      pos = { x: gsap.getProperty(el, "x"), y: gsap.getProperty(el, "y") };
      last = { x: e.clientX, y: e.clientY };
    }, on);
    el.addEventListener("pointermove", (e) => {
      if (!pos) return;
      pos.x += e.clientX - last.x; pos.y += e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      const [x, y] = clamp(pos.x, pos.y);
      tw?.kill();
      tw = reduce ? gsap.set(el, { x, y }) : gsap.to(el, { x, y, duration: 0.4, ease: "back.out(1.15)" });
    }, on);
    const up = () => (pos = null);
    el.addEventListener("pointerup", up, on);
    el.addEventListener("pointercancel", up, on);
    // Pressing elsewhere clears the selection, pressing another drag-follow is also cleared here
    document.addEventListener("pointerdown", (e) => !el.contains(e.target) && el.classList.remove("is-selected"), on);
    // Elements removed from the document don’t get their transform cleared — if GSAP briefly attaches and detaches one to measure it, fx-core sees it as a newly added element and keeps attaching and detaching endlessly, freezing the page
    return () => { ac.abort(); tw?.kill(); el.classList.remove("is-selected"); if (el.isConnected) gsap.set(el, { clearProps: "transform" }); };
  });
})();
