/* All pages use the same header row (shrinks on scroll and blends in with exclusion), phone menu, footer, cursor ring and page transition.
   Same libraries as the original — Barba.js v1 (Pjax, swaps only .ni-container inside #ni-wrapper) for page transitions, slick (jQuery) for the news slider */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => !matchMedia("(max-width: 1024px)").matches;
  const head = document.querySelector(".ni-head");
  const menuBtn = document.querySelector(".ni-head__menu");

  /* Title letter splitting — cell-char-rise lifts each letter from below the cell. Spaces are left alone */
  const split = (root) => root.querySelectorAll("[data-ni-split]").forEach((el) => {
    if (el.querySelector('[data-fx-part="char"]')) return;
    const text = el.textContent;
    el.textContent = "";
    for (const ch of text) {
      if (!ch.trim()) { el.append(ch); continue; }
      const s = document.createElement("span");
      s.dataset.fxPart = "char";
      s.textContent = ch;
      el.append(s);
    }
  });
  split(document);

  /* Header bar: scrolling more than 10px from the top switches to the compact form (original data-state=small — top margin 46→20px .4s, logo .8×, menu up 10px, SNS row lifts out upward) */
  const onScroll = () => head && head.classList.toggle("is-small", isPc() && scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Phone menu: the board stands in .1s and items settle down from -15px in 1s power2.out at .06s intervals. On close, .3s power3.out */
  const nav = document.querySelector(".ni-head__nav");
  let open = false;
  const setMenu = (on) => {
    open = on;
    head.classList.toggle("is-open", on);
    menuBtn?.setAttribute("aria-expanded", on ? "true" : "false");
    if (!nav || isPc()) return;
    const items = nav.querySelectorAll(".ni-nav__item, .ni-head__info > *");
    if (on) {
      gsap.to(nav, { autoAlpha: 1, display: "block", duration: reduce ? 0 : 0.1, ease: "circ.out" });
      gsap.fromTo(items, { autoAlpha: 0, y: -15 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 1, ease: "power2.out", stagger: 0.06 });
    } else {
      gsap.to(nav, { autoAlpha: 0, display: "none", duration: reduce ? 0 : 0.3, ease: "power3.out" });
    }
  };
  menuBtn?.addEventListener("click", () => setMenu(!open));
  matchMedia("(max-width: 1024px)").addEventListener("change", () => { if (nav) gsap.set(nav, { clearProps: "all" }); setMenu(false); });

  /* Inner anchors roll with .7s power4.inOut (the original a.js-pagescroll) */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const y = to.getBoundingClientRect().top + scrollY;
    if (reduce) scrollTo(0, y);
    else gsap.to({ v: scrollY }, { v: y, duration: 0.7, ease: "power4.inOut", onUpdate() { scrollTo(0, this.targets()[0].v); } });
  });


  /* News slider — same slick as the original (.5s, 3 slides at a time on wide screens, 1 at a time with variableWidth on narrow ones). On each slide, the number on the right rolls up one digit at a time, .05s apart */
  const initPage = (root) => {
    if (!root) return;
    const catchEl = root.querySelector(".ni-mv__catch");
    /* Original attaches is-active on window load (after photos and fonts are all received) */
    const reveal = () => requestAnimationFrame(() => requestAnimationFrame(() => catchEl.classList.add("is-active")));
    if (catchEl) document.readyState === "complete" ? reveal() : addEventListener("load", reveal, { once: true });
    if (!window.jQuery || !jQuery.fn.slick) return;
    const $s = jQuery(root).find(".ni-wn__slider");
    if (!$s.length || $s.hasClass("slick-initialized")) return;
    const nums = [...root.querySelectorAll(".ni-wn__num li")];
    const all = root.querySelector(".ni-wn__all");
    if (all) all.textContent = isPc() ? "03" : "09";
    nums.forEach((li, k) => gsap.set(li.querySelectorAll("span"), { yPercent: k ? 100 : 0, autoAlpha: k ? 0 : 1 }));
    $s.on("beforeChange", (e, sl, cur, nxt) => {
      const a = isPc() ? Math.floor(cur / 3) : cur, b = isPc() ? Math.floor(nxt / 3) : nxt;
      if (a === b || !nums[b]) return;
      gsap.fromTo(nums[b].querySelectorAll("span"), { yPercent: 100, autoAlpha: 1 }, { yPercent: 0, duration: reduce ? 0 : 0.4, ease: "sine.out", stagger: 0.05 });
      gsap.to(nums[a].querySelectorAll("span"), { yPercent: -100, autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: "sine.out", stagger: 0.05 });
    });
    $s.slick({
      speed: reduce ? 0 : 500, touchThreshold: 15, slidesToShow: 3, slidesToScroll: 3, pauseOnFocus: false, pauseOnHover: false, infinite: false,
      prevArrow: root.querySelector(".ni-wn__prev"), nextArrow: root.querySelector(".ni-wn__next"),
      responsive: [{ breakpoint: 1025, settings: { slidesToShow: 1, slidesToScroll: 1, variableWidth: true } }],
    });
  };

  /* Page transition — old body fades out in .3s sine.out (after the .3s menu close if the menu is open) and new body stands in .2s, the cursor ring goes off in .1s */
  if (window.Barba && location.protocol !== "file:") {
    Barba.Pjax.Dom.wrapperId = "ni-wrapper";
    Barba.Pjax.Dom.containerClass = "ni-container";
    Barba.Pjax.ignoreClassLink = "js-nopjax";
    Barba.Pjax.originalPreventCheck = Barba.Pjax.preventCheck;
    Barba.Pjax.preventCheck = (evt, el) => {
      if (!el || !el.getAttribute("href")) return false;
      const url = new URL(el.href, location.href);
      if (url.hash && url.pathname === location.pathname) return false;
      return Barba.Pjax.originalPreventCheck(evt, el);
    };
    const Swap = Barba.BaseTransition.extend({
      start() { this.newContainerLoading.then(this.change.bind(this)); },
      change() {
        let wait = 0;
        if (open) { setMenu(false); wait = 0.3; }
        const ring = document.querySelector(".fx-rls");
        if (ring) gsap.to(ring, { autoAlpha: 0, scale: 0.2, duration: 0.1 });
        const oldC = this.oldContainer, newC = this.newContainer;
        gsap.set(newC, { autoAlpha: 0 });
        gsap.to(oldC, { autoAlpha: 0, duration: reduce ? 0 : 0.3, ease: "sine.out", delay: wait, onComplete: () => {
          scrollTo(0, 0);
          this.done();
          gsap.to(newC, { autoAlpha: 1, duration: reduce ? 0 : 0.2, ease: "sine.out" });
        } });
      },
    });
    Barba.Pjax.getTransition = () => Swap;
    Barba.Dispatcher.on("newPageReady", (cur, prev, container) => {
      split(container);
      document.body.dataset.page = container.dataset.namespace || "";
      initPage(container);
    });
    Barba.Prefetch.init();
    Barba.Pjax.start();
  }
  initPage(document.querySelector(".ni-container"));
})();
