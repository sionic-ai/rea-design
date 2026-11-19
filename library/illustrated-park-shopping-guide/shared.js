// Shared by the whole site — plugs the header, menu drawer and footer into every page in the same form, plus illustration piece tools (people · trees · buildings · palace) and
// Keeps in one place the values for the original’s “pieces pop up tilted from below, wobble, and settle” entrance.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => innerWidth < 768;

  // Seeded random so the same scene takes the same shape every time it opens
  const seeded = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let R = seeded(7);
  const rr = (a, b) => a + (b - a) * R();
  const pick = (a) => a[Math.floor(R() * a.length)];
  const f = (n) => Math.round(n * 10) / 10;

  // Colors inside the artwork (park, mall, palace scenery) — like a photo, they are part of the image and stay as they are when the skin changes. Colors that overlap with the skin, such as sky, grass, and accent, use --site-* from shared.css
  const C = (window.NNColors = {
    blue1: "#152148", // not skin: color inside the picture
    blue10: "#2a6ee6", // not skin: color inside the picture
    blue11: "#2c3f78", // not skin: color inside the picture
    blue12: "#2c57b3", // not skin: color inside the picture
    blue13: "#2c6fd1", // not skin: color inside the picture
    blue14: "#2f5aa8", // not skin: color inside the picture
    blue15: "#3a6fd8", // not skin: color inside the picture
    blue16: "#3a74d0", // not skin: color inside the picture
    blue17: "#3b3f8f", // not skin: color inside the picture
    blue18: "#4a8fd8", // not skin: color inside the picture
    blue19: "#4b5a73", // not skin: color inside the picture
    blue2: "#173f9c", // not skin: color inside the picture
    blue20: "#4f8ff0", // not skin: color inside the picture
    blue21: "#5a6f9a", // not skin: color inside the picture
    blue22: "#5f86c9", // not skin: color inside the picture
    blue23: "#6f7f95", // not skin: color inside the picture
    blue24: "#7f9cc4", // not skin: color inside the picture
    blue25: "#8aa3bd", // not skin: color inside the picture
    blue26: "#8d9bab", // not skin: color inside the picture
    blue27: "#8d9fb8", // not skin: color inside the picture
    blue28: "#8fa6c9", // not skin: color inside the picture
    blue29: "#8fb2d6", // not skin: color inside the picture
    blue3: "#1a49a8", // not skin: color inside the picture
    blue30: "#97a1ae", // not skin: color inside the picture
    blue31: "#9cc3e6", // not skin: color inside the picture
    blue32: "#9fb6cc", // not skin: color inside the picture
    blue33: "#a6b8cf", // not skin: color inside the picture
    blue34: "#a9b3bf", // not skin: color inside the picture
    blue35: "#b4c0cc", // not skin: color inside the picture
    blue36: "#b8c1cb", // not skin: color inside the picture
    blue37: "#b9def5", // not skin: color inside the picture
    blue38: "#c3ccd8", // not skin: color inside the picture
    blue39: "#c3e5fa", // not skin: color inside the picture
    blue4: "#1e2a44", // not skin: color inside the picture
    blue40: "#c4e6fa", // not skin: color inside the picture
    blue41: "#c7d5e2", // not skin: color inside the picture
    blue42: "#c9d8e5", // not skin: color inside the picture
    blue43: "#cdebfa", // not skin: color inside the picture
    blue44: "#cfdbe6", // not skin: color inside the picture
    blue45: "#cfe6f6", // not skin: color inside the picture
    blue46: "#d4e8f6", // not skin: color inside the picture
    blue47: "#d6e0e9", // not skin: color inside the picture
    blue5: "#1e3f8f", // not skin: color inside the picture
    blue6: "#1f2d5c", // not skin: color inside the picture
    blue7: "#1f4fbf", // not skin: color inside the picture
    blue8: "#1f5fd8", // not skin: color inside the picture
    blue9: "#26344c", // not skin: color inside the picture
    brown1: "#3d2b20", // not skin: color inside the picture
    brown2: "#6b4a2e", // not skin: color inside the picture
    brown3: "#7b6a58", // not skin: color inside the picture
    brown4: "#a88a5c", // not skin: color inside the picture
    gray1: "#5c6673", // not skin: color inside the picture
    gray2: "#7d8896", // not skin: color inside the picture
    gray3: "#8c8a84", // not skin: color inside the picture
    gray4: "#8e99a6", // not skin: color inside the picture
    green1: "#5fbf6a", // not skin: color inside the picture
    green2: "#69c27a", // not skin: color inside the picture
    green3: "#6cb864", // not skin: color inside the picture
    green4: "#79c46f", // not skin: color inside the picture
    ink1: "#1e1e1e", // not skin: color inside the picture
    ink2: "#2b2522", // not skin: color inside the picture
    ink3: "#2b2b2b", // not skin: color inside the picture
    ink4: "#555555", // not skin: color inside the picture
    light1: "#dde5ec", // not skin: color inside the picture
    light2: "#e7ecf2", // not skin: color inside the picture
    light3: "#e7edf2", // not skin: color inside the picture
    orange1: "#d79f76", // not skin: color inside the picture
    orange2: "#e5b088", // not skin: color inside the picture
    orange3: "#f08a3c", // not skin: color inside the picture
    orange4: "#f0c99a", // not skin: color inside the picture
    orange5: "#f2c9a0", // not skin: color inside the picture
    orange6: "#f7d7b6", // not skin: color inside the picture
    paleBlue: "#d6ecf8", // not skin: color inside the picture
    paleYellow1: "#f1ece0", // not skin: color inside the picture
    paleYellow2: "#f4efe4", // not skin: color inside the picture
    paleYellow3: "#f6f0e2", // not skin: color inside the picture
    paleYellow4: "#f6f2e6", // not skin: color inside the picture
    pink1: "#ea7fa6", // not skin: color inside the picture
    pink2: "#f2a3c7", // not skin: color inside the picture
    purple1: "#7a5bc7", // not skin: color inside the picture
    purple2: "#b99ce3", // not skin: color inside the picture
    red1: "#b8432c", // not skin: color inside the picture
    red2: "#c43a28", // not skin: color inside the picture
    red3: "#c8402c", // not skin: color inside the picture
    red4: "#d9472f", // not skin: color inside the picture
    red5: "#e2443e", // not skin: color inside the picture
    red6: "#e2544b", // not skin: color inside the picture
    red7: "#e2626a", // not skin: color inside the picture
    red8: "#e35a3c", // not skin: color inside the picture
    red9: "#e9554a", // not skin: color inside the picture
    sand1: "#b9a780", // not skin: color inside the picture
    sand10: "#e9e3d4", // not skin: color inside the picture
    sand11: "#e9e3d6", // not skin: color inside the picture
    sand12: "#efe8d8", // not skin: color inside the picture
    sand2: "#bdb6a7", // not skin: color inside the picture
    sand3: "#bfa47a", // not skin: color inside the picture
    sand4: "#cfc6ba", // not skin: color inside the picture
    sand5: "#cfc9bb", // not skin: color inside the picture
    sand6: "#d9c29b", // not skin: color inside the picture
    sand7: "#d9cba3", // not skin: color inside the picture
    sand8: "#e3ded2", // not skin: color inside the picture
    sand9: "#e9e1cf", // not skin: color inside the picture
    teal1: "#1f6b55", // not skin: color inside the picture
    teal10: "#cfe3da", // not skin: color inside the picture
    teal2: "#1f7a5c", // not skin: color inside the picture
    teal3: "#2b8a5e", // not skin: color inside the picture
    teal4: "#2e7d6a", // not skin: color inside the picture
    teal5: "#2e9a73", // not skin: color inside the picture
    teal6: "#2f9b7c", // not skin: color inside the picture
    teal7: "#3aa7c9", // not skin: color inside the picture
    teal8: "#46b08d", // not skin: color inside the picture
    teal9: "#8fd3c8", // not skin: color inside the picture
    white1: "#e8f4ef", // not skin: color inside the picture
    white2: "#eef7fd", // not skin: color inside the picture
    white3: "#f3f1ea", // not skin: color inside the picture
    white4: "#f6f3ea", // not skin: color inside the picture
    white5: "#fbfaf4", // not skin: color inside the picture
    white6: "#ffffff", // not skin: color inside the picture
    yellow1: "#e2b33c", // not skin: color inside the picture
    yellow2: "#e5b13c", // not skin: color inside the picture
    yellow3: "#e8b93c", // not skin: color inside the picture
    yellow4: "#e9dcbc", // not skin: color inside the picture
    yellow5: "#f2b632", // not skin: color inside the picture
    yellow6: "#f2e6c7", // not skin: color inside the picture
    yellow7: "#f4e4c1", // not skin: color inside the picture
    yellow8: "#f5d36c", // not skin: color inside the picture
  });

  const SKIN = [C.orange5, C.orange2, C.orange1, C.orange6];
  const HAIR = [C.ink2, C.brown1, C.brown2, C.ink1, C.sand4];
  const CLOTH = [C.red6, C.blue13, C.yellow5, C.teal3, C.blue4, C.orange3, C.purple1, C.white6, C.pink1, C.teal7, C.yellow7];
  const PANTS = [C.blue4, C.ink3, C.blue19, C.brown3, C.sand11];
  const ROBE = [C.pink2, C.yellow8, C.purple2, C.orange3, C.teal9, C.red9, C.paleYellow3];

  const wrap = (x, y, s, body, cls = "", flip = 1) =>
    `<g class="pc ${cls}" transform="translate(${f(x)} ${f(y)}) scale(${f(s * flip * 100) / 100} ${s})"><g class="mv"><g class="pc-in">${body}</g></g></g>`;

  // Person: origin at the center of the toes, height 30
  function person(x, y, s = 1, o = {}) {
    const skin = pick(SKIN), shirt = o.shirt || pick(CLOTH), pants = o.pants || pick(PANTS), hair = pick(HAIR);
    const dress = o.dress ?? R() < 0.25;
    const walk = o.walk ?? R() < 0.55;
    const flip = R() < 0.5 ? -1 : 1;
    const la = walk ? 16 : 0;
    const legs = dress
      ? `<g class="lg"><rect x="-2.6" y="-9" width="2.2" height="9" rx="1" fill="${skin}"/></g><g class="lg lg2"><rect x="0.6" y="-9" width="2.2" height="9" rx="1" fill="${skin}"/></g>`
      : `<g class="lg" transform="rotate(${la} -2 -11)"><rect x="-3.3" y="-11.5" width="2.7" height="11.5" rx="1.1" fill="${pants}"/></g><g class="lg lg2" transform="rotate(${-la} 2 -11)"><rect x="0.6" y="-11.5" width="2.7" height="11.5" rx="1.1" fill="${pants}"/></g>`;
    const body = dress
      ? `<path d="M-3.6 -21.5L-6.4 -7.5L6.4 -7.5L3.6 -21.5Z" fill="${shirt}"/>`
      : `<rect x="-4.6" y="-21.6" width="9.2" height="11.8" rx="2.6" fill="${shirt}"/>`;
    const arms = `<path d="M-4.1 -19.2L-6.6 -12.4M4.1 -19.2L6.8 -12.9" stroke="${skin}" stroke-width="2.1" stroke-linecap="round" fill="none"/>`;
    const head = `<circle cy="-25.6" r="3.8" fill="${skin}"/><path d="M-4 -25.8a4 4 0 0 1 8 0z" fill="${hair}"/>`;
    const bag = R() < 0.2 ? `<rect x="5.4" y="-15.6" width="3.8" height="4.6" rx="0.9" fill="${pick(CLOTH)}"/>` : "";
    return wrap(x, y, s, legs + body + arms + head + bag, walk && o.roam !== false ? "is-walk" : "", flip);
  }

  // Court attendant: robe trailing to the floor and an upswept hairstyle
  function courtier(x, y, s = 1) {
    const robe = pick(ROBE), skin = pick(SKIN), sash = pick(ROBE);
    const body = `<path d="M-3.8 -23L-7.6 0L7.6 0L3.8 -23Z" fill="${robe}"/><path d="M-4.2 -21L-9 -11L-6 -10L-2.4 -18Z" fill="${robe}"/><path d="M4.2 -21L9 -11L6 -10L2.4 -18Z" fill="${robe}"/><rect x="-4.6" y="-15" width="9.2" height="2" fill="${sash}"/>`;
    const head = `<circle cy="-27" r="3.6" fill="${skin}"/><path d="M-3.8 -27.4a3.8 3.8 0 0 1 7.6 0z" fill="${C.ink1}"/><circle cy="-32.2" r="2" fill="${C.ink1}"/>`;
    return wrap(x, y, s, body + head, R() < 0.5 ? "is-walk is-glide" : "", R() < 0.5 ? -1 : 1);
  }

  function tree(x, y, s = 1, o = {}) {
    const c = o.c || C.teal2, h = o.h || C.teal5;
    return wrap(x, y, s, `<rect x="-1.9" y="-12" width="3.8" height="12" fill="${C.yellow2}"/><circle cy="-24" r="12.5" fill="${c}"/><circle cx="-4.2" cy="-28.4" r="5.2" fill="${h}"/>`);
  }
  function bush(x, y, s = 1, c = C.teal6) {
    return wrap(x, y, s, `<g fill="${c}"><circle cx="-14" cy="-9" r="9"/><circle cx="0" cy="-14" r="14"/><circle cx="15" cy="-9" r="10"/><rect x="-23" y="-9" width="48" height="9"/></g><circle cx="-3" cy="-19" r="4.5" fill="${C.teal8}"/>`);
  }
  function cloud(x, y, s = 1) {
    return wrap(x, y, s, `<g fill="${C.white6}"><circle cy="-15" r="17"/><circle cx="-21" cy="-6" r="11"/><circle cx="21" cy="-8" r="13"/><circle cx="38" cy="-3" r="7"/><circle cx="-36" cy="-3" r="6"/><rect x="-44" y="-5" width="88" height="5"/></g><path d="M-30 -2h70" stroke="${C.paleBlue}" stroke-width="2"/>`, "is-cloud");
  }
  function car(x, y, s = 1, color) {
    const c = color || pick([C.red6, C.blue13, C.white6, C.blue4, C.teal7, C.yellow5]);
    return wrap(x, y, s, `<rect x="-16" y="-11" width="32" height="8" rx="3" fill="${c}"/><path d="M-9 -11L-6 -17H6L10 -11Z" fill="${c}"/><path d="M-6.4 -12L-4.6 -15.6H5L7.6 -12Z" fill="${C.blue45}"/><circle cx="-9" cy="-3" r="3" fill="${C.ink1}"/><circle cx="9" cy="-3" r="3" fill="${C.ink1}"/>`, "", R() < 0.5 ? -1 : 1);
  }
  function tent(x, y, s = 1) {
    return wrap(x, y, s, `<path d="M-22 -40L0 -58L22 -40Z" fill="${C.blue15}"/><rect x="-20" y="-40" width="40" height="5" fill="${C.blue12}"/><rect x="-1" y="-35" width="2" height="35" fill="${C.ink4}"/><rect x="-18" y="-20" width="36" height="16" fill="${C.red8}"/><rect x="-12" y="-33" width="24" height="7" fill="${C.white6}"/><rect x="-18" y="-4" width="36" height="4" fill="${C.red1}"/>`);
  }
  function bike(x, y, s = 1) {
    return wrap(x, y, s, `<circle cx="-8" cy="-5" r="5" fill="none" stroke="${C.ink1}" stroke-width="1.6"/><circle cx="8" cy="-5" r="5" fill="none" stroke="${C.ink1}" stroke-width="1.6"/><path d="M-8 -5L-2 -13L6 -13L8 -5M-2 -13L0 -5" stroke="${C.blue13}" stroke-width="1.8" fill="none"/><rect x="-4.2" y="-24" width="7.4" height="10" rx="2" fill="${pick(CLOTH)}"/><circle cy="-27.4" r="3.4" fill="${pick(SKIN)}"/><path d="M-3.6 -27.6a3.6 3.6 0 0 1 7.2 0z" fill="${pick(HAIR)}"/>`, "is-bike");
  }

  // Axonometric box building: P0 is the front left corner, u for length, v for depth (into the screen), H for height
  function wing(x, y, o = {}) {
    const L = o.L || 300, D = o.D || 70, H = o.H || 38;
    const u = o.u || [0.84, -0.54], v = o.v || [-0.6, -0.42];
    const P = (a, b, h = 0) => [f(a * u[0] + b * v[0]), f(a * u[1] + b * v[1] - h)];
    const poly = (pts, fill, extra = "") => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
    const end = poly([P(0, 0), P(0, D), P(0, D, H), P(0, 0, H)], o.side || C.sand12);
    const front = poly([P(0, 0), P(L, 0), P(L, 0, H), P(0, 0, H)], o.front || C.blue9);
    let mull = "";
    for (let a = 14; a < L; a += 16) { const p = P(a, 0), q = P(a, 0, H * 0.8); mull += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${C.blue29}" stroke-width="1.2"/>`; }
    const band = poly([P(0, 0, H * 0.8), P(L, 0, H * 0.8), P(L, 0, H), P(0, 0, H)], o.band || C.sand10);
    const o2 = 8;
    const roof = poly([P(-o2, -o2, H), P(L + o2, -o2, H), P(L + o2, D + o2, H), P(-o2, D + o2, H)], o.roof || C.gray2);
    let ribs = "";
    for (let a = 10; a < L; a += 12) { const p = P(a, -o2 + 2, H), q = P(a, D + o2 - 2, H); ribs += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${C.blue30}" stroke-width="1.4"/>`; }
    const edge = poly([P(-o2, -o2, H), P(L + o2, -o2, H), P(L + o2, -o2, H - 4), P(-o2, -o2, H - 4)], C.gray1);
    return wrap(x, y, 1, end + front + mull + band + roof + ribs + edge);
  }

  function tower(x, y, w = 160, h = 400) {
    let g = "";
    for (let gx = 8; gx < w; gx += 12) g += `<rect x="${gx}" y="${-h + 20}" width="7" height="${h - 30}" fill="${C.blue20}" opacity=".75"/>`;
    for (let gy = -h + 26; gy < -10; gy += 14) g += `<rect x="4" y="${gy}" width="${w - 8}" height="2" fill="${C.blue2}" opacity=".45"/>`;
    return wrap(x, y, 1, `<rect x="0" y="${-h}" width="${w}" height="${h}" fill="${C.blue8}"/><polygon points="${w},${-h} ${w + 42},${-h + 18} ${w + 42},0 ${w},0" fill="${C.blue3}"/>${g}<rect x="-2" y="${-h - 6}" width="${w + 4}" height="8" fill="${C.blue10}"/>`);
  }

  function castle(x, y, s = 1) {
    const tier = (yy, w, h, r) => `<rect x="${-w / 2}" y="${yy - h}" width="${w}" height="${h}" fill="${C.white5}"/><path d="M${-w / 2 - r} ${yy - h}L${w / 2 + r} ${yy - h}L${w / 2 - 6} ${yy - h - 12}L${-w / 2 + 6} ${yy - h - 12}Z" fill="${C.teal1}"/><rect x="${-w / 2 + 6}" y="${yy - h + 6}" width="${w - 12}" height="4" fill="${C.ink3}" opacity=".55"/>`;
    return wrap(x, y, s, `<path d="M-46 0L-38 -26L38 -26L46 0Z" fill="${C.gray3}"/>${tier(-26, 70, 22, 8)}${tier(-60, 56, 18, 7)}${tier(-90, 42, 16, 6)}${tier(-118, 28, 14, 6)}<rect x="-3" y="-140" width="6" height="8" fill="${C.yellow3}"/>`);
  }

  // Old palace main hall: wide base, red pillars, dark navy hipped roof
  function palace(x, y, s = 1) {
    let cols = "", bays = "";
    for (let i = 0; i <= 12; i++) cols += `<rect x="${-300 + i * 50 - 5}" y="-150" width="10" height="112" fill="${C.red4}"/>`;
    for (let i = 0; i < 12; i++) bays += `<rect x="${-295 + i * 50 + 5}" y="${i % 3 === 1 ? -132 : -120}" width="40" height="${i % 3 === 1 ? 92 : 80}" fill="${i % 3 === 1 ? C.blue17 : C.paleYellow2}"/>`;
    let tiles = "";
    for (let tx = -360; tx <= 360; tx += 14) tiles += `<line x1="${tx}" y1="-158" x2="${f(tx * 0.46)}" y2="-318" stroke="${C.blue11}" stroke-width="2"/>`;
    const rail = Array.from({ length: 23 }, (_, i) => `<rect x="${-330 + i * 30}" y="-58" width="4" height="18" fill="${C.red2}"/>`).join("");
    const body = `
      <rect x="-345" y="-42" width="690" height="42" fill="${C.sand5}"/><rect x="-345" y="-42" width="690" height="6" fill="${C.sand8}"/>
      <path d="M-70 0L-50 -42L50 -42L70 0Z" fill="${C.sand2}"/>
      <rect x="-330" y="-46" width="660" height="4" fill="${C.red2}"/>${rail}
      <rect x="-310" y="-150" width="620" height="110" fill="${C.paleYellow2}"/>${bays}${cols}
      <rect x="-312" y="-156" width="624" height="10" fill="${C.red2}"/><rect x="-312" y="-100" width="624" height="5" fill="${C.red2}"/>
      <path d="M-405 -176Q-330 -156 -270 -158L270 -158Q330 -156 405 -176L176 -318L-176 -318Z" fill="${C.blue6}"/>${tiles}
      <path d="M-405 -176Q-330 -156 -270 -158L270 -158Q330 -156 405 -176L398 -168Q330 -148 270 -150L-270 -150Q-330 -148 -398 -168Z" fill="${C.sand9}"/>
      <rect x="-182" y="-330" width="364" height="14" rx="3" fill="${C.blue1}"/>
      <path d="M-188 -330q-8 -14 4 -22l6 10z M188 -330q8 -14 -4 -22l-6 10z" fill="${C.yellow1}"/>`;
    return wrap(x, y, s, body);
  }

  // Corridor: a white wall and a row of red pillars across the horizon
  function corridor(y, w = 1440) {
    let posts = "";
    for (let px = 6; px < w; px += 26) posts += `<rect x="${px}" y="${y - 30}" width="5" height="30" fill="${C.red3}"/>`;
    return `<rect x="0" y="${y - 38}" width="${w}" height="8" fill="${C.blue21}"/><rect x="0" y="${y - 30}" width="${w}" height="30" fill="${C.paleYellow1}"/>${posts}<rect x="0" y="${y - 4}" width="${w}" height="4" fill="${C.blue27}"/>`;
  }

  // ── Scene attach and entrance ─────────────────────────
  function scene(el, w, h, draw, o = {}) {
    R = seeded(o.seed || 7);
    const svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="${o.fit || "xMidYMin slice"}" aria-hidden="true">${draw()}</svg>`;
    el.insertAdjacentHTML("beforeend", svg);
    return o.pixi ? toPixi(el.lastElementChild) : el.lastElementChild;
  }

  // ── pixi stage ─────────────────────────
  // Original puts the big visuals (Hero, border, shop, neighborhood map, history) on a pixi 8.7.3 canvas as piece sprites and bounces them with GSAP.
  // Using the same panel, bake an SVG-drawn scene into sprites in the same place and order. Each piece (.pc) has three nested containers: place · mv (travel) · inner (bounce),
  // Tweens are applied to a proxy object that mirrors the inner layer as x·y·rotation(deg)·opacity, so pop·rise·roam run with the same values as the SVG version. The legs (.lg) are baked separately and swung
  const DPR = Math.min(devicePixelRatio || 1, 2), MAXTEX = 4096;
  const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';
  const INHERIT = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "font-size", "font-weight", "text-anchor", "style"];
  const rootStyle = getComputedStyle(document.documentElement);
  // Inside the graphic attribute, quotes in the font list become single quotes
  const resolveVars = (s) => s.replace(/var\((--[\w-]+)\)/g, (m, v) => (rootStyle.getPropertyValue(v).trim() || m).replace(/"/g, "'"));
  const matOf = (el) => { const tr = el.transform && el.transform.baseVal.consolidate(); return tr ? tr.matrix : null; };
  function boxIn(el) {
    if (!el.getBBox) return null;
    let b;
    try { b = el.getBBox(); } catch (_) { return null; }
    if (!b.width && !b.height) return null;
    const m = matOf(el);
    if (!m) return { x: b.x, y: b.y, w: b.width, h: b.height };
    const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  function union(bs) {
    bs = bs.filter(Boolean);
    if (!bs.length) return null;
    const x = Math.min(...bs.map((b) => b.x)), y = Math.min(...bs.map((b) => b.y));
    return { x, y, w: Math.max(...bs.map((b) => b.x + b.w)) - x, h: Math.max(...bs.map((b) => b.y + b.h)) - y };
  }
  // Measuring on a hidden panel (size 0) gives a scale of 0 and bakes blurry — use 1 in that case
  const unitScale = (node) => { const m = node.getScreenCTM(), s = m ? Math.hypot(m.a, m.b) : 1; return s > 0.05 ? s : 1; };
  const attrsOf = (g) => INHERIT.filter((n) => g.hasAttribute(n)).map((n) => `${n}="${g.getAttribute(n)}"`).join(" ");
  // Big boards are cut and baked so as not to exceed the single-texture limit (4096px) — overlap a few units so seams don’t show
  function bake(parent, markup, box, scale, defs, inh) {
    const pad = 4, bx = box.x - pad, by = box.y - pad, bw = box.w + pad * 2, bh = box.h + pad * 2;
    const k = Math.max(0.5, scale * DPR);
    const nx = Math.ceil((bw * k) / MAXTEX), ny = Math.ceil((bh * k) / MAXTEX);
    const body = resolveVars(inh ? `<g ${inh}>${markup}</g>` : markup);
    for (let ty = 0; ty < ny; ty++) for (let tx = 0; tx < nx; tx++) {
      const w0 = bw / nx, h0 = bh / ny, x0 = bx + w0 * tx, y0 = by + h0 * ty;
      const W = Math.ceil((w0 + 1) * k), H = Math.ceil((h0 + 1) * k);
      const sp = new PIXI.Sprite();
      sp.position.set(x0, y0);
      sp.visible = false;
      parent.addChild(sp);
      const img = new Image(W, H);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg ${XMLNS} width="${W}" height="${H}" viewBox="${x0} ${y0} ${w0 + 1} ${h0 + 1}" preserveAspectRatio="none">${defs}${body}</svg>`);
      img.decode().then(() => {
        sp.texture = PIXI.Texture.from(img);
        sp.width = w0 + 1;
        sp.height = h0 + 1;
        sp.visible = true;
      }).catch(() => {});
    }
  }
  const fromMatrix = (c, m) => { if (m) c.setFromMatrix(new PIXI.Matrix(m.a, m.b, m.c, m.d, m.e, m.f)); };
  function makePiece(p, parent, defs, inh) {
    const outer = new PIXI.Container(), mv = new PIXI.Container(), inner = new PIXI.Container();
    fromMatrix(outer, matOf(p));
    outer.addChild(mv);
    mv.addChild(inner);
    parent.addChild(outer);
    const pin = p.querySelector(".pc-in");
    const b = pin.getBBox();
    // The inner fold rotates around the bottom center of the box — same as the SVG transformOrigin 50% 100%
    const ox = b.x + b.width / 2, oy = b.y + b.height;
    inner.pivot.set(ox, oy);
    inner.position.set(ox, oy);
    const k = unitScale(pin), inh2 = [inh, attrsOf(p)].filter(Boolean).join(" ");
    const legs = [...pin.children].filter((n) => n.classList.contains("lg"));
    p._plegs = legs.map((l) => {
      const lc = new PIXI.Container(), lb = l.getBBox(), m = matOf(l);
      lc.pivot.set(lb.x + lb.width / 2, lb.y);
      lc.position.set(lb.x + lb.width / 2, lb.y);
      if (m) lc.angle = (Math.atan2(m.b, m.a) * 180) / Math.PI;
      inner.addChild(lc);
      if (lb.width || lb.height) bake(lc, l.innerHTML, { x: lb.x, y: lb.y, w: lb.width, h: lb.height }, k, defs, inh2);
      return { get rotation() { return lc.angle; }, set rotation(v) { lc.angle = v; } };
    });
    const rest = [...pin.children].filter((n) => !legs.includes(n));
    const box = union(rest.map(boxIn));
    if (box) bake(inner, rest.map((n) => n.outerHTML).join(""), box, k, defs, inh2);
    p._px = {
      get x() { return inner.x - ox; }, set x(v) { inner.x = ox + v; },
      get y() { return inner.y - oy; }, set y(v) { inner.y = oy + v; },
      get rotation() { return inner.angle; }, set rotation(v) { inner.angle = v; },
      get opacity() { return inner.alpha; }, set opacity(v) { inner.alpha = v; },
    };
    p._pmv = { get x() { return mv.x; }, set x(v) { mv.x = v; } };
  }
  function walk(node, parent, defs, inh) {
    let run = [];
    const flush = () => {
      const box = union(run.map(boxIn));
      if (box) bake(parent, run.map((n) => n.outerHTML).join(""), box, unitScale(node), defs, inh);
      run = [];
    };
    for (const ch of node.children) {
      if (ch.tagName === "defs") continue;
      if (ch.classList.contains("pc")) { flush(); makePiece(ch, parent, defs, inh); }
      else if (ch.querySelector(".pc")) {
        flush();
        const c = new PIXI.Container();
        fromMatrix(c, matOf(ch));
        if (ch.hasAttribute("opacity")) c.alpha = +ch.getAttribute("opacity");
        parent.addChild(c);
        walk(ch, c, defs, [inh, attrsOf(ch)].filter(Boolean).join(" "));
      } else run.push(ch);
    }
    flush();
  }
  // Copies the SVG’s viewBox · preserveAspectRatio as is onto the canvas stage — scenes that change the viewBox on phones (history) are refit when the size changes too
  function fitRoot(svg, root, W, H) {
    const vb = svg.viewBox.baseVal, [align = "xMidYMid", mode = "meet"] = (svg.getAttribute("preserveAspectRatio") || "").split(" ");
    const sx = W / vb.width, sy = H / vb.height, s = mode === "slice" ? Math.max(sx, sy) : Math.min(sx, sy);
    const ax = /xMin/.test(align) ? 0 : /xMax/.test(align) ? 1 : 0.5, ay = /YMin/.test(align) ? 0 : /YMax/.test(align) ? 1 : 0.5;
    root.scale.set(s);
    root.position.set((W - vb.width * s) * ax - vb.x * s, (H - vb.height * s) * ay - vb.y * s);
  }
  function toPixi(svg) {
    if (!window.PIXI) return svg;
    const el = svg.parentElement, defsEl = svg.querySelector("defs");
    const root = new PIXI.Container();
    walk(svg, root, defsEl ? resolveVars(defsEl.outerHTML) : "", "");
    svg.style.visibility = "hidden";
    // Camera that moves the stage (when the neighborhood map moves to a pin) — pushes further by cam from the fitted position
    const cam = (svg._cam = { x: 0, y: 0 });
    svg._refit = () => {};
    const app = new PIXI.Application();
    app.init({ backgroundAlpha: 0, resizeTo: el, resolution: DPR, autoDensity: true, antialias: true }).then(() => {
      app.canvas.classList.add("scene__px");
      el.appendChild(app.canvas);
      app.stage.addChild(root);
      const refit = (svg._refit = () => {
        fitRoot(svg, root, el.clientWidth, el.clientHeight);
        root.position.x += cam.x;
        root.position.y += cam.y;
      });
      refit();
      new ResizeObserver(refit).observe(el);
    });
    return svg;
  }

  const rad2deg = 180 / Math.PI;
  // Two original random helpers — um picks evenly from a to b, mm flips the sign of a with even odds (mm(3, 8) → 3~8 or −3~2). Only the motion side uses Math.random like the original
  const um = (a, b) => Math.random() * (b - a) + a;
  const mm = (a, b) => Math.random() * (b - a) + a * (Math.random() < 0.5 ? -1 : 1);
  // GSAP corrects the position if an SVG’s origin changes mid-tween — so set the toe-based origin just once, when there is no transform
  const IN = (p) => p._px || p.querySelector(".pc-in");
  const MV = (p) => p._pmv || p.querySelector(".mv");
  function origin(t) {
    if (!t.nodeType || t.dataset.o) return;
    t.dataset.o = 1;
    gsap.set(t, { transformOrigin: "50% 100%" });
  }
  // Original qP.show: pick x 10~30 and y 80~100 per group, then add 5~10 per piece. Rotation 0.3~0.5π, 0.015s between pieces
  function pop(pieces, delay = 0) {
    pieces = [...pieces];
    if (!pieces.length) return;
    const gx = mm(10, 30), gy = Math.round(um(80, 100));
    pieces.forEach((p, i) => {
      const t = IN(p);
      const d = delay + 0.015 * i, rot = mm(0.3, 0.5);
      gsap.killTweensOf(t);
      origin(t);
      if (reduce) { gsap.set(t, { x: 0, y: 0, rotation: 0, opacity: 1 }); return; }
      gsap.fromTo(t, { y: gy + mm(5, 10) }, { y: 0, duration: 2.25, delay: d, ease: "elastic.out(4, 0.75)" });
      gsap.fromTo(t, { x: gx + mm(5, 10) }, { x: 0, duration: 2.25, delay: d, ease: "power4.out" });
      gsap.fromTo(t, { rotation: (rot + mm(0.01, 0.02)) * Math.PI * rad2deg }, { rotation: 0, duration: 2.25, delay: d, ease: "elastic.out(1, 1)" });
      gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: d, ease: "expo.out" });
    });
    setTimeout(() => roam(pieces), (delay + 1.2) * 1000);
  }
  // Original history pieces (nF): starting from the top pieces on screen at .06s intervals they settle in .75s from y 10~15 · rotation .025~.05π · x 3~8 (y·rotation back.out(8), x power2.out, opacity .3s expo.out).
  // On exit, they float up 20 and vanish over .25s sine.in at .025s intervals. The cloud (aF) enters from 60 outside over 3s expo.out and leaves to 20 outside over .5s sine.in
  const byTop = (pieces) => [...pieces].sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top);
  // Original Wm (art that enters when a drawer opens or on scroll) uses the same shape at y 30~40 and x 13~18, with .05s between pieces (in placement order)
  function rise(pieces, delay = 0, o = {}) {
    const [y0, y1] = o.y || [10, 15], [x0, x1] = o.x || [3, 8], each = o.each ?? 0.06;
    (o.order ? [...pieces] : byTop(pieces)).forEach((p, i) => {
      const t = IN(p);
      const d = delay + each * i;
      gsap.killTweensOf(t);
      origin(t);
      if (reduce) { gsap.set(t, { x: 0, y: 0, rotation: 0, opacity: 1 }); return; }
      gsap.fromTo(t, { y: Math.round(um(y0, y1)), rotation: mm(0.025, 0.05) * Math.PI * rad2deg }, { y: 0, rotation: 0, duration: 0.75, delay: d, ease: "back.out(8)" });
      gsap.fromTo(t, { x: mm(x0, x1) }, { x: 0, duration: 0.75, delay: d, ease: "power2.out" });
      gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: d, ease: "expo.out" });
    });
  }
  function sink(pieces, delay = 0) {
    byTop(pieces).forEach((p, i) => {
      const t = IN(p);
      gsap.killTweensOf(t);
      origin(t);
      if (reduce) { gsap.set(t, { opacity: 0 }); return; }
      gsap.to(t, { y: -20, opacity: 0, duration: 0.25, delay: delay + 0.025 * i, ease: "sine.in" });
    });
  }
  function drift(pieces, delay = 0, on = true) {
    [...pieces].forEach((p) => {
      const t = IN(p);
      const side = p.getBoundingClientRect().left + p.getBoundingClientRect().width / 2 > innerWidth / 2 ? 1 : -1;
      gsap.killTweensOf(t);
      if (reduce) { gsap.set(t, { x: 0, opacity: on ? 1 : 0 }); return; }
      if (on) {
        gsap.fromTo(t, { x: 60 * side }, { x: 0, duration: 3, delay, ease: "expo.out" });
        gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 3, delay, ease: "sine.out" });
      } else gsap.to(t, { x: 20 * side, opacity: 0, duration: 0.5, delay, ease: "sine.in" });
    });
  }
  function hideNow(pieces) { [...pieces].forEach((p) => gsap.set(IN(p), { opacity: 0 })); }

  // Walkers and cyclists sway left and right in place, clouds drift slowly
  function roam(pieces) {
    if (reduce) return;
    pieces.forEach((p) => {
      if (p.dataset.roam) return;
      const mv = MV(p);
      if (p.classList.contains("is-walk")) {
        p.dataset.roam = 1;
        const dist = rr(30, 70);
        gsap.to(mv, { x: dist, duration: dist / (p.classList.contains("is-glide") ? 6 : 12), ease: "sine.inOut", yoyo: true, repeat: -1 });
        (p._plegs || p.querySelectorAll(".lg")).forEach((l, i) => {
          if (l.nodeType) {
            l.removeAttribute("transform");
            gsap.set(l, { transformOrigin: "50% 0%" });
          }
          gsap.fromTo(l, { rotation: i ? 14 : -14 }, { rotation: i ? -14 : 14, duration: 0.32, yoyo: true, repeat: -1, ease: "sine.inOut" });
        });
      } else if (p.classList.contains("is-cloud")) {
        p.dataset.roam = 1;
        gsap.to(mv, { x: rr(40, 90), duration: rr(18, 30), ease: "sine.inOut", yoyo: true, repeat: -1 });
      } else if (p.classList.contains("is-bike")) {
        p.dataset.roam = 1;
        gsap.to(mv, { x: rr(160, 260), duration: rr(9, 14), ease: "none", yoyo: true, repeat: -1 });
      }
    });
  }

  // Pop out once when the scene enters the screen
  function popOnEnter(svg, start = "top 85%") {
    const pcs = svg.querySelectorAll(".pc");
    if (reduce) return pop(pcs);
    hideNow(pcs);
    ScrollTrigger.create({ trigger: svg.parentElement, start, once: true, onEnter: () => pop(pcs) });
  }

  // ── Person bouncing up over the button (original Wm: y 30~40, x 13~18, rotation 0.025~0.05π, 0.75s back.out(8)) ──
  const tinyPerson = () => {
    const sk = pick(SKIN), sh = pick(CLOTH), pa = pick(PANTS), ha = pick(HAIR);
    return `<svg viewBox="-15 -45 30 45"><g transform="scale(1.45)"><rect x="-3.3" y="-11.5" width="2.7" height="11.5" rx="1.1" fill="${pa}"/><rect x="0.6" y="-11.5" width="2.7" height="11.5" rx="1.1" fill="${pa}"/><rect x="-4.6" y="-21.6" width="9.2" height="11.8" rx="2.6" fill="${sh}"/><path d="M-4.1 -19.2L-7.6 -24M4.1 -19.2L7.8 -24" stroke="${sk}" stroke-width="2.1" stroke-linecap="round"/><circle cy="-25.6" r="3.8" fill="${sk}"/><path d="M-4 -25.8a4 4 0 0 1 8 0z" fill="${ha}"/></g></svg>`;
  };
  // Original hA: pill button — the dot bounces once at half the remaining height to the third letter, then once more to the end (.1375s cubic.out/in, sideways .275s linear),
  // Around when the dot lands, that letter flattens for .11s after .22s then springs back, and a person steps up onto it in .22s back.out(2). The text moves 10px left over .55s expo.out.
  // On release the dot bends down by half its width and returns in .35s, while the person goes down in .175s sine.in and swaps to another person. Not applied on phones (original Hm.isSp)
  function pillHover(btn) {
    const label = btn.querySelector(".btn__label");
    if (!label || label.querySelector(".btn__ball")) return;
    const word = label.textContent.trim();
    const k = Math.min(+(btn.dataset.characterIndex || 2), Math.max(0, word.length - 1));
    label.textContent = "";
    const ball = Object.assign(document.createElement("span"), { className: "btn__ball" });
    const text = Object.assign(document.createElement("span"), { className: "btn__text" });
    const ch = Object.assign(document.createElement("span"), { className: "btn__char", textContent: word[k] || "" });
    text.append(word.slice(0, k), ch, word.slice(k + 1));
    label.append(ball, text);
    if (reduce || isSp() || !matchMedia("(hover: hover)").matches) return;
    const mask = Object.assign(document.createElement("span"), { className: "btn__mask" });
    mask.innerHTML = '<span class="btn__people"></span>';
    btn.prepend(mask);
    const man = mask.firstElementChild;
    // At first it stands upright, and once it has gone down, the next person waits tilted ±20° (rotation after original Gt)
    const dress = (tilt) => { man.innerHTML = tinyPerson(); if (tilt) gsap.set(man, { rotation: 40 * Math.random() - 20 }); };
    dress(false);
    gsap.set(man, { y: 45 });
    let tl = null, at = 0;
    // The picture slot is set up above the third character in advance — so the slot doesn’t jump into place when the hand hovers
    const place = () => {
      const n = btn.getBoundingClientRect(), a = ch.getBoundingClientRect();
      at = a.x - n.x - 2 - (+gsap.getProperty(text, "x") || 0);
      gsap.set(mask, { x: at + (+gsap.getProperty(text, "x") || 0) });
    };
    document.fonts.ready.then(place);
    new ResizeObserver(place).observe(btn);
    btn.addEventListener("mouseenter", () => {
      if (tl) tl.kill();
      place();
      const i = label.getBoundingClientRect(), a = ch.getBoundingClientRect();
      const s = a.x - i.x + 0.5 * a.width - 5, o = i.width - 1, m = 0.55, f2 = 0.1375;
      gsap.set(man, { y: 45 });
      tl = gsap.timeline()
        .to(text, { x: -10, duration: m, ease: "expo.out" }, 0)
        .to(mask, { x: at - 10, duration: m, ease: "expo.out" }, 0)
        .to(ball, { y: -s / 2, duration: f2, ease: "cubic.out" }, 0)
        .to(ball, { y: 0, duration: f2, ease: "cubic.in" }, f2)
        .to(ball, { y: -(o - s) / 2, duration: f2, ease: "cubic.out" }, 2 * f2)
        .to(ball, { y: 0, duration: f2, ease: "cubic.in" }, 3 * f2)
        .to(ball, { x: s, duration: 0.275, ease: "none" }, 0)
        .to(ball, { x: o, duration: 0.275, ease: "none" }, 0.275)
        .to(man, { y: 0, rotation: 0, duration: 0.4 * m, ease: "back.out(2)" }, 0.275)
        .to(ch, { scaleY: 0, duration: 0.2 * m, ease: "cubic.out" }, 0.4 * m)
        .to(ch, { scaleY: 1, duration: 0.2 * m, ease: "cubic.out" }, 0.6 * m);
    });
    btn.addEventListener("mouseleave", () => {
      if (tl) tl.kill();
      const s = 0.5 * (label.getBoundingClientRect().width - 1), o = 0.35, l = 0.175;
      tl = gsap.timeline()
        .to(ball, { y: s, duration: l, ease: "sine.out" }, 0)
        .to(ball, { y: 0, duration: l, ease: "sine.in" }, l)
        .to(ball, { x: 0, duration: o, ease: "sine.inOut" }, 0)
        .to(text, { x: 0, duration: o, ease: "expo.out" }, 0)
        .to(ch, { scaleY: 1, duration: l, ease: "cubic.out" }, 0)
        .to(mask, { x: at, duration: o, ease: "expo.out" }, 0)
        .to(man, { y: 45, rotation: 0, duration: l, ease: "sine.in", onComplete: () => dress(true) }, 0);
    });
  }

  // Original dA: header · drawer · footer menu letters — on hover each letter bobs up and down by sin(16t + index × .35π), the height rising to 3px in .075s sine.inOut
  // Settles to 0 over .4s sine.inOut (the original is 5px on the Japanese screen and 3px elsewhere — this copy is Korean so 3px). Not applied on phone
  function dance(a) {
    if (reduce || isSp() || a.dataset.dance) return;
    a.dataset.dance = "1";
    const chars = [];
    [...a.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach((c) => {
        if (/\s/.test(c)) { frag.append(c); return; }
        const s = Object.assign(document.createElement("span"), { textContent: c });
        s.style.display = "inline-block";
        s.style.pointerEvents = "none";
        chars.push(s);
        frag.append(s);
      });
      n.replaceWith(frag);
    });
    const st = { h: 0, phase: 0 };
    const draw = () => {
      const t = st.phase + Date.now() / 1000;
      chars.forEach((s, i) => (s.style.transform = `translateY(${Math.sin(16 * t + i * 0.35 * Math.PI) * st.h}px)`));
    };
    let tl = null;
    a.addEventListener("mouseenter", () => {
      st.phase = Math.random() * Math.PI * 2;
      if (tl) tl.kill();
      tl = gsap.timeline().to(st, { h: 3, duration: 0.075, ease: "sine.inOut", onUpdate: draw }).to(st, { h: 0, duration: 0.4, ease: "sine.inOut", onUpdate: draw });
    });
  }



  // ── Header · drawer · footer ─────────────────────────
  const MARK = `<svg class="hd__mark" viewBox="0 0 120 56" aria-label="Logo slot"><path d="M6 18H48M27 6V30M14 30Q27 22 40 30M58 10H98L110 30M70 10L64 30M84 10L80 30" stroke="var(--site-logo)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="52" text-anchor="middle" style="font-family:var(--kf-font-display)" font-weight="700" font-size="13" letter-spacing="2" fill="currentColor">LOGO</text></svg>`;
  const LINKS = [["index.html", "Home"], ["news.html", "News"], ["product.html", "Shops · Restaurants"], ["#", "Menu 4"], ["index.html#access", "Directions"], ["#", "Menu 6"], ["#", "Menu 7"]];
  const LINKS2 = [["index.html#map", "Neighborhood map"], ["about.html", "History"], ["#", "Inquiry"]];
  const page = document.body.dataset.page;

  function chrome() {
    const hd = document.querySelector('[data-slot="header"]');
    if (hd) {
      hd.className = "hd";
      hd.innerHTML = `
        <a class="hd__logo" href="index.html">${MARK}<span class="hd__tag">Add your one-line intro here<br>Place it in two lines</span></a>
        <nav class="hd__nav"><a href="index.html#access">Menu 1</a><a href="news.html"${page === "news" || page === "article" ? " aria-current" : ""}>Menu 2</a><a href="product.html"${page === "product" ? " aria-current" : ""}>Menu 3</a><a href="#">Menu 4</a></nav>`;
      hd.insertAdjacentHTML("afterend", `
        <button class="nav-btn" type="button" aria-label="Open Menu" data-slot="nav-button"><span class="nav-btn__mask"><span class="nav-btn__people"></span></span><svg class="nav-btn__svg" viewBox="0 0 72 44" aria-hidden="true"><path/><path/><path/></svg></button>
        <div class="drawer-ov" data-slot="drawer-overlay"></div>
        <aside class="drawer" data-slot="drawer" aria-hidden="true"><div class="drawer__in">
          <a class="drawer__logo" href="index.html">${MARK}</a>
          <div class="drawer__cols"><div>${LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join("<br>")}</div><div>${LINKS2.map(([h, t]) => `<a href="${h}">${t}</a>`).join("<br>")}</div></div>
          <svg class="drawer__sns" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor"/></svg>
          <div class="drawer__foot"><a href="#">Privacy Policy ↗</a><span>KO · EN</span></div>
          <div class="drawer__scene" data-slot="drawer-scene"></div>
        </div></aside>`);
    }
    const ft = document.querySelector('[data-slot="footer"]');
    if (ft) {
      ft.className = "ft";
      const L = [["g", 1, 6, 12], ["A", 10.6, 20, 10], ["r", 51.5, 0, 10.4], ["d", 62.6, 34, 9], ["E", 39.6, 68, 11], ["n", 2.4, 68, 12, 1], ["o", 12.6, 84, 9, 1]];
      ft.innerHTML = `<div class="ft__panel nw-grain">
          <div class="ft__letters" aria-hidden="true">${L.map(([c, x, y, s, lime]) => `<span class="${lime ? "is-lime" : ""}" style="left:${x}%;top:${y}%;font-size:${s}rem">${c}</span>`).join("")}</div>
          <div class="ft__scene" data-slot="footer-scene"></div>
          <nav class="ft__nav"><div>${LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join("<br>")}</div><div>${LINKS2.map(([h, t]) => `<a href="${h}">${t}</a>`).join("<br>")}</div></nav>
          <svg class="ft__sns" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor"/></svg>
          <div class="ft__aside"><div class="ft__aside-row"><a href="#">Privacy Policy ↗</a><span class="ft__lang"><span>KO</span><b>EN</b></span></div><p class="ft__copy">© Company Name 00. All Rights Reserved.</p></div>
          <a class="top-btn" href="#" data-top data-slot="top-button">TOP</a>
        </div>`;
    }
  }

  // Footer drawing: three shop buildings, a parked car, trees and people, and a bicycle running along the top edge
  function footerScene(el) {
    return scene(el, 740, 560, () => {
      let s = "";
      [[120, 70], [300, 74], [520, 86], [610, 82], [660, 92]].forEach(([x, y]) => (s += tree(x, y, 1.1)));
      s += bike(560, 88, 1.1) + person(470, 82, 1);
      s += wing(250, 300, { L: 360, D: 80, H: 40 });
      s += wing(60, 440, { L: 190, D: 70, H: 38 });
      s += wing(400, 370, { L: 140, D: 60, H: 34, u: [0.84, -0.54] });
      [[300, 205, C.white6], [270, 220, C.blue13], [330, 228, C.blue4], [250, 250, C.red6]].forEach(([x, y, c]) => (s += car(x, y, 1.1, c)));
      for (let i = 0; i < 16; i++) s += person(rr(80, 700), rr(180, 520), 1.05);
      s += tree(460, 400, 1.2) + tree(140, 330, 1) + bush(640, 470, 1.1);
      return s;
    }, { fit: "xMinYMin meet", seed: 11 });
  }

  function drawerScene(el) {
    return scene(el, 560, 120, () => {
      // The original drawer art is five chunks (js-navIllust 1~5) — each chunk pops in at once
      const crowd = (from, n) => { let s = ""; for (let i = 0; i < n; i++) s += person(from + i * 40 + rr(-8, 8), 118, 1.4, { roam: false }); return s; };
      return wrap(0, 0, 1, bush(60, 118, 1.3) + tree(150, 118, 1.2)) + wrap(0, 0, 1, crowd(200, 2)) + wrap(0, 0, 1, crowd(280, 3)) + wrap(0, 0, 1, crowd(400, 2)) + wrap(0, 0, 1, tree(520, 112, 1) + bush(480, 118, 1.1));
    }, { fit: "xMidYMax meet", seed: 3 });
  }

  // Original fA: the three lines of the menu button (curves at y 16·22·28 on a 72×44 plate). On hover the three gather into the bottom line in .075s and become one line, which then bounces like a trampoline
  // Bends 6 → −2 → 0 (.075 expo.out · .1 · .05 expo.inOut), then the person tilted ±20° over the button rises into place after .1s with .3s back.out(2).
  // On release the line bends once from 4 → 0 and the person goes down in .25s cubic.out (going down swaps to another person) and the line returns in place in .35~.4s expo.out.
  // On open, the lines gather to the center (22) in .15s then form an X at ±30° in .25s cubic.inOut. On close they straighten in .2s cubic.out then return to place
  function navButton(btn) {
    const Y = [16, 22, 28];
    const L = [...btn.querySelectorAll(".nav-btn__svg path")].map((el, i) => {
      const o = { y: Y[i], m: 0, r: 0, on: true };
      o.draw = () => {
        el.setAttribute("d", `M24 ${f(o.y)}C32 ${f(o.y + o.m)} 40 ${f(o.y + o.m)} 48 ${f(o.y)}`);
        el.setAttribute("transform", `rotate(${f(o.r)} 36 ${f(o.y)})`);
        el.style.display = o.on ? "" : "none";
      };
      o.draw();
      return o;
    });
    const [top, mid, bot] = L;
    const man = btn.querySelector(".nav-btn__people");
    const dress = () => (man.innerHTML = tinyPerson());
    dress();
    gsap.set(man, { y: 45 });
    let tl = null, open = false;
    const to = (o, v, at) => tl.to(o, { ...v, onUpdate: o.draw }, at);
    const show = (...a) => a.forEach((o) => { o.on = true; o.draw(); });
    const hide = (...a) => a.forEach((o) => { o.on = false; o.draw(); });
    const fresh = () => { if (tl) tl.kill(); tl = gsap.timeline(); return tl; };
    const sink = (at) => tl.to(man, { y: 45, rotation: 0, duration: 0.25, ease: "cubic.out", onComplete: dress }, at);
    const settle = (at) => {
      to(top, { y: 16, duration: 0.35, ease: "expo.out" }, at);
      to(mid, { y: 22, duration: 0.4, delay: 0.05, ease: "expo.out" }, at);
      to(bot, { y: 28, duration: 0.35, ease: "expo.out" }, at);
    };
    btn.addEventListener("mouseenter", () => {
      if (open || reduce) return;
      fresh();
      L.forEach((o) => to(o, { y: 28, r: 0, duration: 0.075, ease: "sine.in" }, 0));
      tl.call(() => { hide(top, mid); show(bot); }, null, 0.075);
      to(bot, { m: 6, duration: 0.075, ease: "expo.out" }, 0.075);
      to(bot, { m: -2, duration: 0.1, ease: "expo.inOut" }, ">");
      to(bot, { m: 0, duration: 0.05, ease: "expo.inOut" }, ">");
      tl.set(man, { rotation: 40 * Math.random() - 20 }, 0).to(man, { y: 0, rotation: 0, duration: 0.3, delay: 0.1, ease: "back.out(2)" }, 0);
    });
    btn.addEventListener("mouseleave", () => {
      if (open || reduce) return;
      fresh();
      to(bot, { m: 4, duration: 0.075, ease: "expo.out" }, 0);
      to(bot, { m: 0, duration: 0.05, ease: "expo.out" }, ">");
      tl.call(() => show(top, mid), null, 0.125);
      sink(0);
      settle(0.125);
    });
    // Original: if you open or close while a button motion is running, the current one finishes at 2× speed and then the next one runs (_onWaitAnimation · nextAnimation)
    const morph = (v) => {
      open = v;
      fresh();
      if (v) {
        to(bot, { m: 4, duration: 0.075, ease: "expo.out" }, 0);
        to(bot, { m: 0, duration: 0.05, ease: "expo.out" }, ">");
        tl.call(() => { show(top, mid); hide(bot); }, null, 0.125);
        sink(0);
        L.forEach((o) => to(o, { y: 22, duration: 0.15, ease: "cubic.out" }, 0.125));
        to(top, { r: 30, duration: 0.25, ease: "cubic.inOut" }, 0.275);
        to(mid, { r: -30, duration: 0.25, ease: "cubic.inOut" }, 0.275);
      } else {
        to(top, { r: 0, duration: 0.2, ease: "cubic.out" }, 0);
        to(mid, { r: 0, duration: 0.2, ease: "cubic.out" }, 0);
        tl.call(() => { bot.y = 22; show(bot); }, null, 0.2);
        settle(0.2);
      }
      if (reduce) tl.progress(1);
    };
    return (v) => {
      if (tl && tl.isActive() && !reduce) {
        open = v;
        tl.timeScale(2).eventCallback("onComplete", () => morph(v));
        return;
      }
      morph(v);
    };
  }

  function navInit() {
    const btn = document.querySelector(".nav-btn");
    if (!btn) return;
    const morph = navButton(btn);
    const drawer = document.querySelector(".drawer"), ov = document.querySelector(".drawer-ov");
    const ds = drawer.querySelector('[data-slot="drawer-scene"]');
    let dsvg;
    const set = (open) => {
      document.documentElement.classList.toggle("is-nav-open", open);
      document.body.classList.toggle("is-lock", open);
      drawer.setAttribute("aria-hidden", String(!open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      morph(open);
      if (open) {
        dsvg = dsvg || drawerScene(ds);
        rise(dsvg.querySelectorAll(":scope > .pc"), 0, { y: [30, 40], x: [13, 18], each: 0.05, order: true });
      }
    };
    btn.addEventListener("click", () => set(!document.documentElement.classList.contains("is-nav-open")));
    ov.addEventListener("click", () => set(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  // ── History scroll ─────────────────────────
  // Original: past the header cell the modern park piece drops out, and an old palace and courtiers pop out over the same horizon
  function history(root) {
    const vis = root.querySelector(".hist__visual");
    const svg = scene(vis.querySelector(".scene"), 1440, 900, () => {
      let s = `<defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue40}"/><stop offset="1" stop-color="${C.blue37}"/></linearGradient></defs>
        <rect width="1440" height="900" fill="url(#hsky)"/>`;
      s += `<g class="h-sky">${cloud(940, 400, 1.2)}${cloud(330, 520, 1)}${cloud(1160, 230, 0.8)}</g>`;
      s += `<g fill="${C.white2}" opacity=".9"><rect x="0" y="420" width="260" height="10" rx="5"/><rect x="40" y="436" width="200" height="8" rx="4"/><rect x="1180" y="470" width="260" height="10" rx="5"/><rect x="1220" y="486" width="180" height="8" rx="4"/></g>`;
      s += `<rect y="660" width="1440" height="240" fill="${C.blue32}"/><rect y="660" width="1440" height="6" fill="${C.blue25}"/>`;
      // Modern: low park wall and a cluster of trees, white building, blue tower, bright road stretching to the center
      let m = `<polygon points="640,900 800,900 740,664 700,664" fill="${C.blue41}"/>`;
      m += wrap(0, 0, 1, `<rect x="390" y="630" width="660" height="34" fill="${C.gray4}"/><rect x="390" y="626" width="660" height="6" fill="${C.blue34}"/><path d="M620 664L650 630H790L820 664Z" fill="${C.blue36}"/>`);
      m += wrap(160, 664, 1, `<rect x="0" y="-70" width="44" height="70" fill="${C.white3}"/><rect x="50" y="-110" width="40" height="110" fill="${C.light2}"/><rect x="96" y="-56" width="60" height="56" fill="${C.white4}"/>`);
      [[150, 664, 1.6], [240, 664, 1.9], [330, 664, 1.5], [430, 664, 1.4], [520, 664, 1.3], [1080, 664, 1.2], [1170, 664, 1.5]].forEach(([x, y, k]) => (m += bush(x, y, k)));
      m += tower(955, 664, 120, 330);
      [[260, 664], [600, 664], [1290, 664]].forEach(([x, y]) => (m += tree(x, y, 1.3)));
      for (let i = 0; i < 14; i++) m += person(rr(120, 1320), rr(700, 860), 1.5);
      // Old: corridors, main hall, court attendants
      let a = wrap(0, 0, 1, corridor(664));
      a += palace(720, 690, 1.06);
      for (let i = 0; i < 16; i++) a += courtier(i < 8 ? rr(330, 640) : rr(800, 1120), rr(720, 860), 1.6);
      return s + `<g class="h-modern">${m}</g><g class="h-ancient">${a}</g>`;
    }, { fit: "xMidYMax slice", seed: 21, pixi: true });
    // On phone, as in the original, crop only the center of the still so it fits the screen width, aligned to the bottom
    const fitSp = () => {
      svg.setAttribute("viewBox", isSp() ? "300 260 840 640" : "0 0 1440 900");
      svg.setAttribute("preserveAspectRatio", isSp() ? "xMidYMax meet" : "xMidYMax slice");
    };
    fitSp();
    addEventListener("resize", fitSp);

    const modern = svg.querySelectorAll(".h-modern > .pc");
    const ancient = svg.querySelectorAll(".h-ancient > .pc");
    const sky = svg.querySelectorAll(".h-sky > .pc");
    hideNow(ancient);
    const top = root.querySelector(".hist__top");
    const copy = root.querySelectorAll(".hist__copy, .hist__vtitle");
    const ar = root.querySelector(".hist__ar");

    ScrollTrigger.create({ trigger: root, start: "top 20%", once: true, onEnter: () => { rise(modern); drift(sky, 0.3); } });
    ScrollTrigger.create({
      trigger: top, start: "top+=180 top",
      onEnter: () => { sink(modern); gsap.to(copy, { opacity: 0, duration: 0.5 }); },
      onLeaveBack: () => { sink(ancient); rise(modern, 0.2); gsap.to(copy, { opacity: 1, duration: 0.5 }); },
    });
    ScrollTrigger.create({ trigger: top, start: "top+=480 top", onEnter: () => rise(ancient), onLeaveBack: () => sink(ancient) });
    if (ar) ScrollTrigger.create({ trigger: top, start: "top+=300 top", onEnter: () => ar.classList.add("is-hidden"), onLeaveBack: () => ar.classList.remove("is-hidden") });
    root.classList.add("hist-off");
    ScrollTrigger.create({ trigger: root, start: "top top", end: "bottom top", onToggle: (st) => root.classList.toggle("hist-off", !st.isActive) });
  }

  // Mall floor map: L-shaped wing layout and cells A~D — shared by the first-page shop list and the shop pages
  function floorMap(el) {
    const blk = (id, x, y, w, h, r = 0) => `<g transform="rotate(${r} ${x + w / 2} ${y + h / 2})"><rect class="blk" data-blk="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/><text x="${x + w / 2}" y="${y + h / 2 + 3}" text-anchor="middle">${id}</text></g>`;
    const svg = scene(el, 240, 540, () => {
      let s = `<path d="M40 30H190V500H60V420H120V120H40Z" fill="${C.white1}" stroke="${C.teal10}" stroke-width="2"/><path d="M130 70V470" stroke="${C.white6}" stroke-width="8"/>`;
      s += blk("A-1", 40, 40, 34, 30, -38) + blk("A-2", 76, 66, 34, 30, -38);
      s += blk("B-1", 150, 130, 34, 30) + blk("B-2", 150, 196, 34, 18) + blk("B-3", 150, 216, 34, 18) + blk("B-4", 150, 236, 34, 18);
      ["C-1", "C-2", "C-3", "C-4", "C-5"].forEach((id, i) => (s += blk(id, 140 - (i % 2) * 8, 290 + i * 30, 34, 26)));
      s += blk("D-1", 140, 450, 40, 30) + blk("D-2", 90, 462, 40, 30);
      s += tree(200, 22, 1) + tree(30, 110, 0.9) + tree(220, 520, 0.9) + person(170, 36, 0.9, { roam: false }) + person(80, 520, 1, { roam: false });
      // One hidden person per store — pops out when you hover that store (original p-floorMap__people, positions are the original map % moved onto this board)
      const fp = (area, l, tp) => `<g class="fp" data-area="${area}" opacity="0">${person(l * 2.4 + 12, tp * 5.4 + 50, 1.1, { roam: false }).replace('class="pc ', 'class="fp-in ')}</g>`;
      [["A-1", 45, -4], ["A-2", 64, 0], ["B-1", 70, 17], ["B-2", 85, 28], ["B-3", 85, 35], ["B-4", 48, 35], ["C-1", 45, 45], ["C-2", 78, 48], ["C-3", 76, 55], ["C-4", 74, 62], ["C-5", 72, 70], ["D-1", 56, 80], ["D-2", 20, 85]].forEach(([id, l, tp]) => (s += fp(id, l, tp)));
      return s;
    }, { fit: "xMidYMin meet", seed: 31 });
    // The original floor map is a single image so it doesn’t pop — only that building’s people pop when you hover a shop
    return svg;
  }
  // Original showMapIllust/hideMapIllust: pops in over .6s tilted with y 10~15 · x 3~8 · .025~.05π using back.out(8) (opacity .24s expo.out), and fades out over .25s cubic.out on release.
  // If released mid-bounce, it fades after the bounce finishes — if raised again mid-fade, it bounces again after the fade finishes
  const fpState = new WeakMap();
  function floorPerson(svg, id, on) {
    const t = svg && svg.querySelector(`.fp[data-area="${id}"]`);
    if (!t) return;
    const s = fpState.get(t) || { active: false, busy: false };
    fpState.set(t, s);
    s.active = on;
    if (s.busy) return;
    if (reduce) { gsap.set(t, { opacity: on ? 1 : 0 }); return; }
    s.busy = true;
    // Position (x·y) goes on the outer wrapper, tilt on the inner graphic around the foot (0,0) as axis — so the SVG axis correction does not mix into the position values
    const body = t.querySelector(".pc-in");
    gsap.killTweensOf([t, body]);
    if (on) {
      gsap.fromTo(t, { y: Math.round(um(10, 15)) }, { y: 0, duration: 0.6, ease: "back.out(8)", onComplete: () => { s.busy = false; if (!s.active) floorPerson(svg, id, false); } });
      const bb = body.getBBox();
      gsap.set(body, { transformOrigin: `${-bb.x}px ${-bb.y}px` });
      gsap.fromTo(body, { rotation: mm(0.025, 0.05) * 180 }, { rotation: 0, duration: 0.6, ease: "back.out(8)" });
      gsap.fromTo(t, { x: mm(3, 8) }, { x: 0, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: "expo.out" });
    } else {
      gsap.to(t, { opacity: 0, duration: 0.25, ease: "cubic.out", onComplete: () => { s.busy = false; if (s.active) floorPerson(svg, id, true); } });
    }
  }

  function langSwitch() {
    const btn = document.querySelector("[data-lang-button]"), list = document.querySelector("[data-lang-list]");
    if (!btn || !list) return;
    btn.addEventListener("click", () => {
      const open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      gsap.set(list, { opacity: open ? 1 : 0, display: open ? "block" : "none" });
    });
  }

  function topButtons() {
    document.querySelectorAll("[data-top]").forEach((a) =>
      a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); })
    );
  }

  chrome();
  navInit();
  topButtons();
  langSwitch();
  document.querySelectorAll(".btn").forEach(pillHover);
  document.querySelectorAll(".hd__nav a, .drawer__cols a, .ft__nav a").forEach(dance);
  // Original c-topButton: the person figure always stands on the button, and on hover the figure and arrow rise 4px over .3s (CSS)
  document.querySelectorAll(".top-btn").forEach((b) => {
    if (b.querySelector(".top-btn__illust")) return;
    b.insertAdjacentHTML("afterbegin", `<span class="top-btn__illust" aria-hidden="true">${tinyPerson()}</span>`);
  });
  const fs = document.querySelector('[data-slot="footer-scene"]');
  if (fs) popOnEnter(footerScene(fs), "top 95%");

  window.NW = { floorMap, floorPerson, target: IN, scene, pop, hideNow, popOnEnter, person, courtier, tree, bush, cloud, car, tent, bike, wing, tower, castle, palace, corridor, wrap, history, rr, pick, isSp, reduce, seed: (s) => (R = seeded(s)) };
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
})();
