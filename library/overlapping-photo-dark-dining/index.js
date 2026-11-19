// First page — fixed video and sound bar, two half-and-half photo cells, flame curtain copy, photo column, news window, phone play button
KC.page("home", ({ main, second }) => {
  const { $, $$, still, circle, d } = KC;
  const kv = $(".kc-kv", main);
  const kvVideo = $("video", kv);
  const sound = $(".kc-sound", main);
  const about = $(".kc-about", main);
  const fireVideo = $(".kc-about__video video", main);
  const movieBtn = $(".kc-moviebtn", main);
  let kvHls = null;
  let fireHls = null;

  // ---------- Hero video — reloads as the PC or phone version each time it crosses 900px ----------
  const mq = matchMedia("(min-width: 900px)");
  const loadKv = () => {
    kvHls?.destroy();
    kvHls = KC.hlsLoad(kvVideo, mq.matches ? "media/kv.m3u8" : "media/kv-sp.m3u8");
  };
  loadKv();
  // On first visit shared plays when the loader lifts — if arriving again via swup, right away
  if (second || still) KC.play(kvVideo);
  const onDevice = () => {
    loadKv();
    KC.play(kvVideo);
  };
  mq.addEventListener("change", onDevice);

  // ---------- Sound bar — on press the sound fills up over .6s, and on pressing again it fades down and then mutes ----------
  let soundOn = false;
  const onSound = () => {
    gsap.killTweensOf(kvVideo);
    soundOn = !soundOn;
    sound.classList.toggle("is-on", soundOn);
    if (soundOn) {
      kvVideo.muted = false;
      kvVideo.volume = 0;
      gsap.to(kvVideo, { volume: 1, duration: 0.6, ease: "none" });
    } else gsap.to(kvVideo, { volume: 0, duration: 0.6, ease: "none", onComplete: () => (kvVideo.muted = true) });
  };
  sound.addEventListener("click", onSound);

  // ---------- News window — 1s after if the loader was seen in the session, otherwise 3s. Once closed, it doesn’t show again this session ----------
  const news = $("#news-modal", main);
  if (sessionStorage.getItem("kc-news") === "true") gsap.set(news, { display: "none" });
  else {
    KC.stop();
    gsap
      .timeline({ delay: d(KC.loaded() ? 1 : 3) })
      .to(news, { opacity: 1, duration: d(0.6), ease: "power1.out" })
      .to(".kc-news__inner", { y: 0, opacity: 1, duration: d(0.6), ease: "power1.out" }, "-=0.4");
    $$(".kc-news__close, .kc-news__bg", main).forEach((el) =>
      el.addEventListener("click", () =>
        gsap
          .timeline()
          .to(news, { opacity: 0, duration: d(0.3), ease: "power2.out" })
          .set(news, {
            display: "none",
            onComplete: () => {
              KC.start();
              sessionStorage.setItem("kc-news", "true");
            },
          })
      )
    );
  }

  // ---------- Flame veil — switches on when the bar section’s bottom reaches the screen bottom, then loads the video and plays ----------
  ScrollTrigger.create({
    trigger: ".kc-detail--b",
    start: "bottom bottom+=10",
    onEnter: () => {
      about.classList.add("is-view");
      fireHls?.destroy();
      fireHls = KC.hlsLoad(fireVideo, "media/fire.m3u8");
      KC.play(fireVideo);
    },
    onLeaveBack: () => {
      about.classList.remove("is-view");
      fireVideo.pause();
    },
  });
  $$(".kc-about__title .line", main).forEach((line) => KC.split(line));
  const words = (sel) => $$(`.kc-about__title .line${sel} span`, main);
  // Original kvTextAnimationPC and SP: letters rise as the mask moves from 0% to 80%
  const showTitle = (pc) => {
    const set = pc
      ? [[".sp-none[data-line='1']", 0], [".sp-none[data-line='2']", 0.1]]
      : [[".sp-on[data-line='1']", 0], [".sp-on[data-line='2']", 0.05], [".sp-on[data-line='3']", 0.1]];
    set.forEach(([sel, delay]) =>
      gsap.to(words(sel), { maskPosition: "0% 80%", webkitMaskPosition: "0% 80%", y: 0, duration: d(pc ? 0.5 : 0.3), ease: "power2.out", stagger: still ? 0 : pc ? 0.04 : 0.03, delay: d(delay) })
    );
    gsap.to(".kc-about__text", { opacity: 1, y: 0, duration: d(1), ease: "power2.out", delay: d(0.2) });
    gsap.to(".kc-about .kc-btn-text", { opacity: 1, y: 0, duration: d(1), ease: "power2.out", delay: d(0.3) });
  };

  const hideKv = () => {
    kvVideo.pause();
    kv.classList.add("is-hidden");
  };
  const showKv = () => {
    kv.classList.remove("is-hidden");
    KC.play(kvVideo);
  };

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 900px)", sp: "(max-width: 899px)" }, (ctx) => {
    const { pc } = ctx.conditions;
    ScrollTrigger.create({ trigger: ".kc-detail--b", start: "bottom 50%", onEnter: () => showTitle(pc) });

    if (pc) {
      gsap.set(movieBtn, { display: "none" });
      gsap.set(sound, { display: "flex", opacity: 1 });
      if (still) {
        gsap.set(".kc-detail .kc-stack__item:first-child .wf-img:first-child", { opacity: 1 });
        return;
      }
      const soundOff = () => {
        gsap.killTweensOf(sound);
        gsap.to(sound, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => gsap.set(sound, { display: "none" }) });
      };
      const soundBack = () => {
        gsap.killTweensOf(sound);
        gsap.set(sound, { display: "flex" });
        gsap.to(sound, { opacity: 1, duration: 0.3, ease: "power2.out" });
      };
      KC.stack($(".kc-detail--a", main), { pin: $(".kc-detail--a .kc-detail__inner", main), enter: "section", dur: 0, onPass: [soundOff, soundBack], onPin: [hideKv, showKv] });
      KC.stack($(".kc-detail--b", main), { pin: $(".kc-detail--b .kc-detail__inner", main), enter: "pin", dur: 0.1 });
      return;
    }

    // Phone — instead of a fixed photo box, the first box’s three photos cross-fade every 3s, and when the first section touches the top, the video and play button are removed
    gsap.set(".kc-detail .wf-img", { clearProps: "clipPath,transform,opacity" });
    const timers = $$(".kc-detail", main).map((sec) => {
      const imgs = $$(".kc-stack__item:first-child .wf-img", sec);
      let i = 0;
      imgs[0].classList.add("active");
      return setInterval(() => {
        imgs[i].classList.remove("active");
        i = (i + 1) % imgs.length;
        imgs[i].classList.add("active");
      }, 3000);
    });
    // Original movieCircleAnime — first time 2.2s, and when returning via swup the circle is drawn after .6s
    const delay = d(second ? 0.6 : 2.2);
    gsap.set(movieBtn, { display: "block" });
    gsap.to(".kc-moviebtn .circle", { strokeDasharray: "825.82 825.82", duration: d(1), ease: circle, delay });
    gsap.to(".kc-moviebtn .inner", { opacity: 1, duration: d(1), ease: "power3.out", delay });
    ScrollTrigger.create({
      trigger: ".kc-detail--a",
      start: "top top",
      onEnter: () => {
        hideKv();
        gsap.set(movieBtn, { display: "none" });
      },
      onLeaveBack: () => {
        showKv();
        gsap.set(movieBtn, { display: "block" });
      },
    });
    return () => {
      timers.forEach(clearInterval);
      $$(".kc-detail .wf-img.active", main).forEach((el) => el.classList.remove("active"));
    };
  });

  KC.parallax($(".kc-gallery", main));
  movieBtn.addEventListener("click", KC.openMovie);

  return () => {
    mq.removeEventListener("change", onDevice);
    mm.revert();
    kvHls?.destroy();
    fireHls?.destroy();
    kvVideo.pause();
    fireVideo.pause();
  };
});
