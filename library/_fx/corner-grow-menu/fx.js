(() => {
  kfFx.register("corner-grow-menu", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const bg = el.querySelector('[data-fx-part="bg"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !bg) return;
    const w = options.w || "90vw", h = options.h || "98dvh", min = options.min || "32rem";
    const k = reduce ? 0 : 1;
    const dur = +(options.dur ?? 0.7) * k, fade = +(options.fade ?? 0.5) * k, close = +(options.close ?? 0.4) * k;
    let tl;

    const set = (open) => {
      el.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      tl?.kill();
      tl = gsap.timeline();
      if (open) {
        tl.to(bg, { width: w, height: h, minHeight: min, duration: dur, ease: "power4.inOut" });
        if (panel) tl.to(panel, { opacity: 1, duration: fade, ease: "power4.inOut" }, Math.max(0, dur - 0.3 * k));
      } else {
        if (panel) tl.to(panel, { opacity: 0, duration: close, ease: "power4.inOut" }, 0);
        tl.to(bg, { width: 0, height: 0, minHeight: 0, duration: dur, ease: "power4.inOut" }, 0);
      }
    };
    const isOpen = () => el.classList.contains("is-open");
    const onToggle = (e) => { e.stopPropagation(); set(!isOpen()); };
    const onClose = () => isOpen() && set(false);
    const onKey = (e) => e.key === "Escape" && onClose();

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", onToggle);
    bg.addEventListener("click", onClose);
    panel?.addEventListener("click", onClose);
    addEventListener("keydown", onKey);
    return () => {
      tl?.kill();
      toggle.removeEventListener("click", onToggle);
      bg.removeEventListener("click", onClose);
      panel?.removeEventListener("click", onClose);
      removeEventListener("keydown", onKey);
      gsap.set(panel ? [bg, panel] : bg, { clearProps: "width,height,minHeight,opacity" });
      el.classList.remove("is-open");
    };
  });
})();
