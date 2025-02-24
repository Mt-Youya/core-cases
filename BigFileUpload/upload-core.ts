export class EventEmitter<T extends string> {
  #events: Map<T, Set<Function>>;

  constructor() {
    this.#events = new Map();
  }

  on(event: T, listener: Function) {
    if (!this.#events.has(event)) {
      this.#events.set(event, new Set());
    }
    this.#events.get(event)!.add(listener);
  }

  off(event: T, listener: Function) {
    if (!this.#events.has(event)) return;

    this.#events.get(event)!.delete(listener);
  }

  once(event: T, listener: Function) {
    function onceListener(...args: any[]) {
      listener(...args);
      this.off(event, onceListener);
    }
    onceListener();
  }

  emit(event: T, ...args: any[]) {
    if (!this.#events.has(event)) return;
    this.#events.get(event)!.forEach((listener) => listener(...args));
  }
}

export class Task {
  fn: Function;
  payload?: any;

  constructor(fn: Function, payload?: any) {
    this.fn = fn;
    this.payload = payload;
  }

  run() {
    return this.fn(this.payload);
  }
}

export class TaskQueue extends EventEmitter<"start" | "pause" | "durain"> {
  #tasks: Set<Task> = new Set();
  #currentCount = 0;
  #status: "paused" | "runing" = "paused";
  #concurrency = 4;

  constructor(concurent = 4) {
    super();
    this.#concurrency = concurent;
  }

  add(...tasks: Task[]) {
    for (const task of tasks) {
      this.#tasks.add(task);
    }
  }

  addAndStart(...tasks: Task[]) {
    this.add(...tasks);
    this.start();
  }

  #runNext() {
    if (this.#status === "runing") return;

    if (this.#currentCount >= this.#concurrency) return;

    const task = this.#takeHeadTask();
    if (!task) {
      this.#status = "paused";
      this.emit("durain");
      return;
    }

    this.#currentCount++;
    Promise.resolve(task.run()).finally(() => {
      this.#currentCount--;
      this.#runNext();
    });
  }

  start() {
    if (this.#status === "runing") return;

    if (this.#tasks.size === 0) return this.emit("durain");

    this.#status = "runing";
    this.emit("start");

    this.#runNext();
  }

  #takeHeadTask() {
    const task = this.#tasks.values().next().value;
    task && this.#tasks.delete(task);
    return task;
  }

  pause() {
    this.#status = "paused";
    this.emit("pause");
  }
}
