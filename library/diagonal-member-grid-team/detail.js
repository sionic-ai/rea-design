/* One member — the only motion is the shared blur-in (.dz-in). Dimming the current person’s name in the drawer is also handled by the shared part */
(() => {
  const DZ = window.DZ;
  if (!DZ) return;
  DZ.pages.member = () => () => {};
})();
