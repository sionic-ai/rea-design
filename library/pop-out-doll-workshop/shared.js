// The original titles and decorations are hand-drawn image files — a set of hand-drawn SVGs of the same position and size is planted before the document <use> is called.
// Colors are painted only with inherited variables (--fl-*, --rb, --tag) and currentColor.
(() => {
  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
  <symbol id="m-flags" viewBox="0 0 249 63">
    <path style="fill:none;stroke:var(--fl-str,currentColor);stroke-width:1.6" d="M2 8q123 30 245 0"/>
    <path style="fill:var(--fl-1,currentColor)" d="M16 12l22 5-9 22Z"/><path style="fill:var(--fl-2,currentColor)" d="M46 19l23 3-10 23Z"/>
    <path style="fill:var(--fl-3,currentColor)" d="M78 23l23 1-11 24Z"/><path style="fill:var(--fl-1,currentColor)" d="M112 25h24l-12 24Z"/>
    <path style="fill:var(--fl-2,currentColor)" d="M148 24l23-1-11 24Z"/><path style="fill:var(--fl-3,currentColor)" d="M180 22l23-3-10 23Z"/>
    <path style="fill:var(--fl-1,currentColor)" d="M211 17l22-5-13 27Z"/>
  </symbol>
  <symbol id="m-tag" viewBox="0 0 101 144">
    <path style="fill:none;stroke:var(--tag-str,currentColor);stroke-width:2" d="M50 2c-14 8-10 26 0 34"/>
    <path style="fill:var(--tag,currentColor)" d="M30 40l20-16 20 16v96a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z" transform="rotate(-14 50 80)"/>
    <circle style="fill:var(--tag-hole,currentColor)" cx="50" cy="40" r="5" transform="rotate(-14 50 80)"/>
  </symbol>
  <symbol id="m-ribbon" viewBox="0 0 229 81">
    <path style="fill:var(--rb-edge,currentColor)" d="M2 30h40v40H2l14-20Z"/><path style="fill:var(--rb-edge,currentColor)" d="M227 30h-40v40h40l-14-20Z"/>
    <path style="fill:var(--rb,currentColor)" d="M26 14q88-14 177 0v46q-89-14-177 0Z"/>
    <path style="fill:none;stroke:var(--rb-line,currentColor);stroke-width:1.4;stroke-dasharray:4 4" d="M34 21q80-12 161 0M34 53q80-12 161 0"/>
  </symbol>
  <symbol id="m-bear" viewBox="0 0 100 130">
    <circle cx="26" cy="16" r="11"/><circle cx="74" cy="16" r="11"/><ellipse cx="50" cy="36" rx="30" ry="26"/>
    <path d="M24 58q26-10 52 0l6 40q-32 10-64 0Z"/><path d="M26 64 8 84q-4 8 4 10l18-16Z"/><path d="M74 64l18 20q4 8-4 10L70 78Z"/>
    <path d="M28 94 22 124q8 6 18 0l6-28ZM72 94l6 30q-8 6-18 0l-6-28Z"/>
  </symbol>
  <symbol id="m-arm" viewBox="0 0 100 160">
    <path d="M30 160V70q0-10 8-12V20q0-8 7-8t7 8v34h4V12q0-8 7-8t7 8v42h4V20q0-8 7-8t7 8v62l6-12q6-6 11 0L90 110q-6 18-20 26v24Z"/>
  </symbol>
  <symbol id="m-scissors" viewBox="0 0 255 260">
    <circle cx="127" cy="130" r="120" style="fill:none;stroke:var(--line,currentColor);stroke-width:2;stroke-dasharray:3 6"/>
    <g style="fill:none;stroke:var(--line,currentColor);stroke-width:4;stroke-linecap:round">
      <circle cx="96" cy="182" r="20"/><circle cx="150" cy="190" r="20"/><path d="M108 166 160 70M140 172 118 66"/><path d="M60 80q30-30 60-6"/>
    </g>
  </symbol>
  <symbol id="m-spool" viewBox="0 0 149 88">
    <g style="fill:none;stroke:var(--line,currentColor);stroke-width:2.4;stroke-linecap:round">
      <rect x="20" y="12" width="40" height="64" rx="4"/><path d="M14 12h52M14 76h52M24 24h32M24 36h32M24 48h32M24 60h32M60 40q40 10 70 40"/>
      <circle cx="112" cy="26" r="16"/><circle cx="106" cy="22" r="2"/><circle cx="118" cy="22" r="2"/><circle cx="106" cy="31" r="2"/><circle cx="118" cy="31" r="2"/>
    </g>
  </symbol>
  <symbol id="m-cutebear" viewBox="0 0 97 132">
    <rect x="52" y="6" width="38" height="82" rx="4" style="fill:var(--kf-surface)"/>
    <circle cx="20" cy="56" r="9" style="fill:var(--bear,currentColor)"/><circle cx="52" cy="56" r="9" style="fill:var(--bear,currentColor)"/>
    <ellipse cx="36" cy="76" rx="24" ry="21" style="fill:var(--bear,currentColor)"/><ellipse cx="36" cy="84" rx="10" ry="8" style="fill:var(--bear-soft,currentColor)"/>
    <circle cx="27" cy="72" r="2.6" style="fill:var(--bear-ink,currentColor)"/><circle cx="45" cy="72" r="2.6" style="fill:var(--bear-ink,currentColor)"/><ellipse cx="36" cy="80" rx="3" ry="2.2" style="fill:var(--bear-ink,currentColor)"/>
    <path d="M16 96q20-6 40 0l4 34H12Z" style="fill:var(--bear-cloth,currentColor)"/><path d="M50 98l10-20 6 4-8 20Z" style="fill:var(--bear,currentColor)"/>
  </symbol>
  <symbol id="m-cookie" viewBox="0 0 80 100">
    <circle cx="40" cy="20" r="17"/><path d="M20 38h40l14 18q4 8-4 10l-10-6v14l12 20q2 8-6 8l-12-14h-8L34 102q-8 0-6-8l12-20V60l-10 6q-8-2-4-10Z"/>
  </symbol>
  <symbol id="m-trees" viewBox="0 0 220 200">
    <path d="M30 10l22 40H40l18 30H2l18-30H8Z"/><rect x="26" y="80" width="8" height="14"/>
    <circle cx="140" cy="40" r="26"/><rect x="136" y="60" width="8" height="22"/>
    <path d="M100 110l18 34h-10l16 28H76l16-28H82Z"/><rect x="96" y="172" width="8" height="12"/>
    <circle cx="190" cy="140" r="20"/><rect x="186" y="156" width="8" height="18"/>
  </symbol>
  <symbol id="m-houses" viewBox="0 0 180 150">
    <path d="M10 60 40 32l30 28v40H10Z"/><path d="M110 100l25-24 25 24v34h-50Z"/><circle cx="140" cy="22" r="10"/><path d="M60 128h12v12H60Z"/>
  </symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  // jQuery’s swing is a half-cosine curve — same as sine.inOut
  const swing = "sine.inOut";
  const toY = (y, ms) => (window.gsap && window.ScrollToPlugin ? (gsap.registerPlugin(ScrollToPlugin), gsap.to(window, { scrollTo: y, duration: ms / 1000, ease: swing })) : scrollTo({ top: y, behavior: "smooth" }));

  // Back-to-top bear (appearance is appear-past-scroll) — pressing it goes to the top with ”fast” (.2s)
  document.querySelector(".m-top")?.addEventListener("click", () => toY(0, 200));

  // In-page link — 1s swing, 10px above the target
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    toY(t.getBoundingClientRect().top + scrollY - 10, 1000);
    history.pushState(null, "", a.getAttribute("href"));
  });

  // Phone menu — curtain fadeIn · fadeOut (.4s)
  const menu = document.querySelector(".m-menu");
  const fade = (show) => {
    if (!menu || !window.gsap) return menu?.classList.toggle("is-open", show);
    gsap.killTweensOf(menu);
    if (show) { menu.classList.add("is-open"); gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: swing }); }
    else gsap.to(menu, { opacity: 0, duration: 0.4, ease: swing, onComplete: () => menu.classList.remove("is-open") });
  };
  document.querySelector(".m-burger")?.addEventListener("click", () => fade(true));
  menu?.querySelector(".m-menu__close")?.addEventListener("click", () => fade(false));

  if (window.WOW && !matchMedia("(prefers-reduced-motion: reduce)").matches) new WOW().init();
})();
