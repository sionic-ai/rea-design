// Studio home page — testimonial accordion. Original Framer variants 1~6 (only one row expanded): row height changes immediately (collapsed rows hide text at 72px),
// Changed spots resolve with a layout tween (.45s cubic-bezier(.44,0,.56,1)) — a collapsing row shrinks vertically from its old height, and the text of an expanded row rises from 640px below (index.css)
(() => {
  const list = document.querySelector(".hp-voices__list");
  if (!list) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const opt = { duration: 450, easing: "cubic-bezier(0.44, 0, 0.56, 1)" };
  const items = [...list.querySelectorAll(".hp-voice")];
  const open = (li) => {
    if (li.classList.contains("is-open")) return;
    const prev = items.find((n) => n.classList.contains("is-open"));
    const before = new Map(items.map((n) => [n, n.getBoundingClientRect()]));
    items.forEach((n) => { n.classList.toggle("is-open", n === li); n.setAttribute("aria-expanded", String(n === li)); });
    if (reduce) return;
    items.forEach((n) => {
      if (n === li) return;
      const a = before.get(n), b = n.getBoundingClientRect();
      const sy = a.height / b.height, dy = a.top - b.top;
      if (Math.abs(sy - 1) < 0.002 && Math.abs(dy) < 0.5) return;
      n.style.transformOrigin = "50% 0";
      n.animate([{ transform: `translateY(${dy}px) scaleY(${sy})` }, { transform: "none" }], opt);
      // Only the header line is stretched in reverse so it isn’t squashed, the text drops below 640px by CSS transition
      if (Math.abs(sy - 1) >= 0.002) n.querySelectorAll(":scope > .hp-voice__head").forEach((k) => { k.style.transformOrigin = "50% 0"; k.animate([{ transform: `scaleY(${1 / sy})` }, { transform: "none" }], opt); });
    });
    if (prev) prev.blur();
  };
  // Like the original, toggles the expansion on the frame after the press
  list.addEventListener("click", (e) => { const li = e.target.closest(".hp-voice"); if (li) requestAnimationFrame(() => open(li)); });
  list.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const li = e.target.closest(".hp-voice");
    if (li) { e.preventDefault(); open(li); }
  });
})();
