(() => {
  // Original #cursor-tooltip: an 11px dot beside the cursor (24px) follows without delay (.55 transparent), growing into a muttering pill that fits whatever is pointed at.
  // Picking waits 150ms, then if nothing is pointed at and it stays idle for 9 seconds, a mutter appears. On the first visit it greets from the bottom center of the screen and slides to the cursor on the first move.
  const read = (s) => String(s || "").split("|").map((t) => t.trim()).filter(Boolean);
  const pick = (arr, not) => { const pool = arr.length > 1 ? arr.filter((t) => t !== not) : arr; return pool[Math.floor(Math.random() * pool.length)] || ""; };
  kfFx.register("cursor-quip", (el, { options, hover }) => {
    if (!hover || innerWidth < +(options.min ?? 768)) return;
    const OFFSET = +(options.offset ?? 24), MARGIN = 10, INTENT = +(options.intent ?? 150), IDLE = +(options.idle ?? 9000);
    const linkText = options.link || "Browse", buttonText = options.button || "Try Pressing";
    const idleLines = read(options.idleText || "Still there?"), hello = read(options.hello || "");
    const skip = "input, textarea, select, [contenteditable]";
    const tip = document.createElement("div");
    tip.className = "fx-quip";
    tip.setAttribute("aria-hidden", "true");
    tip.dataset.mode = "rest";
    (el === document.body ? document.body : el).appendChild(tip);
    let x = -999, y = -999, w = 11, h = 11, shown = false, target = null, last = "", tick = false;
    let hoverT = 0, idleT = 0, idleUsed = false, greeting = false, greetT = 0, scrollArmed = false, freed = false;
    const measure = () => { w = tip.offsetWidth; h = tip.offsetHeight; };
    const place = () => {
      let px = x + OFFSET, py = y + OFFSET;
      if (px + w > innerWidth - MARGIN) px = x - w - OFFSET;
      if (py + h > innerHeight - MARGIN) py = y - h - OFFSET;
      tip.style.transform = `translate3d(${Math.max(MARGIN, px)}px, ${Math.max(MARGIN, py)}px, 0)`;
    };
    const show = (text, key) => {
      if (text !== last) { tip.textContent = text; last = text; }
      tip.dataset.key = key || "";
      tip.dataset.mode = text ? "talk" : "rest";
      if (!shown) { shown = true; tip.style.opacity = ""; }
      requestAnimationFrame(() => { measure(); place(); });
    };
    const rest = () => show("", "");
    const hide = () => { tip.style.opacity = "0"; shown = false; target = null; clearTimeout(idleT); clearTimeout(hoverT); };
    const armIdle = () => {
      clearTimeout(idleT);
      if (target || idleUsed || greeting || !idleLines.length) return;
      idleT = setTimeout(() => { if (target || !shown) return; idleUsed = true; show(pick(idleLines, last), ""); }, IDLE);
    };
    const dropGreet = () => { if (!greeting) return false; greeting = false; clearTimeout(greetT); delete tip.dataset.enter; return true; };
    const endGreet = () => { if (dropGreet() && !target) { rest(); armIdle(); } };
    const resolve = (node) => {
      if (!(node instanceof Element) || !el.contains(node) || node.closest(skip)) return null;
      const own = node.closest('[data-fx-part="quip"]');
      if (own && el.contains(own)) return { el: own, text: own.dataset.label || linkText, key: own.dataset.key || "" };
      const btn = node.closest("a[href], button");
      if (btn && el.contains(btn)) return { el: btn, text: btn.dataset.label || btn.getAttribute("aria-label") || (btn.tagName === "BUTTON" ? buttonText : linkText), key: "" };
      return null;
    };
    const apply = (node) => { const r = resolve(node); if (!r) return false; dropGreet(); target = r.el; clearTimeout(idleT); show(r.text, r.key); return true; };
    const onMove = (e) => {
      x = e.clientX; y = e.clientY;
      if (!tick) { tick = true; requestAnimationFrame(() => { place(); tick = false; }); }
      if (!shown) { shown = true; tip.style.opacity = ""; }
      if (greeting && !freed) { freed = true; setTimeout(() => delete tip.dataset.enter, 470); }
      if (!greeting) { idleUsed = false; armIdle(); }
    };
    const onOver = (e) => {
      if (e.target instanceof Element && e.target.closest(skip)) { target = null; endGreet(); rest(); return; }
      const r = resolve(e.target);
      if (!r || r.el === target) return;
      clearTimeout(hoverT);
      hoverT = setTimeout(() => apply(e.target), INTENT);
    };
    const onOut = (e) => {
      const to = e.relatedTarget;
      if (target && to instanceof Element && target.contains(to)) return;
      if (!resolve(e.target)) return;
      clearTimeout(hoverT); target = null; rest(); armIdle();
    };
    const onDown = () => { dropGreet(); clearTimeout(idleT); };
    const onUp = (e) => { target = null; if (!apply(document.elementFromPoint(e.clientX, e.clientY))) { rest(); armIdle(); } };
    const onScroll = () => { if (!greeting || scrollArmed) return; scrollArmed = true; clearTimeout(greetT); greetT = setTimeout(endGreet, 1400); };
    const onLeave = () => { dropGreet(); hide(); };
    const onVis = () => { if (document.hidden) hide(); };
    const onResize = () => { measure(); place(); };
    const onEnd = (e) => { if (e.propertyName === "padding-left" || e.propertyName === "font-size") { measure(); place(); } };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    tip.addEventListener("transitionend", onEnd);
    measure();
    const greetAt = setTimeout(() => {
      if (!hello.length || target || shown) return;
      try { if (sessionStorage.getItem("fx-quip-hello") === "1") return; sessionStorage.setItem("fx-quip-hello", "1"); } catch (err) {}
      greeting = true; x = innerWidth / 2; y = innerHeight - 150;
      tip.dataset.enter = "";
      show(pick(hello, ""), "");
      greetT = setTimeout(endGreet, 14000);
    }, +(options.helloDelay ?? 700));
    return () => {
      clearTimeout(greetAt); clearTimeout(greetT); clearTimeout(idleT); clearTimeout(hoverT);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      tip.remove();
    };
  });
})();
