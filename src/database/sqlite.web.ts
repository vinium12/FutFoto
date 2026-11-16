import { MatchPlayerRecord } from '@/@types/match';

/**
 * Fallback da base de dados para ambiente Web (PC / Navegador).
 * Conforme solicitado pelo professor, o SQLite e notificações operam
 * exclusivamente no ambiente Mobile. Na Web, o armazenamento usa o fallback do AsyncStorage.
 */
export async function getDatabase(): Promise<null> {
  return null;
}

export async function initSqliteDatabase(): Promise<void> {
  // No-op no ambiente Web
}

export async function getSqliteMatches(): Promise<MatchPlayerRecord[]> {
  return [];
}

export async function saveSqliteMatch(_record: MatchPlayerRecord): Promise<void> {
  // No-op na Web
}

export async function deleteSqliteMatch(_id: string): Promise<void> {
  // No-op na Web
}

export async function clearSqliteMatches(): Promise<void> {
  // No-op na Web
}
