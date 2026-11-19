// Detail — photo strip (glide-wrap-reel) flows at 50px per second as soon as it sticks. Opening INFO·PHOTO INDEX removes the header and strip text via html.is-open and
// The strip does not take wheel or drag. Pressing a thumbnail winds in over 1s power3.out from 100px ahead so that photo lands at the left screen edge (+1px).
window.miPages = window.miPages || {};
window.miPages.detail = (scope, { reduce, sp }) => {
  const root = document.documentElement;
  const el = scope.querySelector(".mi-detail");
  if (!el || el.classList.contains("is-ready")) return;
  const reel = el.querySelector(".mi-detail__list");
  if (window.kfFx) kfFx.scan(reel);
  const api = () => reel.fxReel;
  const info = el.querySelector(".mi-detail__info");
  const information = el.querySelector(".mi-detail__information");
  const store = el.querySelector(".mi-detail__store");
  const photo = el.querySelector(".mi-detail__photo");
  const thumbs = [...el.querySelectorAll(".mi-detail__thumbs > li")];
  const items = [...reel.querySelectorAll('[data-fx-part="item"]')];
  const loco = () => window.miLoco;
  let mode;

  const toTop = () => el.querySelectorAll(".js-detail-scroll").forEach((n) => { n.scrollTop = 0; });
  const tab = (name) => {
    information.classList.remove("is-active");
    store.classList.remove("is-active");
    if (name === undefined) { el.removeAttribute("data-nav"); return; }
    el.dataset.nav = name;
    if (sp()) {
      info.classList.remove("is-active");
      setTimeout(() => {
        info.classList.add("is-active");
        (name === "information" ? information : store).classList.add("is-active");
      }, 0);
    } else information.classList.add("is-active");
    toTop();
  };
  const setMode = (m) => {
    mode = m;
    reel.classList.toggle("is-fx-hold", m !== undefined);
    if (m === "info") { info.classList.add("is-active"); tab("information"); }
    else if (m === "photo") {
      photo.classList.add("is-active");
      thumbs.forEach((li, i) => setTimeout(() => li.classList.add("is-active"), reduce ? 0 : 30 * i));
    } else {
      info.classList.remove("is-active");
      photo.classList.remove("is-active");
      thumbs.forEach((li) => li.classList.remove("is-active"));
    }
    if (m !== undefined) toTop();
  };
  const close = () => { root.classList.remove("is-open"); setMode(undefined); tab(); };

  el.querySelectorAll(".js-detail-button").forEach((b) => b.addEventListener("click", () => {
    const want = b.dataset.toggle;
    if (want) { root.classList.add("is-open"); setMode(want); loco() && loco().stop(); }
    else { close(); loco() && loco().start(); }
  }));
  el.querySelectorAll(".js-detail-tab").forEach((t) => t.addEventListener("click", () => tab(t.dataset.toggle)));
  thumbs.forEach((li, idx) => li.addEventListener("click", () => {
    if (idx >= items.length || !api()) return;
    let t = 1;
    for (let i = 0; i < idx; i++) t += items[i].offsetWidth;
    api().scroll = -t - 100;
    api().to(-t, reduce ? 0 : 1, "power3.out");
    close();
  }));
  el.classList.add("is-ready");
  close();
  return {
    autoPlay: () => api() && api().play(),
    stopPlay: () => api() && api().stop(),
    destroy() { root.classList.remove("is-open"); },
  };
};
