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
io.on('connection', () => {
    console.log('New Websocket connection')
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}.`)
})