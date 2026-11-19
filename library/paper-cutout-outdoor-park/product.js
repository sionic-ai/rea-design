// Shop·rental: fills the tree icons·product slots·photo slider, and moves the center slider and side sliders together.
// Original values: Splide speed 800 · cubic-bezier(.73,.16,.3,.98) · the center is the slide point, the sides follow without arrows · the full view window is <dialog>
(() => {
  const tree = '<svg viewBox="0 0 20 30" aria-hidden="true"><path class="tr" d="M10 2 2 16h4l-4 8h16l-4-8h4z"/><path class="tr2" d="M9 24h2v5H9z"/></svg>';
  document.querySelectorAll("[data-tree]").forEach((el) => (el.innerHTML = tree.replace('class="tr"', 'class="tr2"') + tree + tree.replace('class="tr"', 'class="tr2"')));

  const goods = {
    pick: [["A bundle of firewood", "Firewood bundle · cutout"], ["A box of charcoal", "Charcoal Box · Cutout"], ["Kindling", "Fire starter bag · cutout"], ["Gas tank", "Gas tank · cutout"], ["One bag of ice", "Ice bag · cutout"], ["Mosquito coil", "Mosquito coil box · Cutout"], ["Gloves", "Work gloves · cutout"], ["Paper Plate", "Paper plate bundle · cutout"]],
    set: [["Tent", "Tent · Cutout"], ["Shade canopy", "Shade Canopy · Cutout"], ["Sleeping bag", "Sleeping bag · Cutout"], ["Mat", "Matte · Cutout"], ["Table", "Folding table · Cutout"], ["Chair", "Folding chair · Cutout"], ["Lamplight", "Lantern / cutout"], ["Brazier", "Brazier · Cutout"]],
    rent: [["Your tent name here", "Dome tent · cutout"], ["Your sleeping bag name here", "Sleeping bag · Cutout"], ["Your lantern name here", "Gas Lamp · Cutout"], ["Your frontline name here", "Electric extension reel · cutout"], ["Your stake name here", "Forged stake bundle · cutout"], ["Your windbreaker name here", "Windbreak panel · cutout"]],
    free: [["Your item name here", "Umbrella · Cutout"], ["Your item name here", "Phone charger · cutout"], ["Your item name here", "Board game · cutout"], ["Your item name here", "Blanket · cutout"]],
  };
  const card = ([name, ph], kind) => `<li class="sp-goods__item"><figure class="sp-goods__img gp-ph"><div class="wf-img" data-label="${ph}"></div></figure><p class="sp-goods__name">${name}</p>${
    kind === "set" ? "" : `<p class="sp-goods__price gp-en">${kind === "free" ? "FREE" : "0,000 won"}<small>${kind === "rent" ? " / 1 night" : ""}</small></p>`}${
    kind === "rent" ? '<p class="sp-goods__txt">Two lines on size and how to use go here.</p>' : ""}</li>`;
  document.querySelectorAll("[data-goods]").forEach((ul) => (ul.innerHTML = goods[ul.dataset.goods].map((g) => card(g, ul.dataset.goods)).join("")));

  const shots = ["Reception exterior front · daytime", "Display shelf inside reception · interior", "Eaves with stacked firewood · Day", "Staff guiding visitors · indoors", "Parking lot in front of reception · daytime"];
  ["l", "m", "r"].forEach((k) => {
    document.querySelector(`[data-slides="${k}"]`).innerHTML = shots.map((s) => `<li class="splide__slide"><div class="sp-slider__img gp-ph"><div class="wf-img" data-label="${s} · Landscape 4:3"></div></div></li>`).join("");
  });
  const arrowPath = "M30.1367 21.3281C30.8398 20.6249 30.8398 19.4531 30.1367 18.7499L14.9805 3.51556C14.1992 2.81244 13.0273 2.81244 12.3242 3.51556L10.5273 5.31244C9.82422 6.01556 9.82422 7.18744 10.5273 7.96869L22.5586 19.9999L10.5273 32.1093C9.82422 32.8906 9.82422 34.0624 10.5273 34.7656L12.3242 36.5624C13.0273 37.2656 14.1992 37.2656 14.9805 36.5624L30.1367 21.3281Z";
  const ease = "cubic-bezier(.73,.16,.3,.98)";
  const base = { type: "loop", speed: 800, focus: "center", trimSpace: false, updateOnMove: true, flickPower: 200, waitForTransition: true, easing: ease, arrowPath };
  const main = new Splide(".sp-slider__main", { ...base, pagination: true, paginationKeyboard: false, arrows: true });
  const left = new Splide('[data-side="l"]', { ...base, arrows: false, pagination: false, drag: false });
  const right = new Splide('[data-side="r"]', { ...base, arrows: false, pagination: false, drag: false });
  const mainEl = document.querySelector(".sp-slider__main");
  main.on("move", (n, prev, dest) => mainEl.classList.toggle("is-r2l", prev > dest));
  main.sync(left); main.sync(right);
  left.mount(); right.mount();
  // Sides shift by one slot to show the photos in front and behind
  left.go(shots.length - 1); right.go(1);
  main.mount();

  document.querySelectorAll("[data-modal]").forEach((b) => b.addEventListener("click", () => document.getElementById(b.dataset.modal).showModal()));
  document.querySelectorAll(".sp-modal").forEach((m) => {
    m.querySelector(".sp-close").addEventListener("click", () => m.close());
    m.addEventListener("click", (e) => { if (!e.target.closest(".sp-modal__inner")) m.close(); });
  });
})();
