// Home page scene — plays video on the signal of the reveal panel (logo-hole-reveal) and counts the year number, company info row hover photo, Pick up number change,
// Attaches the News tab filter. Values from the original openingAnime and homeWorks
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const video = document.querySelector(".hp-mv__video");
  const count = document.querySelector(".hp-mv__count");
  const num = document.querySelector(".hp-mv__num");
  const mark = document.querySelector(".hp-mv__mark");
  const play = () => video?.play().catch(() => {});

  // Open — the original pins scroll to the top during opening, and when the hole opens it counts the number with 4s expo.inOut, then lifts it out and raises the commemorative mark
  const finishCount = () => { num.classList.add("is-hide"); mark.classList.add("is-show"); };
  const runCount = () => {
    count.classList.add("is-show");
    if (reduce) return finishCount();
    const o = { v: +num.textContent };
    gsap.to(o, { v: 2025, duration: 4, ease: "expo.inOut", onUpdate: () => (num.textContent = String(Math.ceil(o.v))), onComplete: finishCount });
  };
  addEventListener("fx:play", play);
  addEventListener("fx:done", () => document.querySelector(".hp-mv__info")?.classList.add("is-show"));
  addEventListener("fx:open", (e) => {
    if (e.detail?.quick) { count.classList.add("is-show"); setTimeout(finishCount, 1300); return; }
    runCount();
  });
  if (sessionStorage.getItem("fx-logo-hole-home") !== "1") addEventListener("DOMContentLoaded", () => {
    if (!window.lenis) return;
    window.lenis.stop();
    addEventListener("fx:done", () => window.lenis.start(), { once: true });
  });

  // Company info rows — switches to the hovered row’s photo in .6s
  const photos = [...document.querySelectorAll(".hp-links__ph")];
  document.querySelectorAll(".hp-links__list a").forEach((a) => a.addEventListener("pointerenter", () => {
    photos.forEach((p, i) => p.classList.toggle("is-on", i === +a.dataset.img));
  }));

  // Pick up — when the photo center passes the screen center, switch to that number · name (the number slides up and out in .8s and the new one rises from below)
  const box = document.querySelector(".hp-works__num");
  const name = document.querySelector(".hp-works__name");
  const items = [...document.querySelectorAll(".hp-works__item")];
  let active = 0;
  const show = (i) => {
    if (i === active) return;
    const dir = i > active ? 1 : -1;
    active = i;
    const old = box.querySelector(".is-on");
    const next = document.createElement("span");
    next.textContent = String(i + 1).padStart(2, "0");
    next.style.transform = `translate3d(0, ${dir * 100}%, 0)`;
    box.append(next);
    void next.offsetWidth;
    next.style.transform = "";
    next.classList.add("is-on");
    if (old) {
      old.classList.remove("is-on");
      old.style.transform = `translate3d(0, ${-dir * 100}%, 0)`;
      old.style.transition = "transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)";
      setTimeout(() => old.remove(), 850);
    }
    name.classList.add("is-swap");
    setTimeout(() => { name.firstElementChild.textContent = items[i].dataset.name; name.href = items[i].href; name.classList.remove("is-swap"); }, 400);
  };
  const seen = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); seen.unobserve(e.target); } }));
  items.forEach((it) => seen.observe(it));
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    items.forEach((it, i) => ScrollTrigger.create({ trigger: it, start: "center center", end: "center center", onEnter: () => show(i), onEnterBack: () => show(i) }));
  });

  // News tabs — filter by category and move the left bar
  const tabs = [...document.querySelectorAll(".hp-tabs button")];
  const cards = [...document.querySelectorAll(".hp-card")];
  tabs.forEach((t) => t.addEventListener("click", () => {
    if (t.classList.contains("is-on")) return;
    tabs.forEach((b) => b.classList.toggle("is-on", b === t));
    cards.forEach((c) => (c.hidden = t.dataset.tag !== "all" && c.dataset.tag !== t.dataset.tag));
    ScrollTrigger.refresh();
  }));

})();
