// Photo slideshow covering the whole panel — Vegas 2.6 (jQuery) switches with a blur transition every delay and slowly zooms in with a Ken Burns effect.
// Writes the current section number and total section count onto the children, and the Vegas timer line fills up until the next advance — non-john hero (8s · 2s blur · 30s kenburns)
(() => {
  kfFx.register("vegas-blur-slides", (el, { options, reduce }) => {
    const $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.vegas) return;
    const stage = el.querySelector('[data-fx-part="stage"]');
    const list = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!stage || !list.length) return;
    const narrow = +(options.narrow ?? 768);
    // With no photo, a placeholder image is baked in the skin color — data-label is written small at the bottom of the image (so it doesn’t overlap the center logo on the Hero)
    const css = getComputedStyle(document.documentElement);
    const v = (k) => css.getPropertyValue(k).trim();
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const placeholder = (label, i) => {
      const a = v("--kf-surface"), b = v("--kf-raised"), ink = v("--kf-ink-soft") || v("--kf-ink");
      const cx = 30 + ((i * 23) % 50), cy = 35 + ((i * 17) % 40);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><defs><radialGradient id="g" cx="${cx}%" cy="${cy}%" r="70%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs><rect width="1600" height="1000" fill="url(#g)"/><text x="800" y="800" text-anchor="middle" font-family="sans-serif" font-size="16" fill="${ink}" opacity=".6">${esc(label)}</text></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    };
    const slides = list.map((s, i) => ({ src: (innerWidth <= narrow && s.dataset.srcNarrow) || s.dataset.src || placeholder(s.dataset.label || "", i) }));
    const current = el.querySelector('[data-fx-part="current"]'), total = el.querySelector('[data-fx-part="total"]');
    if (total) total.textContent = String(list.length);
    const $s = $(stage);
    $s.vegas({
      slides,
      transition: options.transition || "blur",
      transitionDuration: reduce ? 0 : +(options["transition-dur"] ?? 2) * 1000,
      delay: +(options.delay ?? 8) * 1000,
      animation: reduce ? null : options.animation || "kenburns",
      animationDuration: +(options["animation-dur"] ?? 30) * 1000,
      timer: options.timer !== "none",
      autoplay: !reduce,
    });
    const walk = (e, i) => {
      if (current) current.textContent = String(i + 1);
      el.querySelectorAll('[data-fx-part="dot"]').forEach((d, k) => d.classList.toggle("is-current", k === i));
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: i } }));
    };
    $s.on("vegaswalk", walk);
    const jump = (e) => {
      const d = e.target.closest('[data-fx-part="dot"]');
      if (!d) return;
      $s.vegas("jump", [...el.querySelectorAll('[data-fx-part="dot"]')].indexOf(d));
    };
    el.addEventListener("click", jump);
    return () => {
      el.removeEventListener("click", jump);
      $s.off("vegaswalk", walk);
      try { $s.vegas("destroy"); } catch (e) {}
    };
  });
})();
