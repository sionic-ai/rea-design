// Glass pill menu — the filled chip sits under the current page link (aria-current), and with follow: hover it slides to the hovered link in .5s power3.out and matches its width,
// Link text color inverts over a cell. Leaving the menu returns to the current page. Re-measures when the window is resized.
(() => {
  kfFx.register("glass-slider-nav", (el, { options, reduce }) => {
    const links = [...el.querySelectorAll('[data-fx-part="link"]')];
    if (!links.length) return;
    const dur = +(options.dur ?? 0.5), ease = options.ease ? kfFx.ease(options.ease, "power3.out") : "power3.out", inset = +(options.inset ?? 6);
    const slider = document.createElement("span");
    slider.className = "fx-gsn-slider"; slider.setAttribute("aria-hidden", "true");
    el.prepend(slider);
    const home = () => links.find((a) => a.getAttribute("aria-current")) || links[0];
    const go = (a, now) => {
      const r = a.getBoundingClientRect(), p = el.getBoundingClientRect();
      links.forEach((l) => l.classList.toggle("is-on", l === a));
      gsap.to(slider, { x: r.left - p.left, y: r.top - p.top, width: r.width, height: r.height, duration: now || reduce ? 0 : dur, ease, overwrite: true });
    };
    const follow = (options.follow || "hover") !== "none";
    const enter = (e) => follow && go(e.currentTarget);
    const leave = () => go(home());
    const ro = new ResizeObserver(() => go(home(), true));
    ro.observe(el);
    links.forEach((a) => a.addEventListener("pointerenter", enter));
    el.addEventListener("pointerleave", leave);
    go(home(), true);
    el.style.setProperty("--fx-gsn-inset", `${inset}px`);
    return () => { ro.disconnect(); links.forEach((a) => { a.removeEventListener("pointerenter", enter); a.classList.remove("is-on"); }); el.removeEventListener("pointerleave", leave); slider.remove(); };
  });
})();
