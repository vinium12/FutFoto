import { Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { MatchPlayerRecord } from '@/@types/match';

const FILE_NAME = 'partidas_banco.json';
const STORAGE_KEY = '@futfoto:partidas_json_db';

// Dados iniciais padrão do banco de dados .json
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

// Caminho do arquivo físico .json no dispositivo
function getDatabaseFileUri(): string | null {
  if (Platform.OS !== 'web' && FileSystem.documentDirectory) {
    return `${FileSystem.documentDirectory}${FILE_NAME}`;
  }
  return null;
}

// Leitura da base de dados do arquivo .json
export async function getMatches(): Promise<MatchPlayerRecord[]> {
  const fileUri = getDatabaseFileUri();

  if (fileUri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        return JSON.parse(content);
      } else {
        // Se o arquivo .json ainda não existe, cria com os dados iniciais
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(INITIAL_MOCK_MATCHES, null, 2), {
          encoding: FileSystem.EncodingType.UTF8,
        });
        return INITIAL_MOCK_MATCHES;
      }
    } catch (e) {
      console.warn('Erro ao ler arquivo .json no FileSystem:', e);
    }
  }

  // Fallback para Web / AsyncStorage
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

// Gravação direta na base de dados do arquivo .json
export async function saveMatch(match: Omit<MatchPlayerRecord, 'id' | 'matchDate'>): Promise<MatchPlayerRecord> {
  const current = await getMatches();
  const newRecord: MatchPlayerRecord = {
    ...match,
    id: Date.now().toString(),
    matchDate: new Date().toISOString(),
  };

  const updated = [newRecord, ...current];
  const jsonContent = JSON.stringify(updated, null, 2);

  const fileUri = getDatabaseFileUri();
  if (fileUri) {
    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (e) {
      console.warn('Erro ao salvar no arquivo .json físico:', e);
    }
  }

  // Sincroniza também no AsyncStorage (Web / redundância)
  await AsyncStorage.setItem(STORAGE_KEY, jsonContent);

  return newRecord;
}

// Remoção de registro do arquivo .json
export async function deleteMatch(id: string): Promise<void> {
  const current = await getMatches();
  const filtered = current.filter((m) => m.id !== id);
  const jsonContent = JSON.stringify(filtered, null, 2);

  const fileUri = getDatabaseFileUri();
  if (fileUri) {
    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (e) {
      console.warn(e);
    }
  }

  await AsyncStorage.setItem(STORAGE_KEY, jsonContent);
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
