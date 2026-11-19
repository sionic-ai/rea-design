(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = document.querySelector(".us-visual__stage");
  const mixer = document.querySelector(".us-mixer");
  const scrollBtn = document.querySelector(".us-visual__scroll");

  // Mixer row — toggling it makes the waveform in the same-numbered row of the sound panel wider and brighter. Six bars of an active row bounce
  const rows = [...document.querySelectorAll(".us-mixer__row")];
  rows.forEach((row, i) => {
    const t = row.querySelector(".us-mixer__toggle");
    const send = () => stage?.dispatchEvent(new CustomEvent("fx:channel", { detail: { index: i, on: t.getAttribute("aria-checked") === "true" } }));
    const flip = () => { t.setAttribute("aria-checked", String(t.getAttribute("aria-checked") !== "true")); send(); };
    t.addEventListener("click", flip);
    t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    requestAnimationFrame(send);
  });
  // Once sound actually starts (after the header sound button is turned on and loading finishes), the current cell indicator lights up and the bars of the lit row bounce
  let levelTimer = 0;
  // Each bar sways at its own tempo (offset by .2s) following the sound level
  const levels = () => rows.forEach((row, k) => setTimeout(() => {
    if (!mixer?.classList.contains("is-playing")) return;
    row.querySelectorAll(".us-mixer__level i").forEach((b) => b.style.setProperty("--lv", (0.2 + Math.random() * 0.8).toFixed(2)));
  }, (k % 5) * 40));
  const now = [...document.querySelectorAll(".us-mixer__now i")];
  document.addEventListener("us:sound", (e) => {
    const playing = !!e.detail?.playing;
    mixer?.classList.toggle("is-playing", playing);
    // The original, once sound is received and starts playing, lights the current cell for as many lines as chosen (the first sound is one line)
    const picked = Math.max(playing ? 1 : 0, rows.filter((r) => r.querySelector(".us-mixer__toggle").getAttribute("aria-checked") === "true").length);
    now.forEach((n, k) => n.classList.toggle("is-active", playing && k < picked));
    clearInterval(levelTimer);
    if (playing && !reduce) { levels(); levelTimer = setInterval(levels, 160); }
    else rows.forEach((row) => row.querySelectorAll(".us-mixer__level i").forEach((b) => b.style.setProperty("--lv", "0.2")));
  });

  // Mixer fold button (folded by a person), and auto-hide when scrolled past half a screen·scroll indicator hide (original −close)
  mixer?.querySelector(".us-mixer__close")?.addEventListener("click", () => mixer.classList.toggle("is-close-user"));
  // Share — pressing the copy-link button drops ”URL copied” down in .3s and keeps it for 2 seconds
  const share = mixer?.querySelector(".us-mixer__share");
  let copied = 0;
  mixer?.querySelector(".us-mixer__sns-copy")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(location.href).catch(() => {});
    share.classList.add("is-copied");
    clearTimeout(copied);
    copied = setTimeout(() => share.classList.remove("is-copied"), 2000);
  });
  mixer?.querySelectorAll(".us-mixer__sns a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  const onScroll = () => {
    mixer?.classList.toggle("is-close", scrollY > innerHeight * 0.5);
    scrollBtn?.classList.toggle("is-close", scrollY > innerHeight * 0.15);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  // Original uni-kv-cover — scrolling down darkens the black veil over the sound panel (.6 per screen). Read every frame so it stays correct even when position changes without a scroll event
  let dim = -1;
  const shade = () => {
    const v = Math.min(0.6, (scrollY / innerHeight) * 0.6);
    if (v !== dim) stage?.style.setProperty("--us-dim", (dim = v).toFixed(3));
    requestAnimationFrame(shade);
  };
  if (stage) requestAnimationFrame(shade);
  const down = () => scrollBy({ top: innerHeight * 0.75, behavior: reduce ? "auto" : "smooth" });
  scrollBtn?.addEventListener("click", down);
  scrollBtn?.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), down()));

  // Original Image1 — once the large text line is visible, from 1.5 seconds later every 1 second three consecutive lines switch to the second text and roll upward. Stops when the text line leaves the screen
  const rowsLit = [...document.querySelectorAll(".us-image1__row")];
  let lit = 5, litTimer = 0, litWait = 0;
  const paint = () => rowsLit.forEach((r, l) => r.classList.toggle("is-lit", lit % 6 === l || (lit + 1) % 6 === l || (lit + 2) % 6 === l));
  paint();
  const text1 = document.querySelector(".us-image1__text1");
  if (text1 && !reduce) new IntersectionObserver(([e]) => {
    clearTimeout(litWait); clearInterval(litTimer);
    if (e.isIntersecting) litWait = setTimeout(() => { litTimer = setInterval(() => { if (--lit < 0) lit = 5; paint(); }, 1000); }, 1500);
  }).observe(text1);

  // Original Service — before the section top reaches the screen top the title and band lag behind by remaining distance/5, and at the end by overflow distance/5 (desktop)
  const svc = document.querySelector(".us-service");
  if (svc && !reduce) {
    const lag = () => {
      const r = svc.getBoundingClientRect();
      const m = Math.max(r.top, 0), end = r.top + r.height - innerHeight;
      const f = innerWidth > 1024 ? (end < 0 ? end : m) / 5 : 0;
      svc.style.setProperty("--us-lag", `${f.toFixed(1)}px`);
    };
    addEventListener("scroll", lag, { passive: true });
    addEventListener("resize", lag);
    lag();
  }

  // Original kv UI — the scroll indicator arrow floats −2~5px each frame with sin(c × .1) (about 1 second period),
  // The ‹FIND› pill rests .75s, then for .2s jitters ±1px and flashes brightness .9~2 before settling back — at that moment an accent ring expands 1.25x from .7 over 1s power2.out and fades (repeats)
  const arrow = document.querySelector(".us-visual__scroll-line");
  const pill = document.querySelector(".us-mixer__pill"), pillT = pill?.querySelector(".us-mixer__pill-t"), cover = pill?.querySelector(".us-mixer__pill-cover");
  if (!reduce && window.gsap) {
    let c = 0;
    gsap.ticker.add(() => { c++; if (arrow) gsap.set(arrow, { y: -2 + ((Math.sin(c * 0.1) + 1) / 2) * 7 }); });
    const r1 = () => Math.random() * 2 - 1;
    const attention = () => {
      if (!pill) return;
      gsap.to(pill, {
        opacity: 1, duration: 0.2, delay: 0.75, ease: "none",
        onStart: () => cover && gsap.fromTo(cover, { opacity: 0.7, scale: 1 }, { opacity: 0, scale: 1.25, duration: 1, ease: "power2.out" }),
        onUpdate: () => { gsap.set(pill, { x: r1(), y: r1(), filter: `brightness(${(0.9 + Math.random() * 1.1).toFixed(2)})` }); pillT && gsap.set(pillT, { x: r1(), y: r1() }); },
        onComplete: () => { gsap.set(pill, { x: 0, y: 0, filter: "" }); pillT && gsap.set(pillT, { x: 0, y: 0 }); attention(); },
      });
    };
    attention();
  }

  // Waveform strip after the closing text — draw the same rough waveform as the sound panel once as SVG
  const path = document.querySelector(".us-foot__wave path");
  if (path) {
    let d = "M0 150", x = 0;
    while (x < 1440) {
      x += 4 + Math.random() * 6;
      const a = Math.pow(Math.random(), 2.4) * 120 * Math.sin((x / 1440) * Math.PI);
      d += ` L${x.toFixed(0)} ${(150 - a).toFixed(0)} L${(x + 2).toFixed(0)} ${(150 + a).toFixed(0)}`;
    }
    path.setAttribute("d", d + " L1440 150");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
  }
})();
