const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

let rooms = {};

io.on("connection", (socket) => {

    console.log("Conectado:", socket.id);

    // =====================
    // CRIAR SALA
    // =====================
    socket.on("createRoom", (nick) => {

        const code = generateRoomCode();

        rooms[code] = {
            players: [{ id: socket.id, nick }],
            host: socket.id,
            game: null
        };

        socket.join(code);
        socket.emit("roomCreated", code);

        updatePlayers(code);
    });

    // =====================
    // ENTRAR SALA
    // =====================
    socket.on("joinRoom", ({ code, nick }) => {

        const room = rooms[code];
        if (!room) return socket.emit("errorMsg", "Sala não existe");

        if (room.players.length >= 2)
            return socket.emit("errorMsg", "Sala cheia");

        room.players.push({ id: socket.id, nick });

        socket.join(code);
        updatePlayers(code);
    });

    // =====================
    // SAIR
    // =====================
    socket.on("leaveRoom", (code) => leaveRoom(socket, code));
    socket.on("disconnect", () => {
        for (const code in rooms) leaveRoom(socket, code);
    });

    // =====================
    // INICIAR JOGO
    // =====================
    socket.on("startGame", (code) => {

        const room = rooms[code];
        if (!room) return;

        if (socket.id !== room.host)
            return socket.emit("errorMsg", "Só o host pode iniciar");

        if (room.players.length < 2)
            return socket.emit("errorMsg", "Precisa de 2 jogadores");

        startGame(code);
    });

    // =====================
    // INPUT DO JOGADOR
    // =====================
    socket.on("move", ({ code, direction }) => {

        const room = rooms[code];
        if (!room || !room.game) return;

        const index = room.players.findIndex(p => p.id === socket.id);
        if (index === -1) return;

        const speed = 600;
        room.game.inputs[index] = direction * speed;
    });

});

// =====================
// GAME LOGIC
// =====================
function startGame(code) {

    const room = rooms[code];

    room.game = {
        paddles: [200, 200],
        inputs: [0, 0],
        ball: { x: 300, y: 200, vx: 300, vy: 200 },
        lastTime: Date.now()
    };

    io.to(code).emit("gameStarted");
    room.players.forEach((p, index) => {io.to(p.id).emit("playerIndex", index);});
    room.game.loop = setInterval(() => updateGame(code), 1000 / 60);
}

function updateGame(code) {

    const room = rooms[code];
    if (!room || !room.game) return;

    const g = room.game;

    const now = Date.now();
    const dt = (now - g.lastTime) / 1000;
    g.lastTime = now;

    // paddles
    for (let i = 0; i < 2; i++) {
        g.paddles[i] += g.inputs[i] * dt;
        g.paddles[i] = Math.max(0, Math.min(200, g.paddles[i]));
    }

    // bola
    g.ball.x += g.ball.vx * dt;
    g.ball.y += g.ball.vy * dt;

    if (g.ball.y <= 0 || g.ball.y >= 400) g.ball.vy *= -1;

    if (g.ball.x <= 30 &&
        g.ball.y >= g.paddles[0] &&
        g.ball.y <= g.paddles[0] + 200) {
        g.ball.vx = Math.abs(g.ball.vx);
    }

    if (g.ball.x >= 570 &&
        g.ball.y >= g.paddles[1] &&
        g.ball.y <= g.paddles[1] + 200) {
        g.ball.vx = -Math.abs(g.ball.vx);
    }

    if (g.ball.x < 0 || g.ball.x > 600) {
        g.ball.x = 300;
        g.ball.y = 200;
        g.ball.vx *= -1;
    }

    io.to(code).emit("state", {
        ball: g.ball,
        paddles: g.paddles
    });
}

// =====================
// HELPERS
// =====================
function leaveRoom(socket, code) {

    const room = rooms[code];
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.host === socket.id && room.players.length > 0) {
        room.host = room.players[0].id;
    }

    if (room.players.length === 0) {

        if (room.game?.loop) clearInterval(room.game.loop);

        delete rooms[code];
        return;
    }

    updatePlayers(code);
}

function updatePlayers(code) {

    const room = rooms[code];

    io.to(code).emit("playersUpdate", {
        players: room.players.map(p => p.nick),
        host: room.host
    });
}

function generateRoomCode() {
    let code;
    do {
        code = Math.random().toString(36).substring(2, 7).toUpperCase();
    } while (rooms[code]);
    return code;
}

// =====================
app.get("/", (req, res) => res.send("Servidor online 🚀"));

server.listen(3000, () => {
    console.log("Rodando na porta 3000");
});