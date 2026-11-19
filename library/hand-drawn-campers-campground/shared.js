// Shared by all pages: hand-drawn SVG set (trees · people · mascot · cars · tents · badges · icons), header (logo · contact · booking · menu),
// Menu window, floating social pill, hill footer, entrances (opacity 0→1 1.2s · scale 0→1 bounce .45s).
// Draw the header, menu, and footer once here so all four pages share the same ones.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
  <symbol id="lg-tree" viewBox="0 0 100 130">
    <rect x="45" y="76" width="10" height="54" rx="3" fill="var(--site-bark)"/>
    <circle cx="50" cy="50" r="38" fill="var(--leaf, var(--site-leaf))"/>
    <circle cx="28" cy="64" r="24" fill="var(--leaf, var(--site-leaf))"/>
    <circle cx="73" cy="62" r="25" fill="var(--leaf, var(--site-leaf))"/>
    <circle cx="38" cy="36" r="11" fill="var(--site-leaf-soft)"/><circle cx="64" cy="48" r="7" fill="var(--site-leaf-soft)"/><circle cx="30" cy="66" r="6" fill="var(--site-leaf-soft)"/>
    <path d="M50 118V72M50 92L35 76M50 84l14-14" stroke="var(--site-bark)" stroke-width="4" fill="none" stroke-linecap="round"/>
  </symbol>
  <symbol id="lg-pine" viewBox="0 0 40 66">
    <rect x="17" y="52" width="6" height="14" fill="var(--site-bark)"/>
    <path d="M20 0l11 20h-5l9 16h-5l9 18H1l9-18H5l9-16H9z" fill="currentColor"/>
  </symbol>
  <symbol id="lg-cone" viewBox="0 0 40 40"><path d="M20 2l18 36H2z" fill="currentColor"/></symbol>
  <symbol id="lg-tent" viewBox="0 0 200 150">
    <path d="M100 4l96 142H4z" fill="var(--site-canvas)" stroke="var(--site-wood)" stroke-width="3" stroke-linejoin="round"/>
    <path d="M100 4l34 142H66z" fill="var(--site-canvas-shade)"/>
    <path d="M100 64l18 82H82z" fill="var(--kf-ink-soft)" opacity=".55"/>
  </symbol>
  <symbol id="lg-fire" viewBox="0 0 60 50">
    <path d="M8 46l44-12M8 34l44 12" stroke="var(--site-bark)" stroke-width="6" stroke-linecap="round"/>
    <path d="M30 4c8 10 14 16 10 26-2 6-18 6-20 0-3-8 4-12 10-26z" fill="var(--kf-accent)"/>
    <path d="M30 18c4 6 6 9 4 14-1 3-8 3-9 0-1-4 2-7 5-14z" fill="var(--kf-accent-soft)"/>
  </symbol>
  <symbol id="lg-person" viewBox="0 0 60 140">
    <path d="M23 90l-4 42M37 90l4 42" stroke="var(--pants, var(--site-denim))" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="17" cy="135" rx="8" ry="4" fill="var(--kf-ink)"/><ellipse cx="43" cy="135" rx="8" ry="4" fill="var(--kf-ink)"/>
    <path d="M15 48q15-12 30 0l3 46H12z" fill="var(--shirt, var(--kf-accent-soft))"/>
    <path d="M15 52L8 86M45 52l7 34" stroke="var(--shirt, var(--kf-accent-soft))" stroke-width="8" stroke-linecap="round"/>
    <circle cx="8" cy="88" r="4" fill="var(--site-skin)"/><circle cx="52" cy="88" r="4" fill="var(--site-skin)"/>
    <circle cx="30" cy="27" r="13" fill="var(--site-skin)"/>
    <path d="M15 24q15-20 30 0z" fill="var(--hat, var(--kf-accent))"/><rect x="11" y="21" width="38" height="5" rx="2.5" fill="var(--hat, var(--kf-accent))"/>
    <circle cx="25" cy="30" r="1.6" fill="var(--kf-ink)"/><circle cx="35" cy="30" r="1.6" fill="var(--kf-ink)"/>
  </symbol>
<symbol id="lg-person-b" viewBox="0 0 60 140">
    <path d="M25 90l3 42M35 90l-3 42" stroke="var(--pants, var(--site-denim))" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="26" cy="135" rx="8" ry="4" fill="var(--kf-ink)"/><ellipse cx="34" cy="135" rx="8" ry="4" fill="var(--kf-ink)"/>
    <g transform="translate(0 -1)">
    <path d="M15 48q15-12 30 0l3 46H12z" fill="var(--shirt, var(--kf-accent-soft))"/>
    <path d="M15 52L8 86M45 52l7 34" stroke="var(--shirt, var(--kf-accent-soft))" stroke-width="8" stroke-linecap="round"/>
    <circle cx="8" cy="88" r="4" fill="var(--site-skin)"/><circle cx="52" cy="88" r="4" fill="var(--site-skin)"/>
    <circle cx="30" cy="27" r="13" fill="var(--site-skin)"/>
    <path d="M15 24q15-20 30 0z" fill="var(--hat, var(--kf-accent))"/><rect x="11" y="21" width="38" height="5" rx="2.5" fill="var(--hat, var(--kf-accent))"/>
    <circle cx="25" cy="30" r="1.6" fill="var(--kf-ink)"/><circle cx="35" cy="30" r="1.6" fill="var(--kf-ink)"/>
    </g>
  </symbol>
  <!-- Spot for the original animation (2 frames, 1 second each) — a woodcutter with a saw in two poses: saw down / saw raised and body slightly lifted -->
  <symbol id="lg-chop-a" viewBox="0 0 120 140">
    <path d="M66 92l-12 40M78 92l16 38" stroke="var(--pants, var(--site-sky))" stroke-width="11" stroke-linecap="round"/>
    <ellipse cx="50" cy="134" rx="9" ry="5" fill="var(--site-bark)"/><ellipse cx="96" cy="132" rx="9" ry="5" fill="var(--site-bark)"/>
    <path d="M56 50q16-12 32 0l4 46H54z" fill="var(--shirt, var(--site-yellow))"/>
    <path d="M60 56L44 80M64 60l-4 26" stroke="var(--shirt, var(--site-yellow))" stroke-width="9" stroke-linecap="round"/>
    <path d="M20 104l26-12" stroke="var(--site-silver)" stroke-width="7" stroke-linecap="round"/>
    <rect x="38" y="80" width="26" height="15" rx="4" transform="rotate(-24 51 88)" fill="var(--kf-accent)" stroke="var(--kf-ink)" stroke-width="1.5"/>
    <circle cx="44" cy="80" r="5" fill="var(--site-bark)"/><circle cx="60" cy="86" r="5" fill="var(--site-bark)"/>
    <circle cx="74" cy="30" r="12" fill="var(--site-skin)"/>
    <path d="M61 27q13-19 26 0z" fill="var(--hat, var(--kf-accent))"/><rect x="58" y="24" width="32" height="5" rx="2.5" fill="var(--hat, var(--kf-accent))"/>
    <path d="M68 36q4 3 8 0" stroke="var(--kf-ink)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </symbol>
  <symbol id="lg-chop-b" viewBox="0 0 120 140">
    <path d="M66 92l-12 40M78 92l16 38" stroke="var(--pants, var(--site-sky))" stroke-width="11" stroke-linecap="round"/>
    <ellipse cx="50" cy="134" rx="9" ry="5" fill="var(--site-bark)"/><ellipse cx="96" cy="132" rx="9" ry="5" fill="var(--site-bark)"/>
    <g transform="translate(0 -2)">
      <path d="M56 50q16-12 32 0l4 46H54z" fill="var(--shirt, var(--site-yellow))"/>
      <path d="M60 56L46 74M64 60l-2 22" stroke="var(--shirt, var(--site-yellow))" stroke-width="9" stroke-linecap="round"/>
      <path d="M14 90l30-8" stroke="var(--site-silver)" stroke-width="7" stroke-linecap="round"/>
      <rect x="40" y="72" width="26" height="15" rx="4" transform="rotate(-14 53 80)" fill="var(--kf-accent)" stroke="var(--kf-ink)" stroke-width="1.5"/>
      <circle cx="46" cy="74" r="5" fill="var(--site-bark)"/><circle cx="62" cy="80" r="5" fill="var(--site-bark)"/>
      <circle cx="74" cy="30" r="12" fill="var(--site-skin)"/>
      <path d="M61 27q13-19 26 0z" fill="var(--hat, var(--kf-accent))"/><rect x="58" y="24" width="32" height="5" rx="2.5" fill="var(--hat, var(--kf-accent))"/>
      <path d="M68 36q4 3 8 0" stroke="var(--kf-ink)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
  </symbol>
  <!-- Campfire second sheet (flame leans left) · seated person second sheet (head tilts, eyes close) -->
  <symbol id="lg-fire-b" viewBox="0 0 60 50">
    <path d="M8 46l44-12M8 34l44 12" stroke="var(--site-bark)" stroke-width="6" stroke-linecap="round"/>
    <path d="M26 2c6 12 18 16 14 28-2 6-18 6-20 0-4-8 2-14 6-28z" fill="var(--kf-accent)"/>
    <path d="M27 16c3 7 7 10 5 16-1 3-8 3-9 0-1-5 2-9 4-16z" fill="var(--kf-accent-soft)"/>
  </symbol>
  <symbol id="lg-sit" viewBox="0 0 100 110">
    <path d="M18 64l48 42M66 64l-48 42" stroke="var(--site-bark)" stroke-width="4" stroke-linecap="round"/>
    <path d="M14 60h58l-6 10H18z" fill="var(--chair, var(--site-moss))"/>
    <path d="M38 62l26 2 6 36" stroke="var(--pants, var(--site-denim))" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="74" cy="102" rx="9" ry="4" fill="var(--kf-ink)"/>
    <path d="M26 30q14-10 26 0l2 34H24z" fill="var(--shirt, var(--kf-accent-soft))"/>
    <path d="M50 36l18 14" stroke="var(--shirt, var(--kf-accent-soft))" stroke-width="7" stroke-linecap="round"/><circle cx="70" cy="51" r="4" fill="var(--site-skin)"/>
    <circle cx="39" cy="15" r="11" fill="var(--site-skin)"/>
    <path d="M26 12q13-17 26 0z" fill="var(--hat, var(--kf-accent))"/><rect x="23" y="10" width="32" height="4" rx="2" fill="var(--hat, var(--kf-accent))"/>
  </symbol>
  <symbol id="lg-sit-b" viewBox="0 0 100 110">
    <path d="M18 64l48 42M66 64l-48 42" stroke="var(--site-bark)" stroke-width="4" stroke-linecap="round"/>
    <path d="M14 60h58l-6 10H18z" fill="var(--chair, var(--site-moss))"/>
    <path d="M38 62l26 2 6 36" stroke="var(--pants, var(--site-denim))" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="74" cy="102" rx="9" ry="4" fill="var(--kf-ink)"/>
    <path d="M26 30q14-10 26 0l2 34H24z" fill="var(--shirt, var(--kf-accent-soft))"/>
    <path d="M50 36l18 14" stroke="var(--shirt, var(--kf-accent-soft))" stroke-width="7" stroke-linecap="round"/><circle cx="70" cy="51" r="4" fill="var(--site-skin)"/>
    <g transform="rotate(12 40 26)">
    <circle cx="39" cy="15" r="11" fill="var(--site-skin)"/>
    <path d="M26 12q13-17 26 0z" fill="var(--hat, var(--kf-accent))"/><rect x="23" y="10" width="32" height="4" rx="2" fill="var(--hat, var(--kf-accent))"/>
      <path d="M34 17q2 1.5 4 0M42 17q2 1.5 4 0" stroke="var(--kf-ink)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </g>
  </symbol>
  <symbol id="lg-mascot" viewBox="0 0 120 180">
    <path d="M40 140l-4 34M80 140l4 34" stroke="var(--site-steel-mid)" stroke-width="13" stroke-linecap="round"/>
    <path d="M26 96q34-16 68 0l6 54H20z" fill="var(--kf-accent)"/>
    <rect x="22" y="124" width="76" height="6" fill="var(--site-chrome)"/><path d="M60 88v62" stroke="var(--site-ember)" stroke-width="2"/>
    <path d="M28 100l-12 40M92 100l12 40" stroke="var(--kf-accent)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="16" cy="144" r="6" fill="var(--site-skin)"/><circle cx="104" cy="144" r="6" fill="var(--site-skin)"/>
    <circle cx="60" cy="66" r="24" fill="var(--site-skin)"/>
    <path d="M51 66h.1M69 66h.1" stroke="var(--kf-ink)" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 76q8 7 16 0" stroke="var(--kf-ink)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M30 52q30-46 60 0z" fill="var(--kf-accent)"/><rect x="24" y="48" width="72" height="9" rx="4.5" fill="var(--kf-accent)"/>
    <circle cx="33" cy="66" r="8" fill="var(--site-steel)"/><circle cx="87" cy="66" r="8" fill="var(--site-steel)"/>
    <path d="M40 54h40" stroke="var(--site-chrome)" stroke-width="3" opacity=".7"/>
  </symbol>
<symbol id="lg-mascot-b" viewBox="0 0 120 180">
    <path d="M40 140l-4 34M80 140l4 34" stroke="var(--site-steel-mid)" stroke-width="13" stroke-linecap="round"/>
    <path d="M26 96q34-16 68 0l6 54H20z" fill="var(--kf-accent)"/>
    <rect x="22" y="124" width="76" height="6" fill="var(--site-chrome)"/><path d="M60 88v62" stroke="var(--site-ember)" stroke-width="2"/>
    <path d="M28 100l-12 40M92 100l14 -22" stroke="var(--kf-accent)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="16" cy="144" r="6" fill="var(--site-skin)"/><circle cx="106" cy="76" r="6" fill="var(--site-skin)"/><path d="M106 72v-10" stroke="var(--site-skin)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="66" r="24" fill="var(--site-skin)"/>
    <path d="M51 66h.1M69 66h.1" stroke="var(--kf-ink)" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 76q8 7 16 0" stroke="var(--kf-ink)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M30 52q30-46 60 0z" fill="var(--kf-accent)"/><rect x="24" y="48" width="72" height="9" rx="4.5" fill="var(--kf-accent)"/>
    <circle cx="33" cy="66" r="8" fill="var(--site-steel)"/><circle cx="87" cy="66" r="8" fill="var(--site-steel)"/>
    <path d="M40 54h40" stroke="var(--site-chrome)" stroke-width="3" opacity=".7"/>
  </symbol>
  <symbol id="lg-van" viewBox="0 0 220 140">
    <rect x="44" y="10" width="120" height="12" rx="4" fill="var(--site-wood)"/><rect x="60" y="2" width="80" height="10" rx="3" fill="var(--site-wood-dark)"/>
    <path d="M12 54q4-28 34-30h112q34 2 48 30v50q0 10-10 10H22q-10 0-10-10z" fill="var(--site-yellow)"/>
    <rect x="52" y="34" width="44" height="30" rx="6" fill="var(--site-glass)"/><rect x="104" y="34" width="44" height="30" rx="6" fill="var(--site-glass)"/>
    <path d="M156 34h22q14 2 18 30h-40z" fill="var(--site-glass)"/>
    <rect x="8" y="96" width="204" height="10" rx="5" fill="var(--site-rim)"/>
    <circle cx="58" cy="114" r="20" fill="var(--kf-ink)"/><circle cx="58" cy="114" r="8" fill="var(--site-tire)"/>
    <circle cx="164" cy="114" r="20" fill="var(--kf-ink)"/><circle cx="164" cy="114" r="8" fill="var(--site-tire)"/>
  </symbol>
<symbol id="lg-van-b" viewBox="0 0 220 140">
    <g transform="translate(0 -3)">
    <rect x="44" y="10" width="120" height="12" rx="4" fill="var(--site-wood)"/><rect x="60" y="2" width="80" height="10" rx="3" fill="var(--site-wood-dark)"/>
    <path d="M12 54q4-28 34-30h112q34 2 48 30v50q0 10-10 10H22q-10 0-10-10z" fill="var(--site-yellow)"/>
    <rect x="52" y="34" width="44" height="30" rx="6" fill="var(--site-glass)"/><rect x="104" y="34" width="44" height="30" rx="6" fill="var(--site-glass)"/>
    <path d="M156 34h22q14 2 18 30h-40z" fill="var(--site-glass)"/>
    <rect x="8" y="96" width="204" height="10" rx="5" fill="var(--site-rim)"/>
    </g>
    <circle cx="58" cy="114" r="20" fill="var(--kf-ink)"/><circle cx="58" cy="114" r="8" fill="var(--site-tire)"/>
    <circle cx="164" cy="114" r="20" fill="var(--kf-ink)"/><circle cx="164" cy="114" r="8" fill="var(--site-tire)"/>
  </symbol>
  <symbol id="lg-cabin" viewBox="0 0 220 120">
    <path d="M10 52L110 8l100 44" fill="none" stroke="var(--cabin-line, var(--site-wood))" stroke-width="6" stroke-linejoin="round"/>
    <path d="M24 50h172v66H24z" fill="var(--cabin-fill, var(--site-sand))" stroke="var(--cabin-line, var(--site-wood))" stroke-width="4"/>
    <path d="M44 56v60M64 56v60M84 56v60M136 56v60M156 56v60M176 56v60" stroke="var(--cabin-line, var(--site-wood))" stroke-width="3"/>
    <path d="M96 30h28v20H96zM96 76h28v40H96z" fill="none" stroke="var(--cabin-line, var(--site-wood))" stroke-width="4"/>
  </symbol>
  <symbol id="lg-fence" viewBox="0 0 240 80">
    <path d="M0 30h240M0 58h240" stroke="var(--site-mustard)" stroke-width="7"/>
    <g fill="var(--site-wood)"><path d="M6 80V12l8-10 8 10v68z"/><path d="M32 80V12l8-10 8 10v68z"/><path d="M58 80V12l8-10 8 10v68z"/><path d="M84 80V12l8-10 8 10v68z"/><path d="M110 80V12l8-10 8 10v68z"/><path d="M136 80V12l8-10 8 10v68z"/><path d="M162 80V12l8-10 8 10v68z"/><path d="M188 80V12l8-10 8 10v68z"/><path d="M214 80V12l8-10 8 10v68z"/></g>
  </symbol>
  <symbol id="lg-stump" viewBox="0 0 120 130">
    <path d="M24 70v40q-8 12-18 14h108q-10-2-18-14V70z" fill="var(--site-wood-deep)"/>
    <ellipse cx="60" cy="70" rx="36" ry="12" fill="var(--site-wood-light)"/><ellipse cx="60" cy="70" rx="22" ry="7" fill="none" stroke="var(--site-wood)" stroke-width="2"/>
    <path d="M58 66L96 8" stroke="var(--site-gold)" stroke-width="8" stroke-linecap="round"/>
    <path d="M44 52l20-20 12 14-14 18z" fill="var(--site-silver-2)"/>
  </symbol>
  <symbol id="lg-emblem-a" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="none" stroke="var(--site-forest)" stroke-width="7"/>
    <g fill="var(--site-forest)"><path d="M38 20l14 26h-6l10 18H22l10-18h-6z"/><path d="M82 16l16 30h-7l11 20H62l11-20h-7z"/>
    <path d="M60 52l34 44H26z"/></g>
    <path d="M60 68l10 28H50z" fill="var(--kf-surface)"/><path d="M78 92c4-6 8-8 6-14-3 4-6 4-6 14z" fill="var(--kf-surface)"/>
  </symbol>
  <symbol id="lg-emblem-b" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="none" stroke="var(--site-forest)" stroke-width="7"/>
    <g fill="var(--site-forest)"><rect x="24" y="22" width="34" height="34" rx="4"/><rect x="62" y="22" width="34" height="34" rx="4"/><rect x="24" y="60" width="34" height="34" rx="4"/><rect x="62" y="60" width="34" height="34" rx="4"/></g>
    <path d="M32 46V32h6l4 6 4-6h6v14M70 76h18M70 76l4-4M88 76l-4 4M82 30l-8 12h8l-6 10" stroke="var(--kf-surface)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M36 70h10v14H36z" fill="none" stroke="var(--kf-surface)" stroke-width="3"/>
  </symbol>
  <symbol id="lg-bubble" viewBox="0 0 120 92"><path d="M60 4c30 0 56 15 56 36S90 76 60 76c-6 0-12-1-17-2L22 90l6-20C12 62 4 52 4 40 4 19 30 4 60 4z" fill="var(--bubble, var(--kf-accent-soft))"/></symbol>
  <symbol id="lg-360" viewBox="0 0 100 100"><g fill="none" stroke="var(--kf-surface)" stroke-width="4"><circle cx="50" cy="50" r="44"/><ellipse cx="50" cy="50" rx="20" ry="44"/><path d="M8 38h84M8 62h84"/></g></symbol>
  <symbol id="lg-i-mail" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor"/><path d="M3 6l9 7 9-7" stroke="var(--icon-bg, var(--site-leaf))" stroke-width="2" fill="none"/></symbol>
  <symbol id="lg-i-cal" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="lg-i-insta" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></symbol>
  <symbol id="lg-i-line" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor"/><path d="M6 11c0-3 3-5 6-5s6 2 6 5-3 5-6 5l-3 2v-2.4C7.3 14.8 6 13 6 11z" fill="var(--kf-surface)"/></symbol>
  <symbol id="lg-i-arrow" viewBox="0 0 40 10"><path d="M0 7h38l-7-5" fill="none" stroke="currentColor" stroke-width="1.4"/></symbol>
  <symbol id="lg-i-ext" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" fill="none" stroke="currentColor" stroke-width="2"/></symbol>
  <symbol id="lg-i-menu" viewBox="0 0 30 20"><path d="M2 2h26M6 10h18M2 18h26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="lg-i-close" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
</svg>`;

  const LINKS = [
    ["news.html", "NEWS", "News"],
    ["facilities.html", "FACILITIES", "Facility Guide"],
    ["index.html#guide", "GUIDE", "Usage guide"],
    ["index.html#fees", "FEE", "Fee"],
    ["index.html#faq", "FAQ", "Frequently asked questions"],
  ];

  const HEADER = `
<header class="lg-head" data-slot="header">
  <a class="lg-logo" href="index.html" aria-label="Back to start"><span class="lg-logo__big">LOGO</span><span class="lg-logo__mark"></span><span class="lg-logo__small" data-label="Your English name under the logo here (region, campground name)">CAMP NAME</span></a>
  <div class="lg-head__cta">
    <a class="lg-pill lg-pill--leaf" href="#contact"><span class="lg-pill__bg"></span><svg class="lg-pill__icon"><use href="#lg-i-mail"/></svg><span class="lg-pill__txt"><b>CONTACT</b><small>Contact Us</small></span></a>
    <a class="lg-pill lg-pill--orange" href="#reserve"><span class="lg-pill__bg"></span><svg class="lg-pill__icon"><use href="#lg-i-cal"/></svg><span class="lg-pill__txt"><b>RESERVE</b><small>Check availability</small></span></a>
  </div>
  <button class="lg-menu-btn" type="button" aria-label="Open Menu" aria-controls="lg-nav" aria-expanded="false"><span class="lg-pill__bg"></span><svg><use href="#lg-i-menu"/></svg></button>
</header>
<dialog id="lg-nav" class="lg-nav" data-slot="menu-modal" aria-label="Menu">
  <div class="lg-nav__photo wf-img" data-label="Log cabin office exterior · clear day · gravel yard and forest · portrait 3:4"></div>
  <div class="lg-nav__panel">
    <svg class="lg-nav__edge" viewBox="0 0 120 900" preserveAspectRatio="none" aria-hidden="true"><path d="M120 0H70C10 80 90 170 40 260S0 420 60 500 20 680 70 760 40 860 70 900h50z" fill="var(--kf-surface)"/></svg>
    <button class="lg-nav__close" type="button" aria-label="Close Menu"><svg><use href="#lg-i-close"/></svg></button>
    <nav class="lg-nav__list" aria-label="Main menu">
      ${LINKS.map(([href, en, ko]) => `<a href="${href}"><i></i><b>${en}</b><small>${ko}</small></a>`).join("")}
    </nav>
    <div class="lg-nav__mascot" aria-hidden="true"><span class="lg-bubble lg-bubble--sm"><svg><use href="#lg-bubble"/></svg><em>Reservations are<br>From here!</em></span><svg class="lg-nav__man"><use href="#lg-mascot"/></svg></div>
    <div class="lg-nav__cta">
      <a class="lg-wide lg-wide--orange" href="#reserve"><svg><use href="#lg-i-cal"/></svg><b>RESERVE</b><small>Check availability</small></a>
      <a class="lg-wide lg-wide--leaf" href="#contact"><svg><use href="#lg-i-mail"/></svg><b>CONTACT</b><small>Contact Us</small></a>
      <a class="lg-wide lg-wide--line" href="#instagram"><svg><use href="#lg-i-insta"/></svg><b>INSTAGRAM</b><small>Official Account</small></a>
    </div>
    <svg class="lg-nav__hill" viewBox="0 0 400 140" aria-hidden="true"><path d="M0 140C40 40 120 30 170 80 220 10 330 0 400 60v80z" fill="var(--site-forest)"/><path d="M120 140c30-50 90-60 130-20 30-30 90-40 150 0v20z" fill="var(--site-leaf)"/></svg>
  </div>
</dialog>
<a class="lg-float" href="#instagram" data-slot="float-instagram"><svg><use href="#lg-i-insta"/></svg><span><b>INSTAGRAM</b><small>Official Account</small></span></a>`;

  const FOOTER = `
<footer class="lg-foot" id="reserve" data-slot="footer-hills">
  <svg class="lg-foot__hills" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 300V170C80 110 170 100 250 140 330 40 520 20 640 110 760 30 960 30 1060 120 1150 60 1300 50 1440 130v170z" fill="var(--site-forest)"/>
  </svg>
  <div class="lg-foot__trees" aria-hidden="true">
    <svg class="lg-foot__tree" style="left:2%;width:120px"><use href="#lg-tree"/></svg>
    <svg class="lg-foot__tree" style="left:8%;width:80px;--leaf:var(--site-leaf-deep)"><use href="#lg-tree"/></svg>
    <svg class="lg-foot__tree" style="right:4%;width:150px"><use href="#lg-tree"/></svg>
    <svg class="lg-foot__tree" style="right:13%;width:90px;--leaf:var(--site-leaf-tree)"><use href="#lg-tree"/></svg>
  </div>
  <div class="lg-foot__cards">
    <section class="lg-fcard" data-appear="fade">
      <span class="lg-fcard__man" aria-hidden="true"><span class="lg-bubble lg-bubble--sm" data-appear="pop"><svg><use href="#lg-bubble"/></svg><em>Reservations are<br>From here!</em></span><svg><use href="#lg-mascot"/></svg></span>
      <h2 class="lg-fcard__title lg-fcard__title--orange">RESERVE</h2>
      <p class="lg-fcard__sub">Your booking subtitle here</p>
      <p class="lg-fcard__text">Your reservation notice here in three lines.<br>Adding options like cancellation and rental, and<br>Notes where to change the number of guests.</p>
      <a class="lg-wide lg-wide--orange" href="#reserve"><svg><use href="#lg-i-cal"/></svg><small>Check availability</small><svg class="lg-wide__arrow"><use href="#lg-i-arrow"/></svg></a>
    </section>
    <section class="lg-fcard" id="contact" data-appear="fade" style="--d:.2s">
      <h2 class="lg-fcard__title lg-fcard__title--leaf">CONTACT</h2>
      <p class="lg-fcard__sub">Your contact subtitle here</p>
      <p class="lg-fcard__text">Your four lines of contact guidance here.<br>Please contact us by phone or form.<br>A note that replies may take some time.<br>Notice that sales inquiries are not accepted.</p>
      <a class="lg-wide lg-wide--leaf" href="#contact"><svg><use href="#lg-i-mail"/></svg><small>Contact via Form</small><svg class="lg-wide__arrow"><use href="#lg-i-arrow"/></svg></a>
    </section>
  </div>
  <div class="lg-foot__base">
    <nav class="lg-foot__links" aria-label="Bottom Menu"><a href="index.html">First<i class="lg-foot__line" aria-hidden="true"></i></a><a href="news.html">News<i class="lg-foot__line" aria-hidden="true"></i></a><a href="facilities.html">Facility Guide<i class="lg-foot__line" aria-hidden="true"></i></a><a href="index.html#guide">Usage guide<i class="lg-foot__line" aria-hidden="true"></i></a><a href="index.html#fees">Fee<i class="lg-foot__line" aria-hidden="true"></i></a><a href="index.html#faq">Frequently asked questions<i class="lg-foot__line" aria-hidden="true"></i></a></nav>
    <div class="lg-foot__row">
      <a class="lg-logo lg-logo--big" href="index.html" aria-label="Back to start"><span class="lg-logo__big">LOGO</span><span class="lg-logo__mark"></span><span class="lg-logo__small" data-label="Your English name under the logo here (region, campground name)">CAMP NAME</span></a>
      <div class="lg-foot__addr"><b>Your campground name here</b><span>〒000-0000 One line of your address here</span><span>TEL : 000-0000-0000 (00:00~00:00)</span></div>
      <div class="lg-foot__family" aria-hidden="true"><span data-fx="frame-flip-loop" data-fx-frame-flip-loop="every: 667" style="width:46px;--shirt:var(--site-sky);--pants:var(--site-navy);--hat:var(--site-yellow)"><svg data-fx-part="frame"><use href="#lg-person"/></svg><svg data-fx-part="frame"><use href="#lg-person-b"/></svg></span><span data-fx="frame-flip-loop" data-fx-frame-flip-loop="every: 667" style="width:30px;--shirt:var(--site-pink);--pants:var(--site-denim);--hat:var(--kf-accent)"><svg data-fx-part="frame"><use href="#lg-person"/></svg><svg data-fx-part="frame"><use href="#lg-person-b"/></svg></span></div>
    </div>
    <p class="lg-foot__copy" data-label="Your copyright name in English here">© CAMP NAME</p>
  </div>
</footer>`;

  document.body.insertAdjacentHTML("afterbegin", SPRITE + HEADER);
  document.body.insertAdjacentHTML("beforeend", FOOTER);

  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.querySelectorAll("video[autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });

  // ── Menu window: like the original Studio modal it opens on the top layer and is revealed by opacity only over .4s cubic-bezier(.4,.4,0,1), and speech bubbles inside the window pop out.
  //    The logo has a separate copy at the same spot inside the window (the original window frame also carries one more header logo) ──
  const nav = document.getElementById("lg-nav");
  const openBtn = document.querySelector(".lg-menu-btn");
  nav.prepend(Object.assign(document.querySelector(".lg-head .lg-logo").cloneNode(true), { className: "lg-logo lg-nav__logo" }));
  const open = () => {
    nav.showModal();
    requestAnimationFrame(() => nav.classList.add("is-ready"));
    openBtn.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    nav.classList.remove("is-ready");
    openBtn.setAttribute("aria-expanded", "false");
    setTimeout(() => nav.close(), reduced ? 0 : 400);
  };
  openBtn.addEventListener("click", open);
  nav.querySelector(".lg-nav__close").addEventListener("click", close);
  nav.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  nav.addEventListener("click", (e) => { if (e.target === nav) close(); });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => close()));

  // Second arrow for arrow swapping (decorative) — arrows of the More button, slide buttons, status ring and wide pill
  document.querySelectorAll(".lg-more > svg:has(use[href='#lg-i-arrow']), .ix-pick__nav > svg, .ix-links__dot > svg, .lg-wide__arrow").forEach((svg) => {
    const box = document.createElement("span");
    box.className = "lg-arrow";
    box.setAttribute("aria-hidden", "true");
    svg.replaceWith(box);
    const b = svg.cloneNode(true);
    svg.classList.add("lg-arrow__a"); b.classList.add("lg-arrow__b");
    box.append(svg, b);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    root.classList.add("lg-motion");

    // Entrance: is-in when it reaches 10% from the screen bottom. fade is opacity 0→1 over 1.2s, pop is scale 0→1 with a .45s bounce (delay .1s)
    ScrollTrigger.batch("[data-appear]", {
      start: "top 90%",
      once: true,
      onEnter: (els) => els.forEach((el) => el.classList.add("is-in")),
    });

    // The floating social pill disappears at 91~93% of the page end (the same range as the original’s scroll-timeline)
    const float = document.querySelector(".lg-float");
    const fade = ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => float.classList.toggle("is-gone", self.progress > 0.92),
    });
    return () => { root.classList.remove("lg-motion"); fade.kill(); };
  });
})();
