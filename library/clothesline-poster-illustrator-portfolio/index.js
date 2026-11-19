// Redraw as SVG, with the same position, size, and feel, the places where the original speaks in pictures (walking people strip, guitar player, QR).
// Colors are made from --kf-* by classes in index.css — swap the Skin and the drawing colors follow
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = (vb, body, keep = "xMinYMin slice") =>
    `<svg xmlns="${NS}" viewBox="${vb}" preserveAspectRatio="${keep}" aria-hidden="true">${body}</svg>`;

  // A single walking person, facing left. x is the midpoint between the feet, h is from the top of the head to the feet
  const walker = (x, { coat, hat, hair, tall = 1, stride = 1, kid = false }) => {
    const k = tall;
    const top = 540 - 60 - 420 * k;
    const y = (v) => (top + v * k).toFixed(1);
    const s = (v) => (v * k).toFixed(1);
    const X = (v) => (x + v * k).toFixed(1);
    if (kid) {
      return `<g class="wk">
        <path class="wk-shoe" d="M${X(-34)} ${y(408)}q-14 6 -18 14h28z M${X(14)} ${y(404)}q-10 8 -14 18h26z"/>
        <path class="wk-line" d="M${X(-20)} ${y(330)}L${X(-28)} ${y(408)} M${X(14)} ${y(330)}L${X(22)} ${y(404)}"/>
        <ellipse class="wk-white wk-line" cx="${X(0)}" cy="${y(290)}" rx="${s(52)}" ry="${s(66)}"/>
        <path class="wk-hat wk-line" d="M${X(-34)} ${y(236)}q34 -40 68 0z"/>
        <circle class="wk-skin wk-line" cx="${X(-6)}" cy="${y(278)}" r="${s(26)}"/>
        <path class="wk-line" d="M${X(-16)} ${y(274)}h6 M${X(2)} ${y(274)}h6"/>
        <path class="wk-tie" d="M${X(-12)} ${y(316)}l12 6l12 -6v12l-12 -6l-12 6z"/>
        <path class="wk-line" d="M${X(-48)} ${y(300)}l-18 18 M${X(48)} ${y(300)}l16 14"/>
      </g>`;
    }
    const legA = `M${X(-6)} ${y(300)}L${X(-70 * stride)} ${y(392)}`;
    const legB = `M${X(10)} ${y(300)}L${X(56 * stride)} ${y(388)}`;
    return `<g class="wk">
      <path class="wk-line wk-leg" d="${legA} ${legB}"/>
      <path class="wk-shoe" d="M${X(-70 * stride - 4)} ${y(386)}q-40 2 -46 18h52z M${X(56 * stride)} ${y(382)}q-34 4 -40 18h48z"/>
      <path class="wk-coat-${coat} wk-line" d="M${X(-30)} ${y(140)}C${X(-74)} ${y(190)} ${X(-96)} ${y(280)} ${X(-64)} ${y(318)}L${X(70)} ${y(318)}C${X(92)} ${y(260)} ${X(64)} ${y(176)} ${X(30)} ${y(140)}z"/>
      <path class="wk-line" d="M${X(-4)} ${y(150)}L${X(4)} ${y(300)}"/>
      <path class="wk-skin wk-line" d="M${X(-40)} ${y(206)}c-22 34 -26 70 -14 88l12 -6c-8 -20 -4 -50 14 -76z"/>
      <path class="wk-skin wk-line" d="M${X(-30)} ${y(46)}c-30 20 -40 52 -30 74l-26 12l28 6c8 18 30 24 52 18l12 -40c-6 -40 -20 -62 -36 -70z"/>
      <path class="wk-line" d="M${X(-28)} ${y(84)}q8 6 16 0"/>
      ${hat ? `<path class="wk-hat wk-line" d="M${X(-64)} ${y(54)}h112l-12 -8c-2 -26 -18 -38 -44 -38s-40 14 -44 38z"/><path class="wk-band" d="M${X(-41)} ${y(40)}h80v8h-80z"/>` : ""}
      ${hair ? `<path class="wk-hair wk-line" d="M${X(-34)} ${y(40)}c24 -30 80 -26 96 10c14 30 4 66 -22 80c4 -30 -8 -56 -40 -66c-14 -6 -26 -14 -34 -24z"/>` : ""}
    </g>`;
  };

  const walkers = () =>
    svg("0 0 1080 540",
      walker(150, { coat: 1, hair: true, tall: 0.92, stride: 0.9 }) +
      walker(330, { kid: true, tall: 1 }) +
      walker(520, { coat: 2, hat: true, tall: 1.02, stride: 1.2 }) +
      walker(735, { coat: 3, hat: true, tall: 1, stride: 0.8 }) +
      walker(950, { coat: 4, hat: false, tall: 0.96, stride: 0.7 }));

  // A hat-wearing person sitting on a chair with legs crossed plays guitar — same ratio as the original illustration frame 922×1094
  const guitarist = () => svg("0 0 922 1094", `
    <g class="gt">
      <ellipse class="gt-stool wk-line" cx="300" cy="986" rx="96" ry="22"/>
      <path class="gt-pole wk-line" d="M286 700h28v286h-28z"/>
      <path class="gt-stool wk-line" d="M176 690c0 -26 248 -26 248 0v26c0 26 -248 26 -248 0z"/>
      <path class="gt-suit wk-line" d="M260 640c-40 60 -40 110 10 130h180l40 260h70l-30 -300c-10 -50 -50 -80 -110 -80z"/>
      <path class="gt-shoe wk-line" d="M486 1030h86c20 0 30 24 10 30h-100z"/>
      <path class="gt-suit wk-line" d="M330 640c80 -40 220 -40 300 0l120 120c20 20 10 50 -20 50l-30 -10l-110 -100c-60 20 -160 40 -230 10z"/>
      <path class="gt-shoe wk-line" d="M716 790c30 -40 70 -40 90 -20c10 20 -20 50 -50 60z"/>
      <path class="gt-suit wk-line" d="M240 380c-60 40 -90 160 -70 290h250l40 -260c-60 -40 -150 -60 -220 -30z"/>
      <path class="gt-shirt wk-line" d="M320 360l40 70l40 -70z"/>
      <path class="gt-tie" d="M352 380h16l10 120l-18 22l-18 -22z"/>
      <ellipse class="gt-body wk-line" cx="360" cy="600" rx="190" ry="140" transform="rotate(-24 360 600)"/>
      <circle class="gt-hole wk-line" cx="384" cy="586" r="34"/>
      <path class="gt-neck wk-line" d="M440 560l340 -230l18 26l-340 230z"/>
      <path class="gt-head wk-line" d="M772 316l70 -40l26 40l-60 50z"/>
      <path class="wk-line" d="M796 302l-8 -16 M816 290l-8 -16 M836 278l-8 -16 M814 352l12 14 M834 338l12 14"/>
      <path class="gt-hand wk-line" d="M560 470c30 -20 60 -10 64 14c4 22 -24 40 -54 34z"/>
      <path class="gt-hand wk-line" d="M300 560c30 -30 70 -20 74 10c4 26 -30 44 -64 36z"/>
      <path class="gt-skin wk-line" d="M300 160c-40 0 -60 40 -54 110c6 70 40 110 90 110s80 -50 76 -120c-4 -70 -40 -100 -112 -100z"/>
      <path class="wk-line" d="M300 250h20 M352 250h20 M330 260l-6 50h18 M314 330q22 10 44 0"/>
      <path class="gt-hat wk-line" d="M200 190c40 -14 220 -14 260 0l-30 -20c0 -60 -40 -100 -100 -100s-100 40 -100 100z"/>
      <path class="gt-band" d="M232 148h196v26h-196z"/>
    </g>`, "xMidYMax meet");

  // QR placeholder — three corner finder patterns + cells scattered by a fixed seed (a drawing that holds no real address)
  const qr = (n = 25) => {
    let seed = 1982, out = "";
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const finder = (fx, fy) => `<path d="M${fx} ${fy}h7v7h-7zM${fx + 1} ${fy + 1}v5h5v-5z" fill-rule="evenodd"/><rect x="${fx + 2}" y="${fy + 2}" width="3" height="3"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) out += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    return `<g fill="currentColor">${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${out}</g>`;
  };

  document.querySelectorAll("[data-walkers]").forEach((el) => (el.innerHTML = walkers()));
  document.querySelectorAll("[data-guitarist]").forEach((el) => (el.innerHTML = guitarist()));
  document.querySelectorAll("[data-qr]").forEach((el) => (el.innerHTML = qr()));

  // Video slot — click to show the playing state (play button goes away and the progress bar flows), click again to pause
  document.querySelectorAll(".st-video").forEach((v) => v.addEventListener("click", () => {
    const on = v.classList.toggle("is-playing");
    v.setAttribute("aria-label", v.getAttribute("aria-label").replace(on ? "Play" : "Pause", on ? "Pause" : "Play"));
  }));
})();
