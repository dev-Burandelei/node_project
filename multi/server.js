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
        const code = Math.random().toString(36).substring(2,6).toUpperCase();

        rooms[code] = [{ id: socket.id, nick }];

        socket.join(code);
        socket.emit("roomCreated", code);

        io.to(code).emit("playersUpdate", rooms[code].map(p => p.nick));
    });

    socket.on("joinRoom", ({ code, nick }) => {
        if(!rooms[code]){
            socket.emit("errorMsg", "Sala não existe");
            return;
        }

        rooms[code].push({ id: socket.id, nick });
        socket.join(code);

        io.to(code).emit("playersUpdate", rooms[code].map(p => p.nick));
    });

    socket.on("leaveRoom", (code) => {
        if(!rooms[code]) return;

        rooms[code] = rooms[code].filter(p => p.id !== socket.id);

        if(rooms[code].length === 0){
            delete rooms[code];
        } else {
            io.to(code).emit("playersUpdate", rooms[code].map(p => p.nick));
        }
    });

    socket.on("disconnect", () => {
        for(const code in rooms){
            rooms[code] = rooms[code].filter(p => p.id !== socket.id);

            if(rooms[code].length === 0){
                delete rooms[code];
            } else {
                io.to(code).emit("playersUpdate", rooms[code].map(p => p.nick));
            }
        }
    });

});
app.get("/", (req, res) => {
    res.send("Servidor online 🚀");
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server rodando"));