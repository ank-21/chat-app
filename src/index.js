const path = require('path') 
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocationMessage } = require('./utilis/messages')
const {getUser, addUser , removeUser , getUsersInRoom} = require('./utilis/users')
// const color = require('./utilis/random-color')
// const chalk = require('chalk')


const app = express()
const server = http.createServer(app)         //allow us to create a new web-server



//we can create a new instance of socket.io to configure web sockets to work with our server right here.
const io = socketio(server)   //when we require the library we get a function back and we call that function to actually configure socketio to work with a given server and we pass to that server.

const port = process.env.PORT||3000

const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath)) 




io.on('connection', (socket) => {
    console.log('New web socket connection')
   
    socket.on('join', ({username,room}, callback)=>{
        const {error,user} = addUser({
            id:socket.id,
            username,          //we get back an object with either error or user property
            room
        })
        if(error){
            return callback(error)   //to return the function if none of the function runs
        }

        socket.join(user.room)  //we can only use on the server that is socket.join and user.room as in adduser fun we will trim and modify
        //allows us to join a given chat room and we pass to the name of the room we're trying to join.
        socket.emit('message', generateMessage('Admin',(`Welcome ${user.username}`)))    //to emit to that particular connection
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))      //to emit it to all except tht particular connection
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(msg , callback) => {
        
        const user = getUser(socket.id)

        //for bad words
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed!')
        }
        //now we dont have access to the room
        io.to(user.room).emit('message',generateMessage(user.username,msg))         //to emit it to all
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the chat!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: user.getUsersInRoom
            })
        }
        
    })
    socket.on('sendLocation',(coords, callback ) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,'https://google.com/maps?q='+coords.latitude+','+coords.longitude))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up on port : '+ port)
})