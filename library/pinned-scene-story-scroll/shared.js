// Draws the header, table of contents, story cards and initial curtain. Scene motion is raised by index.js through BS.scene().
// Smooth scroll is the same GSAP ScrollSmoother as the original (smooth 1.2 · effects off · touch 0.1).
(() => {
  const BS = (window.BS = window.BS || {});
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  const smoother = reduce ? null : ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.2, effects: false, smoothTouch: 0.1 });
  BS.smoother = smoother;
  if (smoother) smoother.paused(true);

  /* Story card — only one stands at a time, on change the old card leaves rotating 16° toward the upper right, and the new card rises from 110% below (.45s) */
  const holder = document.querySelector("[data-bs-cards]");
  let cards = [], shown = -1, cur = null;
  BS.cards = (list) => { cards = list; };
  BS.setCard = (i) => {
    if (i === shown || !holder) return;
    shown = i;
    if (cur) {
      const old = cur;
      old.classList.add("is-leave");
      setTimeout(() => old.remove(), reduce ? 0 : 450);
    }
    cur = null;
    const c = cards[i];
    if (!c) return;
    const el = document.createElement("article");
    el.className = `bs-card${c.dark ? " is-dark" : ""} is-enter`;
    el.innerHTML = `<div class="bs-card__in"><p class="bs-card__tag descriptor">${c.tag}</p>${c.title ? `<h2 class="h2">${c.title}</h2>` : ""}<p class="body">${c.body}</p></div>`;
    holder.appendChild(el);
    cur = el;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-enter")));
  };

  /* Index — only the current section is dark, click to glide to the start of that section */
  const items = [...document.querySelectorAll(".bs-contents__item")];
  BS.chapter = (n) => items.forEach((b, i) => (i === n ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current")));
  items.forEach((b) => b.addEventListener("click", () => {
    const target = document.querySelector(`[data-chapter="${b.dataset.goto}"]`);
    if (!target) return;
    const st = ScrollTrigger.getAll().find((t) => t.trigger === target && t.pin);
    const y = st ? st.start : target.offsetTop;
    if (smoother) smoother.scrollTo(y, true); else scrollTo({ top: y, behavior: "smooth" });
  }));

  /* Leash — the end (bottom-right of the box) follows the mouse at horizontal 31.3 + 0.0691x (28~136) and vertical 444.8 + 0.218y (425~645) (px at 1440, values measured from the original). Only for 30 frames (.5s) after the mouse moves, each frame it is pulled 0.11 of the remaining distance, then it stops — curve·length measured from the original (it does not go all the way, stopping at 89%) */
  const leash = document.querySelector("[data-bs-leash]");
  if (leash && !reduce && matchMedia("(hover: hover)").matches) {
    const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
    const cur = { w: leash.offsetWidth, h: leash.offsetHeight }, aim = { ...cur };
    let raf = 0, left = 0;
    const step = () => {
      cur.w += (aim.w - cur.w) * 0.11;
      cur.h += (aim.h - cur.h) * 0.11;
      leash.style.width = `${cur.w}px`;
      leash.style.height = `${cur.h}px`;
      raf = --left > 0 ? requestAnimationFrame(step) : 0;
    };
    addEventListener("pointermove", (e) => {
      const k = innerWidth / 1440, x = e.clientX / k, y = e.clientY / k;
      aim.w = clampN(31.3 + 0.0691 * x, 28, 136) * k;
      aim.h = clampN(444.8 + 0.218 * y, 425, 645) * k;
      left = 30;
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: true });
  }

  /* Opening curtain — counts from 05 up to page 1 over 5 seconds, and when ready counts down from there to 0 at .45s per step.
     When counting ends, the curtain disappears in .35s and the number in .45s power2.out, and the helmet logo rises into the head spot over 1.4s power3.inOut */
  const pre = document.querySelector("[data-bs-preloader]");
  const count = document.querySelector("[data-bs-count]");
  const logo = document.querySelector("[data-bs-headlogo]");
  const pad = (v) => String(Math.round(v)).padStart(2, "0");
  BS.intro = (paper) => new Promise((resolve) => {
    if (reduce || !pre) {
      pre?.remove();
      logo?.classList.add("is-active");
      html.classList.add("is-ready");
      smoother?.paused(false);
      return resolve();
    }
    gsap.set(logo, { transform: "translateY(34vh) translateX(-50%) scale(2.4)" });
    const d = { value: 5 };
    count.textContent = pad(d.value);
    const climb = gsap.to(d, { value: 1, duration: 5, ease: "none", onUpdate: () => (count.textContent = pad(d.value)) });
    // In the original, ScrollSmoother is ready immediately and counts down from nearly 05 — waits only for fonts
    const ready = Promise.resolve(document.fonts?.ready);
    ready.then(() => {
      climb.kill();
      const left = Math.max(d.value, 0);
      gsap.timeline({ onComplete: () => { smoother?.paused(false); resolve(); } })
        .to(d, { value: 0, duration: Math.max(left * 0.45, 0.45), ease: "none", onUpdate: () => (count.textContent = pad(d.value)), onComplete: () => (count.textContent = "00") })
        .to(pre.querySelector(".bs-preloader__bg"), { autoAlpha: 0, duration: 0.35, ease: "power2.out" })
        .to(count, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, "<")
        .set(paper, { rotationX: -90, rotationY: 180, transformOrigin: "50% 100%", transformPerspective: 1200 }, "<")
        .addLabel("intro")
        .call(() => logo.classList.add("is-active"))
        .to(logo, { transform: "translateY(0) translateX(-50%) scale(1)", duration: 1.4, ease: "power3.inOut" }, "intro")
        .call(() => pre.classList.add("is-off"))
        .to(paper, { rotationX: 0, rotationY: 0, duration: 1.6, ease: "power3.out" }, "intro+=0.2")
        .call(() => html.classList.add("is-ready"), undefined, "intro+=1.2");
    });
  });
})();
