(() => {
  // Circle → pill → panel: on each change, measure the panel’s before and after boxes, put the panel in the new box back to its front view, and release it over dur (center-axis translate · scale).
  // Corners share the stretched scale, so they look the same roundness even while expanding
  kfFx.register("circle-pill-panel", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const bg = el.querySelector('[data-fx-part="bg"]');
    if (!toggle || !bg) return;
    const close = el.querySelector('[data-fx-part="close"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const k = reduce ? 0 : 1;
    const dur = +(options.dur ?? 0.3) * k, wait = +(options.wait ?? 0.2) * k;
    const x = +(options.x ?? 120), delay = +(options.delay ?? 0.2) * k, each = +(options.each ?? 0.1) * k, itemDur = +(options.item ?? 0.4) * k;
    const ease = kfFx.ease(options.ease || "0,0,0,1", "expo.out");
    const radius = () => parseFloat(getComputedStyle(bg).borderTopLeftRadius) || 0;
    let boxTw = null, step = null, r = 0;

    const box = (state) => {
      const a = bg.getBoundingClientRect();
      boxTw?.kill();
      bg.style.transform = bg.style.borderRadius = "";
      el.classList.toggle("is-pill", state === "pill");
      el.classList.toggle("is-full", state === "open");
      if (!dur) return;
      r = radius();
      const b = bg.getBoundingClientRect();
      const s = { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), sx: a.width / b.width, sy: a.height / b.height };
      const draw = () => {
        bg.style.transform = `translate(${s.x}px, ${s.y}px) scale(${s.sx}, ${s.sy})`;
        bg.style.borderRadius = `${r / s.sx}px / ${r / s.sy}px`;
      };
      draw();
      boxTw = gsap.to(s, { x: 0, y: 0, sx: 1, sy: 1, duration: dur, ease, onUpdate: draw, onComplete: () => (bg.style.transform = bg.style.borderRadius = "") });
    };
    const isOpen = () => el.classList.contains("is-open") || !!step;
    const set = (on) => {
      if (on === isOpen()) return;
      step?.kill();
      step = null;
      toggle.setAttribute("aria-expanded", String(on));
      if (close || items.length) gsap.killTweensOf([close, ...items].filter(Boolean));
      if (on) {
        toggle.hidden = true;
        box("pill");
        const full = () => {
          step = null;
          box("open");
          el.classList.add("is-open");
          if (close) gsap.fromTo(close, { opacity: 0 }, { opacity: 1, duration: dur, ease });
          if (items.length) {
            gsap.set(items, { opacity: 0, x });
            items.forEach((it, i) => gsap.to(it, { opacity: 1, x: 0, duration: itemDur, ease, delay: delay + i * each }));
          }
          el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
        };
        if (wait) step = gsap.delayedCall(wait, full); else full();
      } else {
        el.classList.remove("is-open");
        const all = [close, ...items].filter(Boolean);
        if (all.length) gsap.set(all, { clearProps: "opacity,transform" });
        box("");
        toggle.hidden = false;
        el.dispatchEvent(new CustomEvent("fx:close", { bubbles: true }));
      }
    };
    const onToggle = (e) => { e.stopPropagation(); set(true); };
    const onClose = (e) => { e?.stopPropagation(); set(false); };
    const onKey = (e) => e.key === "Escape" && set(false);
    const onOut = (e) => el.classList.contains("is-open") && !el.contains(e.target) && set(false);
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", onToggle);
    close?.addEventListener("click", onClose);
    addEventListener("keydown", onKey);
    document.addEventListener("click", onOut);
    return () => {
      step?.kill();
      boxTw?.kill();
      toggle.removeEventListener("click", onToggle);
      close?.removeEventListener("click", onClose);
      removeEventListener("keydown", onKey);
      document.removeEventListener("click", onOut);
      const all = [close, ...items].filter(Boolean);
      if (all.length) gsap.set(all, { clearProps: "opacity,transform" });
      bg.style.transform = bg.style.borderRadius = "";
      el.classList.remove("is-open", "is-pill", "is-full");
      toggle.hidden = false;
    };
  });
})();
