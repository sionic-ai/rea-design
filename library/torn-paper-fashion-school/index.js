// Home: draws instructor and news cards and the instructor dialog in one type, and sets the hero video’s play order like the original.
// Original values: .5s after the opening panel starts lifting, the video plays (no loop) → once playback starts the English line appears and vanishes .8s later →
// The text group appears after 6.5s (or when the video ends first). When the video ends it stops on the last frame.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TEACH = ["Fashion Magazine Editor-in-Chief", "Your association director · Designer here", "Your brand creative director here", "Your collection designer here", "Your stylist here", "Your pattern maker here"];
  const ul = document.querySelector("[data-instructors]");
  if (ul) ul.innerHTML = TEACH.map((p, i) => `<li class="swiper-slide"><article class="yf-card"><div class="yf-card__thumb -sq -mono"><div class="wf-img" data-label="Instructor ${i + 1} Upper body · B&W · Square"></div></div><p class="yf-card__pos">「${p}」</p><p class="yf-card__name">Your name here</p><button class="yf-card__trigger" type="button" data-modal-trigger="yf-modal-${i + 1}" aria-label="Instructor ${i + 1} In detail"></button></article></li>`).join("");
  const box = document.querySelector("[data-modals]");
  if (box) box.innerHTML = TEACH.map((p, i) => `<dialog class="yf-modal" id="yf-modal-${i + 1}" aria-labelledby="yf-modal-${i + 1}-t"><div class="yf-modal__inner"><div class="yf-modal__thumb"><div class="wf-img" data-label="Instructor ${i + 1} Upper body · B&W · Square"></div></div><div><p class="yf-modal__pos">${p}</p><p class="yf-modal__name" id="yf-modal-${i + 1}-t">Your name here</p><div class="yf-modal__body">Your instructor bio here, about four lines. Add two more lines on the classes taught here and a message to students.</div></div></div><button class="yf-modal__close" type="button" data-modal-close aria-label="Close"></button></dialog>`).join("");

  const NEWS = [["Open Campus", "<October> Open Campus Guide"], ["Admissions", "<10/1~> Notice: Admission applications now open"], ["News", "New facility ‹FASHION LAB.› opens"], ["Admissions", "<For Sophomores> Start AO entry"], ["Event", "Special course for fashion designers now open"], ["News", "Fashion Creator Program, finally launching"], ["News", "School festival entry info"], ["Admissions", "A new admissions guide booklet is out"]];
  const nl = document.querySelector("[data-news]");
  if (nl) nl.innerHTML = NEWS.map(([t, h], i) => `<li class="swiper-slide"><article class="yf-card"><a href="news.html"><div class="yf-card__thumb"><div class="wf-img" data-label="News ${i + 1} Thumbnail · red tag over an event photo · landscape 16:9"></div></div><time>2026/00/00</time><p class="yf-card__title">${h}</p></a><ul class="yf-tags"><li>${t}</li><li>News</li></ul></article></li>`).join("");

  // Hero video
  const video = document.querySelector(".yf-kv__main"), intro = document.querySelector(".yf-kv__intro"), text = document.querySelector(".yf-kv__text");
  if (!video) return;
  if (reduced) { intro?.classList.add("is-done"); text?.classList.add("is-visible"); return; }
  video.muted = true;
  video.loop = false;
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    clearTimeout(t1); clearTimeout(t2);
    video.pause();
    if (video.duration) video.currentTime = Math.max(0, video.duration - 0.1);
    intro?.classList.remove("is-visible");
    text?.classList.add("is-visible");
  };
  let t1 = 0, t2 = 0;
  video.addEventListener("playing", () => {
    if (ended) return;
    intro?.classList.add("is-visible");
    t1 = setTimeout(() => intro?.classList.remove("is-visible"), 800);
    t2 = setTimeout(() => text?.classList.add("is-visible"), 6500);
  }, { once: true });
  video.addEventListener("ended", finish, { once: true });
  // If playback fails (autoplay blocked), show the first image like the original and bring up the copy group right away
  const play = () => video.play()?.catch(() => { intro?.classList.remove("is-visible"); text?.classList.add("is-visible"); });
  const loader = document.querySelector(".yf-loader");
  if (!loader) return play();
  const mo = new MutationObserver(() => { if (loader.classList.contains("is-fadeout")) { mo.disconnect(); setTimeout(play, 500); } });
  mo.observe(loader, { attributes: true, attributeFilter: ["class"] });
})();
