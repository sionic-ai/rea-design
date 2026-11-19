(() => {
  /* Pressing a hotspot button opens the card pointed to by aria-controls from transparent and 10px below in .6s, and pressing again, pressing outside or Esc closes it in .3s.
     Only one at a time — when another hotspot opens, the previous card closes (they know about each other by firing fx:spot-open on the document) */
  kfFx.register("ring-spot-card", (el, { options, reduce }) => {
    const id = el.getAttribute("aria-controls");
    const card = id ? document.getElementById(id) : el.querySelector('[data-fx-part="card"]');
    const dur = reduce ? 0 : +(options.dur ?? 0.6), close = reduce ? 0 : +(options.close ?? 0.3), y = +(options.y ?? 10);
    const ease = kfFx.ease(options.ease || "0.52,0,0.48,1", "power1.inOut");
    const easeOut = kfFx.ease("0.44,0,0.56,1", "power1.inOut");
    if (!el.hasAttribute("aria-expanded")) el.setAttribute("aria-expanded", "false");
    if (!card) return () => el.removeAttribute("aria-expanded");
    gsap.set(card, { autoAlpha: 0 });
    const isOpen = () => el.getAttribute("aria-expanded") === "true";
    const shut = () => {
      if (!isOpen()) return;
      el.setAttribute("aria-expanded", "false");
      gsap.to(card, { autoAlpha: 0, y, duration: close, ease: easeOut, overwrite: true });
    };
    const open = () => {
      document.dispatchEvent(new CustomEvent("fx:spot-open", { detail: { el } }));
      el.setAttribute("aria-expanded", "true");
      gsap.fromTo(card, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: dur, ease, overwrite: true });
      card.querySelectorAll('[data-fx~="char-blur-rise"]').forEach((t, i) => t.dispatchEvent(new CustomEvent("fx:show", { detail: { delay: 0.1 + i * 0.3 } })));
    };
    const onClick = (e) => { e.stopPropagation(); isOpen() ? shut() : open(); };
    const onOther = (e) => { if (e.detail.el !== el) shut(); };
    const onDoc = (e) => { if (!card.contains(e.target) && !el.contains(e.target)) shut(); };
    const onKey = (e) => { if (e.key === "Escape") shut(); };
    el.addEventListener("click", onClick);
    document.addEventListener("fx:spot-open", onOther);
    document.addEventListener("click", onDoc);
    addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("fx:spot-open", onOther);
      document.removeEventListener("click", onDoc);
      removeEventListener("keydown", onKey);
      gsap.set(card, { clearProps: "opacity,visibility,transform" });
      el.setAttribute("aria-expanded", "false");
    };
  });
})();
