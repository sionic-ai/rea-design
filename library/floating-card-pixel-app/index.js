// First page — builds the picture cells (QR · near-field arc) · question list · piece buttons, and ties the four fixed sections (phone · promise · try it · reviews) and the following phone to scroll.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hash = (n) => { const t = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return t - Math.floor(t); };
  const short = (el, d) => window.kfScrambleShort?.(el, d);

  // QR grid 17×17 — three corner finder patterns + random cells
  document.querySelectorAll(".privacy__mark--qr").forEach((q) => {
    const seed = Number(q.dataset.qr) * 31 + 7;
    const finder = (x, y) => [[0, 0], [10, 0], [0, 10]].some(([fx, fy]) => {
      const dx = x - fx, dy = y - fy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    });
    const inFinder = (x, y) => [[0, 0], [10, 0], [0, 10]].some(([fx, fy]) => x - fx >= -1 && y - fy >= -1 && x - fx <= 7 && y - fy <= 7);
    let html = "";
    for (let y = 0; y < 17; y++) for (let x = 0; x < 17; x++) {
      const on = inFinder(x, y) ? finder(x, y) : hash(seed * 997 + y * 17 + x) > 0.5;
      html += on ? '<i class="is-on"></i>' : "<i></i>";
    }
    q.innerHTML = html;
  });
  // Near-range arcs — three layers from center outward (4·7·10 points), the inner layer lights first
  document.querySelectorAll(".privacy__mark--lan").forEach((m) => {
    const flip = m.classList.contains("is-mirrored");
    const arcs = [[4, 0.36, 0.22, 0.06], [7, 0.62, 0.48, 0.31], [10, 0.92, 0.78, 0.58]];
    let html = "";
    arcs.forEach(([n, r, span, order]) => {
      for (let i = 0; i < n; i++) {
        const a = (-span + (2 * span * i) / (n - 1)) * Math.PI, cx = 1.02, cy = 0.5;
        let x = cx - Math.cos(a) * r * 0.86, y = cy + Math.sin(a) * r * 0.62;
        if (flip) x = 1 - x;
        const o = order + Math.abs(i - (n - 1) / 2) * 0.007;
        html += `<i class="is-on" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%" data-order="${o.toFixed(3)}"></i>`;
      }
    });
    m.innerHTML = html;
  });

  // Ten-item question list
  const faq = document.querySelector("[data-faq]");
  if (faq) {
    const qs = ["What is this app?", "Can I split one with friends?", "Is it safe to cut it in parts?", "How does the method work?", "Can the maker see my secret?", "Could friends open it without me?", "What if a friend loses one?", "What if I lose my phone?", "Do holders need the app too?", "Is it audited or open source?"];
    faq.innerHTML = qs.map((q, i) => `<li class="faq__item${i === 0 ? " is-open" : ""}" data-lines-group><h3 class="faq__q" data-reveal><span class="faq__toggle" role="button" tabindex="0" aria-expanded="${i === 0}"><span class="faq__n">${String(i + 1).padStart(2, "0")}</span><span class="faq__text" data-label="Question ${i + 1} English text">${q}</span><span class="faq__icon" aria-hidden="true"></span></span></h3><div class="faq__panel"><div class="faq__clip"><p class="faq__a t-body" data-lines>Your question $ here{i + 1}Add the answer to the question. Answer briefly in the first sentence, then explain the reason and method in two or three sentences. Match the original at four to six lines long.</p></div></div></li>`).join("");
    const narrowQ = matchMedia("(max-width: 1024px)");
    faq.addEventListener("click", (e) => {
      const t = e.target.closest(".faq__toggle");
      if (!t || !narrowQ.matches) return;
      const item = t.closest(".faq__item"), open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      t.setAttribute("aria-expanded", String(open));
    });
    faq.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".faq__toggle")) { e.preventDefault(); e.target.click(); } });
  }

  // Try it yourself — short text → six pieces → pick k and it reopens
  const tryBox = document.querySelector("#try");
  if (tryBox) {
    const input = tryBox.querySelector("[data-try-input]"), out = tryBox.querySelector("[data-try-out]"), len = tryBox.querySelector("[data-try-len]");
    const kOut = tryBox.querySelector("[data-try-k]"), shares = tryBox.querySelector("[data-try-shares]"), count = tryBox.querySelector("[data-try-count]"), name = tryBox.querySelector("[data-try-name]");
    let k = 3;
    shares.innerHTML = Array.from({ length: 6 }, (_, i) => {
      let cells = "";
      for (let c = 0; c < 36; c++) cells += hash(i * 101 + c) > 0.48 ? '<i class="is-on"></i>' : "<i></i>";
      return `<button class="try__share" type="button" aria-pressed="false" data-cursor="Collect"><span class="try__mosaic" aria-hidden="true">${cells}</span><span class="try__meta" aria-hidden="true"><b>${String(i + 1).padStart(2, "0")}</b><code>${(hash(i * 7) * 255 | 0).toString(16).padStart(2, "0")} ${(hash(i * 9) * 255 | 0).toString(16).padStart(2, "0")}</code></span></button>`;
    }).join("");
    const noise = (n) => Array.from({ length: n }, (_, i) => "#%&$@*+=/<>[]{}"[(hash(i + Date.now() % 97) * 15) | 0]).join("");
    const setK = (v) => { k = Math.min(6, Math.max(2, v)); kOut.textContent = String(k).padStart(2, "0"); tryBox.querySelector('[data-try-step="-1"]').disabled = k <= 2; tryBox.querySelector('[data-try-step="1"]').disabled = k >= 6; };
    const step = (s) => {
      tryBox.dataset.step = s;
      count.textContent = s === "create" ? "1/2" : "2/2";
      name.textContent = s === "create" ? "Create and share" : s === "recover" ? "Pick the pieces" : "Opened again";
      short(count); short(name);
    };
    input.addEventListener("input", () => { len.textContent = `${input.value.length}/40`; tryBox.querySelector("[data-try-go]").disabled = !input.value.trim(); });
    tryBox.querySelectorAll("[data-try-step]").forEach((b) => b.addEventListener("click", () => setK(k + Number(b.dataset.tryStep))));
    // Pieces rise from 16px below in .05s order, starting after .8s (.45s on phone)
    tryBox.querySelector("[data-try-go]").addEventListener("click", () => {
      const lead = matchMedia("(max-width: 1024px)").matches ? 0.45 : 0.8;
      shares.querySelectorAll(".try__share").forEach((b, i) => { b.setAttribute("aria-pressed", "false"); b.style.setProperty("--delay", `${(lead + i * 0.05).toFixed(2)}s`); });
      out.textContent = noise(Math.min(28, input.value.length)); step("recover");
    });
    shares.addEventListener("click", (e) => {
      const b = e.target.closest(".try__share");
      if (!b) return;
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      if (shares.querySelectorAll('[aria-pressed="true"]').length >= k) { out.textContent = input.value; step("done"); }
    });
    setK(3);
  }

  if (reduce) return;
  const lines = (s) => s.querySelectorAll("[data-scramble-manual]");
  const phone = document.querySelector("[data-story-phone]");

  gsap.matchMedia().add({ narrow: "(max-width: 1024px)", wide: "(min-width: 1025px)" }, (ctx) => {
    const narrow = ctx.conditions.narrow;
    const hold = (s) => Math.max(0, Number(narrow && s.dataset.holdNarrow !== undefined ? s.dataset.holdNarrow : s.dataset.hold) || 0) / 100;
    const pin = (s, n) => gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: s, start: "top top", end: () => `+=${n * innerHeight}`, pin: true, scrub: true, refreshPriority: 1, invalidateOnRefresh: true } });

    // Phone section — the phone sinks from .3 to .62, and two text lines rise 30px from below at .45 and .61 with a scramble
    const safety = document.querySelector("#safety");
    if (safety && phone) {
      const tl = pin(safety, hold(safety));
      tl.fromTo(phone, { "--sink": 0 }, { "--sink": 1, duration: 0.62, ease: "power2.inOut" }, 0.3);
      safety.querySelectorAll("[data-safety-line]").forEach((l, i) => {
        const at = 0.45 + i * 0.16;
        tl.fromTo(l, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, at);
        tl.call(() => lines(l).forEach((n, j) => short(n, j * 0.08)), [], at);
      });
      tl.set({}, {}, 1);
    }

    // Promise section — three sentences exit upward at .3 and .7 while new ones enter from below, and the image slots (QR, arc) light up
    const privacy = document.querySelector("#privacy");
    if (privacy) {
      const st = gsap.utils.toArray("[data-statement]", privacy), marks = gsap.utils.toArray("[data-mark]", privacy), n = hold(privacy);
      const lede = (s) => s.querySelector(".privacy__lede");
      gsap.fromTo(lines(st[0]), { yPercent: 110 }, { yPercent: 0, ease: "power2.out", stagger: 0.1, scrollTrigger: { trigger: privacy, start: "top 75%", end: "top 15%", scrub: true, onEnter: () => lines(st[0]).forEach((x, j) => short(x, j * 0.08)) } });
      const tl = pin(privacy, n);
      const swap = (a, b, at) => {
        const d = 0.05, each = 0.012, la = lines(a), lead = d + each * (la.length - 1);
        tl.to(la, { yPercent: -110, duration: d, stagger: each, ease: "power2.in" }, at - lead);
        tl.to(lede(a), { opacity: 0, duration: lead }, at - lead);
        tl.set(a, { visibility: "hidden" }, at).set(b, { visibility: "visible" }, at);
        tl.fromTo(lines(b), { yPercent: 110 }, { yPercent: 0, duration: d, stagger: each, ease: "power2.out", immediateRender: false }, at);
        tl.fromTo(lede(b), { opacity: 0 }, { opacity: 1, duration: d, immediateRender: false }, at);
        tl.call(() => lines(b).forEach((x, j) => short(x, j * 0.08)), [], at);
      };
      const at = [0.3, 0.7];
      st.slice(1).forEach((s, i) => swap(st[i], s, at[i]));
      const setPin = () => privacy.style.setProperty("--pin-h", `${innerHeight}px`);
      setPin(); ScrollTrigger.addEventListener("refreshInit", setPin);
      const G = 0.3025;
      marks.forEach((m) => {
        const which = Number(m.dataset.mark), cells = [...m.querySelectorAll("i.is-on")];
        const order = cells.map((c, i) => (c.dataset.order ? Number(c.dataset.order) : 0.05 + hash(i + Number(m.dataset.qr ?? 0) * 31) * 0.9));
        const light = (v) => cells.forEach((c, i) => c.classList.toggle("is-lit", v >= order[i]));
        const r = { v: 0 }, from = at[which - 1], to = at[which] ?? 1.08;
        tl.to(r, { v: 1, duration: 0.1, onUpdate: () => light(r.v) }, from);
        if (m.hasAttribute("data-qr")) { tl.fromTo(m, { "--rise": 0 }, { "--rise": 1, duration: ((1 + G) / n) * 1.3, ease: "none" }, from); return; }
        tl.to(r, { v: 0, duration: 0.08, onUpdate: () => light(r.v) }, to - 0.08);
      });
      const last = st[st.length - 1];
      tl.to(lines(last), { yPercent: -110, duration: 0.05, stagger: 0.012, ease: "power2.in" }, 1);
      tl.to(lede(last), { opacity: 0, duration: 0.06 }, 1);
      if (phone) tl.fromTo(phone, { "--lift": 0 }, { "--lift": 1, duration: 0.2625, ease: "power2.inOut" }, 1.04);
      tl.set({}, {}, 1 + G);
    }

    // Try it yourself — the box widens from 26px inside, and after the greeting enters and leaves the input board rises from 28px below
    const tryBox = document.querySelector("#try");
    if (tryBox) {
      const hello = tryBox.querySelectorAll(".try__hello [data-scramble-manual]"), head = tryBox.querySelectorAll(".try__head [data-scramble]");
      gsap.set(tryBox, { "--intro": 1 });
      const n = hold(tryBox);
      if (n > 0) {
        gsap.fromTo(tryBox, { "--inset": "26px" }, { "--inset": "0px", ease: "power1.inOut", scrollTrigger: { trigger: tryBox, start: "top 80%", end: "top top", scrub: true } });
        gsap.fromTo(hello, { yPercent: 110 }, { yPercent: 0, ease: "power2.out", scrollTrigger: { trigger: tryBox, start: "top 70%", end: "top 20%", scrub: true, onEnter: () => hello.forEach((x) => short(x)) } });
        const tl = pin(tryBox, n);
        tl.to(hello, { yPercent: -110, duration: 0.12, ease: "power2.in" }, 0);
        tl.fromTo(tryBox, { "--ui": 0 }, { "--ui": 1, duration: 0.23, ease: "power2.out" }, 0.12);
        tl.call(() => { if (tryBox.dataset.step === "create") head.forEach((x, i) => short(x, i * 0.08)); }, [], 0.12);
        tl.set({}, {}, n);
      } else {
        const sc = (s, e, extra = {}) => ({ trigger: tryBox, start: s, end: e, scrub: true, ...extra });
        gsap.fromTo(tryBox, { "--inset": "26px" }, { "--inset": "0px", ease: "power1.inOut", scrollTrigger: sc("top 90%", "top 20%") });
        gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: sc("top 80%", "top 25%", { onEnter: () => hello.forEach((x) => short(x)) }) })
          .fromTo(hello, { yPercent: 110 }, { yPercent: 0, duration: 0.3, ease: "power2.out" }, 0).to(hello, { yPercent: -110, duration: 0.15, ease: "power2.in" }, 0.5).set({}, {}, 1);
        gsap.fromTo(tryBox, { "--ui": 0 }, { "--ui": 1, ease: "power2.out", scrollTrigger: sc("top 30%", "top top", { onEnter: () => { if (tryBox.dataset.step === "create") head.forEach((x, i) => short(x, i * 0.08)); } }) });
      }
    }

    // Review panels — while pinned, each panel passes from .75 below the screen to .75 above at its own speed (.8~1.35)
    const reviews = document.querySelector("#testimonials");
    if (reviews && hold(reviews) > 0) {
      const tl = pin(reviews, hold(reviews));
      gsap.utils.toArray(".reviews__plate", reviews).forEach((p) => {
        const s = Number(p.dataset.speed) || 1;
        tl.fromTo(p, { y: () => innerHeight * 0.75 * s }, { y: () => -innerHeight * 0.75 * s, duration: 1 }, 0);
      });
    }

    // Following phone — rises while the phone section head moves from bottom to top of the screen, grows in the promise section, and slides up out at try-it-yourself
    if (phone) {
      const tr = (sel) => ({ trigger: sel, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true });
      gsap.fromTo(phone, { "--enter-y": () => `${innerHeight}px` }, { "--enter-y": "0px", ease: "none", scrollTrigger: tr("#safety") });
      gsap.fromTo(phone, { "--t": 0 }, { "--t": 1, ease: "power1.inOut", scrollTrigger: tr("#privacy") });
      const extra = () => 0.16 * innerHeight;
      gsap.fromTo(phone, { y: 0 }, { y: () => -innerHeight - extra(), ease: "none", scrollTrigger: { ...tr("#try"), start: () => `top bottom+=${extra()}`, onLeave: () => gsap.set(phone, { visibility: "hidden" }), onEnterBack: () => gsap.set(phone, { visibility: "inherit" }) } });
    }
    ScrollTrigger.refresh();
  });
})();
