// First page art — redraws the original illustration (image file) as SVG in the same place, size and composition.
// The four member illustrations (brass, cymbals, flag rifle, snare drum) stand in a diagonally rising row, and pop-swap-cycle swaps them every 2.5 seconds. Three feet, and the legs vanish upward
(() => {
  const crew = document.querySelector(".nm-crew");
  const H = 1174;
  const spots = [[300, 470], [800, 390], [1300, 310], [1800, 230]];
  const body = (x, t) => `
    <path class="nm-ink" d="M${x - 110} ${t + 330}C${x - 260} ${t + 380} ${x - 340} ${t + 480} ${x - 370} ${H + 2}H${x + 310}C${x + 300} ${t + 560} ${x + 240} ${t + 390} ${x + 95} ${t + 330}Z"/>
    <path class="nm-face" d="M${x - 78} ${t + 228}L${x + 58} ${t + 220}L${x + 72} ${t + 322}L${x + 22} ${t + 356}L${x - 70} ${t + 348}Z"/>
    <path class="nm-ink" d="M${x - 96} ${t + 18}L${x + 84} ${t}L${x + 100} ${t + 212}L${x - 84} ${t + 226}Z"/>
    <path class="nm-ink" d="M${x - 132} ${t + 214}L${x + 62} ${t + 198}L${x + 44} ${t + 236}L${x - 122} ${t + 242}Z"/>
    <path class="nm-ink" d="M${x - 30} ${t + 300}h70v60h-70z"/>`;
  const kinds = {
    brass: (x, t) => `${body(x, t)}
      <path class="nm-ink" d="M${x + 60} ${t + 420}C${x + 140} ${t + 380} ${x + 200} ${t + 330} ${x + 250} ${t + 270}L${x + 300} ${t + 300}C${x + 250} ${t + 380} ${x + 180} ${t + 450} ${x + 100} ${t + 500}Z"/>
      <path class="nm-gold-line" d="M${x + 150} ${t + 210}C${x + 120} ${t + 300} ${x + 70} ${t + 320} ${x + 48} ${t + 300}"/>
      <circle class="nm-gold" cx="${x + 165}" cy="${t + 120}" r="100"/>
      <circle class="nm-gold-deep" cx="${x + 182}" cy="${t + 138}" r="58"/>`,
    cymbal: (x, t) => `${body(x, t)}
      <ellipse class="nm-gold" cx="${x - 130}" cy="${t + 540}" rx="118" ry="150"/>
      <ellipse class="nm-gold" cx="${x + 170}" cy="${t + 515}" rx="118" ry="150"/>
      <circle class="nm-ink" cx="${x - 120}" cy="${t + 545}" r="46"/>
      <circle class="nm-ink" cx="${x + 160}" cy="${t + 520}" r="46"/>`,
    rifle: (x, t) => `${body(x, t)}
      <path class="nm-sash" d="M${x - 150} ${t + 380}L${x - 60} ${t + 350}L${x + 40} ${H}H${x - 120}Z"/>
      <path class="nm-steel" d="M${x - 220} ${t + 360}l26-18 470 300-22 22Z"/>
      <path class="nm-steel" d="M${x - 40} ${t + 560}h150l6 22h-156z"/>
      <path class="nm-sash" d="M${x + 150} ${t + 690}l80 60-90 20z"/>`,
    drum: (x, t) => `${body(x, t)}
      <ellipse class="nm-head" cx="${x + 60}" cy="${t + 650}" rx="250" ry="62"/>
      <path class="nm-gold-line" d="M${x - 150} ${t + 560}L${x + 190} ${t + 470}"/>
      <path class="nm-gold-line" d="M${x - 60} ${t + 600}L${x + 260} ${t + 540}"/>`,
  };
  const labels = { brass: "Line of four members holding crowns, climbing diagonally", cymbal: "Four members holding cymbals", rifle: "Four color guard members with rifles and straps", drum: "Four rows of drummers with snare drums" };
  if (crew) {
    crew.innerHTML = ["brass", "cymbal", "rifle", "drum"].map((k, n) => `
      <figure class="nm-crew__item${n === 0 ? " is-on" : ""}" data-fx-part="item" data-label="Member illustration · ${labels[k]} · Empty at the top, the body continues onto a black background below · 1900:1174">
        <svg viewBox="0 0 1900 ${H}" aria-hidden="true">${spots.map(([x, t]) => `<g transform="translate(${x} ${t}) scale(1.38) translate(${-x} ${-t})">${kinds[k](x, t)}</g>`).join("")}</svg>
      </figure>`).join("");
  }

  // Feet — two layers: the front foot (raised with the orange sole showing) and the back foot in shadow (dark shoe). The legs melt into the background going up
  const step = (x, y, id, sole, band) => `
      <path fill="url(#${id})" d="M${x - 10} ${y - 60}L${x + 230} -20H${x + 460}L${x + 230} ${y - 30}Z"/>
      <g transform="rotate(34 ${x} ${y})">
        <path class="${sole}" d="M${x - 250} ${y - 20}C${x - 250} ${y - 140} ${x - 120} ${y - 175} ${x} ${y - 120}C${x + 90} ${y - 80} ${x + 150} ${y - 40} ${x + 270} ${y - 30}C${x + 330} ${y - 25} ${x + 340} ${y + 70} ${x + 270} ${y + 75}C${x + 150} ${y + 85} ${x + 60} ${y + 60} ${x - 30} ${y + 80}C${x - 160} ${y + 110} ${x - 250} ${y + 70} ${x - 250} ${y - 20}Z"/>
        ${band ? `<path class="nm-sole-band" d="M${x + 180} ${y - 34}l26 0 6 112-26-2z"/>` : ""}
      </g>`;
  const grad = (id) => `<linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop class="nm-leg-stop" offset="0"/><stop class="nm-leg-stop nm-leg-stop--end" offset=".85"/></linearGradient>`;
  const front = document.querySelector(".nm-feet__steps");
  if (front) {
    front.innerHTML = `<defs>${grad("nm-leg-f")}</defs>${step(200, 820, "nm-leg-f", "nm-sole", true)}${step(1260, 730, "nm-leg-f", "nm-sole", true)}${step(2250, 650, "nm-leg-f", "nm-sole", true)}`;
    front.setAttribute("data-label", "Marching three front paws · orange shoe soles seen at an angle · legs fade dark upward · 2717:957");
  }
  const back = document.querySelector(".nm-feet__back");
  if (back) {
    back.innerHTML = `<defs>${grad("nm-leg-b")}</defs>${step(560, 640, "nm-leg-b", "nm-shoe", false)}${step(1600, 560, "nm-leg-b", "nm-shoe", false)}${step(2560, 480, "nm-leg-b", "nm-shoe", false)}`;
    back.setAttribute("data-label", "Three hind feet in shade · dark shoes · 2811:794");
  }
})();
