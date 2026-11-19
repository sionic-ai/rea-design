// Used by all pages: line art sprite, current page menu marker, phone menu, smooth same-page anchors.
// The original art (PNG illustrations) isn’t used, it is redrawn with the same position, size and feel — 3px dark ink lines, five colors: peach, red, blue, sky, grass.
(() => {
  const L = 'class="mk-o"';
  const sprite = `
<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
<style>.mk-o{stroke:var(--site-ink);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.mk-t{stroke:var(--site-ink);stroke-width:2;fill:none;stroke-linecap:round}</style>
<symbol id="il-rest" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
  <rect width="400" height="380" style="fill:var(--site-paper)"/>
  <rect ${L} x="36" y="28" width="118" height="96" style="fill:var(--site-window)"/><path ${L} d="M95 28v96M36 76h118" fill="none"/>
  <rect ${L} x="196" y="40" width="68" height="54" style="fill:var(--site-white)"/><path class="mk-t" d="M206 84l16-20 12 12 10-8 12 14"/>
  <rect ${L} x="18" y="180" width="112" height="210" style="fill:var(--site-wood)"/><path ${L} d="M18 242h112M18 304h112" fill="none"/>
  <rect ${L} x="30" y="198" width="14" height="44" style="fill:var(--site-red)"/><rect ${L} x="44" y="192" width="14" height="50" style="fill:var(--site-white)"/><rect ${L} x="58" y="202" width="12" height="40" style="fill:var(--site-blue)"/>
  <rect ${L} x="30" y="260" width="16" height="44" style="fill:var(--site-blue)"/><rect ${L} x="46" y="264" width="14" height="40" style="fill:var(--site-red)"/>
  <path ${L} d="M92 180h28l-4-26h-20z" style="fill:var(--site-white)"/>
  <path ${L} d="M106 154c-14-10-18-26-10-36 8 10 12 24 10 36zM106 154c6-16 18-24 28-20-4 12-16 20-28 20zM106 154c-16-2-28-10-30-20 12-2 24 6 30 20z" style="fill:var(--site-leaf)"/>
  <path ${L} d="M356 390V176c0-34-22-58-52-64" fill="none"/><path ${L} d="M270 124l40-40 34 30-48 32z" style="fill:var(--site-red)"/>
  <rect ${L} x="140" y="226" width="270" height="100" rx="34" style="fill:var(--site-sofa)"/>
  <rect ${L} x="124" y="300" width="290" height="90" rx="20" style="fill:var(--site-sofa)"/>
  <rect ${L} x="106" y="262" width="58" height="128" rx="26" style="fill:var(--site-sofa)"/>
  <path ${L} d="M330 238c20-6 44-4 74 4v86h-78z" style="fill:var(--site-white)"/><path class="mk-t" d="M342 252v70M358 250v72M374 250v72"/>
  <path ${L} d="M208 330c20-12 74-14 108-4h34c14 0 20 12 20 24v22h-48v-14H208z" style="fill:var(--site-white)"/>
  <ellipse ${L} cx="352" cy="374" rx="22" ry="10" style="fill:var(--site-skin)"/>
  <path ${L} d="M196 332c-6-42 0-82 24-98 22-12 54-12 72 2 18 18 20 60 14 96z" style="fill:var(--site-red)"/>
  <path ${L} d="M288 250c16 18 14 48-6 60l-16-14c10-10 12-26 4-36z" style="fill:var(--site-red)"/>
  <rect ${L} x="244" y="274" width="24" height="36" rx="5" transform="rotate(-12 256 292)" style="fill:var(--site-blue)"/>
  <circle ${L} cx="252" cy="190" r="36" style="fill:var(--site-skin)"/>
  <path ${L} d="M214 184c0-30 20-46 38-46s38 16 38 46z" style="fill:var(--site-blue)"/><rect ${L} x="212" y="174" width="80" height="14" rx="7" style="fill:var(--site-blue)"/>
  <circle cx="240" cy="202" r="2.8" style="fill:var(--site-ink)"/><circle cx="264" cy="202" r="2.8" style="fill:var(--site-ink)"/><path class="mk-t" d="M246 216q6 5 12 0"/>
</symbol>
<symbol id="il-work" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
  <rect width="400" height="380" style="fill:var(--site-paper)"/>
  <rect ${L} x="244" y="26" width="128" height="104" style="fill:var(--site-window)"/><path ${L} d="M308 26v104M244 78h128" fill="none"/>
  <path ${L} d="M232 130h152" fill="none"/><path ${L} d="M276 130h26l-4-22h-18z" style="fill:var(--site-white)"/>
  <path ${L} d="M288 108c-8-14-6-26 4-32 6 12 4 24-4 32zM288 108c-12-6-18-16-16-26 12 2 18 14 16 26z" style="fill:var(--site-leaf)"/>
  <path ${L} d="M110 300c0-70 30-118 76-118s76 48 76 118z" style="fill:var(--site-hair)"/>
  <path ${L} d="M114 330c4-48 30-70 70-70s66 22 70 70z" style="fill:var(--site-blue)"/>
  <ellipse ${L} cx="186" cy="196" rx="40" ry="44" style="fill:var(--site-skin)"/>
  <path ${L} d="M144 190c2-36 22-52 42-52s40 16 42 52c-22-18-62-18-84 0z" style="fill:var(--site-hair)"/>
  <circle cx="172" cy="204" r="2.8" style="fill:var(--site-ink)"/><circle cx="200" cy="204" r="2.8" style="fill:var(--site-ink)"/><path class="mk-t" d="M180 220q6 4 12 0"/>
  <rect ${L} x="-4" y="300" width="408" height="18" style="fill:var(--site-wood)"/><rect ${L} x="-4" y="318" width="408" height="70" style="fill:var(--site-floor)"/>
  <path ${L} d="M206 300l18-96h128l-18 96z" style="fill:var(--site-screen)"/><circle ${L} cx="278" cy="252" r="9" style="fill:var(--site-white)"/>
  <rect ${L} x="192" y="292" width="170" height="10" rx="4" style="fill:var(--site-steel)"/>
  <ellipse ${L} cx="214" cy="292" rx="16" ry="9" style="fill:var(--site-skin)"/>
  <rect ${L} x="56" y="250" width="40" height="44" rx="6" style="fill:var(--site-white)"/><path ${L} d="M96 260c14 0 14 22 0 22" fill="none"/>
  <path class="mk-t" d="M68 238c-6-8 6-12 0-22M82 238c-6-8 6-12 0-22"/>
</symbol>
<symbol id="il-travel" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
  <rect width="400" height="380" style="fill:var(--site-sky)"/>
  <path ${L} d="M246 134c-12-30 18-52 44-38 10-32 64-30 72 6 28 0 38 32 20 48H252c-20 0-26-16-6-16z" style="fill:var(--site-white)"/>
  <path class="mk-t" d="M70 70q10-10 20 0q10-10 20 0M146 42q8-8 16 0q8-8 16 0"/>
  <rect ${L} x="-4" y="248" width="408" height="34" style="fill:var(--site-sea)"/>
  <rect ${L} x="-4" y="282" width="408" height="104" style="fill:var(--site-sand)"/>
  <path ${L} d="M70 230v-26h34v26" fill="none"/>
  <rect ${L} x="46" y="228" width="82" height="124" rx="12" style="fill:var(--site-red)"/><path class="mk-t" d="M68 240v100M106 240v100"/>
  <circle ${L} cx="64" cy="358" r="7" style="fill:var(--site-white)"/><circle ${L} cx="110" cy="358" r="7" style="fill:var(--site-white)"/>
  <path ${L} d="M222 384l6-112h56l6 112h-22l-12-82-12 82z" style="fill:var(--site-leaf)"/>
  <path ${L} d="M204 282c0-52 22-76 52-76s52 24 52 76z" style="fill:var(--site-blue)"/>
  <circle cx="230" cy="244" r="3" style="fill:var(--site-white)"/><circle cx="256" cy="262" r="3" style="fill:var(--site-white)"/><circle cx="282" cy="240" r="3" style="fill:var(--site-white)"/><circle cx="244" cy="226" r="3" style="fill:var(--site-white)"/><circle cx="276" cy="268" r="3" style="fill:var(--site-white)"/>
  <path ${L} d="M206 232c-14 18-18 40-10 58l16-2c-2-16 2-32 8-44z" style="fill:var(--site-blue)"/><path ${L} d="M306 232c14 18 18 40 10 58l-16-2c2-16-2-32-8-44z" style="fill:var(--site-blue)"/>
  <circle ${L} cx="256" cy="178" r="30" style="fill:var(--site-skin)"/>
  <ellipse ${L} cx="256" cy="160" rx="54" ry="12" style="fill:var(--site-sun)"/><path ${L} d="M228 160c0-26 12-40 28-40s28 14 28 40z" style="fill:var(--site-sun)"/><path ${L} d="M229 150h54" fill="none"/>
  <circle cx="246" cy="184" r="2.6" style="fill:var(--site-ink)"/><circle cx="266" cy="184" r="2.6" style="fill:var(--site-ink)"/>
</symbol>
<symbol id="il-lawn" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
  <rect width="400" height="380" style="fill:var(--site-grass)"/>
  <path d="M40 60l6-10 6 10M330 40l6-10 6 10M60 200l6-10 6 10M340 220l6-10 6 10M120 330l6-10 6 10M300 330l6-10 6 10M180 40l6-10 6 10" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--site-leaf-dark)"/>
  <path ${L} d="M198 192c-10 46-4 120 22 196h128c-10-84-34-152-66-196z" style="fill:var(--site-sofa)"/>
  <path ${L} d="M186 150c-34-6-50-34-34-58 16 2 26 20 40 34zM276 146c34-8 46-38 28-60-16 4-24 22-36 36z" style="fill:var(--site-skin)"/>
  <circle ${L} cx="232" cy="150" r="36" style="fill:var(--site-skin)"/>
  <path ${L} d="M198 132c8-30 54-34 68-4-20-8-46-8-68 4z" style="fill:var(--site-gold)"/>
  <path class="mk-t" d="M218 160q5-4 10 0M238 160q5-4 10 0M224 176q8 6 16 0"/>
  <ellipse ${L} cx="92" cy="252" rx="16" ry="30" transform="rotate(-28 92 252)" style="fill:var(--site-blue)"/><ellipse ${L} cx="136" cy="292" rx="16" ry="30" transform="rotate(-48 136 292)" style="fill:var(--site-blue)"/>
  <path ${L} d="M84 244l18 6M126 286l16 10" fill="none"/>
</symbol>
<symbol id="il-play" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
  <rect width="400" height="380" style="fill:var(--site-paper)"/>
  <rect ${L} x="250" y="30" width="116" height="96" style="fill:var(--site-window)"/><path ${L} d="M308 30v96M250 78h116" fill="none"/>
  <rect ${L} x="-4" y="292" width="408" height="96" style="fill:var(--site-cream)"/>
  <path ${L} d="M136 330c0-30 30-40 64-40s64 10 64 40v20H136z" style="fill:var(--site-blue)"/>
  <path ${L} d="M156 300c0-56 18-84 44-84s44 28 44 84z" style="fill:var(--site-leaf)"/>
  <circle ${L} cx="200" cy="176" r="36" style="fill:var(--site-skin)"/>
  <path ${L} d="M164 172c0-30 16-44 36-44s36 14 36 44c-14-12-24-14-36-14s-22 2-36 14z" style="fill:var(--site-bark)"/>
  <circle cx="188" cy="186" r="2.8" style="fill:var(--site-ink)"/><circle cx="212" cy="186" r="2.8" style="fill:var(--site-ink)"/><path class="mk-t" d="M194 200q6 5 12 0"/>
  <rect ${L} x="70" y="296" width="40" height="40" style="fill:var(--site-red)"/><rect ${L} x="112" y="312" width="30" height="30" style="fill:var(--site-blue)"/><path ${L} d="M80 296l20-28 20 28z" style="fill:var(--site-sun)"/>
  <rect ${L} x="282" y="300" width="70" height="30" rx="8" style="fill:var(--site-red)"/><path ${L} d="M294 300l12-18h28l10 18" style="fill:var(--site-white)"/>
  <circle ${L} cx="298" cy="334" r="9" style="fill:var(--site-white)"/><circle ${L} cx="336" cy="334" r="9" style="fill:var(--site-white)"/>
</symbol>
<symbol id="il-avatar" viewBox="0 0 200 200">
  <clipPath id="mk-av"><circle cx="100" cy="100" r="98"/></clipPath>
  <g clip-path="url(#mk-av)">
    <rect width="200" height="200" style="fill:var(--site-paper)"/>
    <path ${L} d="M44 150c-6-70 18-112 56-112s62 42 56 112z" style="fill:var(--site-hair)"/>
    <path ${L} d="M30 210c4-40 30-62 70-62s66 22 70 62z" style="fill:var(--site-blue)"/>
    <ellipse ${L} cx="100" cy="102" rx="36" ry="42" style="fill:var(--site-skin)"/>
    <path ${L} d="M62 98c2-34 18-50 38-50s36 16 38 50c-10-16-26-24-38-24s-28 8-38 24z" style="fill:var(--site-hair)"/>
    <circle cx="88" cy="108" r="2.6" style="fill:var(--site-ink)"/><circle cx="112" cy="108" r="2.6" style="fill:var(--site-ink)"/><path class="mk-t" d="M94 124q6 5 12 0"/>
  </g>
  <circle cx="100" cy="100" r="98" fill="none" stroke-width="3" style="stroke:var(--site-ink)"/>
</symbol>
<symbol id="ic-form" viewBox="0 0 80 80"><rect ${L} x="18" y="12" width="44" height="58" rx="4" style="fill:var(--site-white)"/><rect ${L} x="30" y="7" width="20" height="10" rx="3" style="fill:var(--site-blue)"/><path class="mk-t" d="M26 32h20M26 44h28M26 56h16"/><path d="M48 52l5 5 9-12" stroke-width="3" fill="none" stroke-linecap="round" style="stroke:var(--site-blue)"/></symbol>
<symbol id="ic-mail" viewBox="0 0 80 80"><rect ${L} x="10" y="20" width="60" height="42" rx="4" style="fill:var(--site-white)"/><path ${L} d="M10 22l30 22 30-22" fill="none"/><path d="M58 52c-3-3-7-1-7 3 0 3 7 7 7 7s7-4 7-7c0-4-4-6-7-3z" style="fill:var(--site-red)"/></symbol>
<symbol id="ic-laptop" viewBox="0 0 80 80"><rect ${L} x="14" y="14" width="52" height="38" rx="3" style="fill:var(--site-blue)"/><circle cx="40" cy="30" r="6" style="fill:var(--site-white)"/><path d="M28 48c2-8 6-11 12-11s10 3 12 11z" style="fill:var(--site-white)"/><path ${L} d="M8 60h64l-6-8H14z" style="fill:var(--site-screen)"/></symbol>
<symbol id="ic-gift" viewBox="0 0 80 80"><rect ${L} x="12" y="24" width="56" height="38" rx="4" style="fill:var(--site-white)"/><rect ${L} x="34" y="24" width="12" height="38" style="fill:var(--site-red)"/><path ${L} d="M40 24c-6-12-18-12-18-4 0 4 8 4 18 4 10 0 18 0 18-4 0-8-12-8-18 4z" style="fill:var(--site-red)"/></symbol>
<symbol id="ic-heart" viewBox="0 0 64 58"><path ${L} d="M32 52S4 36 4 18C4 9 11 4 18 4c6 0 11 4 14 9 3-5 8-9 14-9 7 0 14 5 14 14 0 18-28 34-28 34z" style="fill:var(--site-red)"/></symbol>
<symbol id="ic-mail-line" viewBox="0 0 26 22"><rect x="1.5" y="1.5" width="23" height="19" rx="2" fill="none" stroke-width="2" style="stroke:var(--site-ink)"/><path d="M2 3l11 9 11-9" fill="none" stroke-width="2" stroke-linejoin="round" style="stroke:var(--site-ink)"/></symbol>
<symbol id="ic-spin" viewBox="0 0 50 50"><g stroke-width="1.6" style="fill:var(--site-red);stroke:var(--site-ink)"><circle cx="25" cy="7" r="5"/><circle cx="25" cy="43" r="5"/></g><g stroke-width="1.6" style="fill:var(--site-blue);stroke:var(--site-ink)"><circle cx="7" cy="25" r="5"/><circle cx="43" cy="25" r="5"/></g><g stroke-width="1.6" style="fill:var(--site-white);stroke:var(--site-ink)"><circle cx="12.3" cy="12.3" r="3.5"/><circle cx="37.7" cy="37.7" r="3.5"/><circle cx="37.7" cy="12.3" r="3.5"/><circle cx="12.3" cy="37.7" r="3.5"/></g></symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  // Current page menu: red text + red dotted underline
  const page = document.body.dataset.page;
  document.querySelectorAll(`.m-nav li[data-page="${page}"]`).forEach((li) => li.classList.add("is-current"));

  // Phone menu: an apricot panel appears over .4s and two lines become an X at ±30°
  const html = document.documentElement;
  const toggle = document.querySelector(".m-toggle");
  const setMenu = (open) => {
    html.classList.toggle("is-menu", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(!html.classList.contains("is-menu")));
  document.querySelectorAll(".m-nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Same-page anchors use swing easing over .5s like the original
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : document.body;
    if (!target) return;
    e.preventDefault();
    const y = id ? target.getBoundingClientRect().top + scrollY : 0;
    if (reduced) return scrollTo(0, y);
    gsap.to(window, { duration: 0.5, scrollTo: y, ease: "sine.inOut" });
  }));
})();
