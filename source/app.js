const socketio = require('socket.io')
const express = require('express');
const app = express()
const port = process.env.PORT || 8080;
const path = require('path')
const http = require('http')
const server = http.createServer(app)
const Filter = require('bad-words')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');

const io = socketio(server);

const {
    generatemsg,
    generateLocationmsg
} = require('./utils/messages');


const publicpath = path.join(__dirname, './public')
const viewpath = path.join(__dirname, './templates/views')
const partialspath = path.join(__dirname, './templates/partials')


app.use(express.static(publicpath));




io.on('connection', (socket) => {
    // console.log("New connection")
    socket.on('join', (credientials, callback) => {
        const {
            error,
            user
        } =
        addUser({
            id: socket.id,
            ...credientials
        })
        if (error) {
            return callback(error)

        }
        // console.log(user)
        socket.join(user.room)
        socket.emit('message', generatemsg('Admin', 'Welcome'));

        socket.broadcast.to(user.room).emit('message', generatemsg('Admin', `${user.username } has joined`))
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })



    socket.on('sendmessage', (message, callback) => {
            const user = getUser(socket.id);



            const filter = new Filter()
            filter.addWords('bc', 'mc', 'bkl');
            if (filter.isProfane(message)) {
                return callback("Profanity is not allowed")
            }

            io.to(user.room).emit('message', generatemsg(user.username, message));
            callback('Delivered');

        }

    )




    socket.on('location', (coords, callback) => {
        const user = getUser(socket.id);
        // console.log(user.room)

        let string = 'https://google.com/maps?q=' + coords.latitude + ',' + coords.longitude
        io.to(user.room).emit('locationmsg', generateLocationmsg(user.username, string))
        callback('Location shared')

    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("message", generatemsg('Admin', `${user.username} has left`))

            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })


})




server.listen(port, () => {
    console.log('App is listen on ', port);
})















// socket.emit('countupdated', count);
// socket.on('increment', () => {
//     count++
//     //socket.emit('countupdated', count)
//     io.emit('countupdated', count)
// })