// Non-scroll motion: scaling the text panel to fit the screen (1920×1080 baseline), shuffling list names (2s · wide screens only), turning on photo cells (.1~.7s random delay · .4s easeOutQuad),
// Voice button playback state. The 7s beat and shuffle of the text panel run only while the shuffle-relayout part is visible
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => innerWidth <= 768;
  const block = document.querySelector(".a3-word__block");
  const list = document.querySelector(".a3-list ul");
  const names = [...document.querySelectorAll(".a3-name-pc")];
  const thumbs = [...document.querySelectorAll(".a3-visual__thumb")];
  let view = document.body.dataset.view;

  const fit = () => {
    if (narrow()) {
      block.style.transform = "";
      list.style.removeProperty("--a3-name");
      return;
    }
    if (view === "word") block.style.transform = `scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`;
    if (view === "list") {
      list.style.setProperty("--a3-name", innerWidth < 1920 ? `${((innerWidth - 550) * 200) / 1920}px` : "7.813vw");
    }
  };

  // The shuffle-text part shuffles once when attached — so detach and reattach it each time the list opens to shuffle from the start
  const reshuffle = () => {
    list.removeAttribute("data-fx");
    setTimeout(() => list.setAttribute("data-fx", "shuffle-text"), 0);
  };

  const enter = (v) => {
    view = v;
    fit();
    if (v === "list" && !narrow()) {
      names.forEach((n) => n.classList.add("is-show"));
      if (!reduce) reshuffle();
    }
    if (v === "visual") thumbs.forEach((t) => {
      if (reduce) return gsap.set(t, { opacity: 1 });
      gsap.fromTo(t, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: (Math.floor(Math.random() * 7) + 1) / 10, ease: "power1.out" });
    });
  };
  const leave = (v) => {
    if (v === "list") { names.forEach((n) => n.classList.remove("is-show")); stopVoice(); }
    if (v === "visual") thumbs.forEach((t) => { gsap.killTweensOf(t); t.removeAttribute("style"); });
  };

  // Original releases the state after the sound file plays to the end. The placeholder is a 3-second voice
  let playing = null, voiceTimer;
  const stopVoice = () => { clearTimeout(voiceTimer); playing?.classList.remove("is-playing"); playing = null; };
  document.querySelectorAll(".a3-list__voice a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    stopVoice();
    playing = a.parentElement;
    playing.classList.add("is-playing");
    voiceTimer = setTimeout(stopVoice, 3000);
  }));
  document.querySelectorAll('.a3-word a, .a3-list__name a, .a3-visual a, .a3-corner a').forEach((a) => {
    if (a.getAttribute("href") === "#") a.addEventListener("click", (e) => e.preventDefault());
  });

  document.addEventListener("a3:view", (e) => enter(e.detail.view));
  document.addEventListener("a3:leave", (e) => leave(e.detail.view));
  addEventListener("resize", fit);
  fit();
})();
