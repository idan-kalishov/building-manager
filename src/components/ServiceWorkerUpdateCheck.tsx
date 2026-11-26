import { useEffect } from "react";

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export default function ServiceWorkerUpdateCheck() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let disposed = false;
    let reloadStarted = false;
    let hasControlledClient = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (!hasControlledClient) {
        hasControlledClient = true;
        return;
      }

      if (!reloadStarted) {
        reloadStarted = true;
        window.location.reload();
      }
    };

    const checkForUpdate = async () => {
      if (disposed || document.visibilityState !== "visible") return;

      try {
        const registration = await navigator.serviceWorker.ready;
        if (!disposed) await registration.update();
      } catch (error) {
        console.warn("Service worker update check failed", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkForUpdate();
      }
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(
      () => void checkForUpdate(),
      UPDATE_CHECK_INTERVAL_MS,
    );
    void checkForUpdate();

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return null;
}
