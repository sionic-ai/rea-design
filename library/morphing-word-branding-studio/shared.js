// Shared across pages — nav · footer · back-to-top drawing, Lenis, menu, logo two-circle spin, scroll reveal, local time, logo marquee, case image panel
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const tone = document.body.dataset.tone || "";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bot = navigator.webdriver || document.prerendering || /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i.test(navigator.userAgent);

  const markSvg = (h) => `<span class="s8-mark" data-fx-part="mark" style="--h:${h}px" aria-hidden="true"><svg viewBox="0 0 100 166"><circle class="c-bot" cx="50" cy="116" r="50" style="fill: var(--kf-accent)"/><circle class="c-top" cx="50" cy="50" r="50" style="fill: var(--site-orange); mix-blend-mode: multiply"/></svg></span>`;
  const links = [["works", "works.html", "Work"], ["studio", "index.html#team", "Studio"], ["service", "service.html", "Services"], ["news", "news.html", "Journal"]];
  const navLinks = links.map(([k, href, label]) => `<a href="${href}"${k === page ? ' aria-current="page"' : ""}>${label}</a>`).join("");

  const head = document.querySelector('[data-slot="nav"]');
  if (head) {
    head.className = "nav" + (tone === "rust" ? " inverse" : "");
    head.innerHTML = `
      <a class="logo" href="index.html" aria-label="Home" data-fx="circle-split-intro" data-fx-circle-split-intro="gate: intro; once: session">${markSvg(30)}<span class="wordmark" data-fx-part="word" data-label="Brand English wordmark (about 7 capital letters)">STUDIO</span></a>
      <nav class="links" aria-label="Main menu">${navLinks}<a class="cta" href="index.html#start">Start a project <span class="arrow" aria-hidden="true">↗</span></a>
        <div class="lang" role="group" aria-label="Language"><a href="#" aria-current="true">EN</a><a href="#">KO</a></div></nav>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu"><span class="visually-hidden">Menu</span><span class="bars" aria-hidden="true"></span></button>
      <div class="mobile" id="mobile-menu" hidden>${navLinks}<a class="cta" href="index.html#start">Start a project <span class="arrow" aria-hidden="true">↗</span></a>
        <div class="lang" role="group" aria-label="Language"><a href="#" aria-current="true">English</a><a href="#">Korean</a></div></div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const icon = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
    foot.className = "footer panel";
    foot.innerHTML = `
      <section class="newsletter" aria-labelledby="nl-title">
        <div class="copy"><p class="eyebrow">Get updates</p><h2 id="nl-title">Your one-line News subscription title here,<br>Second line ending <em>Italic.</em></h2></div>
        <form class="nl-form" data-newsletter><div class="row"><label class="visually-hidden" for="nl-email">Email</label><input id="nl-email" type="email" required placeholder="Email address" autocomplete="email"><button type="submit">Subscribe <span>↗</span></button></div>
        <p class="note" data-note>Add the sending frequency and a one-line note.</p></form>
      </section>
      <div class="top">
        <a class="logo" href="index.html" aria-label="Home">${markSvg(120).replace(' data-fx-part="mark"', "")}<span class="wordmark" data-label="Brand English Wordmark">STUDIO</span></a>
        <div class="cols">
          <div class="col"><p class="eyebrow">Studio</p>${links.map(([, h, l]) => `<a href="${h}">${l}</a>`).join("")}</div>
          <div class="col"><p class="eyebrow">Contact</p><a class="social" href="#">${icon}hello@studio.name</a><span class="social">${icon}City name · City name</span>
            <div class="local-time" data-local-time hidden><span class="social">${icon}<span class="read"><span class="hm" data-hm>--:--</span><span class="off" data-off></span></span></span>
              <span class="switch" role="group" aria-label="Local time"><button type="button" data-zone="Europe/Madrid">VLC</button><button type="button" data-zone="Europe/City">LDN</button><button type="button" data-zone="America/Chicago">CHI</button><button type="button" data-zone="America/Los_Angeles">SF</button><button type="button" data-zone="America/New_York">ATL</button></span></div></div>
          <div class="col"><p class="eyebrow">Social</p><a class="social" href="#">${icon}LinkedIn</a><a class="social" href="#">${icon}App</a><a class="social" href="#">${icon}Instagram</a><a class="social" href="#">${icon}Brand</a></div>
        </div>
      </div>
      <div class="bottom"><p>© 0000 Studio Name. One line of copyright here.</p><p class="legal"><a href="#">Privacy policy</a><a href="#">Terms of service</a></p>
        <p class="company">Here, company registration info · business number 00000000 · address in one line.</p></div>`;
  }

  const toTop = document.createElement("a");
  toTop.className = "to-top"; toTop.href = "#top"; toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 15V3M3.5 8.5 9 3l5.5 5.5"/></svg>';
  document.body.append(toTop);

  // Lenis — original 1.3.27 · lerp .11 · anchor -24px. Stops while the loader or menu is up
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: -24 }, autoRaf: true });
    window.lenis = lenis;
    const sync = () => (root.classList.contains("intro") || root.classList.contains("menu-open") ? lenis.stop() : lenis.start());
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["class"] });
    sync();
  }

  const btn = document.querySelector(".menu-btn"), mob = document.getElementById("mobile-menu");
  btn?.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    if (mob) mob.hidden = open;
    root.classList.toggle("menu-open", !open);
  });

  document.querySelectorAll("[data-newsletter]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const n = f.querySelector("[data-note]");
    if (n) n.textContent = "Your one-line send confirmation notice here.";
  }));

  // Logo two circles — swap places every 20s with a half turn (2.2s), jittering in turn
  const IO = "cubic-bezier(0.65, 0, 0.35, 1)";
  const marks = [...document.querySelectorAll(".s8-mark svg")];
  const spin = () => marks.forEach((svg) => {
    const [t, b] = [...svg.querySelectorAll("circle")].sort((x, y) => x.getAttribute("cy") - y.getAttribute("cy"));
    const d = b.getAttribute("cy") - t.getAttribute("cy");
    const kf = (v) => [{ transform: "translateY(0)", offset: 0, easing: IO }, { transform: `translateY(${v}px)`, offset: 0.42 }, { transform: `translateY(${v}px)`, offset: 1 }];
    t.animate(kf(d), { duration: 2200 }); b.animate(kf(-d), { duration: 2200 });
    svg.animate([{ transform: "rotate(0turn)", offset: 0 }, { transform: "rotate(0turn)", offset: 0.48, easing: IO }, { transform: "rotate(0.5turn)", offset: 1 }], { duration: 2200 });
  });
  const jitter = () => marks.forEach((svg) => {
    const r = Math.max(1, svg.getBoundingClientRect().height / 30);
    let n = 0;
    const tick = () => {
      const end = n >= 14;
      svg.style.transform = end ? "" : `translateX(${((Math.random() * 3 - 1.5) * r).toFixed(2)}px)`;
      svg.style.opacity = !end && Math.random() < 0.18 ? "0.55" : "";
      n += 1;
      if (n <= 16) setTimeout(tick, 45 + Math.random() * 45); else { svg.style.transform = ""; svg.style.opacity = ""; }
    };
    tick();
  });
  if (!reduce && marks.length) {
    let k = 0;
    const turn = () => { if (!document.hidden) (k % 2 === 0 ? spin : jitter)(); k += 1; };
    setTimeout(turn, 300);
    setInterval(turn, 20000);
  }

  // Scroll reveal — as in the original: items within a group one at a time, in visible order (top → left) at 80ms intervals (max 6)
  if (!reduce && "IntersectionObserver" in window) {
    const main = document.querySelector("main");
    const ITEMS = ["main header > *", "main section.hero > *", ".meta > div", ".grid > *", ".row > *", ".posts > *", ".quotes > *", ".stats > *", ".steps > li", ".service-stack > *", ".cards > *", ".questions > *", ".products > li", ".rows > li", ".gallery > *", ".services > li", "article.case > *", ".how > *"].join(",");
    const SKIP = "script, style, template, [hidden], [data-no-reveal], .wf-note";
    const targets = [];
    const usable = (el) => {
      if (el.matches(SKIP)) return false;
      const cs = getComputedStyle(el);
      return !(cs.display === "none" || cs.position === "absolute" || cs.position === "fixed" || cs.position === "sticky");
    };
    const collect = (el) => {
      if (!usable(el)) return;
      const ox = getComputedStyle(el).overflowX;
      if ((ox === "auto" || ox === "scroll" || ox === "hidden") && el.scrollWidth > el.clientWidth + 1) { targets.push(el); return; }
      if (el.querySelector(ITEMS)) { [...el.children].forEach(collect); return; }
      targets.push(el);
    };
    if (main) [...main.children, ...[...main.parentElement.children].filter((e) => e !== main && !e.matches('[data-slot="nav"], .nav, script, .to-top'))].forEach(collect);
    const done = (el) => { el.classList.remove("rv", "rv-in"); el.style.removeProperty("--rv-delay"); };
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).map((e) => e.target)
        .sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.top - rb.top || ra.left - rb.left; })
        .forEach((el, i) => {
          io.unobserve(el);
          el.style.setProperty("--rv-delay", `${Math.min(i, 6) * 80}ms`);
          el.classList.add("rv-in");
          const t = setTimeout(() => done(el), 1000 + Math.min(i, 6) * 80);
          el.addEventListener("transitionend", (e) => { if (e.target === el && e.propertyName === "translate") { clearTimeout(t); done(el); } });
        });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    targets.forEach((el) => { el.classList.add("rv"); io.observe(el); });
  }

  // Back to top — appears from 1.2 screens down, rises with Lenis 1.4s
  {
    let on = false;
    const check = () => { const v = scrollY > innerHeight * 1.2; if (v !== on) { on = v; toTop.classList.toggle("on", v); } };
    addEventListener("scroll", check, { passive: true }); addEventListener("resize", check, { passive: true }); check();
    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.lenis) window.lenis.scrollTo(0, { duration: 1.4 }); else scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  // Local time — remembers the chosen city and updates every time the minute changes
  document.querySelectorAll("[data-local-time]").forEach((box) => {
    const hm = box.querySelector("[data-hm]"), off = box.querySelector("[data-off]"), zones = [...box.querySelectorAll("[data-zone]")];
    let zone = zones[0].dataset.zone;
    try { const s = localStorage.getItem("s8-clock-zone"); if (s && zones.some((z) => z.dataset.zone === s)) zone = s; } catch (e) {}
    const draw = () => {
      const d = new Date();
      hm.textContent = new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
      const o = new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "";
      off.textContent = o.replace("GMT", "UTC").replace(/^UTC$/, "UTC+0").replace("-", "−");
      zones.forEach((z) => z.setAttribute("aria-pressed", String(z.dataset.zone === zone)));
    };
    zones.forEach((z) => z.addEventListener("click", () => { zone = z.dataset.zone; try { localStorage.setItem("s8-clock-zone", zone); } catch (e) {} draw(); }));
    draw(); box.hidden = false;
    const tick = () => { draw(); setTimeout(tick, 60000 - (Date.now() % 60000) + 50); };
    setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
  });

  // Logo marquee — length of one loop = Line width ÷ 45px/s, flows only when more than half is visible
  document.querySelectorAll("[data-marquee]").forEach((m) => {
    const ul = m.querySelector("ul"), speed = Number(m.dataset.speed) || 45;
    if (!ul) return;
    const set = () => m.style.setProperty("--loop", `${(ul.getBoundingClientRect().width / speed).toFixed(2)}s`);
    set(); new ResizeObserver(set).observe(ul);
    m.classList.add("waiting");
    new IntersectionObserver(([e]) => m.classList.toggle("waiting", !e.isIntersecting), { threshold: 0.5 }).observe(m);
  });

  // Case artwork panel — spin: the mark pops out big, spins six turns trailing a tail, settles at the center and a circle spreads (for a bot it shows the finished look).
  // rings: six rings spread out and clear, the mark pops out and settles aside, then the text bars rise in turn. Plays once when both are 35% visible, and again on hover
  const ease3 = (t) => 1 - (1 - t) ** 3, inout3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), clamp = (v) => Math.min(1, Math.max(0, v));
  const spinArt = (art) => {
    const g = art.querySelector(".mk .m"), trail = [...art.querySelectorAll(".mk .t")], disc = art.querySelector(".reveal-disc");
    const set = (el, x, s, r) => el.setAttribute("transform", `translate(${x} 0) scale(${s}) rotate(${r})`);
    const draw = (x, s, r, k, a = 1) => { set(g, x, s, r); trail.forEach((t, n) => { set(t, x, s, r - (n + 1) * 9 * k); t.style.opacity = String(a * k * (0.42 - n * 0.09)); }); art.style.setProperty("--blur", `${6 * k}px`); };
    const shift = 46;
    return {
      play() {
        const t0 = performance.now(); let spread = 0;
        g.style.opacity = "1";
        const f = (now) => {
          const h = now - t0;
          if (h < 2800) { const t = h / 2800, i = ease3(Math.min(1, h / 380)); draw(shift, 0.4 + 2.2 * i, 2160 * (1 - (1 - t) ** 2.6), Math.min(1, 2.6 * (1 - t) ** 1.6 / 1.6), i); g.style.opacity = String(i); }
          else if (h < 3700) { const t = inout3((h - 2800) / 900); draw(shift * (1 - t), 2.6 - 1.6 * t, 2160, 0); if (!spread && t > 0.6) spread = now; }
          else { draw(0, 1, 2160, 0); spread ||= now; }
          if (spread) { const e = Math.min(1, (now - spread) / 1500); disc.style.transform = `scale(${ease3(e) * 320})`; if (e >= 1) { art.classList.add("done"); return; } }
          requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      },
      again() {
        const t0 = performance.now();
        return new Promise((res) => { const f = (now) => { const a = Math.min(1, (now - t0) / 1900); draw(0, 1, 2160 + 1080 * (1 - (1 - a) ** 2.6), Math.min(1, 2.6 * (1 - a) ** 1.6 / 1.6) * 0.8); a < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
      },
      rest() { draw(0, 1, 0, 0); disc.style.transform = "scale(320)"; art.classList.add("done", "still"); },
    };
  };
  const ringArt = (art) => {
    const svg = art.querySelector(".rings"), rings = [...svg.querySelectorAll("circle")], mark = art.querySelector(".mk .m"), bars = [...art.querySelectorAll(".mk .w")];
    const SET = [[2.5, 0.74], [2.5, 1.26], [5.5, 0.74], [5.5, 1.26], [7.5, 0.74], [7.5, 1.26]];
    let R = 1;
    const size = () => { const { width: w, height: h } = art.getBoundingClientRect(); svg.setAttribute("viewBox", `${-w / 2} ${-h / 2} ${w} ${h}`); R = Math.hypot(w, h) / 2; };
    const frame = (s) => {
      rings.forEach((c, n) => { const [at, k] = SET[n]; c.setAttribute("r", (k * R * Math.sin((Math.PI / 2) * clamp((s + 7 - at) / 7))).toFixed(1)); });
      svg.style.opacity = s >= 15 ? "0" : "1";
      const sc = s < 14.5 ? 0 : 0.25 + 0.75 * ease3(clamp((s - 14.5) / 7.5)), m = 1 - inout3(clamp((s - 37) / 9));
      mark.setAttribute("transform", `translate(${(-30 + 40 * m).toFixed(2)} 0) scale(${sc})`);
      bars.forEach((b, n) => { const i = clamp((s - 37.5 - n * 1.15) / 6); b.style.opacity = String(i > 0 ? Math.min(1, i * 2.5) : 0); b.setAttribute("transform", `translate(${((1 - ease3(i)) * 5).toFixed(2)} 0)`); });
    };
    let busy = false;
    return {
      play() {
        if (busy) return; busy = true; size();
        let t0 = -1;
        const f = (now) => { if (t0 < 0) t0 = now; const s = ((now - t0) / 1000) * 30; frame(Math.min(s, 52)); s < 52 ? requestAnimationFrame(f) : (busy = false); };
        requestAnimationFrame(f);
      },
      init() { size(); frame(0); new ResizeObserver(size).observe(art); },
    };
  };
  document.querySelectorAll("[data-art]").forEach((art) => {
    const kind = art.dataset.art, link = art.closest("a") || art;
    if (kind === "spin") {
      const a = spinArt(art);
      if (reduce || bot || !("IntersectionObserver" in window)) { a.rest(); return; }
      if (link !== art) { a.rest(); }
      else { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); a.play(); } }, { threshold: 0.35 }); io.observe(art); }
      let busy = false;
      link.addEventListener("mouseenter", () => { if (!busy && art.classList.contains("done")) { busy = true; a.again().then(() => (busy = false)); } });
    } else if (kind === "rings") {
      const a = ringArt(art);
      if (reduce) return;
      a.init();
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); a.play(); } }, { threshold: 0.35 });
      io.observe(art);
      link.addEventListener("mouseenter", () => a.play());
    }
  });
})();
