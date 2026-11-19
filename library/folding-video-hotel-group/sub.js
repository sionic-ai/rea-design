(() => {
  const { scrollTo, isSp } = window.UDS;
  const two = (n) => String(n).padStart(2, "0");

  // ───── News list: 3-column cells, photos fade up in .8s when they enter the screen (original fadein-scroll) ─────
  const grid = document.querySelector("[data-news-grid]");
  if (grid) {
    const N = 24;
    grid.innerHTML = Array.from({ length: N }, (_, i) => `<article class="n-item${i >= N - (N % 3 || 3) ? " -last" : ""}">
        <a class="n-item__img" href="article.html"><div class="u-ph wf-img" data-label="News featured photo ${two(i + 1)} · One of event, room or dish · landscape 16:9"></div></a>
        <div class="n-item__date"><p>2026.${two(12 - (i % 12))}.${two(28 - i)}</p></div>
        <p class="n-item__title"><a href="article.html">NEWS | Put the news title here in about two lines — event name and date ${two(i + 1)}</a></p>
      </article>`).join("");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("-show"); io.unobserve(e.target); } }));
    grid.querySelectorAll(".u-ph").forEach((el) => io.observe(el));
  }

  // ───── Booking: region box · hotel rows per region ─────
  const list = document.querySelector("[data-area-list]");
  if (list) {
    const AREAS = [
      { id: "r-north", name: "Northern Region", n: 1, box: { left: "77%", top: "14%" } },
      { id: "r-capital", name: "Capital region", n: 6, box: { left: "77%", top: "33%" } },
      { id: "r-mid", name: "Central region", n: 1, box: { left: "47%", top: "20%" } },
      { id: "r-west", name: "Western Region", n: 2, box: { left: "47%", top: "36%" } },
      { id: "r-south", name: "Southern island", n: 4, box: { left: "33%", top: "20%" } },
      { id: "r-abroad", name: "Overseas", n: 1, box: { left: "33%", top: "47%" } },
    ];
    let k = 0;
    AREAS.forEach((a) => (a.brand = Array.from({ length: a.n }, () => `Hotel Name ${two(++k)}`)));
    const go = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><rect x="0.5" y="2.5" width="9" height="9"/><path d="M5 7l6.5-6.5M7 .5h4.5V5"/></svg>';
    list.innerHTML = AREAS.map((a) => `<div class="r-area" id="${a.id}"><p class="r-area__name">${a.name}</p><div class="r-area__list">${a.brand.map((h) => `
        <div class="r-hotel"><p class="r-hotel__name">${h}</p>
          <div class="r-hotel__addr"><p class="r-hotel__area">${a.name}</p><a href="#">Your one-line address here 0-0-0</a></div>
          <p class="r-hotel__go"><a href="#">Vacancy search · Booking</a>${go}</p></div>`).join("")}</div></div>`).join("");
    document.querySelector("[data-map-boxes]").innerHTML = AREAS.map((a) => `<div class="r-box" style="left:${a.box.left};top:${a.box.top}"><p class="r-box__head">${a.name}</p><ul>${a.brand.map((h) => `<li><button type="button" data-goto="${a.id}" class="-en">${h}</button></li>`).join("")}</ul></div>`).join("");
    document.querySelector("[data-sp-nav]").innerHTML = AREAS.map((a) => `<li><button type="button" data-goto="${a.id}">${a.name}</button></li>`).join("");
    const head = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * (isSp ? 1.8125 : 6.25);
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-goto]");
      if (b) scrollTo(document.getElementById(b.dataset.goto), { offset: -head() });
    });
  }
})();
