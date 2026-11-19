// Shared by the whole photo studio site — header (logo·vertical menu·drawer panel·dark panel button), phone tab bar·full menu, footer, Lenis 0.2.28, blur transition.
// The page <div data-yc-chrome></div> Wow <footer data-slot="footer"></footer> Leave just the spot, fill it in here.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrow = '<i aria-hidden="true"></i>';

  const ph = (label, cls = "") => `<span class="yc-ph ${cls}"><span class="wf-img" data-label="${label}"></span></span>`;
  const logo = (tag = "a") => `<${tag} class="yc-logo" ${tag === "a" ? 'href="index.html"' : ""} aria-label="Home">
      <span class="yc-logo__ja">Your business name here</span><span class="yc-logo__en yc-en">SHOP NAME</span></${tag}>`;
  // Two sheets overlapping in a staggered way, shaped like the Switch Panel button at the top right of the original
  const darkIcon = '<svg viewBox="0 0 20 14" fill="currentColor" aria-hidden="true"><path d="M0 0h13v1.6H1.6V9H0Z"/><path d="M0 7.4h1.6V9H0Z"/><path d="M5.4 4h14.6v10H5.4Zm1.6 1.6v6.8h11.4V5.6Z"/></svg>';

  const cards = [
    ["01", "Your short description here", "Service Name 1", "service.html", "Film development drop-off counter · under fluorescent light · landscape"],
    ["02", "Your short description here", "Service Name 2", "service.html", "Retouched landscape photo sample · natural light · landscape"],
    ["03", "Your short description here", "Service Name 3", "service.html", "Hands retouching in front of a monitor · indoors · landscape"],
    ["04", "Photo class", "Classroom name · Second classroom", "service.html", "Hand holding a camera · sky background · landscape"],
    ["05", "Studio and on-location shoots", "Studio name", "lookbook.html", "Family in white-walled studio · window light · landscape"],
  ];
  const subPanels = `
    <nav class="yc-sub" data-lenis-prevent aria-label="Drawer Menu">
      <div class="yc-sub__wrap" data-yc-panel="0">
        <div class="yc-sub__line yc-desk"></div>
        <ul class="yc-sub__list yc-sub__cards">
          ${cards.map(([n, g, name, href, lab]) => `<li><a href="${href}">${ph(lab)}<span class="yc-sub__t"><span class="yc-sub__num yc-en yc-light">${n}</span><span class="yc-gray">${g}</span><span class="yc-sub__name">${name}</span></span></a></li>`).join("")}
        </ul>
        <ul class="yc-sub__list yc-sub__boxes">
          <li><a class="is-box yc-arrow" href="service.html"><span class="yc-sub__t">Shortcut 1 here</span>${arrow}</a></li>
          <li><a class="is-box yc-arrow" href="lookbook.html"><span class="yc-sub__t">Shortcut 2 here</span>${arrow}</a></li>
          <li><a class="is-box yc-arrow is-out" href="news.html"><span class="yc-sub__t">Your external link here</span>${arrow}</a></li>
        </ul>
      </div>
      <div class="yc-sub__wrap" data-yc-panel="1">
        <ul class="yc-sub__list yc-sub__news">
          <li><a class="yc-arrow" href="news.html"><span class="yc-sub__t">All News</span>${arrow}</a></li>
          <li><a class="yc-arrow" href="news.html"><span class="yc-sub__t">Category 1</span>${arrow}</a></li>
          <li><a class="yc-arrow" href="news.html"><span class="yc-sub__t">Category 2</span>${arrow}</a></li>
          <li><a class="yc-arrow" href="news.html"><span class="yc-sub__t">Category 3</span>${arrow}</a></li>
          <li><a class="yc-arrow is-box is-map" href="news.html"><span class="yc-sub__t">Your special feature map name here</span>${arrow}</a></li>
        </ul>
      </div>
      <div class="yc-sub__wrap" data-yc-panel="2">
        <ul class="yc-sub__list">
          <li><a class="yc-arrow" href="about.html"><span class="yc-sub__t">Thoughts on photography</span>${arrow}</a></li>
          <li><a class="yc-arrow" href="about.html"><span class="yc-sub__t">Company guide</span>${arrow}</a></li>
        </ul>
      </div>
      <div class="yc-sub__wrap" data-yc-panel="3">
        <ul class="yc-sub__list">
          <li><a class="yc-arrow" href="article.html"><span class="yc-sub__t">Contact Us</span>${arrow}</a></li>
          <li><a class="yc-arrow" href="article.html"><span class="yc-sub__t">Frequently asked questions</span>${arrow}</a></li>
        </ul>
      </div>
      <div class="yc-sub__bg yc-phone"></div>
    </nav>`;

  const full = `
    <div class="yc-full" data-lenis-prevent>
      ${logo()}
      <div class="yc-full__insta"><span class="yc-en">FOLLOW US</span>${ph("Shop account profile photo · lens front-on · square")}<a class="yc-arrow is-out yc-en" href="#">Instagram${arrow}</a></div>
      <nav><ul>
        <li><a href="index.html">TOP PAGE</a></li>
        <li><a href="service.html">SERVICE</a><ul class="is-cards">
          ${cards.map(([, , name, href], i) => `<li class="is-card${i === 4 ? " is-last" : ""}"><a href="${href}">${name}</a></li>`).join("")}
          <li><a href="service.html">Shortcut 1 here</a></li><li><a href="lookbook.html">Shortcut 2 here</a></li>
        </ul></li>
        <li><a href="news.html">TOPICS</a><ul><li><a href="news.html">Category 1</a></li><li><a href="news.html">Category 2</a></li><li><a href="news.html">Category 3</a></li></ul></li>
        <li><a href="about.html">ABOUT</a><ul><li><a href="about.html">Thoughts on photography</a></li><li><a href="about.html">Company guide</a></li></ul></li>
        <li><a href="article.html">CONTACT</a><ul><li><a href="article.html">Contact Us</a></li><li><a href="article.html">Frequently asked questions</a></li></ul></li>
      </ul></nav>
      <ul class="yc-full__data"><li>Store address line here</li><li>Business hours · days off here</li></ul>
      <ul class="yc-full__links"><li><a class="yc-arrow is-out" href="#">External store 1${arrow}</a></li><li><a class="yc-arrow is-out" href="#">Privacy policy${arrow}</a></li></ul>
      <span class="yc-full__credit yc-en">© 0000 SHOP NAME.</span>
    </div>`;

  const chrome = document.querySelector("[data-yc-chrome]");
  if (chrome) {
    chrome.outerHTML = `
      <div class="yc-transition" aria-hidden="true"></div>
      <div class="yc-shade" aria-hidden="true"></div>
      ${logo()}
      <header class="yc-head" data-slot="header">
        <nav class="yc-menu" aria-label="Menu"><ul>
          ${["SERVICE", "NEWS", "ABOUT", "CONTACT"].map((t) => `<li><button class="yc-menu__btn" type="button">${t}${page === "home" ? `<span class="yc-menu__over yc-en" aria-hidden="true">${t}</span>` : ""}</button></li>`).join("")}
        </ul></nav>
        <button class="yc-burger" type="button" aria-label="Full menu"></button>
        ${full}
      </header>
      <button class="yc-dark" type="button" aria-label="Switch to dark version">${darkIcon}${page === "home" ? `<span class="yc-dark__over">${darkIcon}</span>` : ""}</button>
      ${subPanels}`;
  }

  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot && page !== "home") {
    foot.innerHTML = `
      <div class="yc-foot">
        <div class="yc-foot__info">
          <span class="yc-foot__head yc-vert">SHOP INFO</span>
          <div class="yc-foot__wrap">
            <h5 class="yc-foot__name">Your business name here<span class="yc-en">since 0000</span></h5>
            <ul class="yc-foot__data">
              <li><a class="yc-uline-text yc-ico-pin" href="#">〒000-0000 Your shop address in one line</a></li>
              <li><span class="yc-ico-clock">Mon–Fri 00:00 - 00:00 / Sat·holidays 00:00 - 00:00<br class="yc-phone">(Closed Sundays · first Saturday)</span></li>
              <li><a class="yc-uline-text yc-ico-mail" href="article.html">Click here to get in touch</a></li>
            </ul>
            <ul class="yc-foot__links">
              <li><a class="yc-arrow is-out" href="#">External store 1${arrow}</a></li>
              <li><a class="yc-arrow is-out" href="#">External store 2${arrow}</a></li>
              <li class="is-gap"><a class="yc-arrow is-out" href="#">Print order${arrow}</a></li>
              <li><a class="yc-arrow is-out" href="#">Privacy policy${arrow}</a></li>
              <li><a class="yc-arrow is-out" href="#">Terms of trade notice${arrow}</a></li>
            </ul>
          </div>
        </div>
        <div class="yc-foot__insta">
          <span class="yc-foot__head yc-vert">FOLLOW US</span>
          <div class="yc-foot__wrap">
            <span class="yc-foot__head yc-phone">FOLLOW US</span>
            <a href="#" aria-label="Account photo">${ph("Shop account profile photo · lens front-on · square")}</a>
            <a class="yc-foot__ig yc-arrow is-out yc-en" href="#">Instagram${arrow}</a>
          </div>
        </div>
        <span class="yc-foot__credit yc-en">© 0000 SHOP NAME.</span>
      </div>`;
  }

  // Original ”black” version, switched with a button and remembered for the session
  const root = document.documentElement;
  if (sessionStorage.getItem("yc-mode") === "dark") root.dataset.theme = "dark";
  const darkBtn = document.querySelector(".yc-dark");

  const desk = () => innerWidth > 860;
  const btns = [...document.querySelectorAll(".yc-menu__btn")];
  const menuUl = document.querySelector(".yc-menu ul");
  const panels = [...document.querySelectorAll(".yc-sub__wrap")];
  const subNav = document.querySelector(".yc-sub");
  const shade = document.querySelector(".yc-shade");
  const burger = document.querySelector(".yc-burger");
  const fullMenu = document.querySelector(".yc-full");
  const fix = (on) => document.body.classList.toggle("yc-fix", on);

  darkBtn?.addEventListener("click", () => {
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    sessionStorage.setItem("yc-mode", dark ? "dark" : "");
    if (!desk()) { fix(false); burger.classList.remove("is-active"); fullMenu.classList.remove("is-show"); }
  });

  // Desktop: hovering a word raises the panel after .1s and draws the connecting line after .05s. Moving onto the panel keeps it open
  let cur = -1;
  const listOf = (i) => panels[i]?.querySelector("ul");
  const closeDesk = () => {
    if (cur < 0) return;
    menuUl.classList.remove("is-hover");
    btns[cur].classList.remove("is-hover");
    panels[cur].classList.remove("is-show");
    listOf(cur).classList.remove("is-hover");
    shade.classList.remove("is-show");
  };
  btns.forEach((b, i) => {
    b.addEventListener("mouseenter", () => {
      if (!desk()) return;
      setTimeout(() => {
        if (cur !== -1) { btns[cur].classList.remove("is-hover"); panels[cur].classList.remove("is-show"); listOf(cur).classList.remove("is-hover"); }
        menuUl.classList.add("is-hover");
        b.classList.add("is-hover");
        shade.classList.add("is-show");
        panels[i].classList.add("is-show");
        setTimeout(() => listOf(i).classList.add("is-hover"), 50);
        cur = i;
      }, 100);
    });
    b.addEventListener("mouseleave", () => {
      if (!desk()) return;
      setTimeout(() => cur >= 0 && listOf(cur).classList.remove("is-hover"), 100);
    });
    // Phone: tapping a tab raises a panel from below and the other words fade to .4
    b.addEventListener("click", () => {
      if (desk()) return;
      const open = panels[i].classList.contains("is-show");
      panels.forEach((p) => p.classList.remove("is-show"));
      if (open) {
        subNav.classList.remove("is-show");
        btns.forEach((x) => (x.style.opacity = 1));
        fix(false);
      } else {
        subNav.classList.add("is-show");
        panels[i].classList.add("is-show");
        btns.forEach((x, j) => (x.style.opacity = j === i ? 1 : 0.4));
        fix(true);
      }
    });
  });
  menuUl?.addEventListener("mouseleave", () => {
    if (!desk()) return;
    setTimeout(() => cur >= 0 && !panels[cur].matches(":hover") && closeDesk(), 100);
  });
  panels.forEach((p) => {
    p.addEventListener("mouseenter", () => { if (desk()) { p.classList.add("is-show"); shade.classList.add("is-show"); } });
    p.addEventListener("mouseleave", () => { if (desk()) closeDesk(); });
  });
  document.querySelector(".yc-sub__bg")?.addEventListener("click", () => {
    subNav.classList.remove("is-show");
    panels.forEach((p) => p.classList.remove("is-show"));
    btns.forEach((x) => (x.style.opacity = 1));
    fix(false);
  });
  burger?.addEventListener("click", () => {
    const on = !burger.classList.contains("is-active");
    burger.classList.toggle("is-active", on);
    fullMenu.classList.toggle("is-show", on);
    darkBtn.classList.toggle("is-show", on);
    fix(on);
  });

  // Smooth scroll — same Lenis 0.2.28 defaults as the original (1.2s, 1.001 - 2^(-10t))
  const lenis = !reduce && window.Lenis ? new Lenis({ smooth: true }) : null;
  if (lenis) {
    lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  // Blur transition — when leaving for another page the curtain blurs 0→5px in .6s, and after .2s the body fades out in .4s.
  // On arrival (if the previous page differs) from 5px, turn on the body after .2s and lift the curtain over .5s starting .25s later
  const veil = document.querySelector(".yc-transition");
  const here = location.pathname;
  const tl = gsap.timeline();
  tl.to(document.body, { duration: 0.2 });
  tl.to(document.body, { opacity: 1, duration: 0 });
  if (sessionStorage.getItem("yc-path") !== here && !reduce) {
    gsap.set(veil, { backdropFilter: "blur(5px)", webkitBackdropFilter: "blur(5px)", zIndex: 5 });
    tl.to(veil, { backdropFilter: "blur(0px)", webkitBackdropFilter: "blur(0px)" }, "<+0.25");
    tl.to(veil, { backdropFilter: "none", webkitBackdropFilter: "none", zIndex: -1, duration: 0 });
  }
  sessionStorage.setItem("yc-path", here);

  document.querySelectorAll("a[href]").forEach((a) => {
    if (a.target === "_blank" || a.getAttribute("href").startsWith("#")) return;
    a.addEventListener("click", (e) => {
      if (a.pathname === here || reduce) return;
      e.preventDefault();
      gsap.set(veil, { zIndex: 5 });
      gsap.to(document.body, { opacity: 0, duration: 0.4, delay: 0.2 });
      gsap.to(veil, { backdropFilter: "blur(5px)", webkitBackdropFilter: "blur(5px)", duration: 0.6, onComplete: () => (location.href = a.href) });
    });
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    gsap.set(veil, { backdropFilter: "blur(0px)", zIndex: -1 });
    gsap.set(document.body, { opacity: 1 });
  });

  // Vertical title column — split into vertical cells per character like the original
  const ja = document.querySelector(".yc-ptitle__ja");
  if (ja) {
    const t = ja.textContent.trim();
    ja.textContent = "";
    for (const ch of t) {
      const s = document.createElement("span");
      s.textContent = ch;
      s.className = "yc-vert";
      ja.append(s);
    }
  }

  // Modal (price table) — a button names the panel via data-yc-open
  document.querySelectorAll("[data-yc-open]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const m = document.querySelector(".yc-modal");
      m.classList.add("is-show");
      m.querySelectorAll(".yc-modal__view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === b.dataset.ycOpen));
      fix(true);
    }),
  );
  document.querySelectorAll(".yc-modal").forEach((m) => {
    const close = () => { m.classList.remove("is-show"); fix(false); };
    m.querySelectorAll(".yc-modal__close").forEach((c) => c.addEventListener("click", close));
    m.querySelector(".yc-modal__bg")?.addEventListener("click", close);
  });

  window.yc = { lenis, reduce };
})();
