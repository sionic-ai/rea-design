// Facility tour: fills the drawing board, cards, photos and starry night, and wires up lift, drag and starry-night open/close.
// Original values: on lift the panel goes .5× and transparent → 1× over 2s power1.inOut, then drag turns on (drag-pan-map part, edge 1, arrow 100px .2s power2.out)
// · cards show when they enter the canvas window (.3s, bounce cubic-bezier(.33,1.7,.81,.79) .4s) · starry night: button to center in .6s power1.inOut,
// remaining .4s blur (.2s late), panel 2x .8s power1.out, mask 200% 1s power1.out (.7s overlap) · close: star panel 1.5x 1s, mask 0 .6s (.2s late)
(() => {
  const isPc = innerWidth > 767;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chev = window.GP.chev;
  const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

  // Field picture — instead of the original illustration, draw new tree groups, pond, path and hills at the same plate size
  const field = document.querySelector("[data-field]");
  let f = '<path class="hill" d="M0 0h2800v420C2400 520 2000 360 1600 440S800 520 400 420 0 480 0 480z"/>';
  f += '<ellipse class="pond" cx="760" cy="1380" rx="260" ry="360" transform="rotate(-20 760 1380)"/><ellipse class="pond" cx="2200" cy="2300" rx="200" ry="120"/>';
  f += '<path class="path" d="M200 2600C700 2300 900 1900 1400 1800S2200 1500 2600 900M1400 1800c-100-400 100-800-60-1300M600 600c300 200 600 220 800 120"/>';
  for (let i = 0; i < 260; i++) f += `<circle class="${i % 4 ? "t1" : "t2"}" cx="${(rnd() * 2800) | 0}" cy="${(rnd() * 2800) | 0}" r="${(18 + rnd() * 40) | 0}"/>`;
  field.innerHTML = f;

  const cards = [
    ["eat", "", 42, 582, "Camp", "Sweetness that melts in the warmth of fire", "Your baked snack name here", "Your recipe here in about three lines. It is a basic camp snack, and layering it with other sweets after baking makes for a different treat.", ["Ingredient One", "Material Two", "Material Three", "Material Four"], "Grilled snack · Skewers over a campfire · Close-up", ["Camp", "Forest Villa", "Barbecue"]],
    ["eat", "", 1157, 1742, "Barbecue", "Recommended recipe variations", "Your teppanyaki dish name here", "Your baking steps here in about three lines. Warm slowly until both sides are golden, so the outside is crisp and the inside stays soft.", ["Ingredient One", "Material Two", "Material Three", "Material Four"], "Sandwich on griddle · Top view · Close-up", ["Camp", "Barbecue"]],
    ["eat", "is-flex", 2341, 45, "Forest Villa", "Tastier because it’s outdoors", "Your charcoal grill dish name here", "Your recipe here in about four lines. Put charcoal-grilled meat between bread, add your favorite vegetables, and it is done.", ["Ingredient One", "Material Two", "Material Three", "Material Four", "Ingredient Five", "Ingredient Six"], "Charcoal-grilled burger · on a wooden board · close-up", ["Forest Villa", "Camp"]],
    ["stay", "is-w350", 488, 1074, "Camp", "Handy tip 01", "Your short tip title here", "About two lines of camp tips here. It’s also great for relaxing together.", null, null, ["Camp"]],
    ["stay", "is-w350", 1692, 545, "Camp", "Handy tip 02", "Your short tip title here", "Your two lines or so here on tips for enjoying a campfire longer.", null, null, ["Camp", "Forest Villa"]],
    ["stay", "is-w350", 1437, 2243, "Camp", "Handy tip 03", "Your short tip title here", "Your two or so lines of tips on using the folding tool here.", null, "Collapsible water bottle · on grass · close-up", ["Camp", "Barbecue"]],
    ["stay", "is-w350", 2015, 1411, "Camp", "Handy tip 04", "Your short tip title here", "Your hanging tool tips go here in about two lines.", null, "Lanterns hung on branches · evening", ["Camp"]],
    ["play", "is-w350", 239, 190, "Pond", "Your hidden spot here, one line", "Your observation game name here", "Your migratory bird story here in about two lines.", null, "Ducks on the pond · morning · landscape", ["Pond"]],
    ["play", "is-flex", 49, 1260, "Camp", "Spacious rentals, shops, facilities", "Your facility intro title here", "Your rental gear, shop, restrooms and open-air bath story here, in about four lines, to satisfy even experienced campers.", null, "Display shelf inside rental shop · interior", ["Shops · Rentals", "Facility Guide"]],
    ["play", "is-flex", 507, 1512, "Play", "A different joy each season", "Your seasonal activity title here", "Your seasonal highlights go here in about four lines: spring cherry blossoms, summer water play, autumn leaves, and what changes with each season.", null, "Family walking a cherry blossom path · Spring daytime", ["Play"]],
    ["play", "is-flex", 1122, 177, "Play", "Play that uses the body", "Your forest adventure title here", "Your three-line story here about the treetop rope-walking play.", null, "Child walking a tightrope · forest · landscape", ["Play"]],
    ["play", "", 1770, 930, "Insect Yard", "Summer only", "Your insect experience title here", "Your three-line story here about touching insects by hand.", null, "Rhinoceros beetle on a hand · Close-up", ["Play"]],
    ["play", "is-flex", 2240, 1874, "Venue", "All together", "Your event venue title here", "Your story about the wide lawn event grounds here, about three lines.", null, "Lawn venue overview · Daytime · Landscape", ["Venue"]],
  ];
  const markOf = { eat: "EAT", stay: "STAY", play: "PLAY" };
  document.querySelector("[data-cards]").innerHTML = cards.map(([z, cls, t, l, sub, small, ttl, txt, list, ph, links]) => `
    <li class="ab-card is-${z} ${cls}" style="--t: ${t}; --l: ${l};">
      <svg class="ab-card__mark" viewBox="0 0 140 70" aria-hidden="true"><rect class="k" x="6" y="8" width="128" height="56" rx="10"/><text x="70" y="52" text-anchor="middle">${markOf[z]}</text></svg>
      <div class="ab-card__in"><div class="ab-card__box">
        <p class="ab-card__sub">${sub}</p>
        <h2 class="ab-card__ttl"><small>${small}</small>${ttl}</h2>
        <p class="ab-card__txt">${txt}</p>
        ${list ? `<ul class="ab-card__list">${list.map((x) => `<li>${x}</li>`).join("")}</ul>` : ""}
      </div>${ph ? `<figure class="ab-card__img gp-ph"><div class="wf-img" data-label="${ph}"></div></figure>` : ""}</div>
      <div class="ab-card__links">${links.map((x) => `<a class="gp-btn04" href="#">${x}${chev}</a>`).join("")}</div>
    </li>`).join("");
  const photos = [[755, 100, -4, "Kids water play · Summer"], [729, 2318, 3, "Family sitting around a bonfire · night"], [1082, 2219, -2, "Breakfast in front of the tent · morning"], [1604, 122, 4, "Forest walk · Autumn"], [1914, 1805, -3, "Dog running on lawn · daytime"]];
  document.querySelector("[data-photos]").innerHTML = photos.map(([t, l, r, ph]) =>
    `<li class="ab-photo" style="--t: ${t}; --l: ${l}; --r: ${r}deg;"><div class="gp-ph"><div class="wf-img" data-label="${ph}"></div></div><p>Memory</p></li>`).join("");

  // Starry night — 400 stars, three constellations
  let sky = "";
  for (let i = 0; i < 400; i++) sky += `<circle${i % 23 ? "" : ' class="big"'} cx="${(rnd() * 3800) | 0}" cy="${(rnd() * 2780) | 0}" r="${(1 + rnd() * (i % 23 ? 2.5 : 6)).toFixed(1)}"/>`;
  document.querySelector("[data-sky]").innerHTML = sky;
  document.querySelector("[data-lines]").innerHTML =
    '<path d="M1500 900 1620 980 1760 940 1880 1040 1960 1180M1620 980 1600 1140"/><text x="1520" y="860">One constellation</text>' +
    '<path d="M2200 1500 2320 1420 2460 1500 2420 1660 2260 1640z"/><text x="2220" y="1380">Constellation Two</text>' +
    '<path d="M1100 1700 1220 1640 1340 1700 1460 1660 1580 1720"/><text x="1120" y="1600">Constellation Three</text>';

  const area = document.querySelector(".ab-area");
  const board = document.querySelector(".ab-area__grabarea");
  const seiza = document.querySelector(".ab-seiza");
  const seizaBg = seiza.querySelector(".ab-seiza__bg");
  const modal = document.getElementById("ab-modal");

  // Only cards and photos inside the window are visible (the original IntersectionObserver root is the canvas window)
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-visible", e.isIntersecting)), { root: area });
  document.querySelectorAll(".ab-card, .ab-photo").forEach((el) => io.observe(el));

  const enableDrag = () => area.setAttribute("data-fx", "drag-pan-map");
  if (reduce) enableDrag();
  else gsap.fromTo(board, { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 2, ease: "power1.inOut", onComplete: enableDrag });

  let modalOnce = true, linesOn = false;
  const lines = document.querySelector("[data-lines]");
  const setLines = (on) => { linesOn = on; lines.classList.toggle("is-on", on); document.querySelector('[data-seiza="seiza"] b').textContent = on ? "OFF" : "ON"; };
  const openSky = (btn) => {
    const bw = board.offsetWidth, bh = board.offsetHeight;
    const x = bw / 2 - btn.offsetLeft - btn.offsetWidth / 2, y = bh / 2 - btn.offsetTop - btn.offsetHeight / 2;
    const cx = Math.round(btn.offsetLeft + btn.offsetWidth / 2), cy = Math.round(btn.offsetTop + btn.offsetHeight / 2);
    const others = board.querySelectorAll(".ab-main, .ab-cards, .ab-photos, .ab-seiza-btn__en, .ab-seiza-btn__ttl");
    seiza.setAttribute("aria-hidden", "false");
    const tl = gsap.timeline({ onComplete: () => { if (modalOnce) { document.body.classList.add("is-modal"); modal.showModal(); } } });
    if (reduce) { tl.set(seiza, { "--mask": "200%", pointerEvents: "auto" }).set(seizaBg, { scale: 1 }); return; }
    tl.to(board, { x, y, duration: 0.6, transformOrigin: `${cx}px ${cy}px`, ease: "power1.inOut" })
      .to(others, { autoAlpha: 0, duration: 0.4, ease: "power1.inOut" }, "<+=.2")
      .to(board, { scale: isPc ? 2 : 1.4, duration: 0.8, ease: "power1.out" })
      .to(seiza, { "--mask": isPc ? "200%" : "250%", pointerEvents: "auto", duration: 1, ease: "power1.out" }, "-=.7")
      .to(seizaBg, { scale: 1, duration: 1, ease: "power1.out" }, "<");
  };
  const closeSky = () => {
    const others = board.querySelectorAll(".ab-main, .ab-cards, .ab-photos, .ab-seiza-btn__en, .ab-seiza-btn__ttl");
    gsap.timeline({ onComplete: () => seiza.setAttribute("aria-hidden", "true") })
      .set(others, { autoAlpha: 1 }).set(board, { scale: 1 }).set(seiza, { pointerEvents: "none" })
      .to(seizaBg, { scale: isPc ? 1.5 : 1, duration: reduce ? 0 : 1, ease: "power1.inOut" })
      .to(seiza, { "--mask": "0%", duration: reduce ? 0 : 0.6, ease: "power1.inOut" }, "<+=.2");
  };
  document.querySelector("[data-seiza-open]").addEventListener("click", (e) => openSky(e.currentTarget));
  document.querySelector('[data-seiza="close"]').addEventListener("click", closeSky);
  document.querySelector('[data-seiza="seiza"]').addEventListener("click", () => setLines(!linesOn));
  const afterModal = () => { document.body.classList.remove("is-modal"); if (modalOnce) { setLines(true); modalOnce = false; } };
  modal.querySelector(".ab-modal__close").addEventListener("click", () => { modal.close(); });
  modal.addEventListener("close", afterModal);
  modal.addEventListener("click", (e) => { if (!e.target.closest(".ab-modal__inner")) modal.close(); });

  // The star board can be dragged too (inertia, edge resistance 1
  Draggable.create(".ab-seiza__grabarea", { bounds: seiza, zIndexBoost: false, inertia: true, edgeResistance: 1 });

  // A shooting star every minute — from a random spot snapped to the 100px grid toward the lower left over 1.5s
  if (!reduce) setInterval(() => {
    const g = seiza.querySelector(".ab-seiza__grabarea");
    const snap = (min, max) => { const a = Math.ceil(min / 100) * 100, b = Math.floor(max / 100) * 100; return a + Math.floor(Math.random() * ((b - a) / 100 + 1)) * 100; };
    const x = snap(200, g.offsetWidth - 200), y = snap(200, g.offsetHeight - 200);
    gsap.timeline().fromTo(".ab-seiza__meteor", { x, y, scale: 0 }, { x: x - 200, y: y + 120, scale: 1, duration: 1.5, ease: "power1.inOut" })
      .fromTo(".ab-seiza__meteor", { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.5, ease: "power1.in" }, "<");
  }, 60000);
})();
