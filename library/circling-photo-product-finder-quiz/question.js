// Question page — flips through seven questions within one page (the original is in-app navigation where the address changes per question).
// Each time an answer changes, every product is re-scored into data-score and fx:sort is sent to the grid part (match-ring-grid).
(() => {
  const QUESTIONS = [
    { slug: "q1", title: "Question One", type: "range", answers: ["Answer 01", "Answer 02", "Answer 03"], min: "Min", max: "Max", steps: false },
    { slug: "q2", title: "Question Two?", type: "bool", answers: ["Yes", "No"] },
    { slug: "q3", title: "Question Three", type: "range", answers: ["Answer 01", "Answer 02", "Answer 03", "Answer 04", "Answer 05", "Answer 06"], min: "Less", max: "More", steps: true },
    { slug: "q4", title: "Question Four, longer", type: "multi", answers: ["First option", "Second option", "Third option", "Fourth option label"] },
    { slug: "q5", title: "Question Five", type: "range", answers: ["Answer 01", "Answer 02", "Answer 03"], min: "Less", max: "More", steps: false },
    { slug: "q6", title: "Six", type: "range", answers: ["Answer 01", "Answer 02", "Answer 03", "Answer 04"], min: "Less", max: "More", steps: false },
    { slug: "q7", title: "Question 07?", type: "multi", answers: ["First option", "Second option label", "Third one"] },
  ];
  const ease = kfFx.ease("0.25,0.46,0.45,0.94", "power1.out");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const grid = document.querySelector(".vf-grid");
  const items = [...grid.querySelectorAll(".vf-prod")];
  const card = document.querySelector(".vf-q__card");
  const titleEl = card.querySelector(".vf-q__title");
  const answersEl = card.querySelector(".vf-q__answers");
  const prev = card.querySelector(".vf-q__prev");
  const next = card.querySelector(".vf-q__next");
  const mid = document.querySelector(".vf-q__mid");
  const page = mid.querySelector(".vf-q__page");
  const total = mid.querySelector(".vf-q__total");
  const info = card.querySelector(".vf-q__info");
  const dialog = card.querySelector(".vf-q__dialog");
  const answers = {};

  // URL ?q=If q1 exists, start from that question (Hero Start), otherwise the seventh recorded question
  const want = new URLSearchParams(location.search).get("q");
  let index = Math.max(0, QUESTIONS.findIndex((q) => q.slug === want));
  if (!want) index = QUESTIONS.length - 1;
  total.textContent = QUESTIONS.length;
  page.dataset.value = index + 1;
  root.classList.add("js-q");

  // Product score: 0 to 100 determined by question, answer and product number (same value on every reopen)
  const hash = (a, b, c) => {
    let h = 2166136261 ^ (a * 374761393 + b * 668265263 + c * 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) % 101;
  };
  const rescore = () => {
    const done = Object.entries(answers).filter(([, v]) => v.length);
    items.forEach((it, p) => {
      const s = done.reduce((sum, [qi, picks]) => sum + picks.reduce((a, ai) => a + hash(p, +qi, ai), 0) / picks.length, 0);
      it.dataset.score = s.toFixed(2);
    });
    if (done.length) grid.dispatchEvent(new CustomEvent("fx:sort"));
  };
  const answer = (picks) => { answers[index] = picks; rescore(); };

  const ARROW_OK = '<svg viewBox="0 0 14 10" aria-hidden="true"><path d="m1 5 4 4 8-8"/></svg>';
  const ARROW_NO = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="m1 1 8 8M9 1 1 9"/></svg>';

  const render = (q) => {
    titleEl.textContent = q.title;
    const saved = answers[QUESTIONS.indexOf(q)] || [];
    if (q.type === "multi") {
      answersEl.innerHTML = `<div class="vf-multi"><div class="vf-multi__wrap${q.answers.length === 2 ? " is-two" : ""}" lang="en">${q.answers.map((a, i) => `<label class="vf-chip"><input type="checkbox" name="answer" value="${i}"${saved.includes(i) ? " checked" : ""}><span class="vf-chip__label"><svg class="vf-chip__dot" viewBox="0 0 13 13" aria-hidden="true"><rect x="1" y="1" width="11" height="11" rx="2"/><path d="m3.6 6.6 2 2 3.8-4"/></svg>${a}</span></label>`).join("")}</div></div>`;
    } else if (q.type === "bool") {
      answersEl.innerHTML = `<div class="vf-bool">${q.answers.map((a, i) => `<div class="vf-bool__cell"><button class="vf-btn is-boolean" type="button" aria-pressed="${saved.includes(i)}" aria-label="${a}" value="${i}">${i === 0 ? ARROW_OK : ARROW_NO}</button></div>`).join("")}</div>`;
    } else {
      const has = saved.length ? saved[0] : -1;
      answersEl.innerHTML = `<div class="vf-range${has >= 0 ? " is-touched" : ""}" lang="en">
        <button class="vf-range__knob" type="button" aria-label="Choose a Value"><span class="vf-range__dot"></span><span class="vf-range__glow"></span></button>
        <div class="vf-range__steps${q.steps ? "" : " is-plain"}">${q.answers.map((a, i) => `<button class="vf-range__step${i === has ? " is-active" : ""}" type="button" aria-label="${a}" value="${i}"></button>`).join("")}</div>
        <div class="vf-range__bounds"><span class="vf-range__bound">${q.min}</span><span class="vf-range__bound">${q.max}</span></div>
        <span class="vf-range__result">${has >= 0 ? q.answers[has] : "Choose a value"}</span></div>`;
    }
    bind(q);
    prev.classList.toggle("is-disabled", QUESTIONS.indexOf(q) === 0);
  };

  // Motion of the answer coming in — chips from the right at 100%, yes/no from 200% over .8s (.1s apart), bars from 10px below over .8s
  const enter = () => {
    if (reduce) return;
    const chips = answersEl.querySelectorAll(".vf-chip");
    const bools = answersEl.querySelectorAll(".vf-bool__cell");
    const range = answersEl.querySelector(".vf-range");
    if (chips.length) gsap.fromTo(chips, { x: "100%", opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease, stagger: 0.1 });
    if (bools.length) gsap.fromTo(bools, { x: "200%", opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease, stagger: 0.1 });
    if (range) gsap.fromTo(range, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease });
  };

  function bind(q) {
    if (q.type === "multi") {
      const wrap = answersEl.querySelector(".vf-multi__wrap");
      answersEl.querySelectorAll(".vf-chip input").forEach((inp) => inp.addEventListener("change", () => {
        answer([...answersEl.querySelectorAll(".vf-chip input:checked")].map((x) => +x.value));
      }));
      dragRow(wrap);
    } else if (q.type === "bool") {
      answersEl.querySelectorAll(".vf-btn").forEach((b) => b.addEventListener("click", () => {
        const on = b.getAttribute("aria-pressed") !== "true";
        answersEl.querySelectorAll(".vf-btn").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", String(on));
        answer(on ? [+b.value] : []);
      }));
    } else rangeBind(q);
  }

  // Chip row — if longer than the card, drag it sideways (original spring damping 100 · mass 3 · stiffness 400)
  function dragRow(wrap) {
    const box = wrap.parentElement;
    let sx = 0, x0 = 0, x = 0, on = false, moved = false;
    const max = () => Math.min(0, box.clientWidth - wrap.scrollWidth);
    const to = (v) => { x = Math.min(0, Math.max(max(), v)); gsap.to(wrap, { x, duration: 0.6, ease: "power3.out", overwrite: true }); };
    wrap.addEventListener("pointerdown", (e) => { on = true; moved = false; sx = e.clientX; x0 = x; });
    addEventListener("pointermove", (e) => { if (!on) return; const d = e.clientX - sx; if (Math.abs(d) > 3) moved = true; if (moved) to(x0 + d); });
    addEventListener("pointerup", () => { on = false; });
    wrap.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  // Cell bar — dragging the dot attaches it to the nearest cell after .5s over 1s, and clicking a cell goes to that cell. Before it is touched, the dot jitters ±5px every .15s
  function rangeBind(q) {
    const range = answersEl.querySelector(".vf-range");
    const knob = range.querySelector(".vf-range__knob");
    const dot = range.querySelector(".vf-range__dot");
    const steps = [...range.querySelectorAll(".vf-range__step")];
    const result = range.querySelector(".vf-range__result");
    const n = steps.length;
    const centers = () => { const w = range.querySelector(".vf-range__steps").clientWidth; return steps.map((_, i) => -w / 2 + (w / n) * (i + 0.5)); };
    const bound = () => range.querySelector(".vf-range__steps").clientWidth / 2;
    let x = 0, wiggle = null;
    const saved = answers[index];
    if (saved?.length) x = centers()[saved[0]];
    gsap.set(knob, { x });
    if (!saved?.length && !reduce) wiggle = gsap.fromTo(dot, { x: -5 }, { x: 5, duration: 0.15, ease, repeat: -1, yoyo: true });
    const still = () => { if (wiggle) { wiggle.kill(); wiggle = null; gsap.to(dot, { x: 0, duration: 0.05, ease }); } };
    knob.addEventListener("pointerenter", still);
    const pick = (i, delay) => {
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      range.classList.add("is-touched");
      result.textContent = q.answers[i];
      gsap.to(knob, { x: centers()[i], duration: 1, ease, delay });
      answer([i]);
    };
    steps.forEach((s, i) => s.addEventListener("click", () => { still(); pick(i, 0); }));
    let sx = 0, x0 = 0, drag = false;
    knob.addEventListener("pointerdown", (e) => { drag = true; still(); sx = e.clientX; x0 = gsap.getProperty(knob, "x"); knob.setPointerCapture(e.pointerId); });
    knob.addEventListener("pointermove", (e) => { if (!drag) return; const b = bound(); gsap.set(knob, { x: Math.max(-b, Math.min(b, x0 + e.clientX - sx)) }); });
    knob.addEventListener("pointerup", () => {
      if (!drag) return;
      drag = false;
      const cur = gsap.getProperty(knob, "x"), cs = centers();
      const i = cs.reduce((best, c, k) => (Math.abs(c - cur) < Math.abs(cs[best] - cur) ? k : best), 0);
      pick(i, 0.5);
    });
  }

  // Page turn — the page-number panel covers in .2s and the numbers roll (the next question is laid under the panel at .15s), then the panel lifts at .6s and the answer comes in
  let busy = false;
  const go = (dir) => {
    const to = index + (dir === "next" ? 1 : -1);
    if (busy || to < 0 || to >= QUESTIONS.length) return;
    busy = true;
    mid.classList.add("is-on");
    page.dataset.value = to + 1;
    setTimeout(() => {
      index = to;
      render(QUESTIONS[index]);
      answersEl.querySelectorAll(".vf-chip, .vf-bool__cell, .vf-range").forEach((n) => gsap.set(n, { opacity: 0 }));
      history.replaceState(null, "", `?q=${QUESTIONS[index].slug}`);
    }, reduce ? 0 : 150);
    setTimeout(() => { mid.classList.remove("is-on"); enter(); busy = false; }, reduce ? 0 : 650);
  };
  prev.addEventListener("click", (e) => { e.preventDefault(); go("prev"); });
  next.addEventListener("click", (e) => { e.preventDefault(); go("next"); });

  // Info button — tooltip appears on hover or focus
  const showInfo = (v) => dialog.classList.toggle("is-open", v);
  info.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") showInfo(true); });
  info.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") showInfo(false); });
  info.addEventListener("focus", () => showInfo(true));
  info.addEventListener("blur", () => showInfo(false));
  // On touch devices it is already open the moment it is hovered — a press only opens (closing happens when the finger lifts). On non-touch devices, each press toggles open and close
  const canHover = matchMedia("(hover: hover)").matches;
  info.addEventListener("click", () => showInfo(canHover ? true : !dialog.classList.contains("is-open")));

  // Pressing a product — the others go to .4 opacity and .96 scale in order of distance from the pressed spot (max 160ms), the pressed one scales to 1.1. The original goes to the product detail after 1.05s (not recorded) — here it reverts
  const wrap = grid.querySelector(".vf-grid__wrap");
  grid.addEventListener("click", (e) => {
    const link = e.target.closest(".vf-prod__link");
    if (!link) return;
    e.preventDefault();
    if (!grid.classList.contains("is-fx-sorted") || wrap.classList.contains("is-leaving")) return;
    const c = link.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2, half = Math.hypot(innerWidth, innerHeight) / 2;
    wrap.querySelectorAll(".vf-prod__link").forEach((l) => {
      const r = l.getBoundingClientRect();
      const d = Math.min(Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) / half, 1);
      l.style.setProperty("--delay", `${Math.round(d * 160)}ms`);
    });
    wrap.classList.add("is-leaving");
    link.classList.add("is-clicked");
    setTimeout(() => { wrap.classList.remove("is-leaving"); link.classList.remove("is-clicked"); }, 1400);
  });

  render(QUESTIONS[index]);

  // Intro — once the loader ends the grid gathers from off-screen (.8s), background goes pale gray over 2s, card rises from 150% below in 1s, then the answer follows
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) { grid.classList.add("is-intro"); gsap.set(card, { y: 0 }); return; }
    answersEl.querySelectorAll(".vf-chip, .vf-bool__cell, .vf-range").forEach((nd) => gsap.set(nd, { opacity: 0 }));
    const start = () => {
      requestAnimationFrame(() => grid.classList.add("is-intro"));
      gsap.fromTo(card, { y: "150%" }, { y: 0, duration: 1, ease });
      setTimeout(enter, 300);
    };
    document.addEventListener("fx:done", start, { once: true });
    return () => document.removeEventListener("fx:done", start);
  });
})();
