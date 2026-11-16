# Manual Completo - Notifications

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
O módulo `Notifications` é responsável pela infraestrutura de notificações locais e push no aplicativo FutFoto utilizando o pacote `expo-notifications`. Ele padroniza a criação de canais de notificação no Android, solicitação de permissões ao usuário, manipulação de notificações em primeiro plano (*foreground*), agendamento/disparo de alertas locais e registro de ouvintes (*listeners*) para eventos de clique e entrega.

- **Caminho dos arquivos**:
  - `src/notifications/channel.ts` (configuração de canais no Android)
  - `src/notifications/permission.ts` (permissões de sistema)
  - `src/notifications/handler.ts` (comportamento em primeiro plano)
  - `src/notifications/schedule.ts` (disparo e cancelamento de notificações)
  - `src/notifications/listeners.ts` (escuta de eventos e respostas)
  - `src/notifications/index.ts` (ponto central e função de inicialização)
  - `notifications/index.ts` (re-export raiz para compatibilidade)

## Funcionalidades
- **Criação de Canais Android**: Suporte a canais com prioridades distintas (`matches` para partidas e `general` para comunicados), com vibração, sons e cor de LED customizada.
- **Gestão de Permissões**: Verificação e requisição assíncrona das permissões do sistema operacional (Android 13+ `POST_NOTIFICATIONS` e iOS).
- **Manipulação em Primeiro Plano**: Exibição visual de banner, som e listagem quando o aplicativo estiver em uso.
- **Disparo Local e Agendamento**: Envio imediato de alertas ou agendamento temporal com passagem de dados adicionais (`data`).
- **Observadores e Listeners**: Registro e limpeza de ouvintes para notificações recebidas e ações de toque.

## Estrutura do Banco de Dados
O módulo não persiste notificações em tabelas SQL relacionais, operando em nível de dispositivo e sistema operacional. No entanto, os payloads emitidos relacionam-se aos registros de partidas salvos em JSON local (`matchStorage.ts`):
- `data.playerName`: Nome do atleta cadastrado.
- `data.matchId`: Identificador da partida associada (opcional).

## Endpoints da API
Este módulo opera no nível cliente/dispositivo (notificações locais). Futuras notificações remotas integradas a backend podem consumir endpoints de envio via Expo Push API:
- `POST https://exp.host/--/api/v2/push/send` (Payload padrão Expo Push Notification).

## Funções e Componentes

### 1. `initNotifications(autoRequestPermission?: boolean)`
- **Objetivo**: Inicializa todo o ecossistema de notificações ao carregar o aplicativo.
- **Parâmetros**: `autoRequestPermission` (boolean, default: `false`).
- **Retorno**: `Promise<boolean>` indicando se as permissões estão ativas.

### 2. `createNotificationChannel(config: ChannelConfig)`
- **Objetivo**: Cria ou atualiza um canal no Android.
- **Parâmetros**: `ChannelConfig` com `id`, `name`, `description`, `importance`, `vibrationPattern`, `lightColor`, `sound`.

### 3. `requestNotificationPermission()` e `hasNotificationPermission()`
- **Objetivo**: Solicita ou consulta o status da permissão de notificações do sistema operacional.
- **Retorno**: `Promise<boolean>`.

### 4. `sendLocalNotification(params: SendNotificationParams)`
- **Objetivo**: Dispara uma notificação imediata ou agenda para daqui a `seconds` segundos.
- **Parâmetros**: `title`, `body`, `data`, `seconds`, `channelId`.
- **Retorno**: `Promise<string | null>` com o identificador da notificação.

### 5. `useNotificationObserver(onReceived?, onResponse?)`
- **Objetivo**: Hook React para se inscrever em eventos de notificação com cancelamento automático no desmonte.

## Fluxo de Dados
1. **Inicialização (`_layout.tsx`)**: O aplicativo monta o `RootLayout`, chama `initNotifications(true)`, configura os canais Android (`matches` e `general`) e define o `NotificationHandler`.
2. **Cadastro de Partida (`new-match.android.tsx` / `new-match.tsx`)**:
   - O usuário preenche os dados do jogador e da partida.
   - Ao clicar em "Salvar Partida", a função `saveMatch` persiste os dados no arquivo JSON.
   - Imediatamente após, `sendLocalNotification` é acionado informando que a partida e foto foram gravadas com sucesso.
3. **Recepção da Notificação**:
   - Se o app estiver aberto, o `NotificationHandler` exibe o banner e reproduz som.
   - Se o usuário tocar na notificação, os listeners registrados capturam o payload `data` para navegação contextual.

## Permissões e Acesso
- **Android**: Requer permissão `android.permission.POST_NOTIFICATIONS` declarada no `app.json` para Android 13 (API 33) ou superior.
- **iOS**: Requer autorização explícita do usuário em tempo de execução via `requestPermissionsAsync()`.
- **Web**: Notificações móveis nativas são ignoradas com fallback silencioso para evitar quebras em navegadores.

## Guia de Uso

### Como importar e disparar uma notificação
```typescript
import { sendLocalNotification } from '@/notifications';

// Disparo imediato
await sendLocalNotification({
  title: 'Gol Confirmado!',
  body: 'A partida foi finalizada com sucesso.',
  channelId: 'matches',
  data: { matchId: '123' },
});

// Agendamento para daqui a 10 segundos
await sendLocalNotification({
  title: 'Lembrete de Treino',
  body: 'Seu treino começa em instantes.',
  seconds: 10,
  channelId: 'general',
});
```

## Configurações Técnicas
- **Biblioteca**: `expo-notifications` (`~57.0.25`).
- **Compatibilidade**: Expo SDK 57 / React Native 0.86 / Android 13+.
- **Import Aliases**: Suporta `@/notifications` (via `tsconfig.json`) e `./notifications` relativo à raiz.

## Troubleshooting
- **Notificação não aparece em primeiro plano no Android**:
  - Verifique se o canal foi criado antes do envio com `createNotificationChannel` ou `initNotifications()`.
  - Confirme se `setupNotificationHandler` foi invocado com `shouldShowBanner: true`.
- **Permissão sempre negada no Android 13+**:
  - Certifique-se de que a permissão `POST_NOTIFICATIONS` está listada na seção `android.permissions` do `app.json`.
- **Execução na Web**:
  - Plataformas web não suportam as APIs nativas de notificação push do Expo móvel; as funções retornam `null` ou `false` com log de aviso amigável.

## Referências
- [src/notifications/index.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/notifications/index.ts)
- [src/notifications/channel.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/notifications/channel.ts)
- [src/notifications/permission.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/notifications/permission.ts)
- [src/notifications/handler.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/notifications/handler.ts)
- [src/notifications/schedule.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/notifications/schedule.ts)
- [src/notifications/listeners.ts](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/notifications/listeners.ts)
- [src/app/_layout.tsx](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/app/_layout.tsx)
- [src/app/(app)/new-match.android.tsx](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/src/app/(app)/new-match.android.tsx)
- [app.json](file:///c:/Users/MKT/Documents/Faculdade/FutFoto/app.json)
