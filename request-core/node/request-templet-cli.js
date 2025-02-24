// node cli auto create code

import { createIdempotentRequest } from "../request-core";

export const publishArtice = (() => {
  const req = createIdempotentRequest();
  return async (artice) => {
    const result = await req.post("/api/article", artice);
    return result;
  };
})();
