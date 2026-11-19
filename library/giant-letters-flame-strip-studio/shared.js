// Frame shared by all pages: header menu (links stack vertically on phone), black-curtain page transition and elements that turn on in sequence on entry, city and award ledgers, story slider, cream footer and
// Motions repeated throughout the original (letters rising, letter shuffle, parallax, pixel dissolve, four-corner scatter).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Draggable, InertiaPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesk = () => innerWidth >= 992;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const build = (c) => {
    // ── Header menu ──
    const nav = document.createElement("nav");
    nav.className = "site-nav";
    nav.dataset.slot = "header";
    nav.innerHTML = `
      <a class="nav-logo" href="index.html" data-ka data-label="Your studio English abbreviation logo goes here">SN.CO<sup>®</sup></a>
      <div class="nav-mid" data-ka><a class="nav-u${c.dataset.page === "works" ? " is-here" : ""}" href="works.html">Selected Work<span class="cnt">[10]</span></a></div>
      <div class="nav-right-g" data-ka data-label="Your three English menu items here"><a class="nav-u${c.dataset.page === "about" ? " is-here" : ""}" href="about.html">About</a>,&nbsp;<a class="nav-u${c.dataset.page === "expertise" ? " is-here" : ""}" href="expertise.html">Services</a>,&nbsp;<a class="nav-u" href="#contact">Contact</a></div>
      <a class="nav-mail nav-u" href="#" data-ka data-label="Your contact email address here">hello@studio.name</a>
  `;
    const wrap = c;
    // The header menu scrolls away with the hero, so it only follows the first section’s brightness
    nav.dataset.tone = $("main > section", c)?.dataset.nav || "light";
    wrap.prepend(nav);

    // ── Black transition veil ──
    const overlay = document.createElement("div");
    overlay.className = "page-overlay";
    c.append(overlay);

    // ── City list + awards ledger. [data-awards] is the ledger only (cream surface) ──
    const body = (n, tag, cnt) => `<div class="aw-body"><span class="caps" data-label="Your awarding organization English name here">Award Body ${n} <span class="mono is-tag">${tag}</span></span><span class="mono">(${cnt})</span></div>`;
    const row = (t, c) => `<div class="aw-row"><span>${t}</span><span class="mono">(${c})</span></div>`;
    const awardsHTML = (light) => `<div class="awards${light ? " is-light" : ""}" data-slot="awards-ledger">
          <div class="awards-left"><p class="caps" data-label="Your award section English title here">Recognition</p><p class="body-copy">Your three lines introducing the award go here. The award isn’t everything, but it helps.</p></div>
          <div class="awards-right">
            <div>${body(1, "Division 1", "00")}${body(2, "Division 2", "00")}${body(3, "Division 1", "00")}${body(4, "Division 1", "00")}${body(5, "Division 2", "00")}${body(6, "Division 1", "00")}</div>
            <div class="aw-list">${Array.from({ length: 14 }, (_, i) => row(`Award Name ${i + 1}`, "00")).join("")}</div>
          </div>
        </div>`;
    const recog = $("[data-recog]", c);
    if (recog) {
      const city = (n) => `<span>City Name ${n}</span>`;
      const cities = `${city(1)}${city(2)}${city(3)}<span class="is-faded">SN.CO’00</span>${city(4)}${city(5)}${city(6)}`;
      recog.outerHTML = `<section class="recog" data-slot="locations-awards" data-nav="dark">
        <div class="loc">
          <div class="loc-photos"><div class="wf-img is-dark p1" data-px data-label="Phone screen mockup on a wire-mesh chair · warm light · portrait"></div><div class="wf-img is-dark p2" data-px data-label="Equipment under stage lights · red glow · vertical"></div></div>
          <div class="loc-right"><span class="mono">Your small lead-in here</span><span class="serif" data-label="Your one serif English word here">Somewhere</span>
            <div class="cities" data-label="Your six English city names, logo and year here"><div class="cities-track">${cities}${cities}</div></div>
            <span class="mono">Your HQ city here</span><a class="loc-mail" href="#" data-label="Your contact email address here">hello@studio.name</a></div>
        </div>
        ${awardsHTML(false)}</section>`;
    }
    const aw = $("[data-awards]", c);
    if (aw) aw.outerHTML = `<section class="aw-sec" data-nav="light">${awardsHTML(true)}</section>`;

    // ── Story slider ──
    const stories = $("[data-stories]", c);
    if (stories) {
      const t = stories.dataset.stories.split("|");
      const big = stories.dataset.big ? `<span class="st-big" aria-hidden="true">${stories.dataset.big}</span>` : "";
      const video = stories.dataset.video;
      // The original About page’s first case card is a self-playing video
      const card = (n, label) => `<a class="st-card" href="detail.html" data-hover-scramble><div class="wf-img is-dark${n === 1 && video ? " has-video" : ""}" data-label="${label}">${n === 1 && video ? `<video data-loop src="${video}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>` : ""}</div><span class="view">View</span><span class="st-letter" aria-hidden="true">${"ABCD"[n - 1]}</span><span class="lbl" data-label="Your English work name here — the big drop cap is its first letter"><span class="caps">${["Alpha", "Bravo", "Charlie", "Delta"][n - 1]} Project</span><span class="mono" data-hover-target>Category · Website</span></span></a>`;
      stories.outerHTML = `<section class="stories" data-slot="stories-slider">
        <p class="serif" data-label="Your serif English heading here">A small heading</p><h2 class="h-big" data-split data-label="Your two-line English section title here">${t[0]}<br>${t[1]}</h2><p class="caps">Recent Work</p><a class="link-u" href="works.html">→ View all</a>
        <div class="st-rail">${big}<div class="st-track">
          ${card(1, "Portrait photo · teal lighting · landscape 16:9")}${card(2, "Product photo · orange background · landscape 16:9")}${card(3, "Laptop screen mockup · bright interior · landscape 16:9")}${card(4, "Amusement park scenery · clear sky · landscape 16:9")}
        </div></div></section>`;
    }

    // ── Cream Footer ──
    const foot = $("[data-foot]", c);
    if (foot) {
      foot.outerHTML = `<footer class="site-foot" id="contact" data-slot="footer">
        <div class="foot-top mono"><span>Your short resolve, two lines here,<br>One more line</span><span>Your one-liner here</span><span>Your field, field + field here</span></div>
        <div class="foot-brand" aria-label="Logo" data-label="Your studio’s English acronym logo goes here, split into three parts."><span>SN</span><span>.</span><span>CO</span><span class="reg">®</span></div>
        <div class="foot-low">
          <div><p class="serif" data-label="Your View Work English phrase here">See some work:</p><a class="foot-card" href="detail.html"><div class="wf-img is-dark" data-label="Featured recent work photo · green background · hand and dog · landscape 3:2"></div><span class="mono is-tag">Just released</span><span class="caps" data-label="Your work English name here">Project Name</span></a></div>
          <div><p class="serif" data-label="Your English contact line here">Get in touch:</p><div class="foot-links" data-label="Your English link names (Contact, Mail, Social, Awards body) here.">
            <div><span class="mono">Contact:</span><a href="#">Contact us</a><a href="#">hello@studio.name</a></div>
            <div></div>
            <div><span class="mono">Social:</span><a href="#">Channel 1</a><a href="#">Channel 2</a></div>
            <div><span class="mono">Award:</span><a href="#">Award Body 1</a><a href="#">Award Body 2</a></div>
          </div></div>
        </div>
        <div class="foot-bottom mono"><span>©0000</span><span>Your company name. All rights reserved.</span></div></footer>`;
    }
  };

  // ── Smooth scroll (original Lenis 1.1.6: 1.2s exponential deceleration, touch ×1.5) ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = window.lenis = new Lenis({ duration: 1.2, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), direction: "vertical", smooth: true, smoothTouch: false, touchMultiplier: 1.5 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTop = () => (lenis ? lenis.scrollTo(0, { duration: 0, immediate: true }) : scrollTo(0, 0));

  // ── Items lit in turn on entry (original .k-a: up from 4vw in .8s power2.out, .05 gap) + first photo 1.05→1 ──
  const intro = (c, after) => {
    const ka = $$("[data-ka]", c), up = ka.filter((el) => el.dataset.ka === "up"), rest = ka.filter((el) => el.dataset.ka !== "up");
    const delay = after ? 0.6 : 0.2;
    c.classList.remove("ka-wait");
    if (reduce) return;
    gsap.set(ka, { opacity: 0 });
    gsap.set(up, { y: "4vw" });
    up.length && gsap.to(up, { y: "0vw", opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.05, delay });
    rest.length && gsap.to(rest, { opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.05, delay });
    $$("[data-ka-img]", c).forEach((el) =>
      after
        ? gsap.fromTo(el, { scale: 1.03 }, { scale: 1, duration: 0.8, ease: "power2.out", delay: 0.6 })
        : gsap.fromTo(el, { scale: 1.05 }, { scale: 1, duration: 0.8, ease: "power2.inOut" })
    );
  };

  // ── Text rise (original [text-split]: only above 1024 width, split into words · characters, 118% below, 1.5s power4.inOut, total stagger .2, when the center reaches the bottom of the screen) ──
  const splits = (c) => $$("[data-split]", c).forEach((el) => {
    if (innerWidth <= 1024 || reduce) return gsap.set(el, { opacity: 1 });
    const s = SplitText.create(el, { type: "words,chars", charsClass: "char", wordsClass: "word" });
    const tl = gsap.timeline({ paused: true }).from(s.chars, { yPercent: 118, duration: 1.5, ease: "power4.inOut", stagger: { amount: 0.2 } });
    ScrollTrigger.create({ trigger: el, start: "center bottom", onEnter: () => tl.play() });
    gsap.set(el, { opacity: 1 });
  });

  // ── Text scramble (original scroll-scramble · hover-scramble-container: speed .5, 1.5s, characters ‹+?84564XERSHKZN›) ──
  const CHARS = "+?84564XERSHKZN";
  const scrambles = (c) => {
    // Case card (original hover-scramble-container): on hover the label disappears, then after .5s it scrambles for 1.5s and floats back up
    $$("[data-hover-scramble]", c).forEach((card) => {
      // Original labels are fixed-width blocks, so the width stays the same even when shuffled — grouped by the width at attach time
      const targets = $$("[data-hover-target]", card).map((t) => {
        Object.assign(t.style, { display: "inline-block", whiteSpace: "nowrap", width: `${t.getBoundingClientRect().width}px` });
        return { t, text: t.textContent };
      });
      card.addEventListener("mouseenter", () => targets.forEach(({ t, text }) => {
        gsap.set(t, { opacity: 0 });
        gsap.to(t, { delay: 0.5, opacity: 1, duration: 1.5, overwrite: true, scrambleText: { text, speed: 0.5, chars: CHARS } });
      }));
    });
    $$("[data-scroll-scramble]", c).forEach((el) => {
      const text = el.textContent;
      if (reduce) return;
      gsap.set(el, { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" } })
        .to(el, { opacity: 1, duration: 1.5, scrambleText: { text, speed: 0.5, chars: CHARS } });
    });
  };

  // ── First photo parallax (original Wu: .image-full-k-a moves y 10% from the top until its bottom edge passes) ──
  const parallax = (c) => $$("[data-ka-img], [data-parallax]", c).forEach((el) =>
    gsap.to(el, { y: "10%", ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } })
  );

  // ── Pixel dissolve (original Gu: redraws the first photo on canvases of width 160→300→400→600→1000 every .1s (image-rendering: pixelated), then shows the original photo when done) ──
  // The photo slot is .wf-img from wire.css (fill, diagonal, label), so the same look is drawn on canvas and scaled per step. For a real photo <img> draws the
  const paint = (el, g, w, h) => {
    const img = el.matches("img") ? el : el.querySelector("img");
    if (img && img.complete && img.naturalWidth) {
      const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      g.drawImage(img, (w - img.naturalWidth * r) / 2, (h - img.naturalHeight * r) / 2, img.naturalWidth * r, img.naturalHeight * r);
      return;
    }
    const cs = getComputedStyle(el), after = getComputedStyle(el, "::after");
    g.fillStyle = cs.backgroundColor;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = cs.borderTopColor;
    g.lineWidth = Math.max(1, w / 900);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = el.dataset.label || "";
    const fs = Math.max(4, (parseFloat(after.fontSize) || 12) * (w / el.clientWidth));
    g.font = `${after.fontWeight} ${fs}px ${after.fontFamily}`;
    const tw = g.measureText(label).width + fs * 1.2;
    g.fillStyle = after.backgroundColor;
    g.fillRect((w - tw) / 2, h / 2 - fs, tw, fs * 2);
    g.fillStyle = after.color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, w / 2, h / 2);
  };
  const pixelate = (c, wait = 0.5, step = 0.1) => $$("[data-ka-img]", c).forEach((el) => {
    if (reduce || el._px) return;
    el._px = true;
    setTimeout(() => {
      const cv = document.createElement("canvas"), g = cv.getContext("2d");
      const widths = [160, 300, 400, 600, 1000];
      const ratio = el.clientHeight / el.clientWidth || 9 / 16;
      cv.className = "px-steps";
      el.append(cv);
      let i = 0;
      const draw = () => {
        cv.width = widths[i];
        cv.height = Math.round(widths[i] * ratio);
        paint(el, g, cv.width, cv.height);
        i++;
      };
      draw();
      const next = () => {
        if (i < widths.length) (draw(), setTimeout(next, step * 1000));
        else (cv.style.opacity = "0", setTimeout(() => cv.remove(), 300));
      };
      setTimeout(next, step * 1000);
    }, wait * 1000);
  });

  // ── Four-corner scatter: four single letters gather at the center, then tied to scroll they spread to the corners (scrub) ──
  const corners = (c) => $$("[data-corners]", c).forEach((sec) => {
    const box = sec.getBoundingClientRect();
    $$(".c-word", sec).forEach((w) => {
      const r = w.getBoundingClientRect();
      const dx = box.left + box.width / 2 - (r.left + r.width / 2), dy = box.top + box.height / 2 - (r.top + r.height / 2);
      gsap.from(w, { x: dx * 0.45, y: dy * 0.45, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom-=20%", end: "bottom top", scrub: true } });
    });
  });

  // ── City names loop endlessly upward ──
  const citiesLoop = (c) => $$(".cities-track", c).forEach((t) => gsap.to(t, { yPercent: -50, duration: 14, ease: "none", repeat: -1 }));

  // ── Story slider: drag to flip ──
  const rails = (c) => $$(".st-rail", c).forEach((rail) => {
    const track = $(".st-track", rail);
    Draggable.create(track, { type: "x", bounds: rail, inertia: true, edgeResistance: 0.85, throwResistance: 2500 });
  });

  // ── Video slot: autoplay, loop, and muted like the original ──
  const videos = (c) => $$("video[data-loop]", c).forEach((v) => {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    reduce ? v.pause() : v.play().catch(() => {});
  });

  // ── Page attach · detach ──
  const SF = (window.SF = { reduce, isDesk, $, $$, page: {}, lenis });
  let ctx = null, offPage = null;
  const mount = (c) => {
    build(c);
    // The original header link underline is a separate element (div.nav-underline)
    $$(".nav-u", c).forEach((a) => a.querySelector(".nav-ul") || a.insertAdjacentHTML("beforeend", '<span class="nav-ul" aria-hidden="true"></span>'));
    ctx = gsap.context(() => {
      scrambles(c);
      rails(c);
      videos(c);
      if (!reduce) (splits(c), corners(c), citiesLoop(c));
      else splits(c);
      const fn = SF.page[c.dataset.page];
      offPage = fn ? fn(c) : null;
    });
  };
  const unmount = () => {
    typeof offPage === "function" && offPage();
    ctx && ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
  const afterIn = (c, wait) => {
    pixelate(c, wait, 0.1);
    ctx && ctx.add(() => !reduce && parallax(c));
    ScrollTrigger.refresh();
  };

  // ── Page transition (original barba 2.10.0 SF-transition) ──
  // Exit: stop scrolling, .3s later pin the current panel in place, curtain to .6 over .8s, panel −20vh over 1s (power2.inOut)
  // Entry: the new panel covers upward from 100vh below to 0 over 1s (power2.inOut), and .k-a follows in turn after .6s
  const container = () => $("[data-barba='container']");
  const boot = () => {
    const c = container();
    mount(c);
    // Original once: first visit is after 2s (once the hero intro ends), on return it’s immediate
    const visited = !!sessionStorage.getItem("hasVisitedBefore");
    setTimeout(() => sessionStorage.setItem("hasVisitedBefore", "true"), 1000);
    const start = () => (intro(c, false), afterIn(c, 0.5));
    c.dataset.page === "home" && !visited && !reduce ? setTimeout(start, 2000) : start();
    scrollTop();
    if (/^https?:$/.test(location.protocol) && window.barba && !reduce) bootBarba();
    else bootFallback();
  };
  function bootBarba() {
    barba.init({
      preventRunning: true,
      transitions: [{
        name: "SF-transition",
        beforeLeave({ current }) {
          lenis && lenis.stop();
          return new Promise((done) => setTimeout(() => {
            document.documentElement.style.overflow = document.body.style.overflow = "hidden";
            const r = current.container.getBoundingClientRect();
            gsap.set(current.container, { position: "fixed", top: r.top, left: r.left, width: r.width, height: r.height, zIndex: 1 });
            gsap.to($(".page-overlay", current.container), { opacity: 0.6, duration: 0.8, ease: "power2.inOut" });
            gsap.to(current.container, { y: "-20vh", duration: 1, ease: "power2.inOut" });
            done();
          }, 300));
        },
        leave() {},
        async enter({ next }) {
          // As in the original, the new panel starts rising immediately — the new css is loaded while it rises (during the slow start below 100vh)
          const css = addHead(next.html);
          unmount();
          mount(next.container);
          if (lenis) (lenis.start(), scrollTop(), lenis.stop());
          else scrollTop();
          intro(next.container, true);
          gsap.set(next.container, { y: "100vh", position: "absolute", zIndex: 2 });
          await Promise.all([css, gsap.to(next.container, { y: "0vh", duration: 1, ease: "power2.inOut" })]);
        },
        afterEnter({ next }) {
          pruneHead();
          document.documentElement.style.overflow = document.body.style.overflow = "";
          lenis && lenis.start();
          gsap.set(next.container, { clearProps: "transform,position,zIndex" });
          afterIn(next.container, 0);
          dispatchEvent(new Event("resize"));
        },
      }],
    });
  }
  // Match the per-page css (index.css · works.css …) to the new document’s head — the original is a single css from a site builder, so this job doesn’t exist there.
  // New css is fetched before entering, and the previous page css is removed after the old panel has fully left (afterEnter)
  let wantCss = null;
  const addHead = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    wantCss = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href"));
    document.title = doc.title;
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href"));
    return Promise.all(wantCss.filter((h) => !have.includes(h)).map((href) => new Promise((done) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.onload = l.onerror = done;
      document.head.append(l);
    })));
  };
  const pruneHead = () => wantCss && document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => !wantCss.includes(l.getAttribute("href")) && l.remove());
  // Opened via file://, barba can’t fetch pages — it exits with the same values, then opens the real page
  function bootFallback() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (!/\.html$/.test(url.pathname) || url.href === location.href.split("#")[0] || reduce) return;
      e.preventDefault();
      const c = container();
      lenis && lenis.stop();
      setTimeout(() => {
        gsap.to($(".page-overlay", c), { opacity: 0.6, duration: 0.8, ease: "power2.inOut" });
        gsap.to(c, { y: "-20vh", duration: 1, ease: "power2.inOut", onComplete: () => (location.href = url.href) });
      }, 300);
    });
  }
  // Smooth scroll for #anchor links within the same page
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const t = a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
    t && (lenis ? lenis.scrollTo(t, { duration: 1.5 }) : t.scrollIntoView());
  });

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : setTimeout(boot);
})();
