import { Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { MatchPlayerRecord } from '@/@types/match';
import { persistPhoto, deletePhoto } from './photoStorage';
import {
  initSqliteDatabase,
  getSqliteMatches,
  saveSqliteMatch,
  deleteSqliteMatch,
} from '@/database';

const FILE_NAME = 'partidas_banco.json';
const STORAGE_KEY = '@futfoto:partidas_json_db';

// Dados iniciais padrão do banco de dados
export const INITIAL_MOCK_MATCHES: MatchPlayerRecord[] = [
  {
    id: '1',
    playerName: 'Carlos Silva',
    position: 'Atacante',
    goals: 3,
    assists: 1,
    yellowCards: 0,
    rating: 9.5,
    photoUri: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    location: {
      addressName: 'Rua das Palmeiras, 140 - Bela Vista',
      city: 'São Paulo - SP',
      latitude: -23.5505,
      longitude: -46.6333,
    },
    matchDate: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Hat-trick e melhor jogador da rodada!',
  },
  {
    id: '2',
    playerName: 'Lucas Mendes',
    position: 'Meio-Campo',
    goals: 1,
    assists: 3,
    yellowCards: 1,
    rating: 8.8,
    photoUri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    location: {
      addressName: 'Av. Barão de Itapura, 500 - Guanabara',
      city: 'Campinas - SP',
      latitude: -22.9099,
      longitude: -47.0626,
    },
    matchDate: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Grande controle de jogo e assistências decisivas.',
  }
];

let sqliteInitialized = false;

async function ensureSqliteReady(): Promise<void> {
  if (Platform.OS !== 'web' && !sqliteInitialized) {
    try {
      await initSqliteDatabase();
      sqliteInitialized = true;
    } catch (error) {
      console.warn('[MatchStorage] Não foi possível inicializar SQLite:', error);
    }
  }
}

// Leitura das partidas: SQLite no Mobile e AsyncStorage na Web (PC)
export async function getMatches(): Promise<MatchPlayerRecord[]> {
  // Mobile (Android / iOS): expo-sqlite
  if (Platform.OS !== 'web') {
    await ensureSqliteReady();
    return await getSqliteMatches();
  }

  // Web (PC / Navegador): AsyncStorage fallback
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MATCHES));
    return INITIAL_MOCK_MATCHES;
  } catch (error) {
    return INITIAL_MOCK_MATCHES;
  }
}

// Salva nova partida: SQLite no Mobile e AsyncStorage na Web
export async function saveMatch(match: Omit<MatchPlayerRecord, 'id' | 'matchDate'>): Promise<MatchPlayerRecord> {
  const photoUri = await persistPhoto(match.photoUri);

  const newRecord: MatchPlayerRecord = {
    ...match,
    photoUri,
    id: Date.now().toString(),
    matchDate: new Date().toISOString(),
  };

  // Mobile: persistência com expo-sqlite
  if (Platform.OS !== 'web') {
    await ensureSqliteReady();
    try {
      await saveSqliteMatch(newRecord);
      return newRecord;
    } catch (e) {
      await deletePhoto(photoUri);
      throw e;
    }
  }

  // Web: persistência com AsyncStorage
  const current = await getMatches();
  try {
    const updated = [newRecord, ...current];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated, null, 2));
    return newRecord;
  } catch (e) {
    await deletePhoto(photoUri);
    throw new Error('Sem espaço para guardar os registros neste navegador. Apague alguns e tente de novo.');
  }
}

// Remoção de registro
export async function deleteMatch(id: string): Promise<void> {
  const current = await getMatches();
  const removed = current.find((m) => m.id === id);

  if (Platform.OS !== 'web') {
    await ensureSqliteReady();
    await deleteSqliteMatch(id);
  } else {
    const filtered = current.filter((m) => m.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered, null, 2));
  }

  await deletePhoto(removed?.photoUri ?? null);
}

// Exporta o banco: baixa o arquivo (navegador) ou abre o "compartilhar" (celular)
export async function exportMatchesJsonFile(): Promise<void> {
  const matches = await getMatches();
  const jsonContent = JSON.stringify(matches, null, 2);

  if (Platform.OS === 'web') {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento indisponível neste aparelho.');
  }

  const exportUri = `${FileSystem.cacheDirectory}${FILE_NAME}`;
  await FileSystem.writeAsStringAsync(exportUri, jsonContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(exportUri, {
    mimeType: 'application/json',
    dialogTitle: 'Exportar banco de dados JSON',
    UTI: 'public.json',
  });
}

// Compartilha o resumo do craque nas redes / WhatsApp
export async function shareMatchSummary(match: MatchPlayerRecord): Promise<void> {
  const dateFormatted = new Date(match.matchDate).toLocaleDateString('pt-BR');
  const message = `⚽ *Craque da Partida - FutFoto* ⚽
👤 *Jogador:* ${match.playerName} (${match.position})
⚽ *Gols:* ${match.goals}
🎯 *Assistências:* ${match.assists}
🟨 *Cartões:* ${match.yellowCards}
⭐ *Nota:* ${match.rating.toFixed(1)}/10
📍 *Local:* ${match.location.addressName || 'Campo Local'} • ${match.location.city || ''}
📅 *Data:* ${dateFormatted}
${match.notes ? `📝 *Obs:* ${match.notes}` : ''}

_Registrado via FutFoto App_ 📱`;

  try {
    await Share.share({
      title: `Estatísticas de ${match.playerName}`,
      message,
    });
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
  }
}
