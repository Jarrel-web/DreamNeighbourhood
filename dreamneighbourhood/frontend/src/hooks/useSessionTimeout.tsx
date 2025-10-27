// src/hooks/useSessionTimeout.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const WARNING_TIMEOUT = 10 * 60 * 1000; // show warning after 10minutes
const SESSION_TIMEOUT = 5 * 60 * 1000; // auto logout after 5 minutes

export default function useSessionTimeout() {
  const { logoutUser, isLoggedIn } = useAuth();

  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningToastIdRef = useRef<string | null>(null);
  const [isWarningShown, setIsWarningShown] = useState(false);
  const isWarningShownRef = useRef(false);

  useEffect(() => {
    isWarningShownRef.current = isWarningShown;
  }, [isWarningShown]);

  const clearTimers = () => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const startTimers = () => {
    clearTimers();
    console.debug("[session] starting timers", {
      WARNING_TIMEOUT,
      SESSION_TIMEOUT,
    });

    warningTimerRef.current = setTimeout(() => {
      console.debug("[session] showing warning toast");

      const id = toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } w-[400px] bg-white shadow-lg rounded-lg mt-4 p-4 flex justify-between items-center`}
          >
            <div>
              <p className="font-bold text-blue-600 text-lg">
                Session Expiring Soon!
              </p>
              <p className="text-gray-600 text-sm">
                Do you want to stay logged in?
              </p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => {
                  console.debug("[session] stay logged in clicked");
                  if (warningToastIdRef.current) {
                    toast.remove(warningToastIdRef.current);
                  }
                  warningToastIdRef.current = null;
                  setIsWarningShown(false);
                  isWarningShownRef.current = false;
                  startTimers(); // restart timers when user confirms
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Stay Logged In
              </button>
              <button
                onClick={() => {
                  console.debug("[session] logout clicked");
                  if (warningToastIdRef.current) {
                    toast.remove(warningToastIdRef.current); // Remove immediately
                  }
                  warningToastIdRef.current = null;
                  setIsWarningShown(false);
                  isWarningShownRef.current = false;
                  clearTimers();
                  logoutUser();
                  window.location.href = "/login";
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );

      warningToastIdRef.current = id;
      setIsWarningShown(true);
      isWarningShownRef.current = true;
      console.debug("[session] warning toast created", { id });
    }, WARNING_TIMEOUT);

    logoutTimerRef.current = setTimeout(() => {
      console.debug("[session] session timeout reached - logging out");
      if (warningToastIdRef.current) {
        toast.dismiss(warningToastIdRef.current);
        warningToastIdRef.current = null;
      }
      setIsWarningShown(false);
      isWarningShownRef.current = false;
      clearTimers();
      logoutUser();
      window.location.href = "/login";
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      console.debug("[session] not logged in - cleanup");
      clearTimers();
      if (warningToastIdRef.current) {
        toast.dismiss(warningToastIdRef.current);
        warningToastIdRef.current = null;
      }
      setIsWarningShown(false);
      isWarningShownRef.current = false;
      return;
    }

    startTimers();

    const handleActivity = () => {
      if (!isWarningShownRef.current) {
        console.debug("[session] activity detected - restarting timers");
        startTimers();
      } else {
        console.debug("[session] activity while warning shown - ignoring");
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearTimers();
      if (warningToastIdRef.current) {
        toast.dismiss(warningToastIdRef.current);
        warningToastIdRef.current = null;
      }
    };
  }, [isLoggedIn, logoutUser]);

  return null;
}
