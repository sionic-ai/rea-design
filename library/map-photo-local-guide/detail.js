(() => {
  // Preview strip — dims (.5) the current photo’s cell and slides the strip over 640ms easeOutCubic so that cell is centered (original shopDetail before_change)
  const media = document.querySelector(".kx-sd__media");
  if (!media) return;
  const strip = media.querySelector(".kx-sd__strip");
  const items = strip ? [...strip.children] : [];
  if (!items.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (i) => {
    items.forEach((li, j) => li.classList.toggle("is-current", j === i));
    const li = items[i];
    const max = strip.scrollWidth - strip.clientWidth;
    const to = Math.max(0, Math.min(max, li.offsetLeft - (strip.clientWidth / 2 - li.offsetWidth / 2)));
    if (window.gsap && !reduce) gsap.to(strip, { scrollLeft: to, duration: 0.64, ease: kfFx.ease("0.215,0.61,0.355,1", "power3.out"), overwrite: true });
    else strip.scrollLeft = to;
  };
  items[0].classList.add("is-current");
  media.addEventListener("fx:change", (e) => pick(e.detail.index));
  items.forEach((li, i) => li.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    media.dispatchEvent(new CustomEvent("fx:go", { detail: { index: i } }));
  }));
})();
