import * as SQLite from 'expo-sqlite';
import { MatchPlayerRecord } from '@/@types/match';
import { INITIAL_MOCK_MATCHES } from '@/data/mockMatches';

const DATABASE_NAME = 'futfoto.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbInstance;
}

export const CREATE_MATCHES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY NOT NULL,
  playerName TEXT NOT NULL,
  position TEXT NOT NULL,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  yellowCards INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  photoUri TEXT,
  addressName TEXT,
  city TEXT,
  latitude REAL,
  longitude REAL,
  matchDate TEXT NOT NULL,
  notes TEXT
);
`;

/**
 * Inicializa a base de dados SQLite no dispositivo móvel.
 * Cria a tabela 'matches' caso não exista e popula com dados iniciais se estiver vazia.
 */
export async function initSqliteDatabase(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.execAsync(CREATE_MATCHES_TABLE_SQL);

    // Checa se já existem registros cadastrados
    const countResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM matches;'
    );

    if (!countResult || countResult.count === 0) {
      for (const item of INITIAL_MOCK_MATCHES) {
        await db.runAsync(
          `INSERT OR REPLACE INTO matches (
            id, playerName, position, goals, assists, yellowCards, rating,
            photoUri, addressName, city, latitude, longitude, matchDate, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.id,
            item.playerName,
            item.position,
            item.goals,
            item.assists,
            item.yellowCards,
            item.rating,
            item.photoUri,
            item.location.addressName ?? null,
            item.location.city ?? null,
            item.location.latitude ?? null,
            item.location.longitude ?? null,
            item.matchDate,
            item.notes ?? null,
          ]
        );
      }
    }
  } catch (error) {
    console.error('[SQLite] Erro ao inicializar banco de dados SQLite:', error);
    throw error;
  }
}

interface MatchDbRow {
  id: string;
  playerName: string;
  position: string;
  goals: number;
  assists: number;
  yellowCards: number;
  rating: number;
  photoUri: string | null;
  addressName: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  matchDate: string;
  notes: string | null;
}

function rowToRecord(row: MatchDbRow): MatchPlayerRecord {
  return {
    id: row.id,
    playerName: row.playerName,
    position: row.position,
    goals: Number(row.goals) || 0,
    assists: Number(row.assists) || 0,
    yellowCards: Number(row.yellowCards) || 0,
    rating: Number(row.rating) || 0,
    photoUri: row.photoUri,
    location: {
      addressName: row.addressName ?? undefined,
      city: row.city ?? undefined,
      latitude: row.latitude !== null ? Number(row.latitude) : undefined,
      longitude: row.longitude !== null ? Number(row.longitude) : undefined,
    },
    matchDate: row.matchDate,
    notes: row.notes ?? undefined,
  };
}

export async function getSqliteMatches(): Promise<MatchPlayerRecord[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MatchDbRow>(
      'SELECT * FROM matches ORDER BY matchDate DESC;'
    );
    return rows.map(rowToRecord);
  } catch (error) {
    console.error('[SQLite] Erro ao buscar partidas no banco:', error);
    return [];
  }
}

export async function saveSqliteMatch(record: MatchPlayerRecord): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO matches (
      id, playerName, position, goals, assists, yellowCards, rating,
      photoUri, addressName, city, latitude, longitude, matchDate, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      record.id,
      record.playerName,
      record.position,
      record.goals,
      record.assists,
      record.yellowCards,
      record.rating,
      record.photoUri,
      record.location.addressName ?? null,
      record.location.city ?? null,
      record.location.latitude ?? null,
      record.location.longitude ?? null,
      record.matchDate,
      record.notes ?? null,
    ]
  );
}

export async function deleteSqliteMatch(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM matches WHERE id = ?;', [id]);
}

export async function clearSqliteMatches(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM matches;');
}
