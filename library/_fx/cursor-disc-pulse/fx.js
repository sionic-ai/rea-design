(() => {
  // Over the panel, the background color circle (104px) sticks to the cursor spot and grows 0 → 1x in .3s ease-out on enter. The outline ring spreads to 1.2x every 1.5s and fades out.
  // Like the original, turns on only within band px of the panel’s top edge — so the circle doesn’t follow down into the description panel below the photo
  kfFx.register("cursor-disc-pulse", (el, { options, hover }) => {
    if (!hover) return;
    let disc = el.querySelector(':scope > [data-fx-part="disc"]');
    const made = !disc;
    if (made) {
      disc = document.createElement("span");
      disc.setAttribute("data-fx-part", "disc");
      disc.setAttribute("aria-hidden", "true");
      disc.textContent = options.text || "MORE";
      el.append(disc);
    }
    const band = String(options.band ?? "650").trim() === "none" ? Infinity : +(options.band ?? 650) || Infinity;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const at = (e, on) => {
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left, y = e.clientY - b.top;
      disc.style.left = `${x}px`;
      disc.style.top = `${y}px`;
      el.classList.toggle("is-fx-disc", on && y < band);
    };
    const move = (e) => at(e, true);
    const enter = (e) => at(e, true);
    const leave = () => el.classList.remove("is-fx-disc");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove("is-fx-disc");
      if (made) disc.remove();
      else { disc.style.removeProperty("left"); disc.style.removeProperty("top"); }
    };
  });
})();
