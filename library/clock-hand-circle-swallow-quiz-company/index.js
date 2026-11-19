/* Home — the scene formulas from the original top.js, as they are:
   mv 1000svh scrubbed from top end → bottom end, split into the part before (i) and after (n) the share s where the concept text starts
   intro[0,.07] attention[.07,.25] logo[.28,.35] title[.41] circle[.55,.75] text[.75,1] / story[0,.85] outro[.85,1]
   makes --mv-*-progress follow at .3s circ.out (quickTo), and CSS moves the logo, circle and text using that value. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const arrow = window.sqArrow;
  const ext = '<svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M3.6 1.2h5.2v5.2H7.6V3.3L3 7.9 2.1 7l4.6-4.6H3.6Z"/><path d="M1.2 3.4h1.2v4.2h4.2v1.2H1.2Z"/></svg>';
  const quizBtn = (delay) => `<button class="sq-quiz-btn" type="button" aria-label="Open this Brand’s quiz" style="--quiz-btn-attention-delay:${delay}s"><span class="sq-quiz-btn__wrap"><span class="sq-quiz-btn__logo">${window.sqIcon()}</span><span class="sq-quiz-btn__txt">QUIZ</span><i class="sq-quiz-btn__plus" aria-hidden="true"></i></span></button>`;

  // Six brands — original .service-products-item (2 columns · photo + name link·category pill·two-line intro·quiz button). The quiz wiggle delays are the original .2·1.1·2.4·.8·3.2·1.9s
  const PRODUCTS = [
    ["Brand Name 01", "Online care brand", "Your brand’s vision of the world it creates here<br>Introduced in two lines.", "People · Four people standing before a solid-color backdrop, campaign photo · front view · landscape 3:2", 0.2],
    ["Brand Name 02", "Women’s health brand", "Your brand About text goes here.<br>About two and a half lines long.", "Colorful campaign photo of three people standing close and smiling · orange background", 1.1],
    ["Brand Name 03", "Product", "Your one-line product introduction here.<br>Two short lines.", "Product cutout on pink background · top-down view", 2.4],
    ["Brand Name 04", "Couples clinic brand", "Your brand About text goes here.<br>A story about working through worries with a partner.", "Photo of three people standing in front of color blocks · front view", 0.8],
    ["Brand Name 05", "Life event support", "Your service intro goes here.<br>Short, in two lines.", "People lying on a picnic mat on a lawn · top-down view", 3.2],
    ["Brand Name 06", "Healthcare brand", "Your brand About text goes here.<br>Stories about caring for mind and body.", "Person holding a green heart object · solid-color background", 1.9],
  ];
  const plist = document.querySelector(".service-products__list");
  plist.innerHTML = PRODUCTS.map(([n, c, t, img, d]) => `
<section class="service-products__item sq-hover">
  <figure class="sq-shot service-products__img"><div class="wf-img" data-label="${img}"></div></figure>
  <div class="service-products__info">
    <h4 class="service-products__name"><a class="sq-link sq-hover__link sq-hover__link--plain" href="#service"><span class="sq-link__txt">${n}</span><i class="sq-link__icon">${ext}</i></a></h4>
    <p class="service-products__cat">${c}</p>
  </div>
  <p class="service-products__txt">${t}</p>
  ${quizBtn(d)}
</section>`).join("");

  // Six partner support tiles: the original color panels (yellow · green · red · blue · orange · lime) cover white-text panels, and on press the panel lifts to 50 · −150px and tilts 5°
  const PARTNERS = [
    ["BUSINESS<br>DEVELOPMENT", "Business development support", "From the very start of a 0→1 new business<br>All the way to product and service development.<br>Your support details in about four lines go here."],
    ["BRANDING", "Brand development · Branding support", "From brand concept design<br>Down to worldbuilding and communication design.<br>Your support details go here."],
    ["MARKETING", "Marketing support", "From market analysis and strategy to CRM design.<br>Your support details in about three lines go here."],
    ["CLINIC<br>CONSULTING", "Clinic management support", "Patient recruitment, branding, operations improvement, etc.<br>Your support details go here."],
    ["CREATIVE", "Creative development support", "From concept design to ads, web and video.<br>Your support details go here."],
    ["HEALTH<br>MANAGEMENT", "Health Management Support", "Each and every member<br>We build a work environment full of energy."],
  ];
  const clist = document.querySelector(".service-partner__list");
  clist.innerHTML = PARTNERS.map(([en, ko, t], i) => `
<section class="partner partner--${i + 1}" role="button" tabindex="0" aria-pressed="false">
  <div class="partner__cover partner__box"><h4 class="partner__ttl"><span class="partner__en">${en}</span><span class="partner__ko">${ko}</span></h4><i class="partner__icon" aria-hidden="true"></i></div>
  <div class="partner__body partner__box"><p class="partner__txt">${t}</p></div>
</section>`).join("");
  const parts = [...clist.querySelectorAll(".partner")];
  const setP = (p, on) => { p.classList.toggle("is-active", on); p.setAttribute("aria-pressed", String(on)); };
  parts.forEach((p) => {
    const toggle = () => { const on = !p.classList.contains("is-active"); parts.forEach((x) => setP(x, x === p && on)); };
    p.addEventListener("click", toggle);
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  // Recruit photos — original recruit-photos: every 5.2s the next photo turns on in 1.2s and the current photo scales 1 to 1.08 over 6s
  const PEOPLE = ["Watercolor portrait of a person with glasses", "Bob-cut watercolor portrait", "Smiling watercolor portrait", "Watercolor portrait of a person in a hat", "Watercolor portrait of a person in a striped shirt", "Long-haired figure watercolor portrait", "Watercolor portrait of a bearded man", "Watercolor portrait with floral background"];
  document.querySelectorAll(".recruit__photos").forEach((box, k) => {
    box.innerHTML = PEOPLE.map((p, i) => `<figure class="recruit__img"><div class="wf-img" data-label="${PEOPLE[(i + k * 4) % PEOPLE.length]} · Chest up · Portrait 3:4"></div></figure>`).join("");
    const items = [...box.children];
    // Original H class: when it enters the screen, the current photo gets is-current (1.08x for 6s), and every 5.2s the next photo gets is-next (on for 1.2s). Both are removed when it leaves.
    let cur = 0, timer = null;
    const run = () => {
      items[cur].classList.add("is-current");
      timer = setTimeout(() => {
        const prev = items[cur];
        cur = (cur + 1) % items.length;
        const next = items[cur];
        next.classList.add("is-next");
        setTimeout(() => { next.classList.remove("is-next"); prev.classList.remove("is-current"); }, 1250);
        run();
      }, 5200);
    };
    const stop = () => { clearTimeout(timer); timer = null; items.forEach((it) => it.classList.remove("is-current", "is-next")); };
    if (reduce) items[0].classList.add("is-current");
    else ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onToggle: (st) => { if (st.isActive) { if (!timer) run(); } else stop(); } });
  });
  document.querySelector(".recruit__quiz").innerHTML = quizBtn(0.5);

  // Six news items
  const NEWS = [["2026.04.16", "PARTNERSHIP"], ["2026.04.01", "COMPANY"], ["2026.03.31", "EVENT REPORT"], ["2026.03.24", "SERVICE NEWS"], ["2026.03.10", "PROMOTION"], ["2026.02.27", "AWARDS"]];
  document.querySelector(".news__list").innerHTML = NEWS.map(([d, c], i) => `
<article class="sq-news-item sq-hover">
  <div class="sq-shot"><div class="wf-img" data-label="News featured photo ${i + 1} · Promo image with a logo or people · landscape 3:2"></div><i class="sq-news-item__icon">${arrow}</i></div>
  <div class="sq-news-item__info"><p class="sq-news-item__date">${d}</p><p class="sq-news-item__cat">${c}</p></div>
  <h3 class="sq-news-item__ttl"><a class="sq-hover__link" href="news.html">Your news title here in one or two lines, along with a brand name.</a></h3>
</article>`).join("");
  document.querySelectorAll(".sq-btn__icon").forEach((i) => { i.innerHTML = arrow; });

  // ───── First scene ─────
  const mv = document.querySelector(".mv");
  mv.querySelector(".mv-logo").insertAdjacentHTML("afterbegin", window.sqLogo({ fx: false, label: "Large Wordmark" }));
  mv.querySelector(".mv-circle__icon").innerHTML = '<svg viewBox="0 0 100 100" overflow="visible"><circle class="mv-circle__disc" cx="50" cy="50" r="50"/><g class="mv-circle__hand"><rect x="43" y="-11" width="14" height="49" rx="3.5"/></g></svg>';
  const ttl = mv.querySelector(".mv-ttl"), txt = mv.querySelector(".mv-txt");
  const P = { intro: [0, 0.07], attention: [0.07, 0.25], logo: [0.28, 0.35], title: [0.41, 0.41], circle: [0.55, 0.75], text: [0.75, 1] };
  const S = { story: [0, 0.85], outro: [0.85, 1] };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
  const phaseOf = (i) => (i >= P.text[0] ? "text" : i >= P.circle[0] ? "circle" : i >= P.title[0] ? "title" : i >= P.logo[0] ? "logo" : i >= P.attention[0] ? "attention" : "intro");
  // Original M() and K(): a scene about to enter gets is-enter, one already lit is switched to is-leave and fades out at .9x
  const toggle = (el, want) => {
    const on = el.classList.contains("is-enter") || el.classList.contains("is-leave");
    const cls = want ? "is-enter" : on ? "is-leave" : "";
    if (!cls) { el.classList.remove("is-enter", "is-leave"); el.hidden = true; return; }
    el.hidden = false;
    el.classList.remove(cls === "is-enter" ? "is-leave" : "is-enter");
    el.classList.add(cls);
  };
  const to = {};
  ["intro", "attention", "logo", "title", "circle", "text", "story", "outro"].forEach((k) => {
    to[k] = reduce ? (v) => mv.style.setProperty(`--mv-${k}-progress`, v) : gsap.quickTo(mv, `--mv-${k}-progress`, { duration: 0.3, ease: "circ.out" });
  });
  let split = 0.72;
  const measure = (st) => {
    const len = st ? st.end - st.start : Math.max(1, mv.offsetHeight - innerHeight);
    const c = mv.querySelector(".mv-concept").offsetHeight;
    split = clamp(1 - c / len);
  };
  const apply = (p) => {
    const i = seg(p, 0, split), n = seg(p, split, 1);
    const phase = p >= split ? (n >= S.outro[0] ? "outro" : "story") : phaseOf(i);
    mv.dataset.phase = phase;
    toggle(ttl, phase === "title" || phase === "circle");
    toggle(txt, phase === "text");
    Object.entries(P).forEach(([k, r]) => to[k](seg(i, ...r)));
    Object.entries(S).forEach(([k, r]) => to[k](seg(n, ...r)));
  };
  ScrollTrigger.create({ trigger: mv, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
    onRefresh: (st) => { measure(st); apply(st.progress); }, onUpdate: (st) => apply(st.progress) });
  // Concept text — while passing from 97% → 15% of the screen, it reaches max scale in the middle 15% span (.425~.575), and rises and falls linearly before and after (.1s circ.out)
  mv.querySelectorAll(".mv-concept__txt").forEach((el) => {
    const set = reduce ? (v) => el.style.setProperty("--mv-concept-scale", v) : gsap.quickTo(el, "--mv-concept-scale", { duration: 0.1, ease: "circ.out" });
    ScrollTrigger.create({ trigger: el, start: "50% 97%", end: "50% 15%", scrub: true, onUpdate: (st) => {
      const t = st.progress;
      set(t <= 0.425 ? t / 0.425 : t >= 0.575 ? (1 - t) / 0.425 : 1);
    } });
  });
  requestAnimationFrame(() => requestAnimationFrame(() => { mv.dataset.ready = "true"; }));

  // Hero needle — original Sa(): 30° every 750ms. In scenes where the logo has shrunk (logo · title) it turns only up to 12 o’clock and stops, and in the circle scene it doesn’t turn. Each full turn, the circle color moves to the next color
  if (!reduce) {
    const colors = window.sqPalette.split(/,(?![^(]*\))/).map((c) => c.trim());
    let deg = 0, ci = 0;
    const paint = () => { mv.style.setProperty("--mv-q-rotate", deg + "deg"); mv.style.setProperty("--mv-q-color", colors[ci % colors.length]); };
    paint();
    setInterval(() => {
      const ph = mv.dataset.phase || "intro";
      const introDone = parseFloat(getComputedStyle(mv).getPropertyValue("--mv-intro-progress")) >= 1;
      if (introDone && !["text", "story", "outro"].includes(ph)) {
        if (deg === 0) return;
        deg = (deg + 30) % 360;
      } else if (ph !== "circle") {
        deg = (deg + 30) % 360;
        if (deg === 0) ci += 1;
      }
      paint();
    }, 750);
  }
})();
