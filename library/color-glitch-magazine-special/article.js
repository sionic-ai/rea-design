// Article page — guide expand, DAY tabs (bottom strip scaleX by the unread part of the panel), header chip → scroll to that spot in .5s power2.inOut, right handle drag
(() => {
  const intro = document.querySelector(".ar-intro");
  const openBtn = intro.querySelector(".ar-intro__open");
  openBtn.addEventListener("click", () => openBtn.setAttribute("aria-expanded", intro.classList.toggle("is-open")));

  // The five-day board clones the first day’s board to fill the slots — the receiving side swaps in a different conversation each day
  const area = document.querySelector(".ar-chat__area");
  const first = area.querySelector(".ar-day");
  for (let d = 2; d <= 5; d++) {
    const k = first.cloneNode(true);
    k.dataset.day = d;
    k.querySelector(".ar-day__next button").textContent = `DAY ${d + 1}`;
    area.append(k);
  }
  const days = [...area.querySelectorAll(".ar-day")];
  const tabs = [...document.querySelectorAll(".ar-tab")];
  let now = 0;
  const show = (i) => {
    now = i;
    days.forEach((d, n) => { d.hidden = n !== i; });
    tabs.forEach((t, n) => { t.classList.toggle("is-active", n === i); t.setAttribute("aria-selected", n === i); });
    area.scrollTop = 0;
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  days.forEach((d, i) => {
    d.querySelector(".ar-day__next button").addEventListener("click", () => show(Math.min(i + 1, days.length - 1)));
    const chips = [...d.querySelectorAll(".ar-chip")], blocks = [...d.querySelectorAll(".ar-block")];
    chips.forEach((c, n) => c.addEventListener("click", () => {
      const to = blocks[n].offsetTop - kk.val(20, 50);
      gsap.to(area, { scrollTo: { y: to, autoKill: false }, duration: kk.reduce ? 0 : 0.5, ease: "power2.inOut" });
      gsap.to(d.querySelector(".ar-day__head"), { scrollTo: { x: c.offsetLeft - kk.val(24, 32) }, duration: kk.reduce ? 0 : 0.5, ease: "power2.inOut" });
    }));
  });
  show(0);

  const thumb = document.querySelector(".ar-chat__thumb");
  const progress = () => {
    const max = area.scrollHeight - area.clientHeight;
    const p = max > 0 ? area.scrollTop / max : 0;
    tabs[now].querySelector(".ar-tab__bg").style.transform = `scaleX(${p})`;
    const d = days[now], blocks = [...d.querySelectorAll(".ar-block")], chips = [...d.querySelectorAll(".ar-chip")];
    let cur = 0;
    blocks.forEach((b, n) => { if (b.offsetTop - 80 <= area.scrollTop) cur = n; });
    chips.forEach((c, n) => c.classList.toggle("is-active", n === cur));
    const top = area.offsetTop, room = area.clientHeight - thumb.offsetHeight - 120;
    thumb.style.top = `${top + 60 + p * room}px`;
  };
  area.addEventListener("scroll", progress, { passive: true });
  progress();

  let drag = null;
  thumb.addEventListener("pointerdown", (e) => { drag = { y: e.clientY, s: area.scrollTop }; thumb.classList.add("is-drag"); thumb.setPointerCapture(e.pointerId); });
  thumb.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const max = area.scrollHeight - area.clientHeight, room = area.clientHeight - thumb.offsetHeight - 120;
    area.scrollTop = drag.s + ((e.clientY - drag.y) / Math.max(1, room)) * max;
  });
  const end = () => { drag = null; thumb.classList.remove("is-drag"); };
  thumb.addEventListener("pointerup", end);
  thumb.addEventListener("pointercancel", end);
})();
