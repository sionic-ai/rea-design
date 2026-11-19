// Home page — 11s opening overlay (year roll · five old photos · giant wordmark · video unfolding from a box · tagline), a red About section, and cards that stick to the screen and stack over each other.
// Timeline exactly as the original: wordmark 1s · year and photo 1.5s · video 9s · tagline 8.75s · button 11.25s.
(() => {
  const S = window.mpSite, lg = S.lg, reduce = S.reduce;
  const kv = document.querySelector(".kv");
  const items = [...kv.querySelectorAll(".kv-img > .item")];
  const fix = items.pop();
  const yc = kv.querySelector(".kv-year .container");
  const loopInner = kv.querySelector(".kv-loop .inner"), loopTg = loopInner.querySelector(".tg"), loopOrg = loopTg.querySelector(".g");
  const title = kv.querySelector(".kv-title .container");
  const scrollBtn = kv.querySelector(".kv-scroll"), skipBtn = kv.querySelector(".kv-skip");
  const reserveBtns = [...document.querySelectorAll(".mp-reserve > *")];
  const hd = document.querySelector(".mp-header");
  const css = getComputedStyle(document.documentElement);
  const C0 = gsap.utils.splitColor(css.getPropertyValue("--kf-ink").trim()), C1 = gsap.utils.splitColor(css.getPropertyValue("--kf-bg").trim());
  const map = (v, a, b, i0, i1) => a + (b - a) * gsap.utils.clamp(0, 1, (v - i0) / (i1 - i0));

  // On phone the video box stands at .72 wide · .48 tall
  if (!lg()) fix.setAttribute("data-fx-dome-clip-reveal", "look: box; on: manual; w: .72; h: .48; dur: 2; ease: power3.inOut; lag: .1; scale: 1");
  for (let i = 0; i < 5; i++) loopTg.append(loopOrg.cloneNode(true));

  // Four year digit slots — each slot stacks four sets of 0–9 vertically and rolls by that height
  const digits = [...yc.querySelectorAll(".item")].map((el, id) => {
    el.innerHTML = Array.from({ length: 4 }, () => `<div class="g">${Array.from({ length: 10 }, (_, n) => `<div class="num">${n}</div>`).join("")}</div>`).join("");
    return { el, id, now: [1, 8, 9, 4][id], next: 0, rate: 0 };
  });
  const drawDigits = () => {
    const t = yc.offsetHeight;
    for (const d of digits) {
      let y = gsap.utils.interpolate(-t * d.now, -t * d.next, d.rate);
      if (y < -t * 10) y += t * 10;
      gsap.set(d.el, { y });
    }
  };

  const st = { bg: 0, loopShow: 0, loopSpeed: 0, yearScale: 0, fixScale: 0, fixOpen: 0, itemW: innerWidth };
  let loopRun = true, done = false, fixedUI = false;
  const paintBg = () => {
    const k = map(st.bg, 0, 1, 0.5, 1);
    kv.style.backgroundColor = `rgb(${C0.map((c, i) => Math.round(c + (C1[i] - c) * k)).join(",")})`;
  };
  let loopX = lg() ? -800 : -950, loopW = 0, frame = 0;
  const tick = () => {
    paintBg();
    if (loopRun) {
      if (frame++ % 60 === 0) loopW = loopOrg.offsetWidth;
      loopX -= map(st.loopSpeed, 5, 2, 0, 1);
      if (loopX < -loopW) loopX += loopW;
      gsap.set(loopTg, { x: loopX - loopW, opacity: st.loopShow > 0.1 ? 1 : 0 });
    }
    gsap.set(yc, { scale: map(st.yearScale, 0.8, 1.15, 0, 1) });
    drawDigits();
    // Video slot: at the top it is screen width − side margins, once scrolled down 1/4 of the screen it is full width (follows 20% per frame)
    const edge = innerWidth * (lg() ? 30 / 1440 : 20 / 375) * (lg() ? 2 : 1);
    const wTarget = map(scrollY, innerWidth - edge, innerWidth, 0, innerHeight * 0.25);
    st.itemW += (wTarget - st.itemW) * 0.2;
    gsap.set(fix, { width: st.itemW, opacity: done ? 1 : map(st.fixOpen, 0, 1, 0, 0.1) });
    gsap.set(fix.querySelector(".tg"), { scale: map(st.fixScale, lg() ? 0.72 : 0.72, 1, 0, 1) });
    if (fixedUI) {
      const y = scrollY, vh = innerHeight;
      gsap.set(title, { y: map(y, 0, -50, 0, vh * 0.75), opacity: map(y, 1, 0, vh * 0.25, vh * 0.75) });
      gsap.set(scrollBtn, { y: map(y, 0, -20, 0, vh * 0.75), opacity: map(y, 1, 0, vh * 0.25, vh * 0.75) });
    }
  };
  gsap.ticker.add(tick);

  const tl = gsap.timeline({ paused: true });
  const finish = () => {
    if (done) return;
    done = true;
    loopRun = false;
    document.body.classList.remove("is-locked");
    S.headerAuto = true;
  };

  if (reduce) {
    items.forEach((it) => gsap.set(it, { display: "none" }));
    st.bg = st.fixScale = st.fixOpen = 1;
    done = fixedUI = true;
    loopRun = false;
    document.body.classList.remove("is-dark", "is-locked");
    S.setSmall(false);
    S.headerAuto = true;
    gsap.set(hd, { opacity: 1 });
    gsap.set(reserveBtns, { opacity: 1 });
    skipBtn.remove();
  } else {
    S.setSmall(true);
    S.showHeader(0.5);
    // Wordmark band — 1s: settles from 3x over 4s expo.out and is revealed by a slanted rounded mask, then flows, slowing from 5px to 2px per frame
    tl.call(() => loopInner.dispatchEvent(new CustomEvent("fx:play")), null, 1);
    tl.to(st, { loopShow: 1, duration: 2, ease: "power3.inOut" }, 1);
    tl.to(st, { loopSpeed: 1, duration: 2, ease: "power3.inOut" }, 1.5);
    // Year — rises 30px from below over 2s at 1.5s, grows .8 → 1.15x over 9s, each slot offset by .3s, rolling for 8s toward ”2042”
    tl.fromTo(yc, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out" }, 1.5);
    tl.to(yc, { opacity: 0, y: -30, duration: 1, ease: "power2.inOut" }, 1.5 + 2 + 4.6);
    tl.to(st, { yearScale: 1, duration: 9, ease: "power2.inOut" }, 1.5);
    "2042".split("").forEach((ch, s) => {
      const d = digits[s];
      let n = +ch;
      if (n === 5) n = 6;
      if (d.id === 2 && n === 0) n = 1;
      if (n < d.now) n += 10;
      if (d.id === 2) n += 20;
      if (d.id === 3) n += 30;
      d.next = n;
      tl.to(d, { rate: 1, duration: 8, ease: "power2.inOut" }, 2 + (4 - s) * 0.3);
    });
    // Background — from dark ink to paper color over 10s (the first half stays dark ink)
    tl.to(st, { bg: 1, duration: 10, ease: "power2.inOut" }, 1.5);
    // Five old photos — at 1.3s intervals they rise from the bottom of the screen tilted ±2~4° over 2s and stand, then exit upward over 2s. The inner photo conversely tilts for 4s and drifts half a screen
    items.forEach((it, i) => {
      const tg = it.querySelector(".tg"), vh = innerHeight;
      const c = gsap.utils.random(2, 4) * (i % 2 === 0 ? 1 : -1), at = 1.5 + i * 1.3;
      gsap.set(tg, { scale: 0.65 + (0.35 * i) / 5 });
      tl.fromTo(it, { y: vh, opacity: 0, rotation: c }, { y: 0, opacity: 1, rotation: 0, duration: 2, ease: "power1.inOut" }, at);
      tl.to(it, { y: -vh, rotation: -c, opacity: 0, duration: 2, ease: "power1.inOut" }, at + 2);
      tl.set(it, { display: "none" }, at + 4);
      tl.fromTo(tg, { rotation: c, y: vh * 0.5 }, { rotation: -c, y: -vh * 0.5, duration: 4, ease: "power1.inOut", immediateRender: false }, at);
    });
    // Video — 9s: head to normal and background bright, grows over 2s power3.inOut at .72x, and from 9.2s the box’s four sides swell to fill the screen
    tl.call(() => { S.setSmall(false); document.body.classList.remove("is-dark"); }, null, 9);
    tl.to(st, { fixScale: 1, duration: 2, ease: "power3.inOut" }, 9);
    tl.call(() => fix.dispatchEvent(new CustomEvent("fx:play")), null, 9.2);
    tl.to(st, { fixOpen: 1, duration: 2, ease: "power3.inOut" }, 9.2);
    // Tagline — 8.75s: sinks from 2x over 5.25s power2.out while filling with a deep rounded veil (3s expo.inOut, corners 1s later). Skip disappears in .5s
    tl.call(() => title.dispatchEvent(new CustomEvent("fx:play")), null, 8.75);
    tl.to(skipBtn, { opacity: 0, duration: 0.5, ease: "power2.out", onComplete: () => skipBtn.remove() }, 8.75);
    // 11.25s — Scroll and booking buttons rise from 100px below in 1s, and when done scrolling is unlocked
    tl.call(() => scrollBtn.classList.add("is-active"), null, 11.25);
    tl.fromTo(scrollBtn, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", onComplete: () => { fixedUI = true; } }, 11.35);
    tl.fromTo(reserveBtns, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out", onComplete: finish }, 11.25);
    // Start right after fx-core has attached the parts
    requestAnimationFrame(() => requestAnimationFrame(() => tl.play(0)));

    skipBtn.addEventListener("click", () => {
      tl.progress(1, true).kill();
      items.forEach((it) => gsap.set(it, { display: "none" }));
      gsap.set(yc.parentElement, { display: "none" });
      gsap.set(reserveBtns, { opacity: 1, y: 0 });
      gsap.set(scrollBtn, { opacity: 1, y: 0 });
      scrollBtn.classList.add("is-active");
      // Like the original skip, lift the curtain and jump to the end state — a curtain that has not opened yet is not hung again
      [title, fix, loopInner].forEach((el) => { el.style.clipPath = ""; gsap.set(el, { scale: 1 }); });
      st.bg = st.fixScale = st.fixOpen = 1;
      S.setSmall(false);
      document.body.classList.remove("is-dark");
      skipBtn.remove();
      fixedUI = true;
      finish();
    });
  }
  scrollBtn.addEventListener("click", () => {
    const o = { y: scrollY };
    gsap.to(o, { y: innerHeight, duration: 1, ease: "power2.inOut", onUpdate: () => scrollTo(0, o.y) });
  });

  // ── About: while the text block is on screen, the background takes the accent color and the header a light text. Each paragraph’s lines float up in .15s turns over 1.25s ──
  const introText = document.querySelector(".intro .text");
  new IntersectionObserver(([en]) => {
    if (!S.headerAuto) return;
    document.body.classList.toggle("is-intro", en.isIntersecting);
    document.body.classList.toggle("is-dark", en.isIntersecting);
  }, { rootMargin: lg() ? "0px" : "50% 0px 0px 0px" }).observe(introText);
  if (lg() && !reduce) document.querySelectorAll("[data-mp-lines]").forEach((p) => {
    const spans = p.querySelectorAll("span");
    gsap.set(spans, { opacity: 0.01 });
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      spans.forEach((s, i) => gsap.to(s, { opacity: 1, duration: 1.25, delay: 0.1 + i * 0.15, ease: "power1.out" }));
    });
    io.observe(p);
  });
  // Phone — ‹Keep reading› expands and collapses a 300px window in 1s power2.out
  const more = document.querySelector(".intro .more"), moreBtn = more.querySelector("button");
  if (!lg()) introText.classList.add("is-close");
  moreBtn.addEventListener("click", () => {
    const open = !more.classList.contains("is-open");
    more.classList.toggle("is-open", open);
    moreBtn.querySelector(".t").textContent = open ? "Close" : "Keep reading";
    introText.classList.toggle("is-close", !open);
    gsap.to(introText, { height: open ? introText.querySelector(".inner").offsetHeight : 300, duration: 1, ease: "power2.out" });
  });
  // Three right-hand photos — every 1/3 of the progress through the section (screen bottom → section end at screen top) the next photo pushes up from below (1s power2.inOut). On phones it rotates every 2.5s
  const imgs = [...document.querySelectorAll(".intro .img .it")].map((el) => ({ el, img: el.firstElementChild, shown: false }));
  const show = (o, on, up = false) => {
    if (o.shown === on) return;
    o.shown = on;
    const h = o.el.offsetHeight;
    if (on) { gsap.fromTo(o.el, { y: h }, { y: 0, duration: 1, ease: "power2.inOut" }); gsap.fromTo(o.img, { y: -h }, { y: 0, duration: 1, ease: "power2.inOut" }); }
    else { gsap.to(o.el, { y: up ? -h : h, duration: 1, ease: "power2.inOut" }); gsap.to(o.img, { y: up ? h : -h, duration: 1, ease: "power2.inOut" }); }
  };
  imgs.forEach((o, i) => { if (i) { gsap.set(o.el, { y: 9999 }); } });
  imgs[0].shown = true;
  const intro = document.querySelector(".intro");
  let introFrame = 0, introNow = 0;
  if (!reduce) gsap.ticker.add(() => {
    const r = intro.getBoundingClientRect(), vh = innerHeight;
    if (r.top > vh || r.bottom < 0) return;
    if (lg()) {
      const n = map(Math.abs(r.top - vh), 0, 1, 0, vh + r.height);
      imgs.forEach((o, s) => show(o, s / imgs.length < n || s === 0));
    } else if (introFrame++ % 150 === 0 && introFrame > 1) {
      introNow = (introNow + 1) % imgs.length;
      imgs.forEach((o, s) => { if (s === introNow) { o.shown = false; show(o, true); } else show(o, false, true); });
    }
  });

  // ── Room cards (phone): swipe sideways and the dot of the nearest card lights up ──
  const stayList = document.querySelector(".stay .list"), dots = [...document.querySelectorAll(".stay .dots button")];
  stayList.addEventListener("scroll", () => {
    let best = 0, dist = 1e9;
    [...stayList.children].forEach((c, i) => { const d = Math.abs(c.offsetLeft - stayList.scrollLeft - parseFloat(getComputedStyle(stayList).paddingLeft)); if (d < dist) { dist = d; best = i; } });
    dots.forEach((d, i) => d.classList.toggle("is-on", i === best));
  }, { passive: true });

  // ── Shop, wedding, banquet: over the 2 screens through the 300svh section, cards rise one by one from a screen height below and settle (progress .5), then shrink to .85x while the background fades to .5 ──
  const shop = document.querySelector(".stack");
  const cards = [...shop.querySelectorAll(".item")].map((el) => ({ el, back: el.querySelector(".back"), info: el.querySelector(".info .inner"), ttl: el.querySelector(".front .text") }));
  const drawCard = (c, rate) => {
    const vh = innerHeight;
    const k = map(rate, 0, 100, 0.5, 0.7);
    c.ttl.style.color = `color-mix(in oklab, var(--kf-ink) ${k}%, var(--site-white))`;
    gsap.set(c.back, { opacity: map(rate, 1, 0.5, 0.6, 1) });
    gsap.set(c.info, { y: map(rate, vh * 0.2, 0, 0, 0.5) });
    gsap.set(c.el, { scale: map(rate, 1, 0.85, 0.6, 1), y: map(rate, vh, 0, 0, 0.5), opacity: rate >= 0.999 ? 0 : 1 });
  };
  if (!reduce) gsap.ticker.add(() => {
    if (!lg()) { cards.forEach((c) => gsap.set([c.el, c.back, c.info], { clearProps: "transform,opacity" })); return; }
    const r = shop.getBoundingClientRect(), vh = innerHeight, h = r.height, t = r.top;
    if (t > vh || r.bottom < -vh) return;
    const n = t > 0 ? 0 : Math.min(1, Math.abs(t) / (h - vh));
    const rr = t > 0 ? 0 : map(Math.abs(t), 0, 1, h - vh, h);
    drawCard(cards[0], map(n, 0.5, 1, 0, 0.5));
    drawCard(cards[1], map(n, 0, 1, 0, 1));
    drawCard(cards[2], map(n, 0, 0.5, 0.5, 1) + map(rr, 0, 0.5, 0, 1));
  });
})();
