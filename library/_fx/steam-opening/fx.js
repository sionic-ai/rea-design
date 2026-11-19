(() => {
  kfFx.register("steam-opening", (el, { options, reduce }) => {
    const key = options.key || "fx-steam-opening";
    const once = +(options.once ?? 24), dur = +(options.dur ?? 10.01), bigAt = +(options["big-at"] ?? 6.3), fade = +(options.fade ?? 0.6);
    let seen = 0;
    try { seen = +localStorage.getItem(key) || 0; } catch {}
    if (reduce || (once > 0 && Date.now() - seen < once * 3600e3)) {
      el.classList.add("fx-so-gone");
      return () => el.classList.remove("fx-so-gone");
    }
    const puffs = ["fx-so-tr", "fx-so-bl", "fx-so-all"].map((c) => {
      const p = document.createElement("span");
      p.setAttribute("data-fx-part", "puff");
      p.className = c;
      el.append(p);
      return p;
    });
    const html = document.documentElement, was = html.style.overflow;
    html.style.overflow = "hidden";
    el.classList.remove("fx-so-gone");
    el.style.opacity = "";
    void el.offsetWidth;
    el.classList.add("fx-so-play");
    const media = el.querySelector('[data-fx-part="media"]');
    const timers = [];
    let done = false, fadeTimer = 0;
    const end = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      try { localStorage.setItem(key, String(Date.now())); } catch {}
      html.style.overflow = was;
      el.style.transition = `opacity ${fade}s`;
      el.style.opacity = "0";
      fadeTimer = setTimeout(() => { el.classList.add("fx-so-gone"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); }, fade * 1000);
    };
    const tick = () => { if (media.currentTime >= bigAt) { el.classList.add("fx-so-big"); media.removeEventListener("timeupdate", tick); } };
    if (media && media.play) {
      media.addEventListener("timeupdate", tick);
      media.addEventListener("ended", end, { once: true });
      media.play()?.catch(() => end());
    } else {
      timers.push(setTimeout(() => el.classList.add("fx-so-big"), bigAt * 1000), setTimeout(end, dur * 1000));
    }
    const skip = el.querySelector('[data-fx-part="skip"]');
    skip?.addEventListener("click", end);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
      media?.removeEventListener("timeupdate", tick);
      media?.removeEventListener("ended", end);
      skip?.removeEventListener("click", end);
      if (!done) html.style.overflow = was;
      puffs.forEach((p) => p.remove());
      el.classList.remove("fx-so-play", "fx-so-big", "fx-so-gone");
      el.style.removeProperty("opacity");
      el.style.removeProperty("transition");
    };
  });
})();
