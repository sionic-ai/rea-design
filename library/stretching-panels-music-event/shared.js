// Site-wide motion: loader (disc bursts and regathers) → four columns rise, drag handle between columns, phone column swipe, floating comment cursor, schedule modal.
(() => {
  const body = document.body;
  const cols = [...document.querySelectorAll(".mt-col")];
  const wrap = document.querySelector(".mt-wrap");
  const mobileMq = matchMedia("(max-width: 1023px)");
  const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
  const mt = (window.mt = { cols, step: 0, isMobile: () => mobileMq.matches, glitch: () => {} });

  /* ── Loader ─────────────────────────────────────────── */
  // Sixteen discs burst from one point into a round cluster and gather back into one point (2.8s per cycle). Visible for at least 2 seconds
  const DISCS = [
    [0, 0, 14, 1], [-52, -38, 10, 1], [-18, -60, 11, 0], [26, -54, 7, 0], [56, -30, 10, 1], [74, -4, 6, 0],
    [-74, -8, 9, 0], [-80, 22, 6, 0], [-50, 22, 12, 1], [-22, 10, 8, 1], [8, -18, 6, 0], [44, 20, 13, 1],
    [70, 32, 9, 1], [-30, 48, 12, 1], [10, 54, 11, 0], [40, 56, 7, 1],
  ];
  const discSvg = document.querySelector(".mt-loader__discs");
  const NS = "http://www.w3.org/2000/svg";
  const discEls = DISCS.map(([, , r, hole]) => {
    const g = document.createElementNS(NS, "g");
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", r);
    c.setAttribute("class", "mt-disc");
    g.append(c);
    if (hole) {
      const s = r * 0.62;
      const q = document.createElementNS(NS, "rect");
      q.setAttribute("x", -s / 2);
      q.setAttribute("y", -s / 2);
      q.setAttribute("width", s);
      q.setAttribute("height", s);
      q.setAttribute("class", "mt-disc-hole");
      g.append(q);
    } else {
      const h = document.createElementNS(NS, "circle");
      h.setAttribute("r", r * 0.32);
      h.setAttribute("class", "mt-disc-hole");
      g.append(h);
    }
    discSvg.append(g);
    return g;
  });

  const loader = document.querySelector(".mt-loader");
  const started = performance.now();
  let loop = null;
  if (!reduceMq.matches) {
    gsap.set(discEls, { x: 0, y: 0, scale: (i) => (i ? 0 : 1), svgOrigin: "0 0" });
    loop = gsap.timeline({ repeat: -1, repeatDelay: 0.1 })
      .to(discEls, { x: (i) => DISCS[i][0], y: (i) => DISCS[i][1], scale: 1, duration: 0.55, ease: "power3.out", stagger: { each: 0.012, from: "random" } })
      .to(discEls, { rotation: (i) => (i % 2 ? 40 : -40), duration: 1.2, ease: "sine.inOut" }, 0.45)
      .to(discEls, { x: 0, y: 0, rotation: 0, scale: (i) => (i ? 0 : 1), duration: 0.5, ease: "power3.in", stagger: { each: 0.012, from: "random" } }, 1.75);
  }

  const reveal = () => {
    if (loop) loop.kill();
    loader.classList.add("is-done");
    setTimeout(() => loader.remove(), 1000);
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.reduce) {
        gsap.set(cols, { y: 0, opacity: 1 });
      } else {
        // Each cell is delayed 0.15s more, rising from below the screen (100vh) over 0.6s — original CSS curve (.25,.46,.45,.94) = power1.out
        cols.forEach((col, i) => {
          gsap.fromTo(col, { y: innerHeight }, { y: 0, duration: 0.6, ease: "power1.out", delay: 0.15 * i, clearProps: "transform" });
          gsap.fromTo(col, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.in", delay: 0.15 * i });
        });
      }
    });
    body.classList.remove("is-loading");
  };
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 3000))]).then(() => {
    const wait = reduceMq.matches ? 0 : Math.max(0, 2000 - (performance.now() - started));
    setTimeout(reveal, wait);
  });

  /* ── Handle between panels (wide screens) ───────────────────────── */
  // As in the original, two strip cells are held in px (the rest stay at 25%), and one cell is between 10% and 80% of the screen width. Only when a resize makes the sum of the four cells differ from the screen width by more than 10% do they return to 25% each
  const resizers = [...document.querySelectorAll(".mt-resizer")];
  const reset = () => {
    cols.forEach((c) => (c.style.width = mt.isMobile() ? "" : "25%"));
    resizers.forEach((r, i) => (r.style.left = (i + 1) * 25 + "%"));
  };
  resizers.forEach((r, i) => {
    r.addEventListener("pointerdown", (e) => {
      if (mt.isMobile()) return;
      e.preventDefault();
      r.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const wa = cols[i].offsetWidth, wb = cols[i + 1].offsetWidth, left = cols.slice(0, i).reduce((s, c) => s + c.offsetWidth, 0);
      r.classList.add("is-dragging");
      body.classList.add("is-resizing");
      const move = (ev) => {
        const d = ev.clientX - startX, a = wa + d, b = wb - d, lo = 0.1 * innerWidth, hi = 0.8 * innerWidth;
        if (a < lo || a > hi || b < lo || b > hi) return;
        cols[i].style.width = a + "px";
        cols[i + 1].style.width = b + "px";
        r.style.left = left + a + "px";
      };
      const up = () => {
        r.classList.remove("is-dragging");
        body.classList.remove("is-resizing");
        r.removeEventListener("pointermove", move);
        r.removeEventListener("pointerup", up);
        r.removeEventListener("pointercancel", up);
      };
      r.addEventListener("pointermove", move);
      r.addEventListener("pointerup", up);
      r.addEventListener("pointercancel", up);
    });
  });
  addEventListener("resize", () => {
    if (mt.isMobile()) return;
    const total = cols.reduce((s, c) => s + c.offsetWidth, 0);
    if (Math.abs(total - innerWidth) > 0.1 * innerWidth) reset();
  });
  mobileMq.addEventListener("change", () => {
    setStep(0);
    reset();
  });
  reset();

  /* ── Phone panel switch ─────────────────────────────────── */
  // The first two passes advance 92.5%, the last only 85%, so a sliver of the previous cell shows at the left of the last cell. At the end the button turns around as it moves left
  const OFFSETS = [0, -92.5, -185, -270];
  const nextBtn = document.querySelector(".mt-next");
  let dir = 1;
  const setStep = (s) => {
    mt.step = s;
    wrap.style.left = mt.isMobile() ? OFFSETS[s] + "%" : "";
    if (s >= 3) dir = -1;
    if (s <= 0) dir = 1;
    nextBtn.classList.toggle("is-back", dir < 0);
    nextBtn.setAttribute("aria-label", dir < 0 ? "Front cell" : "Next cell");
  };
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setStep(mt.step + dir);
  });

  /* ── Floating comment cursor ─────────────────────────────── */
  // Placeholder comments. 70% come with an arrow cursor, 30% are carried by a character
  const COMMENTS = [
    { text: "Your cheering comment goes here in one line.", who: "fan" },
    { text: "Your slightly long supportive comment here. Adjust the character count so it wraps to two lines.", who: "fan" },
    { text: "Your short comment here", who: "fan" },
    { text: "Your fan’s long story here. A passage of about three lines, like the day of their first event, is typed out one character at a time inside the speech bubble.", who: "fan" },
    { text: "Your comment here saying you’re looking forward to the event day.", who: "fan" },
    { text: "Your two lines here about a favorite track. Track 00 is the best.", who: "fan" },
    { text: "Your character line of dialogue here", who: "mascot" },
    { text: "A slightly longer line of dialogue from the character here, about two lines.", who: "mascot" },
    { text: "Your character greeting here", who: "mascot" },
  ];
  // Paint with variable names as they are so it changes along with the skin
  const BUBBLE = [1, 2, 3, 4].map((n) => [`var(--site-bubble-${n}a)`, `var(--site-bubble-${n}b)`]);
  const layer = document.querySelector(".mt-comments");
  const toggles = [...document.querySelectorAll(".mt-comment-toggle")];
  let commentsOn = true;
  let used = [];

  const pick = () => {
    const free = (who) => COMMENTS.map((c, i) => [c, i]).filter(([c, i]) => c.who === who && !used.includes(i)).map(([, i]) => i);
    let fans = free("fan");
    let mascots = free("mascot");
    if (!fans.length && !mascots.length) {
      used = [];
      fans = free("fan");
      mascots = free("mascot");
    }
    const pool = (Math.random() < 0.7 && fans.length) || !mascots.length ? fans : mascots;
    const i = pool[Math.floor(Math.random() * pool.length)];
    used.push(i);
    return COMMENTS[i];
  };

  // Speech bubble color follows the horizontal cursor position (four columns) on wide screens, and the currently visible column on phones
  const paint = (cursor, bubble, tail) => {
    let k;
    if (mt.isMobile()) k = mt.step;
    else {
      const lr = layer.getBoundingClientRect();
      const cr = cursor.getBoundingClientRect();
      k = Math.min(3, Math.floor(((cr.left - lr.left + cr.width / 2) / lr.width) * 4));
    }
    const [a, b] = BUBBLE[Math.max(0, k)];
    bubble.style.background = `linear-gradient(180deg, ${a} -88.84%, ${b} 100%)`;
    tail.style.borderTopColor = b;
  };
  const place = (cursor, bubble, tail) => {
    const half = cursor.offsetWidth / 2;
    const w = bubble.offsetWidth || 250;
    const left = half - w / 2;
    bubble.style.left = left + "px";
    bubble.style.top = -bubble.offsetHeight - 10 + "px";
    tail.style.left = half - left + "px";
  };

  const fadeOut = (cursor) => {
    clearTimeout(cursor._fade);
    cursor.style.opacity = "0";
    setTimeout(() => cursor.remove(), 1000);
  };

  const type = (el, text, still) => {
    el.textContent = "";
    const caret = document.createElement("span");
    caret.className = "mt-bubble__caret";
    caret.textContent = "|";
    if (still) {
      el.textContent = text;
      return;
    }
    el.append(caret);
    const tl = gsap.timeline({ onComplete: () => caret.remove() });
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.opacity = "0";
      el.insertBefore(s, caret);
      tl.to(s, { opacity: 1, duration: 0.05, ease: "none" }, 0.05 * i);
    });
  };

  const addBubble = (cursor, comment, still) => {
    const bubble = document.createElement("div");
    bubble.className = "mt-bubble";
    const txt = document.createElement("span");
    const tail = document.createElement("span");
    tail.className = "mt-bubble__tail";
    bubble.append(txt, tail);
    cursor.append(bubble);
    cursor._bubble = { bubble, tail };
    bubble.addEventListener("click", (e) => {
      e.stopPropagation();
      fadeOut(cursor);
    });
    // While the text grows and the speech bubble enlarges, keep centering it above the cursor
    txt.textContent = comment.text;
    place(cursor, bubble, tail);
    txt.textContent = "";
    paint(cursor, bubble, tail);
    const keep = setInterval(() => !document.hidden && place(cursor, bubble, tail), mt.isMobile() ? 300 : 100);
    setTimeout(() => clearInterval(keep), 50 * comment.text.length + 200);
    setTimeout(() => {
      bubble.classList.add("is-in");
      type(txt, comment.text, still);
    }, 100);
    setTimeout(() => {
      clearInterval(keep);
      bubble.classList.remove("is-in");
      bubble.classList.add("is-out");
      setTimeout(() => bubble.remove(), 500);
    }, 19000);
  };

  // To the next destination in 2~6 seconds easeInOutQuart, rests, then moves again after 1~3 seconds. Position updates only once per 8 frames (16 on phones) for the choppy original feel
  const wander = (cursor) => {
    const lr = layer.getBoundingClientRect();
    const x0 = parseFloat(cursor.style.left);
    const y0 = parseFloat(cursor.style.top);
    const x1 = Math.random() * (lr.width - 20);
    const y1 = Math.random() * (lr.height - 20);
    const t0 = Date.now();
    const dur = 2000 + 4000 * Math.random();
    const every = mt.isMobile() ? 16 : 8;
    let frame = 0;
    const tick = () => {
      if (!cursor.isConnected) return;
      if (++frame % every !== 0) return requestAnimationFrame(tick);
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2;
      cursor.style.left = x0 + (x1 - x0) * e + "px";
      cursor.style.top = y0 + (y1 - y0) * e + "px";
      if (cursor._bubble) {
        place(cursor, cursor._bubble.bubble, cursor._bubble.tail);
        paint(cursor, cursor._bubble.bubble, cursor._bubble.tail);
      }
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(() => wander(cursor), 1000 + 2000 * Math.random());
    };
    requestAnimationFrame(tick);
  };

  const spawn = () => {
    if (!commentsOn || document.hidden) return;
    const comment = pick();
    const still = reduceMq.matches;
    const mascot = comment.who === "mascot";
    const size = mascot ? 90 : 20;
    const cursor = document.createElement("div");
    cursor.className = "mt-cursor" + (mascot ? " mt-cursor--mascot" : "");
    cursor.innerHTML = `<svg aria-hidden="true"><use href="#${mascot ? "mt-mascot" : "mt-pointer"}"/></svg>`;
    // Uses the screen coordinates of the center of the hero image directly as in-layer coordinates, so it pops out from the image’s bottom right (same spot as the original)
    const art = document.querySelector(".mt-visual__art");
    const ar = art && art.getBoundingClientRect();
    const lr = layer.getBoundingClientRect();
    let x = ar && ar.width ? ar.left + ar.width / 2 - size / 2 : lr.width / 2 - size / 2;
    let y = ar && ar.width ? ar.top + ar.height / 2 - size / 2 : lr.height / 2 - size / 2;
    if (still) {
      x = Math.random() * (lr.width - size);
      y = 120 + Math.random() * (lr.height - size - 120);
    }
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
    layer.append(cursor);
    cursor.addEventListener("click", (e) => {
      e.stopPropagation();
      fadeOut(cursor);
    });
    if (!still) {
      mt.glitch();
      // Swells from 0.3x to 8.5x then settles to 1x: two 0.4s ease-outs
      cursor.style.transition = "transform 0.4s ease-out";
      cursor.style.transform = "scale(0.3)";
      setTimeout(() => (cursor.style.transform = "scale(8.5)"), 50);
      setTimeout(() => (cursor.style.transform = "scale(1)"), 300);
      wander(cursor);
    }
    setTimeout(() => cursor.isConnected && addBubble(cursor, comment, still), 1000);
    cursor._fade = setTimeout(() => fadeOut(cursor), 20000);
  };

  const setComments = (on) => {
    commentsOn = on;
    layer.classList.toggle("is-off", !on);
    toggles.forEach((t) => {
      t.textContent = on ? "Comment : OFF" : "Comment : ON"; // Like the original, write the state that should be pressed — the text length changes so the button width changes too
      t.setAttribute("aria-pressed", String(on));
      t.classList.toggle("is-off", !on);
    });
    if (!on) layer.querySelectorAll(".mt-cursor").forEach((c) => c.remove());
  };
  toggles.forEach((t) => t.addEventListener("click", () => setComments(!commentsOn)));

  // The original shows the first cursor 1 second after the script starts, regardless of the loader (hidden behind the loader curtain, already visible when the curtain lifts)
  setTimeout(spawn, 1000);
  setInterval(spawn, mt.isMobile() ? 16000 : 8000);

  /* ── Timetable modal ───────────────────────────────────── */
  const modal = document.getElementById("timetable");
  const modalImg = modal.querySelector(".mt-modal__img");
  const TABLES = {
    night: "Night event schedule · table graphic with each stage’s time slots divided by color bands · landscape 4:3",
    day: "Daytime event schedule · table with stage time slots divided by colored bands · 4:3 landscape",
  };
  let table = "day";
  const showTable = (k) => {
    table = k;
    modalImg.dataset.label = TABLES[k];
  };
  // The original opens the timetable of the section currently visible regardless of the button pressed — night if the night section is visible, else day if the day section is visible, else the last one
  const seen = (el) => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; };
  const openModal = () => {
    const night = document.querySelector(".mt-col--night"), day = document.querySelector(".mt-col--day");
    showTable(night && seen(night) ? "night" : day && seen(day) ? "day" : table);
    modal.hidden = false;
  };
  const closeModal = () => (modal.hidden = true);
  document.querySelectorAll(".mt-btn--table").forEach((b) => b.addEventListener("click", openModal));
  modal.querySelector(".mt-modal__close").addEventListener("click", closeModal);
  modal.querySelector(".mt-modal__overlay").addEventListener("click", closeModal);
  modal.querySelectorAll(".mt-modal__nav").forEach((b) => b.addEventListener("click", () => showTable(table === "day" ? "night" : "day")));
  addEventListener("keydown", (e) => e.key === "Escape" && !modal.hidden && closeModal());
})();
