// Hero open — the center logo fills over 1s and vanishes over 1s, then the pieces pop from .5x to full size over 1s at .5s intervals
// 1s after the last piece’s turn the headline appears over 2s, and 1s after that scroll is released. Once a day (cookie), skipped at 768px and below (Brand hero)
// Original cuts the logo fadeIn (2s) at 1s and restarts fadeOut (2s) from the beginning to hide it at 1s — so the logo jumps to 1 before filling up, then shrinks
(() => {
  kfFx.register("logo-fade-pop-opening", (el, { options, reduce }) => {
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const logo = el.querySelector('[data-fx-part="logo"]');
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    let head = null;
    try { head = options.head ? document.querySelector(options.head) : null; } catch (e) { head = null; }
    const key = "fxLogoFadePop";
    let seen = false;
    if (options.once !== "none") { try { seen = new RegExp(`(?:^|; )${key}=1`).test(document.cookie); } catch (e) {} }
    const narrow = +(options.narrow ?? 768);
    const timers = [], anims = [];
    const later = (fn, s) => timers.push(setTimeout(fn, s * 1000));
    const off = () => {
      el.classList.add("is-fx-off");
      if (head) { head.style.opacity = ""; head.style.visibility = ""; document.documentElement.classList.remove("is-fx-opening"); }
      const t = setTimeout(() => { fire("fx:open"); fire("fx:done"); }, 0);
      return () => { clearTimeout(t); el.classList.remove("is-fx-off"); };
    };
    if (reduce || seen || innerWidth <= narrow || !pieces.length) return off();

    const fade = +(options.fade ?? 2), logoIn = +(options.logo ?? 1), logoOut = +(options["logo-out"] ?? 1);
    const step = +(options.step ?? 0.5), pop = +(options.pop ?? 1), from = +(options.from ?? 0.5);
    const headAt = +(options["head-at"] ?? 1), unlock = +(options.unlock ?? 1);
    const ease = options.ease || "ease";
    const body = document.body, prevOverflow = body.style.overflow;
    const play = (node, frames, dur) => { const a = node.animate(frames, { duration: dur * 1000, easing: ease, fill: "forwards" }); anims.push(a); return a; };

    try { history.scrollRestoration = "manual"; } catch (e) {}
    scrollTo(0, 0);
    body.style.overflow = "hidden";
    if (head) { head.style.opacity = "0"; head.style.visibility = "hidden"; }
    el.classList.add("is-fx-run");

    let logoAnim = logo ? play(logo, [{ opacity: 0 }, { opacity: 1 }], fade) : null;
    later(() => { if (logo) { logoAnim.cancel(); logoAnim = play(logo, [{ opacity: 1 }, { opacity: 0 }], fade); } }, logoIn);
    const start = logoIn + logoOut;
    later(() => {
      if (logo) logo.style.visibility = "hidden";
      fire("fx:open");
      pieces.forEach((p, i) => later(() => play(p, [{ opacity: 0, scale: from }, { opacity: 1, scale: 1 }], pop), i * step));
    }, start);
    const headTime = start + pieces.length * step + headAt;
    later(() => {
      if (!head) return;
      head.style.visibility = "";
      document.documentElement.classList.remove("is-fx-opening");
      play(head, [{ opacity: 0 }, { opacity: 1 }], fade);
    }, headTime);
    later(() => {
      body.style.overflow = prevOverflow;
      document.documentElement.classList.remove("is-fx-opening");
      if (options.once !== "none") { try { document.cookie = `${key}=1; max-age=86400; path=/; SameSite=Lax`; } catch (e) {} }
      fire("fx:done");
    }, headTime + unlock);

    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      body.style.overflow = prevOverflow;
      el.classList.remove("is-fx-run");
      if (logo) logo.style.visibility = "";
      if (head) { head.style.opacity = ""; head.style.visibility = ""; }
    };
  });
})();
