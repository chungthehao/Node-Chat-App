const socket = io() // Initialize the connection

// * Elements ($ ở trước là convention để biết biến đó trỏ tới 1 ele nào đó trong DOM)
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages') // Nơi sẽ chứa các message chat

// * Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// * Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage) // hàm này browser c cấp sẵn
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin // total height (có cả margin bottom)

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container (bao gồm cả mấy cái dài quá của cả thanh cuộn)
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight // scrollTop: Trả về khoảng cách đã scroll của scrollbar (hiện tại), nếu chưa scroll (ở trên cùng) thì = 0

    if (containerHeight - newMessageHeight <= scrollOffset) { // Nếu đang ở bottom trc khi có mesage mới
        $messages.scrollTop = $messages.scrollHeight // Thì cuộn xuống dưới cùng
    }
}

socket.on('message', ({ username, text, createdAt }) => { // message là data gửi từ server khi server gọi callback để ACK
    console.log(username, text, createdAt)
    // 'html' là cái sẽ render ra cho ngta xem, Mustache library sẽ compile template ra html thường
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    })
    // insertAdjacentHTML có 4 modes rất hay, xem doc
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', ({ username, url, createdAt }) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('h:mm a')
    })//Render template nào với data gì?
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})