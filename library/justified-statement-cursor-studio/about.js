/* About — three service cells · six process rows · award list · recommendation slider (Swiper 11.2.10) */
(() => {
  const SA = window.SA;
  const SV = [["Research & Strategy", 9], ["Design", 9], ["Development", 9]];
  document.querySelector("[data-services]").innerHTML = SV.map(([t, n], i) => `
    <div class="ab-svc"><button type="button" class="ab-svc__head"><span class="sa-mono">${i + 1}</span><span class="sa-bold">${t}</span></button>
      <ul class="ab-svc__list">${Array.from({ length: n }, (_, k) => `<li class="sa-mono">Your service $ here{k + 1}</li>`).join("")}</ul></div>`).join("");
  // Phone: tapping a column header unfolds the list over .5s (.4,0,.2,1) (original initMobileAccordion)
  document.querySelectorAll(".ab-svc__head").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("is-open")));
  const PR = ["Discovery", "Definition", "Design", "Development", "Launch", "Support"];
  document.querySelector("[data-process]").innerHTML = PR.map((t, i) => `
    <div class="ab-step"><button type="button" class="ab-step__head"><span class="sa-mono">${i + 1}</span><span class="sa-bold">${t}</span><i aria-hidden="true">⊕</i></button><p class="ab-step__body sa-mono">$ here{t} Describe what happens in each step in two lines.</p></div>`).join("");
  // Process row: clicking expands the description right away (original GENERAL_DISPLAY) and clicking again collapses it
  document.querySelectorAll(".ab-step__head").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("is-open")));
  const AW = [["Award Name 1", "Today’s sites × 4"], ["Award Name 1", "Notable sites × 7"], ["Design award 2", "Award — App design"], ["Design award 3", "Bronze award — Interface design"], ["Design award 4", "Best app design"], ["About media 1", "× 6"], ["About media 2", "× 6"], ["About media 3", "Introduced"]];
  document.querySelector("[data-award-list]").innerHTML = AW.map(([a, b]) => `<a class="ab-award" href="#" data-fx="thumb-to-cursor" data-fx-thumb-to-cursor="block: .sa-nav, .sa-mbar"><span class="sa-bold">${a}</span><span class="sa-mono">${b}</span><span class="ab-award__img sa-ph" data-fx-part="thumb" data-label="Plaque photo · Square"></span></a>`).join("");
  // The About heading text doesn’t shuffle on load, as in the original (measured loader 100ms)
  document.querySelectorAll("[data-scr]").forEach((el) => el.removeAttribute("data-fx"));
  // Featured post: switches one at a time instantly (like the original slider at speed 0 — advance with the name row and arrows)
  if (window.Swiper) {
    const names = [...document.querySelectorAll("[data-voice-names] button")];
    const sw = new Swiper("[data-voices]", { slidesPerView: 1, speed: SA.reduce ? 0 : 300, effect: "fade", fadeEffect: { crossFade: true }, loop: false, allowTouchMove: true });
    const mark = () => names.forEach((b, i) => b.classList.toggle("is-on", i === sw.activeIndex));
    sw.on("slideChange", mark);
    names.forEach((b, i) => b.addEventListener("click", () => sw.slideTo(Math.min(i, sw.slides.length - 1))));
    document.querySelector("[data-prev]").addEventListener("click", () => sw.slidePrev());
    document.querySelector("[data-next]").addEventListener("click", () => sw.slideNext());
  }
})();
