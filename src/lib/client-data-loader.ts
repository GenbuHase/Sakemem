export type ClientDataLoader<T> = {
  load(options?: { force?: boolean }): Promise<T>;
  prime(value: T): void;
  clear(): void;
};

export function createClientDataLoader<T>(
  fetchValue: () => Promise<T>,
): ClientDataLoader<T> {
  let cachedValue: T;
  let hasCachedValue = false;
  let pending: Promise<T> | null = null;
  let generation = 0;

  return {
    load({ force = false } = {}) {
      if (pending) {
        return pending;
      }
      if (!force && hasCachedValue) {
        return Promise.resolve(cachedValue);
      }

      const requestGeneration = generation;
      const request = Promise.resolve()
        .then(fetchValue)
        .then((value) => {
          if (requestGeneration === generation) {
            cachedValue = value;
            hasCachedValue = true;
          }
          return value;
        })
        .finally(() => {
          if (pending === request) {
            pending = null;
          }
        });

      pending = request;
      return request;
    },
    prime(value) {
      generation += 1;
      pending = null;
      cachedValue = value;
      hasCachedValue = true;
    },
    clear() {
      generation += 1;
      hasCachedValue = false;
      pending = null;
    },
  };
}
