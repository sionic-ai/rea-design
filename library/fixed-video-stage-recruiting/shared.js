/* The four pages share the same header · phone menu · footer, plugged in once here, and the motion spanning several pages is hooked up here (hiding header · dropdown · menu · press-down sinking panel · text roll) */
const tyBoot = () => {
  const page = document.body.dataset.page || "index";
  // Translucent colors are resolved from skin variables into sRGB rgba — with relative color (oklab interpolation) the hover transition curve differs from the original rgba
  const probe = document.createElement("i");
  document.body.append(probe);
  [["--site-white-20", "--kf-contrast-ink", 0.2], ["--site-white-50", "--kf-contrast-ink", 0.5], ["--site-soft-line", "--kf-ink", 0.2], ["--site-ink-10", "--kf-ink", 0.1], ["--site-ink-30", "--kf-ink", 0.3], ["--site-ink-50", "--kf-ink", 0.5], ["--site-hair", "--site-shade", 0.1], ["--site-shade-20", "--site-shade", 0.2]].forEach(([name, base, a]) => {
    probe.style.color = `var(${base})`;
    const c = getComputedStyle(probe).color, m = c.match(/[\d.]+/g);
    if (c.startsWith("rgb") && m) document.documentElement.style.setProperty(name, `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${a})`);
  });
  // The back-to-top button hover color is also mixed in sRGB (80% charcoal + 20% white = Original value)
  const rgbOf = (v) => { probe.style.color = `var(${v})`; const c = getComputedStyle(probe).color; return c.startsWith("rgb") ? c.match(/[\d.]+/g).map(Number) : null; };
  const bg = rgbOf("--kf-contrast-bg"), ink = rgbOf("--kf-contrast-ink");
  if (bg && ink) document.documentElement.style.setProperty("--site-dark-hover", `rgb(${bg.slice(0, 3).map((x, i) => Math.round(x * 0.8 + ink[i] * 0.2)).join(", ")})`);
  probe.remove();
  const mm = window.matchMedia("(prefers-reduced-motion: reduce)");

  const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ty-logo" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="currentColor"/><rect x="9" y="17" width="22" height="3" rx="1.5" style="fill:var(--kf-on-accent)"/><rect x="9" y="22" width="14" height="3" rx="1.5" style="fill:var(--kf-on-accent)"/></symbol>
  <symbol id="ty-arrow" viewBox="0 0 18 15"><path d="M0 6.2h13.4L9 1.8 10.8 0 18 7.5 10.8 15 9 13.2l4.4-4.4H0z" fill="currentColor"/></symbol>
  <symbol id="ty-chara" viewBox="0 0 100 100"><rect x="8" y="10" width="84" height="80" rx="16" style="fill:var(--chara, var(--kf-accent))"/><rect x="16" y="16" width="20" height="8" rx="4" style="fill:var(--site-light);opacity:.35"/><circle cx="36" cy="46" r="7" style="fill:var(--kf-ink)"/><circle cx="64" cy="46" r="7" style="fill:var(--kf-ink)"/><rect x="42" y="62" width="16" height="8" rx="4" style="fill:var(--kf-ink)"/></symbol>
  <symbol id="ty-x" viewBox="0 0 20 20"><path d="M3 3l14 14M17 3L3 17" stroke="currentColor" stroke-width="2" fill="none"/></symbol>
  <symbol id="ty-fb" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="currentColor"/></symbol>
  <symbol id="ty-ig" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="5" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="2" fill="none"/></symbol>
</svg>`;
  const arrow = (cls = "") => `<span class="ty-arrow ${cls}" aria-hidden="true"><svg><use href="#ty-arrow"/></svg><svg><use href="#ty-arrow"/></svg></span>`;
  const chara = (n) => `<svg class="ty-chara" style="--chara: var(--site-paint-${n})" aria-hidden="true"><use href="#ty-chara"/></svg>`;
  const roll = (text) => `<span data-roll>${text}</span>`;

  const NAV = [
    { href: "list.html", page: "list", en: "Interview" },
    { href: "service.html", page: "service", en: "What We Do", drop: [["service.html#overview", "Sub Menu 1"], ["service.html#jobs", "Sub Menu 2"], ["service.html#works", "Sub Menu 3"]] },
    { href: "index.html#culture", page: "culture", en: "Culture", wide: true, drop: [["index.html#culture", "Sub Menu 1"], ["index.html#culture", "Sub Menu 2"], ["index.html#culture", "Sub Menu 3"], ["index.html#culture", "Sub Menu 4"]] },
    { href: "index.html#jobinfo", page: "jobinfo", en: "Job Information", narrow: true, drop: [["index.html#jobinfo", "Sub Menu 1"], ["index.html#jobinfo", "Sub Menu 2"], ["index.html#jobinfo", "Sub Menu 3"]] },
  ];

  const header = `
<header class="ty-head" data-slot="header">
  <h1 class="ty-head__logo"><a href="index.html"><svg><use href="#ty-logo"/></svg><p>Recruit Site</p></a></h1>
  <nav class="ty-head__nav" aria-label="Main menu">
    <ul class="ty-head__group">
      ${NAV.map((n, i) => `<li><a class="ty-roll ty-head__link -en${i ? "" : " -first"}" href="${n.href}" ${n.drop ? "data-drop-trigger" : ""}>${roll(n.en)}</a>${n.drop ? `<div class="ty-head__drop ${n.wide ? "-wide" : ""} ${n.narrow ? "-narrow" : ""}" data-drop><ul>${n.drop.map(([h, t]) => `<li><a class="ty-arrowlink" href="${h}">${t}</a></li>`).join("")}</ul></div>` : ""}</li>`).join("")}
    </ul>
    <a class="ty-roll ty-head__entry -en" href="#entry">${roll("Entry")}</a>
    <button class="ty-head__burger" type="button" aria-label="Menu" aria-expanded="false" data-burger><i></i><i></i><i></i></button>
  </nav>
</header>
<nav class="ty-menu" data-slot="mobile-menu" aria-label="Phone menu">
  <div class="ty-menu__backdrop" data-menu-close></div>
  <div class="ty-menu__wrap">
    <div class="ty-menu__inner">
      <ul class="ty-menu__list">
        <li class="ty-menu__main"><a href="index.html" ${page === "index" ? 'aria-current="page"' : ""}>Top<svg><use href="#ty-arrow"/></svg></a></li>
        ${NAV.map((n) => `<li class="ty-menu__main"><a href="${n.href}" ${page === n.page ? 'aria-current="page"' : ""}>${n.en}<svg><use href="#ty-arrow"/></svg></a>${n.drop ? `<ul class="ty-menu__sub">${n.drop.map(([h, t]) => `<li><a href="${h}" data-menu-close>${t}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}
      </ul>
    </div>
  </div>
</nav>`;

  const footer = (full) => `
<footer class="ty-foot ${full ? "" : "-lower"}" data-slot="footer">
  <div class="ty-foot__bg"></div>
  <div class="ty-foot__upper">
    <ul class="ty-foot__cards" data-slot="footer-cards">
      <li class="ty-foot__card" id="culture"><a href="index.html#culture">
        <div><p class="title -en">Culture</p><p class="text">Culture</p></div>
        <p class="desc">Your two body lines here.<br>A brief look at our work environment.</p>
        ${arrow()}
        <video src="media/footer-culture.mp4" autoplay muted loop playsinline aria-label="Office daily-life video slot · warm daylight · landscape 2.5:1 · 6.7s loop"></video>
      </a></li>
      <li class="ty-foot__card" id="jobinfo"><a href="index.html#jobinfo">
        <div><p class="title -en">Job <br class="-sp">Information</p><p class="text">Hiring Info</p></div>
        <p class="desc">Your two body lines here.<br>We gathered the information you want.</p>
        ${arrow()}
        <video src="media/footer-job.mp4" autoplay muted loop playsinline aria-label="Meeting room conversation video slot · backlit by a window · landscape 2.5:1 · 4.1s loop"></video>
      </a></li>
    </ul>
  </div>
  <div class="ty-foot__midwrap" data-sink-stack>
    <div class="ty-foot__mid" data-sink-content id="entry">
      <p class="ty-foot__lead">This is where ”Your one-line sentence here” goes. <br class="-sp">Take a step forward and join us.</p>
      <div class="ty-foot__marquee" data-slot="entry-marquee" aria-label="Entry">
        ${[0, 1, 2].map((k) => `<p class="ty-mq__set" ${k ? 'aria-hidden="true"' : ""}>Entry<span>${chara(6)}</span>Entry<span>${chara(2)}</span>Entry<span>${chara(3)}</span>Entry<span>${chara(5)}</span></p>`).join("")}
      </div>
      <nav class="ty-foot__links" data-slot="entry-links">
        <ul>
          <li class="-large"><a class="ty-foot__big" href="#entry">
            <div class="ty-foot__frame"><div class="wf-img" data-label="New employee upper body · natural office light · moment of smiling and speaking · landscape 16:9"></div></div>
            <div class="ty-foot__bigtext">
              <p><span class="-en">New graduate<br>recruitment</span><span class="-ja">New hire recruiting starts here</span></p>
              <ul class="ty-foot__period">
                <li><b>Job title 1 (description in parentheses here)</b><p>Application period: put a one-line note here.</p></li>
                <li><b>Role name 2</b><p>Application period: put a one-line note here.</p></li>
              </ul>
            </div>
            ${arrow("-blank")}
          </a></li>
          <li><a class="ty-foot__small" href="#entry">
            <div class="ty-foot__frame"><div class="wf-img" data-label="Intern student profile · daytime window light · landscape 4:1"></div></div>
            <p class="-en">Internship</p><p class="-ja">Internships are here</p>
            ${arrow("-blank")}
          </a></li>
          <li><a class="ty-foot__small" href="#entry">
            <div class="ty-foot__frame"><div class="wf-img" data-label="Experienced hire facing front · indoor lighting · landscape 4:1"></div></div>
            <p class="-en">Mid-career recruitment</p><p class="-ja">Experienced hiring is here</p>
            ${arrow("-blank")}
          </a></li>
        </ul>
      </nav>
    </div>
  </div>
  <div class="ty-foot__bottom" data-sink-trigger>
    <button class="ty-foot__top -en" type="button" data-pagetop aria-label="Page Top">${chara(2)}<span class="ty-roll ty-foot__toptext">${roll("Page Top")}</span></button>
    <div class="ty-foot__wrap">
      <div class="ty-foot__logo"><svg><use href="#ty-logo"/></svg><p>Recruit Site</p></div>
      <ul class="ty-foot__nav">
        <li><a class="ty-foot__main" href="index.html"><p>Top</p></a></li>
        ${NAV.map((n) => `<li><a class="ty-foot__main" href="${n.href}"><p>${n.en}</p></a>${n.drop ? `<ul class="ty-foot__sub">${n.drop.map(([h, t]) => `<li><a class="ty-arrowlink -sub" href="${h}">${t}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}
      </ul>
    </div>
    <div class="ty-foot__foot">
      <p class="ty-foot__copy">All Rights Reserved © Company Name</p>
      <a class="ty-foot__corp" href="index.html">Corporate site${arrow("-blank")}</a>
      <ul class="ty-foot__sns">
        <li><a href="#" aria-label="SNS 1"><svg><use href="#ty-x"/></svg><svg><use href="#ty-x"/></svg></a></li>
        <li><a href="#" aria-label="SNS 2"><svg><use href="#ty-fb"/></svg><svg><use href="#ty-fb"/></svg></a></li>
        <li><a href="#" aria-label="SNS 3"><svg><use href="#ty-ig"/></svg><svg><use href="#ty-ig"/></svg></a></li>
      </ul>
    </div>
  </div>
</footer>`;

  const cookie = `
<div class="ty-cookie hide" data-slot="cookie-notice" role="region" aria-label="Cookie Notice">
  <p class="ty-cookie__text">Hello, one line here asking for cookie consent to provide better information. Thank you<svg class="ty-chara" style="--chara: var(--site-paint-2)" aria-hidden="true"><use href="#ty-chara"/></svg></p>
  <div class="ty-cookie__btns"><button type="button" class="ty-cookie__accept">Consent</button><button type="button" class="ty-cookie__deny">Invalidation</button></div>
</div>`;

  document.body.insertAdjacentHTML("afterbegin", SPRITE + header + cookie);
  const footSlot = document.querySelector("[data-ty-footer]");
  if (footSlot) footSlot.outerHTML = footer(footSlot.dataset.tyFooter === "full");

  // Split the text into two sets and roll one character at a time .02s apart (original --index × .02s)
  document.querySelectorAll("[data-roll]").forEach((el) => {
    const label = el.textContent;
    const chars = [...label].map((c, i) => (c === " " ? `<i class="-space" style="--i:${i}"></i>` : `<i style="--i:${i}">${c}</i>`)).join("");
    el.parentElement.setAttribute("aria-label", label);
    el.outerHTML = `<span aria-hidden="true">${chars}</span><span class="-after" aria-hidden="true">${chars}</span>`;
  });

  // ── Dropdown: opens 50ms after entering, closes 50ms after leaving (original hoverInterval · blurInterval) ──
  document.querySelectorAll("[data-drop-trigger]").forEach((trigger) => {
    const drop = trigger.nextElementSibling;
    let hovering = false;
    const set = (on) => {
      hovering = on;
      setTimeout(() => {
        if (hovering !== on) return;
        trigger.classList.toggle("-open", on);
        drop.classList.toggle("-open", on);
      }, 50);
    };
    for (const el of [trigger, drop]) {
      el.addEventListener("mouseenter", () => set(true));
      el.addEventListener("mouseleave", () => set(false));
    }
    trigger.addEventListener("focus", () => set(true));
    drop.querySelectorAll("a").forEach((a) => { a.addEventListener("focus", () => set(true)); a.addEventListener("blur", () => set(false)); });
    trigger.addEventListener("blur", () => set(false));
  });

  // ── Header: hides on scroll down and shows on scroll up, hides again after 3s idle (always visible within the top 10px) ──
  const head = document.querySelector(".ty-head");
  let hideTimer = 0, lastY = scrollY, headHover = false, ticking = false;
  const startHide = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!headHover && scrollY >= 10) head.classList.add("-hide"); }, 3000);
  };
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (y < lastY) { head.classList.remove("-hide"); startHide(); } else if (y > 10) head.classList.add("-hide");
      lastY = y; ticking = false;
    });
  }, { passive: true });
  head.addEventListener("mouseenter", () => { headHover = true; head.classList.remove("-hide"); });
  head.addEventListener("mouseleave", () => { headHover = false; startHide(); });
  startHide();

  // ── Phone menu: a white panel tilted -30° pops up with elastic from 150% below after .3s ──
  const burger = document.querySelector("[data-burger]");
  const menu = document.querySelector(".ty-menu");
  const wrap = menu.querySelector(".ty-menu__wrap");
  let open = false;
  const setMenu = (on) => {
    open = on;
    menu.classList.toggle("-view", on);
    burger.classList.toggle("-open", on);
    burger.setAttribute("aria-expanded", String(on));
    if (mm.matches) { wrap.style.setProperty("--before-translate-y", on ? "0%" : "150%"); wrap.style.setProperty("--before-rotate", on ? "0deg" : "-30deg"); return; }
    gsap.to(wrap, on
      ? { "--before-translate-y": "0%", "--before-rotate": "0deg", duration: 0.8, delay: 0.3, ease: "elastic.out(1,0.75)", overwrite: true }
      : { "--before-translate-y": "150%", "--before-rotate": "-30deg", duration: 0.6, delay: 0.3, ease: "power2.out", overwrite: true });
  };
  burger.addEventListener("click", () => setMenu(!open));
  menu.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", () => open && setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setMenu(false); });

  // ── Cookie bar: on the first page it rises from below after 4.5s, on subpages immediately (.8s · opacity .6s, .2s later), and on press it slides all the way down and vanishes
  // (The original, even with a hidden flag, is overridden by a stronger rule so display never turns off and it slides the full .8s — kept exactly that way) ──
  const notice = document.querySelector(".ty-cookie");
  setTimeout(() => notice.classList.remove("hide"), page === "index" ? 4500 : 0);
  notice.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => notice.classList.add("hide")));

  // ── Footer: hides the header when visible, back-to-top button, a gray panel pressed down by the charcoal base ──
  const foot = document.querySelector(".ty-foot");
  if (foot) {
    const anchor = document.querySelector(".ty-anchor");
    // When the footer overlaps the screen, the header is switched off — on pages like lists where content fills in late via script, re-measure in place so the observer’s first verdict doesn’t linger
    const footSeen = () => {
      const r = foot.getBoundingClientRect(), on = r.top < innerHeight && r.bottom > 0;
      head.classList.toggle("-disabled", on);
      anchor?.classList.toggle("-hide", on);
    };
    addEventListener("scroll", footSeen, { passive: true });
    new ResizeObserver(footSeen).observe(document.body);
    requestAnimationFrame(footSeen);
    foot.querySelector("[data-pagetop]").addEventListener("click", () => scrollTo({ top: 0, behavior: mm.matches ? "auto" : "smooth" }));
    window.tySink(foot.querySelector("[data-sink-stack]"), foot.querySelector("[data-sink-content]"), foot.querySelector("[data-sink-trigger]"));
    const bg = foot.querySelector(".ty-foot__bg");
    if (bg && !foot.classList.contains("-lower")) {
      const fade = () => { bg.style.opacity = Math.min(Math.max(0, 1 - (foot.offsetTop - scrollY) / innerHeight), 1); };
      addEventListener("scroll", fade, { passive: true });
      fade();
    }
  }
};

/* As the next panel (trigger) rises from the bottom of the screen, the previous panel (content) is pushed down up to 150px and scaled to 0.9x with a black overlay on top. Original values kept */
window.tySink = function tySink(stack, content, trigger) {
  if (!stack || !content || !trigger || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let yStart = 0, h = 1, lastY = scrollY, ticking = false;
  const update = (y) => {
    const vh = innerHeight, n = Math.max(0, y + vh - yStart), r = n / vh;
    if (n / h > 1.4) return;
    if (n > 0) {
      content.style.transform = `translate3d(0, ${150 * r}px, 0) scale(${Math.max(0.9, 1 - 0.1 * r)})`;
      content.style.transformOrigin = "bottom center";
      stack.style.setProperty("--fade-param", String(n / vh * 0.5));
    } else {
      content.style.transform = "scale(1)";
      stack.style.setProperty("--fade-param", "0");
    }
  };
  const measure = () => { yStart = trigger.getBoundingClientRect().top + scrollY; h = trigger.offsetHeight || 1; update(scrollY); };
  addEventListener("scroll", () => {
    lastY = scrollY;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(lastY); ticking = false; });
  }, { passive: true });
  let t = 0;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(measure, 150); });
  new ResizeObserver(measure).observe(document.body);
  measure();
};

/* Subpage title — after .5s each letter randomly jumps 2px · 5~10px and tilts ±5°, then bounces back to place and text color (English letters jump in one of seven colors) */
window.tySplitTitles = function tySplitTitles(root = document) {
  const paints = [1, 2, 3, 4, 5, 6, 7].map((n) => getComputedStyle(document.documentElement).getPropertyValue(`--site-paint-${n}`).trim());
  const lines = [...root.querySelectorAll(".ty-split")];
  lines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.innerHTML = words.map((w) => `<span class="w">${[...w].map((c) => `<span class="c">${c}</span>`).join("")}</span>`).join(" ");
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { root.querySelectorAll(".ty-split .c").forEach((c) => { c.style.transform = "none"; }); return; }
  setTimeout(() => {
    lines.forEach((line, li) => {
      const en = line.classList.contains("-en") || !!line.closest(".-en");
      line.querySelectorAll(".c").forEach((c, ci) => {
        if (en) c.style.color = paints[Math.floor(Math.random() * paints.length)];
        gsap.to(c, {
          yPercent: 0, x: Math.random() * 4 - 2, y: -(Math.random() * 5 + 5), rotation: Math.random() * 10 - 5,
          duration: 0.4, ease: "power1.out", delay: 0.02 * li + 0.02 * ci,
          onComplete: () => gsap.to(c, { color: getComputedStyle(line).color, x: 0, y: 0, rotation: 0, duration: 0.5, ease: "bounce.out", onComplete: () => { c.style.color = ""; } }),
        });
      });
    });
  }, 500);
};

/* Interview card slider — the original Swiper settings (600ms · auto width · vw margins before and after) with number and progress bar */
window.tySwiper = function tySwiper(box, extra = {}) {
  const el = box.querySelector(".swiper");
  const next = box.querySelector(".-next"), prev = box.querySelector(".-prev");
  const cur = box.querySelector("[data-cur]"), total = box.querySelector("[data-total]");
  const bar = box.querySelector(".ty-iv__progress, .ty-ctrl__progress");
  let sw = null;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const sync = () => {
    if (!sw) return;
    const t = sw.slides.length, a = sw.activeIndex;
    total.textContent = pad(t); cur.textContent = pad(a + 1);
    prev.classList.toggle("-disabled", a <= 0);
    next.classList.toggle("-disabled", a >= t - 1);
    bar?.style.setProperty("--swiper-progress", String(a >= t - 1 ? 1 : (a + 1) / t));
  };
  const build = () => {
    sw?.destroy(true, true);
    const c = innerWidth / 100;
    sw = new Swiper(el, {
      speed: 600, slidesPerView: "auto", slidesOffsetBefore: 5.3 * c, slidesOffsetAfter: 5.3 * c, spaceBetween: 2 * c,
      centeredSlides: false, centeredSlidesBounds: true, grabCursor: true,
      breakpoints: { 821: { slidesOffsetBefore: 8.5 * c, slidesOffsetAfter: 64.5 * c, spaceBetween: 1.7 * c } },
      on: { slideChange: sync, progress: sync, sliderMove: sync },
      ...(typeof extra === "function" ? extra(c) : extra),
    });
    sync();
  };
  next.addEventListener("click", (e) => { e.preventDefault(); sw?.slideTo(sw.activeIndex + 1); });
  prev.addEventListener("click", (e) => { e.preventDefault(); sw?.slideTo(sw.activeIndex - 1); });
  let w = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; build(); } });
  build();
};

tyBoot();
