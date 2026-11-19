// Stretch the text to the circle’s circumference (textLength) so the end meets the start — whatever the character count, no gap or overlap appears at the seam
(() => {
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  kfFx.register("text-ring-spin", (el, { options }) => {
    const label = String(options.text ?? el.getAttribute("aria-label") ?? "").trim();
    if (!label) return;
    const size = +(options.size ?? 54);
    // Option values get leading and trailing spaces trimmed, so to join with one space use ”sep: space” — brand ABOUT ME? ring
    const sep = options.sep === "space" ? " " : options.sep ?? " · ";
    const times = Math.max(1, Math.round(+options.repeat || 1));
    const inset = +(options.inset ?? 4);
    const r = 500 - inset - size * 0.72;
    const id = `fx-text-ring-${++uid}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "fx-ring-svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("id", id);
    path.setAttribute("fill", "none");
    path.setAttribute("d", `M ${500 - r} 500 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 ${-2 * r} 0`);
    const text = document.createElementNS(NS, "text");
    text.setAttribute("font-size", size);
    const tp = document.createElementNS(NS, "textPath");
    tp.setAttribute("href", `#${id}`);
    // fit: off — short text covering only part of the circle (video button ”Play The Full Movie”) is not stretched and wraps at its own spacing
    if (options.fit !== "off") {
      tp.setAttribute("textLength", (2 * Math.PI * r).toFixed(1));
      tp.setAttribute("lengthAdjust", "spacing");
    }
    tp.textContent = options.fit === "off" ? Array(times).fill(label).join(sep) : Array(times).fill(label + sep).join("");
    text.append(tp);
    const turn = +(options.start ?? 0);
    if (turn) svg.style.transform = `rotate(${turn}deg)`;
    svg.append(path, text);
    el.append(svg);
    return () => svg.remove();
  });
})();
