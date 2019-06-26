const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) // Nếu ko có thì express cũng tự chạy behind the scenes, refactor như vậy để dễ xài socket.io
const io = socketio(server) // Configure socket.io to work with a given server, now our server supports websocket

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// * Chạy MỖI khi có 1 kết nối mới (listening for a 'connection' event to occur)
io.on('connection', (socket) => { // 'socket' is an object, chứa info về cái new connection
    console.log('New Websocket connection')

    //socket.emit('message', generateMessage('Welcome!')) // send 'message' event to that 'PARTICULAR' connection
    //socket.broadcast.emit('message', generateMessage('A new user has joined!')) // send it to everybody except this particular socket

    socket.on('join', ({ username, room }, callback) => {
        // * Để keep track các user (để các event listener khác access để thông tin user, room)
        // Chú ý: destructure kq trả về từ addUser, nhưng error và user ko đồng thời tồn tại
        const { error, user } = addUser({ 
            id: socket.id, // the unique identifier for this particular connection
            username,
            room
        })

        if (error) return callback(error) // Gửi ACK về để báo lỗi cho phía client

        socket.join(user.room) // Ko xài trực tiếp param 'room' luôn?? Vì trong hàm addUser có trim, lowercase,...

        // - Mình tới giờ có 3: socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit (tới all trong room đó), socket.broadcast.to.emit (tới all trừ th này trong 1 room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))

        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        // * Check for profanity in this message (check mấy từ tục tĩu)
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }

        io.to('toronto').emit('message', generateMessage(msg))
        callback() // Gọi callback để acknowledge the event
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        callback() // Letting the client know that the event has indeed been acknowledge
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

    socket.on('disconnect', () => { // built in event 'disconnect' ko cần mình emit!
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}.`)
})