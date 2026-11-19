// Stamps out store cells from a few lines of data — dozens of cards of the same type, so they aren’t repeated in HTML. Runs before shared.js (float-in·add to cart)
(() => {
  const tpl = document.getElementById("s-card");
  if (!tpl) return;
  const P = (t, label, o = {}) => ({ t, label, size: "18 × 18 cm", also: "40 × 40 cm · 80 × 80 cm also available", price: "000 €", ...o });
  const DATA = {
    photo: [
      P("Series Name. Place 01", "Embroidered city scene on a palm · clear daytime · 1:1", { isNew: true }),
      P("Series Name. Place 02", "Embroidered castle wall on a palm · overcast sky · 1:1", { sold: true }),
      P("Series Name. Place 03", "Embroidered plaza on a palm · Afternoon light · 1:1"),
      P("Series Name. Place 04", "Embroidered monastery on a palm · blue sky · 1:1"),
      P("Series Name. Place 05", "Embroidered palace on a palm · Clear day · 1:1"),
      P("Series Name. Place 06", "Embroidered tower on a palm · Mist · 1:1", { sold: true }),
      P("Series Name. Place 07", "Embroidered hill on a palm · Overcast day · 1:1"),
      P("Series Name. Place 08", "Embroidered lighthouse on a palm · sea · 1:1"),
    ],
    stitch: [
      P("Title One", "Dark hand · white background · 1:1", { also: "" }),
      P("Title Two", "Hand holding a leaf · White background · 1:1", { also: "" }),
      P("Title Three", "Two hands tied with string · white background · 1:1", { also: "" }),
      P("Title Four", "Hand holding soil · white background · 1:1", { also: "" }),
    ],
    wear: [
      P("Hoodie “Name” Black", "Black hoodie back print · person wearing it, rear view · 1:1", { size: "S · M · L · XL", also: "", price: "00 €" }),
      P("Hoodie “Name” Green", "Green hoodie back print · person wearing it, seen from behind · 1:1", { size: "S · M · L · XL", also: "", price: "00 €" }),
      P("T-shirt “Name”", "White T-shirt front print · person wearing it, front view · 1:1", { size: "S · M · L · XL", also: "", price: "00 €" }),
      P("T-shirt “Hand”", "Hand-drawn white T-shirt · hanger · 1:1", { size: "S · M · L · XL", also: "", price: "00 €" }),
    ],
    music: [
      P("Album Title: · Signed CD", "Album 1 cover and CD · dark background · 1:1", { size: "CD digipak", also: "", price: "00 €", isNew: true }),
      P("Album Two · CD", "Album 2 pink cover and CD · 1:1", { size: "CD digipak", also: "", price: "00 €" }),
      P("The Two-Album Bundle", "CD digipak, two discs · light pink background · 1:1", { size: "Two CDs", also: "", price: "00 €" }),
    ],
  };
  document.querySelectorAll("[data-products]").forEach((grid) => {
    (DATA[grid.dataset.products] || []).forEach((p) => {
      const n = tpl.content.cloneNode(true);
      const q = (s) => n.querySelector(s);
      q(".s-card__t").textContent = p.t;
      q(".wf-img").dataset.label = p.label;
      q(".s-card__size").textContent = p.size;
      if (p.also) q(".s-card__also").textContent = p.also; else q(".s-card__also").remove();
      if (!p.isNew) q(".s-card__new").remove();
      if (p.sold) {
        q(".s-card__img").classList.add("is-sold");
        q(".s-card__price").innerHTML = '<span class="s-card__out">Sold out</span>';
        const b = q(".s-card__btn"); b.removeAttribute("data-add"); b.classList.add("s-card__btn--line"); b.textContent = "Please let us know if you retake it";
      } else q(".s-card__price").innerHTML = `<b>${p.price}</b>`;
      grid.append(n);
    });
  });
})();
