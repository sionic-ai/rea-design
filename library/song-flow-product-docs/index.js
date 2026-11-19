const hooks = {};


/* ---------- Chapter: data-type · data-topic · data-bars in the HTML are the original ---------- */
const chapters = $$("[data-chapter]").map((el) => ({
  el,
  type: el.dataset.type,
  topic: el.dataset.topic,
  bars: +el.dataset.bars || 8,
  href: "#" + (el.id || $("[id]", el)?.id || ""),
}));
const starts = [];
let total = 0;
chapters.forEach((c) => {
  starts.push(total);
  total += c.bars;
});
const range = (i) => `${pad(starts[i] + 1, 3)}–${pad(starts[i] + chapters[i].bars, 3)}`;

chapters.forEach((c, i) => {
  $$("[data-fill]", c.el).forEach((el) => {
    const k = el.dataset.fill;
    if (k === "index") el.textContent = `[${pad(i + 1, 2)}]`;
    if (k === "type") el.textContent = c.type;
    if (k === "topic") el.textContent = c.topic;
    if (k === "range") el.textContent = range(i);
  });
});
$$('[data-fill="total"]').forEach((el) => (el.textContent = `/${pad(total, 3)}`));
$$('[data-fill="bpm"]').forEach((el) => (el.textContent = `${BPM} BPM`));
$$('[data-fill="summary"]').forEach((el) => (el.textContent = `${chapters.length} Range · ${total} Segment · ${BPM} BPM`));

$$("[data-roll]").forEach((el) => {
  const items = chapters.map((c) => (el.dataset.roll === "type" ? c.type : c.topic));
  el.style.setProperty("--n", items.length);
  el.innerHTML = `<span class="roller-stack">${items.map((t) => `<span>${t}</span>`).join("")}</span>`;
});

$(".transport-marks").innerHTML = chapters
  .map(
    (c, i) => `<li style="--bars:${c.bars}"><a href="${c.href}">
      <span class="transport-info" data-mark-info><span class="transport-num">${pad(i + 1, 2)}</span><span class="transport-topic">${c.topic}</span><span class="transport-range">${range(i)}</span></span>
      <span class="transport-type">${c.type}</span></a></li>`
  )
  .join("");
$(".hero-map ol").innerHTML = chapters
  .map((c, i) => `<li><a href="${c.href}"><span class="hero-map-type"><b>${pad(i + 1, 2)}</b>${c.type}</span><span class="hero-map-topic">${c.topic}</span></a></li>`)
  .join("");
$("#sheet ol").innerHTML = chapters
  .map(
    (c, i) =>
      `<li><a href="${c.href}"><span class="sheet-num">${pad(i + 1, 2)}</span><span class="sheet-type">${c.type}</span><span class="sheet-range">${range(i)}</span><span class="sheet-topic">${c.topic}</span></a></li>`
  )
  .join("");

// Whole-track waveform: intensity varies by segment, the intro starts by swelling and the ending fades down
const ENERGY = [0.5, 0.66, 0.95, 0.55, 0.28, 0.45];
const songValues = chapters.flatMap((c, i) => {
  const n = c.bars * 4;
  const v = waveValues(7 * i + 3, n, 0.08);
  return v.map((x, k) => {
    const s = k / n;
    const shape = i === 0 ? 0.5 + 0.5 * s : i === chapters.length - 1 ? 1 - 0.8 * s : 1;
    return Math.min(1, 0.1 + x * (ENERGY[i] ?? 0.6) * shape * 1.2);
  });
});
const svgBars = (vals) => {
  let d = "";
  vals.forEach((v, i) => {
    const h = Math.max(6, Math.round(96 * v));
    d += `M${i + 0.18} ${(100 - h) / 2}h0.64v${h}h-0.64z`;
  });
  return `<svg viewBox="0 0 ${vals.length} 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
};
$$("[data-wave]").forEach((el) => {
  const per = +el.dataset.wave || 4;
  const step = 4 / per;
  const vals = [];
  for (let i = 0; i < songValues.length; i += step) vals.push(Math.max(...songValues.slice(i, i + step)));
  const svg = svgBars(vals);
  const cue = el.classList.contains("transport-wave") ? '<span class="wave-cue"><span></span></span>' : "";
  el.insertAdjacentHTML("afterbegin", `<span class="wave-base">${svg}</span><span class="wave-played">${svg}</span>${cue}<span class="wave-ph"><span></span></span>`);
});

/* ---------- Odometer: only the changed digit rolls one step ---------- */
function odometer(name, digits) {
  const wheels = [];
  $$(`[data-odo="${name}"]`).forEach((host) => {
    host.innerHTML = '<span class="odo-d"><span class="odo-stack"><span data-cur>0</span><span data-next>0</span></span></span>'.repeat(digits);
    $$(".odo-d", host).forEach((el, place) => wheels.push({ el, cur: $("[data-cur]", el), next: $("[data-next]", el), place }));
  });
  const fmt = (v) => pad(v, digits).slice(-digits);
  let value = 0;
  let tween = null;
  const settle = (v) => {
    const s = fmt(v);
    wheels.forEach((w) => (w.cur.textContent = w.next.textContent = s[w.place]));
    gsap.set(wheels.map((w) => w.el), { "--d": 0 });
  };
  settle(0);
  return (v, dir = 1, instant = false) => {
    if (v === value) return;
    tween?.progress(1);
    value = v;
    if (instant) return settle(v);
    const s = fmt(v);
    const moving = wheels.filter((w) => w.cur.textContent !== s[w.place]);
    if (!moving.length) return;
    moving.forEach((w) => (w.next.textContent = s[w.place]));
    const els = moving.map((w) => w.el);
    gsap.set(els, { "--dir": dir });
    tween = gsap.fromTo(els, { "--d": 0 }, { "--d": 1, duration: 0.24, ease: EASE.snap, onComplete: () => { settle(v); tween = null; } });
  };
}
const odo = { bar: odometer("bar", 3), min: odometer("min", 1), sec: odometer("sec", 2) };

/* ---------- Shared fixed frame ---------- */
const hold = (sec, svh) => {
  sec.style.setProperty("--hold", `${svh}svh`);
  sec.classList.add("is-centered");
  return () => sec.classList.remove("is-centered");
};
// How far to lower target so that the center of anchor lands at the center of frame
const centreOn = (frame, target, anchor) => () => {
  const f = frame.getBoundingClientRect();
  const a = anchor.getBoundingClientRect();
  const ty = Number(gsap.getProperty(target, "y")) || 0;
  const ay = anchor === target ? 0 : Number(gsap.getProperty(anchor, "y")) || 0;
  return f.top + frame.clientHeight / 2 - (a.top + a.height / 2 - ty - ay);
};
const readingScroll = (sec, frame, animation) =>
  ScrollTrigger.create({
    trigger: sec,
    start: () => docTop(sec) - chrome(),
    end: () => docTop(sec) - chrome() + Math.max(1, sec.clientHeight - frame.clientHeight),
    animation,
    scrub: true,
    invalidateOnRefresh: true,
  });
/* ---------- 00 Gauge · Transport ---------- */
const marks = $$(".transport-marks > li");
const setCurrent = (r) => $$(".transport-marks a, #sheet a").forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === chapters[r].href)));

function initTransport({ desktop, reduce }) {
  const lanes = $$("[data-wave]");
  const active = $(".transport-active");
  let stops = [];
  let cur = -1;
  let lastU = 0;
  const moveActive = (i, animate) => {
    const li = marks[i];
    if (!li || !li.offsetWidth) return;
    gsap.to(active, { x: li.offsetLeft, scaleX: li.offsetWidth / 100, duration: animate && !reduce ? beats(1) : 0, ease: EASE.snap, overwrite: true });
  };
  // Converts scroll position into ”which step it is” — between ranges it is joined with a straight line
  const update = (y) => {
    if (stops.length < 2) return;
    let r = 0;
    while (r < chapters.length - 1 && y >= stops[r + 1]) r++;
    const span = stops[r + 1] - stops[r];
    const o = span > 0 ? gsap.utils.clamp(0, 1, (y - stops[r]) / span) : 1;
    const u = starts[r] + o * chapters[r].bars;
    const dir = u >= lastU ? 1 : -1;
    lastU = u;
    const p = (u / total).toFixed(5);
    lanes.forEach((l) => l.style.setProperty("--p", p));
    odo.bar(Math.min(total, Math.floor(u) + 1), dir, reduce);
    const t = Math.floor(u * BAR);
    odo.min(Math.floor(t / 60), dir, reduce);
    odo.sec(t % 60, dir, reduce);
    if (r !== cur) {
      const first = cur < 0;
      cur = r;
      gsap.to($$('[data-roll="type"], [data-roll="topic"]'), { "--i": r, duration: reduce || first ? 0 : beats(1), ease: EASE.snap, overwrite: true });
      moveActive(r, !first);
      setCurrent(r);
    }
  };
  // Section start = When that section’s top reaches the center of the screen, curve end = Finale’s data-song-end
  const measure = () => {
    const max = ScrollTrigger.maxScroll(window);
    stops = chapters.map((c, i) => (i === 0 ? 0 : Math.min(max, Math.max(0, docTop(c.el) - innerHeight * 0.5))));
    for (let i = 1; i < stops.length; i++) stops[i] = Math.max(stops[i], stops[i - 1]);
    const end = $("[data-song-end]");
    const e = end ? Math.min(max, docTop(end) - chrome()) : max;
    stops.push(Math.max(e, stops[stops.length - 1] + 1));
    if (cur >= 0) moveActive(cur, false);
    update(scrollY);
  };
  const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => update(s.scroll()) });
  ScrollTrigger.addEventListener("refresh", measure);
  measure();
  const off = [() => ScrollTrigger.removeEventListener("refresh", measure), () => st.kill()];

  if (desktop) {
    const info = $$("[data-mark-info]");
    if (reduce) {
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => gsap.set(info, { autoAlpha: s.scroll() > 80 ? 0 : 1 }) });
    } else {
      const fold = gsap.timeline({ paused: true }).to(info, { yPercent: 45, autoAlpha: 0, duration: beats(1), ease: EASE.inOut, stagger: SIXTEENTH / 2 });
      ScrollTrigger.create({
        start: 0,
        end: () => innerHeight * 0.12,
        onLeave: () => fold.play(),
        onEnterBack: () => fold.reverse(),
        onRefresh: (s) => fold.progress(s.progress >= 1 ? 1 : 0),
      });
      const wave = $(".transport-wave");
      const label = $(".cue-label");
      gsap.set(wave, { "--cue": 0, "--cue-o": 0 });
      const hide = () => gsap.to(wave, { "--cue-o": 0, duration: beats(0.5), overwrite: "auto" });
      $$(".transport-marks a").forEach((a, i) => {
        const show = () => {
          label.textContent = `Bar ${pad(starts[i] + 1, 3)}`;
          gsap.to(wave, { "--cue": starts[i] / total, "--cue-o": 1, duration: beats(1), ease: EASE.out, overwrite: "auto" });
        };
        a.addEventListener("pointerenter", show);
        a.addEventListener("focus", show);
        a.addEventListener("pointerleave", hide);
        a.addEventListener("blur", hide);
        off.push(() => {
          a.removeEventListener("pointerenter", show);
          a.removeEventListener("focus", show);
          a.removeEventListener("pointerleave", hide);
          a.removeEventListener("blur", hide);
        });
      });
      gsap.from(".transport-wave .wave-base", { scaleY: 0.05, transformOrigin: "50% 50%", duration: beats(2), delay: beats(0.25), ease: EASE.out });
    }
  } else {
    const strip = $(".strip");
    const hero = chapters[0].el;
    const show = (on, instant) =>
      gsap.to(strip, { yPercent: on ? 0 : -100, autoAlpha: on ? 1 : 0, duration: instant || reduce ? 0 : beats(0.75), ease: on ? EASE.out : EASE.snap, overwrite: true });
    show(false, true);
    ScrollTrigger.create({
      start: () => Math.max(1, docTop(hero) + hero.offsetHeight - chrome()),
      end: "max",
      invalidateOnRefresh: true,
      onToggle: (s) => show(s.isActive),
      onRefresh: (s) => show(s.isActive, true),
    });
    off.push(() => gsap.set(strip, { clearProps: "transform,opacity,visibility" }));
  }
  return () => off.forEach((f) => f());
}

// Mobile section list — tap the strip to drop it down
const stripBtn = $(".strip-btn");
const sheet = $("#sheet");
let sheetOpen = false;
const setSheet = (open) => {
  sheetOpen = open;
  stripBtn.setAttribute("aria-expanded", String(open));
  sheet.inert = !open;
  const r = reducedNow();
  if (open) {
    gsap.fromTo(sheet, { autoAlpha: 0, yPercent: -3 }, { autoAlpha: 1, yPercent: 0, duration: r ? 0 : beats(1), ease: EASE.out, overwrite: true });
    if (!r) gsap.fromTo($$("li", sheet), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: beats(1), stagger: SIXTEENTH / 2, ease: EASE.out, overwrite: true });
  } else {
    gsap.to(sheet, { autoAlpha: 0, yPercent: -3, duration: r ? 0 : beats(0.5), ease: EASE.snap, overwrite: true });
  }
};
stripBtn.addEventListener("click", () => setSheet(!sheetOpen));
sheet.addEventListener("click", (e) => e.target.closest("a") && setSheet(false));
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sheetOpen) {
    setSheet(false);
    stripBtn.focus();
  }
});
document.addEventListener("pointerdown", (e) => sheetOpen && !e.target.closest(".strip") && setSheet(false));

/* ---------- 01 Hero wordmark ---------- */
const METER = [0.62, 0.9, 0.48, 1, 0.7, 0.55, 0.95, 0.66, 0.8, 0.42];
const heroTitle = $(".hero-title");
const heroMark = $(".hero-title .wordmark");
const fitHero = () => {
  heroTitle.style.setProperty("--fit", "1");
  const k = heroTitle.clientWidth / Math.max(1, heroMark.scrollWidth);
  heroTitle.style.setProperty("--fit", String(Math.min(1, Math.floor(k * 1000) / 1000)));
};

function initHero({ desktop, reduce }) {
  if (reduce) return;
  const chars = SplitText.create(heroMark, { type: "chars" }).chars;
  const lift = (i) => METER[i % METER.length];
  gsap.set(chars, { transformOrigin: "50% 100%" });
  let ready = false;
  gsap
    .timeline({ delay: 0.15, onComplete: () => (ready = true) })
    .to(chars, { scaleY: (i) => 1 + 0.2 * lift(i), duration: beats(0.25), stagger: SIXTEENTH / 2 }, 0)
    .to(chars, { scaleY: 1, duration: beats(2), stagger: SIXTEENTH / 2, ease: EASE.release }, beats(0.25));
  const setters = chars.map((c) => gsap.quickTo(c, "scaleY", { duration: beats(1), ease: EASE.release }));
  const now = chars.map(() => 1);
  let vel = 0;
  let px = null;
  let centers = [];
  let cw = 1;
  // The faster the scroll, the more the letters shoot up like a meter, and letters near the cursor swell in a bell shape
  const tick = () => {
    if (!ready) return;
    vel *= 0.9;
    const level = Math.min(1, Math.abs(vel) / 3000);
    chars.forEach((c, i) => {
      let s = 1 + level * lift(i) * 0.2;
      if (px !== null && centers.length) {
        const d = (centers[i] - px) / cw;
        s = Math.max(s, 1 + 0.14 * Math.exp(-d * d * 0.6));
      }
      if (Math.abs(s - now[i]) > 0.003) {
        now[i] = s;
        setters[i](s);
      }
    });
  };
  let on = false;
  const start = () => { if (!on) gsap.ticker.add(tick); on = true; };
  const stop = () => { gsap.ticker.remove(tick); on = false; };
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (s) => (vel = s.getVelocity()),
    onToggle: (s) => (s.isActive ? start() : stop()),
  });
  start();
  const off = [stop];
  if (desktop && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const enter = () => {
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      cw = Math.max(1, heroMark.getBoundingClientRect().width / chars.length);
    };
    const move = (e) => (px = e.clientX);
    const leave = () => (px = null);
    heroMark.addEventListener("pointerenter", enter);
    heroMark.addEventListener("pointermove", move);
    heroMark.addEventListener("pointerleave", leave);
    off.push(() => {
      heroMark.removeEventListener("pointerenter", enter);
      heroMark.removeEventListener("pointermove", move);
      heroMark.removeEventListener("pointerleave", leave);
    });
  }
  return () => off.forEach((f) => f());
}

/* ---------- 02 Steps ---------- */
// Timeline is laid out in 0~100 units and scroll progress is used directly as time. 22·44·64 are the stage boundaries
const STEP_AT = [22, 44, 64];
const STEP_SNAP = [21.99, 43.99, 63.99, 100];
const STEP_JUMP = [16, 36, 56, 94];
const stepOf = (t) => (t < STEP_AT[0] ? 0 : t < STEP_AT[1] ? 1 : t < STEP_AT[2] ? 2 : 3);

function initVersions({ desktop, reduce }) {
  const sec = $(".ver");
  const frame = $("[data-frame]", sec);
  const desk = $("[data-desk]", sec);
  const titles = $$("[data-title]", sec);
  const bodies = $$("[data-body]", sec);
  const gotos = $$("[data-goto]", sec);
  const ind = $(".ver-ind", sec);
  const cursor = $("[data-cursor]", sec);
  const rowM = $(".row-m", sec);
  const rowB = $(".row-b", sec);
  const lane = $(".lane", sec);
  const seg = (k) => $(`[data-seg="${k}"]`, sec);
  const segBars = (k) => $$(".bars > i", seg(k));
  const rowGap = () => rowB.offsetTop - rowM.offsetTop;
  const barPx = (n) => () => (lane.offsetWidth * n) / 72;
  const sweepRange = desktop ? [0, 72] : [32, 72];
  const tracked = $$("[data-seg][data-start]", sec).map((el) => ({ el, start: +el.dataset.start, len: +el.dataset.len, set: gsap.quickSetter(el, "--pp") }));
  const litFirst = $$('[data-lit="m-old"], [data-lit="b-new"]', sec);
  const litBranch = $$('[data-lit="b-new"]', sec);
  const litNew = $$('[data-lit="m-new"]', sec);

  const chars = titles.map((t) => SplitText.create(t, { type: "words,chars", mask: "chars" }).chars);
  gsap.set(titles, { autoAlpha: 1 });
  chars.forEach((c, i) => gsap.set(c, { yPercent: i === 0 ? 0 : 110 }));
  gsap.set(bodies, { autoAlpha: (i) => (i === 0 ? 1 : 0) });

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const swap = (a, b, at) =>
    tl
      .to(chars[a], { yPercent: -110, duration: 3, stagger: 0.18, ease: EASE.inOut }, at)
      .fromTo(chars[b], { yPercent: 110 }, { yPercent: 0, duration: 3, stagger: 0.18, ease: EASE.inOut }, at + 1.2)
      .to(bodies[a], { autoAlpha: 0, y: -8, duration: 1.5, ease: EASE.inOut }, at)
      .fromTo(bodies[b], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 2, ease: EASE.inOut }, at + 1.5)
      .to(ind, { xPercent: 100 * b, duration: 3, ease: EASE.inOut }, at);

  // Step 1: track B descends from behind track A and the branch lines are drawn
  tl.fromTo(rowB, { y: () => -rowGap() }, { y: 0, duration: 14, ease: EASE.inOut }, 1)
    .fromTo("[data-branch]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 12, ease: EASE.inOut }, 2)
    .fromTo($$(".row-b [data-seg]", sec), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 3, stagger: 1.6, ease: EASE.inOut }, 4);
  swap(0, 1, STEP_AT[0]);
  // Step 2: one segment of B folds and a short new segment grows in
  tl.to(segBars("b-old"), { scaleY: 0.06, duration: 3, stagger: 0.25, ease: EASE.inOut }, 24)
    .to(seg("b-old"), { autoAlpha: 0, duration: 1.5 }, 29)
    .to(seg("b-last"), { x: () => -barPx(4)(), duration: 5, ease: EASE.inOut }, 28)
    .fromTo(seg("b-new"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 30)
    .fromTo(segBars("b-new"), { scaleY: 0.06 }, { scaleY: 1, duration: 3, stagger: 0.4, ease: EASE.out }, 30.5)
    .fromTo("[data-mark]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 3 }, 38);
  swap(1, 2, STEP_AT[1]);
  // Step 3: the playhead sweeps both tracks together, and only the differing ranges light up in the accent color
  const sweep = { c: 0 };
  tl.fromTo(cursor, { autoAlpha: 0 }, { autoAlpha: 1, duration: 2 }, 46)
    .fromTo(tracked.map((t) => t.el), { "--pp": 1 }, { "--pp": 0, duration: 2, ease: EASE.inOut }, 46)
    .fromTo(litFirst, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 48)
    .fromTo(
      sweep,
      { c: 0 },
      {
        c: 1,
        duration: 17,
        ease: "none",
        immediateRender: false,
        onUpdate: () => {
          desk.style.setProperty("--c", sweep.c.toFixed(4));
          const bar = sweepRange[0] + sweep.c * (sweepRange[1] - sweepRange[0]);
          tracked.forEach((t) => t.set(gsap.utils.clamp(0, 1, (bar - t.start) / t.len)));
        },
      },
      48.5
    )
    .to(cursor, { autoAlpha: 0, duration: 1.5 }, 63)
    .to(litFirst, { autoAlpha: 0, duration: 1.5 }, 63)
    .to(tracked.map((t) => t.el), { "--pp": 1, duration: 2, ease: EASE.inOut }, 63);
  swap(2, 3, STEP_AT[2]);
  // Step 4: A’s old section folds up, B’s new section flies up and attaches, then the version number rises
  const mNew = seg("m-new");
  tl.to(segBars("m-old"), { scaleY: 0.06, duration: 3, stagger: 0.2, ease: EASE.inOut }, 65)
    .to(seg("m-old"), { autoAlpha: 0, duration: 2 }, 68)
    .fromTo(litBranch, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.5 }, 66)
    .fromTo(mNew, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 69)
    .fromTo(litNew, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 69)
    .fromTo(mNew, { y: () => rowGap() }, { y: () => 0.72 * rowGap(), duration: 3, ease: EASE.out }, 69)
    .to(mNew, { y: 0, duration: 9, ease: EASE.inOut }, 72)
    .to(litBranch, { autoAlpha: 0, duration: 3, ease: EASE.inOut }, 74)
    .to(seg("m-last"), { x: () => -barPx(4)(), duration: 6, ease: EASE.inOut }, 76)
    .to("[data-ver]", { scrambleText: { text: "v02", chars: "0123456789" }, duration: 3 }, 83)
    .fromTo("[data-ver-on]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 2 }, 85)
    .to(litNew, { autoAlpha: 0, duration: 5, ease: EASE.inOut }, 88)
    .set({}, {}, 100);

  let shown = -1;
  tl.eventCallback("onUpdate", () => {
    const s = stepOf(tl.time());
    if (s === shown) return;
    shown = s;
    gotos.forEach((b, i) => (i === s ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current")));
  });

  let W = 0;
  let H = 0;
  let Z = 1;
  // Starts when the desk enters 60% of screen height, ends just before the frame releases
  const measure = () => {
    const top = docTop(sec);
    H = top - chrome();
    W = Math.min(top + (desk.getBoundingClientRect().top - frame.getBoundingClientRect().top) - innerHeight * 0.6, H);
    Z = Math.max(H + 1, top + sec.offsetHeight - frame.offsetHeight - chrome());
  };
  const timeAt = (p) => (reduce ? STEP_SNAP[stepOf(p * 100)] : p * 100);
  ScrollTrigger.create({
    trigger: sec,
    start: () => (measure(), W),
    end: () => Z,
    invalidateOnRefresh: true,
    // To remeasure a tween that depends on layout values, rewind it to the start and invalidate it so the start values don’t get tangled
    onRefresh: (s) => {
      tl.time(0);
      tl.invalidate();
      tl.time(timeAt(s.progress));
    },
    onUpdate: (s) => tl.time(timeAt(s.progress)),
  });
  tl.time(timeAt(0));
  ScrollTrigger.create({ trigger: sec, start: () => H, end: () => Z, onToggle: (s) => smooth?.setDamping(s.isActive && !reduce ? 0.6 : 1) });
  hooks.verGoto = (i) => scrollToY(W + (STEP_JUMP[i] / 100) * Math.max(1, Z - W), 1.4);
  return () => {
    hooks.verGoto = null;
    smooth?.setDamping(1);
  };
}
$$("[data-goto]").forEach((b) => b.addEventListener("click", () => hooks.verGoto?.(+b.dataset.goto)));

/* ---------- 03 Feature pad ---------- */
const q = (root, k) => $$(`[data-d="${k}"]`, root);
const q1 = (root, k) => q(root, k)[0];
// Each demo is composed in tempo units starting from l (start time). Held in one repeating timeline that runs only while the section is visible
const DEMOS = {
  range(st, tl, l) {
    tl.from(q1(st, "range"), { scaleX: 0, transformOrigin: "0% 50%", duration: beats(1) }, l)
      .from(q1(st, "bubble"), { y: 10, autoAlpha: 0, duration: beats(1) }, l + beats(1.5))
      .from(q1(st, "reply"), { x: -8, autoAlpha: 0, duration: beats(1) }, l + beats(3.5));
  },
  sweep(st, tl, l) {
    tl.fromTo(q1(st, "ph"), { left: "0%" }, { left: "100%", duration: beats(8), ease: "none" }, l)
      .from(q(st, "chord"), { y: 8, autoAlpha: 0, duration: beats(0.5), stagger: beats(2) }, l);
  },
  blocks(st, tl, l) {
    tl.from($$('[data-d="sec"] i', st), { scaleX: 0, transformOrigin: "0% 50%", duration: beats(1), stagger: beats(1) }, l)
      .from($$('[data-d="sec"] b', st), { y: 6, autoAlpha: 0, duration: beats(0.5), stagger: beats(1) }, l + beats(0.5));
  },
  ab(st, tl) {
    const ind = q1(st, "abind");
    const wa = q1(st, "wa");
    const wb = q1(st, "wb");
    const opts = q(st, "abopt");
    const f = beats(0.25);
    const pick = (k) => opts.forEach((o, j) => o.toggleAttribute("data-on", j === k));
    tl.call(pick, [0], 0)
      .set(ind, { xPercent: 0 }, 0)
      .set(wa, { autoAlpha: 1 }, 0)
      .set(wb, { autoAlpha: 0 }, 0)
      .fromTo(q1(st, "abph"), { left: "0%" }, { left: "100%", duration: beats(8), ease: "none" }, 0);
    for (let r = 1; r <= 4; r++) {
      const odd = r % 2 === 1;
      const at = r * beats(2) - f;
      tl.to(ind, { xPercent: odd ? 100 : 0, duration: f, ease: EASE.inOut }, at)
        .to(wa, { autoAlpha: odd ? 0 : 1, duration: f, ease: EASE.inOut }, at)
        .to(wb, { autoAlpha: odd ? 1 : 0, duration: f, ease: EASE.inOut }, at)
        .call(pick, [odd ? 1 : 0], at + f / 2);
    }
  },
  relay(st, tl) {
    const cards = q(st, "card");
    const packet = q1(st, "packet");
    const specs = q(st, "spec");
    const n = 3;
    const cycle = beats(8);
    const cx = (k) => cards[k].offsetLeft + cards[k].offsetWidth / 2;
    const spec = (c, k) => specs[c * n + k];
    specs.forEach((s, k) => gsap.set(s, { autoAlpha: k % n === n - 1 ? 1 : 0, y: 0 }));
    for (let r = 0; r < n; r++) {
      const s0 = r * cycle;
      cards.forEach((card, c) => {
        const at = s0 + c * beats(2);
        tl.fromTo(spec(c, (r + n - 1) % n), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -6, duration: beats(0.5), ease: EASE.inOut, immediateRender: false }, at)
          .fromTo(spec(c, r), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: beats(0.5), immediateRender: false }, at + beats(0.25))
          .fromTo(card, { "--hit": 1 }, { "--hit": 0, duration: beats(1.5), immediateRender: false }, at);
      });
      tl.fromTo(packet, { x: cx(0), autoAlpha: 0 }, { autoAlpha: 1, duration: beats(0.5), immediateRender: false }, s0)
        .to(packet, { x: cx(1), duration: beats(1.5), ease: EASE.inOut }, s0 + beats(0.5))
        .to(packet, { x: cx(2), duration: beats(1.5), ease: EASE.inOut }, s0 + beats(2.5))
        .to(packet, { autoAlpha: 0, duration: beats(0.5) }, s0 + beats(4.5));
    }
  },
  rec(st, tl, l) {
    const time = q1(st, "time");
    const t = { v: 0 };
    tl.from($$(".bars > i", q1(st, "take")), { scaleY: 0.05, duration: beats(0.5), stagger: SIXTEENTH }, l)
      .fromTo(q1(st, "dot"), { autoAlpha: 1 }, { autoAlpha: 0.15, duration: beats(0.5), ease: "none", repeat: 21, yoyo: true }, l)
      .fromTo(t, { v: 0 }, { v: 9, duration: beats(10.5), ease: "none", onUpdate: () => (time.textContent = `0:0${Math.floor(t.v)}`) }, l);
  },
  themes(st, tl) {
    const rooms = q(st, "room");
    const sws = q(st, "sw");
    const ind = q1(st, "ind");
    const n = rooms.length;
    const f = beats(0.75);
    const x = (k) => sws[k].offsetLeft - 4;
    const press = (k) => sws.forEach((s, j) => s.setAttribute("aria-pressed", String(j === k)));
    tl.set(rooms, { autoAlpha: 0 }, 0).set(rooms[0], { autoAlpha: 1 }, 0).set(ind, { x: x(0) }, 0).call(press, [0], 0);
    for (let k = 1; k <= n; k++) {
      const at = k * beats(2) - f;
      const to = k % n;
      tl.to(ind, { x: x(to), duration: f, ease: EASE.inOut }, at)
        .to(rooms[to], { autoAlpha: 1, duration: f, ease: EASE.inOut }, at)
        .to(rooms[k - 1], { autoAlpha: 0, duration: f, ease: EASE.inOut }, at)
        .call(press, [to], at);
    }
    // Clicking a swatch directly stops the auto cycle and stays on that theme
    st.onclick = (e) => {
      const sw = e.target.closest('[data-d="sw"]');
      if (!sw) return;
      const k = sws.indexOf(sw);
      st.dataset.held = "true";
      tl.pause();
      press(k);
      gsap.to(ind, { x: x(k), duration: f, ease: EASE.inOut, overwrite: true });
      rooms.forEach((r, j) => gsap.to(r, { autoAlpha: j === k ? 1 : 0, duration: f, ease: EASE.inOut, overwrite: true }));
    };
  },
  drum(st, tl) {
    const lines = q(st, "line");
    const n = lines.length;
    const h = lines[0].offsetHeight || 40;
    const ang = 26;
    const radius = h / (2 * Math.sin((ang * Math.PI) / 360));
    const o = { v: 0 };
    // Places lines around a cylinder and rolls them. Brighter as they come forward, hidden past 90 degrees
    const render = () =>
      lines.forEach((el, k) => {
        let d = (((k - o.v) % n) + n) % n;
        if (d > n / 2) d -= n;
        const a = Math.max(-90, Math.min(90, d * ang));
        const rad = (a * Math.PI) / 180;
        gsap.set(el, { y: radius * Math.sin(rad), z: radius * (Math.cos(rad) - 1), rotationX: -a, autoAlpha: Math.max(0, Math.cos(rad)) ** 2 });
      });
    render();
    tl.fromTo(o, { v: 0 }, { v: n, duration: n * beats(2), ease: "none", onUpdate: render }, 0);
  },
  grid(st, tl, l) {
    tl.from(q(st, "note"), { scaleX: 0, transformOrigin: "0% 50%", duration: beats(0.5), stagger: EIGHTH }, l)
      .from(q1(st, "sel"), { scale: 0, transformOrigin: "0% 0%", duration: beats(1) }, l + beats(5))
      .from($$("[data-sel] i", st), { autoAlpha: 0, duration: beats(0.5) }, l + beats(6));
  },
  steps(st, tl, l) {
    const steps = q(st, "step");
    const boxes = q(st, "box");
    const conns = q(st, "conn");
    const stage = q1(st, "stage");
    const cur = q1(st, "current");
    const names = steps.map((s) => $(".rm-name", s).textContent);
    const at = (k) => {
      steps.forEach((s, j) => (s.dataset.state = j < k ? "done" : j === k ? "current" : "ahead"));
      stage.textContent = `${k + 1}/${steps.length}`;
      cur.textContent = names[k];
    };
    tl.call(at, [0], 0).set(conns, { scaleX: 0, transformOrigin: "0% 50%" }, 0);
    for (let r = 1; r <= 3; r++) {
      const t = l + r * beats(2);
      tl.to(conns[r - 1], { scaleX: 1, duration: beats(1), ease: EASE.inOut }, t - beats(1))
        .call(at, [r], t)
        .fromTo(boxes[r], { scale: 1.15 }, { scale: 1, duration: beats(0.5), ease: EASE.release, immediateRender: false }, t);
    }
  },
  check(st, tl, l) {
    tl.from(q(st, "tick"), { drawSVG: "0%", duration: beats(0.5), stagger: beats(2) }, l + beats(0.5))
      .from(q(st, "strike"), { scaleX: 0, transformOrigin: "0% 50%", duration: beats(1), stagger: beats(2) }, l + beats(1));
  },
  chat(st, tl, l) {
    tl.from(q(st, "msg"), { y: 14, autoAlpha: 0, duration: beats(1), stagger: beats(2) }, l);
  },
  files(st, tl, l) {
    tl.from(q(st, "res"), { x: 16, autoAlpha: 0, duration: beats(1), stagger: beats(1) }, l);
  },
  feed(st, tl, l) {
    tl.from(q(st, "date"), { autoAlpha: 0, duration: beats(0.5) }, l).from(q(st, "act"), { y: 10, autoAlpha: 0, duration: beats(1), stagger: beats(1.5) }, l + beats(0.5));
  },
  tags(st, tl, l) {
    tl.from(q(st, "role"), { scale: 0, transformOrigin: "0% 50%", autoAlpha: 0, duration: beats(0.5), ease: EASE.snap, stagger: beats(1) }, l);
  },
  export(st, tl, l) {
    const pct = q1(st, "pct");
    const t = { v: 0 };
    tl.from(q1(st, "fill"), { scaleX: 0, transformOrigin: "0% 50%", duration: beats(4), ease: EASE.inOut }, l)
      .fromTo(t, { v: 0 }, { v: 100, duration: beats(4), ease: EASE.inOut, onUpdate: () => (pct.textContent = `${Math.round(t.v)}%`) }, l)
      .from(q1(st, "file"), { y: 8, autoAlpha: 0, duration: beats(1) }, l + beats(4))
      .from(q1(st, "link"), { x: -8, autoAlpha: 0, duration: beats(1) }, l + beats(6));
  },
};
// Demos that would look awkward without a constantly filled screen run right away with no fade in or out
const NO_FADE = new Set(["ab", "relay", "themes", "drum"]);

const cho = $(".cho");
const screen = $("[data-screen]", cho);
const demoBox = $("[data-screen-demo]", cho);
const pads = $$(".pad", cho);
let padIndex = 0;
let demoTl = null;
let demoReady = false;
let choInView = false;
let swapping = false;
let queued = null;

const syncDemo = () => {
  if (!demoTl) return;
  const play = choInView && demoReady && !swapping && !reducedNow() && !$("[data-held]", demoBox);
  play ? demoTl.play() : demoTl.pause();
};
function mountDemo(i, afterSwap = false) {
  demoTl?.kill();
  demoTl = null;
  demoReady = false;
  const type = pads[i].dataset.demo;
  const tpl = $(`template[data-demo="${type}"]`, cho);
  demoBox.replaceChildren(tpl ? tpl.content.cloneNode(true) : "");
  fillBars(demoBox);
  const stage = $("[data-stage]", demoBox);
  if (!stage || !DEMOS[type]) return;
  if (reducedNow() && type !== "themes") return;
  const tl = gsap.timeline({ paused: true, repeat: -1 });
  const fade = !NO_FADE.has(type);
  if (fade) tl.fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: beats(0.5), ease: EASE.out }, 0);
  DEMOS[type](stage, tl, fade ? beats(0.5) : 0);
  if (fade) tl.to(stage, { autoAlpha: 0, duration: beats(0.5), ease: EASE.snap }, `+=${beats(4)}`);
  demoTl = tl;
  if (reducedNow()) return tl.time(0.001);
  gsap.delayedCall(afterSwap ? beats(1) : 0, () => {
    if (demoTl !== tl) return;
    demoReady = true;
    syncDemo();
  });
}
const fillScreen = (i) => {
  $("[data-screen-num]", screen).textContent = `Pad ${pad(i + 1, 2)}`;
  $("[data-screen-title]", screen).textContent = $(".pad-name", pads[i]).textContent;
  $("[data-screen-body]", screen).textContent = pads[i].dataset.body || "";
};
pads.forEach((p, i) =>
  p.addEventListener("click", () => {
    gsap.fromTo(p, { scale: 0.95 }, { scale: 1, duration: beats(1), ease: EASE.release, overwrite: true });
    if (i === padIndex) return;
    padIndex = i;
    pads.forEach((x, k) => {
      x.toggleAttribute("data-on", k === i);
      x.setAttribute("aria-pressed", String(k === i));
    });
    if (reducedNow()) {
      fillScreen(i);
      mountDemo(i);
      return;
    }
    queued = i;
    if (swapping) return;
    swapping = true;
    syncDemo();
    gsap.to($$("[data-in]", screen), { yPercent: -105, duration: beats(0.5), ease: EASE.snap, stagger: SIXTEENTH, overwrite: true });
    gsap.to($$("[data-fade]", screen), {
      autoAlpha: 0,
      duration: beats(0.5),
      ease: EASE.snap,
      overwrite: true,
      onComplete: () => {
        swapping = false;
        const k = queued;
        queued = null;
        fillScreen(k);
        mountDemo(k, true);
        gsap.fromTo($$("[data-in]", screen), { yPercent: 105 }, { yPercent: 0, duration: beats(1), ease: EASE.out, stagger: EIGHTH, overwrite: true });
        gsap.fromTo($$("[data-fade]", screen), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: beats(1), delay: beats(0.25), ease: EASE.out, stagger: EIGHTH, overwrite: true });
      },
    });
  })
);
ScrollTrigger.create({ trigger: cho, start: "top bottom", end: "bottom top", onToggle: (s) => { choInView = s.isActive; syncDemo(); } });
mountDemo(0);

/* ---------- 04 Phone ---------- */
const CHORDS = ["A", "B", "C", "D"];
const REH_BARS = 16;
function initRehearsal({ reduce }) {
  const sec = $(".reh");
  const frame = $(".frame", sec);
  const phone = $("[data-phone]", sec);
  const viewA = $('[data-view="a"]', sec);
  const viewB = $('[data-view="b"]', sec);
  const heads = $$(".ptrk-head", sec);
  const laneBars = $$("[data-plane] .bars", sec);
  const dots = $$("[data-dot]", sec);
  const lights = dots.map((d) => $("i", d));
  const rise = $$("[data-rise]", sec);
  const now = $("[data-chord-now]", sec);
  const next = $("[data-chord-next]", sec);
  const barText = $("[data-bar-text]", sec);
  const prog = $("[data-prog]", sec);
  const tos = $$("[data-to]", sec);
  const off = [];
  if (!reduce) off.push(hold(sec, +sec.dataset.hold || 120));
  const top = () => docTop(sec) - chrome();
  const travel = () => Math.max(1, sec.clientHeight - frame.clientHeight);

  // Metronome: over a 4-beat bar, dots light up one at a time with a slight bounce
  const metro = gsap.timeline({ paused: true });
  for (let b = 0; b < 4; b++) {
    metro
      .set(lights, { autoAlpha: 0 }, beats(b))
      .set(lights[b], { autoAlpha: 1 }, beats(b))
      .fromTo(dots[b], { scale: 1.18 }, { scale: 1, duration: beats(0.5), ease: EASE.release, immediateRender: false }, beats(b));
  }
  metro.set({}, {}, beats(4)).time(0);
  gsap.set(prog, { scaleX: 1 / REH_BARS, transformOrigin: "0% 50%" });
  let barIdx = 0;
  const spanBars = Math.min(4, REH_BARS);
  if (!reduce) {
    ScrollTrigger.create({
      trigger: sec,
      start: top,
      end: () => top() + 0.33 * travel(),
      invalidateOnRefresh: true,
      onUpdate: (s) => {
        const r = Math.min(s.progress * spanBars * 4, 4 * spanBars - 0.001);
        const b = Math.floor(r / 4);
        if (b !== barIdx) {
          barIdx = b;
          now.textContent = CHORDS[b % CHORDS.length];
          next.textContent = CHORDS[(b + 1) % CHORDS.length];
          barText.textContent = `Bar ${b + 1} / ${REH_BARS}`;
          gsap.fromTo([now, next], { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: beats(0.5), ease: EASE.out, overwrite: true });
          gsap.to(prog, { scaleX: (b + 1) / REH_BARS, duration: beats(0.5), ease: EASE.out, overwrite: true });
        }
        metro.time(beats(r % 4));
      },
    });
  }

  let mode = "a";
  const setMode = (m) => {
    mode = m;
    phone.dataset.mode = m;
    tos.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.to === m)));
  };
  setMode("a");
  gsap.set([viewA, viewB], { autoAlpha: 1 });
  const flip = gsap.timeline({ paused: true, defaults: { ease: EASE.inOut } });
  flip
    .fromTo(rise, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.45, stagger: 0.08 }, 0)
    .fromTo(heads, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.55)
    .fromTo(laneBars, { scaleY: 0.1, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: EASE.out }, 0.55)
    .set(viewA, { autoAlpha: 1 }, 0.499)
    .set(viewA, { autoAlpha: 0 }, 0.5);
  flip.eventCallback("onUpdate", () => {
    const m = flip.progress() >= 0.5 ? "b" : "a";
    if (m !== mode) setMode(m);
  });
  flip.progress(0);
  let st = ScrollTrigger.create({
    trigger: sec,
    start: () => top() + 0.35 * travel(),
    end: () => top() + 0.65 * travel(),
    invalidateOnRefresh: true,
    onUpdate: (s) => flip.progress(reduce ? (s.progress >= 0.5 ? 1 : 0) : s.progress),
  });
  // Once chosen with a button, scrolling no longer changes the view
  hooks.rehTo = (m) => {
    st?.kill();
    st = null;
    const t = m === "b" ? 1 : 0;
    reduce ? flip.progress(t) : gsap.to(flip, { progress: t, duration: beats(1.5), ease: EASE.inOut, overwrite: true });
  };
  return () => {
    off.forEach((f) => f());
    hooks.rehTo = null;
    now.textContent = CHORDS[0];
    next.textContent = CHORDS[1];
    barText.textContent = `Step 1 / ${REH_BARS}`;
  };
}
$$("[data-to]").forEach((b) => b.addEventListener("click", () => hooks.rehTo?.(b.dataset.to)));

/* ---------- 05 Manifesto ---------- */
function initPhilo({ reduce }) {
  if (reduce) return;
  const sec = $(".philo");
  const frame = $(".frame", sec);
  const doc = $("[data-doc]", sec);
  const chip = $("[data-chip]", sec);
  const title = $("[data-ptitle]", sec);
  const ins = $("[data-ins]", sec);
  const under = $(":scope > i", ins);
  const word = $(".philo-word", sec);
  const strike = $(".philo-del > i", sec);
  const dot = $("[data-pdot]", sec);
  const lines = $$("[data-line]", sec);
  const sign = $("[data-signature]", sec);
  const off = [hold(sec, +sec.dataset.hold || 180)];
  const chars = SplitText.create(ins, { type: "chars", mask: "chars" }).chars;

  chip.textContent = "v01";
  gsap.set([strike, under], { scaleX: 0 });
  gsap.set(word, { opacity: 1 });
  gsap.set(dot, { opacity: 1 });
  gsap.set(chars, { yPercent: 100 });
  gsap.set(lines, { autoAlpha: 0, y: 12 });
  gsap.set(sign, { autoAlpha: 0 });
  // At first one title line sits in the screen center, and after the rewrite the whole document rises to the center
  gsap.set(doc, { y: centreOn(frame, doc, title) });

  const tl = gsap.timeline({ paused: true });
  tl.to(chip, { scrambleText: { text: "v02", chars: "0123456789" }, duration: beats(1), ease: EASE.snap }, beats(1))
    .to(strike, { scaleX: 1, duration: beats(1), ease: EASE.inOut }, beats(1))
    .to(word, { opacity: 0.45, duration: beats(1), ease: EASE.inOut }, beats(1))
    .to(dot, { opacity: 0, duration: beats(0.5), ease: EASE.snap }, beats(1))
    .to(chars, { yPercent: 0, duration: beats(1), ease: EASE.out, stagger: SIXTEENTH }, beats(2))
    .to(under, { scaleX: 1, duration: beats(1), ease: EASE.inOut }, beats(2))
    .to(doc, { y: centreOn(frame, doc, doc), duration: beats(2), ease: EASE.inOut }, beats(4))
    .to(chip, { scrambleText: { text: "v03", chars: "0123456789" }, duration: beats(1), ease: EASE.snap }, beats(5));
  lines.forEach((li, k) => tl.to(li, { autoAlpha: 1, y: 0, duration: beats(1), ease: EASE.out }, beats(6 + 3 * k)));
  tl.to(sign, { autoAlpha: 1, duration: beats(1), ease: EASE.out }, beats(14)).set({}, {}, beats(16) + BAR);
  readingScroll(sec, frame, tl);
  return () => {
    off.forEach((f) => f());
    chip.textContent = "v03";
  };
}

/* ---------- 06·07 Pricing · FAQ ---------- */
function initReveals({ reduce }) {
  if (reduce) return;
  revealLines($(".cho [data-reveal]"), cho);
  revealLines($(".price [data-reveal]"), $(".price"), "top 85%", true);
  revealLines($(".faq-sec [data-reveal]"), $(".faq-sec"), "top 85%");
}

const faqItems = $$("[data-faq-item]");
const faqTags = $$(".faq-tags [data-tag]");
const openFaq = (item) => {
  faqItems.forEach((it) => {
    const on = it === item;
    it.toggleAttribute("data-open", on);
    $(".faq-q button", it).setAttribute("aria-expanded", String(on));
    $(".faq-panel", it).inert = !on;
  });
  if (item && !reducedNow()) gsap.fromTo($(".faq-panel p", item), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: beats(1), delay: beats(0.25), ease: EASE.out });
};
faqItems.forEach((it) => $(".faq-q button", it).addEventListener("click", () => openFaq(it.hasAttribute("data-open") ? null : it)));
faqTags.forEach((b) =>
  b.addEventListener("click", () => {
    const tag = b.dataset.tag;
    faqTags.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    openFaq(null);
    const shown = faqItems.filter((it) => {
      const on = tag === "all" || it.dataset.tag === tag;
      it.hidden = !on;
      return on;
    });
    if (!reducedNow()) gsap.fromTo(shown, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: beats(1), ease: EASE.out, stagger: SIXTEENTH, clearProps: "transform,opacity,visibility" });
  })
);
// When filtering or expanding changes the closing section’s height, re-measure where the curve ends too
{
  const outro = $(".outro");
  let h = outro.offsetHeight;
  let timer = 0;
  new ResizeObserver(() => {
    if (outro.offsetHeight === h) return;
    h = outro.offsetHeight;
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 320);
  }).observe(outro);
}

/* ---------- 08 Finale ---------- */
function initFinale({ reduce }) {
  const sec = $(".fin");
  const frame = $(".frame", sec);
  const comp = $(".fin-comp", sec);
  const stage = $("[data-stage]", sec);
  const files = $$("[data-file]", stage);
  const capsule = $("[data-capsule]", stage);
  const labels = $$("[data-label]", stage);
  const bars = $$(".fin-wave > i", stage);
  const floor = $(".fin-floor", stage);
  const end = $("[data-song-end]", sec);
  if (reduce) {
    gsap.set(labels, { yPercent: -100 });
    return () => gsap.set(labels, { clearProps: "all" });
  }
  const off = [hold(sec, +sec.dataset.hold || 110)];
  stage.classList.add("is-live");
  const W = stage.clientWidth;
  const H = stage.clientHeight;

  // Stack file chips in rows from the bottom. Rows get shorter going up, so it looks like a pile
  const rnd = seeded(142);
  const fh = Math.max(...files.map((f) => f.offsetHeight));
  const rows = [[]];
  let used = 0;
  files.forEach((f, k) => {
    const limit = W * Math.max(0.4, 0.94 - 0.16 * (rows.length - 1));
    if (used && used + f.offsetWidth + 10 > limit) {
      rows.push([]);
      used = 0;
    }
    rows[rows.length - 1].push(k);
    used += f.offsetWidth + 10;
  });
  const lift = Math.min(fh + 6, (H - fh - 8) / Math.max(1, rows.length - 1));
  const spot = [];
  rows.forEach((row, r) => {
    let x = (W - (row.reduce((s, k) => s + files[k].offsetWidth, 0) + (row.length - 1) * 10)) / 2;
    row.forEach((k) => {
      spot[k] = { x: gsap.utils.clamp(0, Math.max(0, W - files[k].offsetWidth), x + 6 * rnd() - 3), y: H - fh - 2 - r * lift, rotation: 8 * rnd() - 4 };
      x += files[k].offsetWidth + 10;
    });
  });
  const order = files.map((_, k) => k);
  const shuffle = seeded(12);
  for (let k = order.length - 1; k > 0; k--) {
    const j = Math.floor(shuffle() * (k + 1));
    [order[k], order[j]] = [order[j], order[k]];
  }

  gsap.set(capsule, { autoAlpha: 0, scale: 0.92 });
  gsap.set(labels, { yPercent: 0 });
  gsap.set(comp, { y: centreOn(frame, comp, comp) });
  files.forEach((f, k) => gsap.set(f, { x: spot[k].x, y: -H - 60, autoAlpha: 1 }));

  const tl = gsap.timeline({ paused: true });
  order.forEach((k, n) => tl.to(files[k], { y: spot[k].y, rotation: spot[k].rotation, duration: beats(1.5), ease: EASE.land }, n * EIGHTH));
  const T = beats(10);
  files.forEach((f, k) =>
    tl.to(f, { x: () => (stage.clientWidth - f.offsetWidth) / 2, y: () => (stage.clientHeight - f.offsetHeight) / 2, rotation: 0, scale: 0.2, autoAlpha: 0, duration: beats(1), ease: EASE.inOut }, T + k * SIXTEENTH)
  );
  tl.to(floor, { autoAlpha: 0, duration: beats(1), ease: EASE.inOut }, T);
  const pop = T + beats(1) + (files.length - 1) * SIXTEENTH;
  tl.to(capsule, { autoAlpha: 1, scale: 1, duration: beats(1), ease: EASE.release }, pop);
  const grow = pop + beats(1);
  tl.fromTo(bars, { scaleY: 0.2 }, { scaleY: 1, duration: beats(1), stagger: SIXTEENTH, immediateRender: false }, grow);
  tl.to(labels, { yPercent: -100, duration: beats(1), ease: EASE.snap }, grow + beats(1) + (bars.length - 1) * SIXTEENTH);
  const main = tl.duration();
  tl.set({}, {}, main + BAR);
  // The song’s last bar lands on the moment the capsule text changes (the bar after is afterglow)
  const markEnd = () => end.style.setProperty("--song-end", `${(sec.clientHeight - frame.clientHeight) * (main / tl.duration())}px`);
  markEnd();
  ScrollTrigger.addEventListener("refreshInit", markEnd);
  readingScroll(sec, frame, tl);
  return () => {
    off.forEach((f) => f());
    ScrollTrigger.removeEventListener("refreshInit", markEnd);
    stage.classList.remove("is-live");
  };
}

/* ---------- 09 Footer wordmark ---------- */
function initFootMark({ reduce }) {
  if (reduce) return;
  const chars = SplitText.create(".foot-mark .wordmark", { type: "chars" }).chars;
  gsap.from(chars, {
    scaleY: 0.05,
    transformOrigin: "50% 100%",
    duration: beats(1),
    ease: EASE.out,
    stagger: SIXTEENTH,
    scrollTrigger: { trigger: ".foot-mark", start: "top 85%", toggleActions: "play none none none" },
  });
}

/* ---------- Start ---------- */
document.fonts.ready.then(() => {
  fitHero();
  new ResizeObserver(fitHero).observe(heroTitle);
  gsap.matchMedia().add(MEDIA, (ctx) => {
    const c = ctx.conditions;
    const offs = [initTransport(c), initHero(c), initVersions(c), initRehearsal(c), initPhilo(c), initFinale(c), initReveals(c), initFootMark(c)];
    ScrollTrigger.refresh();
    return () => offs.forEach((f) => typeof f === "function" && f());
  });
});
