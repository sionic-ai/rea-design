/* Shared by all pages: tempo · curves · helpers, waveform bars, smooth wheel, line-by-line reveal, cookie bar, entrance. 
   Page scripts (index.js·service.js·page.js) load after this file and use the names here as is. */
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, CustomEase, CustomBounce);

// The original measures every length in tempo of one song — change just one BPM and the rhythm of the whole page changes together
const BPM = 142;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const EIGHTH = BEAT / 2;
const SIXTEENTH = BEAT / 4;
const beats = (n) => n * BEAT;

CustomEase.create("wf.out", "M0,0 C0.16,1 0.3,1 1,1");
CustomEase.create("wf.inOut", "M0,0 C0.65,0 0.15,1 1,1");
CustomEase.create("wf.snap", "M0,0 C0.55,0 0.1,1 1,1");
CustomEase.create("wf.release", "M0,0 C0.1,0.6 0.3,0.9 1,1");
CustomBounce.create("wf.land", { strength: 0.35, squash: 2 });
const EASE = { out: "wf.out", inOut: "wf.inOut", snap: "wf.snap", release: "wf.release", land: "wf.land" };
gsap.defaults({ ease: EASE.out, duration: beats(1.5) });
ScrollTrigger.config({ ignoreMobileResize: true });

const MEDIA = { desktop: "(min-width: 992px)", mobile: "(max-width: 991.98px)", reduce: "(prefers-reduced-motion: reduce)" };
const reducedNow = () => matchMedia(MEDIA.reduce).matches;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const cssPx = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
const chrome = () => cssPx("--head-h") + cssPx("--strip-h");
const docTop = (el) => el.getBoundingClientRect().top + scrollY;
const pad = (n, d) => String(Math.max(0, Math.floor(n))).padStart(d, "0");
const seeded = (seed) => {
  let t = seed >>> 0;
  return () => {
    t = (Math.imul(t, 1103515245) + 12345) >>> 0;
    return ((t >>> 8) & 0xffff) / 0x10000;
  };
};

/* ---------- Waveform: the same seed gives the same shape, so two tracks look like the same song ---------- */
function waveValues(seed, n, min = 0.18) {
  const rnd = seeded(seed * 7919 + 13);
  const raw = Array.from({ length: n }, () => rnd());
  return raw.map((v, i) => {
    const near = ((raw[i - 1] ?? v) + 2 * v + (raw[i + 1] ?? v)) / 4;
    return min + (1 - min) * (0.4 * v + 0.6 * near);
  });
}
function fillBars(root) {
  $$(".bars[data-n]", root).forEach((el) => {
    const n = +el.dataset.n;
    const seed = +el.dataset.seed || 1;
    let vals = waveValues(seed, n, +(el.dataset.min || 0.18));
    if (el.dataset.alt) {
      const [a, b] = el.dataset.alt.split("-").map(Number);
      const alt = waveValues(seed + 26, n, 0.3);
      vals = vals.map((v, i) => (i >= a && i < b ? alt[i] : v));
    }
    el.innerHTML = vals.map((v) => `<i style="--h:${v.toFixed(3)}"></i>`).join("");
  });
}
fillBars(document);

/* ---------- Smooth wheel ---------- */
// Same Lenis 1.3.26 (lerp .1) as the original, driven by the gsap clock. Damping is multiplied into each wheel notch’s amount, slowing it to .6 in the version-step pinned range.
// Uses the window scroll as is, so CSS sticky doesn’t break
const smooth = (() => {
  if (reducedNow()) return null;
  let damping = 1;
  const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, virtualScroll: (e) => ((e.deltaY *= damping), true) });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  const inOut = gsap.parseEase(EASE.inOut);
  return {
    lenis,
    to: (y, duration) => lenis.scrollTo(y, { duration, easing: (p) => inOut(p) }),
    setDamping: (v) => (damping = v),
  };
})();
const scrollToY = (y, duration = beats(3)) => (smooth ? smooth.to(y, duration) : scrollTo(0, y));

document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest?.('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  const el = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
  if (el) scrollToY(Math.max(0, docTop(el) - chrome()));
});


function revealLines(el, trigger, start = "top 78%", scrub = false, delay = 0) {
  if (!el) return;
  SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: beats(1.5),
        ease: EASE.out,
        stagger: EIGHTH,
        delay,
        scrollTrigger: scrub ? { trigger: el, start, end: "center center", scrub: true, once: true } : { trigger, start, toggleActions: "play none none none" },
      }),
  });
}


/* ---------- Cookie bar ---------- */
// Like the original, it rises from below half a tempo after entering. Choosing lowers it and the bottom chrome settles into place.
// ”Cookie settings” re-shows the bar without reloading the page — only then a ”Close” is attached, and Close doesn’t erase the chosen value
const COOKIE_KEY = "sd-cookie";
let cookieBar = null;
const openCookie = (fromSettings) => {
  if (cookieBar) return;
  const bar = (cookieBar = document.createElement("aside"));
  bar.className = "cookie";
  bar.setAttribute("aria-label", "Cookie Notice");
  bar.innerHTML = `<p><b>Cookie</b>Your cookie notice goes here in one line. <a class="cookie-link" href="page.html">Privacy policy</a></p>
    <div class="cookie-btns">${fromSettings ? '<button type="button" class="cookie-close" data-cookie-close>Close</button>' : ""}<button type="button" data-cookie="reject">Reject all</button><button type="button" data-cookie="accept">Allow all</button></div>`;
  document.body.append(bar);
  document.documentElement.classList.add("has-cookie");
  if (fromSettings) requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add("is-in")));
  else setTimeout(() => bar.classList.add("is-in"), reducedNow() ? 0 : beats(0.5) * 1000);
  const close = () => {
    cookieBar = null;
    bar.classList.remove("is-in");
    document.documentElement.classList.remove("has-cookie");
    ScrollTrigger.refresh();
    setTimeout(() => bar.remove(), 500);
  };
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cookie]");
    if (b) localStorage.setItem(COOKIE_KEY, b.dataset.cookie);
    if (b || e.target.closest("[data-cookie-close]")) close();
  });
};
if (!localStorage.getItem(COOKIE_KEY)) openCookie(false);
addEventListener("click", (e) => {
  if (e.target.closest("[data-cookie-settings]")) openCookie(true);
});

/* ---------- Header ticker clock ---------- */
const clocks = $$("[data-clock]");
if (clocks.length) {
  const tickClock = () => {
    const d = new Date();
    clocks.forEach((el) => (el.textContent = `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`));
  };
  tickClock();
  setInterval(tickClock, 15000);
}

/* ---------- On Enter ---------- */
// The original has no loader: the hero title appears half faded, sharpens within one beat, and the description follows
document.documentElement.classList.add("is-entering");
document.fonts.ready.then(() => {
  const els = $$("[data-enter]");
  document.documentElement.classList.remove("is-entering");
  if (reducedNow() || !els.length) return;
  gsap.fromTo(els, { opacity: (i, el) => (el.dataset.enter === "soft" ? 0.45 : 0) }, { opacity: 1, duration: beats(1), ease: EASE.out, stagger: EIGHTH });
});
