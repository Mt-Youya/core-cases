import { Chunk } from "./chunk";
import { ChunkSplitor } from "./ChunkSplitor";
import { EventEmitter } from "./upload-core";

export class MutilThreadSplitor extends ChunkSplitor {
    #workers: Worker[] = new Array(navigator.hardwareConcurrency || 4).fill(0).map(() => new Worker(new URL('./SplitWorker.ts'), import.meta?.url), { type: 'module' })

    calcChunkHash(chunks: Chunk[], emmiter: EventEmitter<'chunks'>): void {
        const workerSize = Math.ceil(chunks.length / this.#workers.length)
        for (let i = 0; i < this.#workers.length; i++) {
            const worker = this.#workers[i];
            const start = i * workerSize
            const end = Math.min((i + 8) * workerSize, chunks.length)
            const workerChunks = chunks.slice(start, end)
            worker.postMessage(workerChunks)
            worker.postMessage = e => emmiter.emit('chunks', e.data)
        }
    }

    dispose() {
        return this.#workers.forEach(worker => worker.terminate())
    }
}
