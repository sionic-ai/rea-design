// Phone frame — instead of the original phone photo and app screen art, draws a frame of the same ratio (985:2000) and an app screen placeholder in our SVG.
// The screen holds only the status bar, search field, list rows and bottom tab bar, the slot for the card (.phone__card) is left empty.
(() => {
  const rows = (n, y0) => Array.from({ length: n }, (_, i) => {
    const y = y0 + i * 92;
    return `<rect class="ph-ui-row" x="96" y="${y}" width="793" height="76" rx="14"/><rect class="ph-ui-bar" x="124" y="${y + 22}" width="${210 + ((i * 53) % 120)}" height="12" rx="6"/><rect class="ph-ui-bar is-dim" x="124" y="${y + 44}" width="140" height="10" rx="5"/>`;
  }).join("");
  const svg = (screen) => `<svg class="phone-device" viewBox="0 0 985 2000" aria-hidden="true">
    <rect class="ph-body" x="6" y="6" width="973" height="1988" rx="158"/>
    <rect class="ph-btn" x="0" y="420" width="8" height="120" rx="3"/><rect class="ph-btn" x="0" y="580" width="8" height="200" rx="3"/><rect class="ph-btn" x="977" y="560" width="8" height="260" rx="3"/>
    <rect class="ph-screen" x="34" y="34" width="917" height="1932" rx="132"/>
    ${screen ? `<text class="ph-ui-time" x="150" y="118">9:41</text>
    <rect class="ph-ui-bar" x="760" y="94" width="120" height="22" rx="8"/>
    <circle class="ph-ui-row" cx="140" cy="215" r="34"/><rect class="ph-ui-row" x="196" y="181" width="560" height="68" rx="34"/><rect class="ph-ui-bar is-dim" x="250" y="209" width="120" height="12" rx="6"/>
    <rect class="ph-ui-row" x="790" y="181" width="68" height="68" rx="16"/>
    ${rows(screen === "list" ? 9 : 0, 300)}
    <rect class="ph-ui-tab" x="290" y="1760" width="300" height="104" rx="52"/><circle class="ph-ui-tab" cx="680" cy="1812" r="52"/>
    <rect class="ph-ui-bar" x="330" y="1800" width="90" height="10" rx="5"/><rect class="ph-ui-bar is-dim" x="460" y="1800" width="90" height="10" rx="5"/>` : ""}
    <rect class="ph-island" x="392" y="66" width="200" height="58" rx="29"/>
  </svg>`;
  document.querySelectorAll("[data-phone-frame]").forEach((n) => { n.innerHTML = svg(n.dataset.phoneFrame || "app"); });
})();
