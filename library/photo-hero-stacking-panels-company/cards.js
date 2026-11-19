// Sales results card — Home, results list and detail’s Other results use the same type. [data-cards="Count"] fills the slot (if data-pick, a PICK UP round badge).
(() => {
  const rooms = [
    "Bright living room · gray sofa and round dining table · indirect ceiling lighting",
    "Living room with dining table · wood floor · natural window light",
    "Living room seen from the kitchen · pendant light · daytime",
    "Wood-ceiling living room · Brown sofa · Warm lighting",
    "Small dining table and two chairs · wooden door · afternoon light",
    "Spacious living room · blue sofa · large window",
  ];
  const card = (i, pick) => `
    <article class="wcard">
      <a href="detail.html">
        <div class="wcard__img">${pick ? '<span class="wcard__pick ba-en">PICK<br>UP</span>' : ""}<div class="wf-img" data-label="${rooms[i % rooms.length]} · Landscape 16:10"></div></div>
        <h3 class="wcard__title"><span class="ba-line">Your area name, neighborhood 0LDK+WIC here</span></h3>
        <p class="wcard__text">Continue listing the fixes here. New bathroom · new kitchen · new sink · new flooring · new wallpaper · new built-in storage…</p>
        <ul class="ba-tags wcard__tags"><li><span class="ba-tag">Area</span></li><li><span class="ba-tag">Neighborhood</span></li><li><span class="ba-tag">Construction Standards</span></li>${i % 2 ? '<li><span class="ba-tag">Big jar</span></li><li><span class="ba-tag">High-rise apartment</span></li>' : '<li><span class="ba-tag">Performance Improvement</span></li>'}</ul>
      </a>
    </article>`;
  document.querySelectorAll("[data-cards]").forEach((box) => {
    const n = +box.dataset.cards;
    const li = box.classList.contains("splide__list");
    box.innerHTML = Array.from({ length: n }, (_, i) => (li ? `<li class="splide__slide">${card(i, box.hasAttribute("data-pick"))}</li>` : card(i, box.hasAttribute("data-pick")))).join("");
  });
})();

// Results tabs / filter — picking one makes the cards float up again briefly
document.querySelectorAll(".case-tabs, .case-filter").forEach((list) => {
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button, a");
    if (!b) return;
    e.preventDefault();
    list.querySelectorAll("button, a").forEach((x) => {
      x.classList.toggle("is-current", x === b);
      if (x.hasAttribute("aria-selected")) x.setAttribute("aria-selected", x === b);
    });
    const cards = list.closest(".case__main").querySelectorAll(".wcard");
    gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.05 });
  });
});
