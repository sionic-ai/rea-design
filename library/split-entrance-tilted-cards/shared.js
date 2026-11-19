// Six shapes and two characters repeat in the loader, hero, section names, drawer and link panel — one set is planted at the start of the document and <use> is called.
// Colors are painted only with variables that inner elements inherit (--ch-*) and currentColor, so changing the skin changes them together.
(() => {
  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
  <symbol id="o-dots" viewBox="0 0 100 100"><g fill="currentColor"><circle cx="31" cy="18" r="16"/><circle cx="69" cy="18" r="16"/><circle cx="31" cy="50" r="16"/><circle cx="69" cy="50" r="16"/><circle cx="31" cy="82" r="16"/><circle cx="69" cy="82" r="16"/></g></symbol>
  <symbol id="o-heart" viewBox="0 0 100 100"><path fill="currentColor" d="M50 90C22 70 5 54 5 33A23 23 0 0 1 50 24a23 23 0 0 1 45 9c0 21-17 37-45 57Z"/></symbol>
  <symbol id="o-arch" viewBox="0 0 100 100"><path fill="currentColor" d="M10 92V52a40 40 0 0 1 80 0v40H64V52a14 14 0 0 0-28 0v40Z"/></symbol>
  <symbol id="o-clover" viewBox="0 0 100 100"><g fill="currentColor" transform="rotate(18 50 50)"><circle cx="50" cy="24" r="22"/><circle cx="76" cy="50" r="22"/><circle cx="50" cy="76" r="22"/><circle cx="24" cy="50" r="22"/><circle cx="50" cy="50" r="22"/></g></symbol>
  <symbol id="o-flower" viewBox="0 0 100 100"><g fill="currentColor"><circle cx="30" cy="30" r="23"/><circle cx="70" cy="30" r="23"/><circle cx="30" cy="70" r="23"/><circle cx="70" cy="70" r="23"/><circle cx="50" cy="50" r="20"/></g></symbol>
  <symbol id="o-spark" viewBox="0 0 100 100"><path fill="currentColor" d="M50 2c5 30 18 43 48 48-30 5-43 18-48 48-5-30-18-43-48-48C32 45 45 32 50 2Z"/></symbol>
  <symbol id="o-bear" viewBox="0 0 300 300">
    <path style="fill:var(--ch-fur)" d="M58 196C34 170 18 128 22 92c3-22 30-24 36-4 7 24 12 52 34 80Z"/>
    <path style="fill:var(--ch-fur)" d="M242 196c24-26 40-68 36-104-3-22-30-24-36-4-7 24-12 52-34 80Z"/>
    <circle style="fill:var(--ch-fur)" cx="80" cy="56" r="30"/><circle style="fill:var(--ch-soft)" cx="80" cy="56" r="15"/>
    <circle style="fill:var(--ch-fur)" cx="220" cy="56" r="30"/><circle style="fill:var(--ch-soft)" cx="220" cy="56" r="15"/>
    <path style="fill:var(--ch-shirt)" d="M78 206c10-14 40-22 72-22s62 8 72 22l14 94H64Z"/>
    <ellipse style="fill:var(--ch-fur)" cx="150" cy="128" rx="98" ry="84"/>
    <ellipse style="fill:var(--ch-ink)" cx="108" cy="124" rx="31" ry="27"/><ellipse style="fill:var(--ch-ink)" cx="192" cy="124" rx="31" ry="27"/>
    <path style="fill:none;stroke:var(--ch-paper);stroke-width:6;stroke-linecap:round;stroke-linejoin:round" d="M96 112l18 12-18 12M204 112l-18 12 18 12"/>
    <ellipse style="fill:var(--ch-soft)" cx="150" cy="160" rx="44" ry="34"/>
    <ellipse style="fill:var(--ch-ink)" cx="150" cy="142" rx="12" ry="8"/>
    <path style="fill:var(--ch-ink)" d="M128 160c4 22 40 22 44 0Z"/><path style="fill:var(--ch-cheek)" d="M138 172c6 8 18 8 24 0-6-5-18-5-24 0Z"/>
  </symbol>
  <symbol id="o-bear-cheer" viewBox="0 0 400 330">
    <path style="fill:none;stroke:var(--ch-fur);stroke-width:44;stroke-linecap:round" d="M158 236Q96 206 62 118M242 236q62-30 96-118"/>
    <circle style="fill:var(--ch-fur)" cx="58" cy="104" r="28"/><circle style="fill:var(--ch-fur)" cx="342" cy="104" r="28"/>
    <path style="fill:var(--ch-shirt)" d="M140 222c14-12 36-18 60-18s46 6 60 18l16 108H124Z"/>
    <circle style="fill:var(--ch-fur)" cx="146" cy="74" r="26"/><circle style="fill:var(--ch-soft)" cx="146" cy="74" r="13"/>
    <circle style="fill:var(--ch-fur)" cx="254" cy="74" r="26"/><circle style="fill:var(--ch-soft)" cx="254" cy="74" r="13"/>
    <ellipse style="fill:var(--ch-fur)" cx="200" cy="140" rx="76" ry="66"/>
    <ellipse style="fill:var(--ch-ink)" cx="168" cy="136" rx="25" ry="21"/><ellipse style="fill:var(--ch-ink)" cx="232" cy="136" rx="25" ry="21"/>
    <path style="fill:none;stroke:var(--ch-paper);stroke-width:5;stroke-linecap:round;stroke-linejoin:round" d="M159 127l14 9-14 9M241 127l-14 9 14 9"/>
    <ellipse style="fill:var(--ch-soft)" cx="200" cy="166" rx="34" ry="26"/>
    <ellipse style="fill:var(--ch-ink)" cx="200" cy="152" rx="9" ry="6"/>
    <path style="fill:var(--ch-ink)" d="M183 166c3 17 31 17 34 0Z"/><path style="fill:var(--ch-cheek)" d="M191 175c5 6 13 6 18 0-5-4-13-4-18 0Z"/>
  </symbol>
  <symbol id="o-mouse" viewBox="0 0 300 300">
    <circle style="fill:var(--ch-fur)" cx="62" cy="70" r="52"/><circle style="fill:var(--ch-soft)" cx="62" cy="70" r="30"/>
    <circle style="fill:var(--ch-fur)" cx="238" cy="70" r="52"/><circle style="fill:var(--ch-soft)" cx="238" cy="70" r="30"/>
    <path style="fill:var(--ch-fur)" d="M86 210c12-12 36-18 64-18s52 6 64 18l10 90H76Z"/>
    <path style="fill:var(--ch-shirt)" d="M128 214l22 12 22-12v28l-22-12-22 12Z"/>
    <ellipse style="fill:var(--ch-fur)" cx="150" cy="140" rx="92" ry="78"/>
    <ellipse style="fill:var(--ch-soft)" cx="150" cy="150" rx="70" ry="56"/>
    <ellipse style="fill:var(--ch-ink)" cx="114" cy="132" rx="26" ry="24"/><ellipse style="fill:var(--ch-ink)" cx="186" cy="132" rx="26" ry="24"/>
    <circle style="fill:var(--ch-paper)" cx="120" cy="126" r="8"/><circle style="fill:var(--ch-paper)" cx="192" cy="126" r="8"/>
    <ellipse style="fill:var(--ch-ink)" cx="150" cy="158" rx="10" ry="7"/>
    <path style="fill:none;stroke:var(--ch-ink);stroke-width:4;stroke-linecap:round" d="M136 172c8 8 20 8 28 0"/>
    <ellipse style="fill:var(--ch-cheek)" cx="96" cy="166" rx="12" ry="7"/><ellipse style="fill:var(--ch-cheek)" cx="204" cy="166" rx="12" ry="7"/>
  </symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  const head = document.querySelector(".o-head");
  const burger = head?.querySelector(".o-burger");
  const drawer = head?.querySelector(".o-drawer");
  const blur = document.querySelector(".o-blur");
  if (head && burger && drawer) {
    const set = (open) => {
      head.classList.toggle("is-open", open);
      blur?.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", (e) => { e.stopPropagation(); set(!head.classList.contains("is-open")); });
    drawer.addEventListener("click", (e) => e.stopPropagation());
    head.addEventListener("click", () => set(false));
    blur?.addEventListener("click", () => set(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // The original is jQuery animate (500ms, swing) — swing is a half-cosine curve, the same as sine.inOut
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id.length > 1 ? document.querySelector(id) : document.documentElement;
    if (!target) return;
    e.preventDefault();
    const y = target === document.documentElement ? 0 : target.getBoundingClientRect().top + scrollY;
    if (window.gsap && window.ScrollToPlugin) {
      gsap.registerPlugin(ScrollToPlugin);
      gsap.to(window, { scrollTo: y, duration: 0.5, ease: "sine.inOut" });
    } else scrollTo({ top: y, behavior: "smooth" });
  });
})();
