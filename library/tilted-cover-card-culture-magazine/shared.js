// Set up here so every page shares the same header, drawer and footer.
(() => {
  const LOGO = '<svg viewBox="0 0 220 80" aria-hidden="true"><text x="0" y="54" font-size="62" class="bm-logo__word">Sample</text><text x="150" y="74" font-size="13" class="bm-logo__sub">magazine</text></svg>';
  const SNS = ["Photo SNS", "Short-text SNS", "Video SNS", "Messenger"];
  const ICON = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="4"/></svg>';
  const home = document.body.dataset.page === "home";

  const head = document.querySelector('header[data-slot="header"]');
  if (head) {
    head.className = "bm-head";
    head.innerHTML = `<a class="bm-logo${home ? " is-large" : ""}" id="bm-logo" href="index.html" aria-label="Home">${LOGO}</a>
      <button class="bm-menu-btn" type="button" aria-expanded="false" aria-controls="bm-drawer"><span><i></i><i></i><i></i></span><span class="bm-menu-btn__t bm-en">MENU</span></button>`;
    document.body.insertAdjacentHTML("beforeend", `<div class="bm-drawer" id="bm-drawer" aria-hidden="true" data-slot="menu-drawer">
      <div class="bm-drawer__main">
        <div class="bm-drawer__top">
          <label class="bm-drawer__search"><input type="search" placeholder="Search by word"></label>
          <nav class="bm-drawer__tags">${["Art", "Culture", "Things to do", "Fashion", "Food", "Music"].map((t) => `<a href="news.html">${t}</a>`).join("")}</nav>
          <nav class="bm-drawer__pages"><a href="news.html" class="bm-en">ARTICLE</a><a href="series.html" class="bm-en">SERIES</a><a href="article.html" class="bm-en">FEATURE</a><a href="news.html" class="bm-en">AUTHOR</a></nav>
        </div>
        <div class="bm-drawer__middle">
          <div class="bm-foot__sns">${SNS.map((t) => `<a class="bm-sns" href="https://example.com/" target="_blank" rel="noopener" aria-label="${t}">${ICON}</a>`).join("")}</div>
          <form class="bm-drawer__letter" onsubmit="return false"><p>Your magazine name here<br>We send out a newsletter</p><span><input type="email" placeholder="Email address"><button type="submit">Subscription</button></span></form>
        </div>
      </div>
      <div class="bm-drawer__bottom"><span class="bm-drawer__mark">S</span><nav><a href="#">About the magazine</a><a href="#">Terms of service</a><a href="#">Operating company</a><a href="#">Advertising Contact</a><a href="#">Privacy policy</a><a href="#">Inquiry</a></nav></div>
    </div>`);
  }
  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot) {
    foot.className = "bm-foot";
    foot.innerHTML = `<div class="bm-foot__sns">${SNS.map((t) => `<a class="bm-sns" href="https://example.com/" target="_blank" rel="noopener" aria-label="${t}">${ICON}</a>`).join("")}</div>
      <a class="bm-foot__logo" href="index.html" aria-label="Home">${LOGO}</a>
      <p class="bm-en">Copyright © Sample. All Rights Reserved.</p>`;
  }

  // Original os: scrollY only on the first page < At 146, large wordmark
  const logo = document.getElementById("bm-logo");
  if (home && logo) {
    const big = () => logo.classList.toggle("is-large", scrollY < 146);
    addEventListener("scroll", big, { passive: true });
    big();
  }

  // Original rs: add is-visible, then is-open on the next frame — to close, remove is-open and hide after 600ms
  const btn = document.querySelector(".bm-menu-btn"), drawer = document.getElementById("bm-drawer");
  let open = false, t = 0;
  const set = (v) => {
    open = v; clearTimeout(t);
    btn.classList.toggle("is-open", v);
    btn.setAttribute("aria-expanded", String(v));
    drawer.setAttribute("aria-hidden", String(!v));
    logo?.classList.toggle("is-hidden", v);
    btn.querySelector(".bm-menu-btn__t").textContent = v ? "CLOSE" : "MENU";
    document.body.style.overflow = v ? "hidden" : "";
    if (v) { drawer.classList.add("is-visible"); requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add("is-open"))); }
    else { drawer.classList.remove("is-open"); t = setTimeout(() => drawer.classList.remove("is-visible"), 600); }
  };
  btn?.addEventListener("click", () => set(!open));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
})();
