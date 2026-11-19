// Time → sky (night blend · photo overlay · brightness · text stage). During time travel it holds the offset from now and flows along every minute
(() => {
  const NIGHT = [[0, 1], [4, 1], [5, 0.8], [6, 0.6], [7, 0.4], [8, 0.2], [9, 0], [16, 0], [17, 0.2], [18, 0.4], [19, 0.6], [20, 0.8], [21, 1], [24, 1]];
  const skyOf = (h) => (h < 5 ? "night" : h < 6 ? "yellow" : h < 19 ? "day" : h < 20 ? "yellow" : "night");
  const nightOf = (h) => {
    let i = 0;
    while (i < NIGHT.length - 1 && NIGHT[i + 1][0] <= h) i++;
    const [h0, v0] = NIGHT[i], [h1, v1] = NIGHT[Math.min(i + 1, NIGHT.length - 1)];
    return h1 > h0 ? v0 + ((h - h0) / (h1 - h0)) * (v1 - v0) : v0;
  };
  kfFx.register("sky-time-dial", (el, { options, reduce, hover }) => {
    const hand = el.querySelector('[data-fx-part="hand"]');
    if (!hand) return;
    const follower = el.querySelector('[data-fx-part="follower"]');
    const scope = el.closest("header, body") || document;
    const times = [...scope.querySelectorAll('[data-fx-part="time"]')];
    const resets = [...scope.querySelectorAll('[data-fx-part="reset"]')];
    const target = document.querySelector(options.target || "html") || document.documentElement;
    const followDur = +(options.follow ?? 0.5);
    const grabR = +(options.grab ?? 16);
    // hover·hold — when hovered·when the needle is held, the circle grows to this size (rem·px, anchored top right). If absent, unchanged
    const px = (v) => (v == null ? null : /rem$/.test(v) ? parseFloat(v) * parseFloat(getComputedStyle(document.documentElement).fontSize) : parseFloat(v));
    const base = el.offsetWidth, hoverSize = px(options.hover), holdSize = px(options.hold);
    const size = (v, dur = 0.45) => { if (v == null || reduce) return; gsap.to(el, { width: v, height: v, duration: dur, ease: "power2.out", overwrite: "auto" }); };
    let offset = 0, rot = 0, timer = 0;
    const now = () => new Date(Date.now() + offset);
    const angleOf = (d) => (((d.getHours() % 12) + d.getMinutes() / 60) / 12) * 360;
    const pad = (n) => String(n).padStart(2, "0");
    const apply = () => {
      const d = now(), h = d.getHours() + d.getMinutes() / 60, night = nightOf(h);
      target.style.setProperty("--fx-night", night.toFixed(4));
      target.style.setProperty("--fx-img-over", (night * 0.1).toFixed(4));
      target.style.setProperty("--fx-bright", (1 - night * 0.8).toFixed(4));
      target.setAttribute("data-sky", skyOf(h));
      target.toggleAttribute("data-time-travel", offset !== 0);
      times.forEach((t) => (t.textContent = `${pad(d.getHours())}.${pad(d.getMinutes())}`));
      el.dispatchEvent(new CustomEvent("fx:sky", { detail: { hour: h, night, sky: skyOf(h) } }));
    };
    const setHand = (deg, dur) => {
      const delta = ((((deg - rot) % 360) + 540) % 360) - 180;
      rot += delta;
      dur ? gsap.to(hand, { rotation: rot, duration: dur, ease: "power2.out", overwrite: "auto" }) : gsap.set(hand, { rotation: rot });
    };
    const tickMinute = () => { apply(); setHand(angleOf(now()), 0); timer = setTimeout(tickMinute, 6e4 - (Date.now() % 6e4)); };
    tickMinute();
    // face — the clock face that doesn’t scale (hand tip positions are measured on this face). Angles are measured from the center of the enlarged circle (as in the original)
    const face = el.querySelector('[data-fx-part="face"]') || el;
    const center = (box = el) => { const r = box.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.height / 2]; };
    const angleAt = (x, y) => { const [cx, cy] = center(); return ((Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90 + 360) % 360; };
    const nearTip = (x, y) => {
      const [cx, cy, rad] = center(face), a = (rot * Math.PI) / 180, r = rad - 10;
      return Math.hypot(x - (cx + r * Math.sin(a)), y - (cy - r * Math.cos(a))) <= grabR + 0.5;
    };
    let fRot = 0, grabbing = false, startPM = false, firstMove = false;
    const onMove = (e) => {
      if (grabbing || !hover || reduce) return;
      const near = nearTip(e.clientX, e.clientY);
      el.classList.toggle("fx-dial-grab", near);
      if (!follower) return;
      // On first move after entering, the dot rotates back onto the needle, then follows the cursor angle
      const first = firstMove;
      firstMove = false;
      if (first) { fRot = rot; gsap.set(follower, { rotation: fRot }); }
      // If the pointer lands at the dead center of the board (within 3px) there is no direction, so it returns toward 12 o’clock
      const [fx, fy] = center(face);
      const a = Math.hypot(e.clientX - fx, e.clientY - fy) < 3 ? 0 : angleAt(e.clientX, e.clientY);
      fRot += ((((a - fRot) % 360) + 540) % 360) - 180;
      gsap.to(follower, first ? { rotation: fRot, duration: 0.4, ease: "power2.out", overwrite: "auto" } : { rotation: fRot, opacity: near ? 0 : 1, duration: followDur, ease: "power2.out", overwrite: "auto" });
    };
    const onEnter = () => {
      if (!hover || reduce) return;
      size(hoverSize);
      // The trailing dot starts at the needle position and turns toward the cursor
      firstMove = true;
    };
    const onLeave = () => { el.classList.remove("fx-dial-grab"); if (!grabbing) size(base, 0.4); follower && gsap.to(follower, { opacity: 0, duration: 0.2, ease: "power2.out", overwrite: "auto" }); };
    const onDown = (e) => {
      if (!nearTip(e.clientX, e.clientY)) return;
      e.preventDefault();
      grabbing = true;
      startPM = now().getHours() >= 12;
      el.classList.add("fx-dial-grabbing");
      document.documentElement.classList.add("fx-dial-grabbing");
      el.setPointerCapture?.(e.pointerId);
      follower && gsap.to(follower, { opacity: 0, duration: 0.2, overwrite: "auto" });
      // The press-point angle is measured from the center of the plate (hold, anchored top right) that grows when grabbed — measured after the original .rotate grows to 8.8rem
      let goal = angleAt(e.clientX, e.clientY);
      if (holdSize) { const r = el.getBoundingClientRect(); goal = ((Math.atan2(e.clientY - (r.top + holdSize / 2), e.clientX - (r.right - holdSize / 2)) * 180) / Math.PI + 90 + 360) % 360; }
      // The hand turns in the direction time has flowed — by the difference (in minutes) to the pressed time within the same AM/PM (one turn is 12 hours)
      const mins = Math.floor((goal / 360) * 720), real = now(), want = new Date(real);
      want.setHours((Math.floor(mins / 60) % 12) + (startPM ? 12 : 0), mins % 60, 0, 0);
      const from = rot, delta = ((want - real) / 6e4 / 720) * 360, p = { a: from };
      lastA = ((goal % 360) + 360) % 360;
      gsap.delayedCall(reduce ? 0 : 0.14, () => target.setAttribute("data-time-travel", ""));
      // The hand turns .15s late over .6s, and the sky (background · text) moves to the new time in .2s, changing via css transition
      gsap.to(p, { a: from + delta, duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.15, ease: "power2.out", onUpdate: () => travel(((p.a % 360) + 360) % 360, p.a, true) });
      gsap.delayedCall(reduce ? 0 : 0.2, () => travel(((goal % 360) + 360) % 360, null, false, true));
    };
    let lastA = null;
    // quiet — only turns the hands and leaves the sky alone · skyOnly — only moves the sky to the new time
    const travel = (a, raw, quiet, skyOnly) => {
      const mins = Math.floor((a / 360) * 720), real = new Date(), want = new Date(real);
      want.setHours((Math.floor(mins / 60) % 12) + (startPM ? 12 : 0), mins % 60, 0, 0);
      offset = want - real;
      if (!skyOnly) { rot = raw ?? rot + (((((a - rot) % 360) + 540) % 360) - 180); gsap.set(hand, { rotation: rot }); }
      if (!quiet) apply();
    };
    const onDrag = (e) => {
      if (!grabbing) return;
      const a = angleAt(e.clientX, e.clientY);
      // Past 12 o’clock, AM/PM flips
      if (lastA != null && Math.abs(a - lastA) > 180) startPM = !startPM;
      lastA = a;
      gsap.killTweensOf(hand);
      travel(a);
    };
    const onUp = () => {
      if (!grabbing) return;
      grabbing = false; lastA = null;
      el.classList.remove("fx-dial-grabbing");
      document.documentElement.classList.remove("fx-dial-grabbing");
      size(el.matches(":hover") ? hoverSize : base);
    };
    const onReset = () => { if (!offset) return; offset = 0; apply(); setHand(angleOf(now()), reduce ? 0 : 1.2); };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onDrag);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    resets.forEach((r) => r.addEventListener("click", onReset));
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onDrag);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      resets.forEach((r) => r.removeEventListener("click", onReset));
      el.classList.remove("fx-dial-grab", "fx-dial-grabbing");
      document.documentElement.classList.remove("fx-dial-grabbing");
      if (el.isConnected) { gsap.set([hand, follower].filter(Boolean), { clearProps: "transform,opacity" }); gsap.set(el, { clearProps: "width,height" }); }
    };
  });
})();
