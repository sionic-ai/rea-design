// Loading curtain → sound choice curtain → banner panel · sticky strip. Values from the original (TweenMax·jQuery) carried over as they are to GSAP 3.
(() => {
  const { mascot, odd, DANCE, logo } = window.pkArt;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap = document.getElementById("pk-wrap");
  // On phones, even when the viewing window stretches to the panel width at 640, measure by device width
  const vw = () => Math.min(innerWidth, screen.width || innerWidth);
  const narrow = () => vw() < 721;

  // ── Image fill ──
  document.querySelectorAll("[data-pk-mascot]").forEach((el) => {
    const [l, r, t, face] = el.dataset.pkMascot.split(" ");
    el.innerHTML = face === "odd" ? odd(+l, +r, +t) : mascot(+l, +r, +t, face);
  });
  const LOGO = { top: "Close enough to go meet", big: "Mascot", bottom: "Mass outbreak", badge: "Chu!" };
  document.querySelectorAll("[data-pk-logo]").forEach((el) => (el.innerHTML = logo(LOGO)));
  const BADGES = {
    vote: [404, 446, `<text class="pk-b-s is-white" x="202" y="40" text-anchor="middle">Your one-line thank-you for voting here!</text><rect x="6" y="92" width="392" height="226" rx="14" fill="var(--kf-bg)" stroke="currentColor" stroke-width="8"/><rect x="112" y="64" width="180" height="46" rx="10" fill="var(--kf-bg)" stroke="currentColor" stroke-width="6"/><text class="pk-b-xs" x="202" y="97" text-anchor="middle">Chosen by everyone</text><text class="pk-b-m is-red" x="202" y="160" text-anchor="middle">Mascot</text><text class="pk-b-xl" x="202" y="262" text-anchor="middle">General election</text><text class="pk-b-xs" x="202" y="304" text-anchor="middle">Chu!</text><text class="pk-b-s is-white" x="202" y="368" text-anchor="middle">And the chosen mascot is…!?</text><text class="pk-b-l is-yellow" x="202" y="436" text-anchor="middle">Results announced!!</text>`],
    snap: [429, 236, `<rect x="30" y="30" width="370" height="150" rx="20" fill="var(--kf-surface)" stroke="currentColor" stroke-width="8"/><text class="pk-b-s is-ink" x="215" y="70" text-anchor="middle">Mascots everywhere?</text><text class="pk-b-l" x="215" y="150" text-anchor="middle">Everyone’s snaps</text><g transform="rotate(-8 230 200)"><rect x="90" y="176" width="280" height="54" rx="6" fill="var(--kf-accent)"/><text class="pk-b-m is-white" x="230" y="216" text-anchor="middle">All Done</text></g>`],
    game: [394, 160, `<circle cx="60" cy="80" r="44" fill="var(--pk-green)" stroke="currentColor" stroke-width="6"/><circle cx="60" cy="80" r="16" fill="var(--kf-surface)"/><text class="pk-b-s is-ink" x="240" y="44" text-anchor="middle">A real showdown with the mascot</text><text class="pk-b-l is-green" x="240" y="108" text-anchor="middle">Look-over-there game</text><text class="pk-b-s is-white" x="240" y="146" text-anchor="middle">Play with mini games!</text>`],
    book: [283, 88, `<text class="pk-b-s is-ink" x="141" y="28" text-anchor="middle">Does everyone know?</text><rect x="20" y="38" width="243" height="48" rx="24" fill="var(--kf-surface)" stroke="currentColor" stroke-width="5"/><text class="pk-b-m" x="141" y="74" text-anchor="middle">Mascot guide</text>`],
    report: [105, 76, `<rect x="4" y="4" width="97" height="68" rx="12" fill="var(--kf-surface)" stroke="currentColor" stroke-width="5"/><text class="pk-b-xs" x="52" y="34" text-anchor="middle">Event</text><text class="pk-b-xs is-red" x="52" y="60" text-anchor="middle">Report</text>`],
  };
  document.querySelectorAll("[data-pk-badge]").forEach((el) => {
    const [w, h, inner] = BADGES[el.dataset.pkBadge];
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${inner}</svg>`;
  });
  document.querySelectorAll("[data-pk-strip]").forEach((el) => {
    el.innerHTML = Array.from({ length: +el.dataset.pkStrip }, (_, i) => mascot(...DANCE[i % 4].slice(0, 2), DANCE[i % 4][2])).join("");
  });
  const run = document.querySelector("[data-pk-run]");
  if (run) run.innerHTML = [0, 1, 2].map((i) => `<span class="pk-hop" style="--i:${i}">${mascot(...DANCE[(i + 1) % 4].slice(0, 2), 0)}</span>`).join("");
  const ticker = document.querySelector("[data-pk-ticker]");
  // The original marquee board lays one text image (600px) as the background and flows background-position — same approach here, with the text cells drawn on a canvas in the skin color and typeface
  const TICKER = "Mascots everywhere, chu!";
  const paintTicker = () => {
    if (!ticker) return;
    const cs = getComputedStyle(ticker), dpr = 2, c = document.createElement("canvas");
    c.width = 600 * dpr; c.height = 60 * dpr;
    const g = c.getContext("2d");
    g.scale(dpr, dpr);
    g.fillStyle = cs.color;
    g.font = `400 30px ${cs.fontFamily}`;
    g.textBaseline = "middle";
    g.fillText(TICKER, 8, 32);
    ticker.style.backgroundImage = `url(${c.toDataURL()})`;
  };
  if (ticker) {
    ticker.innerHTML = `<span class="pk-tinv">${TICKER}</span>`;
    paintTicker();
    document.fonts && document.fonts.ready.then(paintTicker);
  }

  // Sound: short synthesized tones instead of the original effect files — played from the same spot on on, off, hover and press
  let ac = null, bgm = 0;
  const soundOn = () => !wrap.classList.contains("sound_off");
  const tone = (notes, vol = 0.05, len = 0.08, type = "square") => {
    if (!soundOn()) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      notes.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * len;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.95);
        o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len);
      });
    } catch (e) { /* Stay silent if there is no audio device */ }
  };
  const SFX = { over: [[1320], 0.05, 0.04], click: [[880, 1320], 0.05, 0.06], start: [[523, 659, 784, 1046], 0.2, 0.12], vote: [[784, 988, 1175], 0.2, 0.1], snap: [[1046, 784], 0.2, 0.1], game: [[659, 784, 1046], 0.2, 0.1], zukan: [[880, 1175], 0.2, 0.1], report: [[698, 880, 1046], 0.2, 0.1], logo: [[1046, 1318, 1568], 0.2, 0.1] };
  const sfx = (k) => SFX[k] && tone(...SFX[k]);
  const startBgm = () => {
    if (bgm || !soundOn()) return;
    const line = [523, 659, 784, 659, 587, 698, 880, 698];
    let i = 0;
    bgm = setInterval(() => tone([line[i++ % line.length]], 0.02, 0.2, "triangle"), 250);
  };
  const stopBgm = () => { clearInterval(bgm); bgm = 0; };

  // ── Banner panel · pinned band (original r()) ──
  const row = document.querySelector(".pk-row");
  const foot = document.querySelector(".pk-foot");
  const pick = Math.floor(Math.random() * 5);
  // Dance sprite — as in the original, one cell (94×112) holds a picture of four poses stacked vertically, and each beat shifts the background position by 112px.
  // Images bake our mascot SVG onto a canvas painted in the skin color (css variables can’t be read inside the image, so colors are resolved first)
  const resolve = (() => {
    const probe = document.createElement("i"), g = document.createElement("canvas").getContext("2d");
    return (v) => {
      probe.style.color = v;
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      g.fillStyle = c;
      return g.fillStyle;
    };
  })();
  const bakeSprite = (draw) => new Promise((done) => {
    const paint = (s) => s.replace(/var\((--pk-[\w-]+)\)/g, (_, n) => resolve(`var(${n})`)).replace(/currentColor/g, resolve("var(--kf-ink)"));
    const dpr = 2, c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = 94 * dpr; c.height = 448 * dpr;
    g.scale(dpr, dpr);
    let left = DANCE.length;
    DANCE.forEach((d, k) => {
      const img = new Image();
      img.onload = () => { g.drawImage(img, 8, k * 112 + 10, 78, 97.5); if (--left === 0) done(`url(${c.toDataURL()})`); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(paint(draw(d[0], d[1], d[2])).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" '));
    });
  });
  if (foot) {
    bakeSprite(mascot).then((u) => foot.style.setProperty("--pk-sprite", u));
    bakeSprite(odd).then((u) => foot.style.setProperty("--pk-sprite-odd", u));
  }
  const unit = (e) => `<span class="pk-unit" data-fx-part="unit" style="left:${e * 80 - 20}px"></span>`;
  const layRow = () => {
    if (!row) return;
    const z = narrow() ? vw() / 640 : 1;
    const n = Math.ceil(vw() / z / 80) + 1;
    let html = "";
    for (let e = 0; e < n; e++) html += unit(e);
    row.innerHTML = html;
    // On wide screens, pick excluding the first four cells hidden behind the logo (original f = e - 4) — as in the original, lay out the cells first, then mark the hidden ones
    const k = narrow() ? pick : pick + 4, u = row.children[k];
    if (u) { u.setAttribute("data-odd", ""); u.classList.add("is-odd"); u.insertAdjacentHTML("beforeend", '<a class="pk-odd" href="#pop" aria-label="Hidden One"></a>'); }
  };
  let layTimer = 0;
  const layout = () => {
    const sp = narrow();
    wrap.classList.toggle("is-sp", sp);
    wrap.classList.toggle("is-pc", !sp);
    document.body.classList.toggle("is-sp-body", sp);
    wrap.style.zoom = sp ? String(vw() / 640) : "";
    clearTimeout(layTimer);
    layTimer = setTimeout(layRow, 10);
  };
  let ready = false;
  const openMain = () => {
    if (ready) return;
    ready = true;
    wrap.classList.add("is-ready");
    layout();
    addEventListener("resize", layout);
    // The billboard text strip (600px over 11s) and left poster background (1069px up over 60s) start flowing only after the pick, like the original
    if (!reduce) {
      ticker && gsap.fromTo(ticker, { backgroundPosition: "0px 0px" }, { backgroundPosition: "-600px 0px", duration: 11, ease: "none", repeat: -1 });
      const board = document.querySelector(".pk-senkyo");
      if (board && !narrow()) gsap.fromTo(board, { backgroundPosition: "0px 0px, 0px 0px, 0px 0px, 0px 0px" }, { backgroundPosition: "0px 0px, 0px -1069px, 0px -1069px, 0px -1069px", duration: 60, ease: "none", repeat: -1 });
    }
    document.querySelectorAll("#pk-wrap a, #pk-wrap [role=button]").forEach((a) => a.addEventListener("mouseenter", () => sfx("over")));
    document.querySelectorAll("[data-sfx]").forEach((a) => a.addEventListener("click", (ev) => { if (a.tagName === "A") ev.preventDefault(); sfx(a.dataset.sfx); }));
    // White flash — on to .4 in .2s, off in .1s
    document.querySelectorAll("[data-pk-flash]").forEach((a) => {
      const over = document.createElement("span");
      over.className = "pk-over";
      over.innerHTML = a.innerHTML;
      a.append(over);
      a.addEventListener("mouseenter", () => {
        if (reduce) return;
        gsap.to(over, { opacity: 0.4, duration: 0.2 });
        gsap.to(over, { opacity: 0, duration: 0.1, delay: 0.2 });
      });
    });
  };

  // Sound button in the fixed strip, event report overlay, and a hidden critter’s one-liner
  document.querySelector(".pk-sound")?.addEventListener("click", () => {
    sfx("click");
    wrap.classList.toggle("sound_off");
    soundOn() ? startBgm() : stopBgm();
  });
  const overlay = document.querySelector('[data-pk-overlay="report"]');
  document.querySelector('[data-pk-open="report"]')?.addEventListener("click", () => { overlay.hidden = false; });
  overlay?.querySelector(".pk-overlay__close").addEventListener("click", () => { overlay.hidden = true; });
  const SAYS = ["Your word of the day here<br>First line", "Your friend’s best qualities here<br>Let’s look it up", "Your homework here<br>Words asking if it was done", "Your task for today here<br>Today’s Motto", "Here, with the eyes of the heart<br>Let’s Take a Look", "With anyone, your text here<br>Words that say we can get close"];
  const pop = document.querySelector("[data-pk-pop]");
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  if (pop) pop.querySelector("[data-pk-say]").innerHTML = SAYS[day % SAYS.length];
  const openPop = () => {
    pop.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add("is-ready")));
  };
  const closePop = () => {
    pop.classList.remove("is-ready");
    pop.classList.add("is-removing");
    setTimeout(() => { pop.hidden = true; pop.classList.remove("is-removing"); }, reduce ? 0 : 300);
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest(".pk-odd")) { e.preventDefault(); openPop(); }
    else if (pop && !pop.hidden && e.target.closest("[data-pk-pop]")) closePop();
  });

  // ── Sound picker veil (original s()) ──
  const splash = document.querySelector(".pk-splash");
  const box = splash?.querySelector(".pk-splash__box");
  const q = (s) => splash.querySelector(s);
  const fitSplash = () => {
    const c = Math.min(1, innerWidth / 690);
    splash.style.minHeight = "450px";
    box.style.left = `${(splash.clientWidth - 690 * c) / 2}px`;
    box.style.top = `${(splash.clientHeight - 450 * c) / 2}px`;
    box.style.zoom = String(c);
  };
  // After choosing, lift the curtain (original a()): characters and text on both sides exit with Back in .3s, and 1.5s later the curtain vanishes in .3s
  const leave = (done) => {
    gsap.to(q(".pk-splash__right"), { left: 409, opacity: 0, rotation: -15, duration: 0.3, ease: "back.out(1.7)", delay: 0.2 });
    gsap.to(q(".pk-splash__left"), { left: 100, opacity: 0, rotation: 15, duration: 0.3, ease: "back.out(1.7)", delay: 0.2 });
    gsap.to(q(".pk-splash__text"), { top: 290, opacity: 0, scale: 0.8, duration: 0.3, ease: "back.out(1.7)" });
    gsap.to(splash, { opacity: 0, duration: 0.3, ease: "circ.out", delay: 1.5 });
    setTimeout(done, 2000);
  };
  const showSplash = () => {
    if (narrow()) { openMain(); splash.remove(); return; }
    splash.style.display = "block";
    fitSplash();
    addEventListener("resize", fitSplash);
    if (reduce) gsap.set([".pk-splash__logo", ".pk-splash__text", ".pk-splash__btns", ".pk-splash__left", ".pk-splash__right"], { opacity: 1 });
    else {
      gsap.fromTo(q(".pk-splash__logo"), { opacity: 0.8, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      gsap.fromTo(q(".pk-splash__left"), { left: 100, opacity: 0, rotation: 15 }, { left: 15, opacity: 1, rotation: 0, duration: 0.3, ease: "back.out(1.7)", delay: 0.7 });
      gsap.fromTo(q(".pk-splash__right"), { left: 409, opacity: 0, rotation: -15 }, { left: 484, opacity: 1, rotation: 0, duration: 0.3, ease: "back.out(1.7)", delay: 0.7 });
      gsap.fromTo([q(".pk-splash__text"), q(".pk-splash__btns")], { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)", delay: 1.2 });
    }
    const on = q(".pk-btn.is-on"), off = q(".pk-btn.is-off");
    let chosen = false;
    const choose = (wantSound) => {
      if (chosen) return;
      chosen = true;
      wrap.classList.toggle("sound_off", !wantSound);
      const [keep, drop, to] = wantSound ? [on, off, 100] : [off, on, 110];
      gsap.to(drop, { opacity: 0, duration: 0.3, ease: "sine.in" });
      gsap.to(keep, { left: to, duration: 0.3, ease: "sine.in", delay: 0.5 });
      openMain();
      if (wantSound) sfx("start");
      leave(() => { splash.remove(); removeEventListener("resize", fitSplash); if (wantSound) startBgm(); });
    };
    on.addEventListener("click", () => choose(true));
    off.addEventListener("click", () => choose(false));
    [on, off].forEach((b) => b.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), b.click())));
  };

  // ── Loading curtain (original t()) — while the audio file downloads, waits briefly in its place, then after a .5s delay rests .3s more and lifts over .5s ──
  const loading = document.querySelector(".pk-loading");
  const lbox = loading?.querySelector(".pk-loading__box");
  if (lbox) lbox.style.opacity = "1";
  // Original holds a curtain while receiving 11 sound effects — waiting instead of receiving. Value tuned to 3.3s from the original first paint to the end of the entrance curtain reveal, measured under the same condition (--wait 6000)
  setTimeout(() => {
    gsap.to(lbox, {
      opacity: 0, duration: reduce ? 0 : 0.5, ease: "sine.in", delay: reduce ? 0 : 0.3,
      onComplete: () => setTimeout(() => { showSplash(); loading.remove(); }, reduce ? 0 : 500),
    });
  }, reduce ? 0 : 200 + 500);
})();
