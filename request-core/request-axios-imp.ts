import { Requestor } from "./request-core";
import axios from "axios";

const instance = axios.create();

export const requestor: Requestor = {
  get(url, options?) {
    axios.get(url, options);
  },
  // ...
};
