// Shared by all pages: fits in the header row, full menu, booking and footer, and hooks up the original main.bundle’s hand reactions with the same values.
// Doesn’t use the original TweenMax 2 (paid edition line) but produces the same curves with shared GSAP 3 (Circ → circ, Power3 → power3).
(() => {
  const here = document.body.dataset.page || "top";
  const NAV = [["index.html", "top"], ["about.html", "concept"], ["bar.html", "bar & food"], ["index.html#stay", "stay"], ["index.html#spa", "spa"], ["index.html#facility", "facility"], ["index.html#access", "access"], ["news.html", "news"]];
  const BARS = [[0, 46, 56], [4.93, 35, 90], [9.86, 89, 26], [14.79, 77, 67], [19.72, 107, 27], [24.65, 86, 37], [29.58, 99, 4], [34.51, 119, 13], [39.44, 102, 8], [44.37, 131, 29], [49.3, 130, 26], [54.23, 114, 53], [59.16, 125, 0], [64.09, 128, 29], [69.02, 140, 5], [73.95, 91, 12], [78.88, 85, 57], [83.81, 105, 18], [88.74, 45, 45], [93.67, 71, 40], [98.6, 46, 56]];
  const mark = (name = "bar hotel", sub = "Your lodging name here") =>
    `<span class="bh-mark" data-label="Inn logo — wave of 21 vertical bars + lowercase English name + small Korean name">${BARS.map(([x, h, b]) => `<i style="--x:${x};--h:${h};--b:${b}"></i>`).join("")}<b>${name}</b><small>${sub}</small></span>`;
  const mini = `<svg viewBox="0 0 26 26" aria-hidden="true">${BARS.filter((_, i) => i % 2 === 0).map(([x, h, b], i) => `<rect x="${i * 2.3}" y="${26 - h / 7 - b / 10}" width="1" height="${h / 7}"/>`).join("")}</svg>`;

  const header = `
<header class="bh-hdr" data-slot="header">
  <div class="bh-box" id="bh-box"><div class="bh-box__inner">
    <div class="bh-box__logo"><a href="index.html" class="bh-box__logo" aria-label="To the first page" data-label="Horizontal logo — small bar mark + English name">${mini}<span lang="en">bar hotel name</span></a></div>
    <p class="bh-clock" id="bh-clock" lang="en">Monday 26 Feb, 2018 19:45:00</p>
  </div></div>
  <nav class="bh-gnav" aria-label="Main menu">
    <ul>${NAV.map(([h, t]) => `<li><a href="${h}" lang="en"${t === here ? ' class="is-current"' : ""}>${t}</a></li>`).join("")}</ul>
    <div class="bh-lang" id="bh-lang"><p lang="en">language</p><ul><li><a href="index.html">日本語</a></li><li><a href="index.html#en" lang="en">English</a></li><li><a href="index.html#tw">繁体中文</a></li><li><a href="index.html#cn">简体中文</a></li><li><a href="index.html#ko">Korean</a></li></ul></div>
    <div class="bh-share"><a href="index.html#sns" aria-label="Social Media"></a></div>
  </nav>
</header>`;

  const overlay = `
<button class="bh-trigger" id="bh-trigger" type="button" aria-label="Menu"><span></span><span></span><span></span></button>
<nav class="bh-overlay" data-slot="menu-overlay" aria-label="Full menu">
  <div class="bh-overlay__inner">
    <div class="bh-overlay__block">
      <ul class="bh-sitemap">
        <li><a href="index.html" lang="en">top</a><ul><li><a href="index.html" lang="en">top</a></li><li><a href="news.html" lang="en">news and topics</a></li></ul></li>
        <li><a href="about.html" lang="en">concept</a></li>
        <li><a href="bar.html" lang="en">bar &amp; food</a><ul><li><a href="bar.html" lang="en">bar &amp; food</a></li><li><a href="bar.html#interior" lang="en">bar interior</a></li><li><a href="bar.html#private" lang="en">private spa &amp; bar</a></li></ul></li>
        <li><a href="index.html#stay" lang="en">stay</a><ul><li><a href="index.html#stay" lang="en">suite room 01</a></li><li><a href="index.html#stay" lang="en">suite room 02</a></li><li><a href="index.html#stay" lang="en">superior</a></li><li><a href="index.html#stay" lang="en">standard</a></li></ul></li>
        <li><a href="index.html#spa" lang="en">spa</a></li>
        <li><a href="index.html#facility" lang="en">facility</a><ul><li><a href="index.html#facility" lang="en">lounge</a></li><li><a href="index.html#facility" lang="en">art and design</a></li></ul></li>
      </ul>
      <div class="bh-overlay__foot"><ul><li><a href="index.html#access" lang="en">access</a></li><li><a href="index.html#contact" lang="en">contact</a></li><li><a href="index.html#qa" lang="en">Q&amp;A</a></li></ul><ul><li><a href="index.html#privacy" lang="en">privacy policy</a></li><li><a href="index.html#recruit" lang="en">recruit</a></li></ul></div>
    </div>
    <div class="bh-overlay__logo">${mark()}</div>
  </div>
</nav>`;

  const resv = `
<div class="bh-reserve" data-slot="reserve-button"><button type="button" class="js-resv-open" lang="en">reserve</button></div>
<div class="bh-resv" data-slot="reserve-panel" role="dialog" aria-label="Reservation">
  <button class="bh-resv__close js-resv-close" type="button" aria-label="Close">close</button>
  <div class="bh-resv__inner">
    <dl class="bh-resv__col"><dt>Date</dt><dd>2026.00.00 — 00.00</dd></dl>
    <dl class="bh-resv__col"><dt>Headcount</dt><dd>2 people</dd></dl>
    <dl class="bh-resv__col"><dt>Number of rooms</dt><dd>1 room</dd></dl>
  </div>
  <div class="bh-resv__search"><a href="index.html#plan" lang="en">search</a></div>
</div>`;

  const footer = `
<footer class="bh-ftr" data-slot="footer">
  <div class="bh-pagetop"><a href="#top" lang="en"><span class="bh-arrow bh-arrow--r"></span>pagetop</a></div>
  <div class="bh-ftr__row">
    <div class="bh-ftr__logo"><a href="index.html" aria-label="To the first page">${mark()}</a></div>
    <div class="bh-ftr__txt">
      <h2 class="bh-ftr__name"><span lang="en">bar hotel name</span>　Your lodging name here</h2>
      <address class="bh-ftr__info">
        <div class="bh-ftr__addr"><p>〒000-0000 Your lodging address here in one line</p><div class="bh-btn"><a href="index.html#access" lang="en">access<span class="bh-arrow bh-arrow--r"></span></a></div></div>
        <div class="bh-ftr__contact"><dl><dt>telephone</dt><dd><a href="index.html#tel">0000.00.0000</a></dd></dl><dl><dt>fax</dt><dd>0000.00.0000</dd></dl></div>
      </address>
      <ul class="bh-ftr__nav">
        <li><a href="index.html" lang="en">top</a></li><li><a href="about.html" lang="en">concept</a></li>
        <li><a href="bar.html" lang="en">bar &amp; food</a><ul><li><a href="bar.html#interior" lang="en">bar interior</a></li><li><a href="bar.html#private" lang="en">private spa &amp; bar</a></li></ul></li>
        <li><a href="index.html#stay" lang="en">stay</a><ul><li><a href="index.html#stay" lang="en">suite room 01</a></li><li><a href="index.html#stay" lang="en">superior</a></li><li><a href="index.html#stay" lang="en">standard</a></li></ul></li>
        <li><a href="index.html#spa" lang="en">spa</a></li>
        <li><a href="index.html#facility" lang="en">facility</a><ul><li><a href="index.html#facility" lang="en">lounge</a></li><li><a href="index.html#facility" lang="en">art and design</a></li></ul></li>
      </ul>
      <ul class="bh-ftr__other"><li><a href="index.html#access" lang="en">access</a></li><li><a href="news.html" lang="en">news</a></li><li><a href="index.html#qa" lang="en">Q&amp;A</a></li><li><a href="index.html#privacy" lang="en">privacy policy</a></li><li><a href="index.html#contact" lang="en">contact</a></li><li><a href="index.html#recruit" lang="en">recruit</a></li></ul>
    </div>
  </div>
  <div class="bh-ftr__banner wf-img" data-label="Lowest-price booking banner · horizontal strip"></div>
  <small class="bh-ftr__copy" lang="en">Copyright &copy;bar hotel name. All rights reserved.</small>
</footer>
<div class="bh-other" data-slot="sister-hotels">
  <div class="bh-other__wrap">
    <p lang="en">Our hotels</p>
    <div class="bh-other__cols">${[["Region 1", 4], ["Region 2", 4], ["Region 3", 1], ["Region 4", 3]].map(([a, n], k) => `<div class="bh-other__col"><h3>${a}</h3><ul>${Array.from({ length: n }, (_, i) => `<li><a href="index.html#hotel">Sister inn name ${k + 1}-${i + 1}</a></li>`).join("")}</ul></div>`).join("")}</div>
    <div class="bh-other__press" lang="en">Produced by<span class="wf-logo" data-label="Operator Logo">LOGO</span></div>
  </div>
</div>`;

  const slotH = document.querySelector("[data-bh-header]");
  if (slotH) slotH.outerHTML = header + overlay;
  const slotF = document.querySelector("[data-bh-footer]");
  if (slotF) slotF.outerHTML = footer + resv;

  document.querySelectorAll("[data-bh-mark]").forEach((n) => (n.outerHTML = mark()));
  document.querySelectorAll("[data-bh-mini]").forEach((n) => (n.innerHTML = mini));
  const body = document.body;

  // Clock: every 1s shows weekday, day, month, year hh:mm:ss
  const clock = document.getElementById("bh-clock");
  const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p2 = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const d = new Date();
    if (clock) clock.textContent = `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}, ${d.getFullYear()} ${d.getHours()}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
    setTimeout(tick, 1000);
  };
  tick();

  // Past one screen height: clock → logo (is-change), and the back-to-top button at the top (is-view)
  const box = document.getElementById("bh-box");
  const onScroll = () => {
    const past = scrollY >= innerHeight;
    box?.classList.toggle("is-change", past);
    body.classList.toggle("is-view", past);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const lang = document.getElementById("bh-lang");
  lang?.addEventListener("mouseenter", () => lang.classList.add("is-open"));
  lang?.addEventListener("mouseleave", () => lang.classList.remove("is-open"));
  document.getElementById("bh-trigger")?.addEventListener("click", () => body.classList.toggle("is-navigation"));

  // When visible, add is-show (original jquery.inview)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-show"); io.unobserve(e.target); } }), { threshold: 0 });
  document.querySelectorAll(".js-view").forEach((el) => io.observe(el));

  // 100 photo cover bars. Each bar’s delay is the original CSS value as is
  const DELAY = [24, 15, 23, 23, 17, 30, 14, 24, 15, 3, 21, 19, 2, 24, 7, 10, 8, 1, 27, 14, 23, 24, 8, 1, 28, 28, 8, 10, 20, 30, 28, 3, 8, 9, 12, 28, 7, 10, 13, 12, 30, 5, 12, 1, 5, 19, 4, 9, 26, 10, 13, 22, 12, 25, 1, 21, 14, 29, 30, 22, 2, 17, 25, 20, 21, 3, 4, 19, 22, 15, 22, 5, 3, 14, 24, 13, 4, 3, 25, 2, 20, 12, 6, 10, 20, 2, 7, 3, 14, 1, 10, 18, 16, 25, 1, 21, 12, 3, 17, 18];
  document.querySelectorAll(".bh-cover").forEach((c) => {
    if (c.children.length) return;
    c.innerHTML = DELAY.map((d, i) => `<span style="left:${i}%;transition-delay:${d / 100}s"></span>`).join("");
  });

  if (!window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Booking panel: rises from the bottom of the screen with 0.6s Circ.easeOut
  const resvEl = document.querySelector(".bh-resv");
  document.querySelectorAll(".js-resv-open").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); gsap.to(resvEl, { y: "-100%", duration: reduce ? 0 : 0.6, ease: "circ.out" }); }));
  document.querySelectorAll(".js-resv-close").forEach((b) => b.addEventListener("click", () => gsap.to(resvEl, { y: "0%", duration: reduce ? 0 : 0.6, ease: "circ.out" })));

  // view more: the arrow row slides out to the right (0.3s), then returns into place from outside the left (0.3s), Circ.easeOut
  document.querySelectorAll(".bh-btn").forEach((b) => {
    const arrow = b.querySelector(".bh-arrow");
    if (!arrow || reduce) return;
    let t = null;
    b.addEventListener("mouseenter", () => {
      if (t && t.isActive()) return;
      t = gsap.timeline();
      t.to(arrow, { left: "100%", duration: 0.3, ease: "circ.out" }).set(arrow, { left: "-100%" }).to(arrow, { left: "0%", duration: 0.3, ease: "circ.out" });
    });
  });

  // Next-section guide band: the active photo fills in diagonally (.45 Power3.in → .45 Power3.out), and when it leaves it rolls up
  const P = (a) => `polygon(${a[0]}% ${a[1]}%, ${a[2]}% ${a[3]}%, ${a[4]}% ${a[5]}%, ${a[6]}% ${a[7]}%)`;
  const IN1 = P([0, 0, 100, 50, 100, 100, 0, 100]), IN2 = P([0, 0, 100, 0, 100, 100, 0, 100]);
  const OUT1 = P([0, 0, 100, 0, 100, 50, 0, 0]), OUT2 = P([0, 0, 100, 0, 100, 0, 0, 0]), HIDE = P([0, 100, 100, 100, 100, 100, 0, 100]);
  document.querySelectorAll(".bh-navarea__block").forEach((a) => {
    const on = a.querySelector(".bh-navarea__on");
    if (!on || reduce) return;
    const tl = gsap.timeline();
    gsap.set(on, { clipPath: HIDE });
    a.addEventListener("mouseenter", () => { tl.to(on, { clipPath: IN1, duration: 0.45, ease: "power3.in" }).to(on, { clipPath: IN2, duration: 0.45, ease: "power3.out" }); });
    a.addEventListener("mouseleave", () => { tl.to(on, { clipPath: OUT1, duration: 0.45, ease: "power3.in" }).to(on, { clipPath: OUT2, duration: 0.45, ease: "power3.out", onComplete: () => gsap.set(on, { clipPath: HIDE }) }); });
  });

  // Section photo slider (swiper 4.2.2): 0.9s, loop, 1px gap, hand drag nearly disabled (touchRatio .01), advanced with buttons.
  if (window.Swiper) {
    document.querySelectorAll(".js-swpr-section").forEach((el) => {
      new Swiper(el, { speed: reduce ? 0 : 900, loop: true, spaceBetween: 1, touchRatio: 0.01, grabCursor: true, navigation: { nextEl: el.querySelector(".swpr-next"), prevEl: el.querySelector(".swpr-prev") } });
    });
  }

  // Subpage header ripples (jquery.ripples): wide and shallow on PC (radius 100·.001), narrow and deep on phone (50·.01)
  if (window.jQuery && jQuery.fn.ripples && !reduce) {
    const sp = matchMedia("screen and (max-width: 768px)").matches;
    addEventListener("load", () => {
      try { jQuery(".js-ripples").ripples(sp ? { resolution: 100, dropRadius: 50, perturbance: 0.01 } : { resolution: 100, dropRadius: 100, perturbance: 0.001 }); } catch (e) { /* Devices without WebGL fall back to a still photo */ }
    });
  }
})();
