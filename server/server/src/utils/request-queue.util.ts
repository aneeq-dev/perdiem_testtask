/**
 * Request Queue for deduplicating concurrent requests.
 * If multiple requests arrive for the same resource simultaneously,
 * only one request is executed and all others wait for the result.
 */
class RequestQueue {
  private pendingRequests: Map<string, Promise<unknown>>;

  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * Queue a request with deduplication.
   * If a request with the same key is already pending, returns the existing promise.
   * Otherwise, executes the function and caches the promise.
   * @param key - Unique identifier for the request
   * @param fn - Async function to execute
   * @returns Promise that resolves with the result
   */
  async queue<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existingRequest = this.pendingRequests.get(key);

    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);

    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestQueue = new RequestQueue();

