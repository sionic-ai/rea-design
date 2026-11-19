// rea-design gallery: browse rebuilt sites and motion parts. No build step, no framework.
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const P = new URLSearchParams(location.search);
const DEMO = P.has("demo");
if (DEMO) document.body.classList.add("demo");
const PAGE = DEMO ? 16 : 48;
const state = { tab: P.get("tab") || "sites", q: P.get("q") || "", k: P.get("k") || "", t: P.get("t") || "", tempo: P.get("tempo") || "", curve: P.get("curve") || "", scroll: P.get("scroll") || "", mode: P.get("mode") || "", shown: PAGE };
const pick = (P.get("pick") || "").split(",").filter(Boolean);
let sites = [], fxs = [];
const fmt = (n) => n.toLocaleString("en-US");

const load = async (f) => {
  const r = await fetch(`catalog/${f}.json`);
  return r.json();
};

function siteText(s) { return `${s.slug} ${s.title} ${s.good_for} ${s.kind} ${(s.libs || []).join(" ")} ${s.pages.map((p) => p.use).join(" ")}`.toLowerCase(); }
function fxText(f) { return `${f.name} ${f.what} ${(f.fits || []).join(" ")} ${[].concat(f.trigger).join(" ")}`.toLowerCase(); }
const words = () => state.q.toLowerCase().split(/\s+/).filter(Boolean);

function siteCard(s, i) {
  const t = s.theme || {}, m = s.mood || {};
  return `<article class="card" data-slug="${esc(s.slug)}" style="animation-delay:${Math.min(i % PAGE, 16) * 30}ms">
    <div class="shot"><img loading="lazy" src="library/${esc(s.slug)}/thumb.webp" alt="" onerror="this.parentNode.classList.add('noimg')"><span class="tag">${esc(s.kind)}</span></div>
    <div class="meta"><h3>${esc(s.title)}</h3><small>${s.pages.length} ${s.pages.length === 1 ? "page" : "pages"}</small></div>
    <p class="sub">${esc(s.good_for)}</p>
    <div class="pills"><span class="pill"><i class="sw" style="background:${esc(t.accent || "#888")}"></i>${t.mode === "dark" ? "dark" : "light"}</span>${m.tempo ? `<span class="pill">${esc([m.tempo, m.curve, m.scroll].filter(Boolean).join(" · "))}</span>` : ""}${(s.libs || []).slice(0, 2).map((l) => `<span class="pill">${esc(l.split("@")[0])}</span>`).join("")}</div>
  </article>`;
}
function fxCard(f, i) {
  return `<article class="card fx" data-fx="${esc(f.name)}" style="animation-delay:${Math.min(i % PAGE, 16) * 30}ms">
    <div class="shot"><div class="cover">${esc(f.name)}</div></div>
    <div class="meta"><h3>${esc(f.name)}</h3><small>${esc([].concat(f.trigger).join("+"))}</small></div>
    <p class="sub">${esc(f.what)}</p>
    <div class="pills"><span class="pill">${esc(f.kind)}</span>${(f.fits || []).slice(0, 3).map((x) => `<span class="pill">${esc(x)}</span>`).join("")}</div>
  </article>`;
}

function chips(el, counts, key) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  el.innerHTML = [`<button class="chip" data-v="" aria-pressed="${!state[key]}">All<span>${fmt(total)}</span></button>`,
    ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<button class="chip" data-v="${esc(k)}" aria-pressed="${state[key] === k}">${esc(k)}<span>${fmt(n)}</span></button>`)].join("");
  el.onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state[key] = b.dataset.v; state.shown = PAGE; render(); };
}

function render() {
  const ws = words();
  const isSites = state.tab === "sites";
  $("#kinds").hidden = !isSites; $("#selects").hidden = !isSites; $("#triggers").hidden = isSites;
  document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === state.tab));
  let list;
  if (isSites) {
    const pass = (s, skipKind) => (skipKind || !state.k || s.kind === state.k) && (!state.tempo || s.mood?.tempo === state.tempo) && (!state.curve || s.mood?.curve === state.curve) && (!state.scroll || s.mood?.scroll === state.scroll) && (!state.mode || (s.theme?.mode || "light") === state.mode) && ws.every((w) => siteText(s).includes(w));
    let base = pick.length ? sites.filter((s) => pick.includes(s.slug)) : sites;
    list = base.filter((s) => pass(s));
    const counts = {}; for (const s of base.filter((s) => pass(s, true))) counts[s.kind] = (counts[s.kind] || 0) + 1;
    chips($("#kinds"), counts, "k");
    $("#count").textContent = `${fmt(list.length)} of ${fmt(sites.length)} sites`;
    $("#grid").innerHTML = list.length ? list.slice(0, state.shown).map(siteCard).join("") : `<div class="empty">Nothing matches — loosen a filter.</div>`;
  } else {
    const pass = (f, skip) => (skip || !state.t || [].concat(f.trigger).includes(state.t)) && ws.every((w) => fxText(f).includes(w));
    list = fxs.filter((f) => pass(f));
    const counts = {}; for (const f of fxs.filter((f) => pass(f, true))) for (const t of [].concat(f.trigger)) counts[t] = (counts[t] || 0) + 1;
    chips($("#triggers"), counts, "t");
    $("#count").textContent = `${fmt(list.length)} of ${fmt(fxs.length)} motion parts`;
    $("#grid").innerHTML = list.length ? list.slice(0, state.shown).map(fxCard).join("") : `<div class="empty">Nothing matches — loosen a filter.</div>`;
    observeFx();
  }
  $("#more").innerHTML = list.length > state.shown ? `<button>Show more · ${fmt(list.length - state.shown)} left</button>` : "";
  const q = new URLSearchParams(Object.entries({ tab: state.tab === "sites" ? "" : state.tab, q: state.q, k: state.k, t: state.t, tempo: state.tempo, curve: state.curve, scroll: state.scroll, mode: state.mode }).filter(([, v]) => v));
  if (pick.length) q.set("pick", pick.join(","));
  if (DEMO) q.set("demo", "");
  history.replaceState(null, "", q.toString() ? `?${q}` : location.pathname);
}

// motion-part cards load their live demo only when on screen
let io;
function observeFx() {
  io?.disconnect();
  io = new IntersectionObserver((es) => {
    for (const e of es) {
      const card = e.target, shot = $(".shot", card);
      if (e.isIntersecting && !$("iframe", shot)) {
        const f = document.createElement("iframe");
        f.src = `library/_fx/${card.dataset.fx}/demo.html`; f.loading = "lazy"; f.tabIndex = -1; f.setAttribute("aria-hidden", "true");
        shot.append(f);
      } else if (!e.isIntersecting) $("iframe", shot)?.remove();
    }
  }, { rootMargin: "200px" });
  document.querySelectorAll(".card.fx").forEach((c) => io.observe(c));
}

// hover a site card: play its scroll-through preview
document.addEventListener("pointerover", (e) => {
  const card = e.target.closest(".card[data-slug]");
  if (!card || card.classList.contains("playing")) return;
  document.querySelectorAll(".card.playing").forEach((c) => c !== card && stopPreview(c));
  const shot = $(".shot", card);
  let v = $("video", shot);
  if (!v) { v = document.createElement("video"); v.muted = true; v.loop = true; v.playsInline = true; v.src = `library/${card.dataset.slug}/preview.mp4`; v.onerror = () => v.remove(); shot.append(v); }
  card.classList.add("playing"); v.play().catch(() => {});
});
document.addEventListener("pointerout", (e) => { const card = e.target.closest(".card.playing"); if (card && !card.contains(e.relatedTarget)) stopPreview(card); });
function stopPreview(card) { card.classList.remove("playing"); const v = $("video", card); if (v) { v.pause(); v.currentTime = 0; } }

// click a card: it grows into a full viewer of the live rebuilt site
const V = { el: $("#viewer"), card: $("#vcard"), from: null };
function rectOf(el) { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; }
function place(r) {
  Object.assign(V.card.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  // the page inside keeps its final size and is scaled, so it never reflows from phone to desktop mid-zoom
  const T = target(), fw = T.width, fh = T.height - 51;
  V.card.style.setProperty("--fw", `${fw}px`); V.card.style.setProperty("--fh", `${fh}px`); V.card.style.setProperty("--fs", (r.width / fw).toFixed(4));
}
function target() { const m = innerWidth < 820 ? 0 : 28; return { left: m, top: m, width: innerWidth - m * 2, height: innerHeight - m * 2 }; }
export function openSite(slug, page = "index.html") {
  const s = sites.find((x) => x.slug === slug); if (!s) return;
  const card = document.querySelector(`.card[data-slug="${CSS.escape(slug)}"] .shot`);
  V.from = card ? rectOf(card) : { left: innerWidth / 2 - 160, top: innerHeight / 2 - 100, width: 320, height: 200 };
  $("#vslug").textContent = s.slug; $("#vtitle").textContent = s.title;
  $("#vcmd").textContent = `rea get ${s.slug}`;
  $("#vposter").src = `library/${s.slug}/thumb.webp`;
  $("#vpages").innerHTML = s.pages.map((p) => `<button data-p="${esc(p.file)}" aria-current="${p.file === page}">${esc(p.type)}</button>`).join("");
  V.el.classList.remove("loaded", "settled", "on"); V.card.classList.remove("full"); V.el.hidden = false;
  V.card.style.transition = "none"; place(V.from); V.card.offsetWidth;
  V.card.style.transition = "left .75s var(--ease-io), top .75s var(--ease-io), width .75s var(--ease-io), height .75s var(--ease-io), border-radius .75s var(--ease-io)";
  const stage = $(".viewer__stage iframe");
  stage.style.transition = "opacity .5s var(--ease), transform .75s var(--ease-io)";
  requestAnimationFrame(() => { V.el.classList.add("on"); place(target()); });
  setTimeout(() => { V.card.classList.add("full"); V.el.classList.add("settled"); }, 760);
  const fr = $("#vframe"); fr.onload = () => { cleanFrame(fr); setTimeout(() => V.el.classList.add("loaded"), 150); };
  const want = new URL(`library/${s.slug}/${page}`, location.href).href;
  if (fr.src !== want) fr.src = want; else { cleanFrame(fr); V.el.classList.add("loaded"); }
  $("#vopen").href = want;
  document.body.style.overflow = "hidden";
}
// the rebuilt pages carry builder notes and a small builder bar; hide them in the viewer
function cleanFrame(fr) {
  try {
    const d = fr.contentDocument; if (!d) return;
    d.documentElement.classList.add("wf-hide-notes");
    const st = d.createElement("style"); st.textContent = ".wf-ui{display:none!important}"; d.head.append(st);
  } catch {}
}
function closeSite() {
  if (V.el.hidden) return;
  // the tile may have moved (page scrolled); shrink to where it is now
  const card = document.querySelector(`.card[data-slug="${CSS.escape($("#vslug").textContent)}"] .shot`);
  if (card) V.from = rectOf(card);
  V.el.classList.add("closing"); V.card.classList.remove("full"); V.el.classList.remove("settled", "on"); place(V.from);
  setTimeout(() => { V.el.hidden = true; V.el.classList.remove("closing", "loaded"); if (!DEMO) $("#vframe").src = "about:blank"; document.body.style.overflow = ""; }, 760);
}
$("#vclose").onclick = closeSite;
V.el.addEventListener("click", (e) => { if (e.target === V.el) closeSite(); });
addEventListener("keydown", (e) => e.key === "Escape" && closeSite());
addEventListener("resize", () => !V.el.hidden && place(target()));
$("#vpages").onclick = (e) => { const b = e.target.closest("[data-p]"); if (!b) return; $("#vframe").src = `library/${$("#vslug").textContent}/${b.dataset.p}`; $("#vpages").querySelectorAll("button").forEach((x) => x.setAttribute("aria-current", x === b)); };
$("#vcopy").onclick = () => navigator.clipboard?.writeText($("#vcmd").textContent);

document.addEventListener("click", (e) => {
  const c = e.target.closest(".card"); if (!c) return;
  if (c.dataset.slug) openSite(c.dataset.slug);
  else if (c.dataset.fx) window.open(`library/_fx/${c.dataset.fx}/demo.html`, "_blank");
});
$("#more").onclick = (e) => { if (e.target.closest("button")) { state.shown += PAGE; render(); } };
document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => { state.tab = b.dataset.tab; state.shown = PAGE; render(); }));
for (const id of ["q", "tempo", "curve", "scroll", "mode"]) { const el = $("#" + id); el.value = state[id]; el.addEventListener("input", () => { state[id] = el.value.trim(); state.shown = PAGE; render(); }); }
$("#install").onclick = () => { navigator.clipboard?.writeText("claude plugin marketplace add sionic-ai/rea-design && claude plugin install rea-design@rea-design"); $("#install .copy").textContent = "Copied"; setTimeout(() => ($("#install .copy").textContent = "Copy"), 1400); };

const [s, f] = await Promise.all([load("sites"), load("fx")]);
sites = s; fxs = f;
if (DEMO) { const order = (P.get("order") || "").split(",").filter(Boolean); if (order.length) sites = [...order.map((o) => sites.find((x) => x.slug === o)).filter(Boolean), ...sites.filter((x) => !order.includes(x.slug))]; }
$("#n-sites").textContent = $("#s-sites").textContent = fmt(sites.length);
$("#n-fx").textContent = $("#s-fx").textContent = fmt(fxs.length);
$("#s-pages").textContent = fmt(sites.reduce((a, x) => a + x.pages.length, 0));
render();
if (P.get("open")) openSite(P.get("open"));
window.rea = { openSite, closeSite };
document.dispatchEvent(new Event("rea:ready"));
