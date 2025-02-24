import { Requestor } from "./request-core";

export const requestor: Requestor = {
  get(url, options) {
    fetch(url, options);
  },
  post(url, options) {
    fetch(url, options);
  },
  // ...
};
