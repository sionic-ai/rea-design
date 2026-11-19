/* Home: typing lyrics · date cell window. Values read from the original bundle. */
window.sh.page("home", ({ on, tick }) => {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  const { reduce, sp, gridSize } = window.sh;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Breaks Hangul into jamo for the ”Reading Sound” slot — the original stamps kanji as kana first, then swaps to kanji */
  const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ", NAME = "Hangul vowels ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ", JONG = " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ";
  const jamo = (s) => [...s].map((ch) => {
    const c = ch.charCodeAt(0) - 0xac00;
    if (c < 0 || c > 11171) return ch;
    return CHO[Math.floor(c / 588)] + NAME[Math.floor((c % 588) / 28)] + JONG[c % 28].trim();
  }).join("");
  const FONTS = ["", "is-hand", "is-old", "is-bold"];
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  $$(".pickup").forEach((sec) => {
    $$(".pickup__body span", sec).forEach((s) => { const f = pick(FONTS); if (f) s.classList.add(f); });
    const spans = $$(".pickup__body--float span", sec);
    const texts = spans.map((s) => s.textContent);
    spans.forEach((s) => {
      const t = s.textContent.trim();
      s.dataset.ruby = /[가-힣]{2,}/.test(t) && Math.random() < 0.55 ? jamo(t) : "";
    });
    const title = sec.querySelector(".pickup__data").dataset.title;
    const build = () => {
      const tl = gsap.timeline({ paused: true });
      spans.forEach((s, i) => {
        const d = gsap.utils.random(0.01, 0.05, 0.01);
        if (!s.dataset.ruby) tl.fromTo(s, { text: "" }, { duration: d * texts[i].length, text: texts[i], ease: "none" });
        else {
          tl.fromTo(s, { text: "" }, { duration: d * s.dataset.ruby.length, text: s.dataset.ruby, ease: "none" });
          tl.set(s, { text: texts[i], delay: 0.1 });
        }
      });
      tl.call(() => {
        const live = $$(".pickup__body--float span", sec);
        let m = -1, g = -1;
        for (let v = 0; v < live.length && m < 0; v++) {
          let acc = "";
          for (let y = v; y < live.length; y++) {
            acc += live[y].textContent;
            if (acc === title) { m = v; g = y; break; }
            if (acc.length >= title.length) break;
          }
        }
        if (m >= 0) {
          live[m].innerHTML = `<a href="#" target="_blank" rel="noopener">${title}</a>`;
          for (let v = m + 1; v <= g; v++) live[v].remove();
        }
        gsap.to($$(".pickup__body--float span:not(:has(a))", sec), { color: window.sh.rgb("--kf-dim"), stagger: { amount: 0.5, from: "random" }, duration: 0.1 });
      });
      return tl;
    };
    if (reduce) { build().progress(1); return; }
    let tl = build();
    let st = null;
    const arm = () => (st = ScrollTrigger.create({ trigger: sec, start: "top-=20% bottom", end: "center center", once: true, animation: tl, scrub: 0.6 }));
    arm();
    // Rewind on return to top so it can be stamped again
    ScrollTrigger.create({ start: 0, end: 100, onLeaveBack: () => {
      if (st?.isActive) return;
      st?.kill(); tl.kill();
      const live = $$(".pickup__body--float", sec)[0];
      live.innerHTML = $$(".pickup__body--back", sec)[0].innerHTML;
      spans.splice(0, spans.length, ...$$("span", live));
      spans.forEach((s, i) => { s.dataset.ruby = /[가-힣]{2,}/.test(texts[i].trim()) && Math.random() < 0.55 ? jamo(texts[i].trim()) : ""; });
      gsap.set(spans, { clearProps: "color" });
      tl = build(); arm();
    } });
  });

  /* News window: over 400vh of the section, the list moves in grid-cell steps */
  const news = document.querySelector(".news");
  const view = news.querySelector(".news__window-view");
  const list = news.querySelector(".news__window-list");
  const items = $$(".news__item", news);
  const title = (id) => news.querySelector(`.news__header__title[item-id="${id}"]`);
  items.forEach((it) => {
    it.addEventListener("mouseenter", () => title(it.getAttribute("item-id"))?.setAttribute("show-item", ""));
    it.addEventListener("mouseleave", () => title(it.getAttribute("item-id"))?.removeAttribute("show-item"));
  });
  const centerPick = () => {
    if (!sp()) return;
    const mid = innerWidth / 2;
    let best = null, d = Infinity;
    items.forEach((it) => { const b = it.getBoundingClientRect(); const k = Math.abs(b.left + b.width / 2 - mid); if (k < d) { d = k; best = it; } });
    items.forEach((it) => { it.removeAttribute("center-item"); title(it.getAttribute("item-id"))?.removeAttribute("show-item"); });
    if (best) { best.setAttribute("center-item", ""); title(best.getAttribute("item-id"))?.setAttribute("show-item", ""); }
  };
  const size = { view: 0, list: 0 };
  const measure = () => { size.view = view.getBoundingClientRect().width; size.list = list.getBoundingClientRect().width; };
  measure();
  ScrollTrigger.create({
    trigger: news, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
    onRefresh: measure,
    onUpdate: (self) => {
      list.style.setProperty("--init-x", String(Math.round(((size.list - size.view) / gridSize()) * self.progress)));
      centerPick();
    },
  });
  centerPick();
});
