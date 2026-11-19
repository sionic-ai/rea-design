// 100-year history — the original fetches history.json and draws four cells, and at 1025px and up moves all four together with the wheel, while
// Each cell stops at the next year’s head and waits for the rest (if all four share a year, the year label changes). Below that width, one cell at a time by tab.
(() => {
  const BASE = 1925, LAST = 2026;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const secs = $$(".kd-hist-sec"), bodies = secs.map((s) => $(".body", s));
  const PHOTO = ["Front of an old school building, black-and-white photo · clear day · landscape 3:2", "Black-and-white graduate group photo · indoor · landscape 3:2", "Color photo of a sports match · stadium · landscape 3:2", "Campus street color photo · daytime · landscape 3:2"];
  bodies.forEach((b, c) => {
    let html = "";
    for (let y = BASE; y <= LAST; y++) {
      const has = (c === 0 && y === BASE) || (c === 2 && y === BASE) || ((y * 7 + c * 13) % 6 === 0);
      if (!has) { html += `<div class="kd-year no-data"><p class="yt">${y}<span>Year</span></p></div>`; continue; }
      const n = (y + c) % 3 === 0 ? 2 : 1;
      let items = "";
      for (let i = 0; i < n; i++) items += `<div class="item"><p>$ here{secs[c].dataset.kind} Work one-liner | ${i ? "Addendum" : "Founding"}</p>${(y + i + c) % 2 === 0 ? `<div class="wf-img wf-r-3x2" data-label="${PHOTO[c]}"></div>` : ""}</div>`;
      html += `<div class="kd-year"><p class="yt">${y}<span>Year</span></p>${items}</div>`;
    }
    b.innerHTML = html;
  });

  const cur = $(".js-cur"), up = $(".js-up"), down = $(".js-down"), drop = $(".kd-decade__drop"), parent = $(".kd-decade");
  const area = $(".kd-hist-area"), loader = $(".kd-loader"), notes = $(".kd-notes");
  const indexLength = bodies[0].childElementCount - 1;
  const reveal = () => { loader.classList.add("is-hidden"); area.classList.remove("is-hidden"); notes.classList.remove("is-hidden"); };

  // ───── PC: four-column interlock (original class wd) ─────
  const S = { scrolls: [0, 0, 0, 0], currentIndex: 0, bodyIdx: [0, 0, 0, 0], posY: [[], [], [], []], limited: [0, 0, 0, 0], isStop: [false, false, false, false], readyTop: true };
  const baseH = () => area.getBoundingClientRect().y + $(".ttl", secs[0]).getBoundingClientRect().height;
  const setPosY = () => bodies.forEach((b, t) => { S.posY[t] = $$(".kd-year", b).map((n) => n.getBoundingClientRect().y - baseH()); });
  const getLimited = () => bodies.forEach((b, t) => { S.limited[t] = b.getBoundingClientRect().height - area.getBoundingClientRect().height + $(".ttl", secs[0]).getBoundingClientRect().height; });
  const paint = () => bodies.forEach((b, t) => { b.style.transform = `translateY(${-S.scrolls[t]}px)`; });
  function handleCurrent() {
    const e = [];
    for (let t = 0; t < 4; t++) if (!S.isStop[t]) e.push(S.bodyIdx[t]);
    if (e.length > 0) { if (e.every((t) => t === e[0])) { S.currentIndex = e[0]; cur.textContent = S.currentIndex + BASE; } }
    else document.body.classList.remove("is-fixed");
  }
  function decadeBtn() {
    S.bodyIdx.fill(S.currentIndex);
    handleCurrent();
    cur.textContent = S.currentIndex + BASE;
    bodies.forEach((b, t) => { const r = S.posY[t][S.bodyIdx[t]]; S.scrolls[t] = r > S.limited[t] ? S.limited[t] : r; });
    paint();
  }
  function onWheel(ev) {
    const d = ev.deltaY;
    if (d > 0) {
      bodies.forEach((b, n) => {
        if (S.isStop[n]) return;
        const i = S.scrolls[n] + d;
        if (S.limited[n] < i) { S.isStop[n] = true; S.scrolls[n] = S.limited[n]; b.style.transform = `translateY(${-S.scrolls[n]}px)`; handleCurrent(); return; }
        const o = S.posY[n][S.bodyIdx[n] + 1];
        if (S.currentIndex === S.bodyIdx[n] || S.currentIndex === S.bodyIdx[n] + 1) {
          S.scrolls[n] = i;
          if (i >= o) { if (S.bodyIdx[n] < indexLength) S.bodyIdx[n]++; S.scrolls[n] = o; handleCurrent(); }
          b.style.transform = `translateY(${-S.scrolls[n]}px)`;
        }
      });
    } else {
      bodies.forEach((b, n) => {
        const i = S.scrolls[n] + d, o = S.bodyIdx[n] !== 0 ? S.posY[n][S.bodyIdx[n]] : 0;
        if (S.currentIndex === S.bodyIdx[n] || S.currentIndex === S.bodyIdx[n] - 1) {
          S.isStop[n] = false;
          S.scrolls[n] = i <= 0 ? 0 : i;
          if (!document.body.classList.contains("is-fixed") && S.readyTop) {
            S.readyTop = false;
            gsap.to(window, { duration: .2, scrollTo: { y: 0, autoKill: false }, onComplete: () => { document.body.classList.add("is-fixed"); S.readyTop = true; } });
          }
          if (i <= o) { S.bodyIdx[n] = S.bodyIdx[n] <= 0 ? 0 : S.bodyIdx[n] - 1; S.scrolls[n] = o >= S.limited[n] ? S.limited[n] : o; handleCurrent(); }
          b.style.transform = `translateY(${-S.scrolls[n]}px)`;
        }
      });
    }
  }
  const step = (e) => { if (S.currentIndex + e >= 0 && S.currentIndex + e <= indexLength) { S.currentIndex += e; if (e < 0) S.isStop.fill(false); decadeBtn(); } };

  // ───── Below 1024px: single column + window scroll ─────
  let active = 0;
  const spYear = () => {
    const top = $(".kd-hist-switch").getBoundingClientRect().bottom + 4;
    const ys = $$(".kd-year", bodies[active]);
    let k = 0;
    ys.forEach((y, i) => { if (y.getBoundingClientRect().top <= top) k = i; });
    cur.textContent = BASE + k;
    S.currentIndex = k;
  };
  const spGo = (k) => {
    const y = $$(".kd-year", bodies[active])[Math.max(0, Math.min(indexLength, k))];
    if (!y) return;
    const off = $(".kd-hist-switch").getBoundingClientRect().bottom - 10;
    gsap.to(window, { duration: .6, scrollTo: { y: y.getBoundingClientRect().top + scrollY - off, autoKill: false }, ease: "power2.inOut" });
  };
  $$(".kd-hist-switch button").forEach((b) => b.addEventListener("click", () => {
    active = +b.dataset.i;
    $$(".kd-hist-switch button").forEach((x) => x.classList.toggle("is-active", x === b));
    secs.forEach((s, i) => s.classList.toggle("is-active", i === active));
    spGo(S.currentIndex);
  }));

  const pc = matchMedia("(min-width: 1025px)");
  const isPc = () => pc.matches;
  function initPc() {
    Object.assign(S, { scrolls: [0, 0, 0, 0], currentIndex: 0, bodyIdx: [0, 0, 0, 0], limited: [0, 0, 0, 0], isStop: [false, false, false, false], readyTop: true });
    bodies.forEach((b) => { b.style.transform = "translateY(0)"; });
    scrollTo(0, 0);
    document.body.classList.add("is-fixed");
    setPosY(); getLimited(); decadeBtn();
    addEventListener("wheel", onWheel);
  }
  function initSp() {
    removeEventListener("wheel", onWheel);
    document.body.classList.remove("is-fixed");
    bodies.forEach((b) => { b.style.transform = ""; });
    addEventListener("scroll", spYear, { passive: true });
    spYear();
  }
  function mode() { if (isPc()) { removeEventListener("scroll", spYear); initPc(); } else initSp(); }
  up.addEventListener("click", () => (isPc() ? step(-1) : spGo(S.currentIndex - 1)));
  down.addEventListener("click", () => (isPc() ? step(1) : spGo(S.currentIndex + 1)));
  parent.addEventListener("mouseenter", () => drop.classList.add("is-show"));
  parent.addEventListener("mouseleave", () => drop.classList.remove("is-show"));
  $(".kd-decade__btns .cur").addEventListener("click", () => { if (!isPc()) drop.classList.toggle("is-show"); });
  $$("button", drop).forEach((b) => b.addEventListener("click", () => {
    const k = +b.dataset.year - BASE;
    if (isPc()) step(k - S.currentIndex); else spGo(k);
    drop.classList.remove("is-show");
  }));
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); const keep = S.currentIndex; rt = setTimeout(() => { mode(); if (isPc() && keep) step(keep); }, 100); });
  pc.addEventListener("change", mode);
  document.fonts.ready.then(() => { mode(); reveal(); });
})();
