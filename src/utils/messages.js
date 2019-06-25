const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime() // trả về timestamp
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}