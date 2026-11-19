// Set up here once so every page uses the same header row·menu drawer·search drawer·bottom strip.
(() => {
  const ICON = {
    mail: '<svg viewBox="0 0 30 30"><rect x="3" y="7" width="24" height="16" rx="1"/><path d="M3 8l12 9 12-9M3 22l9-7M27 22l-9-7"/></svg>',
    cam: '<svg viewBox="0 0 30 30"><rect x="4" y="4" width="22" height="22" rx="7"/><circle cx="15" cy="15" r="5"/><circle cx="21.5" cy="8.5" r="1"/></svg>',
    talk: '<svg viewBox="0 0 30 30"><rect x="4" y="4" width="22" height="22" rx="7"/><path d="M9 13c0-3 3-5 6-5s6 2 6 5-3 5-6 5l-3 2v-2.5C10 16.5 9 15 9 13z"/></svg>',
    lens: '<svg viewBox="0 0 34 34"><circle cx="14" cy="14" r="10"/><path d="M21.5 21.5L31 31"/></svg>',
  };
  const PAGES = [
    ["index.html", "Home"], ["about.html", "Company About"], ["service.html", "Managed Service"], ["production.html", "Production consultation"], ["news.html", "Space Guide"], ["contact.html", "Inquiry"],
  ];
  const sns = `<ul class="hy-sns"><li><a href="contact.html" aria-label="Mail">${ICON.mail}</a></li><li><a href="#" aria-label="Photo SNS">${ICON.cam}</a></li><li><a href="#" aria-label="Messenger">${ICON.talk}</a></li></ul>`;

  const head = document.querySelector('header[data-slot="header"]');
  if (head) {
    head.className = "hy-head";
    head.innerHTML = `<div class="hy-head__in">
      <button class="hy-burger" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
      <nav class="hy-nav" aria-label="Site Menu"><ul>
        ${PAGES.slice(0, 5).map(([href, t]) => `<li><a href="${href}">${t}</a></li>`).join("")}
        <li><span>Find a Space</span><ol><li><a href="news.html">Search in a region</a></li><li><a href="news.html">Find by category</a></li><li><a href="detail.html">View one space</a></li></ol></li>
        <li><a href="contact.html">Inquiry</a></li>
      </ul>${sns}</nav>
      <a class="hy-head__logo" href="index.html" aria-label="Home">SAMPLE</a>
      ${sns}
    </div>`;
    document.body.insertAdjacentHTML("beforeend", `<button class="hy-search-btn" type="button" aria-label="Space Search">${ICON.lens}</button>
    <div class="hy-search" data-slot="search-drawer"><div class="hy-search__in">
      <button class="hy-search__close" type="button" aria-label="Close"></button>
      <input type="search" placeholder="Search by word">
      ${["Area", "Category", "Purpose", "Area", "Fee", "Headcount", "Equipment", "Atmosphere"].map((t) => `<div class="hy-search__box"><button type="button">${t}Choose from</button><div class="hy-search__opts"><div>${"<span>View 00</span>".repeat(6)}</div></div></div>`).join("")}
      <button class="hy-search__submit" type="button">Find</button>
    </div></div>`);
  }
  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot) {
    foot.className = "hy-foot";
    foot.innerHTML = `<p>Copyright ©SAMPLE All rights reserved.</p><ul><li><a href="about.html">Company overview</a></li><li><a href="#">Space Owner Terms</a></li><li><a href="#">User terms</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Transaction Notation</a></li><li><a href="contact.html">Inquiry</a></li></ul>`;
  }

  // Original $e: below 300px it is on (white band · small logo), and while scrolling down it hides — hiding is left to the hide-on-scroll part and is not attached on phones (767 and below)
  const burger = document.querySelector(".hy-burger"), nav = document.querySelector(".hy-nav");
  const sBtn = document.querySelector(".hy-search-btn"), sBox = document.querySelector(".hy-search");
  const wide = matchMedia("(min-width: 768px)");
  const setHide = () => {
    if (!head) return;
    if (wide.matches) { head.dataset.fx = "hide-on-scroll"; head.dataset.fxHideOnScroll = "delay: 0; offset: 0; look: slide"; }
    else { delete head.dataset.fx; delete head.dataset.fxHideOnScroll; }
  };
  setHide();
  wide.addEventListener("change", setHide);
  const onScroll = () => {
    head?.classList.toggle("is-on", scrollY > 300);
    if (wide.matches && scrollY > 100 && nav?.classList.contains("is-on")) { nav.classList.remove("is-on"); burger.classList.remove("is-on"); }
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  burger?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-on");
    nav.classList.toggle("is-on", open); burger.classList.toggle("is-on", open);
    if (open) { sBox.classList.remove("is-on"); }
  });
  const closeSearch = () => { sBox.classList.remove("is-on"); setTimeout(() => sBox.querySelectorAll(".hy-search__box").forEach((b) => b.classList.remove("is-open")), 100); };
  sBtn?.addEventListener("click", () => {
    if (sBox.classList.contains("is-on")) return closeSearch();
    sBox.classList.add("is-on");
    sBox.querySelector("input").focus({ preventScroll: true });
  });
  sBox?.querySelector(".hy-search__close").addEventListener("click", closeSearch);
  sBox?.querySelectorAll(".hy-search__box > button").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));

  document.querySelectorAll(".hy-faq dt button").forEach((b) => b.addEventListener("click", () => {
    const dt = b.parentElement, dd = dt.nextElementSibling;
    dt.classList.toggle("is-open"); dd?.classList.toggle("is-open");
  }));

  // Original Swiper 11.2.10 common values: 900ms move, 4 second autoplay, loop. Reduced motion turns autoplay off
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.hySwiper = (el, opts = {}) => {
    if (!el || typeof Swiper === "undefined") return null;
    const base = { slidesPerView: 1, spaceBetween: 0, speed: 900, loop: true, autoplay: still ? false : { delay: 4000, disableOnInteraction: false } };
    return new Swiper(el, { ...base, ...opts, ...(still ? { autoplay: false, speed: 0 } : {}) });
  };
})();
