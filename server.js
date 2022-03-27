const express = require('express');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io');
const ACTION = require('./src/Action');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req , res , next) => {
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
});

let userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username : userSocketMap[socketId],
        };
    })

}


io.on('connection' , (socket) => {
    //console.log(socket.id);

    socket.on(ACTION.JOIN , ({ roomId , username}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        // get all connected client to notify about current user
        const clients = getAllConnectedClients(roomId);

        clients.forEach(({socketId}) => {
                io.to(socketId).emit(ACTION.JOINED , {
                    clients,
                    username,
                    socketId : socket.id,
                })    
        })
    })

    socket.on(ACTION.CODE_CHANGE , ({roomId , code})=>{
        socket.in(roomId).emit(ACTION.CODE_CHANGE , {
            code
        })
    })

    socket.on(ACTION.SYNC_CODE , ({socketId , code})=>{
        //console.log('sync code',code);
        io.to(socketId).emit(ACTION.CODE_CHANGE , {code});
    })

    socket.on('disconnecting' , ()=>{
        const rooms = [...socket.rooms];
        //console.log('rooms = ',rooms);
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTION.DISCONNECTED , {
                socketId : socket.id,
                username : userSocketMap[socket.id] 
            })
        })

        delete userSocketMap[socket.id];
        socket.leave();
    })
})



const PORT = process.env.PORT || 5000;
server.listen(PORT , ()=>{
    console.log('Server Listen :',PORT);
})


//2.18