// List preview: a square window follows the cursor late at .6s power3, and each time the row changes a new image slides in from the side moved toward (moving down brings it in from the bottom 100%), and
// The previous image exits the opposite way (.5s power2.inOut). On first entering the list it doesn’t push but goes straight in — Preview Follower
(() => {
  kfFx.register("cursor-preview-slide", (wrap, { options, reduce, hover }) => {
    const rows = [...wrap.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length || !hover) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.5), off = +(options.offset ?? 100), follow = +(options.follow ?? 0.6);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    // If an ancestor above has a transform, fixed breaks, so the window is placed in body
    const box = document.createElement("div");
    box.className = "fx-cursor-preview-slide";
    box.innerHTML = '<div class="fx-cursor-preview-slide__in"></div>';
    document.body.append(box);
    // The window attaches to body and can’t inherit the list’s css variables, so size and ratio are passed over
    for (const v of ["--fx-size", "--fx-ratio"]) { const val = getComputedStyle(wrap).getPropertyValue(v).trim(); if (val) box.style.setProperty(v, val); }
    const inner = box.firstChild;
    gsap.set(box, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(box, "x", { duration: follow, ease: "power3" }), yTo = gsap.quickTo(box, "y", { duration: follow, ease: "power3" });
    const ac = new AbortController(), on = { signal: ac.signal };
    // Giving x puts the window at that ratio of the list width and it follows vertically only (Brand step list .3)
    const fixX = options.x != null && options.x !== "" ? +options.x : null;
    const place = () => { const r = wrap.getBoundingClientRect(); if (r.width) gsap.set(box, { x: r.left + r.width * fixX }); };
    if (fixX != null) { place(); addEventListener("resize", place, on); wrap.addEventListener("mouseenter", place, on); }
    addEventListener("mousemove", (e) => { if (fixX == null) xTo(e.clientX); yTo(e.clientY); }, on);
    let prev = null, first = true;
    const drop = (el, to) => { gsap.killTweensOf(el); gsap.to(el, { yPercent: to, duration: dur, ease, overwrite: "auto", onComplete: () => el.remove() }); };
    rows.forEach((row, i) => {
      row.addEventListener("mouseenter", () => {
        const fwd = prev === null || i > prev;
        prev = i;
        inner.querySelectorAll(".fx-cursor-preview-slide__pic").forEach((el) => drop(el, fwd ? -off : off));
        const src = row.querySelector('[data-fx-part="visual"]');
        const pic = src ? src.cloneNode(true) : Object.assign(document.createElement("div"), { textContent: row.dataset.label || "" });
        pic.removeAttribute("data-fx-part");
        pic.classList.add("fx-cursor-preview-slide__pic");
        inner.append(pic);
        box.classList.add("is-on");
        if (!first) gsap.fromTo(pic, { yPercent: fwd ? off : -off }, { yPercent: 0, duration: dur, ease, overwrite: "auto" });
        first = false;
      }, on);
      row.addEventListener("mouseleave", () => { const el = inner.querySelector(".fx-cursor-preview-slide__pic:last-child"); if (el) drop(el, -off); }, on);
    });
    wrap.addEventListener("mouseleave", () => { box.classList.remove("is-on"); first = true; prev = null; }, on);
    return () => { ac.abort(); gsap.killTweensOf(box); box.remove(); };
  });
})();
