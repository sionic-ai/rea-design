// When a same-site link inside the element is clicked, the curtain opens from a small rectangle at bottom center of the screen (25%~75% wide, one row at 75% height)
// Opens across the whole screen over 1.6s cubic-bezier(.9,0,.1,1) and hands over at 85%. The arriving page (a page with the same part attached) is
// Starts with the curtain still open by the remaining amount, the indicator in the curtain disappears upward 12px in .45s, and .3s later the curtain lifts up over 1.15s cubic-bezier(.87,0,.13,1).
(() => {
  const KEY = "fx-rbc";
  const SMALL = "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)", FULL = "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)";
  kfFx.register("rect-bloom-cover", (el, { options, reduce }) => {
    const dur = +(options.dur ?? 1.6) * 1000;
    const at = +(options.at ?? 0.85);
    const lift = +(options.lift ?? 1.15) * 1000;
    const ease = options.ease ? (/,/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease) : "cubic-bezier(0.9, 0, 0.1, 1)";
    const mark = el.querySelector(':scope [data-fx-part="mark"]');
    const make = () => {
      const c = document.createElement("div");
      c.className = "fx-rbc";
      c.setAttribute("aria-hidden", "true");
      if (mark) { const m = mark.cloneNode(true); m.removeAttribute("data-fx-part"); m.classList.add("fx-rbc__mark"); m.hidden = false; c.append(m); }
      document.body.append(c);
      return c;
    };
    const anims = [];
    let arrived = null;
    // Arriving side: if the time left by the previous page is within 5.6s, pick it up
    let since = null;
    try { const t = Number(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); if (t) since = Date.now() - t; } catch {}
    if (!reduce && since !== null && since < 5600) {
      arrived = make();
      anims.push(arrived.animate([{ clipPath: SMALL }, { clipPath: FULL }], { duration: dur, delay: -since, easing: ease, fill: "forwards" }));
      const t = Math.max(60, at * dur - since);
      const m = arrived.querySelector(".fx-rbc__mark");
      if (m) anims.push(m.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-12px)" }], { duration: 450, delay: t, easing: "cubic-bezier(0.55, 0, 1, 0.45)", fill: "forwards" }));
      const up = arrived.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: lift, delay: t + 300, easing: "cubic-bezier(0.87, 0, 0.13, 1)", fill: "forwards" });
      anims.push(up);
      up.onfinish = () => { arrived?.remove(); arrived = null; el.dispatchEvent(new CustomEvent("fx:revealed", { bubbles: true })); };
    }
    let leaving = false, timer = 0, cover = null;
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a || !el.contains(a) || reduce || leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      if (a.origin !== location.origin || (a.pathname === location.pathname && a.search === location.search)) return;
      e.preventDefault();
      leaving = true;
      cover = make();
      anims.push(cover.animate([{ clipPath: SMALL }, { clipPath: FULL }], { duration: dur, easing: ease, fill: "forwards" }));
      try { sessionStorage.setItem(KEY, String(Date.now())); } catch {}
      el.dispatchEvent(new CustomEvent("fx:leave", { bubbles: true, detail: { href: a.href } }));
      timer = setTimeout(() => { location.href = a.href; }, dur * at);
    };
    // When returning via the Back button (bfcache), clear the cover so it isn’t stuck covered
    const onShow = (e) => { if (e.persisted) { leaving = false; cover?.remove(); cover = null; } };
    el.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      el.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      clearTimeout(timer);
      anims.forEach((x) => x.cancel());
      cover?.remove();
      arrived?.remove();
    };
  });
})();
