const socket = io() // Initialize the connection

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', e => {
    e.preventDefault()
    const msg = e.target.elements.msg.value // e.target (là cái form), e.target.elements những eles trong form đó,  e.target.elements.msg cái thằng có name là 'msg'
    socket.emit('sendMessage', msg)
})

document.querySelector('#send-location').addEventListener('click', e => {
    if ( ! navigator.geolocation) { // nếu tồn tại cái này thì browser mới support
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', { latitude, longitude })
    })
})