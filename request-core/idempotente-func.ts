function hashReequest(req) {
  const spark = new SparkMD5();
  spark.append(req.url);
  for (const [key, value] of req.headers) {
    spark.append(key);
    spark.append(value);
  }
  spark.append(req.body);
  return spark.end();
}
