// All pages use the same house-shaped frame, header row, right-side contact tab, menu drawer and privacy window — the markup is planted in one place.
(() => {
  const page = document.body.dataset.page || "";
  const items = [
    ["about.html", "About the Workshop"], ["service.html", "Adjustment · Repair"], ["service.html", "Made to order"], ["service.html", "Sales"],
    ["service.html#trip", "On-site service"], ["index.html#access", "Directions"], ["notfound.html", "Latest news"],
  ];
  const sns = document.querySelector(".aa-sns")?.outerHTML || "";
  const html = `
<div class="aa-frame" aria-hidden="true">
  <svg class="aa-frame__roof" viewBox="0 0 2400 253" preserveAspectRatio="none"><path d="M0 0H2400V253L1533 74 0 253z"/></svg>
  <i class="aa-frame__side aa-frame__side--l"></i><i class="aa-frame__side aa-frame__side--r"></i><i class="aa-frame__base"></i>
</div>
<header class="aa-head" data-slot="header">
  <a class="aa-logo" href="index.html" data-label="Studio logo — brush-script English wordmark, with two small lines below (kana name · English name)">
    <span class="aa-logo__mark" lang="en">STUDIO</span><span class="aa-logo__sub">Atelier name</span><span class="aa-logo__en" lang="en">Atelier Name</span>
  </a>
  <button class="aa-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button>
</header>
<nav class="aa-tabs" data-slot="side-tabs" aria-label="Inquiry">
  <a class="aa-tab" href="about.html#contact"><svg viewBox="0 0 43 25" aria-hidden="true"><rect width="43" height="25" rx="2"/><path d="M1 2l20.5 13L42 2"/></svg><span>Contact Us</span></a>
  <a class="aa-tab aa-tab--cal" href="about.html#contact"><svg viewBox="0 0 43 33" aria-hidden="true"><rect y="3" width="43" height="30" rx="2"/><path d="M10 0v7M33 0v7M7 15h7M18 15h7M29 15h7M7 23h7M18 23h7M29 23h7"/></svg><span>Reservation</span></a>
</nav>
<div class="aa-menu" data-slot="menu-drawer" aria-hidden="true">
  <div class="aa-menu__veil" data-aa-close></div>
  <div class="aa-menu__panel" role="dialog" aria-label="Menu">
    <button class="aa-menu__close" type="button" aria-label="Close Menu" data-aa-close><i></i><i></i></button>
    <div class="aa-menu__inner">
    <p class="aa-eyebrow aa-menu__label" lang="en">MENU</p>
    <ul class="aa-menu__list">${items.map(([href, t]) => `<li><a href="${href}"${href.split("#")[0] === page + ".html" ? ' aria-current="page"' : ""}><span>${t}</span><i class="aa-menu__dot"><i class="aa-arrow aa-arrow--tiny"></i></i></a></li>`).join("")}</ul>
    <a class="aa-btn aa-btn--slim aa-menu__cta" href="#contact"><span>Book · Inquire</span></a>
    ${sns.replace("aa-sns", "aa-sns aa-sns--ink")}
    </div>
  </div>
</div>
<div class="aa-privacy" aria-hidden="true">
  <div class="aa-privacy__veil" data-aa-close></div>
  <div class="aa-privacy__card" role="dialog" aria-label="Privacy policy">
    <button class="aa-privacy__x" type="button" aria-label="Close" data-aa-close>×</button>
    <p>Your three-or-four-line privacy policy preamble here. Briefly note what is collected and where it is used.</p>
    ${[1, 2, 3, 4].map((n) => `<h3>${n}. Your clause title here</h3><p>Your two-line clause text here. Your two-line clause text here.</p>`).join("")}
  </div>
</div>`;
  document.body.insertAdjacentHTML("afterbegin", html);

  const root = document.documentElement;
  const menu = document.querySelector(".aa-menu");
  const burger = document.querySelector(".aa-burger");
  const privacy = document.querySelector(".aa-privacy");
  const open = (el, on) => {
    el.classList.toggle("is-open", on);
    el.setAttribute("aria-hidden", on ? "false" : "true");
    root.classList.toggle("aa-locked", !!document.querySelector(".aa-menu.is-open, .aa-privacy.is-open"));
  };
  burger.addEventListener("click", () => { open(menu, true); burger.setAttribute("aria-expanded", "true"); });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("[data-aa-close]") || e.target.closest(".aa-menu__list a, .aa-menu__cta")) { open(menu, false); burger.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-aa-privacy]")) open(privacy, true); });
  privacy.addEventListener("click", (e) => { if (e.target.closest("[data-aa-close]")) open(privacy, false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { open(menu, false); open(privacy, false); } });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$/.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => { location.href = url.href; }, 250);
  });
  addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
})();
