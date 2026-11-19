// Motion shared across pages: smooth scroll, blink effect, menu/privacy modals, link text wave, footer form.
// Original numbers: Lenis duration .5 (1-(1-t)^5), anchor move 1s power3.out (GSAP scrollTo even on top of Lenis), modal bands .6s power3.out/power2.out at random .05 intervals, blink .04s×5.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchOnly = matchMedia("(hover: none)").matches;
  const isSp = () => innerWidth <= 750;
  const rem = (n) => n * parseFloat(getComputedStyle(document.documentElement).fontSize);

  ScrollTrigger.config({ ignoreMobileResize: true });
  // Runs Lenis (1.3.11) on its own rAF like the original — ScrollTrigger listens directly to the window scroll Lenis produces. Not enabled on phones or touch devices
  let lenis = null;
  if (!reduce && !isSp() && !touchOnly && window.Lenis) {
    lenis = new Lenis({ duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 5) });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // The original’s four registerEffect with the same names and defaults
  gsap.registerEffect({
    name: "fadeIn", extendTimeline: true, defaults: { duration: 0.5 },
    effect: (t, c) => gsap.to(t, { opacity: 1, duration: c.duration }),
  });
  gsap.registerEffect({
    name: "fadeInRandom", extendTimeline: true, defaults: { duration: 0.5, each: 0.04 },
    effect: (t, c) => gsap.to(t, { opacity: 1, duration: c.duration, stagger: { each: c.each, from: "random" } }),
  });
  gsap.registerEffect({
    name: "flicker", extendTimeline: true, defaults: { stagger: 0 },
    effect: (t, c) => gsap.to(t, {
      keyframes: [{ opacity: 1, duration: 0.04 }, { opacity: 0, duration: 0.04 }, { opacity: 1, duration: 0.04 }, { opacity: 0, duration: 0.04 }, { opacity: 1, duration: 0.04 }],
      stagger: c.stagger,
    }),
  });
  gsap.registerEffect({
    name: "fadeInLeft", extendTimeline: true, defaults: { duration: 1.2, stagger: 0.06, x: 50, ease: "power2.out" },
    effect: (t, c) => gsap.fromTo(t, { opacity: 0, x: rem(c.x) }, { opacity: 1, x: 0, duration: c.duration, ease: c.ease, stagger: c.stagger }),
  });

  const scrollLock = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    document.body.style.overflow = on ? "hidden" : "";
  };

  const scrollToEl = (el) => {
    if (!el) return;
    gsap.to(window, { duration: reduce ? 0 : 1, ease: "power3.out", scrollTo: { y: el } });
  };

  // Modal: front band (blue) → back band .2s later, black curtain .75, content flicker at .8s. Closing is the whole panel in .3s power2.in
  let animating = false;
  const openModal = (name) => {
    const panel = $(`[data-modal="${name}"]`);
    if (!panel || animating || panel.hasAttribute("data-open")) return;
    animating = true;
    scrollLock(true);
    panel.setAttribute("data-open", "");
    panel.setAttribute("aria-hidden", "false");
    const front = $$('[data-modal-bg="front"] i', panel);
    const back = $$('[data-modal-bg="back"] i', panel);
    const flick = $$("[data-modal-flicker]", panel);
    const tl = gsap.timeline({ onComplete: () => (animating = false) });
    if (reduce) {
      gsap.set(panel, { opacity: 1 });
      gsap.set([...front, ...back], { scaleY: 1 });
      gsap.set($("[data-modal-overlay]", panel), { opacity: 0.75 });
      gsap.set(flick, { opacity: 1 });
      animating = false;
      return;
    }
    gsap.set(flick, { opacity: 0 });
    tl.set(panel, { opacity: 1 }, "start");
    tl.fromTo(front, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 0.6, ease: "power3.out", stagger: { each: 0.05, from: "random" } }, "start");
    tl.fromTo(back, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 0.6, ease: "power2.out", stagger: { each: 0.05, from: "random" } }, "start+=0.2");
    tl.fromTo($("[data-modal-overlay]", panel), { opacity: 0 }, { opacity: 0.75, duration: 0.6, ease: "power2.out" }, "start");
    flick.forEach((el) => tl.flicker(el, "start+=0.8"));
  };
  const closeModal = (name) => {
    const panel = $(`[data-modal="${name}"]`);
    if (!panel || animating || !panel.hasAttribute("data-open")) return;
    animating = true;
    scrollLock(false);
    gsap.timeline({ onComplete: () => (animating = false) })
      .to(panel, { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power2.in" })
      .add(() => {
        panel.removeAttribute("data-open");
        panel.setAttribute("aria-hidden", "true");
        gsap.set($$("[data-modal-bg] i", panel), { scaleY: 0 });
        gsap.set($$("[data-modal-flicker], [data-modal-overlay]", panel), { opacity: 0 });
      });
  };

  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-modal-open]");
    const close = e.target.closest("[data-modal-close]");
    const to = e.target.closest("[data-to]");
    if (open) {
      e.preventDefault();
      const name = open.dataset.modalOpen;
      openModal(name);
      // Original: opening the privacy panel appends #privacy to the address, closing removes it
      if (name === "privacy") history.replaceState(null, "", `${location.pathname}${location.search}#privacy`);
    }
    // Like the original toAnchorLink, scroll is started first and the panel is closed at the same moment — closing releases the lock so it slides from the next tick
    if (to) {
      e.preventDefault();
      scrollToEl($(to.dataset.to));
    }
    if (close) {
      if (close.tagName === "A" && !to) e.preventDefault();
      const name = close.dataset.modalClose;
      closeModal(name);
      if (name === "privacy" && location.hash) history.replaceState(null, "", location.pathname + location.search);
    }
  });
  // If entered with a panel name in the address (#privacy), that panel opens right away
  const fromUrl = location.hash.replace(/^#/, "");
  if (fromUrl && $(`[data-modal="${CSS.escape(fromUrl)}"]`)) openModal(fromUrl);
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    $$("[data-modal][data-open]").forEach((p) => closeModal(p.dataset.modal));
  });

  // Link hover: each letter goes to yellow and returns to blue (.5s power2.out group .15 → 1.2s power1.out group .3)
  const flash = getComputedStyle(document.documentElement).getPropertyValue("--site-flash").trim();
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
  if (!touchOnly) {
    $$("[data-is-hover]").forEach((el) => {
      const split = new SplitText(el, { type: "chars", charsClass: "hs-char" });
      let playing = false;
      el.addEventListener("mouseenter", () => {
        if (playing || reduce) return;
        playing = true;
        gsap.timeline({ onComplete: () => (playing = false) })
          .to(split.chars, { color: flash, duration: 0.5, stagger: { amount: 0.15 }, ease: "power2.out", overwrite: "auto" })
          .to(split.chars, { color: ink, duration: 1.2, stagger: { amount: 0.3 }, ease: "power1.out", overwrite: "auto" }, "-=0.3");
      });
    });
  }

  // When the footer reaches the bottom of the screen, the MENU button hides upward
  const header = $(".hs-header");
  if (header && $(".hs-footer")) {
    ScrollTrigger.create({
      trigger: ".hs-footer", start: "top bottom",
      onEnter: () => header.setAttribute("data-hide", ""),
      onLeaveBack: () => header.removeAttribute("data-hide"),
    });
  }

  // Contact form: the consent checkbox expands height to auto (.4s) · unchecking collapses it in .8s. Input check → confirm → edit or send. Send doesn’t really send, it only opens a thank-you screen
  const form = $(".hs-form");
  const agree = $("#footer-agree");
  if (form && agree) {
    const ease = "power1.out";
    agree.addEventListener("change", () => {
      gsap.killTweensOf(form);
      if (agree.checked) {
        gsap.set(form, { opacity: 0 });
        gsap.timeline().to(form, { height: "auto", duration: 0.4, ease }).to(form, { opacity: 1, duration: 0.4, ease }, "-=0.2");
      } else {
        gsap.timeline().to(form, { opacity: 0, duration: 0.4, ease }).to(form, { height: 0, duration: 0.8, ease });
      }
    });
    const lead = [$(".hs-footer__contact-text"), $(".hs-check")].filter(Boolean);
    const switchStatus = (next) => {
      gsap.killTweensOf([form, ...lead]);
      const h = form.offsetHeight;
      const tl = gsap.timeline();
      // After sending, also fold away the notice text and consent box (original thanks, error)
      if (next === "thanks" && lead.length) tl.to(lead, { opacity: 0, duration: 0.4, ease });
      tl.to(form, { opacity: 0, duration: 0.2, ease })
        .call(() => form.setAttribute("data-status", next))
        .fromTo(form, { height: h }, { height: "auto", duration: 0.4, ease })
        .to(form, { opacity: 1, duration: 0.4, ease }, "-=0.2");
    };
    form.addEventListener("click", (e) => {
      const b = e.target.closest("[data-form]");
      if (!b) return;
      if (b.dataset.form === "confirm") {
        // Original confirm(): empty required fields get empty, a wrong email format gets invalid, and if any exist it stops
        $$(".hs-form__item", form).forEach((item) => {
          const f = $("input, textarea", item);
          const v = f.value.trim();
          let err = f.required && !v ? "empty" : "";
          if (!err && f.type === "email" && !/^([a-zA-Z0-9])+([a-zA-Z0-9._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9._-]+)+$/.test(v)) err = "invalid";
          if (err) item.setAttribute("data-error", err);
          else item.removeAttribute("data-error");
        });
        if ($$(".hs-form__item[data-error]", form).length) return;
        const kind = $("select", form);
        const rows = ["I agree to the Privacy Policy", kind.value ? kind.selectedOptions[0].text : "", ...$$(".hs-form__item", form).map((it) => $("input, textarea", it).value)];
        $(".hs-form__confirm-list", form).replaceChildren(...rows.map((t, i) => {
          const li = document.createElement("li");
          li.textContent = t;
          if (i === rows.length - 1) li.className = "is-message";
          return li;
        }));
        switchStatus("confirm");
      }
      if (b.dataset.form === "back") switchStatus("input");
      if (b.dataset.form === "send") switchStatus("thanks");
    });
  }

  window.HS = { $, $$, reduce, isSp, rem, lenis };
})();
