// Home — stamps out the repeating product cells, color panels and lineup end row here, and adds parallax to the wide photo strip.
(() => {
  const pad = (n) => String(n).padStart(2, "0");

  // Two-column product grid — each cell holds two photos (rise-swap-hover covers the next one rising from below each time the pointer enters)
  const grid = document.querySelector("[data-grid]");
  const KINDS = ["Large plate", "Small plate", "Big bowl", "Middle container", "Chopsticks", "Spoon", "Gift box set (large bowl)", "Gift box set (medium bowl)", "Large cup", "Small cup", "Fork", "Small fork", "Small spoon", "Two small plates"];
  if (grid) grid.innerHTML = KINDS.map((k, i) => `
    <a class="mw-card" href="product.html" data-fx="rise-swap-hover">
      <div class="mw-card__frame" data-fx-part="frame">
        <div data-fx-part="photo"><div class="wf-img" data-label="${k} Cutout · light gray floor · Landscape 3:2"></div></div>
        <div data-fx-part="photo"><div class="wf-img" data-label="Same ${k} Different color · slanted angle · landscape 3:2"></div></div>
      </div>
      <div class="mw-card__cap"><p data-label="Product English name">Product ${pad(i + 1)}</p><p class="mw-card__price">KRW 00,000<span class="mw-card__tax">(Tax excluded)</span></p></div>
    </a>`).join("");

  // Color panels — an empty window (the landscape shows through) and a product panel alternate, seven sets. The landscape overlaps at screen width behind the line
  const track = document.querySelector("[data-color-track]");
  const SCENES = ["Mountain and factory chimneys · blue sky at dusk", "Clear spring water bed · teal ripples from above", "Stacked old pine bark · warm yellow light", "Cherry blossom branch in full bloom · Clear sky", "Hardened lava rock · dark grey-black", "Pile of dried small anchovies · white grain", "Winding tea fields · deep green"];
  const SURFACE = ["Deep Navy", "Teal Navy", "Old pine yellow", "Cherry blossom pink", "Lava Ink Black", "Baby anchovy gray-white", "Tea field green"];
  const MODELS = Array.from({ length: 10 }, (_, i) => `<li>Model ${pad(i + 1)}</li>`).join("");
  if (track) {
    const wins = SCENES.map((s, i) => `
      <div class="mw-win" data-fx-part="window">
        <div class="wf-img mw-win__img" data-label="${s} · Full-width landscape photo (portrait crop on phones)"></div>
        <p class="mw-win__name"><small>Color:</small> <span data-label="Color English Name">Color ${pad(i + 1)}</span></p>
      </div>`).join("");
    const items = SURFACE.map((s, i) => `
      <div class="mw-gap" data-fx-part="item" aria-hidden="true"></div>
      <div class="mw-slide" data-fx-part="item">
        <div class="wf-img mw-slide__img" data-label="${s} Bowls and spoons · floor and wall in the same color · fills the frame"></div>
        <div class="mw-slide__label"><small>Color:</small><p data-label="Color English Name">Color ${pad(i + 1)}</p><small>Model:</small><ul>${MODELS}</ul></div>
      </div>`).join("");
    track.insertAdjacentHTML("beforeend", wins + items);
  }

  // Last row of the lineup — same item as the first row
  const copy = document.querySelector("[data-lineup-copy]");
  const first = document.querySelector("[data-lineup]");
  if (copy && first) copy.innerHTML = first.innerHTML;

  // Wide photo strip — original .para: lowers the photo by (scroll − (strip position − screen height)) / 10
  const band = document.querySelector("[data-band]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  if (band && !reduce.matches) {
    const host = band.parentElement;
    const move = () => {
      const site = host.getBoundingClientRect().top + scrollY - innerHeight;
      band.style.transform = `scale(1) translateY(${(scrollY - site) / 10}px)`;
    };
    addEventListener("scroll", move, { passive: true });
    addEventListener("resize", move);
    move();
  }
})();
