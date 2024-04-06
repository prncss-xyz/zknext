export function getDebouncer<T>(cb: (arg: T) => void, delai?: number) {
  let handle: string | number | NodeJS.Timeout | undefined;
  let arg_: T;
  function eff() {
    cb(arg_);
  }
  return function (arg: T) {
    clearTimeout(handle);
    arg_ = arg;
    handle = setTimeout(eff, delai);
  };
}

export function getTimeDeduper<T>(cb: (arg: T) => void, delai?: number) {
  let handle: string | number | NodeJS.Timeout | undefined;
  let first = true;
  let arg_: T;
  function eff() {
    cb(arg_);
    first = true;
  }
  return function (arg: T) {
    clearTimeout(handle);
    if (first) first = false;
    else if (arg_ !== arg) cb(arg_);
    arg_ = arg;
    handle = setTimeout(eff, delai);
  };
}
