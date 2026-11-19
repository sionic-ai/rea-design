/* Home — fixed hero cycling four scenes (5s·5s·5s·8.1s, exit 1.1s), manifesto flow (24s per loop · typing),
   Work slide (three r184 shader: yellow diagonal intro → 26° diagonal band transition 1.9s → screen split after 2s), partner bracket frame, award table, feature banner tilt. */
(() => {
  const TB = window.TB;
  if (!TB) return;
  const { unit, isDesk, reduce } = TB;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const tan26 = Math.tan((26 * Math.PI) / 180);

  // ───── Lottie — plays with lottie-web like the original, but the art is a line animation we made ─────
  const lottieData = (kind) => {
    const fr = 30, op = kind === "brackets" ? 150 : 90, W = kind === "bars" ? 96 : kind === "wave" ? 1440 : 1200, H = kind === "bars" ? 16 : kind === "wave" ? 120 : 600;
    const stroke = { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: kind === "bars" ? 2 : 1.5 }, lc: 1, lj: 1 };
    const trim = (t0, t1) => ({ ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: t0, s: [0], i: { x: [0.23], y: [1] }, o: { x: [0.77], y: [0] } }, { t: t1, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 });
    const path = (pts, closed = false) => ({ ty: "sh", ks: { a: 0, k: { c: closed, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) } } });
    const shapes = [];
    if (kind === "wave") {
      const pts = []; for (let x = 0; x <= W; x += 40) pts.push([x, H / 2 + Math.sin(x / 90) * 30 * Math.sin((x / W) * Math.PI)]);
      shapes.push({ ty: "gr", it: [path(pts), stroke, trim(0, 40), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] });
    } else if (kind === "bars") {
      for (let k = 0; k < 6; k++) shapes.push({ ty: "gr", it: [path([[8 + k * 14, H], [14 + k * 14, 0]]), stroke, trim(k * 4, k * 4 + 16), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] });
    } else {
      const g = (pts, t0) => ({ ty: "gr", it: [path(pts), stroke, trim(t0, t0 + 28), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] });
      shapes.push(g([[120, 40], [60, 40], [60, 560], [120, 560]], 0));
      shapes.push(g([[1080, 40], [1140, 40], [1140, 560], [1080, 560]], 6));
      for (let k = 0; k < 5; k++) shapes.push(g([[380 + k * 90, 80], [380 + k * 90 + 520 * tan26, 520]], 10 + k * 4));
      shapes.push(g([[300, 300], [900, 300]], 36));
    }
    return { v: "5.7.4", fr, ip: 0, op, w: W, h: H, nm: kind, ddd: 0, assets: [], layers: [{ ddd: 0, ind: 1, ty: 4, nm: kind, sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } }, ao: 0, shapes, ip: 0, op, st: 0, bm: 0 }] };
  };

  // ───── Placeholder video — draws the subject silhouette and light on canvas, moving every frame ─────
  const fakeVideo = (canvas, o) => {
    const ctx = canvas.getContext("2d");
    const draw = (t) => {
      const w = canvas.width, h = canvas.height;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, o.c0); g.addColorStop(1, o.c1);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.5;
      for (let k = 0; k < 40; k++) { const x = ((k * 97.3 + t * 8 * (k % 3 + 1)) % (w + 40)) - 20, y = (k * 53.7) % (h * 0.6); ctx.fillStyle = o.spark; ctx.fillRect(x, y, 1.5, 1.5); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = o.shape;
      const bx = w * 0.32 + Math.sin(t * 0.3) * w * 0.02, by = h * 0.55;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + w * 0.38, by - h * 0.02); ctx.lineTo(bx + w * 0.44, by + h * 0.16); ctx.lineTo(bx - w * 0.02, by + h * 0.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = o.light; ctx.fillRect(bx + w * 0.3, by + h * 0.05, w * 0.12, h * 0.012);
      ctx.fillStyle = o.text; ctx.font = `${Math.round(h * 0.022)}px ${o.font}`; ctx.fillText(o.label, w * 0.03, h * 0.94);
    };
    return draw;
  };
  // Reads skin variables as pixels and mixes them — canvas and shaders can’t use color-mix
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const toRGB = (s) => { px.clearRect(0, 0, 1, 1); px.fillStyle = s; px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
  const mixRGB = (a, b, t) => `rgb(${a.map((v, k) => Math.round(v * t + b[k] * (1 - t))).join(",")})`;
  const palette = () => {
    const ink = toRGB(css("--kf-contrast-ink")), bg = toRGB(css("--kf-contrast-bg")), acc = toRGB(css("--kf-accent"));
    return { ink, bg, acc, inkS: mixRGB(ink, ink, 1), accS: mixRGB(acc, acc, 1), font: css("--kf-font-sans") };
  };

  // ───── Hero ─────
  const kv = (scope) => {
    const root = scope.querySelector(".hm-kv");
    if (!root) return () => {};
    const scenes = [...root.querySelectorAll(".hm-scene")];
    const overlay = root.querySelector(".hm-kv__overlay");
    const cv = root.querySelector(".hm-kv__video");
    const pal = palette();
    const draw = fakeVideo(cv, { c0: mixRGB(pal.bg, pal.ink, 0.92), c1: mixRGB(pal.bg, pal.ink, 0.7), spark: pal.inkS, shape: mixRGB(pal.bg, pal.ink, 0.55), light: pal.inkS, text: pal.inkS, font: pal.font, label: cv.dataset.label });
    const fit = () => { cv.width = 640; cv.height = Math.round(640 * (cv.clientHeight / Math.max(1, cv.clientWidth))); };
    fit();
    addEventListener("resize", fit);
    let inView = true, t0 = performance.now();
    const tick = () => { if (inView) draw((performance.now() - t0) / 1000); };
    gsap.ticker.add(tick);

    // Lottie per scene
    const anims = [];
    root.querySelectorAll("[data-lottie]").forEach((el) => {
      if (!window.lottie) return;
      const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: lottieData(el.dataset.lottie) });
      anims.push({ el, a });
    });
    scenes.forEach((s) => s.querySelectorAll("[data-st]").forEach((el) => { el.style.setProperty("--start-delay", "0.2s"); }));
    scenes.forEach((s) => s.querySelectorAll(".hm-kv5__line span").forEach((sp, n) => sp.style.setProperty("--n", n)));
    const marquee = root.querySelector(".hm-kv3__track");
    const mq = marquee ? gsap.to(marquee, { xPercent: -50, ease: "none", repeat: -1, duration: 18, paused: true }) : null;

    const stay = [5000, 5000, 5000, 8100], leave = [1100, 1100, 1100, 0];
    const order = gsap.utils.shuffle(scenes.map((_, i) => i));
    let idx = 0, timer = 0, active = -1;
    const activate = (i) => {
      const s = scenes[i];
      active = i;
      scenes.forEach((x) => x.classList.toggle("is-active", x === s));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        s.classList.add("is-st-on");
        TB.drawGrid(s.querySelector(".tb-grid"), true);
        anims.forEach(({ el, a }) => (s.contains(el) ? a.goToAndPlay(0, true) : a.pause()));
        if (mq) (s.contains(marquee) ? mq.play() : mq.pause());
      }));
    };
    const next = () => {
      if (!inView) { timer = 0; return; }
      const cur = order[idx];
      const s = scenes[cur];
      TB.drawGrid(s.querySelector(".tb-grid"), false);
      gsap.to(s, { opacity: 0, duration: 0.3, delay: Math.max(0, leave[cur] / 1000 - 0.3), onComplete: () => { s.classList.remove("is-st-on"); gsap.set(s, { opacity: 1 }); } });
      idx = (idx + 1) % order.length;
      timer = setTimeout(() => { activate(order[idx]); schedule(); }, leave[cur]);
    };
    const schedule = () => { timer = setTimeout(next, stay[order[idx]]); };
    const start = () => { if (active === -1) { activate(order[0]); schedule(); } };
    if (reduce) { activate(order[0]); } else {
      document.addEventListener("tb:loader-leave", () => setTimeout(start, 420), { once: true });
      if (document.documentElement.classList.contains("is-loading-done")) start();
    }

    // Scroll: the hero is pushed up at a 0.75 ratio while a black veil deepens with power1.inOut
    const ease = gsap.parseEase("power1.inOut");
    const onScroll = ({ animatedScroll }) => {
      const e = (isDesk() ? 810 : 680) * unit();
      const n = animatedScroll / e;
      const was = inView;
      inView = n <= 1;
      // Like the original, scene cycling stops when the Hero leaves the screen, and on return counts again from the current scene
      if (was && !inView) { clearTimeout(timer); timer = 0; }
      else if (!was && inView && active !== -1 && !timer && !reduce) schedule();
      if (n > 1.05) return;
      const i = gsap.utils.clamp(0, 1, n);
      overlay.style.opacity = ease(i);
      root.style.translate = `0 ${i * 0.75 * -e}px`;
    };
    TB.lenis.on("scroll", onScroll);
    return () => { clearTimeout(timer); gsap.ticker.remove(tick); TB.lenis.off("scroll", onScroll); anims.forEach(({ a }) => a.destroy()); mq?.kill(); removeEventListener("resize", fit); };
  };

  // ───── Manifesto flow ─────
  const PHRASES = ["Your short slogan goes here.", "Slogan text, two slots.", "Your third slogan here.", "A slogan telling you to question the question.", "Your fifth slogan here.", "Starting over from how it is made.", "Your seventh slogan here.", "Slogan slot number eight.", "Move hearts, not just words.", "Your tenth slogan here.", "Running together from the start.", "Your 12th slogan.", "A place to weave stories.", "Feel over logic."];
  const SMALLS = ["Your small slogan here.", "Two small slogan slots.", "Your three short sentences here.", "Four small slogan slots."];
  const about = (scope) => {
    const sec = scope.querySelector(".hm-about");
    if (!sec) return () => {};
    const track = sec.querySelector(".hm-about__track");
    const rows = 14;
    const rowHTML = (i) => `<div class="hm-about__row"><span class="hm-about__big" style="--x:calc(${(-184 + (i % rows) * 116 * tan26).toFixed(1)} * var(--u))" data-text="${PHRASES[i % PHRASES.length]}"></span><div class="hm-about__smalls">${SMALLS.map((s, k) => `<span>${SMALLS[(i + k) % SMALLS.length]}</span>`).join("")}</div></div>`;
    track.innerHTML = Array.from({ length: rows * 2 }, (_, i) => rowHTML(i)).join("");
    const bigs = [...track.querySelectorAll(".hm-about__big")];
    const GL = "■@HWA\\";
    const typed = new Set();
    const type = (el) => {
      typed.add(el);
      const s = el.dataset.text, n = [...s].length;
      const o = { k: 0 };
      gsap.to(o, { k: n, duration: n * 0.06, ease: "none", onUpdate: () => {
        const k = Math.floor(o.k);
        el.textContent = [...s].slice(0, k).join("") + (k < n ? GL[Math.floor(Math.random() * GL.length)] : "");
      } });
    };
    if (reduce) { bigs.forEach((b) => (b.textContent = b.dataset.text)); return () => {}; }
    const dur = isDesk() ? 24 : 31;
    let tween = null, played = false;
    const tick = () => {
      const top = sec.getBoundingClientRect().top, h = sec.clientHeight;
      if (top > innerHeight || top < -h) return;
      bigs.forEach((b) => {
        const y = b.getBoundingClientRect().top - top;
        if (y < h * 0.92 && y > -40 && !typed.has(b)) type(b);
        if ((y < -80 || y > h) && typed.has(b)) { typed.delete(b); gsap.killTweensOf(b); b.textContent = ""; }
      });
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !played) { played = true; tween = gsap.fromTo(track, { yPercent: 0 }, { yPercent: -50, duration: dur, ease: "none", repeat: -1 }); gsap.ticker.add(tick); }
      if (tween) e.isIntersecting ? tween.play() : tween.pause();
    }, { rootMargin: "-20% 0px" });
    io.observe(sec);
    return () => { io.disconnect(); tween?.kill(); gsap.ticker.remove(tick); };
  };

  // ───── Work slide ─────
  const SLIDES = [
    { client: "Client Name", project: "PROJECT TITLE IS BACK", cat: "Automotive<br>TV Commercial", date: "July 0000", label: "Ad video · front lights of a minivan in a night desert · cool blue · 16:9", tone: [0.86, 0.62] },
    { client: "Brand Name Japan", project: "MY SPECIAL TITLE.", cat: "Creative", date: "July 0000", label: "Ad video · close-up of a person holding a spoon · warm indoor light · 16:9", tone: [0.55, 0.3] },
    { client: "Sports Brand", project: "TITLE", cat: "Creative", date: "April 0000", label: "Animated video · player in uniform · purple and pink · 16:9", tone: [0.7, 0.4] },
    { client: "Radio Name", project: "TIME MACHINE", cat: "Creative<br>Innovation", date: "March 0000", label: "Product video · hand turning an old radio dial · brown · 16:9", tone: [0.5, 0.35] },
    { client: "Government Name", project: "CHEER SIGNS", cat: "Creative<br>Innovation", date: "November 0000", label: "Documentary video · people raising hands to cheer · overcast day · 16:9", tone: [0.45, 0.25] },
  ];
  const work = (scope) => {
    const sec = scope.querySelector(".hm-work");
    if (!sec) return () => {};
    const stage = sec.querySelector(".hm-work__stage");
    const sticky = sec.querySelector(".hm-work__sticky");
    const cv = sec.querySelector(".hm-work__gl");
    const titles = sec.querySelector(".hm-work__titles");
    const navEl = sec.querySelector(".hm-work__nav");
    const mtrack = sec.querySelector(".hm-work__mtrack");
    const triggers = [...sec.querySelectorAll(".hm-work__triggers > div")];
    const cleanup = [];

    // Three sets of titles (horizontal flow)
    const titleHTML = (s, i) => `<div class="hm-work__t" data-i="${i}" data-label="Advertiser · project English name, two lines"><p class="hm-work__client">${s.client.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ")}</p><p class="hm-work__project">${s.project.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ")}</p></div>`;
    titles.innerHTML = `<div class="hm-work__ttrack">${[0, 1, 2].map(() => `<div class="hm-work__tset">${SLIDES.map(titleHTML).join("")}</div>`).join("")}</div>`;
    navEl.innerHTML = SLIDES.map((s, i) => `<li data-i="${i}"><span>0${i + 1}</span><button type="button">${s.project}</button></li>`).join("");
    const creditUl = sec.querySelector(".hm-work__credit");
    creditUl.innerHTML = ["Executive CD", "Copywriter", "Art Director", "Planner", "Producer"].map((r, k) => `<li>${r}</li><li>Name Name ${k + 1}</li>`).join("");
    const words = (i) => [...titles.querySelectorAll(`.hm-work__t[data-i="${i}"] .w`)];
    words(0).concat(...SLIDES.map((_, i) => words(i))).forEach((w) => (w.dataset.text = w.textContent));
    const tsets = [...titles.querySelectorAll(".hm-work__tset")];
    const tmq = gsap.to(tsets, { xPercent: -100, ease: "none", repeat: -1, duration: 15, paused: true });
    const setMarquee = (i) => {
      const s = SLIDES[i];
      mtrack.innerHTML = Array.from({ length: 8 }, () => `<span>${s.project}　${s.client}</span>`).join("");
    };
    setMarquee(0);
    const mm = gsap.to(mtrack, { xPercent: -50, ease: "none", repeat: -1, duration: 15, paused: true });

    // Text scramble — .4s linear on entry (.1s per word), .3s power2.in on exit via backslash
    const REVEAL_CHARS = "STUDIONAME\\■%*/+!?><■■■□□□□";
    const reveal = (i) => {
      titles.querySelectorAll(`.hm-work__t[data-i="${i}"]`).forEach((t) => t.classList.add("is-active"));
      words(i).forEach((w, k) => gsap.fromTo(w, { scrambleText: { text: "" } }, { duration: 0.4, delay: (k % 4) * 0.1, ease: "linear", overwrite: true, scrambleText: { text: w.dataset.text, chars: REVEAL_CHARS, speed: 0.7, tweenLength: true, delimiter: "" } }));
    };
    const sweep = (i, done) => {
      const ws = words(i);
      if (!ws.length) return done();
      let n = 0;
      ws.forEach((w) => gsap.to(w, { duration: 0.3, ease: "power2.in", overwrite: true, scrambleText: { text: "", chars: "\\\\\\", speed: 0.5, delimiter: "" }, onComplete: () => {
        if (++n < ws.length) return;
        ws.forEach((x) => (x.textContent = x.dataset.text));
        titles.querySelectorAll(`.hm-work__t[data-i="${i}"]`).forEach((t) => t.classList.remove("is-active"));
        done();
      } }));
    };
    // One word becomes a 100ms highlighter — every 700~1000ms, with probability word count/8 (max .7)
    let hlTimer = 0;
    const highlight = (i) => {
      clearTimeout(hlTimer);
      const ws = titles.querySelectorAll(`.hm-work__tset:first-child .hm-work__t[data-i="${i}"] .w`);
      const tick = () => {
        if (Math.random() < Math.min(ws.length / 8, 0.7) && ws.length) {
          const k = Math.floor(Math.random() * ws.length);
          titles.querySelectorAll(`.hm-work__t[data-i="${i}"]`).forEach((t) => { const w = t.querySelectorAll(".w")[k]; w?.classList.add("is-hl"); setTimeout(() => w?.classList.remove("is-hl"), 100); });
        }
        hlTimer = setTimeout(tick, Math.floor(Math.random() * 300) + 700);
      };
      hlTimer = setTimeout(tick, Math.floor(Math.random() * 300) + 700);
    };
    cleanup.push(() => clearTimeout(hlTimer));

    // ── WebGL ──
    let gl = null;
    if (window.THREE && !reduce) {
      try { gl = makeGL(cv, sec); } catch (e) { gl = null; }
    }
    if (gl) cleanup.push(gl.destroy);
    else { cv.style.background = "var(--kf-contrast-bg)"; }

    let active = 0, introEnd = false, state = "idle";
    const metaCat = sec.querySelector(".hm-work__cat"), metaDate = sec.querySelector(".hm-work__date");
    const setMeta = (i) => { metaCat.innerHTML = SLIDES[i].cat; metaDate.textContent = SLIDES[i].date; navEl.querySelectorAll("li").forEach((li, k) => li.classList.toggle("is-active", k === i)); setMarquee(i); };
    const switchSlide = (i) => {
      if (i === active) return;
      const prev = active;
      active = i;
      gl?.switchTo(i);
      setMeta(i);
      highlight(i);
      if (state === "revealing" || state === "intro-static") { state = "sweeping"; sweep(prev, () => { state = "revealing"; reveal(i); }); }
      else { state = "revealing"; reveal(i); }
    };

    const ease = gsap.parseEase("power1.inOut");
    const introProgress = () => {
      const r = stage.getBoundingClientRect(), vh = innerHeight, d = isDesk();
      const a = d ? vh * 1.3 : vh * 0.9, b = d ? vh * -1.9 : vh * -1.1;
      return ease(gsap.utils.clamp(0, 1, (a - r.top) / (a - b)));
    };
    const progresses = () => {
      if (!isDesk()) return;
      const vh = innerHeight, n = vh * 0.52, i0 = vh * 0.48, last = triggers.length - 1, e4 = gsap.parseEase("ease4");
      navEl.querySelectorAll("li").forEach((li, a) => {
        let p;
        if (a < active) p = 1; else if (a > active) p = 0;
        else {
          const s = triggers[a].getBoundingClientRect();
          const c = a === 0 ? gsap.utils.clamp(0, 1, (vh - s.top) / (i0 + s.height)) : a === last ? gsap.utils.clamp(0, 1, (n - s.top) / (s.height - i0)) : gsap.utils.clamp(0, 1, (n - s.top) / s.height);
          p = e4(c);
        }
        li.querySelector("button").style.setProperty("--p", p.toFixed(4));
      });
    };
    const onScroll = ({ velocity }) => {
      const p = introProgress();
      if (active === 0) {
        gl?.setIntro(p);
        sticky.classList.toggle("is-intro-end", p >= 0.8);
        if (p >= 0.8 && !introEnd) { introEnd = true; titles.querySelectorAll('.hm-work__t[data-i="0"]').forEach((t) => t.classList.add("is-active")); state = "intro-static"; highlight(0); }
        else if (p < 0.8 && introEnd) { introEnd = false; state = "sweeping"; sweep(0, () => { state = "idle"; }); }
      }
      tmq.timeScale(gsap.utils.clamp(1, 4, 1 + Math.abs(velocity || 0) / 4));
      progresses();
    };
    TB.lenis.on("scroll", onScroll);
    cleanup.push(() => TB.lenis.off("scroll", onScroll));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && introEnd) switchSlide(Number(e.target.dataset.i)); }), { rootMargin: "-48% 0px" });
    triggers.forEach((t) => io.observe(t));
    const vio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tmq.play(); mm.play(); gl?.resume(); } else { tmq.pause(); mm.pause(); gl?.pause(); } });
    vio.observe(sec);
    cleanup.push(() => { io.disconnect(); vio.disconnect(); tmq.kill(); mm.kill(); });
    navEl.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (li) TB.lenis.scrollTo(triggers[Number(li.dataset.i)], { duration: 0.6, offset: -innerHeight * 0.45 });
    });
    // Partner logos every 0.25s
    const logos = [...sec.querySelectorAll(".hm-work__logos i")];
    let li = 0;
    const lt = setInterval(() => { logos.forEach((l, k) => l.classList.toggle("is-on", k === li % logos.length)); li++; }, 250);
    cleanup.push(() => clearInterval(lt));
    setMeta(0);
    onScroll({ velocity: 0 });
    return () => cleanup.forEach((f) => f());
  };

  // three r184 — one shader on a plate covering the screen. Not the original shader code but newly written from measured values
  const makeGL = (canvas, sec) => {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 2);
    const pal = palette();
    const shade = (t) => mixRGB(pal.bg, pal.ink, t);
    const media = SLIDES.map((s) => {
      const c = document.createElement("canvas"); c.width = 768; c.height = 432;
      const draw = fakeVideo(c, { c0: shade(s.tone[0]), c1: shade(s.tone[1]), spark: pal.inkS, shape: shade(0.35), light: pal.accS, text: pal.inkS, font: pal.font, label: s.label });
      draw(0);
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
      return { c, draw, tex };
    });
    const uni = {
      uA: { value: media[0].tex }, uB: { value: media[0].tex }, uScreen: { value: 16 / 9 }, uMedia: { value: 16 / 9 },
      uIntro: { value: 0 }, uProg: { value: 0 }, uApproach: { value: 0 }, uSplitN: { value: new T.Vector2(1, 1) }, uSplitProg: { value: 0 },
      uAccent: { value: new T.Vector3(...pal.acc.map((v) => v / 255)) }, uBg: { value: new T.Vector3(...pal.bg.map((v) => v / 255)) }, uSeed: { value: 0 }, uZoom: { value: 1 }, uTime: { value: 0 },
    };
    const mat = new T.ShaderMaterial({
      uniforms: uni,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uA, uB; uniform float uScreen, uMedia, uIntro, uProg, uApproach, uSplitProg, uSeed, uZoom, uTime;
        uniform vec2 uSplitN; uniform vec3 uAccent, uBg;
        float hash(float n){ return fract(sin(n * 78.233 + uSeed * 12.9898) * 43758.5453); }
        vec2 cover(vec2 uv){ float s = uScreen / uMedia; vec2 o = uv - 0.5; if (s > 1.0) o.y /= s; else o.x *= s; return o + 0.5; }
        float cross2(vec2 a, vec2 b){ return a.x * b.y - a.y * b.x; }
        // Map a point inside the quad’s four corners back to 0~1 cell coordinates (convex quad)
        vec2 invBilinear(vec2 p, vec2 a, vec2 b, vec2 c, vec2 d){
          vec2 e = b - a, f = d - a, g = a - b + c - d, h = p - a;
          float k2 = cross2(g, f), k1 = cross2(e, f) + cross2(h, g), k0 = cross2(h, e);
          if (abs(k2) < 1e-4) { float v = -k0 / k1; float u = (h.x - f.x * v) / (e.x + g.x * v); return vec2(u, v); }
          float w = k1 * k1 - 4.0 * k0 * k2; if (w < 0.0) return vec2(-1.0);
          w = sqrt(w); float v = (-k1 - w) / (2.0 * k2); float u = (h.x - f.x * v) / (e.x + g.x * v);
          if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) { v = (-k1 + w) / (2.0 * k2); u = (h.x - f.x * v) / (e.x + g.x * v); }
          return vec2(u, v);
        }
        vec3 media(sampler2D t, vec2 uv, float ab){
          vec2 c = cover(uv);
          return vec3(texture2D(t, c + vec2(ab, 0.0)).r, texture2D(t, c).g, texture2D(t, c - vec2(ab, 0.0)).b);
        }
        vec3 slashTex(vec2 luv){
          float tn = 0.5095; // tan 27°
          float xc = 0.5 - (luv.y - 0.5) * tn / uScreen;
          float hw = 0.07 * min(1.0, 1.0 / uScreen);
          return mix(uBg, uAccent, step(abs(luv.x - xc), hw));
        }
        void main(){
          vec2 uv = (vUv - 0.5) / uZoom + 0.5;
          // Split — repeats the same screen in cols×rows cells, revealed in cell order
          vec2 suv = uv;
          float cells = uSplitN.x * uSplitN.y;
          if (cells > 1.5) {
            vec2 cid = floor(uv * uSplitN);
            float k = (cid.x + (uSplitN.y - 1.0 - cid.y) * uSplitN.x) / cells;
            if (uSplitProg > k) suv = fract(uv * uSplitN);
          }
          // Transition — 24 diagonal bands at 26°, random delay per band (spread .55), covering from top to bottom
          float s = uv.x + (uv.y - 0.5) * 0.4877 / uScreen;
          float strip = floor(clamp(s, 0.0, 0.9999) * 24.0);
          float d = hash(strip) * 0.55;
          float local = clamp((uProg - d) / (1.0 - 0.55), 0.0, 1.0);
          float edge = smoothstep(0.0, 0.08, abs(local - (1.0 - uv.y)));
          float ab = (1.0 - edge) * 0.036 * step(0.001, uProg) * step(uProg, 0.999);
          vec3 a = media(uA, suv, ab * 0.5), b = media(uB, uv, ab);
          vec3 col = mix(a, b, step(1.0 - uv.y, local));
          // Intro — the plate with a yellow diagonal line expands from ±.225 to ±.5, later at each corner, and switches to video at .52~.82
          if (uIntro < 0.999) {
            float i = uIntro;
            float t0 = smoothstep(0.0, 1.0, clamp(i, 0.0, 1.0));
            float t1 = smoothstep(0.0, 1.0, clamp((i - 0.08) / 0.46, 0.0, 1.0));
            float t2 = smoothstep(0.0, 1.0, clamp((i - 0.22) / 0.48, 0.0, 1.0));
            float t3 = smoothstep(0.0, 1.0, clamp((i - 0.4) / 0.5, 0.0, 1.0));
            float q = 0.225;
            vec2 A = mix(vec2(-q, -q), vec2(-0.5, -0.5), t0);
            vec2 B = mix(vec2(q, -q), vec2(0.5, -0.5), t1);
            vec2 C = mix(vec2(q, q), vec2(0.5, 0.5), t2);
            vec2 D = mix(vec2(-q, q), vec2(-0.5, 0.5), t3);
            vec2 luv = invBilinear(uv - 0.5, A, B, C, D);
            float inside = step(0.0, luv.x) * step(luv.x, 1.0) * step(0.0, luv.y) * step(luv.y, 1.0);
            float vt = smoothstep(0.0, 1.0, clamp((i - 0.52) / 0.3, 0.0, 1.0));
            vec3 introCol = mix(slashTex(luv), media(uA, luv, 0.0), vt);
            col = mix(uBg, introCol, inside);
          }
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
    scene.add(mesh);
    const size = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      uni.uScreen.value = w / Math.max(1, h);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(canvas);
    renderer.compile(scene, cam);
    let cur = 0, nextI = 0, paused = false, t0 = performance.now(), splitTimer = 0, switching = false;
    const render = () => {
      if (paused) return;
      const t = (performance.now() - t0) / 1000;
      media[cur].draw(t); media[cur].tex.needsUpdate = true;
      if (switching) { media[nextI].draw(t); media[nextI].tex.needsUpdate = true; }
      renderer.render(scene, cam);
    };
    gsap.ticker.add(render);
    let lastSplit = null;
    const splitCfg = () => {
      for (;;) {
        let c = 1, r = 1;
        if (Math.random() < 0.5) while (c === 1 && r === 1) { c = 1 + Math.floor(Math.random() * 3); r = 1 + Math.floor(Math.random() * 3); }
        if (lastSplit && c > 1 && lastSplit[0] === c && lastSplit[1] === r) continue;
        lastSplit = [c, r]; return [c, r];
      }
    };
    const idleSplit = (delay) => {
      clearTimeout(splitTimer);
      splitTimer = setTimeout(() => {
        if (paused || switching) return;
        const [c, r] = splitCfg();
        uni.uSplitN.value.set(c, r);
        uni.uSplitProg.value = 0;
        gsap.to(uni.uSplitProg, { value: 1, duration: Math.min(0.9, Math.max(0.25, c * r * 0.07)), ease: "none", onComplete: () => idleSplit(4000 + Math.random() * 2500) });
      }, delay);
    };
    const api = {
      setIntro(p) { uni.uIntro.value = p; if (cur === 0) { if (p >= 1) idleSplit(2000); else { clearTimeout(splitTimer); uni.uSplitN.value.set(1, 1); } } },
      switchTo(i) {
        if (i === cur) return;
        clearTimeout(splitTimer);
        uni.uSplitN.value.set(1, 1);
        uni.uIntro.value = 1;
        nextI = i; switching = true;
        uni.uSeed.value = Math.random() * 1000;
        uni.uB.value = media[i].tex;
        uni.uProg.value = 0;
        gsap.killTweensOf(uni.uZoom);
        gsap.to(uni.uZoom, { keyframes: [{ value: 0.95, duration: 1.1 * 0.3, ease: "power2.out" }, { value: 0.95, duration: 1.1 * 0.08, ease: "none" }, { value: 1, duration: 1.1 * 0.57, ease: "power2.inOut" }] });
        gsap.to(uni.uProg, { value: 1, duration: 1.9, ease: CustomEase.create("wkSwitch", ".29,.06,.21,.98"), overwrite: true, onComplete: () => {
          cur = i; switching = false; uni.uA.value = media[i].tex; uni.uProg.value = 0; idleSplit(2000);
        } });
      },
      pause() { paused = true; clearTimeout(splitTimer); },
      resume() { if (!paused) return; paused = false; },
      destroy() { gsap.ticker.remove(render); clearTimeout(splitTimer); ro.disconnect(); media.forEach((m) => m.tex.dispose()); mat.dispose(); renderer.dispose(); },
    };
    return api;
  };

  // ───── Partners — bracket frame glides to the hovered logo in 0.8s ─────
  const MARKS = [
    (n) => `<circle cx="40" cy="20" r="14" fill="none" stroke="currentColor" stroke-width="3"/><text x="62" y="27" font-size="18" fill="currentColor">${n}</text>`,
    (n) => `<path d="M6 34L24 6h8L14 34z" fill="currentColor"/><text x="40" y="27" font-size="20" font-weight="700" fill="currentColor">${n}</text>`,
    (n) => `<rect x="6" y="6" width="28" height="28" fill="currentColor"/><text x="42" y="27" font-size="18" fill="currentColor">${n}</text>`,
    (n) => `<path d="M20 4l16 16-16 16L4 20z" fill="none" stroke="currentColor" stroke-width="3"/><text x="44" y="27" font-size="18" fill="currentColor">${n}</text>`,
    (n) => `<text x="6" y="28" font-size="24" font-weight="700" font-style="italic" fill="currentColor">${n}</text>`,
    (n) => `<path d="M4 30q16-28 32 0" fill="none" stroke="currentColor" stroke-width="4"/><text x="42" y="27" font-size="18" fill="currentColor">${n}</text>`,
  ];
  const partners = (scope) => {
    const ul = scope.querySelector(".hm-partners__list");
    if (!ul) return () => {};
    ul.innerHTML = Array.from({ length: 18 }, (_, i) => {
      const n = `LOGO ${String(i + 1).padStart(2, "0")}`;
      return `<li class="tb-in-right" style="--index:${i % 6}"><a href="#" data-cursor-text="Logo ${i + 1}" data-anchor="item"><div class="tb-in-slash" style="--index:${i % 6}"><svg viewBox="0 0 160 40" role="img" aria-label="Partner logo slot ${i + 1}">${MARKS[i % MARKS.length](n)}</svg></div></a></li>`;
    }).join("");
    const wrap = scope.querySelector("[data-anchor='container']"), frame = wrap.querySelector("[data-anchor='move']");
    const on = () => frame.classList.add("is-active"), off = () => frame.classList.remove("is-active");
    wrap.addEventListener("mouseenter", on); wrap.addEventListener("mouseleave", off);
    ul.querySelectorAll("[data-anchor='item']").forEach((a) => a.addEventListener("mouseenter", () => {
      const r = wrap.getBoundingClientRect(), i = a.getBoundingClientRect();
      frame.style.setProperty("--ax", `${i.left - r.left}px`);
      frame.style.setProperty("--ay", `${i.top - r.top}px`);
    }));
    return inview(ul.querySelectorAll("li"), { group: 6 });
  };

  // Once on entering the screen, add is-inview — original data-scroll-animation="once"
  const inview = (els, o = {}) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  };
  TB.inview = inview;

  // ───── Awards ─────
  const AW = [
    ["International Awards 01", [["Grand Prix", 3], ["Gold", 14], ["Silver", 14], ["Bronze", 23]]],
    ["Design Awards 02", [["Wood Pencil", 11], ["White Pencil", 1]]],
    ["The Show 03", [["Best of Discipline", 1], ["Gold", 5], ["Silver", 6], ["Bronze", 11]]],
    ["Creative Awards 04", [["Grand Prix", 2], ["Gold", 3], ["Silver", 12], ["Bronze", 15]]],
    ["Music Awards 05", [["Silver", 3], ["Bronze", 1]]],
    ["Sports Awards 06", [["Grand Prix", 3], ["Gold", 4], ["Silver", 7]]],
    ["Asia Pacific Festival 07", [["Grande", 6], ["Gold", 14], ["Silver", 28], ["Bronze", 29]]],
    ["Stars Festival 08", [["Grand Prix", 8], ["Gold", 14], ["Silver", 49], ["Bronze", 36]]],
    ["City Festivals Awards 09", [["Grand", 2], ["Gold", 4], ["Silver", 11], ["Bronze", 6]]],
    ["Design Award 10", [["Gold", 1]]],
    ["Creativity Awards 11", [["Grand Prix", 10], ["Gold", 14], ["Silver", 13], ["Bronze", 19]]],
  ];
  const awards = (scope) => {
    const tb = scope.querySelector(".hm-awards__table");
    if (!tb) return () => {};
    tb.innerHTML = AW.map(([n, rows]) => `<div class="hm-aw"><div class="hm-aw__name">${n}</div><ul class="hm-aw__rows">${rows.map(([p, c], k) => `<li style="--k:${k + 1}"><span>${p}</span><span>x${c}</span></li>`).join("")}</ul></div>`).join("");
    const offs = [inview(tb.querySelectorAll(".hm-aw"))];
    return () => offs.forEach((f) => f());
  };

  // ───── Diagonally indented paragraph ─────
  const slashLines = (scope) => {
    const els = [...scope.querySelectorAll(".tb-slashlines")];
    const split = () => els.forEach((el) => {
      if (!el.dataset.src) el.dataset.src = el.textContent.trim();
      el.classList.remove("is-split");
      el.textContent = el.dataset.src;
      const words = el.dataset.src.split(" ");
      el.innerHTML = words.map((w) => `<span class="slw">${w}</span>`).join(" ");
      const lines = [];
      let top = null;
      el.querySelectorAll(".slw").forEach((w) => { const t = Math.round(w.offsetTop); if (t !== top) { lines.push([]); top = t; } lines[lines.length - 1].push(w.textContent); });
      el.innerHTML = lines.map((l) => `<span class="sl">${l.join(" ")}</span>`).join("");
      el.classList.add("is-split");
    });
    split();
    const ro = new ResizeObserver(() => { clearTimeout(ro.t); ro.t = setTimeout(split, 150); });
    els.forEach((el) => ro.observe(el.parentElement));
    document.fonts?.ready.then(split);
    return () => ro.disconnect();
  };

  // ───── Feature — hovering an item reopens its banner at the top, and the cursor over the list tilts the banner ─────
  const featured = (scope) => {
    const sec = scope.querySelector(".hm-featured");
    if (!sec) return () => {};
    const imgs = [...sec.querySelectorAll(".hm-featured__img")];
    const banner = sec.querySelector(".hm-featured__banner"), list = sec.querySelector(".hm-featured__list");
    let z = 1;
    sec.querySelectorAll(".hm-featured__link").forEach((a) => a.addEventListener("mouseenter", () => {
      const im = imgs[Number(a.dataset.i)];
      if (!im) return;
      im.style.zIndex = ++z;
      im.classList.remove("is-active");
      requestAnimationFrame(() => im.classList.add("is-active"));
    }));
    if (!TB.hoverMQ.matches || reduce) return () => {};
    const rx = gsap.quickTo(banner, "rotationX", { duration: 0.8, ease: "power2.out" }), ty = gsap.quickTo(banner, "y", { duration: 0.8, ease: "power2.out" });
    gsap.set(banner, { transformPerspective: 800 });
    const move = (e) => { const r = list.getBoundingClientRect(), ny = gsap.utils.clamp(-1, 1, ((e.clientY - r.top) / r.height) * 2 - 1); rx(ny * 10); ty(Math.max(0, ny) * -25 * unit()); };
    const leave = () => { rx(0); ty(0); };
    list.addEventListener("pointermove", move); list.addEventListener("pointerleave", leave);
    return () => { list.removeEventListener("pointermove", move); list.removeEventListener("pointerleave", leave); };
  };

  TB.pages.home = ({ scope }) => {
    const offs = [kv(scope), about(scope), work(scope), partners(scope), awards(scope), slashLines(scope), featured(scope),
      inview(scope.querySelectorAll(".hm-latest__list li, .hm-featured__link"))];
    scope.querySelectorAll(".hm-latest__list li, .hm-featured__link").forEach((el, i) => { el.classList.add("tb-in-right"); el.style.setProperty("--index", i % 3); });
    return () => offs.forEach((f) => f && f());
  };
  TB.slashLinesInit = slashLines;
})();
