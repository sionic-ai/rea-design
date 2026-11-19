(() => {
  // Clicking a same-site link makes a contrast-color curtain rise from below to cover the page (the inner panel descends the opposite way and stands in place), and five vertical slivers above the logo at the curtain center
  // Grows from the top at 60ms stagger and repeats the stem while waiting. When a new page arrives the pieces fold in place at 30ms stagger, the logo turns off, then the curtain slides up
  const ARRIVE = "fx-slice-mark-page";
  kfFx.register("slice-mark-page", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.6);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const hold = reduce ? 0 : +(options.hold ?? 0.4);
    const fold = reduce ? 0 : +(options.fold ?? 0.25);
    const each = +(options.each ?? 0.03);
    const fade = reduce ? 0 : +(options.fade ?? 0.3);
    const count = Number(options.slices) || 5;

    const inner = document.createElement("div");
    inner.className = "fx-smp-inner";
    const mark = el.querySelector('[data-fx-part="mark"]');
    if (mark) inner.append(mark);
    const grid = document.createElement("div");
    grid.className = "fx-smp-slices";
    grid.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
    const slices = Array.from({ length: count }, (_, i) => {
      const s = document.createElement("i");
      s.className = "fx-smp-slice";
      s.style.setProperty("--fx-i", i);
      grid.append(s);
      return s;
    });
    inner.append(grid);
    el.append(inner);

    let tl = null, busy = false;
    const hide = () => { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; };
    const show = () => { el.style.visibility = "visible"; el.style.pointerEvents = "auto"; };
    const run = (on) => slices.forEach((s) => { s.style.transition = ""; s.style.transform = ""; s.style.animation = ""; s.style.animationPlayState = on ? "running" : "paused"; });
    const collapse = () => {
      slices.forEach((s) => {
        const m = new DOMMatrixReadOnly(getComputedStyle(s).transform).m22;
        s.style.animation = "none";
        s.style.transform = `scaleY(${m})`;
      });
      void grid.offsetHeight;
      slices.forEach((s, i) => { s.style.transition = `transform ${fold}s cubic-bezier(0.33, 1, 0.68, 1) ${each * i}s`; s.style.transform = "scaleY(0)"; });
      tl = gsap.timeline({ onComplete: hide });
      tl.to(inner, { opacity: 0, duration: fade, ease: "power2.out" }).to(el, { yPercent: -100, duration: dur, ease }, ">");
    };
    const cover = () => new Promise((done) => {
      gsap.set(el, { y: 0, yPercent: 100 });
      gsap.set(inner, { yPercent: -100, opacity: 1 });
      run(false);
      show();
      tl = gsap.timeline();
      tl.to(el, { yPercent: 0, duration: dur, ease, onComplete: done }).to(inner, { yPercent: 0, duration: dur, ease }, "<").call(() => run(true), [], dur > 0.3 ? `-=${0.3}` : ">");
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
      cover().then(() => { sessionStorage.setItem(ARRIVE, String(Date.now())); location.href = url.href; });
    };
    document.addEventListener("click", click, true);

    const came = sessionStorage.getItem(ARRIVE);
    if (came) {
      sessionStorage.removeItem(ARRIVE);
      gsap.set(el, { y: 0, yPercent: 0 });
      gsap.set(inner, { yPercent: 0, opacity: 1 });
      run(true);
      show();
      const go = () => setTimeout(collapse, Math.max(0, hold * 1000 - (Date.now() - Number(came))));
      if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
    } else hide();
    const back = (e) => { if (e.persisted) { busy = false; tl?.kill(); hide(); } };
    addEventListener("pageshow", back);
    return () => {
      document.removeEventListener("click", click, true);
      removeEventListener("pageshow", back);
      tl?.kill();
      if (mark) el.append(mark);
      inner.remove();
      gsap.set(el, { clearProps: "transform" });
      el.style.visibility = ""; el.style.pointerEvents = "";
    };
  });
})();
