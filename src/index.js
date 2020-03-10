const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { generateMessage, generateLocMessage } = require('./utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT;
const publicDir = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDir));


io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) return callback(error);

        socket.join(user.room);

        socket.emit('anoMessage', generateMessage('Welcome to Chat!'));
        socket.broadcast.to(user.room).emit('anoMessage', generateMessage(`${user.username} has joined`));

        //active users list
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback()
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessage(message, user.username));
        callback()
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username));
        callback()
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('anoMessage', generateMessage(`${user.username} has left`));

            //active users update
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
});

server.listen(PORT, () => {
    console.log('Server is running on 3001 port')
});