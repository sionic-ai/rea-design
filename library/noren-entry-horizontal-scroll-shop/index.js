// First page only: opening screen, story scroll (screen-pinned horizontal flow + background gradient interpolation per section), hiding the header, progress bar, skip.
// Original values: when the opening video ends (or isn’t found, or 10s pass, or Skip is pressed) a 1.5s fade (jQuery fadeOut swing = sine.inOut) ·
// Track width (100×count+20)% · PC 3 items 1.15x·scrub 1, phone (600 or less) 9 items·scrub 2 · gradients on PC items 3·4·5, phone items 6·7·8.
// Interpolates while passing the screen center (left center ~ right center) · the head hides on scroll down at 1025px or more (5px threshold) ·
// Progress dot top 5px→100% scrub 1, the bar switches on with scrub 1 when the content’s top edge touches the top of the screen · Skip moves behind a .8s cream curtain ·
// The name brush-calligraphy video plays from the start whenever more than half is visible, and stops when out of view
(() => {
  const { reduced } = KB;
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const rgba = (hex, a) => {
    const [r, g, b] = gsap.utils.splitColor(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // Opening screen — lifts once the video matching the width ends
  const loader = document.querySelector(".kb-loader");
  const closeLoader = () => {
    if (!loader || loader.dataset.closed) return;
    loader.dataset.closed = "1";
    loader.querySelectorAll("video").forEach((v) => v.pause());
    gsap.to(loader, { opacity: 0, duration: reduced ? 0 : 1.5, ease: "sine.inOut", onComplete: () => (loader.style.display = "none") });
  };
  if (loader) {
    loader.querySelector(".kb-skip").addEventListener("click", closeLoader);
    const video = loader.querySelector(innerWidth < 601 ? ".kb-loader__video.is-sp" : ".kb-loader__video.is-pc");
    if (reduced || !video) setTimeout(closeLoader, reduced ? 0 : 10000);
    else if (video.ended) closeLoader();
    else {
      video.addEventListener("ended", closeLoader);
      setTimeout(closeLoader, 10000);
    }
  }

  // Skip — cover with a cream veil and jump straight to the content
  const fade = document.createElement("div");
  fade.className = "kb-fade";
  document.body.append(fade);
  document.querySelectorAll(".kb-story .kb-skip").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      fade.classList.add("is-active");
      setTimeout(() => {
        scrollTo(0, target.getBoundingClientRect().top + scrollY);
        document.querySelector(".kb-head")?.classList.remove("is-hidden");
        setTimeout(() => fade.classList.remove("is-active"), 200);
      }, reduced ? 0 : 800);
    }),
  );

  // Header: hides when scrolling down inside the scroll roll, reveals on scrolling up
  const head = document.querySelector(".kb-head");
  const story = document.querySelector(".kb-story");
  let last = scrollY;
  let shown = true;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (innerWidth < 1025 || Math.abs(last - y) <= 5) return;
    const top = story.getBoundingClientRect().top + y;
    const inStory = y >= top - head.offsetHeight && y < top + story.offsetHeight;
    const down = y > last;
    if (inStory && down && shown) { shown = false; head.classList.add("is-hidden"); }
    else if ((!inStory || !down) && !shown) { shown = true; head.classList.remove("is-hidden"); }
    last = y;
  }, { passive: true });

  // Name calligraphy video in the last section — the original restarts from the beginning when over half the panel is visible, and pauses when it leaves
  document.querySelectorAll(".kb-story__name video").forEach((video) => {
    if (reduced) { video.addEventListener("loadedmetadata", () => (video.currentTime = video.duration), { once: true }); return; }
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { video.currentTime = 0; video.play().catch(() => {}); }
      else video.pause();
    }), { threshold: 0.5 }).observe(video.parentElement);
  });

  // Per-section background gradient: original values (angle · top · center · center position · bottom) as skin variables
  const bg = v("--kf-bg"), sf = v("--kf-surface"), sky = v("--kf-accent");
  const blush = gsap.utils.interpolate(sf, bg, 0.12);
  const G = {
    s3a: [180, bg, rgba(sf, 0.5), 53, sky],
    s3b: [180, sky, rgba(sf, 0.5), 56.5, blush],
    s4b: [0, rgba(sf, 0.2), blush, 27.53, blush],
    mid: [90, rgba(sf, 0.2), rgba(sf, 0.2), 50, rgba(sf, 0.2)],
    s5b: [180, bg, rgba(sf, 0.7), 53, sky],
  };
  const grad = ([a, t, m, p, b]) => `linear-gradient(${a}deg, ${t} 0%, ${m} ${p}%, ${b} 100%)`;
  const lerp = (A, B, t) => A.map((x, i) => gsap.utils.interpolate(x, B[i], t));
  const easeIO = (t) => (t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1);
  // Pin one scroll and push it horizontally — three sections for gradient interpolation from the third row
  const scroll = (story, scrub, widths, gradSecs) => {
    const track = story.querySelector(".kb-story__track");
    const secs = [...track.children];
    const n = secs.length;
    if (widths) secs.forEach((s, i) => gsap.set(s, { width: `${widths(i) / n}%` }));
    gsap.set(track, { width: `${100 * n + 20}%` });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: story, pin: true, start: "top top", end: () => `+=${track.offsetWidth}`, anticipatePin: 1, scrub, invalidateOnRefresh: true },
    });
    tl.to(track, { x: () => -(track.offsetWidth - innerWidth), ease: "none" });
    [
      [secs[gradSecs[0]], G.s3a, G.s3b, false],
      [secs[gradSecs[1]], G.s3b, G.s4b, false],
      [secs[gradSecs[2]], G.s4b, G.s5b, true],
    ].forEach(([sec, from, to, viaMid]) => {
      ScrollTrigger.create({
        trigger: sec, containerAnimation: tl, start: "left center", end: "right center", invalidateOnRefresh: true,
        onUpdate: (st) => {
          const p = st.progress;
          story.style.background = grad(viaMid ? (p < 0.5 ? lerp(from, G.mid, p * 2) : lerp(G.mid, to, (p - 0.5) * 2)) : lerp(from, to, easeIO(p)));
        },
      });
    });
    return () => { story.style.background = ""; gsap.set([track, ...secs], { clearProps: "width,transform" }); };
  };

  // Phone has its own story panel — move the #story name to the visible panel
  const storySp = document.querySelector(".kb-story--sp");
  const setStoryHeight = () => storySp.style.setProperty("--kb-story-h", `${innerHeight}px`);

  const mm = gsap.matchMedia();
  mm.add("(min-width: 601px)", () => { story.id = "story"; storySp.removeAttribute("id"); });
  mm.add("(max-width: 600px)", () => {
    storySp.id = "story"; story.removeAttribute("id");
    setStoryHeight();
    addEventListener("resize", setStoryHeight);
    return () => removeEventListener("resize", setStoryHeight);
  });
  mm.add("(min-width: 601px) and (prefers-reduced-motion: no-preference)", () => scroll(story, 1, (i) => (i === 2 ? 115 : 100), [2, 3, 4]));
  mm.add("(max-width: 600px) and (prefers-reduced-motion: no-preference)", () => scroll(storySp, 2, null, [5, 6, 7]));

  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    const contents = document.querySelector("#contents");
    gsap.fromTo(".kb-progress__dot", { top: 5 }, { top: "100%", ease: "none", scrollTrigger: { trigger: contents, start: "top top", end: "bottom bottom", scrub: 1 } });
    gsap.fromTo(".kb-progress", { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: contents, start: "top top", end: "top top", scrub: 1 } });
  });
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: reduce)", () => gsap.set(".kb-progress", { opacity: 1 }));
})();
