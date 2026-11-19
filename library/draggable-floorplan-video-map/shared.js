// Fixed UI outside the map stage: loading percent, center wordmark letter bounce, about drawer (Lenis only inside), sound mode, scene modal.
// The map stage (index.js) receives open and close through hdSite.on() to stop dragging, and the first entrance (opening) also gets its signal here.
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const listeners = {};
  const site = (window.hdSite = {
    reduced: false,
    isDragMoved: false,
    on(name, fn) { (listeners[name] ||= []).push(fn); },
    emit(name, data) { (listeners[name] || []).forEach((fn) => fn(data)); },
  });
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    site.reduced = true;
    return () => { site.reduced = false; };
  });

  // ── Wordmark Lottie: once the font arrives, it measures the letter positions of the static wordmark and builds the Lottie (wordmark.js), and when everything is loaded one step of the progress fills ──
  const centerMark = $("[data-js=logo-static]");
  const lottieBox = $("[data-js=logo-lottie]");
  let logoAnim = null;
  const logoReady = document.fonts.ready.then(() => new Promise((resolve) => {
    if (site.reduced || !window.lottie || !window.hdWordmark) return resolve();
    try {
      logoAnim = lottie.loadAnimation({ container: lottieBox, renderer: "svg", animationData: hdWordmark(lottieBox, centerMark), autoplay: false, loop: false });
    } catch (err) {
      // If Lottie can’t be built, go straight to the static wordmark — so loading never stalls
      console.error("Wordmark Lottie", err);
      logoAnim = null;
      return resolve();
    }
    logoAnim.addEventListener("error", (e) => console.error("Wordmark Lottie", e && (e.nativeError || e.currentTarget || e)));
    // If the animation data is passed directly, DOMLoaded may already have fired inside loadAnimation
    if (logoAnim.isLoaded) return resolve();
    logoAnim.addEventListener("DOMLoaded", resolve);
  }));

  // ── Loading: counts by following the real progress by 10% each tick, and when full plays the Lottie — like the original, it counts only the Lottie load (+ buffering of the first videos).
  // The document load isn’t counted (the original doesn’t count it either). The placeholder panel has no first video, so it’s one Lottie frame ──
  const loading = $("[data-js=loading]");
  const count = $("[data-js=loading-count]");
  const steps = [logoReady];
  let done = 0, shown = 0;
  steps.forEach((p) => p.then(() => done++));
  const LOGO_MS = 3800;
  const tick = () => {
    const goal = done / steps.length;
    if (goal > shown) shown += (goal - shown) * (site.reduced ? 1 : 0.1);
    count.textContent = `${Math.round(shown * 100)}%`;
    if (shown <= 0.999) return;
    gsap.ticker.remove(tick);
    loading.dataset.visible = "false";
    root.dataset.loaded = "true";
    logoAnim?.play();
    setTimeout(() => site.emit("opening"), site.reduced ? 0 : LOGO_MS);
  };
  gsap.ticker.add(tick);

  // ── Sound mode: with on · only, the wordmark words wobble up and down, offset by 0.16s each ──
  const sound = $("[data-js=sound]");
  $$("input", sound).forEach((input) => input.addEventListener("change", () => {
    const mode = input.value;
    root.dataset.sound = mode;
    gsap.to(centerMark, { "--_sound-volume": mode === "off" ? 0 : 1, duration: 0.8, ease: "power2.out" });
    site.emit("sound", mode);
  }));

  // ── Each sound peak makes wordmark words bounce (original setDynamicLogoVolume): alternating lines, words .35s apart, letters .04s each —
  // Rises by the text height (−45/44 ×) over .5s power2.out, then .45s later comes back down over 1.75s power2.inOut. When one line has fully risen, it is the next line’s turn ──
  const markLines = [".hd-mark__line--ghost", ".hd-mark__line--main"].map((sel) => {
    const line = $(sel, centerMark);
    const words = $$(".hd-mark__word", line).map((w) => $$(".hd-mark__ch", w));
    const smile = $(".hd-mark__smile", line);
    if (smile && words.length) words[words.length - 1].push(smile);
    return words;
  });
  const ready = markLines.map((_, i) => i === 0);
  site.jumpMark = () => {
    if (site.reduced) return;
    const ctx = document.createElement("canvas").getContext("2d"), cs = getComputedStyle(centerMark);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const lift = -(45 / 44.35) * (ctx.measureText("H").actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.7);
    markLines.forEach((words, li) => {
      if (!ready[li]) return;
      ready[li] = false;
      const tl = gsap.timeline();
      words.forEach((chars, wi) => {
        const w = gsap.timeline();
        w.to(chars, { y: lift, duration: 0.5, ease: "power2.out", stagger: 0.04, onComplete: () => { if (wi === words.length - 1) ready[(li + 1) % markLines.length] = true; } })
          .to(chars, { y: 0, duration: 0.5 * 3.5, ease: "power2.inOut", stagger: 0.04 }, `<+=${0.5 * 0.9}`);
        tl.add(w, `<+=${wi === 0 ? 0 : 0.35}`);
      });
    });
  };

  // ── About Drawer ──
  const aboutBtn = $("[data-js=about-button]");
  const aboutModal = $("[data-js=about-modal]");
  const aboutWrap = $("[data-js=about-wrapper]");
  const aboutContent = $("[data-js=about-content]");
  const thumb = $("[data-js=about-thumb]");
  const videos = $$("[data-js=about-video]");
  const lenis = new Lenis({ wrapper: aboutWrap, content: aboutContent, autoRaf: true, lerp: 0.2 });
  lenis.stop();
  const paintThumb = () => {
    const track = thumb.parentElement.clientHeight;
    const ratio = aboutWrap.clientHeight / aboutContent.scrollHeight;
    const h = Math.min(1, ratio) * track;
    const max = aboutContent.scrollHeight - aboutWrap.clientHeight;
    thumb.style.height = `${h}px`;
    thumb.style.transform = `translateY(${max > 0 ? (aboutWrap.scrollTop / max) * (track - h) : 0}px)`;
  };
  lenis.on("scroll", paintThumb);
  addEventListener("resize", paintThumb);
  let videoIndex = 0, videoTimer = 0;
  const nextVideo = () => {
    videos[videoIndex].dataset.visible = "false";
    videoIndex = (videoIndex + 1) % videos.length;
    videos[videoIndex].dataset.visible = "true";
  };
  const openAbout = () => {
    aboutBtn.setAttribute("aria-expanded", "true");
    aboutModal.setAttribute("aria-hidden", "false");
    sound.setAttribute("aria-hidden", "true");
    lenis.start();
    lenis.scrollTo(0, { immediate: true });
    paintThumb();
    videoTimer = setInterval(nextVideo, 4000);
    site.emit("about:open");
  };
  const closeAbout = () => {
    aboutBtn.setAttribute("aria-expanded", "false");
    aboutModal.setAttribute("aria-hidden", "true");
    sound.setAttribute("aria-hidden", "false");
    lenis.stop();
    clearInterval(videoTimer);
    site.emit("about:close");
  };
  aboutBtn.addEventListener("click", openAbout);
  $("[data-js=about-close]").addEventListener("click", closeAbout);
  $("[data-js=about-overlay]").addEventListener("click", closeAbout);

  // ── Scene modal: moves the tapped tile’s template into the panel (clicks released after dragging are ignored) ──
  const detail = $("[data-js=detail]");
  const dTitle = $("[data-js=detail-title]");
  const dMedia = $("[data-js=detail-media]");
  const dDesc = $("[data-js=detail-desc]");
  const dInfo = $("[data-js=detail-info]");
  const dScroll = $("[data-js=detail-scroll]");
  const openDetail = (item) => {
    const tpl = $("[data-js=item-detail]", item).content.cloneNode(true);
    dTitle.innerHTML = $(".hd-card__title", item).innerHTML;
    dMedia.dataset.label = $(".hd-item__media .wf-img", item).dataset.label;
    $$("[data-place], [data-zone]", detail).forEach((el) => el.remove());
    dInfo.append($("[data-place]", tpl));
    dScroll.append($("[data-zone]", tpl));
    dDesc.replaceChildren(tpl);
    detail.setAttribute("aria-hidden", "false");
    site.emit("detail:open", item.dataset.id);
  };
  const closeDetail = () => {
    if (detail.getAttribute("aria-hidden") === "true") return;
    detail.setAttribute("aria-hidden", "true");
    site.emit("detail:close");
  };
  $$("[data-js=item-button]").forEach((btn) => btn.addEventListener("click", () => {
    if (!site.isDragMoved) openDetail(btn.closest("[data-js=item]"));
  }));
  $("[data-js=detail-close]").addEventListener("click", closeDetail);
  detail.addEventListener("click", (e) => { if (e.target === detail) closeDetail(); });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDetail();
    if (aboutBtn.getAttribute("aria-expanded") === "true") closeAbout();
  });
})();
