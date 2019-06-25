const users = []

// Cần 4 hàm: addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // - Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // - Validate the data
    if (!username || !room) {
        return { error: 'Username and room are required!' }
    }

    // - Check for existing user (trùng tên mà khác room thì ok)
    const existingUser = users.find(user => user.room === room && user.username === username)

    // Validate username
    if (existingUser) {
        return { error: 'Username is in use!' }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id) // Stop liền khi thấy match.

    if (index !== -1) {
        return users.splice(index, 1)[0] // vì splice có thể xóa nhiều nên trả về 1 mảng, mình biết mình chỉ xóa 1 thôi, nên lấy index 0 luôn.
    }
}

addUser({ 
    id: 22,
    username: 'Henry',
    room: 'Toronto'
})

console.log(users)

const removedUser = removeUser(22)

console.log(removedUser)
console.log(users)