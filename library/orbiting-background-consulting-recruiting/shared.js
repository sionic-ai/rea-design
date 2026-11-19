// Draws the header, phone menu and careers footer shared by all pages, and hooks up the scroll variable (--scroll-y), background orbit (three) and people illustrations.
(() => {
  const root = document.documentElement;
  const ARROW = '<svg viewBox="0 0 14 12" aria-hidden="true"><path d="M1 6h11M7.5 1.5 12 6l-4.5 4.5"/></svg>';
  const arrow = (size, extra = "") => `<span class="arrow-button -${size} ${extra}">${ARROW}</span>`;
  const NAV = [["about", "About", "about.html", "About us"], ["people", "People", "article.html", "Friends"], ["projects", "Projects", "list.html", "Case study"], ["workstyle", "Workstyle", "index.html#workstyle", "Work environment"], ["reports", "Reports", "index.html#news", "Report"]];
  const here = document.body.dataset.nav || "";

  // Like the original, scroll position is a css variable. The header collapse and logo shrink are tied to --is-scrolled (0/1).
  let last = scrollY;
  const winState = () => {
    root.style.setProperty("--scroll-y", String(Math.floor(Math.max(scrollY, 0))));
    root.dataset.scrollIsTop = String(scrollY < 105);
    root.dataset.scrollDir = scrollY > last ? "down" : "up";
    last = scrollY;
  };
  addEventListener("scroll", winState, { passive: true });
  winState();

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("header");
    head.innerHTML = `
    <div class="l-inner">
      <div class="header__content">
        <div class="header__head">
          <p class="site-title"><span class="site-title__en">Company Name Recruitment</span><span class="site-title__ja">Your company name careers site here</span></p>
          <a href="index.html" class="site-logo" data-label="English wordmark (lowercase, with period)">brand name.</a>
        </div>
        <div class="header__side">
          <p class="tagline">Your one-line company intro here,<br>Continue on a second line.</p>
          <nav class="nav"><ul class="nav__list">
            ${NAV.map(([k, label, href]) => `<li class="${k === here ? "-current" : ""}"><a href="${href}" class="nav__item">${label}</a></li>`).join("")}
            <li class="-recruit ${here === "recruit" ? "-current" : ""}"><span class="dot"></span><a href="recruit.html" class="nav__item">Application guidelines</a></li>
          </ul></nav>
        </div>
        <button class="header__toggle" type="button" aria-label="Open Menu"><span></span><span></span></button>
      </div>
    </div>
    <dialog class="mobile-menu" id="mobile-menu">
      <div class="mobile-menu__head"><p class="site-title"><span class="site-title__en">Company Name Recruitment</span><span class="site-title__ja">Your company name careers site here</span></p><a href="index.html" class="site-logo">brand name.</a></div>
      <p class="mobile-menu__lead">Your company introduction here, in two or three lines. Briefly say what the company does and who it is looking for.</p>
      <div class="cta__body">
        ${NAV.map(([k, label, href, sub]) => `<a href="${href}" class="cta__item"><span><span class="cta__label">${label}</span><span class="cta__sub">${sub}</span></span></a>`).join("")}
        <a href="recruit.html" class="cta__item -recruit"><span><span class="cta__label">Recruit</span><span class="cta__sub">Application guidelines</span></span>${arrow("md", "-blue")}</a>
        <p class="cta__copyright">Copyright © Company Name All Rights Reserved.</p>
      </div>
      <button class="mobile-menu__close" type="button" aria-label="Close Menu"></button>
    </dialog>`;
    const dlg = head.querySelector("dialog");
    const fade = (from, to) => dlg.animate([{ opacity: from }, { opacity: to }], { duration: 100 }).finished;
    head.querySelector(".header__toggle").addEventListener("click", () => { dlg.showModal(); fade(0, 1); });
    head.querySelector(".mobile-menu__close").addEventListener("click", () => fade(1, 0).then(() => dlg.close()));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("footer-contents");
    foot.innerHTML = `
    <div class="imgs" data-label="Four office meeting photos — different heights aligned to the baseline">
      <div class="imgs__img img_1 wf-img" data-label="Two people at laptops · office"></div>
      <div class="imgs__img img_2 wf-img" data-label="Three People Chatting and Smiling"></div>
      <div class="imgs__img img_3 wf-img" data-label="Meeting in front of the screen"></div>
      <div class="imgs__img img_4 wf-img" data-label="Presenter in front of a big screen with four listeners · bright meeting room · landscape"></div>
    </div>
    <div class="stage">
      <div class="l-inner stage__inner">
        <section class="recruit">
          <div class="section-heading -border -invert"><div class="section-heading__inner"><div class="heading"><p class="heading__title">Recruit</p></div><p class="lead">One line on who you are looking for here,<br>Continue on a second line.</p></div></div>
          <div class="recruit__button"><a href="recruit.html" class="link-button -is-border -white"><span class="link-button__content"><span class="text">Application guidelines</span>${arrow("md")}</span></a></div>
          <a href="recruit.html" class="recruitLink"><span><span class="recruitLink__main">Recruit</span><span class="recruitLink__sub">Application guidelines</span></span>${arrow("md", "-blue")}</a>
        </section>
        <div class="footer-illust"><div class="footer-illust__image" data-figures="footer" data-label="Scene of four people figures gathered, holding pens and charts"></div></div>
        <footer class="footer">
          <div class="footer__cont">
            <nav class="footer__nav">
              <ul class="footer__navList">${NAV.map(([, label, href]) => `<li><a class="footer__navItem" href="${href}">${label}</a></li>`).join("")}</ul>
              <ul class="footer__subNavList"><li><a class="footer__subNavItem" href="#corporate">Company homepage</a></li><li><a class="footer__subNavItem" href="#company">Company overview</a></li><li><a class="footer__subNavItem" href="#privacy">Privacy policy</a></li></ul>
            </nav>
            <div class="footer__side"><p class="footer__logo">brand name.</p><small class="footer__copy">Copyright © Company Name All Rights Reserved.</small></div>
          </div>
        </footer>
      </div>
    </div>`;
  }
  document.querySelectorAll("[data-arrow]").forEach((el) => { el.outerHTML = arrow(el.dataset.arrow || "sm", el.dataset.arrowClass || ""); });

  /* Human figure — an SVG at the same size and pose in place of the original’s white-body, blue-glove illustration */
  const limb = (x1, y1, x2, y2, w) => `<path class="l" d="M${x1} ${y1}L${x2} ${y2}" style="stroke-width:${w}"/>`;
  const POSE = {
    hold: { arms: [[-14, 46, -30, 80, -22, 112], [14, 46, 30, 20, 20, -6]], legs: [[-8, 100, -12, 150], [8, 100, 14, 150]] },
    reach: { arms: [[-14, 46, -40, 30, -54, 12], [14, 46, 34, 66, 40, 92]], legs: [[-8, 100, -20, 148], [8, 100, 18, 148]] },
    walk: { arms: [[-14, 46, -26, 74, -16, 98], [14, 46, 30, 70, 40, 90]], legs: [[-8, 100, -26, 146], [8, 100, 24, 144]] },
    sit: { arms: [[-14, 46, -30, 66, -18, 82], [14, 46, 30, 66, 22, 84]], legs: [[-8, 100, 22, 104], [8, 100, 34, 118]] },
    think: { arms: [[-14, 46, -24, 80, -10, 64], [14, 46, 24, 78, 18, 98]], legs: [[-8, 100, -10, 150], [8, 100, 10, 150]] },
    jump: { arms: [[-14, 46, -36, 22, -44, 0], [14, 46, 36, 22, 44, 0]], legs: [[-8, 100, -22, 136], [8, 100, 20, 140]] },
  };
  const figure = (pose = "hold", hair = true) => {
    const p = POSE[pose] || POSE.hold;
    const limbs = [...p.legs.map(([a, b, c, d]) => limb(a, b, c, d, 13)), ...p.arms.map(([a, b, c, d, e, f]) => limb(a, b, c, d, 10) + limb(c, d, e, f, 9))].join("");
    const hands = p.arms.map((a) => `<circle class="a" cx="${a[4]}" cy="${a[5]}" r="6"/>`).join("");
    const feet = p.legs.map(([, , c, d]) => `<ellipse class="a" cx="${c + 4}" cy="${d + 3}" rx="9" ry="4.5"/>`).join("");
    return `<svg class="fig" viewBox="-60 -14 120 174" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${limbs}<rect class="b" x="-17" y="38" width="34" height="66" rx="15"/><path class="s" d="M4 40h8a5 5 0 0 1 5 5v44a15 15 0 0 1-13 15Z"/><circle class="b" cx="0" cy="22" r="14"/><path class="s" d="M6 10a14 14 0 0 1 0 25 16 16 0 0 0 0-25Z"/>${hair ? '<path class="a" d="M-14 20a14 14 0 0 1 28 0c-6-6-20-6-28 0Z"/>' : ""}${hands}${feet}</svg>`;
  };
  const prop = (kind) => kind === "chart"
    ? '<svg class="fig" viewBox="0 0 60 50" aria-hidden="true"><rect class="b" x="2" y="2" width="56" height="46" rx="3"/><rect class="s" x="10" y="30" width="7" height="12"/><rect class="s" x="22" y="22" width="7" height="20"/><rect class="a" x="34" y="14" width="7" height="28"/><rect class="s" x="46" y="8" width="7" height="34"/></svg>'
    : '<svg class="fig" viewBox="0 0 60 60" aria-hidden="true"><circle class="s" cx="30" cy="30" r="26"/><path class="a" d="M30 30V4a26 26 0 0 1 24 16Z"/></svg>';
  window.sfFigure = figure;
  window.sfProp = prop;
  document.querySelectorAll("[data-figure]").forEach((el) => { el.innerHTML = figure(el.dataset.figure, el.dataset.hair !== "no"); });
  document.querySelectorAll("[data-prop]").forEach((el) => { el.innerHTML = prop(el.dataset.prop); });
  document.querySelectorAll('[data-figures="footer"]').forEach((el) => {
    el.innerHTML = `<div style="position:absolute;left:0;bottom:0;width:30%;height:92%">${figure("walk")}</div><div style="position:absolute;left:24%;bottom:6%;width:32%;height:100%">${figure("jump")}</div><div style="position:absolute;left:52%;bottom:0;width:28%;height:70%">${figure("sit")}</div><div style="position:absolute;left:58%;top:6%;width:16%;height:22%">${prop("chart")}</div><div style="position:absolute;right:0;bottom:2%;width:26%;height:84%">${figure("reach", false)}</div>`;
  });

  /* About section: when a text block passes the screen center, its paired photo turns on in .6s (original ContentGroup) */
  document.querySelectorAll(".js-content-group").forEach((g) => {
    const imgs = [...g.querySelectorAll(".js-content-group__image")], bodies = [...g.querySelectorAll(".js-content-group__body")];
    const on = () => bodies.forEach((b, i) => imgs[i]?.classList.toggle("is-active", b.getBoundingClientRect().top + scrollY - innerHeight * 0.5 < scrollY));
    addEventListener("scroll", on, { passive: true }); on();
  });
})();
