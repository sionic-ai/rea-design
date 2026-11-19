// Header row, drawer, tagline strip and footer are the same across seven pages, so build them once here and plug them in
(() => {
  // Round badge (mountain and waves) — the spot to the right of the wordmark, redrawn at the same ratio as the original spot
  const EMBLEM = (x, y, r) => `<g class="rz-emblem" transform="translate(${x} ${y})" fill="currentColor" fill-rule="evenodd"><path d="M0 ${-r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}Zm0 ${r * .2}a${r * .8} ${r * .8} 0 1 0 0 ${r * 1.6}a${r * .8} ${r * .8} 0 1 0 0 ${-r * 1.6}Z"/><path d="M${-r * .62} ${r * .1}L${-r * .12} ${-r * .55}L${r * .18} ${-r * .18}L${r * .38} ${-r * .38}L${r * .66} ${r * .1}Z"/><rect x="${-r * .7}" y="${r * .28}" width="${r * 1.4}" height="${r * .12}"/><rect x="${-r * .5}" y="${r * .5}" width="${r}" height="${r * .12}"/></g>`;
  const LOGO = `<svg viewBox="0 0 228 40" aria-label="Brand Wordmark Slot"><text class="rz-logo__word" x="0" y="34">BRAND NAME</text>${EMBLEM(208, 20, 18)}</svg>`;
  const ICON = {
    pin: '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 13s5-4.6 5-8A5 5 0 0 0 1 5c0 3.4 5 8 5 8Z"/><circle cx="6" cy="5" r="1.8"/></svg>',
    cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/></svg>',
    f: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/></svg>',
    // Slogan strip art: line drawings in place of the running animals and the person on a bike
    deer: '<svg viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 30c6-2 18-2 24 0l4-8 5-2M14 30l-4 14M20 31l1 13M32 31l3 13M37 30l5 12M42 20l-2-9M40 16l-5-4M42 12l2-7"/></svg>',
    bike: '<svg viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="36" r="8"/><circle cx="38" cy="36" r="8"/><path d="M12 36l9-14h12l5 14M21 22l-3-6h-4M33 22l-3-8h4"/><circle cx="27" cy="9" r="3"/></svg>',
  };
  const NAV = [
    { ttl: "OFFICE", tall: true, items: ["Office Hero", "Characteristic", "Office list", ["Pricing · Services", ["Coworking space", "Reserved seat", "Private office"]], "Getting here", "Office contact"] },
    { ttl: "HOUSE", tall: true, items: ["House Hero", "Characteristic", "Vacant room info", "Area Info", "Getting here", "House Contact"] },
    { ttl: "EVENT SPACE", tall: true, items: ["Event space Hero", ["Space Five", ["Space name 1", "Space name 2", "Space name 3", "Space name 4", "Space name 5"]], "Usage guide", "Getting here", "Event details", "Event space inquiry"] },
    { ttl: "PRESCHOOL", items: ["Preschool ↗"] },
    { ttl: "PEOPLE", items: ["About members", "Interview"] },
  ];
  const href = (t) => (/Features/.test(t) ? "service.html" : /pricing|coworking|dedicated desk|personal/.test(t) ? "plan.html" : /Event|Interview/.test(t) ? "news.html" : "#");
  const list = (items) => items.map((it) => Array.isArray(it)
    ? `<li><a href="${href(it[0])}">${it[0]}</a><ul class="sub">${it[1].map((s) => `<li><a href="${href(s)}">${s}</a></li>`).join("")}</ul></li>`
    : `<li><a href="${href(it)}">${it}</a></li>`).join("");
  const fnav = `<div class="rz-fnav">${NAV.map((n) => `<div class="${n.tall ? "is-tall" : ""}"><p class="rz-fnav__ttl">${n.ttl}</p><ul>${list(n.items)}</ul></div>`).join("")}
    <div><p class="rz-fnav__ttl">ABOUT</p><ul><li><a href="about.html">About</a><ul class="sub"><li><a href="about.html">Region 1</a></li><li><a href="about.html">Region 2</a></li></ul></li><li><a href="about.html">Getting here</a></li><li><a href="news.html">Daily Post</a></li><li><a href="recruit.html">Hiring</a></li></ul></div></div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    const sub = (items) => `<div class="rz-sub"><ul>${items.map((t) => `<li><a href="${href(t)}">${t}</a></li>`).join("")}</ul></div>`;
    head.className = "rz-head";
    head.innerHTML = `<div class="rz-head__in">
        <a class="rz-logo" href="index.html">${LOGO}</a>
        <nav class="rz-nav" aria-label="Main menu"><ul class="rz-nav__list">
          <li class="rz-pd"><span class="rz-pd__btn"><span>Office</span></span>${sub(["Office Hero", "Characteristic", "Office list", "Pricing · Services", "Getting here", "Inquiry"])}</li>
          <li class="rz-pd"><span class="rz-pd__btn"><span>House</span></span>${sub(["House Hero", "Characteristic", "Vacant room info", "Getting here", "Inquiry"])}</li>
          <li class="rz-pd"><span class="rz-pd__btn"><span>Event Space</span></span>${sub(["Hero", "Space name 1", "Space name 2", "Space name 3", "Usage guide", "Event details"])}</li>
          <li><a class="rz-nav__item" href="#">Preschool</a></li>
          <li class="rz-pd"><span class="rz-pd__btn"><span>People</span></span>${sub(["About members", "Interview"])}</li>
          <li><a class="rz-btn is-reverse" href="#contact"><span>Contact Us</span></a></li>
          <li class="rz-lang"><a class="jp current" href="#"><span>JP</span></a><a class="en" href="#"><span>EN</span></a></li>
        </ul></nav>
      </div>`;
    const burger = document.createElement("button");
    burger.className = "rz-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Menu");
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = "<i></i>";
    const drawer = document.createElement("nav");
    drawer.className = "rz-drawer";
    drawer.setAttribute("aria-label", "Full menu");
    drawer.innerHTML = fnav;
    head.after(burger, drawer);
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("is-drawer-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) { document.body.classList.remove("is-drawer-open"); burger.setAttribute("aria-expanded", "false"); } });
    const onScroll = () => head.classList.toggle("is-show", scrollY > 0);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const band = document.querySelector('[data-slot="motto-band"]');
  if (band) {
    const slide = `<div class="swiper-slide"><div class="rz-motto">${ICON.deer}<b>A SHORT MOTTO GOES HERE.</b>${ICON.bike}<b class="is-line">A SHORT MOTTO GOES HERE.</b></div></div>`;
    band.classList.add("rz-band", "swiper");
    band.innerHTML = `<div class="swiper-wrapper">${slide.repeat(5)}</div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "rz-foot";
    foot.innerHTML = `<div class="rz-foot__contact" id="contact"><div class="rz-inner"><p>One line here saying inquiries are received through a form.</p><div class="rz-btn-wrap"><a class="rz-btn" href="#"><span>Contact Us</span></a></div></div></div>
      <div class="rz-inner">${fnav}
        <div class="rz-foot__bottom">
          <div class="rz-sns"><p class="rz-fnav__ttl">FOLLOW US</p><ul><li><a href="#">${ICON.cam}<span>Account 1</span></a></li><li><a href="#">${ICON.cam}<span>Account 2</span></a></li><li><a href="#">${ICON.cam}<span>Account 3</span></a></li><li><a href="#" aria-label="SNS">${ICON.f}</a></li><li><a href="#" aria-label="Video">${ICON.play}</a></li></ul></div>
          <a class="rz-foot__logo" href="index.html">${LOGO}</a>
        </div>
      </div>
      <div class="rz-foot__legal"><p>Copyright © BRAND NAME, All rights reserved.</p><ul><li><a href="#">Company info</a></li><li><a href="recruit.html">Hiring</a></li><li><a href="news.html">News</a></li><li><a href="#">Privacy policy</a></li></ul><p class="note">Your two lines here forbidding unauthorized use of the site’s text and photos. Follow with a sentence asking people to get in touch first if they want to use them.</p></div>`;
  }

  // While the white veil lifts after the first paint, the body goes 0 → 1 over 1s (original jQuery animate default swing)
  const wrap = document.querySelector(".rz-wrap");
  const loader = document.querySelector(".rz-loader");
  if (wrap && loader && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wrap.classList.add("is-wait");
    loader.addEventListener("fx:done", () => { wrap.classList.add("is-in"); wrap.classList.remove("is-wait"); document.dispatchEvent(new CustomEvent("rz:ready")); }, { once: true });
  } else document.addEventListener("DOMContentLoaded", () => document.dispatchEvent(new CustomEvent("rz:ready")));

  // Slogan strip — original Swiper 8.0.5 as is: endless (loop) · 18s per cell · nonstop (autoplay 0) · linear
  addEventListener("load", () => {
    if (!band || !window.Swiper || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    new Swiper(band, { loop: true, loopedSlides: 5, slidesPerView: "auto", spaceBetween: 0, speed: 18000, allowTouchMove: false, autoplay: { delay: 0, disableOnInteraction: false } });
  });
})();
