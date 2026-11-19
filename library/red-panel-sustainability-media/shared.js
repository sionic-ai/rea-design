// Draws the header, menu panel, recommended tile and footer shared by the five sections, and hooks up the original interaction reactions and self-running parts (drafting-line panel · pattern tile · keyword flow).
(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");

  /* ───────── Draw-in panel ───────── */
  const LOGO = (cls = "") =>
    `<span class="am-logo ${cls}" data-label="Media logo — triangle-in-circle symbol + media name (only one word in the accent color)"><svg class="am-logo__mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="17" r="14"/><path d="M20 9 37 37H3z"/></svg><span>Right here!<b>Media</b>Name</span></span>`;
  const NAV02 = `
      <ul class="am-nav02-list">
        <li><a href="list.html"><span>Download materials</span></a></li>
        <li><a href="#"><span>Get email news</span></a></li>
        <li><a href="list.html"><span>Find articles by criteria</span></a></li>
      </ul>
      <form class="am-search" role="search" onsubmit="return false">
        <input type="text" placeholder="Search by keyword" aria-label="Search by keyword">
        <button type="submit"><span class="am-sr">Search</span></button>
      </form>`;
  const SNS = `
      <ul class="am-sns" data-label="Four SNS icons — X, Instagram, Facebook, YouTube">
        <li><a class="am-sns__i" href="#" aria-label="SNS 1"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h4.6l4.4 6 5-6h2.4l-6.3 7.4L21 21h-4.6l-4.7-6.4L6.2 21H3.8l6.7-7.9z"/></svg></a></li>
        <li><a class="am-sns__i" href="#" aria-label="SNS 2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg></a></li>
        <li><a class="am-sns__i" href="#" aria-label="SNS 3"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 12 2z"/></svg></a></li>
        <li><a class="am-sns__i" href="#" aria-label="SNS 4"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7.2a3 3 0 0 0-2.1-2.1C18 4.6 12 4.6 12 4.6s-6 0-7.9.5A3 3 0 0 0 2 7.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 16.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.8 31 31 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg></a></li>
      </ul>`;
  const SUBNAV = `
      <ul class="am-subnav-list">
        <li><a href="#">Operating company<span class="am-ext"></span></a></li>
        <li><a href="#">Privacy policy<span class="am-ext"></span></a></li>
        <li><a href="#">Help</a></li>
        <li><a href="#">Inquiry<span class="am-ext"></span></a></li>
      </ul>`;
  const NAVCARD = (href, head, txt) => `
            <li><a class="am-nav-card" href="${href}">
              <span class="am-nav-card__bg" data-am-pat="line" data-seed="${head.length}"></span>
              <span class="am-nav-card__bg is-hover" data-am-pat="line-light" data-seed="${head.length}"></span>
              <span><span class="am-nav-card__head">${head}</span><span class="am-nav-card__txt" style="display:block">${txt}</span></span>
              <span class="am-ar"></span>
            </a></li>`;
  const HEADER = (variant) => `
<header class="am-header am-header--${variant} js-header" data-slot="header">
  <div class="am-header__inner">
    ${variant === "sub" ? `<p class="am-header-logo"><a class="am-alpha" href="index.html" aria-label="To the first page">${LOGO()}</a></p>` : ""}
    <div class="am-header-date">
      <p class="am-header-date__lbl">today</p>
      <p class="am-header-date__txt"><span class="am-header-date__y js-date-y">0000</span><span class="am-header-date__d js-date-d">00／00</span></p>
    </div>
    <div class="am-header-nav">
      <div class="am-nav02">${NAV02}</div>
      <button class="am-nav-btn am-nav-btn--pc js-nav-btn" type="button" aria-label="Open and close menu"><span class="am-nav-btn__in"><span class="am-nav-btn__line"></span><span class="am-nav-btn__line"></span><span class="am-nav-btn__line"></span></span></button>
    </div>
  </div>
  <nav class="am-nav js-nav" data-slot="menu-panel" aria-label="Menu">
    <div class="am-nav__wrap">
      <div class="am-nav__in-nav02 am-nav02-in">${NAV02}</div>
      <ul class="am-nav-list">
        <li>
          <p class="am-mark am-nav-list__head">Article content</p>
          <ul class="am-nav-list__child">
            ${NAVCARD("list.html", "Columns and interviews", "Add a one-line menu description here")}
            ${NAVCARD("detail.html", "Seminar", "Put your menu description here")}
            ${NAVCARD("list.html", "Regular newsletter", "Add a one-line menu description here")}
            ${NAVCARD("article.html", "About the authors", "Put your menu description here")}
            ${NAVCARD("article.html", "Glossary", "Add a one-line menu description here")}
          </ul>
        </li>
        <li>
          <p class="am-mark am-nav-list__head">About this media outlet</p>
          <ul class="am-nav-list__child">
            ${NAVCARD("about.html", "Your media intro here", "Put your menu description here")}
          </ul>
        </li>
      </ul>
      <div class="am-subnav">${SNS}${SUBNAV}</div>
    </div>
  </nav>
</header>
<button class="am-nav-btn am-nav-btn--sp js-nav-btn" type="button" aria-label="Open and close menu"><span class="am-nav-btn__in"><span class="am-nav-btn__line"></span><span class="am-nav-btn__line"></span><span class="am-nav-btn__line"></span></span></button>
<div class="am-overlay js-nav-overlay"></div>`;

  const RECO = (tone, href, label, ext) => `
        <li><a class="am-reco__item" href="${href}">
          <span class="am-pat" data-am-pat="${tone}" data-seed="${label.length * 3}"></span>
          <span>${label}</span>
          <span class="am-pill is-sm">${ext ? '<span class="am-ext" style="margin:0"></span>' : '<span class="am-ar"></span>'}</span>
        </a></li>`;
  const FOOTER = `
<section class="am-reco" data-slot="recommend-tiles">
  <div class="am-reco__head-wrap">
    <div class="am-reco__head">
      <p class="am-mark am-reco__eyebrow" data-anime="text-up"><span data-anime-child>Your editor’s note here</span></p>
      <h2 class="am-reco__title">Your featured content here</h2>
    </div>
  </div>
  <div class="am-reco__panel">
    <ul class="am-reco__list">
      ${RECO("red", "#", "Help")}
      ${RECO("green", "about.html", "Your media intro here")}
      ${RECO("cyan", "#", "Inquiry", true)}
      ${RECO("yellow", "list.html", "Columns and interviews")}
    </ul>
  </div>
</section>
<footer class="am-footer" data-slot="footer">
  <div class="am-footer__top">
    <div class="am-footer__left">
      <p class="am-footer__logo"><a class="am-alpha" href="index.html" aria-label="To the first page">${LOGO()}</a></p>
      <p class="am-footer__nav"><a href="about.html">Your media intro here<span class="am-pill"><span class="am-ar"></span></span></a></p>
      <ul class="am-footer-bnr">
        <li><a href="#"><span class="wf-logo">GROUP LOGO</span><span class="am-ext"></span></a></li>
        <li><a href="#"><span class="wf-logo">SITE LOGO</span><span class="am-ext"></span></a></li>
      </ul>
    </div>
    <div class="am-footer__right">
      <ul class="am-footer-ext">
        <li class="am-footer-ext__item">
          <p class="am-footer-ext__head"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="12" height="24" rx="2"/><path d="M12 8h6M12 12h6M12 16h4"/></svg>Social media</p>
          <p class="am-footer-ext__txt">Your guidance text goes here.<br>Set in two lines.</p>
          <div class="am-footer-ext__btn is-sns"><p>Thank you<br>Follow!!</p>${SNS}</div>
        </li>
        <li class="am-footer-ext__item">
          <p class="am-footer-ext__head"><svg viewBox="0 0 30 30" fill="currentColor"><path d="M8 2h14v11l-7 5-7-5z" opacity=".9"/><path d="M2 12l13 9 13-9v15H2z"/></svg>Subscribe to the free email magazine</p>
          <p class="am-footer-ext__txt">Your guidance text goes here.<br>Fill in a slightly longer text over two lines.</p>
          <a class="am-footer-ext__btn" href="#"><span class="am-footer-ext__btn-txt">Subscribe to the email magazine</span><span class="am-ext"></span></a>
        </li>
      </ul>
      <div class="am-footer__video am-construct" data-fx="construct-lines" data-fx-construct-lines="offset: 3.4" data-label="Looping construction-line video slot · red panel · square"></div>
    </div>
  </div>
  <div class="am-footer__bottom">
    <p class="am-footer__copy">©COMPANY NAME</p>
    <ul class="am-footer-subnav">
      <li><a href="#">Operating company<span class="am-ext"></span></a></li>
      <li><a href="#">Privacy policy<span class="am-ext"></span></a></li>
      <li><a href="#">Help</a></li>
      <li><a href="#">Inquiry<span class="am-ext"></span></a></li>
    </ul>
  </div>
</footer>`;

  /* Article cards and ranking rows that repeat in the same form — only photo labels and tag counts are swapped in, in the original order */
  const CARD_PICS = [
    ["Letter icon floating above a palm · sky-blue background · landscape", 1],
    ["Two workers at a recycling yard · overcast day · landscape", 7],
    ["Hexagon cycle step diagram · white background · landscape", 6],
    ["Stone government building front · overcast day · landscape", 9],
    ["Letter icon floating above a palm · sky-blue background · landscape", 1],
    ["Serial column title illustration held by a character · white background · landscape", 5],
    ["System flow diagram · white background · landscape", 4],
    ["Recycled material pile · close-up · landscape", 3],
    ["Rising bar chart model · bright interior · landscape", 5],
    ["Four people in the office · indoors · landscape", 3],
  ];
  const TAGW = ["#Tag", "#Your Tag Here", "#Tag Name", "#Long tag name", "#Your long tag here"];
  const CARD = (i) => {
    const [pic, n] = CARD_PICS[i % CARD_PICS.length];
    const tags = Array.from({ length: n }, (_, k) => `<li class="am-tag">${TAGW[(i + k) % TAGW.length]}</li>`).join("");
    return `
        <li class="am-card">
          <a class="am-card__link" href="article.html">
            <div class="am-card__head" data-anime="fade-in">
              <div class="am-card__img am-zoom"><div class="wf-img am-img am-media am-zoom__img" data-label="${pic}"></div></div>
              <p class="am-card__date">Release date <time class="am-num">0000.00.00</time></p>
            </div>
            <div class="am-card__body">
              <p class="am-card__title am-clamp2">Your two-line article title here. If it runs long, it ends with an ellipsis</p>
              <div class="am-card__foot"><ul class="am-tags">${tags}</ul><span class="am-pill"><span class="am-ar"></span></span></div>
            </div>
          </a>
        </li>`;
  };
  document.querySelectorAll("[data-am-cards]").forEach((ul) => {
    const n = +ul.dataset.amCards || 6, from = +(ul.dataset.from ?? 0);
    ul.innerHTML = Array.from({ length: n }, (_, i) => CARD(from + i)).join("");
  });
  document.querySelectorAll("[data-am-slides]").forEach((ul) => {
    const n = +ul.dataset.amSlides || 6;
    ul.innerHTML = Array.from({ length: n }, (_, i) => CARD(i + 2).replace('<li class="am-card">', '<li class="splide__slide am-card">').replace(' data-anime="fade-in"', "")).join("");
  });
  /* Word chip — the original is a checkbox chip. Pressing turns it on, and View all unfolds the height collapsed to 160px */
  document.querySelectorAll("[data-am-chips]").forEach((box) => {
    const n = +box.dataset.amChips || 30;
    const words = ["#Tag", "#Your Tag Here", "#Tag Name", "#Long tag name", "#KEYWORD", "#Your long tag here", "#Tag Two"];
    box.innerHTML = `<label class="am-chip is-all"><input type="checkbox" checked><span>Entire</span></label>` +
      Array.from({ length: n }, (_, i) => `<label class="am-chip"><input type="checkbox"><span>${words[(i * 5 + (i >> 2)) % words.length]}</span></label>`).join("");
    const more = box.closest("form") && box.closest("form").querySelector(".js-tags-more");
    if (box.scrollHeight > 170) box.classList.add("is-control-height");
    more && more.addEventListener("click", (e) => {
      e.preventDefault();
      const c = box.classList.toggle("is-control-height");
      more.textContent = c ? "View all" : "Fold";
    });
  });
  document.querySelectorAll(".js-search-reset").forEach((b) => b.addEventListener("click", () => {
    const f = b.closest("form");
    f && f.querySelectorAll("input[type=checkbox]").forEach((c) => { c.checked = c.closest(".is-all") != null; });
  }));
  const RANK_PICS = ["Distant city view and blue sky · clear daytime · landscape", "Compressed scrap metal pile · close-up · landscape", "Colorful drums · Close-up · Landscape", "Two people in front of a whiteboard · indoors · landscape", "Satellite photo of Earth · space · landscape"];
  document.querySelectorAll("[data-am-rank]").forEach((ol) => {
    ol.innerHTML = RANK_PICS.map((pic, i) => `
          <li class="am-rank__item"><a class="am-rank__link" href="article.html">
            <div class="am-rank__img am-zoom"><div class="wf-img am-img am-zoom__img" data-label="${pic}"></div></div>
            <div class="am-rank__info">
              <p class="am-rank__badge"><span class="am-num">${i + 1}</span><small>Above</small></p>
              <p class="am-rank__date">${i < 2 ? '<span>Updated date <span class="am-num">0000.00.00</span></span>' : ""}<span>Release date <span class="am-num">0000.00.00</span></span></p>
            </div>
            <p class="am-rank__txt am-clamp2">Your two-line article title here. If it runs long, it ends with an ellipsis</p>
            <span class="am-rank__ico am-pill"><span class="am-ar"></span></span>
          </a></li>`).join("");
  });

  document.querySelectorAll("[data-am-mount]").forEach((el) => {
    const kind = el.dataset.amMount;
    const html = kind === "footer" ? FOOTER : HEADER(kind === "header-home" ? "home" : "sub");
    el.insertAdjacentHTML("beforebegin", html);
    el.remove();
  });
  document.querySelectorAll("[data-am-logo]").forEach((el) => { el.innerHTML = LOGO(); });

  const now = new Date();
  const p2 = (n) => String(n).padStart(2, "0");
  document.querySelectorAll(".js-date-y").forEach((el) => { el.textContent = now.getFullYear(); });
  document.querySelectorAll(".js-date-d").forEach((el) => { el.textContent = `${p2(now.getMonth() + 1)}／${p2(now.getDate())}`; });

  /* ───────── Header — hides when reading down past 80px and returns on scrolling up. Past 200px it hides the date·nav ───────── */
  const header = document.querySelector(".js-header");
  const navEl = document.querySelector(".js-nav");
  const overlay = document.querySelector(".js-nav-overlay");
  const navBtns = [...document.querySelectorAll(".js-nav-btn")];
  const isPC = () => innerWidth > 1099;
  let lastY = scrollY, ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY;
      if (header) {
        if (lastY >= y) header.classList.remove("is-hidden");
        else if (lastY >= 80) { header.classList.add("is-hidden"); if (isPC()) closeNav(); }
        header.classList.toggle("is-scroll", y > 200);
      }
      lastY = y;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* Menu panel — the veil is jQuery fadeIn/fadeOut(300ms swing = sine.inOut), panels · buttons use CSS .3s */
  const fade = (show) => {
    if (!overlay) return;
    const dur = reduceQ.matches ? 0 : 0.3;
    if (window.gsap) {
      gsap.killTweensOf(overlay);
      if (show) gsap.fromTo(overlay, { display: "block", opacity: overlay.style.display === "block" ? +getComputedStyle(overlay).opacity : 0 }, { opacity: 1, duration: dur, ease: "sine.inOut" });
      else gsap.to(overlay, { opacity: 0, duration: dur, ease: "sine.inOut", onComplete: () => { overlay.style.display = "none"; } });
    } else overlay.style.display = show ? "block" : "none";
  };
  function closeNav() {
    if (!navEl || !navEl.classList.contains("is-open")) return;
    fade(false);
    navEl.classList.remove("is-open");
    navBtns.forEach((b) => b.classList.remove("is-open"));
    header && header.classList.remove("is-open");
  }
  const openNav = () => {
    fade(true);
    navEl.classList.add("is-open");
    navBtns.forEach((b) => b.classList.add("is-open"));
    header && header.classList.add("is-open");
  };
  navBtns.forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); navEl.classList.contains("is-open") ? closeNav() : openNav(); }));
  overlay && overlay.addEventListener("click", closeNav);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  /* ───────── Reveal — once, when it comes within 100px of the bottom of the screen ───────── */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-animated"); io.unobserve(e.target); } }), { rootMargin: "0% 0% -100px 0%", threshold: 0 });
  const arm = () => document.querySelectorAll("[data-anime]").forEach((el) => io.observe(el));
  if (document.readyState === "complete") arm(); else addEventListener("load", arm);

  /* ───────── Expand button — original Trending Keywords ＋: list max-height set from scrollHeight ───────── */
  document.querySelectorAll("[data-am-more]").forEach((btn) => {
    const target = document.querySelector(btn.dataset.amMore);
    if (!target) return;
    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      target.style.maxHeight = open ? target.scrollHeight + "px" : "";
      btn.classList.toggle("is-open", open);
    });
  });
  document.querySelectorAll("[data-am-toggle]").forEach((btn) => {
    const target = document.querySelector(btn.dataset.amToggle);
    target && btn.addEventListener("click", () => target.classList.toggle("is-show"));
  });

  /* ‹Helpful› — original wp-ulike button: pressing raises the count by one (pressing again lowers it) */
  document.querySelectorAll(".js-like").forEach((b) => {
    const n = b.parentElement.querySelector(".js-like-n");
    b.addEventListener("click", () => {
      const on = b.classList.toggle("is-on");
      if (n) n.textContent = on ? "+2" : "+1";
    });
  });

  /* ───────── Collapsible cell: original details with height·opacity 300ms linear (WAAPI) ───────── */
  document.querySelectorAll(".js-details").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector(".js-details-body");
    if (!sum || !body) return;
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.dataset.anim === "running") return;
      const opt = { duration: reduceQ.matches ? 0 : 300, easing: "linear" };
      d.dataset.anim = "running";
      if (d.open) {
        body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], opt).onfinish = () => { d.removeAttribute("open"); d.dataset.anim = ""; };
      } else {
        d.setAttribute("open", "");
        body.animate([{ height: 0, opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], opt).onfinish = () => { d.dataset.anim = ""; };
      }
    });
  });

  /* ───────── Pattern tile: the original overlays two polygon pattern photos (normal·hover) and swaps them in .3s ───────── */
  let gid = 0;
  const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const patSVG = (kind, seed) => {
    const r = rnd(seed * 97 + 13);
    const W = 350, H = 180;
    const id = `am-g${gid++}`;
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.1"/></filter></defs>`;
    if (kind === "line" || kind === "line-light") {
      s += `<rect class="t0" width="${W}" height="${H}"/>`;
      const cx = 240 + r() * 80, cy = 40 + r() * 100;
      s += `<g class="tl">`;
      s += `<circle cx="${cx}" cy="${cy}" r="${70 + r() * 60}"/><circle cx="${cx - 40}" cy="${cy + 30}" r="${120 + r() * 60}"/><circle cx="${cx + 20}" cy="${cy}" r="${24 + r() * 10}"/>`;
      s += `<path d="M${W * 0.55} 0V${H}M0 ${H * 0.55}H${W}M${cx - 200} ${cy - 130}L${cx + 160} ${cy + 140}M${cx - 180} ${cy + 160}L${cx + 170} ${cy - 120}"/>`;
      s += `</g>`;
    } else {
      s += `<rect class="t0" width="${W}" height="${H}"/>`;
      for (let i = 0; i < 4; i++) {
        const cls = ["t1", "t2", "t3", "t1"][i];
        const a = [r() * W, 0], b = [W, r() * H], c = [r() * W * 0.7, H];
        const pts = i % 2 ? `${a[0]},0 ${W},0 ${b[0]},${b[1]} ${c[0]},${H}` : `${a[0]},0 ${b[0]},${b[1]} ${c[0]},${H} 0,${H}`;
        s += `<polygon class="${cls}" points="${pts}" opacity="${0.55 + r() * 0.35}"/>`;
      }
      s += `<circle class="t3" cx="${r() * W}" cy="${H + 40 + r() * 80}" r="${150 + r() * 90}" opacity=".45"/>`;
      s += `<circle class="t1" cx="${W + 30}" cy="${r() * H}" r="${80 + r() * 60}" opacity=".5"/>`;
      const tx = 60 + r() * 220;
      s += `<polygon class="tn" points="${tx},0 ${tx + 70 + r() * 50},0 ${tx + 20 + r() * 40},${70 + r() * 60}"/>`;
      s += `<polygon class="tn" points="${W},${H} ${W - 60 - r() * 70},${H} ${W},${H - 60 - r() * 70}"/>`;
      s += `<polygon class="tn" points="0,${40 + r() * 60} ${70 + r() * 40},${H} 0,${H}" opacity="${r() > 0.5 ? 1 : 0}"/>`;
      s += `<path class="tl" d="M${r() * W} 0L${r() * W} ${H}M0 ${r() * H}L${W} ${r() * H}"/>`;
    }
    s += `<rect width="${W}" height="${H}" filter="url(#${id})" class="tg"/></svg>`;
    return s;
  };
  document.querySelectorAll("[data-am-pat]").forEach((el) => {
    el.innerHTML = patSVG(el.dataset.amPat, +(el.dataset.seed ?? 1) + 1);
    el.dataset.tone = el.dataset.amPat;
  });

  /* ───────── Keyword flow · recommended slider — same Splide 4.1.4 + AutoScroll as the original ───────── */
  const mh = (px) => px + "px";
  const mountSplides = () => {
    if (!window.Splide) return;
    document.querySelectorAll(".js-trend-slider").forEach((el, i) => {
      const s = new Splide(el, {
        mediaQuery: "min",
        type: "loop",
        drag: "free",
        fixedWidth: mh(250),
        gap: mh(20),
        pagination: false,
        arrows: false,
        autoScroll: reduceQ.matches ? false : { speed: i === 1 ? -0.5 : 0.5, pauseOnFocus: false },
        breakpoints: { 768: { fixedWidth: mh(350), gap: mh(26) } },
      });
      s.mount(window.splide && window.splide.Extensions ? { AutoScroll: window.splide.Extensions.AutoScroll } : {});
    });
    document.querySelectorAll(".js-reco-slider").forEach((el) => {
      const box = el.closest("[data-slot]") || document;
      const cur = box.querySelector(".js-slide-current"), len = box.querySelector(".js-slide-length");
      const s = new Splide(el, {
        perMove: 1,
        type: "loop",
        pagination: false,
        mediaQuery: "min",
        arrowPath: "M0 0",
        breakpoints: { 640: { fixedWidth: mh(540), gap: mh(30) } },
      });
      s.on("active", () => { cur && (cur.textContent = s.index + 1); len && (len.textContent = s.length); });
      s.mount();
    });
  };

  /* The construction-line panel is drawn by the motion part construct-lines(../_fx). The keyword flow stops when motion is reduced */
  const start = () => mountSplides();
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start); else start();
  onScroll();
})();
