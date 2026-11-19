(() => {
  // Hero intro — original timeline: 0 show → .7s wave band drawing (2s expo) → .5s later logo outline drawing → .1s later the outline switches off (.4s) and
  // The filled logo and vertical text (1s) and three shapes (2s expo, opacity .5s · .1 · .15 delayed) rise together → 1s later the Scroll indicator
  const mv = document.querySelector(".cd-mv");
  const intro = () => {
    if (!mv) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { mv.classList.add("is-up"); mv.querySelector(".cd-mv__scroll")?.classList.add("is-start"); document.documentElement.classList.add("is-load"); return; }
    gsap.timeline()
      .add(() => { mv.classList.add("is-intro"); document.documentElement.classList.add("is-load"); })
      .set(mv, { "--wave": 0 }, "+=0.7")
      .set(mv, { "--dash": 0 }, "+=0.5")
      .set(mv, { "--base-o": 0 }, "+=0.1")
      .set(mv, { "--fill-o": 1 })
      .add(() => mv.classList.add("is-up"))
      .add(() => mv.querySelector(".cd-mv__scroll")?.classList.add("is-start"), "+=1");
  };
  if (document.readyState === "complete") intro(); else addEventListener("load", intro, { once: true });

  // Group intro photos — every 7 seconds the next one turns on in 1.2s, drifts 40px sideways for 7s, and starts turning off at 5.6s (80% of 7s)
  const shots = [...document.querySelectorAll(".cd-ub__images .wf-img")];
  if (shots.length) {
    const period = 7000;
    let n = -1, t0 = 0;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const next = () => {
      n = (n + 1) % shots.length;
      const cur = shots[n], prev = shots[(n - 1 + shots.length) % shots.length];
      prev.classList.remove("is-active");
      cur.classList.add("is-active");
      wait(period * 0.8).then(() => cur.classList.add("is-hide"));
      wait(1000).then(() => prev.classList.remove("is-hide"));
    };
    const tick = (now) => {
      if (!t0) t0 = now;
      if (now - t0 >= period) { t0 = now; next(); }
      requestAnimationFrame(tick);
    };
    wait(1).then(next);
    requestAnimationFrame(tick);
  }

  // Question — height to auto in .3s (curve 0.22,0.61,0.36,1), and the answer text turns on in .2s, starting .1s before it is fully open. On close the height goes to 0 in .3s.
  gsap.registerPlugin(CustomEase);
  const ease = CustomEase.create("cdFaq", "0.22,0.61,0.36,1");
  document.querySelectorAll(".cd-faq__q").forEach((q, i) => {
    const a = q.nextElementSibling, item = q.parentElement;
    q.setAttribute("aria-expanded", "false");
    q.setAttribute("aria-controls", `cd-faq-a-${i}`);
    a.id = `cd-faq-a-${i}`;
    a.hidden = true;
    q.addEventListener("click", () => {
      if (item.classList.contains("is-active")) {
        item.classList.remove("is-active");
        q.setAttribute("aria-expanded", "false");
        gsap.timeline().to(a, { height: 0, duration: 0.3, ease }).add(() => { a.hidden = true; });
      } else {
        a.hidden = false;
        q.setAttribute("aria-expanded", "true");
        gsap.timeline().to(a, { height: "auto", duration: 0.3, ease }).add(() => item.classList.add("is-active"), "-=0.1");
      }
    });
  });
  document.querySelector(".cd-faq [data-more]")?.addEventListener("click", (e) => {
    document.querySelector(".cd-faq")?.classList.add("is-more");
    e.currentTarget.remove();
  });

  // Option tooltip — on touch devices a tap opens it (closing others) and a swipe or outside tap closes it. Mouse uses hover (CSS), keyboard uses focus
  const opts = [...document.querySelectorAll(".cd-option__item")];
  const touch = matchMedia("(hover: none)").matches;
  opts.forEach((b) => {
    if (touch) b.addEventListener("click", () => { opts.forEach((o) => o !== b && o.classList.remove("is-active")); b.classList.toggle("is-active"); });
    else { b.addEventListener("focus", () => b.classList.add("is-active")); b.addEventListener("blur", () => b.classList.remove("is-active")); }
  });
  if (touch) document.addEventListener("touchstart", (e) => { if (!e.target.closest(".cd-option__items")) opts.forEach((o) => o.classList.remove("is-active")); }, { passive: true });

  // Contact tabs — only the chosen tab is bold (.15s) and the panel switches. The two header buttons pick the matching tab and scroll down
  const tabs = [...document.querySelectorAll(".cd-tab__btn")];
  const pick = (t) => tabs.forEach((x) => {
    const on = x === t;
    x.setAttribute("aria-selected", on ? "true" : "false");
    x.classList.toggle("is-active", on);
    x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
  });
  tabs.forEach((t) => t.addEventListener("click", () => pick(t)));
  document.querySelectorAll("[data-form]").forEach((b) => b.addEventListener("click", () => {
    const t = document.getElementById(`tab-${b.dataset.form}`);
    if (t) pick(t);
  }));
})();
