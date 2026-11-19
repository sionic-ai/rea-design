// On-screen devices: learning loader (original loss curve·log·progress formula as is) → entering, name header entrance·fly-away, user cursor, table-of-contents underlay, sound
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  const loader = $(".rh-loader"), fill = $(".rh-bar i"), pct = $("[data-pct]"), msg = $("[data-msg]"), log = $(".rh-log");
  const poly = $(".rh-chart polyline"), dot = $(".rh-chart circle"), now = $("[data-now]"), live = $(".rh-live"), enter = $(".rh-enter");
  const svg = poly?.ownerSVGElement;
  const ui = $(".rh-ui"), name = $(".rh-name"), line = $(".rh-line"), meta = $(".rh-meta");
  const room = window.rhRoom || { progress: () => 1, ready: () => true };

  // Original loss/accuracy curves and step names
  const loss = (e) => 0.09 + 2.5 * Math.exp(-3.4 * e) + 0.05 * Math.sin(e * 47) * Math.exp(-2.5 * e);
  const acc = (e) => 0.97 - 0.62 * Math.exp(-3 * e);
  const PHASE = [[0, "Loading the dataset"], [0.08, "Training"], [0.88, "Evaluating"], [1, "Converged"]];
  const seen = new Set(), pts = [];
  let last = -1;
  const say = (text, tag = "OK") => {
    if (seen.has(text)) return;
    seen.add(text);
    const li = document.createElement("li");
    li.innerHTML = `<i>[&nbsp;&nbsp;${tag}&nbsp;&nbsp;]</i> `;
    li.append(text);
    log.append(li);
    while (log.children.length > 6) log.firstElementChild.remove();
  };
  const draw = (m) => {
    for (let t = last + 1; t <= Math.floor(m * 120); t++) { pts.push(t / 120); last = t; }
    const w = svg.clientWidth || 300;
    svg.setAttribute("viewBox", `0 0 ${w} 90`);
    poly.setAttribute("points", pts.map((e) => `${(e * w).toFixed(1)},${(90 - (loss(e) / 2.6) * 86).toFixed(1)}`).join(" "));
    dot.setAttribute("cx", (m * w).toFixed(1));
    dot.setAttribute("cy", (90 - (loss(m) / 2.6) * 86).toFixed(1));
    now.textContent = loss(m).toFixed(3);
    for (let k = 1; k <= 6; k++) if (m >= k / 6) say(`epoch ${k}/6  loss ${loss(k / 6).toFixed(3)}  acc ${acc(k / 6).toFixed(2)}  val ✓`);
    const t = performance.now();
    const tok = 11.4 + 1.6 * Math.sin(t / 310) + 0.6 * Math.sin(t / 97);
    live.textContent = `step ${Math.round(m * 6000)}/6000 · ${m < 1 ? tok.toFixed(1) : "0.0"}k tok/s · gpu ${m < 1 ? 94 + Math.round(4 * Math.sin(t / 500)) : 0}%`;
  };
  const cells = () => { const bar = fill.parentElement, w = bar.clientWidth + 3; bar.style.setProperty("--cell", `${w / Math.max(1, Math.round(w / 13))}px`); };
  cells();
  addEventListener("resize", cells);
  say("dataset: the room, the street, the desk  (14 shards)");

  // Original progress — toward the target (receiving scene) by at least dt/2500 (/700 once received), taking 1−e^(−dt/350) of the remainder
  let m = 0, prev = performance.now(), shown = false;
  const step = (t) => {
    const ready = room.ready();
    const goal = ready ? 1 : room.progress();
    const dt = Math.max(0, Math.min(t - prev, 1000 / 30));
    m = Math.min(goal, m + Math.max(dt / (ready ? 700 : 2500), (goal - m) * (1 - Math.exp(-dt / (ready ? 150 : 350)))));
    prev = t;
    fill.style.transform = `scaleX(${m})`;
    pct.textContent = `${Math.floor(m * 100)}%`;
    const label = PHASE.filter(([e]) => m >= e).pop()[1];
    if (msg.textContent !== label) msg.textContent = label;
    draw(m);
    if (m >= 1) setTimeout(showEnter, 250); else requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  const showEnter = () => {
    if (shown) return;
    shown = true;
    enter.hidden = false;
    enter.querySelector('[data-sound="off"]').focus();
    enter.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sound]");
      if (!b) return;
      setSound(b.dataset.sound === "on");
      enter.hidden = true;
      go();
    });
  };

  // Original — on entry the curtain lifts after .32s, the name letters rise after 4.7s (.15 delay), and after 3.6s it flies to the signature spot. Clicking anywhere makes it fly at once.
  let flown = false, flyTimer = 0, introTimer = 0;
  const chars = [...name.querySelectorAll(".c")];
  const go = () => {
    say("deploying the model to the screen", "RUN");
    loader.classList.add("is-off");
    dispatchEvent(new Event("rh:intro"));
    if (reduce) { ui.classList.remove("is-intro", "is-hidden"); ui.classList.add("is-sig"); document.body.classList.remove("is-opening"); dispatchEvent(new Event("rh:settled")); return; }
    introTimer = setTimeout(() => {
      document.body.classList.remove("is-opening");
      ui.classList.remove("is-hidden");
      gsap.to(chars, { y: 0, duration: 1.15, ease: "power4.out", stagger: 0.035, delay: 0.15, clearProps: "transform" });
      gsap.to(line, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: 0.85, startAt: { y: 14 } });
      flyTimer = setTimeout(() => fly(false), 3600);
    }, 4700);
    const skip = () => fly(true);
    addEventListener("pointerdown", skip, { once: true });
    addEventListener("keydown", skip, { once: true });
  };
  const fly = (fast) => {
    if (flown) return;
    flown = true;
    clearTimeout(flyTimer); clearTimeout(introTimer);
    document.body.classList.remove("is-opening");
    ui.classList.remove("is-hidden");
    gsap.killTweensOf([line, ...chars]);
    gsap.set(chars, { clearProps: "transform" });
    gsap.to(line, { opacity: 0, duration: fast ? 0.15 : 0.35, ease: "power1.in", onComplete: () => {
      const a = name.getBoundingClientRect();
      ui.classList.replace("is-intro", "is-sig");
      const b = name.getBoundingClientRect();
      ui.classList.replace("is-sig", "is-intro");
      gsap.to(name, { x: b.left - a.left, y: b.top - a.top, scale: b.width / a.width, transformOrigin: "0 0", duration: fast ? 0.7 : 1.25, ease: "expo.inOut", onComplete: () => {
        ui.classList.replace("is-intro", "is-sig");
        gsap.set(name, { clearProps: "transform,transformOrigin" });
        gsap.from(meta, { opacity: 0, y: 8, duration: 0.6, ease: "power2.out" });
        dispatchEvent(new Event("rh:settled"));
        setTimeout(() => document.body.classList.add("is-explored"), 5500);
      } });
    } });
  };
  document.body.classList.add("is-opening");
  ui.classList.add("is-intro", "is-hidden");
  if (!reduce) { chars.forEach((c) => (c.style.transform = "translateY(110%)")); line.style.opacity = "0"; }

  // Custom cursor — off on touch devices
  const cur = $(".rh-cursor");
  const fine = matchMedia("(pointer: fine)").matches;
  if (cur && fine) {
    document.documentElement.classList.add("rh-custom-cursor");
    const label = cur.querySelector(".label");
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const t = e.target;
      const kind = t.closest?.("canvas") ? "room" : t.closest?.(".rh-index button, .rh-undock, .rh-sound, .rh-enter button, a, button") ? "control" : "";
      cur.classList.toggle("is-on", true);
      cur.classList.toggle("is-press", kind === "control");
      const hot = kind === "room" ? (window.rhRoom?.hover?.() || "") : "";
      cur.classList.toggle("is-label", !!hot);
      cur.classList.toggle("is-drag", kind === "room" && !!window.rhRoom?.dragging?.());
      if (hot && label.textContent !== hot) label.textContent = hot;
    });
    document.documentElement.addEventListener("pointerleave", () => cur.classList.remove("is-on"));
  }

  // TOC base panel — slides under the current-position button
  const idx = $(".rh-index"), ind = idx?.querySelector(".ind");
  const moveInd = () => {
    const b = idx.querySelector('button[aria-current="true"]');
    ind.style.opacity = b ? "1" : "0";
    if (b) { ind.style.translate = `${b.offsetLeft}px 0`; ind.style.width = `${b.offsetWidth}px`; }
  };
  if (idx) { new MutationObserver(moveInd).observe(idx, { subtree: true, attributeFilter: ["aria-current"] }); addEventListener("resize", moveInd); }

  // Sound — the original plays room sound (rain · hum). Instead of a supplied file, a low hum + filtered noise is generated at very low volume with WebAudio.
  const sound = $(".rh-sound");
  let ctx = null, master = null;
  function setSound(on) {
    sound?.setAttribute("aria-pressed", String(on));
    if (on && !ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      const hum = ctx.createOscillator(); hum.frequency.value = 55; const hg = ctx.createGain(); hg.gain.value = 0.25; hum.connect(hg).connect(master); hum.start();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
      const ng = ctx.createGain(); ng.gain.value = 0.35; n.connect(lp).connect(ng).connect(master); n.start();
    }
    if (ctx) { ctx.resume(); master.gain.setTargetAtTime(on ? 0.04 : 0, ctx.currentTime, 0.4); }
  }
  sound?.addEventListener("click", () => setSound(sound.getAttribute("aria-pressed") !== "true"));
  window.rhUI = { setSound };
})();
