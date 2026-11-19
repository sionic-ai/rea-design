// Shared across the whole site — draws the header bar, phone menu, bottom nav, orange search strip, banner, region search and footer, and hooks up the job-card owl carousel and touch response.
// Original numbers: owl(margin 40 · loop · autoplay 5000ms · autoplaySpeed 900 · slideBy 2 · autoWidth · below 950 items 1 center margin 20)
//            Phone menu body.is-sb-active · .2s ease-in-out · ‹View all› expands the hidden suggested terms
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const page = body.dataset.page || "home";

  // Icons — replace the original FontAwesome spots with simple shapes of the same size
  const I = {
    search: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M6.8 1a5.8 5.8 0 0 1 4.6 9.3l3.6 3.6-1.1 1.1-3.6-3.6A5.8 5.8 0 1 1 6.8 1Zm0 1.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z"/></svg>',
    heart: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14.5S1 10.3 1 5.6A3.6 3.6 0 0 1 8 4a3.6 3.6 0 0 1 7 1.6c0 4.7-7 8.9-7 8.9Z"/></svg>',
    user: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="4.5" r="3.5"/><path d="M1.5 15c.4-4 3.2-6 6.5-6s6.1 2 6.5 6Z"/></svg>',
    phone: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 1 6 3.4 4.7 5.6a9 9 0 0 0 5.7 5.7l2.2-1.3L15 12.4l-1.6 2.4C7.1 15.3.7 8.9 1.2 2.6Z"/></svg>',
    mail: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 3h14v10H1Zm1.6 1.6v.3L8 8.6l5.4-3.7v-.3Zm10.8 2.2L8 10.5 2.6 6.8v4.6h10.8Z" fill-rule="evenodd"/></svg>',
    pin: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0a5.6 5.6 0 0 1 5.6 5.6C13.6 9.8 8 16 8 16S2.4 9.8 2.4 5.6A5.6 5.6 0 0 1 8 0Zm0 3.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Z" fill-rule="evenodd"/></svg>',
    work: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h10v14H3Zm1.4 1.4v11.2h7.2V3.4ZM6 0h4v3H6Zm.2 9.4 1.2 1.2 2.6-3 1 .8-3.5 4.1-2.3-2.2Z" fill-rule="evenodd"/></svg>',
    case: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 1h12v15H2Zm1.4 1.4v12.2h9.2V2.4ZM5 5h6v1.2H5Zm0 3h6v1.2H5Zm0 3h4v1.2H5Z" fill-rule="evenodd"/></svg>',
    staff: '<svg class="rg-ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1a3.4 3.4 0 1 1 0 6.8A3.4 3.4 0 0 1 8 1Zm0 1.3a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM1.4 15c.5-3.8 3.3-5.8 6.6-5.8s6.1 2 6.6 5.8Zm1.6-1.3h10C12.3 11.6 10.4 10.5 8 10.5s-4.3 1.1-5 3.2Z" fill-rule="evenodd"/></svg>',
    flow: '<svg viewBox="0 0 30 30" aria-hidden="true"><rect x="6" y="3" width="18" height="24" rx="2"/><path d="M11 3V1h8v2M10 11h10M10 16h10M10 21h6"/></svg>',
    faq: '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M3 5h24v15H12l-6 5v-5H3Z"/><path d="M11 12h8"/></svg>',
  };
  const navText = ['<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25"/><path d="M28 17 20 25l8 8"/></svg>', '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25"/><path d="M22 17l8 8-8 8"/></svg>'];

  // Logo — redrawn anew with a placeholder wordmark and a smiling curve in place of the original Brand wordmark
  const logo = (cls = "") => `<a class="rg-logo ${cls}" href="index.html" data-label="Brand logo · Small tagline above + two-color wordmark + smile curve"><svg viewBox="0 0 220 76" role="img" aria-label="Brand Logo">
      <text class="rg-logo__tag" x="0" y="12">Your one-line service tagline here</text>
      <text class="rg-logo__word" x="0" y="58"><tspan>Brand</tspan><tspan class="is-accent">Label</tspan></text>
      <path class="rg-logo__swoosh" d="M4 64c18 10 40 10 58-2"/>
    </svg></a>`;
  // The footer logo is a 457px panel with the tagline on one line to the right of the wordmark, as in the original
  const footLogo = `<a class="rg-logo" href="index.html" data-label="Brand logo · wordmark + one-line tagline on the right"><svg viewBox="0 0 457 76" role="img" aria-label="Brand Logo">
      <text class="rg-logo__word" x="0" y="52"><tspan>Brand</tspan><tspan class="is-accent">Label</tspan></text>
      <path class="rg-logo__swoosh" d="M4 58c18 10 40 10 58-2"/>
      <text class="rg-logo__tag" x="172" y="44">Your one-line service tagline here</text>
    </svg></a>`;

  const menu =[["about.html", "The brand’s strengths"], ["about.html#flow", "Path to employment"], ["about.html#faq", "Frequently asked questions"], ["index.html#voice", "Voice of the registrant"], ["about.html", "To Company Representatives"]];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("l-header");
    head.innerHTML = `<div class="l-header__inner"><div class="l-header__content">
        ${logo()}
        <nav class="l-header__nav" aria-label="Main menu"><ul>
          ${menu.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}
          <li class="is-button"><a class="is-button is-accent" href="recruit.html">${I.search}Find jobs</a></li>
          <li class="is-button"><a class="is-button is-pink" href="news.html">${I.heart}Favorites</a></li>
          <li class="is-button"><a class="is-button is-primary" href="about.html">${I.user}Free registration</a></li>
        </ul></nav>
      </div></div>`;
    head.insertAdjacentHTML("beforebegin", `
      <button class="rg-sb-btn" type="button" aria-label="Menu"><span class="rg-sb-btn__line"><span></span><span></span><span></span></span><span class="rg-sb-btn__text is-open">MENU</span><span class="rg-sb-btn__text is-close">CLOSE</span></button>
      <div class="rg-sb-menu" data-slot="sp-menu"><ul>${menu.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
        <div class="rg-sb-menu__btns"><div class="rg-sb-menu__btn is-accent"><a href="recruit.html">${I.search}Find jobs</a></div><div class="rg-sb-menu__btn is-pink"><a href="news.html">${I.heart}Favorites</a></div></div>
        <div class="rg-sb-menu__btn is-long"><a href="about.html">${I.user}Free registration</a></div></div>
      <div class="rg-sb-veil"></div>`);
    const toggle = () => body.classList.toggle("is-sb-active");
    document.querySelector(".rg-sb-btn").addEventListener("click", toggle);
    document.querySelector(".rg-sb-veil").addEventListener("click", toggle);
  }

  const chips = ["Full commuting allowance paid", "Ready to start", "Long-term Welcome", "Blank OK", "Bike commuting OK", "4+ days a week", "Car and motorbike commuting OK", "Closed Sat, Sun and holidays", "Your recommendation 9 here", "Your suggested term 10 here", "Your suggested term 11 here"];
  document.querySelectorAll('[data-slot="search-band"]').forEach((el) => {
    el.classList.add("rg-search");
    const titled = el.hasAttribute("data-titled");
    el.innerHTML = `
      <div class="rg-search__accent" data-label="Decorative script English">Search</div>
      <div class="l-container">
        ${titled ? `<div class="rg-search__title">${I.search}Find jobs</div>` : ""}
        <form class="rg-search__form" action="recruit.html" onsubmit="return false">
          <div class="rg-search__content">
            <div class="rg-search__blocks is-wrap">
              ${[["pin", "Work location"], ["work", "Occupation"], ["case", "Facility Type"], ["staff", "Employment Type"]].map(([ic, t]) => `<div class="rg-search__box">${I[ic]}<div class="rg-select"><select aria-label="${t}"><option>${t}</option><option>Choice 1</option><option>Choice 2</option></select></div></div>`).join("")}
            </div>
            <div class="rg-search__blocks">
              <div class="rg-search__word"><svg viewBox="0 0 40 36" aria-hidden="true"><path d="M2 2h36v24H22l-6 8v-8H2Z" fill="none" stroke="currentColor" stroke-width="2.4" style="color:var(--kf-surface)"/><circle cx="14" cy="12" r="1.6" style="fill:var(--kf-surface)"/><circle cx="26" cy="12" r="1.6" style="fill:var(--kf-surface)"/><path d="M14 17c3 3 9 3 12 0" fill="none" stroke-width="2" style="stroke:var(--kf-surface)"/></svg><span>Recommended Word</span></div>
              <div class="rg-search__checks">
                ${chips.map((c, i) => `<div class="rg-search__check${i > 7 ? " is-hidden" : ""}"><label><input type="checkbox"><span>${c}</span></label></div>`).join("")}
                <button class="rg-search__all" type="button">⊕ View all</button><button class="rg-search__all is-close is-hidden" type="button">⊖ Close</button>
              </div>
            </div>
          </div>
          <div class="rg-search__buttons">
            <div class="rg-search__count">Matching count<span>0,000</span>Item</div>
            <button type="submit">${I.search} Search with these conditions</button>
          </div>
        </form>
      </div>`;
    const open = el.querySelector(".rg-search__all:not(.is-close)"), close = el.querySelector(".rg-search__all.is-close");
    const show = (on) => { el.querySelectorAll(".rg-search__check").forEach((c, i) => i > 7 && c.classList.toggle("is-hidden", !on)); open.classList.toggle("is-hidden", on); close.classList.toggle("is-hidden", !on); };
    open.addEventListener("click", () => show(true));
    close.addEventListener("click", () => show(false));
  });

  document.querySelectorAll('[data-slot="banners"]').forEach((el) => {
    el.classList.add("rg-banners");
    el.innerHTML = `<div class="rg-banners__container">
        <div class="rg-banners__block is-lg"><a class="rg-banners__item is-lg" href="about.html">
          <div class="rg-banners__inner">
            <div class="rg-banners__accent" data-label="Decorative script English">Contact</div>
            <div class="rg-banners__pop is-01">${scene("pop1", 250, 300)}</div><div class="rg-banners__pop is-02">${scene("pop2", 250, 300)}</div>
            <span class="rg-banners__lead">Quick, just 1 min!</span>
            <p class="rg-banners__sub">From registration to starting work in as little as two days!</p>
            <p class="rg-banners__big">Get introduced to work!</p>
            <p class="rg-banners__sub">Your two-line notice goes here.<br>A professional coordinator will handle your consultation.</p>
            <span class="rg-banners__free">Free</span>
          </div></a></div>
        <div class="rg-banners__block">
          <a class="rg-banners__item is-sm" href="about.html#flow"><div class="rg-banners__title">${I.flow}<span>Path to employment</span></div></a>
          <a class="rg-banners__item is-sm" href="about.html#faq"><div class="rg-banners__title">${I.faq}<span>Frequently asked questions</span></div></a>
        </div>
      </div>`;
  });

  document.querySelectorAll('[data-slot="area-search"]').forEach((el) => {
    el.classList.add("rg-area", "rg-cream", "is-full");
    const links = (n, w) => Array.from({ length: n }, (_, i) => `<a class="rg-area__link" href="recruit.html">${w} ${i + 1}</a>`).join("");
    el.innerHTML = `<div class="rg-area__lg" data-label="Decorative script English">Area and Conditions</div>
      <div class="l-container">
        <h2 class="rg-heading"><span>Find jobs by area and conditions</span></h2>
        <div class="rg-area__container">
          <div class="rg-area__block">
            <div class="rg-area__items"><div class="rg-area__items-title">Find by workplace</div><div class="rg-area__list">${links(4, "Area")}</div></div>
            <div class="rg-area__items"><div class="rg-area__items-title">Find by job type</div><div class="rg-area__list">${links(5, "Occupation")}</div></div>
            <div class="rg-area__items"><div class="rg-area__items-title">Search by employment type</div><div class="rg-area__list">${links(3, "Form")}</div></div>
          </div>
          <div class="rg-area__block">
            <div class="rg-area__items"><div class="rg-area__items-title">Find by Facility Type</div><div class="rg-area__list">${links(16, "Facility")}</div></div>
            <div class="rg-area__items"><div class="rg-area__items-title">Search by criteria</div><div class="rg-area__list">${links(34, "Condition")}</div></div>
          </div>
        </div>
      </div>`;
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("rg-foot");
    const col = (arr) => `<ul class="rg-foot__list">${arr.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>`;
    foot.innerHTML = `<div class="l-container">
        <div class="rg-foot__header"><div class="rg-foot__logo">${footLogo}</div></div>
        <div class="rg-foot__middle">
          <div class="rg-foot__menu"><div class="rg-foot__block">
            ${col([["about.html", "The brand’s strengths"], ["recruit.html", "Find jobs"], ["about.html#flow", "Path to employment"]])}
            ${col([["about.html#faq", "Frequently asked questions"], ["index.html#voice", "Voice of the registrant"], ["about.html", "Free registration"]])}
            ${col([["news.html", "Saved job listings"], ["about.html", "To Company Representatives"], ["about.html", "Company overview"]])}
            ${col([["about.html", "Registration Hub"], ["news.html", "Notice"], ["news.html", "Staff blog"]])}
          </div></div>
          <div class="rg-foot__company">
            <a class="rg-foot__tel" href="about.html">${I.phone}000-000-0000</a>
            <p class="rg-foot__hour">［Phone］Weekdays 9:00～18:00 ［Email］Accepted 24 hours</p>
            <p class="rg-foot__inquiry"><a href="about.html">${I.mail}Contact Us</a></p>
          </div>
        </div>
      </div>
      <div class="rg-foot__bottom"><div class="l-container"><div class="rg-foot__content"><a class="rg-foot__privacy" href="about.html">Privacy policy</a><small class="rg-foot__copy u-num" data-label="Copyright English single line">© 2026 company inc.</small></div></div></div>`;
    foot.insertAdjacentHTML("afterend", `<div class="rg-float" data-slot="floating-nav"><div class="rg-float__in"><a class="is-accent" href="recruit.html">${I.search}Find jobs</a><a class="is-pink" href="news.html">${I.heart}Favorites</a><a href="about.html">${I.user}Free registration</a></div></div>`);
  }

  // Job card carousel — the same owl.carousel 2.3.4 and the same settings as the original
  // The original has 10 cards (10 dots) · 5 cards at the same workplace (5 dots) — autoWidth gives one dot per card — to match the dot count, the written cards are repeated to fill up to the data-fill count
  document.querySelectorAll(".js-recruit-slider[data-fill]").forEach((list) => {
    const cards = [...list.children], want = +list.dataset.fill || cards.length;
    for (let i = cards.length; i < want; i++) list.append(cards[i % cards.length].cloneNode(true));
  });
  const slider = window.jQuery && jQuery(".js-recruit-slider");
  if (slider && slider.length && jQuery.fn.owlCarousel) {
    slider.addClass("owl-carousel").owlCarousel({
      margin: 40, dots: true, loop: true, nav: true, autoplayHoverPause: true, autoplay: !reduce, autoplaySpeed: 900,
      autoWidth: true, autoHeight: false, center: false, slideBy: 2, navText,
      responsive: { 0: { items: 1, margin: 20, autoWidth: true, center: true }, 950: { items: 2 } },
    });
    if (innerWidth >= 750) slider.find(".owl-dots button span").each((i, s) => { s.textContent = String(i + 1); });
  }

  // ───── Line drawing — the original illustration spots are redrawn as thick brown line figures in the same place and size ─────
  function person(x, y, s, o = {}) {
    const k = (v) => (v * s).toFixed(1), at = (dx, dy) => `${(x + dx * s).toFixed(1)} ${(y + dy * s).toFixed(1)}`;
    const top = o.top || "a", pants = o.pants || "p", hair = o.hair || "h";
    let g = "";
    if (!o.sit) g += `<path class="ln f-${pants}" d="M${at(-14, 70)}L${at(-16, 128)}h${k(13)}l${k(4)}-${k(44)}l${k(4)} ${k(44)}h${k(13)}L${at(14, 70)}Z"/><path class="ln f-w" d="M${at(-20, 128)}h${k(18)}v${k(6)}h-${k(18)}ZM${at(3, 128)}h${k(18)}v${k(6)}h-${k(18)}Z"/>`;
    g += `<path class="ln f-${top}" d="M${at(-20, 30)}q${k(20)}-${k(8)} ${k(40)} 0l${k(4)} ${k(42)}h-${k(48)}Z"/>`;
    if (o.apron) g += `<path class="ln f-y" d="M${at(-13, 40)}h${k(26)}l${k(3)} ${k(44)}h-${k(32)}Z"/>`;
    const armL = o.raise ? `M${at(-19, 34)}L${at(-30, 10)}` : `M${at(-19, 34)}L${at(-26, 66)}`;
    const armR = o.reach ? `M${at(19, 34)}L${at(44, 48)}` : `M${at(19, 34)}L${at(26, 66)}`;
    g += `<path class="ln" d="${armL}M${armR.slice(1)}"/>`;
    g += `<circle class="ln f-w" cx="${at(0, 14).split(" ")[0]}" cy="${at(0, 14).split(" ")[1]}" r="${k(15)}"/>`;
    if (!o.bald) g += `<path class="ln f-${hair}" d="M${at(-15, 12)}q${k(2)}-${k(17)} ${k(16)}-${k(16)}q${k(15)} ${k(1)} ${k(14)} ${k(16)}q-${k(10)}-${k(8)}-${k(30)} 0Z"/>`;
    if (o.bun) g += `<circle class="ln f-${hair}" cx="${at(14, 0).split(" ")[0]}" cy="${at(14, 0).split(" ")[1]}" r="${k(6)}"/>`;
    g += `<circle class="f-k" cx="${at(-5, 15).split(" ")[0]}" cy="${at(-5, 15).split(" ")[1]}" r="${k(1.6)}"/><circle class="f-k" cx="${at(5, 15).split(" ")[0]}" cy="${at(5, 15).split(" ")[1]}" r="${k(1.6)}"/><path class="ln" d="M${at(-4, 21)}q${k(4)} ${k(4)} ${k(8)} 0"/>`;
    if (o.glasses) g += `<path class="ln" d="M${at(-9, 15)}h${k(7)}M${at(2, 15)}h${k(7)}"/>`;
    return g;
  }
  const chair = (x, y, s) => `<circle class="ln f-n" cx="${x}" cy="${y + 70 * s}" r="${42 * s}"/><circle class="ln f-w" cx="${x}" cy="${y + 70 * s}" r="${8 * s}"/><path class="ln" d="M${x - 30 * s} ${y}h${60 * s}M${x + 30 * s} ${y}v${-50 * s}M${x - 30 * s} ${y + 10 * s}l${-10 * s} ${50 * s}"/>`;
  const bed = (x, y, w, h) => `<path class="ln f-g" d="M${x} ${y + h * 0.35}l${w * 0.75} ${-h * 0.3}l${w * 0.25} ${h * 0.2}v${h * 0.5}l${-w * 0.75} ${h * 0.3}l${-w * 0.25} ${-h * 0.2}Z"/><path class="ln f-w" d="M${x + 6} ${y + h * 0.32}l${w * 0.72} ${-h * 0.28}l${w * 0.2} ${h * 0.16}l${-w * 0.72} ${h * 0.3}Z"/>`;
  function scene(kind, w, h) {
    let g = "";
    if (kind === "heroL") g = person(70, 40, 1.35, { apron: true, raise: true, top: "w", glasses: true }) + person(150, 50, 1.2, { top: "w", hair: "o" }) + chair(255, 180, 1.1) + person(255, 120, 1.15, { sit: true, top: "o", bald: true, glasses: true });
    else if (kind === "heroR") g = bed(40, 140, 340, 230) + person(250, 150, 1, { top: "o", sit: true, bald: true }) + person(170, 30, 1.25, { apron: true, reach: true, bun: true, top: "w" });
    else if (kind === "pop1") g = person(125, 30, 1.9, { top: "o", apron: true, bun: true });
    else if (kind === "pop2") g = person(125, 30, 1.9, { top: "w", raise: true });
    else if (kind === "voice") g = `<rect class="f-c" x="${w * 0.12}" y="${h * 0.25}" width="${w * 0.76}" height="${h * 0.75}" rx="20"/>` + person(w / 2, 20, 1.45, { top: "o", bun: true });
    else if (kind.startsWith("round")) {
      const n = +kind.slice(5);
      g = `<circle class="f-c" cx="${w / 2}" cy="${h / 2}" r="${w / 2}"/>` + [
        person(w * 0.36, 40, 1.2, { top: "w", glasses: true }) + `<path class="ln f-w" d="M${w * 0.55} 110h70v-60h-70Z"/>`,
        person(w * 0.62, 50, 1.15, { top: "o", raise: true }) + `<path class="ln f-y" d="M40 120l25-22 25 22v40H40Z"/><circle class="ln f-w" cx="${w * 0.4}" cy="60" r="20"/>`,
        `<path class="ln f-w" d="M60 90l60-20 10 10-60 22Z"/><path class="ln f-o" d="M150 120h40v60h-40Z"/><path class="ln f-y" d="M80 150l40-40 12 12-40 40Z"/>`,
        person(w * 0.36, 50, 1.1, { top: "y", hair: "o" }) + person(w * 0.66, 40, 1.2, { top: "w", glasses: true }),
      ][(n - 1) % 4];
    } else if (kind === "read") g = person(w * 0.5, 20, 1.5, { top: "w", glasses: true, reach: true }) + `<path class="ln f-w" d="M10 60l50-14 10 40-50 14Z"/>`;
    else if (kind.startsWith("block")) {
      const n = +kind.slice(5);
      g = `<rect class="f-c" width="${w}" height="${h}" rx="20"/>` + [
        person(w * 0.35, 90, 1.5, { top: "o", bun: true }) + `<path class="ln f-y" d="M${w * 0.55} 60h90v200h-90Z"/>` + person(w * 0.68, 170, 1.1, { top: "w", glasses: true, sit: true }),
        person(w * 0.5, 80, 1.5, { top: "o", hair: "o" }) + person(w * 0.75, 80, 1.5, { top: "w", raise: true, bald: true }) + `<path class="ln f-y" d="M60 130l30-26 30 26v44H60Z"/>`,
        `<path class="ln f-w" d="M${w * 0.42} 110l90-30 14 14-90 32Z"/><path class="ln f-o" d="M${w * 0.62} 190h70v90h-70Z"/><path class="ln f-y" d="M${w * 0.28} 230l60-60 16 16-60 60Z"/>`,
        person(w * 0.4, 70, 1.6, { top: "y", hair: "o" }) + person(w * 0.66, 60, 1.6, { top: "w", glasses: true, reach: true }),
      ][(n - 1) % 4];
    }
    return `<svg class="rg-art" viewBox="0 0 ${w} ${h}" aria-hidden="true">${g}</svg>`;
  }
  window.RG = { scene };
  document.querySelectorAll("[data-art]").forEach((el) => {
    const [kind, w, h] = el.dataset.art.split(" ");
    el.insertAdjacentHTML("beforeend", scene(kind, +w, +h));
  });
  const artCss = `.rg-art{display:block;width:100%;height:auto;overflow:visible}.rg-art .ln{stroke:var(--kf-ink);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;fill:none}
    .rg-art .f-w{fill:var(--kf-surface)}.rg-art .f-o{fill:var(--kf-accent)}.rg-art .f-y{fill:color-mix(in oklab,var(--kf-warning) 35%,var(--kf-raised))}.rg-art .f-p{fill:color-mix(in oklab,var(--kf-line) 60%,var(--kf-surface))}
    .rg-art .f-h{fill:var(--kf-ink)}.rg-art .f-k{fill:var(--kf-ink)}.rg-art .f-n{fill:none}.rg-art .f-g{fill:color-mix(in oklab,var(--kf-line) 80%,var(--kf-ink))}.rg-art .f-c{fill:var(--kf-raised)}
    .rg-art .f-a{fill:var(--kf-accent)}`;
  document.head.insertAdjacentHTML("beforeend", `<style>${artCss}</style>`);
})();
