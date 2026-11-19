// Original interaction values carried over — header line 0.48s ease hide/show, white cover jQuery fade 300ms (swing),
// News details height · opacity 300ms linear, entrance triggers is-animated 100px before the bottom of the screen, two Splide instances (hero fade · in-house auto-scroll).
(() => {
  const OPEN = "is-open", ACTIVE = "is-active", SHOWN = "is-shown";
  const FADE = 300;
  const $ = window.jQuery;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Reveal: the original attaches observation after load ──
  const reveal = () => {
    const els = document.querySelectorAll(".yo-anime");
    const done = () => els.forEach((el) => el.classList.add("is-animated"));
    const watch = () => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-animated"); });
      }, { rootMargin: "0% 0% -100px 0%", threshold: 0 });
      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    };
    if (!("IntersectionObserver" in window)) return done();
    if (!window.gsap) return reduce ? done() : watch();
    gsap.matchMedia().add({ ok: "(prefers-reduced-motion: no-preference)", rm: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.rm) { done(); return; }
      return watch();
    });
  };

  // ── Header Bar · Menu ──
  const header = () => {
    const hd = document.querySelector(".yo-header");
    if (!hd) return;
    const btn = hd.querySelector(".yo-navbtn");
    const nav = hd.querySelector(".yo-nav");
    const overlay = document.querySelector(".yo-nav-overlay");
    const toggles = hd.querySelectorAll(".yo-nav__toggle");
    let lastW = window.innerWidth;

    const fadeIn = (el) => { if (!el) return; $ ? $(el).stop(true, true).fadeIn(FADE) : (el.style.display = "block"); };
    const fadeOut = (el) => { if (!el) return; $ ? $(el).stop(true, true).fadeOut(FADE) : (el.style.display = "none"); };

    const close = () => {
      fadeOut(overlay);
      nav?.classList.remove(OPEN);
      btn?.classList.remove(OPEN);
      btn?.setAttribute("aria-expanded", "false");
      toggles.forEach((t) => { t.classList.remove(ACTIVE); t.nextElementSibling?.classList.remove(ACTIVE); t.setAttribute("aria-expanded", "false"); });
      lastW = window.innerWidth;
    };
    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      if (nav.classList.contains(OPEN)) return close();
      fadeIn(overlay);
      nav.classList.add(OPEN);
      btn.classList.add(OPEN);
      btn.setAttribute("aria-expanded", "true");
    });
    overlay?.addEventListener("click", close);
    nav?.addEventListener("click", (e) => e.stopPropagation());
    nav?.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", close));
    toggles.forEach((t) => t.addEventListener("click", () => {
      const dd = t.nextElementSibling;
      toggles.forEach((o) => { if (o !== t) { o.classList.remove(ACTIVE); o.nextElementSibling?.classList.remove(ACTIVE); } });
      if (dd.classList.contains(ACTIVE)) fadeOut(overlay); else fadeIn(overlay);
      dd.classList.toggle(ACTIVE);
      t.classList.toggle(ACTIVE);
      t.setAttribute("aria-expanded", String(t.classList.contains(ACTIVE)));
    }));
    window.addEventListener("resize", () => { if (lastW !== window.innerWidth) close(); });

    // Hides when scrolling down, shows when scrolling up — always visible at the very top
    let last = 0;
    hd.classList.add(SHOWN);
    document.addEventListener("scroll", () => {
      const y = document.documentElement.scrollTop;
      hd.style.left = `-${window.scrollX}px`;
      if (y <= 0) hd.classList.add(SHOWN);
      else if (last < y && !nav?.classList.contains(OPEN)) { hd.classList.remove(SHOWN); close(); }
      else hd.classList.add(SHOWN);
      last = y;
    }, { passive: true });

    // Waves are large while the hero is visible, and after passing, the fixed right tab comes in — it leaves again when reaching the footer
    const mv = document.querySelector(".js-mv");
    const side = document.querySelector(".yo-side");
    const ft = document.querySelector(".js-ft-contents");
    if (mv) {
      hd.classList.add("is-mv");
      const ftIO = new IntersectionObserver((en) => { if (!side) return; en[0].isIntersecting ? side.classList.remove(SHOWN) : side.classList.add(SHOWN); });
      new IntersectionObserver((en) => {
        if (en[0].isIntersecting) { hd.classList.add("is-mv"); side?.classList.remove(SHOWN); }
        else { hd.classList.remove("is-mv"); if (side) { side.classList.add(SHOWN); if (ft) ftIO.observe(ft); } }
      }, { root: null, rootMargin: "50% 0px 0px 0px" }).observe(mv);
    }
  };

  // ── News details: height·opacity 300ms linear ──
  const details = () => {
    const opt = { duration: 300, easing: "linear" };
    document.querySelectorAll(".js-details").forEach((d) => {
      const sum = d.querySelector("summary");
      const body = d.querySelector(".js-details-content");
      if (!sum || !body) return;
      sum.addEventListener("click", (e) => {
        e.preventDefault();
        if (d.dataset.animStatus === "running") return;
        if (d.open) {
          d.classList.toggle(OPEN);
          const a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], opt);
          d.dataset.animStatus = "running";
          a.onfinish = () => { d.removeAttribute("open"); d.dataset.animStatus = ""; };
        } else {
          d.setAttribute("open", "true");
          d.classList.toggle(OPEN);
          const a = body.animate([{ height: 0, opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], opt);
          d.dataset.animStatus = "running";
          a.onfinish = () => { d.dataset.animStatus = ""; };
        }
      });
    });
  };

  // ── Collapsible (jQuery slideToggle 300ms) — places like FAQ ──
  const toggles = () => {
    document.querySelectorAll(".js-toggle").forEach((t) => {
      const c = t.nextElementSibling;
      if (t.classList.contains(ACTIVE) && $) $(c).show();
      t.addEventListener("click", () => {
        t.classList.toggle(ACTIVE);
        t.setAttribute("aria-expanded", String(t.classList.contains(ACTIVE)));
        $ ? $(c).stop(true).slideToggle(FADE) : (c.hidden = !c.hidden);
      });
    });
  };

  // ── Splide: original options kept as is ──
  const sliders = () => {
    if (!window.Splide) return;
    const ext = window.splide?.Extensions || {};
    const mv = document.querySelector(".js-mv-slider");
    if (mv) {
      new Splide(mv, {
        arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: true, speed: 2000, interval: 5000,
        type: "fade", rewind: true, autoplay: reduce ? false : "pause",
        intersection: { inView: { autoplay: !reduce }, outView: { autoplay: false } },
      }).mount(ext.Intersection ? { Intersection: ext.Intersection } : {});
    }
    const eq = document.querySelector(".js-equipment-slider");
    if (eq) {
      new Splide(eq, {
        arrows: false, pagination: false, type: "loop", gap: "var(--site-slider-gap)", perPage: 3, breakpoints: { 767: { perPage: 1 } },
        autoScroll: reduce ? false : { speed: 0.3, pauseOnHover: false },
        intersection: { inView: { autoScroll: !reduce }, outView: { autoScroll: false } },
      }).mount({ ...(ext.AutoScroll ? { AutoScroll: ext.AutoScroll } : {}), ...(ext.Intersection ? { Intersection: ext.Intersection } : {}) });
    }
    document.querySelectorAll(".js-flow-slider").forEach((el) => {
      const s = new Splide(el, {
        arrows: true, arrowPath: "M4 18.4h25.4l-9.6-9.6 2.8-2.8 14.4 14.4-14.4 14.4-2.8-2.8 9.6-9.6H4z", drag: true, fixedWidth: "calc((250 / 375) * 100vw)", focus: 0, gap: "23px", mediaQuery: "min",
        pagination: true, pauseOnHover: true, pauseOnFocus: true, perPage: 1, perMove: 1, rewind: false, speed: 800, type: "slide",
        breakpoints: { 768: { autoWidth: false, fixedWidth: "320px", gap: "40px" } },
      });
      let t;
      s.on("overflow", (isOverflow) => { s.go(0); s.options = { clones: isOverflow ? undefined : 0, arrows: isOverflow, pagination: isOverflow }; });
      s.mount();
      window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => s.refresh(), 100); });
    });
  };

  // ── Map placeholder: original is a map embed — kept as a still drawing of just blocks·roads·pin ──
  const MAP = '<svg viewBox="0 0 680 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
    + '<rect class="is-block" x="20" y="20" width="250" height="170" rx="4"/><rect class="is-block" x="310" y="20" width="160" height="170" rx="4"/><rect class="is-block" x="510" y="20" width="160" height="240" rx="4"/>'
    + '<rect class="is-block" x="20" y="230" width="140" height="190" rx="4"/><rect class="is-block" x="200" y="230" width="270" height="190" rx="4"/><rect class="is-block" x="510" y="300" width="160" height="120" rx="4"/>'
    + '<rect class="is-block" x="20" y="460" width="220" height="170" rx="4"/><rect class="is-block" x="280" y="460" width="190" height="170" rx="4"/><rect class="is-block" x="510" y="460" width="160" height="170" rx="4"/>'
    + '<path class="is-road" d="M0 210H680M0 440H680M290 0V650M490 0V650"/><path class="is-road-s" d="M180 210V440M0 120C140 130 200 90 290 100M490 380H680"/>'
    + '<path class="is-pin" d="M380 300c-17 0-30 13-30 30 0 22 30 50 30 50s30-28 30-50c0-17-13-30-30-30Z"/><circle class="is-pin-dot" cx="380" cy="330" r="10"/></svg>';
  const maps = () => document.querySelectorAll("[data-yo-map]").forEach((el) => { el.insertAdjacentHTML("beforeend", MAP); });

  // ── Clinic calendar slot: the original is a calendar embed — a 7-column grid with clinic-day bands in a fixed pattern ──
  const calendars = () => document.querySelectorAll("[data-yo-cal]").forEach((el, k) => {
    const wd = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"];
    const open = [1, 3, 4, 6, 9, 10, 11, 13, 15, 16, 19, 22, 24, 25, 27, 29];
    let cells = wd.map((d) => `<span class="is-wd">${d}</span>`).join("");
    const start = k ? 1 : 0;
    for (let i = 0; i < 35; i++) {
      const n = ((i - start + 31) % 31) + 1;
      const chip = open.includes((i + k * 2) % 31) ? "<i>Appointment day</i>" : "";
      cells += `<span>${n <= 31 ? String(n).padStart(2, "0") : ""}${chip}</span>`;
    }
    el.innerHTML = `<div class="yo-calbox__top"><span>0000, month 00</span><span class="yo-calbox__btns"><span></span><span></span></span></div>`
      + `<div class="yo-calbox__days">${cells}</div><div class="yo-calbox__foot"><span>Appointment calendar</span><span>Calendar service name</span></div>`;
  });

  const init = () => { header(); details(); toggles(); sliders(); maps(); calendars(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  if (document.readyState === "complete") reveal(); else window.addEventListener("load", reveal);
})();
