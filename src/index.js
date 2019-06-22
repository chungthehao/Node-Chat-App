const path = require('path')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

// app.get('/', async (req, res) => {
//     res.send('index.html')
// })

app.listen(port, () => {
    console.log(`Server is up on port ${port}.`)
})