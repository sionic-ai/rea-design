// Work placeholder data — draws the card set, hero loop, extended work list and logo strip here (runs before shared.js).
// Photo labels describe what the original photo was (subject · light · composition) — so whoever pulls them out picks photos of the same feel
(() => {
  const KIND = { agency: ["Commissioned Work", "case"], client: ["Customer work", "person"], personal: ["Personal Work", "spark"] };
  const WORKS = [
    { t: "Work name 1", k: "personal", tags: ["Product Design", "Branding", "Screen design", "Development"], ind: "Technology", shots: ["Laptop screen mockup · on a white rock · clear sky · front view", "Product screen close-up · dark red background", "Shot of phone in hand · indoor natural light"] },
    { t: "Work name 2", k: "personal", tags: ["Product Design", "Screen design", "Development"], ind: "Sports", shots: ["Phone and climbing gear · top-down view of the floor · shade", "Three app screens side by side · white background", "Phone in hand · climbing gym background"] },
    { t: "Work name 3", k: "client", tags: ["Branding", "Logo design", "Visual Identity"], ind: "Manufacturing", shots: ["White metal logo sculpture · gray floor · angled light", "Logo-embroidered cap · black fabric · front view", "Logo on back of reflective vest · black background"] },
    { t: "Work name 4", k: "agency", tags: ["Screen design", "Web design", "Information structure"], ind: "Technology", shots: ["Subway platform ad board · front view · fluorescent light", "Laptop screen · on white stand · bright interior", "Phone screen mockup · Gray background"] },
    { t: "Work name 5", k: "agency", tags: ["Screen design", "Illustration", "Web design", "Visual System"], ind: "Finance", shots: ["Screen cards hanging from a tree · blue sky · looking-up angle", "Card illustration set · white background", "Dashboard screen · laptop front view"] },
    { t: "Work name 6", k: "agency", tags: ["Online store", "Screen design", "Usage flow"], ind: "Design", shots: ["Black box packaging · Dark background · From above", "Product screen mockup · On red fabric", "Single packaged item shot · black background"] },
    { t: "Work name 7", k: "agency", tags: ["Product Design", "Screen design", "Information structure", "Development"], ind: "Publishing", shots: ["Laptop on a red velvet chair · indoors · angled", "App list screen · White background", "Laptop on a desk · Top view"] },
    { t: "Work name 8", k: "client", tags: ["Web design", "Development", "Motion design"], ind: "Culture", shots: ["Laptop on grass · white flowers · midday", "Performance poster screen · black background", "Phone screen · on the grass"] },
    { t: "Work name 9", k: "personal", tags: ["Product Design", "Screen design", "Development"], ind: "Sports", shots: ["Phone in hand · climbing wall holds background · red light", "App screens two · Gray background", "Climbing gear close-up"] },
    { t: "Work name 10", k: "agency", tags: ["Screen design", "Branding"], ind: "Technology", shots: ["Laptop screen mockup · concrete floor", "Logo close-up · White background", "Shot of two overlapping phones"] },
    { t: "Work name 11", k: "client", tags: ["Web design", "Screen design"], ind: "Culture", shots: ["White wall with a painting · screen mockup · soft light", "Work list screen · White background", "Phone screen · hand-held shot"] },
  ];
  window.EE_WORKS = WORKS;
  const tag = (k, cls = "") => `<span class="ee-kind ${cls}" data-kind="${k}"><span data-px-icon="${KIND[k][1]}"></span>${KIND[k][0]}</span>`;
  const card = (w, i, delay, wide) => `
    <a class="ee-card" href="detail.html" data-cursor="View case" data-delay="${delay}"${wide ? " data-wide" : ""} data-industry="${w.ind}">
      <div class="ee-card__media" data-reveal="image" data-delay="${delay}"><div class="ee-card__frame">
        ${w.shots.map((s, n) => `<div class="ee-card__layer"${n ? "" : " data-active"}><span class="wf-img" data-label="${s}"></span></div>`).join("")}
        ${tag(w.k, "ee-card__tag")}
      </div></div>
      <div class="ee-card__content" data-reveal><p class="ee-card__title"><span>${w.t}</span></p><ul class="ee-tags">${w.tags.map((t) => `<li>${t}</li>`).join("")}</ul></div>
    </a>`;
  window.EE_CARD = card;

  document.querySelectorAll("[data-cards]").forEach((box) => {
    const kind = box.dataset.cards;
    if (kind === "featured") box.innerHTML = WORKS.slice(0, 5).map((w, i) => card(w, i, (i < 2 ? i : (i - 2) % 3) * 0.12, i === 0)).join("");
    else if (kind === "all") box.innerHTML = WORKS.map((w, i) => card(w, i, (i % 3) * 0.12, false)).join("");
    else if (kind === "other") box.innerHTML = WORKS.slice(3).concat(WORKS.slice(0, 3)).map((w, i) => `<div class="ee-other__item">${card(w, i, 0, false)}</div>`).join("");
  });

  // Hero ring — 18 cards, shuffled on every open (the original also shuffles 18 each time)
  const ring = document.querySelector(".ee-hero__track");
  if (ring) {
    const shots = WORKS.flatMap((w) => w.shots.map((s) => s.split(" · ")[0]));
    for (let i = shots.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shots[i], shots[j]] = [shots[j], shots[i]]; }
    ring.innerHTML = shots.slice(0, 18).map((s) => `<a class="ee-orbit-card" data-fx-part="card" href="detail.html" data-cursor="View case" tabindex="-1" draggable="false"><span class="ee-orbit-card__face" data-fx-part="face"><span class="wf-img" data-label="${s}"></span></span></a>`).join("");
  }

  // More Work — one preview panel per row (different ratios)
  const list = document.querySelector(".ee-project-list");
  if (list) {
    const rows = [
      ["Work name 12", "agency", "One-line description. An internal management tool for a real estate company.", "Design system expansion, screen design", "Office screen mockup · laptop on a desk · landscape 4:3", 4 / 3],
      ["Work name 13", "client", "A one-line description here. The first online portfolio centered on illustration.", "Web design, screen design", "Photo of an oil painting · white wall · portrait 3:4", 3 / 4],
      ["Work name 14", "agency", "Put a two-line description here. A full site overhaul including the landing page and custom element frames.", "Web design, site builder development, project lead", "Roof construction site · sky · landscape 16:9", 16 / 9],
      ["Work name 15", "client", "Your two-line description here. A video, audio and press-kit portfolio for an actor and singer.", "Web design, information architecture", "Person on stage · lighting · vertical video 9:16", 9 / 16],
      ["Work name 16", "agency", "One-line description. An online shop for eco-friendly heating products.", "Project lead, UI design, online store", "Heating appliance product shot · white background · square", 1],
      ["Work name 17", "client", "Your one-line description here. A new website that makes booking classes easy.", "Web design, user flow, booking integration", "Fitness studio interior · window light · landscape 3:2", 3 / 2],
      ["Work name 18", "agency", "Add a one-line description here. Online portfolio of an international quality consulting firm.", "Screen design, branding", "Person in a meeting room · soft light · landscape 4:3", 4 / 3],
    ];
    list.innerHTML = rows.map(([t, k, d, s]) => `<li class="ee-project" data-reveal="fade"><div class="ee-project__heading"><h3 class="ee-project__title">${t}</h3>${tag(k, "ee-project__tag")}</div><div class="ee-project__meta"><p>${d}</p><p class="ee-project__services">${s}</p></div></li>`).join("");
    document.querySelector(".ee-preview__frame").innerHTML = rows.map(([, , , , label, r]) => `<div class="ee-preview__layer" data-ratio="${r}"><span class="wf-img" data-label="${label}"></span></div>`).join("");
  }

  // Logo strip — four rows on the same line (the last three hidden from reading tools), one pass in 36s (-25%)
  const logos = document.querySelector(".ee-logos__track");
  if (logos) {
    const w = [168, 110, 160, 132, 74, 157];
    const row = (hide) => `<ul class="ee-logos__row"${hide ? ' aria-hidden="true"' : ""}>${w.map((x, i) => `<li><span class="wf-logo ee-logo" style="width:${x}px">Logo ${i + 1}</span></li>`).join("")}</ul>`;
    logos.innerHTML = [0, 1, 2, 3].map((i) => row(i > 0)).join("");
  }

  // Now-playing waveform — 18 bars rise and fall, each with its own length and delay
  const wave = document.querySelector(".ee-now__wave");
  if (wave) wave.innerHTML = Array.from({ length: 18 }, () => `<span style="--d:${(0.45 + Math.random() * 0.6).toFixed(2)}s;--o:${(-Math.random()).toFixed(2)}s"></span>`).join("");
})();
