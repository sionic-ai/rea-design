// Home page scenes: count-up, making-process spots surfacing in order, marquee speed, member marquee, column card carousel, radio switching.
(() => {
  const reduce = document.documentElement.classList.contains("rm");
  const mm = gsap.matchMedia();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const on = (el, fn) => el && el.addEventListener("an:active", fn, { once: true });

  /* Greeting: steps from 1th to brand at intervals of [500,200,160,160,130,100,100,100,100]ms, then shrinks 1.4s after it all ends */
  const msg = $("#message");
  const num = $(".msg-count .n");
  const copy = $$(".msg-copy p");
  const showCopy = (base) => copy.forEach((p, i) => setTimeout(() => p.classList.add("is-show"), base + 200 * (i + 1)));
  on(msg, () => {
    if (reduce || innerWidth <= 1279) {
      num.textContent = "10";
      msg.classList.add("countup-complete");
      showCopy(800);
      return;
    }
    const steps = [500, 200, 160, 160, 130, 100, 100, 100, 100];
    let n = 1;
    const next = () => {
      num.textContent = String(n);
      if (n < 10) { setTimeout(next, steps[n - 1]); n++; return; }
      msg.classList.add("countup-complete");
      setTimeout(() => {
        gsap.fromTo(".msg-scale", { scale: 1.6 }, { scale: 1, duration: 0.8, ease: "power2.inOut" });
        showCopy(600);
      }, 1400);
    };
    gsap.set(".msg-scale", { scale: 1.6 });
    next();
  });

  on($(".reddot-feature"), () => $$(".reddot-feature p").forEach((p, i) => setTimeout(() => p.classList.add("is-show"), 200 * i)));

  /* Making process: appears in shuffled order at .05s intervals, floats after 1s */
  on($(".making"), (e) => {
    const items = $$(".making-list li").sort(() => Math.random() - 0.5);
    items.forEach((li, i) => setTimeout(() => {
      li.classList.add("show");
      setTimeout(() => li.classList.add("float"), 1000);
    }, i * 50));
  });

  /* Marquee: track duplicated once, runs half its length at 45px per second */
  const marquee = (track, pxPerSec = 45, dir = 1) => {
    track.innerHTML += track.innerHTML;
    const dist = track.scrollWidth / 2;
    track.style.setProperty("--dist", `${-dist}px`);
    track.style.setProperty("--dur", `${dist / pxPerSec}s`);
    if (dir < 0) track.style.animationDirection = "reverse";
  };

  /* Member card */
  const COLORS = ["var(--site-pink)", "var(--site-cobalt)", "var(--site-orange)", "var(--site-green-deep)", "var(--site-red-63)", "var(--site-purple-54)"];
  const ROLES = ["Director / Designer", "Designer (Partner)", "Art Director (Partner)", "Editor / Writer (Partner)", "Composer / Arranger", "CEO / Director"];
  const LIGHT = ["Front view white shirt · gray background · soft frontal light", "Slight side angle · White shirt · Light gray background", "Front-facing smile · white shirt · softbox from above"];
  const member = (i) => `<li><a href="about.html#staff">
    <svg class="deco" viewBox="0 0 200 200" aria-hidden="true"></svg>
    <div class="wf-img" data-label="Member bust shot · ${LIGHT[i % 3]} · Blob-shaped square"></div>
    <span class="tag" style="--c:${COLORS[i % COLORS.length]}">Your name $ here{String(i + 1).padStart(2, "0")}<small>${ROLES[i % ROLES.length]}</small></span>
  </a></li>`;
  // Over a hovered person photo, a decoration (confetti on one corner + a small mascot opposite) is randomly picked and bounced up — the original picks one of seven decoration images
  const bit = (x, y, k, c) => [
    `<rect x="${x}" y="${y}" width="16" height="9" rx="2" fill="${c}" transform="rotate(${(k * 37) % 70 - 35} ${x + 8} ${y + 4})"/>`,
    `<circle cx="${x + 6}" cy="${y + 6}" r="6" fill="${c}"/>`,
    `<path d="M${x} ${y + 14} l8 -14 l8 14z" fill="${c}"/>`,
    `<path d="M${x} ${y + 8} q6 -10 12 0 q6 10 12 0" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  ][k % 4];
  const DECOS = [
    [[14, 14], [44, 8], [26, 40], [8, 66]], [[150, 12], [176, 34], [152, 50], [184, 70]],
    [[14, 150], [40, 170], [10, 182], [52, 140]], [[160, 150], [182, 176], [146, 182], [176, 128]],
  ].map((spots, v) => spots.map(([x, y], k) => bit(x, y, k + v, COLORS[(k + v * 2) % COLORS.length])).join("") +
    `<use href="#${v % 2 ? "ch-chick" : "ch-lion"}" x="${v === 0 || v === 2 ? 118 : 10}" y="${v < 2 ? 112 : 8}" width="74" height="74"/>`);
  const slider = $(".member-slider");
  slider.addEventListener("mouseover", (e) => {
    const a = e.target.closest(".member-slider li a");
    if (!a || a.contains(e.relatedTarget)) return;
    $$(".deco.show", slider).forEach((d) => d.classList.remove("show"));
    const deco = a.querySelector(".deco");
    deco.innerHTML = DECOS[Math.floor(Math.random() * DECOS.length)];
    requestAnimationFrame(() => requestAnimationFrame(() => a.matches(":hover") && deco.classList.add("show")));
  });
  slider.addEventListener("mouseout", (e) => {
    const a = e.target.closest(".member-slider li a");
    if (a && !a.contains(e.relatedTarget)) a.querySelector(".deco").classList.remove("show");
  });
  $(".member-slider .r1").innerHTML = Array.from({ length: 8 }, (_, i) => member(i)).join("");
  $(".member-slider .r2").innerHTML = Array.from({ length: 8 }, (_, i) => member(i + 8)).join("");

  /* Column Card */
  const COL = [
    ["17", "Your column title in two lines here,<br>Why we started the character project", "Original doodles · black-and-white character sketches piled on a desk · top view"],
    ["15", "Your column title in two lines here,<br>How the brand video was made", "Interview shot · man speaking in front of a color-field poster · indoor lighting"],
    ["21", "Your column title in two lines here,<br>Animation that reaches the world", "Workroom · animator seen from behind in front of two monitors · screen glow"],
    ["13", "Your column title in two lines here,<br>My first big project", "Meeting shot · three people seated around a laptop · window backlight"],
    ["06", "Your column title in two lines here,<br>Why I chose this job", "Person shot · woman leaning on the window and smiling · daytime natural light"],
  ];
  // Page dots: the current section is 2x, two on each side are visible, the third folds in half and vanishes, as the window slides along with the section (original gap 25px · 18px at 1279px and below, .38s)
  const dotWindow = (dots, center, instant) => {
    const pitch = matchMedia("(max-width: 1279px)").matches ? 18 : 25;
    dots.forEach((dot, i) => {
      const off = i - center, a = Math.abs(off);
      const [sc, op] = a === 0 ? [2, 1] : a <= 2 ? [1, 1] : a === 3 ? [0.5, 0] : [0, 0];
      dot.style.transition = instant ? "none" : "";
      dot.style.transform = `translate(-50%, -50%) translateX(${off * pitch}px) scale(${sc})`;
      dot.style.opacity = op;
      dot.style.pointerEvents = a <= 2 ? "auto" : "none";
      dot.setAttribute("aria-current", String(a === 0));
    });
  };

  // Column card: like the original, lays out five cards in three sets and loops the middle set. On hitting an end set, it jumps back to the middle set invisibly after the slide ends
  const N = COL.length;
  const cardsBox = $(".col-cards");
  const one = COL.map(([n, t, l]) => `<li class="col-card"><a href="news.html"><div class="wf-img" data-label="${l} · Landscape 3:2"></div><div class="ttl"><b>${n}</b><span>${t}</span></div></a></li>`).join("");
  cardsBox.innerHTML = one + one + one;
  const cards = $$(".col-card");
  const dotsBox = $(".col-dots");
  dotsBox.innerHTML = cards.map((c, i) => `<li role="button" tabindex="0" aria-label="${(i % N) + 1}Nth column"></li>`).join("");
  const dots = $$(".col-dots li");

  // Original card positions by distance (PC 350/575/820, SP 180/310/430) · turn .7s cubic-bezier(.22,.61,.36,1)
  const PC = [[0, 0, 1, 1, 10], [350, 10, 0.85, 1, 5], [575, 20, 0.7, 1, 2], [820, 30, 0.55, 0, 1], [1000, 160, 0.62, 0, 0]];
  const SP = [[0, 0, 1, 1, 10], [180, 10, 0.78, 1, 5], [310, 20, 0.6, 1, 2], [430, 30, 0.5, 0, 1], [550, 40, 0.5, 0, 0]];
  const DUR = reduce ? 0 : 700;
  let center = N, busy = false;
  const render = (instant) => {
    const table = matchMedia("(max-width: 1025px)").matches ? SP : PC;
    cards.forEach((c, i) => {
      const d = i - center;
      const [x, y, sc, op, z] = table[Math.min(Math.abs(d), 4)];
      c.style.transition = instant ? "none" : `transform ${DUR}ms var(--site-ease-soft), opacity ${DUR}ms var(--site-ease-soft)`;
      c.style.transform = `translate3d(${x * (d < 0 ? -1 : 1)}px, ${y}px, 0) scale(${sc})`;
      c.style.opacity = op;
      c.style.zIndex = z;
      c.style.pointerEvents = Math.abs(d) <= 2 ? "auto" : "none";
    });
    dotWindow(dots, center, instant);
  };
  // No other presses are accepted during the .7s transition (original isAnimating)
  const go = (to) => {
    if (busy) return;
    busy = true;
    center = to;
    render(false);
    setTimeout(() => {
      if (center >= N * 2) { center -= N; render(true); }
      if (center < N) { center += N; render(true); }
      busy = false;
    }, DUR);
  };
  const goReal = (t) => {
    let d = t - (((center % N) + N) % N);
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    go(center + d);
  };
  $(".col-next").addEventListener("click", () => go(center + 1));
  $(".col-prev").addEventListener("click", () => go(center - 1));
  dots.forEach((d, i) => d.addEventListener("click", () => goReal(i % N)));
  // Auto advance every 5s — the original doesn’t restart the timer even when advanced by hand
  if (!reduce) setInterval(() => go(center + 1), 5000);
  render(true);
  addEventListener("resize", () => render(true));

  /* Radio: same Swiper 6.4.8 as the original (loop · .8s · every 4s · no dragging). The original shuffles the broadcast order on every open */
  const rWrap = $(".radio-swiper .swiper-wrapper");
  [...rWrap.children].sort(() => Math.random() - 0.5).forEach((li) => rWrap.append(li));
  const R = rWrap.children.length;
  const radio = new Swiper(".radio-swiper", {
    loop: true,
    slidesPerView: 1,
    speed: 800,
    autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
    allowTouchMove: false,
    simulateTouch: false,
    navigation: { nextEl: ".r-next", prevEl: ".r-prev" },
  });
  const rDotsBox = $(".radio-dots");
  rDotsBox.innerHTML = Array.from({ length: R * 3 }, (_, i) => `<li role="button" tabindex="0" aria-label="${(i % R) + 1}Nth broadcast"></li>`).join("");
  const rDots = $$(".radio-dots li");
  let rCenter = R + radio.realIndex, rPrev = radio.realIndex;
  rDots.forEach((d, i) => d.addEventListener("click", () => radio.slideToLoop(i % R)));
  radio.on("slideChangeTransitionStart", () => {
    let diff = radio.realIndex - rPrev;
    if (diff > R / 2) diff -= R;
    if (diff < -R / 2) diff += R;
    rCenter += diff;
    rPrev = radio.realIndex;
    dotWindow(rDots, rCenter, false);
  });
  radio.on("slideChangeTransitionEnd", () => {
    if (rCenter >= R * 2) { rCenter -= R; dotWindow(rDots, rCenter, true); }
    if (rCenter < R) { rCenter += R; dotWindow(rDots, rCenter, true); }
  });
  dotWindow(rDots, rCenter, true);

  /* QR slot: fake pattern filling the cells from the same seed (three corners are finder patterns) */
  const qr = $("#qr-cells");
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let cells = "";
  const finder = (x, y) => `<path d="M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z" fill-rule="evenodd"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
    const inFinder = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    if (!inFinder && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  qr.innerHTML = cells + finder(0, 0) + finder(22, 0) + finder(0, 22);

  /* Video Pane */
  const modal = $(".mv-modal");
  $$("[data-movie]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("on"));
    window.LTW.lenis?.stop();
  }));
  modal.querySelector("button").addEventListener("click", () => {
    modal.classList.remove("on");
    setTimeout(() => (modal.hidden = true), reduce ? 0 : 1000);
    window.LTW.lenis?.start();
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$(".history-track").forEach((t) => marquee(t, 45));
    $$(".whtg-slider .track").forEach((t, i) => marquee(t, 45, i ? -1 : 1));
    $$(".member-slider .track").forEach((t, i) => marquee(t, 55, i ? -1 : 1));
    $(".member-slider .stop").addEventListener("click", () => slider.classList.toggle("paused"));
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    $$(".history-track, .whtg-slider .track, .member-slider .track").forEach((t) => (t.style.animation = "none"));
    gsap.set(".msg-scale", { scale: 1 });
  });
})();
