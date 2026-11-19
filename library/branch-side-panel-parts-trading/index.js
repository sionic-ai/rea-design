// Home only: the drawer of the left branch panel (press and a white panel attaches beside the panel and opens with a scrim, closes on scroll) and
// On phone, pins the phrase band behind the STOCKS cards to the center between cards (original center center → last card center center)
(() => {
  const drawers = document.querySelector(".tk-drawers");
  const names = { d1: "Headquarters", d2: "One Branch Name", d3: "Branch name two", d4: "Branch name three", d5: "Branch name four", d6: "Overseas city name" };
  const photo = { d1: "Headquarters building front · clear day · landscape 3:2", d2: "Branch warehouse entrance · daytime · landscape 3:2", d3: "White office building and parking lot · Landscape 3:2", d4: "Office building side and shutter · landscape 3:2", d5: "Low warehouse building · landscape 3:2", d6: "European residential street buildings · tree shade · landscape 3:2" };
  if (drawers) {
    drawers.innerHTML = Object.keys(names).map((id) => `<div class="tk-drawer" id="${id}">
      <p class="tk-drawer__hl">${names[id]}</p>
      <div class="tk-drawer__img wf-img tk-ph" data-label="${photo[id]}"></div>
      <div class="tk-drawer__block"><p class="tk-drawer__lbl">LOCATION</p><p class="tk-drawer__addr">〒000-0000<br>Your branch address in one line here</p><a class="tk-map" href="#"><span data-fx="line-redraw-hover" data-fx-line-redraw-hover="look: always-half">Google map</span></a></div>
      ${id === "d6" ? "" : `<div class="tk-drawer__block is-last"><p class="tk-drawer__hours">Business hours 0:00~00:00</p><p class="tk-drawer__tel"><span>TEL :</span><b>000-00-0000</b></p><p class="tk-drawer__tel"><span>FAX :</span><b>000-00-0000</b></p></div>`}
    </div>`).join("");
  }
  const aside = document.querySelector("[data-aside]");
  const items = [...document.querySelectorAll("[data-drawer]")];
  const overlay = document.querySelector("[data-overlay]");
  const close = () => {
    aside?.classList.remove("is-active");
    items.forEach((i) => i.classList.remove("is-active"));
    document.querySelectorAll(".tk-drawer.is-active").forEach((d) => d.classList.remove("is-active"));
  };
  items.forEach((item) => item.addEventListener("click", (e) => {
    e.stopPropagation();
    close();
    item.classList.add("is-active");
    document.getElementById(item.dataset.drawer)?.classList.add("is-active");
    aside?.classList.add("is-active");
    overlay?.classList.add("is-active");
  }));
  window.tkClosers?.push(close);
  addEventListener("scroll", () => { if (aside?.classList.contains("is-active")) { close(); overlay?.classList.remove("is-active"); } }, { passive: true });

  const mark = document.querySelector("[data-stocks-mark]"), end = document.querySelector("[data-stocks-end]");
  if (mark && end) {
    gsap.matchMedia().add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({ trigger: mark, start: "center center", endTrigger: end, end: "center center", pin: mark, pinSpacing: false, invalidateOnRefresh: true });
    });
  }
})();
