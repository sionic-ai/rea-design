// All pages share the same header, menu panel, notice bar and footer — built into the placeholders [data-site-head] and [data-site-foot]
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const logo = (tag = "a") => `<${tag} class="fi-logo" ${tag === "a" ? 'href="index.html"' : ""} data-label="Brand logo · slanted English wordmark + small single line"><b>Brand-i</b><small>Your brand line here</small></${tag}>`;
  const col = (t, items) => `<div class="fi-nav__col"><p>${t}</p>${items.map(([en, ko, h]) => `<a href="${h || "#"}"><span>${en}</span><span>${ko}</span></a>`).join("")}</div>`;

  // First-visit loader — the original .cmn-loader exists on every page (skipped from the second visit in the same tab)
  if (!document.querySelector("[data-fx~='hue-breath-loader']")) {
    document.body.insertAdjacentHTML("afterbegin", '<div class="fi-loader" data-fx="hue-breath-loader" data-fx-hue-breath-loader="once: 1" data-slot="loader"><div data-fx-part="cont" class="fi-loader__logo" data-label="Logo at loader center · slanted wordmark"><b class="fi-en">Brand-i</b><small>Your brand line here</small></div></div>');
  }

  const head = document.querySelector("[data-site-head]");
  if (head) {
    head.outerHTML = `
<header class="fi-head" data-slot="header">
  <h1>${logo()}</h1>
  <a class="fi-pill fi-fav" href="#" data-label="Favorites button"><svg viewBox="0 0 16 15" aria-hidden="true"><path d="M8 15 1.2 8.2A4 4 0 0 1 8 2.6a4 4 0 0 1 6.8 5.6z"/></svg><span><span>Favorites</span><span>Browse all</span></span></a>
  <a class="fi-pill fi-menu" href="#" role="button" aria-expanded="false" aria-controls="fi-nav"><span>Menu</span><i aria-hidden="true"><b></b><b></b><b></b></i></a>
</header>
<nav class="fi-nav" id="fi-nav" data-slot="menu-panel" aria-label="Menu">
  <div class="fi-nav__cols">
    ${col("Columns", [["Index", "Post list", "list.html"]])}
    ${col("Funds", [["What is Brand-i?", "About the Brand"], ["Fund List", "Product intro"], ["Fund Ranking", "Ranking"], ["Today's Fund", "Today’s info"], ["Market", "Market Info"]])}
    ${col("Tools", [["Simulation", "Points calculation"], ["Assist", "Investment Helper"], ["Glossary", "Glossary"], ["Q&amp;A", "Frequently asked questions"]])}
    ${col("Other", [["News", "News List"]])}
  </div>
</nav>`;
    const btn = document.querySelector(".fi-menu");
    const set = (on) => { document.body.classList.toggle("is-menu-active", on); btn.classList.toggle("is-on", on); btn.setAttribute("aria-expanded", String(on)); };
    btn.addEventListener("click", (e) => { e.preventDefault(); set(!document.body.classList.contains("is-menu-active")); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  const foot = document.querySelector("[data-site-foot]");
  if (foot) {
    foot.outerHTML = `
<div class="fi-info" data-slot="fund-info">
  <dl><dt>Your product type description title here</dt><dd>Your one line here saying it aims to track an index that reflects the movement of an entire market.</dd></dl>
  <dl><dt>Your product name here <span>(Nickname: Brand-i)</span></dt><dd>Your one line goes here explaining what a product bundle is and what it is called.</dd></dl>
  <dl><dt>Your asset manager name here</dt><dd>Your financial product dealer registration number line here<br>Your member association name line here</dd></dl>
</div>
<footer class="fi-foot" data-slot="footer">
  <p class="fi-foot__top"><a class="fi-pagetop" href="#" aria-label="Back to top" data-pagetop><svg viewBox="0 0 10 7" aria-hidden="true"><path d="M5 0l5 7H0z"/></svg></a></p>
  <div class="fi-foot__in">
    ${logo("p")}
    <nav class="fi-foot__nav" aria-label="Bottom Menu"><a href="page.html">Website policy</a><a href="page.html">Indexes used and copyright</a><a href="page.html">Risks and costs of investment trusts</a></nav>
    <p class="fi-parent" data-label="Management company logo">PARENT LOGO</p>
    <small class="fi-en">COPYRIGHT© COMPANY NAME CO., LTD. ALL RIGHTS RESERVED.</small>
  </div>
</footer>`;
    // Near the very bottom, turns on the sky-blue gradient (original js-end-scroll)
    const f = document.querySelector(".fi-foot");
    const io = new IntersectionObserver(([e]) => f.classList.toggle("is-end", e.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(f);
    // Back to top: 1s expo.inOut (original TweenMax scrollTo)
    document.querySelector("[data-pagetop]")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (reduce || !window.gsap || !window.ScrollToPlugin) { scrollTo(0, 0); return; }
      gsap.registerPlugin(ScrollToPlugin);
      gsap.to(window, { duration: 1, ease: "expo.inOut", scrollTo: { y: 0, autoKill: false } });
    });
  }
})();
