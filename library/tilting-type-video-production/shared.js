// Common to all pages: draws in the header, menu, footer, loader, video window and transition curtain, and hooks up smooth scroll, underline-band links, cube buttons, letter raising, parallax and a following marker.
// Original values: letter rotateX 90→0 .8s expo.out (.03125 stagger) + opacity .4s · curve alpha = cubic-bezier(.25,.46,.45,.9) · lenis 1.3.1 lerp .1 (original default)
//           menu 1s expo.inOut (close 1.2s expo.out) · link band .6s power3.inOut (.2s later when leaving) · button .6s expo.out entering, .8s expo.inOut leaving
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, ...(window.SplitText ? [SplitText] : []));
  CustomEase.create("alpha", "M0,0 C0.25,0.46 0.45,0.9 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const isXL = () => innerWidth >= 1200;
  const rem = (n) => n * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const SD = (window.SD = { reduced, page, isXL, rem, lenis: null });

  // Instead of the original symbol (a woven fabric pattern), a newly drawn stepped diamond band — same width, 6.6rem
  const logo = `<svg viewBox="0 0 66 22" fill="currentColor" aria-hidden="true"><path d="M2 15 13 4l4 4-7 7h10l7-7 4 4-7 7H2z"/><path d="M33 11l5-5 5 5-5 5zM45 11l5-5 5 5-5 5zM57 11l4-4 4 4-4 4z"/><rect x="2" y="19" width="62" height="1.4"/></svg>`;
  SD.logo = logo;
  // Menu open/close uses an address-less span link like the original (the press is caught by the wrapping [data-menu-toggle])
  const L = (href, text, cls = "", delay = 0) => {
    const tag = href ? "a" : "span";
    return `<${tag} class="sd-link ${cls}"${href ? ` href="${href}"` : ""} data-hover data-animate data-delay="${delay}"><span class="sd-link__bg"></span><span class="sd-link__t">${text}</span></${tag}>`;
  };

  // ── Scroll
  // The original gives no lerp so the default .1 applies, and easing is used only for scrollTo
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ easing: (t) => 1 - Math.pow(1 - t, 5) });
    SD.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const stopScroll = () => SD.lenis && SD.lenis.stop();
  const startScroll = () => SD.lenis && SD.lenis.start();

  // ── Header·Menu
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sd-head");
    head.innerHTML = `
      <div class="sd-head__menu h-32" data-menu-toggle>${L(null, "Menu.", "", 0.2)}</div>
      <a class="sd-logo sd-head__logo" href="index.html" aria-label="Home">${logo}</a>
      <div class="sd-head__contact h-32">${L("about.html#contact", "Contact.", "", 0.4)}</div>`;
    head.insertAdjacentHTML(
      "beforebegin",
      `<div class="sd-mhead"><span class="h-32" data-menu-toggle style="pointer-events:auto">${L(null, "Menu.", "", 0.2)}</span><a class="sd-logo" href="index.html" style="pointer-events:auto" aria-label="Home">${logo}</a></div>`
    );
    head.insertAdjacentHTML(
      "afterend",
      `<div class="sd-menu" data-slot="menu">
        <div class="sd-menu__in">
          <div class="sd-menu__top h-32">
            <div data-menu-toggle data-menu-close>${L(null, "Close.")}</div>
            <a class="sd-logo" href="index.html" aria-label="Home">${logo}</a>
            <div class="sd-lang"><span>KO.</span><a href="#">EN.</a></div>
          </div>
          <div class="sd-menu__body">
            <div class="sd-menu__links" data-label="Your four English section names for the menu here">
              <div class="sd-menu__link">${L("works.html", "Works.")}</div>
              <div class="sd-menu__link">${L("service.html", "Services.")}</div>
              <div class="sd-menu__link">${L("about.html", "About.")}</div>
              <div class="sd-menu__link">${L("about.html#contact", "Contact.")}</div>
            </div>
            <div class="sd-menu__cols">
              <div class="sd-menu__col"><span class="b-10">Contact info</span><div class="sd-dimgroup" style="display:flex;flex-direction:column;align-items:flex-start"><a href="#">hello@youremail.com</a><a href="#">+00 00 000 0000</a></div></div>
              <div class="sd-menu__col"><span class="b-10">Getting here</span><a href="#" class="sd-dimone">Your street address 00 here,<br>City 00000, Country</a></div>
              <div class="sd-menu__col"><span class="b-10">Social</span><div class="sd-dimgroup" style="display:flex;flex-direction:column;align-items:flex-start"><a href="#">SNS 1</a><a href="#">SNS 2</a><a href="#">SNS 3</a></div></div>
            </div>
          </div>
        </div>
      </div>`
    );
  }

  // ── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sd-foot");
    foot.id = "contact";
    foot.innerHTML = `
      <div class="sd-foot__in">
        <div class="sd-foot__nav h-32">
          <div>${L("works.html", "Works.")}${L("service.html", "Services.")}</div>
          <a class="sd-logo sd-foot__logo" href="index.html" aria-label="Home">${logo}</a>
          <div class="is-end">${L("about.html", "About.")}${L("about.html#contact", "Contact.")}</div>
        </div>
        <div class="sd-foot__mid">
          <div class="sd-foot__l h-48 md-h-96" data-foot-title data-label="Your two English lines here on the guest’s share (about 7 characters per line)">A short<br>line.</div>
          <div class="sd-foot__mediaw">
            <div class="sd-foot__media" data-popup-open data-follow>
              <div class="wf-img wf-video" data-label="Night film set · warm light from bonfire and string lights · silhouettes of people · landscape 16:9"></div>
              <div class="sd-cursor" data-cursor><div class="sd-cursor__in b-10"><span class="sd-cursor__l">Play</span><div class="sd-cursor__sq"><i class="sd-cursor__k is-t"></i><i class="sd-cursor__k is-r"></i><i class="sd-cursor__ctr"></i><i class="sd-cursor__k is-b"></i><i class="sd-cursor__k is-l"></i></div><span class="sd-cursor__r">Video</span></div></div>
            </div>
          </div>
          <div class="sd-foot__r h-48 md-h-96" data-foot-title data-label="Your two English lines here on the company’s role (about 7 characters per line)">And one<br>more.</div>
          <div class="sd-foot__btn"><a class="sd-btn h-24" href="about.html#contact" data-animate>Contact us.</a></div>
        </div>
        <div class="sd-foot__bottom b-16">
          <div class="sd-foot__social"><a href="#">SNS 1</a><a href="#">SNS 2</a><a href="#">SNS 3</a></div>
          <div class="sd-foot__legal"><a href="#">Legal notice.</a><a class="sd-credit" href="#"><span class="is-under">Studio.</span><span class="is-over">Where it was made.</span></a></div>
        </div>
      </div>`;
  }

  // ── Transition curtain · video window · loader — the video window sits before the body as in the original (after the header, before the hero)
  document.body.insertAdjacentHTML("beforeend", `<div class="sd-overlay"></div><div class="sd-fade"></div>`);
  (document.querySelector("main") || document.body.lastElementChild).insertAdjacentHTML(
    "beforebegin",
    `<div class="sd-popup" data-slot="video-popup">
      <div class="sd-player">
        <div class="wf-img wf-video" data-label="Company intro video (showreel) · shoot scenes and finished shots stitched together · full 16:9 · 69 seconds"><video class="sd-vid" data-src="media/reel.mp4" playsinline preload="none"></video></div>
        <div class="sd-player__bar">
          <span class="sd-player__play sd-btn is-chip h-20" data-animate data-play>Pause.</span>
          <div class="sd-player__tl" data-tl><div class="sd-player__cur"></div></div>
          <span class="sd-player__sound sd-btn is-chip h-20" data-animate data-sound>Sound off.</span>
          <span class="sd-player__full sd-btn is-chip h-20" data-animate data-full>Fullscreen.</span>
        </div>
        <div class="sd-popup__close"><span class="sd-popup__x sd-btn is-chip h-20" data-animate data-popup-close>Close.</span></div>
      </div>
    </div>`
  );

  // ── Split text (word → letters). <br> Divided into lines
  const splitChars = (el) => {
    if (el.dataset.split) return el._chars;
    el.dataset.split = "1";
    el.classList.add("sd-split");
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines
      .map((ln) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = ln;
        const words = tmp.textContent.trim().split(/\s+/).filter(Boolean);
        const inner = words.map((w) => `<span class="sd-w">${[...w].map((c) => `<span class="sd-c">${c}</span>`).join("")}</span>`).join(" ");
        return lines.length > 1 ? `<span class="sd-line">${inner}</span>` : inner;
      })
      .join("");
    el._chars = [...el.querySelectorAll(".sd-c")];
    el._lines = [...el.querySelectorAll(".sd-line")];
    return el._chars;
  };
  SD.splitChars = splitChars;
  // Letter stand-up — original title.animate(): opacity .4s alpha + rotateX 90→0 .8s expo.out, both at .03125 stagger
  SD.riseIn = (targets, pos = 0, tl = gsap.timeline()) =>
    tl
      .to(targets, { autoAlpha: 1, duration: 0.4, ease: "alpha", stagger: 0.03125 }, pos)
      .to(targets, { rotateX: 0, duration: 0.8, ease: "expo.out", stagger: 0.03125 }, "<");
  SD.riseSet = (targets) => gsap.set(targets, { autoAlpha: 0, rotateX: 90, transformOrigin: "bottom" });
  // Line splitting — per line if SplitText exists, otherwise per paragraph
  SD.lines = (el) => (window.SplitText ? SplitText.create(el, { type: "lines", linesClass: "sd-pl" }).lines : [el]);
  SD.linesIn = (lines, pos = 0, tl = gsap.timeline()) => tl.to(lines, { autoAlpha: 1, duration: 0.8, ease: "alpha", stagger: { amount: 0.2 } }, pos);

  // ── Underline Band Link
  document.querySelectorAll(".sd-link").forEach((a) => {
    const bg = a.querySelector(".sd-link__bg");
    const t = a.querySelector(".sd-link__t");
    splitChars(t);
    let busy = false, inside = false, timer;
    const enter = () => {
      inside = true;
      clearTimeout(timer);
      if (busy) return;
      busy = true;
      gsap.killTweensOf(bg);
      gsap.timeline({ onComplete: () => { busy = false; if (!inside) leave(); } })
        .set(bg, { transformOrigin: "left" })
        .to(bg, { scaleX: 1, duration: 0.6, ease: "power3.inOut" });
    };
    const leave = () => {
      inside = false;
      if (busy) return;
      timer = setTimeout(() => {
        busy = true;
        gsap.killTweensOf(bg);
        gsap.timeline({ onComplete: () => { busy = false; if (inside) enter(); } })
          .set(bg, { transformOrigin: "right" })
          .to(bg, { scaleX: 0, duration: 0.6, ease: "power3.inOut" });
      }, 200);
    };
    if (matchMedia("(hover: hover)").matches) {
      a.addEventListener("mouseenter", enter);
      a.addEventListener("mouseleave", leave);
    }
  });

  // Link appearance — original link block (data-appear): once the loader ends, letters tilt up and stand (header ”Menu” .2 · ”Contact” .4 — the original puts the same value in both the timeline delay and the position, so it starts twice as late),
  // Until all are set up, you can neither press nor hover. The menu panel and footer links get set up at the same time (just hidden behind, so not visible)
  if (!reduced) {
    const links = [...document.querySelectorAll(".sd-link")];
    links.forEach((a) => { gsap.set(a, { pointerEvents: "none" }); SD.riseSet(a.querySelector(".sd-link__t")._chars); });
    addEventListener("sd:ready", () => links.forEach((a) => {
      const d = +a.dataset.delay || 0, chars = a.querySelector(".sd-link__t")._chars;
      SD.riseIn(chars, d, gsap.timeline({ delay: d }))
        .set(a, { pointerEvents: "auto" })
        .set(chars, { clearProps: "opacity,visibility,transform" });
    }), { once: true });
  }

  // ── Cube Button
  document.querySelectorAll(".sd-btn").forEach((b) => {
    const text = b.textContent.trim();
    b.innerHTML = `<span class="sd-btn__f is-top">${text}</span><span class="sd-btn__face">${text}</span><span class="sd-btn__f is-bot">${text}</span>`;
    const setH = () => b.style.setProperty("--h", `${b.offsetHeight}px`);
    setH();
    addEventListener("resize", setH);
    if (!("animate" in b.dataset) || reduced) return;
    const top = b.querySelector(".is-top"), bot = b.querySelector(".is-bot");
    let dir = 0;
    const faces = (d) => { gsap.set(bot, { autoAlpha: d < 0 ? 0 : 1 }); gsap.set(top, { autoAlpha: d < 0 ? 1 : 0 }); };
    b.addEventListener("mouseenter", (e) => {
      if (!matchMedia("(hover: hover)").matches) return;
      const r = b.getBoundingClientRect();
      dir = e.clientY < r.top + r.height / 2 ? -90 : 90;
      faces(dir);
      gsap.killTweensOf(b, "rotateX");
      gsap.to(b, { rotateX: dir, duration: 0.6, ease: "expo.out" });
    });
    b.addEventListener("mouseleave", () => {
      if (!matchMedia("(hover: hover)").matches) return;
      faces(dir);
      gsap.killTweensOf(b, "rotateX");
      gsap.to(b, { rotateX: 0, duration: 0.8, ease: "expo.inOut" });
    });
  });

  // ── Menu Open and Close
  const menu = document.querySelector(".sd-menu");
  if (menu) {
    const inner = menu.querySelector(".sd-menu__in");
    const fadeEls = () => {
      const close = menu.querySelector("[data-menu-close]");
      const lang = menu.querySelector(".sd-lang");
      const links = [...menu.querySelectorAll(".sd-menu__link")];
      const cols = [...menu.querySelectorAll(".sd-menu__col")];
      return isXL() ? [close, lang, ...links, ...cols] : [close, ...links, ...cols, lang];
    };
    gsap.set(fadeEls(), { autoAlpha: 0 });
    gsap.set(inner, { yPercent: 100 });
    gsap.set(menu, { yPercent: -100, autoAlpha: 1 });
    let open = false;
    const toggle = (e) => {
      e && e.preventDefault();
      open = !open;
      gsap.killTweensOf([inner, menu], "yPercent");
      gsap.killTweensOf(fadeEls(), "autoAlpha");
      if (open) {
        gsap.timeline()
          .to([inner, menu], { yPercent: 0, duration: reduced ? 0 : 1, ease: "expo.inOut" })
          .to(fadeEls(), { autoAlpha: 1, duration: reduced ? 0 : 1.2, ease: "power2.out", stagger: 0.0625 }, reduced ? 0 : 0.5);
        stopScroll();
      } else {
        gsap.timeline()
          .to(inner, { yPercent: 100, duration: reduced ? 0 : 1.2, ease: "expo.out" })
          .to(menu, { yPercent: -100, duration: reduced ? 0 : 1.2, ease: "expo.out" }, "<")
          .to(fadeEls(), { autoAlpha: 0, duration: 0.4, ease: "alpha" }, "<");
        startScroll();
      }
    };
    document.querySelectorAll("[data-menu-toggle]").forEach((t) => t.addEventListener("click", toggle));
    addEventListener("keydown", (e) => e.code === "Escape" && open && toggle());
    menu.querySelectorAll(".sd-menu__links a").forEach((a) => a.addEventListener("click", () => open && toggle()));
  }

  // ── Video — original video block: data-src is loaded late and shows through with .4s alpha once loaded, and ”view” plays only while its wrapping panel is on screen.
  //    The placeholder video is 16:9 like the original · same length (measured with ffprobe)
  const vidLoad = (v) =>
    v._load ||
    (v._load = new Promise((res) => {
      gsap.set(v, { autoAlpha: 0 });
      v.addEventListener("loadeddata", () => gsap.to(v, { autoAlpha: 1, duration: 0.4, ease: "alpha", onComplete: res }), { once: true });
      v.src = v.dataset.src;
      v.load();
    }));
  SD.vidPlay = (v, restart) => vidLoad(v).then(() => { if (restart) v.currentTime = 0; return v.play().catch(() => {}); });
  SD.vidPause = (v) => v._load && v.pause();
  if (!reduced) document.querySelectorAll('video[data-vid="view"]').forEach((v) => ScrollTrigger.create({ trigger: v.parentNode, onToggle: (s) => (s.isActive ? SD.vidPlay(v) : SD.vidPause(v)) }));

  // ── Player — original player: pressing the cover loads and plays, buttons are play, sound and fullscreen, the progress bar shows playback time and pressing it seeks to that spot
  SD.player = (root) => {
    const v = root.querySelector("video");
    const cur = root.querySelector(".sd-player__cur");
    const label = (b, t) => b && b.querySelectorAll("span").forEach((x) => (x.textContent = t));
    const play = root.querySelector("[data-play]"), snd = root.querySelector("[data-sound]");
    const sync = () => label(play, v.paused ? "Play." : "Pause.");
    label(snd, v.muted ? "Sound on." : "Sound off.");
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    v.addEventListener("volumechange", () => label(snd, v.muted ? "Sound on." : "Sound off."));
    v.addEventListener("ended", () => setTimeout(() => { v.currentTime = 0; gsap.set(cur, { scaleX: 0 }); }, 0));
    const toggle = (e) => { e && e.stopPropagation(); if (!v._load) return SD.vidPlay(v); v.paused ? v.play().catch(() => {}) : v.pause(); };
    play && play.addEventListener("click", toggle);
    v.parentNode.addEventListener("click", toggle);
    snd && snd.addEventListener("click", () => (v.muted = !v.muted));
    const full = root.querySelector("[data-full]");
    full && full.addEventListener("click", () => vidLoad(v).then(() => (document.fullscreenElement ? document.exitFullscreen() : (v.requestFullscreen || v.webkitEnterFullscreen || (() => {})).call(v))));
    const tl = root.querySelector("[data-tl]");
    tl && tl.addEventListener("click", (e) => {
      const b = tl.getBoundingClientRect(), p = gsap.utils.clamp(0, 1, (e.clientX - b.left) / b.width);
      vidLoad(v).then(() => { v.currentTime = v.duration * p; gsap.set(cur, { scaleX: p }); });
    });
    gsap.set(cur, { scaleX: 0 });
    sync();
    const tick = () => { if (!v.paused && v.duration) gsap.set(cur, { scaleX: v.currentTime / v.duration }); };
    gsap.ticker.add(tick);
    return { v, open: () => SD.vidPlay(v), restart: () => SD.vidPlay(v, true), close: () => SD.vidPause(v) };
  };

  // ── Video window — original popup: while the panel rises from 100vh below in 1.4s expo.inOut, the inner player follows down from −50% and overlaps it,
  //    The 80% dark ink curtain lays in over .4s after a .4s wait (after .6s when closing). Unless opening, the video restarts from the beginning
  const popup = document.querySelector(".sd-popup");
  const overlay = document.querySelector(".sd-overlay");
  const popIn = popup.querySelector(".sd-player");
  const reel = SD.player(popIn);
  gsap.set(popup, { y: "100vh", autoAlpha: 1 });
  gsap.set(popIn, { yPercent: -50 });
  let popupOn = false, popTl = null;
  const popupTo = (on) => {
    if (on === popupOn) return;
    popupOn = on;
    const busy = popTl && popTl.isActive();
    popTl && popTl.kill();
    gsap.killTweensOf(overlay, "autoAlpha");
    const d = reduced ? 0 : 1;
    popTl = gsap.timeline()
      .to(popup, { y: on ? 0 : "100vh", duration: 1.4 * d, ease: "expo.inOut" })
      .to(popIn, { yPercent: on ? 0 : -50, duration: 1.4 * d, ease: "expo.inOut" }, "<")
      .to(overlay, { autoAlpha: on ? 1 : 0, duration: 0.4 * d, ease: "alpha" }, on ? 0.4 * d : 0.6 * d);
    if (on) { stopScroll(); busy ? reel.open() : reel.restart(); }
    else { startScroll(); reel.close(); }
  };
  document.querySelectorAll("[data-popup-open]").forEach((el) => el.addEventListener("click", () => popupTo(true)));
  document.querySelector("[data-popup-close]").addEventListener("click", () => popupTo(false));
  addEventListener("keydown", (e) => e.code === "Escape" && popupTo(false));

  // ── Following ‹Play ◇ Video› label — on enter the center diamond grows in 1s expo.inOut and the side text splits apart, the corner dots turn on in .6s. Position follows in 1.2s expo.out
  SD.follow = (area) => {
    const cur = area.querySelector("[data-cursor]");
    if (!cur || reduced) return;
    const ctr = cur.querySelector(".sd-cursor__ctr");
    const ks = cur.querySelectorAll(".sd-cursor__k");
    const l = cur.querySelector(".sd-cursor__l"), r = cur.querySelector(".sd-cursor__r");
    const pos = (e) => {
      const b = area.getBoundingClientRect();
      return { x: e.clientX - b.left - cur.offsetWidth / 2 + rem(0.25), y: e.clientY - b.top - cur.offsetHeight / 2 + rem(0.75) };
    };
    let inside = false, last = null;
    // Original yc.scroll(): even while scrolling, it keeps following the last mouse position with the same 1.2s expo.out
    const onScroll = () => inside && last && gsap.to(cur, { ...pos(last), duration: 1.2, ease: "expo.out", overwrite: "auto" });
    SD.lenis ? SD.lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });
    area.addEventListener("mousemove", (e) => {
      if (!isXL()) return;
      last = { clientX: e.clientX, clientY: e.clientY };
      const p = pos(e);
      if (!inside) {
        inside = true;
        gsap.killTweensOf(cur);
        gsap.set(cur, p);
        const lw = l.offsetWidth, rw = r.offsetWidth;
        gsap.timeline()
          .set(ctr, { scale: 0 }).set(ks, { autoAlpha: 0 })
          .set(l, { x: lw / 2 + rem(1.5) + rem(1.5) - rem(0.5) }).set(r, { x: -(rw / 2 + rem(1.5) + rem(1.5) - rem(0.5)) })
          .to(ctr, { scale: 1, duration: 1, ease: "expo.inOut" })
          .to([l, r], { x: 0, duration: 1, ease: "expo.inOut" }, "<")
          .to(cur, { autoAlpha: 1, duration: 0.4, ease: "alpha" }, 0.2)
          .to(ks, { autoAlpha: 1, duration: 0.4, ease: "alpha" }, 0.6);
      } else gsap.to(cur, { ...p, duration: 1.2, ease: "expo.out", overwrite: "auto" });
    });
    area.addEventListener("mouseleave", () => {
      inside = false;
      gsap.to(cur, { autoAlpha: 0, duration: 0.2, ease: "alpha" });
    });
  };
  document.querySelectorAll("[data-follow]").forEach(SD.follow);

  // Parallax photos — pushed bound to scroll by height/strength × (min(width,1440)/1440) (original strength default 8, some 4)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const media = el.querySelector(".wf-img") || el;
      const s = +el.dataset.parallax || 8;
      const off = () => (el.offsetHeight / s) * (Math.min(innerWidth, 1440) / 1440);
      gsap.set(media, { height: () => el.offsetHeight + off() * 2, top: () => -off() });
      gsap.fromTo(media, { y: () => -off() / 2 }, { y: () => off(), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });

    // Big title — when it enters the screen, the letters stand up one by one
    document.querySelectorAll("[data-title]").forEach((el) => {
      const chars = splitChars(el);
      SD.riseSet(chars);
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => SD.riseIn(chars) });
    });
    // Body — original paragraph block: each line shows through with .8s alpha and the gaps between lines add up to .2s
    document.querySelectorAll("[data-par]").forEach((el) => {
      const lines = SD.lines(el);
      gsap.set(lines, { autoAlpha: 0 });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => SD.linesIn(lines) });
    });

    // Footer — the inner part descends from -50% (phone -25%), and when halfway in the title row splits from the center and the photo window opens from the center (1.4s expo.inOut)
    if (foot) document.fonts.ready.then(() => {
      const inn = foot.querySelector(".sd-foot__in");
      const mw = foot.querySelector(".sd-foot__media");
      const img = mw.querySelector(".wf-img");
      const btn = foot.querySelector(".sd-foot__btn .sd-btn");
      const lt = foot.querySelector(".sd-foot__l"), rt = foot.querySelector(".sd-foot__r");
      [lt, rt].forEach(splitChars);
      if (innerHeight >= 700 || !isXL()) gsap.from(inn, { yPercent: isXL() ? -50 : -25, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true } });
      const tl = gsap.timeline({ paused: true });
      const fb = foot.getBoundingClientRect();
      [lt, rt].forEach((t) => SD.riseSet(t._chars));
      const mb = mw.getBoundingClientRect();
      gsap.set(mw, { clipPath: `inset(${mb.height / 2}px ${mb.width / 2}px round 1rem)` });
      gsap.set(img, { scale: 0.75 });
      gsap.set(btn, { autoAlpha: 0, y: rem(6) });
      if (isXL()) {
        lt._lines.forEach((ln) => { ln.style.display = "inline-block"; gsap.set(ln, { x: fb.width / 2 - (ln.getBoundingClientRect().right + rem(2.5)) }); });
        rt._lines.forEach((ln) => { ln.style.display = "inline-block"; gsap.set(ln, { x: fb.width / 2 - (ln.getBoundingClientRect().left - rem(2.5)) }); });
      } else {
        gsap.set(lt, { y: rem(8) });
        gsap.set(rt, { y: -rem(8) });
      }
      tl.to(btn, { autoAlpha: 1, duration: 0.4, ease: "alpha" }).to(btn, { y: 0, duration: 1.4, ease: "expo.inOut" }, "<");
      SD.riseIn(lt._chars, 0, tl);
      SD.riseIn(rt._chars, 0, tl);
      if (isXL()) tl.to([...lt._lines, ...rt._lines], { x: 0, duration: 1.4, ease: "expo.inOut", stagger: 0.0625 }, 0);
      else tl.to([lt, rt], { y: 0, duration: 1.4, ease: "expo.inOut" }, 0);
      tl.to(mw, { clipPath: "inset(0px 0px round 1rem)", duration: 1.4, ease: "expo.inOut" }, 0.1).to(img, { scale: 1, duration: 1.4, ease: "expo.inOut" }, "<");
      ScrollTrigger.create({ trigger: foot, start: "top 50%", onEnter: () => tl.play() });
      ScrollTrigger.refresh();
    });
  });

  // ── Page transition — on exit a dark ink curtain .4s, on entry it lifts over .8s. When going to a work detail, the current page slides −33vh and darkens while a new curtain covers from below over 1.4s expo.inOut
  const fade = document.querySelector(".sd-fade");
  const go = (href, mode) => {
    if (reduced) return (location.href = href);
    stopScroll();
    if (mode === "to-detail" && isXL()) {
      const wrap = document.querySelector("main");
      gsap.set(fade, { autoAlpha: 1, yPercent: 100 });
      gsap.timeline({ onComplete: () => (location.href = href) })
        .to(fade, { yPercent: 0, duration: 1.4, ease: "expo.inOut" })
        .to(wrap, { y: -innerHeight * 0.33, duration: 1.4, ease: "expo.inOut" }, "<")
        .to(overlay, { autoAlpha: 1, duration: 0.4, ease: "alpha" }, 0.2);
    } else if (mode === "from-detail" && isXL()) {
      const wrap = document.querySelector("main");
      gsap.timeline({ onComplete: () => (location.href = href) })
        .to(wrap, { y: innerHeight, duration: 1.4, ease: "expo.inOut" })
        .set(fade, { autoAlpha: 1 });
    } else gsap.to(fade, { autoAlpha: 1, duration: 0.4, ease: "alpha", onComplete: () => (location.href = href) });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const [file, hash] = href.split("#");
    if (file === location.pathname.split("/").pop() && hash) {
      e.preventDefault();
      const t = document.getElementById(hash);
      if (t) SD.lenis ? SD.lenis.scrollTo(t) : t.scrollIntoView();
      return;
    }
    e.preventDefault();
    go(href, a.dataset.transition);
  });
  addEventListener("pageshow", (e) => e.persisted && gsap.set(fade, { autoAlpha: 0 }));

  // ── Loader — runs on every first visit (new tab). Moving between our pages within one tab only lifts the curtain
  const fromInside = sessionStorage.getItem("sd-visited") === "1" && document.referrer && new URL(document.referrer, location.href).origin === location.origin;
  sessionStorage.setItem("sd-visited", "1");
  const done = () => window.dispatchEvent(new CustomEvent("sd:ready"));
  SD.ready = (fn) => (SD.isReady ? fn() : addEventListener("sd:ready", fn, { once: true }));
  addEventListener("sd:ready", () => (SD.isReady = true), { once: true });

  const loaderSlot = document.querySelector('[data-slot="loader"]');
  if (loaderSlot) {
    const shots = ["Alley shoot still · sunset backlight · figure from behind", "Indoor set still · warm bulb light · three people", "Desert outdoor shoot · strong midday light · camel and person", "Studio ad shot · blue lighting · product and model", "Festival scene still · night lighting · crowd", "Behind-the-camera set · director and monitor · dark interior"];
    const last = page === "home" ? `<div class="sd-loader__media"><div class="wf-img wf-video is-flat" data-label="Hero video · light through clouds over desert sand dunes · full-width landscape"><video class="sd-vid" src="media/cover.mp4" muted loop playsinline autoplay aria-hidden="true"></video></div></div>` : "";
    loaderSlot.innerHTML = `
      <div class="sd-loader__stack h-120 h-285x" data-label="Your We / Are + brand English name here">
        <div class="sd-loader__row"><span class="sd-loader__t">We</span><div class="sd-loader__ph-d"></div><span class="sd-loader__t">Are</span></div>
        <div class="sd-loader__ph-m"></div>
        <span class="sd-loader__t" style="align-self:center">Studio Name</span>
      </div>
      <div class="sd-loader__medias">${shots.map((l) => `<div class="sd-loader__media"><div class="wf-img is-flat" data-label="${l} · Landscape 4:3"></div></div>`).join("")}${last}<div class="sd-loader__dim"></div></div>
      <div class="sd-loader__logo sd-logo">${logo}</div>`;
  }
  if (reduced || fromInside || !loaderSlot) {
    loaderSlot && loaderSlot.remove();
    if (!reduced && fromInside) {
      gsap.set(fade, { autoAlpha: 1 });
      window.scrollTo(0, 0);
      gsap.to(fade, { autoAlpha: 0, duration: 0.8, ease: "alpha" });
      gsap.delayedCall(0.2, done);
    } else requestAnimationFrame(done);
    return;
  }
  // Original qf: the app appears after load and fonts, and the loader runs after even the video metadata inside it has been fetched — until then a dark curtain covers everything so nothing shows
  stopScroll();
  window.scrollTo(0, 0);
  const pageLoaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
  const metas = [...loaderSlot.querySelectorAll("video")].map((v) => (v.readyState >= 1 ? 0 : new Promise((r) => { v.addEventListener("loadedmetadata", r, { once: true }); v.addEventListener("error", r, { once: true }); })));
  Promise.all([pageLoaded.then(() => document.fonts.ready), ...metas]).then(() => runLoader(loaderSlot));

  function runLoader(el) {
    const front = page === "home";
    window.scrollTo(0, 0);
    const mob = !isXL();
    const ph = el.querySelector(mob ? ".sd-loader__ph-m" : ".sd-loader__ph-d").getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const wrap = el.querySelector(".sd-loader__medias");
    const medias = [...el.querySelectorAll(".sd-loader__media")];
    const titles = [...el.querySelectorAll(".sd-loader__t")].map((t) => ({ el: t, b: t.getBoundingClientRect(), chars: splitChars(t) }));
    medias.forEach((m, i) => {
      if (front && i === medias.length - 1) {
        const s = Math.max(ph.height / box.height, ph.width / box.width) + 0.25;
        gsap.set(m, { autoAlpha: 0 });
        gsap.set(m.firstElementChild, { scale: s });
      } else gsap.set(m, { autoAlpha: 0, width: ph.width, height: ph.height });
    });
    const dx = ph.left + ph.width / 2 - box.width / 2, dy = ph.top + ph.height / 2 - box.height / 2;
    gsap.set(wrap, {
      autoAlpha: 0, x: dx, y: dy,
      clipPath: mob ? `inset(${box.height / 2}px ${(box.width - ph.width) / 2}px round 1rem)` : `inset(${(box.height - ph.height) / 2}px ${box.width / 2}px round 1rem)`,
    });
    gsap.set(titles.flatMap((t) => t.chars), { autoAlpha: 0, rotateX: 90, transformOrigin: "bottom" });
    el.classList.add("is-on");
    const [a, b, c] = titles;
    if (mob) {
      gsap.set([a.el, b.el], { y: box.height / 2 - a.b.top - b.b.height });
      gsap.set(c.el, { y: box.height / 2 - c.b.top });
    } else {
      const w = a.b.width + b.b.width, g = rem(2.5);
      gsap.set(a.el, { x: box.width / 2 - a.b.right + a.b.width - w / 2 - g });
      gsap.set(b.el, { x: box.width / 2 - b.b.left - b.b.width + w / 2 + g });
    }
    // Photo flip — 6 photos, once each, evenly over 2s
    const flip = gsap.timeline();
    const n = medias.length, step = 2 / n;
    medias.forEach((m, i) => flip.set(medias, { autoAlpha: 0 }, i * step).set(m, { autoAlpha: 1 }, i * step));
    const rot = gsap.timeline();
    titles.forEach((t, i) => SD.riseIn(t.chars, i * 0.2, rot));
    const tl = gsap.timeline({ delay: 0.2 });
    tl.add(rot, 0).add(flip, "-=50%")
      .to(wrap, { clipPath: `inset(${(box.height - ph.height) / 2}px ${(box.width - ph.width) / 2}px round 1rem)`, duration: 1.4, ease: "expo.inOut" }, "<")
      .to(wrap, { autoAlpha: 1, duration: 0.4, ease: "alpha" }, "<0.4")
      .to(titles.map((t) => t.el), { x: 0, y: 0, duration: 1.4, ease: "expo.inOut" }, "<-0.4");
    if (front) {
      const last = medias[n - 1];
      tl.to(wrap, { clipPath: "inset(0px 0px round 0rem)", x: 0, y: 0, duration: 1.4, ease: "expo.inOut" }, "+=0.4")
        .set(last, { autoAlpha: 1 }, "<")
        .to(last.firstElementChild, { scale: 1, duration: 1.4, ease: "expo.inOut" }, "<")
        .call(() => { el.remove(); startScroll(); done(); });
    } else {
      tl.to(fade, { autoAlpha: 1, duration: 0.4, ease: "alpha" }, "+=0.4")
        .call(() => { el.remove(); startScroll(); done(); })
        .to(fade, { autoAlpha: 0, duration: 0.8, ease: "alpha" });
    }
  }
})();
