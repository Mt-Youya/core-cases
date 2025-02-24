export interface Requestor {
  get(url: string, options): Promise<Response>;
  post(url: string, options): Promise<Response>;
  delete(url: string, options): Promise<Response>;
  option(url: string, options): Promise<Response>;
}

let req: Requestor;

export function inject(requestor: Requestor) {
  req = requestor;
}

export function useReqeustor() {
  return req;
}

export function createRetryRequestor(maxCount = 5) {
  const req = useReqeustor();

  req.get = Promise.resolve({
    headers: {},
    ok: true,
  });

  return req;
}

export function createParallelRequestor(maxCount = 4) {
  const req = useReqeustor();

  req.get = Promise.resolve({
    headers: {},
    ok: true,
  });

  return req;
}

export function createIdempotentRequestor(genKey) {
  return createCacheRequest({
    key: (config) => (genKey ? genKey(config) : hashReequest(config)),
    persist: false,
  });
}
