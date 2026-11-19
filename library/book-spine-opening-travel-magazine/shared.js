// Common to all pages: draws in the news strip · header line · menu curtain · bottom fixed button · stickers · shop/newsletter · footer, and hooks up the flowing line · menu · stickers
// Original values: flowing line one chunk per 30 seconds (only while visible) · menu curtain .25s · sticker close .45s · page change uses page-veil (white veil covers .18s · lifts .35s).
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TR = (window.TR = { reduced });
  const icon = {
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6.8" cy="6.8" r="5.3"/><path d="m10.8 10.8 4 4"/></svg>',
    x: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m1 1 8 8M9 1 1 9"/></svg>'
  };
  TR.icon = icon;
  const loop = (cls, inner, n = 2, speed) => `<div class="tr-loop ${cls}" data-loop${speed ? ` style="--loop-dur:${speed}ms"` : ""}>${Array.from({ length: n }, () => `<div class="tr-loop__block">${inner}</div>`).join("")}</div>`;
  TR.loop = loop;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "tr-head";
    // As in the original, the pressed area (full-band link) stands still and only the text line inside flows
    const tick = Array.from({ length: 4 }, (_, i) => `<span class="tr-ticker__item"><i></i>Your latest news line $ here{i + 1} — magazine releases, podcasts, event notices</span>`).join("");
    head.innerHTML = `
      <div class="tr-ticker" data-slot="top-ticker"><a class="tr-ticker__btn" href="news.html">${loop("", tick)}</a></div>
      <div class="tr-bar">
        <a class="tr-search" href="news.html" aria-label="Find">${icon.search}</a>
        <a class="tr-logo tr-mag" href="index.html" lang="en" data-label="Magazine name wordmark">TRAVEL</a>
        <div class="tr-bar__right"><a class="tr-store-link" href="product.html" lang="en"><span class="tr-crop" data-text="ONLINE STORE"><span class="tr-crop__in">ONLINE STORE</span></span></a><button class="tr-burger" type="button" aria-label="Menu" data-menu><i></i><i></i></button></div>
      </div>`;
    const col = (h, items) => `<div class="tr-menu__col"><p class="tr-menu__h" lang="en">${h}</p><ul class="tr-menu__list">${items.map(([t, u]) => `<li><a href="${u}" data-hover><span class="tr-line">${t}</span></a></li>`).join("")}</ul></div>`;
    document.body.insertAdjacentHTML("beforeend", `
      <nav class="tr-menu" data-slot="menu" aria-label="Menu">
        <div class="tr-menu__col"><a class="tr-menu__big tr-mag" href="news.html" lang="en" data-hover><span class="tr-line is-mag">WHERE TO GO</span></a><a class="tr-menu__big tr-mag" href="news.html" lang="en" data-hover><span class="tr-line is-mag">WHAT TO DO</span></a></div>
        ${col("ARTICLES", [["Entire", "news.html"], ["Feature", "news.html"], ["What's?", "news.html"], ["What’s Today?", "news.html"], ["Category", "news.html"], ["Magazines · Books", "product.html"]])}
        ${col("INFORMATION", [["Subscription", "product.html"], ["Reader survey", "page.html"], ["Job info", "page.html"], ["ABOUT US", "about.html"], ["Bookstore Guide", "page.html"], ["Ad Guide", "page.html"], ["Operating company", "about.html"], ["Inquiry", "page.html"]])}
      </nav>
      <div class="tr-dock" data-slot="fixed-dock"><div class="tr-dock__pills"><a class="tr-dock__pill" href="news.html"><b lang="en">WHERE TO GO</b><span>Where to?</span></a><a class="tr-dock__pill" href="news.html"><b lang="en">WHAT TO DO</b><span>What?</span></a></div></div>
      <aside class="tr-sticker" data-slot="sticker-promo"><span class="wf-img" data-label="Sticker Bundle Photo"></span><p>Your subscription notice, one line here<br>Your limited gift line here</p><button class="tr-sticker__x" type="button" aria-label="Close" data-sticker-x>${icon.x}</button></aside>`);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const lst = (items) => `<ul class="tr-foot__list">${items.map((t) => `<li><a href="page.html" data-hover><span class="tr-line">${t}</span></a></li>`).join("")}</ul>`;
    foot.outerHTML = `
      <div class="tr-bottom" data-slot="store-newsletter">
        <section class="tr-store">
          <h2 class="tr-h tr-store__head"><span class="tr-h__t" lang="en">TRAVEL STORE</span><span class="tr-h__s">Your shop subtitle here</span></h2>
          <div class="tr-store__row"><span class="wf-img" data-label="Goods T-shirt cutout · white background"></span><span class="wf-img" data-label="Magazine cover · Mountain and field photo"></span><span class="wf-img" data-label="Magazine cover · Market photo"></span></div>
          <a class="tr-store__link" href="product.html" data-hover><span class="tr-line">Explore the Shop</span><span>→</span></a>
        </section>
        <section class="tr-news" data-slot="newsletter">
          <span class="wf-img" data-label="Photo of a group of travelers sitting in a field · clear daytime · landscape"></span>
          <div class="tr-news__in"><h2 class="tr-h"><span class="tr-h__t" lang="en">NEWSLETTERS</span><span class="tr-h__s">Your newsletter note here</span></h2>
            <form class="tr-news__form" onsubmit="return false"><input type="email" placeholder="Please enter your email address" aria-label="Email address"><button type="submit" lang="en">Sign Up</button></form></div>
        </section>
      </div>
      <div class="tr-bigloop" aria-hidden="true">${loop("", '<span class="tr-bigloop__item" lang="en">TRAVEL</span><span class="tr-bigloop__item" lang="en">TRAVEL</span><span class="tr-bigloop__item" lang="en">TRAVEL</span>', 2, 20000)}</div>
      <footer class="tr-foot" data-slot="footer">
        <div class="tr-foot__cols">
          <div><p class="tr-foot__h" lang="en">ARTICLES</p>${lst(["Entire", "Category", "Feature", "Magazines · Books", "What's?", "Teamwork", "What’s Today?"])}</div>
          <div><p class="tr-foot__h" lang="en">INFORMATION</p>${lst(["Subscription", "Bookstore Guide", "Reader survey", "Ad Guide", "Job info", "Operating company", "ABOUT US", "Inquiry"])}</div>
        </div>
        <div class="tr-collage" data-label="Travel collage — house, bicycle and people illustrations with photo pieces">
          <svg style="left:2%;top:30%;width:28%" viewBox="0 0 120 90" aria-hidden="true"><path d="M8 52 60 14l52 38v30H8Z" fill="var(--site-c2)"/><path d="M28 82V56h22v26" fill="var(--kf-bg)"/><path d="M70 50h22v16H70Z" fill="var(--site-c4)"/></svg>
          <span class="wf-img" style="left:34%;top:4%;width:22%;height:28%;transform:rotate(-8deg)" data-label="Lake scenery photo piece"></span>
          <span class="wf-img" style="left:58%;top:30%;width:20%;height:24%;transform:rotate(12deg)" data-label="Food photo piece"></span>
          <svg style="left:46%;top:56%;width:26%" viewBox="0 0 120 120" aria-hidden="true"><circle cx="34" cy="86" r="22" fill="none" stroke="var(--kf-ink)" stroke-width="5"/><circle cx="92" cy="86" r="22" fill="none" stroke="var(--kf-ink)" stroke-width="5"/><path d="M34 86 58 46h30l4 40M58 46l-6-14h-10" fill="none" stroke="var(--site-c1)" stroke-width="5"/></svg>
          <svg style="left:78%;top:8%;width:20%" viewBox="0 0 80 140" aria-hidden="true"><circle cx="40" cy="22" r="14" fill="var(--site-c3)"/><path d="M18 60c0-14 10-22 22-22s22 8 22 22v40H18Z" fill="var(--site-c1)"/><path d="M24 100v34M56 100v34" stroke="var(--kf-ink)" stroke-width="6"/></svg>
        </div>
        <p class="tr-foot__copy"><span>© 0000 publisher name</span><a href="page.html">Privacy Policy</a></p>
      </footer>`;
  }

  // ── Flowing line: runs when it enters the screen (original fInview infinite) ──
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)), { threshold: 0 });
  document.querySelectorAll("[data-loop]").forEach((el) => io.observe(el));

  // ── Menu curtain .25s, sticker close ──
  const menu = document.querySelector(".tr-menu");
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu]")) {
      const on = !document.body.classList.contains("is-menu");
      document.body.classList.toggle("is-menu", on);
      document.body.classList.toggle("is-locked", on);
      gsap.to(menu, { autoAlpha: on ? 1 : 0, duration: reduced ? 0 : 0.25, ease: "power1.out" });
    }
    if (e.target.closest("[data-sticker-x]")) e.target.closest(".tr-sticker").classList.add("is-closed");
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("is-menu")) document.querySelector("[data-menu]").click(); });

  // Cards attached by ”Load more” fall from 6rem above and settle in .6s
  TR.loadIn = (els) => els.forEach((el, i) => setTimeout(() => el.classList.add("is-in"), i * 60));
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll("[data-load-in]").forEach((el) => obs.observe(el));

  // ── Load more: append four more cards and settle them from 6rem above in .6s ──
  document.querySelectorAll("[data-more]").forEach((btn) => btn.addEventListener("click", () => {
    const grid = btn.previousElementSibling;
    const add = [...grid.children].slice(0, 4).map((c) => { const n = c.cloneNode(true); n.setAttribute("data-load-in", ""); n.classList.remove("is-in"); grid.append(n); return n; });
    TR.loadIn(add);
  }));
})();
