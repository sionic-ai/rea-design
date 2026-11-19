/* brand experience frame — boot terminal (logs flow and a command is typed, then it waits for ENTER → CRT collapse), header row (language·sound·reel window), gesture hint, section guide ring, loading indicator */
(() => {
  const html = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  const Fun = (window.Fun = { reduce, css, listeners: {} });
  Fun.on = (k, f) => ((Fun.listeners[k] ||= []).push(f));
  Fun.emit = (k, v) => (Fun.listeners[k] || []).forEach((f) => f(v));

  /* Boot — like the original boot section: two status lines → download and shader-compile log (latest six lines, ending in ok) → READY. → typed ”BOOT …” in twelve steps → highlight cell → wait for ENTER */
  const bt = document.getElementById("boot");
  const CMD = "BOOT BRAND.EXE";
  const LOG = [["compiling shaders", 374], ...["BOOT", "VOLT", "MUSEUM", "MONUMENT", "NEON", "POSTER", "BREAKOUT", "RUN", "SHATTER", "LOGO"].map((k) => [`warming ${k}`, 0])];
  /* Original line form — fill the name with 31 dots, then n/total, and ok at the line end when done */
  const bar = (label, n, total, done) => {
    const head = label.length + 2 <= 31 ? `${label} ${".".repeat(31 - label.length - 1)}` : label.padEnd(31);
    const mid = total ? ` ${String(n).padStart(4)}/${String(total).padEnd(4)}` : " ".repeat(10);
    return `${head}${mid}${done ? " ".repeat(10) + "ok" : ""}`;
  };
  Fun.boot = () => new Promise((resolve) => {
    if (!bt) return resolve();
    const status = [...bt.querySelectorAll(".bt__status > p")], log = bt.querySelector(".bt__log"), typed = bt.querySelector(".bt__typed"), tab = bt.querySelector(".bt__tab"), go = bt.querySelector(".bt__go"), tc = bt.querySelector(".bt__tc"), sr = bt.querySelector('[role="status"]');
    const portrait = () => bt.classList.toggle("is-portrait", innerHeight > innerWidth);
    portrait(); addEventListener("resize", portrait);
    let t0 = performance.now();
    const tick = () => { const s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24); tc.textContent = `00:00:${String(Math.floor(s)).padStart(2, "0")}:${String(f).padStart(2, "0")}`; if (bt.dataset.state !== "off") requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
    (async () => {
      /* In the original, the moment the script attaches the boot panel a warm-up flash (.18s) runs — turn it on before building the heavy 3D */
      /* The original renders what finished while the module was loading (two status lines, audio unpacking) all at once the moment it attaches */
      bt.classList.add("is-warm");
      status[0].classList.add("is-on"); status[1].classList.add("is-on");
      { const p = document.createElement("p"); p.className = "is-on"; p.textContent = bar("decoding audio", 24, 24); log.appendChild(p); }
      await wait(120);
      /* In the original the typing steps are tied to the receive progress. During the 3.1s the log flows, steps 1~9 run (the screen flashes 90ms per character), after the pause step 10 highlights a cell and steps 11 and 12 prepare */
      const step = (n) => {
        if (n <= 9) { typed.textContent = CMD.slice(0, n); bt.classList.remove("is-key"); void bt.offsetWidth; bt.classList.add("is-key"); }
        if (n === 10) tab.textContent = CMD.slice(9);
        tab.classList.toggle("is-hl", n === 10 || n === 11);
        bt.classList.add("has-foot");
      };
      const pace = { "compiling shaders": 170 };
      const logs = (async () => {
        for (const [label, total] of LOG) {
          const p = document.createElement("p"); p.className = "is-on is-run"; log.appendChild(p);
          while (log.children.length > 6) log.firstElementChild.remove();
          if (total) { for (let n = 0; n <= total; n += Math.max(1, Math.round(total / 9))) { p.textContent = bar(label, Math.min(n, total), total); await wait(pace[label] || 90); } p.textContent = bar(label, total, total); }
          else { p.textContent = bar(label, 0, 0); await wait(100); p.textContent = bar(label, 0, 0, true); }
          p.classList.remove("is-run");
          Fun.emit("load", (LOG.findIndex((l) => l[0] === label) + 1) / LOG.length);
        }
      })();
      const typing = (async () => { for (let n = 1; n <= 9; n++) { await wait(320); step(n); } })();
      await Promise.all([logs, typing]);
      status[status.length - 1].classList.add("is-on");
      await wait(670);
      for (let n = 10; n <= 12; n++) { step(n); if (n < 12) await wait(900); }
      bt.classList.remove("is-loading"); bt.dataset.state = "ready"; go.disabled = false; go.focus({ preventScroll: true }); sr.textContent = "Ready. Press ENTER to turn on.";
      const fire = () => {
        removeEventListener("keydown", onKey); bt.removeEventListener("click", fire);
        bt.dataset.state = "enter";
        setTimeout(() => { bt.dataset.state = "off"; resolve(); }, reduce ? 0 : 320);
      };
      const onKey = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(); } };
      addEventListener("keydown", onKey); bt.addEventListener("click", fire);
      Fun.emit("ready");
    })();
  });

  /* Headline */
  document.getElementById("ui-lang")?.addEventListener("click", () => { html.lang = html.lang === "ko" ? "en" : "ko"; });
  const sound = document.getElementById("ui-sound");
  sound?.addEventListener("click", () => { const on = body.classList.toggle("is-sound"); sound.setAttribute("aria-pressed", on); sound.querySelector(".ui-sound__label").textContent = on ? "SOUND ON" : "SOUND OFF"; });
  const reel = document.getElementById("ui-reel");
  document.getElementById("ui-watch")?.addEventListener("click", () => reel?.showModal());
  document.getElementById("ui-reel-close")?.addEventListener("click", () => reel?.close());
  reel?.addEventListener("click", (e) => { if (e.target === reel) reel.close(); });

  /* Interaction hint — shown once per section, turned off after 4 loops */
  Fun.hint = (kind, x, y, label) => {
    document.querySelectorAll(".hint.is-on").forEach((h) => h.classList.remove("is-on"));
    const h = document.querySelector(`.hint[data-hint="${kind}"]`);
    if (!h || reduce) return;
    h.style.transform = `translate(${x}px, ${y}px)`;
    if (label) h.querySelector(".hint__label").textContent = label;
    requestAnimationFrame(() => h.classList.add("is-on"));
    clearTimeout(Fun._hintT); Fun._hintT = setTimeout(() => h.classList.remove("is-on"), 7600);
  };
  Fun.hintOff = () => document.querySelectorAll(".hint.is-on").forEach((h) => h.classList.remove("is-on"));

  /* Section guide ring — shows the section intro and clicking the ring calls next() */
  const gate = document.getElementById("gate");
  Fun.gate = (st, next) => {
    if (!gate) return;
    gate.classList.remove("is-open");
    gate.querySelector(".iris-intro__eye").textContent = `${st.num} · ${st.chapter} · ${st.cuts}`;
    gate.querySelector(".iris-intro__h").textContent = st.title;
    gate.querySelector(".iris-intro__p").textContent = st.lead;
    const intro = gate.querySelector(".iris-intro"), ring = gate.querySelector(".iris-ring"), hit = gate.querySelector(".iris-ring__hit");
    intro.classList.remove("is-in"); ring.classList.remove("is-shown"); gate.classList.add("is-on");
    requestAnimationFrame(() => { intro.classList.add("is-in"); ring.classList.add("is-shown"); });
    hit.onclick = () => { gate.classList.add("is-open"); next(); };
  };
  Fun.gateOff = () => gate?.classList.remove("is-on");

  /* Boot starts right when this file loads — so the first screen stands before scene building (index.js) takes the main thread */
  Fun.bootDone = Fun.boot();

  /* Downloading — terminal line at the bottom right while the scene bakes */
  const loading = document.getElementById("ui-loading");
  Fun.loading = (p) => { if (!loading) return; if (p == null || p >= 1) { loading.hidden = true; return; } loading.hidden = false; loading.querySelector(".ui-loading__line").textContent = `LOADING ${Math.round(p * 100)}%`; };
})();
