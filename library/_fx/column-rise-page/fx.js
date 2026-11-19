// Five vertical strips transition — clicking a same-site link makes five background-colored strips rise from below (.38s power3.inOut) and cover, starting from the pressed strip and spreading outward with .05s delay each,
// .2s later the center badge (logo) stands up from .86 scale and transparent in .3s power2.out, then the transition proceeds. On the arriving page the badge vanishes in .18s and the strips lift away upward (.46s) from the left, each .05s later
(() => {
  const ARRIVE = "fx-column-rise-page";
  kfFx.register("column-rise-page", (el, { options, reduce }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')], mark = el.querySelector('[data-fx-part="mark"]');
    if (!cols.length || !window.gsap) return;
    const inDur = +(options.in ?? 0.38), outDur = +(options.out ?? 0.46), each = +(options.each ?? 0.05);
    let busy = false, tl = null;
    const leave = () => {
      tl = gsap.timeline({ onComplete: () => { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; } });
      if (mark) tl.to(mark, { opacity: 0, duration: reduce ? 0 : 0.18, ease: "power2.in" }, 0);
      tl.to(cols, { yPercent: -100, duration: reduce ? 0 : outDur, ease: "power3.inOut", stagger: { each, from: "start" } }, reduce ? 0 : 0.06);
    };
    const cover = (x) => new Promise((done) => {
      // Band position uses yPercent only — if CSS or a leftover y mixes in it hardens into px and the band stays off screen
      gsap.set(cols, { y: 0, yPercent: 100 });
      if (mark) gsap.set(mark, { opacity: 0, scale: 0.86 });
      el.style.visibility = "visible"; el.style.pointerEvents = "auto";
      const from = Math.min(cols.length - 1, Math.max(0, Math.floor((x / (innerWidth || 1)) * cols.length)));
      tl = gsap.timeline({ onComplete: done });
      tl.to(cols, { yPercent: 0, duration: reduce ? 0 : inDur, ease: "power3.inOut", stagger: { each, from } }, 0);
      if (mark) tl.to(mark, { opacity: 1, scale: 1, duration: reduce ? 0 : 0.3, ease: "power2.out" }, reduce ? 0 : 0.2);
    });
    const click = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.hasAttribute("download") || (a.target && a.target !== "_self") || a.closest("[data-no-wipe]")) return;
      const href = a.getAttribute("href");
      if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return;
      let url; try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      sessionStorage.setItem(ARRIVE, "1");
      cover(e.clientX).then(() => (location.href = url.href));
    };
    // As in the original, listens in the capture phase — intercepts the swipe before another handle can block it
    document.addEventListener("click", click, true);
    if (sessionStorage.getItem(ARRIVE)) {
      sessionStorage.removeItem(ARRIVE);
      gsap.set(cols, { y: 0, yPercent: 0 }); if (mark) gsap.set(mark, { opacity: 1, scale: 1 });
      el.style.visibility = "visible";
      requestAnimationFrame(leave);
    } else { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; }
    const back = (e) => { if (e.persisted) { busy = false; tl?.kill(); el.style.visibility = "hidden"; el.style.pointerEvents = "none"; } };
    addEventListener("pageshow", back);
    return () => { document.removeEventListener("click", click, true); removeEventListener("pageshow", back); tl?.kill(); el.style.visibility = ""; el.style.pointerEvents = ""; gsap.set([...cols, mark].filter(Boolean), { clearProps: "all" }); };
  });
})();
