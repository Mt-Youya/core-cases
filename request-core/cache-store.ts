export interface CacheStore {
  has(key: string): Promise<Boolean>;
  set<T>(key: string, ...values: T[]): Promise<void>;
  get<T>(key: string): Promise<T>;
  // ...
}

function createMemoryStore(): CacheStore {
  return;
}
function createStorageStore(): CacheStore {
  return;
}

export function useCacheStore(isPersist = false): CacheStore {
  if (!isPersist) {
    return createMemoryStore();
  }

  return createStorageStore();
}

const req = createCacheRequestor({
  duration: 100 * 60 * 60,
  isValis(key, config) {},
});
