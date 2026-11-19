// Timetable of the original home1018.js — the loader part fires fx:done (body.load) at 1.9s, relative to window load: 2.9s caption cell shrinks · 3.4s bottom header · photo panel on PC 3.5s (5ms tick 700) · on phone immediately
(() => {
  const body = document.body;
  const key = document.querySelector(".kg-key");
  const content = document.querySelector(".kg-content");
  const mm = gsap.matchMedia();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  const startKey = () => {
    if (key.classList.contains("is-start")) return;
    key.classList.add("is-start");
    key.dispatchEvent(new CustomEvent("fx:play"));
  };
  document.addEventListener("fx:done", (e) => { if (e.target.closest?.(".kg-loading")) body.classList.add("is-load"); });

  // A condition group fires if any one matches, so always include an all that always matches
  mm.add({ all: "all", reduce: "(prefers-reduced-motion: reduce)", phone: "(max-width: 768px)" }, ({ conditions }) => {
    const timers = [];
    if (conditions.reduce) {
      body.classList.add("is-load", "is-copy", "is-ui");
      startKey();
      return;
    }
    const run = () => {
      timers.push(setTimeout(() => body.classList.add("is-copy"), 2900));
      timers.push(setTimeout(() => body.classList.add("is-ui"), 3400));
      timers.push(setTimeout(startKey, conditions.phone ? 0 : 3500));
    };
    if (document.readyState === "complete") run(); else addEventListener("load", run, { once: true });
    return () => { timers.forEach(clearTimeout); removeEventListener("load", run); };
  });

  // Past 50px the lower header hides (the photo plate unfolds at the same threshold via frame-bleed-snap), and past the body header the upper header turns on
  const onScroll = () => {
    const y = scrollY;
    body.classList.toggle("is-move", y > 50);
    body.classList.toggle("is-start", y > content.getBoundingClientRect().top + y);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // News row — original jos: set up six cards five times and move the row’s left by one slot (card + gap) in .6s. After the end, back to the start at 0s after .6s, then .6s again after .7s
  const track = document.querySelector(".kg-jos__in");
  const jos = document.querySelector(".kg-jos");
  const base = [...track.children];
  const N = base.length;
  for (let k = 0; k < 4; k++) base.forEach((c) => { const n = c.cloneNode(true); n.setAttribute("aria-hidden", "true"); n.querySelector("a").tabIndex = -1; track.append(n); });
  let pitch = 0, count = 1, tick = 0;
  const size = () => {
    const phone = innerWidth <= 768;
    const w = phone ? 238 : 286, h = phone ? 294 : 403, gap = phone ? 20 : 36;
    pitch = w + gap;
    jos.style.height = h + "px";
    track.style.width = pitch * N * 5 + "px";
    track.style.marginLeft = -pitch * N + "px";
    track.style.left = "0px";
    count = 1;
    [...track.children].forEach((c) => { c.style.width = pitch + "px"; c.style.height = h + "px"; c.style.marginRight = gap + "px"; });
  };
  size();
  addEventListener("resize", size);
  const move = (x) => { track.style.left = x + "px"; };
  const next = () => {
    count++;
    move(-(pitch * count - pitch));
    if (count > N) {
      count = 1;
      setTimeout(() => { track.style.transition = "0s"; move(0); }, 600);
      setTimeout(() => { track.style.transition = ""; }, 700);
    }
  };
  const prev = () => {
    const wrap = count <= 0;
    count--;
    move((pitch * count - pitch) * -1);
    if (wrap) {
      count = N - 1;
      setTimeout(() => { track.style.transition = "0s"; move((pitch * N - pitch - pitch) * -1); }, 600);
      setTimeout(() => { track.style.transition = ""; }, 700);
    }
  };
  document.querySelector(".kg-round.is-right").addEventListener("click", () => { if (count < N) tick = 0; next(); });
  document.querySelector(".kg-round.is-left").addEventListener("click", () => { tick = 0; prev(); });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => { if (tick <= 60) tick++; if (tick === 61) { tick = 0; next(); } }, 100);
  }
})();
