import {
  useCallback,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useLayoutEffect,
} from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue?: T
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] => {
  if (!key) {
    throw new Error("useLocalStorage key may not be falsy");
  }
  // initialize
  const initialize = useRef((key: string) => {
    try {
      const storeItem = localStorage.getItem(key);
      if (storeItem !== null) {
        return JSON.parse(storeItem);
      } else {
        initialValue && localStorage.setItem(key, JSON.stringify(initialValue));
        return initialValue;
      }
    } catch (error) {
      return initialValue;
    }
  });

  // state
  const [state, setState] = useState<T | undefined>(() => {
    return initialize.current(key);
  });

  useLayoutEffect(() => setState(initialize.current(key)), [key]);

  // set
  const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
    (valOrFunc) => {
      if (typeof valOrFunc === "function") {
        // set storage and state
        (valOrFunc as (state: T | undefined) => void)(state);
        //
      } else {
        localStorage.setItem(key, JSON.stringify(valOrFunc));
        setState(valOrFunc);
      }
    },
    [key, state]
  );
  // Store the end

  return [state, set];
};

export default useLocalStorage;
