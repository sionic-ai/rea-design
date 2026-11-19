// Common to all pages: draws the background, loader and clock badge (outside the box, once) and the left nav, glass button, footer and text fade (per box), and wires up smooth scroll, phone menu and page transition.
// Page transitions use barba 2.10.3 (+prefetch 2.2.0) like the original — header, body and footer are inside [data-barba="container"] is the only thing swapped out.
//   Page scripts live in SO.pages[name] = (Box) => Set to peel-off, attach when the box comes in and peel when it leaves. When opened as a file (file://), it just covers with a white sheet and moves on, without barba.
// Original values: Lenis lerp .05 · duration .8 · expo curve / page-transition white curtain .3s Cubic.easeOut (back navigation .02s) / first-load blank white curtain .2s Cubic.easeInOut
//            phone menu 47px→auto .32s / text fade .8s Cubic.easeInOut · .026s per character · .3s after a period · rootMargin bottom -20% / anchor scroll 1s (half expo, half quint, easeInOut)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const SO = (window.SO = { reduced, lenis: null, pages: {} });
  const windowPath = "M139.5 0C216.6 0 279 66 279 150v33c0 84-62.4 150-139.5 150S0 267 0 183v-33C0 66 62.4 0 139.5 0Z";
  SO.windowPath = windowPath;
  SO.windowMask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 279 333'><path d='${windowPath}'/></svg>`)}")`;
  let gid = 0;
  const mark = () => {
    const id = "so-sky" + gid++;
    return `<svg class="so-mark" viewBox="0 0 279 333" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--site-mark-1)"/><stop offset=".55" style="stop-color: var(--site-mark-2)"/><stop offset="1" style="stop-color: var(--site-mark-3)"/></linearGradient></defs><path d="${windowPath}" fill="url(#${id})"/></svg>`;
  };
  SO.mark = mark;
  const icons = {
    globe: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><circle cx="7" cy="7" r="6"/><path d="M1 7h12M7 1c2 2 2 10 0 12M7 1c-2 2-2 10 0 12"/></svg>',
    plane: '<svg viewBox="0 0 30 19" fill="currentColor"><path d="M2 10.2 0 6.4l2.2-.3 2.6 2.4 7.4-.6L8.4.6 11 0l7 7.6 8.6-.6c1.8-.1 3.4.6 3.4 1.6s-1.6 1.7-3.4 1.9l-8.4.8-6.6 7.6-2.6-.4 3.4-6.8-7.6.8Z"/></svg>',
    down: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 1v7M2.8 5 6 8.2 9.2 5M1 11h10"/></svg>',
    pin: '<svg viewBox="0 0 8 8" fill="currentColor"><path d="M4 0a3 3 0 0 0-3 3c0 2.2 3 5 3 5s3-2.8 3-5a3 3 0 0 0-3-3Zm0 4.2A1.2 1.2 0 1 1 4 1.8a1.2 1.2 0 0 1 0 2.4Z"/></svg>',
    snsA: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l12 12M14 2 2 14"/></svg>',
    snsB: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="2.5" width="16" height="11" rx="3"/><path d="M6.5 5.5v5l4-2.5Z" style="fill: var(--site-white)"/></svg>',
  };
  SO.icons = icons;


  // Turn a skin variable into a real color — for places that can’t read var(), such as image URLs (data:) and GSAP color tweens
  const probe = document.createElement("i");
  probe.hidden = true;
  body.append(probe);
  SO.color = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };

  // Original ie.easeInOut — a curve mixing expoInOut and quintInOut half and half
  const expoInOut = (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 0.5 * 2 ** (20 * t - 10) : 1 - 0.5 * 2 ** (-20 * t + 10));
  const quintInOut = (t) => (t < 0.5 ? 16 * t ** 5 : 1 + 16 * (t - 1) ** 5);
  SO.easeInOut = (t) => 0.5 * expoInOut(t) + 0.5 * quintInOut(t);

  // ── Outside the box, once only: background · loader · clock badge
  body.insertAdjacentHTML(
    "afterbegin",
    `<div class="so-bg" aria-hidden="true"><i class="main"></i><i class="about1"></i><i class="about2"></i></div>
    <div class="so-weather" data-tod="afternoon" data-tz="Asia/Tokyo" data-slot="weather-badge">
      <div class="text"><div class="time"><span class="value">00<span class="colon">:</span>00</span> <span class="unit">PM</span></div>
      <div class="place" data-label="Place name in English · airport code, country here">${icons.pin}<span>City, Land</span></div></div>
      <span class="orb" aria-hidden="true"></span>
    </div>`
  );
  if (!body.querySelector(".so-loading")) body.insertAdjacentHTML("beforeend", `<div class="so-loading" aria-hidden="true"></div>`);
  const loading = body.querySelector(".so-loading");

  // Smooth scroll — touch devices use native scroll
  const touch = matchMedia("(hover: none)").matches;
  if (!reduced && !touch && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.05, duration: 0.8, easing: (t) => 1 - Math.pow(2, -10 * t), touchMultiplier: 1 });
    SO.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  SO.stop = () => (SO.lenis ? SO.lenis.stop() : (document.documentElement.style.overflow = "hidden"));
  SO.start = () => (SO.lenis ? SO.lenis.start() : (document.documentElement.style.overflow = ""));
  SO.scrollTo = (target) => {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    if (SO.lenis) SO.lenis.scrollTo(el, { duration: 1, easing: SO.easeInOut });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  const toTop = () => { SO.lenis ? SO.lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0); };

  // Clock badge — like the original, shows the local time of that place (data-tz). Updates every minute, picks the circle colour by time zone
  const weather = body.querySelector(".so-weather");
  const tick = () => {
    const now = new Date();
    const d = new Date(now.toLocaleString("en-US", { timeZone: weather.dataset.tz || undefined }));
    const h = d.getHours();
    weather.querySelector(".value").innerHTML = `${String(h % 12 || 12).padStart(2, "0")}<span class="colon">:</span>${String(d.getMinutes()).padStart(2, "0")}`;
    weather.querySelector(".unit").textContent = h >= 12 ? "PM" : "AM";
    weather.dataset.tod = h >= 5 && h < 10 ? "morning" : h >= 10 && h < 16 ? "afternoon" : h >= 16 && h < 19 ? "evening" : "night";
    setTimeout(tick, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());
  };
  tick();

  // ── Per box: header (nav, glass button), footer, phone menu, text fade
  const navC = (home) => [
    ["OVERVIEW", `${home}#overview`, ""],
    ["ABOUT", `${home}#about`, ""],
    ["VISION", `${home}#vision`, ""],
    ["NEWS", "news.html", "news article"],
    ["EVENT", "event.html", "event"],
  ];
  const navB = [
    ["OVERVIEW", "service.html#zones", ""],
    ["VISION", "service.html#vision", ""],
    ["AREA", "service.html#areas", ""],
    ["NETWORK", "service.html#flow", ""],
    ["ACTION", "service.html#actions", ""],
    ["NEWS", "news.html", ""],
    ["EVENT", "event.html", ""],
    ["CONTACT", "service.html#contact", ""],
  ];
  const mobile = () => matchMedia("(max-width: 768px)").matches;
  let showMenu = () => {};
  SO.showMenu = (open) => showMenu(open);

  const chrome = (root) => {
    const page = root.dataset.barbaNamespace || "home";
    const biz = root.hasAttribute("data-biz");
    body.dataset.page = page;
    body.classList.toggle("is-biz", biz);
    const off = [];
    const on = (el, ev, fn) => { el?.addEventListener(ev, fn); off.push(() => el?.removeEventListener(ev, fn)); };

    // On the first page the nav goes to section anchors, on other pages it goes to the first page’s anchors
    const nav = (biz ? navB : navC(page === "home" ? "" : "index.html"))
      .map(([l, h, cur]) => `<a href="${h}" class="${cur.split(" ").includes(page) ? "is-current" : ""}">${l}</a>`)
      .join("");
    const head = root.querySelector('[data-slot="header"]');
    if (head) {
      head.innerHTML = `
        <nav class="so-gnav" aria-label="Main menu">
          <a class="logo" href="${biz ? "service.html" : "index.html"}" aria-label="Home"><span class="mark-wrap">${mark()}</span><span class="word"><b>WORDMARK</b><b>NAME</b><small>AIRPORT CITY</small></span></a>
          ${biz ? '<p class="business">for BUSINESS</p>' : ""}
          <div class="list">${nav}</div>
          <div class="lang">${icons.globe}<span class="is-active">KO</span><a href="#">EN</a></div>
          <button class="so-menu" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>
        </nav>
        <div class="so-gnav-bg"></div>
        <div class="so-topage" data-slot="to-business"><a href="${biz ? "index.html" : "service.html"}">${biz ? "General guest<br>Go to page" : "The business<br>To the reviewer"}</a></div>`;
    }
    const foot = root.querySelector('[data-slot="footer"]');
    if (foot) {
      foot.classList.add("so-footer");
      const doc = (t) => `<li><a href="#"><span class="label">${t}</span>${icons.down}</a></li>`;
      foot.innerHTML = `<div class="container"><div class="inner">
        <p class="title">Download related materials</p>
        <ul class="docs">${doc("Your one-line resource name here")}${doc("Your somewhat longer resource name here<br>Place it in two lines")}${doc("Your material name, second line<br>00")}${doc("Material Name")}</ul>
        <ul class="logos"><li><span class="wf-logo">Logo 1</span></li><li><span class="wf-logo">Logo 2</span></li></ul>
        <ul class="sns"><li><a href="#" aria-label="SNS 1">${icons.snsA}</a></li><li><a href="#" aria-label="SNS 2">${icons.snsB}</a></li></ul>
        <p class="note">Your one line here on the site operator and usage notice.</p>
        <div class="other"><a href="#">Privacy policy</a><a href="#">Social media policy</a><a href="#">Operating organization</a></div>
      </div></div>`;
    }

    // Phone menu
    const gnav = root.querySelector(".so-gnav");
    const gbg = root.querySelector(".so-gnav-bg");
    showMenu = (open) => {
      if (!gnav || !mobile()) return;
      gnav.classList.toggle("is-open", open);
      if (open) {
        gsap.fromTo(gnav, { height: 47 }, { height: "auto", duration: reduced ? 0 : 0.32, ease: "power2.out" });
        gbg.style.pointerEvents = "auto";
        gsap.to(gbg, { opacity: 1, duration: reduced ? 0 : 0.32, ease: "power2.out" });
        SO.stop();
      } else {
        gsap.to(gnav, { height: 47, duration: reduced ? 0 : 0.32, ease: "power2.inOut", clearProps: "height" });
        gsap.to(gbg, { opacity: 0, duration: reduced ? 0 : 0.32, ease: "power2.inOut", onComplete: () => (gbg.style.pointerEvents = "none") });
        SO.start();
      }
    };
    on(root.querySelector(".so-menu"), "click", () => showMenu(!gnav.classList.contains("is-open")));
    on(gbg, "click", () => showMenu(false));
    const mq = matchMedia("(max-width: 768px)");
    on(mq, "change", () => { gnav.classList.remove("is-open"); gsap.set(gnav, { clearProps: "height" }); gsap.set(gbg, { opacity: 0 }); SO.start(); });

    // When the footer is visible, the glass button turns into a white panel
    const topage = root.querySelector(".so-topage");
    if (foot && topage) {
      ScrollTrigger.create({
        trigger: foot,
        start: "top bottom",
        end: "bottom bottom-=10px",
        onToggle: (s) => topage.classList.toggle("is-footer-visible", s.isActive || s.progress === 1),
        onLeave: () => topage.classList.add("is-footer-visible"),
      });
    }

    // Appear when visible: letter by letter / image / blur clearing
    const splitText = (el) => {
      el.querySelectorAll("p, h2, h3").forEach((p) => {
        if (p.closest("[data-nosplit]")) return;
        const parts = p.innerHTML.split(/(<br\s*\/?>|<\/?span[^>]*>)/gi);
        p.innerHTML = parts
          .map((s) => (/^<(br|\/?span)/i.test(s) ? s : [...s].map((ch) => `<span class="fade-item${ch === "." || ch === "。" ? " comma" : ""}">${ch}</span>`).join("")))
          .join("");
      });
    };
    const inview = root.querySelectorAll("[data-inview]");
    if (reduced) {
      inview.forEach((el) => gsap.set(el.dataset.inview === "blur-text" ? el.querySelectorAll(".blur-item") : el, { opacity: 1, filter: "none" }));
    } else {
      inview.forEach((el) => {
        if (el.dataset.inview === "fade-text") splitText(el);
        if (el.dataset.inview === "fade-img") gsap.set(el, { opacity: 0 });
        if (el.dataset.inview === "blur-text") gsap.set(el.querySelectorAll(".blur-item"), { opacity: 0, filter: "blur(8px)" });
      });
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target;
          const kind = el.dataset.inview;
          if (kind === "fade-text") {
            let delay = 0;
            const items = el.querySelectorAll(".fade-item");
            items.forEach((it, i) => {
              delay += i > 0 && items[i - 1].classList.contains("comma") ? 0.3 : 0.026;
              gsap.to(it, { opacity: 1, ease: "power2.inOut", duration: 0.8, delay });
            });
          } else if (kind === "fade-img") {
            gsap.to(el, { opacity: 1, ease: "power2.inOut", duration: 0.5 });
          } else if (kind === "blur-text") {
            gsap.to(el.querySelectorAll(".blur-item"), { filter: "blur(0px)", opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" });
          }
          io.unobserve(el);
        }),
        { rootMargin: "0px 0px -20% 0px", threshold: 0 }
      );
      inview.forEach((el) => io.observe(el));
      off.push(() => io.disconnect());
    }

    // Paper plane icon on the news card
    root.querySelectorAll(".so-card .ico, .single .btn .ico").forEach((el) => (el.innerHTML = icons.plane));
    return () => off.forEach((f) => f());
  };

  // Attaching and detaching a box — ScrollTrigger and tweens are gathered in gsap.context and reverted all at once
  let mounted = null;
  const mount = (root) => {
    sessionStorage.setItem("so-opening", sessionStorage.getItem("so-opening") || (root.dataset.barbaNamespace === "home" ? "" : "1"));
    let offChrome = null, page = null;
    const ctx = gsap.context(() => {
      offChrome = chrome(root);
      page = SO.pages[root.dataset.barbaNamespace]?.(root) || null;
    }, root);
    mounted = { ctx, offChrome, page };
    return page;
  };
  const unmount = () => {
    if (!mounted) return;
    mounted.page?.destroy?.();
    mounted.offChrome?.();
    mounted.ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    mounted = null;
  };

  // First load: a blank white veil lifts in .2s (original onload). If the first page has an opening, the page sets it instead
  // Lifting uses a css transition — so frames don’t drop even when the main thread is busy with font loading and ScrollTrigger measuring at load (value is the original .2s Cubic.easeInOut)
  SO.reveal = () => {
    loading.classList.add("is-gone");
    if (location.hash) setTimeout(() => SO.scrollTo(location.hash), 100);
  };
  const veilIn = (dur) => {
    if (loading.classList.contains("is-gone")) { loading.classList.remove("is-gone"); gsap.set(loading, { autoAlpha: 0 }); }
    return gsap.to(loading, { autoAlpha: 1, duration: reduced ? 0 : dur, ease: "power2.out" });
  };
  const veilOut = (dur) => gsap.fromTo(loading, { autoAlpha: 1 }, { autoAlpha: 0, duration: reduced ? 0 : dur, ease: "power2.out" });

  const sameDoc = (href) => {
    const u = new URL(href, location.href);
    return u.origin === location.origin && u.pathname === location.pathname;
  };
  // Same-page anchors scroll smoothly, empty links (#) are blocked — with or without barba
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (href === "#") { e.preventDefault(); return; }
    if (/^[a-z]+:/i.test(href)) return;
    const hash = href.split("#")[1];
    if (sameDoc(a.href) && hash) { e.preventDefault(); showMenu(false); SO.scrollTo("#" + hash); }
  }, true);

  const startBarba = () => {
    const scrolls = {};
    barba.use(barbaPrefetch);
    barba.init({
      timeout: 8000,
      preventRunning: true,
      prevent: ({ el, href }) => {
        if (el.closest(".wf-ui") || el.classList.contains("prevent")) return true;
        try { return sameDoc(href) && !!new URL(href, location.href).hash; } catch { return true; }
      },
      transitions: [{
        name: "default-transition",
        sync: false,
        leave(data) {
          scrolls[data.current.namespace] = window.scrollY;
          showMenu(false);
          return veilIn(data.trigger === "back" ? 0.02 : 0.3);
        },
        afterLeave() { unmount(); },
        enter(data) {
          data.current.container.style.display = "none";
          if (data.trigger !== "back") toTop();
        },
        after(data) {
          mount(data.next.container);
          SO.lenis?.resize();
          ScrollTrigger.refresh();
          if (data.trigger === "back") {
            if (location.hash) SO.scrollTo(location.hash);
            else { const y = scrolls[data.next.namespace] ?? 0; SO.lenis ? SO.lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y); }
            return veilOut(0.02);
          }
          if (location.hash) setTimeout(() => SO.scrollTo(location.hash), 100);
          return veilOut(0.3);
        },
      }],
    });
  };

  // When opened as a file (barba can’t fetch the page): a white curtain covers for .3s, the real navigation happens, then the new page lifts it over .3s
  const startFallback = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (/^[a-z]+:/i.test(href) || !/\.html(#|$)/.test(href) || sameDoc(a.href)) return;
      e.preventDefault();
      showMenu(false);
      sessionStorage.setItem("so-nav", "1");
      veilIn(0.3).eventCallback("onComplete", () => (location.href = href));
    });
    window.addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(loading, { autoAlpha: 0 }); });
  };

  const first = document.querySelector('[data-barba="container"]');
  const boot = () => {
    const page = mount(first);
    const http = /^https?:$/.test(location.protocol) && window.barba;
    http ? startBarba() : startFallback();
    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
      if (sessionStorage.getItem("so-nav")) { sessionStorage.removeItem("so-nav"); veilOut(0.3); }
      else if (page?.reveal) page.reveal();
      else SO.reveal();
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
