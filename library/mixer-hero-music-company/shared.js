(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Intro curtain — the original raises the logo at 1.8s after ready (fonts, WebGL), turns on text 2s later and lifts at 3.5s, but that readiness finishes 1.3s ahead of load
  // On the real screen it is .5s·.7s·2.2s after load (motion-probe: exit 1650 · enter 500 · total 3516ms). The copy uses those times relative to load.
  // Pages arriving through a door (door-wipe-page) show no curtain — the original also has no entry curtain for in-app navigation
  const ent = document.querySelector(".us-entrance");
  if (ent) {
    let viaDoor = false;
    try { viaDoor = sessionStorage.getItem("fx-door-wipe") === "1"; } catch {}
    if (viaDoor || reduce) ent.classList.add("is-gone");
    else {
      const logo = ent.querySelector(".us-entrance__logo");
      if (logo) ent.style.setProperty("--us-center", `${innerHeight / 2 - logo.getBoundingClientRect().top - logo.offsetHeight / 2}px`);
      const leave = () => { ent.classList.add("is-leave"); setTimeout(() => ent.classList.add("is-gone"), 1000); };
      const run = () => {
        if (ent.dataset.mode === "top") {
          ent.classList.add("is-contents");
          setTimeout(() => ent.classList.add("is-placed"), 500);
          setTimeout(leave, 2200);
        } else setTimeout(leave, 350);
      };
      if (document.readyState === "complete") run();
      else addEventListener("load", run, { once: true });
    }
  }

  // The original turns on isShown1 and isShown2 once per section with an IntersectionObserver (rootMargin −N% at the bottom) — data-show="N" At the N% line it becomes is-shown, and 15% further up it becomes is-shown2
  document.querySelectorAll("[data-show]").forEach((el) => {
    const n = +el.dataset.show || 0;
    const watch = (margin, cls) => {
      if (reduce) return el.classList.add(cls);
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
        el.classList.add(cls);
        io.disconnect();
      }, { rootMargin: `0% 0% -${Math.min(95, margin)}% 0%` });
      io.observe(el);
    };
    watch(n, "is-shown");
    watch(n + 15, "is-shown2");
  });

  // Phone and tablet menu — covers from the left like a door (1s cubic-bezier(1,0,.175,1)) and folds away to the right when closing
  const menu = document.querySelector(".us-menu");
  const burger = document.querySelector(".us-burger");
  let shutTimer = 0;
  const openMenu = () => {
    clearTimeout(shutTimer);
    menu.classList.remove("is-closing");
    menu.classList.add("is-open");
    burger?.setAttribute("aria-expanded", "true");
  };
  const closeMenu = () => {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.classList.add("is-closing");
    burger?.setAttribute("aria-expanded", "false");
    shutTimer = setTimeout(() => menu.classList.remove("is-closing"), reduce ? 0 : 1000);
  };
  burger?.addEventListener("click", openMenu);
  menu?.querySelector(".us-menu__close")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // Sound button (original .sound) — while off, the equalizer bars blink every .25s, and when on, they bounce every .3s. No sound file is included —
  // Like the original, after turning on, wait while receiving sound (about 3.5s) then us:sound { playing } Send
  const sound = document.querySelector(".us-sound");
  const knob = sound?.querySelector(".us-sound__button");
  const bars = [...(sound?.querySelectorAll(".us-sound__eq span") || [])];
  let eqTimer = 0, playWait = 0;
  const blink = () => bars.forEach((b) => { b.style.transform = ""; b.style.opacity = Math.random() < 0.5 ? "0.25" : "1"; });
  const jump = () => bars.forEach((b) => { b.style.opacity = ""; b.style.transform = `scaleY(${1 + Math.random() * 5})`; });
  const runEq = (on) => { clearInterval(eqTimer); if (reduce) return; (on ? jump : blink)(); eqTimer = setInterval(on ? jump : blink, on ? 300 : 250); };
  runEq(false);
  const toggleSound = () => {
    const on = sound.classList.toggle("is-muted") === false;
    knob.setAttribute("aria-checked", String(on));
    runEq(on);
    clearTimeout(playWait);
    document.dispatchEvent(new CustomEvent("us:sound", { detail: { on, playing: false } }));
    if (on) playWait = setTimeout(() => document.dispatchEvent(new CustomEvent("us:sound", { detail: { on, playing: true } })), 3500);
  };
  // In the original, WebGL hogs the main thread on the first page so a mouse press paints about 50ms late (motion-probe first page 148ms · sub-pages 89~102ms · phone touch 6ms)
  // — Delay by that amount only on wide screens that have a sound panel
  const busy = !!document.querySelector("[data-fx~=\"sound-line-tunnel\"]");
  const later = () => (busy && innerWidth > 767 ? setTimeout(toggleSound, 45) : toggleSound());
  knob?.addEventListener("click", later);
  knob?.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleSound()));

  // Back to top — appears in .1s after scrolling more than one screen
  const toTop = document.querySelector(".us-totop");
  const showTop = () => toTop?.classList.toggle("is-show", scrollY > innerHeight);
  addEventListener("scroll", showTop, { passive: true });
  showTop();
  toTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  root.classList.add("is-ready");
})();
