// Common to all pages — inserts the header row · menu panel · drag cursor · white footer as one set, with menu open/close, close-button bubbles, Hero cursor text ·
// Attaches the second header line, photo parallax (Ukiyo) and swiper. Transition veil, text settle, letter tinting, marquee, list panel and wordmark are attached by _fx motion parts via data-fx.
(() => {
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const PAGES = [["index.html", "Menu 1"], ["about.html", "Menu 2"], ["list.html", "Menu 3"], ["service.html", "Menu 4"], ["recruit.html", "Menu 5"], ["#get-started", "Menu 6"]];
  const here = location.pathname.split("/").pop() || "index.html";
  const cur = (h) => (h === here ? ' aria-current="page"' : "");
  const tint = (h, t, cls = "") => `<a class="${cls}" href="${h}" data-fx="char-stagger-tint"${cur(h)}>${t}</a>`;
  const MARK = '<svg viewBox="0 0 16 18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 2l6 14 6-14M5 2h6"/></svg>';

  const slot = document.querySelector('[data-slot="header"]');
  if (slot) {
    slot.innerHTML = `<div class="sd-nav" data-sd-nav>
      <div class="sd-nav__in">
        <a class="sd-brand" href="index.html" aria-label="First Page">${MARK}Your business name here<sup class="t-14">TM</sup></a>
        <div class="sd-nav__right">
          <div class="sd-nav__links">${PAGES.slice(1, 4).map(([h, t]) => `<a class="sd-nav__link" href="${h}"${cur(h)} data-fx="sweep-through-hover" data-fx-sweep-through-hover="look: line" style="--fx-dur: .25s; --fx-ease: ease-out; --fx-line-y: -1px; --fx-line-h: 1px">${t}</a>`).join("")}</div>
          <button class="sd-burger" type="button" data-sd-open aria-label="Open Menu"><i></i><i></i><i></i></button>
          <a class="sd-nav__link sd-nav__cta" href="#get-started">Contact Us</a>
        </div>
      </div>
    </div>
    <div class="sd-menu" data-sd-menu data-lenis-prevent>
      <div class="sd-menu__pic"><div class="wf-img" data-label="Team member portrait · dark studio · full-height portrait"></div><div class="sd-menu__who"><p class="t-11">Your name here</p><p class="t-13">Your job title here</p></div></div>
      <nav class="sd-menu__links" aria-label="Full menu">${PAGES.map(([h, t]) => `<div class="sd-mask"><a href="${h}"${cur(h)}>${t}</a></div>`).join("")}</nav>
      <div class="sd-menu__right">
        <button class="sd-menu__close" type="button" data-sd-close data-block="button" aria-label="Close Menu"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6l20 20M26 6 6 26"/></svg><span class="sd-spot" data-sd-spot></span></button>
        <div class="sd-menu__lists">
          <div class="sd-menu__group"><p class="t-13">Service</p>${["Service 1", "Service 2", "Service 3", "Service 4"].map((t, i) => tint(i ? "service.html" : "service-detail.html", t)).join("")}</div>
          <div class="sd-menu__group"><p class="t-13">Field</p>${tint("list.html", "Field 1")}</div>
          <div class="sd-menu__group"><p class="t-13">Social</p>${["Link 1", "Link 2", "Link 3", "Link 4"].map((t) => tint("#", t)).join("")}</div>
          <button class="sd-region" type="button">Region: All</button>
        </div>
      </div>
    </div>
    <div class="sd-cursor" data-sd-cursor><span class="t-13">Drag</span></div>`;
  }

  const page = document.querySelector("main");
  if (page && !document.querySelector(".sd-footer")) {
    const f = document.createElement("footer");
    f.className = "sd-footer";
    f.dataset.slot = "footer";
    const col = (label, links) => `<div class="sd-footer__col"><p class="t-13">${label}</p>${links.map(([h, t]) => tint(h, t)).join("")}</div>`;
    const office = (city) => `<div class="sd-office" data-fx="twist-reveal-follow"><span class="wf-img" data-fx-part="pic" data-label="${city} Office building · daylight · landscape 4:3"></span><p class="t-11">${city}</p><p>Your company name here</p><p>Your one-line address here</p><p>Your city 000000 here</p></div>`;
    f.innerHTML = `<div class="sd-footer__panel" data-fx="held-zoom-parallax" data-fx-held-zoom-parallax="scale: 1; from: -30; to: 0; scrub: true; start: top bottom; end: center 60%">
      <div class="sd-footer__top">
        <div class="sd-footer__lead">
          <div class="sd-footer__mini"><div class="sd-mini__ratio"><div class="wf-img" data-label="Studio intro video · blue lighting · landscape 5:3"></div></div><div class="sd-play"><button type="button" aria-label="Play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button></div><div class="sd-ring"></div></div>
          <p class="t-13">0000 Your Business Name Here</p>
        </div>
        <div class="sd-footer__cols">
          ${col("Page", PAGES.concat([["#", "Menu 7"], ["#", "Menu 8"]]))}
          <div>${col("Service", [["service-detail.html", "Service 1"], ["service.html", "Service 2"], ["service.html", "Service 3"], ["service.html", "Service 4"]])}<div style="height:32px"></div>${col("Field", [["list.html", "Field 1"]])}</div>
          ${col("Social", [["#", "Link 1"], ["#", "Link 2"], ["#", "Link 3"], ["#", "Link 4"]])}
          <div class="sd-footer__col" style="grid-column: 1 / -1"><p class="t-13">Office</p><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px">${office("City 1")}${office("City 2")}${office("City 3")}</div></div>
        </div>
      </div>
      <div class="sd-footer__bottom t-13"><a href="#">hello@example.com</a><a href="#">Privacy policy</a><a href="#">Your document link here</a><button class="sd-region" type="button">+ Region: All</button></div>
      <div class="sd-badge" aria-hidden="true"><span>Your certification badge here</span><span>Your award badge here</span></div>
      <div class="sd-footer__typo"><p class="sd-footer__word" data-fx="scrub-chars-rise">Wordmark</p></div>
    </div>`;
    page.after(f);
  }

  // Menu — the panel descends over 1.2s (CSS), and big links rise from 200% below after .7s over .8s power3.out. On close the panel rises after .4s
  const menu = document.querySelector("[data-sd-menu]");
  const links = menu ? [...menu.querySelectorAll(".sd-menu__links a")] : [];
  document.querySelectorAll("[data-sd-open]").forEach((b) => b.addEventListener("click", () => {
    menu?.classList.add("is-open");
    gsap.fromTo(links, { y: "200%" }, { y: "0%", duration: 0.8, ease: "power3.out", delay: 0.7 });
  }));
  document.querySelectorAll("[data-sd-close]").forEach((b) => b.addEventListener("click", () => setTimeout(() => menu?.classList.remove("is-open"), 400)));

  // Close button blob — grows in .4s from where it entered, follows the cursor in .4s, then fades out in .3s while pushed toward the side it left
  document.querySelectorAll('[data-block="button"]').forEach((btn) => {
    const spot = btn.querySelector("[data-sd-spot]");
    if (!spot) return;
    gsap.set(spot, { scale: 0 });
    const xy = (e) => {
      const r = btn.getBoundingClientRect(), c = (v) => Math.max(0, Math.min(100, v));
      return { x: c(((e.clientX - r.left) / r.width) * 100), y: c(((e.clientY - r.top) / r.height) * 100) };
    };
    btn.addEventListener("mouseenter", (e) => { const { x, y } = xy(e); gsap.set(spot, { xPercent: x, yPercent: y }); gsap.to(spot, { scale: 1, duration: 0.4, ease: "power2.out" }); });
    btn.addEventListener("mouseleave", (e) => { const { x, y } = xy(e); gsap.killTweensOf(spot); gsap.to(spot, { xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x, yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y, scale: 0, duration: 0.3, ease: "power2.out" }); });
    btn.addEventListener("mousemove", (e) => { const { x, y } = xy(e); gsap.to(spot, { xPercent: x, yPercent: y, duration: 0.4, ease: "power2" }); });
  });

  // Hamburger button — on hover the top and bottom lines gather 4px toward the center (.2s) then spread 2px (.3s), and on release gather and return to place (original IX2, ease curve)
  const ease = window.CustomEase ? CustomEase.create("sd-ease", ".25,.1,.25,1") : "power1.inOut";
  document.querySelectorAll(".sd-burger").forEach((b) => {
    const [top, , bot] = b.children;
    if (!top || !bot) return;
    b.addEventListener("mouseenter", () => gsap.timeline().to(top, { y: 4, duration: 0.2, ease }).to(bot, { y: -4, duration: 0.2, ease }, 0).to(top, { y: -2, duration: 0.3, ease }).to(bot, { y: 2, duration: 0.3, ease }, "<"));
    b.addEventListener("mouseleave", () => gsap.timeline().to(top, { y: 4, duration: 0.2, ease }).to(bot, { y: -4, duration: 0.2, ease }, 0).to([top, bot], { y: 0, duration: 0.3, ease }));
  });

  // Drag cursor — on each move it follows to the cursor position in .2s (original gsap.to 0.2), and only over a slider ([data-drag]) does a red circle (140px, .2s ease-out) grow
  const cursor = document.querySelector("[data-sd-cursor]");
  // Original has no cursor script only on the work list page — there the cursor stays still (body data-sd-no-cursor)
  if (cursor && !document.body.hasAttribute("data-sd-no-cursor") && matchMedia("(hover: hover) and (min-width: 992px)").matches) {
    document.body.addEventListener("mousemove", (e) => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.2 }));
    document.querySelectorAll("[data-drag]").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-on"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    });
  }

  // Video window — turn on .3s after raising it, as in the original (rise .4s · turn-on .3s are CSS). On close, hide after .3s
  const modal = document.createElement("div");
  modal.className = "sd-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Video");
  modal.innerHTML = `<div class="sd-modal__wrap"><div class="wf-img wf-video" data-label="Studio intro video · full screen · with sound"></div><button class="sd-modal__close" type="button" aria-label="Close"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 8l16 16M24 8 8 24"/></svg></button><div class="sd-modal__bar"><button type="button" aria-label="Pause"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg></button><span class="sd-modal__progress"></span><button type="button" aria-label="Sound"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z"/></svg></button></div></div>`;
  document.body.append(modal);
  const openModal = () => { modal.style.display = innerWidth > 992 ? "block" : "flex"; setTimeout(() => modal.classList.add("is-active"), 300); document.body.style.overflow = "hidden"; };
  const closeModal = () => { modal.classList.remove("is-active"); setTimeout(() => (modal.style.display = "none"), 300); document.body.style.overflow = ""; };
  document.querySelectorAll(".sd-mini .sd-play button").forEach((b) => b.addEventListener("click", openModal));
  modal.querySelector(".sd-modal__close").addEventListener("click", closeModal);

  // Second headline — once the hero’s bottom edge passes above the screen, the first headline slides up and out and the second comes down
  const nav2 = document.querySelector("[data-sd-nav2]"), nav = document.querySelector("[data-sd-nav]");
  if (nav2 && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: document.querySelector(".sd-hero") || document.body, start: "bottom top",
      onToggle: (s) => { nav2.classList.toggle("is-on", s.isActive); nav?.classList.toggle("is-hidden", s.isActive); },
      end: "max",
    });
    gsap.to(nav2, { opacity: 1, ease: "none", scrollTrigger: { trigger: document.querySelector(".sd-hero"), start: "bottom top", end: "+=200", scrub: true } });
  }

  // Photo parallax: same Ukiyo as the original (1.2x, speed 1.5)
  if (window.Ukiyo) document.querySelectorAll("[data-ukiyo]").forEach((el) => new Ukiyo(el, { scale: +(el.dataset.ukiyo || 1.2), speed: 1.5, willChange: true }));

  // Swiper: original settings as they are (review text, review video, big photo strip)
  const PRESETS = {
    text: { slidesPerView: 1, spaceBetween: 12, freeMode: false, speed: 800, breakpoints: { 768: { slidesPerView: 1.5, freeMode: true }, 992: { slidesPerView: 2, freeMode: true, spaceBetween: 24 }, 1500: { slidesPerView: 2, freeMode: true, spaceBetween: 32 } } },
    video: { slidesPerView: 1, spaceBetween: 12, freeMode: false, speed: 800, breakpoints: { 992: { slidesPerView: 1.2, freeMode: true, spaceBetween: 24 }, 1920: { slidesPerView: 1.2, freeMode: true, spaceBetween: 32 } } },
    big: { slidesPerView: "auto", spaceBetween: 12, freeMode: true, speed: 800 },
  };
  if (window.Swiper) document.querySelectorAll("[data-sd-swiper]").forEach((el) => {
    const box = el.closest("[data-sd-swgroup]") || el.parentElement;
    new Swiper(el, {
      ...PRESETS[el.dataset.sdSwiper],
      scrollbar: { el: box.querySelector(".swiper-scrollbar"), draggable: true },
      navigation: { nextEl: box.querySelector("[data-sw-next]"), prevEl: box.querySelector("[data-sw-prev]") },
    });
  });
  // Stacking scenes (About and Services) — while the 100vh and 200vh placeholders travel from the bottom of the screen to the top, the next section rises in, clipped from the bottom
  document.querySelectorAll(".ab-huge").forEach((huge) => {
    const s = [...huge.querySelectorAll(".ab-huge__slide")], marks = huge.querySelectorAll(".ab-huge__mark"), img = (i) => s[i]?.querySelector(".ab-huge__img > .wf-img");
    [1, 2].forEach((n) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: marks[n - 1], start: "top bottom", end: "top top", scrub: true } });
      tl.to(s[n], { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "sine.out" }, 0)
        .fromTo(img(n), { scale: 1 }, { scale: 1.2, ease: "sine.out" }, 0)
        .to(img(n - 1), { scale: 1, y: "-80px", ease: "sine.out" }, 0);
    });
  });

  // Q&A — pressing opens the answer over .5s and the + settles to 0°
  document.querySelectorAll(".sd-acc").forEach((acc) => {
    const body = acc.querySelector(".sd-acc__body");
    acc.querySelector(".sd-acc__trigger")?.addEventListener("click", () => {
      const open = acc.classList.toggle("is-open");
      gsap.to(body, { height: open ? "auto" : 0, duration: 0.5, ease: "power2.out", onComplete: () => window.ScrollTrigger?.refresh() });
    });
  });
  window.ScrollTrigger && document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
