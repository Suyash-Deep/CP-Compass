import type { AnalyticsSnapshot } from "./types";

export interface SnapshotRepository {
  findByHandle(handle: string): Promise<AnalyticsSnapshot | null>;
  save(snapshot: AnalyticsSnapshot): Promise<void>;
}

class MemorySnapshotRepository implements SnapshotRepository {
  private readonly snapshots = new Map<string, AnalyticsSnapshot>();

  async findByHandle(handle: string) {
    return this.snapshots.get(handle.toLowerCase()) ?? null;
  }

  async save(snapshot: AnalyticsSnapshot) {
    this.snapshots.set(snapshot.profile.handle.toLowerCase(), snapshot);
  }
}

const runtime = globalThis as typeof globalThis & { cpCompassRepository?: SnapshotRepository };

/**
 * Replace this factory with a PostgreSQL implementation later. API routes only
 * depend on the interface, so the analytics and frontend contracts stay stable.
 */
export function getSnapshotRepository(): SnapshotRepository {
  runtime.cpCompassRepository ??= new MemorySnapshotRepository();
  return runtime.cpCompassRepository;
}
