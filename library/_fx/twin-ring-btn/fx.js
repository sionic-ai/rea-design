(() => {
  // Double-border pill button — measure the inner border inset to fit the width, and on hover the text ripples from the front from a pale color → the second color (reverse on release)
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  // Bake skin variable values like color-mix·oklch into rgb that GSAP can blend
  const rgb = (el, v) => {
    const s = document.createElement("span");
    s.style.cssText = "position:absolute;visibility:hidden";
    s.style.color = `var(${v})`;
    el.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  kfFx.register("twin-ring-btn", (el, { options, reduce, hover }) => {
    const gap = +(options.gap ?? 20);
    const fit = () => { const w = el.offsetWidth; if (w) el.style.setProperty("--fx-in", String(Math.max(0, (w - gap) / w))); };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const label = el.querySelector("[data-fx-part='label']");
    let tl = null, html = null;
    if (label && label.textContent.trim() && !reduce && hover) {
      html = label.innerHTML;
      label.innerHTML = "";
      [...html.replace(/<[^>]+>/g, "")].forEach((ch) => { const c = document.createElement("span"); c.dataset.fxPart = "char"; c.textContent = ch; if (ch === " ") c.style.whiteSpace = "pre"; label.append(c); });
      const chars = label.querySelectorAll("[data-fx-part='char']");
      const c1 = rgb(el, "--fx-wave-1"), c2 = rgb(el, "--fx-wave-2");
      const d = +(options.wave ?? 0.3);
      tl = gsap.timeline({ paused: true })
        .to(chars, { ease: "sine.out", duration: d, color: c1, stagger: { from: "start", amount: +(options.spread1 ?? 0.3) } })
        .to(chars, { ease: "sine.out", duration: d, color: c2, stagger: { from: "start", amount: +(options.spread2 ?? 0.2) } }, `-=${d}`);
    }
    const on = () => tl && tl.play(), off = () => tl && tl.reverse();
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
    return () => {
      ro.disconnect();
      el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off);
      el.removeEventListener("focus", on); el.removeEventListener("blur", off);
      tl && tl.kill();
      if (label && html != null) label.innerHTML = html;
      el.style.removeProperty("--fx-in");
    };
  });
})();
