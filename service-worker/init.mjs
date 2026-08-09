import { Workbox } from "https://cdn.jsdelivr.net/npm/workbox-window@7.4.0/build/workbox-window.prod.mjs";

globalThis.isLocalhost = globalThis.location.host === "localhost:3000";

if ("serviceWorker" in navigator && !globalThis.isLocalhost) {
  const wb = new Workbox(
    "https://rosieherrick.github.io/creation-to-cross-for-kids-flashcards/service-worker.js",
  );

  wb.addEventListener("waiting", (event) => {
    if (confirm("A new version is available. Update now?")) {
      wb.messageSkipWaiting();
    }
  });

  wb.addEventListener("controlling", () => {
    window.location.reload();
  });

  wb.register();
}
