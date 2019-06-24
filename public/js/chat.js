const socket = io() // Initialize the connection

// * Elements ($ ở trước là convention để biết biến đó trỏ tới 1 ele nào đó trong DOM)
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')

socket.on('message', (message) => {
    console.log(message)
})

$messageForm.addEventListener('submit', e => {
    e.preventDefault()

    // * Disable the form
    $messageFormButton.setAttribute('disabled', 'disabled') // Click hay enter đều ko đc nữa, để chắc chắn là message cũ đã gửi mới gửi tiếp đc!

    const msg = e.target.elements.msg.value // e.target (là cái form), e.target.elements những eles trong form đó,  e.target.elements.msg cái thằng có name là 'msg'
    socket.emit('sendMessage', msg, (error) => {
        // * Re-enable
        $messageFormButton.removeAttribute('disabled') // Tới đây là nhận ACK r, chắc chắn message cũ đã đc server nhận dù thành công hay thất bại
        $messageFormInput.value = '' // Xóa message cũ
        $messageFormInput.focus() // đưa con trỏ vô lại input

        if (error) 
            return console.log(error)

        console.log('Message delivered!')
    }) // Cái hàm để khai báo cuối cùng sẽ được chạy khi bên listener gửi ACK về (cùng data nếu có)
})

$sendLocationButton.addEventListener('click', e => {
    if ( ! navigator.geolocation) { // nếu tồn tại cái này thì browser mới support
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled') // Để xử lý cái click này đã

    // Quá trình lấy tọa độ là async, nên nó dùng callback (chưa hỗ trợ promise, xem thêm doc)
    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords

        socket.emit('sendLocation', { latitude, longitude }, () => {
            $sendLocationButton.removeAttribute('disabled') // Đã xử lý xong cái click cũ (vì đang trong callback ACK)
            console.log('Location shared!')
        })
    })
})