// Home page: question intro → diagonal product rotation and name typing, fixed photo arch cover, feature cursor photo, black photo strip, products paged three at a time, wordmark strip.
// Original values: letters .5s blur 7px→0 stagger .1s (last group .65s · .22s) · center product blur 10px→0 .7s · wordmark 1.45s, unfolds .5s later
//           one rotation step x±440 y∓130 (phone 250 · 95) blur 0/6/12 · .9s steps(5) · season bar 4s · typing 92ms, 420ms between cells
//           arch cover 1000px · cursor photo lerp .14 wipe .55s · photo strip 1.3→1 (phone 2→1) · wordmark strip .6px/frame + speed×.5
(() => {
  const { reduced } = YK;
  const isSp = () => matchMedia("(max-width: 767px)").matches;
  const root = document.documentElement;

  // ── Fill the photo strip and wordmark strip ──
  const galLabels = ["Event booth display · Warm lighting", "Product in a customer’s hand · close-up", "Row of products in a glass display case", "Product on green felt · top-down", "Hands at work · side light", "Pile of packing boxes · light background", "People beyond the counter · evening"];
  document.querySelectorAll(".gal__inner").forEach((row, r) => {
    let html = "";
    for (let k = 0; k < 4; k++) for (let i = 0; i < 7; i++) html += `<div class="gal__item"><div class="wf-img" data-label="${galLabels[(i + r * 2) % 7]} · Vertical"></div><p>photo_${String(((i + r * 7) * 37) % 900 + 100)}.jpg</p></div>`;
    row.innerHTML = html;
  });
  const words = ["WORD", "MA", "RK"];
  document.querySelectorAll(".band__track").forEach((t) => {
    let html = "";
    for (let k = 0; k < 2; k++) words.forEach((w) => (html += `<span class="band__word">${w}</span><div class="band__pill"><div class="wf-img" data-label="Product cutout · landscape"></div></div>`));
    t.innerHTML = html;
  });

  // ── Diagonal rotation ──
  const stage = document.querySelector(".kv__stage");
  const items = [...stage.querySelectorAll(".kv__item")];
  const n = items.length;
  const half = Math.floor(n / 2);
  let cur = 0, busy = false;
  const step = () => (isSp() ? { dx: 250, dy: 95 } : { dx: 440, dy: 130 });
  const blurOf = (a) => (a === 0 ? 0 : a === 1 ? 6 : 12);
  const rel = (i) => { let e = i - cur; if (e > half) e -= n; if (e < -half) e += n; return e; };
  const STEPPED = "translate 0.9s steps(5, end), filter 0.9s steps(5, end), opacity 0.6s ease";
  const place = (el, e, anim) => {
    const { dx, dy } = step();
    el.style.transition = anim ? STEPPED : "none";
    el.style.translate = `calc(-50% + ${e * dx}px) calc(-50% + ${-e * dy}px)`;
    const b = blurOf(Math.min(Math.abs(e), 2));
    el.style.filter = b ? `blur(${b}px)` : "none";
    el.style.zIndex = String(isSp() ? [5, 3, 1][Math.min(Math.abs(e), 2)] : 5 + e * 2);
  };
  const layout = (anim, skip) => items.forEach((el, i) => el !== skip && place(el, rel(i), anim));
  layout(false);

  // The bottom-left one leaves the screen, and a clone of the same shape enters from outside the top right
  const advance = () => {
    if (busy) return;
    busy = true;
    const leaving = items.find((el, i) => rel(i) === -half);
    cur = (cur + 1) % n;
    layout(true, leaving);
    const { dx, dy } = step();
    const clone = leaving.cloneNode(true);
    stage.append(clone);
    clone.style.transition = "none";
    clone.style.translate = `calc(-50% + ${(half + 1) * dx}px) calc(-50% + ${-(half + 1) * dy}px)`;
    clone.style.filter = `blur(${blurOf(2)}px)`;
    clone.style.zIndex = "1";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      leaving.style.transition = STEPPED;
      leaving.style.translate = `calc(-50% + ${-(half + 1) * dx}px) calc(-50% + ${(half + 1) * dy}px)`;
      clone.style.transition = STEPPED;
      clone.style.translate = `calc(-50% + ${half * dx}px) calc(-50% + ${-half * dy}px)`;
    }));
    setTimeout(() => { leaving.style.transition = "opacity 0.3s ease"; leaving.style.opacity = "0"; }, 900);
    setTimeout(() => {
      clone.remove();
      leaving.style.opacity = "1";
      layout(false);
      busy = false;
      settle();
    }, 1300);
  };

  // ── Bottom-right name field: number dial + 4s bar → clear and one beat → letter typing → bounce ”and” ”of” ”Product Name” ──
  const info = document.querySelector(".kv__info");
  const names = [["Ingredient One", "Material Two"], ["Material Three", "Ingredient four 00%"], ["Ingredient Five", "Ingredient Six"], ["Ingredient Seven", "Ingredient Eight"], ["Ingredient Nine", "Material Ten"]];
  const boxA = info.querySelector('[data-key="a"]');
  const boxB = info.querySelector('[data-key="b"]');
  const [connA, connB] = info.querySelectorAll(".kv__conn");
  const suffix = info.querySelector(".kv__suffix");
  suffix.innerHTML = [...suffix.textContent].map((c) => `<span>${c}</span>`).join("");
  const fill = info.querySelector(".kv__fill");
  const dials = [...info.querySelectorAll(".kv__dial-track")];
  dials.forEach((t) => (t.innerHTML = [...Array(n).keys(), 0].map((i) => `<span>${i + 1}</span>`).join("")));
  const dialAt = (t, slot, instant) => {
    const h = t.firstElementChild.getBoundingClientRect().height || 15.6;
    t.classList.toggle("is-instant", !!instant);
    t.style.transform = `translateY(${-slot * h}px)`;
    if (instant) { void t.offsetWidth; t.classList.remove("is-instant"); }
  };
  const setDials = (idx, instant) => {
    [idx, (idx + 1) % n].forEach((v, k) => {
      const t = dials[k];
      const prev = t._v;
      t._v = v;
      if (!instant && prev === n - 1 && v === 0) {
        dialAt(t, n);
        t.addEventListener("transitionend", () => dialAt(t, 0, true), { once: true });
      } else dialAt(t, v, instant || prev === undefined);
    });
  };
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const bounce = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const type = (el, text, done) => {
    el.textContent = "";
    [...text].forEach((_, i) => later(() => (el.textContent = text.slice(0, i + 1)), 92 * (i + 1)));
    later(done, 92 * text.length);
  };
  const runFill = () => { fill.classList.remove("is-running"); void fill.offsetWidth; fill.classList.add("is-running"); };
  const settle = () => {
    timers.forEach(clearTimeout);
    timers = [];
    info.classList.remove("is-fading");
    const [a, b] = names[cur];
    type(boxA, a, () => {
      bounce(connA, "is-bounce");
      later(() => type(boxB, b, () => {
        bounce(connB, "is-bounce");
        later(() => [...suffix.children].forEach((s, i) => later(() => bounce(s, "is-bounce"), i * 118)), 280);
      }), 420);
    });
    runFill();
  };
  fill.addEventListener("animationend", () => {
    fill.classList.remove("is-running");
    info.classList.add("is-fading");
    setDials((cur + 1) % n);
    advance();
  });
  setDials(0, true);
  const startSequence = () => {
    if (reduced) { boxA.textContent = names[0][0]; boxB.textContent = names[0][1]; return; }
    settle();
  };

  // ── Intro ──
  const chars = [...document.querySelectorAll(".hero__heading .hc")];
  const center = items[0];
  const rest = items.slice(1);
  const head = document.querySelector(".yk-head");
  const wordmark = document.querySelector(".hero__wordmark");
  const extras = [document.querySelector(".hero__scroll"), document.querySelector(".badge")];
  // Like the original, skip only when arriving at the first page via a link from another page on the site — refresh or direct open plays the intro
  let revisit = false;
  try { revisit = sessionStorage.getItem("yk-intro-skip") === "1"; sessionStorage.removeItem("yk-intro-skip"); } catch (e) {}
  const playIntro = !reduced && !revisit;
  root.classList.remove("is-intro");
  if (playIntro) {
    const block = (e) => e.preventDefault();
    addEventListener("wheel", block, { passive: false });
    addEventListener("touchmove", block, { passive: false });
    YK.lenis && YK.lenis.stop();
    scrollTo(0, 0);
    gsap.set(chars, { opacity: 0, filter: "blur(7px)" });
    gsap.set(chars.filter((c) => c.classList.contains("is-mark")), { filter: "none" });
    gsap.set([...rest, info, wordmark, ...extras, head], { autoAlpha: 0 });
    gsap.set(center, { autoAlpha: 0, filter: "blur(10px)" });
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        removeEventListener("wheel", block);
        removeEventListener("touchmove", block);
        YK.lenis && YK.lenis.start();
        gsap.set(head, { clearProps: "transform" });
        gsap.set(chars, { clearProps: "filter" });
        ScrollTrigger.refresh();
      },
    });
    let t = 0, showAt = 0, clearAt = 0, clearDur = 0.45, revealAt = 0;
    document.querySelectorAll(".hero__group").forEach((g) => {
      const gc = [...g.querySelectorAll(".hc")];
      const dur = g.dataset.dur ? g.dataset.dur / 1000 : 0.5;
      const stg = g.dataset.stagger ? g.dataset.stagger / 1000 : 0.1;
      if (g.hasAttribute("data-show-blur")) showAt = t;
      if (g.hasAttribute("data-clear-blur")) { clearAt = t; clearDur = 0.7; }
      gc.forEach((c, i) => {
        tl.to(c, c.classList.contains("is-mark") ? { opacity: 1, duration: dur } : { opacity: 1, filter: "blur(0px)", duration: dur }, t);
        const last = i === gc.length - 1;
        if (last && g.dataset.pause) t += dur + g.dataset.pause / 1000;
        else if (last) { revealAt = t + dur; t += stg; }
        else t += stg;
      });
    });
    const wmAt = revealAt + 0.45;
    const expandAt = wmAt + 1.45 + 0.5;
    tl.to(center, { autoAlpha: 1, duration: 0.55 }, showAt)
      .to(center, { filter: "blur(0px)", duration: clearDur }, clearAt)
      .to(wordmark, { autoAlpha: 1, duration: 1.45 }, wmAt)
      .add(() => layout(false), expandAt)
      .to(rest, { autoAlpha: 1, duration: 0.55 }, expandAt)
      .fromTo(head, { y: -36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.1, ease: "power3.out" }, expandAt)
      .to(info, { autoAlpha: 1, duration: 0.8 }, expandAt)
      .to(extras, { autoAlpha: 1, duration: 0.45 }, expandAt + 0.08)
      .add(startSequence, expandAt);
  } else startSequence();

  // ── Scroll-bound things (updated every frame in one function, like the original) ──
  const scrollInd = document.querySelector(".hero__scroll");
  const aboutHead = document.querySelector("[data-about-chars]");
  const aboutChars = aboutHead ? [...YK.split(aboutHead, 0)] : [];
  let shown = -1;
  const scenes = [...document.querySelectorAll(".about__scene")];
  const bgs = [...document.querySelectorAll(".about__bg")];
  const gal = document.querySelector(".gal");
  const galStage = document.querySelector(".gal-stage");
  const shops = document.querySelector(".shops");
  const update = (s) => {
    const vh = innerHeight;
    scrollInd.classList.toggle("is-hidden", s > 40);
    // Turns on title characters by progress — starts at .72vh on phone, .55vh on PC, fully on within .3/.5 of progress
    const r = aboutHead.closest(".about__scene").getBoundingClientRect();
    const a = vh * (isSp() ? 0.72 : 0.55), b = vh * -0.1;
    const p = Math.min(1, Math.max(0, (a - r.top) / (a - b)) / (isSp() ? 0.3 : 0.5));
    const k = Math.floor(p * aboutChars.length);
    if (k !== shown) { shown = k; aboutChars.forEach((c, i) => c.classList.toggle("is-on", i < k)); }
    if (!isSp()) {
      for (let i = 1; i < bgs.length; i++) {
        let sy = vh;
        if (i === 1) sy += 0.1 * vh;
        else if (i === 3) sy -= 0.4 * vh;
        const pm = Math.min(1, Math.max(0, (sy - scenes[i].getBoundingClientRect().top) / 1000));
        const st = bgs[i].style;
        st.setProperty("--reveal-top", ((1 - pm) * 110).toFixed(2) + "%");
        st.setProperty("--bg-scale", (1.06 - 0.06 * pm).toFixed(4));
        st.setProperty("--arch-h", (175 + 1025 * pm).toFixed(1) + "%");
        st.setProperty("--arch-v", (230 + 1270 * pm).toFixed(1) + "%");
      }
    }
    gal.classList.toggle("is-hidden", shops.getBoundingClientRect().top < vh * 0.8);
    const pg = Math.min(1, Math.max(0, 1 - galStage.getBoundingClientRect().top / vh));
    const s0 = isSp() ? 2 : 1.3;
    gal.style.setProperty("--gallery-scale", (s0 - pg * (s0 - 1)).toFixed(4));
  };
  YK.onScroll = update;
  update(scrollY);
  addEventListener("resize", () => { layout(false); update(scrollY); });
  if (reduced) aboutChars.forEach((c) => c.classList.add("is-on"));

  // ── Feature cursor photo ──
  const feat = document.querySelector(".feat");
  const cursor = feat.querySelector(".cursor-pic");
  const [paneBase, paneCover] = cursor.querySelectorAll(".cursor-pic__pane");
  const imgBase = paneBase.firstElementChild, imgCover = paneCover.firstElementChild;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, active = null, wipeT = 0;
  const loop = () => {
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    raf = requestAnimationFrame(loop);
  };
  const show = (item, e) => {
    const label = item.dataset.cursor;
    if (!active) {
      cx = tx = e.clientX - 86; cy = ty = e.clientY - 114;
      imgBase.dataset.label = label;
      cursor.classList.add("is-visible");
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
    } else if (active !== item) {
      clearTimeout(wipeT);
      imgCover.dataset.label = label;
      paneCover.classList.remove("is-wiping");
      void paneCover.offsetWidth;
      paneCover.classList.add("is-wiping");
      wipeT = setTimeout(() => { imgBase.dataset.label = label; paneCover.classList.remove("is-wiping"); }, 550);
    }
    active = item;
  };
  if (matchMedia("(hover: hover)").matches) {
    feat.querySelectorAll(".feat__item").forEach((it) => it.addEventListener("mouseenter", (e) => show(it, e)));
    feat.addEventListener("mousemove", (e) => { tx = e.clientX - 86; ty = e.clientY - 114; });
    feat.querySelector(".feat__list").addEventListener("mouseleave", () => { cursor.classList.remove("is-visible"); active = null; cancelAnimationFrame(raf); });
  }

  // ── Products in threes: from the left they drop down at 90ms intervals, and new ones come in from above (.42s) ──
  const pages = [...document.querySelectorAll(".coll__page")];
  const arrows = [...document.querySelectorAll(".coll__arrow")];
  let pi = 0, pbusy = false;
  const pdur = (p) => 420 + (p.children.length - 1) * 90;
  const go = (to) => {
    if (pbusy || to === pi) return;
    const out = pages[pi], inn = pages[to];
    if (reduced) { out.classList.remove("is-active"); inn.classList.add("is-active"); pi = to; return; }
    pbusy = true;
    arrows.forEach((b) => (b.disabled = true));
    out.classList.add("is-leaving");
    setTimeout(() => {
      out.classList.remove("is-active", "is-leaving");
      inn.classList.add("is-active");
      setTimeout(() => { pi = to; pbusy = false; arrows.forEach((b) => (b.disabled = false)); }, pdur(inn));
    }, pdur(out));
  };
  arrows.forEach((b) => b.addEventListener("click", () => go((pi + (b.classList.contains("is-next") ? 1 : -1) + pages.length) % pages.length)));

  // ── Wordmark band: even rows move left, odd rows move right ──
  const tracks = [...document.querySelectorAll(".band__track")];
  const off = tracks.map(() => 0);
  if (!reduced) {
    const tick = () => {
      const v = YK.lenis ? Math.abs(YK.lenis.velocity || 0) : 0;
      const sp = isSp() ? 0.28 : 0.6 + v * 0.5;
      tracks.forEach((t, i) => {
        const w = t.scrollWidth / 2;
        if (!w) return;
        off[i] = (off[i] + sp) % w;
        t.style.transform = `translateX(${i % 2 === 0 ? -off[i] : off[i] - w}px)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
