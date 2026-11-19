// Shared across pages: header, menu panel, attached tabs, buy button, footer, back to top + original common.js style motion (jQuery)
jQuery(($) => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV = [["history", "about.html"], ["products", "product.html"], ["contact", "#"], ["gallery", "lookbook.html"], ["quality", "#"], ["buy", "#"], ["collaboration", "#"]];
  const navList = (cls) => `<ul class="${cls}">${NAV.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>`;
  const INSTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r=".8"/></svg>';

  $('header[data-slot="header"]').addClass("lc-header").attr("id", "header").html(`
    <h1><a class="lc-logo" href="index.html" data-label="Brand lowercase wordmark">brand</a></h1>
    <button class="lc-menu-btn h_menu" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
    <nav class="lc-toggle" data-slot="menu"><div class="lc-toggle__inner">
      <p class="lc-toggle__logo">brand</p>${navList("lc-toggle__nav")}
      <div class="lc-toggle__foot"><p class="lc-en">Follow us</p><p class="lc-en">Maker Name</p></div>
    </div></nav>
    <ul class="lc-side" data-slot="side-tab">
      <li><a href="#"><svg viewBox="0 0 24 24"><path d="M4 6h2l2 10h10l2-7H8"/><circle cx="10" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/></svg>Online shop</a></li>
      <li><a href="#"><svg viewBox="0 0 24 24"><path d="M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11Z"/><circle cx="12" cy="10" r="2"/></svg>Shoplist</a></li>
    </ul>`);
  $("body").append('<a class="lc-buy-fixed" href="#" data-slot="buy-fixed"><b>brand</b> Buy</a>');

  $('footer[data-slot="footer"]').addClass("lc-footer").html(`
    <div id="gototop"><a href="#top-of-page"><svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/></svg><i class="lc-en">Page top</i></a></div>
    <div class="lc-footer__row">
      <p class="lc-footer__logo" data-label="Brand lowercase wordmark">brand</p>
      ${navList("lc-footer__nav")}
      <div class="lc-footer__sns"><p>Follow us</p><a href="#" aria-label="SNS">${INSTA}</a></div>
    </div>
    <p class="lc-footer__maker" data-label="Manufacturer logo (oval outline, italic)"><span>Maker</span></p>
    <p class="lc-footer__copy">© Maker Name Co., Ltd. All Rights Reserved.</p>`);
  $("body").attr("id", "top-of-page");

  // Menu: jQuery fadeIn/fadeOut (400ms swing) — original h_menu
  $(".h_menu").on("click", () => {
    if ($("body").hasClass("open")) { $("body").removeClass("open"); $(".lc-toggle").fadeOut(reduce ? 0 : 400); }
    else { $("body").addClass("open"); $(".lc-toggle").fadeIn(reduce ? 0 : 400); }
  });
  $(".lc-toggle a").on("click", () => { $("body").removeClass("open"); $(".lc-toggle").fadeOut(reduce ? 0 : 400); });

  // Back to top: fadeIn past 200px
  const top = $("#gototop");
  $(window).on("scroll", function () { if ($(this).scrollTop() > 200) top.fadeIn(); else top.fadeOut(); });

  // Same-page anchor: 500ms swing
  $(document).on("click", 'a[href^="#"]', function () {
    const href = $(this).attr("href");
    const target = $(href === "#" || href === "" || href === "#top-of-page" ? "html" : href);
    if (!target.length) return false;
    $("body,html").animate({ scrollTop: target.offset().top }, reduce ? 0 : 500, "swing");
    return false;
  });

  // When the logo sits over a dark block (.bg_b), white logo and white menu button (original h_b)
  const headerState = () => {
    const logo = $(".lc-logo");
    const t1 = logo.offset().top, b1 = t1 + logo.outerHeight() / 2;
    let inside = false;
    $(".bg_b").each(function () { const t = $(this).offset().top, b = t + $(this).outerHeight(); if (t1 > t && b1 < b) inside = true; });
    $("body").toggleClass("h_b", inside);
  };
  // Parallax: while a section (.scroll_move) is on screen, the .move inside it drops by (section top − scroll) / data-amount (default 8)
  const moveAll = () => {
    const wh = window.innerHeight, sTop = $(window).scrollTop(), sBtm = sTop + wh;
    $(".scroll_move").each(function () {
      const owner = $(this), t = owner.offset().top, b = t + owner.outerHeight();
      if (t <= sBtm && sTop < b) {
        owner.find(".move").each(function () {
          let pos = t - sTop;
          if (wh > t) pos = sTop;
          $(this).css("top", `${pos / ($(this).data("amount") || 8)}px`);
        });
      } else owner.find(".move").css("top", 0);
    });
  };
  // Appear: when the element comes 150px (or data-dh) up from the bottom of the screen, after data-delay it gets visibility + data-anim · animated
  const motion = () => {
    const sTop = $(window).scrollTop(), wh = window.innerHeight;
    $(".evt").each(function () {
      const el = $(this);
      if (el.hasClass("done")) return;
      const t = el.offset().top, h = el.height();
      let dh = el.data("dh") ?? 150;
      if (typeof dh === "string" && dh.includes("/")) dh = wh / Number(dh.slice(1));
      if (sTop > t - wh + dh && sTop < t + h) {
        el.addClass("done");
        const go = () => el.css("visibility", "visible").addClass(`${el.data("anim")} animated`);
        const d = reduce ? 0 : (el.data("delay") || 0) * 1000;
        if (d > 0) setTimeout(go, d); else go();
      }
    });
  };
  window.lcMotion = motion;
  $(window).on("scroll resize", () => { headerState(); if (!reduce) moveAll(); motion(); });
  headerState();
  motion();
  document.body.classList.add("is-ready");
});
