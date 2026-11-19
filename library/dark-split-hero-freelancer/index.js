// Single page — hero staggered entrance and photo cover, clock, flowing band fill, review slider (keen-slider), 14 work cards, FAQ open/close, play cells (typeface · skin · wave sound · flip)
(() => {
  const { reduce } = MP;
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  // Hero — after .25s the photo cover goes to width 0 (1s outQuart), and each cell appears after its data-delay
  // Original: 250ms after the screen is attached (hydration). On a fresh open, ≈.7s from the first paint
  setTimeout(() => document.querySelector(".mp-hero__cover").classList.add("is-off"), reduce ? 0 : 700);
  document.querySelectorAll(".mp-in").forEach((el) => setTimeout(() => el.classList.add("is-in"), reduce ? 0 : +el.dataset.delay || 0));
  document.querySelector("[data-scroll-next]").addEventListener("click", (e) => {
    e.preventDefault();
    const hero = document.querySelector(".mp-hero").getBoundingClientRect();
    MP.scrollTo(hero.bottom + scrollY);
  });

  // Clock — weekday, date and time down to the second
  const date = document.querySelector(".mp-clock__date"), time = document.querySelector(".mp-clock__time");
  const tick = () => {
    const d = new Date();
    date.textContent = d.toLocaleDateString("ko-KR", { weekday: "long", month: "long", day: "numeric" });
    time.textContent = d.toLocaleTimeString("ko-KR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  tick();
  setInterval(tick, 1000);

  // Flowing band — 20 tech icons (24s), 18 customer logos (60s). The second set copies the same
  const SHAPES = ["M4 12h16M12 4v16", "M5 5h14v14H5z", "M12 3l9 18H3z", "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z", "M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4", "M7 4h10l4 8-4 8H7l-4-8z", "M4 4l16 16M20 4L4 20", "M3 12c3-6 15-6 18 0c-3 6-15 6-18 0z", "M12 2v20M5 7l14 10M19 7L5 17", "M6 18V6l12 12V6"];
  const devList = document.querySelectorAll(".mp-card--dev .mp-marquee__list");
  const cubes = Array.from({ length: 20 }, (_, i) => `<li class="mp-cube" title="Tech ${i + 1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${SHAPES[i % SHAPES.length]}"/></svg></li>`).join("");
  devList.forEach((ul) => (ul.innerHTML = cubes));
  const logos = Array.from({ length: 18 }, (_, i) => `<li class="mp-logo"><span class="wf-logo" data-label="Customer logo">LOGO ${String(i + 1).padStart(2, "0")}</span></li>`).join("");
  document.querySelectorAll(".mp-logos .mp-marquee__list").forEach((ul) => (ul.innerHTML = logos));

  // Reviews — keen-slider one at a time, rubber band at the ends, drag .5x, transition 2s. Also moves with dots and arrows
  const sliderEl = document.querySelector(".mp-slider"), wrap = sliderEl.closest(".mp-carousel");
  const dots = wrap.querySelector(".mp-dots"), arrows = wrap.querySelectorAll(".mp-arrow");
  const count = sliderEl.children.length;
  dots.innerHTML = Array.from({ length: count }, (_, i) => `<button type="button" aria-label="${i + 1}Nth review"><span></span></button>`).join("");
  wrap.style.transition = "opacity .5s ease-in-out";
  wrap.style.opacity = "0";
  const paint = (s) => {
    const rel = s.track.details ? s.track.details.rel : 0;
    [...dots.children].forEach((b, i) => b.classList.toggle("is-on", i === rel));
  };
  const slider = new KeenSlider(sliderEl, {
    loop: false, mode: "free-snap", dragSpeed: 0.5, rubberband: true, defaultAnimation: { duration: 2000 }, slides: { perView: 1, spacing: 16 },
    created: (s) => { paint(s); requestAnimationFrame(() => (wrap.style.opacity = "1")); }, slideChanged: paint,
  });
  [...dots.children].forEach((b, i) => b.addEventListener("click", () => slider.moveToIdx(i)));
  arrows.forEach((a) => a.addEventListener("click", () => (+a.dataset.dir > 0 ? slider.next() : slider.prev())));

  // 14 work cards — name (accent color) · two-to-three-line description · button, right half is a photo. Card backgrounds differ on just a few, like the original
  const PROJ = [
    "Exhibition page · elderly artist in front of a sparkling wall · dark interior", "New brand · two people in profile · low saturation", "Interior shop · woman with fabrics · warm light",
    "Architecture office · City street · Overcast day", "Design firm · male portrait, front view · gray wall", "Independent artist · studio · afternoon light", "Small agency · restaurant interior with people · yellow light",
    "Real estate company · building exterior · clear sky", "Digital agency · repeating letter pattern · pink surface", "Furniture brand · product close-up · white background",
    "Animation studio · blue 3D character · dark background", "Shared office · desk and window · daytime", "Brand company · hand holding a basketball · white shirt", "Bakery chain · pink dessert · light sky blue",
  ];
  const stack = document.querySelector(".mp-stack");
  stack.innerHTML = PROJ.map((label, i) => `
    <a href="#" class="mp-proj" data-fx-part="card">
      <div class="mp-proj__body"><h3 data-label="Work English name">Project ${String(i + 1).padStart(2, "0")}</h3>
        <div><p>Your two or three lines on what was built go here. One more line on the technology it was built with.</p>
        <span class="mp-btn" data-fx="conic-glow-hover"><span class="mp-btn__face is-sm" data-fx-part="face" data-label="English button">Open project</span><span data-fx-part="glow" aria-hidden="true"></span></span></div></div>
      <div class="mp-proj__img"><div class="wf-img" data-fx-part="media" data-label="${label} · Near-square landscape"></div></div>
    </a>`).join("");

  // Question — clicking toggles the answer height 0 ↔ content height (.5s outExpo), clicking outside closes the open one
  const items = [...document.querySelectorAll(".mp-acc__item")];
  const setOpen = (li, on) => { const body = li.querySelector(".mp-acc__body"); body.style.height = on ? `${body.firstElementChild.scrollHeight}px` : "0px"; li.querySelector("button").setAttribute("aria-expanded", String(on)); li.classList.toggle("is-open", on); };
  items.forEach((li) => li.querySelector("button").addEventListener("click", () => setOpen(li, !li.classList.contains("is-open"))));
  document.addEventListener("pointerdown", (e) => items.forEach((li) => { if (li.classList.contains("is-open") && !li.contains(e.target)) setOpen(li, false); }));
  const refreshOpen = () => items.forEach((li) => li.classList.contains("is-open") && setOpen(li, true));
  addEventListener("resize", refreshOpen);

  // Play — typeface (playful type ↔ default), skin (light ↔ dark), wave sound (6 bars driven by volume), flip
  const bars = [...document.querySelectorAll(".mp-bars i")];
  bars.forEach((b) => (b.style.height = `${rand(16, 100)}px`));
  let audio = null;
  const waves = () => {
    // Our sound — brown noise swelling and settling with an 8s breath like waves. Split the low bins of the analyser (fftSize 64) into 6 chunks for the bar heights
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; data[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const gain = ctx.createGain(); gain.gain.value = 0.35;
    const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 0.125; depth.gain.value = 0.3; lfo.connect(depth).connect(gain.gain);
    const an = ctx.createAnalyser(); an.fftSize = 64;
    src.connect(gain).connect(an).connect(ctx.destination);
    src.start(); lfo.start();
    const bins = new Uint8Array(an.frequencyBinCount), per = Math.floor(bins.length / 6) / 2;
    let raf = 0;
    const draw = () => { an.getByteFrequencyData(bins); bars.forEach((b, i) => { let s = 0; for (let k = i * per; k < i * per + per; k++) s += bins[Math.floor(k)]; b.style.height = `${Math.max(20, s / per / 2)}px`; }); raf = requestAnimationFrame(draw); };
    return { ctx, on: false, play() { ctx.resume(); this.on = true; draw(); }, pause() { ctx.suspend(); this.on = false; cancelAnimationFrame(raf); } };
  };
  const typeNote = document.querySelector('[data-play="type"] [data-say]');
  const sayType = () => { const [a, b] = typeNote.dataset.say.split("|"); typeNote.textContent = document.documentElement.dataset.typeface === "play" ? b : a; };
  sayType();
  const act = {
    type: () => { MP.toggleType(); sayType(); },
    palette: () => MP.toggleTheme(),
    vibes: () => { audio ||= waves(); audio.on ? audio.pause() : audio.play(); },
    flip: () => MP.toggleFlip(),
  };
  document.querySelectorAll("[data-play]").forEach((t) => {
    const go = () => act[t.dataset.play]();
    t.addEventListener("click", go);
    t.addEventListener("keydown", (e) => e.key === "Enter" && go());
  });
})();
