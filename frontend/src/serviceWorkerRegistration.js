export function register() {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js")
        .then((reg) => {
          console.log("Service Worker registered successfully with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.unregister();
    });
  }
}
