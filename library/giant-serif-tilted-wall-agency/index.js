// Home: loader · post wall · logo strip · two-principle orbit · service stacking · sister brand photo swap.
// Original figures: the original function (scroll progress → value) ported with the same formula.
(() => {
  const { reduced, isSP } = AD;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // The original function that makes progress pause (hold) at a few points then stretches it back — pause width h each
  const hold = (e, points, h) => {
    const n = 1 - points.length * h;
    let s = 0, r = 0;
    for (const p of points) {
      const t = (p - r) * n;
      if (e < s + t) return r + (e - s) / n;
      s += t;
      if (e < s + h) return p;
      s += h;
      r = p;
    }
    return r + (e - s) / n;
  };
  const progressOf = (el, pinH) => clamp(-el.getBoundingClientRect().top / Math.max(el.offsetHeight - pinH, 1), 0, 1);
  const onScroll = (fn) => { ScrollTrigger.create({ start: 0, end: "max", onUpdate: fn, onRefresh: fn }); AD.listen(window, "resize", fn); fn(); };

  // ── Loader: a three-digit number strip counts to 100 over 3s easeInOutQuad → 150ms → blink .32s → the panel goes up over 1.5s ──
  const splash = document.querySelector(".ad-splash");
  const sveil = document.querySelector(".ad-splash__veil");
  const runSplash = () => {
    if (!splash) return;
    const wrap = document.querySelector(".wrapper");
    if (reduced || sessionStorage.getItem("ad-splashed")) { splash.remove(); sveil.remove(); return; }
    sessionStorage.setItem("ad-splashed", "1");
    const strips = [...splash.querySelectorAll(".ad-splash__strip")];
    const num = splash.querySelector(".ad-splash__num");
    strips.forEach((s, i) => (s.innerHTML = Array.from({ length: i === 0 ? 2 : 110 }, (_, k) => `<div>${k % 10}</div>`).join("")));
    const set = (el, v) => (el.style.transform = `translateY(${-0.72 * v}em)`);
    const show = (p) => { const n = clamp(p, 0, 100); set(strips[0], clamp((n - 90) / 10, 0, 1)); set(strips[1], n / 10); set(strips[2], n); };
    const block = (e) => e.preventDefault();
    addEventListener("wheel", block, { passive: false });
    addEventListener("touchmove", block, { passive: false });
    AD.lenis && AD.lenis.stop();
    document.body.classList.add("splash-on");
    let t0;
    const step = (now) => {
      t0 ??= now;
      const o = Math.min((now - t0) / 3000, 1);
      show(100 * (o < 0.5 ? 2 * o * o : 1 - Math.pow(-2 * o + 2, 2) / 2));
      if (o < 1) return requestAnimationFrame(step);
      setTimeout(async () => {
        await num.animate([{ opacity: 1, filter: "blur(0px)", offset: 0, easing: "cubic-bezier(0.55, 0, 1, 0.45)" }, { opacity: 0.6, filter: "blur(4px)", offset: 0.5625, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }, { opacity: 1, filter: "blur(0px)", offset: 1 }], { duration: 320, fill: "both" }).finished;
        document.querySelectorAll(".home-hero__video").forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); });
        const ease = "cubic-bezier(0.75, 0, 0.2, 1)";
        wrap.style.transformOrigin = "50% 50vh";
        const w = wrap.animate([{ transform: "translateY(8vh) scale(0.82)", filter: "blur(12px) brightness(0.5)", opacity: 0.6 }, { transform: "translateY(0) scale(1)", filter: "blur(0px) brightness(1)", opacity: 1 }], { duration: 1500, easing: ease, fill: "both" });
        sveil.animate([{ opacity: 0, offset: 0 }, { opacity: 0.3, offset: 0.4, easing: "cubic-bezier(0, 0, 0.58, 1)" }, { opacity: 0, offset: 1 }], { duration: 1500, fill: "both" });
        await splash.animate([{ transform: "translateY(0%)", filter: "blur(0px)", opacity: 1 }, { transform: "translateY(-100%)", filter: "blur(6px)", opacity: 0.85 }], { duration: 1500, easing: ease, fill: "both" }).finished;
        w.cancel();
        wrap.style.transformOrigin = "";
        splash.remove(); sveil.remove();
        removeEventListener("wheel", block); removeEventListener("touchmove", block);
        document.body.classList.remove("splash-on");
        AD.lenis && AD.lenis.start();
      }, 150);
    };
    requestAnimationFrame(step);
  };

  // ── Building the post wall cells (4 columns · 3 on phone, each column repeats the same cells twice to loop endlessly) ──
  const posts = [
    ["SNS post · influencer face close-up · bright natural light", "color-mix(in oklab, var(--kf-ink) 9%, var(--kf-bg))"],
    ["Social post · cosmetic bottle cutout with big-text ad · pink background", "color-mix(in oklab, var(--kf-ink) 13%, var(--kf-bg))"],
    ["SNS post · selfie of two people · indoor lighting", "color-mix(in oklab, var(--kf-ink) 12%, var(--kf-bg))"],
    ["Social post · lip product swatch on the back of a hand · white background", "color-mix(in oklab, var(--kf-ink) 8%, var(--kf-bg))"],
    ["SNS post · half-length portrait · sky-blue background studio", "color-mix(in oklab, var(--kf-ink) 10%, var(--kf-bg))"],
    ["SNS post · before-and-after skin comparison text board · cream", "color-mix(in oklab, var(--kf-ink) 6%, var(--kf-bg))"],
    ["SNS post · event booth overview · fluorescent light", "color-mix(in oklab, var(--kf-ink) 12%, var(--kf-bg))"],
    ["SNS post · person with bangs facing front · dark interior", "color-mix(in oklab, var(--kf-ink) 26%, var(--kf-bg))"],
  ];
  AD.page("home", (main) => {
    const grid = main.querySelector(".home-story__grid");
    let cols = [], halves = [];
    const buildWall = () => {
      const n = isSP() ? 3 : 4;
      if (cols.length === n) return;
      grid.innerHTML = "";
      for (let c = 0; c < n; c++) {
        const col = document.createElement("div");
        col.className = "home-story__col";
        const cells = Array.from({ length: 9 }, (_, k) => posts[(k * 3 + c * 5) % posts.length]);
        col.innerHTML = [...cells, ...cells].map(([l, bg]) => `<div class="home-story__img wf-img" style="--wf-fill:${bg}" data-label="${l}"></div>`).join("");
        grid.append(col);
      }
      cols = [...grid.children];
    };
    buildWall();

    // ── Logo Band ──
    const logoNames = [["f1", "brandone"], ["f2", "BRAND TWO"], ["f3", "Brand Three"], ["f4", "brandfour"], ["f5", "BRAND FIVE"], ["f1", "six·brand"], ["f3", "Seven"], ["f2", "EIGHT"], ["f4", "nine"], ["f5", "BRAND TEN"], ["f1", "eleven"]];
    main.querySelectorAll("[data-logos]").forEach((track, r) => {
      const list = r ? [...logoNames].reverse() : logoNames;
      const one = list.map(([f, n]) => `<div class="home-logos__item ${f}"><b>${n}</b></div>`).join("");
      track.innerHTML = one + one;
    });

    // ── Service stacking cells ──
    const svcData = [
      ["Service Name 01", "Service one", "Your first service’s promise here<br>Short, in three lines<br>Divide and put in", "Hand and tablet on a desk · Data screen · Warm indoor light"],
      ["Service Name 02", "Service Two", "The second service’s promise here<br>Place it in two lines", "Two hands on laptop keyboard · overcast window light"],
      ["Service Name 03", "Service Three ·<br>Two-line name", "Your third service promise here,<br>In two lines", "Behind the camera on set · stage lighting · shallow depth of field"],
      ["Service Name 04", "Service Four ·<br>A slightly longer name", "Your fourth service promise here<br>In two lines", "Hand holding a cream jar · white background · still-life lighting"],
      ["Service Name 05", "Service five", "Your fifth service promise here,<br>In two lines", "Four people upper body side by side · bright studio · landscape"],
    ];
    const track = main.querySelector(".home-svc__track");
    track.innerHTML = svcData.map(([name, cat, desc, lbl], i) => `
      <a class="home-svc__img${i ? "" : " is-active"}" href="service.html#s${i + 1}" data-i="${i}" aria-label="${cat.replace(/<br>/g, "")}">
        <div class="home-svc__pic"><div class="wf-img" data-label="${lbl}"></div></div>
        <div class="home-svc__imgMeta"><p class="home-svc__imgName">${name}</p><div class="home-svc__imgCatch"><p>${cat}</p>${AD.icon()}</div></div>
      </a>`).join("");

    // ── Sister brand photo swap ──
    const ovShots = ["Person upper body · pink hair · white background studio", "Person front view · black hair · sky-blue background", "Person profile · smiling · cream background", "Portrait selfie · close-up · warm lighting"];
    const ovTones = ["color-mix(in oklab, var(--kf-ink) 7%, var(--kf-bg))", "color-mix(in oklab, var(--kf-ink) 8%, var(--kf-bg))", "color-mix(in oklab, var(--kf-ink) 8%, var(--kf-bg))", "color-mix(in oklab, var(--kf-ink) 7%, var(--kf-bg))"];
    const ovItems = [...main.querySelectorAll(".home-ov__item")];
    const paintOv = (layer, k, col) => (layer.innerHTML = `<div class="wf-img" style="--wf-fill:${ovTones[(k + col) % 4]}" data-label="${ovShots[(k + col) % 4]} · Portrait 5:7"></div>`);
    ovItems.forEach((it, c) => it.querySelectorAll(".home-ov__layer").forEach((l, j) => paintOv(l, j, c)));

    {
      runSplash();
      // Hero video (original: loaded within 1.5s of requestIdleCallback after load · on phones each video frame is flipped and drawn onto a 640×360 reflection canvas)
      const hv = main.querySelector(".home-hero__video");
      const idle = () => { const id = requestIdleCallback(() => AD.loadVideo(hv), { timeout: 1500 }); AD.cleanup(() => cancelIdleCallback(id)); };
      document.readyState === "complete" ? idle() : AD.listen(window, "load", idle, { once: true });
      const reflects = [...main.querySelectorAll(".home-hero__reflect")].map((c) => { c.width = 640; c.height = 360; return c.getContext("2d"); });
      const spMQ = matchMedia("(max-width: 1024px)");
      const rvfc = "requestVideoFrameCallback" in hv;
      let live = true, inView = true, frame = 0;
      AD.observe(new IntersectionObserver(([e]) => (inView = e.isIntersecting))).observe(main.querySelector(".home-hero__media"));
      const paint = () => {
        if (!live) return;
        if (inView && spMQ.matches && hv.readyState >= 2 && hv.videoWidth > 0) reflects.forEach((ctx) => { ctx.setTransform(1, 0, 0, -1, 0, 360); ctx.drawImage(hv, 0, 0, 640, 360); });
        frame = rvfc ? hv.requestVideoFrameCallback(paint) : requestAnimationFrame(paint);
      };
      paint();
      AD.cleanup(() => { live = false; rvfc ? hv.cancelVideoFrameCallback(frame) : cancelAnimationFrame(frame); });

      // Hero text heartbeat starts 600ms after the font loads, at 150ms intervals
      const loads = [...main.querySelectorAll("[data-pulse-load]")];
      if (!reduced) {
        loads.forEach((el) => { el.style.opacity = ".5"; el.style.filter = "blur(10px)"; });
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => loads.forEach((el, i) => { el.style.opacity = el.style.filter = ""; AD.pulse(el, 600 + 150 * i); }));
      }

      // ── Post wall + wordmark zoom ──
      const story = main.querySelector(".home-story");
      const sticky = story.querySelector(".home-story__sticky");
      const mark = story.querySelector(".home-story__mark");
      const letters = story.querySelector("#storyLetters");
      const textEl = letters.querySelector("text");
      const center = story.querySelector(".home-story__center");
      const sveil2 = story.querySelector(".home-story__veil");
      const DIR = [-1, 1, -1, 1], SPD = [0.8, 0.95, 0.7, 0.85];
      let f = 1, focusX = 973, focusY = 170;
      const measure = () => {
        buildWall();
        halves = cols.map((c) => c.scrollHeight / 2);
        const w = sticky.clientWidth, h = sticky.clientHeight;
        const n = Math.max(w / 1728, h / 1080);
        f = (w / n) * 0.98 / 1668;
        // The original enters the stem of the fourth letter (I) — measures the center of the same letter cell
        try { const b = textEl.getExtentOfChar(4); focusX = b.x + b.width / 2; focusY = b.y + b.height * 0.55; } catch (e) {}
      };
      if (reduced) {
        mark.style.opacity = "0"; center.style.opacity = "1"; sveil2.style.opacity = "1"; center.style.pointerEvents = "auto";
      } else {
        measure();
        AD.listen(window, "resize", measure);
        onScroll(() => {
          const d = Math.max(story.offsetHeight - sticky.clientHeight, 1);
          const e = -story.getBoundingClientRect().top / d;
          const t = clamp(e, 0, 1);
          const c = clamp(t / 0.5, 0, 1);
          const zmax = clamp(50 / f, 12, 50);
          let s, op;
          if (t < 0.5) { s = mix(1, zmax, c); op = 1 - clamp((c - 0.8) / 0.2, 0, 1); } else { s = zmax; op = 0; }
          const A = outCubic(clamp((t - 0.68) / 0.32, 0, 1));
          const tx = mix(834, focusX, outCubic(clamp(c / 0.7, 0, 1)));
          const ty = mix(170, focusY, outCubic(clamp(c / 0.7, 0, 1)));
          letters.setAttribute("transform", `translate(864 540) scale(${f * s}) translate(${-tx} ${-ty})`);
          mark.style.opacity = String(op);
          center.style.opacity = String(A);
          sveil2.style.opacity = String(A);
          center.style.pointerEvents = A > 0.5 ? "auto" : "none";
          const g = clamp(e - 1, 0, 0.2);
          const m = 1500 * (clamp(e, 0, 1) + g - (g * g) / 0.4);
          cols.forEach((col, i) => {
            const r = halves[i];
            if (!r) return;
            const off = ((((DIR[i] ?? -1) * m * (SPD[i] ?? 0.8)) % r) + r) % r;
            col.style.translate = `0 ${-off}px`;
          });
        });
      }

      // ── Two principles orbit ──
      const sol = main.querySelector(".home-sol");
      const solSticky = sol.querySelector(".home-sol__sticky");
      const squares = [...sol.querySelectorAll(".home-sol__deco span")];
      const cards = [...sol.querySelectorAll(".home-sol__card")];
      const heading = sol.querySelector(".home-sol__heading");
      const stage = sol.querySelector(".home-sol__stage");
      const spImgs = [...sol.querySelectorAll(".home-sol__spImg")];
      const bgs = [...sol.querySelectorAll(".home-sol__bg")];
      const win = (t, w) => (t < w.start || t >= w.end ? 0 : t < w.enterEnd ? inOutCubic((t - w.start) / (w.enterEnd - w.start)) : t > w.exitStart ? 1 - inOutCubic((t - w.exitStart) / (w.end - w.exitStart)) : 1);
      const CARD_W = [{ start: 0.18, enterEnd: 0.24, exitStart: 0.46, end: 0.52 }, { start: 0.46, enterEnd: 0.52, exitStart: 0.86, end: 0.92 }];
      const BG_W = [{ start: 0.18, enterEnd: 0.24, exitStart: 0.4, end: 0.46 }, { start: 0.46, enterEnd: 0.52, exitStart: 0.86, end: 0.92 }];
      const placeSq = (el, x, y, size, rot, op, blur, touching) => {
        el.style.width = `${size}px`;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${rot}deg)`;
        el.style.opacity = String(op);
        el.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
        el.classList.toggle("is-touching", touching);
      };
      if (reduced) {
        const W = solSticky.clientWidth, H = solSticky.clientHeight;
        squares.forEach((sq, i) => placeSq(sq, W / 2, H / 2, 0.5 * W, i ? 20 : -20, 1, 0, false));
        cards.forEach((c) => (c.style.opacity = "1"));
      } else onScroll(() => {
        const W = solSticky.clientWidth, H = solSticky.clientHeight;
        if (isSP()) {
          const h = hold(progressOf(sol, H), [0.47, 0.76], 0.08);
          const A = 1 - clamp((h - 0.8) / 0.1, 0, 1);
          const cx = stage.offsetLeft + stage.offsetWidth / 2, cy = stage.offsetTop + stage.offsetHeight / 2;
          const m = clamp(h / 0.1, 0, 1), out = clamp((h - 0.9) / 0.1, 0, 1);
          squares.forEach((sq, i) => placeSq(sq, cx + (i ? -1 : 1) * out * W * 0.85, cy, 0.86 * W, (i ? 90 : -20) + 320 * h * (i ? -1 : 1), m * (1 - out), 5 * out, h > 0.16 && h < 0.9));
          const y0 = h < 0.2 ? 105 : h < 0.4 ? mix(105, 0, (h - 0.2) / 0.2) : h < 0.55 ? 0 : h < 0.72 ? mix(0, -100, (h - 0.55) / 0.17) : -100;
          const y1 = h < 0.55 ? 100 : h < 0.72 ? mix(100, 0, (h - 0.55) / 0.17) : 0;
          spImgs[0].style.transform = `translateY(${y0}%)`; spImgs[0].style.opacity = String(A);
          spImgs[1].style.transform = `translateY(${y1}%)`; spImgs[1].style.opacity = String(A);
          cards.forEach((c, i) => {
            const v = i === 0 ? (h < 0.22 ? 0 : h < 0.36 ? inOutCubic((h - 0.22) / 0.14) : h < 0.56 ? 1 : h < 0.64 ? 1 - inOutCubic((h - 0.56) / 0.08) : 0) : (h < 0.6 ? 0 : h < 0.74 ? inOutCubic((h - 0.6) / 0.14) : 1);
            c.style.opacity = String(v * A);
          });
          heading.style.opacity = String(A); heading.style.transform = "none";
          return;
        }
        const u = hold(progressOf(sol, H), [0.32, 0.69], 0.08);
        const cx = W / 2, cy = H / 2, d = 0.5 * W, near = 0.6 * d;
        let g = 0, m = 0, f2 = 0, op = 0, blur = 0;
        if (u < 0.12) { const e = outCubic(u / 0.12); g = e; op = e; blur = mix(8, 0, e); f2 = 0.15 * e; }
        else if (u < 0.22) { g = 1; op = 1; f2 = mix(0.15, 0.3, (u - 0.12) / 0.1); }
        else if (u < 0.92) { g = 1; op = 1; f2 = mix(0.3, 0.7, (u - 0.22) / 0.7); }
        else { const e = inOutCubic((u - 0.92) / 0.08); g = 1; m = e; f2 = mix(0.7, 1, e); op = 1 - e; blur = 5 * e; }
        const from1 = { x: -0.3 * W, y: cy + 0.5 * H }, to1 = { x: 1.3 * W, y: cy - 0.5 * H };
        const from2 = { x: 1.3 * W, y: cy - 0.5 * H }, to2 = { x: -0.3 * W, y: cy + 0.5 * H };
        const arc = 0.22 * H;
        let p1, p2;
        if (m > 0) {
          p1 = { x: mix(cx, to1.x, m), y: mix(cy, to1.y, m) - arc * Math.sin(m * Math.PI) };
          p2 = { x: mix(cx, to2.x, m), y: mix(cy, to2.y, m) + arc * Math.sin(m * Math.PI) };
        } else {
          p1 = { x: mix(from1.x, cx, g), y: mix(from1.y, cy, g) - arc * Math.sin(g * Math.PI) };
          p2 = { x: mix(from2.x, cx, g), y: mix(from2.y, cy, g) + arc * Math.sin(g * Math.PI) };
        }
        const touching = g > 0.3 && Math.hypot(p1.x - p2.x, p1.y - p2.y) < near;
        placeSq(squares[0], p1.x, p1.y, d, 180 * f2, op, blur, touching);
        placeSq(squares[1], p2.x, p2.y, d, -180 * f2, op, blur, touching);
        cards.forEach((c, i) => (c.style.opacity = String(win(u, CARD_W[i]))));
        bgs.forEach((b, i) => {
          const w = BG_W[i];
          const inside = u >= w.start && u < w.end;
          b.style.setProperty("--bg-opacity", inside ? String(win(u, w)) : "0");
          b.style.setProperty("--bg-y", `${inside ? 100 - ((u - w.start) / (w.end - w.start)) * 200 : u < w.start ? 100 : -100}%`);
        });
        const he = outCubic(clamp(u / 0.15, 0, 1));
        heading.style.opacity = String(1 - he);
        heading.style.transform = `translateY(${-100 * he}%)`;
      });

      // ── Service Stack ──
      const svc = main.querySelector(".home-svc");
      const body = svc.querySelector(".home-svc__body");
      const pin = svc.querySelector(".home-svc__pin");
      const win2 = svc.querySelector(".home-svc__images");
      const imgs = [...track.children];
      const holds = imgs.map((_, i) => i / (imgs.length - 1));
      const fields = { num: svc.querySelector('[data-svc="num"]'), name: svc.querySelector('[data-svc="name"]'), catch: svc.querySelector('[data-svc="catch"]'), desc: svc.querySelector('[data-svc="desc"]') };
      const link = svc.querySelector('[data-svc="link"]');
      let active = 0;
      const swap = (i) => {
        const els = Object.values(fields);
        els.forEach((el) => el.classList.add("is-changing"));
        setTimeout(() => {
          const [name, cat, desc] = svcData[i];
          fields.num.textContent = String(i + 1).padStart(2, "0");
          fields.name.textContent = name;
          fields.catch.innerHTML = cat;
          fields.desc.innerHTML = desc;
          link.href = `service.html#s${i + 1}`;
          els.forEach((el) => el.classList.remove("is-changing"));
        }, 90);
      };
      onScroll(() => {
        const t = progressOf(body, pin.clientHeight);
        const r = hold(t, holds, 0.07) * (imgs.length - 1);
        const lo = Math.floor(r), hi = Math.min(lo + 1, imgs.length - 1);
        const mid = (k) => imgs[k].offsetTop + imgs[k].offsetHeight / 2;
        const c = mid(lo) + (mid(hi) - mid(lo)) * (r - lo);
        track.style.transform = `translateY(${Math.round(win2.clientHeight / 2 - c)}px)`;
        const near = Math.round(r);
        imgs.forEach((el, k) => {
          const dist = Math.abs(k - near);
          el.classList.toggle("is-active", dist === 0);
          el.classList.toggle("is-far", dist >= 2);
          if (dist) el.classList.remove("is-hover");
        });
        if (near !== active) { active = near; swap(near); }
      });
      imgs.forEach((el) => {
        el.addEventListener("pointerenter", () => { if (!isSP() && el.classList.contains("is-active")) { el.classList.add("is-hover"); AD.flick(link.querySelector("p")); AD.nudge(link.querySelector(".ad-icon")); } });
        el.addEventListener("pointerleave", () => el.classList.remove("is-hover"));
      });
      link.addEventListener("pointerenter", () => !isSP() && imgs[active].classList.add("is-hover"));
      link.addEventListener("pointerleave", () => imgs[active].classList.remove("is-hover"));

      // ── Sister brands: every 3s all three advance to the next photo together ──
      if (!reduced) {
        const state = ovItems.map(() => 0);
        let k = 1;
        AD.interval(() => {
          k++;
          ovItems.forEach((it, c) => {
            const layers = it.querySelectorAll(".home-ov__layer");
            const cur = layers[state[c]], nxt = layers[1 - state[c]];
            paintOv(nxt, k, c);
            nxt.style.transition = "none";
            nxt.classList.remove("is-show");
            nxt.style.zIndex = "2";
            cur.style.zIndex = "1";
            void nxt.offsetWidth;
            nxt.style.transition = "";
            nxt.classList.add("is-show");
            state[c] = 1 - state[c];
          });
        }, 3000);
      }
    }
  });
})();
