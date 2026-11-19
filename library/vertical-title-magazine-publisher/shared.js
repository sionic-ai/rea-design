// Spanning several pages — draws the header, burger, white-panel menu and footer, and ports the scroll and click behavior of the original base.js with the same values.
(() => {
  const page = document.body.dataset.page || "";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const arrow = '<svg class="kt-arrow" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.4" fill="none" stroke="currentColor"/><path d="M4.4 8h7M8.6 5.2 11.4 8 8.6 10.8" fill="none" stroke="currentColor"/></svg>';
  const logo = '<span class="kt-logo" data-label="Brand wordmark — four bold brush-written characters + one small particle (original 226×83 image)" aria-label="Brand Title"><span>Flesh</span><span>Rim</span><span>Of</span><span>Number</span><span>Booklet</span></span>';
  const nav = [
    ["product.html", "New & back-catalog titles"],
    ["news.html", "Notebook Dispatch"],
    ["#", "Online store"],
    ["#", "Your digital edition here"],
  ];
  const gnav = `<ul class="kt-gnav">${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>`;
  const teiki = `<p class="kt-teiki"><a href="#" class="kt-step" data-label="Subscription prompt button — two-line stepped box"><span>Subscribe to</span><span>Shall we get started?${arrow}</span></a></p>`;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "kt-header";
    header.innerHTML = page === "home"
      ? `<h1><a href="index.html">${logo}</a></h1>${gnav}${teiki}`
      : `<p><a href="index.html">${logo}</a></p>`;
  }

  const menu = document.querySelector('[data-slot="menu"]');
  if (menu) {
    menu.innerHTML = `<p class="kt-burger is-spon"><button type="button" aria-label="Open Menu" aria-expanded="false"><i></i></button></p>
      <div class="kt-menu" aria-hidden="true"><div class="kt-menu__inner"><p class="kt-menu__logo"><a href="index.html">${logo}</a></p><div>${gnav}${teiki}</div></div></div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "kt-footer";
    const sub = (items) => `<ul>${items.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>`;
    footer.innerHTML = `<div class="kt-footer__wrap">
      <div class="kt-footer__l">
        <div class="kt-fnav1">
          <ul class="kt-fnav"><li><a href="product.html">New & back-catalog titles</a>${sub([["product.html", "Category name one"], ["product.html", "Fork two"], ["product.html", "Fork three"]])}</li></ul>
          <ul class="kt-fnav"><li><a href="news.html">Notebook Dispatch</a>${sub([["news.html", "Series name one"], ["news.html", "Series name two"], ["news.html", "Your series name here"], ["news.html", "Series name four"], ["news.html", "Your slightly long series name 5 here"], ["news.html", "Your sixth series name"], ["news.html", "News Category One"], ["news.html", "News category two"]])}</li></ul>
          <ul class="kt-fnav3">
            <li><a href="#">A commemorative site<span>Special Site</span></a></li>
            <li><a href="#">Two anniversary sites<span>Special Site</span></a></li>
            <li><a href="#">Site Name <small>~ Your subtitle here</small><span>Special Site</span></a></li>
            <li><a href="#">Your four memorial sites here<span>Special Site</span></a></li>
            <li><a href="#">Celebrating the 00th anniversary<span>Special Site</span></a></li>
          </ul>
        </div>
        <div class="kt-fnav2">
          <ul class="kt-fnav"><li><a href="about.html">Company guide</a>${sub([["about.html#message", "Greeting"], ["about.html#about", "About your company here"], ["about.html#founder", "About the founder"], ["about.html#company", "History / Company overview / Access"]])}</li></ul>
          <ul class="kt-fnav4"><li><a href="#">Frequently asked questions</a></li><li><a href="#">Contact Us</a></li><li><a href="#">Survey</a></li><li><a href="#">One-line new deal notice</a></li></ul>
        </div>
        <p class="kt-rights">Your copyright notice here, about three lines. State that text, photos and illustrations on this site may not be used without permission, and give a contact for inquiries. Add one more sentence to match the original length. Then add one final line here.</p>
      </div>
      <div class="kt-footer__r">
        <ul class="kt-fbnr">
          <li><a href="#" class="kt-step" data-label="Subscription banner — three-line staircase box (original 327×204)"><span>Your magazine text here<br>Subscribe to</span><span>Why not get started?</span></a></li>
          <li><a href="#" class="kt-fbox" data-label="Online store banner 327×82"><b>Brand Shop</b><small>ONLINE STORE</small></a></li>
          <li><a href="#" class="kt-fbox is-shop" data-label="Sister shop banner 327×82 — two-house icon + two lines of English"><svg viewBox="0 0 44 40" aria-hidden="true"><path d="M2 20 9 8l7 12v8H2Z M16 20l7-12 7 12v8" fill="none" stroke="currentColor"/><path d="M8 26l6-8 6 8v12H8Z" fill="currentColor"/></svg><span>Green<br>Shop</span></a></li>
        </ul>
        <ul class="kt-fsns" aria-label="SNS">
          <li><a href="#" aria-label="SNS 1"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="currentColor"/><path d="M17.6 25v-8h2.6l.4-3h-3v-2c0-.9.3-1.5 1.5-1.5h1.6V7.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9V14h-2.6v3h2.6v8Z" style="fill:var(--kf-bg)"/></svg></a></li>
          <li><a href="#" aria-label="SNS 2"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6"><rect x="3" y="3" width="26" height="26" rx="7"/><circle cx="16" cy="16" r="6"/><circle cx="23.4" cy="8.6" r=".6" fill="currentColor"/></svg></a></li>
          <li><a href="#" aria-label="SNS 3"><svg viewBox="0 0 41 32" style="width:41px"><rect x="1" y="3" width="39" height="26" rx="8" fill="currentColor"/><path d="M16.5 10.5v11l9.5-5.5Z" style="fill:var(--kf-bg)"/></svg></a></li>
          <li><a href="#" aria-label="SNS 4"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h6.5L28 28h-6.5Z"/><path d="M27 4 17.6 14.6M5 28l9.4-10.6"/></svg></a></li>
        </ul>
      </div>
    </div>
    <p class="kt-copy">© 0000-0000 Brand Name co.ltd.</p>`;
  }

  // ---------- Hand-drawn illustration — the original picks one of illust01~07 (it changes each time it opens) ----------
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = (r, cx, cy, rad, n) => Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad;
    return `<ellipse cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d * 1.25).toFixed(1)}" rx="${(1.6 + r() * 1.6).toFixed(1)}" ry="${(1.2 + r()).toFixed(1)}"/>`;
  }).join("");
  const art = {
    houses: () => `<svg viewBox="0 0 250 230" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M97 148 96 61l7-34 46-1 4 35 1 91M154 61H96"/><path d="M30 197 28 124l19-42 48 1 18 37-1 75Z"/><path d="M138 211l-1-51 23-28 24 26-1 53Z"/>
      <text x="106" y="96" font-size="8" letter-spacing="1.5" stroke="none" fill="currentColor">FACTORY</text><text x="56" y="162" font-size="8" letter-spacing="1.5" stroke="none" fill="currentColor">SHOP</text><text x="145" y="190" font-size="7" letter-spacing="1.2" stroke="none" fill="currentColor">HOUSE</text></svg>`,
    kids: () => {
      const kid = (x) => `<path d="M${x - 21} 62c0-14 10-24 22-24s21 10 21 23-9 23-21 23-22-9-22-22Z"/><path d="M${x - 6} 39l5-9 3 8 4-8 3 9M${x - 15} 50h30" /><circle cx="${x - 7}" cy="62" r=".8" fill="currentColor"/><circle cx="${x + 8}" cy="62" r=".8" fill="currentColor"/>
        <path d="M${x - 7} 85 ${x - 29} 152h59L${x + 9} 85"/><circle cx="${x}" cy="104" r="6"/><circle cx="${x}" cy="104" r="2.4"/><circle cx="${x + 1}" cy="120" r="6"/><circle cx="${x + 1}" cy="120" r="2.4"/><circle cx="${x}" cy="136" r="6"/><circle cx="${x}" cy="136" r="2.4"/>
        <path d="M${x - 11} 152l-1 40M${x + 8} 152l1 40"/><ellipse cx="${x - 15}" cy="194" rx="7" ry="3.6"/><ellipse cx="${x + 13}" cy="194" rx="7" ry="3.6"/>`;
      return `<svg viewBox="0 0 250 210" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kid(84)}${kid(166)}</svg>`;
    },
    trees: () => {
      const r = rnd(7);
      return `<svg viewBox="0 0 250 240" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" aria-hidden="true">
        <path d="M58 22c12-4 26 2 40-1s20-3 34 0M92 30c10-3 22 2 34-1s16 0 30 1"/>
        <path d="M84 150c2 22 2 44 4 66M90 150l-7-22M124 160c-1 18 0 38 2 56M124 160l8-18M160 140c-2 26-2 52 0 78M160 140l-9-26M160 140l10-24"/>
        <g fill="currentColor" stroke="none">${dots(r, 86, 92, 30, 70)}${dots(r, 124, 120, 20, 40)}${dots(r, 162, 80, 32, 80)}</g>
        <g stroke-width=".9">${Array.from({ length: 34 }, () => { const x = 60 + r() * 130, y = 208 + r() * 22; return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}h${(3 + r() * 4).toFixed(1)}"/>`; }).join("")}</g></svg>`;
    },
    kettle: () => `<svg viewBox="0 0 250 220" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M62 178c-8-36 6-74 44-80 38 6 52 44 44 80Z"/><path d="M80 100c4-16 48-16 52 0"/><path d="M98 86c0-6 16-6 16 0v6H98Z"/><path d="M76 108c-4-38 64-38 60 0" stroke-dasharray="0"/>
      <path d="M150 140c14-4 22-20 34-30l4 4c-10 12-16 30-34 40"/><path d="M58 178h96"/>
      <path d="M176 176h34l-4 22h-26Z"/><path d="M210 182c8 0 8 10 0 10"/><path d="M168 198h50"/></svg>`,
  };
  const kinds = Object.keys(art);
  document.querySelectorAll("[data-illust]").forEach((el) => {
    const kind = el.dataset.illust && art[el.dataset.illust] ? el.dataset.illust : kinds[Math.floor(Math.random() * kinds.length)];
    el.innerHTML = art[kind]();
    el.dataset.label = "Hand-drawn illustration — brown pen lines (one of three houses, two kids, a tree forest, or a kettle each time it opens)";
  });

  // ---------- Burger: the original base.js scroll set (hide past 50px · pchide over the first photo · on when scrolling up) ----------
  const burger = document.querySelector(".kt-burger");
  const panel = document.querySelector(".kt-menu");
  if (burger && panel) {
    const mv = document.querySelector('[data-slot="hero"]');
    let pos = scrollY;
    const onScroll = () => {
      const s = scrollY;
      if (s < 50) burger.classList.remove("is-hide");
      else if (s > 50) burger.classList.add("is-hide");
      if (mv) {
        const m = mv.offsetHeight;
        if (s < m) burger.classList.add("is-pchide");
        else if (s > m) burger.classList.remove("is-pchide");
      }
      if (s < pos) burger.classList.add("is-on");
      else burger.classList.remove("is-on", "is-spon");
      pos = s;
    };
    addEventListener("scroll", onScroll, { passive: true });
    if (mv) burger.classList.add("is-pchide");
    const btn = burger.querySelector("button");
    btn.addEventListener("click", () => {
      const open = panel.classList.toggle("is-active");
      burger.classList.toggle("is-active", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      panel.setAttribute("aria-hidden", String(!open));
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("is-active")) btn.click(); });
  }

  // ---------- In-page # links: original jQuery animate 400ms swing, target −120px ----------
  const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
  const scrollToY = (to, ms) => {
    if (reduce) { scrollTo(0, to); return; }
    const from = scrollY, t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / ms); scrollTo(0, from + (to - from) * swing(p)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const target = id ? document.getElementById(id) : document.documentElement;
    if (target) scrollToY(Math.max(0, target.getBoundingClientRect().top + scrollY - 120), 400);
  });

  // Original $(function(){ $('html').addClass('page-active') }) — shows up .5s after the DOM is ready, for .3s
  const show = () => document.documentElement.classList.add("page-active");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show);
  else show();
})();
