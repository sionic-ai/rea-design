// Common to all pages: draw in the header nav and footer, and hook up black-bar titles, blur reveal, fade, phone drawer menu and anchor scroll.
// Original values: bar titles fire once at 80% from the top · blur turns on when 50px above the element reaches the screen bottom and turns off when it leaves upward (replays when seen again)
//            Anchor scroll .5s swing · phone drawer .6s
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SW = (window.SW = { reduced });

  const word = (txt = "W", rest = "RDMARK") => `<span class="sw-word">${txt}<i class="dot"></i>${rest}</span>`;
  SW.word = word;
  const nav = [["TOP", "index.html", "home"], ["ABOUT", "about.html", "about"], ["STORIES", "works.html", "works"], ["COLUMN", "news.html", "news article"], ["CONTACT", "#contact", ""]];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sw-header");
    head.innerHTML = `
      <a class="logo" href="index.html" aria-label="Back to start">${word("W", "rdmark")}<small>Your one-line intro here</small></a>
      <nav class="sw-nav" aria-label="Main menu"><ul>${nav.map(([l, h, p]) => `<li><a href="${h}" class="${p.split(" ").includes(page) ? "is-current" : ""}">${l}</a></li>`).join("")}</ul></nav>
      <button class="sw-burger" type="button" aria-label="Open Menu"><span class="con"><i></i><i></i></span></button>`;
    head.insertAdjacentHTML("afterend", '<div class="sw-veil"></div>');
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sw-footer");
    foot.id = "contact";
    const arrow = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 5h8M6 2l3 3-3 3"/></svg>';
    foot.innerHTML = `<div class="inner">
      <ul class="cta">
        <li class="col2"><a href="#"><p class="cta__ttl">CONTACT</p><p class="txt">One line here for those who want to commission work or ask questions,<br>Add a line saying please feel free to get in touch.</p><span class="arrow">${arrow}</span></a></li>
        <li><a href="#"><span class="ico"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="24" height="24" rx="7"/><circle cx="15" cy="15" r="5.5"/><circle cx="22" cy="8" r="1" fill="currentColor"/></svg></span><p class="cta__ttl--sub">SNS 1</p></a></li>
        <li><a href="#"><span class="ico"><svg viewBox="0 0 40 30" fill="currentColor"><rect x="1" y="3" width="38" height="24" rx="7"/><path d="M16 9v12l10-6Z" fill="var(--kf-raised)"/></svg></span><p class="cta__ttl--sub">SNS 2</p></a></li>
      </ul>
      <a class="logo" href="index.html">${word("W", "rdmark")}<small>Your one-line intro here</small></a>
      <ul class="nav">${nav.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul>
      <ul class="nav--sub"><li><a href="#">Operating company</a></li><li><a href="#">Privacy policy</a></li></ul>
      <p class="copyright">©2026 wordmark</p>
    </div>`;
  }

  // Phone drawer
  const burger = document.querySelector(".sw-burger");
  const drawer = document.querySelector(".sw-nav");
  const veil = document.querySelector(".sw-veil");
  const setMenu = (open) => {
    burger.classList.toggle("is-open", open);
    drawer.classList.toggle("is-open", open);
    veil.classList.toggle("is-open", open);
    document.body.classList.toggle("is-fixed", open);
  };
  burger?.addEventListener("click", () => setMenu(!drawer.classList.contains("is-open")));
  veil?.addEventListener("click", () => setMenu(false));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Anchor scroll — the same jQuery animate as the original (.5s swing). Links that remodal opens are handled by remodal
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-remodal-target")) return;
    e.preventDefault();
    const t = a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href"));
    if (!t) return;
    const top = t.getBoundingClientRect().top + scrollY;
    if (window.jQuery && !reduced) jQuery("html, body").animate({ scrollTop: top }, 500, "swing");
    else window.scrollTo(0, top);
  });

  // Entrance — with reduced motion, everything is on from the start
  const blurs = document.querySelectorAll(".blurTrigger");
  const fades = document.querySelectorAll(".fade-in, .fade-up");
  const masks = document.querySelectorAll(".js-anim");
  if (reduced) {
    blurs.forEach((el) => el.classList.add("blur"));
    fades.forEach((el) => el.classList.add("is-in"));
    masks.forEach((el) => el.classList.add("is-anim"));
    return;
  }
  const check = () => {
    const bottom = scrollY + innerHeight;
    blurs.forEach((el) => {
      const top = el.getBoundingClientRect().top + scrollY - 50;
      el.classList.toggle("blur", bottom >= top);
    });
    fades.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      if (bottom >= el.getBoundingClientRect().top + scrollY - 50) el.classList.add("is-in");
    });
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("load", check);
  // Turn on after the first paint — so the 1 second entrance is not half over while the skin’s font loading blocks the first paint
  requestAnimationFrame(() => requestAnimationFrame(check));
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    masks.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-anim") }));
  });
})();
