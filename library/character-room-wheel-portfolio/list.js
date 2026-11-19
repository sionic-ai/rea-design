// Case list: flip one at a time by wheel, swipe, or the list at bottom right. ?case=If entering via contact, start from that section.
// Original values: wheel |deltaY| ≥ 30 · touch 30px · 700ms lock after a turn · first appearance .5s power2.out.
(() => {
  MS.view("case", (container) => {
    const root = container.matches(".cases") ? container : container.querySelector(".cases");
    if (!root) return null;
    const bgs = new Map([...root.querySelectorAll("[data-background]")].map((b) => [b.dataset.background, b]));
    const stages = [...root.querySelectorAll("[data-list]")].map((m) => MS.stage.make(m, bgs.get(m.dataset.list)));
    if (stages.length < 2) return null;
    const navs = [...root.querySelectorAll("[data-nav]")].map((b) => ({ button: b, target: stages.findIndex((s) => s.main.dataset.list === b.dataset.nav) })).filter((n) => n.target >= 0);
    const cursor = MS.stalker(root.querySelector("[data-stalker]"), [...root.querySelectorAll("a.ms-stage__item")]);

    const fromQuery = (search) => {
      const id = new URLSearchParams(search).get("case");
      return stages.findIndex((s) => s.main.id === id);
    };
    let cur = Math.max(fromQuery(location.search), 0);
    let tl = null;
    let last = 0;
    let width = innerWidth;
    let resizeT = null;
    let gone = false;
    let held = null;

    const relayout = () => stages.forEach((s, i) => MS.stage.layout(s, i === cur));
    const paintNav = () => navs.forEach((n) => {
      const on = n.target === cur;
      n.button.classList.toggle("is-current", on);
      n.button.setAttribute("aria-current", on ? "true" : "false");
    });
    const quietOthers = (a, b) => stages.forEach((s, i) => {
      if (i === a || i === b) return;
      MS.stage.stop(s);
      gsap.set(s.bgInners, { yPercent: 100 });
    });
    const ready = () => performance.now() - last >= 700;
    const go = (i) => {
      if (i < 0 || i >= stages.length || i === cur) return false;
      if (tl) tl.kill();
      quietOthers(cur, i);
      if (cursor) cursor.hide();
      tl = gsap.timeline();
      tl.add(MS.stage.leave(stages[cur]), 0);
      tl.add(MS.stage.enter(stages[i]), 0);
      cur = i;
      requestAnimationFrame(paintNav);
      return true;
    };
    const tryGo = (i) => { if (ready() && go(i)) last = performance.now(); };
    const step = (d) => tryGo(cur + d);

    const onWheel = (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 30) return;
      step(e.deltaY > 0 ? 1 : -1);
    };
    let tx = 0, ty = 0;
    const onTouchStart = (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const { clientX: x, clientY: y } = e.touches[0];
      const dy = ty - y;
      if (Math.abs(dy) < Math.abs(tx - x) || Math.abs(dy) < 30 || !ready()) return;
      tx = x; ty = y;
      step(dy > 0 ? 1 : -1);
    };
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") step(1);
      if (e.key === "ArrowUp" || e.key === "PageUp") step(-1);
    };
    const onNav = (e) => { const n = navs.find((x) => x.button === e.currentTarget); if (n) tryGo(n.target); };
    // Like Contact in the menu, a same-page ?case= Links change the page without the transition curtain — mark the clicked link so barba doesn’t intercept it (as in the original)
    const onLink = (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      const u = new URL(a.href, location.href);
      if (u.pathname !== location.pathname) return;
      const i = fromQuery(u.search);
      if (i < 0) return;
      e.preventDefault();
      a.setAttribute("data-barba-prevent", "");
      held = a;
      history.replaceState(history.state, "", u.href);
      tryGo(i);
    };
    const onResize = () => {
      if (innerWidth === width) return;
      width = innerWidth;
      clearTimeout(resizeT);
      resizeT = setTimeout(relayout, 200);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("resize", onResize);
    document.addEventListener("click", onLink, true);
    navs.forEach((n) => n.button.addEventListener("click", onNav));

    paintNav();
    stages.forEach(MS.stage.prime);
    MS.fontsReady().then(() => {
      if (gone) return;
      relayout();
      gsap.to(root, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
      tl = MS.stage.enter(stages[cur]);
      if (MS.reduced) tl.progress(1);
    });

    return () => {
      gone = true;
      if (cursor) cursor.destroy();
      clearTimeout(resizeT);
      if (tl) tl.kill();
      stages.forEach(MS.stage.kill);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      removeEventListener("keydown", onKey);
      removeEventListener("resize", onResize);
      document.removeEventListener("click", onLink, true);
      if (held) held.removeAttribute("data-barba-prevent");
      navs.forEach((n) => n.button.removeEventListener("click", onNav));
    };
  });
})();
