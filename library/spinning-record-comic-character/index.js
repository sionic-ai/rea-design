// First page — values exactly as in the original top.js.
// Loading 1s → .3s fade · open: ready → after .5s opening (1.3s) → start (logo .6s) → woofer (pulse starts after .6s)
// Beat is a 3.24s ring, each beat goes scaleMax(.032s power4.out) → scaleMin(.075s power4.in) → 1(.08s)
// Laugh: after 1~7s, then every 4~10s for .42s · pinball speed 65~195px/s (small character 1.08×, large .72×), on hitting a wall a 12% chance to spin (90~320°/s)
// Project: every 4s a noise melt intercept -4→1 over 3s power1.out (phone: .6s fade)
(() => {
  const { reduced } = BB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

  $$("[data-arrow]").forEach((el) => (el.innerHTML = BB.arrow));
  const ratio = { "about-ttl": [1023, 270], "characters-ttl": [1045, 238], "news-ttl": [498, 298], "goods-ttl": [513, 281], "project-ttl": [630, 191] };
  $$(".bb-ttl__bg").forEach((el) => {
    const key = Object.keys(ratio).find((k) => el.parentElement.classList.contains(k));
    const [w, h] = ratio[key] || [1000, 260];
    el.innerHTML = BB.splash(+el.dataset.splash, el.dataset.splashColor, w, h * 0.77);
  });

  // ---------- City illustration (spot for the original scene illustration) ----------
  const scene = $(".scene-svg");
  if (scene) {
    let seed = 42;
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const pal = ["var(--site-blue-44)", "var(--site-violet-46)", "var(--site-cyan-50)", "var(--site-red-46)", "var(--kf-raised)", "var(--site-orange-57)", "var(--site-blue-48)"];
    let x = -20;
    let out = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--site-black)" stop-opacity="0"/><stop offset=".45" stop-color="var(--site-violet-34)" stop-opacity=".9"/><stop offset="1" stop-color="var(--site-rose-75)"/></linearGradient></defs><rect width="1440" height="652" fill="url(#sky)"/>`;
    while (x < 1460) {
      const w = 70 + r() * 110;
      const h = 160 + r() * 300;
      const c = pal[Math.floor(r() * pal.length)];
      out += `<rect x="${x.toFixed(0)}" y="${(652 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${c}" stroke="var(--site-black)" stroke-width="5"/>`;
      for (let wy = 652 - h + 18; wy < 620; wy += 34) {
        for (let wx = x + 12; wx < x + w - 20; wx += 26) {
          if (r() > 0.35) out += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="14" height="18" fill="${r() > 0.5 ? "var(--kf-accent)" : "var(--kf-ink-soft)"}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
        }
      }
      x += w - 4;
    }
    out += `<g transform="translate(560 120) rotate(-3)"><rect width="320" height="96" fill="var(--kf-ink-soft)" stroke="var(--site-black)" stroke-width="7"/><text x="160" y="66" text-anchor="middle" font-family="Luckiest Guy, cursive" font-size="50" fill="var(--site-c-red)" stroke="var(--site-black)" stroke-width="3" paint-order="stroke">CITY NAME</text><path d="M60 96v80M260 96v80" stroke="var(--site-black)" stroke-width="8"/></g>`;
    out += `<rect y="620" width="1440" height="32" fill="var(--kf-surface)"/>`;
    scene.innerHTML = out;
  }

  // ---------- TV art (where the original about_tv_bg sits) ----------
  const tv = $(".about-tv-bg svg");
  if (tv) {
    tv.innerHTML = `
      <path d="M300 420 180 250M470 420l90-200" stroke="var(--site-black)" stroke-width="12" stroke-linecap="round"/>
      <circle cx="180" cy="250" r="16" fill="var(--site-c-red)" stroke="var(--site-black)" stroke-width="6"/><circle cx="560" cy="220" r="16" fill="var(--kf-accent)" stroke="var(--site-black)" stroke-width="6"/>
      <rect x="40" y="420" width="900" height="720" rx="60" fill="var(--site-blue-48b)" stroke="var(--site-black)" stroke-width="12"/>
      <rect x="70" y="450" width="840" height="660" rx="44" fill="none" stroke="var(--site-blue-38)" stroke-width="10"/>
      <rect x="92" y="468" width="420" height="500" rx="70" fill="var(--site-gray-7)" stroke="var(--site-black)" stroke-width="10"/>
      <g stroke="var(--site-black)" stroke-width="10" stroke-linecap="round"><path d="M600 540h260M600 580h260M600 620h260M600 660h260M600 700h260M600 740h260"/></g>
      <circle cx="680" cy="880" r="54" fill="var(--kf-accent)" stroke="var(--site-black)" stroke-width="10"/><path d="M680 880l30-34" stroke="var(--site-black)" stroke-width="10" stroke-linecap="round"/>
      <circle cx="820" cy="880" r="54" fill="var(--site-c-pink)" stroke="var(--site-black)" stroke-width="10"/><path d="M820 880l-34-30" stroke="var(--site-black)" stroke-width="10" stroke-linecap="round"/>
      <path d="M140 1140l-30 40M840 1140l30 40" stroke="var(--site-black)" stroke-width="14" stroke-linecap="round"/>
      <text x="230" y="1060" font-family="Luckiest Guy, cursive" font-size="54" fill="var(--kf-accent)" stroke="var(--site-black)" stroke-width="4" paint-order="stroke">CH.00</text>`;
  }

  // ---------- Loading → open ----------
  const loading = $(".loading");
  const mv = $(".mv");
  const woofer = $(".mv-woofer");
  const beats = [
    [1.036, 0.982, 0], [1.024, 0.991, 0.78], [1.036, 0.982, 1.68], [1.006, 0.9985, 1.88], [1.036, 0.982, 2.62], [1.03, 0.989, 3],
  ];
  let wooferTl = null;
  let inView = true;
  let started = false;
  const woofOn = () => {
    if (reduced) return;
    if (!wooferTl) {
      wooferTl = gsap.timeline({ paused: true, repeat: -1 });
      beats.forEach(([mx, mn, t]) => {
        wooferTl.to(woofer, { scale: mx, duration: 0.032, ease: "power4.out" }, t)
          .to(woofer, { scale: mn, duration: 0.075, ease: "power4.in" }, t + 0.032)
          .to(woofer, { scale: 1, duration: 0.08, ease: "power4.out" }, t + 0.032 + 0.075);
      });
      wooferTl.to({}, { duration: 3.24 - wooferTl.duration() });
    }
    inView && mv.dataset.state === "woofer" ? wooferTl.play() : wooferTl.pause();
  };
  const laughTimers = new WeakMap();
  const laughLoop = (el, delay) => {
    clearTimeout(laughTimers.get(el));
    laughTimers.set(el, setTimeout(() => {
      if (!started || !inView) return el.classList.remove("is-laughing");
      el.classList.add("is-laughing");
      laughTimers.set(el, setTimeout(() => {
        el.classList.remove("is-laughing");
        laughLoop(el, 4000 + Math.random() * 6000);
      }, 420));
    }, delay));
  };
  const laughAll = () => !reduced && $$(".mv-characters .c-chara").forEach((el) => laughLoop(el, 1000 + Math.random() * 6000));
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    mv.classList.toggle("is-in-view", inView);
    woofOn();
    laughAll();
  }, { threshold: 0.15 }).observe(mv);

  const boot = async () => {
    if (loading) {
      await wait(reduced ? 0 : 1);
      loading.classList.add("is-hidden");
      await wait(0.3);
      loading.remove();
    }
    if (reduced || location.hash) {
      mv.dataset.state = "woofer";
      started = true;
      return;
    }
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    await wait(0.5);
    mv.dataset.state = "opening";
    await wait(1.3);
    mv.dataset.state = "start";
    document.body.style.overflow = "";
    await wait(0.6);
    mv.dataset.state = "woofer";
    await wait(0.6);
    woofOn();
    started = true;
    laughAll();
  };
  addEventListener("load", boot);

  // ---------- About character loop motion (after the .8s entrance ends, only while on screen) ----------
  const idle = {
    cs: (c) => (gsap.set(c, { rotation: -5, transformOrigin: "50% 100%" }), gsap.to(c, { rotation: 5, duration: 2.75, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true })),
    jed: (c) => {
      gsap.set(c, { xPercent: -5, yPercent: 0 });
      const tl = gsap.timeline({ paused: true });
      tl.add(gsap.to(c, { xPercent: 5, duration: 3.6, ease: "sine.inOut", repeat: -1, yoyo: true }), 0)
        .add(gsap.to(c, { yPercent: 3, duration: 2.3, ease: "sine.inOut", repeat: -1, yoyo: true }), 0);
      return tl;
    },
    qubo: (c) => {
      gsap.set(c, { transformOrigin: "30% 100%" });
      return gsap.timeline({ paused: true, repeat: -1, repeatDelay: 5 })
        .add("leave").to(c, { xPercent: 400, duration: 2, ease: "power3.out" }, "leave")
        .to(c, { yPercent: -65, duration: 0.3, ease: "power3.out" }, "leave+=0.05").to(c, { yPercent: 0, duration: 0.3, ease: "power3.out" }, "leave+=0.25")
        .to(c, { rotation: -25, duration: 0.2, ease: "power3.out" }, "leave+=0.05").to(c, { rotation: 0, duration: 0.2, ease: "power3.out" }, "leave+=0.2")
        .add("return").set(c, { xPercent: -100, rotation: -30 }, "return")
        .to(c, { xPercent: 0, duration: 0.8, ease: "power3.out" }, "return").to(c, { rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.7)" }, "return+=0.4");
    },
    k2: (c) => {
      gsap.set(c, { transformOrigin: "50% 100%" });
      const sq = (tl) => tl.to(c, { scaleY: 0.9, duration: 0.1 }).to(c, { scaleY: 1, duration: 0.1 }).to(c, { scaleY: 0.95, duration: 0.1 }).to(c, { scaleY: 1, duration: 0.1 });
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 5 });
      sq(tl); tl.to({}, { duration: 1 }); sq(tl);
      // In between, the original swaps the front, side and back images
      const dir = (d) => () => (c.dataset.direction = d);
      tl.call(dir("right"), [], 3.8).call(dir("front"), [], 3.95).call(dir("back"), [], 5.45).call(dir("front"), [], 6.45).call(dir("right"), [], 7.95).call(dir("back"), [], 8.1);
      return tl;
    },
    dabby: (c) => {
      gsap.set(c, { transformOrigin: "30% 100%" });
      return gsap.timeline({ paused: true, repeat: -1, repeatDelay: 3 })
        .to(c, { rotation: 48, xPercent: 40, duration: 0.8, ease: "power3.out" }, 0).to({}, { duration: 0.8 })
        .to(c, { rotation: 0, xPercent: 0, duration: 0.8, ease: "elastic.out(1, 0.7)" }).to({}, { duration: 1.8 });
    },
    rcb: (c) => {
      gsap.set(c, { rotation: -2, transformOrigin: "50% 100%" });
      return gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.2 })
        .to(c, { rotation: 2, yPercent: -2, duration: 0.28, ease: "power2.out" }).to(c, { rotation: -1, yPercent: 0, duration: 0.32, ease: "power2.inOut" })
        .to(c, { rotation: 1, yPercent: -1, duration: 0.24, ease: "power2.out" }).to(c, { rotation: -2, yPercent: 0, duration: 0.3, ease: "power2.inOut" });
    },
  };
  const idleDelay = { cs: 0, jed: 0, qubo: 1.2, k2: 1, dabby: 0.8, rcb: 0.2 };
  if (!reduced) {
    $$(".about-characters-item, .about-tv-characters").forEach((item) => {
      const id = item.dataset.chara;
      const c = item.querySelector(".c-chara");
      if (!idle[id] || !c) return;
      let tl = null;
      let seen = false;
      let ready = false;
      const run = () => ready && seen && gsap.delayedCall(idleDelay[id], () => seen && (tl = tl || idle[id](c)).restart());
      new MutationObserver(() => {
        if (item.classList.contains("is-once-show") && !ready) setTimeout(() => { ready = true; run(); }, 900);
      }).observe(item, { attributes: true, attributeFilter: ["class"] });
      new IntersectionObserver(([e]) => {
        seen = e.isIntersecting;
        if (!seen && tl) tl.pause(0); else run();
      }, { threshold: 0.15 }).observe(item);
    });
  }

  // ---------- Comic panel hover: front → right → back → left in 1.5s steps ----------
  const spinOrder = ["front", "right", "back", "left"];
  $$(".characters-item").forEach((item) => {
    const btn = item.querySelector(".characters-item-btn");
    const c = item.querySelector(".characters-item-chara .c-chara");
    if (!btn || !c) return;
    let t = null;
    btn.addEventListener("mouseenter", () => {
      let i = 0;
      clearInterval(t);
      t = setInterval(() => (c.dataset.direction = spinOrder[++i % 4]), 375);
    });
    btn.addEventListener("mouseleave", () => { clearInterval(t); c.dataset.direction = "front"; });
  });

  // ---------- Modal ----------
  const people = {
    cs: ["NAME A", "Word one & two more words", "var(--site-blue-61)", "var(--kf-accent)"],
    qubo: ["NAME B", "Word & Word", "var(--site-gray-56)", "var(--site-c-teal)"],
    k2: ["NC", "Word one & A bit word", "var(--site-violet-65)", "var(--kf-accent-soft)"],
    rcb: ["NAME D", "Word & A little word", "var(--site-green-53)", "var(--site-c-red)"],
    jed: ["NME", "Word & Self-word", "var(--site-red-50)", "var(--kf-accent)"],
    dabby: ["NAME F", "Word & Word", "var(--site-orange-63)", "var(--site-c-green)"],
  };
  const rows = ["Name", "Personality", "Favorite Things", "What I’m Good At", "Favorite food", "Things I can’t do", "Amazing Power"];
  const dialog = $("#bbModal");
  const body = $(".c-modal-body", dialog);
  body.innerHTML = Object.entries(people).map(([id, [name, txt, panel, color]]) => `
    <div class="c-modal-body-inner" data-modal-content="${id}" aria-hidden="true">
      <div class="c-modal-chara-item" data-chara="${id}" style="--panel:${panel};--txt-color:${color};--name-color:${color}">
        <div class="characters-item-bg"><div class="characters-item-bg-inner"></div></div>
        <p class="c-modal-chara-name characters-item-name" style="opacity:1;transform:rotate(-12deg)"><span>${name}</span></p>
        <p class="c-modal-chara-txt">${txt.replace(" & ", " &amp;<br>")}</p>
        <figure class="c-modal-chara-img">${BB.chara(id)}</figure>
        <div class="c-modal-chara-scroll">${rows.map((r, i) => `<div class="c-modal-chara-profile"><p class="c-modal-chara-profile-ttl">${r}</p><p class="c-modal-chara-profile-txt">${i === 0 ? `${name}(How to read)` : i === 6 ? "Your two-ish lines on this character’s unique magical power here." : "Your one-liner here"}</p></div>`).join("")}</div>
      </div>
    </div>`).join("");
  const panels = $$(".c-modal-body-inner", dialog);
  let active = null;
  let busy = false;
  const show = (key, dir = null) => {
    const next = panels.find((p) => p.dataset.modalContent === key);
    const cur = panels.find((p) => p.classList.contains("is-active"));
    const clean = (p) => p.classList.remove("is-entering", "is-leaving", "is-from-next", "is-from-prev", "is-to-next", "is-to-prev");
    if (!cur || !dir || cur === next) {
      panels.forEach((p) => { clean(p); p.classList.toggle("is-active", p === next); p.setAttribute("aria-hidden", String(p !== next)); });
      active = key;
      return;
    }
    busy = true;
    cur.classList.add("is-active", "is-leaving");
    next.classList.add("is-entering", dir === "next" ? "is-from-next" : "is-from-prev");
    next.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cur.classList.add(dir === "next" ? "is-to-prev" : "is-to-next");
      next.classList.add("is-active");
    }));
    setTimeout(() => {
      cur.classList.remove("is-active"); clean(cur); cur.setAttribute("aria-hidden", "true");
      clean(next); active = key; busy = false;
    }, 520);
  };
  // Video modal: like the original video player, it autoplays from the start on every open (autoplay 1 · seekTo 0), closes the window when it ends, and pauses before closing
  const video = $(".c-modal-video", dialog);
  video?.addEventListener("ended", () => close());
  const open = (mode, key) => {
    if (mode === "youtube" && video) { video.currentTime = 0; video.play().catch(() => {}); }
    dialog.classList.toggle("is-mode-youtube", mode === "youtube");
    dialog.classList.toggle("is-mode-text", mode === "text");
    if (key) show(key, dialog.open && active ? (Object.keys(people).indexOf(key) > Object.keys(people).indexOf(active) ? "next" : "prev") : null);
    if (!dialog.open) { dialog.showModal(); document.body.style.overflow = "hidden"; }
  };
  const close = () => {
    if (!dialog.open) return;
    video?.pause();
    dialog.classList.add("is-closing");
    setTimeout(() => {
      dialog.classList.remove("is-closing");
      dialog.close();
      document.body.style.overflow = "";
      panels.forEach((p) => p.classList.remove("is-active"));
      active = null;
    }, reduced ? 0 : 500);
  };
  const move = (d) => {
    if (busy || !active) return;
    const keys = Object.keys(people);
    show(keys[(keys.indexOf(active) + d + keys.length) % keys.length], d > 0 ? "next" : "prev");
  };
  $$("[data-modal-open]").forEach((b) => b.addEventListener("click", () => open("text", b.dataset.modalOpen)));
  $$("[data-youtube]").forEach((b) => b.addEventListener("click", () => open("youtube")));
  $(".c-modal-btn-prev", dialog).addEventListener("click", () => move(-1));
  $(".c-modal-btn-next", dialog).addEventListener("click", () => move(1));
  $(".c-modal-close", dialog).addEventListener("click", close);
  dialog.addEventListener("click", (e) => e.target === dialog && close());
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); close(); });

  // The TV screen shimmer turns on only when 15% or more is visible (original IntersectionObserver threshold .15)
  const tvImg = $(".about-tv-img");
  if (tvImg) new IntersectionObserver(([e]) => tvImg.classList.toggle("is-noise-active", !!e?.isIntersecting), { threshold: 0.15 }).observe(tvImg);

  // ---------- Goods pinball ----------
  const board = $("[data-goods-pinball]");
  if (board && !reduced) {
    const els = $$(".goods-bg-chara", board);
    const rand = (a, b) => a + Math.random() * (b - a);
    let list = [];
    const place = () => {
      const { width: W, height: H } = board.getBoundingClientRect();
      const ws = els.map((e) => e.offsetWidth);
      const mn = Math.min(...ws);
      const mx = Math.max(...ws);
      list = els.map((el) => {
        const id = el.dataset.chara;
        const a = rand(0, Math.PI * 2);
        const k = mx === mn ? 0.9 : 1.08 + (0.72 - 1.08) * ((el.offsetWidth - mn) / (mx - mn));
        const sp = rand(65, 195) * k;
        const it = { el, id, c: el.querySelector(".c-chara"), x: rand(0, Math.max(W - el.offsetWidth, 0)), y: rand(0, Math.max(H - el.offsetHeight, 0)), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, angle: 0, spin: id === "qubo" ? rand(90, 320) : 0, special: false };
        face(it);
        draw(it);
        return it;
      });
    };
    const face = (it) => {
      if (it.id === "qubo" || it.special) { it.c.dataset.direction = "front"; return; }
      const right = it.vx >= 0;
      it.c.dataset.direction = right ? "right" : "left";
      const deg = (Math.atan2(it.vy, it.vx) * 180) / Math.PI;
      it.angle = right ? deg : deg - 180;
    };
    const draw = (it) => (it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) rotate(${it.angle}deg)`);
    let raf = null;
    let last = 0;
    const tick = (t) => {
      if (!last) last = t;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      const { width: W, height: H } = board.getBoundingClientRect();
      list.forEach((it) => {
        const mxX = Math.max(W - it.el.offsetWidth, 0);
        const mxY = Math.max(H - it.el.offsetHeight, 0);
        let hit = false;
        it.x += it.vx * dt;
        it.y += it.vy * dt;
        if (it.x <= 0 || it.x >= mxX) { it.x = Math.min(Math.max(it.x, 0), mxX); it.vx *= -1; hit = true; }
        if (it.y <= 0 || it.y >= mxY) { it.y = Math.min(Math.max(it.y, 0), mxY); it.vy *= -1; hit = true; }
        if (hit) {
          if (it.id === "qubo") it.spin = rand(90, 320) * (Math.random() > 0.5 ? 1 : -1);
          else if (it.special) { it.special = false; it.spin = 0; face(it); }
          else { if (Math.random() < 0.12) { it.special = true; it.spin = rand(90, 320) * (Math.random() > 0.5 ? 1 : -1); } face(it); }
        }
        if (it.id === "qubo" || it.special) it.angle += it.spin * dt;
        draw(it);
      });
      raf = requestAnimationFrame(tick);
    };
    place();
    addEventListener("resize", place);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.2 }).observe(board);
  }

  // ---------- Project noise dissolve ----------
  const slideBox = $("[data-project-slide]");
  if (slideBox) {
    const slides = [
      ["var(--site-gray-87)", "Group illustration of six characters · white background · landscape 16:9"],
      ["var(--site-gray-85)", "Group photo of the makers · indoor lighting · holding character panels · landscape 16:9"],
    ];
    const art = ([bg, label]) => `<rect width="736" height="412" fill="${bg}"/><path d="M0 0 736 412M736 0 0 412" stroke="var(--site-gray-78)" stroke-width="2"/><rect x="168" y="188" width="400" height="36" fill="${bg}"/><text x="368" y="212" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="15" fill="var(--site-gray-42)">${label}</text>`;
    const cur = $(".project-slide-cur", slideBox);
    const nxt = $(".project-slide-next", slideBox);
    const fA = $("#projectAlpha");
    const turb = $("#projectTurb");
    let i = 0;
    let busy2 = false;
    cur.innerHTML = art(slides[0]);
    const step = () => {
      if (busy2) return;
      busy2 = true;
      const n = (i + 1) % slides.length;
      nxt.innerHTML = art(slides[n]);
      const done = () => { cur.innerHTML = art(slides[n]); nxt.innerHTML = ""; gsap.set(nxt, { opacity: 1 }); fA.setAttribute("intercept", "-4"); i = n; busy2 = false; };
      if (matchMedia("(max-width: 767px)").matches || reduced) {
        nxt.removeAttribute("filter");
        gsap.fromTo(nxt, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.6, ease: "power2.out", onComplete: done });
        return;
      }
      nxt.setAttribute("filter", "url(#projectNoise)");
      turb.setAttribute("seed", String(Math.floor(Math.random() * 100)));
      gsap.fromTo(fA, { attr: { intercept: -4 } }, { attr: { intercept: 1 }, duration: 3, ease: "power1.out", onComplete: done });
    };
    let timer = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) { step(); timer = setInterval(step, 4000); }
      else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }, { threshold: 0.25 }).observe(slideBox);
  }
})();
