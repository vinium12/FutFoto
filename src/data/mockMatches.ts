import { MatchPlayerRecord } from '@/@types/match';

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
  },
];
