// Hero photos: pick the first one at random and switch to the next every 3 seconds (fade is CSS 1.2s). Phone and PC sets are separate, so only the visible one runs.
(() => {
  const sets = [...document.querySelectorAll(".hero__layers")];
  const visible = () => sets.find((s) => getComputedStyle(s).display !== "none");
  let set = visible();
  if (!set) return;
  let layers = set.querySelectorAll(".hero__layer");
  let i = Math.floor(Math.random() * layers.length);
  layers[i].classList.add("is-active");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(() => {
    const now = visible();
    if (now !== set) {
      layers.forEach((l) => l.classList.remove("is-active"));
      set = now;
      layers = set.querySelectorAll(".hero__layer");
    }
    layers[i].classList.remove("is-active");
    i = (i + 1) % layers.length;
    layers[i].classList.add("is-active");
  }, 3000);
})();
