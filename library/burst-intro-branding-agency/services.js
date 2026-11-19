// Service — hand reactions unique to this page are handled by CSS (row hover) and shared.js (FAQ · popup). Entering with #service in the address goes straight to that row
(() => {
  const id = location.hash.slice(1);
  const landing = id && document.getElementById(id);
  if (landing) requestAnimationFrame(() => requestAnimationFrame(() => landing.scrollIntoView({ block: "start", behavior: "instant" })));
})();
