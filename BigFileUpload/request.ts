import type { Chunk, } from "./chunk"
import type { ChunkSplitor } from "./ChunkSplitor"
import { Task, TaskQueue } from "./upload-core"

export interface RequestStrategy {
    createFile(file: File): Promise<string>

    uploadChunk(chunk: Chunk): Promise<void>

    mergeFile(token: string): Promise<string>

    patchHash<T extends 'file' | 'chunk'>(token: string, hash: string, type: T): Promise<T extends 'file' ? { hasFile: boolean } : { hasFile: boolean; rest: number[]; url: string }>
}


export class UploadController {
    #requestStrategy: RequestStrategy // 请求策略
    #splitStrategy: ChunkSplitor // 分片策略
    #taskQueue: TaskQueue
    #token: string
    #file: File

    async init() {
        this.#token = await this.#requestStrategy.createFile(this.#file)
        this.#splitStrategy.on('chunks', this.#handleChunks.bind(this))
        this.#splitStrategy.on('wholeHash', this.#handleWholeChunks.bind(this))
    }

    #handleChunks(chunks: Chunk[]) {
        for (const chunk of chunks) {
            this.#taskQueue.addAndStart(new Task(this.uploadChunk.bind(this), chunk))
        }
    }

    async #handleWholeChunks(hash: string) {
        const resp = await this.#requestStrategy.patchHash(this.#token, hash, 'file')
        if (resp.hasFile) {
            this.emit('end', resp.url)
            return
        }

        // 根据 resp.rest 重新编排后续任务
    }

    async uploadChunk(chunk: Chunk) {
        const resp = await this.#requestStrategy.patchHash(this.#token, chunk.hash, 'chunk')
        if (resp.hasFile) return
        return await this.#requestStrategy.uploadChunk(chunk, this.uploadEmitter)
    }

}
