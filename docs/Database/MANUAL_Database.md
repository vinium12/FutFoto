# Manual Completo - Database

## 📋 Índice
- [Visão Geral](#visao-geral)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Funções e Componentes](#funcoes-e-componentes)
- [Fluxo de Dados](#fluxo-de-dados)
- [Permissões e Acesso](#permissoes-e-acesso)
- [Guia de Uso](#guia-de-uso)
- [Configurações Técnicas](#configuracoes-tecnicas)
- [Troubleshooting](#troubleshooting)
- [Referências](#referencias)

## Visão Geral
O módulo `Database` gerencia o armazenamento persistente local do FutFoto. Conforme a regra de negócio do projeto, a base local em **SQLite** (`expo-sqlite`) opera exclusivamente no ambiente **Mobile** (Android e iOS). No ambiente **PC/Web**, o sistema adota um fallback seguro utilizando `AsyncStorage` / `localStorage`. A autenticação de usuários permanece integrada à API oficial da Fatec/Professor via Spring Boot e JWT com cookies seguros.

- **Caminho dos arquivos**:
  - `src/database/sqlite.ts` (implementação nativa com expo-sqlite para Android/iOS)
  - `src/database/sqlite.web.ts` (implementação de fallback e no-op para Web)
  - `src/database/index.ts` (ponto de exportação unificado)
  - `src/integration/matchStorage.ts` (orquestrador de armazenamento consumido pelas telas)

## Funcionalidades
- **Criação de Tabelas SQLite**: Inicialização automática e idempotente da tabela `matches` com tipos nativos do SQLite.
- **Isolamento de Plataforma**:
  - **Mobile**: Utiliza o motor C/C++ nativo do SQLite (`futfoto.db`).
  - **Web (PC)**: Utiliza armazenamento leve (`AsyncStorage`) sem carregar bibliotecas nativas incompatíveis com o navegador.
- **Seeding Automático**: Popula os dados de exemplo (`INITIAL_MOCK_MATCHES`) caso o banco local seja inicializado vazio.
- **CRUD Completo de Partidas**: Leitura ordenada por data decrescente, inserção ou atualização com substituição (`INSERT OR REPLACE`) e exclusão por identificador único.
- **Preservação da Autenticação Externa**: O banco local não armazena credenciais da Fatec; essas continuam gerenciadas pela API REST do professor.

## Estrutura do Banco de Dados

### Script SQL (DDL e Carga Inicial)
```sql
-- Criação da tabela principal de partidas (SQLite)
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

-- Carga inicial de exemplo (seeding)
INSERT OR REPLACE INTO matches (
  id, playerName, position, goals, assists, yellowCards, rating,
  photoUri, addressName, city, latitude, longitude, matchDate, notes
) VALUES
(
  '1', 'Carlos Silva', 'Atacante', 3, 1, 0, 9.5,
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
  'Rua das Palmeiras, 140 - Bela Vista', 'São Paulo - SP', -23.5505, -46.6333,
  '2026-10-04T12:00:00.000Z', 'Hat-trick e melhor jogador da rodada!'
),
(
  '2', 'Lucas Mendes', 'Meio-Campo', 1, 3, 1, 8.8,
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
  'Av. Barão de Itapura, 500 - Guanabara', 'Campinas - SP', -22.9099, -47.0626,
  '2026-10-03T12:00:00.000Z', 'Grande controle de jogo e assistências decisivas.'
);
```

## Endpoints da API
A base de dados de partidas é 100% local (SQLite no mobile). Os endpoints consumidos pelo aplicativo pertencem à API de autenticação do professor (Spring Boot):
- `POST /fatec/login`: Efetua autenticação do usuário e emite cookie de sessão HTTP-only.
- `POST /fatec/create`: Cria novo usuário no backend da faculdade.
- `POST /fatec/logout`: Invalida o token de autenticação.

## Funções e Componentes

### 1. `initSqliteDatabase()`
- **Objetivo**: Abre a conexão com `futfoto.db`, executa o `CREATE TABLE IF NOT EXISTS` e insere os registros padrão caso a tabela esteja zerada.
- **Retorno**: `Promise<void>`.

### 2. `getSqliteMatches()`
- **Objetivo**: Retorna todos os registros da tabela `matches` mapeados para a interface `MatchPlayerRecord`.
- **Retorno**: `Promise<MatchPlayerRecord[]>`.

### 3. `saveSqliteMatch(record: MatchPlayerRecord)`
- **Objetivo**: Executa prepared statement `INSERT OR REPLACE INTO matches (...)` com todos os atributos do atleta.
- **Retorno**: `Promise<void>`.

### 4. `deleteSqliteMatch(id: string)`
- **Objetivo**: Remove uma partida do banco através de `DELETE FROM matches WHERE id = ?`.
- **Retorno**: `Promise<void>`.

## Fluxo de Dados
1. **Inicialização do App (`_layout.tsx`)**:
   - Se o dispositivo for Mobile (`Platform.OS !== 'web'`), `initSqliteDatabase()` é executado logo no carregamento.
2. **Carregamento da Dashboard (`dashboard.android.tsx` / `dashboard.tsx`)**:
   - `getMatches()` é invocado.
   - No Android, busca do arquivo SQLite `futfoto.db`.
   - Na Web, busca do `AsyncStorage`.
3. **Persistência de Nova Partida (`new-match.android.tsx`)**:
   - Usuário confirma o formulário.
   - `saveMatch()` persiste a foto no sistema de arquivos e executa `saveSqliteMatch()`.
   - A notificação local é despachada via `sendLocalNotification()`.

## Permissões e Acesso
- Apenas usuários autenticados via API do professor têm acesso às rotas do grupo `(app)`.
- As operações no banco SQLite ocorrem na sandbox privada do aplicativo no sistema de arquivos do dispositivo (`/data/user/0/...` no Android), sem necessidade de permissões adicionais de storage externo no Android 11+.

## Guia de Uso

### Como consultar partidas via SQLite
```typescript
import { getMatches } from '@/integration/matchStorage';

const partidas = await getMatches();
console.log(`Carregadas ${partidas.length} partidas.`);
```

### Como gravar nova partida
```typescript
import { saveMatch } from '@/integration/matchStorage';

await saveMatch({
  playerName: 'Gabriel Jesus',
  position: 'Atacante',
  goals: 2,
  assists: 1,
  yellowCards: 0,
  rating: 8.5,
  photoUri: 'file:///caminho/foto.jpg',
  location: { addressName: 'Arena Corinthians', city: 'São Paulo - SP' },
  notes: 'Boa finalização',
});
```

## Configurações Técnicas
- **Biblioteca**: `expo-sqlite` (`57.0.5`).
- **Banco de Dados**: `futfoto.db`.
- **Plugin Expo**: Registrado em `app.json` como `"expo-sqlite"`.

## Troubleshooting
- **Erro de 'database is locked'**:
  - Todas as chamadas usam operações assíncronas do `expo-sqlite` (`runAsync`, `getAllAsync`) garantindo liberação imediata de conexões.
- **Execução na Web (PC)**:
  - O arquivo `src/database/sqlite.web.ts` intercepta as importações na Web garantindo que o bundle do Metro não tente carregar módulos nativos C++.

## Referências
- [src/database/sqlite.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/database/sqlite.ts)
- [src/database/sqlite.web.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/database/sqlite.web.ts)
- [src/database/index.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/database/index.ts)
- [src/integration/matchStorage.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/integration/matchStorage.ts)
- [src/app/_layout.tsx](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/app/_layout.tsx)
- [app.json](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/app.json)
