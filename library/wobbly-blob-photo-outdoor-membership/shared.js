// Mounts the header, menu panel and footer shared by all pages, and wires up reveal, dark-section color swap, FAQ and Join people-arm motions.
// As in the original, things already visible on the first scan are left alone (not hidden then revealed), and only those further down are revealed over 1.5s.
(() => {
  // Arrows are symbols, like the original (symbol fill=currentColor) <use> As — leave the svg element’s own fill empty so the paint does not move separately on hover
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true">'
    + '<symbol id="hk-arrow-long" viewBox="0 0 180 13" fill="currentColor"><path d="M0 6.1C40 5.2 90 5.4 150 6.6l17.3.3-4.6-4.4 1-1L180 7.2l-16.9 5.4-.6-1.3 5.6-2.6-17.6-.3C90 7.2 40 7 0 7.6z"/></symbol>'
    + '<symbol id="hk-arrow-curved" viewBox="0 0 25 35" fill="currentColor"><path d="M2 33.5c9-2 15-9 15.6-22l-3.6 3.2-1-1.1L19.3 6l5.4 7.8-1.2.9-2.6-3.8C20.4 24.6 13.6 33 2.4 35z"/></symbol></svg>');
  const arrow = '<svg viewBox="0 0 180 13" aria-hidden="true"><use href="#hk-arrow-long"/></svg>';
  // Join person — three arms (down, spread, up) set as three symbols <use> Stack the three so only one shows (like the original, the svg fill follows currentColor at .15s)
  const poses = ["M18 16 9 24M22 16l9 8", "M18 16H7m15 0h11", "M18 16 9.5 7.5M22 16l8.5-8.5"];
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${poses.map((d, i) =>
    `<symbol id="hk-member-${i}" viewBox="0 0 40 40" fill="currentColor"><circle cx="20" cy="8" r="4.5"/><path d="M17 14h6l-1.4 13h-3.2z"/><path d="${d}M18.6 27 15 37M21.4 27 25 37" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></symbol>`).join("")}</svg>`);
  const joinSvg = `<svg viewBox="0 0 40 40" aria-hidden="true">${poses.map((_, i) => `<use class="is-pose-${i}" href="#hk-member-${i}"/>`).join("")}</svg>`;
  const insta = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm0 1.5A1.5 1.5 0 0 0 5.5 7v10A1.5 1.5 0 0 0 7 18.5h10a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 17 5.5zm5 3.25a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5zm0 1.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5zM16.6 6.6a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z"/></svg>';
  const note = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h10.5L19 8.5V19H5zm1.5 1.5v11h11V9.2L14.8 6.5z"/></svg>';
  const joinSmall = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="8" r="4.5"/><path d="M17 14h6l-1.4 13h-3.2z"/><path d="M18 16 9 24M22 16l9 8M18.6 27 15 37M21.4 27 25 37" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
  // Footer table — six trees standing in two rows (spot for the original logo symbol, newly drawn)
  const trees = [0, 1, 2].flatMap((c) => [0, 1].map((r) => {
    const x = 6 + c * 18 + r * 4, y = 4 + r * 22;
    return `<path d="M${x + 6} ${y}l6 16h-4v4h-4v-4h-4z"/>`;
  })).join("");
  const mark = `<svg class="hk-foot__mark" viewBox="0 0 66 46" aria-hidden="true">${trees}</svg>`;
  const word = '<span class="hk-foot__word hk-logo-word">LOGO</span>';

  const page = document.body.dataset.page || "home";
  const on = (p) => (p === page ? ' aria-current="page"' : "");
  const social = `<ul class="hk-social"><li class="is-join"><a href="recruit.html">${joinSmall}Join</a></li><li><a href="#" data-label="Your social account’s English name here">${insta}account</a></li><li><a href="#" data-label="Your blog service name in English">${note}blog</a></li></ul>`;

  const head = document.querySelector("[data-site-head]");
  if (head) head.outerHTML = `
    <a class="hk-logo" href="index.html" aria-label="First Page" data-slot="header"><span class="hk-logo-word">LOGO</span></a>
    <div class="hk-menu" data-slot="menu-drawer">
      <div class="hk-mini">
        <div class="hk-toggle" role="button" tabindex="0" aria-label="Open Menu" aria-controls="hk-panel" aria-expanded="false"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><line x1="8" y1="14" x2="32" y2="14" stroke="currentColor" stroke-width="2"/><line x1="8" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="2"/></svg></div>
        <a class="hk-join" href="recruit.html" aria-label="Member sign-up">${joinSvg}<span>Join</span></a>
      </div>
      <div class="hk-overlay" role="button" aria-label="Close Menu"></div>
      <nav class="hk-panel" id="hk-panel" aria-label="Site Menu">
          <div class="hk-nav">
            <ul class="hk-primary">
              <li><a class="hk-nav__link" href="about.html#menu"${on("about")}><span class="hk-squash">MENU ONE</span></a></li>
              <li><a class="hk-nav__link" href="index.html#location"><span class="hk-squash">MENU TWO PLACE</span></a></li>
              <li><a class="hk-nav__link" href="recruit.html#menu"${on("recruit")}><span class="hk-squash">MENU THREE JOIN</span></a></li>
            </ul>
            <ul class="hk-secondary">
              <li><a href="news.html"${on("news")}>NEWS</a></li>
              <li><a href="recruit.html#faq">FAQ</a></li>
              <li><a href="#">MENU 03</a></li>
              <li><a href="#">MENU 04</a></li>
            </ul>
            ${social}
          </div>
          <p class="hk-copy">© LOGO</p>
      </nav>
    </div>`;

  const foot = document.querySelector("[data-site-foot]");
  if (foot) foot.outerHTML = `
    <footer class="hk-foot" data-slot="footer">
      <div class="hk-foot__grid">
        <a class="hk-foot__logo" href="index.html" aria-label="First Page">${mark}${word}</a>
        <div class="hk-foot__menu">
          <div class="hk-foot__nav">${social}<div class="hk-foot__links"><a href="#">MENU 05</a><a href="#">MENU 06</a></div></div>
          <div class="hk-foot__info"><p>Add one line about sponsorship and support here. Your organization name goes here.</p><p class="hk-copy">© LOGO</p></div>
        </div>
      </div>
    </footer>`;

  document.querySelectorAll(".hk-more a").forEach((a) => a.insertAdjacentHTML("beforeend", arrow));

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menu: a single html.is-menu-open class drives the panel (.6s), backdrop (blur .6s), header color and scroll lock through CSS transitions — only the class is toggled, as in the original
  const toggle = document.querySelector(".hk-toggle");
  const setMenu = (open) => {
    root.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    pose(open);
  };
  if (toggle) {
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    document.querySelector(".hk-overlay").addEventListener("click", () => setMenu(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }
  // While open, the arms go 0→1→2→1→0 every 1s, then rest 10s after one full cycle. When closed, back to the initial shape
  const states = [...document.querySelectorAll(".hk-join [class^='is-pose']")];
  const order = [0, 1, 2, 1, 0];
  let step = 0, poseTimer;
  // Like the original, hide everything and then turn one on (rewritten every time even if the type is the same)
  const showPose = (n) => { states.forEach((s) => s.style.setProperty("visibility", "hidden")); states[n]?.style.setProperty("visibility", "visible"); };
  function pose(open) {
    clearTimeout(poseTimer);
    if (!open || reduce) { step = 0; showPose(0); return; }
    const tick = () => {
      showPose(order[step]);
      step = (step + 1) % order.length;
      poseTimer = setTimeout(tick, step === 0 ? 10000 : 1000);
    };
    tick();
  }
  showPose(0);

  // If even one pixel of a dark section (.is-dark) is visible, make the header text beige
  const darks = document.querySelectorAll(".is-dark");
  if (darks.length) {
    // Measure once before the first paint — waiting for the observer’s first notification makes the heading letters paint once in a dark color and then change
    if ([...darks].some((d) => { const r = d.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })) root.classList.add("is-on-dark");
    const io = new IntersectionObserver((es) => es.forEach((e) => root.classList.toggle("is-on-dark", e.isIntersecting)), { threshold: 0 });
    darks.forEach((d) => io.observe(d));
  }

  // Reveal: data-reveal elements get is-ready (hidden) on the first sweep and is-seen once visible. With repeat, is-visible is removed when they leave the screen so the reveal plays again when seen again.
  const reveals = document.querySelectorAll("[data-reveal]");
  if (!reduce && reveals.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const el = e.target;
      el.classList.add("is-ready");
      if (e.isIntersecting) el.classList.add("is-seen", "is-visible");
      else el.classList.remove("is-visible");
    }));
    reveals.forEach((r) => io.observe(r));
  }

  // As in the original, role is put on non-button elements (div, h3)=Since it is a button, make it work with Enter and Space too
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.('[role="button"]')) { e.preventDefault(); e.target.click(); }
  });

  // FAQ: each question opens and closes on its own, answer height via max-height .3s
  document.querySelectorAll(".hk-faq__item").forEach((item) => {
    const q = item.querySelector(".hk-faq__q"), a = item.querySelector(".hk-faq__a");
    if (!q || !a) return;
    a.style.setProperty("--scroll-height", `${a.scrollHeight}px`);
    q.addEventListener("click", () => {
      item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(item.classList.contains("is-open")));
    });
  });
  addEventListener("resize", () => document.querySelectorAll(".hk-faq__a").forEach((a) => a.style.setProperty("--scroll-height", `${a.scrollHeight}px`)), { passive: true });
})();
