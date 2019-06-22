const socket = io() // Initialize the connection

// * Receive event từ server
socket.on('countUpdated', (count) => {
    console.log('The count has been updated!', count)
})

// * Send event tới server
document.querySelector('#increment').addEventListener('click', e => {
    console.log('Clicked!')
    socket.emit('increment')
})