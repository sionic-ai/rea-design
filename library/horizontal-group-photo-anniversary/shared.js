// Draws the header, menu board and red footer identically on every page, and hooks up menu open/close, inviewed added when in view, and the modal (GLightbox).
(() => {
  const ARROW = '<i class="am-arrow" aria-hidden="true"></i>';
  const LOGO = '<svg viewBox="0 0 64 38" aria-hidden="true"><text x="32" y="25" text-anchor="middle" font-size="31" font-weight="800" fill="currentColor" letter-spacing="-1">sn</text><text x="32" y="36" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor" letter-spacing=".6">STUDIO</text></svg>';
  const MARK = '<b>00<sup>th</sup></b><small>CELEBRATION</small>';
  const NAVI = [["VOICE", "Voices of our staff", "voice.html"], ["MESSAGE", "Key message", "index.html#message"], ["FOR FUTURE", "Policies for the future", "index.html#forfuture"], ["HISTORY", "Company Timeline", "history.html"]];
  const navi = () => `<ul class="am-navi">${NAVI.map(([en, kr, href]) => `<li><a href="${href}"><span class="en"><i>${en}</i></span><span class="kr">${kr}</span></a></li>`).join("")}</ul>`;
  window.amUI = { ARROW, LOGO, MARK };

  document.querySelectorAll("[data-mark]").forEach((el) => (el.innerHTML = MARK));
  document.querySelectorAll("[data-arrow]").forEach((el) => el.insertAdjacentHTML("beforeend", ARROW));

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "am-header";
    header.innerHTML = `<a class="am-logo" href="index.html" data-label="Brand logo (rounded bold English + small English)">${LOGO}</a>`;
    const btn = document.createElement("button");
    btn.className = "am-menu-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Open Menu");
    btn.innerHTML = "<span></span><span></span><span></span>";
    const menu = document.createElement("div");
    menu.className = "am-menu";
    menu.setAttribute("data-slot", "menu");
    menu.innerHTML = `<div class="am-menu__window"><nav class="am-menu__nav" aria-label="Main menu">${navi()}<ul class="am-navi--sm"><li><a href="article.html">Company Site</a></li></ul></nav><div class="am-menu__foot"><p class="am-menu__catch">The future,<br>It lives in everyday life.</p><span class="am-mark" data-label="Anniversary cover (number + English text)">${MARK}</span></div></div>`;
    header.after(btn, menu);
    const root = document.documentElement;
    btn.addEventListener("click", () => {
      const open = !root.classList.contains("menu-open");
      root.classList.toggle("menu-open", open);
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.querySelector(".am-menu__window").scrollTop = 0;
    });
    menu.addEventListener("click", (e) => { if (!e.target.closest(".am-menu__window") || e.target.closest("a")) { root.classList.remove("menu-open"); btn.setAttribute("aria-label", "Open Menu"); } });
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "am-footer";
    footer.innerHTML = `<div class="am-footer__upper"><a class="am-logo" href="index.html" data-label="Brand Logo">${LOGO}</a>${navi()}</div>
      <div class="am-footer__spacer"></div>
      <p class="am-footer__catch" data-label="Big slogan (bold italic)">The future is in every day.</p>
      <div class="am-footer__line" data-fx="ribbon-draw-breathe" data-fx-ribbon-draw-breathe="dur: 1.5; start: top bottom"><svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice"><path stroke-width="60" d="M-80 520C260 300 620 640 900 520s420-460 780-260"/></svg></div>
      <div class="am-footer__people js-inview-people"><div class="wf-img" data-label="Cutout of staff running sideways · no white background · landscape 2:1"></div></div>
      <div class="am-footer__lower"><div><p>© STUDIO NAME CO., LTD.</p><a href="article.html">Company Site</a></div><span class="am-mark" data-label="Commemorative cover">${MARK}</span></div>`;
  }

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add(e.target.classList.contains("js-inview-people") ? "is-in" : "inviewed");
    io.unobserve(e.target);
  }), { rootMargin: "0px" });
  document.querySelectorAll(".js-inview-fadein, .js-inview-people, .js-inview").forEach((el) => io.observe(el));

  if (window.GLightbox && document.querySelector(".glightbox")) {
    const lb = GLightbox({ selector: ".glightbox", loop: true, autoplayVideos: true, onOpen: () => (document.body.style.overflow = "hidden"), onClose: () => (document.body.style.overflow = "") });
    window.amLightbox = lb;
  }
})();
