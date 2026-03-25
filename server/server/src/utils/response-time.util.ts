/**
 * Response Time Tracker - Tracks and calculates average response times per endpoint.
 * Maintains a rolling window of up to 1000 response times per endpoint.
 */
class ResponseTimeTracker {
  private responseTimes: Map<string, number[]>;

  constructor() {
    this.responseTimes = new Map();
  }

  record(endpoint: string, time: number): void {
    if (!this.responseTimes.has(endpoint)) {
      this.responseTimes.set(endpoint, []);
    }

    const times = this.responseTimes.get(endpoint)!;
    times.push(time);

    if (times.length > 1000) {
      times.shift();
    }
  }

  getAverage(endpoint?: string): number {
    if (endpoint) {
      const times = this.responseTimes.get(endpoint);
      if (!times || times.length === 0) {
        return 0;
      }
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    const allTimes: number[] = [];
    for (const times of this.responseTimes.values()) {
      allTimes.push(...times);
    }

    if (allTimes.length === 0) {
      return 0;
    }

    return allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
  }

  getAllAverages(): Record<string, number> {
    const averages: Record<string, number> = {};

    for (const [endpoint] of this.responseTimes.entries()) {
      averages[endpoint] = this.getAverage(endpoint);
    }

    return averages;
  }

  reset(): void {
    this.responseTimes.clear();
  }
}

export const responseTimeTracker = new ResponseTimeTracker();

