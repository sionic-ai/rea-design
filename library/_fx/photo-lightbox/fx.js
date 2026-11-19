(() => {
  // Clicking one photo in the gallery drops a background-color curtain (.7) over the screen in .4s, and the bordered box starts from its previous size (a 300px square at first)
  // After growing at .4s linear to the photo size fitted to the screen, the photo and info row (caption · n / N · close) turn on at .2s — the exact order of wp-jquery-lightbox.
  // On close the box vanishes immediately and only the curtain lifts in .4s. Prev and next are the left and right half of the photo, ←·→ (p·n), and close with Esc (x·o·c).
  const SWING = "cubic-bezier(0.37, 0, 0.63, 1)"; // jQuery’s swing (.5 − cos(πp)/2)
  const open = new Set();
  document.addEventListener("keydown", (e) => {
    if (!open.size) return;
    const k = e.key.toLowerCase();
    const act = k === "escape" || k === "x" || k === "o" || k === "c" ? "fx:close" : k === "arrowleft" || k === "p" ? "fx:prev" : k === "arrowright" || k === "n" ? "fx:next" : "";
    if (act) open.forEach((el) => el.dispatchEvent(new Event(act)));
  });

  kfFx.register("photo-lightbox", (el, { options, reduce }) => {
    const d = reduce ? 0 : 1;
    const T = { veil: +(options.fade ?? 0.4) * 1000 * d, size: +(options.dur ?? 0.4) * 1000 * d, show: +(options.show ?? 0.2) * 1000 * d };
    const dim = +(options.veil ?? 0.7), border = +(options.border ?? 6), margin = +(options.margin ?? 40), natural = +(options.width || 1600);
    const word = options.word || "Image";
    const ac = new AbortController(), on = { signal: ac.signal };

    const layer = document.createElement("div");
    layer.dataset.fxPart = "layer";
    layer.hidden = true;
    layer.innerHTML = '<div data-fx-part="veil"></div><div data-fx-part="box"><div data-fx-part="frame"><div data-fx-part="media"></div><button type="button" data-fx-part="prev" aria-label="Previous photo"></button><button type="button" data-fx-part="next" aria-label="Next photo"></button></div><div data-fx-part="info"><p data-fx-part="caption"></p><p data-fx-part="count"></p><button type="button" data-fx-part="close" aria-label="Close"></button></div></div>';
    el.append(layer);
    const $ = (r) => layer.querySelector(`[data-fx-part="${r}"]`);
    const veil = $("veil"), box = $("box"), frame = $("frame"), media = $("media"), info = $("info");
    let list = [], idx = 0, w = 300, h = 300, busy = 0;

    // Image size: data-w and data-h if present, otherwise computed from the cell’s aspect ratio as width (default 1600)px
    const sizeOf = (item) => {
      const r = item.getBoundingClientRect();
      const nw = +item.dataset.w || natural, nh = +item.dataset.h || (r.width ? (natural * r.height) / r.width : natural);
      const infoH = info.offsetHeight || 40;
      const maxH = innerHeight - (infoH + 2 * border), maxW = innerWidth - 2 * border;
      let s = Math.min(1, (maxH - margin) / nh);
      let ww = nw * s, hh = nh * s;
      s = Math.min(1, (maxW - margin) / ww);
      ww = Math.round(ww * s); hh = Math.round(hh * s);
      return { w: Math.max(300, ww + 2 * border), h: hh + 2 * border, top: Math.max(0, maxH * 0.5 - hh * 0.5) };
    };
    const show = (n) => {
      idx = (n + list.length) % list.length;
      const item = list[idx];
      const to = sizeOf(item);
      media.style.opacity = 0;
      info.style.opacity = 0;
      media.replaceChildren(item.cloneNode(true));
      media.firstChild.removeAttribute("data-fx-part");
      $("caption").textContent = item.dataset.caption || item.getAttribute("aria-label") || item.dataset.label || "";
      $("count").textContent = list.length > 1 ? `${word} ${idx + 1} / ${list.length}` : "";
      layer.classList.toggle("is-single", list.length < 2);
      // On first open, as in the original, the box descends from the top edge of the screen to the center
      const from = { width: w + "px", height: h + "px", top: box.style.top || "0px" };
      const end = { width: to.w + "px", height: to.h + "px", top: to.top + "px" };
      frame.getAnimations().forEach((a) => a.cancel());
      box.getAnimations().forEach((a) => a.cancel());
      Object.assign(frame.style, { width: end.width, height: end.height });
      info.style.width = end.width;
      box.style.top = end.top;
      frame.animate([{ width: from.width, height: from.height }, { width: end.width, height: end.height }], { duration: T.size, easing: "linear" });
      info.animate([{ width: from.width }, { width: end.width }], { duration: T.size, easing: "linear" });
      box.animate([{ top: from.top }, { top: end.top }], { duration: T.size, easing: "linear" });
      w = to.w; h = to.h;
      clearTimeout(busy);
      busy = setTimeout(() => {
        media.style.opacity = 1;
        info.style.opacity = 1;
        media.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T.show, easing: SWING });
        info.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T.show, easing: SWING });
      }, T.size);
    };
    const start = (item) => {
      list = [...el.querySelectorAll('[data-fx-part="item"]')];
      if (!list.length) return;
      layer.hidden = false;
      el.classList.add("is-fx-open");
      open.add(el);
      box.hidden = false;
      veil.getAnimations().forEach((a) => a.cancel());
      veil.style.opacity = dim;
      veil.animate([{ opacity: 0 }, { opacity: dim }], { duration: T.veil, easing: SWING });
      box.style.top = "";
      show(Math.max(0, list.indexOf(item)));
    };
    const close = () => {
      if (!open.has(el)) return;
      open.delete(el);
      clearTimeout(busy);
      box.hidden = true;
      el.classList.remove("is-fx-open");
      const a = veil.animate([{ opacity: dim }, { opacity: 0 }], { duration: T.veil, easing: SWING });
      veil.style.opacity = 0;
      a.onfinish = () => { if (!open.has(el)) layer.hidden = true; };
      if (!T.veil) layer.hidden = true;
    };

    el.addEventListener("click", (e) => {
      const item = e.target.closest('[data-fx-part="item"]');
      if (item && el.contains(item) && !layer.contains(item)) { e.preventDefault(); start(item); }
    }, on);
    el.addEventListener("keydown", (e) => {
      const item = e.target.closest('[data-fx-part="item"]');
      if (item && !layer.contains(item) && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); start(item); }
    }, on);
    veil.addEventListener("click", close, on);
    box.addEventListener("click", (e) => { if (e.target === box || e.target === info) close(); }, on);
    $("close").addEventListener("click", close, on);
    $("prev").addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); }, on);
    $("next").addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); }, on);
    el.addEventListener("fx:close", close, on);
    el.addEventListener("fx:prev", () => open.has(el) && show(idx - 1), on);
    el.addEventListener("fx:next", () => open.has(el) && show(idx + 1), on);
    el.querySelectorAll('[data-fx-part="item"]').forEach((it) => { if (!it.matches("a,button,[tabindex]")) it.tabIndex = 0; });

    return () => { ac.abort(); clearTimeout(busy); open.delete(el); el.classList.remove("is-fx-open"); layer.remove(); };
  });
})();
