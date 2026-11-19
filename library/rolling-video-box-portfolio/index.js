// One Hero slide: one wheel notch = One box per slot (the box is a media-cube-roll part), tapping the name list shows several slots, tapping a box zooms in and then opens the work detail.
// On phone, boxes are bound to page scroll — in the first screen the box grows .5→1x, then one task every 1.5 screens.
(() => {
  const S = window.bjSite;
  const root = document.querySelector(".bj");
  const cube = root?.querySelector(".bj-cube");
  if (!S || !cube) return;
  const { N, mod } = S;

  const names = [...root.querySelectorAll(".bj-list__item")];
  // Placeholder to fill each work’s detail panel — for the gallery it’s [type, ratio, label, add padding]
  const WORK = names.map((b, i) => ({
    name: b.textContent.trim(),
    active: i !== 6,
    meta: `[0000] Your work type here`,
    role: "Your role here · two words",
    desc: "Your work description here in about four lines. Say what was made, what scenes there were, and what motion was designed.",
    skills: "Skill 1, Skill 2, Skill 3, Skill 4, Skill 5",
    links: i % 3 === 1 ? 2 : 1,
    gallery: [
      ["video", "16 / 9", `Work ${i + 1} · Hero screen recording · landscape 16:9 video`],
      ["img", "16 / 10", `Work ${i + 1} · Detail screen capture · 4px rounded corners`],
      ["img", "4 / 3", `Work ${i + 1} · Mockup with three phone screens side by side · light background`, i % 2 === 0],
      ["img", "16 / 10", `Work ${i + 1} · Last screen capture`],
    ],
  }));

  let step = 0;
  let open = false;
  let busy = false;
  const narrow = () => innerWidth <= 768;
  const color = (i) => `var(--site-c${mod(i, N)})`;
  root.style.setProperty("--n", N);
  root.style.setProperty("--pc", color(0));

  // List — fills only the current Work item, and tapping rolls several rows up to that item
  const mark = (s) => names.forEach((b, i) => b.setAttribute("aria-current", String(i === mod(s, N))));
  names.forEach((b, i) => b.addEventListener("click", () => {
    if (open || busy || i === step) return;
    cube.dispatchEvent(new CustomEvent("fx:go", { detail: { step: i } }));
  }));
  cube.addEventListener("fx:step", (e) => {
    step = e.detail.step;
    mark(step);
    root.style.setProperty("--pc", color(e.detail.index));
    if (!narrow()) S.moveStrip(step, 0.9, e.detail.delay || 0);
  });
  cube.addEventListener("fx:settled", () => { busy = false; });

  // Tail tag text: on the front face over it, ”View work” and ”Hold Space and drag” every 1.8s (.5s off in between), and on the side face ”Press Space to drag”
  const TXT = { view: "View work", hold: "Hold Space and drag", press: "Press Space to drag", click: "Try Pressing" };
  let cycle = 0;
  const stopCycle = () => clearTimeout(cycle);
  cube.addEventListener("fx:hover", (e) => {
    stopCycle();
    if (open) return;
    const { over, front } = e.detail;
    if (!over) return S.setCursor(null, false);
    if (!front) return S.setCursor(TXT.press, true);
    const pair = [TXT.view, TXT.hold];
    let k = 0;
    S.setCursor(pair[0], true);
    const flip = () => {
      S.setCursor(null, false);
      cycle = setTimeout(() => { k = 1 - k; S.setCursor(pair[k], true); cycle = setTimeout(flip, 1800); }, 500);
    };
    cycle = setTimeout(flip, 1800);
  });

  // Work detail panel
  const detail = root.querySelector(".bj-detail");
  const body = detail.querySelector(".bj-detail__body");
  const inner = detail.querySelector(".bj-detail__inner");
  const gallery = detail.querySelector(".bj-detail__gallery");
  const soon = detail.querySelector(".bj-soon");
  const dnav = root.querySelector(".bj-detail-nav");
  const list = root.querySelector(".bj-list");
  const fill = (i, time = 0) => {
    const w = WORK[mod(i, N)];
    root.style.setProperty("--pc", color(i));
    detail.scrollTop = 0;
    body.style.removeProperty("--u");
    inner.style.transform = "";
    body.hidden = !w.active;
    soon.hidden = w.active;
    inner.querySelector(".bj-detail__title").textContent = w.name;
    inner.querySelector(".bj-detail__meta").textContent = w.meta;
    inner.querySelector(".bj-detail__role").textContent = w.role;
    inner.querySelector(".bj-detail__desc").textContent = w.desc;
    inner.querySelector(".bj-detail__skills").textContent = w.skills;
    inner.querySelector(".bj-detail__links").innerHTML = Array.from({ length: w.links }, (_, k) => `<a href="#top">[Link ${k + 1}]</a>`).join("");
    gallery.innerHTML = w.gallery.map(([kind, ratio, label, padded]) => kind === "video"
      ? `<figure class="bj-shot"><video src="media/work-reel-16x9.mp4" muted loop playsinline autoplay preload="auto" style="aspect-ratio: ${ratio}" data-label="${label}"></video></figure>`
      : `<figure class="bj-shot${padded ? " bj-shot--padded" : ""}"><div class="wf-img" style="aspect-ratio: ${ratio}" data-label="${label}"></div></figure>`).join("");
    const v = gallery.querySelector("video");
    if (v) {
      const go = () => { v.currentTime = time; v.play().catch(() => {}); };
      if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true });
    }
  };
  const show = () => {
    open = true;
    root.classList.add("is-open");
    detail.classList.remove("is-closing");
    detail.classList.add("is-open");
    dnav.hidden = false;
    S.setCursor(WORK[mod(step, N)].name, true);
  };
  // Scrolling a detail panel down shifts the background from the work color to a color 45% darker, and the pinned text block rises together by the remaining length
  detail.addEventListener("scroll", () => {
    const h = detail.clientHeight;
    const extra = inner.scrollHeight - h;
    if (narrow()) {
      inner.style.transform = extra > 0 ? `translateY(${-Math.min(1, Math.max(0, detail.scrollTop / extra)) * extra}px)` : "";
      return;
    }
    const s = detail.scrollTop - h, c = detail.scrollHeight - 2 * h;
    if (s <= 0 || c <= 0) { inner.style.transform = ""; body.style.removeProperty("--u"); return; }
    const u = Math.min(1, s / c);
    body.style.setProperty("--u", u);
    if (extra > 0) inner.style.transform = `translateY(${-u * extra}px)`;
  }, { passive: true });
  detail.addEventListener("mouseover", (e) => { if (e.target.closest(".bj-detail__links a")) S.setCursor(TXT.click, true, true); });
  detail.addEventListener("mouseout", (e) => { if (e.target.closest(".bj-detail__links a")) S.setCursor(WORK[mod(step, N)].name, true); });

  cube.addEventListener("fx:zoom-start", () => {
    S.setInfo(false);
    stopCycle();
    if (list) gsap.to(list, { y: -innerHeight, duration: S.reduce ? 0 : 0.45, ease: "power2.in", overwrite: true });
  });
  cube.addEventListener("fx:pick", (e) => {
    busy = false;
    fill(e.detail.index, e.detail.next ? 0 : (e.detail.time || 0) + 0.6);
    requestAnimationFrame(show);
  });
  const close = () => {
    if (!open || busy) return;
    busy = true;
    detail.classList.add("is-closing");
    S.setCursor(null, false);
    if (!narrow()) {
      cube.dispatchEvent(new CustomEvent("fx:zoom-out"));
      if (list) gsap.to(list, { y: 0, duration: S.reduce ? 0 : 0.55, ease: "power2.out", overwrite: true });
    }
    setTimeout(() => {
      open = false;
      busy = false;
      root.classList.remove("is-open");
      detail.classList.remove("is-open", "is-closing");
      dnav.hidden = true;
      unlockBody();
    }, 500);
  };
  cube.addEventListener("fx:zoom-out-ask", (e) => { e.preventDefault(); close(); });

  const next = () => {
    if (busy) return;
    if (!open) {
      if (narrow()) return mobileGo(introDone ? step + 1 : null);
      busy = true;
      return cube.dispatchEvent(new CustomEvent("fx:go", { detail: { step: step + 1 } }));
    }
    busy = true;
    detail.classList.remove("is-open");
    if (!narrow()) return cube.dispatchEvent(new CustomEvent("fx:next"));
    // Phone: pushes the progress value to the next slot over 1.25s to roll the box, then reopens the panel with that work
    const p = { v: step }, t = step + 1;
    setTimeout(() => gsap.to(p, { v: t, duration: S.reduce ? 0 : 1.25, ease: "power2.inOut",
      onUpdate: () => cube.dispatchEvent(new CustomEvent("fx:progress", { detail: { p: p.v } })),
      onComplete: () => { scrollToStep(t); step = t; mark(t); fill(t); busy = false; requestAnimationFrame(show); } }), 120);
  };
  const back = () => {
    if (busy) return;
    if (open) return close();
    if (narrow()) return mobileGo(Math.max(0, step - 1));
    if (step === 0) return;
    busy = true;
    cube.dispatchEvent(new CustomEvent("fx:go", { detail: { step: 0 } }));
  };
  document.querySelectorAll('[data-act="next"]').forEach((b) => b.addEventListener("click", next));
  document.querySelectorAll('[data-act="return"]').forEach((b) => b.addEventListener("click", back));

  // Phone scroll
  const head = root.querySelector(".bj-mhead");
  const headIn = head.querySelector(".bj-mhead__in");
  const headName = head.querySelector(".bj-mhead__name");
  let introDone = false, offset = 0, lastStep = -1, lockY = 0;
  const lockBody = () => { lockY = scrollY; Object.assign(document.body.style, { position: "fixed", top: `-${lockY}px`, left: "0", right: "0", width: "100%" }); };
  const unlockBody = () => {
    if (document.body.style.position !== "fixed") return;
    Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
    scrollTo(0, lockY);
  };
  // Slot → scroll position. Past the number of works, wrap around with offset so it advances endlessly on a page of the same length
  const scrollToStep = (s) => {
    let t = s - offset;
    while (t > N - 1) { offset += N; t -= N; }
    while (t < 0) { offset -= N; t += N; }
    lockY = (1 + 1.5 * t) * innerHeight;
    scrollTo(0, lockY);
  };
  const setHint = (on) => head.classList.toggle("is-hint", on && !open);
  const backBtn = document.querySelector('.bj-top__m [data-act="return"]');
  const onScroll = () => {
    if (!narrow() || busy || open) return;
    const h = innerHeight;
    if (introDone && scrollY < h) return scrollTo(0, h);
    const i = scrollY / h, o = Math.max(0, Math.min(1, i));
    let a = Math.max(0, (i - 1) / 1.5);
    const r = Math.round(a);
    if (Math.abs(a - r) < 0.05) a = r;
    const s = a + offset;
    cube.dispatchEvent(new CustomEvent("fx:progress", { detail: { p: s, intro: o } }));
    headIn.style.opacity = String(o);
    if (o >= 1 && !introDone) { introDone = true; head.removeAttribute("aria-disabled"); }
    const k = Math.floor(s + 0.25);
    if (k !== lastStep) {
      lastStep = k;
      step = k;
      mark(k);
      headName.textContent = WORK[mod(k, N)].name;
      root.style.setProperty("--pc", color(k));
    }
    const frac = s - Math.floor(s);
    setHint(introDone && (frac < 0.5 || frac >= 0.85));
    backBtn?.setAttribute("aria-disabled", String(step <= 0));
  };
  head.setAttribute("aria-disabled", "true");
  addEventListener("scroll", onScroll, { passive: true });
  head.addEventListener("click", () => {
    if (!introDone || open) return;
    fill(step);
    lockBody();
    requestAnimationFrame(show);
  });
  // Phone Back and Next — with multiple cells, 0.9s plus 0.25s per cell (max 2.5s), and the scroll position adjusts after the box has fully rolled
  const mobileGo = (t) => {
    if (t == null) return scrollTo({ top: innerHeight, behavior: "smooth" });
    if (t === step) return;
    busy = true;
    lockBody();
    const d = Math.min(0.9 + 0.25 * Math.max(0, Math.abs(t - step) - 1), 2.5);
    cube.addEventListener("fx:settled", () => {
      Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" });
      scrollToStep(t);
      busy = false;
      onScroll();
    }, { once: true });
    cube.dispatchEvent(new CustomEvent("fx:go", { detail: { step: t, dur: d } }));
  };

  history.scrollRestoration = "manual";
  scrollTo(0, 0);
  mark(0);
  cube.addEventListener("fx:ready", () => {
    onScroll();
    S.ready(() => cube.dispatchEvent(new CustomEvent("fx:enter")));
  });
})();
