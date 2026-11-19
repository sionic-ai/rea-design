(() => {
  kfFx.register("hover-drop-menu", (el, { options, reduce, hover }) => {
    const trigger = el.querySelector(':scope > [data-fx-part="trigger"]');
    const pop = el.querySelector(':scope > [data-fx-part="pop"]');
    if (!trigger || !pop) return;
    const chev = trigger.querySelector('[data-fx-part="chevron"]');
    const wait = +(options.delay ?? 0.12) * 1000;
    const flip = +(options.flip ?? 180);
    let shut = 0;
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    const set = (open) => {
      clearTimeout(shut);
      if (open === el.classList.contains("is-open")) return;
      el.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      if (chev) {
        if (reduce) gsap.set(chev, { rotation: open ? flip : 0 });
        else gsap.to(chev, { rotation: open ? flip : 0, duration: +(options.turn ?? 0.45), ease: "back.out(2.1)", overwrite: true, transformOrigin: "50% 50%" });
      }
      const opts = pop.querySelectorAll('[data-fx-part="option"]');
      if (open && opts.length && !reduce)
        gsap.fromTo(opts, { opacity: 0, y: 10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: +(options.each ?? 0.42), stagger: +(options.stagger ?? 0.045), ease: "back.out(1.8)", overwrite: true });
    };
    const enter = (e) => e.pointerType === "mouse" && set(true);
    const leave = (e) => { if (e.pointerType === "mouse") shut = setTimeout(() => set(false), wait); };
    const focusIn = () => set(true);
    const focusOut = (e) => el.contains(e.relatedTarget) || set(false);
    // Devices that can’t hover: the first tap opens the panel
    const tap = (e) => { if (!hover && !el.classList.contains("is-open")) { e.preventDefault(); set(true); } };
    const key = (e) => e.key === "Escape" && (set(false), trigger.focus());
    const away = (e) => !el.contains(e.target) && set(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    el.addEventListener("keydown", key);
    trigger.addEventListener("click", tap);
    document.addEventListener("pointerdown", away);
    return () => {
      clearTimeout(shut);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
      el.removeEventListener("keydown", key);
      trigger.removeEventListener("click", tap);
      document.removeEventListener("pointerdown", away);
      el.classList.remove("is-open");
      trigger.removeAttribute("aria-haspopup");
      trigger.removeAttribute("aria-expanded");
      if (chev) gsap.set(chev, { clearProps: "transform" });
      const opts = pop.querySelectorAll('[data-fx-part="option"]');
      if (opts.length) gsap.set(opts, { clearProps: "opacity,transform" });
    };
  });
})();
