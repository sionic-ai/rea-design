// Event grid: nine cells, the in-progress cell is black
(() => {
  const { $, decorate } = window.MAUW;
  const L = ["Talk banner · orange speech-bubble title and circular speaker face · landscape 16:9", "Event banner · hand-drawn people illustration · landscape 16:9", "Exhibition poster · pink, sky blue and green vertical bands · landscape 16:9", "Event poster · cream background with orange brush curve · landscape 16:9", "Forum poster · yellow-to-blue gradient lettering · landscape 16:9", "Exhibition poster · large serif English text on white · landscape 16:9", "White banner with only a large research lab logo · landscape 16:9", "Blue title band over student presentation photo · landscape 16:9", "Speaker photo on dark stage · landscape 16:9"];
  const T = ["Between “awareness” and “design” ── Designing the irrationality of business", "[Joint Event] How to collaborate well with freelancers in the creative industry?", "Soft co-creation ── it connects, sparks, and shifts", "Held: “Your event name here 0000 ~Unlocking learning~”", "【Held Tue 10/27】 Your forum name here 0000", "【Seminar Exhibition】 Opening ”Your exhibition name here”", "Your institute’s public lecture here ‹Session 0: Design Management›", "【Opens 11/14~】 Student project showcase · exhibition", "”Pause, Look Back, Then Move Forward” vol.0"];
  $("[data-grid]").innerHTML = L.map((l, i) => `<div class="cell${i === 1 || i === 7 ? " is-now" : ""}"><a href="article.html">
      <div class="wf-img" data-label="${l}"></div>
      <div class="cell__meta"><span class="lbl en">0000.${10 + (i % 3)}.${String(9 + i).padStart(2, "0")} ${["Mon", "Wed", "Sat"][i % 3]}</span>${i % 3 !== 2 ? '<span class="lbl cell__tag">Booking needed</span>' : ""}</div>
      <p class="ev__title">${T[i]}</p>
      <div class="ev__place"><span class="lbl">Place ○ Campus ${[7, 7, 2, 5, 7, 2, 6, 2, 2][i]}F</span><span class="lbl">Hosted by ○ Your department name here</span></div>
    </a></div>`).join("");
  decorate();

  // Like the original, on PC only, swaps selects for the Choices.js 11.1.0 version (no search or sorting, chosen item always visible, opens downward)
  if (!window.Choices) return;
  let made = [];
  const pc = matchMedia("(min-width: 960px)");
  const sync = () => {
    if (pc.matches && !made.length) made = [...document.querySelectorAll(".sel select")].map((s) => new Choices(s, { searchEnabled: false, searchChoices: false, shouldSort: false, allowHTML: false, removeItemButton: false, itemSelectText: "", placeholder: false, renderSelectedChoices: "always", duplicateItemsAllowed: false, position: "bottom" }));
    else if (!pc.matches && made.length) { made.forEach((c) => c.destroy()); made = []; }
  };
  pc.addEventListener("change", sync);
  sync();
})();
