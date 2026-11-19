// Common to all pages: draws the header, hamburger, drawer, fixed bottom button, loading and footer, and sets the order loading → logo letters rising → page motion.
// Original values: minimum loading .8s · progress line .4s power2.out → folds to the right .5s power2.in · band ±150% expo.inOut 1.4s (phone 1.8s)
// Logo letters y25→0 1.5s expo.out stagger .07 delay .5 · top-left index 1.2s power2.out delay 1.4 · is-scrolled once scroll passes 100px
// Reveal (data-reveal): start top bottom-=12% · letters 1.2s power2.out stagger .04 · lines .7s expo.out line stagger .09 · clip inset(100%)+y24 .7s expo.out
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const isSP = () => innerWidth <= 768;
  const page = document.body.dataset.page || "home";
  const home = page === "home";
  const OR = (window.OR = { reduced, isSP, home, lenis: null, onLoad: [], scrollTo: null });

  const MENU = [
    ["about", "MENU 01", "aboutPin"],
    ["concept", "MENU 02", "top"],
    ["details", "MENU 03", ""],
    ["gallery", "MENU 04", ""],
    ["insights", "MENU 05 LONG", "topPc"],
    ["priority", "MENU 06 LONG", "top"],
  ];
  const href = (id) => (home ? `#${id}` : `index.html#${id}`);
  const links = (cls) =>
    MENU.map(([id, label, pos]) => `<li><a class="or-ul ${cls}" href="${href(id)}" data-scroll-to="#${id}" data-scroll-position="${pos}">${label}</a></li>`).join("");
  const arrow = '<svg viewBox="0 0 35 12" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M.5 10.88h34M24.12.5 34.5 10.88"/></svg>';
  const mark = (cls = "") =>
    `<span class="or-mark ${cls}"><span class="or-mark__t">${[..."SITE NAME"].map((c) => (c === " " ? '<span class="is-gap"></span>' : `<span>${c}</span>`)).join("")}</span></span>`;
  const cta = "Your apply button text here";
  OR.icons = { arrow };

  const slot = (name) => document.querySelector(`[data-slot="${name}"]`);

  const head = slot("header");
  if (head) {
    head.classList.add("or-head");
    head.innerHTML = `
      <h1 class="or-head__logo" data-logo><a href="index.html" aria-label="Home">${mark()}</a></h1>
      <div class="or-head__sub">
        <nav><ul>${links("")}</ul></nav>
        <div class="or-head__entry"><a class="or-btn" href="form.html"><span>${cta}</span></a></div>
      </div>
      <nav class="or-head__nav" aria-label="Main menu"><ul>${links("")}</ul></nav>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="or-burger"><button type="button" aria-label="Open Menu"><i></i><i></i><i></i></button></div>
      <div class="or-drawer" data-slot="menu-drawer">
        <div class="or-streak" aria-hidden="true"></div>
        <div class="or-drawer__head"><a class="or-btn" href="form.html"><span>${cta}</span></a></div>
        <div class="or-drawer__main">
          <ul class="or-drawer__list">${links("")}</ul>
          <ul class="or-drawer__sub"><li><a href="#"><span>LEGAL LINK</span>${arrow}</a></li></ul>
        </div>
        <div class="or-drawer__foot">${mark()}</div>
      </div>
      ${home ? `<div class="or-fixed" data-slot="fixed-cta"><a class="or-btn" href="form.html"><span>${cta}</span></a></div>` : ""}
      <div class="or-loading" data-slot="loader" aria-hidden="true">
        <div class="or-loading__bg"></div><div class="or-loading__bg"></div>
        <div class="or-loading__inner"><div class="or-loading__mark"><div class="or-loading__bar"></div></div></div>
      </div>`
    );
  }

  // Now that the loading strip is in, lift the backdrop curtain hiding the first image — in the original the loading screen is in the HTML, so it is ink-colored from the first frame
  document.documentElement.classList.add("or-booted");

  const foot = slot("footer");
  if (foot) {
    foot.classList.add("or-foot");
    const clip = 'data-reveal="clip" data-reveal-start="page-end"';
    foot.innerHTML = `
      <div class="or-streak" aria-hidden="true"></div>
      <div class="or-foot__inner">
        <nav class="or-foot__nav"><ul>${MENU.map(([id, label, pos]) => `<li><a class="or-ul or-foot__navlink" href="${href(id)}" data-scroll-to="#${id}" data-scroll-position="${pos}" ${clip}>${label}</a></li>`).join("")}</ul></nav>
        <div class="or-foot__main">
          <p class="or-foot__msg" data-reveal data-reveal-start="page-end">Your short message line here,<br>Your second line goes here.</p>
          <div class="or-foot__logo" data-reveal="logo" data-reveal-delay="0.05" data-reveal-start="page-end">${mark()}</div>
          <ul class="or-foot__sub" data-reveal="clip" data-reveal-delay="0.1"><li><a class="or-ul or-foot__sublink" href="#"><span>LEGAL LINK</span>${arrow}</a></li></ul>
        </div>
        <div class="or-foot__bottom">
          <div class="or-foot__group" ${clip}><a class="or-foot__grouplink" href="#"><span class="wf-logo">Group logo 1</span></a><a class="or-foot__grouplink" href="#"><span class="wf-logo">Group logo 2</span></a></div>
          <div class="or-foot__copy" data-reveal="clip" data-reveal-delay="0.05" data-reveal-start="page-end"><small>COPYRIGHT © 0000 COMPANY NAME. ALL RIGHTS RESERVED.</small></div>
        </div>
      </div>`;
  }

  const body = document.body;
  const burger = document.querySelector(".or-burger");
  const closeMenu = () => { body.classList.remove("is-menu-open"); burger?.classList.remove("is-active"); };
  burger?.querySelector("button").addEventListener("click", () => {
    const open = !body.classList.contains("is-menu-open");
    body.classList.toggle("is-menu-open", open);
    burger.classList.toggle("is-active", open);
  });

  const logoChars = (root) => [...root.querySelectorAll(".or-mark__t > span:not(.is-gap)")];
  const headLogo = document.querySelector("[data-logo]");
  const headSub = document.querySelector(".or-head__sub");
  let subTween = null;

  if (!reduced) {
    if (home && headLogo) gsap.set(logoChars(headLogo), { opacity: 0, yPercent: 115 });
    if (home && headSub && scrollY <= 100) gsap.set(headSub, { opacity: 0, y: 8 });
  }

  const revealHead = () => {
    if (reduced || !home || !headLogo) return;
    const chars = logoChars(headLogo);
    gsap.to(chars, { opacity: 1, yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.07, delay: 0.5, onComplete: () => gsap.set(chars, { clearProps: "transform,opacity" }) });
    if (headSub && scrollY <= 100) {
      subTween = gsap.to(headSub, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out", delay: 1.4, onComplete: () => { subTween = null; gsap.set(headSub, { clearProps: "opacity,transform" }); } });
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const past = scrollY > 100;
      body.classList.toggle("is-scrolled", past);
      if (past && subTween) { subTween.kill(); subTween = null; gsap.set(headSub, { clearProps: "opacity,transform" }); }
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Entrance ──
  const START = "top bottom-=12%";
  const startFor = (el) => (el.dataset.revealStart === "in-view" ? "bottom bottom" : START);
  const isPageEnd = (el) => el.dataset.revealStart === "page-end";
  const watchPageEnd = (el, play) => {
    let q = false;
    const check = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (el.getBoundingClientRect().top <= innerHeight || scrollY >= max - 120) {
        removeEventListener("scroll", tick);
        removeEventListener("resize", tick);
        play();
      }
    };
    const tick = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; check(); }); };
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    check();
  };
  const arm = (el, tween, start) => {
    if (isPageEnd(el)) watchPageEnd(el, () => tween.play());
    else ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tween.play() });
  };

  const split = (el) => {
    const words = [], chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = document.createElement("span");
            w.className = "word";
            w.style.cssText = "display:inline-block;white-space:nowrap";
            [...part].forEach((c) => {
              const s = document.createElement("span");
              s.className = "char";
              s.style.display = "inline-block";
              s.textContent = c;
              w.append(s);
              chars.push(s);
            });
            words.push(w);
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.nodeName !== "BR" && getComputedStyle(n).display !== "none") walk(n);
      });
    };
    walk(el);
    return { words, chars };
  };
  // Text must be wrapped per on-screen line in an overflow:hidden strip so letters rising from below don’t show outside the line
  const clipLines = (el, units) => {
    if (!units.length) { el.style.overflow = "hidden"; return []; }
    const rows = [];
    let top = null;
    units.forEach((u) => {
      const t = Math.round(u.getBoundingClientRect().top);
      if (top === null || Math.abs(t - top) > 3) { rows.push([]); top = t; }
      rows[rows.length - 1].push(u);
    });
    rows.forEach((row) => {
      const parent = row[0].parentNode;
      if (!parent) return;
      const band = document.createElement("span");
      band.style.cssText = "display:block;overflow:hidden";
      parent.insertBefore(band, row[0]);
      const last = row[row.length - 1];
      let n = band.nextSibling;
      while (n) {
        const next = n.nextSibling;
        if (n.nodeName === "BR") n.remove();
        else { band.appendChild(n); if (n === last) break; }
        n = next;
      }
    });
    el.querySelectorAll("br").forEach((b) => b.remove());
    return rows;
  };
  const restore = (el, html, refresh) => {
    el.innerHTML = html;
    el.style.overflow = "";
    gsap.set(el, { clearProps: "opacity,visibility" });
    if (refresh) requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const titles = (el) => [...el.querySelectorAll(".or-title"), ...(el.matches(".or-title") ? [el] : [])];
  const lineIn = (el) => titles(el).forEach((t) => { gsap.set(t, { "--after-o": 0 }); gsap.to(t, { "--after-o": 1, duration: 0.2, ease: "power1.out", delay: 0.35 }); });

  const clipWhole = (el, delay, start) => {
    const ts = titles(el);
    const target = ts.length ? ts.flatMap((t) => [...t.querySelectorAll(":scope > span")]) : el;
    const tw = gsap.fromTo(target, { clipPath: "inset(100% 0% 0% 0%)", y: 24 }, {
      clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.7, ease: "expo.out", delay, paused: true,
      clearProps: "clipPath,transform", onStart: ts.length ? () => lineIn(el) : undefined,
    });
    arm(el, tw, start);
  };
  const chars = (el, delay, start) => {
    const html = el.innerHTML, refresh = el.hasAttribute("data-reveal-refresh");
    const { words, chars: cs } = split(el);
    if (!cs.length) { el.innerHTML = html; return clipWhole(el, delay, start); }
    gsap.set(el, { autoAlpha: 0 });
    gsap.set(cs, { yPercent: 110, autoAlpha: 0 });
    const tw = gsap.to(cs, {
      yPercent: 0, autoAlpha: 1, ease: "power2.out", delay, paused: true,
      duration: parseFloat(el.dataset.revealDuration) || 1.2,
      stagger: parseFloat(el.dataset.revealStagger) || 0.04,
      onStart: () => { clipLines(el, words.length > 1 ? words : cs); gsap.set(el, { clearProps: "opacity,visibility" }); },
      onComplete: () => restore(el, html, refresh),
    });
    arm(el, tw, start);
  };
  const block = (el, delay, start) => {
    if (isSP()) el.querySelectorAll("br.or-pc").forEach((b) => b.remove());
    if (isSP() && !el.hasAttribute("data-reveal-sp-lines")) return clipWhole(el, delay, start);
    const html = el.innerHTML, refresh = el.hasAttribute("data-reveal-refresh");
    const { words, chars: cs } = split(el);
    if (!cs.length) { el.innerHTML = html; return clipWhole(el, delay, start); }
    gsap.set(el, { autoAlpha: 0 });
    gsap.set(cs, { yPercent: 110 });
    const tw = gsap.to({}, {
      duration: 0.01, delay, paused: true,
      onStart: () => {
        lineIn(el);
        const rows = clipLines(el, words.length > 1 ? words : cs);
        gsap.set(el, { clearProps: "opacity,visibility" });
        rows.forEach((row, i) => {
          const rc = row.flatMap((u) => (u.classList.contains("char") ? [u] : [...u.querySelectorAll(".char")]));
          gsap.to(rc, { yPercent: 0, duration: 0.7, ease: "expo.out", delay: 0.09 * i, onComplete: i === rows.length - 1 ? () => restore(el, html, refresh) : undefined });
        });
      },
    });
    arm(el, tw, start);
  };
  const logo = (el, delay, start) => {
    const cs = logoChars(el);
    gsap.set(cs, { opacity: 0, yPercent: 115 });
    const tw = gsap.to(cs, { opacity: 1, yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.07, delay, paused: true });
    arm(el, tw, start);
  };
  OR.split = split;
  OR.clipLines = clipLines;

  const initReveal = () => {
    if (reduced) return;
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.hasAttribute("data-reveal-sp-only") && !isSP()) return;
      const kind = el.getAttribute("data-reveal") || "block";
      const delay = parseFloat(el.dataset.revealDelay) || 0;
      const start = startFor(el);
      titles(el).forEach((t) => gsap.set(t, { "--after-o": 0 }));
      if (kind === "chars") chars(el, delay, start);
      else if (kind === "logo") logo(el, delay, start);
      else if (kind === "clip") clipWhole(el, delay, start);
      else block(el, delay, start);
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  // ── Smooth scroll: first page only like the original, off on touch devices ──
  const initLenis = () => {
    if (!home || reduced || coarse || !window.Lenis) return;
    const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1 });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
    OR.lenis = lenis;
  };

  // ── Menu Movement ──
  const headerOffsetSP = () => (document.querySelector(".or-head")?.offsetHeight || 0);
  const offsetFor = (target, pos) => {
    if (pos === "top") return 0;
    if (pos === "topPc") return isSP() ? headerOffsetSP() : 0;
    if (pos === "aboutPin") {
      const b = isSP() ? null : target.querySelector("[data-pin-start]");
      return b ? -(b.getBoundingClientRect().top - target.getBoundingClientRect().top) : 0;
    }
    return isSP() ? headerOffsetSP() : 85;
  };
  const scrollToTarget = (target, pos, immediate = false) => {
    const off = offsetFor(target, pos);
    if (OR.lenis) OR.lenis.scrollTo(target, { offset: -off, immediate });
    else scrollTo({ top: target.getBoundingClientRect().top + scrollY - off, behavior: immediate ? "auto" : "smooth" });
  };
  OR.scrollTo = scrollToTarget;
  const bindNav = () => {
    document.querySelectorAll("[data-scroll-to]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.dataset.scrollTo);
        if (!target) { closeMenu(); return; }
        e.preventDefault();
        closeMenu();
        ScrollTrigger.refresh();
        scrollToTarget(target, a.dataset.scrollPosition);
      });
    });
    if (location.hash) {
      const target = document.querySelector(location.hash);
      const link = document.querySelector(`[data-scroll-to="${location.hash}"]`);
      if (target) requestAnimationFrame(() => { ScrollTrigger.refresh(); scrollToTarget(target, link?.dataset.scrollPosition, true); });
    }
  };

  // When the footer is at screen center, hide the header (PC) and the fixed button, once the last section starts to show, hide the fixed button
  const bindHides = () => {
    const fixed = document.querySelector(".or-fixed");
    const header = document.querySelector(".or-head");
    if (foot) {
      ScrollTrigger.create({
        trigger: foot, start: "top center",
        onEnter: () => { if (!isSP()) header?.classList.add("is-hidden"); fixed?.classList.add("is-hidden"); },
        onLeaveBack: () => { if (!isSP()) header?.classList.remove("is-hidden"); fixed?.classList.remove("is-hidden"); },
      });
    }
    const last = document.querySelector("[data-hide-fixed]");
    if (fixed && last) {
      ScrollTrigger.create({ trigger: last, start: "top bottom", onEnter: () => fixed.classList.add("is-hidden"), onLeaveBack: () => fixed.classList.remove("is-hidden") });
    }
  };

  const load = () => {
    initLenis();
    OR.onLoad.forEach((fn) => fn());
    initReveal();
    bindHides();
    bindNav();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    body.classList.add("is-load-end");
  };

  // ── Loading ──
  const runLoader = () => {
    const box = document.querySelector(".or-loading");
    if (!box || reduced) { box?.classList.add("is-hidden"); load(); return; }
    const bar = box.querySelector(".or-loading__bar");
    const markEl = box.querySelector(".or-loading__mark");
    const [bg1, bg2] = box.querySelectorAll(".or-loading__bg");
    const t0 = Date.now();
    const imgs = [...document.images].filter((i) => i.loading !== "lazy");
    let done = 0;
    const step = () => { done = Math.min(done + 1, imgs.length); gsap.to(bar, { scaleX: done / imgs.length, ease: "power2.out", duration: 0.4, overwrite: true }); };
    imgs.forEach((i) => (i.complete ? step() : (i.addEventListener("load", step, { once: true }), i.addEventListener("error", step, { once: true }))));
    const finish = () => {
      const wait = Math.max(0, 800 - (Date.now() - t0)) / 1000;
      const bands = isSP() ? 1.8 : 1.4;
      gsap.to(bar, {
        scaleX: 1, ease: "power2.out", duration: 0.4, delay: wait, overwrite: true,
        onComplete: () => {
          gsap.set(bar, { transformOrigin: "right center" });
          gsap.to(bar, {
            scaleX: 0, ease: "power2.in", duration: 0.5,
            onComplete: () => {
              markEl.classList.add("is-hidden");
              load();
              gsap.timeline({ onComplete: () => box.classList.add("is-hidden") })
                .call(revealHead, null, 0.3)
                .to(bg1, { y: "-150%", ease: "expo.inOut", duration: bands }, 0.3)
                .to(bg2, { y: "150%", ease: "expo.inOut", duration: bands }, 0.3);
            },
          });
        },
      });
    };
    if (document.readyState === "complete") finish();
    else addEventListener("load", finish, { once: true });
  };

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", runLoader, { once: true });
  else runLoader();
})();
