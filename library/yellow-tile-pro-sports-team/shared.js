// The background, header, drawer, ball cursor and footer shared by all pages are rendered in one place, wiring up header hide, drawer, cursor and section reveal (values straight from the original script.js and app.js).
(() => {
  const STAR = '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4l11 34h36L68 59l11 34-29-21-29 21 11-34L3 38h36z"/></svg>';
  const BALL = '<svg class="ys-ball" viewBox="0 0 100 100" aria-hidden="true"><circle class="a" cx="50" cy="50" r="48"/><path class="b" d="M50 2a48 48 0 0 1 46 34C78 30 60 34 46 46 40 30 42 14 50 2z"/><path class="b" d="M8 74a48 48 0 0 0 52 24C48 86 44 70 46 54 30 64 18 70 8 74z"/><path class="s" d="M50 2c-8 12-10 28-4 44M46 46c14-12 32-16 50-10M46 54c-2 16 2 32 14 44M46 54C32 64 20 70 8 74"/></svg>';
  const SNS = ['<circle cx="12" cy="12" r="5" fill="none" stroke-width="2" stroke="currentColor"/><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke-width="2" stroke="currentColor"/>', '<path d="M4 4l16 16M20 4L4 20" stroke-width="2.4" stroke="currentColor"/>', '<path d="M13 3v12a4 4 0 1 1-4-4M13 3c1 3 3 5 6 5"/>', '<rect x="2" y="5" width="20" height="14" rx="4"/>', '<circle cx="12" cy="12" r="10"/>'];
  const sns = () => `<div class="ys-sns">${SNS.map((p, i) => `<a href="#" aria-label="SNS ${i + 1}"><svg viewBox="0 0 24 24">${p}</svg></a>`).join("")}</div>`;
  const logo = (cls) => `<a class="ys-logo ${cls}" href="index.html" aria-label="Back to start"><small>Region</small><b>TEAM${STAR}NAME</b></a>`;
  const GROUPS = [
    [["Getting to know the team", [["About us", "about.html"], ["Athlete · Staff list"], ["About Partners"], ["Partner Recruitment"], ["Topic", "news.html"], ["Official Merch", "goods.html"], ["Frequently asked questions"], ["Academy enrollment"]]], ["Match info", [["Match schedule & results", "index.html#schedule"]]]],
    [["Fan club", [["About the fan club", "index.html#fanclub"], ["New sign-up"], ["Log in"]]], ["Others", [["Company About"], ["Inquiry"]]]],
  ];
  const links = () => `<div class="ys-links">${GROUPS.map((col) => `<div>${col.map(([t, items]) => `<div class="ys-links__group"><p class="ys-links__title">${STAR}<span>${t}</span></p><ul>${items.map(([n, h]) => `<li><a href="${h || "#"}">${n}</a></li>`).join("")}</ul></div>`).join("")}</div>`).join("")}</div>`;
  const bnrs = () => '<div class="ys-bnrs"><a class="ys-bnr" href="#"><b>TICKET</b><span>Buy ticket</span></a><a class="ys-bnr ys-bnr--y" href="#"><b>U-15</b><span>Recruit members</span></a></div>';

  document.body.insertAdjacentHTML("afterbegin", `
    <div class="ys-bg1" aria-hidden="true"></div>
    <div class="ys-bg2" aria-hidden="true"><i></i><i></i></div>
    <header class="ys-head" data-slot="header">
      <div class="ys-head__logo">${logo("")}</div>
      <button class="ys-burger" type="button" aria-label="Open and close menu" aria-expanded="false"><span class="ys-burger__in"><i></i><i></i><i></i></span></button>
    </header>
    <div class="ys-drawer" data-slot="drawer">
      <div class="ys-drawer__main">
        <div class="ys-drawer__sns pc-only">${sns()}</div>
        <div class="ys-drawer__row">
          <div class="ys-drawer__hero">
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M50 8l10 31h32L66 58l10 31-26-19-26 19 10-31L8 39h32z" fill="none" stroke="currentColor" stroke-width=".3" style="color:var(--kf-accent)"/></svg>
            <div class="wf-img" data-label="Small team cutout + slogan · yellow uniforms · portrait 4:3"></div>
          </div>
          ${links()}
        </div>
        <div class="ys-drawer__sub">${bnrs()}<nav class="ys-foot__policy"><a href="#">Privacy policy</a>　<a href="#">Trading Guide</a></nav></div>
        <div class="ys-drawer__sns sp-only">${sns()}</div>
      </div>
    </div>
    <div class="ys-cursor" aria-hidden="true">${BALL}</div>`);

  document.body.insertAdjacentHTML("beforeend", `
    <footer class="ys-foot" data-slot="footer">
      <div class="ys-marquee" aria-hidden="true">${[0, 1].map(() => `<div class="ys-marquee__track"><span class="ys-marquee__text">SLOGAN GOES HERE!</span>${BALL}<span class="ys-marquee__text ys-marquee__text--y">SLOGAN GOES HERE!</span>${BALL}</div>`).join("")}</div>
      <div class="ys-foot__main">
        <div class="ys-foot__left">${logo("ys-foot__logo")}${sns()}${bnrs()}</div>
        ${links()}
      </div>
      <div class="ys-foot__bottom"><nav><a href="#">Privacy policy</a><a href="#">Trading Guide</a></nav><small>© 0000 TEAM NAME</small></div>
    </footer>`);

  // Header: after passing 56px, it hides on scroll down and appears on scroll up (unchanged while the drawer is open)
  const head = document.querySelector(".ys-head");
  const burger = head.querySelector(".ys-burger");
  const drawer = document.querySelector(".ys-drawer");
  let last = 0, ticking = false;
  addEventListener("scroll", () => {
    if (burger.classList.contains("is-active") || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (y > 56) head.classList.toggle("is-hide", y > last);
      else head.classList.remove("is-hide");
      last = y;
      ticking = false;
    });
  }, { passive: true });
  burger.addEventListener("click", () => {
    const open = burger.classList.toggle("is-active");
    drawer.classList.toggle("is-active", open);
    burger.setAttribute("aria-expanded", open);
    head.classList.remove("is-hide");
    document.documentElement.style.overflow = open ? "hidden" : "";
  });

  // Ball cursor: follows the mouse exactly (no delay) and grows over links
  const cursor = document.querySelector(".ys-cursor");
  addEventListener("mousemove", (e) => {
    cursor.style.opacity = "1";
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
  });
  document.addEventListener("mouseover", (e) => cursor.classList.toggle("is-active", !!e.target.closest("a, button")));

  // Section reveal: is-active when 10% is visible (original IntersectionObserver threshold .1)
  const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && en.target.classList.add("is-active")), { threshold: 0.1 });
  document.querySelectorAll(".ys-fade").forEach((el) => io.observe(el));

  window.YS = { STAR, BALL };
})();
