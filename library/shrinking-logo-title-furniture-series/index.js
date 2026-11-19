// Home: stamps out the recurring photo panels (slider sections · side panels) and the product detail table · drawing. Motion is attached by parts (tap-wipe-slider etc.).
(() => {
  document.querySelectorAll("[data-slides]").forEach((box) => {
    const [n, label] = box.dataset.slides.split("|");
    box.innerHTML = Array.from({ length: +n }, (_, i) => `<div data-fx-part="slide"><div data-fx-part="media"><div class="wf-img" data-label="${label} · ${i + 1}/${n}"></div></div></div>`).join("");
  });
  // The side panel shows the section after the current one first (original sub is 2…n, 1 order)
  document.querySelectorAll("[data-sub-slides]").forEach((box) => {
    const [n, label] = box.dataset.subSlides.split("|");
    box.innerHTML = Array.from({ length: +n }, (_, i) => `<div data-fx-part="sub-slide"><div data-fx-part="sub-media"><div class="wf-img" data-label="${label} · ${((i + 1) % +n) + 1}/${n}"></div></div></div>`).join("");
  });

  const row = (label, body) => `<li class="px-details__item"><p class="px-details__label">${label}</p><div class="px-details__body">${body}</div></li>`;
  const subs = (title, pairs) => `<p class="px-details__body-label">${title}</p>${pairs.map(([k, v]) => `<dl class="px-details__sub"><dt>${k}</dt><dd>${v}</dd></dl>`).join("")}`;
  const NOTE = "Add a one-line test certification here.</p><p>Put a note here that photo colors may differ from the real product. Write about eight lines: a caution not to stand on the chair or lean on it and shake it, the danger of using it for anything other than sitting, that with long use the joint screws may loosen or wobble and need occasional tightening, how to care for it, and where to send inquiries.";
  // Drawings are our own line art — thin lines and dimension marks in square cells like the original slot
  const CHAIR = `<svg viewBox="0 0 200 200" aria-label="Chair Line Drawing"><path d="M52 150 L60 70 L132 58 L148 140"/><path d="M60 70 L58 112 L140 104"/><path d="M48 116 L150 106 L156 118 L52 128 Z"/><path d="M60 128 L56 168 M146 120 L150 160 M70 126 L74 170 M138 118 L134 158"/><path d="M40 112 L40 166 M36 112 h8 M36 166 h8"/><path d="M60 46 L132 34 M60 42 v8 M132 30 v8"/><path d="M162 58 L168 140 M158 58 h8 M164 140 h8"/><text x="92" y="36">750</text><text x="20" y="142">410</text><text x="170" y="100">745</text></svg>`;
  const TABLE = `<svg viewBox="0 0 200 200" aria-label="Side table line drawing"><path d="M62 70 L120 58 L150 72 L92 84 Z"/><path d="M92 84 L92 92 M62 70 L62 78 L92 92 L150 80 L150 72"/><path d="M80 90 L84 162 M100 90 L100 168 M128 82 L126 160 M114 88 L116 164"/><path d="M84 162 L100 168 L126 160"/><path d="M48 70 L48 166 M44 70 h8 M44 166 h8"/><path d="M62 50 L120 38 M62 46 v8 M120 34 v8"/><path d="M128 44 L158 58 M126 40 l4 8 M156 54 l4 8"/><text x="84" y="40">380</text><text x="144" y="44">450</text><text x="28" y="122">550</text></svg>`;
  const DETAILS = {
    chair: [
      row("Size", "W000×D000×H000×SH000"),
      row("Material", subs("Chair", [["Seat surface", "Fabric"], ["Tree", "Solid oak, molded beech plywood"], ["Adjustable Foot", "Steel"]]) + `<div style="height:1.5em"></div>` + subs("Armrest", [["Tree", "Solid oak"], ["Connection", "Steel"]])),
      row("Deadline", subs("Model A", [["Seat surface", "Your fabric name here"], ["Tree", "Urethane finish (oak)"], ["Armrest", "Play the piano"], ["Adjustable Foot", "Chrome Plating"]]) + `<div style="height:1.5em"></div>` + subs("Model B", [["Seat surface", "Your fabric name here"], ["Tree", "Urethane coating (beech)"], ["Armrest", "Urethane Coating"], ["Adjustable Foot", "Chrome Plating"]])),
      row("Weight", "00.0kg"),
      row("Notes", `<p>${NOTE}</p>`),
    ],
    table: [
      row("Size", "W000×D000×H000"),
      row("Material", subs("Side table", [["Tree", "Solid oak or acrylic"], ["Connection", "Steel"]])),
      row("Deadline", subs("Side table", [["Tree", "Urethane coating or acrylic"], ["Connection", "Chrome Plating"]])),
      row("Weight", "00.0kg (acrylic 00.0kg)"),
      row("Notes", `<p>${NOTE}</p>`),
    ],
  };
  document.querySelectorAll("[data-details]").forEach((box) => {
    const k = box.dataset.details;
    box.innerHTML = `<h2 class="px-label">(Product Details)</h2><ul class="px-details__items">${DETAILS[k].join("")}</ul><figure class="px-details__fig" data-label="Product front and side dimension line drawing">${k === "chair" ? CHAIR : TABLE}</figure>`;
  });
})();
