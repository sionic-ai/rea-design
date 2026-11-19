// Shared by all pages — header (logo, round menu, expanding menu), mouse eyeballs, footer, turn on after load, turn on when visible, hand-drawn insects
const BT = (() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PC = innerWidth > 767;
  const page = document.body.dataset.page || "home";

  // Hand-drawn bug — stands in for the original paper-cut bug art. Body · head · horn · legs · dots as shapes (change color with --bug · --bug2)
  const bug = (horn = "beetle") => {
    const horns = {
      beetle: '<path class="b-head" d="M50 4c4 8 4 16 0 22-4-6-4-14 0-22zM44 10c-6 2-8 8-6 14M56 10c6 2 8 8 6 14"/>',
      stag: '<path class="b-head" d="M40 22C30 14 30 4 38 0c-2 8 2 14 8 18zM60 22c10-8 10-18 2-22 2 8-2 14-8 18z"/>',
      round: "",
    };
    return `<svg class="bt-bug" viewBox="0 0 100 120" aria-hidden="true">
      <path class="b-leg" d="M28 58 10 48 4 34M26 74 8 78 2 92M30 92 16 108 14 118M72 58l18-10 6-14M74 74l18 4 6 14M70 92l14 16 2 10"/>
      ${horns[horn] || ""}<ellipse class="b-head" cx="50" cy="32" rx="17" ry="13"/>
      <ellipse class="b-body" cx="50" cy="76" rx="29" ry="38"/><path class="b-leg" d="M50 42v72"/>
      <circle class="b-dot" cx="38" cy="66" r="5"/><circle class="b-dot" cx="62" cy="86" r="4"/><circle class="b-dot" cx="60" cy="62" r="3"/>
      <circle class="b-dot b-eyew" cx="43" cy="30" r="5"/><circle class="b-dot b-eyew" cx="57" cy="30" r="5"/><circle class="b-eye" cx="44" cy="31" r="2.4"/><circle class="b-eye" cx="58" cy="31" r="2.4"/></svg>`;
  };
  const logoName = (txt) => [...txt].map((c) => `<span>${c}</span>`).join("");
  const LINKS = [
    ["index.html", "TOP", "First Page"], ["facility.html", "Facility", "About the Facility"], ["price.html", "Open & Price", "Hours·Fees"],
    ["news.html", "News", "Latest news"], ["#", "Zukan", "Insect Guide"], ["#", "Access", "Directions"],
  ];

  // ---------- Embedding ----------
  const header = document.querySelector(".bt-header");
  header.innerHTML = `<a class="bt-logo" href="index.html" aria-label="First Page"><span class="bt-logo__sub">Your one-line slogan here!</span><span class="bt-logo__name" data-label="Brand name logo (each letter a different color)">${logoName("Brand·Name")}</span></a>
    <button class="bt-menu" type="button" aria-label="Open Menu" aria-expanded="false"><span class="bt-menu__in"><span class="bt-menu__img"><span class="is-shown" style="--bug: var(--site-green); --bug2: var(--kf-accent)">${bug("beetle")}</span><span style="--bug: var(--site-red); --bug2: var(--kf-ink)">${bug("stag")}</span><span style="--bug: var(--site-sky); --bug2: var(--site-pink)">${bug("round")}</span></span></span><span class="bt-menu__txt bt-hand"><span>MENU</span></span><span class="bt-menu__btn"><span class="bt-menu__line"></span><span class="bt-menu__line"></span><span class="bt-menu__line"></span></span></button>
    <div class="bt-lang" aria-label="Language"><button type="button" class="is-current">Korean</button><button type="button">English</button><button type="button">中文</button></div>
    <nav class="bt-nav" aria-label="Site Menu"><div class="bt-nav__bg" aria-hidden="true"><i></i><i></i></div><div class="bt-nav__in"><ul class="bt-nav__list">${LINKS.map(([h, en, ko]) => `<li><a href="${h}">${ko}<small>${en}</small></a></li>`).join("")}</ul>
      <div class="bt-nav__bnrs"><a href="#"><div class="wf-img bt-photo" data-label="Insect field guide banner · bold lettering art · landscape 8:3"></div></a><a href="#"><div class="wf-img bt-photo" data-label="Insect diagnosis banner · pink serrated circle · landscape 8:3"></div></a><a href="#"><div class="wf-img bt-photo" data-label="Honorary director portrait banner · Landscape 8:3"></div></a></div></div></nav>`;
  const menu = header.querySelector(".bt-menu");
  // Each time you hover the menu, one of three insect images is shown at random (original menuRndom — -1~2, -1 is the last)
  const imgs = [...menu.querySelectorAll(".bt-menu__img > span")];
  menu.addEventListener("mouseenter", () => {
    const n = Math.floor(Math.random() * 4) - 1;
    imgs.forEach((s, i) => { const on = i === (n + imgs.length) % imgs.length; s.style.display = on ? "block" : "none"; s.classList.toggle("is-shown", on); });
  });
  let scrollY0 = 0;
  const setOpen = (v) => {
    header.classList.toggle("is-open", v);
    header.querySelector(".bt-nav").classList.toggle("is-active", v);
    menu.querySelector(".bt-menu__txt span").textContent = v ? "CLOSE" : "MENU";
    menu.setAttribute("aria-expanded", v);
    menu.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
    if (v) { scrollY0 = scrollY; document.body.style.overflow = "hidden"; } else document.body.style.overflow = "";
  };
  menu.addEventListener("click", () => setOpen(!header.classList.contains("is-open")));
  addEventListener("keyup", (e) => e.key === "Escape" && setOpen(false));

  const footer = document.querySelector(".bt-footer");
  footer.innerHTML = `<div class="bt-footer__main">
      <a class="bt-footer__logo" href="index.html" aria-label="First Page"><span class="bt-logo__sub">Your one-line slogan here!</span><span class="bt-logo__name">${logoName("Brand·Name")}</span></a>
      <dl class="bt-footer__dl">
        <div class="bt-footer__row"><dt>Operating hours</dt><dd>00:00〜00:00 (last admission 00:00)</dd></div>
        <div class="bt-footer__row"><dt>Day off</dt><dd>Always open during the open period (Month 0 to Month 00).</dd></div>
        <div class="bt-footer__row"><dt>Address</dt><dd>Postal code 000-0000 Your address here (within the park name)</dd></div>
        <div class="bt-footer__row"><dt>Inquiry</dt><dd>TEL : 0000-00-0000 (Park Office)<br>(Open hours : 00:00〜00:00)</dd></div>
      </dl>
      <div class="bt-footer__btns"><a href="price.html">View hours · pricing</a><a href="#">View directions</a></div>
      <div class="bt-footer__btm"><a href="#">Operating group site</a><a href="#">Operating group careers site</a></div>
      <p class="bt-footer__copy bt-hand">© Beetle Land NAME. All rights reserved.</p>
    </div>
    <div class="bt-footer__map"><div class="wf-img bt-photo" data-label="Map slot · facility location pin · tall vertical panel"></div></div>`;

  // It is a picture chasing the cursor, so it isn’t stopped under reduced motion (the original doesn’t look at this setting)
  if (!reduce) {
    const stalker = document.createElement("div");
    stalker.className = "bt-stalker";
    stalker.setAttribute("aria-hidden", "true");
    stalker.setAttribute("data-fx", "eye-stalker");
    // On in-page shortcuts·breadcrumbs the original eyeballs don’t react (confirmed by measuring)
    stalker.setAttribute("data-fx-eye-stalker", "hide: .bt-footer, .bt-nav, .bt-menu; skip: .bt-anchors a, .bt-crumb a");
    stalker.classList.add("js-load");
    stalker.innerHTML = `<div data-fx-part="mark" style="--bug: var(--site-sky)">${bug("beetle")}</div><div data-fx-part="eyes"><span data-fx-part="eye"></span><span data-fx-part="eye"></span></div>`;
    document.body.append(stalker);
  }

  document.querySelectorAll("[data-bug]").forEach((el) => { el.innerHTML = bug(el.dataset.bug); });

  // ---------- Turn on the hero 700ms after load (original js-load--on) ----------
  const load = () => setTimeout(() => document.querySelectorAll(".js-load").forEach((el) => el.classList.add("is-on")), reduce ? 0 : 700);
  if (document.readyState === "complete") load(); else addEventListener("load", load, { once: true });

  // ---------- Turn on once when visible — PC 70% of screen · phone 80% (original scr-anin·fadein) ----------
  const start = PC ? "top 70%" : "top 80%";
  ScrollTrigger.batch(".scr-anin, .bt-fade, .bt-fade-up", { start, onEnter: (b) => b.forEach((el) => el.classList.add("is-on")) });
  addEventListener("load", () => ScrollTrigger.refresh());
  return { reduce, PC, bug };
})();
