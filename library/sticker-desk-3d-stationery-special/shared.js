// Shared across the whole site — brand palette reading, swapping the −36° confetti, rolling the arrow circle, hover marker
(() => {
  // Turn skin variables (oklch relative color) into real colors — painting on a canvas and reading it back gives rgb for any css color string
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  const holder = document.createElement("i");
  holder.style.display = "none";
  const color = (name) => {
    if (!holder.isConnected) document.documentElement.append(holder);
    holder.style.color = `var(${name})`;
    const css = getComputedStyle(holder).color;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return { r, g, b, hex: "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""), css };
  };
  const palette = (kind) => Array.from({ length: 8 }, (_, i) => color(`--site-${kind}-${i}`));

  // Confetti — lay new pieces on each box, and once all have arrived, set the box background to that color and remove the pieces.
  let last = 0;
  const tip = (index, dir = 0, root = document) => {
    const c = palette("frame")[index % 8].hex;
    root.querySelectorAll('[data-action~="colortip"]').forEach((el) => {
      const u = document.createElement("span");
      u.className = "ky-tip__unit";
      if (dir < 0 || (dir === 0 && index < last)) u.classList.add("is-reverse");
      u.style.backgroundColor = c;
      el.append(u);
      u.addEventListener("animationend", () => { el.style.backgroundColor = c; u.remove(); }, { once: true });
    });
    last = index;
  };

  // Hover — mouse only, drag and touch release immediately
  const hov = (el) => {
    el.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && el.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => el.classList.remove("is-hover"));
    el.addEventListener("pointercancel", () => el.classList.remove("is-hover"));
  };
  // Arrow circle — exits to 70%, crosses to −60%, returns in 1.1s, and spins again if the pointer is still over it.
  const rest = parseFloat(getComputedStyle(document.body).getPropertyValue("--ky-ricon-rest")) || 0;
  const ricon = (ic) => {
    const inner = ic.querySelector(".ky-ricon__inner");
    if (!inner) return;
    inner.addEventListener("transitionstart", (e) => { if (e.propertyName === "transform") ic.classList.add("is-move"); });
    inner.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
      if (ic.classList.contains("is-loopend")) {
        ic.classList.remove("is-loop", "is-loopend", "is-move");
        if (rest) { ic.classList.add("is-rest"); setTimeout(() => ic.classList.remove("is-rest"), rest); }
        return;
      }
      ic.classList.add("is-loop");
      requestAnimationFrame(() => ic.classList.add("is-loopend"));
    });
  };
  const wire = (root = document) => {
    root.querySelectorAll(".ky-hov").forEach(hov);
    root.querySelectorAll(".ky-ricon").forEach(ricon);
  };
  addEventListener("pagehide", () => document.querySelectorAll(".ky-ricon").forEach((ic) => ic.classList.remove("is-loop", "is-loopend", "is-move", "is-rest")));
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", () => wire());
  else wire();

  window.ky = { color, palette, tip, wire };
})();
