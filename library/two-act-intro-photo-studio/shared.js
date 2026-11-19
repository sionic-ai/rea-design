// Motion spanning several pages: Lenis 1.0.10 (lerp .2), header line — scrolling down fast (over .5px/ms) pulls the menu up and raises the logo, scrolling up does the reverse,
// Menu drawer (MicroModal) — the panel comes from below in 1s, the lines from 20px below at .04s intervals over .6s / on close the lines exit upward in .3s, then the panel goes up in .6s,
// Same-page # links use Lenis for 1s, and the footer wordmark rises from 140% below, skewed by skewY 10, in 2s expo.out
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".ws-header");
  const drawer = document.querySelector("#ws-drawer");

  let lenis = null;
  // the umd build of lenis 1.0.10 exposes the class as the lowercase global lenis
  const LenisClass = window.Lenis || (typeof window.lenis === "function" ? window.lenis : null);
  if (!reduce && LenisClass) {
    lenis = new LenisClass({ lerp: 0.2, wheelMultiplier: 1 });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  const notTop = document.querySelector("[data-not-top]");
  const logo = header?.querySelector(".ws-header__logo a");
  const gnav = header?.querySelector(".ws-header__gnav ul");
  if (header && notTop && logo && gnav) {
    gsap.set(logo, { yPercent: 120, autoAlpha: 0 });
    let navShown = true;
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: notTop, endTrigger: "body", start: "top top", scrub: true,
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity()) / 1000;
          if (self.direction === 1 && v >= 0.5 && navShown) {
            gsap.to(gnav, { yPercent: -300, autoAlpha: 0, skewY: 1 });
            gsap.to(logo, { yPercent: 0, skewY: 0, autoAlpha: 1 });
            navShown = false;
          } else if (self.direction === -1 && !navShown) {
            gsap.to(gnav, { yPercent: 0, skewY: 0, autoAlpha: 1 });
            gsap.to(logo, { yPercent: 120, skewY: 8, autoAlpha: 0 });
            navShown = true;
          }
        },
      });
    });
  }

  if (drawer && window.MicroModal) {
    const burgers = [...document.querySelectorAll("[data-hamburger]")];
    const items = () => drawer.querySelectorAll("[data-drawer-item]");
    let opened = false, anim = null;
    const expanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
    const open = () => {
      if (opened) return;
      MicroModal.show("ws-drawer", {
        disableScroll: true, disableFocus: true, awaitOpenAnimation: false, awaitCloseAnimation: !reduce,
        onShow: () => {
          opened = true;
          lenis?.stop();
          setTimeout(() => expanded(true), reduce ? 0 : 200);
          anim = gsap.fromTo(items(), { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: reduce ? 0 : 0.3, duration: reduce ? 0 : 0.6, ease: "power1.out", stagger: { each: 0.04 } });
          drawer.querySelector(".ws-drawer__box").scrollTop = 0;
        },
        onClose: () => { opened = false; expanded(false); lenis?.start(); },
      });
    };
    const close = () => {
      if (!opened) return;
      anim?.pause();
      gsap.fromTo(items(), { opacity: 1, y: 0 }, { opacity: 0, y: -20, ease: "power1.out", duration: reduce ? 0 : 0.3, stagger: { each: 0.002 }, onComplete: () => MicroModal.close("ws-drawer") });
    };
    burgers.forEach((b) => b.addEventListener("click", () => (opened ? close() : open())));
    drawer.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && opened) close(); });
  }

  // Same-page # link — the original uses Lenis if present with no offset (0) over 1s, and only when it is absent offsets by the header height
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    a.addEventListener("click", (e) => {
      const to = document.getElementById(id);
      if (!to) return;
      e.preventDefault();
      if (lenis) return lenis.scrollTo(to, { duration: 1, offset: 0 });
      const off = -(header?.querySelector(".ws-header__in")?.offsetHeight || 0);
      scrollTo({ top: to.getBoundingClientRect().top + scrollY + off, behavior: reduce ? "auto" : "smooth" });
    });
  });

  const mark = document.querySelector(".ws-footer__mark");
  if (mark) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(mark, { yPercent: 140, skewY: 10 }, { yPercent: 0, skewY: 0, duration: 2, ease: "expo.out", scrollTrigger: { trigger: ".ws-footer__logo", start: "top bottom" } });
    });
  }

  // Copy URL button — the original (vanilla-toast) turns on in .4s in a straight line at .04 every 16ms after the copy finishes (then), and turns off over the same length after 2s
  document.querySelectorAll("[data-copy-url]").forEach((b) => b.addEventListener("click", () => {
    Promise.resolve(navigator.clipboard?.writeText(location.href)).catch(() => {}).then(() => toast());
  }));
  const toast = () => {
    const t = document.createElement("p");
    t.className = "ws-toast";
    t.textContent = "Address copied.";
    document.body.append(t);
    const fade = reduce ? 0 : 0.4;
    gsap.timeline({ onComplete: () => t.remove() })
      .fromTo(t, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade, ease: "none" })
      .to(t, { autoAlpha: 0, duration: fade, ease: "none" }, `+=2`);
  };

  // If the font loads late the height changes — measure once more after it has fully loaded
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
