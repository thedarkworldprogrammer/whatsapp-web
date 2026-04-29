const express = require('express');
const cookieparser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./config/dbConnect');
const bodyParser = require('body-parser');

const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute')
const statusRoute = require('./routes/statusRoute')

const http = require('http')
const initializeSocket = require('./services/socketService')



dotenv.config();

const PORT = process.env.PORT;
const app = express()


const corsOption = {
    origin: process.env.FRONTEND_URL,
    credentials: true
}

app.use(cors(corsOption))

//middleware
app.use(express.json())  // parse body data
app.use(cookieparser())  // parse token on every req
app.use(bodyParser.urlencoded({ extended: true }))

// db connection
connectDb()

//create server
const server = http.createServer(app)

const io = initializeSocket(server)

// apply socket middleware before routes
app.use((req, res, next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
})


// routes
app.use('/api/auth', authRoute)
app.use('/api/chat', chatRoute)
app.use('/api/status', statusRoute)

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})

