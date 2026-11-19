// Work list — card wall and row view drawn from the same data, and filter pills open only one at a time. Click a card: after a .12s press the cover carries over into the detail header photo
(() => {
  const WORKS = [
    ["Stone mansion in front of a rain-wet plaza at night · yellow light in every window · front view from slightly below", "Corporate site · 2024"],
    ["Building model on a meeting table in front of a city night view through a glass window · warm desk lighting · side view", "Corporate site · 2021"],
    ["Telecom tower and equipment boxes on a rooftop at dusk · cold blue sky · looking up", "Platform · 2026"],
    ["Seaside high-rise city seen from a high-floor terrace · evening blue light · model on the table", "Platform · 2022"],
    ["Red punching bag inside a dark fight gym · a single ceiling light · wide", "Corporate site · 2021"],
    ["Dark room with potted cacti and a gold shelf · green light · front-on", "Platform · 2023"],
    ["Black coat on a hanger against a white wall · side light · still life", "Online shop · 2024"],
    ["Living room sofa and floor lamp in low light · warm brown · wide", "Landing page · 2022"],
    ["Glowing blue snake sculpture in the dark · reflected light · close-up", "Corporate site · 2025"],
    ["Hotel entrance arch at night with golden lights · Front, symmetrical", "Corporate site · 2023"],
    ["Geometric sculpture on a dark table · a single beam of light · at an angle", "Corporate site · 2020"],
    ["Black chair and red wall installation · stage lighting · front view", "Corporate site · 2024"],
  ];
  const PLAT = '<svg class="cs-tile__plat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4z"/><path d="M12 12l8.5-4.6M12 12v9.5M12 12L3.5 7.4"/></svg>';
  const wall = document.querySelector(".cs-wall");
  const rows = document.querySelector(".cs-rows");
  WORKS.forEach(([photo, meta], i) => {
    const n = String(i + 1).padStart(2, "0");
    wall.insertAdjacentHTML("beforeend", `<li class="cs-tile"><a href="detail.html" data-vt>
      <div class="cs-tile__img wf-img" data-vt-img data-label="${photo} · 6:7"></div>${PLAT}
      <div class="cs-tile__legend"><h3 class="cs-tile__title" data-label="Client name in English">Client Name ${n}</h3><p class="cs-tile__desc">Your two or so lines introducing this work go here.</p></div></a></li>`);
    rows.insertAdjacentHTML("beforeend", `<li class="cs-row"><a href="detail.html" data-vt>
      <span class="cs-row__name">Client Name ${n} — ${meta.split(" · ")[0]}</span><span class="cs-row__desc">Your one-line description introducing this work here</span><span class="cs-row__meta">${meta}</span>
      <svg class="cs-row__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 10L10 2M4 2h6v6"/></svg></a></li>`);
  });

  wall.addEventListener("pointerdown", (e) => e.target.closest(".cs-tile")?.classList.add("is-pressed"));
  addEventListener("pointerup", () => wall.querySelectorAll(".is-pressed").forEach((t) => t.classList.remove("is-pressed")));

  const groups = [...document.querySelectorAll(".cs-fgroup")];
  groups.forEach((g) => {
    const btn = g.querySelector(".cs-fbtn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !g.classList.contains("is-open");
      groups.forEach((o) => { o.classList.remove("is-open"); o.querySelector(".cs-fbtn").setAttribute("aria-expanded", "false"); });
      g.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    g.querySelectorAll(".cs-fdrop button").forEach((b) => b.addEventListener("click", () => {
      g.querySelectorAll(".cs-fdrop button").forEach((o) => o.classList.toggle("is-on", o === b));
      g.classList.remove("is-open");
    }));
  });
  document.addEventListener("click", () => groups.forEach((g) => g.classList.remove("is-open")));

  document.querySelectorAll(".cs-vbtn").forEach((b) => b.addEventListener("click", () => {
    const list = b.dataset.view === "list";
    document.querySelectorAll(".cs-vbtn").forEach((o) => o.classList.toggle("is-on", o === b));
    wall.hidden = list;
    rows.hidden = !list;
  }));
})();
