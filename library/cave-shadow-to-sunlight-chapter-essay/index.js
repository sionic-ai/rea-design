// Home scenes: per section a screen-pinned timeline, reading plate, and press-and-hold question. The back stage (cave wall · particle statue · entrance light) is stage.js (three).
(() => {
  const { state, reduce, touch } = window.ph;
  const root = document.documentElement;
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const range = (v, a, b) => clamp01((v - a) / (b - a));
  const smooth = (v) => v * v * (3 - 2 * v);
  const inOutCubic = (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
  const words = gsap.utils.toArray(".ph-wall__truth").map((_, i) => `Word ${i + 1}`);
  const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi", "vii"];

  /* ================= Every section ================= */
  const mm = gsap.matchMedia();
  const setSection = window.ph.setSection;

  // The hidden-question mask follows the cursor only in the wall section
  const truths = document.querySelector(".ph-wall__truths");
  addEventListener("pointermove", (e) => {
    if (root.dataset.section !== "wall") return;
    truths.style.setProperty("--mx", `${e.clientX}px`);
    truths.style.setProperty("--my", `${e.clientY}px`);
  }, { passive: true });
  if (touch) document.querySelectorAll("[data-touch]").forEach((el) => (el.textContent = el.dataset.touch));

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (c) => {
    const still = c.conditions.still;
    root.classList.toggle("is-still", still);

    /* Hero */
    const title = SplitText.create(".ph-hero__title", { type: "chars", charsClass: "ph-char" });
    if (!still) {
      gsap.set(title.chars, { autoAlpha: 0 });
      gsap.set(".ph-hero__reveal", { autoAlpha: 0 });
      // Not from the left but in (i*5+2)%7 order, blinking twice (.55→.15) and then turning on
      const light = () => {
        title.chars.map((_, i) => i).sort((a, b) => ((a * 5 + 2) % 7) - ((b * 5 + 2) % 7)).forEach((ci, s) =>
          gsap.timeline({ delay: 0.5 + s * 0.17 })
            .to(title.chars[ci], { autoAlpha: 0.55, duration: 0.07 })
            .to(title.chars[ci], { autoAlpha: 0.15, duration: 0.09 })
            .to(title.chars[ci], { autoAlpha: 1, duration: 1.1, ease: "power2.out" }));
        gsap.to(".ph-hero__reveal", { autoAlpha: 1, duration: 1.6, ease: "power2.out", stagger: 0.15, delay: 1.6 });
      };
      if (state.entered) light(); else addEventListener("ph:enter", light, { once: true });
      gsap.to(title.chars, { y: (i) => -60 - ((i * 53) % 140), ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to([".ph-hero__top", ".ph-hero__title", ".ph-hero__bottom"], { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: "#hero", start: "30% top", end: "85% top", scrub: true } });
    }
    ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top", onUpdate: (s) => (state.hero = s.progress) });
    ScrollTrigger.create({ trigger: "#hero", start: "top bottom", end: "bottom top", onToggle: (s) => s.isActive && setSection("hero") });

    /* Cave wall: progress .06~.96 is divided by the word count, a word is dark only at the center of its cell (fades at the edge 1/7) */
    const truthEls = gsap.utils.toArray(".ph-wall__truth");
    const num = document.querySelector(".ph-wall__num");
    const word = document.querySelector(".ph-wall__word");
    let shown = -1;
    ScrollTrigger.create({
      trigger: "#wall", start: "top top", end: still ? "bottom top" : "+=320%", pin: !still,
      onToggle: (s) => s.isActive && setSection("wall"),
      onUpdate: (s) => {
        state.wall = s.progress;
        const p = Math.min(Math.max((s.progress - 0.06) / 0.9, 0), 0.9999);
        const idx = Math.floor(p * words.length), frac = p * words.length - idx;
        const inside = s.progress > 0.06 && s.progress < 0.96;
        state.wordIndex = idx;
        state.wordFade = inside ? Math.min(1, Math.min(frac, 1 - frac) * 7) : 0;
        const on = state.wordFade > 0.4 ? idx : -1;
        if (on === shown) return;
        truthEls.forEach((el, i) => el.classList.toggle("is-active", i === on));
        if (on >= 0) { num.textContent = NUMERALS[on]; word.textContent = words[on]; }
        shown = on;
      },
    });

    /* Turn away */
    const scatter = SplitText.create(".ph-turn__everything", { type: "chars", charsClass: "ph-char" });
    const cogito = SplitText.create(".ph-turn__cogito h2", { type: "lines", mask: "lines", linesClass: "ph-line" });
    if (still) {
      gsap.set(".ph-turn__layer", { autoAlpha: 1 });
      ScrollTrigger.create({ trigger: "#turn", start: "top bottom", end: "bottom top", onToggle: (s) => s.isActive && setSection("turn"), onUpdate: (s) => (state.turn = s.progress) });
    } else {
      const rand = (i) => gsap.utils.random(-1, 1, 0.01) * (40 + (i % 3) * 25);
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "#turn", start: "top top", end: "+=380%", pin: true, scrub: 1,
          onToggle: (s) => s.isActive && setSection("turn"), onUpdate: (s) => (state.turn = s.progress),
        },
      })
        .set(".ph-turn__layer", { autoAlpha: 1 })
        .from(".ph-turn__first", { autoAlpha: 0, y: 60, filter: "blur(10px)", duration: 0.08 }, 0.01)
        .to(".ph-turn__first", { autoAlpha: 0, y: -60, filter: "blur(10px)", duration: 0.06 }, 0.15)
        .from(scatter.chars, { autoAlpha: 0, yPercent: 60, scale: 1.4, filter: "blur(20px)", stagger: 0.008, duration: 0.08 }, 0.17)
        .to(scatter.chars, {
          xPercent: (i) => rand(i) * 12, yPercent: (i) => rand(i + 7) * 10, rotate: (i) => rand(i + 3) * 4,
          scale: (i) => 0.4 + ((i * 37) % 10) / 6, filter: "blur(16px)", autoAlpha: 0,
          stagger: { each: 0.006, from: "center" }, duration: 0.2,
        }, 0.33)
        .from(cogito.lines, { yPercent: 110, duration: 0.12, stagger: 0.04, ease: "power3.out" }, 0.56)
        .from([".ph-turn__cogito .ph-note", ".ph-turn__cogito .ph-eyebrow"], { autoAlpha: 0, duration: 0.06, stagger: 0.02 }, 0.66)
        .to(".ph-turn__cogito", { autoAlpha: 0, y: -40, filter: "blur(8px)", duration: 0.07 }, 0.8)
        .from(".ph-turn__after", { autoAlpha: 0, y: 40, filter: "blur(8px)", duration: 0.08 }, 0.87)
        .to({}, { duration: 0.05 }, 0.95);
    }

    /* Rise: pushes horizontally by the width overflowing the track (scrub 1). The description text rises when it reaches 85% of the screen within the horizontal flow */
    const track = document.querySelector(".ph-ascent__track");
    const over = () => track.scrollWidth - innerWidth;
    const bar = document.querySelector(".ph-ascent__bar span");
    if (still) {
      ScrollTrigger.create({ trigger: "#ascent", start: "top center", end: "bottom center", onToggle: (s) => s.isActive && setSection("ascent"), onUpdate: (s) => (state.ascent = s.progress) });
    } else {
      const slide = gsap.to(track, {
        x: () => -over(), ease: "none",
        scrollTrigger: {
          trigger: "#ascent", start: "top top", end: () => `+=${over()}`, pin: true, scrub: 1, invalidateOnRefresh: true,
          onToggle: (s) => s.isActive && setSection("ascent"),
          onUpdate: (s) => { state.ascent = s.progress; gsap.set(bar, { scaleX: s.progress }); },
        },
      });
      gsap.utils.toArray(".ph-card__meta").forEach((m) => gsap.from(m.children, {
        autoAlpha: 0, y: 30, duration: 1.2, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: m, containerAnimation: slide, start: "left 85%" },
      }));
    }

    /* Question */
    ScrollTrigger.create({
      trigger: "#question", start: "top top", end: still ? "bottom top" : "+=120%", pin: !still,
      onToggle: (s) => s.isActive && setSection("question"), onUpdate: (s) => (state.question = s.progress),
    });
    if (!still) gsap.from(".ph-question > .ph-question__q, .ph-hold", { autoAlpha: 0, y: 40, duration: 1.4, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: "#question", start: "top 60%" } });

    /* Sun: the screen burns (progress up to .38) and the quote turns word by word from white light to ink. Past 20% progress the nav switches to the light theme */
    const sunWords = SplitText.create(".ph-sun__quote", { type: "words", wordsClass: "ph-word" });
    const sunUpdate = (s) => {
      state.sun = s.progress;
      if (s.progress > 0.2) root.dataset.theme = "light"; else delete root.dataset.theme;
    };
    if (still) {
      gsap.set(".ph-sun__burn", { opacity: 1 });
      ScrollTrigger.create({ trigger: ".ph-sun__pin", start: "top center", end: "bottom top", onUpdate: sunUpdate, onLeaveBack: () => delete root.dataset.theme, onEnter: () => (root.dataset.theme = "light") });
    } else {
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".ph-sun__pin", start: "top top", end: "+=260%", pin: true, scrub: 1, onUpdate: sunUpdate },
      })
        .to(".ph-sun__burn", { opacity: 1, duration: 0.38 }, 0)
        .from(sunWords.words, { color: getComputedStyle(root).getPropertyValue("--site-flare").trim(), autoAlpha: 0, stagger: 0.035, duration: 0.2 }, 0.43)
        .from(".ph-sun__by", { autoAlpha: 0, y: 20, duration: 0.08 }, 0.78)
        .to({}, { duration: 0.1 }, 0.9);
    }
    ScrollTrigger.create({ trigger: "#sun", start: "top center", end: "bottom bottom", onToggle: (s) => s.isActive && setSection("sun") });

    window.ph.reveal(document);
    return () => {
      [title, scatter, cogito, sunWords].forEach((s) => s.revert());
      delete root.dataset.theme;
    };
  });

  /* ================= Reading edition ================= */
  (() => {
    const reader = document.querySelector(".ph-reader");
    const panel = reader.querySelector(".ph-reader__panel");
    const media = reader.querySelector(".ph-reader__media");
    const close = reader.querySelector(".ph-reader__close");
    const figs = gsap.utils.toArray(".ph-card__fig");
    const k = reduce ? 0.4 : 1;
    let busy = false, at = null, fly = null;
    const items = () => reader.querySelectorAll("[data-r]");
    const fill = (i) => {
      const card = figs[i].closest(".ph-card");
      const name = card.querySelector("h3").textContent;
      reader.querySelector(".ph-reader__name").textContent = name;
      reader.querySelector(".ph-reader__top .ph-eyebrow").textContent = card.querySelector(".ph-eyebrow").textContent.split(",")[0];
      const names = reader.querySelectorAll(".ph-reader__navname");
      names[0].textContent = figs[(i - 1 + figs.length) % figs.length].closest(".ph-card").querySelector("h3").textContent;
      names[1].textContent = figs[(i + 1) % figs.length].closest(".ph-card").querySelector("h3").textContent;
    };
    const makeFly = (i) => {
      const f = document.createElement("figure");
      f.className = "ph-reader__fly";
      f.dataset.i = i;
      f.append(figs[i].querySelector(".wf-img").cloneNode(true));
      document.body.append(f);
      return f;
    };
    const rect = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
    const showItems = (delay = 0) => gsap.fromTo(items(), { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 * k, ease: "expo.out", stagger: 0.045, delay });

    const open = (i) => {
      if (busy || at !== null) return;
      busy = true;
      at = i;
      fill(i);
      window.ph.lenis.stop();
      root.classList.add("is-reading");
      window.ph.sound.whoosh();
      history.pushState({ reader: i }, "", `#reader-${i + 1}`);
      panel.scrollTop = 0;
      fly = makeFly(i);
      gsap.timeline({ onComplete: () => { busy = false; close.focus({ preventScroll: true }); } })
        .set(reader, { visibility: "visible" })
        .fromTo(fly, rect(figs[i]), { ...rect(media), duration: 1.5 * k, ease: "expo.inOut" }, 0)
        .fromTo(panel, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 1.1 * k, ease: "expo.inOut" }, 0.45 * k)
        .add(() => showItems(), 0.95 * k);
    };
    const shut = () => {
      if (busy || at === null) return;
      busy = true;
      const i = at;
      window.ph.sound.whoosh(true);
      gsap.timeline({
        onComplete: () => {
          fly.remove(); fly = null; at = null; busy = false;
          root.classList.remove("is-reading");
          window.ph.lenis.start();
          figs[i].focus({ preventScroll: true });
        },
      })
        .to(items(), { autoAlpha: 0, y: -18, duration: 0.4 * k, stagger: 0.015, ease: "power2.in" }, 0)
        .to(panel, { clipPath: "inset(0 0 0 100%)", duration: 0.9 * k, ease: "expo.inOut" }, 0.15 * k)
        .to(fly, { ...rect(figs[i]), duration: 1.3 * k, ease: "expo.inOut" }, 0.3 * k)
        .set(reader, { visibility: "hidden" });
    };
    const back = () => (history.state?.reader !== undefined ? history.back() : shut());
    const step = (d) => {
      if (busy || at === null) return;
      busy = true;
      const next = (at + d + figs.length) % figs.length;
      window.ph.sound.tick();
      history.replaceState({ reader: next }, "", `#reader-${next + 1}`);
      const old = fly;
      gsap.timeline({ onComplete: () => (busy = false) })
        .to(items(), { autoAlpha: 0, y: -16, duration: 0.35 * k, stagger: 0.012, ease: "power2.in" })
        .add(() => {
          at = next;
          fill(next);
          panel.scrollTop = 0;
          fly = makeFly(next);
          gsap.set(fly, { ...rect(media), autoAlpha: 0 });
          showItems(0.25);
        })
        .add(() => gsap.to(fly, { autoAlpha: 1, duration: 1.1 * k, ease: "power3.inOut", onComplete: () => old.remove() }));
    };

    figs.forEach((f, i) => {
      f.addEventListener("click", () => open(i));
      f.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(i)));
      // Hover glow spreads from the cursor side
      f.addEventListener("pointermove", (e) => {
        const r = f.getBoundingClientRect();
        f.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
        f.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });
    close.addEventListener("click", back);
    reader.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => step(Number(b.dataset.step))));
    addEventListener("popstate", () => at !== null && history.state?.reader === undefined && shut());
    addEventListener("keydown", (e) => {
      if (at === null) return;
      if (e.key === "Escape") back();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  })();

  /* ================= Press-and-hold question ================= */
  (() => {
    const QA = [
      { q: "A big question in three lines?", a: "A short answer, one line.", by: "Your respondent here" },
      { q: "A second question goes here?", a: "A second answer, a little longer, set over two lines.", by: "Your respondent here" },
      { q: "A third question?", a: "A third answer.", by: "Your respondent here" },
    ];
    const NOTES = ["Your one-liner here welcoming even small questions.", "Your second welcoming line here.", "Your third line of welcome here."];
    const KEY = "ph:question";
    const sec = document.querySelector("#question");
    const q = sec.querySelector(".ph-question > .ph-question__q");
    const own = sec.querySelector(".ph-question__own");
    const input = own.querySelector("textarea");
    const answer = sec.querySelector(".ph-question__a");
    const btn = sec.querySelector(".ph-hold__btn");
    const ring = sec.querySelector(".ph-hold__ring");
    const hint = sec.querySelector(".ph-hold__hint");
    const sw = sec.querySelector(".ph-question__switch");
    const hold = sec.querySelector(".ph-hold");
    const C = 2 * Math.PI * 47;
    const labels = { hint: hint.textContent, sw: sw.textContent };
    let idx = 0, mine = false, answered = false, tw = null;

    const paint = () => {
      sec.style.setProperty("--hold", state.hold.toFixed(3));
      const target = mine ? input : q;
      target.style.filter = state.hold > 0.002 ? `blur(${(state.hold * 10).toFixed(2)}px)` : "";
      ring.style.strokeDashoffset = C * (1 - state.hold);
    };
    const ready = () => !mine || input.value.trim().length >= 4;
    const syncReady = () => btn.setAttribute("aria-disabled", !ready());

    const reveal = () => {
      const text = input.value.trim();
      if (mine) {
        try { localStorage.setItem(KEY, text); } catch {}
        answer.innerHTML = `<p>“${text.replace(/</g, "&lt;")}”</p><span class="ph-note">${NOTES[Math.floor(Math.random() * NOTES.length)]}</span>`;
      } else {
        answer.innerHTML = `<p>“${QA[idx].a}”</p><span class="ph-eyebrow">${QA[idx].by}</span>`;
      }
      answered = true;
      q.hidden = true;
      own.hidden = true;
      hold.querySelectorAll(".ph-hold__btn, .ph-hold__hint").forEach((el) => (el.hidden = true));
      sw.textContent = mine ? "Your follow-up question here" : "Your other question here";
      sw.classList.add("is-again");
      window.ph.sound.chime();
      gsap.to(state, { hold: 0, duration: 0.5, ease: "power2.out", onUpdate: paint });
      gsap.fromTo(state, { burst: 0 }, { burst: 1, duration: 0.35, ease: "power3.out" });
      gsap.to(state, { burst: 0, duration: 3.2, ease: "expo.inOut", delay: 0.35 });
      const split = SplitText.create(answer.querySelector("p"), { type: "words", mask: "words" });
      gsap.from(split.words, { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.04 });
      gsap.from(answer.querySelector(".ph-eyebrow, .ph-note"), { autoAlpha: 0, duration: 1, delay: 0.6 });
    };
    const press = (e, fast = false) => {
      if (answered || tw || !ready()) return;
      e?.preventDefault?.();
      tw = gsap.to(state, {
        hold: 1, duration: (fast ? 1.6 : 2.4) * (1 - state.hold), ease: "power1.in", onUpdate: paint,
        onComplete: () => { tw = null; reveal(); },
      });
    };
    const release = () => {
      if (!tw) return;
      tw.kill();
      tw = null;
      gsap.to(state, { hold: 0, duration: 0.8, ease: "power2.out", onUpdate: paint });
    };
    const reset = () => gsap.to(answer, {
      autoAlpha: 0, duration: 0.6, onComplete: () => {
        answered = false;
        answer.replaceChildren();
        gsap.set(answer, { autoAlpha: 1 });
        if (mine) input.value = ""; else { idx = (idx + 1) % QA.length; q.textContent = QA[idx].q; }
        q.hidden = mine;
        own.hidden = !mine;
        hold.querySelectorAll(".ph-hold__btn, .ph-hold__hint").forEach((el) => (el.hidden = false));
        sw.classList.remove("is-again");
        sw.textContent = mine ? sw.dataset.own : labels.sw;
        syncReady();
      },
    });

    btn.addEventListener("pointerdown", press);
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => btn.addEventListener(t, release));
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    const keys = (e) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      e.preventDefault();
      if (e.type === "keydown" && !e.repeat) press();
      if (e.type === "keyup") release();
    };
    btn.addEventListener("keydown", keys);
    btn.addEventListener("keyup", keys);
    input.addEventListener("input", syncReady);
    input.addEventListener("keydown", (e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), press(null, true)));
    sw.addEventListener("click", () => {
      if (answered) return reset();
      mine = !mine;
      q.hidden = mine;
      own.hidden = !mine;
      hint.textContent = mine ? hint.dataset.own : labels.hint;
      sw.textContent = mine ? sw.dataset.own : labels.sw;
      syncReady();
      if (mine) requestAnimationFrame(() => input.focus({ preventScroll: true }));
    });

    // The question you typed last time reappears in one line under the entry door and in the closing words
    let last = null;
    try { last = localStorage.getItem(KEY); } catch {}
    if (last) {
      const note = document.querySelector(".ph-preloader__note");
      if (note) note.textContent = `What you asked last time: “${last}”`;
      const yours = document.createElement("div");
      yours.className = "ph-epilogue__yours";
      yours.innerHTML = `<span class="ph-eyebrow">What you were asked on entry here</span><p></p><span class="ph-note">Your one line here telling people to take that question with them.</span>`;
      yours.querySelector("p").textContent = `“${last}”`;
      document.querySelector(".ph-epilogue__grid").after(yours);
    }
  })();
})();
