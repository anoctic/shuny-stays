// Domain Types for PostgreSQL Multi-Tenant Database Manager & Studio

export interface PgTableInfo {
  table_name: string;
  table_type: 'table' | 'view' | 'materialized_view' | 'other';
  row_count_estimate: number;
  total_size_pretty: string;
  has_rls: boolean;
  rls_enforced: boolean;
}

export interface PgColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  is_primary_key: boolean;
}

export interface PgPolicyInfo {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

export interface PgQueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export interface PgSavedQuery {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  sql_text: string;
  is_safe_select: boolean;
  created_at: string;
}

export interface PgClusterStats {
  postgresVersion: string;
  activeConnections: number;
  maxConnections: number;
  databaseSize: string;
  uptime: string;
  cacheHitRatio: number;
}
