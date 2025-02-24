import { useCacheStore } from "./cache-store";
import { useReqeustor } from "./request-core";

function nomalizeOptions() {}
async function createCacheRequestor(cacheOptions) {
  const options = nomalizeOptions(cacheOptions); // 参数归一
  const hasKey = useCacheStore(options.persist); // 使用缓存仓库
  const req = useReqeustor();
  // 配置请求
  return req;
}

const req = createCacheRequestor();

req.on("beforeRequest", async (config) => {
  const key = options.key(config);
  const hasKey = await store.has(key);
  if (hasKey && options.isValid(key, config)) {
    return;
  }
});

req.on("requestBody", (config, resp) => {
  const key = option.key(config);
  store.set(key, resp.toPlain());
});
