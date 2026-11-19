// First page only — filling the room photo strip, drawing the grounds illustrated map, full video popup.
(() => {
  // Strip — 418px landscape photos and 208px portrait photos are shuffled in the original order. Two identical rows are joined and flowed to -100% to hide the seam
  const rooms = [["Star", 1], ["Forest", 1], ["Sunlight", 1], ["Moon", 1], ["Light", 0], ["Pine", 1], ["Grass", 0], ["Water", 1], ["Hill", 0], ["Grain", 0], ["Always", 1]];
  document.querySelectorAll(".kz-mq__list").forEach((ul) => {
    ul.innerHTML = rooms.map(([name, wide]) => `<li class="kz-mq__item${wide ? "" : " is-tall"}"><a class="kz-mq__a" href="stay.html">
      <span class="wf-img" data-label="Room ‹${name}」 ${wide ? "Interior and forest beyond the window · landscape 4:3" : "Corner of open-air bath · portrait 2:3"}"></span><p class="kz-mq__lnk">${name}</p></a></li>`).join("");
  });

  // Site illustration map — tree clusters on both sides of a winding road, 11 annexes on the hill. Fixed-seed random so the same picture appears
  const svg = document.querySelector(".kz-route__map svg");
  if (svg) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const NS = "http://www.w3.org/2000/svg";
    const road = [...svg.querySelectorAll(".kz-map__road path")];
    const near = (x, y) => road.some((p) => {
      const L = p.getTotalLength();
      for (let s = 0; s < L; s += 18) { const q = p.getPointAtLength(s); if (Math.hypot(q.x - x, q.y - y) < 26) return true; }
      return false;
    });
    const trees = svg.querySelector(".kz-map__trees");
    for (let i = 0, n = 0; i < 900 && n < 190; i++) {
      const x = rnd() * 624, y = rnd() * 735, r = 9 + rnd() * 15;
      if (Math.hypot(x - 312, y - 367) > 360 || near(x, y)) continue;
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("r", r.toFixed(1));
      c.setAttribute("class", "kz-map__tree t" + (n % 3));
      trees.append(c); n++;
    }
    const houses = svg.querySelector(".kz-map__houses");
    const spots = [[150, 210, "Star"], [205, 330, "Forest"], [330, 250, "Sunlight"], [470, 140, "Moon"], [520, 300, "Light"], [300, 470, "Pine"], [150, 520, "Grass"], [480, 470, "Water"], [90, 380, "Hill"], [360, 600, "Grain"], [250, 640, "Always"]];
    spots.forEach(([x, y, t], i) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("transform", `translate(${x} ${y}) rotate(${(i * 23) % 50 - 25})`);
      g.innerHTML = `<rect class="kz-map__house" x="-15" y="-10" width="30" height="20" rx="2"/><path class="kz-map__roof" d="M-17 -10 0 -19 17 -10z"/><text class="kz-map__label" y="32" text-anchor="middle">${t}</text>`;
      houses.append(g);
    });
  }

  // Full video — clicking the text ring in the center opens an inline popup (original magnific inline)
  jQuery(() => { jQuery(".kz-movie-open").magnificPopup({ type: "inline" }); });
})();
