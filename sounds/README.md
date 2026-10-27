# Arcade Hub — Pong

Um mini fliperama no navegador, com visual retrô de monitor CRT. O projeto reúne um hub com música do Spotify, uma biblioteca de jogos (hoje só o **Pong** está jogável), uma seção de artigos técnicos e um **modo multiplayer online** feito com Node.js, Express e Socket.IO.

Demo do front-end: https://node-project-xi-dun.vercel.app

## Funcionalidades

- **Arcade Hub** (`index.html`): tela inicial com acesso a Jogos e Arcadêmico, playlist do Spotify incorporada e login opcional com Spotify (PKCE).
- **Jogos** (`games.html`): carrossel de "fitas" com animação de inserção e sons. Apenas o PONG está disponível; as demais fitas são placeholders (`???`).
- **Pong local** (`pong.html`): dois jogadores no mesmo teclado, com física de rebatida por ângulo e efeito (spin), rastro da bola, partículas, slow motion, bullet time e efeito de monitor CRT.
- **Arcadêmico** (`articles.html`): artigos curtos em texto sobre Pong e física, game loop e efeito CRT (pasta `articles/`).
- **Multiplayer online** (`multi/`): lobby com salas de 2 jogadores, código de sala, host que inicia a partida e jogo com lógica rodando no servidor.

## Tecnologias

- HTML, CSS e JavaScript puro (Canvas 2D), sem framework nem build
- Node.js, [Express](https://expressjs.com/) 4 e [Socket.IO](https://socket.io/) 4 (servidor multiplayer)
- Spotify Web Playback SDK e Spotify Embed (hub)

## Estrutura do projeto

```
node_project/
├── index.html            # Arcade Hub (menu inicial + Spotify)
├── games.html            # Carrossel de jogos
├── articles.html         # Arcadêmico (lista e leitura de artigos)
├── pong.html             # Pong local
├── pong_online.html      # Pong com cliente online
├── main.js               # Loop principal e troca de estados
├── core/                 # debug, stateManager, loop, input
├── states/               # menu, game, pause, games_multiplayer
├── entites/              # ball, paddle, particles
├── systems/              # render, physics, effects
├── articles/             # artigos em .txt
├── sounds/               # clack.mp3, type.mp3, error_menu.mp3
└── multi/                # multiplayer
    ├── multiMenu.html    # lobby (criar/entrar em sala)
    ├── pong_setup.html   # cliente do jogo online
    ├── server.js         # servidor de lobby (Express + Socket.IO)
    ├── pong_server.js    # lobby + lógica do jogo no servidor
    ├── package.json
    └── package-lock.json
```

## Requisitos

- Node.js 18 ou superior (recomendado) e npm
- Navegador moderno
- Conta Spotify Premium, apenas se quiser usar o player do hub

Veja também o [`requirements.txt`](requirements.txt), com o resumo de dependências.

## Como executar

### 1. Front-end (jogos e artigos)

O front-end é estático. Sirva a pasta raiz por HTTP (abrir os arquivos direto pelo navegador pode quebrar o carregamento dos artigos):

```bash
npx serve .
```

ou use a extensão **Live Server** do VS Code e abra `index.html`.

### 2. Servidor multiplayer

```bash
cd multi
npm install
cd ..
node multi/server.js          # lobby de salas
# ou
node multi/pong_server.js     # lobby + lógica completa do jogo (porta fixa 3000)
```

O servidor sobe na porta `3000` (`server.js` aceita a variável de ambiente `PORT`). Execute o comando **a partir da raiz do projeto**, porque os dois servidores servem arquivos estáticos de `./multi`.

## Controles

| Ação | Tecla |
|---|---|
| Iniciar (tela de título) | `Espaço` |
| Jogador 1 (esquerda) | `W` / `S` |
| Jogador 2 (direita) | `↑` / `↓` |
| Menu de saída | `Esc` |

No modo online, quem entra primeiro na sala é o Jogador 1 (`W`/`S`) e o segundo é o Jogador 2 (`↑`/`↓`).

## Como funciona o multiplayer

1. Cada jogador informa um nickname e clica em **Ficar Online** para conectar ao servidor.
2. Um jogador clica em **Criar** e recebe um código de 5 caracteres; o outro digita o código e clica em **Entrar**.
3. A sala comporta **2 jogadores**. Se o host sair, o próximo jogador assume o posto.
4. Só o host pode clicar em **Jogar**, e apenas com 2 jogadores na sala.
5. No `pong_server.js`, o servidor calcula bola e raquetes a 60 ticks por segundo e envia o estado aos clientes; os clientes mandam apenas a direção do movimento.

Eventos Socket.IO: `createRoom`, `joinRoom`, `leaveRoom`, `startGame`, `move` (cliente → servidor); `roomCreated`, `playersUpdate`, `gameStarted`, `playerIndex`, `state`, `errorMsg` (servidor → cliente).

## Configuração

Algumas URLs estão fixas no código e precisam ser ajustadas conforme o ambiente:

| Arquivo | O que está fixo | Quando mudar |
|---|---|---|
| `multi/multiMenu.html` | Servidor em `https://node-project-server-s945.onrender.com` | Para usar seu próprio servidor ou rodar localmente |
| `states/games_multiplayer.js` | Mesmo servidor do Render | Idem |
| `multi/pong_setup.html` | `http://localhost:3000` | Ao hospedar o servidor fora da sua máquina |
| `index.html` | `redirectUri` em `http://127.0.0.1:5500/Pong/index.html` e `clientId` do Spotify | Para outro host/porta, o redirect URI também precisa estar cadastrado no painel do Spotify |

## Limitações conhecidas

- O `multi/server.js` cuida apenas do lobby; os eventos `move` e `state` do jogo existem somente no `multi/pong_server.js`.
- `npm start` roda `node server.js` de dentro de `multi/`, onde o caminho estático `./multi` não existe. Para servir os arquivos estáticos, rode pela raiz como mostrado acima. O campo `main` do `package.json` também aponta para um caminho antigo (`Pong/multi/server.js`).
- Os arquivos `core/input.js` e `multi/games_multiplayer.html` estão incompletos ou sem uso.
- Em `articles.html`, o primeiro card passa `articles/pong.txt` para uma função que já adiciona o prefixo `articles/`, então esse artigo pode não abrir.
- Só o Pong está implementado; as demais fitas do carrossel são placeholders.

## Licença

ISC, conforme declarado em `multi/package.json`. O repositório ainda não possui arquivo `LICENSE`.
