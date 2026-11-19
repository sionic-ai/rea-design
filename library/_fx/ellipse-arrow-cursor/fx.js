(() => {
  // One blurred 100:44 ellipse cursor shared by all targets — the cursor always follows the mouse and appears only when it is over a target, and
  // Each time, the ellipse border and the center arrow line are redrawn from the start (the drawing is keyframes in fx.css).
  let cursor = null, users = 0, tween = null, narrowAt = 835, follow = 0.4;
  const move = (e) => {
    if (!cursor || innerWidth <= narrowAt) return;
    const x = e.clientX - cursor.offsetWidth / 2, y = e.clientY - cursor.offsetHeight / 2;
    if (window.gsap) { tween?.kill(); tween = gsap.to(cursor, { x, y, duration: follow }); }
    else cursor.style.transform = `translate(${x}px, ${y}px)`;
  };
  const make = () => {
    cursor = document.createElement("div");
    cursor.className = "fx-ellipse-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<svg viewBox="0 0 100 44" preserveAspectRatio="none"><ellipse cx="50" cy="22" rx="49.5" ry="21.5" vector-effect="non-scaling-stroke"/></svg><span class="fx-ellipse-cursor__line"></span>';
    document.body.append(cursor);
    addEventListener("mousemove", move, { passive: true });
  };

  kfFx.register("ellipse-arrow-cursor", (el, { options, reduce, hover }) => {
    if (!hover) return;
    narrowAt = +(options.narrow ?? 835);
    follow = +(options.follow ?? 0.4);
    if (!cursor) make();
    users++;
    if (options.size) cursor.style.setProperty("--fx-size", /[a-z%]$/i.test(options.size) ? options.size : `${+options.size}px`);
    if (reduce) cursor.classList.add("is-fx-still");
    // show: none — creates the cursor and makes it always follow, but does not turn it on on this element (the original has a hidden cursor following the mouse even on pages without targets)
    if (options.show === "none") return () => { if (--users > 0) return; tween?.kill(); removeEventListener("mousemove", move); cursor.remove(); cursor = null; };
    const on = () => { if (innerWidth > narrowAt) cursor.setAttribute("data-active", "1"); };
    const off = () => cursor?.setAttribute("data-active", "0");
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", off);
      if (el.matches(":hover")) off();
      if (--users > 0) return;
      tween?.kill();
      removeEventListener("mousemove", move);
      cursor.remove();
      cursor = null;
    };
  });
})();
