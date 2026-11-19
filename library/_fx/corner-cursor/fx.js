// The rectangle approaches the target center by .15 every frame (no time correction — as in the original), and only the size is changed with GSAP.
// The sticking cell stays wrapped even after the mouse leaves, acting as a ”currently chosen” marker — hovering another target and leaving returns to that cell
(() => {
  kfFx.register("corner-cursor", (root, { options, reduce, hover }) => {
    if (!hover || reduce) return;
    const follow = +(options.follow ?? 0.15), dur = +(options.dur ?? 0.4), pad = +(options.pad ?? 8);
    const size = +options.size || 15, corner = +options.corner || 8;
    const targets = options.targets || 'a, button, [role="button"], [data-fx-part="stick"]';
    // idle: hide — normally hidden at 0x and grows only when wrapping an element (the system cursor stays) — the corner marker of 3d-discovery
    const grow = +(options.grow ?? 0), hide = options.idle === "hide", skip = options.skip || "";
    const ease = "power3.out";
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    const c = document.createElement("span");
    c.className = "fx-corner-cursor";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML = "<i></i><i></i><i></i><i></i>";
    document.body.append(c);
    gsap.set(c, { width: size, height: size });
    const corners = [...c.children];
    gsap.set(corners, { width: corner, height: corner });
    const isStick = (el) => el.getAttribute("data-fx-part") === "stick";
    const find = (n) => {
      const t = n?.closest?.(targets);
      if (t && skip && t.closest(skip)) return null;
      return t && root.contains(t) && t.getAttribute("aria-disabled") !== "true" ? t : null;
    };
    const mouse = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, cur = { w: size, h: size };
    let visible = false, hovered = null, stuck = null, sizeTw = null, cornerTw = null, scaleTw = null;
    const scale = { s: hide ? 0 : 1 };
    const setShown = (on) => { if (!hide) return; scaleTw?.kill(); scaleTw = gsap.to(scale, { s: on ? 1 : 0, duration: dur, ease }); };
    const setCorners = (s) => { cornerTw?.kill(); cornerTw = gsap.to(corners, { width: s, height: s, duration: dur, ease }); };
    const wrap = (el) => {
      const r = el.getBoundingClientRect(), p = isStick(el) ? pad : grow / 2;
      cur.w = r.width + p * 2;
      cur.h = r.height + p * 2;
      sizeTw?.kill();
      sizeTw = gsap.to(c, { width: cur.w, height: cur.h, duration: dur, ease });
      setCorners(isStick(el) ? Math.max(corner, Math.round(Math.min(cur.w, cur.h) * 0.1)) : corner);
      setShown(true);
    };
    const unwrap = () => {
      cur.w = cur.h = size;
      sizeTw?.kill();
      sizeTw = gsap.to(c, { width: size, height: size, duration: dur, ease });
      setCorners(corner);
      setShown(false);
    };
    const enter = (e) => {
      const t = find(e.target);
      if (!t) return;
      hovered = t;
      if (isStick(t)) stuck = t;
      wrap(t);
    };
    const leave = (e) => {
      const t = find(e.target);
      if (!t || find(e.relatedTarget) === t) return;
      hovered = null;
      if (isStick(t)) return;
      if (stuck?.isConnected) wrap(stuck); else unwrap();
    };
    root.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) { visible = true; pos.x = mouse.x; pos.y = mouse.y; c.style.opacity = "1"; }
    }, on);
    root.addEventListener("mouseleave", () => { visible = false; c.style.opacity = "0"; }, on);
    root.addEventListener("mouseover", enter, on);
    root.addEventListener("mouseout", leave, on);
    root.addEventListener("focusin", enter, on);
    root.addEventListener("focusout", leave, on);
    // Runs after GSAP has drawn the tween — if it ran first, the just-made wrapper tween hasn’t started and would read the size immediately, so the growth would vanish
    const tick = () => {
      if (!visible) return;
      if (stuck && !stuck.isConnected) { stuck = null; if (!hovered) unwrap(); }
      if (hovered && !hovered.isConnected) { hovered = null; if (!stuck) unwrap(); }
      const el = hovered || stuck;
      let x = mouse.x, y = mouse.y;
      if (el) {
        const r = el.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
        if (!sizeTw?.isActive()) {
          const p = isStick(el) ? pad : grow / 2;
          cur.w = r.width + p * 2;
          cur.h = r.height + p * 2;
          c.style.width = `${cur.w}px`;
          c.style.height = `${cur.h}px`;
        }
      }
      pos.x += (x - pos.x) * follow;
      pos.y += (y - pos.y) * follow;
      c.style.transform = `translate3d(${pos.x - cur.w / 2}px, ${pos.y - cur.h / 2}px, 0)${hide ? ` scale(${scale.s})` : ""}`;
    };
    gsap.ticker.add(tick);
    return () => { ac.abort(); gsap.ticker.remove(tick); sizeTw?.kill(); cornerTw?.kill(); scaleTw?.kill(); c.remove(); };
  });
})();
