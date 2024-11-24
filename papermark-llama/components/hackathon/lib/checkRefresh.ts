/**
 * STORE THE LAST PERFORMED ACTION RESPONSE AND WINDOW HREF URL in local storage
 * IF THE WINDOW HREF URL IS THE SAME AS THE LAST ONE, THEN DO NOT FETCH NEW ACTIONS
 * IF THE WINDOW HREF URL IS DIFFERENT, THEN START THE LOOP OF FETCHING NEW ACTIONS
 */
import { useEffect } from "react";

type StorageState = {
  // lastActionResponse: ActionResponse;
  prompt: string;
  wasRunning: boolean;
  lastWindowHref: string;
};

const STORAGE_KEY = "storage-state";

const getStorageState = (): StorageState | null => {
  const storageState = localStorage.getItem(STORAGE_KEY);
  if (!storageState) {
    return null;
  }
  return JSON.parse(storageState);
};

export const setStorageState = (params: {
  prompt: string;
  wasRunning: boolean;
}) => {
  const stateToSave: StorageState = {
    prompt: params.prompt,
    wasRunning: params.wasRunning,
    lastWindowHref: window.location.href,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
};

export const useCheckRefresh = (params: {
  wasRefreshedCallback: (params: { prompt: string }) => Promise<void>;
}) => {
  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("window is undefined");
      return;
    }

    const currentWindowHref = window.location.href;
    console.log("currentWindowHref", currentWindowHref);

    const storageState = getStorageState();
    console.log("storageState", storageState);
    if (!storageState) {
      setStorageState({
        prompt: "",
        wasRunning: false,
      });

      return;
    }

    if (storageState.lastWindowHref === currentWindowHref) {
      setStorageState({
        prompt: storageState.prompt,
        wasRunning: storageState.wasRunning,
      });
      return;
    }

    if (!storageState.wasRunning) {
      setStorageState({
        prompt: storageState.prompt,
        wasRunning: true,
      });
      return;
    }

    params.wasRefreshedCallback({
      prompt: storageState.prompt,
    });
  }, []);
};
