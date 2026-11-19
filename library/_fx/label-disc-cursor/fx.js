// Inside a panel, hovering an element with a name tag (data-cursor) turns on a background-colored circle holding that name. Even when off, the circle trails the mouse late at .8s expo.out
// Already at the cursor position the moment it turns on. Not turned on if pressed by touch (so no circle is left under the finger).
(() => {
  kfFx.register("label-disc-cursor", (el, { options, reduce }) => {
    const size = +(options.size || 64);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const disc = document.createElement("div");
    disc.className = "fx-label-disc";
    disc.setAttribute("aria-hidden", "true");
    disc.style.setProperty("--fx-size", `${size}px`);
    const label = disc.appendChild(document.createElement("span"));
    document.body.appendChild(disc);
    gsap.set(disc, { autoAlpha: 0, scale: 1 });
    const dur = reduce ? 0 : +(options.dur ?? 0.8);
    const toX = gsap.quickTo(disc, "x", { duration: dur, ease });
    const toY = gsap.quickTo(disc, "y", { duration: dur, ease });
    let shown = false, touch = false;
    const from = +(options.from ?? 0.8);
    const fadeEase = kfFx.ease(options.fadeEase || "power2.out", "power2.out");
    const keep = options.cursor === "keep";
    const show = (on) => {
      if (on && touch) return;
      if (on === shown) return;
      shown = on;
      gsap.set(disc, { scale: on ? from : 1 });
      gsap.to(disc, { autoAlpha: on ? 1 : 0, scale: on ? 1 : from, duration: reduce ? 0 : +(options.fade ?? 0.3), ease: fadeEase, overwrite: "auto" });
      if (!keep) el.classList.toggle("fx-label-disc-on", on);
    };
    const move = (e) => { touch = e.pointerType === "touch"; if (!touch) { toX(e.clientX - size / 2); toY(e.clientY - size / 2); } };
    const down = (e) => { touch = e.pointerType === "touch"; if (touch) show(false); };
    const over = (e) => {
      if (e.target.closest?.("[data-cursor-hide]")) return show(false);
      const t = e.target.closest?.("[data-cursor]");
      if (t && el.contains(t)) { label.textContent = t.dataset.cursor; show(true); }
    };
    const out = (e) => {
      const next = e.relatedTarget?.closest?.("[data-cursor]");
      if (!next || !el.contains(next)) show(false);
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    el.addEventListener("mouseover", over);
    el.addEventListener("mouseout", out);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      el.removeEventListener("mouseover", over);
      el.removeEventListener("mouseout", out);
      el.classList.remove("fx-label-disc-on");
      gsap.killTweensOf(disc);
      disc.remove();
    };
  });
})();
