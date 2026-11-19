// First page: fill in the band content (chips, brands, ingredients, reviews), scan line, hand wave, star twinkle, helper text flow, tick-line x scroll, and footer opacity scroll.
// Original values: tick line x 40 → −240 (onScroll, from entering the screen until leaving), footer opacity 0 → 1 (while the front photo card passes from the bottom to the top of the screen, chased by a 500/60 spring)
(() => {
  const { reduce } = window.LV;
  const hs = document.querySelector(".hero__stores");
  if (hs) hs.innerHTML = window.LV.stores();

  // Band content — the original Ticker as a marquee part (rate px/s). The part scans after DOMContentLoaded, so fill it in here first
  const tones = ["--kf-accent", "--site-pink", "--site-green", "--site-violet", "--site-orange"];
  const chip = (t, i) => `<span class="chip"><i style="background: var(${tones[i % tones.length]})"></i><span style="color: var(${tones[i % tones.length]})">${t}</span></span>`;
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el, r) => { el.innerHTML = html(r); });
  fill(".chips__row", (r) => (r ? ["Acne marks", "Pores", "Dot", "Freckles", "Scar", "Pigment"] : ["Fine lines", "Reddish tint", "Pimple", "Name", "Acne traces"]).map((t, i) => chip(t, i + r * 2)).join(""));
  fill(".brands__row", (r) => Array.from({ length: 11 }, (_, i) => `<span class="brand"><i></i>Brand ${String(i + 1 + r * 11).padStart(2, "0")}</span>`).join(""));
  fill(".ingr__row", () => ["One Ingredient", "Ingredient two", "Ingredient three"].map((t, i) => `<div class="ingr-card"><span class="wf-img" data-label="Ingredient texture · cream dollop · landscape"></span><b>$ here{t}</b><p>Your ingredient description here ${i ? "" : " More"}</p></div>`).join(""));
  fill(".reviews__row", () => Array.from({ length: 6 }, (_, i) => `<div class="rv"><b>Name ${i + 1}.</b><small>0000.00.00 / Source</small>${i % 2 ? '<span class="stars"><i></i><i></i><i></i><i></i><i></i></span>' : ""}<strong data-label="Your review English title here">Review Title Here</strong>Your review body goes here, about seven or eight lines. Sentences follow on how it felt to use, what was good, and what changed.</div>`).join(""));
  const marquee = (sel, rate, dir) => document.querySelectorAll(sel).forEach((el, i) => {
    el.setAttribute("data-fx", "marquee");
    el.setAttribute("data-fx-marquee", `rate: ${Array.isArray(rate) ? rate[i] : rate}; dir: ${Array.isArray(dir) ? dir[i] : dir}; pause: none`);
  });
  marquee(".chips__row", [10, 15], ["left", "right"]);
  marquee(".brands__row", [4, 8], ["left", "right"]);
  marquee(".ingr__row", 40, "left");
  marquee(".reviews__row", 50, "left");

  // Skin feel bar — pressing a dot moves the handle there, and only the chosen word is colored (original spring 200/25/.8 · about .42s)
  document.querySelectorAll("[data-feel]").forEach((bar) => {
    const labs = [...bar.parentElement.querySelectorAll(".feel__lab span")];
    bar.querySelectorAll(".feel__dot").forEach((dot, i) => dot.addEventListener("click", () => {
      bar.style.setProperty("--feel-x", i / 2);
      labs.forEach((l, j) => { l.classList.toggle("is-on", j === i); l.classList.toggle("is-low", j === i && i === 0); l.classList.toggle("is-mid", j === i && i === 1); });
    }));
  });

  if (reduce) return;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Scan line — moves up and down the phone screen in 2.4s, round trip
    const line = document.querySelector("[data-scan-line]");
    if (line) gsap.fromTo(line, { y: -40 }, { y: 260, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });

    // Hand wave — pivot at the wrist, ±18° twice in 1.2s, then rest
    const wave = document.querySelector("[data-wave]");
    if (wave) gsap.timeline({ repeat: -1, repeatDelay: 0.8 }).to(wave, { rotate: 18, duration: 0.15, ease: "sine.out" }).to(wave, { rotate: -14, duration: 0.3, ease: "sine.inOut" }).to(wave, { rotate: 16, duration: 0.3, ease: "sine.inOut" }).to(wave, { rotate: 0, duration: 0.25, ease: "sine.out" });

    // Two stars alternately grow and shrink as if breathing
    gsap.to(".spark.is-big", { scale: 0.86, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true });
    gsap.to(".spark.is-small", { scale: 1.2, duration: 1.2, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.4 });

    // The helper’s answer text flows slowly upward and returns to the start
    const ask = document.querySelector("[data-ask-scroll]");
    if (ask) gsap.to(ask, { scrollTop: () => ask.scrollHeight - ask.clientHeight, duration: 9, ease: "none", repeat: -1, repeatDelay: 1 });

    // Tick row — onScroll transform x 40 → −240
    const rail = document.querySelector("[data-track-rail]");
    if (rail) gsap.fromTo(rail, { x: 40 }, { x: -240, ease: "none", scrollTrigger: { trigger: rail.closest(".lv-card"), start: "top bottom", end: "bottom top", scrub: true } });

    // Scan stage phone slides down a little with scroll (later than the photo)
    const phone = document.querySelector("[data-scan-phone]");
    if (phone) gsap.to(phone, { y: 120, ease: "none", scrollTrigger: { trigger: ".scan-stage", start: "top top", end: "bottom top", scrub: true } });

    // Footer — while the front photo card (.bigface) passes from bottom to top of the screen, opacity goes 0 → 1
    const foot = document.querySelector(".lv-foot");
    if (foot) gsap.fromTo(foot, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: ".bigface", start: "top bottom", end: "top top", scrub: 0.2 } });
  });
})();
