// Home page rendering — runs before the rest so shared.js’s reveal, parallax and text splitting hook in. Motion lives in index-run.js
(() => {
  const fish = (label) => `<svg class="ks-fish" viewBox="0 0 200 100" role="img" aria-label="${label}"><path d="M10 50c30-38 100-44 140-10l40-26-12 36 12 36-40-26C110 94 40 88 10 50z"/><circle class="eye" cx="42" cy="44" r="6"/></svg>`;
  const animal = (cls, label, d) => `<svg class="ks-animal" viewBox="0 0 200 160" role="img" aria-label="${label}"><path d="${d}"/></svg>`;
  const bubble = '<svg class="ks-bubble" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48"/><path d="M24 40a28 28 0 0 1 16-18"/></svg>';
  const pass = '<span class="ico"><span class="ks-pass" data-fx="arrow-pass-hover" data-fx-arrow-pass-hover="look: slide"><svg viewBox="-12 -12 36 36" aria-hidden="true"><path d="M1.5 5.3h6.6L5.6 2.8l1-1L10.8 6l-4.2 4.2-1-1 2.5-2.5H1.5z"/></svg><svg viewBox="-12 -12 36 36" aria-hidden="true"><path d="M1.5 5.3h6.6L5.6 2.8l1-1L10.8 6l-4.2 4.2-1-1 2.5-2.5H1.5z"/></svg></span></span>';

  // Twelve hero fish and animals (original positions and sizes — photo cutout spots are silhouettes)
  const objs = [
    ["fish -i01 load-first", "Cutout of a large fish such as an arapaima · facing left"], ["fish -i02 load-first", "Large silver fish cutout"], ["fish -i03 load-first", "Piranha cutout"],
    ["fish -i04 load-last", "Silver Arowana Cutout"], ["fish -i05 load-last", "Small tropical fish cutout"], ["fish -i06 load-last", "Yellow tropical fish cutout"],
    ["fish -i07 load-last", "Small silver fish cutout"], ["fish -i08 load-last", "Striped small fish cutout"], ["fish -i09 load-last", "Black-striped fish cutout"],
  ];
  document.querySelector(".ks-kv__objs").innerHTML =
    objs.map(([c, l]) => `<div class="obj ${c}"><span class="obj__in">${fish(l)}</span></div>`).join("") +
    `<div class="obj cameleon load-last"><span class="obj__in">${animal("cameleon", "Chameleon cutout · on the lower right branch", "M20 120c20-50 70-70 120-60 30 6 50 30 40 50-8 16-30 14-34 0 10-6 4-20-10-22-30-4-50 14-60 40z")}</span></div>` +
    `<div class="obj cat load-last"><span class="obj__in">${animal("cat", "Leaping cat cutout · bottom left", "M30 110c10-30 40-50 80-46l20-24 6 26c20 6 34 22 30 40-30 6-60 4-90-6-14 18-34 20-46 10z")}</span></div>` +
    `<div class="obj rabbit load-last"><span class="obj__in">${animal("rabbit", "White rabbit cutout · bottom", "M50 140c-20-30 0-70 40-70l-6-50 20 46 10-46 6 50c36 6 50 40 30 70z")}</span></div>`;

  document.querySelectorAll(".ks-intro__bubble .js-parallax").forEach((e) => (e.innerHTML = bubble));
  document.querySelector(".ks-intro__fish .js-parallax").innerHTML = fish("Small tropical fish cutout · bottom left");

  // Six feature cards
  const cards = [
    ["Student learning on-site practice · in front of a tank · square", "<em>Hands-on fieldwork</em>Lesson time!<br>The feel sticks to your body", "low-rotate"],
    ["Various creatures · aquarium photo · square", "Fish, animals, even insects!<br><em>000 types</em>Meet the Creatures of", "low-rotate"],
    ["Dolphin and trainer · square", "<em>Special Training</em>Object marker<br>In every course!", "low-rotate"],
    ["Online class screen with student · square", "<em>Online also available</em>With<br>Easy to get around", "low-y"],
    ["Calendar and bag · square", "Fit to your life<br><em>2 / 3 / 5 days per week course</em> Choose!", "low-y"],
    ["Graduate working at an aquarium · square", "<em>Aquarium · Zoo</em>Works at!<br>Industry job placement support", "low-rotate"],
  ];
  document.getElementById("ks-cards").innerHTML = cards
    .map(([l, t, o], i) => `<li><div class="base1 -delay${i}"><div class="ks-card">
      <div class="ks-card__index">0${i + 1}</div>
      <figure class="ks-card__img"><span class="wf-img" data-label="${l}"></span></figure>
      <div class="ks-card__text"><p class="ks-card__title">${t}</p><p class="ks-card__body">Your three-line feature description here. The story of learning directly in the field and gaining a wider view.</p></div>
      <div class="ks-card__obj -${o}">${bubble}</div>
    </div></div></li>`)
    .join("");

  // Four course plates (one grid row each, the inside of the plate sits under the title)
  const courses = [
    ["Faculty 1", "Learn at your own pace with unique creatures!", "A program where you gain a deep understanding of living creatures through aquarium practice and online study, and earn a graduation qualification.", "Student smiling and pointing at a fish tank · bright tank in front · landscape 2:1", [["Major 1", ["3-year program"]], ["Major 2", ["3-year program"]]]],
    ["Faculty 2", "Ready to work right away through specialized practice and research", "A compressed 2-year course. Trains biology specialists through practice and research.", "Instructor and student holding a lizard · Inside an aquarium · Landscape 2:1", [["Major 1", ["2-year program"]], ["Major 2", ["2-year program"]]]],
    ["Faculty 3", "Find a new path in half a year, alongside your work!", "A half-year course for adults who want to study at an aquarium. Learn animal knowledge systematically.", "Instructor in front of the giraffe enclosure · blue lighting · landscape 2:1", [["Major 1", ["Half-year system"]]]],
    ["Special Training", "Dream of becoming a trainer, even with no experience!", "A short intensive course you can learn without strain. Online options also help you earn the qualification.", "Two dolphins and a trainer · outdoor pool · landscape 2:1", []],
  ];
  document.querySelector(".ks-course__grid").insertAdjacentHTML(
    "beforeend",
    courses
      .map(([t, copy, text, l, items], i) => `<div class="ks-course__panel -p${i + 1}">
        <div class="ks-course__inner" data-fx-part="item">
          <div class="ks-panel js-anim"><a href="#" class="ks-panel__link">
            <div class="ks-panel__img"><div class="ks-panel__bg"><span class="wf-img" data-label="${l}"></span></div></div>
            <div class="ks-panel__text">
              <p class="ks-panel__copy">${copy}</p>
              <h3 class="ks-panel__title"><span class="text">${t}</span>${pass.replace('class="ico"', 'class="arrow ico"')}</h3>
              <p class="ks-panel__body">${text}</p>
              ${items.length ? `<div class="ks-panel__courses">${items.map(([n, labels]) => `<div class="ks-panel__item"><span>${n}</span><ul class="labels">${labels.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
            </div>
          </a></div>
        </div>
      </div>`)
      .join(""),
  );

  // Creature guide cards, five of them (two tilted picture stacks behind)
  const creatures = ["Capybara face, front view", "Arowana side profile", "Chameleon close-up", "Owl, front view", "Jellyfish swarm"];
  document.querySelector(".ks-book__swiper .swiper-wrapper").innerHTML =
    `<div class="ks-book__bubble -b1">${bubble}</div><div class="ks-book__bubble -b2">${bubble}</div>` +
    creatures.map((c) => `<div class="swiper-slide"><div class="card-wrapper"><div class="card"><span class="wf-img" data-label="${c} · Catalog card · Portrait 3:4"></span><span class="card__name">Your organism name here</span></div></div></div>`).join("");
  document.querySelector('[data-slot="book-btn"]').innerHTML = `<div class="ks-btn"><a href="#"><span class="text">Browse the creature guide</span>${pass}</a></div>`;

  // SNS: twelve photos + four link cards
  document.querySelector(".ks-sns__grid").innerHTML = Array.from({ length: 12 }, (_, i) => `<li><a href="#"><span class="wf-img wf-r-1x1" data-label="School event poster ${i + 1} · Square"></span></a></li>`).join("");
  const links = [["X", "Follow us and catch the latest news!", "@example"], ["LINE", "Easy consultation and questions through chat!", "Booking events is easy too!"], ["TikTok", "See the school in video!", "@example"], ["YouTube", "Class and event scenes on video!", "@example"]];
  document.querySelector(".ks-sns__links").innerHTML = links
    .map(([n, c, t]) => `<div class="ks-sns__item"><h3 class="ks-sns__label">${n} Official Account</h3><a class="ks-sns__card" href="#"><span class="ks-sns__icon">${n.slice(0, 2)}</span><span class="ks-sns__txt"><b>${c}</b><span>${t}</span></span>${pass}</a></div>`)
    .join("");
})();
