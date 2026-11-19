/* Document page: read ratio, the section being read (TOC marker + accent line), narrow-screen TOC · menu collapse */

const secs = $$("[data-doc-sec]");
const links = $$(".doc-index a");
const marker = $("[data-doc-marker]");

const setRead = (p) => {
  $$("[data-read-bar]").forEach((el) => el.style.setProperty("--read", p.toFixed(4)));
  $("[data-read-num]").textContent = `${Math.round(p * 100)}%`;
};

function initDoc({ reduce }) {
  const read = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => setRead(s.progress), onRefresh: (s) => setRead(s.progress) });
  // The highlight line settles to the section title height — gliding within one tempo like the original
  const place = (i) => {
    links.forEach((a, k) => a.setAttribute("aria-current", String(k === i)));
    const y = secs[i].offsetTop + (i === 0 ? 0 : 40);
    gsap.to(marker, { y, duration: reduce ? 0 : beats(1), ease: EASE.out, overwrite: true });
  };
  const sts = secs.map((sec, i) =>
    ScrollTrigger.create({ trigger: sec, start: "top 45%", end: "bottom 45%", onToggle: (s) => s.isActive && place(i) })
  );
  place(0);
  return () => {
    read.kill();
    sts.forEach((s) => s.kill());
  };
}

/* ---------- Narrow screens: collapse the TOC, site menu drops down ---------- */
const idxBtn = $(".doc-index-toggle");
const aside = $(".doc-aside");
idxBtn.addEventListener("click", () => {
  const open = idxBtn.getAttribute("aria-expanded") !== "true";
  idxBtn.setAttribute("aria-expanded", String(open));
  idxBtn.lastElementChild.textContent = open ? "Close −" : "Open +";
  aside.classList.toggle("is-open", open);
  ScrollTrigger.refresh();
});

const navBtn = $(".nav-toggle");
const drop = $("#nav-drop");
drop.innerHTML =
  $$(".page-nav a")
    .map((a, i) => `<a href="${a.getAttribute("href")}"${i === 0 ? ' aria-current="page"' : ""}>${a.textContent}</a>`)
    .join("") + `<a class="nav-drop-cta" href="#">${$(".top.has-nav > .btn .wf-btn").textContent}</a>`;
navBtn.addEventListener("click", () => {
  const open = navBtn.getAttribute("aria-expanded") !== "true";
  navBtn.setAttribute("aria-expanded", String(open));
  drop.classList.toggle("is-open", open);
  drop.inert = !open;
});

document.fonts.ready.then(() => {
  gsap.matchMedia().add(MEDIA, (ctx) => {
    const off = initDoc(ctx.conditions);
    ScrollTrigger.refresh();
    return off;
  });
});
