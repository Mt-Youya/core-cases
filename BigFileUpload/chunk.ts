export interface Chunk {
  blob: Blob;
  start: number;
  end: number;
  hash: string;
  index: number;
}

export function createChunk(file: File, index: number, chunkSize): Chunk {
  const start = index * chunkSize;
  const end = Math.min((index + 1) * chunkSize, file.size);
  const blob = file.slice(start, end);
  return {
    blob,
    start,
    end,
    hash: "",
    index,
  };
}

export function calcChunkHash(chunk: Chunk): Promise<string> {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer);
      resolve(spark.end());
    };
    fileReader.readAsArrayBuffer(chunk.blob);
  });
}
