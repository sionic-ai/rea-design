// The original moves without GSAP, using Lenis (duration .4) · Splide · IntersectionObserver · CSS keyframes — rebuilt with the same devices.
// Header buttons, menu and footer are the same on every page, so they’re injected here.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const md = matchMedia("(min-width: 782px)");
  const page = document.body.dataset.page || "home";

  const NAV = [
    ["Home", "index.html", "home"],
    ["About", "about.html", "about"],
    ["Story", "list.html", "list"],
    ["News", "news.html", "news"],
    ["Access", "index.html#other", ""],
    ["Faq", "index.html#other", ""],
    ["Contact", "index.html#other", ""],
  ];
  const arrow = '<svg viewBox="0 0 20 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 6h19M14 1l5 5-5 5"/></svg>';
  const blank = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 9 9 1M3 1h6v6"/></svg>';
  const logo = '<svg viewBox="0 0 90 90" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M45 8c-14 0-26 11-26 25 0 20 26 35 26 49 0-14 26-29 26-49C71 19 59 8 45 8Z"/><path d="M31 31c5-4 9-4 14 0s9 4 14 0M31 43c5-4 9-4 14 0s9 4 14 0"/><path d="M45 20v42" stroke-dasharray="2 4"/></svg>';
  const kakko = '<svg viewBox="0 -1 16 11" fill="none" stroke="currentColor" stroke-width="1"><path d="M2 9 8 4l6 5M2 5 8 0l6 5"/></svg>';
  const dots = "<span class=\"sp-dots\"><i></i><i></i></span>";
  const ext = (label, cls = "") => `<a class="${cls}" href="#" target="_blank" rel="noreferrer"><span class="sp-line">${label}</span><span class="sp-arrow is-blank">${blank}</span></a>`;

  window.spMore = (en, ja, href) =>
    `<a class="sp-more" href="${href}"><div class="sp-more__en"><span class="sp-more__kakko">${kakko}</span><p>${en}</p><span class="sp-more__kakko is-flip">${kakko}</span></div><p class="sp-more__ja sp-v sp-b">${ja}</p><span class="sp-arrow">${arrow}</span></a>`;
  window.spArrow = arrow;
  window.spBlank = blank;

  const topNav = (anime) => {
    const a = (i) => (anime ? ` sp-a is-slide${i ? `" style="--anime-delay:${(i / 10).toFixed(1)}s` : ""}` : "");
    const items = NAV.slice(1).map(([t, h], i) => `<li><a class="${a(i + 1)}" href="${h}"><span class="sp-line">${t}</span></a></li>`).join("");
    return `<div class="sp-top__nav sp-en"${anime ? " " : ""}><div class="${anime ? "sp-anime" : ""}"><p><a class="${a(0)}" href="index.html"><span class="sp-line">Home</span></a></p><ul>${items}<li><a class="${a(7)}" href="#" target="_blank" rel="noreferrer"><span class="sp-line">Stay / Reservation</span><span class="sp-arrow is-blank">${blank}</span></a></li></ul></div></div>`;
  };

  // Hero top (place name, time, logo, menu list) — home fades in over the first photo for 2s, subpages slide the list up at 0.1s intervals
  document.querySelectorAll("[data-sp-top]").forEach((el) => {
    const home = el.dataset.spTop === "home";
    const f = home ? ' class="sp-a is-manual is-anime sp-d2"' : "";
    el.className = home ? "sp-top" : "sp-top is-sub";
    el.innerHTML = `<p class="sp-top__place${home ? " sp-a is-manual is-anime sp-d2" : ""}">Place, Region, CTY <span data-watch="time">00:00</span></p>
      <div class="sp-top__center"><a${f || ' class=""'} href="index.html" style="display:block;width:fit-content;margin-inline:auto"><span class="sp-sr">Brand Title</span><span class="sp-logo">${logo}</span></a>${topNav(!home)}</div>`;
  });

  document.querySelectorAll("[data-slot='header']").forEach((el) => {
    el.innerHTML = `<button class="sp-menu-btn" type="button" data-modal-open="sp-nav" aria-controls="sp-nav" aria-expanded="false"><span>${dots}<span class="sp-line">Menu</span></span></button>`;
  });

  document.querySelectorAll("[data-slot='menu']").forEach((el) => {
    const links = NAV.map(([t, h, k], i) => `<li><a class="splide--menu__trigger" data-index="${i}" href="${h}"><span class="sp-line${k === page ? " is-on" : ""}">${t}</span></a></li>`).join("");
    const shots = ["Veranda under the eaves · evening sun · portrait", "Rice paddy path · overcast day · portrait", "Straw pile · Backlit · Portrait", "Bottle and glass · indoor window light · portrait", "Reservoir embankment · clear morning · portrait", "Tatami room · Afternoon window light · Portrait", "Hands planting rice · close-up · vertical"];
    el.outerHTML = `<dialog class="sp-nav" id="sp-nav" data-slot="menu" aria-label="Menu"><div class="sp-nav__container"><div class="sp-nav__grid">
      <div class="sp-nav__body">
        <div class="sp-nav__cell"><p class="sp-nav__brand">Brand Name</p><ul>${ext("Stay / Reservation")}${ext("Online Shop")}</ul></div>
        <div class="sp-nav__cell"><ul>${links}</ul></div>
        <div class="sp-nav__cell"><ul><li>${ext("Instagram")}</li><li>${ext("Line")}</li></ul><div class="sp-nav__fine"><p><a class="sp-line" href="#">Privacy Policy</a></p><p><small>© Brand Name</small></p></div></div>
        <div class="sp-nav__cell"><div class="sp-nav__addr"><p class="sp-logo-mini">${logo}</p><p class="is-ja">Your address line here 000</p><p class="is-en">000 Street, City, Region, Country</p></div></div>
      </div>
      <div class="splide sp-nav__slider" aria-label="Menu Photo"><div class="splide__track"><ul class="splide__list">${shots.map((s) => `<li class="splide__slide"><div class="wf-img sp-ph" data-label="${s}"></div></li>`).join("")}</ul></div></div>
    </div></div><button class="sp-nav__close" type="button" data-modal-close><span><span class="sp-dots"><i></i><i></i></span><span class="sp-line">Close</span></span></button></dialog>`;
  });

  document.querySelectorAll("[data-slot='footer']").forEach((el) => {
    const links = NAV.slice(1).map(([t, h]) => `<li><a class="sp-line" href="${h}">${t}</a></li>`).join("");
    el.dataset.color = "off";
    el.innerHTML = `<div class="sp-foot__in">
        <a class="sp-logo" href="index.html"><span class="sp-sr">Brand Title</span>${logo}</a>
        <div class="sp-foot__menu"><p><a class="sp-line" href="index.html">Brand Name</a></p><ul>${links}<li>${ext("Stay / Reservation")}</li><li>${ext("Online Shop")}</li><li class="is-gap"><a class="sp-line" href="#">Instagram</a></li><li><a class="sp-line" href="#">Line</a></li><li class="is-small"><a class="sp-line" href="#">Privacy Policy</a></li></ul></div>
        <div class="sp-foot__addr"><p class="sp-b">Your address line here 000</p><p class="sp-en">000 Street, City, Region, Country</p><p class="sp-en"><small>© Brand Name</small></p></div>
      </div>
      <div class="sp-foot__screen sp-anime" data-color="light">
        <div class="sp-foot__screen-body"><div class="sp-screen">
          <div class="wf-img wf-video sp-ph is-dark is-cover" data-label="Dusk sky and power lines · crescent moon · landscape 16:9 looping video"></div>
          <div class="sp-foot__stage">
            <div class="sp-foot__clock"><p class="sp-v" data-watch="year">二〇二六年</p><p class="sp-v" data-watch="date">十月三十日 十四時五分</p><p class="sp-v is-term">Seasonal term</p></div>
            <p class="sp-v sp-foot__verse sp-a is-mask-v">Your short poem line goes here in three beats</p>
            <div class="sp-foot__by"><p class="sp-v">Author</p></div>
          </div>
        </div></div>
        <div class="sp-foot__after"><div class="sp-anime__trigger is-root-0"></div></div>
      </div>`;
  });

  // Fill the empty arrow, More and card icon spots with the same graphic
  document.querySelectorAll(".sp-arrow:empty").forEach((el) => { el.innerHTML = el.classList.contains("is-blank") ? blank : arrow; });
  document.querySelectorAll("[data-kakko]").forEach((el) => { el.innerHTML = kakko; });
  document.querySelectorAll("[data-more]").forEach((el) => { const [en, ja, href] = el.dataset.more.split("|"); el.innerHTML = spMore(en, ja, href); });
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = '<svg viewBox="0 0 113 18" fill="none" stroke="currentColor"><text x="0" y="13" fill="currentColor" stroke="none" font-size="13" font-style="italic">View more</text><path d="M78 9h33M106 4l5 5-5 5"/></svg>'; });

  document.body.classList.remove("loading");

  // Smooth scroll — the original new Lenis({ autoRaf: true, duration: 0.4 })
  const lenis = !reduce && window.Lenis ? new Lenis({ autoRaf: true, duration: 0.4 }) : null;
  window.spLenis = lenis;

  let scrollTop = scrollY;
  let winH = innerHeight;
  addEventListener("scroll", () => { scrollTop = scrollY; }, { passive: true });
  addEventListener("resize", () => { winH = innerHeight; scrollTop = scrollY; });

  // Header Menu text — a bright mask at the button’s vertical center ([data-color=light]) inside, it turns light, footer ([data-color=off]) hidden when inside
  const btn = document.querySelector(".sp-menu-btn");
  if (btn) {
    const lights = [...document.querySelectorAll("[data-color='light']")];
    const offs = [...document.querySelectorAll("[data-color='off']")];
    let boxes = [];
    let offBoxes = [];
    const measure = () => {
      const r = (els) => els.map((e) => { const b = e.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY }; });
      boxes = r(lights.filter((e) => !offs.some((o) => o.contains(e))));
      offBoxes = r(offs).map((b, i) => ({ ...b, bottom: offs[i].querySelector(".sp-foot__screen") ? offs[i].querySelector(".sp-foot__screen").getBoundingClientRect().top + scrollY : b.bottom }));
      boxes = boxes.concat(r(lights.filter((e) => offs.some((o) => o.contains(e)))));
      check();
    };
    const hit = (list, y) => list.some((b) => y >= b.top && y <= b.bottom);
    const check = () => {
      const y = scrollY + btn.getBoundingClientRect().height / 2;
      btn.classList.toggle("is-light", hit(boxes, y));
      btn.classList.toggle("is-off", hit(offBoxes, y));
    };
    let ticking = false;
    addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { check(); ticking = false; }); }, { passive: true });
    addEventListener("resize", measure);
    new ResizeObserver(measure).observe(document.body);
    measure();
  }

  // Appear — original observerAnime: when a section (.sp-anime) passes 20% from the screen bottom, the .sp-a inside gets is-anime. If there is a trigger, watch it and put is-anime-trigger on the section
  const fire = (root, target) => {
    const scope = target || root;
    scope.querySelectorAll(".sp-a:not(.is-manual)").forEach((el) => el.classList.add("is-anime"));
    if (scope.classList.contains("sp-a") && !scope.classList.contains("is-manual")) scope.classList.add("is-anime");
    if (target && target.classList.contains("sp-anime__trigger")) root.classList.add("is-anime-trigger");
  };
  document.querySelectorAll(".sp-anime").forEach((root) => {
    const trig = [...root.querySelectorAll(".sp-anime__trigger")];
    const zero = root.classList.contains("is-root-0") || trig.some((t) => t.classList.contains("is-root-0"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        fire(root, trig.length ? e.target : null);
        io.unobserve(e.target);
      });
    }, { rootMargin: zero ? "0px" : "0px 0px -20% 0px" });
    (trig.length ? trig : [root]).forEach((t) => io.observe(t));
  });

  // Menu dialog — opens with data-active fading in over 0.4s, on close calls close() after the fade ends
  const nav = document.getElementById("sp-nav");
  if (nav) {
    const openers = document.querySelectorAll('[data-modal-open="sp-nav"]');
    let busy = false;
    let last = null;
    // Original bodyScrollFixed — pins the body with position: fixed at its current spot, and on close releases it and returns to that spot
    const fixBody = (on) => {
      const b = document.body.style;
      if (on) {
        const bar = innerWidth - document.documentElement.clientWidth + "px";
        Object.assign(b, { position: "fixed", top: -scrollY + "px", left: "0", width: "100%", paddingRight: bar });
        document.body.classList.add("is-fixed");
        lenis?.stop();
      } else {
        if (!document.body.classList.contains("is-fixed")) return;
        const y = -parseInt(b.top || "0", 10);
        ["position", "top", "left", "width", "paddingRight"].forEach((k) => { b[k] = ""; });
        document.body.classList.remove("is-fixed");
        lenis?.start();
        scrollTo(0, y);
      }
    };
    const done = () => Promise.allSettled(nav.getAnimations().map((a) => a.finished));
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); close(); } };
    const open = () => {
      if (busy) return;
      busy = true;
      last = document.activeElement;
      nav.showModal();
      fixBody(true);
      setTimeout(() => document.body.classList.add("is-modal-open"), 0);
      openers.forEach((o) => o.setAttribute("aria-expanded", "true"));
      addEventListener("keydown", onKey);
      requestAnimationFrame(async () => { nav.setAttribute("data-active", "true"); await done(); busy = false; });
    };
    const close = async () => {
      if (busy) return;
      busy = true;
      nav.setAttribute("data-active", "false");
      openers.forEach((o) => o.setAttribute("aria-expanded", "false"));
      removeEventListener("keydown", onKey);
      if (reduce) fixBody(false);
      else { setTimeout(() => fixBody(false), 200); await new Promise((r) => requestAnimationFrame(r)); await done(); }
      nav.close();
      document.body.classList.remove("is-modal-open");
      last?.focus();
      busy = false;
    };
    openers.forEach((o) => o.addEventListener("click", (e) => { e.preventDefault(); open(); }));
    nav.querySelectorAll("[data-modal-close]").forEach((c) => c.addEventListener("click", (e) => { e.preventDefault(); close(); }));
    nav.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    nav.addEventListener("click", (e) => { if (e.target === nav.querySelector(".sp-nav__container")) close(); });
    md.addEventListener("change", () => { if (nav.getAttribute("data-active") === "true") { nav.close(); nav.setAttribute("data-active", "false"); fixBody(false); document.body.classList.remove("is-modal-open"); } });
  }

  // Slider — the branches of the original splideSlider with the same options
  const progress = (s, el) => {
    const bar = el.querySelector(".splide__progress-bar");
    if (!bar) return;
    const set = () => bar.style.setProperty("--bar-width", (100 * Math.min((s.index + 1) / (s.Components.Controller.getEnd() + 1), 1)) + "%");
    set();
    s.on("mounted move", set);
  };
  if (window.Splide) {
    document.querySelectorAll(".splide").forEach((el) => {
      if (el.querySelectorAll(".splide__slide").length < 1) return;
      if (el.classList.contains("sp-nav__slider")) {
        const s = new Splide(el, { type: "fade", rewind: true, arrows: false, pagination: false, speed: 1000 });
        s.mount();
        s.refresh();
        if (md.matches) document.querySelectorAll(".splide--menu__trigger").forEach((t) => {
          const go = () => s.go(parseInt(t.dataset.index || "0", 10));
          t.addEventListener("mouseenter", go);
          t.addEventListener("focus", go);
        });
        return;
      }
      if (el.classList.contains("splide--gallery")) {
        const s = new Splide(el, { rewind: true, pagination: false, mediaQuery: "min", gap: "1.5vw", padding: { right: "4vw", left: "4vw" }, breakpoints: { 782: { gap: "0.555vw", padding: { right: "3.125vw", left: "3.125vw" } } } });
        s.mount();
        s.refresh();
        s.on("move", () => el.classList.add("is-moving"));
        s.on("moved", () => el.classList.remove("is-moving"));
        progress(s, el);
        return;
      }
      if (el.classList.contains("splide--vision")) {
        const s = new Splide(el, { rewind: true, pagination: false, mediaQuery: "min", gap: "1.5vw", padding: { right: "4vw", left: "4vw" }, breakpoints: { 782: { gap: "0.69444vw", padding: { right: "29.9305vw", left: "21.8055vw" } } } });
        s.mount();
        s.refresh();
        progress(s, el);
        return;
      }
      if (el.classList.contains("splide--story")) {
        const s = new Splide(el, { rewind: true, arrows: false, pagination: false, perPage: 1, perMove: 1, gap: "8.75vw", padding: { right: "42.75vw", left: "11.75vw" }, mediaQuery: "min", breakpoints: { 782: { destroy: true } } });
        s.mount();
        s.refresh();
        return;
      }
      const s = new Splide(el, { rewind: true, arrows: false, pagination: false, perPage: 1, perMove: 1, gap: "5vw", padding: { right: "17.5vw" }, mediaQuery: "min", breakpoints: { 782: { destroy: true } } });
      s.mount();
      s.refresh();
    });
  }

  // Clock — City time in kanji numerals (year, month-day, hour-minute) every minute, 00:00 beside the place name
  const kan = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const k2 = (n) => (n < 10 ? kan[n] : (Math.floor(n / 10) === 1 ? "十" : kan[Math.floor(n / 10)] + "十") + (n % 10 ? kan[n % 10] : ""));
  const tokyo = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const tick = () => {
    const d = tokyo();
    const set = (k, v) => document.querySelectorAll(`[data-watch="${k}"]`).forEach((e) => { e.textContent = v; });
    set("year", String(d.getFullYear()).split("").map((c) => kan[+c]).join("") + "年");
    set("date", `${k2(d.getMonth() + 1)}月${k2(d.getDate())}日 ${k2(d.getHours())}時${k2(d.getMinutes())}分`);
    set("time", `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  };
  tick();
  setTimeout(() => { tick(); setInterval(tick, 6e4); }, (60 - tokyo().getSeconds()) * 1e3);

  // Page turn — unless it is an outside link, anchor or new window, fade out for 0.5s and then navigate. When returning via the back button, reload and fade in again
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  const leave = (a) => {
    const h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || a.target === "_blank" || /^(tel|mailto):/.test(h) || a.classList.contains("js-no-link-anime")) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.add("js-fadeout");
      setTimeout(() => { location.href = h; }, 500);
    });
  };

  // Anchor — the original glides with 600ms easeInOutQuad
  const quad = (a) => (a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const h = a.getAttribute("href");
    if (h === "#") return;
    a.addEventListener("click", (e) => {
      const t = document.querySelector(h);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { duration: 0.6, easing: quad });
      else t.scrollIntoView();
    });
  });

  setTimeout(() => {
    // Parallax — original parallax: photos inside a screen-fixed mask move by (photo height − mask height)/(mask height + section height), everything else by window height
    document.querySelectorAll(".sp-px").forEach((el, n) => {
      const item = el.querySelector(".sp-px__item");
      if (!item) return;
      if (reduce) { el.classList.add("is-init"); return; }
      setTimeout(() => {
        const body = el.classList.contains("is-screen") ? el.closest(".sp-screen-body, .sp-foot__screen-body") : null;
        let s = 0, m = 0, a = 0;
        const calc = () => requestAnimationFrame(() => {
          s = el.offsetHeight;
          if (body) { m = body.getBoundingClientRect().top + scrollY; a = (item.offsetHeight - s) / (s + body.offsetHeight); }
          else { m = el.getBoundingClientRect().top + scrollY; a = (item.offsetHeight - s) / (winH + s); }
        });
        calc();
        addEventListener("resize", calc);
        const draw = () => {
          if (document.body.classList.contains("is-fixed")) return;
          if (el.classList.contains("is-desktop") && !md.matches) { el.style.setProperty("--position", "0"); return; }
          el.style.setProperty("--position", String(Math.round((scrollY + winH - m) * a)));
        };
        const onScroll = () => requestAnimationFrame(draw);
        new IntersectionObserver((es) => es.forEach((e) => {
          if (e.isIntersecting) { el.classList.add("is-active"); addEventListener("scroll", onScroll); }
          else { removeEventListener("scroll", onScroll); el.classList.remove("is-active"); }
        }), { rootMargin: "50% 0px" }).observe(body || el);
        requestAnimationFrame(() => requestAnimationFrame(draw));
        el.classList.add("is-init");
      }, 20 * n);
    });

    // Icon follow — original stickyIcon: mouse vertical ratio × (photo height − icon height)
    document.querySelectorAll(".sp-sticky-icon").forEach((el) => {
      const body = el.querySelector(".sp-sticky-icon__body");
      const item = el.querySelector(".sp-sticky-icon__item");
      if (!body) return;
      let v = 0, room = 0;
      const calc = () => { v = el.offsetHeight; room = body.offsetHeight - (item ? item.getBoundingClientRect().height : 0); };
      setTimeout(calc, 100);
      addEventListener("resize", calc);
      el.addEventListener("mousemove", (e) => requestAnimationFrame(() => {
        if (v <= 0 || room < 0) return;
        let p = Math.round(((e.clientY - el.getBoundingClientRect().top) / v) * room * 100) / 100;
        p = Math.max(0, Math.min(p, room));
        el.style.setProperty("--sticky-y", p + "px");
      }));
      el.addEventListener("mouseenter", () => el.classList.add("is-active"));
      el.addEventListener("mouseleave", () => el.classList.remove("is-active"));
    });

    // Thumbnail follow — original changeCursor: the value pushed opposite to the movement shrinks by 0.85x each frame and sticks to the mouse (60fps cap)
    if (matchMedia("(pointer: fine)").matches) document.querySelectorAll("[data-cursor]").forEach((area) => {
      const el = document.querySelector(area.dataset.cursor);
      if (!el) return;
      const g = { x: 0, y: 0 }, p = { x: 0, y: 0 }, lag = { x: 0, y: 0 };
      const step = Math.floor(1000 / 60);
      let prev = performance.now(), stopped = false, raf = 0;
      const r2 = (n) => Math.round(n * 100) / 100;
      const loop = () => { raf = requestAnimationFrame(frame); };
      const frame = (t) => {
        if (stopped) return;
        const dt = t - prev;
        if (dt <= step) { loop(); return; }
        prev = t - (dt % step);
        lag.x *= 0.85;
        lag.y *= 0.85;
        const x = g.x + r2(lag.x), y = g.y + r2(lag.y);
        el.setAttribute("style", `transform:translate3d(${x}px, ${y}px, 0px);`);
        if (g.x === x) stopped = true;
        loop();
      };
      area.addEventListener("mouseenter", (e) => { p.x = e.clientX; p.y = e.clientY; loop(); });
      area.addEventListener("mouseleave", () => { el.classList.remove("is-active", "is-hidden"); cancelAnimationFrame(raf); });
      area.addEventListener("mousemove", (e) => {
        if (g.x && g.y && !el.classList.contains("is-active")) el.classList.add("is-active");
        if (stopped) { loop(); stopped = false; }
        g.x = e.clientX; g.y = e.clientY;
        lag.x += p.x - g.x; lag.y += p.y - g.y;
        p.x = g.x; p.y = g.y;
      });
      const items = el.querySelectorAll("[data-cursor-img]");
      area.querySelectorAll("[data-cursor-trigger]").forEach((t, i) => t.addEventListener("mouseenter", () => items.forEach((im, j) => { im.style.opacity = j === i ? "1" : "0"; })));
    });

    // Fold: original toggle. Pressing summary changes the height with a 0.4s ease and then tidies up open.
    document.querySelectorAll("details.sp-toggle").forEach((d) => {
      const s = d.querySelector("summary");
      if (!s) return;
      let busy = false;
      s.addEventListener("click", async (e) => {
        e.preventDefault();
        if (busy) return;
        busy = true;
        const was = d.open;
        if (!was) d.open = true;
        d.classList.toggle("is-active", !was);
        const cs = getComputedStyle(d), ss = getComputedStyle(s);
        const shut = s.offsetHeight + parseFloat(ss.marginTop) + parseFloat(ss.marginBottom) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        const full = d.offsetHeight;
        await d.animate({ height: was ? [full + "px", shut + "px"] : [shut + "px", full + "px"] }, { duration: reduce ? 0 : 400, easing: "ease" }).finished;
        if (was) d.open = false;
        busy = false;
      });
    });

    document.querySelectorAll("a").forEach(leave);
  }, 100);
})();
