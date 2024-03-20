export const noop = () => {};

export function on<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args: Parameters<T["addEventListener"]> | [string, Function | null, ...any]
): void {
  if (obj && obj.addEventListener) {
    obj.addEventListener(
      ...(args as Parameters<HTMLElement["addEventListener"]>)
    );
  }
}

export function off<T extends Window | Document | HTMLElement | EventTarget>(
  obj: T | null,
  ...args:
    | Parameters<T["removeEventListener"]>
    | [string, Function | null, ...any]
): void {
  if (obj && obj.removeEventListener) {
    obj.removeEventListener(
      ...(args as Parameters<HTMLElement["removeEventListener"]>)
    );
  }
}

export const isBrowser = typeof window !== "undefined";

export const isNavigator = typeof navigator !== "undefined";

export function deserialize(value: unknown) {
  const newVal = JSON.parse(value);

  for (const key in newVal) {
    if (
      Array.isArray(newVal[key]) &&
      newVal[key].length === 3 &&
      newVal[key][0] === "<<REGEXP" &&
      newVal[key][2] === "REGEXP>>"
    ) {
      const [, exp, flags] = newVal[key][1].match(/\/(.*)\/(.*)?/);

      newVal[key] = new RegExp(exp, flags || "");
    }
  }

  return newVal;
}
export function serialize(value: unknown) {
  const newVal = {};
  for (const key in value) {
    if (value[key] instanceof RegExp) {
      newVal[key] = ["<<REGEXP", value[key].toString(), "REGEXP>>"];
    } else newVal[key] = value[key];
  }

  return JSON.stringify(newVal);
}
