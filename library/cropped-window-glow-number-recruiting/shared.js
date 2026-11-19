// Shared by all pages: the menu button (1279 and below) and the collapsible rows inside the menu. “Fade in on view” is handled by the fade-up part, and the character roll by the char-roll part.
(() => {
  // Icon set — put one copy at the end of body like the original <svg><use href="#ew-i-…"> Call it. The line drawings are newly drawn by us
  const L = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  const ICONS = {
    arrow: `<symbol id="ew-i-arrow" viewBox="0 0 16 16"><path ${L} d="M2 8h11M9 4l4 4-4 4"/></symbol>`,
    external: `<symbol id="ew-i-external" viewBox="0 0 16 16"><path ${L} d="M7 3H3v10h10V9M9.5 2.5H13.5v4M13.5 2.5 7.5 8.5"/></symbol>`,
    chevron: `<symbol id="ew-i-chevron" viewBox="0 0 16 16"><path ${L} d="m6 3 5 5-5 5"/></symbol>`,
    pin: `<symbol id="ew-i-pin" viewBox="0 0 9 12"><path fill="currentColor" d="M4.5 0A4.5 4.5 0 0 0 0 4.5C0 8 4.5 12 4.5 12S9 8 9 4.5A4.5 4.5 0 0 0 4.5 0Zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Z"/></symbol>`,
    logo: `<symbol id="ew-i-logo" viewBox="0 0 16 18"><path fill="currentColor" d="M8 0 16 6v12H0V6Zm-4 8v8h3v-5h2v5h3V8L8 5Z"/></symbol>`,
    start: `<symbol id="ew-i-start" viewBox="0 0 64 64"><path ${L} d="M16 56V8M16 10h30l-6 9 6 9H16"/></symbol>`,
    gender: `<symbol id="ew-i-gender" viewBox="0 0 64 64"><g ${L}><circle cx="22" cy="18" r="7"/><circle cx="42" cy="18" r="7"/><path d="M10 52V38a12 12 0 0 1 24 0v14M30 52V38a12 12 0 0 1 24 0v14"/></g></symbol>`,
    design: `<symbol id="ew-i-design" viewBox="0 0 64 64"><g ${L}><path d="M10 54 54 10l-6-6L4 48Z"/><path d="M14 44l4 4M20 38l4 4M26 32l4 4M32 26l4 4M38 20l4 4"/></g></symbol>`,
    group: `<symbol id="ew-i-group" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="18" r="7"/><circle cx="14" cy="26" r="5"/><circle cx="50" cy="26" r="5"/><path d="M20 52V40a12 12 0 0 1 24 0v12M4 52v-8a10 10 0 0 1 14-9M60 52v-8a10 10 0 0 0-14-9"/></g></symbol>`,
    stairs: `<symbol id="ew-i-stairs" viewBox="0 0 64 64"><path ${L} d="M6 56h14V44h12V32h12V20h14M40 8h12v12"/></symbol>`,
    calendar: `<symbol id="ew-i-calendar" viewBox="0 0 64 64"><g ${L}><rect x="8" y="12" width="48" height="44" rx="4"/><path d="M8 24h48M20 6v12M44 6v12M18 34h4M30 34h4M42 34h4M18 44h4M30 44h4"/></g></symbol>`,
    clock: `<symbol id="ew-i-clock" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="32" r="24"/><path d="M32 18v14l10 6"/></g></symbol>`,
    care: `<symbol id="ew-i-care" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="20" r="9"/><path d="M14 54c0-10 8-18 18-18s18 8 18 18M26 18h0M38 18h0"/></g></symbol>`,
    sun: `<symbol id="ew-i-sun" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="32" r="10"/><path d="M32 8v6M32 50v6M8 32h6M50 32h6M15 15l4 4M45 45l4 4M15 49l4-4M45 19l4-4"/></g></symbol>`,
    shield: `<symbol id="ew-i-shield" viewBox="0 0 64 64"><g ${L}><path d="M8 40c6-2 12 0 16 4h10a4 4 0 0 1 0 8H22M34 48l14-6a4 4 0 0 1 4 7L36 58H8"/><circle cx="30" cy="16" r="6"/><circle cx="44" cy="20" r="5"/><path d="M20 34a10 10 0 0 1 20 0M38 32a8 8 0 0 1 14 0"/></g></symbol>`,
    coin: `<symbol id="ew-i-coin" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="32" r="24"/><path d="M24 20l8 12 8-12M32 32v14M24 34h16M24 40h16"/></g></symbol>`,
    map: `<symbol id="ew-i-map" viewBox="0 0 64 64"><g ${L}><path d="M32 56s16-16 16-28a16 16 0 0 0-32 0c0 12 16 28 16 28Z"/><circle cx="32" cy="28" r="6"/></g></symbol>`,
    build: `<symbol id="ew-i-build" viewBox="0 0 64 64"><g ${L}><path d="M8 56h48M14 56V30l18-14 18 14v26M26 56V40h12v16"/></g></symbol>`,
    chart: `<symbol id="ew-i-chart" viewBox="0 0 64 64"><g ${L}><path d="M8 56h48M14 48V36M26 48V28M38 48V20M50 48V12"/></g></symbol>`,
    person: `<symbol id="ew-i-person" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="18" r="9"/><path d="M14 56V44a18 18 0 0 1 36 0v12"/></g></symbol>`,
    bag: `<symbol id="ew-i-bag" viewBox="0 0 64 64"><g ${L}><rect x="8" y="20" width="48" height="34" rx="4"/><path d="M24 20v-6h16v6M8 34h48"/></g></symbol>`,
    star: `<symbol id="ew-i-star" viewBox="0 0 64 64"><path ${L} d="m32 8 7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2Z"/></symbol>`,
    check: `<symbol id="ew-i-check" viewBox="0 0 64 64"><g ${L}><circle cx="32" cy="32" r="24"/><path d="m21 33 8 8 15-17"/></g></symbol>`,
    org: `<symbol id="ew-i-org" viewBox="0 0 64 64"><g ${L}><rect x="24" y="6" width="16" height="12" rx="2"/><rect x="6" y="44" width="16" height="12" rx="2"/><rect x="24" y="44" width="16" height="12" rx="2"/><rect x="42" y="44" width="16" height="12" rx="2"/><path d="M32 18v14M14 44V32h36v12M32 32v12"/></g></symbol>`,
    mail: `<symbol id="ew-i-mail" viewBox="0 0 64 64"><g ${L}><rect x="8" y="16" width="48" height="32" rx="3"/><path d="m8 18 24 18 24-18"/></g></symbol>`,
    doc: `<symbol id="ew-i-doc" viewBox="0 0 64 64"><g ${L}><path d="M16 6h22l10 10v42H16Z"/><path d="M38 6v10h10M24 30h16M24 38h16M24 46h10"/></g></symbol>`,
    talk: `<symbol id="ew-i-talk" viewBox="0 0 64 64"><g ${L}><path d="M8 12h32v20H22l-8 7v-7H8Z"/><path d="M44 24h12v20h-6v7l-8-7H28v-6"/></g></symbol>`,
    hands: `<symbol id="ew-i-hands" viewBox="0 0 64 64"><g ${L}><path d="M4 30l12-12 10 4 6-4 6 4 10-4 12 12M16 18l16 22a4 4 0 0 0 6-1M26 30l10 12M32 26l10 12"/></g></symbol>`,
  };
  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  sprite.innerHTML = Object.values(ICONS).join("");
  document.body.append(sprite);

  const burger = document.querySelector(".ew-burger");
  burger?.addEventListener("click", () => {
    const open = burger.classList.toggle("is-open");
    document.body.classList.toggle("is-locked", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  // Interview row in the menu: measures the collapsed and expanded heights, and css moves between them with a height transition (.32s)
  const items = [...document.querySelectorAll(".js-accordion")];
  const measure = (item) => {
    const head = item.querySelector(".js-accordion-trigger");
    item.style.height = "auto";
    item.style.overflow = "visible";
    const full = item.clientHeight;
    item.style.removeProperty("height");
    item.style.removeProperty("overflow");
    item.style.setProperty("--open-height", `${full}px`);
    item.style.setProperty("--collapse-height", `${head.clientHeight}px`);
  };
  items.forEach((item) => {
    const head = item.querySelector(".js-accordion-trigger");
    if (!head) return;
    measure(item);
    head.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
    });
  });
  let wait = 0;
  addEventListener("resize", () => {
    clearTimeout(wait);
    wait = setTimeout(() => items.forEach(measure), 400);
  });
  document.fonts?.ready.then(() => items.forEach(measure));
})();
