// Product cell strip (shared by list and detail): draws the cells, and on hover the background becomes the product color · cell .96 · 2° · bottle 1.1 · 4°, and that product’s 9 fruits fall with gravity 3.5.
// On leaving, physics stops and the stage blurs out in .4s, then is cleared after 400ms (original ProductSliderItem values).
(() => {
  const AG = window.AG;
  const P = AG.PRODUCTS;
  document.querySelectorAll(".slider[data-products]").forEach((slider) => {
    const ids = slider.dataset.products.split(",").map(Number);
    slider.innerHTML = `<div class="slider__track">${ids.map((k) => `
      <article class="slide" style="--slide-bg:${P[k].bg}" data-k="${k}" aria-label="${P[k].name}">
        <div class="slide__stage"></div>
        <figure class="slide__jar" data-label="Product cutout · glass bottle front view · transparent background, centered in the cell">${AG.jarSVG(P[k])}</figure>
        <a class="slide__link" href="detail.html" data-k="${k}" aria-label="${P[k].name} View"></a>
      </article>`).join("")}</div>`;
  });

  document.querySelectorAll(".slide").forEach((slide) => {
    const stage = slide.querySelector(".slide__stage");
    const f = AG.FRUITS[P[+slide.dataset.k].fruit];
    let sim = null, clear = 0;
    slide.addEventListener("mouseenter", () => {
      if (!AG.fine()) return;
      clearTimeout(clear);
      slide.classList.add("is-active");
      AG.cursor.show("Go to products");
      sim?.destroy();
      stage.innerHTML = Array.from({ length: 9 }, () => `<div class="ag-fruit" data-fruit="${AG.FRUITS.indexOf(f)}" style="aspect-ratio:${f.ratio || 1}">${AG.fruitSVG(f)}</div>`).join("");
      stage.classList.add("is-ready");
      if (!AG.reduced) sim = AG.dropFruits(stage, { gravity: 3.5 });
    });
    slide.addEventListener("mouseleave", () => {
      slide.classList.remove("is-active");
      AG.cursor.hide();
      // Like the original, the moment physics is removed the stage blurs over .4s (ready off), and the fruit is cleared 400ms after it has fully blurred
      sim?.destroy(); sim = null;
      stage.classList.remove("is-ready");
      clear = setTimeout(() => { stage.innerHTML = ""; }, 400);
    });
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest(".slide__link");
    if (a) sessionStorage.setItem("ag-jar", a.dataset.k);
  }, true);
})();
