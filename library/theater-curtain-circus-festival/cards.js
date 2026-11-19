// Several pages use the same card — bulb-frame cast card (home wall · cast list), zone ticket (home slider), cream ticket card (home · below FAQ).
// The page script fills in empty spots when the box attaches (same look when entering via barba).
(() => {
  const TONES = ["red", "purple", "pink"];
  const DAYS = ["Gold", "Earth", "Day"];
  const STAGES = ["Stage 1", "Stage 2", "Stage 3", "Stage 4"];
  const SHOTS = [
    "Group photo of a four-piece band · studio gray backdrop · portrait full-body",
    "Solo singer half-length · Warm backlight · Portrait",
    "Two-person duo · in front of a white wall · portrait half-length",
    "Guitarist · Seaside evening light · Portrait",
    "Rapper front view · black background, single-color lighting · portrait close-up",
    "Five-person band · forest daylight · portrait group",
  ];
  const bulbs = (row) => `<span class="pp-artist__bulbs is-${row}" data-fx-part="row">${"<i></i>".repeat(12)}</span>`;
  const artist = (i, { tilt = true } = {}) => {
    const tone = TONES[i % 3];
    return `<article class="pp-artist is-${tone}" data-artist data-day="${DAYS[i % 3]}" data-fx="bulb-frame-lights${tilt ? " card-depth-tilt" : ""}" data-fx-card-depth-tilt="tilt: 5; zoom: 1.07; shift: 2.25">
  <div class="pp-artist__body" data-fx-part="frame">
    ${bulbs("top")}
    <div class="pp-artist__photo"><div class="wf-img" data-fx-part="photo" data-label="${SHOTS[i % SHOTS.length]}"></div></div>
    <div class="pp-artist__days" data-fx-part="near"><span>${DAYS[i % 3]}</span><span>${STAGES[i % 4]}</span></div>
    <div class="pp-artist__plate" data-fx-part="near"><h3 class="pp-h pp-h--xs" data-label="Your performer’s English name here">Artist ${String(i + 1).padStart(2, "0")}</h3></div>
    ${bulbs("bottom")}
  </div>
  <a class="pp-artist__link" href="lineup.html" aria-label="Artist ${String(i + 1).padStart(2, "0")}"></a>
</article>`;
  };
  const AREAS = [
    ["Stage Name 1", "Four lines here about the zone. A large indoor stage holding twenty thousand people. Big names from every genre take the stage here."],
    ["Stage Name 2", "Your three-line area intro here. A dance stage that runs late into the night."],
    ["Stage Name 3", "Your three-line area intro here. A tent stage filled with guitar sound."],
    ["Stage Name 4", "Your two-line area intro here. A stage where everyone sings along."],
  ];
  const area = (i) => {
    const [name, text] = AREAS[i % AREAS.length];
    return `<article class="pp-area is-${TONES[(i + 1) % 3]}" data-areas-slide>
  <div class="pp-area__bend" data-areas-bend>
    <div class="pp-area__code"><span class="pp-label">A-${String(i + 1).padStart(2, "0")}</span><span class="pp-area__barcode"></span></div>
    <div class="pp-area__info">
      <h3 class="pp-h pp-h--m" data-label="Your section (stage) English name here">${name}</h3>
      <p>${text}</p>
      <p class="pp-label">Partial Cast</p>
      <div class="pp-area__tags" data-label="English name of the stage performer goes here"><span>• Artist 1 •</span><span>• Artist 2 •</span><span>• Artist 3 •</span></div>
    </div>
    <div class="pp-area__media"><div class="wf-img" data-label="Stage performance moment · laser and fire lighting · 4:5 portrait"></div></div>
  </div>
</article>`;
  };
  const TICKETS = [
    ["Day Ticket", "Pick a favorite day and enjoy the whole day to the fullest.", "Event main gate at night · fireworks and lights · portrait"],
    ["Weekend Ticket", "All three days — if you don’t want to miss a single one", "Audience in front of stage · red lasers · portrait"],
    ["Menu 5", "Spend three days and nights in the camping village", "Camping village entrance sign · daylight · portrait"],
    ["Menu 7", "Enjoy it in a private lounge with the best seats.", "Dancer in a VIP seat · blue lighting · portrait"],
  ];
  const ticket = (i) => {
    const [name, text, shot] = TICKETS[i % 4];
    return `<article class="pp-ticket" data-fx="card-depth-tilt" data-fx-card-depth-tilt="tilt: 3; zoom: 1.05; shift: 3">
  <div class="pp-ticket__media" data-fx-part="frame"><div class="wf-img" data-fx-part="photo" data-label="${shot}"></div></div>
  <div class="pp-ticket__info"><h3 class="pp-h pp-h--s" data-label="Your ticket type name in English here">${name}</h3><p>${text}</p></div>
  <div class="pp-ticket__button" data-fx-part="near"><a class="pp-btn is-amber" href="#tickets"><span class="pp-btn__dot"></span><span class="pp-btn__text">Buy tickets</span><span class="pp-btn__dot"></span></a></div>
</article>`;
  };
  window.PPC = { artist, area, ticket };
})();
