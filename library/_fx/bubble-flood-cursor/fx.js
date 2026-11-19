// Inside the panel, hovering a label (data-cursor) lights an accent-color blob holding that text. The blob chases the mouse by 1/5 of the remaining distance each tick,
// The text tilts by the chase speed (remaining horizontal distance / 5). If the name tag is a link, on press the text goes out and only the bubble spreads 20x over 1s to cover the screen, then
// Fires fx:flood then goes to that address (if the caller calls preventDefault in the event it does not go — for handing off to a page transition library).
(() => {
  kfFx.register("bubble-flood-cursor", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const follow = +(options.follow || 5);
    const scale = +(options.scale ?? 20);
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const fade = +(options.fade ?? 0.3);
    const bubble = document.createElement("div");
    bubble.className = "fx-bubble-flood";
    bubble.setAttribute("aria-hidden", "true");
    bubble.innerHTML = '<i class="fx-bubble-flood__disc"></i><span class="fx-bubble-flood__label"><span></span></span>';
    document.body.appendChild(bubble);
    const disc = bubble.firstChild, label = bubble.lastChild, text = label.firstChild;
    const veil = el.querySelector('[data-fx-part="flood-text"]');
    let bx = 0, by = 0, mx = 0, my = 0, on = false, flooding = false;
    const tick = gsap.to({}, {
      duration: 1 / 120, repeat: -1,
      onRepeat() {
        bx += (mx - bx) / follow; by += (my - by) / follow;
        gsap.set(bubble, { x: bx, y: by });
        gsap.set(text, { rotate: (mx - bx) / follow });
      },
    });
    const show = (v) => {
      if (v === on || flooding) return;
      on = v;
      gsap.to(bubble, { autoAlpha: v ? 1 : 0, duration: reduce ? 0 : fade, overwrite: "auto" });
    };
    const move = (e) => {
      if (e.pointerType === "touch") return;
      const s = bubble.offsetWidth;
      mx = e.clientX - s / 2; my = e.clientY - s / 2 - +(options.lift ?? 20);
      const t = e.target.closest?.("[data-cursor]");
      if (t && el.contains(t)) { text.textContent = t.dataset.cursor; show(true); } else show(false);
    };
    const click = (e) => {
      const t = e.target.closest?.("a[data-cursor]");
      if (!t || !el.contains(t) || flooding || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      flooding = true;
      gsap.set(label, { autoAlpha: 0 });
      const go = () => {
        const ev = new CustomEvent("fx:flood", { bubbles: true, cancelable: true, detail: { href: t.href } });
        if (t.dispatchEvent(ev)) location.href = t.href;
      };
      if (veil) gsap.to(veil, { autoAlpha: 1, duration: fade, delay: fade });
      gsap.to(disc, { scale, duration: dur, ease: "power1.inOut", onComplete: go });
    };
    addEventListener("pointermove", move, { passive: true });
    el.addEventListener("click", click);
    gsap.set(bubble, { autoAlpha: 0 });
    if (veil) gsap.set(veil, { autoAlpha: 0 });
    return () => {
      removeEventListener("pointermove", move);
      el.removeEventListener("click", click);
      tick.kill();
      gsap.killTweensOf([bubble, disc, label, text]);
      if (veil) gsap.set(veil, { clearProps: "opacity,visibility" });
      bubble.remove();
    };
  });
})();
