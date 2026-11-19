// First page photo pile fill + endless loop. Photos are individual shots mixing landscape and portrait like the original — each is fitted by ratio inside a cell (110% × 120%).
// Original numbers: when 500px remain to the end, the first group (minus empty cells) is cloned whole and appended
(() => {
  const shots = [
    ["Person wearing a red headscarf · from behind · clear daytime · portrait", 0.75], ["Upper-body muscles · Black and white · Portrait", 1.2], ["Beach rocks · Overcast sea · Landscape", 1.5], ["Curly-haired person · beige clothes · portrait", 0.8],
    ["Person dancing in the desert · white dress · vertical", 0.8], ["Seaside evening · warm light · landscape", 1.5], ["Two horses · B&W · landscape", 1.4], ["Person face close-up · dark background · square", 1],
    ["Flower garden and building · midday · portrait", 0.8], ["Blonde person · By the window · Portrait", 0.75], ["Driver in car · night · landscape", 1.5], ["Black-and-white figure from behind · portrait", 0.75],
    ["Sunset over the sea · Landscape", 1.6], ["People on the street · daytime · landscape", 1.4], ["Sandy field and sky · overcast · landscape", 1.5], ["Two people in uniform · white wall · portrait", 0.8],
    ["Above the pool · Blue water · Square", 1], ["Person in forest · green tones · portrait", 0.75], ["Phone in hand · indoors · landscape", 1.4], ["Mountain ridge · B&W · Landscape", 1.6],
  ];
  const box = document.querySelector("[data-ov]");
  if (!box) return;
  // The first two cells (3rd and 8th) of the center column are left empty so the name in the Hero isn’t covered by photos — original infinity-item--skip. Empty cells aren’t cloned
  const SKIP = new Set([2, 7]);
  let n = 0;
  box.innerHTML = Array.from({ length: 32 }, (_, i) => {
    if (SKIP.has(i)) return `<div class="ov-item is-skip" aria-hidden="true"></div>`;
    const [label, ar] = shots[n++ % shots.length];
    return `<div class="ov-item" data-fx-part="item"><a class="ov-media" data-fx-part="media" href="detail.html"><span class="wf-img gc-ph" style="--ar: ${ar}" data-label="${label}"></span></a></div>`;
  }).join("");
  const originals = [...box.children].filter((el) => !el.classList.contains("is-skip"));
  addEventListener("scroll", () => {
    if (box.offsetTop + box.scrollHeight - (scrollY + innerHeight) <= 500) originals.forEach((n) => box.append(n.cloneNode(true)));
  }, { passive: true });
})();
