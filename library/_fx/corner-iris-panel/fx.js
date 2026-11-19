(() => {
  // Original Brand ”LEARN MORE”: a circular mask centered on the top left corner (20% soft edge) spreads over 1.7s power2.out,
  // The darkened (.45) blurred (2px) board opens to 70%, the text board to 100%. On close both fold back to 0 over the same length.
  // Opening and closing sends fx:open · fx:close · fx:toggle events to the panel or to the [data-fx-part=Press close]. fx:state on every change { open } brings up
  kfFx.register("corner-iris-panel", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const veil = el.querySelector('[data-fx-part="veil"]');
    const body = el.querySelector('[data-fx-part="body"]');
    const close = el.querySelector('[data-fx-part="close"]');
    if (!body) return;
    const dur = +(options.dur ?? 1.7), veilTo = +(options.veil ?? 70), bodyTo = +(options.size ?? 100);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const parts = veil ? [veil, body] : [body];
    gsap.set(parts, { "--fx-size": 0 });
    let open = false;
    const tl = gsap.timeline();
    const set = (v) => {
      if (v === open) return;
      open = v;
      tl.clear();
      const d = reduce ? 0 : dur;
      if (open) {
        if (veil) tl.to(veil, { duration: d, "--fx-size": veilTo, ease }, 0);
        tl.to(body, { duration: d, "--fx-size": bodyTo, ease }, 0);
      } else tl.to(parts, { duration: d, "--fx-size": 0, ease }, 0);
      tl.restart();
      el.classList.toggle("is-open", open);
      body.inert = !open;
      el.dispatchEvent(new CustomEvent("fx:state", { bubbles: true, detail: { open } }));
    };
    body.inert = true;
    const onOpen = () => set(true), onClose = () => set(false), onToggle = () => set(!open);
    const onKey = (e) => { if (e.key === "Escape" && open) set(false); };
    el.addEventListener("fx:open", onOpen);
    el.addEventListener("fx:close", onClose);
    el.addEventListener("fx:toggle", onToggle);
    close?.addEventListener("click", onClose);
    document.addEventListener("keydown", onKey);
    return () => {
      tl.kill();
      el.removeEventListener("fx:open", onOpen);
      el.removeEventListener("fx:close", onClose);
      el.removeEventListener("fx:toggle", onToggle);
      close?.removeEventListener("click", onClose);
      document.removeEventListener("keydown", onKey);
      gsap.set(parts, { clearProps: "--fx-size" });
      body.inert = false;
      el.classList.remove("is-open");
    };
  });
})();
