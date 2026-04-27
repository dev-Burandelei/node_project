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

    socket.on("createRoom", (nick) => {
        const code = generateRoomCode(); 

        rooms[code] = {players: [{ id: socket.id, nick }], host: socket.id};

        socket.join(code);
        socket.emit("roomCreated", code);

        io.to(code).emit("playersUpdate", {players: rooms[code].players.map(p => p.nick), host: rooms[code].host});
    });

    socket.on("joinRoom", ({ code, nick }) => {

        if(!rooms[code]){
            socket.emit("errorMsg", "Sala não existe");
            return;
        }

        if(rooms[code].players.length >= 2){
            socket.emit("errorMsg", "Sala cheia");
            return;
        }

        rooms[code].players.push({ id: socket.id, nick });
        socket.join(code);

        io.to(code).emit("playersUpdate", {
            players: rooms[code].players.map(p => p.nick),
            host: rooms[code].host
        });
    });

   socket.on("leaveRoom", (code) => {
        if(!rooms[code]) return;

        const room = rooms[code];

        room.players = room.players.filter(p => p.id !== socket.id);

        // se saiu o host → novo host
        if(room.host === socket.id && room.players.length > 0){
            room.host = room.players[0].id;
        }

        if(room.players.length === 0){
            delete rooms[code];
        } else {
            io.to(code).emit("playersUpdate", {
                players: room.players.map(p => p.nick),
                host: room.host
            });
        }
    });

    socket.on("disconnect", () => {

        for(const code in rooms){

            const room = rooms[code];

            room.players = room.players.filter(p => p.id !== socket.id);

            // se saiu o host → troca host
            if(room.host === socket.id && room.players.length > 0){
                room.host = room.players[0].id;
            }

            if(room.players.length === 0){
                delete rooms[code];
            } else {
                io.to(code).emit("playersUpdate", {
                    players: room.players.map(p => p.nick),
                    host: room.host
                });
            }
        }

    });

    socket.on("startGame", (code) => {

        const room = rooms[code];
        if(!room) return;

        // 🔒 só host pode iniciar
        if(socket.id !== room.host){
            socket.emit("errorMsg", "Apenas o host pode iniciar");
            return;
        }

        // 👥 precisa de 2 jogadores
        if(room.players.length < 2){
            socket.emit("errorMsg", "Aguardando mais jogadores");
            return;
        }

        io.to(code).emit("gameStarted");
    });

});

function generateRoomCode() {
    let code;
    
    do {
        code = Math.random().toString(36).substring(2,7).toUpperCase();
    } while (rooms[code]); 

    return code;
}

app.get("/", (req, res) => {
    res.send("Servidor online 🚀");
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server rodando"));