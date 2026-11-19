// Barba body ([data-barba="container"]) only is swapped and passed on — things that stay in the wrapper, like the header line·menu, remain as they are and the document is not reread.
// Defaults use the original values of the reference site: body and [data-fx-part=fade] fades out in 0.4s power2.inOut, waits 0.4s to swap, then
// Brings the new body in from the top over 0.5s power2.out. Page scripts receive fx:page-leave · fx:page-enter, clear the previous body’s effects and attach them again to the new body.
(() => {
  let owner = null;
  kfFx.register("page-swap-fade", (el, { options, reduce }) => {
    const box = el.querySelector('[data-barba="container"]');
    // Barba runs only once per document — the second wrapper hooks nothing
    if (!box || owner) return;
    owner = el;
    const out = reduce ? 0 : +(options.out ?? 0.4), hold = reduce ? 0 : +(options.wait ?? 0.4), dur = reduce ? 0 : +(options.in ?? 0.5), lagS = reduce ? 0 : +(options.lag ?? 0), inLag = reduce ? 0 : +(options["in-delay"] ?? 0);
    const parts = () => [...el.querySelectorAll('[data-fx-part="fade"]')].filter((p) => !p.closest('[data-barba="container"]'));
    const outEase = kfFx.ease(options["out-ease"] || "power2.inOut", "power2.inOut"), inEase = kfFx.ease(options["in-ease"] || "power2.out", "power2.out");
    // The body fades out, pushing up and blurring (out-y·out-blur), or rises in from below (in-y). Position and blur run on a different duration and curve from opacity (Studio @barba/css)
    const n0 = (k) => (reduce ? 0 : +(options[k] ?? 0));
    const outY = n0("out-y"), outBlur = n0("out-blur"), inY = n0("in-y"), inBlur = n0("in-blur"), inFadeLag = n0("in-fade-delay");
    const outMove = reduce ? 0 : +(options["out-move"] ?? out), inMove = reduce ? 0 : +(options["in-move"] ?? dur);
    const outMoveEase = kfFx.ease(options["out-move-ease"] || options["out-ease"] || "power2.inOut", "power2.inOut");
    const inMoveEase = kfFx.ease(options["in-move-ease"] || options["in-ease"] || "power2.out", "power2.out");
    const fadeOut = (b) => {
      gsap.to([b, ...parts()], { opacity: 0, duration: out, ease: outEase });
      if (outY || outBlur) gsap.to(b, { y: outY, filter: `blur(${outBlur}px)`, duration: outMove, ease: outMoveEase });
    };
    // in-delay — after the original inserts new body it leaves it empty briefly (Brand .3s) before bringing it in
    const fadeIn = (b) => {
      gsap.fromTo([b, ...parts()], { opacity: 0 }, { opacity: 1, duration: dur, delay: inLag + inFadeLag, ease: inEase });
      if (inY) gsap.fromTo(b, { y: inY }, { y: 0, duration: inMove, delay: inLag, ease: inMoveEase, clearProps: "transform" });
      // in-blur — when the new body comes in focusing out of blur (Name 4px), the filter is removed once fully focused so fixed children aren’t trapped in the body box
      if (inBlur) gsap.fromTo(b, { filter: `blur(${inBlur}px)` }, { filter: "blur(0px)", duration: inMove, delay: inLag, ease: inMoveEase, clearProps: "filter" });
    };
    // loader — after leaving, a waiting indicator appears each time that second passes (Brand 1s · .8s power3.out, 16px below → in place, 16px up when hiding)
    const loaderEvery = reduce ? 0 : +(options.loader ?? 0);
    const loaderEl = () => [...el.querySelectorAll('[data-fx-part="loader"]')].find((p) => !p.closest('[data-barba="container"]'));
    let loaderTimer = 0;
    const loader = (on) => {
      clearInterval(loaderTimer);
      const l = loaderEl();
      if (!l || !loaderEvery) return;
      if (on) loaderTimer = setInterval(() => gsap.to(l, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }), loaderEvery * 1000);
      else if (gsap.getProperty(l, "opacity") > 0) gsap.to(l, { autoAlpha: 0, y: -16, duration: 0.8, ease: "power3.out", onComplete: () => gsap.set(l, { y: 16 }) });
    };
    if (loaderEvery && loaderEl()) gsap.set(loaderEl(), { autoAlpha: 0, y: 16 });
    const emit = (type, container) => document.dispatchEvent(new CustomEvent(`fx:page-${type}`, { detail: { container, namespace: container?.dataset.barbaNamespace || "" } }));
    const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
    // Barba swaps only the body — css found only on the next page is attached to the head and brought in after all is received, and unused ones are removed
    const sheets = (html) => {
      const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
      const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
      have.forEach((l) => want.includes(l.href) || l.remove());
      return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
        const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
        l.onload = l.onerror = res;
        document.head.append(l);
      })));
    };
    // The page-transition library fetches the next page and can’t run on file:// — in that case it exits with the same values and then navigates normally
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        transitions: [{
          sync: false,
          async leave({ current }) {
            // lag — if the original only starts leaving after receiving the next section, like a sync transition, delay by that many seconds
            if (lagS) await wait(lagS);
            emit("leave", current.container);
            loader(true);
            fadeOut(current.container);
            await wait(hold);
          },
          async beforeEnter({ next }) {
            gsap.set(next.container, { opacity: 0, y: inY });
            await sheets(next.html);
            scrollTo(0, 0);
          },
          enter({ next }) {
            emit("enter", next.container);
            loader(false);
            fadeIn(next.container);
          },
        }],
      });
      return () => { clearInterval(loaderTimer); barba.destroy(); owner = null; };
    }
    const ac = new AbortController();
    el.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href.split("#")[0] === location.href.split("#")[0]) return;
      e.preventDefault();
      emit("leave", box);
      loader(true);
      fadeOut(box);
      setTimeout(() => (location.href = a.href), Math.max(out, hold) * 1000);
    }, { signal: ac.signal });
    addEventListener("pageshow", (e) => e.persisted && gsap.set([box, ...parts()], { opacity: 1 }), { signal: ac.signal });
    return () => { clearInterval(loaderTimer); ac.abort(); owner = null; };
  });
})();
