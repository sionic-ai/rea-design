// First page: intro scramble → flame → button. Pressing fills six slot labels and releasing changes the video. On phone, flip one card.
(() => {
  const { scrambleIn, scrambleOut, goTo, playIntro, onClipEnd, showLogo, showCursor, hideCursor, reduced } = window.T;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isSp = () => matchMedia("(max-width: 767px)").matches;

  const welcome = $(".t-intro__welcome");
  const discover = $(".t-intro__discover");
  const items = $$(".t-item");
  const viewSide = $('[data-side="view"]');
  const aboutSide = $('[data-side="about"]');
  const PROJECTS = items.map((it) => $$(".t-scr", it).map((s) => s.dataset.text));
  let unlocked = false, autoUnlocked = false, current = 0, viewShown = false;

  // Bring up a project (on the frame the swap begins): turn on the logo, and the first time, scramble the left ‹View› for 1.5s
  const showProject = (id) => {
    current = id;
    showLogo(id);
    if (viewShown) return;
    viewShown = true;
    gsap.set(viewSide, { opacity: 1 });
    scrambleIn($(".t-scr", viewSide), { duration: 1.5, revealDelay: 0.2, speed: 0.3 });
  };
  // When the intro video ends, move on to project 01, and the cursor wraps that cell, lingering, then lifts off
  const showFirst = () => goTo(1, () => {
    showProject(1);
    items[0].dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    items[0].dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body }));
  });

  // ── About timeline (original order · values): two lines 1.8s → diamonds 1s at .15 intervals (minimum 1.75s) → after 2.5s the two lines collapse in .7s · intro video plays → button ──
  const appear = gsap.timeline();
  $$(".t-scr", welcome).forEach((el, i) => appear.add(scrambleIn(el, { duration: 1.8, revealDelay: 0, speed: 0.3 }), i * 0.15));
  const diamonds = gsap.timeline();
  items.forEach((it, i) => diamonds.to($$(".t-diamond svg, .t-diamond span", it), { opacity: 1, duration: 1, ease: "power2.out" }, i * 0.15));
  if (diamonds.duration() < 1.75) diamonds.set({}, {}, 1.75);
  const leave = gsap.timeline({ onStart: playIntro });
  $$(".t-scr", welcome).reverse().forEach((el, i) => leave.add(scrambleOut(el, 0.7), i * 0.1));
  const arrowPaths = $$(".t-arrow path");
  arrowPaths.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
  // The original makes the button clickable as soon as its text is fully resolved, and draws the arrow and brackets after that
  const disc = gsap.timeline();
  disc.set(discover, { opacity: 1 })
    .add(scrambleIn($(".t-scr", discover), { duration: 0.7, revealDelay: 0, speed: 0.4 }))
    .call(() => { discover.classList.add("is-ready"); discover.tabIndex = 0; });
  arrowPaths.forEach((p) => disc.to(p, { strokeDashoffset: 0, duration: 0.4, ease: "power2.inOut" }));
  disc.to(discover, { "--brackets-opacity": 1, duration: 0.5, ease: "power2.out" }, "+=1");
  const intro = gsap.timeline().add(appear).add(diamonds, "+=0.1").add(leave, "+=2.5").add(disc, "+=0.1");
  if (reduced) intro.progress(1);
  // Even without pressing the button, the intro video opens itself 1 second before it ends
  onClipEnd(() => {
    autoUnlocked = true;
    if (discover.classList.contains("is-ready")) openIndex();
  });

  // ── Button → button collapses over .8s, then .3s later each label fills with a random start (0~1.5s), length (.8~2.3s) and speed (.15~.55) ──
  const openIndex = () => {
    if (!discover.classList.contains("is-ready") || unlocked) return;
    unlocked = true;
    // In the original only the letters collapse over .8s, while the brackets and hand hooks stay until they vanish with the button — meanwhile the cursor wraps the shrinking button and follows it
    scrambleOut($(".t-scr", discover), 0.8);
    // The original unlocks the cell .8s after the buttons have all collapsed (onUnlock), drops the whole About panel, then moves to the first project — only an unlocked cell lets the cursor wrap around it and stay
    gsap.delayedCall(reduced ? 0 : 0.8, () => {
      items.forEach((it) => { it.setAttribute("aria-disabled", "false"); it.tabIndex = 0; });
      $(".t-intro").remove();
      if (isSp()) openMobile();
      else if (autoUnlocked) showFirst();
      else onClipEnd(showFirst);
    });
    const fill = gsap.timeline({ delay: 0.3 }).set(".t-info", { opacity: 1 });
    $$(".t-info .t-scr").forEach((el) => fill.add(scrambleIn(el, { duration: 0.8 + Math.random() * 1.5, revealDelay: 0.1, speed: 0.15 + Math.random() * 0.4 }), Math.random() * 1.5));
    gsap.timeline({ delay: 0.2 }).set(aboutSide, { opacity: 1 }).add(scrambleIn($(".t-scr", aboutSide), { duration: 1.5, revealDelay: 0.2, speed: 0.3 }));
    if (reduced) gsap.globalTimeline.getChildren().forEach((t) => t.progress?.(1));
  };
  discover.addEventListener("click", openIndex);
  discover.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIndex(); } });

  // ── On hover swaps to that project’s video, and shows the logo and the left ‹View› when the swap starts ──
  items.forEach((it) => {
    const id = Number(it.dataset.id);
    const enter = () => {
      if (it.getAttribute("aria-disabled") === "true") return;
      goTo(id, () => showProject(id));
    };
    it.addEventListener("mouseenter", enter);
    it.addEventListener("focus", enter);
    it.addEventListener("click", () => { if (it.getAttribute("aria-disabled") !== "true") leaveTo(id); });
    it.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); it.click(); } });
  });
  viewSide.addEventListener("click", () => { if (viewShown) leaveTo(current); });

  // ── Going to a project: video and cursor leave in .3s, .25s later the contents leave in .35s, leaving only the logo (original values) ──
  // Project detail was not recorded so it isn’t built — shows a logo-only screen briefly, then returns
  const leaveTo = () => {
    const tl = gsap.timeline();
    tl.to(window.T.stageEl, { opacity: 0, duration: 0.3, ease: "power2.inOut" }, 0)
      .add(hideCursor(0.3), 0)
      .to([".t-layout", ".t-side", ".t-mob"], { opacity: 0, duration: 0.35, ease: "power2.inOut" }, 0.25)
      .to({}, { duration: 1.2 })
      .to([window.T.stageEl, ".t-layout", ".t-side"], { opacity: 1, duration: 0.5, ease: "power2.out" })
      .add(showCursor(), "<");
    if (isSp()) tl.to(".t-mob", { opacity: 1, duration: 0.5 }, "<");
  };

  // ── Phone: one card + prev · menu · next ──
  const mob = $(".t-mob");
  const card = $(".t-mob__card");
  const cardSlots = $$(".t-scr", card);
  const prev = $(".t-mob__btn--prev"), next = $(".t-mob__btn--next");
  const menu = $(".t-menu"), menuBtn = $(".t-mob__menu-btn"), nav = $(".t-menu__nav");
  const showCard = (id, first) => {
    current = id;
    $(".t-mob__num").textContent = id;
    PROJECTS[id - 1].forEach((text, i) => {
      cardSlots[i].dataset.text = text;
      if (first) cardSlots[i].textContent = "";
      scrambleIn(cardSlots[i], { duration: 0.8, revealDelay: 0.1, speed: 0.3 });
    });
    goTo(id, () => showProject(id));
    prev.disabled = id === 1;
    next.disabled = id === PROJECTS.length;
    $$(".t-menu__item", nav).forEach((b, i) => b.classList.toggle("is-active", i === id - 1));
  };
  function openMobile() {
    gsap.to(mob, { opacity: 1, duration: 0.5, delay: 0.3 });
    card.classList.remove("t-locked");
    showCard(1, true);
  }
  nav.append(...PROJECTS.map((p, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "t-menu__item";
    b.innerHTML = `<span class="t-menu__index">0${i + 1}</span><span class="t-menu__title"></span>`;
    b.lastChild.textContent = p[0];
    b.addEventListener("click", () => { closeMenu(); showCard(i + 1); });
    return b;
  }));
  const flash = (b) => { b.classList.add("is-active"); setTimeout(() => b.classList.remove("is-active"), 300); };
  prev.addEventListener("click", () => { if (current > 1) { flash(prev); showCard(current - 1); } });
  next.addEventListener("click", () => { if (current < PROJECTS.length) { flash(next); showCard(current + 1); } });
  const openMenu = () => { menu.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.3 }); };
  const closeMenu = () => { menuBtn.setAttribute("aria-expanded", "false"); gsap.to(menu, { opacity: 0, duration: 0.2, onComplete: () => (menu.hidden = true) }); };
  menuBtn.addEventListener("click", openMenu);
  $(".t-menu__close").addEventListener("click", closeMenu);
  $(".t-mob__cta").addEventListener("click", () => leaveTo(current));
  card.addEventListener("click", () => leaveTo(current));
})();
