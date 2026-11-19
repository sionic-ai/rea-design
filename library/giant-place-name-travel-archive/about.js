/* Hand-drawn ring — with the same dotlottie-player as the original, it autoplays 136f and loops. The line color is read from the skin (--kf-accent) and put into the animation data */
(() => {
  const player = document.querySelector(".ab-ring__player");
  if (!player || !window.tsRing) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const probe = document.createElement("i");
  probe.style.color = "var(--kf-accent)";
  document.body.append(probe);
  const rgb = (getComputedStyle(probe).color.match(/[\d.]+/g) || ["0", "0", "0"]).slice(0, 3).map((v) => +v / 255);
  probe.remove();
  const paint = (items) => items.forEach((it) => {
    if (it.ty === "gr") paint(it.it);
    if (it.ty === "st") it.c.k = [...rgb, 1];
  });
  const data = JSON.parse(JSON.stringify(window.tsRing));
  data.layers.forEach((l) => paint(l.shapes || []));
  const go = () => {
    player.load(data);
    if (reduce) { player.pause?.(); player.seek?.(45); }
  };
  if (customElements.get("dotlottie-player")) go();
  else customElements.whenDefined("dotlottie-player").then(go);

  // Workflow — pressing it unfolds the table in .3s and the + folds into a -
  document.querySelectorAll(".ab-acc").forEach((acc) => {
    const btn = acc.querySelector(".ab-acc__btn");
    btn.addEventListener("click", () => {
      const on = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", on);
      btn.setAttribute("aria-expanded", String(on));
    });
  });
})();
