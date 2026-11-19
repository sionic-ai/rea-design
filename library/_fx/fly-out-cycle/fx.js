(() => {
  // Fly out one of several panels in turn. Only the active panel flies straight from start to end via CSS transition, while inactive ones return to place unseen
  kfFx.register("fly-out-cycle", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const stage = el.querySelector('[data-fx-part="open"]');
    const rider = el.querySelector('template[data-fx-part="rider"]');
    const first = +(options.first ?? 3), every = +(options.every ?? 10), open = +(options.open ?? 3), lock = +(options.lock ?? 0.5);
    if (options.fly !== undefined) el.style.setProperty("--fx-fly", `${+options.fly}s`);
    let now = -1, busy = false, tOpen = 0, tLock = 0, tStart = 0, loop = 0;

    const go = (i) => {
      if (busy || i < 0 || i >= items.length) return;
      busy = true;
      now = i;
      dots.forEach((d, n) => { d.classList.toggle("is-active", n === now); d.setAttribute("aria-selected", String(n === now)); });
      items.forEach((it, n) => {
        const on = n === now;
        it.classList.toggle("is-active", on);
        const r = it.querySelector(".fx-foc-rider");
        if (on && rider && !r) { const k = document.createElement("div"); k.className = "fx-foc-rider"; k.append(rider.content.cloneNode(true)); it.append(k); }
        if (!on) r?.remove();
      });
      if (stage) {
        stage.classList.add("is-open");
        clearTimeout(tOpen);
        tOpen = setTimeout(() => stage.classList.remove("is-open"), open * 1000);
      }
      clearTimeout(tLock);
      tLock = setTimeout(() => { busy = false; }, lock * 1000);
    };
    const tap = String(options.tap ?? "1") !== "0";
    const handlers = dots.map((d, i) => { const h = () => go(i); if (tap) d.addEventListener("click", h); return h; });
    if (!reduce) tStart = setTimeout(() => { go(0); loop = setInterval(() => go((now + 1) % items.length), every * 1000); }, first * 1000);

    return () => {
      [tOpen, tLock, tStart].forEach(clearTimeout);
      clearInterval(loop);
      dots.forEach((d, i) => { d.removeEventListener("click", handlers[i]); d.classList.remove("is-active"); });
      items.forEach((it) => { it.classList.remove("is-active"); it.querySelector(".fx-foc-rider")?.remove(); });
      stage?.classList.remove("is-open");
      el.style.removeProperty("--fx-fly");
    };
  });
})();
