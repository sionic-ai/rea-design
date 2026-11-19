// Event section — a preview that follows the cursor (original preview follower): the window follows the cursor with .6s power3,
// When the row changes, the new photo pushes in 100% over .5s power2.inOut from below if the row is lower (from above if it is higher), while the old photo slides out the opposite way
(() => {
  const follower = (root, k) => root.querySelectorAll("[data-follower-wrap]").forEach((wrap) => {
    const coll = wrap.querySelector("[data-follower-collection]"), items = wrap.querySelectorAll("[data-follower-item]");
    const cursor = wrap.querySelector("[data-follower-cursor]"), inner = wrap.querySelector("[data-follower-cursor-inner]");
    if (!cursor || !inner) return;
    const SHIFT = 100, DUR = 0.5, EASE = "power2.inOut";
    let last = null, first = true;
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const toX = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" }), toY = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" });
    k.on(window, "mousemove", (e) => { toX(e.clientX); toY(e.clientY); });
    const drop = (v, y) => { gsap.killTweensOf(v); gsap.to(v, { yPercent: y, duration: DUR, ease: EASE, overwrite: "auto", onComplete: () => v.remove() }); };
    items.forEach((item, i) => {
      k.on(item, "mouseenter", () => {
        const down = last === null || i > last;
        last = i;
        cursor.querySelectorAll("[data-follower-visual]").forEach((v) => drop(v, down ? -SHIFT : SHIFT));
        const src = item.querySelector("[data-follower-visual]");
        if (!src) return;
        const v = src.cloneNode(true);
        inner.append(v);
        if (first) first = false;
        else gsap.fromTo(v, { yPercent: down ? SHIFT : -SHIFT }, { yPercent: 0, duration: DUR, ease: EASE, overwrite: "auto" });
      });
      k.on(item, "mouseleave", () => { const v = cursor.querySelector("[data-follower-visual]"); if (v) drop(v, -SHIFT); });
    });
    if (coll) k.on(coll, "mouseleave", () => {
      cursor.querySelectorAll("[data-follower-visual]").forEach((v) => { gsap.killTweensOf(v); gsap.delayedCall(DUR, () => v.remove()); });
      first = true;
      last = null;
    });
    k.add(() => cursor.querySelectorAll("[data-follower-visual]").forEach((v) => v.remove()));
  });

  TDS.page("news", (root, { k, reduce }) => {
    if (reduce) return;
    follower(root, k);
  });
})();
