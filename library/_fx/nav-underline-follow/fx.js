(() => {
  // The underline slides to the hovered item (width = Item width − inset×2), leaving the menu returns to the current page item
  kfFx.register("nav-underline-follow", (el, { options, reduce, hover }) => {
    if (!window.gsap) return;
    let items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) items = [...(el.querySelector("ul")?.children || [])];
    if (!items.length) return;
    let line = el.querySelector('[data-fx-part="line"]');
    const made = !line;
    if (made) { line = document.createElement("span"); line.setAttribute("data-fx-part", "line"); el.append(line); }
    const inset = +(options.inset ?? 25), dur = +(options.dur ?? 0.3), ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
    // w-dur — a different duration for width only (brand: position .35s · width .3s). leave: hide — leaving an item does not return to the current page, it fades out.
    // show — seconds until the current-page underline first turns on
    const wdur = +(options["w-dur"] ?? dur), hideMode = options.leave === "hide", show = +(options.show ?? 0);
    const current = items.find((li) => li.classList.contains("is-current") || li.querySelector('[aria-current="page"]') || li.getAttribute("aria-current"));
    const spot = (li) => {
      const a = el.getBoundingClientRect(), b = li.getBoundingClientRect();
      return { left: b.left - a.left + inset, width: Math.max(0, b.width - inset * 2) };
    };
    const place = (li) => gsap.set(line, spot(li));
    const slide = (li) => {
      if (reduce) return place(li);
      const s = spot(li);
      if (wdur === dur) return gsap.to(line, { ...s, duration: dur, ease, overwrite: true });
      gsap.to(line, { left: s.left, duration: dur, ease, overwrite: "auto" });
      gsap.to(line, { width: s.width, duration: wdur, ease, overwrite: "auto" });
    };
    let timer = 0;
    if (current) {
      place(current);
      if (show > 0 && !reduce) timer = setTimeout(() => line.classList.add("is-fx-on"), show * 1000);
      else line.classList.add("is-fx-on");
    }
    const enter = (e) => {
      const li = e.currentTarget;
      clearTimeout(timer);
      if (hideMode || line.classList.contains("is-fx-on")) slide(li);
      else place(li);
      line.classList.add("is-fx-on");
    };
    const leave = () => { if (current && !hideMode) slide(current); else line.classList.remove("is-fx-on"); };
    const leaveFrom = hideMode ? items : [el];
    if (hover) { items.forEach((li) => li.addEventListener("mouseenter", enter)); leaveFrom.forEach((n) => n.addEventListener("mouseleave", leave)); }
    const ro = new ResizeObserver(() => { if (current) place(current); });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(timer);
      items.forEach((li) => li.removeEventListener("mouseenter", enter));
      leaveFrom.forEach((n) => n.removeEventListener("mouseleave", leave));
      gsap.killTweensOf(line);
      if (made) line.remove(); else { line.classList.remove("is-fx-on"); gsap.set(line, { clearProps: "left,width" }); }
    };
  });
})();
