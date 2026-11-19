(() => {
  kfFx.register("enter-disc-cursor", (el, { options, hover }) => {
    if (!hover) return;
    const disc = document.createElement("div");
    disc.className = "fx-enter-disc";
    disc.setAttribute("aria-hidden", "true");
    const label = el.querySelector('[data-fx-part="label"]');
    disc.innerHTML = '<span class="fx-enter-disc__txt"></span>';
    disc.firstChild.textContent = label ? label.textContent : options.text || "Click to Enter";
    document.body.append(disc);
    const follow = +(options.follow ?? 0.15), once = options.once !== "false";
    const at = { x: 0, y: 0 }, to = { x: 0, y: 0 };
    let ready = false, inside = false, placed = false;
    const show = (on) => {
      const v = on && ready && inside && !el.classList.contains("fx-disc-entered");
      disc.classList.toggle("is-on", v);
      document.documentElement.classList.toggle("fx-disc-on", v);
    };
    const timer = setTimeout(() => { ready = true; show(true); }, +(options.ready ?? 2) * 1000);
    const move = (e) => {
      to.x = e.clientX; to.y = e.clientY;
      if (!placed) { at.x = to.x; at.y = to.y; placed = true; }
      inside = true;
      show(true);
    };
    const leave = () => { inside = false; show(false); };
    const click = () => {
      if (!once || el.classList.contains("fx-disc-entered")) return;
      el.classList.add("fx-disc-entered");
      show(false);
      el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true }));
    };
    const tick = () => {
      at.x += (to.x - at.x) * follow;
      at.y += (to.y - at.y) * follow;
      disc.style.left = `${at.x}px`;
      disc.style.top = `${at.y}px`;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("click", click);
    gsap.ticker.add(tick);
    return () => {
      clearTimeout(timer);
      gsap.ticker.remove(tick);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", click);
      document.documentElement.classList.remove("fx-disc-on");
      el.classList.remove("fx-disc-entered");
      disc.remove();
    };
  });
})();
