// Home page: like the original, one scroll slot drives every scene each frame (card ring, ruled table, people, case names, big words, end ring).
// Length is measured in 1400-wide design pixels (u), and positions tied to the screen height (H) keep the original ratios
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const cubicInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const mm = gsap.matchMedia();
  let reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  mm.add("(prefers-reduced-motion: reduce)", () => { reduce = true; root.classList.add("still"); return () => { reduce = false; root.classList.remove("still"); }; });

  // Rule-line group: data-n lines at data-step intervals
  $$(".rules[data-n]").forEach((r) => { r.innerHTML = Array.from({ length: +r.dataset.n }, (_, i) => `<i style="top:calc(${i * r.dataset.step} * var(--u))"></i>`).join(""); });
  const fan = $$(".fan i");

  // Big wordmark: each letter rises from the bottom of the screen, delayed 200ms + 50ms per letter (.6s)
  const h1 = $(".ttl .h1"), word = h1.textContent;
  h1.setAttribute("aria-label", word);
  h1.innerHTML = [...word].map((c, i) => `<span class="ch" aria-hidden="true" style="animation-delay:${200 + 50 * i}ms">${c}</span>`).join("");
  const chars = $$(".ch", h1);

  // Case name: split per letter — rising in one by one on entry, and the fill spreads 45ms later per letter
  $$(".partner .pf").forEach((pf) => { const t = pf.textContent; pf.setAttribute("aria-label", t); pf.innerHTML = [...t].map((c, i) => `<span class="c" aria-hidden="true" style="--i:${i}">${c}</span>`).join(""); });
  const partners = $$(".partner"), pfs = partners.map((p) => $(".pf", p)), plab = $(".plab"), pnames = $(".pnames");

  // Table text: measure lines by word and put each into a mask — when the table opens, lines rise from their own line
  const rts = $$(".s2 .rt"), nums = $$(".s2 .num");
  function splitLines(p) {
    const t = p.dataset.text || (p.dataset.text = p.textContent.trim());
    p.innerHTML = t.split(" ").map((w) => `<span style="white-space:nowrap">${w}</span>`).join(" ");
    const rows = [];
    [...p.children].forEach((s) => { const top = s.offsetTop; rows.length && rows[rows.length - 1].top === top ? rows[rows.length - 1].w.push(s.textContent) : rows.push({ top, w: [s.textContent] }); });
    p.innerHTML = rows.map((r) => `<span class="ln"><span class="li">${r.w.join(" ")} </span></span>`).join("");
    return rows.length;
  }

  const hcs = $(".hcs"), cards = $$(".hc"), nav = $(".hero > .nav"), snd = $(".snd"), tag = $(".tagline"), mid = $(".midstrip"), ct = $(".ct");
  const ttl = $(".ttl"), s2 = $(".s2"), s3 = $(".s3"), gray = $(".gray"), grayPh = $(".gray-ph"), card2 = $$(".card2"), rest = $(".rest");
  const gymEl = $(".gym"), cases = $$(".case"), forms = $(".forms"), bigrows = $$(".bigrow"), morph = $(".morph path"), fin = $(".fin"), bars = $$(".bar"), tail = $(".tail");
  const state = cards.map((c, i) => ({ el: c, x: +c.style.getPropertyValue("--x"), h: +c.style.getPropertyValue("--h"), grow: reduce ? 1 : 0, i }));
  let U = 1, H = innerHeight, M = 0, L = 1, s2Top = 0, s3Top = 0, restTop = 0, navW = 0, lab = { w: 0 }, pw = [], bw = [];
  let introDone = reduce, gym = null;
  const once = new Set();

  function measure() {
    U = root.clientWidth / 1400; H = innerHeight;
    root.style.setProperty("--W", root.clientWidth + "px");
    // Wordmark: cap height set to the original ratio (.69 of font size), and the leftover width stretched horizontally to fill the 1360u between the margins.
    // Uppercase baseline is fitted to the box bottom — each typeface has different top and bottom padding, so left alone the letters drop off-screen
    h1.style.setProperty("--fit", 1);
    h1.style.setProperty("--stretch", 1);
    const fam = getComputedStyle(h1).fontFamily, ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `100px ${fam}`;
    const mH = ctx.measureText("H"), capR = (mH.actualBoundingBoxAscent || 70) / 100;
    const fit = .69 / capR;
    h1.style.setProperty("--fit", fit.toFixed(4));
    const range = document.createRange(); range.selectNodeContents(h1);
    const natural = range.getBoundingClientRect().width;
    h1.style.setProperty("--stretch", ((1360 * U) / Math.max(1, natural)).toFixed(4));
    const fs = parseFloat(getComputedStyle(h1).fontSize), LH = 182.6 * U;
    const A = (mH.fontBoundingBoxAscent || 90) / 100 * fs, D = (mH.fontBoundingBoxDescent || 25) / 100 * fs;
    h1.style.translate = `0 ${(LH - ((LH - (A + D)) / 2 + A)).toFixed(1)}px`;
    // Center line: midpoint between the card bottom and the top of the wordmark capitals (same spot as the original calculation)
    const capTop = H - 21.7 * U - capR * fs, cardBot = (20 + Math.max(...state.map((s) => s.h))) * U;
    const capMid = capTop + 15 * U;
    M = capMid > cardBot ? (cardBot + capMid) / 2 : .44 * H;
    mid.style.top = M + "px";
    // Table text: 01 starts at 196u, and the next row is (row count + 4) × 18u below
    let t = 196;
    rts.forEach((p, k) => {
      const n = splitLines(p);
      p.style.top = t * U + "px"; nums[k].style.top = t * U + "px"; t += (n + 4) * 18;
      if (!reduce && !once.has("rt" + k)) gsap.set($$(".li", p), { yPercent: 100, opacity: 0 });
    });
    // Paper card: sets the second paragraph, name and title onto the 18u ruled lines to fit the text length
    card2.forEach((c) => {
      const rows = $$(".row", c), p1 = rows[0].querySelector("p"), p2 = rows[1].querySelector("p");
      const r2 = 22 + 18 * (Math.round(p1.offsetHeight / U / 18) + 3);
      rows[1].style.top = r2 * U + "px";
      const bottom = r2 + 18 + p2.offsetHeight / U + 18, extra = Math.max(0, 18 * Math.ceil((bottom + 18 - 256) / 18));
      $(".name", c).style.top = (256 + extra) * U + "px";
      $(".cmark", c).style.top = (230 + extra) * U + "px";
      $(".cf", c).style.top = (339 + extra) * U + "px";
      c.lastElementChild.style.top = (339 + extra) * U + "px";
      c.style.height = (375 + extra) * U + "px";
    });
    // Photo: a 2:1 board centered in a block 580u high
    const ph = root.clientWidth * 850 / 1680;
    grayPh.style.height = ph + "px";
    grayPh.style.bottom = "auto";
    grayPh.style.top = 580 * U - ph / 2 + "px";
    s2Top = s2.offsetTop; s3Top = s3.offsetTop; restTop = rest.offsetTop;
    L = s2Top + 34 * U - M;
    ttl.style.height = (s2Top / U + 880 + 182.6) * U + "px";
    navW = nav.offsetWidth;
    pw = partners.map((p) => $(".pf", p).offsetWidth);
    lab.w = plab.scrollWidth ? measureText(plab) : 0;
    bw = bigrows.map((b) => ({ left: b.offsetLeft, w: b.offsetWidth }));
    // End: tail adjusted so scrolling stops where the gray band’s first line reaches 20u above
    tail.style.height = "0px";
    const barTop = bars[0].getBoundingClientRect().top + scrollY - 20 * U, max = root.scrollHeight - H;
    tail.style.height = Math.max(0, Math.round(barTop - max)) + "px";
    tick(true);
  }
  function measureText(el) { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; }

  // Clay mark: round clay imprint beside the paper card name
  function clayMarks() {
    if (!window.kfClay) return;
    const ink = getComputedStyle(root).getPropertyValue("--kf-ink").trim();
    $$(".cmark").forEach((c) => {
      const dpr = Math.min(2, devicePixelRatio || 1), w = c.clientWidth * dpr, h = c.clientHeight * dpr;
      if (!w || !h) return;
      c.width = w; c.height = h;
      const g = c.getContext("2d"), s = kfClay.stamp(w * .38, h * .4, ink, dpr, "loop");
      g.drawImage(s, (w - s.width) / 2, (h - s.height) / 2);
    });
  }

  function play(key, fn) { if (once.has(key)) return; once.add(key); fn(); }
  let lastS = -1, active = -1, inkOn = false;

  function tick(force) {
    const s = scrollY;
    if (!force && s === lastS) return;
    const dir = s - lastS;
    lastS = s;

    // Menu, sound, and one-line intro: rise with the page from 12u below the center line and stick at 20u above
    const rise = Math.max(20 * U, M + 12 * U - s);
    nav.style.top = snd.style.top = tag.style.top = rise + "px";
    const navX = lerp(941 * U, 1265 * U - navW, outCubic(clamp(s / L)));
    nav.style.left = navX + "px";
    ct.classList.toggle("on", M + 12 * U - s <= 20 * U + .5);
    tag.classList.toggle("off", s3Top - s < H * .5);

    // Work card: line → cylinder ring (first 55%) → flattens down onto the center rule (last 45%)
    const pr = reduce ? 1 : inOut(clamp(s / (L * .55))), pl = reduce ? 1 : inOut(clamp((s - L * .55) / (L * .45)));
    hcs.classList.toggle("away", s > 4);
    state.forEach((c) => {
      const w = 210.2 * U, h = lerp(10, c.h, c.grow) * U;
      const th = (c.i * 60 + 200 + pr * 70) * Math.PI / 180, R = 420 * U;
      const rx = 700 * U + R * Math.sin(th) - w / 2, rz = R * (Math.cos(th) - 1), ry = M - 120 * U - h / 2 + [0, 10, -12, -16, 12, 18][c.i] * U;
      let x = lerp(c.x * U, rx, pr), y = lerp(20 * U - s, ry, pr), z = lerp(0, rz, pr), turn = lerp(0, th * 180 / Math.PI - 360, pr), tilt = lerp(0, [0, -5, 4, -3, 6, -4][c.i], pr), sc = lerp(1, 1.35, pr), sy = 1, dim = pr * (1 - pl) * (1 - Math.cos(th)) / 2;
      if (pl > 0) {
        x = lerp(x, c.x * U, pl); y = lerp(y, M - h / 2, pl); z = lerp(z, 0, pl); turn = lerp(turn, 0, pl); tilt = lerp(tilt, 0, pl); sc = lerp(sc, 1, pl); sy = lerp(1, 1 / Math.max(h, 1), pl);
      }
      c.el.style.height = h + "px";
      c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${turn.toFixed(2)}deg) rotateZ(${tilt.toFixed(2)}deg) scale(${sc.toFixed(3)},${(sc * sy).toFixed(4)})`;
      c.el.style.opacity = pl >= 1 ? 0 : 1;
      c.el.style.filter = dim > .01 ? `brightness(${(1 - .2 * dim).toFixed(3)})` : "";
    });
    mid.style.opacity = s >= L ? 0 : 1;

    // Table: on landing the first row stays as the center line, the rows below are drawn like stairs, shortest first
    const q = reduce ? 1 : clamp((s - L) / (.9 * H));
    fan.forEach((ln, i) => { ln.style.transform = `scaleX(${i === 0 ? (s >= L || reduce ? 1 : 0) : clamp(3.1 * q - i * .045).toFixed(3)})`; });
    if (q > 0) rts.forEach((p, k) => { if (q > .02 + k * .1) play("rt" + k, () => { gsap.to($$(".li", p), { yPercent: 0, opacity: 1, duration: .9, ease: "power3.out", stagger: .09 }); gsap.to(nums[k], { opacity: .3, duration: .9, ease: "power3.out" }); }); });

    // Wordmark: as the gray section approaches, letters drop down starting from the right
    const unstick = ttl.offsetHeight - H + 21.7 * U, dq = clamp((s - (unstick - .35 * H)) / (.6 * H)), N = chars.length;
    chars.forEach((ch, i) => {
      const k = clamp(dq * (N + 2) - (N - 1 - i));
      ch.style.translate = k ? `0 ${(k * 60).toFixed(1)}%` : "";
      ch.style.opacity = k ? (1 - k).toFixed(3) : "";
    });

    // Three people: after landing they float at the center of the table, stay at 39% of the screen, then settle into the bowl positions of the About section
    if (gym || gymEl) {
      const show = s >= L * .98 || reduce;
      const potY = restTop + (272.25 + 78.75) * U, hold = .39 * H;
      const cy = Math.min(hold, potY - s), cx = 700 * U;
      gymEl.style.transform = `translate(${(cx - gymEl.offsetWidth / 2).toFixed(1)}px,${(cy - gymEl.offsetHeight / 2).toFixed(1)}px)`;
      gymEl.style.opacity = show ? 1 : 0;
      if (show && gym && cy > -H * .2 && cy < H * 1.2) gym.draw(.22 * Math.max(0, s - .85 * L));
    }

    // Two people: the photo moves slower than the page (.32), and paper cards descend at different speeds and sit on top of the photo
    const rel = s - s3Top;
    grayPh.style.transform = `translateY(${(40 * U + rel * .32 - (580 * U - grayPh.offsetHeight / 2)).toFixed(1)}px)`;
    card2[0].style.transform = `translateY(${(279 * U + rel * .31).toFixed(1)}px) rotateX(${(clamp(-rel / H, -1, 1) * 6).toFixed(2)}deg)`;
    card2[1].style.transform = `translateY(${(398 * U + rel * .16).toFixed(1)}px) rotateX(${(clamp(-rel / H, -1, 1) * 5).toFixed(2)}deg)`;

    // Case name: as it approaches it sticks to the right end, and from 230u on screen it follows until the last case passes
    const T0 = restTop + 423 * U, pinTop = 230 * U, sy0 = T0 - s;
    if (sy0 < H * .9) play("names", () => {
      partners.forEach((p, k) => gsap.to($$(".c", p), { yPercent: 0, opacity: 1, duration: .9, ease: "power3.out", stagger: .03, delay: k * .1 }));
      partners.forEach((p) => p.classList.add("ink"));
    });
    const held = clamp(pinTop - sy0, 0, 2406 * U);
    const shift = reduce ? 1 : outCubic(clamp(1 - (sy0 - pinTop) / (260 * U)));
    pnames.style.transform = `translateY(${held.toFixed(1)}px)`;
    partners.forEach((p, k) => { pfs[k].style.transform = `translate(${(shift * (1380 * U - (700 * U + pw[k] / 2))).toFixed(1)}px,${(shift * (-22.6 - 32 * k) * U).toFixed(1)}px) scale(${lerp(1, .73, shift).toFixed(4)})`; });
    plab.style.transform = `translateX(${(shift * (1380 * U - (700 * U + lab.w / 2))).toFixed(1)}px)`;
    let a = 0;
    cases.forEach((c, k) => { if (restTop + c.offsetTop - s < H * .6) a = k; });
    const sorted = shift > .5;
    if (sorted !== inkOn || a !== active) {
      inkOn = sorted; active = a;
      if (once.has("names")) partners.forEach((p, k) => p.classList.toggle("ink", !sorted || k === a));
    }

    // Three big words: on entering they gather 40% toward the center, then spread to place, and the center vessel line changes shape
    const fy = forms.getBoundingClientRect().top, fp = reduce ? 0 : clamp((fy - H * .15) / (H * .6));
    bigrows.forEach((b, k) => { const d = .4 * (700 * U - (bw[k].left + bw[k].w / 2)); b.style.transform = `translateX(${(fp * d).toFixed(1)}px)`; });
    if (fy < H * 1.2 && fy > -H) morph.setAttribute("d", window.dhVessel(clamp((H - fy) / (H + 480 * U)) * 2.999));

    // End loop: when the gray band reaches 20u above, it returns to the start and the band grows into a card
    const max = root.scrollHeight - H;
    if (introDone && !reduce && dir > 0 && s >= max - 1 && max > H) restart();
  }

  // Six cards grow from the strip (10u) to their own height — starting after 150ms, 90ms apart, .6s each. Scrolling is locked meanwhile
  function intro() {
    introDone = false;
    window.dhLock(true);
    state.forEach((c) => gsap.fromTo(c, { grow: 0 }, { grow: 1, duration: .6, ease: "power3.out", delay: .15 + c.i * .09, onUpdate: () => tick(true) }));
    gsap.delayedCall(1.2, () => { introDone = true; window.dhLock(false); tick(true); });
  }
  function restart() {
    introDone = false;
    window.lenis ? window.lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
    scrollTo(0, 0);
    chars.forEach((ch) => { ch.style.translate = ""; });
    intro();
  }

  // Card: only at the very top, hovering reveals the interior photo and name
  cards.forEach((c) => {
    c.addEventListener("pointerenter", () => { if (scrollY < 4) c.classList.add("hov"); });
    c.addEventListener("pointerleave", () => c.classList.remove("hov"));
  });
  addEventListener("scroll", () => { if (scrollY >= 4) cards.forEach((c) => c.classList.remove("hov")); }, { passive: true });

  // Pressing a menu or Work name slides to that spot (1.2~2.6s long, cubic in-out — original values)
  function glide(y) {
    const d = Math.min(2.6, 1.2 + Math.abs(y - scrollY) / H * .18);
    if (window.lenis) window.lenis.scrollTo(y, { duration: d, easing: cubicInOut, force: true });
    else scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  $$('.nav a[href^="#"], .more-link').forEach((a) => a.addEventListener("click", (e) => {
    const t = $(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    glide(t.getBoundingClientRect().top + scrollY - 52 * U);
  }));
  partners.forEach((p, k) => $(".pf", p).addEventListener("click", () => { const pic = $(".pic", cases[k]); glide(pic.getBoundingClientRect().top + scrollY - (H - pic.offsetHeight) / 2); }));

  // Award list: when visible, rules are drawn from the left and each line’s text fades in .12s later
  const aw = $(".aw");
  $$("li", aw).forEach((li, i) => li.style.setProperty("--i", i));
  new IntersectionObserver(([e]) => { if (e.isIntersecting) aw.classList.add("on"); else if (e.boundingClientRect.top > 0) aw.classList.remove("on"); }, { rootMargin: "0px 0px -12% 0px" }).observe(aw);

  // Past events: each row rises and appears / End: the hand drawing gets drawn
  const years = $$(".years li");
  const yio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    yio.unobserve(e.target);
    gsap.to(e.target, { opacity: 1, y: 0, duration: .9, ease: "power3.out" });
  }), { rootMargin: "0px 0px -10% 0px" });
  years.forEach((li) => yio.observe(li));
  new IntersectionObserver(([e]) => fin.classList.toggle("on", e.isIntersecting), { rootMargin: "0px 0px -15% 0px" }).observe(fin);

  // Video: on hover the cursor becomes a Play label and follows along
  const film = $(".sfilm"), pc = $(".playcur");
  film.addEventListener("pointermove", (e) => { pc.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; pc.classList.add("on"); });
  film.addEventListener("pointerleave", () => pc.classList.remove("on"));
  film.addEventListener("click", () => film.classList.toggle("playing"));

  // Case·category cover: the page recedes to .12 (.5s) and the veil covers to .86, while the pressed photo flies to the large left frame in 1s power3.inOut.
  // Text rises line by line from .6s, the name letter by letter from .95s, and a strip of small photos enters from 70u to the right from 1.35s. Closing rewinds at 1.7x
  const ov = $("#caseView"), cdPic = $(".cd-pic", ov), cdAlt = $(".cd-alt", ov), cdCap = $(".cd-cap p", ov), cdA = $(".cd-a", ov), cdB = $(".cd-b", ov), cdName = $(".cd-name", ov), cdTrack = $(".cd-track", ov);
  const cx = $(".cx"), cc = $(".close-cursor:not(.more-cursor)"), more = $(".more-cursor");
  // Split cursor label letters — each letter bobs up and down 60ms later
  [cc, more].forEach((el) => {
    const svg = el.querySelector("svg"), t = el.firstChild.textContent;
    el.firstChild.replaceWith(...[...t].map((ch, i) => Object.assign(document.createElement("span"), { className: "lt", textContent: ch, style: `--i:${i}` })));
    svg.style.setProperty("--i", t.length);
  });
  [cc, more].forEach((el) => el.classList.add("gone"));
  const label = (el, on) => {
    if (on) { el.classList.add("on"); el.classList.remove("gone"); }
    else el.classList.add("gone");
  };
  const follow = (el, e) => { el.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; };
  $$(".pic").forEach((p) => {
    p.addEventListener("pointerenter", (e) => { if (!view) { follow(more, e); label(more, true); } });
    p.addEventListener("pointermove", (e) => follow(more, e));
    p.addEventListener("pointerleave", () => label(more, false));
  });
  let view = null;
  function openView(src, d) {
    if (view) return;
    const r = src.getBoundingClientRect();
    cdPic.dataset.label = d.label;
    cdPic.classList.add("wf-img");
    cdCap.textContent = d.cap; cdA.textContent = d.a; cdB.textContent = d.b;
    cdName.textContent = d.name;
    cdTrack.innerHTML = d.thumbs.map((t) => `<i class="cd-s ph wf-img" data-label="${t}"></i>`).join("");
    root.classList.add("case-open");
    ov.classList.add("open"); ov.setAttribute("aria-hidden", "false");
    window.dhLock(true);
    label(more, false);
    src.style.visibility = "hidden";
    const tl = gsap.timeline({ onReverseComplete() { src.style.visibility = ""; ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true"); root.classList.remove("case-open"); window.dhLock(false); label(cc, false); view = null; } });
    tl.to([".page", ".hcs"], { opacity: .12, duration: .5, ease: "power2.out" }, 0)
      .fromTo($(".ov-scrim", ov), { opacity: 0 }, { opacity: .86, duration: .5, ease: "power2.out" }, 0)
      .fromTo(cdPic, { left: r.left, top: r.top, width: r.width, height: r.height }, { left: 20 * U, top: 20 * U, width: 900 * U, height: 563 * U, duration: 1, ease: "power3.inOut" }, .05)
      .fromTo($$(".cd-cap .rules i", ov), { scaleX: 0 }, { scaleX: 1, duration: .9, ease: "power3.out", stagger: .08 }, .55)
      .fromTo(cdCap, { y: 20 * U, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: "power3.out" }, .6)
      .fromTo(cdName, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8, ease: "power3.out" }, .95)
      .fromTo(cdA, { y: 20 * U, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: "power3.out" }, .95)
      .fromTo(cdB, { y: 20 * U, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: "power3.out" }, 1.15)
      .fromTo($$(".cd-s", cdTrack), { autoAlpha: 0, x: 70 * U }, { autoAlpha: 1, x: 0, duration: .8, ease: "power3.out", stagger: .08 }, 1.35);
    if (reduce) tl.progress(1);
    view = { close() { tl.timeScale(1.7).reverse(); if (reduce) tl.progress(0); } };
  }
  const closeView = () => view && view.close();
  cases.forEach((c, k) => $(".pic", c).addEventListener("click", (e) => {
    e.stopPropagation();
    openView($(".pic", c), { name: pfs[k].getAttribute("aria-label"), label: $(".pic", c).dataset.label, cap: $(".cap p", c).textContent, a: "Case location in one line — which city, what shop.", b: "Your two lines here describing the work created for this space.", thumbs: ["Interior view · 4:3", "Artwork close-up · 4:3", "Work process · 4:3", "Another angle · 4:3", "From the guest’s seat · 4:3"] });
  }));
  cards.forEach((c) => c.addEventListener("click", (e) => {
    e.preventDefault();
    if (scrollY > 4) return;
    openView(c, { name: $(".hc-lab", c).textContent, label: c.dataset.label, cap: "Introduce the works in this category here in two lines.", a: "Your category line here", b: "Your two lines here on the material and size of the variant.", thumbs: ["Work one cutout · 4:3", "Piece two cutout · 4:3", "Piece three cutout · 4:3", "Piece four cutout · 4:3", "Work five cutout · 4:3"] });
  }));
  cx.addEventListener("click", (e) => { e.preventDefault(); closeView(); });
  ov.addEventListener("click", (e) => { if (!e.target.closest(".cd-s")) closeView(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeView(); });
  addEventListener("pointermove", (e) => {
    if (!view) return;
    follow(cc, e);
    if (!cc.classList.contains("on")) label(cc, true);
    cc.classList.toggle("away", !!e.target.closest(".cd-s, .cx"));
  }, { passive: true });
  cdTrack.addEventListener("pointerover", (e) => { const s = e.target.closest(".cd-s"); if (!s) return; cdAlt.dataset.label = s.dataset.label; cdAlt.classList.add("on"); });
  cdTrack.addEventListener("pointerout", (e) => { if (e.target.closest(".cd-s") && !e.relatedTarget?.closest?.(".cd-s")) cdAlt.classList.remove("on"); });

  measure();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { measure(); clayMarks(); });
  let rz = 0;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(measure, 120); });
  gsap.ticker.add(() => tick(false));
  if (!reduce) {
    gsap.set($$(".partner .c"), { y: 0, yPercent: 60, opacity: 0 });
    gsap.set(nums, { opacity: 0 });
    gsap.set(years, { opacity: 0, y: 30 * U });
  }
  if (window.dhGym) gym = window.dhGym(gymEl);
  scrollTo(0, 0);
  if (reduce) { introDone = true; tick(true); }
  else (window.dhPreDone || Promise.resolve()).then(intro);
})();
