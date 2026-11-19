// Header bar, hamburger, menu panel and Footer are placed once on every page, hooking the original script.js state changes (past 500px body.fix, hamburger open/close, menu text splitting).
(() => {
  const page = document.body.dataset.page || "";
  const logo = (extra = "") => `<span class="sg-logo ${extra}" data-label="Brand mark (three trees) + two-line name + English"><i class="sg-logo__mark"></i><span class="sg-logo__name">Name one<br>Forest of two names</span><span class="sg-logo__en">SCHOOL NAME FOREST</span></span>`;
  const NAV = [
    ["about.html", "Story · of · Nature · Tales", "story of nature"],
    ["#", "About our center", "about"],
    ["#", "A day at the clinic", "daily"],
    ["#", "Hospitalization Guide", "admission"],
    ["news.html", "Blog", "blog"],
    ["recruit.html", "Staff Hiring", "recruit"],
  ];
  const card = (n, title, label) => `<a class="sg-card" href="${n === 2 ? "about.html" : "#"}">
      <p class="sg-card__label en"><span>Special</span><br><span>Contents #0${n}</span></p>
      <p class="sg-card__title" data-label="Feature title as graphic lettering">${title}</p>
      <p class="n_txt">Here, about three lines introducing the feature. Briefly note the ideas the School cherishes and how the children grow, and say what can be read.<i class="sg-arrow is-theme"><i></i></i></p>
      <figure class="sg-card__img"><div class="wf-img" data-label="${label}"></div></figure>
    </a>`;

  const head = document.createElement("header");
  head.className = "sg-head";
  head.dataset.slot = "header";
  head.innerHTML = `<h1 class="sg-head__logo"><a href="index.html">${logo()}</a></h1>
    <div class="sg-head__tags">
      <a class="sg-tag is-access" href="#">Transport guide<i></i></a>
      <a class="sg-tag is-contact" href="#"><i></i>Contact Us</a>
    </div>
    <nav class="sg-head__menu">${NAV.map(([h, ko, en], i) => `<a class="sg-link${page === "about" && i === 0 ? " pc_off" : ""}" href="${h}"><p>${ko}</p><span class="en">${en}</span></a>`).join("")}</nav>`;

  const burger = document.createElement("button");
  burger.className = "sg-burger";
  burger.type = "button";
  burger.setAttribute("aria-label", "Menu");
  burger.dataset.slot = "hamburger";
  burger.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="lab"></span>';

  const nav = document.createElement("nav");
  nav.className = "sg-nav";
  nav.dataset.slot = "menu-drawer";
  nav.innerHTML = `<div class="sg-nav__in">
    <p class="sg-nav__logo"><a href="index.html">${logo()}</a></p>
    <ul>${[["index.html", "View home page"], ["#", "About our center"], ["#", "A day at the clinic"], ["#", "Hospitalization Guide"], ["news.html", "Blog"], ["recruit.html", "Staff Hiring"], ["#", "Directions guide"], ["#", "Go to Contact"]].map(([h, t]) => `<li><a href="${h}"><i class="sg-arrow is-theme"><i></i></i>${t}</a></li>`).join("")}</ul>
    <div class="sg-nav__cards"><a href="#"><div class="wf-img" data-label="Feature banner 1 · forest photo + vertical title"></div></a><a href="about.html"><div class="wf-img" data-label="Feature banner 2 · hand-drawn tree + large English title"></div></a></div>
    ${info()}
    <div class="sg-foot__btm"><p class="copy en">&copy;SCHOOL NAME FOREST.</p><div class="left sg-blob2"></div><figure class="right sg-wide"><div class="wf-img" data-label="Playground swing · tree shade · wide landscape"></div></figure></div>
  </div>`;

  function info() {
    return `<div class="sg-info">
      <div class="tel"><h3><span><i class="icon"></i>Phone Inquiry</span></h3><a class="tel-txt en" href="#">0000-00-0000</a><p class="n_txt">Hours / Mon–Fri 8:00-17:00</p></div>
      <div class="mail"><h3><span><i class="icon"></i>Email Inquiry</span></h3><a class="sg-btn is-v2" href="#"><span>To the contact form</span><i class="sg-arrow"><i></i></i></a></div>
    </div>`;
  }

  const foot = document.createElement("footer");
  foot.className = "sg-foot";
  foot.dataset.slot = "footer";
  foot.innerHTML = `<div class="sg-foot__cards" data-slot="feature-cards">${card(1, "Until it becomes a forest", "Children running on a forest path · tree-shadow pattern · portrait photo")}${card(2, "STORY OF NATURE", "Illustration of a hand-drawn tree and children playing")}</div>
    <section class="sg-foot__inr" data-slot="contact">
      <div class="sg-foot__tit"><div><h2>Inquiry</h2><span class="en">Contact</span><p>Questions and inquiries about the center are taken here.</p></div></div>
      ${info()}
    </section>
    <section class="sg-foot__inr">
      <div class="sg-foot__logo">${logo()}<p class="c_txt">Educational foundation name one<br>Forest of two names</p><p class="c_txt">〒000-0000 City name District name 00-0</p><a class="map" href="#"><i></i><span class="en">Product</span></a></div>
      <div class="sg-foot__links">
        <div class="list">${[["index.html", "View home page"], ["about.html", "Story · of · Nature · Tales"], ["#", "About our center"], ["#", "A day at the clinic"], ["#", "Hospitalization Guide"], ["recruit.html", "Staff Hiring"], ["#", "Directions guide"], ["#", "Go to Contact"]].map(([h, t]) => `<a class="b-link sg-link" href="${h}"><p>${t}</p></a>`).join("")}</div>
        <div class="list"><a class="b-link sg-link" href="news.html"><p>Blog</p></a><ul><li><a href="news.html">Mumble mumble</a><a href="news.html">Notice</a><a href="news.html">Hiring Info</a></li><li><a href="news.html">Event</a><a href="news.html">MOVIE</a><a href="news.html">Information disclosure</a></li><li><a href="news.html">Solve Pain Points</a></li></ul></div>
        <div class="sns"><a href="#" aria-label="SNS 1"><b></b></a><a class="is-yt" href="#" aria-label="SNS 2"><b></b></a></div>
      </div>
    </section>
    <div class="sg-foot__btm" data-slot="footer-photo"><p class="copy en">&copy;SCHOOL NAME FOREST.</p><div class="left sg-blob2"></div><figure class="right sg-wide"><div class="wf-img" data-label="Children playing on playground swings · tree shade · wide landscape"></div></figure></div>`;

  const all = document.querySelector(".sg-all") || document.body;
  all.prepend(head);
  document.body.append(burger, nav);
  (document.querySelector("main") || all).after(foot);

  burger.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-close", !open);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") document.body.classList.remove("nav-open"); });

  // Wrap menu text per character — on hover they pop in .05s sequence (original d-txt)
  for (const p of document.querySelectorAll(".sg-link p, .sg-link .en")) {
    const latin = p.classList.contains("en");
    let n = 0;
    p.innerHTML = [...p.textContent].map((c) => (c === " " && !latin ? " " : `<span class="char" style="--i:${++n}">${c}</span>`)).join("");
  }

  const onScroll = () => document.body.classList.toggle("fix", scrollY > 500);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
