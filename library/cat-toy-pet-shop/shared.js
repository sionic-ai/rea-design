// Common to all pages: draws in the header (menu, product drawer, hamburger, icon Lottie), cart drawer, footer, back-to-top toy and shopping band in one place, and
// Applies the entrances the original attaches via data- attributes (fadeIn, scaleUp, inview, image 1.1x → 1, parallax, section settle) with the same values.
// Original values: entrance 1.4s power2 (fadeIn) · image 1s power1.out (start top 80%) · parallax scrub 1~2 · button hover .5s/.6s · drawer .28s ease · hamburger .3s (delayed .3s)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  // Original splits by device (UA), not by width. On phones, section settling and photo overlap are turned off
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const MR = (window.MR = { reduce, page, isMobile });

  const chev = '<svg class="mr-chev" viewBox="0 0 18 10" aria-hidden="true"><path d="M1.5 1.5 9 8.5l7.5-7"/></svg>';
  const arrowS = '<svg class="mr-arr" viewBox="0 0 7 12" aria-hidden="true"><path d="M1 1l5 5-5 5"/></svg>';
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const btn = (label, kind = "ink", href = "#", extra = "") =>
    `<a class="mr-btn mr-btn--${kind} ${extra}" href="${href}" data-fx="dot-shrink-hover"><span class="mr-btn__text" data-fx-part="text">${label}</span></a>`;
  MR.btn = btn;
  MR.icons = { chev, arrowS };

  const products = [
    { cat: "Category 1", name: "Model A", sub: "Model B", label: "Product cutout · round white device, front view · white background · landscape 4:3" },
    { cat: "Category 2", name: "Model C", sub: "", label: "Product cutout · square white device · white background · landscape 4:3" },
    { cat: "Category 3", name: "Model D", sub: "", label: "Product cutout · tall vertical device · white background · landscape 4:3" },
    { cat: "Category 4", name: "Model E", sub: "", label: "Product cutout · small round device · white background · landscape 4:3" },
  ];
  const related = `
    <div class="mr-rel">
      <p class="mr-rel__title">Related Goods</p>
      <div class="mr-rel__group"><p class="mr-rel__head">Category 1 Consumables</p>
        <ul><li><span>Supplies 1</span><a href="#">Buy ${arrowS}</a></li><li><span>Supplies 2</span><a href="#">Buy ${arrowS}</a></li><li><span>Supplies 3</span><a href="#">Buy ${arrowS}</a></li></ul></div>
      <div class="mr-rel__group"><p class="mr-rel__head">Category 2 Consumables</p>
        <ul><li><span>Supplies 4</span><a href="#">Buy ${arrowS}</a></li></ul></div>
      <p class="mr-rel__all"><a href="product.html">View Replacement Parts List</a></p>
    </div>`;
  const productCols = (cls) =>
    products
      .map(
        (p) => `
      <section class="${cls}">
        <p class="${cls}__cat">${p.cat}</p>
        <a class="${cls}__img" href="product.html"><span class="wf-img wf-r-3x2" data-label="${p.label}"></span></a>
        <p class="${cls}__name">${p.name}</p>
        <p class="${cls}__links"><a href="product.html">Details ${arrowS}</a><a href="product.html">Buy ${arrowS}</a></p>
        ${p.sub ? `<p class="${cls}__name ${cls}__name--sub">${p.sub}</p><p class="${cls}__links"><a href="product.html">Buy ${arrowS}</a></p>` : ""}
      </section>`,
      )
      .join("");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("mr-head");
    head.innerHTML = `
      <div class="mr-head__bar">
        <a class="mr-logo" href="index.html" aria-label="First Page"><span class="mr-logo__word">logo</span><span class="mr-logo__word mr-logo__word--on" aria-hidden="true">logo</span></a>
        <nav class="mr-head__nav" aria-label="Main menu">
          <ul class="mr-gnav">
            <li><a class="mr-gnav__link" href="index.html"${cur("home")}>TOP</a></li>
            <li><a class="mr-gnav__link" href="about.html"${cur("about")}>ABOUT</a></li>
            <li><a class="mr-gnav__link" href="service.html"${cur("service")}>FEATURE</a></li>
            <li><button class="mr-gnav__link mr-gnav__drop" type="button" aria-expanded="false" aria-controls="mr-drawer"${page === "product" ? ' aria-current="page"' : ""}><span>PRODUCTS</span>${chev}</button></li>
            <li><a class="mr-gnav__link" href="index.html#news">NEWS</a></li>
            <li><a class="mr-gnav__link" href="#">COMPANY</a></li>
            <li class="mr-gnav__cta">${btn("CONTACT", "accent", "#", "mr-btn--sm")}</li>
          </ul>
        </nav>
        <ul class="mr-icons">
          <li><a class="mr-icon" href="#" aria-label="My Page"><span class="mr-icon__art" data-fx="lottie-hover-play" data-fx-lottie-hover-play="data: mrMypage; host: .mr-icon; from: 2; min: 1024"></span></a></li>
          <li><button class="mr-icon" type="button" aria-label="Cart" data-cart-open><span class="mr-icon__art" data-fx="lottie-hover-play" data-fx-lottie-hover-play="data: mrCart; host: .mr-icon; from: 11; min: 1024"></span></button></li>
          <li class="mr-burger-li"><button class="mr-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button></li>
        </ul>
      </div>
      <div class="mr-drawer" id="mr-drawer" aria-hidden="true" data-slot="products-drawer">
        <div class="mr-drawer__inner">
          <p class="mr-drawer__title"><a href="product.html">PRODUCTS <span class="mr-drawer__titleIcon">${arrowS}</span></a></p>
          <div class="mr-drawer__grid">${productCols("mr-dcol")}${related}</div>
          <p class="mr-drawer__foot"><button class="mr-drawer__close" type="button"><span aria-hidden="true">×</span> CLOSE</button></p>
        </div>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="mr-menu" data-slot="mobile-menu" aria-hidden="true">
        <div class="mr-menu__inner">
          <ul class="mr-menu__list">
            <li><a href="index.html">TOP</a></li>
            <li><a href="about.html">ABOUT</a></li>
            <li><a href="service.html">FEATURE</a></li>
            <li class="mr-menu__acc"><button type="button" aria-expanded="false"><span>PRODUCTS</span>${chev}</button>
              <div class="mr-menu__panel"><div><ul class="mr-menu__prods">${products.map((p) => `<li><span class="wf-img wf-r-4x3" data-label="${p.label.replace(" · Landscape 4:3", "")}"></span><a href="product.html">${p.cat} ${arrowS}</a></li>`).join("")}</ul><a class="mr-menu__all" href="product.html">ALL PRODUCTS</a></div></div></li>
            <li><a href="index.html#news">NEWS</a></li>
            <li><a href="#">COMPANY</a></li>
            <li><a href="#">CONTACT</a></li>
          </ul>
          <a class="mr-menu__bnr" href="#"><span class="mr-partner"><b>PARTNER<br>SHOP</b><svg class="mr-art mr-art--girl" aria-hidden="true"><use href="#mr-girl"/></svg></span></a>
          <ul class="mr-menu__sns">${["X", "IG", "YT", "TT"].map((s) => `<li><a href="#" aria-label="SNS ${s}"><svg class="mr-sns"><use href="#mr-sns-${s.toLowerCase()}"/></svg></a></li>`).join("")}</ul>
        </div>
      </div>
      <section class="mr-cart" data-slot="cart-drawer" aria-hidden="true">
        <div class="mr-cart__veil" data-cart-close></div>
        <div class="mr-cart__box" role="dialog" aria-label="Cart">
          <div class="mr-cart__head"><h2>CART</h2><button type="button" class="mr-cart__x" data-cart-close aria-label="Close"><i></i><i></i></button></div>
          <div class="mr-cart__list"><p class="mr-cart__empty">Your cart is empty.</p></div>
          <div class="mr-cart__total">
            <p class="mr-cart__sum"><span>Total</span><span>₩ 0</span></p>
            <p class="mr-cart__note">Shipping is calculated at checkout.</p>
            <div class="mr-cart__go">${btn("CHECK OUT", "accent")}</div>
          </div>
        </div>
      </section>`,
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("mr-foot");
    foot.innerHTML = `
      <section class="mr-foot__sns">
        <h2 class="mr-foot__snsTitle">View SNS news</h2>
        <ul>${["x", "ig", "yt", "tt"].map((s) => `<li><a href="#" aria-label="SNS ${s}"><svg class="mr-sns"><use href="#mr-sns-${s}"/></svg></a></li>`).join("")}</ul>
      </section>
      <nav class="mr-foot__nav" aria-label="Footer Menu">
        <ul>
          <li><a href="index.html">TOP</a></li><li><a href="about.html">ABOUT</a></li><li><a href="service.html">FEATURE</a></li>
          <li><a href="product.html">PRODUCTS</a></li><li><a href="#">FAQ</a></li><li><a href="index.html#news">NEWS</a></li><li><a href="#">COMPANY</a></li>
        </ul>
      </nav>
      <div class="mr-foot__divider"></div>
      <div class="mr-foot__products">${productCols("mr-fcol")}${related}
        <div class="mr-foot__corner">
          <a class="mr-foot__logo" href="index.html" aria-label="First Page"><span class="mr-logo__word">logo</span></a>
          <a class="mr-foot__bnr" href="#"><span class="mr-partner"><b>PARTNER<br>SHOP</b><svg class="mr-art mr-art--girl" aria-hidden="true"><use href="#mr-girl"/></svg></span></a>
        </div>
      </div>
      <div class="mr-foot__bottom">
        <p class="mr-foot__copy">© logo</p>
        <ul class="mr-foot__policy">${["Privacy policy", "Terms of Use", "Warranty terms", "E-commerce disclosure", "Subscription Purchase Policy", "Notice on sending user information externally"].map((t) => `<li><a href="#"><span>${t}</span></a></li>`).join("")}</ul>
      </div>`;
    foot.insertAdjacentHTML(
      "afterend",
      `<div class="mr-top" data-slot="page-top">
        <div class="mr-top__inner">
          <div class="mr-top__art">
            <div class="mr-top__lottie mr-top__lottie--pc is-current" data-top="hover"></div>
            <div class="mr-top__lottie mr-top__lottie--pc mr-top__lottie--abs" data-top="success"></div>
            <div class="mr-top__lottie mr-top__lottie--pc mr-top__lottie--abs" data-top="miss"></div>
            <div class="mr-top__lottie mr-top__lottie--sp" data-top="sp"></div>
            <button class="mr-top__btn" type="button" aria-label="Back to top"></button>
          </div>
        </div>
      </div>
      <div class="mr-shop" data-slot="shopping-banner">
        <div class="mr-shop__tail" aria-hidden="true"></div>
        <a class="mr-shop__link" href="product.html"><span class="mr-shop__bg"></span><span class="mr-shop__text">GO<br class="mr-shop__br"> SHOPPING</span><span class="mr-shop__icon">${arrowS}</span></a>
      </div>`,
    );
  }

  // ── Photo strip: ten photos in two sets (shared by first page·FEATURE·PRODUCTS) ──
  const stripShots = ["Cat dozing by the window", "A cat passing by the device", "Cat on a Person’s Lap", "Cat in front of the feeder", "Cat chasing a toy", "Two on the sofa", "Cat coming out of the bathroom", "Cat drinking water", "Cat wearing a necklace", "Cat in a basket"];
  document.querySelectorAll(".mr-strip__list").forEach((ul) => {
    ul.innerHTML = stripShots.map((s) => `<li><span class="wf-img wf-r-4x3" data-label="${s} · Bright lifestyle photo · landscape 4:3"></span></li>`).join("");
  });

  // ── Header: product drawer (1200 and up) · hamburger (under 1200) · cart ──
  const bar = document.querySelector(".mr-head");
  const drop = document.querySelector(".mr-gnav__drop");
  const drawer = document.querySelector(".mr-drawer");
  const menu = document.querySelector(".mr-menu");
  const burger = document.querySelector(".mr-burger");
  const isPc = () => innerWidth >= 1200;
  const setDrawer = (open) => {
    if (!drawer) return;
    if (open && !isPc()) return;
    drawer.classList.toggle("is-active", open);
    drawer.setAttribute("aria-hidden", String(!open));
    drop?.classList.toggle("is-active", open);
    drop?.setAttribute("aria-expanded", String(open));
    bar?.classList.toggle("is-drawer-open", open);
  };
  drop?.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-active")));
  document.querySelector(".mr-drawer__close")?.addEventListener("click", () => setDrawer(false));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setDrawer(false);
    setMenu(false);
    setCart(false);
  });
  document.addEventListener("click", (e) => {
    if (drawer?.classList.contains("is-active") && !e.target.closest(".mr-drawer, .mr-gnav__drop")) setDrawer(false);
  });

  const setMenu = (open) => {
    if (!menu) return;
    document.body.style.overflow = open ? "hidden" : "";
    burger?.classList.toggle("is-active", open);
    burger?.setAttribute("aria-expanded", String(open));
    burger?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    menu.classList.toggle("is-active", open);
    menu.setAttribute("aria-hidden", String(!open));
    bar?.classList.toggle("is-menu-open", open);
    if (!open) {
      menu.querySelectorAll(".mr-menu__acc").forEach((li) => {
        li.classList.remove("is-open");
        li.querySelector("button").setAttribute("aria-expanded", "false");
      });
      setTimeout(() => menu.scrollTo(0, 0), 300);
    }
  };
  burger?.addEventListener("click", () => setMenu(!menu.classList.contains("is-active")));
  menu?.querySelectorAll(".mr-menu__acc > button").forEach((b) =>
    b.addEventListener("click", () => {
      const li = b.parentElement;
      const open = !li.classList.contains("is-open");
      li.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
    }),
  );
  addEventListener("resize", () => {
    if (isPc()) setMenu(false);
    else setDrawer(false);
  });

  const cart = document.querySelector(".mr-cart");
  const setCart = (open) => {
    if (!cart) return;
    cart.classList.toggle("is-active", open);
    cart.setAttribute("aria-hidden", String(!open));
  };
  document.querySelectorAll("[data-cart-open]").forEach((b) => b.addEventListener("click", () => setCart(true)));
  document.querySelectorAll("[data-cart-close]").forEach((b) => b.addEventListener("click", () => setCart(false)));

  // ── Back-to-top toy: shakes while hovered, and on press a 50/50 chance to catch (to top after 3 seconds) or miss. On phones, press goes straight to top ──
  const topWrap = document.querySelector(".mr-top");
  const shop = document.querySelector(".mr-shop");
  const art = window.MR_ART;
  if (topWrap && window.lottie && art) {
    const el = (k) => topWrap.querySelector(`[data-top="${k}"]`);
    const load = (k, data, loop = false, autoplay = false) => lottie.loadAnimation({ container: el(k), renderer: "svg", loop, autoplay: autoplay && !reduce, animationData: data });
    const hov = load("hover", art.topHover());
    const ok = load("success", art.topSuccess());
    const miss = load("miss", art.topMiss());
    const sp = load("sp", art.topSp(), false, true);
    let busy = false;
    const show = (k) => ["hover", "success", "miss"].forEach((n) => el(n).classList.toggle("is-current", n === k));
    const init = () => {
      hov.goToAndStop(0, true);
      ok.goToAndStop(0, true);
      miss.goToAndStop(0, true);
      hov.onComplete = null;
      show("hover");
    };
    setInterval(() => {
      if (!reduce && (sp.isPaused || sp.isStopped)) sp.goToAndPlay(0);
    }, 30000);
    const success = () => {
      show("success");
      ok.play();
      setTimeout(() => scrollTo({ top: 0, behavior: "smooth" }), 3000);
      ok.onComplete = () => { init(); busy = false; };
    };
    const missed = () => {
      show("miss");
      miss.play();
      miss.onComplete = () => { init(); busy = false; };
    };
    const roll = () => (Math.random() < 0.5 ? success() : missed());
    const b = topWrap.querySelector(".mr-top__btn");
    b.addEventListener("mouseenter", () => {
      if (busy || reduce) return;
      hov.loop = true;
      hov.play();
    });
    b.addEventListener("mouseleave", () => {
      if (busy) return;
      hov.loop = false;
    });
    b.addEventListener("click", () => {
      if (innerWidth < 768 || reduce) return scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (busy) return;
      busy = true;
      if (!hov.isPaused && hov.currentFrame < hov.totalFrames - 1) {
        hov.loop = false;
        hov.onComplete = roll;
      } else roll();
    });
    init();

    // Tail band: shakes once, rests 3s, then starts over
    const tail = lottie.loadAnimation({ container: shop.querySelector(".mr-shop__tail"), renderer: "svg", loop: false, autoplay: false, animationData: art.tail() });
    tail.addEventListener("complete", () => setTimeout(() => tail.goToAndPlay(0, true), 3000));
    if (!reduce) tail.play();
  }

  // The shopping band runs from the first page and the FEATURE start position until 500px before the footer, after which a toy stands at the very top
  if (topWrap && shop) {
    const withShop = page === "home" || page === "service";
    let startTop = 1, endTop = 0;
    // Like the original, measured with offsetTop (relative to the nearest positioned ancestor) only when the script runs and when the width changes — measured before photos and fixed offsets attach
    // In the original, toys actually start standing from around the product section (original screen as is)
    const measure = () => {
      const area = document.querySelector(".mr-top-area");
      startTop = withShop && area ? area.offsetTop : 1;
      const f = document.querySelector(".mr-foot");
      if (f) endTop = f.offsetTop + (innerWidth < 768 ? 100 : -500);
    };
    const toggle = () => {
      const y = scrollY;
      const before = y < startTop;
      const mid = y > startTop && y + innerHeight < endTop;
      shop.classList.toggle("is-active", withShop && mid);
      topWrap.classList.toggle("is-active", !before && !mid);
    };
    addEventListener("scroll", toggle, { passive: true });
    let t;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { measure(); toggle(); }, 200); });
    measure();
    toggle();
  }

  // ── Original data-attribute entrance group: when a [data-anim] panel reaches the screen start (default bottom), the pieces inside move ──
  const mm = gsap.matchMedia();
  const num = (v, d) => (v == null || v === "" ? d : Number(v));
  mm.add({ sm: "(max-width: 767px)", md: "(min-width: 600px) and (max-width: 1023px)", lg: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    let imgTimer = 0;
    const { sm, md, lg } = ctx.conditions;
    if (ctx.conditions.reduce) {
      document.querySelectorAll("[data-inview]").forEach((e) => e.classList.add("is-inview"));
      return;
    }
    const pick = (el, key, d) => {
      const s = el.dataset[key];
      const m = el.dataset["md" + key[0].toUpperCase() + key.slice(1)] ?? s;
      const l = el.dataset["lg" + key[0].toUpperCase() + key.slice(1)] ?? m;
      return lg ? (l ?? d) : md ? (m ?? d) : (s ?? d);
    };
    document.querySelectorAll("[data-anim]").forEach((area) => {
      const start = `top ${pick(area, "start", "bottom")}`;
      area.querySelectorAll("[data-fadein]").forEach((el) => {
        gsap.fromTo(el, { x: num(pick(el, "x"), 0), y: num(pick(el, "y"), 0), opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration: num(el.dataset.speed, 1.4), ease: el.dataset.ease || "power2", delay: num(lg || md ? el.dataset.mdDelay ?? el.dataset.delay : el.dataset.delay, 0), scrollTrigger: { trigger: area, start } });
      });
      area.querySelectorAll("[data-scaleup]").forEach((el) => {
        gsap.from(el, { scale: num(pick(el, "scale"), 0), duration: num(el.dataset.speed, 1), ease: el.dataset.ease || "power2", delay: num(el.dataset.delay, 0), scrollTrigger: { trigger: area, start } });
      });
      area.querySelectorAll("[data-inview]").forEach((el) => {
        ScrollTrigger.create({ trigger: area, start, once: true, onEnter: () => gsap.delayedCall(num(el.dataset.delay, 0), () => el.classList.add("is-inview")) });
      });
    });
    // Image 1.1× → 1 (1s power1.out) — when the panel’s top edge reaches 80% of the screen, ”continue” follows on a 0.2s stagger. As in the original, it is set after 200ms so the position is measured once the fixed offset has applied
    imgTimer = setTimeout(() => document.querySelectorAll("[data-img-area]").forEach((area) => {
      const els = [...area.querySelectorAll("[data-img-in]")];
      els.forEach((el, i) => {
        const mode = el.dataset.delay;
        const pc = innerWidth >= 768;
        const fwd = mode === "continue" || (mode === "continue-reverse-pc" && !pc) || (mode === "continue-reverse-sp" && pc);
        const back = mode === "continue-reverse" || (mode === "continue-reverse-pc" && pc) || (mode === "continue-reverse-sp" && !pc);
        const delay = fwd ? i * 0.2 : back ? (els.length - i) * 0.2 : num(mode, 0);
        ctx.add(() => gsap.fromTo(el, { scale: num(el.dataset.scale, 1.1) }, { scale: 1, delay, ease: el.dataset.ease || "power1.out", duration: 1, scrollTrigger: { trigger: area, start: "top 80%", end: "bottom 20%" } }));
      });
    }), 200);
    // Parallax: from when the panel enters the screen (top bottom) until it leaves (bottom top), -y/2 → y/2, power2.out, scrub 1 (separate values for phone size)
    document.querySelectorAll("[data-px-area]").forEach((area) => {
      area.querySelectorAll("[data-px]").forEach((el) => {
        const y = num(sm ? el.dataset.y : el.dataset.mdY ?? el.dataset.y, 0);
        const scrub = num(sm ? el.dataset.scrub : el.dataset.mdScrub ?? el.dataset.scrub, 1) || 1;
        gsap.fromTo(el, { y: -y / 2 }, { y: y / 2, ease: el.dataset.ease || "power2.out", scrollTrigger: { trigger: area, start: "top bottom", end: "bottom top", scrub } });
      });
    });
    return () => clearTimeout(imgTimer);
  });

  // Section sink: while the next section travels from bottom to top of the screen, the previous section’s inside goes down by half the screen height and is laid behind (PC devices only)
  if (!isMobile) document.querySelectorAll("[data-sink-area]").forEach((a) => a.classList.add("is-sink"));
})();
