// Motion shared by all pages — the numbers of the original Webflow interactions (ix2) ported to GSAP:
// Locomotive smooth scroll (lerp .1, .5s after DOM ready), header bar hides on scroll down (.4s), first-visit loader (5.5s, once a day), transition curtain (underline · footer link),
// Phone menu drawer, work branch hover, circle ring button, footer city rise.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const E = { outExpo: "expo.out", inOutExpo: "expo.inOut", outQuad: "quad.out", inOut: "power1.inOut" };
  const page = document.querySelector(".av-page");
  const nav = document.querySelector(".av-nav");

  // Header line — scrolling down hides it upward (top −6vw), scrolling up brings it back
  let prevY = 0;
  const navOn = (y) => {
    if (!nav) return;
    nav.classList.toggle("is-closed", y > prevY && y > 0);
    prevY = y;
  };

  // Locomotive — like the original, not used on touch devices, uses window scroll
  let loco = null;
  const touch = matchMedia("(hover: none)").matches;
  // Pages like the work list, where the panel has no data-scroll-container, do not get Locomotive in the original either, so it is window scroll
  const box = document.querySelector("[data-scroll-container]");
  const startScroll = () => {
    if (box && !reduce && !touch && window.LocomotiveScroll) {
      loco = new LocomotiveScroll({ el: box, smooth: true });
      loco.on("scroll", (o) => navOn(o.scroll.y));
      window.avLoco = loco;
      new ResizeObserver(() => loco.update()).observe(box);
    } else addEventListener("scroll", () => navOn(scrollY), { passive: true });
    document.dispatchEvent(new CustomEvent("av:scroll"));
  };
  document.addEventListener("DOMContentLoaded", () => setTimeout(startScroll, 500));

  // First-visit loader — the cover lifts, photo and quote rise, then the panel shrinks to .74x and exits upward. The number goes 0 → 100 over 4s circ.inOut
  // The original ix2 runs after the page is fully loaded and Webflow has woken up — so it starts after load. Before that a gold cover covers the page
  const wait = document.querySelector(".av-wait");
  const root = document.documentElement;
  if (!wait || !window.gsap) root.classList.remove("av-loading");
  if (wait && root.classList.contains("av-loading") && window.gsap) {
    try { localStorage.setItem("av-seen", String(Date.now())); } catch {}
    const $ = (s) => wait.querySelector(s);
    // The screen is a pale gold panel (content) — the top veil (top) over the photo slot lifts to reveal the photo, and on exit the lower veil (over) rises to cover it again, then the whole panel shrinks to .74x and exits upward
    const content = $(".av-wait__content"), cover = $(".av-wait__over--top"), img = $(".av-wait__img .wf-img"), over = $(".av-wait__over:not(.av-wait__over--top)");
    const quote = $(".av-wait__quote"), label = $(".av-wait__label"), count = $(".av-wait__num");
    gsap.set(over, { yPercent: 100 });
    gsap.set(img, { yPercent: 10, scale: 1.1 });
    gsap.set([quote, label], { yPercent: 100 });
    const tl = gsap.timeline({ paused: true });
    tl.to(cover, { yPercent: -100, duration: 1.7, ease: E.inOutExpo }, 0)
      .to(img, { yPercent: 0, duration: 1, ease: E.inOutExpo }, 0.4)
      .to(img, { scale: 1, duration: 2, ease: E.outExpo }, 0.4)
      .to(quote, { yPercent: 0, duration: 1.5, ease: E.outExpo }, 1)
      .to(label, { yPercent: 0, duration: 1.2, ease: E.outExpo }, 1.3)
      .addLabel("out", 2.5)
      .to(img, { yPercent: -60, duration: 1.3, ease: E.inOutExpo }, "out+=0.3")
      .to(over, { yPercent: 0, duration: 1.2, ease: E.inOutExpo }, "out+=0.3")
      .to(over, { scale: 1.05, duration: 1, ease: E.outExpo }, "out+=0.3")
      .to(quote, { yPercent: -100, duration: 1, ease: E.outExpo }, "out+=0.7")
      .to(label, { yPercent: -100, duration: 0.8, ease: E.outExpo }, "out+=0.7")
      .to(content, { scale: 0.74, duration: 1.8, ease: E.inOutExpo }, "out+=1.5")
      .to(content, { yPercent: -100, duration: 1.5, ease: E.inOutExpo }, "out+=1.5")
      .add(() => root.classList.remove("av-loading"), "out+=3");
    const n = { v: 0 };
    const go = () => { tl.play(); gsap.to(n, { v: 100, duration: 4, ease: "circ.inOut", onUpdate: () => { count.textContent = Math.round(n.v); } }); };
    if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  }

  // Transition curtain — underline link · footer link: a pale gold curtain rises from 100% below at .65x, growing (1.5s · 1.8s inOutExpo) and the page moves 5% up (1.7s)
  const exit = document.querySelector(".av-exit");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-exit]");
    if (!a || !exit || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname || url.origin !== location.origin) return;
    e.preventDefault();
    if (reduce || !window.gsap) { location.href = url.href; return; }
    exit.style.display = "block";
    gsap.fromTo(exit, { yPercent: 100, scale: 0.65 }, { yPercent: 0, duration: 1.5, ease: E.inOutExpo });
    gsap.to(exit, { scale: 1, duration: 1.8, ease: E.inOutExpo });
    if (page) gsap.to(page, { yPercent: -5, duration: 1.7, ease: E.inOutExpo });
    setTimeout(() => { location.href = url.href; }, 1500);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && exit) { exit.style.display = "none"; if (page) gsap?.set(page, { yPercent: 0 }); } });

  // Phone menu drawer — open: panel at .74× and −100% for 1.6s·1.2s outExpo, big links from 110% starting at .55s then .1s apart for 1.3s outExpo.
  // Close: links to 120% in 1s outExpo, after .5s the panel goes to .75× · −100% (1.9s · 1.5s)
  const trigger = document.querySelector(".av-trigger"), menu = document.querySelector(".av-menu");
  if (trigger && menu && window.gsap) {
    const links = [...menu.querySelectorAll(".av-menu__link > *")], social = [...menu.querySelectorAll(".av-menu__social a > span")];
    let open = false, tl = null;
    const set = (v) => {
      open = v;
      trigger.setAttribute("aria-expanded", String(v));
      tl?.kill();
      if (v) {
        menu.classList.add("is-shown");
        tl = gsap.timeline()
          .fromTo(menu, { scale: 0.74, yPercent: -100 }, { scale: 1, duration: 1.6, ease: E.outExpo }, 0)
          .to(menu, { yPercent: 0, duration: 1.2, ease: E.outExpo }, 0)
          .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: E.outExpo, stagger: 0.1 }, 0.55)
          .fromTo(social, { yPercent: 100 }, { yPercent: 0, duration: 1.3, ease: E.outExpo, stagger: 0.1 }, 0.55 + links.length * 0.1);
      } else {
        tl = gsap.timeline({ onComplete: () => menu.classList.remove("is-shown") })
          .to(links, { yPercent: 120, duration: 1, ease: E.outExpo }, 0)
          .to(social, { yPercent: 100, duration: 1, ease: E.outExpo }, 0)
          .to(menu, { scale: 0.75, duration: 1.9, ease: E.outExpo }, 0.5)
          .to(menu, { yPercent: -100, duration: 1.5, ease: E.outExpo }, 0.5);
      }
    };
    trigger.addEventListener("click", () => set(!open));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }

  // Work categories — wide screen (>At 991px), hovering over a row shows that branch’s photo and text on the right
  document.querySelectorAll(".av-work").forEach((box) => {
    const rows = [...box.querySelectorAll(".av-wrow")], sides = [...box.querySelectorAll(".av-wside")];
    const show = (i) => sides.forEach((s, k) => s.classList.toggle("is-on", k === i));
    show(0);
    rows.forEach((r, i) => r.addEventListener("pointerover", () => { if (innerWidth > 991) show(i); }));
  });

  // Circle ring button — on press the ring unwinds in 1s and returns to place .1s later
  document.querySelectorAll(".av-ring").forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-active") || b.classList.contains("is-back")) return;
    b.classList.add("is-active");
    setTimeout(() => { b.classList.replace("is-active", "is-back"); setTimeout(() => b.classList.remove("is-back"), 100); }, 1000);
  }));

  // Footer city — once when visible, from 100% below in 1s outExpo · .1s stagger (css)
  const foot = document.querySelector(".av-foot");
  if (foot) {
    if (reduce) foot.classList.add("is-in");
    else {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { foot.classList.add("is-in"); io.disconnect(); } });
      io.observe(foot);
    }
  }
  document.querySelectorAll("[data-scroll-top]").forEach((b) => b.addEventListener("click", () => {
    if (loco) loco.scrollTo(0, { duration: 1000, easing: [1, 0.01, 0.09, 0.99] });
    else scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }));
})();
