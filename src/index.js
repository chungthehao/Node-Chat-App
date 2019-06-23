const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app) // Nếu ko có thì express cũng tự chạy behind the scenes, refactor như vậy để dễ xài socket.io
const io = socketio(server) // Configure socket.io to work with a given server, now our server supports websocket

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// * Chạy MỖI khi có 1 kết nối mới (listening for a 'connection' event to occur)
io.on('connection', (socket) => { // 'socket' is an object, chứa info về cái new connection
    console.log('New Websocket connection')

    socket.emit('message', 'Welcome!') // send 'message' event to that 'PARTICULAR' connection

    socket.on('sendMessage', (msg) => {
        io.emit('message', msg)
    })

    // * Khi dùng socket.io để transfering data -> mình đang sending & receiving cái gọi là event
    // --> Ở đây là send event từ server và receive event từ client
    // socket.emit('countUpdated', count) // Từ tham số thứ 2 trở đi, sẽ là đầu vào của callback func (event handler) bên client, thứ tự của các tham số là quan trọng!

    // socket.on('increment', () => {
    //     count++

    //     // * Thông báo tới 1 specific client đó
    //     //socket.emit('countUpdated', count) 
    //     // * Emit event cho tất cả các connection hiện tại
    //     io.emit('countUpdated', count)
    // })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}.`)
})