// Header, Lenis and color reading shared by all four sheets. What differs per edition (Winter, Autumn, Spring, Overview) is chosen by body[data-edition].
(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const edition = body.dataset.edition || "winter";

  const brand = [
    { key: "fall", file: "article.html", name: "Fall '26", sub: "Issue 01" },
    { key: "spring", file: "article-dark.html", name: "Spring '26", sub: "Issue 02" },
    { key: "winter", file: "index.html", name: "Winter '26", sub: "Issue 03" },
    { key: "summer", file: "news.html", name: "Summer '25", sub: "Issue 04" },
  ];
  const now = brand.find((e) => e.key === edition);
  const icon = {
    bag: '<svg viewBox="0 0 16 18" fill="currentColor" aria-hidden="true"><path d="M3 5h10l1.2 12H1.8L3 5Zm2.2 0a2.8 2.8 0 0 1 5.6 0h-1.4a1.4 1.4 0 0 0-2.8 0H5.2Z"/></svg>',
    down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="4.2"/><path d="m10.2 10.2 3.3 3.3"/></svg>',
    out: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4"/></svg>',
  };
  window.ED_ICON = icon;
  const mask = (svg) => `<span class="ed-ico" aria-hidden="true" style="--m:url('data:image/svg+xml;utf8,${encodeURIComponent(svg.replace('stroke="currentColor"', 'stroke="black"'))}')"></span>`;

  // ───────── Head ─────────
  const head = document.querySelector("[data-slot='header']");
  if (head) {
    const list = edition === "shelf" ? "" : `
      <li class="ed-in" style="--i:1"><div class="ed-drop" data-drop>
        <button class="ed-btn ed-drop__btn" type="button" aria-expanded="false" aria-controls="ed-drop-list">Choose Edition${mask(icon.down)}</button>
        <ul class="ed-drop__list" id="ed-drop-list">
          ${brand.map((e) => `<li>${e.key === edition ? `<span class="is-now" aria-current="page">` : `<a href="${e.file}">`}<i></i><span><b>${e.name}</b><small>${e.sub}</small></span>${e.key === edition ? "</span>" : "</a>"}</li>`).join("")}
          <li class="is-all"><a href="news.html">View all brand ${icon.out}</a></li>
        </ul></div></li>`;
    head.classList.add("ed-head");
    head.innerHTML = `
      <div class="ed-head__veil"></div>
      <nav class="ed-nav" aria-label="Header Menu">
        <a class="ed-brand ed-in" style="--i:0" href="${edition === "shelf" ? "news.html" : "index.html"}">${icon.bag}<span data-label="Your brand’s English name here">Brand Name${now ? ` <em>${now.name}</em>` : ""}</span></a>
        <ul class="ed-nav__mid">${list}
          <li class="ed-in ed-search" style="--i:2" data-search>
            <button class="ed-btn" type="button" aria-expanded="false">Search${mask(icon.search)}</button>
            <form class="ed-search__form" role="search" onsubmit="return false"><div class="ed-search__in">
              <input type="search" placeholder="Your search term here" aria-label="Search" tabindex="-1"><button class="ed-search__x" type="reset">Erase</button>
            </div></form>
          </li>
        </ul>
        <ul class="ed-nav__end">
          <li class="ed-in is-wide" style="--i:3"><a class="ed-btn" href="https://example.com/">This site</a></li>
          <li class="ed-in" style="--i:4"><a class="ed-cta" href="https://example.com/signup">Start for free</a></li>
          <li><button class="ed-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button></li>
        </ul>
      </nav>`;
    const mnav = document.createElement("nav");
    mnav.className = "ed-mnav";
    mnav.setAttribute("aria-label", "Phone menu");
    mnav.dataset.slot = "mobile-menu";
    mnav.innerHTML = brand.map((e) => `<a href="${e.file}">${e.name}</a>`).join("") + `<a href="news.html">View all</a><a href="#">Search</a>`;
    head.after(mnav);

    const drop = head.querySelector("[data-drop]");
    if (drop) {
      const btn = drop.querySelector("button");
      const set = (on) => { drop.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on); };
      btn.addEventListener("click", (e) => { e.stopPropagation(); set(!drop.classList.contains("is-open")); });
      document.addEventListener("click", (e) => { if (!drop.contains(e.target)) set(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    }
    const search = head.querySelector("[data-search]");
    if (search) {
      const btn = search.querySelector("button");
      const input = search.querySelector("input");
      const set = (on) => { search.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on); input.tabIndex = on ? 0 : -1; if (on) setTimeout(() => input.focus(), 200); };
      btn.addEventListener("click", (e) => { e.stopPropagation(); set(true); });
      document.addEventListener("click", (e) => { if (!search.contains(e.target)) set(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    }
    const burger = head.querySelector(".ed-burger");
    burger.addEventListener("click", () => { const on = !html.classList.contains("is-menu"); html.classList.toggle("is-menu", on); burger.setAttribute("aria-expanded", on); });
  }

  // ───────── Lenis — original version 1.3.23, duration 1s · curve min(1, 1.001 − 2^(−10t)) ─────────
  let lenis = null;
  if (!reduce && window.Lenis && !window.ED_NO_LENIS) {
    lenis = new Lenis({ duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: "vertical", smoothWheel: true, wheelMultiplier: 1 });
    if (window.gsap) {
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // Header text color — follows the data-nav of the section crossing under the header (25px). After scrolling down, the background gradient goes to .75
  const navZones = () => [...document.querySelectorAll("[data-nav]")];
  const navTheme = () => {
    html.dataset.navBg = scrollY > 10 ? "solid" : "clear";
    let theme = body.dataset.navDefault || "dark";
    for (const z of navZones()) {
      const r = z.getBoundingClientRect();
      if (r.top <= 25 && r.bottom > 25) theme = z.dataset.nav;
    }
    html.dataset.navTheme = theme;
  };
  addEventListener("scroll", navTheme, { passive: true });
  addEventListener("resize", navTheme);
  navTheme();

  // The canvas and shader read the Skin color — the canvas also resolves color-mix and oklch(from …) to rgb.
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.appendChild(probe);
  const color = (name) => {
    probe.style.color = `var(${name})`;
    const v = getComputedStyle(probe).color;
    cx.clearRect(0, 0, 1, 1);
    cx.fillStyle = v;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  window.ED = { lenis, reduce, color, edition, navTheme, scrollTo: (y, o) => (lenis ? lenis.scrollTo(y, { duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), ...o }) : scrollTo({ top: typeof y === "number" ? y : y.getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" })) };
})();
