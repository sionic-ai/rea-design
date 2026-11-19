// Interactions shared by several pages — header mega panel (original jQuery slideToggle 300ms swing, other panels fadeOut 200ms), phone menu (slideToggle 300ms),
// QR plate (shown open 1ms later → floats up in .3s). The floating opening band is appear-past-scroll, and folding is handled by the height-fold part.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = window.matchMedia("(min-width: 820px)");
  const SPEED = reduce ? 0 : 0.3;
  // jQuery swing = 0.5 − cos(πp)/2 — same formula as GSAP sine.inOut
  // A closed panel is display:none — like jQuery slideToggle, make it visible when opening and go from 0 to full height, and when closing shrink to 0 and then hide again
  const slide = (el, open, done) => {
    if (!el) return;
    gsap.killTweensOf(el);
    if (open) {
      const from = el.style.display === "block" ? el.offsetHeight : 0;
      gsap.set(el, { display: "block", opacity: 1 });
      gsap.fromTo(el, { height: from }, { height: "auto", duration: SPEED, ease: "sine.inOut", onComplete: done });
    } else gsap.to(el, { height: 0, duration: SPEED, ease: "sine.inOut", onComplete: () => { gsap.set(el, { display: "none", clearProps: "height" }); done?.(); } });
  };
  const fadeOut = (el) => { if (!el || el.style.display !== "block") return; gsap.killTweensOf(el); gsap.to(el, { opacity: 0, duration: reduce ? 0 : 0.2, ease: "sine.inOut", onComplete: () => gsap.set(el, { display: "none", opacity: 1, clearProps: "height" }) }); };

  const initHead = () => {
    const head = document.querySelector(".js-head");
    if (!head) return;
    const items = [...head.querySelectorAll(".js-navi")];
    const closeAll = (except) => items.forEach((li) => {
      if (li === except || !li.classList.contains("is-open")) return;
      li.classList.remove("is-open");
      li.querySelector(".nb-nav__toggle")?.setAttribute("aria-expanded", "false");
      if (pc.matches) fadeOut(li.querySelector(".nb-mega")); else slide(li.querySelector(".nb-mega"), false);
    });
    items.forEach((li) => {
      const btn = li.querySelector(".nb-nav__toggle");
      const mega = li.querySelector(".nb-mega");
      btn?.addEventListener("click", (e) => {
        e.preventDefault();
        const open = !li.classList.contains("is-open");
        if (pc.matches) closeAll(li);
        li.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open);
        slide(mega, open);
      });
      li.querySelector(".js-navi-close")?.addEventListener("click", () => closeAll());
    });
    document.addEventListener("click", (e) => { if (pc.matches && !e.target.closest(".js-head")) closeAll(); });

    const menu = head.querySelector(".js-menu");
    const nav = head.querySelector(".nb-nav");
    menu?.addEventListener("click", () => {
      const open = !head.classList.contains("is-open");
      head.classList.toggle("is-open", open);
      menu.setAttribute("aria-expanded", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) gsap.fromTo(nav, { height: 0 }, { height: `calc(100svh - ${head.offsetHeight}px)`, duration: SPEED, ease: "sine.inOut", onComplete: () => { nav.style.overflowY = "auto"; } });
      else { nav.style.overflowY = ""; gsap.to(nav, { height: 0, duration: SPEED, ease: "sine.inOut" }); }
    });
    pc.addEventListener("change", () => {
      head.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      gsap.set(nav, { clearProps: "height,overflowY" });
      items.forEach((li) => { li.classList.remove("is-open"); gsap.set(li.querySelector(".nb-mega"), { display: "none", opacity: 1, clearProps: "height" }); });
    });
  };

  const initMd = () => {
    const md = document.querySelector(".js-md");
    if (!md) return;
    const box = md.querySelector(".nb-md__box");
    const close = () => { md.hidden = true; box.classList.remove("is-open"); };
    document.querySelectorAll(".js-md-open").forEach((a) => a.addEventListener("click", (e) => {
      // Original: phones (Android, iOS) go straight to the app store and only PC opens the QR panel
      if (!pc.matches) return;
      e.preventDefault();
      md.hidden = false;
      setTimeout(() => box.classList.add("is-open"), 1);
    }));
    md.querySelectorAll(".js-md-close").forEach((b) => b.addEventListener("click", close));
    md.addEventListener("click", (e) => { if (e.target === md) close(); });
  };

  const start = () => { initHead(); initMd(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
