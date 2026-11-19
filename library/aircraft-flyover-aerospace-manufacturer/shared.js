// Shared across the whole site — attaches the header, phone menu, bar loader and footer to every section.
// Original (Next app router): the header hides when scrolling down more than 5px below 80px and shows when scrolling up more than 5px (transform .3s ease).
// When changing sections a 3px bar fills 10% of the remaining distance (up to 90%) every 150ms, and when the new section is up it fills to 100% and disappears.
(() => {
  const page = document.body.dataset.page || "home";
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const mark = (h) => `<svg viewBox="0 0 120 40" height="${h}" aria-hidden="true"><path d="M2 6 30 17 2 34l9-14z" fill="currentColor"/><text x="38" y="18" font-size="11" font-weight="700" fill="currentColor" font-family="var(--kf-font-display)">Brand</text><text x="38" y="31" font-size="11" font-weight="700" fill="currentColor" font-family="var(--kf-font-display)">Name</text></svg>`;
  const links = [["Mission", "#", ""], ["Company", "about.html", "about"], ["Product A", "#", ""], ["Product B", "index.html#es", ""], ["Newsroom", "news.html", "news"], ["Careers", "recruit.html", "recruit"], ["Media", "#", ""], ["Contact", "#", ""]];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ha-head");
    // Header hide is the hide-on-scroll part — original: always visible within 80px, hides when scrolling down over 5px, shows immediately when scrolling up over 5px (transform .3s ease)
    head.dataset.fx = "hide-on-scroll";
    head.dataset.fxHideOnScroll = "look: slide; delay: 0; offset: 80; step: 5; end: hide";
    head.innerHTML = `<div class="ha-head__bar"><div class="ha-head__in">
      <a class="ha-brand" href="index.html" aria-label="Back to start" data-label="Brand logo · symbol + two-line wordmark">${mark(40)}</a>
      <nav class="ha-nav" aria-label="Main menu"><ul>${links.map(([t, h, p]) => `<li><a href="${h}"${p ? cur(p) : ""}>${t}</a></li>`).join("")}</ul></nav>
      <button class="ha-burger" type="button" aria-label="Menu" aria-expanded="false"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="5" width="22" height="2" rx="1"/><rect x="1" y="11" width="22" height="2" rx="1"/><rect x="1" y="17" width="22" height="2" rx="1"/></svg></button>
    </div></div>
    <div class="ha-mnav" data-slot="mobile-menu" hidden><ul>${links.map(([t, h, p]) => `<li><a href="${h}"${p ? cur(p) : ""}>${t}</a></li>`).join("")}</ul></div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const icon = {
      a: '<svg viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="16" height="16" rx="2"/></svg>',
      b: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.2"/></svg>',
      c: '<svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8"/></svg>',
      d: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4l12 12M16 4 4 16"/></svg>',
    };
    foot.classList.add("ha-foot");
    foot.innerHTML = `<div class="ha-foot__in">
      <div class="ha-foot__cols">
        <nav aria-label="Bottom Menu"><h2>Navigation</h2><ul>${links.concat([["Privacy", "#", ""], ["Cookie policy", "#", ""]]).map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></nav>
        <div><h2>Follow</h2><ul>${[["Social One", "a"], ["Social Two", "b"], ["Social Three", "c"], ["X", "d"]].map(([t, k]) => `<li><a href="#">${icon[k]}${t}</a></li>`).join("")}</ul></div>
        <div><h2>Address</h2><address>Your address first line here<br>Your City · postal code here<br>Your nation here</address></div>
      </div>
      <div class="ha-foot__bar">${mark(56)}<p>© 0000 Brand Name</p></div>
    </div>`;
  }

  document.body.insertAdjacentHTML("afterbegin", '<div class="ha-loader" aria-hidden="true" hidden><div class="ha-loader__bar"></div></div>');
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;


  // Phone menu — the cover drops in from 8px above in .2s as it turns on, body scroll is locked while open
  const burger = document.querySelector(".ha-burger"), mnav = document.querySelector(".ha-mnav");
  if (burger && mnav) {
    const set = (on) => { burger.setAttribute("aria-expanded", on); mnav.hidden = !on; document.body.style.overflow = on ? "hidden" : ""; };
    burger.addEventListener("click", () => set(mnav.hidden));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  // Bar loader
  const ld = document.querySelector(".ha-loader"), bar = ld.querySelector(".ha-loader__bar");
  let timer = null, pct = 0;
  const start = () => {
    ld.hidden = false; ld.classList.remove("is-done"); ld.classList.add("is-loading");
    pct = 0; bar.style.width = "0%";
    clearInterval(timer);
    timer = setInterval(() => { pct = Math.min(90, pct + Math.max(1, (90 - pct) * 0.1)); bar.style.width = pct + "%"; }, 150);
  };
  const finish = (from) => {
    clearInterval(timer);
    ld.hidden = false; ld.classList.remove("is-loading");
    if (from != null) { bar.style.transition = "none"; bar.style.width = from + "%"; bar.offsetWidth; bar.style.transition = ""; }
    bar.style.width = "100%"; ld.classList.add("is-done");
    setTimeout(() => { ld.hidden = true; ld.classList.remove("is-done"); bar.style.width = "0%"; }, 300 + 400);
  };
  const was = sessionStorage.getItem("ha-nav");
  if (was) { sessionStorage.removeItem("ha-nav"); finish(+was || 10); }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href) || reduce) return;
    start();
    addEventListener("pagehide", () => sessionStorage.setItem("ha-nav", String(Math.round(pct))), { once: true });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { clearInterval(timer); ld.hidden = true; } });
})();
