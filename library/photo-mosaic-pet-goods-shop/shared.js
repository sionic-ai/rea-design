// One place wires up the header bar, menu drawer, footer, round cursor, reveals and Swiper shared by all seven pages.
// The original only adds classes with jQuery+ScrollMagic and lets CSS transitions do the motion — ported with the same ScrollMagic scene values (offset 60, triggerHook onEnter, reverse false).
(() => {
  const ICON = {
    insta: '<svg viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="4.5"/><circle cx="10" cy="10" r="3.6"/><circle cx="14.6" cy="5.4" r=".6"/></svg>',
    user: '<svg viewBox="0 0 20 20"><circle cx="10" cy="6.5" r="3.8"/><path d="M2.8 18.5c.8-4 3.6-6.2 7.2-6.2s6.4 2.2 7.2 6.2"/></svg>',
    cart: '<svg viewBox="0 0 20 20"><path d="M1.5 2.5h2.6l2.3 10.2h9.4l2-7.2H5.2"/><circle cx="7.6" cy="16.6" r="1.2"/><circle cx="14.6" cy="16.6" r="1.2"/></svg>',
  };
  const PAGES = [
    ["Home", "index.html"], ["Products", "product.html"], ["Gallery", "lookbook.html"],
    ["About", "about.html"], ["News", "news.html"], ["Journal", "news.html#journal"],
  ];
  const CATS = Array.from({ length: 17 }, (_, i) => `Category name ${String(i + 1).padStart(2, "0")}`);
  const CAT_SHOTS = ["Full product styled shot", "Limited item shot", "New Product Shot", "Collab product shot", "Bundle product shot", "Cat on a food bowl", "Water bowl and cat", "Cat on a scratcher", "Cat on a cat tower", "Cat lying on a cushion", "Cat in a bag", "Cat biting a toy", "Cat being brushed", "Snack bowl shot", "Living room props shot", "Gift box shot", "Other product shot"];

  const header = `
  <header class="ac-header" data-slot="header" data-expanded="false">
    <button class="ac-burger" type="button" aria-label="Open Menu" data-expanded="false"><span class="ac-burger__list"><span class="ac-burger__line"></span><span class="ac-burger__line"></span></span></button>
    <a class="ac-header__logo" href="index.html" data-label="Brand wordmark (thin capitals, wide letter spacing)">&amp; NAME</a>
    <div class="ac-header__navi">
      <a class="ac-header__online" href="product.html" data-label="Shop entrance English button">Online store</a>
      <ul class="ac-header__icons">
        <li class="ac-header__insta"><a href="#" aria-label="Social Media">${ICON.insta}</a></li>
        <li><a href="#" aria-label="Log in">${ICON.user}</a></li>
        <li><a href="#" aria-label="Cart">${ICON.cart}<span class="ac-header__bubble">0</span></a></li>
      </ul>
    </div>
  </header>
  <div class="ac-nav" data-slot="menu-drawer" data-expanded="false">
    <button class="ac-nav__bg" type="button" aria-label="Close Menu"></button>
    <div class="ac-nav__panel">
      <div class="ac-nav__body">
        <div class="ac-nav__layout">
          <div class="ac-nav__col">
            <p class="ac-nav__title">Products</p>
            <ul class="ac-nav__cats">${CATS.map((c, i) => `<li data-cat="${i}"><a href="product.html"><span class="ac-uline">${c}</span></a></li>`).join("")}</ul>
          </div>
          <ul class="ac-nav__col ac-nav__links">${PAGES.map(([n, h]) => `<li><a href="${h}"><span class="ac-uline">${n}</span></a></li>`).join("")}</ul>
        </div>
        <ul class="ac-nav__slide">${CAT_SHOTS.map((s, i) => `<li data-cat="${i}"${i ? "" : ' class="is-on"'}><div class="wf-img" data-label="${s} · Bright indoor natural light · portrait 4:5"></div></li>`).join("")}</ul>
      </div>
      <div class="ac-nav__sns">
        <a href="#" aria-label="Social Media" class="ac-header__icons">${ICON.insta}</a>
        <p class="ac-nav__note"><span>Your one-line notice goes here</span></p>
      </div>
    </div>
  </div>`;

  const footer = `
  <footer class="ac-footer" data-slot="footer">
    <div class="ac-footer__bg"><div class="wf-img" data-label="Cat and human legs walking across the floor · dim interior · full-width landscape"></div></div>
    <div class="ac-footer__contents">
      <ul class="ac-conv" data-slot="footer-conversion">
        <li><a href="#"><div class="ac-conv__view"><p class="ac-conv__en">Our Instagram</p><p class="ac-conv__jp">Your guidance line goes here</p><span class="ac-btn">Official Instagram</span></div></a></li>
        <li><a href="#"><div class="ac-conv__view"><p class="ac-conv__en">Contact Us</p><p class="ac-conv__jp">Your contact guidance goes here</p><span class="ac-btn">Contact</span></div></a></li>
      </ul>
      <ul class="ac-flist">
        <li>
          <p class="ac-flist__title">( Information )</p>
          <div class="ac-finfo">
            <a class="ac-finfo__logo" href="index.html" data-label="Brand wordmark">&amp; NAME</a>
            <div class="ac-finfo__addr">
              <p>Shop Name</p>
              <p>Your first address line goes here<br>Your address second line here</p>
              <p>MAIL：hello@example.com</p>
              <ul><li><a href="page.html">Terms of service</a></li><li><a href="page.html">Privacy policy</a></li><li><a href="page.html">Legal notice</a></li></ul>
            </div>
          </div>
        </li>
        <li><p class="ac-flist__title">( site map )</p><ul class="ac-fnav">${PAGES.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join("")}<li><a href="#">Contact</a></li></ul></li>
        <li><p class="ac-flist__title">( sns )</p><ul class="ac-fnav"><li><a href="#">Instagram</a></li><li><a href="#">Brand</a></li><li><a href="#">X</a></li></ul></li>
        <li>
          <p class="ac-flist__title">( support )</p>
          <ul class="ac-fnav"><li><a href="#">Shopping guide</a></li></ul>
          <ul class="ac-fguide"><li><a href="#">Log in</a></li><li><a href="#">Create account</a></li></ul>
          <p class="ac-flist__title" style="margin-bottom: calc(3 * var(--u))">( language )</p>
          <div class="ac-flang"><a href="#">Korean</a><a href="#" class="is-current">English</a><a href="#">中文</a></div>
        </li>
      </ul>
      <div class="ac-footer__area">
        <a class="ac-footer__top" href="#top" aria-label="Back to top"><svg viewBox="0 0 60 40"><path d="M2 38 30 4l28 34M8 1h44" stroke-width="1"/></svg></a>
        <p class="ac-footer__copy">©0000 Shop Name All Rights Reserved.</p>
      </div>
    </div>
  </footer>`;

  document.body.id = "top";
  document.body.insertAdjacentHTML("afterbegin", header);
  const main = document.querySelector("main");
  (main || document.body).insertAdjacentHTML("afterend", footer);
  // The circular cursor is placed only on the page (first page) that has Next/Prev spots, as in the original
  const zones = [...document.querySelectorAll("[data-cursor]")];
  if (zones.length) document.body.insertAdjacentHTML("beforeend", '<div class="ac-cursor" data-slot="cursor" aria-hidden="true"><span></span></div>');

  // Drawer — pressing the hamburger or backdrop flips data-expanded on body, header line and drawer together
  const head = document.querySelector(".ac-header");
  const burger = document.querySelector(".ac-burger");
  const nav = document.querySelector(".ac-nav");
  let open = false;
  const toggle = () => {
    open = !open;
    document.body.classList.toggle("is-nav", open);
    for (const el of [head, burger, nav]) el.setAttribute("data-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  burger.addEventListener("click", toggle);
  nav.querySelector(".ac-nav__bg").addEventListener("click", toggle);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) toggle(); });

  // Hovering a category overlays its photo on top of the first photo (the first photo is always on)
  const shots = [...nav.querySelectorAll(".ac-nav__slide li")];
  nav.querySelectorAll(".ac-nav__cats li").forEach((li) => {
    const shot = shots[Number(li.dataset.cat)];
    li.addEventListener("mouseenter", () => { if (shot !== shots[0]) shot.classList.add("is-on"); });
    li.addEventListener("mouseleave", () => { if (shot !== shots[0]) shot.classList.remove("is-on"); });
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctrl = new ScrollMagic.Controller();

  // Header bar — fills the background after scrolling 60px
  new ScrollMagic.Scene({ offset: 60 })
    .on("enter", () => head.classList.add("is-scroll"))
    .on("leave", () => head.classList.remove("is-scroll"))
    .addTo(ctrl);

  // Reveal — when it touches the bottom edge of the screen (onEnter), is-in is added after data-anime-delay(ms) and is never reverted
  document.querySelectorAll("[data-anime]").forEach((el) => {
    const go = () => setTimeout(() => el.classList.add("is-in"), Number(el.dataset.animeDelay || 0));
    if (reduce) return el.classList.add("is-in");
    new ScrollMagic.Scene({ triggerElement: el, triggerHook: "onEnter", reverse: false }).on("enter", go).addTo(ctrl);
  });

  // Circular cursor — moving inline transform to the mouse position makes a CSS transition (.5s) trail behind.
  // In the original too, inline translate overrides the scale rule so in practice only opacity changes
  const cursor = document.querySelector(".ac-cursor");
  const label = cursor?.querySelector("span");
  const mm = gsap.matchMedia();
  if (cursor) mm.add("(prefers-reduced-motion: no-preference) and (min-width: 751px)", () => {
    const move = (e) => { cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; };
    const on = (e) => { cursor.classList.add("is-active"); label.textContent = e.currentTarget.dataset.cursor === "next" ? "Next" : "Prev"; };
    const off = () => { cursor.classList.remove("is-active"); label.textContent = ""; };
    document.addEventListener("mousemove", move);
    zones.forEach((z) => { z.addEventListener("mouseenter", on); z.addEventListener("mouseleave", off); });
    return () => {
      document.removeEventListener("mousemove", move);
      zones.forEach((z) => { z.removeEventListener("mouseenter", on); z.removeEventListener("mouseleave", off); });
    };
  });

  // Recommendation strip at the end of subpages — Swiper only below 750 (1.5 slides centered, 5px gap)
  (() => {
    const els = document.querySelectorAll("[data-slider='recommend']");
    if (!els.length) return;
    const mq = matchMedia("(max-width: 750px)");
    let list = [];
    const set = () => {
      list.forEach((s) => s.destroy(true, true));
      list = [];
      if (mq.matches) els.forEach((el) => list.push(new Swiper(el, { loop: true, slidesPerView: 1.5, spaceBetween: 5, centeredSlides: true })));
    };
    mq.addEventListener("change", set);
    set();
  })();
  window.acReduce = reduce;
})();
