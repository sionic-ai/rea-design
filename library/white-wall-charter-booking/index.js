// First page — Hero wall, headline group swap, coordinates, table carousel, empty-leg table, reasons section brighten, review paging, subscription card
(() => {
  const ease = (c, f) => (window.CustomEase ? CustomEase.get(`vl-${c}`) || CustomEase.create(`vl-${c}`, c) : f);
  const EXPO = ease("0.16,1,0.3,1", "expo.out");
  const OUT = ease("0.22,1,0.36,1", "power3.out");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Hero: when the walls exit (original wallsExited) the line is drawn over 2.6s and title letters slide in one after another .04s apart after 1.5s
  const hero = document.querySelector(".vl-hero");
  const title = hero.querySelector(".vl-hero__title");
  const rule = hero.querySelector("[data-hero-rule]");
  const walls = hero.querySelector("[data-hero-walls]");
  const a = hero.querySelector("[data-hero-a]");
  const b = hero.querySelector("[data-hero-b]");
  let exited = false;
  const afterWalls = () => {
    if (exited) return;
    exited = true;
    // Original: line width 0→100% 2.6s [.22,1,.36,1] (.6s if the wall is skipped) · title textSideSplitDelay 1.5s
    const skip = walls.classList.contains("is-done") && performance.now() < 600;
    gsap.to(rule, { width: "100%", duration: reduce ? 0 : skip ? .6 : 2.6, ease: OUT });
    title.dispatchEvent(new CustomEvent("fx:play"));
  };
  walls.addEventListener("fx:done", afterWalls);

  // At 20% progress, switches to the second group — original textOpacity useTransform([.199,.2],[0,1]) · the title turns off to -12px in .5s once scrolled down past 80px
  const bLines = b.querySelectorAll("[data-hero-b-lines]");
  const bRules = b.querySelectorAll("[data-hero-b-rule]");
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) { gsap.set(b, { opacity: 0 }); return; }
    gsap.set(bRules, { scaleX: 0 });
    gsap.set(bLines, { yPercent: 110, autoAlpha: 0 });
    let on = false, titleOff = false;
    ScrollTrigger.create({
      trigger: hero, start: "top top", end: "bottom bottom",
      onUpdate: (st) => {
        const want = st.progress >= .2;
        if (want !== on) {
          on = want;
          gsap.to(b, { opacity: on ? 1 : 0, duration: .3, ease: "none" });
          gsap.to(a, { opacity: on ? 0 : 1, duration: .3, ease: "none" });
          if (on) {
            gsap.to(bRules, { scaleX: 1, duration: 3.6, ease: EXPO, delay: .1 });
            gsap.to(bLines, { yPercent: 0, autoAlpha: 1, duration: .75, ease: EXPO, stagger: .08 });
          }
        }
        const off = window.scrollY > 80;
        if (off !== titleOff) {
          titleOff = off;
          gsap.to(".vl-hero__coords", { opacity: off ? .6 : 1, duration: .5 });
        }
      },
    });
  });

  // Coordinates — on 1024px or wider with a fine pointer, the original maps mouse y and x directly onto latitude and longitude ranges.
  const lat = hero.querySelector("[data-lat]"), lng = hero.querySelector("[data-lng]");
  const dms = (v) => { const d = Math.floor(v), m = Math.floor((v - d) * 60), s = ((v - d) * 3600 - m * 60).toFixed(1); return `${d}° ${String(m).padStart(2, "0")}′ ${s.padStart(4, "0")}″`; };
  const R = { lat: [37.46, 37.495], lng: [126.88, 127.1] };
  const stick = hero.querySelector(".vl-hero__stick");
  if (matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
    stick.addEventListener("mousemove", (e) => {
      const r = stick.getBoundingClientRect();
      const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      lat.textContent = `N ${dms(R.lat[0] + y * (R.lat[1] - R.lat[0]))}`;
      lng.textContent = `E ${dms(R.lng[0] + x * (R.lng[1] - R.lng[0]))}`;
    });
  }

  // ── Table carousel: the center card in front (blue border) — the original uses framer-motion drag, the copy does the same position swap with pointer drag
  const rail = document.querySelector("[data-car-rail]");
  const track = document.querySelector("[data-car-track]");
  const KINDS = ["is-blue", "is-dark", "is-yellow", "is-blue", "is-dark", "is-yellow", "is-blue"];
  const card = (k, i) => `
    <article class="vl-card" data-card="${i}">
      <div class="vl-card__in">
        <div class="vl-card__route">
          <span class="vl-card__code">AAA<span class="vl-card__city">City Name <i class="vl-flag"></i></span></span>
          <svg class="vl-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16M14 6l6 6-6 6"/></svg>
          <span class="vl-card__code">BBB<span class="vl-card__city">City Name <i class="vl-flag"></i></span></span>
        </div>
        <div class="vl-card__box ${k}">
          <div class="vl-card__date">00 Month<br>0000</div>
          <div class="vl-card__cls">Jet Class</div>
          <div class="vl-card__price">$00K – $00K</div>
          <div class="vl-card__est">Your estimated range here</div>
          <button class="vl-card__btn" type="button">View Estimates</button>
        </div>
      </div>
    </article>`;
  rail.innerHTML = KINDS.map(card).join("");
  const cards = [...rail.children];
  let idx = 3, pos = 3;
  const gapOf = () => cards[0].offsetWidth + 16;
  const place = (p, dur = .8) => {
    const g = gapOf();
    cards.forEach((c, i) => {
      const d = i - p;
      gsap.to(c, { x: d * g, scale: Math.abs(d) < .5 ? 1 : .94, duration: dur, ease: EXPO, overwrite: true });
      c.classList.toggle("is-on", Math.round(p) === i);
    });
  };
  place(pos, 0);
  document.querySelectorAll("[data-car]").forEach((btn) => btn.addEventListener("click", () => {
    idx = Math.max(0, Math.min(cards.length - 1, idx + +btn.dataset.car));
    pos = idx; place(pos);
  }));
  let down = null;
  track.addEventListener("pointerdown", (e) => { down = { x: e.clientX, p: pos }; track.setPointerCapture(e.pointerId); });
  track.addEventListener("pointermove", (e) => {
    if (!down) return;
    pos = Math.max(-.4, Math.min(cards.length - .6, down.p - (e.clientX - down.x) / gapOf()));
    place(pos, .3);
  });
  const up = () => { if (!down) return; down = null; idx = Math.max(0, Math.min(cards.length - 1, Math.round(pos))); pos = idx; place(pos); };
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  addEventListener("resize", () => place(pos, 0));
  document.querySelectorAll(".vl-cur__b").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll(".vl-cur__b").forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
  }));

  // ── Empty leg table
  const legs = document.querySelector("[data-legs]");
  const icoPax = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="16.5" cy="7.5" r="2.8"/></svg>';
  const icoAc = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.5c.8 0 1.4.9 1.4 2V9l8.1 4.6v2.2l-8.1-2.3v4.1l2.3 1.7v1.8L12 20l-3.7 1.1v-1.8l2.3-1.7v-4.1L2.5 15.8v-2.2L10.6 9V4.5c0-1.1.6-2 1.4-2z"/></svg>';
  const go = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
  legs.innerHTML = Array.from({ length: 14 }, (_, i) => `
    <a class="vl-leg" href="news.html">
      <span>00/00/0000</span>
      <span class="vl-leg__route"><i class="vl-flag"></i><b>Airport Name</b><em>(AAA)</em><span aria-hidden="true">→</span><i class="vl-flag"></i><b>Airport Name</b><em>(BBB)</em></span>
      <span class="vl-leg__ac">${icoAc}Aircraft Model ${i % 3 ? "X" : "300"}</span>
      <span class="vl-leg__pax">${icoPax}${8 + (i % 5)}</span>
      <span class="vl-leg__price">${i % 2 ? "≈ " : ""}$0,000</span>
      <span class="vl-leg__go">${go}</span>
    </a>`).join("");
  document.querySelectorAll(".vl-region").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll(".vl-region").forEach((x) => x.classList.toggle("is-on", x === btn));
  }));

  // ── Eight reasons rows + when the section enters, turn the html variable to the light side (original sectionEnterThreshold .15 · Leave .25 · 1s power2.inOut)
  const why = document.querySelector("[data-why-list]");
  why.innerHTML = Array.from({ length: 8 }, () => `
    <li class="vl-why__row"><b data-label="Reason title (English)">Reason Title Here</b><p>Two or three lines explaining the reason here. What the guest gains, in one sentence.</p><div class="vl-rule" data-draw></div></li>`).join("");
  why.querySelectorAll("[data-draw]").forEach((el) => {
    if (reduce) return;
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 3.6, delay: .1, ease: EXPO, scrollTrigger: { trigger: el, start: "top bottom", once: true } });
  });
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  const DARK = {
    "--empty-bg": v("--kf-bg"), "--empty-fg": v("--kf-ink"), "--empty-sec": v("--kf-ink-soft"), "--empty-box": v("--kf-surface"),
    "--empty-line": "color-mix(in oklab, " + v("--kf-dim") + " 40%, transparent)", "--empty-card": v("--kf-raised"),
  };
  const LIGHT = {
    "--empty-bg": v("--kf-contrast-bg"), "--empty-fg": v("--kf-contrast-ink"), "--empty-sec": v("--kf-dim"), "--empty-box": "color-mix(in oklab, " + v("--kf-contrast-bg") + " 96%, " + v("--kf-contrast-ink") + ")",
    "--empty-line": "color-mix(in oklab, " + v("--kf-ink-soft") + " 100%, transparent)", "--empty-card": "color-mix(in oklab, " + v("--kf-contrast-bg") + " 96%, " + v("--kf-contrast-ink") + ")",
  };
  const whySec = document.querySelector(".vl-why");
  let light = false, tw = null;
  const check = () => {
    const r = whySec.getBoundingClientRect(), h = innerHeight;
    const now = light ? h >= r.top + .15 * r.height : h >= r.top + .25 * r.height;
    if (now === light) return;
    light = now;
    tw?.kill();
    tw = gsap.to(document.documentElement, { ...(light ? LIGHT : DARK), duration: reduce ? 0 : 1, ease: "power2.inOut" });
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  check();

})();
