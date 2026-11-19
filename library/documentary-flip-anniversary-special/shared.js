// Shared by the brand anniversary special (body.an) and company sub pages (body.co): character · icon art, loader, menu, footer, page transition.
// The original uses hand-built inertia scroll (coefficient .14), a wave spline and rAF checks without IntersectionObserver — values carried over as they are.
(() => {
  const body = document.body;
  const isAn = body.classList.contains("an");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("rm");

  /* ---------------------------------------------- Image set */
  const petals = (cx, cy, r, n, pr, fill) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${pr}" fill="${fill}"/>`;
    }).join("");
  const sprite = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
  <radialGradient id="g-mane" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="var(--site-yellow-85)"/><stop offset="1" stop-color="var(--site-orange-72)"/></radialGradient>
  <radialGradient id="g-face" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="var(--site-yellow-96)"/><stop offset=".55" stop-color="var(--site-yellow-89b)"/><stop offset="1" stop-color="var(--site-yellow-80)"/></radialGradient>
  <radialGradient id="g-chick" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="var(--site-yellow-96b)"/><stop offset=".5" stop-color="var(--site-yellow-88b)"/><stop offset="1" stop-color="var(--site-yellow-78)"/></radialGradient>
  <linearGradient id="g-gift" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--site-pink-80)"/><stop offset="1" stop-color="var(--site-pink-65)"/></linearGradient>
  <clipPath id="an-wave-back" clipPathUnits="objectBoundingBox"><path transform="scale(0.000656168,0.00625)"/></clipPath>
  <clipPath id="an-wave-middle" clipPathUnits="objectBoundingBox"><path transform="scale(0.000656168,0.00625)"/></clipPath>
  <clipPath id="an-wave-front" clipPathUnits="objectBoundingBox"><path transform="scale(0.000656168,0.00625)"/></clipPath>
</defs>
<symbol id="ch-lion" viewBox="0 0 200 200">
  <g>${petals(100, 108, 70, 12, 30, "url(#g-mane)")}</g>
  <circle cx="64" cy="52" r="16" fill="url(#g-face)"/><circle cx="136" cy="52" r="16" fill="url(#g-face)"/>
  <circle cx="64" cy="53" r="8" fill="var(--site-red-79)" opacity=".7"/><circle cx="136" cy="53" r="8" fill="var(--site-red-79)" opacity=".7"/>
  <circle cx="100" cy="108" r="60" fill="url(#g-face)"/>
  <path d="M68 90 L90 84 M110 84 L132 90" stroke="var(--site-brown-29)" stroke-width="5" stroke-linecap="round"/>
  <path d="M74 104 h15 M111 104 h15" stroke="var(--site-brown-29)" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="72" cy="124" rx="10" ry="6" fill="var(--site-red-78)" opacity=".55"/><ellipse cx="128" cy="124" rx="10" ry="6" fill="var(--site-red-78)" opacity=".55"/>
  <path d="M100 114 l-5 -4 h10 z" fill="var(--site-brown-41)"/>
  <path d="M86 128 q7 7 14 0 q7 7 14 0" fill="none" stroke="var(--site-brown-29)" stroke-width="3.5" stroke-linecap="round"/>
</symbol>
<symbol id="ch-lion-wave" viewBox="0 0 240 220">
  <path d="M40 150 q-30 -40 -10 -80" fill="none" stroke="var(--site-yellow-80)" stroke-width="22" stroke-linecap="round"/>
  <circle cx="30" cy="66" r="16" fill="url(#g-face)"/>
  <use href="#ch-lion" x="40" y="10" width="190" height="190"/>
</symbol>
<symbol id="ch-chick" viewBox="0 0 160 180">
  <path d="M74 22 q-6 -16 6 -18 q-2 10 8 12 q-6 6 -14 6z" fill="var(--site-yellow-80)"/>
  <ellipse cx="80" cy="100" rx="60" ry="72" fill="url(#g-chick)"/>
  <path d="M26 110 q-14 -6 -10 -24 q10 4 18 14z" fill="var(--site-yellow-80)"/>
  <path d="M134 110 q14 -6 10 -24 q-10 4 -18 14z" fill="var(--site-yellow-80)"/>
  <circle cx="60" cy="82" r="6" fill="var(--site-brown-23)"/><circle cx="100" cy="82" r="6" fill="var(--site-brown-23)"/>
  <circle cx="62" cy="80" r="2" fill="var(--kf-surface)"/><circle cx="102" cy="80" r="2" fill="var(--kf-surface)"/>
  <path d="M70 96 q10 -8 20 0 q-10 12 -20 0z" fill="var(--site-orange-75)"/>
  <ellipse cx="50" cy="104" rx="9" ry="5" fill="var(--site-red-78)" opacity=".5"/><ellipse cx="110" cy="104" rx="9" ry="5" fill="var(--site-red-78)" opacity=".5"/>
  <path d="M62 170 v8 m-6 0 h12 M98 170 v8 m-6 0 h12" stroke="var(--site-orange-75)" stroke-width="4" stroke-linecap="round"/>
</symbol>
<symbol id="ic-gift" viewBox="0 0 120 130">
  <path d="M60 34 q-30 -34 -38 -10 q-4 14 38 10z M60 34 q30 -34 38 -10 q4 14 -38 10z" fill="var(--site-pink-73)" stroke="var(--site-pink-61)" stroke-width="2"/>
  <rect x="12" y="56" width="96" height="70" rx="8" fill="url(#g-gift)"/>
  <rect x="4" y="34" width="112" height="26" rx="7" fill="var(--site-pink-85)"/>
  <rect x="51" y="34" width="18" height="92" fill="var(--kf-surface)" opacity=".85"/>
  <rect x="12" y="62" width="96" height="6" fill="var(--kf-ink)" opacity=".08"/>
</symbol>
<symbol id="ic-confetti-burst" viewBox="0 0 140 80">
  <rect x="10" y="40" width="10" height="5" rx="2" fill="var(--site-present-mid)" transform="rotate(-30 15 42)"/>
  <rect x="40" y="10" width="10" height="5" rx="2" fill="var(--kf-accent)" transform="rotate(20 45 12)"/>
  <circle cx="70" cy="24" r="5" fill="var(--site-leaf)"/><rect x="96" y="12" width="12" height="5" rx="2" fill="var(--site-pink)" transform="rotate(-20 100 14)"/>
  <path d="M120 44 l6 -6 l4 8" fill="none" stroke="var(--site-orange)" stroke-width="3" stroke-linecap="round"/>
  <circle cx="28" cy="16" r="4" fill="var(--site-pink)"/><path d="M58 50 q6 -8 12 0 q6 8 12 0" fill="none" stroke="var(--site-present-mid)" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="ic-star" viewBox="0 0 40 40"><path d="M20 2 L24 15 L38 16 L27 24 L31 38 L20 30 L9 38 L13 24 L2 16 L16 15 Z" fill="currentColor" stroke-linejoin="round"/></symbol>
<symbol id="ic-sparkle" viewBox="0 0 40 40"><path d="M20 0 Q22 18 40 20 Q22 22 20 40 Q18 22 0 20 Q18 18 20 0Z" fill="currentColor"/></symbol>
<symbol id="ic-flower" viewBox="0 0 80 80">${petals(40, 40, 18, 6, 14, "var(--site-pink)")}<circle cx="40" cy="40" r="12" fill="var(--kf-accent)"/><circle cx="35" cy="38" r="2" fill="var(--site-brown-29)"/><circle cx="45" cy="38" r="2" fill="var(--site-brown-29)"/><path d="M36 44 q4 3 8 0" stroke="var(--site-brown-29)" stroke-width="2" fill="none" stroke-linecap="round"/></symbol>
<symbol id="ic-house" viewBox="0 0 100 90"><path d="M8 44 L50 8 L92 44" fill="var(--site-red-63)" stroke="var(--site-red-54)" stroke-width="3" stroke-linejoin="round"/><rect x="18" y="40" width="64" height="44" rx="3" fill="var(--site-yellow-98b)"/><rect x="42" y="56" width="16" height="28" rx="2" fill="var(--site-orange-65)"/><rect x="24" y="50" width="12" height="12" fill="var(--site-blue-80)"/><rect x="64" y="50" width="12" height="12" fill="var(--site-blue-80)"/><rect x="66" y="14" width="10" height="20" fill="var(--site-brown-53)"/></symbol>
<symbol id="ic-x" viewBox="0 0 24 24"><path d="M4 3 L20 21 M20 3 L4 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></symbol>
<symbol id="ic-ig" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor"/></symbol>
<symbol id="ic-fb" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M13.3 20 v-6.5 h2.2 l.4 -2.6 h-2.6 V9.3 c0 -.8 .3 -1.3 1.4 -1.3 h1.3 V5.7 c-.3 0 -1.1 -.1 -2 -.1 -2 0 -3.3 1.2 -3.3 3.4 v1.9 H8.4 v2.6 h2.3 V20" fill="var(--kf-ink)" opacity=".9"/></symbol>
<symbol id="ic-note" viewBox="0 0 24 24"><path d="M5 20 V6 h9 a5 5 0 0 1 5 5 v9 M10 20 v-9" fill="none" stroke="currentColor" stroke-width="2.6"/></symbol>
<symbol id="ic-yt" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="M10 9 L15.5 12 L10 15Z" fill="var(--kf-ink)"/></symbol>
<symbol id="ic-arrow" viewBox="0 0 34 10"><path d="M0 8.5 H32 L24 1" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="ic-blank" viewBox="0 0 20 16"><rect x="1" y="4" width="13" height="11" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 1 H19 V11" fill="none" stroke="currentColor" stroke-width="1.6"/></symbol>
<symbol id="ic-play" viewBox="0 0 82 82"><path class="pc" d="M41 1a40 40 0 1 1 0 80a40 40 0 1 1 0 -80z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M52.9 43.6 l-17.2 10 c-2 1.1 -4.5 -.3 -4.5 -2.6 v-19.9 c0 -2.3 2.5 -3.8 4.5 -2.6 l17.2 10 c2 1.1 2 4 0 5.2z" fill="currentColor"/></symbol>
<symbol id="ic-logo" viewBox="0 0 60 56" data-label="Your company logo in English here — bold capitals stacked in three lines"><text x="30" y="16" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="15" fill="currentColor" letter-spacing="-.5">YOUR</text><text x="30" y="34" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="15" fill="currentColor">BRAND</text><text x="30" y="52" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="15" fill="currentColor">LOGO</text></symbol>
<symbol id="bl-1" viewBox="0 0 200 200"><path d="M44 30 C88 -6 168 8 186 64 C204 120 170 186 104 192 C40 198 -4 150 6 96 C12 64 22 48 44 30Z"/></symbol>
<symbol id="bl-2" viewBox="0 0 200 200"><path d="M100 6 C150 4 196 40 194 96 C192 156 150 196 94 194 C38 192 4 150 8 100 C12 50 50 8 100 6Z"/></symbol>
<symbol id="bl-3" viewBox="0 0 200 200"><path d="M30 60 C40 14 120 -6 166 34 C206 70 196 150 150 180 C104 210 30 194 12 140 C2 112 22 92 30 60Z"/></symbol>
<symbol id="bl-4" viewBox="0 0 200 200"><path d="M60 14 C110 -8 182 22 192 82 C202 140 152 196 94 188 C40 180 -2 134 10 84 C16 54 32 26 60 14Z"/></symbol>
</svg>`;
  body.insertAdjacentHTML("afterbegin", sprite);

  const icon = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  window.LTW = { icon };


  /* ---------------------------------------------- Smooth scroll: in the original, only on desktop (1025 and up) each frame follows .14 of the remaining distance (custom code).
     Lenis 1.3 moves by 1 − exp(−lerp × 60 × dt), so set lerp so one 60fps frame gives .14 = −ln(.86) */
  let lenis = null;
  if (!reduce && matchMedia("(min-width: 1025px)").matches && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1508, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.LTW.lenis = lenis;
  const scrollToEl = (el) => (lenis ? lenis.scrollTo(el, { offset: 0 }) : el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }));
  window.LTW.scrollToEl = scrollToEl;

  if (isAn) anniversary();
  else corporate();

  /* ============================================== brand anniversary special */
  function anniversary() {
    const KEY = "ltw-lib-reel-seen";
    const seen = sessionStorage.getItem(KEY) === "true";
    if (seen) document.documentElement.classList.add("reel-seen");

    body.insertAdjacentHTML("afterbegin", `
<div class="an-loading" data-slot="loader"><div class="an-loading__logo"><svg class="mark" viewBox="0 0 60 56" style="color:var(--kf-surface)"><use href="#ic-logo"/></svg><span class="anni">brand Anniversary</span></div></div>
<div class="an-reel" data-slot="opening-reel">
  <div class="wf-img wf-video" data-label="Intro video · on black, a crystal cube with glowing light spins and resolves into a logo · full screen 16:9 · about 20s"></div>
  <i class="an-reel__bar"></i>
  <button class="an-reel__skip" type="button">Skip</button>
</div>
<div class="an-menu-btn" data-slot="menu-button"><button type="button" aria-label="Menu"><svg viewBox="0 0 70 70"><circle class="bg" cx="35" cy="35" r="35"/><path class="ln" d="M17.6 21.8h34"/><path class="ln" d="M17.6 34.8h34"/><path class="ln" d="M17.6 47.8h34"/></svg></button></div>
<div class="an-overlay"></div>
<div class="an-gnav" data-slot="menu-drawer"><nav>
  <button class="an-gnav__close" type="button" aria-label="Close"><i></i><i></i></button>
  <ul class="main">
    <li><a href="#top">Top<br><span>Top</span></a></li>
    <li><a href="#message">brand Anniversary Message<br><span>Your greeting here</span></a></li>
    <li><a href="#new_contents">New Contents<br><span>Your character name here</span></a></li>
    <li><a href="#animation_contents">Animation Contents<br><span>Your project name here</span></a></li>
    <li><a href="#member">Members<br><span>About us</span></a></li>
    <li><a href="#column_radio">Column &amp; Radio<br><span>Column &amp; Radio</span></a></li>
  </ul>
  <div class="an-gnav__campaign"><a href="#present">Campaign<span>Gift Planning</span><svg class="box" viewBox="0 0 120 130"><use href="#ic-gift"/></svg><svg class="deco" viewBox="0 0 140 80"><use href="#ic-confetti-burst"/></svg></a></div>
  <div class="an-gnav__other"><a href="about.html">Company official website ${icon("ic-blank")}</a></div>
  <ul class="an-sns">
    <li><a href="#" aria-label="SNS 1">${icon("ic-fb")}</a></li><li><a href="#" aria-label="SNS 2">${icon("ic-x")}</a></li><li><a href="#" aria-label="SNS 3">${icon("ic-ig")}</a></li><li><a href="#" aria-label="SNS 4">${icon("ic-note")}</a></li><li><a href="#" aria-label="SNS 5">${icon("ic-yt")}</a></li>
  </ul>
</nav></div>
<div class="an-present-badge" data-slot="present-badge"><a href="#present" aria-label="On to gift planning">
  <div class="ring"><i class="disc"></i><svg class="txt" viewBox="0 0 152 152"><defs><path id="an-ring" d="M76 76 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0"/></defs><text><textPath href="#an-ring">Present · Present · Present · Present ·</textPath></text></svg></div>
  <svg class="box" viewBox="0 0 120 130"><use href="#ic-gift"/></svg>
  <svg class="deco" viewBox="0 0 140 80"><use href="#ic-confetti-burst"/></svg>
</a></div>`);

    // Loader: logo 1s + commemorative text .7s delay → logo out .25s → curtain 1s fade → (first-time visitors only) intro video
    const loading = body.querySelector(".an-loading");
    const reel = body.querySelector(".an-reel");
    const bar = reel.querySelector(".an-reel__bar");
    const REEL_MS = 5200;
    let reelTimer = null;
    const closeReel = () => {
      clearTimeout(reelTimer);
      sessionStorage.setItem(KEY, "true");
      reel.classList.remove("is-active");
      body.dispatchEvent(new CustomEvent("an:ready"));
    };
    const openReel = () => {
      reel.classList.add("is-active");
      bar.animate([{ width: "0%" }, { width: "100%" }], { duration: REEL_MS, easing: "linear", fill: "forwards" });
      reelTimer = setTimeout(closeReel, REEL_MS);
    };
    reel.querySelector(".an-reel__skip").addEventListener("click", closeReel);
    if (reduce) {
      loading.remove();
      reel.remove();
      setTimeout(() => body.dispatchEvent(new CustomEvent("an:ready")));
    } else {
      requestAnimationFrame(() => loading.classList.add("is-start"));
      setTimeout(() => loading.classList.add("is-end"), 1900);
      setTimeout(() => {
        loading.classList.add("is-out");
        if (seen) body.dispatchEvent(new CustomEvent("an:ready"));
        else openReel();
      }, 2150);
    }

    // Menu drawer
    const gnav = body.querySelector(".an-gnav");
    const overlay = body.querySelector(".an-overlay");
    const setNav = (on) => {
      gnav.classList.toggle("active", on);
      overlay.classList.toggle("active", on);
      on ? lenis?.stop() : lenis?.start();
    };
    body.querySelector(".an-menu-btn button").addEventListener("click", () => setNav(true));
    gnav.querySelector(".an-gnav__close").addEventListener("click", () => setNav(false));
    overlay.addEventListener("click", () => setNav(false));
    addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const el = id === "top" ? body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      setNav(false);
      scrollToEl(el);
    });

    // Wave: 6-point Catmull-Rom curve, front and middle at 1.4× phase and 1.5× width
    const WAVE_W = 1524, WAVE_B = 160;
    const pts = (base, speed) => [0, 305, 610, 914, 1219, 1524].map((x) => ({ x, base, amp: 30, speed }));
    const P = { back: pts(80, 0.2), middle: pts(90, 0.25), front: pts(100, 0.5) };
    const narrow = matchMedia("(max-width: 1279px)").matches;
    const wave = (points, time, phase0, wScale) => {
      const t = time * 0.0015;
      const f = 0.004 * wScale * (narrow ? 0.8 : 1);
      const m = points.map((p, i) => {
        const edge = i === 0 || i === points.length - 1;
        const ph = p.x * f - t * p.speed + phase0;
        return { x: p.x + (edge ? 0 : Math.cos(ph + i * 0.8) * 8), y: p.base + Math.sin(ph) * p.amp };
      });
      let d = `M${m[0].x},${m[0].y}`;
      for (let i = 0; i < m.length - 1; i++) {
        const p0 = m[i - 1] || m[i], p1 = m[i], p2 = m[i + 1], p3 = m[i + 2] || p2;
        d += ` C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)},${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)},${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }
      return d + ` L${WAVE_W},${WAVE_B} L0,${WAVE_B} Z`;
    };
    const paths = ["back", "middle", "front"].map((k) => document.querySelector(`#an-wave-${k} path`));
    document.querySelectorAll("[data-wave]").forEach((sec) => {
      sec.insertAdjacentHTML("afterbegin", `<div class="an-wave an-wave--${sec.dataset.wave}" aria-hidden="true"><i class="back"></i><i class="middle"></i><i class="front"></i></div>`);
    });
    const drawWaves = (time) => {
      paths[0].setAttribute("d", wave(P.back, time, 0, 1));
      paths[1].setAttribute("d", wave(P.middle, time, 1.4, 1.5));
      paths[2].setAttribute("d", wave(P.front, time, 1.4, 1.5));
    };
    drawWaves(0);
    if (!reduce) {
      let last = 0;
      const loop = (time) => {
        if (!narrow || time - last > 33) { drawWaves(time); last = time; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    // Confetti (original values): 50 per screen height (45 for 769~1279px · 30 for 768px and below), the 50 (30·20)px side margin is split into 12 (8·6) cells, one piece placed in each cell in turn at a random spot, box 70 (60·40)px.
    // At 1280px and up, they fall straight from −500px to panel height + 1000px below over 80~90s, and below that they stay within ±35% of the center of the cell grid. All sway 10~30 (8~23·10~30)px sideways over 5~8s and rotate once every 10s (random direction)
    const COLORS = ["var(--site-pink)", "var(--site-present-mid)", "var(--site-leaf)", "var(--site-orange)", "var(--kf-surface)", "var(--site-cobalt)", "var(--site-red-63)"];
    const shape = (c, k) => [
      `<rect x="26" y="34" width="28" height="13" rx="3" fill="${c}"/>`,
      `<circle cx="40" cy="40" r="10" fill="${c}"/>`,
      `<path d="M20 44 q10 -18 20 0 q10 18 20 0" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
      `<path d="M40 24 L43.5 36.5 L56 40 L43.5 43.5 L40 56 L36.5 43.5 L24 40 L36.5 36.5Z" fill="${c}"/>`,
    ][k];
    const CFG = matchMedia("(max-width: 768px)").matches ? { per: 30, pad: 20, cols: 6, size: 40, dur: 60, durR: 20, sway: 8, swayR: 15 }
      : matchMedia("(max-width: 1279px)").matches ? { per: 45, pad: 30, cols: 8, size: 60, dur: 60, durR: 20, sway: 10, swayR: 20 }
      : { per: 50, pad: 50, cols: 12, size: 70, dur: 80, durR: 10, sway: 10, swayR: 20 };
    const falls = matchMedia("(min-width: 1280px)").matches && !reduce;
    document.querySelectorAll(".an-confetti").forEach((box) => {
      const h = box.offsetHeight, w = innerWidth - CFG.pad * 2, cell = w / CFG.cols;
      const n = Math.ceil((h / innerHeight) * CFG.per), rows = Math.ceil(n / CFG.cols), cellH = (h + 120) / rows;
      let html = "";
      for (let i = 0; i < n; i++) {
        const col = i % CFG.cols, row = Math.floor(i / CFG.cols);
        const fall = CFG.dur + Math.random() * CFG.durR;
        const [x, y] = falls
          ? [CFG.pad + col * cell + Math.random() * cell, -500]
          : [CFG.pad + col * cell + cell / 2 + (Math.random() - 0.5) * cell * 0.7 - CFG.size / 2, row * cellH + cellH / 2 + 20 + (Math.random() - 0.5) * cellH * 0.7 - CFG.size / 2];
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        html += `<b style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${CFG.size}px;--h:${h + 1000}px;--fall:${fall.toFixed(2)}s;--delay:${(-Math.random() * fall).toFixed(2)}s">` +
          `<i style="--sway:${(CFG.sway + Math.random() * CFG.swayR).toFixed(1)}px;--sway-d:${(5 + Math.random() * 3).toFixed(2)}s">` +
          `<s style="--dir:${Math.random() < 0.5 ? 1 : -1};--spin-delay:${(-Math.random() * 10).toFixed(2)}s"><svg viewBox="0 0 80 80">${shape(c, Math.floor(Math.random() * 4))}</svg></s></i></b>`;
      }
      box.innerHTML = html;
      if (!falls) box.classList.add("still");
    });

    // Gift badge: only after passing 30% of the character hero and while the final gift area hasn’t entered yet
    const badge = body.querySelector(".an-present-badge");
    const kv = document.querySelector("[data-badge-start]");
    const end = document.querySelector("[data-badge-end]");

    // Entry check (original rAF check as is): visible height ≥ min(element height × threshold, screen × .8)
    const inview = [...document.querySelectorAll("[data-inview]")].map((el) => ({ el, th: Number(el.dataset.inview || 0.3), done: false }));
    const confettiBoxes = [...document.querySelectorAll(".an-confetti")];
    const sp = !matchMedia("(min-width: 1025px)").matches;
    const SPEED = sp ? { middle: 0.96, slow: 0.91, high: 0.99 } : { middle: 0.92, slow: 0.82, high: 0.98 };
    const para = [...document.querySelectorAll("[data-parallax]")].map((el) => ({ el, sp: SPEED[el.dataset.parallax] ?? 1, start: null }));
    // Section background pattern parallax (original data-bg-parallax): while the section enters from the bottom of the screen and leaves through the top, the pattern shifts −60 → +60px (±55 at 1024 and below).
    // On PC each frame follows .12 of the remaining distance, on phone it sticks right away. The front wave pattern is pushed further by the difference between the section and the wave top edge so it joins the section pattern
    const RANGE = sp ? 110 : 120;
    const bgs = [...document.querySelectorAll("[data-bg-parallax]")].map((sec) => ({ sec, front: sec.querySelector(".an-wave .front"), cur: 0 }));
    let ready = false;
    body.addEventListener("an:ready", () => { ready = true; });
    const tick = () => {
      const vh = innerHeight;
      const y = scrollY;
      if (ready) {
        for (const it of inview) {
          if (it.done) continue;
          const r = it.el.getBoundingClientRect();
          const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0);
          if (r.bottom > 0 && r.top < vh && vis >= Math.min(it.el.offsetHeight * it.th, vh * 0.8)) {
            it.done = true;
            it.el.classList.add("active");
            it.el.dispatchEvent(new CustomEvent("an:active"));
          }
        }
      }
      for (const box of confettiBoxes) {
        const r = box.parentElement.getBoundingClientRect();
        box.classList.toggle("show", ready && r.top < vh * 0.7 && r.bottom > 0);
      }
      if (!reduce) {
        for (const b of bgs) {
          const r = b.sec.getBoundingClientRect();
          const target = (Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))) - 0.5) * RANGE;
          b.cur = sp ? target : b.cur + (target - b.cur) * 0.12;
          b.sec.style.setProperty("--bg-parallax-y", `${b.cur.toFixed(2)}px`);
          if (b.front) b.sec.style.setProperty("--wave-bg-y", `${(b.cur + r.top - b.front.getBoundingClientRect().top).toFixed(2)}px`);
        }
        for (const p of para) {
          if (p.start === null) {
            const r = p.el.getBoundingClientRect();
            if (r.top >= vh * 1.1) continue;
            p.start = r.top + y - (parseFloat(p.el.style.getPropertyValue("--py")) || 0) - vh * 1.1;
          }
          p.el.style.setProperty("--py", `${(Math.max(0, y - p.start) * (1 - p.sp)).toFixed(1)}px`);
        }
      }
      if (kv && end) {
        const k = kv.getBoundingClientRect();
        const e = end.getBoundingClientRect();
        badge.classList.toggle("show", ready && k.top < -k.height * 0.3 && e.top > vh);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    if (reduce) inview.forEach((it) => { it.done = true; it.el.classList.add("active"); });
  }

  /* ============================================== Company subpage */
  function corporate() {
    const page = body.dataset.page;
    const drops = {
      about: { h: 312, title: "Company About", en: "ABOUT", label: "Office meeting room · long wooden desk and window-side plant · daytime natural light · landscape 16:9", left: [["about.html", "Company About", ["Slogan", "Our identity", "Please read before requesting"]]], right: [["about.html#staff", "Meet the Members"], ["about.html#prize", "Award History"], ["about.html#company", "Company overview"], ["about.html#access", "Directions"]] },
      service: { h: 371, title: "Service", en: "SERVICE", label: "Shoot location · crew watching a monitor behind the camera · indoor lighting · landscape 16:9", left: [["#", "Service", ["Video production", "Web design", "Graphic design", "Brand design", "Promo content"]]], right: [["#", "Design thinking"]] },
      recruit: { h: 323, title: "Hiring Info", en: "RECRUIT", label: "Row of office chairs · workroom lined with black mesh chairs · backlit by the window · 16:9 landscape", left: [["recruit.html", "Hiring Info", ["Work environment", "Employee benefits", "Career design"]]], right: [["recruit.html#jobs", "Application guidelines"], ["recruit.html#intern", "Intern Recruitment"], ["recruit.html#know", "Getting to know us"]] },
    };
    const NAV = [["about.html", "Company About", "about"], ["#", "Service", "service"], ["#", "Work case"], ["news.html", "Our voices", "", "news"], ["#", "News"], ["recruit.html", "Hiring Info", "recruit"]];
    // Plate height matches the original plate (text line count as in the real content) — so the plate doesn’t come down less when placeholder text is short
    const dropHTML = (d) => `<div class="co-drop" style="min-height:${d.h}px"><div class="set">
      <div class="left"><h3>${d.title}<span>/ ${d.en}</span></h3><div class="wf-img" data-label="${d.label}"></div></div>
      <div class="right"><div>${d.left.map(([h, t, sub]) => `<h4><a href="${h}">${t}</a></h4><ol>${sub.map((s) => `<li><a href="${h}">${s}</a></li>`).join("")}</ol>`).join("")}</div>
      <div>${d.right.map(([h, t]) => `<h4><a href="${h}">${t}</a></h4>`).join("")}</div></div></div></div>`;

    const header = document.querySelector('[data-slot="co-header"]');
    header.className = "co-header";
    header.innerHTML = `<nav>
      <a class="co-logo" href="about.html" aria-label="Brand Name" data-label="Your company English logo here">${icon("ic-logo")}</a>
      <ul class="co-gnav">${NAV.map(([h, t, d, cur]) => `<li${d ? ` data-drop="${d}"` : ""}><a href="${h}"${page === (d || cur) ? ' class="current"' : ""}><span class="roll"><span class="m">${t}</span><span class="s">${t}</span></span><span class="line"></span></a>${d ? dropHTML(drops[d]) : ""}</li>`).join("")}</ul>
      <div class="co-contact"><a href="#">Material Request</a><a href="#">Contact Us</a></div>
      <button class="co-flag" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
    </nav>`;
    header.insertAdjacentHTML("afterend", `<div class="co-dim"></div>
    <div class="co-spnav" data-slot="mobile-menu"><ul>${NAV.map(([h, t, d]) => `<li><a href="${h}">${t}</a>${d ? `<button class="acd" type="button" aria-label="Unfold"></button><div class="acd-wrap"><div>${drops[d].left.map(([lh, lt, sub]) => `<a href="${lh}">${lt}</a>${sub.map((s) => `<a class="sub" href="${lh}">${s}</a>`).join("")}`).join("")}${drops[d].right.map(([rh, rt]) => `<a href="${rh}">${rt}</a>`).join("")}</div></div>` : ""}</li>`).join("")}</ul>
    <div class="btns"><a href="#">Material Request</a><a href="#">Contact Us</a></div></div>
    <div class="co-loader" data-slot="loader"></div><div class="co-noise"></div>
    <div class="co-cursor"><span><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" opacity=".1"/><circle cx="36" cy="36" r="35" fill="none" stroke="var(--kf-surface)" stroke-width="1.8"/><polyline points="19.9 36.2 52.1 36.2 44.2 28.3" fill="none" stroke="var(--kf-surface)" stroke-width="2.6"/></svg></span></div>`);

    // Dropdown: when the mouse is over an item, the panel and dim overlay appear
    // The original dark curtain (.ho_bg) sits at the end of the body, not in the header band
    const dim = document.querySelector(".co-dim");
    document.body.append(dim);
    // Original jQuery fadeIn(200)·fadeOut(200) (swing curve) — panel and dim overlay turn on in .2s, and on closing, the space is vacated after fully faded. Inner text rises in .4s via action
    const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
    const fade = (el, on) => {
      gsap.killTweensOf(el);
      if (on) {
        if (getComputedStyle(el).display === "none") gsap.set(el, { display: "block", opacity: 0 });
        gsap.to(el, { opacity: 1, duration: reduce ? 0 : 0.2, ease: swing });
      } else gsap.to(el, { opacity: 0, duration: reduce ? 0 : 0.2, ease: swing, onComplete: () => gsap.set(el, { display: "none" }) });
    };
    header.querySelectorAll("[data-drop]").forEach((li) => {
      const drop = li.querySelector(".co-drop");
      li.addEventListener("mouseenter", () => { fade(drop, true); gsap.to(dim, { autoAlpha: 1, duration: reduce ? 0 : 0.2, ease: swing, overwrite: true }); drop.classList.add("action"); });
      li.addEventListener("mouseleave", () => { fade(drop, false); gsap.to(dim, { autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: swing, overwrite: true }); drop.classList.remove("action"); });
    });
    const flag = header.querySelector(".co-flag");
    const spnav = document.querySelector(".co-spnav");
    flag.addEventListener("click", () => { flag.classList.toggle("action"); spnav.classList.toggle("action"); });
    spnav.querySelectorAll(".acd").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("open")));

    // Footer group
    const foot = document.querySelector('[data-slot="co-footer"]');
    foot.innerHTML = `
    <section class="co-contact-band" data-slot="contact-band"><div class="co-wrap">
      <dl><dt><a href="#"><span>Material Request</span></a></dt><dd>Your two-line guide on requesting materials here.<br>We will send you our company overview and work samples.</dd></dl>
      <dl><dt><a href="#"><span>Contact Us</span></a></dt><dd>Your one line of contact info here.<br><span class="tel">00-0000-0000</span>Weekdays 00:00 – 00:00 (excluding weekends and holidays)</dd></dl>
    </div></section>
    <a class="co-brand" href="index.html" data-slot="anniversary-banner">
      <svg class="bg" viewBox="0 0 1440 234" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="1440" height="234" fill="var(--kf-surface)"/>
        <use href="#bl-1" x="-60" y="40" width="300" height="260" fill="var(--site-present-mid)"/><use href="#bl-3" x="170" y="-90" width="240" height="200" fill="var(--kf-accent)"/>
        <use href="#bl-2" x="1180" y="-40" width="260" height="240" fill="var(--site-leaf)"/><use href="#bl-4" x="1320" y="90" width="200" height="200" fill="var(--site-pink)"/>
        <use href="#bl-2" x="980" y="150" width="150" height="130" fill="var(--kf-accent)"/>
      </svg>
      <svg class="lion" viewBox="0 0 200 200"><use href="#ch-lion"/></svg>
      <svg class="chick" viewBox="0 0 160 180"><use href="#ch-chick"/></svg>
      <span class="copy"><small>Your one-line commemorative slogan here</small><b>10<sup>th</sup> Anniversary Website</b><em>Since 0000</em></span>
    </a>
    <section class="co-news-band" data-slot="newsletter"><div class="co-wrap">
      <span class="script">Light up</span>
      <p>Your newsletter intro here in two lines. Once a month, the makers’ thoughts and<br>We’ll send you the story behind the work.<small>Past newsletters here</small></p>
      <a href="#">${icon("ic-blank")}Subscribe to newsletter</a>
    </div></section>
    <footer class="co-footer" data-slot="footer"><div class="co-wrap">
      <div><span class="co-logo">${icon("ic-logo")}</span><p class="addr">Your company name here, Inc.<br>〒000-0000<br>Your one-line address here<br>Your building name 0F here</p></div>
      <div class="cols">
        <div><h3>About the company</h3><a href="about.html">Company About</a><br><a href="#">Service</a><br><a href="#">Work case</a></div>
        <div><h3>News</h3><a href="news.html">Our voices</a><br><a href="#">News</a><br><a href="recruit.html">Hiring Info</a></div>
        <div><h3>Others</h3><a href="#">Contact Us</a><br><a href="#">Frequently asked questions</a><br><a href="#">Material Request</a><br><a href="#">Privacy policy</a></div>
      </div>
      <div class="sns">${["ic-fb", "ic-x", "ic-ig", "ic-note", "ic-yt"].map((i) => `<a href="#" aria-label="SNS">${icon(i)}</a>`).join("")}</div>
    </div><small data-label="Copyright line containing your company’s English name">© Company Name Inc. ALL RIGHT RESERVED.</small></footer>`;

    // Loader: once drawn, .6s fade
    const loader = document.querySelector(".co-loader");
    const out = () => loader.classList.add("is-out");
    if (reduce) out();
    // Original $('.loading').delay(400).fadeOut(600) — waits .4s after load, then lifts with a .6s swing
    else if (document.readyState === "complete") setTimeout(out, 400);
    else addEventListener("load", () => setTimeout(out, 400));

    // Cursor circle only over cards
    const cursor = document.querySelector(".co-cursor");
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.pageX - 36}px`;
      cursor.style.top = `${e.pageY - 36}px`;
    });
    document.querySelectorAll(".cursorarea").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
    });

    // Entrance: when in view, .move
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("move"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".co-load").forEach((el) => (reduce ? el.classList.add("move") : io.observe(el)));
  }
})();
