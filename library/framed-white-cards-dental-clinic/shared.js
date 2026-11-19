// Frame and motion used by all pages — the original is a single jQuery bundle, so it hooks in per page by branch (namespace).
// Curves keep the original bundle’s aliases as they are: Power4 → power4, Cubic → power2, Expo → expo, Circ → circ.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spQuery = matchMedia("(max-width: 767px)");
  const isSp = () => spQuery.matches;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ───────── Graphic pieces ───────── */
  const MARK = '<svg class="jo-mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M22.5 6.2A12 12 0 1 0 27.6 18"/><path d="M16 10.5v9.5a3.2 3.2 0 0 1-6.4 0"/></svg>';
  const ARROW = '<span class="jo-dot"><svg viewBox="0 0 6 6"><path d="M1 0.8 4.2 3 1 5.2" fill="none" stroke="currentColor" stroke-width="1.1"/></svg></span>';
  const ICON = {
    tel: '<svg viewBox="0 0 12 12"><path d="M3 1.2 4.6 3 3.8 4.3c.6 1.4 1.6 2.4 3 3l1.2-.8 1.8 1.6-1 1.7C5 9.6 2.2 6.9 1.4 2.4Z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 12 12"><path d="M6 11.2S2.3 7 2.3 4.6a3.7 3.7 0 0 1 7.4 0C9.7 7 6 11.2 6 11.2Z" fill="currentColor"/><circle cx="6" cy="4.6" r="1.3" fill="var(--kf-bg)"/></svg>',
    pen: '<svg viewBox="0 0 12 12"><path d="M8.3 1.3 10.7 3.7 4.2 10.2 1.3 10.7 1.8 7.8Z" fill="currentColor"/></svg>',
    up: '<svg viewBox="0 0 6 12"><path d="M3 11.5V1M0.6 3.4 3 1l2.4 2.4" fill="none" stroke="currentColor"/></svg>',
    down: '<svg viewBox="0 0 6 12"><path d="M3 .5V11M0.6 8.6 3 11l2.4-2.4" fill="none" stroke="currentColor"/></svg>',
    cam: '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="16" height="16" rx="4.5"/><circle cx="11" cy="11" r="3.6"/><circle cx="15.6" cy="6.4" r=".6" fill="currentColor"/></svg>',
    note: '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18V5h9a3 3 0 0 1 3 3v10"/></svg>',
  };
  const PAGES = [
    ["service.html", "Treatment Guide", "service"], ["index.html#counseling", "From consultation to treatment", "flow"], ["list.html", "Case study", "list"],
    ["about.html", "About the Hospital", "about"], ["service.html#faq", "Cost guide", "cost"], ["service.html#faq", "Frequently asked questions", "faq"],
  ];
  // Spot for the original’s contact page — missing from this set, so it links to the first page’s consultation panel
  const CONTACT = "index.html#counseling";
  const nsOf = (href) => ({ "service.html": "service", "list.html": "list", "about.html": "about", "detail.html": "list" })[href] || "";
  const quick = (cls = "") => `
    <a class="jo-btn is-tel ${cls}" href="tel:0000000000">${ICON.tel}<span class="jo-txt">0000-00-0000</span></a>
    <a class="jo-btn is-access ${cls}" href="#access" data-smooth>${ICON.pin}<span class="jo-txt">Directions</span></a>
    <a class="jo-btn is-blue ${cls}" href="${CONTACT}" data-sweep><span class="jo-rect"></span>${ICON.pen}<span class="jo-txt">Booking · Contact</span></a>`;
  const logo = (big) => `<a class="jo-logo" href="index.html" aria-label="Back to start">${MARK}${big ? '<span class="jo-logo__txt is-big"><b>Your hospital name here</b>CLINIC NAME ORTHODONTIC OFFICE</span>' : '<span class="jo-logo__txt">CLINIC NAME<br>ORTHODONTIC<br>OFFICE</span>'}</a>`;

  /* ───────── Frame spanning multiple pages ───────── */
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { if (!el.childElementCount) el.innerHTML = html; });
  const buildChrome = () => {
    fill(".jo-loading", MARK);
    fill(".jo-header", `${logo(false)}<nav class="jo-gnav">${PAGES.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <div class="jo-menu" role="button" tabindex="0" aria-label="Menu" data-menu><i></i><i></i><i></i></div>`);
    fill(".jo-drawer", `<div class="jo-drawer__layer" data-menu-close></div>
      <div class="jo-drawer__mask"><nav aria-label="Menu">
        <p class="jo-drawer__label jo-en">Menu</p>
        <ul class="jo-drawer__list">${PAGES.map(([h, t]) => `<li><a href="${h}">${t}${ARROW}</a></li>`).join("")}</ul>
        <div class="jo-btn-list">${quick()}</div>
        <div class="jo-drawer__bar"><div class="jo-menu" role="button" tabindex="0" aria-label="Close" data-menu><i></i><i></i><i></i></div><span class="jo-vname"><b>Your hospital name here</b><small>CLINIC NAME OFFICE</small></span></div>
      </nav></div>`);
    fill(".jo-footer", `<i class="jo-corner is-tl"></i><i class="jo-corner is-tr"></i>
      <div class="jo-footer__movie"><video class="wf-img" autoplay muted playsinline loop data-label="Staff members chatting and smiling · bright waiting room · full width · video (fixed behind the Footer, dark 50% overlay)"></video></div>
      <div class="jo-footer__head">${logo(true)}<div>
        <div class="jo-footer__btns">
          <a class="jo-btn" href="tel:0000000000"><span class="jo-ico">${ICON.tel}</span><span class="jo-txt jo-num">0000-00-0000</span></a>
          <a class="jo-btn is-blue" href="${CONTACT}" data-sweep><span class="jo-rect"></span><span class="jo-ico">${ICON.pen}</span><span class="jo-txt">Booking · Contact</span></a>
        </div>
        <p class="jo-footer__q"><a href="#">Web intake form</a></p>
      </div></div>
      <div class="jo-footer__bottom">
        <div class="jo-fnav">${[
          ["service.html", "Treatment Guide", "Treatment Details", "Mixed-use proofing", "Elective Treatment"], ["about.html", "About the Hospital", "Greeting", "Doctors · Staff", "About the Facility"],
          ["index.html#counseling", "From consultation to treatment", "Full Treatment", "Treatment Stages"], ["service.html#faq", "Cost guide", "Hospital features", "Correction Cost", "How to pay"],
          ["list.html", "Case study", "Case list"], ["service.html#faq", "Frequently asked questions", "Treatment", "Cost", "Hospital"],
        ].map(([h, ...t]) => `<ul>${t.map((x) => `<li><a href="${h}">${x}</a></li>`).join("")}</ul>`).join("")}</div>
        <div class="jo-guide"><div><p>Consultation Hours</p><p>Mon·Tue 00:00~00:00  Wed·Fri 00:00~00:00  Sat 00:00~00:00</p></div><div><p>Clinic closed</p><p>Thu, Sun, holidays</p></div></div>
        <div class="jo-footer__end">
          <div class="jo-footer__links"><a href="#">Privacy policy</a><a href="#">Risks and limits of orthodontic treatment</a><small>© CLINIC NAME ORTHODONTIC OFFICE</small></div>
          <div class="is-right"><div class="jo-sns"><a href="#" aria-label="Social Media">${ICON.cam}</a><a class="is-wide" href="#">${ICON.note}<span>Staff Blog</span></a></div>
            <button class="jo-scrolltop" type="button" aria-label="Back to top" data-top>${ICON.up}</button></div>
        </div>
      </div>`);
  };
  // Pillars·shortcuts·directions inside the swapped-in body (container)
  const PAIRS = {
    flow: [".Flow", "From consultation to treatment", "Supporting long treatments right by your side", "index.html#counseling", "Hand pointing at a 3D tooth on a monitor · bright consultation room · circle"],
    cost: [".Cost of Treatment", "Treatment fee guide", "Clear pricing with no extra fees", "service.html#faq", "Empty treatment chair headrest · white exam room · circular"],
    ortho: [".Orthodontics", "Treatment Guide", "Invisible inside braces", "service.html", "Dental model with braces · white background · circle"],
    clinic: [".Clinic", "About the Hospital", "A hospital that leads beside you", "about.html", "White treatment chair and light · bright clinic room · circle"],
  };
  const buildContainer = (box) => {
    box.querySelectorAll(".jo-side.is-left").forEach((el) => {
      if (el.childElementCount) return;
      el.innerHTML = `<a class="jo-sidemark" href="index.html" aria-label="Back to start">${MARK}<small>CLINIC NAME ORTHODONTIC OFFICE</small></a>
        <div class="jo-btn-list">${[["tel:0000000000", ICON.tel, "0000-00-0000", "", "is-tel"], ["#access", ICON.pin, "Directions", " data-smooth", "is-access"], [CONTACT, ICON.pen, "Booking · Contact", "", "is-blue"]]
          .map(([h, i, t, a, c], n) => `<div class="jo-mask" data-unfold><a class="jo-btn is-side ${c}" href="${h}"${a}>${i}<span class="jo-txt${n ? "" : " jo-num"}">${t}</span></a></div>`).join("")}</div>
        <i class="jo-corner is-tl"></i><i class="jo-corner is-bl"></i>`;
    });
    box.querySelectorAll(".jo-side.is-right").forEach((el) => {
      if (el.childElementCount) return;
      el.innerHTML = `<div class="jo-menu" role="button" tabindex="0" aria-label="Menu" data-menu><i></i><i></i><i></i></div>
        <div class="jo-btn-list">${quick()}</div>
        <a class="jo-vname" href="index.html"><b>Your hospital name here</b><small>CLINIC NAME ORTHODONTIC OFFICE</small></a>
        <i class="jo-corner is-tr"></i><i class="jo-corner is-br"></i>`;
    });
    box.querySelectorAll("[data-quick]").forEach((el) => { if (!el.childElementCount) el.innerHTML = quick(); });
    box.querySelectorAll(".jo-cbtn").forEach((el) => {
      if (el.childElementCount) return;
      el.innerHTML = (el.dataset.pair || "flow,cost").split(",").map((k) => {
        const [en, ja, d, h, label] = PAIRS[k];
        return `<div class="jo-cbtn__item"><div class="jo-cbtn__group"><p class="jo-en">${en}</p><h3>${ja}</h3><p>${d}</p><a class="jo-arrow" href="${h}">More details${ARROW}</a></div><div class="wf-img jo-oval" data-label="${label}"></div></div>`;
      }).join("");
    });
    box.querySelectorAll("#access").forEach((el) => {
      if (el.childElementCount) return;
      el.innerHTML = `<div class="jo-heading"><p class="jo-en">Access</p><h2>Directions</h2></div>
        <div class="jo-access__row">
          <div class="is-left"><h3>Your hospital name here</h3><p>Your 0 minutes on foot from the nearest station exit</p>
            <button class="jo-pill" type="button" data-route>Directions from the station<svg viewBox="0 0 8 8"><path d="M1 4h6M4.5 1.5 7 4 4.5 6.5" fill="none" stroke="currentColor"/></svg></button>
            <p class="jo-addr">〒000-0000<br>Your address line here · Building name 0F<br>00-0000-0000</p>
            <a class="jo-arrow" href="#">View in map app${ARROW}</a></div>
          <div class="is-right"><div class="wf-img" data-label="Map embed · hospital location pin · 2:1 landscape · only left corners rounded"></div></div>
        </div>
        <div class="jo-route" data-slot="route-modal"><div class="jo-route__veil" data-route-close></div>
          <div class="jo-route__box"><h3>Directions from the station</h3><ul>${["Leave the station exit and turn into the alley on the right", "At the dead end, turn right and follow the road.", "Goes right from the first corner", "There is a hospital across from the park", "Enter through this entrance and come up to floor 0"]
            .map((t, i) => `<li><span class="jo-route__no">0${i + 1}</span><div class="wf-img wf-r-3x2" data-label="Directions ${i + 1} · Street scene · eye level · landscape 3:2"></div><p>$ here{t}</p></li>`).join("")}</ul></div></div>`;
    });
    // The menu row of the current page uses the accent color (original .active)
    const ns = box.dataset.barbaNamespace;
    document.querySelectorAll(".jo-gnav a, .jo-drawer__list a, .jo-fnav a").forEach((a) => {
      const hit = ns !== "home" && nsOf(a.getAttribute("href")) === (ns === "detail" ? "list" : ns);
      a.toggleAttribute("aria-current", hit);
    });
  };

  /* ───────── Menu drawer (original Q) ───────── */
  const drawer = () => document.querySelector(".jo-drawer");
  const menu = (open) => {
    const d = drawer();
    if (!d) return;
    const shift = isSp() ? 0.7897 * innerWidth : 480;
    const layer = d.querySelector(".jo-drawer__layer"), nav = d.querySelector("nav");
    gsap.killTweensOf([layer, nav]);
    if (open) {
      root.classList.add("is-menu-open");
      document.querySelectorAll(".jo-menu").forEach((m) => m.classList.add("is-open"));
      d.style.display = "block";
      if (reduced) return gsap.set(nav, { x: 0 });
      gsap.fromTo(layer, { opacity: 0, display: "block" }, { opacity: 1, ease: "power2.out", duration: 0.42 });
      gsap.fromTo(nav, { x: shift }, { x: 0, ease: "expo.inOut", duration: 0.32, delay: 0.05 });
    } else {
      root.classList.remove("is-menu-open");
      document.querySelectorAll(".jo-menu").forEach((m) => m.classList.remove("is-open"));
      if (reduced) return void (d.style.display = "none");
      gsap.to(layer, { opacity: 0, ease: "power2.inOut", duration: 0.42, delay: 0.05, onComplete: () => (d.style.display = "none") });
      gsap.to(nav, { x: shift, ease: "expo.inOut", duration: 0.32 });
    }
  };

  /* ───────── Interaction responses (once per document) ───────── */
  const scrollToY = (y, duration) => (reduced ? scrollTo(0, typeof y === "number" ? y : 0) : gsap.to(window, { scrollTo: { y, offsetY: isSp() ? 30 : 0 }, duration, ease: "power2.inOut" }));
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-menu]")) return menu(getComputedStyle(drawer()).display === "none");
    if (t.closest("[data-menu-close]")) return menu(false);
    if (t.closest("[data-top]")) return scrollToY(0, 0.82);
    const smooth = t.closest("a[data-smooth], .jo-drawer a[href^='#']");
    if (smooth) {
      const target = document.querySelector(smooth.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (root.classList.contains("is-menu-open")) menu(false);
      return scrollToY(target, 1.2);
    }
    const route = t.closest("[data-route]");
    if (route) {
      const m = route.closest("#access").querySelector(".jo-route");
      body.classList.add("is-modal");
      return gsap.fromTo(m, { autoAlpha: 0, display: "none" }, { autoAlpha: 1, display: "block", ease: "power2.out", duration: reduced ? 0 : 0.36 });
    }
    if (t.closest("[data-route-close]")) {
      body.classList.remove("is-modal");
      return gsap.to(".jo-route", { autoAlpha: 0, display: "none", ease: "power2.out", duration: reduced ? 0 : 0.2 });
    }
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("[data-menu]")) { e.preventDefault(); e.target.click(); }
    if (e.key === "Escape" && root.classList.contains("is-menu-open")) menu(false);
  });
  // A white 30% layer inside the button fills from the left (original .rect) — off on phones
  document.addEventListener("pointerover", (e) => {
    if (isSp() || reduced || e.pointerType === "touch") return;
    const host = e.target.closest("[data-sweep]");
    if (host && !host.contains(e.relatedTarget)) {
      const r = host.querySelector(".jo-rect");
      const btn = host.classList.contains("jo-btn");
      gsap.killTweensOf(r);
      gsap.fromTo(r, { scaleX: btn ? 0 : 0.75 }, { scaleX: 1, duration: btn ? 0.2 : 0.32, ease: "power2.out" });
    }
    const mask = e.target.closest("[data-unfold]");
    if (mask && !mask.contains(e.relatedTarget)) {
      const txt = mask.querySelector(".jo-txt");
      gsap.killTweensOf([mask, txt]);
      gsap.to(mask, { width: mask.firstElementChild.offsetWidth, duration: 0.25, ease: "expo.inOut" });
      gsap.fromTo(txt, { x: 5 }, { x: 0, marginLeft: 0, duration: 0.8, ease: "expo.out" });
    }
  });
  document.addEventListener("pointerout", (e) => {
    if (isSp() || reduced || e.pointerType === "touch") return;
    const host = e.target.closest("[data-sweep]");
    if (host && !host.contains(e.relatedTarget)) {
      const r = host.querySelector(".jo-rect");
      gsap.killTweensOf(r);
      gsap.to(r, { scaleX: 0, duration: 0.32, ease: "circ.inOut" });
    }
    const mask = e.target.closest("[data-unfold]");
    if (mask && !mask.contains(e.relatedTarget)) {
      const txt = mask.querySelector(".jo-txt");
      gsap.killTweensOf([mask, txt]);
      gsap.to(mask, { width: 48, duration: 0.2, ease: "power2.out" });
      gsap.to(txt, { x: 5, marginLeft: 10, duration: 0.8, ease: "expo.out" });
    }
  });

  /* ───────── Scroll (original N) — the hero blurs, and past the frame it swaps to the video behind the footer ───────── */
  let behind = false;
  const onScroll = () => {
    const y = scrollY;
    const hero = document.querySelector(".jo-summary.is-home");
    if (hero) {
      const vh = isSp() ? screen.height : innerHeight;
      hero.style.backdropFilter = `blur(${reduced ? 0 : Math.min((y / vh) * 8, 8)}px)`;
    }
    const frame = document.querySelector(".jo-sticky"), fv = document.querySelector(".jo-fv"), movie = document.querySelector(".jo-footer__movie");
    if (!frame || !movie) return;
    const past = frame.getBoundingClientRect().top + y < y;
    if (past === behind) return;
    behind = past;
    if (fv) fv.style.zIndex = past ? -2 : -1;
    movie.style.zIndex = past ? -1 : -2;
    movie.style.visibility = past ? "visible" : "hidden";
  };
  // Original Z — top margin so the hero title sits 406px above the screen bottom, and the vertical news link 53px above the bottom
  const onResize = () => {
    const inner = document.querySelector(".jo-hero__inner");
    if (!inner) return;
    if (isSp()) { inner.style.paddingTop = ""; return; }
    const title = inner.querySelector(".jo-hero__title"), info = document.querySelector(".jo-info");
    inner.style.paddingTop = `${innerHeight - title.offsetHeight - 406}px`;
    if (info) info.style.top = `${innerHeight - info.offsetHeight - 53}px`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);

  /* ───────── Clinic calendar (stands in for the original FullCalendar) ───────── */
  const calendar = (el) => {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    const cells = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"].map((d) => `<b>${d}</b>`);
    for (let i = 0; i < 42; i++) {
      const d = i - first + 1, off = d < 1 || d > days, wd = i % 7;
      const shut = !off && (wd === 0 || wd === 4);
      cells.push(`<span class="${!off && d === now.getDate() ? "is-now" : ""}">${off ? "" : d}${shut ? "<em>Clinic closed</em>" : ""}</span>`);
    }
    el.innerHTML = `<div class="jo-cal__bar"><b>${y}Year ${m + 1}Month</b><span><button class="is-today" type="button">Today</button><button type="button" aria-label="Previous month">‹</button><button type="button" aria-label="Next month">›</button></span></div><div class="jo-cal__grid">${cells.join("")}</div>`;
  };

  /* ───────── Per Page ───────── */
  const swipers = [];
  const mountHome = (box) => {
    box.querySelectorAll("video").forEach((v) => v.play?.().catch(() => {}));
    box.querySelectorAll("[data-cal]").forEach(calendar);
    const sw1 = box.querySelector(".jo-swiper1");
    if (sw1 && window.Swiper) {
      const slides = [...sw1.querySelectorAll(".swiper-slide")].map((s) => ({ title: s.dataset.title, link: s.dataset.link }));
      const meta = box.querySelector(".jo-meta"), title = meta.querySelector(".jo-meta__title"), more = meta.querySelector(".jo-meta__more");
      const percent = meta.querySelector(".jo-percent"), p1 = meta.querySelector("[data-p1]"), num = +meta.querySelector("[data-p2]").dataset.p2;
      const DELAY = 5000, sp = isSp();
      swipers.push(new Swiper(sw1, {
        spaceBetween: sp ? 4 : 8, slidesPerView: sp ? 6 : 12, centeredSlides: true, loop: true, allowTouchMove: sp,
        autoplay: reduced ? false : { delay: DELAY, disableOnInteraction: false },
        navigation: { nextEl: sw1.querySelector(".is-next"), prevEl: sw1.querySelector(".is-prev") },
        on: {
          init() {
            title.innerHTML = slides[this.realIndex].title;
            more.href = slides[this.realIndex].link;
            percent.style.transitionDuration = DELAY + "ms";
            percent.style.transform = "scaleX(1)";
          },
          slideChangeTransitionStart() {
            percent.style.transitionDuration = "0s";
            percent.style.transform = "scaleX(0)";
            gsap.killTweensOf([title, more]);
            gsap.to([title, more], { opacity: 0, x: -10, ease: "power2.out", duration: 0.22 });
          },
          slideChangeTransitionEnd() {
            percent.style.transitionDuration = DELAY + "ms";
            percent.style.transform = "scaleX(1)";
            const s = slides[this.realIndex];
            title.innerHTML = s.title;
            more.href = s.link;
            p1.textContent = String(((this.realIndex % num) + 1)).padStart(2, "0");
            gsap.killTweensOf([title, more]);
            gsap.fromTo(title, { opacity: 0, x: 7, scaleX: 1.04 }, { opacity: 1, x: 0, scaleX: 1, ease: "circ.out", duration: 1.22, delay: 0.3 });
            gsap.fromTo(more, { opacity: 0, x: 7 }, { opacity: 1, x: 0, ease: "circ.out", duration: 1.22, delay: 0.5 });
          },
        },
      }));
    }
    const sw2 = box.querySelector(".jo-swiper2");
    if (sw2 && window.Swiper) {
      swipers.push(new Swiper(sw2, {
        loop: true, effect: "fade", fadeEffect: { crossFade: true }, allowTouchMove: isSp(), speed: 1140,
        autoplay: reduced ? false : { delay: 2500, disableOnInteraction: false },
      }));
    }
  };
  const mountSub = (box) => {
    // Header photo parallax — original .js-parallax (top center→bottom top, scrub .82, phone -70)
    box.querySelectorAll("[data-parallax]").forEach((el) => {
      if (reduced) return;
      const y = isSp() ? -70 : +(el.dataset.parallax || -100);
      gsap.to(el, { y, scrollTrigger: { trigger: el, start: "top center", end: "bottom top", scrub: 0.82 } });
    });
    // Accordion — original slideToggle(.2s)
    box.querySelectorAll("[data-accordion] dt").forEach((dt) => dt.addEventListener("click", () => {
      const dd = dt.nextElementSibling, open = !dt.classList.contains("is-open");
      dt.classList.toggle("is-open", open);
      gsap.killTweensOf(dd);
      if (open) gsap.fromTo(dd, { height: 0, display: "block", overflow: "hidden" }, { height: "auto", duration: reduced ? 0 : 0.2, ease: "power1.inOut" });
      else gsap.to(dd, { height: 0, duration: reduced ? 0 : 0.2, ease: "power1.inOut", onComplete: () => gsap.set(dd, { display: "none", clearProps: "height" }) });
    }));
    // Case detail tab
    box.querySelectorAll("[data-tabs]").forEach((tabs) => tabs.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (!tab) return;
      tabs.querySelectorAll("[data-tab]").forEach((t) => t.classList.toggle("is-active", t === tab));
      box.querySelectorAll("[data-tab-panel]").forEach((p) => p.classList.toggle("is-active", p.dataset.tabPanel === tab.dataset.tab));
    }));
    // Step buttons of the treatment guide: on large screens they swap the right panel, on phones and folded text they expand
    box.querySelectorAll("[data-more]").forEach((btn) => btn.addEventListener("click", () => {
      const step = btn.dataset.more;
      if (step && !isSp()) {
        box.querySelectorAll("[data-step], [data-more-panel]").forEach((el) => el.classList.remove("is-active"));
        btn.closest("[data-step]").classList.add("is-active");
        box.querySelector(`[data-more-panel="${step}"]`).classList.add("is-active");
        return;
      }
      const body = btn.parentElement.previousElementSibling, open = btn.classList.toggle("is-open");
      gsap.killTweensOf(body);
      if (open) gsap.fromTo(body, { height: 0, display: "block", overflow: "hidden" }, { height: "auto", duration: reduced ? 0 : 0.3 });
      else gsap.to(body, { height: 0, duration: reduced ? 0 : 0.3, onComplete: () => gsap.set(body, { display: "none", clearProps: "height" }) });
      btn.querySelector(".jo-txt").textContent = open ? "Try reducing" : "See more";
    }));
  };
  let mm = null;
  const mount = (box) => {
    const ns = box.dataset.barbaNamespace;
    body.dataset.ns = ns;
    buildContainer(box);
    mm = gsap.matchMedia();
    mm.add("(min-width: 0px)", () => (ns === "home" ? mountHome(box) : mountSub(box)));
    behind = false;
    onResize();
    onScroll();
    const movie = document.querySelector(".jo-footer__movie video");
    movie?.play?.().catch(() => {});
  };
  const unmount = () => {
    mm?.revert();
    swipers.splice(0).forEach((s) => s.destroy(true, true));
  };

  /* ───────── Loader (original window.onload) ───────── */
  const loader = () => {
    const box = document.querySelector(".jo-loading"), mark = box?.querySelector(".jo-mark");
    if (!box) return;
    // When entering by page transition, only the curtain lifts without the logo (original Brand enter)
    if (sessionStorage.getItem("jo-nav") === "1") {
      sessionStorage.removeItem("jo-nav");
      mark?.remove();
      gsap.fromTo(box, { autoAlpha: 1 }, { autoAlpha: 0, ease: "power4.out", duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.5 });
      return;
    }
    if (reduced) { gsap.set(box, { autoAlpha: 0 }); mark?.remove(); return; }
    gsap.to(mark, { scale: 1.08, opacity: 0, duration: 0.8, ease: "expo.in", delay: 0.1 });
    gsap.to(box, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut", delay: 0.92, onComplete: () => mark?.remove() });
  };

  /* ───────── Page transition (original barba 2.9.7) ───────── */
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };
  const start = () => {
    buildChrome();
    const box = document.querySelector('[data-barba="container"]');
    const veil = document.querySelector(".jo-loading");
    addEventListener("load", loader);
    if (document.readyState === "complete") loader();
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        timeout: 5000,
        preventRunning: true,
        transitions: [{
          name: "default-transition",
          sync: false,
          once: ({ next }) => mount(next.container),
          leave: () => {
            menu(false);
            return gsap.to(veil, { autoAlpha: 1, ease: "power4.out", duration: reduced ? 0 : 0.5 });
          },
          beforeEnter: async ({ current, next }) => {
            unmount();
            current.container.style.display = "none";
            await sheets(next.html);
            (document.scrollingElement || root).scrollTop = 0;
          },
          enter: ({ next }) => {
            mount(next.container);
            ScrollTrigger.refresh();
            return gsap.fromTo(veil, { autoAlpha: 1 }, { autoAlpha: 0, ease: "power4.out", duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.5 });
          },
        }],
      });
      return;
    }
    mount(box);
    // On file:// barba can’t fetch the next page — cover with the same curtain values, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
      const [file] = href.split("#");
      if (file === (location.pathname.split("/").pop() || "index.html")) return;
      e.preventDefault();
      menu(false);
      sessionStorage.setItem("jo-nav", "1");
      if (reduced) return void (location.href = href);
      gsap.to(veil, { autoAlpha: 1, ease: "power4.out", duration: 0.5, onComplete: () => (location.href = href) });
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set(veil, { autoAlpha: 0 }));
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
  if (!("ontouchstart" in root)) spQuery.addEventListener("change", () => location.reload());
})();
