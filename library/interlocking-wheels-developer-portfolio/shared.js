// Cross-page parts: skin switching, HUD gauge, pill nav, command panel, phone menu, other visitors’ cursors, join notification, paper grain
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const CO = (window.CO = { reduce, fine });
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  // Letter roll — split into cells per letter (--i order) and keep the original text for screen readers. A space between words is also one cell
  document.querySelectorAll("[data-roll]").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text.trim());
    const box = document.createElement("span");
    box.className = "co-roll";
    box.setAttribute("aria-hidden", "true");
    [...text].forEach((ch, i) => { const s = document.createElement("span"); s.textContent = ch; s.style.setProperty("--i", String(i)); box.append(s); });
    el.textContent = "";
    el.append(box);
  });

  // Page transition — while a paper-colored cover wipes in from below over 1.3s expo.inOut, the body recedes to .96x and 10px down and a .55 dark scrim is laid.
  // The new page opens covered and is lifted up in 1.1s expo.inOut (veil of the original Astro transition)
  const veil = document.createElement("div");
  veil.className = "co-veil";
  veil.setAttribute("aria-hidden", "true");
  document.body.append(veil);
  const came = sessionStorage.getItem("co-veil") === "1";
  if (!came || !window.gsap || reduce) delete root.dataset.veil;
  sessionStorage.removeItem("co-veil");
  const firstVisit = !came && !sessionStorage.getItem("co-booted");
  sessionStorage.setItem("co-booted", "1");
  if (window.gsap && !reduce && firstVisit) {
    // Original counter steps (climb)·rest steps (rests): from 0·5·9·17·27·39·52·64·78·89·100 it climbs skipping 2 steps at a time (each step .16 + difference × .11 s, power1.inOut, .1 pause between)
    const boot = document.createElement("div");
    boot.className = "co-boot";
    boot.setAttribute("aria-hidden", "true");
    boot.innerHTML = '<span class="co-boot__word">Studio Name</span><span class="co-boot__travel">0%</span>';
    document.body.append(boot);
    const travel = boot.querySelector(".co-boot__travel"), word = boot.querySelector(".co-boot__word");
    const cells = [0, 5, 9, 17, 27, 39, 52, 64, 78, 89, 100], rests = [0, 2, 4, 6, 8, 10];
    const st = { i: 0 };
    const show = () => (travel.textContent = `${Math.round(cells[Math.floor(st.i)] + (cells[Math.min(10, Math.floor(st.i) + 1)] - cells[Math.floor(st.i)]) * (st.i % 1))}%`);
    gsap.set([veil, boot], { visibility: "visible" });
    gsap.set(veil, { clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(travel, { y: 140 });
    const tl = gsap.timeline();
    tl.to(travel, { y: 0, duration: 0.5, ease: "expo.out" }, 0);
    // Original hopTimeline — hops across 4 rest cells, c = slows to .85 + .55·(t−1)/3x, pausing .1·c between cells (.22 at the last)
    const hops = rests.length - 2;
    for (let t = 1; t <= hops; t++) {
      const c = 0.85 + 0.55 * (hops > 1 ? (t - 1) / (hops - 1) : 1);
      tl.to(st, { i: rests[t], duration: (0.16 + (rests[t] - rests[t - 1]) * 0.11) * c, ease: "power1.inOut", onUpdate: show }, t === 1 ? 0.26 : ">")
        .to({}, { duration: t === hops ? 0.22 : 0.1 * c });
    }
    Promise.all([tl.then(), document.fonts.ready]).then(() => gsap.to(st, { i: cells.length - 1, duration: 0.62, ease: "power2.out", onUpdate: show })).then(() => {
      gsap.timeline({ delay: 0.18, onComplete: () => { boot.remove(); gsap.set(veil, { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }); } })
        .to(veil, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.3, ease: "expo.inOut" }, 0)
        .to(travel, { y: -(innerHeight + 140), duration: 0.8, ease: "expo.inOut" }, 0)
        .to(word, { yPercent: -120, opacity: 0, duration: 0.8, ease: "expo.inOut" }, 0);
    });
  }
  if (window.gsap && !reduce) {
    if (came) {
      gsap.set(veil, { visibility: "visible", clipPath: "inset(0% 0% 0% 0%)" });
      delete root.dataset.veil;
      document.fonts.ready.then(() => gsap.to(veil, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut", onComplete: () => gsap.set(veil, { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" }) }));
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$/.test(url.pathname)) return;
      e.preventDefault();
      sessionStorage.setItem("co-veil", "1");
      const main = document.querySelector("main");
      const scrim = document.createElement("div");
      scrim.className = "co-veil-scrim";
      document.body.append(scrim);
      gsap.set(veil, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
      if (main) gsap.set(main, { transformOrigin: `50% ${scrollY + innerHeight / 2}px` });
      gsap.timeline({ onComplete: () => (location.href = url.href) })
        .to(veil, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }, 0)
        .to(main, { scale: 0.96, y: 10, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(scrim, { opacity: 0.55, duration: 0.91, ease: "power2.inOut" }, 0);
    });
  }

  // Notification panel — opens when the bell is pressed, closes in .15s on outside click, Esc or pressing again
  const bell = document.querySelector("[data-notif]");
  if (bell) {
    const notif = document.createElement("div");
    notif.className = "co-notif";
    notif.innerHTML = `<div class="co-notif__panel" role="dialog" aria-label="Latest news"><div class="co-notif__head co-mono"><span>What’s new</span><span>0${3}</span></div><div class="co-notif__list"><a href="#"><b>Your new news headline here</b><i class="co-mono">00 min ago</i></a><a href="#"><b>Your new work posted notice here</b><i class="co-mono">00 h ago</i></a><a href="#"><b>Your new lab post alert here</b><i class="co-mono">0 d ago</i></a></div></div>`;
    document.body.append(notif);
    let open = false, t = 0;
    const set = (on) => {
      open = on;
      bell.setAttribute("aria-expanded", String(on));
      clearTimeout(t);
      if (on) { notif.classList.remove("is-closing"); notif.classList.add("is-open"); }
      else { notif.classList.add("is-closing"); t = setTimeout(() => notif.classList.remove("is-open", "is-closing"), 150); }
    };
    bell.addEventListener("click", (e) => { e.stopPropagation(); set(!open); });
    notif.addEventListener("click", (e) => { if (e.target === notif) set(false); });
    document.addEventListener("click", (e) => { if (open && !e.target.closest(".co-notif__panel")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }
  // View together (PRESENCE) — a click toggles ON/OFF and hides other visitors’ cursors
  document.querySelectorAll(".co-hud button.co-hud__chip").forEach((b) => b.addEventListener("click", () => {
    const v = b.querySelector(".co-hud__v"), on = v.textContent !== "ON";
    v.textContent = on ? "ON" : "OFF";
    document.querySelector(".co-peers")?.toggleAttribute("hidden", !on);
  }));

  // Skin — remembers the chosen light or dark version (original default is dark)
  const saved = localStorage.getItem("co-theme");
  if (saved) root.dataset.theme = saved;
  else root.dataset.theme = "dark";
  const slide = () => document.querySelectorAll(".co-theme").forEach((t) => {
    const on = t.querySelector('button[aria-pressed="true"]'), bg = t.querySelector(".co-theme__bg");
    if (!on || !bg || bg.parentElement === on) return;
    const from = bg.parentElement.offsetLeft || 0;
    on.append(bg);
    bg.style.translate = `${from - on.offsetLeft}px 0`;
    requestAnimationFrame(() => (bg.style.translate = "0px 0"));
  });
  document.querySelectorAll(".co-theme button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.set === root.dataset.theme));
    b.addEventListener("click", () => {
      setTimeout(() => {
        root.dataset.theme = b.dataset.set;
        localStorage.setItem("co-theme", b.dataset.set);
        document.querySelectorAll(".co-theme button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.set === b.dataset.set)));
        dispatchEvent(new Event("co:theme"));
        document.querySelectorAll(".co-paper").forEach((p) => p.dispatchEvent(new Event("fx:repaint")));
      }, 20);
      setTimeout(slide, 523);
    });
  });

  slide();

  // Paper grain — bake half-screen-resolution noise once
  const grain = document.querySelector(".co-grain canvas");
  if (grain) {
    const g = grain.getContext("2d"), w = (grain.width = 320), h = (grain.height = 200);
    const img = g.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 40; }
    g.putImageData(img, 0, 0);
  }

  // HUD — prints time · FPS · visitors · LCP live (visitors is a placeholder number drifting slowly up and down)
  const hud = (k) => document.querySelector(`[data-hud="${k}"]`);
  const clock = hud("time"), fps = hud("fps"), online = hud("online"), lcp = hud("lcp");
  const tick = () => { if (clock) clock.textContent = new Date().toTimeString().slice(0, 5); };
  tick();
  setInterval(tick, 10000);
  if (fps) {
    let n = 0, t0 = performance.now();
    const loop = (t) => { n++; if (t - t0 > 1000) { fps.textContent = String(Math.round((n * 1000) / (t - t0))); n = 0; t0 = t; } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  let people = 26;
  const roll = (el, v) => {
    if (!el) return;
    if (reduce || !window.gsap) { el.textContent = String(v); return; }
    gsap.fromTo(el, { yPercent: 0, opacity: 1 }, { yPercent: -60, opacity: 0, duration: 0.2, ease: "power1.in", onComplete: () => { el.textContent = String(v); gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "power3.out" }); } });
  };
  if (online) online.textContent = String(people);
  if (lcp) new PerformanceObserver((l) => { const e = l.getEntries().pop(); if (e) lcp.textContent = `${(e.startTime / 1000).toFixed(1)}s`; }).observe({ type: "largest-contentful-paint", buffered: true });

  // Join notice — every few seconds a line about someone coming and going appears bottom left and fades
  const toast = document.querySelector(".co-toast");
  const say = (delta) => {
    people = Math.max(3, people + delta);
    roll(online, people);
    if (!toast || !window.gsap) return;
    toast.querySelector("b").textContent = delta > 0 ? `${delta}people have joined` : `${-delta}People have left`;
    toast.querySelector("i").textContent = `${people} online`;
    gsap.timeline().to(toast, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }).to(toast, { opacity: 0, y: 12, duration: 0.3, ease: "power1.in" }, "+=2.6");
  };
  if (!reduce) setInterval(() => say(Math.random() < 0.5 ? -1 - Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 4)), 9000);

  // Other visitors’ cursors — the original shows live visitors. Ours is a placeholder with two name tags drifting slowly
  const peers = document.querySelector(".co-peers");
  if (peers && !reduce && window.gsap) {
    peers.querySelectorAll(".co-peer").forEach((p, i) => {
      const go = () => gsap.to(p, { x: innerWidth * (0.15 + Math.random() * 0.7), y: innerHeight * (0.1 + Math.random() * 0.75), duration: 3 + Math.random() * 3, ease: "sine.inOut", onComplete: go });
      gsap.set(p, { x: innerWidth * (0.2 + i * 0.4), y: innerHeight * (0.2 + i * 0.3) });
      go();
    });
  }

  // Pill nav — the pill plate slides behind the hovered item with .4s expo.out (the current page item is the resting spot)
  document.querySelectorAll(".co-pill").forEach((nav) => {
    const pill = nav.querySelector(".co-pill__bg");
    const links = [...nav.querySelectorAll(".co-pill__link")];
    if (!pill) return;
    const at = (a, hover) => {
      if (!a) { pill.style.opacity = "0"; return; }
      const r = a.getBoundingClientRect(), n = nav.getBoundingClientRect();
      const hidden = getComputedStyle(pill).opacity === "0" || pill.style.opacity === "0" || !pill.style.width;
      pill.classList.toggle("is-hover", hover);
      pill.classList.toggle("is-snap", hidden);
      pill.style.cssText = `opacity:${hidden ? 0 : 1};width:${r.width}px;height:${r.height}px;transform:translate(${r.left - n.left}px,${r.top - n.top}px)`;
      if (hidden) { void pill.offsetWidth; pill.style.opacity = "1"; requestAnimationFrame(() => pill.classList.remove("is-snap")); }
    };
    const home = (hover) => at(links.find((a) => a.getAttribute("aria-current") === "page"), hover === true);
    links.forEach((a) => a.addEventListener("mouseenter", () => at(a, true)));
    nav.addEventListener("mouseleave", () => home(true));
    document.fonts.ready.then(home);
  });

  // Command palette (⌘K) — opening lets you pick from the page list
  const pal = document.querySelector(".co-palette");
  const openPal = (on) => {
    if (!pal) return;
    pal.setAttribute("aria-hidden", String(!on));
    pal.classList.toggle("is-open", on);
    if (on) setTimeout(() => pal.querySelector("input").focus(), 50);
  };
  document.querySelectorAll("[data-palette]").forEach((b) => b.addEventListener("click", () => openPal(true)));
  pal?.addEventListener("click", (e) => { if (e.target === pal) openPal(false); });
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPal(true); }
    if (e.key === "Escape") { openPal(false); menu(false); }
  });

  // Phone menu — the panel turns on in .45s and big text lines rise at .06 intervals
  const burger = document.querySelector(".co-burger"), panel = document.querySelector(".co-menu");
  const menu = (on) => {
    if (!burger || !panel || !window.gsap) return;
    burger.setAttribute("aria-expanded", String(on));
    gsap.to(panel, { autoAlpha: on ? 1 : 0, duration: 0.45, ease: "expo.out" });
    if (on) gsap.fromTo(panel.children, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "expo.out" });
  };
  burger?.addEventListener("click", () => menu(burger.getAttribute("aria-expanded") !== "true"));

  CO.css = css;
})();
