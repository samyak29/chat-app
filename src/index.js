const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const bodyParser = require('body-parser');
const moment = require('moment')

const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(bodyParser.urlencoded({ extended: true }));

const generateMessage = (username, text)=>{
    return {
        username,
        text,
        createdAt: moment(Date.now()).format('h:mm a')
    }
}

io.on('connection',(socket)=>{
    console.log(`New websocket connection`);
    socket.on('sendMessage',(text,callback)=>{
        const filter = new Filter()
        if(filter.isProfane(text)){
            return callback('Profanity not allowed')
        }
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,text))
        }
        callback()
    })
    socket.on('sendLocation', ({latitude,longitude},callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback('Location shared!')
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
    socket.on('join',({username,room},callback)=>{
        const {user,error} = addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        callback()
    })
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})