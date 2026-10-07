export interface SeederCounts {
  permissions: number;
  roles: number;
  rolePermissions: number;
  users: number;
  sessions: number;
  refreshTokens: number;
}

export interface SeedResult {
  ok: boolean;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  counts: SeederCounts;
  errors: string[];
}

export const emptySeederCounts = (): SeederCounts => ({
  permissions: 0,
  roles: 0,
  rolePermissions: 0,
  users: 0,
  sessions: 0,
  refreshTokens: 0,
});