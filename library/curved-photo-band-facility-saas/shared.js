// Shared by all pages — a white tab header cut into a gray panel (sticks as a white band on scroll, .3s), a drawer where a dark ink panel unfolds from the top left when the hamburger is pressed (.4s),
// Right-side AI consultation side column (the original is an external widget — only stands when html.has-dock, narrowing the body by 320px), gray panel footer
const HC = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ICO = {
    mark: '<svg viewBox="0 0 30 30" aria-hidden="true"><path d="M3 4h7v9.5L20 6l7 5v15h-7V14.5L10 22H3z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 2h4.6l11.4 16h-4.6zM17.4 2 11.2 9M8.8 11 2.6 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    insta: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="14.6" cy="5.4" r="1" fill="currentColor"/></svg>',
    yt: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1" y="4" width="18" height="12.5" rx="3.5" fill="currentColor"/><path d="M8.2 7.4v5.6l4.8-2.8z" class="hc-ico-cut"/></svg>',
    fb: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M11 18v-6.5h2.2l.4-2.5H11V7.6c0-.8.3-1.3 1.4-1.3h1.3V4.1c-.3 0-1-.1-1.9-.1-2 0-3.3 1.2-3.3 3.4V9H6.4v2.5h2.1V18" class="hc-ico-cut"/></svg>',
  };
  const logo = (cls, size = "") => `<a class="${cls}" href="index.html" data-label="Service logo (symbol + English name)">${ICO.mark}<span${size}>service</span></a>`;
  const INDUSTRY = ["Multi-Sport Club", "24-hour luggage", "Personal gym", "Yoga · Pilates", "Indoor Golf", "Public facilities", "Club activities", "Guesthouse", "Other wellness facilities"];
  const SCHOOL = ["Gymnastics · Fitness School", "Dance School", "Soccer & basketball classes", "Language and study classes"];

  // ---------- Head ----------
  const header = document.createElement("header");
  header.className = "hc-header";
  header.setAttribute("data-slot", "header");
  header.innerHTML = `<div class="hc-header__inner">
      <div class="hc-header__menu"><i class="hc-corner is-tr"></i><i class="hc-corner is-bl"></i>
        <button class="hc-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
        <nav class="hc-drawer" data-slot="menu-drawer" aria-label="Full menu">
          <p class="hc-drawer__logo">${ICO.mark} service</p>
          <ul class="hc-drawer__list">
            <li><a href="features.html">Function</a></li>
            <li><a href="cases.html">Adoption cases</a></li>
            <li><button type="button" aria-expanded="false">Uses by industry</button><div class="hc-drawer__sub">${INDUSTRY.slice(0, 5).map((t) => `<a href="#">${t}<small>Your short description here</small></a>`).join("")}</div></li>
            <li><a href="#">Pricing Plan</a></li>
            <li><a href="about.html">About the service</a></li>
          </ul>
          <div class="hc-drawer__cv"><a class="hc-btn is-line" href="#">View Resources & Demo</a><a class="hc-btn is-gray" href="#">Contact Us</a></div>
        </nav>
      </div>
      <nav class="hc-header__nav" aria-label="Main menu">
        ${logo("hc-header__logo")}
        <ul class="hc-nav"><li><a href="features.html">Function</a></li><li><a href="cases.html">Adoption cases</a></li><li class="has-drop"><a class="is-drop" href="#" role="button" aria-expanded="false">Uses by industry</a><div class="hc-nav__sub">${INDUSTRY.map((t) => `<a href="#">${t}</a>`).join("")}<a href="#">View all</a></div></li><li><a href="#">Pricing Plan</a></li><li><a href="about.html">About the service</a></li></ul>
      </nav>
      <div class="hc-header__cv"><i class="hc-corner is-tl"></i><i class="hc-corner is-br"></i>
        <a class="hc-btn" href="#">View Resources & Demo</a><a class="hc-btn" href="#">Contact Us</a>
      </div>
      ${logo("hc-header__splogo")}
    </div>`;
  document.body.prepend(header);
  const burger = header.querySelector(".hc-burger"), drawer = header.querySelector(".hc-drawer");
  // After building the panel, draw one frame and then add is-shown — if added together, the top margin has no transition and jumps to the end value
  const setOpen = (open) => {
    burger.classList.toggle("is-open", open);
    drawer.classList.toggle("is-open", open);
    if (open) { void drawer.offsetWidth; drawer.classList.add("is-shown"); } else drawer.classList.remove("is-shown");
    burger.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-menu", open);
  };
  burger.addEventListener("click", () => setOpen(!burger.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  // Sub-lists and header dropdowns inside the drawer — click to open and close
  drawer.querySelectorAll(".hc-drawer__list button").forEach((b) => b.addEventListener("click", () => {
    b.setAttribute("aria-expanded", String(b.parentElement.classList.toggle("is-open")));
  }));
  const drop = header.querySelector(".hc-nav > li.has-drop");
  drop.querySelector("a").addEventListener("click", (e) => { e.preventDefault(); e.currentTarget.setAttribute("aria-expanded", String(drop.classList.toggle("is-open"))); });
  document.addEventListener("click", (e) => { if (!drop.contains(e.target)) drop.classList.remove("is-open"); });
  const onScroll = () => header.classList.toggle("is-fixed", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Right AI chat side panel (the original is an outside chat widget — a placeholder in the same position and width) ----------
  const dock = document.createElement("aside");
  dock.className = "hc-dock";
  dock.setAttribute("data-slot", "chat-dock");
  dock.innerHTML = `<div class="hc-dock__head"><b>Ask AI for advice</b><small>24-hour chat support available</small><button type="button" class="hc-dock__close" aria-label="Close consultation window">×</button></div>
    <div class="hc-dock__body"><p class="hc-dock__msg">For those who want to lighten the load of running a facility. Put three or four lines of guide bubble text here. <a href="cases.html">Adoption cases</a>You can also view it.</p>
      <button type="button" class="hc-dock__chip">I want to know the price</button><button type="button" class="hc-dock__chip">I want to learn about features that reduce operations work</button><button type="button" class="hc-dock__chip">I want to know features that boost sales</button></div>
    <div class="hc-dock__foot"><a class="hc-dock__call" href="#">Call to ask about features</a><label class="hc-dock__input"><input type="text" placeholder="Type a message…" aria-label="Message"><span aria-hidden="true">➤</span></label></div>`;
  document.body.append(dock);
  // The original is also an outside widget that sometimes appears and sometimes doesn’t each time it opens, so the default is collapsed — <html class="has-dock"> Back side stands
  dock.querySelector(".hc-dock__close").addEventListener("click", () => document.documentElement.classList.remove("has-dock"));

  // ---------- Footer ----------
  const footer = document.createElement("footer");
  footer.className = "hc-footer";
  footer.setAttribute("data-slot", "footer");
  footer.innerHTML = `<div class="hc-inner">
      <div class="hc-footer__cta" data-slot="footer-cta">
        <a class="hc-footer__cta-link" href="#"><b>Download materials & demo</b><p>You can download basic service info, screen demos, and adoption results.</p></a>
        <a class="hc-footer__cta-link is-sub" href="#"><b>Contact Us</b><p>Feel free to contact us about services, quotes, or adoption consultations.</p></a>
      </div>
      <div class="hc-footer__main">
        <div class="hc-footer__company">${logo("hc-footer__logo")}<div class="hc-sns"><a href="#" aria-label="X">${ICO.x}</a><a href="#" aria-label="Instagram">${ICO.insta}</a><a href="#" aria-label="YouTube">${ICO.yt}</a><a href="#" aria-label="Facebook">${ICO.fb}</a></div></div>
        <div class="hc-footer__nav">
          <div class="hc-footer__left"><p class="hc-footer__ttl">Uses by industry</p>
            <div class="hc-footer__group"><a href="#">Fitness, public, and wellness facilities</a><ul class="hc-footer__subs">${INDUSTRY.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>
            <div class="hc-footer__group"><a href="#">Various Schools</a><ul class="hc-footer__subs">${SCHOOL.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>
          </div>
          <div class="hc-footer__col"><ul class="hc-footer__list"><li><a href="#">Pricing · Plans</a></li><li><a href="#">Frequently asked questions</a></li><li><a href="features.html">Function</a></li><li><a href="cases.html">Adoption cases</a></li><li><a href="about.html">About the service</a></li><li><a href="#">Seminar info</a></li><li><a href="news.html">News</a></li></ul></div>
          <div class="hc-footer__col"><ul class="hc-footer__list"><li><a href="#">Download materials</a></li><li><a href="#">Contact Us</a></li></ul></div>
        </div>
      </div>
      <div class="hc-footer__bar"><small>© 2026 Company Name, inc.</small><ul><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Use</a></li><li><a href="#">Information security</a></li><li><a href="#">Operating company</a></li><li><a href="#">Related Services</a></li></ul></div>
    </div>`;
  document.body.append(footer);

  // ---------- Arrow — on hover over buttons · cards the arrow slides out to the right fading, then comes in from the left (motion part arrow-cycle-hover look: half, .9s) ----------
  // Attached after document parsing finishes so it also catches buttons the page script creates later
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M12.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const arrows = () => document.querySelectorAll(".hc-btn:not(.hc-use__all), .hc-links__list a, .hc-footer__cta a, .hc-case__prev, .hc-case__next, .hc-fcards a").forEach((a) => {
    if (a.querySelector(":scope > .hc-arrow")) return;
    a.insertAdjacentHTML("beforeend", `<span class="hc-arrow" data-fx="arrow-cycle-hover" data-fx-arrow-cycle-hover="look: half">${ARROW}</span>`);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrows); else queueMicrotask(arrows);

  return { reduce, ICO };
})();
