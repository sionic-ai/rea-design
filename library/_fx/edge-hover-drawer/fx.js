(() => {
  kfFx.register("edge-hover-drawer", (el, { options, reduce, hover }) => {
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!panel) return;
    const inner = el.querySelector('[data-fx-part="inner"]');
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const width = +options.width || 280;
    const dur = reduce ? 0 : +(options.dur ?? 0.3);
    const outQuart = kfFx.ease("0.165,0.84,0.44,1", "power3.out");
    const inOutCubic = kfFx.ease("0.645,0.045,0.355,1", "power2.inOut");
    const inOutQuart = kfFx.ease("0.76,0,0.24,1", "power3.inOut");
    el.style.setProperty("--fx-width", width + "px");
    let isOpen = false;
    const open = () => {
      isOpen = true; el.classList.add("is-open");
      gsap.killTweensOf([panel, inner].filter(Boolean));
      gsap.to(panel, { right: 0, duration: dur, ease: outQuart });
      if (inner) gsap.to(inner, { opacity: 1, duration: dur ? 0.25 : 0, delay: dur ? 0.1 : 0, ease: "none" });
      el.dispatchEvent(new CustomEvent("fx:open"));
    };
    const close = () => {
      isOpen = false; el.classList.remove("is-open");
      gsap.killTweensOf([panel, inner].filter(Boolean));
      if (inner) gsap.to(inner, { opacity: 0, duration: dur ? 0.1 : 0, ease: "none" });
      gsap.to(panel, { right: -width, duration: dur, ease: inOutCubic });
      el.dispatchEvent(new CustomEvent("fx:close"));
    };
    const tap = () => (isOpen ? close() : open());
    if (hover) { el.addEventListener("mouseenter", open); el.addEventListener("mouseleave", close); }
    toggle?.addEventListener("click", tap);
    let peekCall = null;
    if (options.peek === "on" && !reduce) {
      gsap.set(panel, { right: +(options.peekx ?? -135) });
      peekCall = gsap.delayedCall(+(options.hold ?? 1.3), () => { if (!isOpen) gsap.to(panel, { right: -width, duration: 0.4, ease: inOutQuart }); });
    }
    return () => {
      peekCall?.kill();
      gsap.killTweensOf([panel, inner].filter(Boolean));
      el.removeEventListener("mouseenter", open); el.removeEventListener("mouseleave", close);
      toggle?.removeEventListener("click", tap);
      gsap.set([panel, inner].filter(Boolean), { clearProps: "right,opacity" });
    };
  });
})();
