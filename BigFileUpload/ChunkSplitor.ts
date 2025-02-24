import { calcChunkHash, Chunk } from "./chunk";
import { EventEmitter } from "./upload-core";

export type ChunkSpolitorEvents = "chunks" | "wholeHash" | "drain";

export abstract class ChunkSplitor extends EventEmitter<ChunkSpolitorEvents> {
    protected chunkSize: number;
    protected file: File;
    protected hash?: string
    protected chunks: Chunk[]
    #handleChunkCount = 0
    #spark = new SparkMD5
    #hasSplited = false

    constructor(file: File, chunkSize = 1024 * 1024 * 5) {
        super()
        this.file = file
        this.chunkSize = chunkSize
        const chunkCount = Math.ceil(this.file.size / this.chunkSize)

    }

    split() {
        if (this.#hasSplited) return

        this.#hasSplited = true

        const emitter = new EventEmitter<'chunks'>()
        const chunkHandler = (chunks: Chunk[]) => {
            this.emit('chunks', chunks)
            chunks.forEach(chunk => this.#spark.append(chunk.hash));

            this.#handleChunkCount += chunks.length

            if (this.#handleChunkCount === this.chunks.length) {
                emitter.off('chunks', chunkHandler)
                this.emit('wholeHash', this.#spark.end())
                this.#spark.destory()
                this.emit('drain')
            }
        }

        emitter.on('chunks', chunkHandler)
        this.calcChunkHash(this.chunks, emitter)
    }

    abstract calcChunkHash(chunks: Chunk[], emmiter: EventEmitter<'chunks'>): void

    abstract dispose(): void
}
