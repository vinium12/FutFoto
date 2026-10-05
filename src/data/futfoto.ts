export interface CardItem {
  id: string;
  name: string;
  position: string;
  club: string;
  overall: number;
  rarity: 'gold' | 'silver' | 'bronze' | 'legendary';
  imageUrl: string;
  stats: {
    pac: number;
    sho: number;
    pas: number;
    dri: number;
    def: number;
    phy: number;
  };
}

export const MOCK_CARDS: CardItem[] = [
  {
    id: '1',
    name: 'Vinícius Júnior',
    position: 'PTE',
    club: 'Real Madrid',
    overall: 90,
    rarity: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    stats: { pac: 95, sho: 84, pas: 81, dri: 91, def: 29, phy: 69 }
  },
  {
    id: '2',
    name: 'Neymar Jr',
    position: 'MEI',
    club: 'Santos / Al-Hilal',
    overall: 89,
    rarity: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    stats: { pac: 86, sho: 83, pas: 85, dri: 93, def: 37, phy: 61 }
  },
  {
    id: '3',
    name: 'Pelé',
    position: 'SA',
    club: 'Brasil',
    overall: 98,
    rarity: 'legendary',
    imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&auto=format&fit=crop&q=60',
    stats: { pac: 95, sho: 96, pas: 93, dri: 96, def: 60, phy: 76 }
  },
  {
    id: '4',
    name: 'Rodrygo',
    position: 'PTD',
    club: 'Real Madrid',
    overall: 86,
    rarity: 'gold',
    imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&auto=format&fit=crop&q=60',
    stats: { pac: 88, sho: 82, pas: 80, dri: 88, def: 32, phy: 64 }
  },
  {
    id: '5',
    name: 'Endrick',
    position: 'ATA',
    club: 'Real Madrid',
    overall: 80,
    rarity: 'silver',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&auto=format&fit=crop&q=60',
    stats: { pac: 87, sho: 80, pas: 68, dri: 81, def: 30, phy: 75 }
  }
];
