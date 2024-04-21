import { getDebouncer, getTimeDeduper } from "./debouncer";

describe("debouncer", () => {
  it("should ", async () => {
    const delai = 500;
    const cb = vitest.fn();
    const debounced = getDebouncer(cb, delai);
    let i = 0;
    debounced(++i);
    debounced(++i);
    debounced(++i);
    await new Promise((resolve) => setTimeout(() => resolve(true), delai));
    debounced(++i);
    await new Promise((resolve) => setTimeout(() => resolve(true), delai));
    expect(cb.mock.calls).toEqual([[3], [4]]);
  });
});

describe("getTimeDeduper", () => {
  it("should ", async () => {
    const delai = 500;
    const cb = vitest.fn();
    const deduped = getTimeDeduper(cb, delai);
    let i = 0;
    deduped(++i);
    deduped(i);
    deduped(++i);
    deduped(++i);
    await new Promise((resolve) => setTimeout(() => resolve(true), delai));
    deduped(i);
    await new Promise((resolve) => setTimeout(() => resolve(true), delai));
    expect(cb.mock.calls).toEqual([[1], [2], [3], [3]]);
  });
});
