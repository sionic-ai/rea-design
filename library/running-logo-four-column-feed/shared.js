// Shared by the whole brand-co set — fills the header · phone menu · footer in the same form per section, and loads card videos when near and plays them when visible, like the original player.
// Original is a single-page Framer app so there is no transition curtain (click → new section after 161ms in 33ms) — so it uses plain links with no transition effect
(() => {
  const page = document.body.dataset.page || "home";
  const RUN = (cls = "") => `<svg class="${cls}" viewBox="0 0 94 43" aria-hidden="true"><path d="M64.0 18.1L63.5 19.4L62.0 20.7L59.7 21.7L56.6 22.5L53.0 23.0L48.9 23.2L44.7 23.1L40.5 22.7L36.5 22.0L32.9 21.1L30.0 19.9L27.8 18.6L26.5 17.2L26.1 15.8L26.7 14.4L28.1 13.2L30.5 12.2L33.5 11.4L37.2 10.9L41.2 10.6L45.4 10.8L49.7 11.2L53.6 11.9L57.2 12.8L60.1 14.0L62.3 15.3L63.6 16.7ZM58.2 15.7L70.7 7.5L74.4 11.7L62.8 22.0ZM83.7 11.6L83.3 12.3L82.6 12.8L81.5 13.1L80.2 13.3L78.8 13.3L77.2 13.0L75.6 12.6L74.0 12.0L72.6 11.3L71.3 10.5L70.4 9.6L69.7 8.7L69.4 7.9L69.4 7.1L69.8 6.4L70.6 5.9L71.6 5.6L72.9 5.4L74.4 5.5L76.0 5.7L77.6 6.1L79.2 6.7L80.6 7.4L81.8 8.2L82.8 9.1L83.5 10.0L83.8 10.8ZM70.8 5.5L74.0 1.7L74.7 6.7Z" fill="currentColor"/><path d="M27.2 13.8L20.4 10.4L14.4 10.1L9.5 8.8M60.8 20.9L60.3 30.4L64.5 38.3M57.9 20.7L62.7 28.9L70.2 34.0M32.9 19.2L29.2 28.0L21.9 33.1M29.9 19.0L24.2 26.6L18.8 33.8" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ARROW = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
  window.bruno = { RUN, ARROW };

  const nav = [
    ["index.html", "Work", "home"],
    ["service.html", "Service", "service"],
    ["service-detail.html", "About", "service-detail"],
    ["detail.html", "Hiring", "detail"],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "b-head";
    head.setAttribute("data-fx", "hide-on-scroll");
    head.setAttribute("data-fx-hide-on-scroll", "look: slide; offset: 0; step: 4; delay: 0");
    const swap = page === "home" ? "target: [data-nav-target]; at: 0" : "state: logo";
    head.innerHTML = `
      <nav class="b-head__nav" aria-label="Main menu">${nav.map(([h, t, p]) => `<a href="${h}"${p === page ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
      <button class="b-pill b-head__menu" type="button" aria-expanded="false" data-menu-open>Menu</button>
      <a class="b-head__mid" href="index.html" data-fx="phrase-logo-swap" data-fx-phrase-logo-swap="${swap}">
        <span data-fx-part="phrase">One line on the origin of the name here.<br>Describe what you do here in one line today.</span>
        <span data-fx-part="logo">${RUN()}</span>
      </a>
      <a class="b-head__contact" href="detail.html">Inquiry</a>`;
  }

  const offices = () => `
    <div class="b-offices" data-slot="offices">
      ${[["City 1", "Representative name one", "Your job title here", "Your address first line here,<br>Postal code, City", "+00 0 00 00 00 00", "name@example.com"],
         ["City 2", "Representative name two", "Your job title here", "Your address first line here,<br>City postal code", "+00 0000 000000", "name2@example.com"]]
        .map(([c, n, r, a, p, m]) => `<div class="b-office"><p class="b-office__city">${c}</p><p><a href="#">${n}</a><br>${r}<br>${a}<br>${p}</p><a class="b-pill" href="detail.html">${m}</a></div>`).join("")}
    </div>`;

  const menu = document.createElement("div");
  menu.className = "b-menu";
  menu.setAttribute("data-slot", "mobile-menu");
  menu.setAttribute("aria-hidden", "true");
  menu.innerHTML = `
    <div class="b-menu__top"><button class="b-pill b-menu__close" type="button" aria-label="Close" data-menu-close>×</button><a href="index.html" aria-label="Back to start">${RUN("b-mini")}</a></div>
    <nav class="b-menu__links">${nav.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="detail.html">Inquiry</a></nav>
    ${offices()}`;
  document.body.append(menu);
  const openBtn = document.querySelector("[data-menu-open]");
  const setMenu = (on) => { menu.classList.toggle("is-open", on); menu.setAttribute("aria-hidden", String(!on)); openBtn?.setAttribute("aria-expanded", String(on)); document.documentElement.style.overflow = on ? "hidden" : ""; };
  openBtn?.addEventListener("click", () => setMenu(true));
  menu.querySelector("[data-menu-close]").addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "b-foot";
    const cols = [["Work", "Service", "About"], ["Service 1", "Service 2", "Service 3", "Service 4"], ["Service 5", "Service 6", "Service 7", "Service 8"], ["City 1", "City 2", "City 3", "City 4"], ["Sitemap", "Your side business here"]];
    const href = ["index.html", "service.html", "service-detail.html"];
    foot.innerHTML = `${offices()}
      <div class="b-foot__bar" data-slot="footer-bar">
        <a class="b-word" href="index.html"><span class="b-word__mark">Brand</span><span class="b-word__c">© 2026</span></a>
        <div class="b-foot__cols">${cols.map((c, k) => `<ul>${c.map((t, j) => `<li><a href="${k === 0 ? href[j] : k === 1 || k === 2 ? "service-detail.html" : "#"}">${t}</a></li>`).join("")}</ul>`).join("")}</div>
        <p class="b-foot__social"><span><a href="#">Social 1</a>, </span><span><a href="#">Social 2</a>, </span><span><a href="#">Social 3</a>, </span><span><a href="#">Social 4</a></span></p>
        <p class="b-foot__lang"><a href="#" aria-current="true">KO</a>, <a href="#">EN</a>, <a href="#">JP</a></p>
      </div>`;
  }

  // Card video — original player: loads 1200px ahead (nearLoadOffset) and plays 200px ahead (lazyOffset), pauses when out of range. Loops without sound
  const vids = [...document.querySelectorAll("video[data-src]")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (vids.length) {
    const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !e.target.src) { e.target.src = e.target.dataset.src; near.unobserve(e.target); } }), { rootMargin: "1200px 0px" });
    const play = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !reduce) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    }), { rootMargin: "200px 0px" });
    vids.forEach((v) => { v.muted = true; near.observe(v); play.observe(v); });
  }
})();
