// LP motion: 1s loading → fade in order, the video cell plays 1s after it is over half visible, wing mascot after 500px, campaign modal once after 10s if the video ends or is off-screen,
// Scene slider (Splide), FAQ accordion (.4s power3.out), code copy.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const app = $("#app");

  // Below 500px the pillar (375px) is scaled to the screen width — the original converts the same dimensions to vw
  const fitColumn = () => {
    const z = innerWidth < 500 ? innerWidth / 375 : 1;
    document.documentElement.style.setProperty("--col-zoom", z);
  };
  fitColumn();
  addEventListener("resize", fitColumn);

  // Radial lines: neon lines spreading from one point behind the phone. The color changes by angle band
  const rays = (svg, cx, cy, n, r0, r1, colors, arc = [0, 360]) => {
    const g = document.createElementNS(NS, "g");
    for (let i = 0; i < n; i++) {
      const a = ((arc[0] + ((arc[1] - arc[0]) * i) / (n - 1)) * Math.PI) / 180;
      const l = document.createElementNS(NS, "line");
      const c = colors[Math.floor((i / n) * colors.length)];
      l.setAttribute("x1", cx + Math.cos(a) * r0); l.setAttribute("y1", cy + Math.sin(a) * r0);
      l.setAttribute("x2", cx + Math.cos(a) * r1); l.setAttribute("y2", cy + Math.sin(a) * r1);
      l.setAttribute("stroke-width", 2.2); l.setAttribute("stroke-linecap", "round");
      l.style.stroke = c;
      l.style.filter = `drop-shadow(0 0 3px ${c})`;
      g.append(l);
    }
    svg.append(g);
    return g;
  };
  const [P, Y, G, B, O] = ["pink", "yellow", "green", "blue", "orange"].map((n) => `var(--site-neon-${n})`);
  rays($(".kv__rays"), 187, 350, 72, 120, 420, [P, Y, G, B, P, O, Y, P, G, B, O, P]);
  rays($(".zero__rays"), 150, 150, 9, 78, 140, [B, G, Y, O, P], [150, 215]);
  rays($(".zero__rays"), 150, 150, 9, 78, 140, [P, O, Y, G, B], [-35, 30]);

  // QR placeholder — three finder-pattern corners + seeded random dots. Shape only, holds no real URL
  const qr = $(".fa-qr__code");
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" style="fill:var(--site-paper)"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  let cells = finder(0, 0) + finder(22, 0) + finder(0, 22);
  for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
    const inFinder = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    if (!inFinder && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  qr.innerHTML = `<g style="fill:var(--site-paper-ink)">${cells}</g>`;

  // Lifts 1 second after loading and adds -visible to #app — the remaining entrances run on CSS delays
  setTimeout(() => { $(".js-loading").classList.add("-hidden"); app.classList.add("-visible"); }, 1000);

  // Winged mascot back to top: from 500px
  const pagetop = $(".c-pagetop");
  const onScroll = () => pagetop.classList.toggle("-active", scrollY >= 500);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Video cell — like the original video-site slot: when more than half first becomes visible, after 1s removes the first frame and play button and plays muted,
  // On re-entry only unfinished videos resume, the first scene or button press plays immediately, tapping the video toggles pause↔play
  const wrap = $(".kv__player"), thumb = $(".kv__thumb"), playMark = $(".kv__play"), movie = $(".kv__movie"), sound = $(".kv__sound");
  let seen = false, shownMovie = false, ended = false;
  const start = () => {
    if (!shownMovie) { thumb.classList.remove("-visible"); playMark.classList.remove("-visible"); movie.classList.add("-visible"); shownMovie = true; }
    ended = false;
    movie.play().catch(() => {});
  };
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !seen) { seen = true; setTimeout(start, 1000); }
    else if (e.isIntersecting && shownMovie && !ended && movie.paused) movie.play().catch(() => {});
  }), { threshold: 0.5 }).observe(wrap);
  thumb.addEventListener("click", (e) => { e.stopPropagation(); start(); });
  movie.addEventListener("click", () => (movie.paused ? movie.play().catch(() => {}) : movie.pause()));
  sound.addEventListener("click", () => {
    movie.muted = !movie.muted;
    sound.setAttribute("aria-pressed", !movie.muted);
    sound.lastChild.textContent = movie.muted ? "OFF" : "ON";
  });

  // Campaign modal: 10 seconds after opening, and once only, 1 second after the video ends or goes off screen
  const modal = $(".js-modal");
  const opened = Date.now();
  let shown = false;
  const movieInView = () => {
    if (ended || !shownMovie) return false;
    const r = movie.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  };
  const tryOpen = () => {
    if (shown || Date.now() - opened < 10000 || movieInView()) return;
    modal.classList.add("-active");
    shown = true;
  };
  movie.addEventListener("ended", () => { ended = true; if (!shown) setTimeout(tryOpen, 1000); });
  setTimeout(() => {
    new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && !shown) setTimeout(tryOpen, 1000); }), { threshold: 0.1 }).observe(movie);
  }, 10000);
  $$(".js-modal-close").forEach((el) => el.addEventListener("click", () => modal.classList.remove("-active")));
  $(".cm .n-btn").addEventListener("click", () => modal.classList.remove("-active"));

  // Scene slider — same Splide 4.1.4 and same options as the original (slide .4s cubic-bezier(.25,1,.5,1) is the Splide default)
  new Splide(".scene", { autoWidth: true, gap: 30, perPage: 1, perMove: 1, trimSpace: false, focus: "center", flickPower: 50, flickMaxPages: 1 }).mount();

  // FAQ — keep details open while animating height 0↔auto
  $$(".js-details").forEach((d) => {
    const body = $(".js-content", d);
    $(".js-summary", d).addEventListener("click", (e) => {
      e.preventDefault();
      if (d.classList.contains("is-opened")) {
        d.classList.remove("is-opened");
        gsap.to(body, { height: 0, opacity: 0, duration: 0.4, ease: "power3.out", overwrite: true, onComplete: () => d.removeAttribute("open") });
      } else {
        d.classList.add("is-opened");
        d.setAttribute("open", "");
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.4, ease: "power3.out", overwrite: true });
      }
    });
  });

  $(".js-copy").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    navigator.clipboard?.writeText($(".copy__code").textContent).catch(() => {});
    btn.classList.add("is-done");
    setTimeout(() => btn.classList.remove("is-done"), 1500);
  });
})();
