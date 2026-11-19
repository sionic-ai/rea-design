(() => {
  // Sound button with a one-cycle sine wave flowing — when off, the amplitude shrinks 10% per frame until flat and the flow stops
  kfFx.register("sine-wave-toggle", (el, { options, reduce, hover }) => {
    const svg = el.querySelector('[data-fx-part="wave"]');
    if (!svg) return;
    const path = svg.querySelector("path") || svg.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path"));
    const tip = el.querySelector('[data-fx-part="tip"]');
    const cycles = +(options.cycles || 1), speed = +(options.speed ?? 0.1), height = +(options.height ?? 0.25), lerp = +(options.lerp ?? 0.1);
    let on = el.getAttribute("aria-pressed") !== "false", amp = on ? 1 : 0, phase = 0;
    const label = () => { if (tip) tip.textContent = on ? tip.dataset.on || "" : tip.dataset.off || ""; };
    const draw = () => {
      const { width: w, height: h } = svg.getBoundingClientRect();
      if (!w || !h) return;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      if (on && !reduce) phase += speed;
      amp += ((on ? 1 : 0) - amp) * (reduce ? 1 : lerp);
      let d = "";
      for (let x = 0; x <= w; x += 2) d += `${x ? "L" : "M"}${x},${(h / 2 + h * height * amp * Math.sin((x / w) * Math.PI * 2 * cycles - phase)).toFixed(2)}`;
      path.setAttribute("d", d);
    };
    const toggle = () => {
      on = !on; el.setAttribute("aria-pressed", String(on)); label();
      el.dispatchEvent(new CustomEvent("fx:toggle", { bubbles: true, detail: { on } }));
    };
    const key = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
    const move = (e) => { if (!tip) return; const r = el.getBoundingClientRect(); tip.style.left = `${e.clientX - r.left}px`; tip.style.top = `${e.clientY - r.top}px`; };
    const enter = () => tip?.classList.add("is-visible");
    const leave = () => tip?.classList.remove("is-visible");
    el.setAttribute("aria-pressed", String(on)); label();
    el.addEventListener("click", toggle); el.addEventListener("keydown", key);
    if (hover && tip) { el.addEventListener("pointerenter", enter); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave); }
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      el.removeEventListener("click", toggle); el.removeEventListener("keydown", key);
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
    };
  });
})();
