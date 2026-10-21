import { useSyncExternalStore } from "react";

export type ConsentChoice = "all" | "essential";

const COOKIE_NAME = "am_cookie_consent";
const MAX_AGE = 60 * 60 * 24 * 365; // 12 meses
const EVENT = "am-consent-change";

export function getConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE_NAME}=`));
  const value = match?.split("=")[1];
  return value === "all" || value === "essential" ? value : null;
}

export function setConsent(choice: ConsentChoice) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${choice}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export function useConsent(): ConsentChoice | null {
  return useSyncExternalStore(subscribe, getConsent, () => null);
}
