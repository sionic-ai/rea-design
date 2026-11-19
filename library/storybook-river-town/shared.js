/* Spanning several pages — header (wave band · menu · phone hamburger panel), contact band, footer (mountain · water band · blue sitemap), picture-book curtain, unfold on view, back-to-top */
(() => {
  const page = document.body.dataset.page || "home";
  const NAV = [
    { href: "index.html", key: "home", label: "First" },
    { href: "about.html", key: "about", label: "About us", sub: ["Your first About item title here", "Your second topic here", "Your third topic title here"] },
    { href: "service.html", key: "service", label: "The cycle we envision", sub: ["What you do here", "Your case item title here", "Your first business here", "Your business two name here"] },
    { href: "news.html", key: "news", label: "Topics" },
  ];
  const logo = '<span class="nb-logo" data-label="Brand logo (handwritten English wordmark, each letter a different color)"><span>B</span><span>r</span><span>a</span><span>n</span><span>d</span></span>';
  // The original contact goes to a separate contact form (/contact/) — the copy leaves that spot as a mail link
  const contact = (cls) => `<a class="c-link is-fill ${cls}" href="mailto:contact@example.com" data-label="Contact form page link slot"><span>Contact Us</span></a>`;
  // As in the original, the current page’s submenu smoothly scrolls to that section via in-page links (.ss)
  const subs = (n, cls) => (n.sub ? `<ul class="${cls}">${n.sub.map((s, i) => (n.key === page ? `<li><a class="${cls}-link ss" href="#s${i + 1}">${s}</a></li>` : `<li><a class="${cls}-link" href="${n.href}#s${i + 1}">${s}</a></li>`)).join("")}</ul>` : "");

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("header");
    header.innerHTML = `<div class="header__container">
      <div class="header__logo"><a href="index.html">${logo}</a></div>
      <nav class="header__nav" aria-label="Site Menu"><div class="header__nav-inner"><div class="header__nav-content">
        <ul class="header__nav-lists">${NAV.map((n) => `<li class="header__nav-list"><a class="header__nav-link" href="${n.href}"${n.key === page ? ' aria-current="page"' : ""}><svg class="header__nav-img" height="18" aria-hidden="true"><text x="0" y="15">${n.label}</text></svg><span class="header__nav-txt">${n.label}</span></a>${subs(n, "header__subNav")}</li>`).join("")}</ul>
        ${contact("header__nav-contact")}
      </div><div class="header__nav-bg ill" data-ill="town-band" data-label="Village illustration strip under the menu panel"></div></div></nav>
      ${contact("header__contact")}
      <button class="header__btn" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
    </div>`;
    // The original menu is handwritten SVG lettering, so fill changes color on hover — our letters are also svg text, and the width is fitted to the text after the font loads
    const fit = () => header.querySelectorAll(".header__nav-img").forEach((svg) => {
      const t = svg.querySelector("text");
      const w = Math.ceil(t.getComputedTextLength());
      if (w) svg.setAttribute("width", w), svg.setAttribute("viewBox", `0 0 ${w} 18`);
    });
    fit();
    document.fonts && document.fonts.ready.then(fit);
    const btn = header.querySelector(".header__btn");
    let open = false;
    const close = () => { open = false; header.classList.remove("active"); };
    btn.addEventListener("click", () => { open ? close() : ((open = true), header.classList.add("active")); });
    header.querySelectorAll(".header__subNav li").forEach((li) => li.addEventListener("click", close));
  }

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.classList.add("footer");
    footer.innerHTML = `<div class="footer__container">
      <a class="footer__logo" href="index.html">${logo}</a>
      <p class="footer__txt">A line here calling for inquiries!</p>
      ${contact("footer__contact")}
      <div class="footer__inner">
        <div class="footer__band ill" data-ill="footer-band" data-label="Orange mountain ridge and water, two fish leaping — Footer header strip illustration"></div>
        <nav class="footer__nav" aria-label="Sitemap"><ul class="footer__nav-lists">${NAV.map((n) => `<li class="footer__nav-list"><a class="footer__nav-link" href="${n.href}">${n.label}</a>${subs(n, "footer__subNav")}</li>`).join("")}</ul></nav>
        <div class="footer__content">
          <p class="footer__address">Organization name · Department<br>Your address line here 00-00 · TEL 000-00-0000 (main)</p>
          <p class="footer__copyright">© Brand 2025</p>
        </div>
      </div>
    </div>
    <a class="ss footer__pagetop" href="#top">Top</a>
    <picture class="footer__btn js-bookOpen" role="button" tabindex="0" aria-label="Open Picture Book"><span class="nb-dome"><small>Digital picture book</small><b>Your picture book title here</b><em>Read More</em></span></picture>`;
  }

  // Picture book curtain — like the original, each open puts a fresh picture book iframe inside the blue curtain and clears it on receiving a ‹close› message from inside
  const book = document.createElement("div");
  book.className = "book";
  book.dataset.slot = "book-modal";
  document.body.append(book);
  const bookDoc = '<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="../../_shared/wire.css"><link rel="stylesheet" href="theme.css"><link rel="stylesheet" href="shared.css"></head><body class="book__doc"><div class="book__page"><div><p class="nb-display">Your picture book opening page here</p><p>Your picture book text goes here. Turn sections with the next button.</p></div></div><button class="book__close" type="button" aria-label="Close" onclick="parent.postMessage(\'close\', \'*\')">×</button></body></html>';
  const html = document.documentElement;
  const openBook = (e) => {
    e.preventDefault();
    book.classList.add("visible");
    book.innerHTML = `<iframe class="book__frame" title="Picture book" srcdoc="${bookDoc.replace(/"/g, "&quot;")}"></iframe>`;
    html.classList.add("bookOpen");
  };
  const closeBook = () => { book.classList.remove("visible"); book.innerHTML = ""; html.classList.remove("bookOpen"); };
  document.querySelectorAll(".js-bookOpen").forEach((el) => {
    el.addEventListener("click", openBook);
    el.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && openBook(e));
  });
  addEventListener("message", (e) => e.data === "close" && closeBook());
  addEventListener("keydown", (e) => e.key === "Escape" && closeBook());

  if (window.NB_ILL) NB_ILL.paint();

  // Unfold on view — original c-up·c-up02: once when inside the band minus 20% top and bottom of the screen. List cells are delayed by 0.1s each
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const watch = (el) => {
    if (reduce) { el.classList.add("active"); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("active"); io.unobserve(el); } }), { rootMargin: "-20% 0% -20% 0%" });
    io.observe(el);
  };
  document.querySelectorAll(".c-up, .c-up02").forEach(watch);
  document.querySelectorAll(".c-up02").forEach((list) => list.querySelectorAll(".c-up__list").forEach((el, i) => (el.style.transitionDelay = `${0.1 * (i + 1)}s`)));
  window.NB_WATCH = watch;

  // Scroll-to-top and in-page links — the original rolls its own 500ms easeOutQuart
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  document.querySelectorAll(".ss").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const id = a.getAttribute("href");
    const el = id === "#top" ? document.body : document.querySelector(id);
    if (!el) return;
    const from = scrollY, to = Math.max(0, id === "#top" ? 0 : el.getBoundingClientRect().top + scrollY), t0 = performance.now();
    if (reduce) return scrollTo(0, to);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 500);
      scrollTo(0, from + (to - from) * easeOutQuart(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }));
})();
