"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "startup-swarm-install-coach-dismissed";

function isIphoneSafari() {
  const ua = navigator.userAgent;

  return /iPhone/i.test(ua) && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

function isStandalone() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallCoach() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIphoneSafari() || isStandalone()) {
      return;
    }

    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }

    setVisible(true);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <aside className="install-coach" role="status" aria-live="polite">
      <strong>Install on iPhone</strong>
      <p>
        In Safari, tap Share, then <strong>Add to Home Screen</strong> for a
        focused shell with safe-area spacing and mobile navigation.
      </p>
      <div className="install-coach__actions">
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setVisible(false);
          }}
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
