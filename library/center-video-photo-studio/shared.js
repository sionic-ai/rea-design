// Shared across all pages — day/night skin (time·session), 1ms clock, lenis 1.0.10 (lerp .2), first-visit cover · page fade transition, micromodal drawer, once when visible, footer laid beneath
(() => {
  const KW = (window.KW = {});
  const reduce = (KW.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches);
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger);

  // ── Day/night: if the user has chosen before, keep it (at night the dot box is checked too), otherwise 4~21h is day · any other time is night.
  // Original does not check the box when set by time, so pressing first at night only checks it and the skin stays night — from the second press it switches to day
  const KEY = "kw-theme";
  const switches = [...document.querySelectorAll("[data-theme-switch]")];
  const setTheme = (t) => { root.dataset.theme = t; };
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    setTheme(saved);
    if (saved === "dark") switches.forEach((i) => (i.checked = true));
  } else {
    const h = new Date().getHours();
    const t = h >= 4 && h < 21 ? "light" : "dark";
    setTheme(t);
    sessionStorage.setItem(KEY, t);
  }
  switches.forEach((i) => i.addEventListener("change", () => {
    const t = i.checked ? "dark" : "light";
    setTheme(t);
    sessionStorage.setItem(KEY, t);
  }));

  // ── Clock: hh:mm:ss:centiseconds — the original rewrites every 1ms
  const clocks = [...document.querySelectorAll("[data-current-time]")];
  const pad = (n, k = 2) => String(n).padStart(k, "0");
  const tick = () => {
    const d = new Date();
    const s = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}:${pad(d.getMilliseconds(), 3).slice(0, 2)}`;
    clocks.forEach((c) => (c.textContent = s));
  };
  if (clocks.length) { tick(); setInterval(tick, 1); }

  // ── Smooth scroll: original lenis 1.0.10, lerp .2 (.8 in the default Mac browser)
  const safari = /safari/i.test(navigator.userAgent) && !/chrome|chromium|crios/i.test(navigator.userAgent);
  if (!reduce && window.lenis) {
    KW.lenis = new window.lenis({ lerp: safari ? 0.8 : 0.2, wheelMultiplier: 1 });
    KW.lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { KW.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ── First-visit curtain · page fade
  const page = document.querySelector(".kw-page");
  const intro = document.querySelector(".kw-intro");
  const origin = (u) => { try { return new URL(u).origin; } catch (e) { return ""; } };
  const arrive = () => {
    if (!page) return;
    if (reduce) { gsap.set(page, { opacity: 1 }); intro?.remove(); return; }
    const fresh = origin(document.referrer) !== location.origin || document.referrer === location.href;
    if (fresh && intro) {
      gsap.set([intro, page], { opacity: 1 });
      gsap.to(".kw-intro__overlay", { opacity: 0, duration: 1.5, delay: 0.5, ease: "power4.out", onComplete: () => gsap.set(intro, { display: "none" }) });
    } else {
      intro && gsap.set(intro, { display: "none" });
      gsap.to(page, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out" });
    }
  };
  addEventListener("load", arrive);
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(page, { opacity: 1 }); });
  const skip = (a) => {
    const raw = a.getAttribute("href") || "";
    if (!raw || raw.startsWith("#") || /^(tel|mailto):/.test(raw) || a.target === "_blank" || a.hasAttribute("data-no-trans")) return true;
    try { return new URL(a.href, location.href).origin !== location.origin; } catch (e) { return true; }
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || skip(a)) return;
    e.preventDefault();
    if (reduce) { location.href = a.href; return; }
    // Links inside the drawer wait 1s for the drawer to close before darkening
    gsap.to(page, { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: a.hasAttribute("data-drawer-close") ? 1 : 0.3, onComplete: () => (location.href = a.href) });
  });

  // ── Drawer: opened and closed with micromodal — items slide in from -20px after .3s over .6s at .04s stagger, on close they fade out in .3s at .002s stagger, then it closes
  const drawer = document.getElementById("kw-drawer");
  const burgers = [...document.querySelectorAll("[data-hamburger]")];
  let opened = false, intoTl = null;
  const expanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
  const items = () => drawer.querySelectorAll("[data-drawer-items]");
  const openDrawer = () => {
    if (opened || !window.MicroModal) return;
    MicroModal.show("kw-drawer", {
      disableScroll: true,
      disableFocus: true,
      awaitOpenAnimation: !reduce,
      awaitCloseAnimation: !reduce,
      onShow: () => {
        setTimeout(() => expanded(true), 200);
        opened = true;
        KW.lenis?.stop();
        intoTl = gsap.fromTo(items(), { opacity: 0, x: "-20px" }, { opacity: 1, x: 0, delay: 0.3, duration: reduce ? 0 : 0.6, ease: "power1.out", stagger: { each: reduce ? 0 : 0.04 } });
        drawer.querySelector(".kw-drawer__container").scrollTop = 0;
      },
      onClose: () => { opened = false; expanded(false); KW.lenis?.start(); },
    });
  };
  const closeDrawer = () => {
    if (!opened) return;
    intoTl?.pause();
    gsap.fromTo(items(), { opacity: 1 }, { opacity: 0, ease: "power1.out", duration: reduce ? 0 : 0.3, stagger: { each: 0.002 }, onComplete: () => MicroModal.close("kw-drawer") });
  };
  if (drawer) {
    burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
    drawer.querySelectorAll("[data-drawer-close]").forEach((a) => a.addEventListener("click", closeDrawer));
  }

  // ── Once when visible: is-visible is added when it enters 20% above the screen bottom
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const d = +(e.target.dataset.delay || 0) * 1000;
    setTimeout(() => e.target.classList.add("is-visible"), d);
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-scroll-trigger]").forEach((el) => io.observe(el));


  // Dim the current page menu
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".kw-header__gnav a, .kw-drawer__nav a, .kw-footer__nav a").forEach((a) => {
    if ((a.getAttribute("href") || "") === here) a.classList.add("is-current");
  });
})();
