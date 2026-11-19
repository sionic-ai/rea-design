// Shared by all pages: two-layer curtain, page transition, menu drawer, letter-roll hover, scroll reveal, accordion, header row invert, # jump.
// Values are exactly as read from the original bundle (main.js).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = "ontouchstart" in window && navigator.maxTouchPoints > 0;
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("linkhover", ".115,.405,.24,1");
  const header = document.querySelector("[data-header]");
  const headerH = () => header?.clientHeight || 0;

  // ───── Two-layer curtain · on entry ─────
  // As in the original, the curtain lifts only when arriving from outside (or reloading the same URL), and when coming from our own pages only the body fades in over .6 seconds
  const origin = (u) => { try { const x = new URL(u); return x.protocol + "//" + x.host; } catch { return ""; } };
  const fromOutside = origin(document.referrer) !== location.protocol + "//" + location.host || document.referrer === location.href;
  const intro = document.querySelector("[data-intro]");
  const enter = () => {
    if (reduce) { root.classList.add("rp-ready", "rp-no-intro"); return; }
    if (fromOutside && intro) {
      gsap.set(intro, { opacity: 1 });
      gsap.set("#page", { opacity: 1 });
      const tl = gsap.timeline();
      tl.to("[data-intro-first]", { y: "-100%", duration: 1, delay: 0.5, ease: "power4.out" })
        .to("[data-intro-second]", { delay: 0.3, y: "-100%", duration: 0.8, ease: "expo.inOut", onComplete: () => { intro.style.display = "none"; } }, "-=1.2");
    } else {
      if (intro) intro.style.display = "none";
      gsap.to("#page", { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out" });
    }
  };
  if (document.readyState === "complete") enter(); else addEventListener("load", enter);
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set("#page", { opacity: 1 }); });

  // ───── Page transition: after .3s (1s for links inside the drawer) from the click, the whole body blurs over .6s and moves on ─────
  const skip = (a) => {
    if (a.target === "_blank" || a.hasAttribute("download")) return true;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return true;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return true;
    if (url.pathname === location.pathname && url.hash) return true;
    return /\.(xlsx?|docx?|pptx?|pdf|jpe?g|png|gif|svg)$/i.test(url.pathname);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || skip(a)) return;
    e.preventDefault();
    if (reduce) { location.href = a.href; return; }
    const closing = a.hasAttribute("data-drawer-close");
    if (closing) closeDrawer();
    gsap.to("#page", { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: closing ? 1 : 0.3, onComplete: () => { location.href = a.href; } });
  });

  // ───── Menu drawer — opened with micromodal as in the original. Items float up from 20px below after .3s at .04s intervals ─────
  const drawer = document.querySelector("[data-drawer]");
  const burgers = document.querySelectorAll("[data-burger]");
  let opened = false;
  let itemsTween = null;
  const expanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
  const items = () => drawer.querySelectorAll("[data-drawer-item]");
  function openDrawer() {
    if (!drawer || opened || !window.MicroModal) return;
    gsap.set(drawer.querySelector(".rp-drawer__scroll"), { opacity: 0 });
    gsap.set(drawer.querySelector(".rp-drawer__content"), { opacity: 0 });
    MicroModal.show(drawer.id, {
      disableScroll: true, disableFocus: true, awaitOpenAnimation: true, awaitCloseAnimation: true,
      onShow: () => {
        gsap.set([drawer.querySelector(".rp-drawer__scroll"), drawer.querySelector(".rp-drawer__content")], { clearProps: "opacity" });
        setTimeout(() => expanded(true), 200);
        opened = true;
        itemsTween = gsap.fromTo(items(), { opacity: 0, y: "20px" }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
        drawer.querySelector(".rp-drawer__scroll").scrollTop = 0;
      },
      onClose: () => { opened = false; expanded(false); },
    });
  }
  function closeDrawer() {
    if (!drawer || !opened) return;
    itemsTween?.pause();
    gsap.fromTo(items(), { opacity: 1, y: "0px" }, { opacity: 0, y: "-20px", duration: 0.3, ease: "power1.out", stagger: { each: 0.002 }, onComplete: () => MicroModal.close(drawer.id) });
  }
  burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // ───── Letter roll hover: the first copy slides out to −105% while fading (.6s), and the second copy rises from 105% below in .4s with linkhover ─────
  if (!touch && !reduce) {
    document.querySelectorAll("[data-roll]").forEach((el) => {
      const t = el.querySelector("[data-roll-target]");
      if (!t) return;
      const html = t.innerHTML;
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", t.textContent.trim());
      t.classList.add("rp-roll__t");
      t.innerHTML = `<span class="rp-roll__a" aria-hidden="true">${html}</span><span class="rp-roll__b" aria-hidden="true">${html}</span>`;
      const a = t.querySelector(".rp-roll__a"), b = t.querySelector(".rp-roll__b");
      const side = el.hasAttribute("data-roll-x");
      // Before showing the second set, the original fixes 150% into px using the height while both sets sit side by side in the flow —
      // Narrow links (categories·View all·footer links) fold their text onto two lines then, so they actually rest 300% of one line height below. Measured in the same order
      const settle = () => {
        b.classList.remove("is-float");
        gsap.set(b, side ? { x: 0 } : { y: 0 });
        const rest = (side ? b.offsetWidth : b.offsetHeight) * 1.5;
        b.classList.add("is-float");
        gsap.set(b, side ? { x: -rest } : { y: rest });
      };
      settle();
      // If the font loads late the width changes and the wrapping differs — measure once more after everything has loaded
      document.fonts?.ready.then(() => { if (!el.matches(":hover")) settle(); });
      el.addEventListener("mouseenter", () => {
        // Original: the first set of curves "expo.inout"(lowercase) written so GSAP can’t find it and it runs on the default curve power1.out — exactly as measured
        // Giving x·y as % strings overrides the px position GSAP fixed, jumping straight to 105% — same usage as the original
        if (side) {
          gsap.fromTo(a, { x: "0%", opacity: 1 }, { x: "-105%", opacity: 0, duration: 0.4, ease: "power1.out" });
          gsap.fromTo(b, { x: "105%" }, { x: "0%", duration: 0.4, ease: "linkhover" });
        } else {
          gsap.fromTo(a, { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "power1.out" });
          gsap.fromTo(b, { y: "105%" }, { y: "0%", duration: 0.4, ease: "linkhover" });
        }
      });
    });
  }

  // ───── Scroll reveal: once, 20% before the bottom of the screen ─────
  // text goes character by character from 100% below, .5s power1.inOut (.03s stagger), and the rest (top·mask) runs via a css transition with is-visible
  document.querySelectorAll('[data-st="text"]').forEach((el) => {
    const txt = el.textContent;
    el.setAttribute("aria-label", txt.trim());
    el.innerHTML = [...txt.trim()].map((c) => `<span class="rp-ch" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
  const show = (el) => {
    if (el.classList.contains("is-visible")) return;
    const d = parseFloat(el.dataset.delay || 0);
    if (el.dataset.st === "text") {
      if (reduce) { gsap.set(el.querySelectorAll(".rp-ch"), { y: 0 }); el.classList.add("is-visible"); return; }
      gsap.fromTo(el.querySelectorAll(".rp-ch"), { y: el.dataset.y || "100%", opacity: el.dataset.opacity ?? 1 }, {
        y: 0, opacity: 1, ease: "power1.inOut", duration: parseFloat(el.dataset.duration || 0.5), delay: d,
        stagger: { each: parseFloat(el.dataset.each || 0.03) }, onComplete: () => el.classList.add("is-visible"),
      });
    } else setTimeout(() => el.classList.add("is-visible"), d * 1000);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && show(en.target)), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-st]").forEach((el) => io.observe(el));

  // ───── Accordion: height 0 → auto in .3s expo.out, and on close it folds to 0 and then removes open ─────
  document.querySelectorAll("[data-acc]").forEach((wrap) => {
    const toggle = wrap.dataset.acc === "toggle";
    const dur = parseFloat(wrap.dataset.duration || 0.3);
    const rows = [...wrap.querySelectorAll("[data-acc-item]")];
    const anim = (body, details, open) => {
      if (open) {
        body.style.height = 0;
        details.setAttribute("open", "");
        // The original is already two frames in on the first open frame (measured curve first value .52) — advance two frames to get the same phase
        gsap.to(body, { height: "auto", duration: dur, ease: "expo.out" }).seek(1 / 30);
      } else {
        gsap.to(body, { height: 0, duration: dur, ease: "expo.out", onComplete: () => { details.removeAttribute("open"); ScrollTrigger.refresh(); } });
      }
    };
    rows.forEach((details, i) => {
      const sum = details.querySelector("[data-acc-sum]"), body = details.querySelector("[data-acc-body]");
      if (!sum || !body) return;
      if (details.hasAttribute("open")) sum.classList.add("is-active");
      sum.addEventListener("click", (e) => {
        e.preventDefault();
        if (details.hasAttribute("open")) { sum.classList.remove("is-active"); anim(body, details, false); return; }
        if (toggle) rows.forEach((d) => { if (d !== details && d.hasAttribute("open")) { d.querySelector("[data-acc-sum]").classList.remove("is-active"); anim(d.querySelector("[data-acc-body]"), d, false); } });
        sum.classList.add("is-active");
        anim(body, details, true);
      });
      sum.addEventListener("keydown", (e) => {
        const k = e.key;
        if ((k === "ArrowUp" || k === "ArrowLeft") && i > 0) { e.preventDefault(); rows[i - 1].querySelector("[data-acc-sum]").focus(); }
        if ((k === "ArrowDown" || k === "ArrowRight") && i < rows.length - 1) { e.preventDefault(); rows[i + 1].querySelector("[data-acc-sum]").focus(); }
      });
    });
  });

  // ───── Header line: when [data-not-top] is ahead by the header height, it switches to difference blending ─────
  const notTop = document.querySelector("[data-not-top]");
  if (header && notTop) {
    const on = () => header.classList.add("is-not-top"), off = () => header.classList.remove("is-not-top");
    ScrollTrigger.create({ trigger: notTop, start: () => "-" + headerH() + "px top", endTrigger: document.body, onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off });
  }

  // ───── Same-page # move: smooth-scroll 1s easeInOutCubic, scrolling less by the header height ─────
  if (window.SmoothScroll) {
    const ss = new SmoothScroll();
    const opts = { header: "[data-header]", speed: reduce ? 0 : 1000, speedAsDuration: true, offset: 0, easing: "easeInOutCubic", updateURL: false };
    document.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const t = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!t) return;
      e.preventDefault();
      ss.animateScroll(t, a, opts);
    }));
  }
  addEventListener("load", () => setTimeout(() => {
    if (!location.hash) return;
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) scrollTo(0, t.getBoundingClientRect().top + scrollY - headerH());
  }, 200));
})();
